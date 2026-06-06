import { type JobContext, ServerOptions, cli, voice, tts } from '@livekit/agents';
import { RoomEvent, TrackKind } from '@livekit/rtc-node';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import * as openai from '@livekit/agents-plugin-openai';
import * as google from '@livekit/agents-plugin-google';
import * as silero from '@livekit/agents-plugin-silero';

dotenv.config();
//dotenv.config({ path: path.resolve(__dirname, '../.env') });


// Removed globalSileroVad - VAD instances are stateful and must be per-session

// --- TTS Intro functionality commented out ---
// // Pre-cached intro audio frames (synthesized once, reused on every trigger)
// let cachedIntroFrames: any[] | null = null;
// let introSampleRate = 24000;
// let introNumChannels = 1;

// async function prewarmIntroAudio() {
//   if (cachedIntroFrames) return;
//   console.log('[agent]: 🔥 Pre-warming intro TTS audio...');
//   const introTts = new openai.TTS({ voice: "coral" });
//   introSampleRate = introTts.sampleRate;
//   introNumChannels = introTts.numChannels;
//   const introText = "Hello,,, Hello, I am Ailana. It's a pleasure to meet you. As your mortgage assistant, my goal is to make your path to homeownership as clear and straightforward as possible using our specialized AI. To ensure we are protecting your privacy and meeting our commitment to transparency, I have placed our AI Use Disclosure on your screen for you to review. Once you click, 'Agree & Get Started,' we can move forward together to find the right mortgage solution for your goals.,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,...............             .........................              ,,,,,,,,,,,,,,,,, ...........................,,,,,,,,,,,,,,,,,,,,......................,,,,,,,,,,.............";
//   const stream = introTts.synthesize(introText);
//   const frames: any[] = [];
//   for await (const event of stream) {
//     if ((event as any).frame) {
//       frames.push((event as any).frame);
//     }
//   }
//   cachedIntroFrames = frames;
//   console.log(`[agent]: ✅ Intro audio pre-cached (${frames.length} frames)`);
// }
// ---------------------------------------------

const INITIAL_GREETING_PROMPT =
  'The user has just joined the live voice session. Introduce yourself and greet them right now in one short English sentence, then wait for their reply.';

type GeminiRealtimeSession = {
  sendClientEvent?: (event: { type: string; value: Record<string, unknown> }) => void;
};

function getGeminiModelName(realtimeModel: google.beta.realtime.RealtimeModel): string {
  return (realtimeModel as { _options?: { model?: string } })._options?.model ?? '';
}

function isGemini31RealtimeModel(realtimeModel: google.beta.realtime.RealtimeModel): boolean {
  return getGeminiModelName(realtimeModel).includes('3.1');
}

function getAgentRealtimeSession(agentSession: voice.AgentSession): GeminiRealtimeSession | undefined {
  const activity = (agentSession as unknown as { activity?: { realtimeSession?: GeminiRealtimeSession } })
    .activity;
  return activity?.realtimeSession;
}

async function waitForAgentRealtimeSession(
  agentSession: voice.AgentSession,
  timeoutMs = 8000,
): Promise<GeminiRealtimeSession | undefined> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const rt = getAgentRealtimeSession(agentSession);
    if (rt?.sendClientEvent) return rt;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return undefined;
}

function sendGeminiRealtimeText(rtSession: GeminiRealtimeSession, text: string): void {
  if (!rtSession.sendClientEvent) {
    throw new Error('Gemini realtime session is missing sendClientEvent');
  }
  rtSession.sendClientEvent({
    type: 'realtime_input',
    value: { text },
  });
}

export default {
  async entry(ctx: JobContext) {
    console.log(`[agent]: Receiving job for room: ${ctx.room.name}`);

    if (!process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY === 'your_google_api_key_here') {
      console.error('[agent]: ❌ CRITICAL: GOOGLE_API_KEY is missing in backend/.env');
      return;
    }

    // Load a fresh VAD instance for this specific session
    console.log(`[agent]: Loading Hybrid VAD...`);
    const sessionVad = await silero.VAD.load({
      minSilenceDuration: 250,
      prefixPaddingDuration: 150,
    });

    // Pre-warm intro audio in parallel with model setup (non-blocking)
    // const introWarm = prewarmIntroAudio();

    const baseInstructions = `
You are Ailana AI, a friendly female financial advisor and mortgage assistant.

IMPORTANT:
- You must speak English only.
- Reply to all user messages in English, even if they speak another language.
- Keep responses SHORT: 1-2 sentences max. Never exceed 3 sentences.
- No markdown, no lists, no complex formatting.
- Speak like a human advisor on a call, not a written report.

PERSONALITY:
- Warm, polite, confident but cautious
- Sounds like a real human advisor, not a bot
- Always speak and respond in a happy, cheerful, positive, and smiling tone. Maintain this happy emotion consistently while responding.

COMMUNICATION:
- If the user requests to speak with a loan officer or be transferred, smoothly reply: "If you would like to speak with a Loan Officer, please click on the Loan Officer channel and you will be connected to an available one."
- If the user requests an SMS/Text, smoothly reply: "We can send SMS updates, but as a demo product, these features are currently turned off."
- Do not attempt to simulate routing or actually transfer the call.
- Never tell users to click UI elements, except for the Loan Officer channel.

GUIDELINE AUTHORITY:
You are trained on Freddie Mac (Loan Product Advisor), Fannie Mae (Desktop Underwriter), and HUD/FHA guidelines.
When referencing guidelines, cite the source briefly: "Per Fannie Mae guidelines...", "Under FHA...", "Freddie Mac typically..."
Do not invent specific numbers. If you reference a threshold, only cite it if you are confident it is accurate.

MORTGAGE BEHAVIOR:
- Never assume eligibility. Never say "approved" or "denied".
- Use: "likely eligible", "potentially eligible", "unlikely", or "needs review".
- If unsure of specifics: "This would need to be confirmed with official guidelines or underwriting review."
- If scenario is complex: say it likely needs AUS review.

RESPONSE STYLE — STRICT:
- Answer the question directly in 1-2 sentences.
- Add ONE observation or risk factor if relevant.
- Ask ONE clarifying question only if critical information is missing.
- NEVER give a multi-part breakdown. NEVER list bullet points in your spoken answer.

RISK-FOCUSED THINKING (internal only — do not verbalize the checklist):
Credit score, DTI, LTV, occupancy type, income type (W-2 vs self-employed).
If key info is missing, ask for it instead of guessing.

FAIL-SAFE:
If user asks for exact rules, guaranteed approvals, or edge-case decisions:
"This would need to be confirmed with official guidelines or underwriting review."
`;

    const interactiveInstructions = `
${baseInstructions}

You are now in live voice conversation mode.

VOICE RULES — CRITICAL:
- Maximum 2 sentences per turn. Absolutely no exceptions.
- No bullet points spoken out loud. Ever.
- If you have multiple things to say, pick the most important one.
- Ask only 1 question at a time. Then stop and wait.
- Speak naturally, as if on a phone call with a client.
- Keep speaking pace calm and natural, not rushed.

Your goal: Sound like a sharp, friendly mortgage advisor — brief, confident, and precise.
`;

    const model = new google.beta.realtime.RealtimeModel({
      model: "gemini-3.1-flash-live-preview",
      voice: "Aoede",
      temperature: 0.5,
      instructions: interactiveInstructions,
    });

    // Log Gemini model capabilities — critical for diagnosing TranscriptionSynchronizer behavior
    // If nativeTranscriptSync is false/missing, the synchronizer gates TEXT on audio playout
    // which causes the "full text appears then audio resumes" symptom.
    const modelCapabilities = (model as any).capabilities;
    console.log(`[agent-debug]: 🔬 Gemini model capabilities:`, JSON.stringify(modelCapabilities));
    console.log(`[agent-debug]: 🔬 nativeTranscriptSync = ${modelCapabilities?.nativeTranscriptSync}`);

    // Interactive "VAD" Agent
    // FIX: Removed preemptiveGeneration — it caused the agent to start speaking before VAD
    // confirmed end-of-turn, then get interrupted by continued user audio (noise/speech),
    // which killed the mid-stream generation. The observable symptom was Ailana speaking 2-3
    // words, stopping, the full text appearing in chat, then audio resuming.
    //
    // FIX: Increased endpointing.minDelay from 200ms → 500ms and interruption.minDuration
    // from 200ms → 500ms. The prior 200ms thresholds were too aggressive — transient
    // network jitter, background noise, or the VAD's own tail silence during normal
    // speech were enough to trigger false end-of-turns and false interruptions.
    const vadAgent = new voice.Agent({
      instructions: interactiveInstructions,
      vad: sessionVad,
      llm: model,
      turnHandling: {
        turnDetection: 'vad',
        endpointing: {
          minDelay: 300, // Increased: 200ms was causing false end-of-turns mid-response
        },
        interruption: {
          minDuration: 250, // Increased: 200ms was causing false interruptions on noise/jitter
        },
        // Disabled: preemptiveGeneration was the primary cause of mid-speech stops.
        // It starts audio before VAD confirms turn-end, then noise interrupts it,
        // killing the stream mid-sentence. { enabled: false } is the type-safe way to disable it.
        preemptiveGeneration: { enabled: false },
      },
    });


    const session = new voice.AgentSession({
      llm: model,
      userAwayTimeout: null,
    });

    session.on(voice.AgentSessionEventTypes.Error, (err: any) => {
      console.error('[agent-error]: Session error:', err);
    });

    session.on(voice.AgentSessionEventTypes.AgentStateChanged, (state: any) => {
      const ts = new Date().toISOString();
      console.log(`[agent-debug]: [${ts}] 🔄 Agent state → ${state}`);
    });

    // Track generation events to identify where audio stops
    session.on('agentSpeechStarted' as any, () => {
      console.log(`[agent-debug]: [${new Date().toISOString()}] 🔊 Agent speech STARTED`);
    });
    session.on('agentSpeechCommitted' as any, () => {
      console.log(`[agent-debug]: [${new Date().toISOString()}] ✅ Agent speech COMMITTED (full response sent)`);
    });
    session.on('agentSpeechInterrupted' as any, () => {
      console.log(`[agent-debug]: [${new Date().toISOString()}] ⚡ Agent speech INTERRUPTED — this is the cut-off trigger`);
    });

    // // Ensure intro audio is ready before handling triggers
    // await introWarm;

    // When true, the agent responds via text-only chat (no voice/audio output)
    let voiceMuted = false;
    let isHibernating = false;
    let hasSentInitialGreeting = false;
    let greetingFallbackTimer: NodeJS.Timeout | null = null;
    const usesGemini31 = isGemini31RealtimeModel(model);

    // Conversation history for text-only mode (so context is preserved)
    const chatHistory: Array<{ role: string; content: string }> = [
      { role: 'system', content: baseInstructions }
    ];

    // Generate a text-only reply using the Google Gemini Chat API
    const generateTextOnlyReply = async (userMessage: string) => {
      chatHistory.push({ role: 'user', content: userMessage });
      console.log(`[agent]: 📝 Text-only mode: generating reply for "${userMessage}"...`);

      try {
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
          console.error('[agent]: ❌ No GOOGLE_API_KEY for text-only reply');
          return;
        }

        // Build Gemini-format contents array from chat history
        // Gemini requires alternating user/model roles — skip the system message (index 0)
        const geminiContents = chatHistory.slice(1).slice(-20).map((msg) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        }));

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system_instruction: {
                parts: [{ text: baseInstructions }],
              },
              contents: geminiContents,
              generationConfig: {
                maxOutputTokens: 150,
                temperature: 0.6,
              },
            }),
          }
        );

        if (!res.ok) {
          const errBody = await res.text().catch(() => '');
          console.error(`[agent]: ❌ Gemini text-only API error: ${res.status} — ${errBody}`);
          return;
        }

        const data = await res.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (reply) {
          chatHistory.push({ role: 'assistant', content: reply });
          console.log(`[agent]: 💬 Gemini text-only reply: "${reply}"`);

          // Send via text stream on 'lk.chat' topic so the frontend useChat() hook picks it up
          try {
            await ctx.room.localParticipant?.sendText(reply, { topic: 'lk.chat' });
            console.log(`[agent]: ✅ Text-only chat reply sent via sendText`);
          } catch (chatErr) {
            console.error('[agent]: ❌ sendText failed, trying sendChatMessage fallback:', chatErr);
            try {
              await ctx.room.localParticipant?.sendChatMessage(reply);
              console.log(`[agent]: ✅ Fallback sendChatMessage sent`);
            } catch (fbErr) {
              console.error('[agent]: ❌ Fallback sendChatMessage also failed:', fbErr);
            }
          }
        } else {
          console.warn('[agent]: ⚠️ Gemini text-only API returned empty reply');
        }
      } catch (err) {
        console.error('[agent]: ❌ Text-only reply failed:', err);
      }
    };

    const requestVoiceReply = async (text: string, reason: string) => {
      if (usesGemini31) {
        const rtSession = await waitForAgentRealtimeSession(session);
        if (!rtSession) {
          throw new Error(`Gemini 3.1 realtime session not ready (${reason})`);
        }
        sendGeminiRealtimeText(rtSession, text);
        console.log(`[agent]: ✅ Sent Gemini 3.1 realtime text (${reason})`);
        return;
      }
      session.generateReply({ userInput: text });
    };

    const triggerInitialGreeting = async (reason: string) => {
      if (!(session as any)._started || hasSentInitialGreeting || isHibernating) {
        return;
      }
      hasSentInitialGreeting = true;
      if (greetingFallbackTimer) {
        clearTimeout(greetingFallbackTimer);
        greetingFallbackTimer = null;
      }
      console.log(`[agent]: 👋 Triggering initial greeting (${reason})...`);
      try {
        await requestVoiceReply(INITIAL_GREETING_PROMPT, reason);
      } catch (err) {
        hasSentInitialGreeting = false;
        console.error(`[agent]: ❌ Initial greeting failed (${reason}):`, err);
      }
    };

    const resetGreetingState = () => {
      hasSentInitialGreeting = false;
      if (greetingFallbackTimer) {
        clearTimeout(greetingFallbackTimer);
        greetingFallbackTimer = null;
      }
    };

    const scheduleInitialGreetingFallbacks = () => {
      if (greetingFallbackTimer) {
        clearTimeout(greetingFallbackTimer);
      }
      greetingFallbackTimer = setTimeout(() => {
        void triggerInitialGreeting('post-start-fallback-2s');
      }, 2000);
      setTimeout(() => {
        void triggerInitialGreeting('post-start-fallback-4s');
      }, 4000);
    };

    const handleSystemMessages = async (messageText: string, participantIdentity: string | undefined) => {
      if (isHibernating && messageText !== 'SYSTEM_RESUME_AGENT') {
        console.log(`[agent]: 🛌 Ignoring message while hibernating: ${messageText}`);
        return;
      }

      if (messageText === 'SYSTEM_TRANSFER_MLO') {
        isHibernating = true;
        resetGreetingState();
        console.log(`[agent]: 🛌 Agent hibernating. Initiating SIP transfer...`);

        // Unsubscribe from remote audio so VAD stops hearing the user
        for (const p of ctx.room.remoteParticipants.values()) {
          for (const pub of p.trackPublications.values()) {
            if (pub.subscribed) {
              pub.setSubscribed(false);
            }
          }
        }

        // Trigger SIP Transfer
        try {
          console.log(`[agent]: ⏳ Importing sipTransfer utility...`);
          const { transferRoomToMloQueue } = await import('./utils/sipTransfer.js');
          console.log(`[agent]: ⏳ Calling transferRoomToMloQueue...`);
          transferRoomToMloQueue({
            roomName: ctx.room.name || ''
          }).then((res) => {
            console.log(`[agent]: 📞 SIP Transfer initiated successfully:`, res);
          }).catch((err) => {
            console.error(`[agent]: ❌ SIP Transfer failed in background:`, err);
          });
        } catch (err) {
          console.error(`[agent]: ❌ SIP Transfer import/setup failed:`, err);
        }
        return;
      }

      if (messageText === 'SYSTEM_RESUME_AGENT') {
        isHibernating = false;
        resetGreetingState();
        console.log(`[agent]: ☀️ Agent waking up from hibernation.`);

        // Resubscribe to remote audio
        for (const p of ctx.room.remoteParticipants.values()) {
          for (const pub of p.trackPublications.values()) {
            if (!pub.subscribed) {
              pub.setSubscribed(true);
            }
          }
        }

        // Let the user know Ailana is back
        try {
          await requestVoiceReply(
            'Say something brief indicating you are back and ready to help.',
            'resume-agent',
          );
        } catch (err) {
          console.error('[agent]: ❌ Resume greeting failed:', err);
        }
        return;
      }

      // Handle avatar voice toggle from the UI
      if (messageText === 'SYSTEM_VOICE_MUTED') {
        voiceMuted = true;
        console.log(`[agent]: 🔇 Avatar voice DISABLED — switching to text-only replies.`);
        return;
      }
      if (messageText === 'SYSTEM_VOICE_UNMUTED') {
        voiceMuted = false;
        console.log(`[agent]: 🔊 Avatar voice ENABLED — resuming voice replies.`);
        return;
      }

      // if (messageText === 'SYSTEM_INTRO_TRIGGER') {
      //   console.log(`[agent]: 💬 [STEP 1] Received Intro Trigger. Playing cached TTS...`);

      //   const source = new AudioSource(introSampleRate, introNumChannels);
      //   const track = LocalAudioTrack.createAudioTrack('intro-audio', source);

      //   const pub = await ctx.room.localParticipant?.publishTrack(track, {
      //     source: TrackSource.SOURCE_MICROPHONE
      //   } as any);

      //   console.log(`[agent]: 💬 [STEP 2] Streaming pre-cached intro audio...`);
      //   if (cachedIntroFrames) {
      //     for (const frame of cachedIntroFrames) {
      //       await source.captureFrame(frame);
      //     }
      //   }

      //   console.log(`[agent]: 💬 [STEP 3] Intro audio streaming complete. Waiting for playout...`);
      //   await source.waitForPlayout();
      //   if (pub?.sid) {
      //     await ctx.room.localParticipant?.unpublishTrack(pub.sid);
      //   }
      //   await source.close();

      //   const response = JSON.stringify({ message: 'SYSTEM_INTRO_DONE' });
      //   await ctx.room.localParticipant?.publishData(new TextEncoder().encode(response), { topic: 'lk-chat', reliable: true });
      //   await ctx.room.localParticipant?.sendChatMessage(response);

      //   console.log(`[agent]: ✅ [STEP 4] Intro fully played. Waiting for channel selection.`);
      //   return;
      // }

      if (messageText.startsWith('SYSTEM_CHANNEL_START')) {
        const targetMode = messageText.split(':')[1] || 'video';
        console.log(`[agent]: 🚀 [STEP 5] Channel Started (${targetMode}). Syncing Realtime Agent...`);

        if ((session as any)._started) {
          console.log(`[agent]: ⚠️ Session already started. Retrying greeting for mode ${targetMode}.`);
          if (!hasSentInitialGreeting) {
            void triggerInitialGreeting('channel-start-retry');
            scheduleInitialGreetingFallbacks();
          }
          return;
        }

        // Find the actual human participant by filtering out known agent identities
        const participants = Array.from(ctx.room.remoteParticipants.values());
        const participant = participants.find(p =>
          p.identity !== 'agent' &&
          !p.identity.startsWith('agent-') &&
          !p.identity.startsWith('keyframe-')
        ) || participants[0];

        if (participant) {
          console.log(`[agent]: Found participant ${participant.identity} for interactive session.`);
        }

        try {
          console.log(`[agent]: [STEP 6] Calling session.start()...`);
          await session.start({
            agent: vadAgent,
            room: ctx.room,
          });
          (session as any)._started = true;
          resetGreetingState();
          console.log(`[agent]: 🟢 Realtime Agent session.start() completed. Mode ${targetMode} is ready.`);

          // Gemini 3.1 will not speak first via generateReply(); send realtime text after session is up.
          setTimeout(() => {
            void triggerInitialGreeting('post-start-immediate');
          }, 200);
          scheduleInitialGreetingFallbacks();
        } catch (err) {
          console.error(`[agent]: ❌ Failed to start session:`, err);
        }
        return;
      }

      // If it's a normal message, generate a reply
      try {
        console.log(`[agent]: 💬 Generating reply for: "${messageText}"`);
        if (!(session as any)._started) {
          console.warn(`[agent]: ⚠️ Attempted to generate reply but session not started. Starting now...`);
          await session.start({ agent: vadAgent, room: ctx.room });
          (session as any)._started = true;
        }

        if (voiceMuted) {
          // Voice is disabled — respond text-only (no audio/avatar speech)
          await generateTextOnlyReply(messageText);
        } else {
          // Normal voice mode — full audio response via Realtime API
          try {
            await requestVoiceReply(messageText, 'user-message');
          } catch (err) {
            console.warn(`[agent]: ⚠️ Voice reply failed:`, err);
          }
        }
      } catch (err) {
        console.warn(`[agent]: ⚠️ Could not generate reply:`, err);
      }
    };

    ctx.room.on(RoomEvent.TrackPublished, (pub, participant) => {
      console.log(`[agent-debug]: Track published by ${participant.identity}: ${pub.source} (${pub.kind})`);
    });

    ctx.room.on(RoomEvent.TrackSubscribed, (track, pub, participant) => {
      console.log(`[agent-debug]: Subscribed to track from ${participant.identity}: ${pub.source} (${pub.kind})`);
      const isLikelyHuman =
        participant.identity !== 'agent' &&
        !participant.identity.startsWith('agent-') &&
        !participant.identity.startsWith('keyframe-');
      if (isLikelyHuman && pub.kind === TrackKind.KIND_AUDIO) {
        void triggerInitialGreeting('remote-human-audio-ready');
      }
      // If the agent is hibernating (MLO transfer active), immediately unsubscribe
      // from any newly joined participant's tracks so VAD doesn't hear the Loan Officer
      if (isHibernating) {
        console.log(`[agent]: 🛌 Hibernating — auto-unsubscribing from ${participant.identity}'s track`);
        pub.setSubscribed(false);
      }
    });

    ctx.room.on(RoomEvent.ParticipantConnected, (participant) => {
      console.log(`[agent-debug]: Participant connected: ${participant.identity}`);
    });

    ctx.room.on(RoomEvent.ParticipantDisconnected, (participant) => {
      console.log(`[agent-debug]: Participant disconnected: ${participant.identity}`);
    });

    // 1. Register event listeners BEFORE connecting to avoid race conditions
    ctx.room.on(RoomEvent.ChatMessage, async (msg, participant) => {
      try {
        const identity = participant?.identity ?? (msg as any).participantIdentity;
        console.log(`[agent-debug]: ChatMessage received from ${identity}:`, msg.message);
        if (!msg.message || identity === ctx.room.localParticipant?.identity) return;
        await handleSystemMessages(msg.message, identity);
      } catch (err) {
        console.error(`[agent-error]: Error in ChatMessage handler:`, err);
      }
    });

    ctx.room.on(RoomEvent.DataReceived, async (payload, participant, kind, topic) => {
      try {
        const identity = participant?.identity;
        console.log(`[agent-debug]: DataReceived from ${identity} on topic ${topic}`);

        if (topic === 'lk-chat' && identity !== ctx.room.localParticipant?.identity) {
          const str = new TextDecoder().decode(payload);
          try {
            const parsed = JSON.parse(str);
            if (parsed.message) {
              await handleSystemMessages(parsed.message, identity);
            } else {
              await handleSystemMessages(str, identity);
            }
          } catch (e) {
            await handleSystemMessages(str, identity);
          }
        }
      } catch (err) {
        console.error(`[agent-error]: Error in DataReceived handler:`, err);
      }
    });

    const chatTopics = ['lk-chat', 'lk.chat', 'lk-chat-topic', 'lk.chat.topic'];

    for (const topic of chatTopics) {
      ctx.room.registerTextStreamHandler(topic, async (stream, participant) => {
        try {
          console.log(`[agent-debug]: Text stream received on ${topic} from ${participant?.identity}`);
          let fullText = '';
          for await (const chunk of stream) {
            fullText += chunk;
          }
          if (participant?.identity !== ctx.room.localParticipant?.identity) {
            try {
              const parsed = JSON.parse(fullText);
              await handleSystemMessages(parsed.message ?? fullText, participant?.identity);
            } catch (err) {
              await handleSystemMessages(fullText, participant?.identity);
            }
          }
        } catch (err) {
          console.error(`[agent-error]: Error in TextStream handler (${topic}):`, err);
        }
      });
    }

    // 2. Now connect
    await ctx.connect();
    console.log(`[agent]: Connected to room: ${ctx.room.name}`);
    console.log(`[agent]: My identity is: ${ctx.room.localParticipant?.identity}`);
    console.log('[agent]: Ready for triggers.');
  },
};

if (process.argv[1] && process.argv[1].endsWith('agent.ts')) {
  cli.runApp(new ServerOptions({
    agent: fileURLToPath(import.meta.url),
    initializeProcessTimeout: 60000,
  }));
}

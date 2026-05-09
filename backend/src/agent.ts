import { type JobContext, ServerOptions, cli, voice, tts } from '@livekit/agents';
import { RoomEvent, AudioSource, LocalAudioTrack, TrackSource } from '@livekit/rtc-node';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import * as openai from '@livekit/agents-plugin-openai';
import * as silero from '@livekit/agents-plugin-silero';

dotenv.config();

// Global safety net for the known OpenAI 'audio_end_ms' null-type bug
process.on('uncaughtException', (err) => {
  if (err?.message?.includes('audio_end_ms') || (err as any)?.context?.error?.message?.includes('audio_end_ms')) {
    console.warn('[agent]: 🛡️ Suppressed known OpenAI audio_end_ms crash.');
    return;
  }
  console.error('[agent]: ❌ Uncaught Exception:', err);
  process.exit(1);
});

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


export default {
  async entry(ctx: JobContext) {
    console.log(`[agent]: Receiving job for room: ${ctx.room.name}`);

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      console.error('[agent]: ❌ CRITICAL: OPENAI_API_KEY is missing in backend/.env');
      return;
    }

    // Load a fresh VAD instance for this specific session
    console.log(`[agent]: Loading Hybrid VAD...`);
    const sessionVad = await silero.VAD.load({
      minSilenceDuration: 200,
      prefixPaddingDuration: 200,
    });

    // // Pre-warm intro audio in parallel with model setup (non-blocking)
    // const introWarm = prewarmIntroAudio();

    const model = new openai.realtime.RealtimeModel({
      model: "gpt-4o-mini-realtime-preview",
      voice: "coral",
      modalities: ["audio", "text"],
      turnDetection: null,
    });

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

COMMUNICATION:
- If the user prefers Phone or SMS, smoothly offer to transition and simulate routing.
- Never tell users to click UI elements.

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

    // Interactive "VAD" Agent 
    const vadAgent = new voice.Agent({
      instructions: interactiveInstructions,
      vad: sessionVad,
      llm: model,
      turnHandling: {
        turnDetection: 'vad',
        endpointing: {
          minDelay: 400,
        },
        interruption: {
          minDuration: 200,
        },
      },
    });


    const session = new voice.AgentSession({
      llm: model,
      userAwayTimeout: null,
    });

    session.on(voice.AgentSessionEventTypes.Error, (err: any) => {
      if (err?.message?.includes('audio_end_ms')) return;
      console.error('[agent-error]: Session error:', err);
    });

    session.on(voice.AgentSessionEventTypes.AgentStateChanged, (state: any) => {
      console.log(`[agent-debug]: Agent state changed to: ${state}`);
    });

    // // Ensure intro audio is ready before handling triggers
    // await introWarm;

    // When true, the agent responds via text-only chat (no voice/audio output)
    let voiceMuted = false;

    // Conversation history for text-only mode (so context is preserved)
    const chatHistory: Array<{ role: string; content: string }> = [
      { role: 'system', content: baseInstructions }
    ];

    // Generate a text-only reply using the standard OpenAI Chat Completions API
    const generateTextOnlyReply = async (userMessage: string) => {
      chatHistory.push({ role: 'user', content: userMessage });
      console.log(`[agent]: 📝 Text-only mode: generating reply for "${userMessage}"...`);

      try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
          console.error('[agent]: ❌ No OPENAI_API_KEY for text-only reply');
          return;
        }

        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: chatHistory.slice(-20),
            max_tokens: 200,
            temperature: 0.7,
          }),
        });

        if (!res.ok) {
          const errBody = await res.text().catch(() => '');
          console.error(`[agent]: ❌ Text-only API error: ${res.status} — ${errBody}`);
          return;
        }

        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content?.trim();

        if (reply) {
          chatHistory.push({ role: 'assistant', content: reply });
          console.log(`[agent]: 💬 Text-only reply: "${reply}"`);

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
          console.warn('[agent]: ⚠️ Text-only API returned empty reply');
        }
      } catch (err) {
        console.error('[agent]: ❌ Text-only reply failed:', err);
      }
    };

    const handleSystemMessages = async (messageText: string, participantIdentity: string | undefined) => {
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
          console.log(`[agent]: ⚠️ Session already started. Informing agent of mode switch to ${targetMode}.`);
          // Note: Session is already healthy and listening to all tracks by default in this version.
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
          console.log(`[agent]: 🟢 Realtime Agent session.start() completed. Mode ${targetMode} is ready.`);

          // Proactively initiate conversation so the user isn't met with silence
          session.generateReply({
            userInput: "Greet the user naturally in English. Keep it to 1 sentence and mention you are ready to assist with their mortgage questions. Then wait for the user's reply."
          });
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
          session.generateReply({ userInput: messageText });
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

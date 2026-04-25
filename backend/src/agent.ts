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

// Pre-cached intro audio frames (synthesized once, reused on every trigger)
let cachedIntroFrames: any[] | null = null;
let introSampleRate = 24000;
let introNumChannels = 1;

async function prewarmIntroAudio() {
  if (cachedIntroFrames) return;
  console.log('[agent]: 🔥 Pre-warming intro TTS audio...');
  const introTts = new openai.TTS({ voice: "alloy" });
  introSampleRate = introTts.sampleRate;
  introNumChannels = introTts.numChannels;
  const introText = "Hello,,,,, Hello I am Ailana. It is a pleasure to meet you. ... As your mortgage assistant, my goal is to make your path to homeownership as clear and straightforward as possible using our specialized AI. ... To ensure we are protecting your privacy and meeting our commitment to transparency, I have placed our AI Use Disclosure on your screen for you to review. ... Once you Agree and click 'Get Started', we can move forward together to find the right mortgage solution for your goals.";
  const stream = introTts.synthesize(introText);
  const frames: any[] = [];
  for await (const event of stream) {
    if ((event as any).frame) {
      frames.push((event as any).frame);
    }
  }
  cachedIntroFrames = frames;
  console.log(`[agent]: ✅ Intro audio pre-cached (${frames.length} frames)`);
}

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
      minSilenceDuration: 300,
      prefixPaddingDuration: 200,
    });

    // Pre-warm intro audio in parallel with model setup (non-blocking)
    const introWarm = prewarmIntroAudio();

    const model = new openai.realtime.RealtimeModel({
      model: "gpt-4o-mini-realtime-preview",
      voice: "coral",
      modalities: ["audio", "text"],
      turnDetection: null,
    });

    const baseInstructions = `You are Ailana AI, a friendly female financial advisor and mortgage assistant.
IMPORTANT: You must only speak and understand English. 
Keep your responses incredibly concise, conversational, and completely free of complex formatting.
Act naturally and politely. Do not sound robotic. Maintain a warm, smiling, and positive demeanor throughout the conversation.`;

    const interactiveInstructions = `${baseInstructions}
You are now in active conversation mode. Respond helpfully to user questions about mortgages.`;

    // Interactive "VAD" Agent 
    const vadAgent = new voice.Agent({
      instructions: interactiveInstructions,
      vad: sessionVad,
      llm: model,
      turnHandling: {
        turnDetection: 'vad',
        endpointing: {
          minDelay: 350,
        },
        interruption: {
          minDuration: 300,
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

    // Ensure intro audio is ready before handling triggers
    await introWarm;

    const handleSystemMessages = async (messageText: string, participantIdentity: string | undefined) => {
      if (messageText === 'SYSTEM_INTRO_TRIGGER') {
        console.log(`[agent]: 💬 [STEP 1] Received Intro Trigger. Playing cached TTS...`);

        const source = new AudioSource(introSampleRate, introNumChannels);
        const track = LocalAudioTrack.createAudioTrack('intro-audio', source);

        const pub = await ctx.room.localParticipant?.publishTrack(track, {
          source: TrackSource.SOURCE_MICROPHONE
        } as any);

        console.log(`[agent]: 💬 [STEP 2] Streaming pre-cached intro audio...`);
        if (cachedIntroFrames) {
          for (const frame of cachedIntroFrames) {
            await source.captureFrame(frame);
          }
        }

        console.log(`[agent]: 💬 [STEP 3] Intro audio streaming complete. Waiting for playout...`);
        await source.waitForPlayout();
        if (pub?.sid) {
          await ctx.room.localParticipant?.unpublishTrack(pub.sid);
        }
        await source.close();

        const response = JSON.stringify({ message: 'SYSTEM_INTRO_DONE' });
        await ctx.room.localParticipant?.publishData(new TextEncoder().encode(response), { topic: 'lk-chat', reliable: true });
        await ctx.room.localParticipant?.sendChatMessage(response);

        console.log(`[agent]: ✅ [STEP 4] Intro fully played. Waiting for channel selection.`);
        return;
      }

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
            userInput: "Please say a brief, friendly greeting to start the conversation and ask how you can help."
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
        session.generateReply({ userInput: messageText });
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

import { type JobContext, ServerOptions, cli, voice, tts } from '@livekit/agents';
import { RoomEvent, AudioSource, LocalAudioTrack } from '@livekit/rtc-node';
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

// Shared VAD model to minimize connection latency (only loaded once)
let globalSileroVad: silero.VAD | null = null;

export default {
  async entry(ctx: JobContext) {
    console.log(`[agent]: Receiving job for room: ${ctx.room.name}`);

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      console.error('[agent]: ❌ CRITICAL: OPENAI_API_KEY is missing in backend/.env');
      return;
    }

    // Pre-load VAD if not already ready
    if (!globalSileroVad) {
      console.log(`[agent]: Pre-warming Hybrid VAD (First connection)...`);
      globalSileroVad = await silero.VAD.load({
        minSilenceDuration: 300,
        prefixPaddingDuration: 200,
      });
    }

    const model = new openai.realtime.RealtimeModel({
      voice: "shimmer", 
      modalities: ["audio", "text"],
      turnDetection: null, 
    });

    const baseInstructions = `You are Ailana AI, a friendly female financial advisor and mortgage assistant.
IMPORTANT: You must only speak and understand English. 
Keep your responses incredibly concise, conversational, and completely free of complex formatting.
Act naturally and politely. Do not sound robotic.`;

    const interactiveInstructions = `${baseInstructions}
You are now in active conversation mode. Respond helpfully to user questions about mortgages.`;

    // Interactive "VAD" Agent 
    const vadAgent = new voice.Agent({
      instructions: interactiveInstructions,
      vad: globalSileroVad,
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
      console.error('[agent]: Session error:', err);
    });

    // TTS for precise intro
    const introTts = new openai.TTS({ voice: "shimmer" });
    const introText = "Hi! I am here to help you with mortgage related questions. Please select the Live with Ailana if you want to continue conversation with me or select any other channel of your choice.";

    const handleSystemMessages = async (messageText: string, participantIdentity: string | undefined) => {
      if (messageText === 'SYSTEM_INTRO_TRIGGER') {
         console.log(`[agent]: 💬 [STEP 1] Received Intro Trigger. Playing exact TTS...`);
         
         const chunkedStream = introTts.synthesize(introText);
         
         const sampleRate = introTts.sampleRate;
         const numChannels = introTts.numChannels;
         const source = new AudioSource(sampleRate, numChannels);
         const track = LocalAudioTrack.createAudioTrack('intro-audio', source);
         
         // CRITICAL: Set source to SOURCE_MICROPHONE so KeyframeAvatar can find it
         const { TrackSource } = await import('@livekit/rtc-node');
         const pub = await ctx.room.localParticipant?.publishTrack(track, { 
           source: TrackSource.SOURCE_MICROPHONE 
         } as any);

         console.log(`[agent]: 💬 [STEP 2] Streaming intro audio...`);
         for await (const event of chunkedStream) {
            if ((event as any).frame) {
              await source.captureFrame((event as any).frame);
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

      if (messageText === 'SYSTEM_CHANNEL_START') {
         console.log(`[agent]: 🚀 [STEP 5] Channel Started. Spinning up Realtime Agent...`);
         await session.start({
           agent: vadAgent,
           room: ctx.room,
         });
         console.log(`[agent]: 🟢 Realtime Agent connected and ready.`);
         return;
      }

      // If it's a normal message, generate a reply
      session.generateReply({ userInput: messageText });
    };

    // 1. Register event listeners BEFORE connecting to avoid race conditions
    ctx.room.on(RoomEvent.ChatMessage, async (msg, participant) => {
      const identity = participant?.identity ?? (msg as any).participantIdentity;
      console.log(`[agent-debug]: ChatMessage received from ${identity}:`, msg.message);
      if (!msg.message || identity === ctx.room.localParticipant?.identity) return;
      await handleSystemMessages(msg.message, identity);
    });

    ctx.room.on(RoomEvent.DataReceived, async (payload, participant, kind, topic) => {
      const identity = participant?.identity;
      console.log(`[agent-debug]: DataReceived from ${identity} on topic ${topic}`);
      
      if (topic === 'lk-chat' && identity !== ctx.room.localParticipant?.identity) {
        try {
          const str = new TextDecoder().decode(payload);
          const parsed = JSON.parse(str);
          if (parsed.message) {
            await handleSystemMessages(parsed.message, identity);
          } else if (typeof parsed === 'string') {
            await handleSystemMessages(parsed, identity);
          }
        } catch (e) {
          const str = new TextDecoder().decode(payload);
          await handleSystemMessages(str, identity);
        }
      }
    });

    ctx.room.registerTextStreamHandler('lk-chat', async (stream, participant) => {
      console.log(`[agent-debug]: Text stream received on lk-chat from ${participant?.identity}`);
      let fullText = '';
      for await (const chunk of stream) {
        fullText += chunk;
      }
      console.log(`[agent-debug]: Full text stream content:`, fullText);
      try {
        const parsed = JSON.parse(fullText);
        if (parsed?.message && participant?.identity !== ctx.room.localParticipant?.identity) {
          await handleSystemMessages(parsed.message, participant?.identity);
        } else if (participant?.identity !== ctx.room.localParticipant?.identity) {
          await handleSystemMessages(fullText, participant?.identity);
        }
      } catch (err) {
        if (participant?.identity !== ctx.room.localParticipant?.identity) {
          await handleSystemMessages(fullText, participant?.identity);
        }
      }
    });

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

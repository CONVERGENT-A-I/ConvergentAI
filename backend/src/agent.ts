import { type JobContext, ServerOptions, cli } from '@livekit/agents';
import { RoomEvent } from '@livekit/rtc-node';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { voice } from '@livekit/agents';
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

    // Pre-load VAD if not already ready (Eliminates the 3-5s connection delay)
    if (!globalSileroVad) {
      console.log(`[agent]: Pre-warming Hybrid VAD (First connection)...`);
      globalSileroVad = await silero.VAD.load({
        minSilenceDuration: 300,
        prefixPaddingDuration: 200,
      });
    }

    await ctx.connect();
    console.log(`[agent]: Connected to room: ${ctx.room.name}`);

    const model = new openai.realtime.RealtimeModel({
      voice: "shimmer", 
      modalities: ["audio", "text"],
      turnDetection: null, 
    });

    const baseInstructions = `You are Ailana AI, a friendly female financial advisor and mortgage assistant.
IMPORTANT: You must only speak and understand English. 
Keep your responses incredibly concise, conversational, and completely free of complex formatting.
Act naturally and politely. Do not sound robotic.`;

    const introInstructions = `${baseInstructions}
STRICT RESTRICTION: DO NOT GREET THE USER. Remain completely silent until you receive a specific SYSTEM_INTRO_TRIGGER signal.`;

    const interactiveInstructions = `${baseInstructions}
You are now in active conversation mode. Respond helpfully to user questions about mortgages.`;

    // 1. Initial "Manual" Agent (Optimized: No VAD for startup speed)
    const manualAgent = new voice.Agent({
      instructions: introInstructions,
      llm: model,
      turnHandling: {
        turnDetection: 'manual', 
      },
    });

    // 2. Interactive "VAD" Agent 
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

    console.log(`[agent]: Starting AI Session in PASSIVE mode...`);

    const session = new voice.AgentSession({
      llm: model,
      userAwayTimeout: null, 
    });

    session.on(voice.AgentSessionEventTypes.Error, (err: any) => {
      if (err?.message?.includes('audio_end_ms')) return;
      console.error('[agent]: Session error:', err);
    });

    await session.start({
      agent: manualAgent,
      room: ctx.room,
    });

    ctx.room.on(RoomEvent.ChatMessage, (msg, participant) => {
      const identity = participant?.identity ?? (msg as any).participantIdentity;
      if (!msg.message || identity === ctx.room.localParticipant?.identity) return;
      if (msg.message === 'SYSTEM_INTRO_TRIGGER') return;
      session.generateReply({ userInput: msg.message });
    });

    ctx.room.on(RoomEvent.DataReceived, async (payload, participant, kind, topic) => {
      if (topic === 'lk-chat') {
        try {
          const str = new TextDecoder().decode(payload);
          const parsed = JSON.parse(str);
          if (parsed?.message && participant?.identity !== ctx.room.localParticipant?.identity) {
             if (parsed.message === 'SYSTEM_INTRO_TRIGGER') {
                 console.log(`[agent]: 💬 [STEP 1] Received Intro Trigger. Purging session...`);
                 await session.interrupt({ force: true });
                 await new Promise(resolve => setTimeout(resolve, 500));

                 console.log(`[agent]: 💬 [STEP 2] Speaking Welcome Introduction...`);
                 const handle = session.generateReply({ 
                   instructions: "SYSTEM NOTICE: GREETING OVERRIDE. Say EXACTLY this phrase and nothing else: 'Hi! I am here to help you with mortgage related questions. Please select the Live with Ailana if you want to continue conversation with me or select any other channel of your choice.'" 
                 });
                 
                 await handle.waitForPlayout();
                 
                 console.log(`[agent]: 💬 [STEP 3] Transitioning to Interactive Intelligence.`);
                 session.updateAgent(vadAgent);

                 const response = JSON.stringify({ message: 'SYSTEM_INTRO_DONE' });
                 await ctx.room.localParticipant?.publishData(new TextEncoder().encode(response), { topic: 'lk-chat', reliable: true });
                 await ctx.room.localParticipant?.sendChatMessage(response);
                 
                 console.log(`[agent]: ✅ [STEP 4] Done. User ready.`);
                 return;
             }
             if (parsed.message === 'SYSTEM_INTRO_TRIGGER') return;
             session.generateReply({ userInput: parsed.message });
          }
        } catch (err) {}
      }
    });

    console.log('[agent]: Ready for triggers.');
  },
};

if (process.argv[1] && process.argv[1].endsWith('agent.ts')) {
  cli.runApp(new ServerOptions({
    agent: fileURLToPath(import.meta.url),
    initializeProcessTimeout: 60000,
  }));
}

import { type JobContext, ServerOptions, cli } from '@livekit/agents';
import { RoomEvent } from '@livekit/rtc-node';
import dotenv from 'dotenv';
import path from 'path';
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

export default {
  async entry(ctx: JobContext) {
    console.log(`[agent]: Receiving job for room: ${ctx.room.name}`);

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      console.error('[agent]: ❌ CRITICAL: OPENAI_API_KEY is missing in backend/.env');
      return;
    }

    await ctx.connect();
    console.log(`[agent]: Connected to room: ${ctx.room.name}`);

    // Create the OpenAI Realtime AI Brain
    console.log(`[agent]: Initializing Hybrid VAD (Acoustic + Semantic)...`);
    const sileroVad = await silero.VAD.load({
      minSilenceDuration: 300,
      prefixPaddingDuration: 200,
    });

    const agent = new voice.Agent({
      instructions: `You are Ailana AI, a friendly female financial advisor and mortgage assistant.
IMPORTANT: You must only speak and understand English. If the user speaks another language, politely insist on continuing in English.
Keep your responses incredibly concise, conversational, and completely free of complex formatting.
Act naturally and politely. Do not sound robotic.`,
      vad: sileroVad,
      llm: new openai.realtime.RealtimeModel({
        voice: "shimmer", // Premium Female Voice
        modalities: ["audio", "text"],
        turnDetection: null, // Disable server-side VAD
      }),
      turnHandling: {
        turnDetection: 'vad',
        endpointing: {
          minDelay: 250, // Ultra-fast trigger (250ms)
        },
        interruption: {
          minDuration: 200, // Snapier interruptions (200ms)
        },
      },
    });

    console.log(`[agent]: Starting OpenAI Realtime Agent (English / Female)...`);

    // Connect the AI voice strictly to the room
    const session = new voice.AgentSession({
      llm: agent.llm!,
    });

    // Handle unexpected errors (Double-layer protection)
    session.on(voice.AgentSessionEventTypes.Error, (err: any) => {
      const msg = err?.error?.message || err?.message || '';
      if (msg.includes('audio_end_ms')) {
        console.warn('[agent]: 🛡️ Suppressed session error: audio_end_ms is null');
        return;
      }
      console.error('[agent]: Agent session error:', err);
    });

    await session.start({
      agent,
      room: ctx.room,
    });

    console.log(`[agent]: OpenAI Agent session started with Hybrid VAD!`);

    // --- TEXT INPUT HANDLING ---
    // Listen for text messages from the "Type to AI" mode.
    // generateReply({ userInput }) is the correct single-call API for the
    // Realtime model — it injects the user's text turn AND triggers audio response.
    ctx.room.on(RoomEvent.ChatMessage, (msg, participant) => {
      const identity = participant?.identity ?? (msg as any).participantIdentity;
      if (!msg.message || identity === ctx.room.localParticipant?.identity) return;

      console.log(`[agent]: 💬 Text input: "${msg.message}" from ${identity}`);
      session.generateReply({ userInput: msg.message });
    });
    // ---------------------------

    console.log('[agent]: Agent loop active and awaiting audio/text triggers.');
  },
};

if (process.argv[1] && process.argv[1].endsWith('agent.ts')) {
  cli.runApp(new ServerOptions({
    agent: fileURLToPath(import.meta.url),
    initializeProcessTimeout: 60000,
  }));
}

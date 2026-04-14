import { type JobContext, ServerOptions, cli } from '@livekit/agents';
import { AvatarSession } from '@livekit/agents-plugin-lemonslice';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { voice } from '@livekit/agents';
import * as openai from '@livekit/agents-plugin-openai';
import * as silero from '@livekit/agents-plugin-silero';

dotenv.config();

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
    const sileroVad = await silero.VAD.load();

    const agent = new voice.Agent({
      instructions: `You are Ailana AI, a friendly female financial advisor and mortgage assistant.
IMPORTANT: You must only speak and understand English. If the user speaks another language, politely insist on continuing in English.
Keep your responses incredibly concise, conversational, and completely free of complex formatting.
Act naturally and politely. Do not sound robotic.`,
      vad: sileroVad,
      llm: new openai.realtime.RealtimeModel({
        voice: "shimmer", // Premium Female Voice
        turnDetection: {
          type: "semantic_vad",
          eagerness: "high",
        },
      }),
      turnHandling: {
        turnDetection: 'realtime_llm',
        endpointing: {},
        interruption: {},
      },
    });

    console.log(`[agent]: Starting OpenAI Realtime Agent (English / Female)...`);

    // Connect the AI voice strictly to the room
    const session = new voice.AgentSession({
      llm: agent.llm!,
    });

    // Handle unexpected errors
    session.on(voice.AgentSessionEventTypes.Error, (err: any) => {
      if (err?.error?.message?.includes('audio_end_ms')) return;
      console.error('[agent]: Agent session error:', err);
    });

    await session.start({
      agent,
      room: ctx.room,
    });

    console.log(`[agent]: OpenAI Agent session started with Hybrid VAD!`);

    // --- ACOUSTIC FALLBACK LOGIC ---
    // The Semantic VAD (Cloud) is handled automatically by 'realtime_llm' mode.
    // We add this local listener as a "safety net" for ambiguous cases.
    let lastAcousticSpeechTime = 0;
    const ACOUSTIC_FALLBACK_DELAY = 300; // ms safety net

    session.on(voice.AgentSessionEventTypes.UserStateChanged, (ev) => {
      if (ev.newState !== 'speaking') {
        // User stopped speaking according to local Silero VAD
        const now = Date.now();
        lastAcousticSpeechTime = now;

        setTimeout(() => {
          // If we are still silent after 300ms and the SDK hasn't triggered a turn yet
          if (lastAcousticSpeechTime === now && session.userState !== 'speaking') {
            console.log('[hybrid-vad]: Acoustic fallback trigger (300ms timeout)');
            session.commitUserTurn();
          }
        }, ACOUSTIC_FALLBACK_DELAY);
      }
    });
    // -------------------------------------

    const avatar = new AvatarSession({
      agentId: process.env.LEMONSLICE_AGENT_ID!,
      apiKey: process.env.LEMONSLICE_API_KEY!,
      idleTimeout: 3600, // Important: prevents avatar from leaving due to no audio
    });

    try {
      console.log(`[agent]: Starting LemonSlice avatar and linking to AI...`);
      await avatar.start(session, ctx.room);
      console.log('[agent]: LemonSlice avatar started and synced successfully!');
    } catch (error) {
      console.error('[agent]: Error starting LemonSlice avatar:', error);
    }

    console.log('[agent]: Avatar injection sequence complete!');
  },
};

if (process.argv[1] && process.argv[1].endsWith('agent.ts')) {
  cli.runApp(new ServerOptions({
    agent: fileURLToPath(import.meta.url),
    initializeProcessTimeout: 60000,
  }));
}

import { type JobContext, ServerOptions, cli, voice, llm } from '@livekit/agents';
import { RoomEvent, AudioSource, LocalAudioTrack, TrackSource, AudioFrame } from '@livekit/rtc-node';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import * as openai from '@livekit/agents-plugin-openai';
import * as silero from '@livekit/agents-plugin-silero';
import { ailanaConfig } from './config/ailana-config.js';
import { SessionContextManager } from './context/session-context-manager.js';
import { LatencyTracker } from './metrics/latency-tracker.js';
import {
  buildBaseInstructions,
  buildVoiceInstructions,
  GREETING_USER_INPUT,
  RESUME_USER_INPUT,
} from './prompts/index.js';
import { logPromptBudget } from './context/context-budget.js';

dotenv.config();

// ── TTS Intro (OpenAI / coral voice) ──────────────────────────────────────
const OPENAI_TTS_SAMPLE_RATE = 24000;
const OPENAI_TTS_CHANNELS = 1;
let cachedIntroFrames: AudioFrame[] | null = null;

async function prewarmIntroAudio(): Promise<void> {
  if (cachedIntroFrames) return;
  console.log('[agent]: 🔥 Pre-warming intro TTS audio (OpenAI coral)...');

  const introTts = new openai.TTS({
    model: 'tts-1',
    voice: 'coral' as any,
  });

  const introText =
    "Hello, I am Ailana. It's a pleasure to meet you. As your mortgage assistant, my goal is to make your path to homeownership as clear and straightforward as possible using our specialized AI. To ensure we are protecting your privacy and meeting our commitment to transparency, I have placed our AI Use Disclosure on your screen for you to review. Once you click, 'Agree & Get Started,' we can move forward together to find the right mortgage solution for your goals.";

  const frames: AudioFrame[] = [];

  // 2.5 s silence at start — gives Keyframe Avatar time to connect
  const samplesPerFrame = OPENAI_TTS_SAMPLE_RATE / 100; // 10 ms frame
  const emptyData = new Int16Array(samplesPerFrame * OPENAI_TTS_CHANNELS);
  const startSilenceCount = Math.round(2.5 * 100);
  for (let i = 0; i < startSilenceCount; i++) {
    frames.push(new AudioFrame(emptyData, OPENAI_TTS_SAMPLE_RATE, OPENAI_TTS_CHANNELS, samplesPerFrame));
  }

  // Synthesize speech via OpenAI TTS
  const stream = introTts.synthesize(introText);
  for await (const audio of stream) {
    frames.push(audio.frame);
  }

  // 1.5 s silence at end — prevents WebRTC audio cutoff
  const endSilenceCount = Math.round(1.5 * 100);
  for (let i = 0; i < endSilenceCount; i++) {
    frames.push(new AudioFrame(emptyData, OPENAI_TTS_SAMPLE_RATE, OPENAI_TTS_CHANNELS, samplesPerFrame));
  }

  cachedIntroFrames = frames;
  const totalSamples = frames.reduce((acc, f) => acc + f.samplesPerChannel, 0);
  console.log(
    `[agent]: ✅ Intro audio pre-cached (${frames.length} frames, ${
      (totalSamples / OPENAI_TTS_SAMPLE_RATE).toFixed(2)
    }s total)`,
  );
}
// ──────────────────────────────────────────────────────────────────────────

process.on('uncaughtException', (err) => {
  if (err?.message?.includes('audio_end_ms') || (err as any)?.context?.error?.message?.includes('audio_end_ms')) {
    console.warn('[agent]: Suppressed known OpenAI audio_end_ms crash.');
    return;
  }
  console.error('[agent]: Uncaught Exception:', err);
  process.exit(1);
});

export default {
  async entry(ctx: JobContext) {
    console.log(`[agent]: Receiving job for room: ${ctx.room.name}`);

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      console.error('[agent]: CRITICAL: OPENAI_API_KEY is missing in backend/.env');
      return;
    }

    const metrics = new LatencyTracker();
    const summarizationLlm = new openai.LLM({ model: ailanaConfig.summarizationModel });
    const contextManager = new SessionContextManager(summarizationLlm, metrics);

    console.log(`[agent]: Loading VAD (minSilence=${ailanaConfig.vadMinSilenceMs}ms)...`);
    const sessionVad = await silero.VAD.load({
      minSilenceDuration: ailanaConfig.vadMinSilenceMs,
      prefixPaddingDuration: 200,
    });

    // Pre-warm TTS intro audio in the background — non-blocking
    prewarmIntroAudio().catch((err) =>
      console.error('[agent]: ❌ Intro audio pre-warm failed:', err),
    );

    const model = new openai.realtime.RealtimeModel({
      model: ailanaConfig.realtimeModel,
      voice: ailanaConfig.realtimeVoice,
      modalities: ['audio', 'text'],
      turnDetection: null,
    });

    const turnHandling = {
      turnDetection: 'vad' as const,
      endpointing: {
        minDelay: ailanaConfig.vadEndpointMinDelayMs,
      },
      interruption: {
        minDuration: 250,
      },
    };

    const createVadAgent = () =>
      new voice.Agent({
        instructions: buildVoiceInstructions(),
        vad: sessionVad,
        llm: model,
        turnHandling,
      });

    let vadAgent = createVadAgent();
    logPromptBudget('voice_static', buildVoiceInstructions());
    logPromptBudget('text_full', buildBaseInstructions());
    let voiceMuted = false;
    let isHibernating = false;

    const session = new voice.AgentSession({
      llm: model,
      userAwayTimeout: null,
    });

    const createAgentForRotation = () => {
      vadAgent = createVadAgent();
      return vadAgent;
    };

    const prepareContext = async () => {
      if (!(session as any)._started) return;
      if ((session as any)._chatCtx) {
        (session as any)._chatCtx.items = (session as any)._chatCtx.items.filter(
          (item: any) => item.type !== 'agent_handoff'
        );
      }
      const isIdle = () => currentAgentState === 'listening';
      await contextManager.maybeCompact(session, vadAgent, isIdle);
      await contextManager.maybeRotate(session, createAgentForRotation, isIdle);
    };

    let currentAgentState = 'connecting';

    session.on(voice.AgentSessionEventTypes.Error, (err: any) => {
      if (err?.message?.includes('audio_end_ms')) return;
      console.error('[agent-error]: Session error:', err);
    });

    session.on(voice.AgentSessionEventTypes.AgentStateChanged, (ev: any) => {
      const oldState = ev.oldState ?? ev;
      const newState = ev.newState ?? ev;
      if (typeof oldState === 'string' && typeof newState === 'string') {
        currentAgentState = newState;
        console.log(`[agent-debug]: Agent state: ${oldState} → ${newState}`);
        if (newState === 'speaking' && oldState === 'thinking') {
          metrics.markAgentSpeaking();
        }
        if (newState === 'listening' && (session as any)._started && !voiceMuted && !isHibernating) {
          prepareContext().catch(err => console.error('[agent-error]: Idle prepareContext failed:', err));
        }
      }
    });

    session.on(voice.AgentSessionEventTypes.UserInputTranscribed, async (ev: any) => {
      if (!ev.isFinal || !ev.transcript?.trim()) return;
      metrics.markUserTurnEnd();
      metrics.startTurn();
      contextManager.onUserTurn(ev.transcript);
      // Removed prepareContext here to prevent race conditions during interruptions.
      // Context will be compacted when the agent goes back to 'listening' state.
    });

    session.on(voice.AgentSessionEventTypes.ConversationItemAdded, (ev: any) => {
      const item = ev.item as llm.ChatMessage;
      if (item?.role === 'assistant' && item.textContent) {
        contextManager.onAgentTurn(item.textContent);
      }
      try {
        const chatCtx = session.chatCtx;
        metrics.logContextSize(
          chatCtx.items.length,
          contextManager.estimateTokensFromChatCtx(chatCtx),
        );
      } catch {
        // session may not be fully started
      }
    });

    session.on(voice.AgentSessionEventTypes.MetricsCollected, (ev: any) => {
      const m = ev.metrics;
      if (m?.type === 'realtime_model_metrics') {
        metrics.recordRealtimeMetrics(m.ttftMs ?? -1, m.inputTokens ?? 0);
        contextManager.onRealtimeInputTokens(m.inputTokens ?? 0);
      }
    });

    const generateTextOnlyReply = async (userMessage: string) => {
      contextManager.onUserTurn(userMessage);
      metrics.startTurn();
      console.log(`[agent]: Text-only reply for "${userMessage}"...`);

      try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) return;

        const systemPrompt = buildBaseInstructions(
          contextManager.getConversationSummary() ?? undefined,
        );
        const messages = contextManager.buildTextMessages(systemPrompt);
        messages.push({ role: 'user', content: userMessage });

        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: ailanaConfig.textModel,
            messages: messages.slice(-24),
            max_tokens: 200,
            temperature: 0.6,
          }),
        });

        if (!res.ok) {
          const errBody = await res.text().catch(() => '');
          console.error(`[agent]: Text-only API error: ${res.status} — ${errBody}`);
          return;
        }

        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content?.trim();

        if (reply) {
          contextManager.onAgentTurn(reply);
          console.log(`[agent]: Text-only reply: "${reply}"`);

          try {
            await ctx.room.localParticipant?.sendText(reply, { topic: 'lk.chat' });
          } catch {
            await ctx.room.localParticipant?.sendChatMessage(reply);
          }
        }
      } catch (err) {
        console.error('[agent]: Text-only reply failed:', err);
      }
    };

    const handleSystemMessages = async (messageText: string, participantIdentity: string | undefined) => {
      if (isHibernating && messageText !== 'SYSTEM_RESUME_AGENT') {
        console.log(`[agent]: Ignoring message while hibernating: ${messageText}`);
        return;
      }

      if (messageText === 'SYSTEM_TRANSFER_MLO') {
        isHibernating = true;
        console.log(`[agent]: Agent hibernating. Initiating SIP transfer...`);

        // Stop current LLM/TTS generation
        try {
          if ((session as any)._started) {
            session.interrupt();
          }
        } catch (e) {
          console.warn('[agent]: Failed to interrupt session:', e);
        }

        // Mute the agent's microphone track so it cannot be heard by anyone in the room
        // (Removing invalid track?.mute() - session.interrupt() combined with setSubscribed(false) is sufficient)

        // Stop listening to all current users
        for (const p of ctx.room.remoteParticipants.values()) {
          for (const pub of p.trackPublications.values()) {
            if (pub.subscribed) pub.setSubscribed(false);
          }
        }

        try {
          const { transferRoomToMloQueue } = await import('./utils/sipTransfer.js');
          transferRoomToMloQueue({
            roomName: ctx.room.name || '',
            ...(participantIdentity ? { userIdentity: participantIdentity } : {}),
          }).catch((err) => console.error(`[agent]: SIP Transfer failed:`, err));
        } catch (err) {
          console.error(`[agent]: SIP Transfer setup failed:`, err);
        }
        return;
      }

      if (messageText === 'SYSTEM_RESUME_AGENT') {
        isHibernating = false;
        console.log(`[agent]: Agent waking up from hibernation.`);

        // Unmute the agent's microphone track
        // (Removed track?.unmute() as it is no longer needed)

        for (const p of ctx.room.remoteParticipants.values()) {
          for (const pub of p.trackPublications.values()) {
            if (!pub.subscribed) pub.setSubscribed(true);
          }
        }

        metrics.startTurn();
        metrics.markGenerateReply();
        session.generateReply({ userInput: RESUME_USER_INPUT });
        return;
      }

      if (messageText === 'SYSTEM_VOICE_MUTED') {
        voiceMuted = true;
        console.log(`[agent]: Avatar voice disabled — text-only replies.`);
        return;
      }
      if (messageText === 'SYSTEM_VOICE_UNMUTED') {
        voiceMuted = false;
        console.log(`[agent]: Avatar voice enabled — resuming voice replies.`);
        return;
      }

      // ── TTS Intro trigger (separate from the realtime session flow) ────────
      if (messageText === 'SYSTEM_INTRO_TRIGGER') {
        console.log('[agent]: 💬 [INTRO 1] Received SYSTEM_INTRO_TRIGGER — playing cached TTS...');

        // If prewarm hasn't finished yet, wait for it now
        if (!cachedIntroFrames) {
          console.warn('[agent]: ⚠️ Intro audio not ready — waiting for prewarm...');
          await prewarmIntroAudio().catch((err) =>
            console.error('[agent]: ❌ Late prewarm failed:', err),
          );
        }

        const introSource = new AudioSource(OPENAI_TTS_SAMPLE_RATE, OPENAI_TTS_CHANNELS);
        const introTrack = LocalAudioTrack.createAudioTrack('intro-audio', introSource);
        const introPub = await ctx.room.localParticipant?.publishTrack(introTrack, {
          source: TrackSource.SOURCE_MICROPHONE,
        } as any);

        console.log('[agent]: 💬 [INTRO 2] Streaming pre-cached intro frames...');
        if (cachedIntroFrames) {
          for (const frame of cachedIntroFrames) {
            await introSource.captureFrame(frame);
          }
        }

        // Wait exactly as long as the audio lasts before unpublishing
        const totalSamples = (cachedIntroFrames ?? []).reduce(
          (acc, f) => acc + f.samplesPerChannel,
          0,
        );
        const delayMs = (totalSamples / OPENAI_TTS_SAMPLE_RATE) * 1000;
        console.log(`[agent]: ⏳ [INTRO 3] Waiting ${delayMs.toFixed(0)}ms for full playout...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));

        if (introPub?.sid) {
          await ctx.room.localParticipant?.unpublishTrack(introPub.sid);
        }
        await introSource.close();

        // Notify the frontend that the intro is done
        const donePayload = new TextEncoder().encode(
          JSON.stringify({ message: 'SYSTEM_INTRO_DONE' }),
        );
        await ctx.room.localParticipant?.publishData(donePayload, {
          topic: 'lk-chat',
          reliable: true,
        });
        console.log('[agent]: ✅ [INTRO 4] Intro fully played. SYSTEM_INTRO_DONE sent.');
        return;
      }
      // ──────────────────────────────────────────────────────────────────────

      if (messageText.startsWith('SYSTEM_CHANNEL_START')) {
        const targetMode = messageText.split(':')[1] || 'video';
        console.log(`[agent]: Channel started (${targetMode}).`);

        if ((session as any)._started) {
          console.log(`[agent]: Session already started.`);
          return;
        }

        try {
          await session.start({ agent: vadAgent, room: ctx.room });
          (session as any)._started = true;
          if (targetMode !== 'tts-avatar') {
            metrics.startTurn();
            metrics.markGenerateReply();
            session.generateReply({ userInput: GREETING_USER_INPUT });
          } else {
            console.log('[agent]: Skipping greeting for tts-avatar mode.');
          }
        } catch (err) {
          console.error(`[agent]: Failed to start session:`, err);
        }
        return;
      }

      try {
        console.log(`[agent]: Generating reply for: "${messageText}"`);
        if (!(session as any)._started) {
          await session.start({ agent: vadAgent, room: ctx.room });
          (session as any)._started = true;
        }

        metrics.startTurn();
        metrics.markGenerateReply();

        if (voiceMuted) {
          await generateTextOnlyReply(messageText);
        } else {
          contextManager.onUserTurn(messageText);
          session.generateReply({ userInput: messageText });
        }
      } catch (err) {
        console.warn(`[agent]: Could not generate reply:`, err);
      }
    };

    ctx.room.on(RoomEvent.ChatMessage, async (msg, participant) => {
      try {
        const identity = participant?.identity ?? (msg as any).participantIdentity;
        if (!msg.message || identity === ctx.room.localParticipant?.identity) return;
        await handleSystemMessages(msg.message, identity);
      } catch (err) {
        console.error(`[agent-error]: ChatMessage handler:`, err);
      }
    });

    ctx.room.on(RoomEvent.TrackPublished, (pub, participant) => {
      if (isHibernating) {
        pub.setSubscribed(false);
      }
    });

    ctx.room.on(RoomEvent.TrackSubscribed, (track, pub, participant) => {
      if (isHibernating) {
        pub.setSubscribed(false);
      }
    });

    ctx.room.on(RoomEvent.DataReceived, async (payload, participant, _kind, topic) => {
      try {
        const identity = participant?.identity;
        if (topic === 'lk-chat' && identity !== ctx.room.localParticipant?.identity) {
          const str = new TextDecoder().decode(payload);
          try {
            const parsed = JSON.parse(str);
            await handleSystemMessages(parsed.message ?? str, identity);
          } catch {
            await handleSystemMessages(str, identity);
          }
        }
      } catch (err) {
        console.error(`[agent-error]: DataReceived handler:`, err);
      }
    });

    const chatTopics = ['lk-chat', 'lk.chat', 'lk-chat-topic', 'lk.chat.topic'];
    for (const topic of chatTopics) {
      ctx.room.registerTextStreamHandler(topic, async (stream, participant) => {
        try {
          let fullText = '';
          for await (const chunk of stream) fullText += chunk;
          if (participant?.identity !== ctx.room.localParticipant?.identity) {
            try {
              const parsed = JSON.parse(fullText);
              await handleSystemMessages(parsed.message ?? fullText, participant?.identity);
            } catch {
              await handleSystemMessages(fullText, participant?.identity);
            }
          }
        } catch (err) {
          console.error(`[agent-error]: TextStream handler (${topic}):`, err);
        }
      });
    }

    await ctx.connect();
    console.log(`[agent]: Connected to room: ${ctx.room.name}`);
    console.log(
      `[agent]: Ready — model=${ailanaConfig.realtimeModel}, prompt=${ailanaConfig.promptVersion}, compact@${ailanaConfig.compactEveryNTurns} turns / ${ailanaConfig.forceCompactInputTokens} tokens`,
    );
  },
};

if (process.argv[1] && process.argv[1].endsWith('agent.ts')) {
  cli.runApp(
    new ServerOptions({
      agent: fileURLToPath(import.meta.url),
      initializeProcessTimeout: 60000,
    }),
  );
}

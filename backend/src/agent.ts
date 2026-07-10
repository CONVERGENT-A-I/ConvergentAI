if (process.platform === 'win32') {
  const psPath = 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0';
  if (process.env.PATH && !process.env.PATH.includes(psPath)) {
    process.env.PATH = `${psPath};${process.env.PATH}`;
  }
}

import dotenv from 'dotenv';
dotenv.config();
import { type JobContext, ServerOptions, cli, voice, llm, inference, defineAgent } from '@livekit/agents';
import { RoomEvent, TrackKind } from '@livekit/rtc-node';
import { fileURLToPath } from 'url';
import * as openai from '@livekit/agents-plugin-openai';
import * as cartesia from '@livekit/agents-plugin-cartesia';
import { LoggedElevenLabsTTS } from './metrics/logged-elevenlabs-tts.js';
import { ailanaConfig } from './config/ailana-config.js';
import { SessionContextManager } from './context/session-context-manager.js';
import { LatencyTracker, ts } from './metrics/latency-tracker.js';
import {
  buildBaseInstructions,
  buildVoiceInstructions,
  GREETING_USER_INPUT,
  RESUME_USER_INPUT,
} from './prompts/index.js';
import { logPromptBudget } from './context/context-budget.js';
import { AvatarSession } from '@livekit/agents-plugin-lemonslice';
import { BackchannelEngine } from './utils/backchannel-engine.js';
import { OpenAI } from 'openai';

const cerebrasClient = new OpenAI({
  apiKey: ailanaConfig.cerebrasApiKey,
  baseURL: ailanaConfig.cerebrasBaseUrl,
});

const originalCerebrasCreate = cerebrasClient.chat.completions.create.bind(cerebrasClient.chat.completions);

cerebrasClient.chat.completions.create = (async function (body: any, options: any) {
  let lastErr: any = null;
  // Retry once with backoff for transient Cerebras errors before falling back
  for (let attempt = 0; attempt < 2; attempt++) {
    const t0 = Date.now();
    try {
      if (attempt === 0) {
        console.log(`[cerebras-proxy][${ts()}] Sending request to Cerebras: model=${body.model}`);
      } else {
        console.log(`[cerebras-proxy][${ts()}] Retry #${attempt} to Cerebras: model=${body.model}`);
      }

      const result = await originalCerebrasCreate(body, options);

      // If it's a stream, intercept it to track first token, end stream timings, and log the full response
      if (result && typeof (result as any)[Symbol.asyncIterator] === 'function') {
        const originalIterator = (result as any)[Symbol.asyncIterator].bind(result);
        const accumulatedChunks: any[] = [];

        (result as any)[Symbol.asyncIterator] = function () {
          const iterator = originalIterator();
          let isFirst = true;

          return {
            async next() {
              const nextResult = await iterator.next();
              if (nextResult.done) {
                const totalDur = Date.now() - t0;
                console.log(`[cerebras-proxy][${ts()}] Stream complete (Total: ${totalDur}ms, chunks: ${accumulatedChunks.length})`);
                return nextResult;
              }
              if (isFirst) {
                isFirst = false;
                const ttft = Date.now() - t0;
                console.log(`[cerebras-proxy][${ts()}] First chunk/token received (TTFT: ${ttft}ms)`);
              }
              if (nextResult.value) {
                accumulatedChunks.push(nextResult.value);
              }
              return nextResult;
            },
            [Symbol.asyncIterator]() {
              return this;
            }
          };
        };
      } else {
        const dur = Date.now() - t0;
        console.log(`[cerebras-proxy][${ts()}] Non-streaming response received (Dur: ${dur}ms)`);
      }

      return result;
    } catch (err: any) {
      lastErr = err;
      const statusCode = err?.status ?? err?.statusCode;
      console.warn(`[cerebras-proxy][${ts()}] Cerebras API error (status: ${statusCode}, attempt: ${attempt}):`, err?.message ?? err);

      // Log full error body for HTTP 400
      if (statusCode === 400) {
        console.error(`[cerebras-proxy][${ts()}] HTTP 400 full error response:`, JSON.stringify(err?.error ?? err?.body ?? { message: err?.message, code: err?.code, status: statusCode }, null, 2));
      }

      // On first attempt with a retryable error, wait and retry once
      if (attempt === 0 && (statusCode === 400 || statusCode === 500 || statusCode === 502 || statusCode === 503)) {
        await new Promise(resolve => setTimeout(resolve, 500));
        continue;
      }

      // No Groq fallback — propagate the Cerebras error directly
      throw err;
    }
  }
  throw lastErr;
} as any);


class CerebrasLLM extends openai.LLM {
  // gemma-4-31b does not support reasoning_effort or reasoning_format parameters.
}

class AilanaVoiceAgent extends voice.Agent {
  constructor(
    options: voice.AgentOptions<any>,
    private contextManager: SessionContextManager,
    private updateInstructionsCallback: () => void
  ) {
    super(options);
  }

  override async onUserTurnCompleted(chatCtx: any, userMessage: any): Promise<void> {
    // ── [perf] EOU boundary timestamp ────────────────────────────────────────
    const _perfEouEnd = performance.now();
    console.log(`[agent-hook]: onUserTurnCompleted hook triggered with message: "${userMessage?.textContent}"`);

    this.contextManager.setLowConfidenceFlag(false);

    // 1. Checkpoint: Wait for the previous turn's extraction to complete (if any)
    const prevTurn = this.contextManager.getCurrentTurnCount();
    if (prevTurn > 0) {
      const _perfCheckpointStart = performance.now();
      const pendingCount = this.contextManager.getPendingExtractionCount();
      const maxWaitMs = pendingCount > 1 ? 0 : 300; // Circuit breaker: 0ms wait if backlog > 1

      console.log(`[checkpoint] Gating on previous turn ${prevTurn} extraction. Pending count: ${pendingCount}. Max wait: ${maxWaitMs}ms`);

      const completed = await this.contextManager.waitForExtraction(prevTurn, maxWaitMs);
      const waitDur = performance.now() - _perfCheckpointStart;

      if (completed) {
        console.log(`[checkpoint] Previous turn ${prevTurn} extraction resolved normally. Waited: ${waitDur.toFixed(1)}ms`);
      } else {
        console.warn(`[checkpoint] Previous turn ${prevTurn} extraction timed out or skipped. Waited: ${waitDur.toFixed(1)}ms`);
      }
    }

    // 2. Trigger the current turn's extraction asynchronously in the background
    if (userMessage?.textContent) {
      this.contextManager.triggerBackgroundExtraction(userMessage.textContent);
      console.log(`[agent-hook]: Current turn background extraction triggered asynchronously.`);
    }

    // ── [perf] Instructions update ───────────────────────────────────────────
    const _perfInstructionsStart = performance.now();
    // Update original instructions in the session
    this.updateInstructionsCallback();
    const _perfInstructionsMs = (performance.now() - _perfInstructionsStart).toFixed(1);
    console.log(`[perf] updateInstructions (getActiveInstructions + chatCtx write): ${_perfInstructionsMs}ms`);

    // Update local mutable chatCtx copy to align the LLM prompt for the current generation
    const _perfCtxUpdateStart = performance.now();
    const activeInstructions = this.contextManager.getActiveInstructions();
    const systemItem = (chatCtx.items.find(
      (item: any) => item.type === 'message' && item.id === 'lk.agent_task.instructions'
    ) || chatCtx.items.find(
      (item: any) => item.type === 'message' && item.role === 'system'
    )) as llm.ChatMessage | undefined;
    if (systemItem) {
      systemItem.content = [activeInstructions];
      if ((systemItem as any).id !== 'lk.agent_task.instructions') {
        (systemItem as any).id = 'lk.agent_task.instructions';
      }
      console.log(`[agent-hook]: Local mutable chatCtx system instructions updated.`);
    } else {
      chatCtx.items.unshift(new llm.ChatMessage({
        id: 'lk.agent_task.instructions',
        role: 'system',
        content: activeInstructions
      }));
      console.log(`[agent-hook]: Local mutable chatCtx system instructions prepended.`);
    }
    const _perfCtxUpdateMs = (performance.now() - _perfCtxUpdateStart).toFixed(1);
    console.log(`[perf] chatCtx local copy update: ${_perfCtxUpdateMs}ms`);

    // ── [perf] Total EOU→instructions gap ────────────────────────────────────
    const _perfTotalMs = (performance.now() - _perfEouEnd).toFixed(1);
    console.log(`[perf] EOU->instructions-update gap: ${_perfTotalMs}ms`);
  }
}

process.on('uncaughtException', (err) => {
  if (err?.message?.includes('audio_end_ms') || (err as any)?.context?.error?.message?.includes('audio_end_ms')) {
    console.warn('[agent]: Suppressed known OpenAI audio_end_ms crash.');
    return;
  }
  if (err?.message?.includes('powershell.exe') || err?.message?.includes('pidusage') || err?.message?.includes('ENOENT') && err?.message?.includes('powershell')) {
    console.warn('[agent]: Suppressed pidusage powershell spawn crash.');
    return;
  }
  console.error('[agent]: Uncaught Exception:', err);
  process.exit(1);
});

export default defineAgent({
  async entry(ctx: JobContext) {
    console.log(`[agent]: Receiving job for room: ${ctx.room.name}`);

    // ── STARTUP ENVIRONMENT DIAGNOSTICS ──────────────────────────────────────
    // Printed on every job start so GCP logs show exactly which secrets were
    // injected. Keys are shown as present/MISSING + last-4 chars only.
    const envCheck = (key: string, val: string) =>
      val ? `✓ present (…${val.slice(-4)})` : '✗ MISSING';
    console.log('[agent-startup] ══ Environment variable audit ══');
    console.log(`[agent-startup]  CARTESIA_KEY          : ${envCheck('CARTESIA_KEY', ailanaConfig.cartesiaKey)}`);
    console.log(`[agent-startup]  ELEVENLABS_API_KEY    : ${envCheck('ELEVENLABS_API_KEY', ailanaConfig.elevenlabsApiKey)}`);
    console.log(`[agent-startup]  ELEVENLABS_VOICE_ID   : ${ailanaConfig.elevenlabsVoiceId ? '✓ ' + ailanaConfig.elevenlabsVoiceId : '✗ MISSING'}`);
    console.log(`[agent-startup]  LEMONSLICE_API_KEY    : ${envCheck('LEMONSLICE_API_KEY', ailanaConfig.lemonsliceApiKey)}`);
    console.log(`[agent-startup]  LEMONSLICE_AGENT_ID   : ${ailanaConfig.lemonsliceAgentId ? '✓ ' + ailanaConfig.lemonsliceAgentId : '✗ MISSING'}`);
    console.log(`[agent-startup]  CEREBRAS_API_KEY      : ${envCheck('CEREBRAS_API_KEY', ailanaConfig.cerebrasApiKey)}`);
    console.log(`[agent-startup]  LIVEKIT_URL           : ${process.env.LIVEKIT_URL ?? '✗ MISSING'}`);
    console.log(`[agent-startup]  LIVEKIT_API_KEY       : ${process.env.LIVEKIT_API_KEY ? '✓ present' : '✗ MISSING'}`);
    console.log('[agent-startup] ════════════════════════════════');
    // ─────────────────────────────────────────────────────────────────────────

    let resolveAvatarReady: () => void = () => { };
    const avatarReadyPromise = new Promise<void>((resolve) => {
      resolveAvatarReady = resolve;
    });
    let isAvatarInitDone = false;

    const metrics = new LatencyTracker();
    const summarizationLlm = new openai.LLM({
      model: 'gemma-4-31b',
      baseURL: ailanaConfig.cerebrasBaseUrl,
      apiKey: ailanaConfig.cerebrasApiKey,
    });
    const contextManager = new SessionContextManager(summarizationLlm, metrics);

    console.log(`[agent]: Loading VAD (minSilence=${ailanaConfig.vadMinSilenceMs}ms)...`);
    const sessionVad = new inference.VAD({
      model: 'silero',
      minSilenceDuration: ailanaConfig.vadMinSilenceMs,
      prefixPaddingDuration: 200,
    });

    // ── Cartesia STT ──────────────────────────────────────────────────────────
    console.log(`[agent]: Loading Cartesia STT (ink-2)...`);
    if (!ailanaConfig.cartesiaKey) {
      console.error('[agent-startup] FATAL: CARTESIA_KEY is not set — STT will fail!');
    }
    const sessionStt = new cartesia.STT({
      apiKey: ailanaConfig.cartesiaKey,
      model: 'ink-2',
    });

    // ── ElevenLabs TTS ───────────────────────────────────────────────────────
    console.log(`[agent]: Loading ElevenLabs TTS (eleven_turbo_v2_5, voiceId=${ailanaConfig.elevenlabsVoiceId || 'MISSING'})...`);
    if (!ailanaConfig.elevenlabsApiKey) {
      console.error('[agent-startup] FATAL: ELEVENLABS_API_KEY is not set — TTS will fail!');
    }
    if (!ailanaConfig.elevenlabsVoiceId) {
      console.warn('[agent-startup] WARNING: ELEVENLABS_VOICE_ID is not set — using default voice ID.');
    }

    const sessionTts = new LoggedElevenLabsTTS({
      apiKey: ailanaConfig.elevenlabsApiKey,
      voiceId: ailanaConfig.elevenlabsVoiceId,
      modelID: 'eleven_turbo_v2_5',
    });

    // Quick connectivity smoke-test for ElevenLabs (non-blocking)
    (async () => {
      const t0 = Date.now();
      try {
        const resp = await fetch('https://api.elevenlabs.io/v1/user', {
          headers: { 'xi-api-key': ailanaConfig.elevenlabsApiKey },
        });
        const dur = Date.now() - t0;
        if (resp.ok) {
          console.log(`[agent-startup] ElevenLabs API reachable — HTTP ${resp.status} in ${dur}ms`);
        } else {
          console.error(`[agent-startup] ElevenLabs API returned HTTP ${resp.status} in ${dur}ms — check ELEVENLABS_API_KEY`);
        }
      } catch (err: any) {
        console.error(`[agent-startup] ElevenLabs API connectivity test FAILED after ${Date.now() - t0}ms: ${err?.message ?? err}`);
      }
    })();

    const createVadAgent = () => {
      console.log('[agent]: Creating Cascaded agent (Cerebras LLM + Cartesia STT + ElevenLabs TTS + LemonSlice Avatar)...');
      return new AilanaVoiceAgent({
        instructions: contextManager.getActiveInstructions(),
        stt: sessionStt,
        vad: sessionVad,
        llm: new CerebrasLLM({
          model: 'gemma-4-31b',
          client: cerebrasClient,
        }),
        tts: sessionTts,
        turnHandling: {
          turnDetection: 'stt' as const,
          endpointing: {
            minDelay: ailanaConfig.vadEndpointMinDelayMs,
          },
          interruption: {
            minDuration: ailanaConfig.vadInterruptMinDurationMs,
            mode: 'vad' as const,
          },
          preemptiveGeneration: {
            enabled: false,
          },
        } as any,
      }, contextManager, updateSessionInstructions);
    };

    let vadAgent = createVadAgent();
    logPromptBudget('voice_static', buildVoiceInstructions());
    logPromptBudget('text_full', buildBaseInstructions());
    let voiceMuted = false;
    let isHibernating = false;
    let greetingGenerated = false;
    let sessionStarted = false;
    let pendingGreeting = false;

    const session = new voice.AgentSession({
      userAwayTimeout: null,
      turnHandling: {
        turnDetection: 'stt' as const,
        endpointing: {
          minDelay: ailanaConfig.vadEndpointMinDelayMs,
        },
        interruption: {
          minDuration: ailanaConfig.vadInterruptMinDurationMs,
          mode: 'vad' as const,
        },
        preemptiveGeneration: {
          enabled: false,
        },
      } as any,
    });

    const backchannelEngine = new BackchannelEngine();

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

    let currentAgentState = 'initializing';

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

        if (newState === 'speaking') {
          if (oldState === 'thinking') {
            metrics.markAgentSpeaking();
          }
          // Mark avatar render start — LemonSlice receives TTS audio from this moment
          metrics.markAvatarRenderStart();
          // First audio frame of the avatar track arrives with a short processing delay;
          // markAvatarFirstFrame() is called from the TrackPublished / TrackSubscribed handler below.
        }

        if (newState === 'listening' && (session as any)._started && !voiceMuted && !isHibernating) {
          backchannelEngine.reset();
          prepareContext().catch(err => console.error('[agent-error]: Idle prepareContext failed:', err));
        }
      }
    });

    // STT: final transcript ready — mark pipeline stage
    session.on(voice.AgentSessionEventTypes.UserInputTranscribed, async (ev: any) => {
      if (!ev.isFinal) return;
      if (!ev.transcript?.trim()) return;

      const transcript = ev.transcript as string;
      console.log(`[pipeline][${ts()}] STT final transcript: "${transcript}"`);
      metrics.markSttComplete(transcript);
      metrics.markUserTurnEnd();
      metrics.startTurn();
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

    // MetricsCollected fires with LLM TTFT data from the LiveKit pipeline
    session.on(voice.AgentSessionEventTypes.MetricsCollected, (ev: any) => {
      const m = ev.metrics;
      if (m?.type === 'llm_metrics') {
        const ttft = m.ttftMs ?? -1;
        const tokens = m.promptTokens ?? 0;
        metrics.markLlmFirstToken();       // idempotent — only records once
        metrics.markLlmComplete();
        metrics.recordRealtimeMetrics(ttft, tokens);
        console.log(`[pipeline][${ts()}] LLM metrics — TTFT=${ttft}ms  prompt_tokens=${tokens}  completion_tokens=${m.completionTokens ?? '?'}`);
      } else if (m?.type === 'tts_metrics') {
        const dur = m.duration ?? -1;
        metrics.markTtsComplete();
        console.log(`[pipeline][${ts()}] TTS metrics — audio_dur=${dur}ms`);
      } else if (m?.type === 'realtime_model_metrics') {
        metrics.recordRealtimeMetrics(m.ttftMs ?? -1, m.inputTokens ?? 0);
      }
    });

    function updateSessionInstructions() {
      try {
        const activeInstructions = contextManager.getActiveInstructions();
        (vadAgent as any)._instructions = activeInstructions;

        const chatCtx = session.chatCtx;
        const systemItem = (chatCtx.items.find(
          (item) => item.type === 'message' && (item as llm.ChatMessage).id === 'lk.agent_task.instructions'
        ) || chatCtx.items.find(
          (item) => item.type === 'message' && (item as llm.ChatMessage).role === 'system'
        )) as llm.ChatMessage | undefined;
        if (systemItem) {
          systemItem.content = [activeInstructions];
          // Ensure it has the correct ID so the LiveKit SDK updates it correctly
          if ((systemItem as any).id !== 'lk.agent_task.instructions') {
            (systemItem as any).id = 'lk.agent_task.instructions';
          }
          console.log(`[agent-debug]: System instruction message in session.chatCtx updated.`);
        } else {
          chatCtx.items.unshift(new llm.ChatMessage({
            id: 'lk.agent_task.instructions',
            role: 'system',
            content: activeInstructions
          }));
          console.log(`[agent-debug]: System instruction message prepended to session.chatCtx.`);
        }
        console.log(`[agent-debug]: Instructions updated — stage=${contextManager.getActiveStage()}, pendingField=${contextManager.getPendingField()}`);
      } catch (err) {
        console.warn(`[agent]: Failed to update instructions mid-session:`, err);
      }
    };

    const generateTextOnlyReply = async (userMessage: string) => {
      await contextManager.onUserTurn(userMessage);
      updateSessionInstructions();
      metrics.startTurn();
      console.log(`[agent]: Text-only reply for "${userMessage}"...`);

      try {
        const systemPrompt = contextManager.getActiveInstructions();
        const chatMessages = contextManager.buildTextMessages(systemPrompt);

        // Ensure system prompt is always at index 0 and conversation history is sliced safely
        const systemMessage = chatMessages[0];
        const historyMessages = chatMessages.slice(1);
        const slicedHistory = historyMessages.slice(-23); // keep up to 23 recent turns
        const messages = [systemMessage, ...slicedHistory];

        console.log(`[agent]: Dispatching text-only reply to Cerebras client proxy...`);
        const completion = await cerebrasClient.chat.completions.create({
          model: 'gemma-4-31b',
          messages: messages as any,
          max_tokens: 500,
          temperature: 0.6,
        } as any);

        const reply = completion.choices?.[0]?.message?.content?.trim();

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

      if (messageText.startsWith('SYSTEM_CHANNEL_START')) {
        const targetMode = messageText.split(':')[1] || 'video';
        console.log(`[agent]: Channel started (${targetMode}).`);

        if (!isAvatarInitDone) {
          console.log(`[agent]: SYSTEM_CHANNEL_START received before avatar ready. Waiting for avatar initialization...`);
          await avatarReadyPromise;
          console.log(`[agent]: Avatar ready. Resuming deferred SYSTEM_CHANNEL_START handler.`);
        }

        if (greetingGenerated) {
          return;
        }

        greetingGenerated = true;
        const greetingText = "Hi! I am Ailana, an AI mortgage assistant. I can answer your mortgage questions, walk you through loan program information, and help you get started on the path to homeownership. What questions do you have for me today?";

        try {
          if (!(session as any)._started) {
            sessionStarted = true;
            await session.start({ agent: vadAgent, room: ctx.room });
            console.log(`[agent]: Session started on SYSTEM_CHANNEL_START.`);
          }

          // Always send SYSTEM_AGENT_READY signal to let the frontend hide the loading screen
          const readyPayload = new TextEncoder().encode(JSON.stringify({ message: "SYSTEM_AGENT_READY" }));
          await ctx.room.localParticipant?.publishData(readyPayload, { reliable: true, topic: "lk-chat" });
          console.log(`[agent]: Sent SYSTEM_AGENT_READY signal.`);

          metrics.startTurn();
          metrics.markAgentSpeaking();
          session.say(greetingText, { addToChatCtx: true });
          console.log(`[agent]: Greeting fired.`);
        } catch (err) {
          console.error(`[agent]: Failed to start session on SYSTEM_CHANNEL_START:`, err);
          greetingGenerated = false;
          sessionStarted = false;
        }
        return;
      }

      try {
        console.log(`[agent]: Generating reply for: "${messageText}"`);
        if (!(session as any)._started) {
          await session.start({ agent: vadAgent, room: ctx.room });
        }

        metrics.startTurn();
        metrics.markGenerateReply();

        if (voiceMuted) {
          await generateTextOnlyReply(messageText);
        } else {
          // For typed inputs in voice session, we run extraction and update instructions BEFORE calling generateReply
          await contextManager.onUserTurn(messageText);
          updateSessionInstructions();
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

    // Start the session the moment the user unmutes their microphone.
    // This aligns the audio pipeline clock (T=0) with the first real voice packet,
    // preventing the silence-prepend backlog caused by a clock gap.
    ctx.room.on(RoomEvent.TrackUnmuted, async (pub, participant) => {
      if (isHibernating) return;
      if (pub.kind !== TrackKind.KIND_AUDIO) return;
      if (!participant?.identity?.startsWith('guest_')) return;
      if (sessionStarted) return;

      if (!isAvatarInitDone) {
        console.log(`[agent]: User mic unmuted but avatar not ready yet. Waiting for avatar initialization before starting session...`);
        await avatarReadyPromise;
        console.log(`[agent]: Avatar ready. Proceeding with session start on mic unmute.`);
        if (sessionStarted) return;
      }

      sessionStarted = true;
      console.log(`[agent]: User mic unmuted (identity: ${participant?.identity}). Starting AgentSession now...`);
      try {
        await session.start({ agent: vadAgent, room: ctx.room });
        console.log(`[agent]: Realtime session started successfully.`);

        const readyPayload = new TextEncoder().encode(JSON.stringify({ message: "SYSTEM_AGENT_READY" }));
        await ctx.room.localParticipant?.publishData(readyPayload, { reliable: true, topic: "lk-chat" });
        console.log(`[agent]: Sent SYSTEM_AGENT_READY signal.`);

        // If the channel start signal already arrived while we were waiting, say greeting now
        const greetingText = "Hi! I am Ailana, an AI mortgage assistant. I can answer your mortgage questions, walk you through loan program information, and help you get started on the path to homeownership. What questions do you have for me today?";
        if (pendingGreeting && !greetingGenerated) {
          greetingGenerated = true;
          metrics.startTurn();
          metrics.markAgentSpeaking();
          session.say(greetingText, { addToChatCtx: true });
          console.log(`[agent]: Pending greeting fired after session start.`);
        }
      } catch (err) {
        console.error(`[agent]: Failed to start session on TrackUnmuted:`, err);
        sessionStarted = false;
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

    // ── LemonSlice Avatar Session ─────────────────────────────────────────
    // Start the avatar AFTER connecting so it can join the same room.
    // The avatar publishes its video/audio as a native LiveKit participant;
    // the frontend simply renders those tracks — no separate WebRTC session needed.
    const lsApiKey = ailanaConfig.lemonsliceApiKey;
    const lsAgentId = ailanaConfig.lemonsliceAgentId;
    console.log(`[avatar][${ts()}] LemonSlice credentials check: API Key ${lsApiKey ? 'PRESENT (len=' + lsApiKey.length + ', ends with ' + lsApiKey.slice(-4) + ')' : 'MISSING'}, Agent ID: ${lsAgentId || 'MISSING'}`);

    if (lsApiKey && lsAgentId) {
      // Quick LemonSlice API reachability test (non-blocking)
      (async () => {
        const t0 = Date.now();
        try {
          const resp = await fetch('https://api.lemon-slice.com/v1/agents', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${lsApiKey}` },
          });
          const dur = Date.now() - t0;
          console.log(`[avatar][${ts()}] LemonSlice API ping: HTTP ${resp.status} in ${dur}ms`);
        } catch (err: any) {
          console.error(`[avatar][${ts()}] LemonSlice API ping FAILED: ${err?.message ?? err}`);
        }
      })();

      // Set a backup timeout to ensure we don't block the agent forever if lemonslice fails to subscribe
      const backupTimeout = setTimeout(() => {
        if (!isAvatarInitDone) {
          console.warn(`[avatar][${ts()}] LemonSlice video track subscription timed out (30s). Proceeding to bypass.`);
          isAvatarInitDone = true;
          resolveAvatarReady();
        }
      }, 30000);

      const markReady = () => {
        if (isAvatarInitDone) return;
        console.log(`[avatar][${ts()}] LemonSlice video track is subscribed. Avatar is fully ready!`);
        clearTimeout(backupTimeout);
        isAvatarInitDone = true;
        resolveAvatarReady();
      };

      // Check if already connected and subscribed
      const checkExisting = () => {
        console.log(`[avatar][${ts()}] Checking existing remote participants. Count=${ctx.room.remoteParticipants.size}`);
        for (const p of ctx.room.remoteParticipants.values()) {
          console.log(`[avatar][${ts()}] Found remote participant: identity=${p.identity}`);
          if (p.identity.startsWith('lemonslice') || p.identity.includes('avatar')) {
            for (const pub of p.trackPublications.values()) {
              console.log(`[avatar][${ts()}] Remote participant track: identity=${p.identity}, kind=${pub.kind}, subscribed=${pub.subscribed}`);
              if (pub.kind === TrackKind.KIND_VIDEO && pub.subscribed) {
                markReady();
                return true;
              }
            }
          }
        }
        return false;
      };

      // Listen for participant connection events
      ctx.room.on(RoomEvent.ParticipantConnected, (participant: any) => {
        console.log(`[avatar][${ts()}] Participant Connected: identity=${participant?.identity}`);
      });

      // Listen for subscription events
      ctx.room.on(RoomEvent.TrackSubscribed, (track: any, pub: any, participant: any) => {
        console.log(`[avatar][${ts()}] TrackSubscribed event fired: identity=${participant?.identity}, kind=${pub.kind}, subscribed=${pub.subscribed}`);
        if (participant?.identity?.startsWith('lemonslice') || participant?.identity?.includes('avatar')) {
          console.log(`[avatar][${ts()}] LemonSlice participant track subscribed — kind=${pub.kind}`);
          if (pub.kind === TrackKind.KIND_VIDEO) {
            markReady();
          }
        }
      });

      try {
        // PRE-START the AgentSession BEFORE starting the AvatarSession.
        // This ensures the session pipeline is active, and prevents the SDK
        // from subsequently overwriting lemonslice's DataStreamAudioOutput back to SyncedAudioOutput.
        sessionStarted = true;
        console.log(`[avatar][${ts()}] Pre-starting AgentSession for LemonSlice...`);
        await session.start({ agent: vadAgent, room: ctx.room });
        console.log(`[avatar][${ts()}] AgentSession pre-started. Now starting AvatarSession...`);

        const avatarSession = new AvatarSession({
          agentId: lsAgentId,
          apiKey: lsApiKey,
        });
        const avatarStartT = Date.now();
        console.log(`[avatar][${ts()}] Calling avatarSession.start() with agentId=${lsAgentId} ...`);
        await avatarSession.start(session, ctx.room);
        console.log(`[avatar][${ts()}] avatarSession.start() resolved successfully in ${Date.now() - avatarStartT}ms`);
        console.log(`[avatar][${ts()}] Waiting for LemonSlice participant to publish video track...`);

        // When LemonSlice publishes its first audio track, record avatar-first-frame latency
        ctx.room.on(RoomEvent.TrackPublished, (pub: any, participant: any) => {
          console.log(`[avatar][${ts()}] TrackPublished event: identity=${participant?.identity}, kind=${pub.kind}`);
          if (participant?.identity?.startsWith('lemonslice') || participant?.identity?.includes('avatar')) {
            console.log(`[avatar][${ts()}] LemonSlice track published — kind=${pub.kind} source=${pub.source}`);
            metrics.markAvatarFirstFrame();
          }
        });

        // Trigger immediate check in case it subscribed during startup
        checkExisting();
      } catch (err: any) {
        console.error(`[avatar][${ts()}] FAILED to start LemonSlice AvatarSession:`, err);
        console.error(`[avatar][${ts()}]   Error message : ${err?.message ?? String(err)}`);
        console.error(`[avatar][${ts()}]   Error stack   : ${err?.stack ?? 'no stack'}`);
        console.error(`[avatar][${ts()}]   Error code    : ${err?.code ?? err?.status ?? 'n/a'}`);
        // Non-fatal — agent continues without avatar
        isAvatarInitDone = true;
        resolveAvatarReady();
        clearTimeout(backupTimeout);
      }
    } else {
      console.warn(`[avatar][${ts()}] LemonSlice credentials missing — avatar DISABLED.`);
      console.warn(`[avatar][${ts()}]   LEMONSLICE_API_KEY   : ${lsApiKey ? 'present' : 'MISSING'}`);
      console.warn(`[avatar][${ts()}]   LEMONSLICE_AGENT_ID  : ${lsAgentId ? lsAgentId : 'MISSING'}`);
      isAvatarInitDone = true;
      resolveAvatarReady();
    }

    // Measure connection latency to Cerebras API endpoint on start
    (async () => {
      const start = Date.now();
      try {
        const res = await fetch(`${ailanaConfig.cerebrasBaseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ailanaConfig.cerebrasApiKey}`
          },
          body: JSON.stringify({
            model: 'gemma-4-31b',
            messages: [{ role: 'user', content: 'ping' }],
            max_tokens: 1,
          })
        });
        const duration = Date.now() - start;
        console.log(`[latency-check][${ts()}] Cerebras API connection roundtrip test completed in ${duration}ms (HTTP Status: ${res.status})`);
      } catch (err: any) {
        const duration = Date.now() - start;
        console.warn(`[latency-check][${ts()}] Cerebras API connection test returned error after ${duration}ms: ${err?.message || err}`);
      }
    })();

    const activeModelName = 'cascade-livekit-inference (Cerebras GPT-OSS 120B + ElevenLabs + LemonSlice Avatar)';
    console.log(
      `[agent]: Ready — model=${activeModelName}, prompt=${ailanaConfig.promptVersion}, compact@${ailanaConfig.compactEveryNTurns} turns / ${ailanaConfig.forceCompactInputTokens} tokens`,
    );
  },
});

// Support both:
//   development:  tsx src/agent.ts dev   (process.argv[1] ends with agent.ts)
//   production:   node dist/agent.js dev (process.argv[1] ends with agent.js)
const _argv1 = process.argv[1] ?? '';
if (_argv1.endsWith('agent.ts') || _argv1.endsWith('agent.js')) {
  console.log(`[agent-cli] Starting LiveKit agent worker (argv1=${_argv1})...`);
  cli.runApp(
    new ServerOptions({
      agent: fileURLToPath(import.meta.url),
      initializeProcessTimeout: 60000,
    }),
  );
}

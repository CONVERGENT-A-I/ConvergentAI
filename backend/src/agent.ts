if (process.platform === 'win32') {
  const psPath = 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0';
  if (process.env.PATH && !process.env.PATH.includes(psPath)) {
    process.env.PATH = `${psPath};${process.env.PATH}`;
  }
}

import { type JobContext, ServerOptions, cli, voice, llm, inference } from '@livekit/agents';
import { RoomEvent, TrackKind } from '@livekit/rtc-node';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import * as openai from '@livekit/agents-plugin-openai';
import * as cartesia from '@livekit/agents-plugin-cartesia';
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
import { evaluateEmotion } from './utils/avatar-emotion-engine.js';
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
                console.log(`[cerebras-proxy][${ts()}] Stream complete (Total: ${totalDur}ms)`);
                console.log(`[cerebras-proxy][${ts()}] HTTP 200 full stream response (${accumulatedChunks.length} chunks):`, JSON.stringify(accumulatedChunks, null, 2));
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
        console.log(`[cerebras-proxy][${ts()}] HTTP 200 full response:`, JSON.stringify(result, null, 2));
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
  override chat(args: any) {
    args.extraKwargs = {
      ...args.extraKwargs,
      reasoning_effort: ailanaConfig.cerebrasReasoningEffort,
      reasoning_format: 'hidden',
    };
    return super.chat(args);
  }
}

class AilanaVoiceAgent extends voice.Agent {
  constructor(
    options: voice.AgentOptions<any>,
    private contextManager: SessionContextManager,
    private updateInstructions: () => void
  ) {
    super(options);
  }

  override async onUserTurnCompleted(chatCtx: any, userMessage: any): Promise<void> {
    console.log(`[agent-hook]: onUserTurnCompleted hook triggered with message: "${userMessage?.textContent}"`);

    this.contextManager.setLowConfidenceFlag(false);

    if (userMessage?.textContent) {
      // Race the extraction against a 600ms deadline.
      // If Cerebras is slow (high queue_time), we still release the hook
      // promptly so the main LLM can start generating without waiting for
      // the extractor. The extractor finishes async; instructions update
      // for the current turn if it wins, or next turn if it times out.
      const extractionDone = this.contextManager.onUserTurn(userMessage.textContent);
      const timeout = new Promise<void>(resolve => setTimeout(resolve, 600));
      await Promise.race([extractionDone, timeout]);
    }

    // Update original instructions in the session
    this.updateInstructions();

    // Update local mutable chatCtx copy to align the LLM prompt for the current generation
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
  }
}

dotenv.config();

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

export default {
  async entry(ctx: JobContext) {
    console.log(`[agent]: Receiving job for room: ${ctx.room.name}`);

    const metrics = new LatencyTracker();
    const summarizationLlm = new openai.LLM({
      model: 'llama3.1-8b',
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

    console.log(`[agent]: Loading Cartesia STT/TTS (ink-2 / sonic-3.5)...`);
    const sessionStt = new cartesia.STT({
      apiKey: ailanaConfig.cartesiaKey,
      model: 'ink-2',
    });

    const sessionTts = new cartesia.TTS({
      apiKey: ailanaConfig.cartesiaKey,
      voice: ailanaConfig.cartesiaVoiceId,
      model: 'sonic-3.5',
      // Streaming is on by default in the Cartesia plugin — audio chunks
      // are forwarded as soon as the first PCM frame arrives.
    });

    const createVadAgent = () => {
      console.log('[agent]: Creating Cascaded agent (Cerebras LLM + Cartesia STT/TTS)...');
      return new AilanaVoiceAgent({
        instructions: contextManager.getActiveInstructions(),
        stt: sessionStt,
        vad: sessionVad,
        llm: new CerebrasLLM({
          model: 'gpt-oss-120b',
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

    // Emotion tracking state
    let emotionEvalInterval: NodeJS.Timeout | null = null;
    let lastBroadcastedEmotion = 'happy';

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

          // Avatar emotion: Start polling the streaming LLM text to react mid-sentence
          if (emotionEvalInterval) clearInterval(emotionEvalInterval);
          emotionEvalInterval = setInterval(() => {
            try {
              const items = session.chatCtx?.items || [];
              const lastAssistantItem = items.slice().reverse().find(
                (i): i is llm.ChatMessage => i.type === 'message' && i.role === 'assistant'
              );
              if (lastAssistantItem?.textContent) {
                const emotion = evaluateEmotion(lastAssistantItem.textContent);
                if (emotion !== lastBroadcastedEmotion) {
                  lastBroadcastedEmotion = emotion;
                  const emotionPayload = new TextEncoder().encode(JSON.stringify({
                    type: 'AVATAR_EMOTION',
                    emotion,
                  }));
                  ctx.room.localParticipant?.publishData(emotionPayload, {
                    reliable: true,
                    topic: 'avatar_emotion',
                  });
                  console.log(`[agent-debug]: Avatar emotion → ${emotion} (mid-stream)`);
                }
              }
            } catch (e) {
              // Ignore polling errors
            }
          }, 500);
        } else {
          // If not speaking (e.g. listening, thinking, idle), stop polling
          if (emotionEvalInterval) {
            clearInterval(emotionEvalInterval);
            emotionEvalInterval = null;
          }
        }

        if (newState === 'listening' && (session as any)._started && !voiceMuted && !isHibernating) {
          backchannelEngine.reset();
          prepareContext().catch(err => console.error('[agent-error]: Idle prepareContext failed:', err));

          // Avatar emotion: return to happy resting face when idle
          try {
            if (lastBroadcastedEmotion !== 'happy') {
              lastBroadcastedEmotion = 'happy';
              const happyPayload = new TextEncoder().encode(JSON.stringify({
                type: 'AVATAR_EMOTION',
                emotion: 'happy',
              }));
              ctx.room.localParticipant?.publishData(happyPayload, {
                reliable: true,
                topic: 'avatar_emotion',
              });
              console.log(`[agent-debug]: Avatar emotion → happy (idle)`);
            }
          } catch (e) {
            // Non-critical — don't break agent flow
          }
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
          model: 'gpt-oss-120b',
          messages: messages as any,
          max_tokens: 500,
          temperature: 0.6,
          reasoning_effort: ailanaConfig.cerebrasReasoningEffort,
          reasoning_format: 'hidden',
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

        if (greetingGenerated) {
          console.log(`[agent]: Greeting already generated. Ignoring duplicate start signal.`);
          return;
        }

        greetingGenerated = true;
        const greetingText = "Hi! I am Ailana, an AI mortgage assistant. I can answer your mortgage questions, walk you through loan program information, and help you get started on the path to homeownership. What questions do you have for me today?";

        try {
          if (!(session as any)._started) {
            sessionStarted = true;
            await session.start({ agent: vadAgent, room: ctx.room });
            console.log(`[agent]: Session started on SYSTEM_CHANNEL_START.`);

            const readyPayload = new TextEncoder().encode(JSON.stringify({ message: "SYSTEM_AGENT_READY" }));
            await ctx.room.localParticipant?.publishData(readyPayload, { reliable: true, topic: "lk-chat" });
            console.log(`[agent]: Sent SYSTEM_AGENT_READY signal.`);
          }

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
            model: 'gpt-oss-120b',
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

    const activeModelName = 'cascade-livekit-inference (Cerebras GPT-OSS 120B + Cartesia)';
    console.log(
      `[agent]: Ready — model=${activeModelName}, prompt=${ailanaConfig.promptVersion}, compact@${ailanaConfig.compactEveryNTurns} turns / ${ailanaConfig.forceCompactInputTokens} tokens`,
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

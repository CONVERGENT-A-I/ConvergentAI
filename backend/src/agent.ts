import { type JobContext, ServerOptions, cli, voice, llm, inference } from '@livekit/agents';
import { RoomEvent } from '@livekit/rtc-node';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import * as openai from '@livekit/agents-plugin-openai';
import * as cartesia from '@livekit/agents-plugin-cartesia';
import { ailanaConfig, getDynamicGroqApiKey } from './config/ailana-config.js';
import { SessionContextManager } from './context/session-context-manager.js';
import { LatencyTracker } from './metrics/latency-tracker.js';
import {
  buildBaseInstructions,
  buildVoiceInstructions,
  GREETING_USER_INPUT,
  RESUME_USER_INPUT,
} from './prompts/index.js';
import { logPromptBudget } from './context/context-budget.js';
import { evaluateEmotion } from './utils/avatar-emotion-engine.js';
import { BackchannelEngine } from './utils/backchannel-engine.js';

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
    if (userMessage?.textContent) {
      await this.contextManager.onUserTurn(userMessage.textContent);
    }
    
    // Update original instructions in the session
    this.updateInstructions();

    // Update local mutable chatCtx copy to align the LLM prompt for the current generation
    const activeInstructions = this.contextManager.getActiveInstructions();
    const systemItem = chatCtx.items.find(
      (item: any) => item.type === 'message' && item.role === 'system'
    );
    if (systemItem) {
      systemItem.content = [activeInstructions];
      console.log(`[agent-hook]: Local mutable chatCtx system instructions updated.`);
    } else {
      chatCtx.items.unshift(new llm.ChatMessage({
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

    const sessionGroqApiKey = getDynamicGroqApiKey() || ailanaConfig.groqApiKey;

    const metrics = new LatencyTracker();
    const summarizationLlm = new openai.LLM({
      model: 'llama-3.3-70b-versatile',
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: sessionGroqApiKey,
    });
    const contextManager = new SessionContextManager(summarizationLlm, metrics);

    console.log(`[agent]: Loading VAD (minSilence=${ailanaConfig.vadMinSilenceMs}ms)...`);
    const sessionVad = new inference.VAD({
      model: 'silero',
      minSilenceDuration: ailanaConfig.vadMinSilenceMs,
      prefixPaddingDuration: 200,
    });

    const createVadAgent = () => {
      console.log('[agent]: Creating Cascaded agent (Groq LLM + Cartesia STT/TTS)...');
      return new AilanaVoiceAgent({
        instructions: contextManager.getActiveInstructions(),
        stt: new cartesia.STT({
          apiKey: ailanaConfig.cartesiaKey,
          model: 'ink-2',
        }),
        vad: sessionVad,
        llm: new openai.LLM({
          model: 'llama-3.3-70b-versatile',
          baseURL: 'https://api.groq.com/openai/v1',
          apiKey: sessionGroqApiKey,
        }),
        tts: new cartesia.TTS({
          apiKey: ailanaConfig.cartesiaKey,
          voice: ailanaConfig.cartesiaVoiceId,
          model: 'sonic-3.5',
        }),
        turnHandling: {
          turnDetection: 'stt' as const,
          endpointing: {
            minDelay: ailanaConfig.vadEndpointMinDelayMs,
          },
          interruption: {
            minDuration: ailanaConfig.vadInterruptMinDurationMs,
            mode: 'vad' as const,
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

    const session = new voice.AgentSession({
      userAwayTimeout: null,
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

    session.on(voice.AgentSessionEventTypes.UserInputTranscribed, async (ev: any) => {
      if (!ev.isFinal) {
        return;
      }
      if (!ev.transcript?.trim()) return;
      
      console.log(`[agent-debug]: User input transcribed (isFinal=true): "${ev.transcript}"`);
      backchannelEngine.reset();
      metrics.markUserTurnEnd();
      metrics.startTurn();
    });

    session.on(voice.AgentSessionEventTypes.ConversationItemAdded, (ev: any) => {
      const item = ev.item as llm.ChatMessage;
      console.log(`[agent-debug]: Conversation item added: role=${item?.role}, content="${item?.textContent}"`);
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
      } else if (m?.type === 'llm_metrics') {
        metrics.recordRealtimeMetrics(m.ttftMs ?? -1, m.promptTokens ?? 0);
        contextManager.onRealtimeInputTokens(m.promptTokens ?? 0);
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
        const apiKey = sessionGroqApiKey;
        if (!apiKey) return;

        const systemPrompt = contextManager.getActiveInstructions();
        const chatMessages = contextManager.buildTextMessages(systemPrompt);
        
        // Ensure system prompt is always at index 0 and conversation history is sliced safely
        const systemMessage = chatMessages[0];
        const historyMessages = chatMessages.slice(1);
        const slicedHistory = historyMessages.slice(-23); // keep up to 23 recent turns
        const messages = [systemMessage, ...slicedHistory, { role: 'user', content: userMessage }];

        const baseURL = 'https://api.groq.com/openai/v1';
        const modelName = 'llama-3.3-70b-versatile';

        const res = await fetch(`${baseURL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: modelName,
            messages: messages,
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

      if (messageText.startsWith('SYSTEM_CHANNEL_START')) {
        const targetMode = messageText.split(':')[1] || 'video';
        console.log(`[agent]: Channel started (${targetMode}).`);

        if (greetingGenerated) {
          console.log(`[agent]: Greeting already generated. Ignoring duplicate start signal.`);
          return;
        }

        greetingGenerated = true;

        const greetingText = "Hi, my name is Ailana and I am an AI mortgage assistant who can respond to all of your mortgage questions and provide other services. What questions do you have for me today?";

        if ((session as any)._started) {
          console.log(`[agent]: Session already started. Generating greeting now...`);
          metrics.startTurn();
          metrics.markAgentSpeaking();
          session.say(greetingText, { addToChatCtx: true });
          return;
        }

        try {
          await session.start({ agent: vadAgent, room: ctx.room });
          console.log(`[agent]: Realtime session started. Mode ${targetMode} ready.`);

          metrics.startTurn();
          metrics.markAgentSpeaking();
          session.say(greetingText, { addToChatCtx: true });
        } catch (err) {
          console.error(`[agent]: Failed to start session:`, err);
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

    // Pre-start the session so WebRTC audio tracks are established
    // before the client sends SYSTEM_CHANNEL_START. This minimizes greeting latency.
    try {
      console.log(`[agent]: Pre-starting session on connect...`);
      await session.start({ agent: vadAgent, room: ctx.room });
      console.log(`[agent]: Realtime session pre-started successfully.`);

      // Send SYSTEM_AGENT_READY to the client so it knows the session is fully start-completed
      const readyPayload = new TextEncoder().encode(JSON.stringify({ message: "SYSTEM_AGENT_READY" }));
      await ctx.room.localParticipant?.publishData(readyPayload, {
        reliable: true,
        topic: "lk-chat",
      });
      console.log(`[agent]: Sent SYSTEM_AGENT_READY signal.`);
    } catch (err) {
      console.error(`[agent]: Failed to pre-start session on connect:`, err);
    }

    const activeModelName = 'cascade-livekit-inference (Llama-3.3-70b + Cartesia)';
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

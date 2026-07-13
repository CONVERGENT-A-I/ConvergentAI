function envInt(key: string, fallback: number): number {
  const raw = process.env[key];
  if (!raw) return fallback;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : fallback;
}

export const ailanaConfig = {
  realtimeModel: process.env.REALTIME_MODEL ?? 'gpt-realtime-mini',
  realtimeVoice: process.env.REALTIME_VOICE ?? 'coral',
  summarizationModel: process.env.SUMMARIZATION_MODEL ?? 'gpt-4o-mini',
  textModel: process.env.TEXT_MODEL ?? 'gpt-4o-mini',
  promptVersion: process.env.PROMPT_VERSION ?? 'mvp-1',

  /** Compaction triggers — tuned for latency, not just 32k limit */
  compactEveryNTurns: envInt('AILANA_COMPACT_EVERY_N_TURNS', 6),
  compactEveryMs: envInt('AILANA_COMPACT_EVERY_MS', 3 * 60 * 1000),
  keepRecentTurns: envInt('AILANA_KEEP_RECENT_TURNS', 4),
  rotateSessionMs: envInt('AILANA_ROTATE_SESSION_MS', 10 * 60 * 1000),
  rotateEveryNTurns: envInt('AILANA_ROTATE_EVERY_N_TURNS', 20),

  /** Force compact when Realtime reports input tokens above this (latency-safe threshold) */
  forceCompactInputTokens: envInt('AILANA_FORCE_COMPACT_INPUT_TOKENS', 6000),

  vadMinSilenceMs: envInt('AILANA_VAD_MIN_SILENCE_MS', 400),
  vadEndpointMinDelayMs: envInt('AILANA_VAD_ENDPOINT_MIN_DELAY_MS', 350),
  vadInterruptMinDurationMs: envInt('AILANA_VAD_INTERRUPT_MIN_DURATION_MS', 500),
  vadInterruptMinWords: envInt('AILANA_VAD_INTERRUPT_MIN_WORDS', 1),

  get groqApiKey() { return process.env.GROQ_API_KEY ?? ''; },
  get openaiApiKey() { return process.env.OPENAI_API_KEY ?? ''; },
  get cartesiaKey() { return process.env.CARTESIA_KEY ?? ''; },
  get cartesiaVoiceId() { return process.env.AILANA_VOICE_ID ?? 'db6b0ed5-d5d3-463d-ae85-518a07d3c2b4'; },
  get elevenlabsApiKey() { return process.env.ELEVENLABS_API_KEY ?? ''; },
  get elevenlabsVoiceId() { return process.env.ELEVENLABS_VOICE_ID ?? 'EST9Ui6982FZPSi7gCHi'; },
  get lemonsliceApiKey() { return process.env.LEMONSLICE_API_KEY ?? ''; },
  get lemonsliceAgentId() { return process.env.LEMONSLICE_AGENT_ID ?? ''; },
  get cerebrasApiKey() { return process.env.CEREBRAS_API_KEY ?? ''; },
  cerebrasBaseUrl: 'https://api.cerebras.ai/v1',
  cerebrasReasoningEffort: process.env.CEREBRAS_REASONING_EFFORT ?? 'low',
};

export function getDynamicGroqApiKey(): string {
  const raw = process.env.GROQ_API_KEY ?? '';
  const keys = raw.split(',').map(k => k.trim()).filter(Boolean);
  if (keys.length === 0) return '';
  const randomIndex = Math.floor(Math.random() * keys.length);
  const selectedKey = keys[randomIndex] ?? '';
  console.log(`[config]: Selected rotated Groq API key ending in: ...${selectedKey.slice(-4)}`);
  return selectedKey;
}


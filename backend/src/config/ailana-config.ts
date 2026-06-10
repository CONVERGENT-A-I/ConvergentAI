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
  promptVersion: process.env.PROMPT_VERSION ?? 'v2',
  compactEveryNTurns: envInt('AILANA_COMPACT_EVERY_N_TURNS', 8),
  compactEveryMs: envInt('AILANA_COMPACT_EVERY_MS', 4 * 60 * 1000),
  keepRecentTurns: envInt('AILANA_KEEP_RECENT_TURNS', 6),
  rotateSessionMs: envInt('AILANA_ROTATE_SESSION_MS', 12 * 60 * 1000),
  rotateEveryNTurns: envInt('AILANA_ROTATE_EVERY_N_TURNS', 25),
  vadMinSilenceMs: envInt('AILANA_VAD_MIN_SILENCE_MS', 200),
  vadEndpointMinDelayMs: envInt('AILANA_VAD_ENDPOINT_MIN_DELAY_MS', 200),
};

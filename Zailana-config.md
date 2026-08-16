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
  // \u26a0 NOT REMOVED, kept only in case any other file still references it.
  // The main conversational LLM, summarization LLM, text-only-reply path, and
  // the background field-extractor (context/llm-extractor.ts) now all route
  // through the self-hosted vLLM block below instead.
  get cerebrasApiKey() { return process.env.CEREBRAS_API_KEY ?? ''; },
  // Optional dedicated key for the background extractor (separate Cerebras account = zero queue contention).
  // Falls back to the main key if not set \u2014 still benefits from separate GPU cluster via different model.
  get cerebrasExtractorApiKey() { return process.env.CEREBRAS_EXTRACTOR_API_KEY ?? process.env.CEREBRAS_API_KEY ?? ''; },
  cerebrasBaseUrl: 'https://api.cerebras.ai/v1',
  cerebrasReasoningEffort: process.env.CEREBRAS_REASONING_EFFORT ?? 'low',

  // \u2500\u2500 Self-hosted GKE+A100 vLLM (Gemma 4 26B-MoE) \u2500\u2500 SOLE provider for the
  // main conversational LLM + summarization + text-only-reply path (agent.ts)
  // AND the background field-extractor (context/llm-extractor.ts). No more
  // provider toggle \u2014 always points at these env vars.
  // In-cluster DNS name of the vLLM Service (see gemma4-vllm manifests), or
  // the GKE Inference Gateway address if routing through InferencePool.
  // MUST include scheme + port + the OpenAI-compatible /v1 path.
  get vllmBaseUrl() { return process.env.VLLM_BASE_URL ?? 'http://gemma4-vllm.cta-dev.svc.cluster.local:8000/v1'; },
  // vLLM's OpenAI-compatible server does not check this by default (no auth
  // configured in the pilot manifests), but the OpenAI SDK requires a
  // non-empty string to construct the client.
  get vllmApiKey() { return process.env.VLLM_API_KEY ?? 'not-needed'; },
  // Must match the --served-model-name the vLLM Deployment/StatefulSet was
  // launched with (see 10-gemma4-vllm.yaml).
  get vllmModel() { return process.env.VLLM_MODEL ?? 'gemma-4-26b-moe'; },
  get vllmLabel(): string { return `Self-hosted GKE+A100 vLLM (${this.vllmModel})`; },

  /** Affordability Panel Calculation & Rate Configuration */
  representativeRate: parseFloat(process.env.REPRESENTATIVE_RATE ?? '0.06875'),
  representativeRateType: process.env.REPRESENTATIVE_RATE_TYPE ?? '30-year fixed conventional',
  incomeBandThreshold: parseFloat(process.env.INCOME_BAND_THRESHOLD ?? '0.28'),
  dtiBandThreshold: parseFloat(process.env.DTI_BAND_THRESHOLD ?? '0.45'),
  dtiHardCeiling: parseFloat(process.env.DTI_HARD_CEILING ?? '0.50'),
  propertyTaxRate: parseFloat(process.env.PROPERTY_TAX_RATE ?? '0.012'),
  homeownersInsRate: parseFloat(process.env.HOMEOWNERS_INS_RATE ?? '0.005'),
  conventionalPmiRate: parseFloat(process.env.CONVENTIONAL_PMI_RATE ?? '0.0085'),
  fhaMipRate: parseFloat(process.env.FHA_MIP_RATE ?? '0.0055'),
  usdaAnnualFeeRate: parseFloat(process.env.USDA_ANNUAL_FEE_RATE ?? '0.0035'),
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


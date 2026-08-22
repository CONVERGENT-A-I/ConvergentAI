import { ailanaConfig } from "../config/ailana-config.js";

/** gpt-realtime-mini hard limit (input). Latency degrades well before this. */
export const REALTIME_CONTEXT_LIMIT = 32_000;

/** Target max input tokens per turn before forcing compaction (latency-safe, not limit-safe). */
export function getForceCompactTokenThreshold(): number {
  return ailanaConfig.forceCompactInputTokens;
}

export function estimateTokensFromText(text: string): number {
  return Math.ceil(text.length / 4);
}

export function logPromptBudget(label: string, instructions: string): void {
  const tokens = estimateTokensFromText(instructions);
  const pctOfLimit = ((tokens / REALTIME_CONTEXT_LIMIT) * 100).toFixed(1);
  console.log(
    JSON.stringify({
      type: "ailana-context-budget",
      event: "prompt_size",
      label,
      estimatedTokens: tokens,
      contextLimit: REALTIME_CONTEXT_LIMIT,
      pctOfLimit: `${pctOfLimit}%`,
      forceCompactThreshold: getForceCompactTokenThreshold(),
    }),
  );
}

export function logContextBudget(details: {
  inputTokens?: number;
  estimatedTextTokens?: number;
  itemCount?: number;
  action?: string;
}): void {
  const input = details.inputTokens ?? details.estimatedTextTokens ?? 0;
  const overLatencyThreshold = input >= getForceCompactTokenThreshold();
  const nearHardLimit = input >= REALTIME_CONTEXT_LIMIT * 0.85;

  console.log(
    JSON.stringify({
      type: "ailana-context-budget",
      event: "session_context",
      inputTokens: details.inputTokens ?? null,
      estimatedTextTokens: details.estimatedTextTokens ?? null,
      itemCount: details.itemCount ?? null,
      action: details.action ?? null,
      forceCompactThreshold: getForceCompactTokenThreshold(),
      overLatencyThreshold,
      nearHardLimit,
    }),
  );
}

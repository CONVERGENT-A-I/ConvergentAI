/**
 * Avatar Emotion Engine
 *
 * Analyzes LLM output text and maps it to one of the Keyframes SDK's
 * supported emotions: 'neutral' | 'happy' | 'sad'.
 *
 * We intentionally exclude 'angry' — it's inappropriate for a mortgage
 * lending AI assistant.
 *
 * The evaluation uses simple keyword-pattern matching against the
 * agent's response text. This is lightweight (sub-millisecond) and runs
 * inline with the conversation pipeline — no external API calls needed.
 */

export type KeyframesEmotion = 'neutral' | 'happy';

// ── Pattern banks ──────────────────────────────────────────────────────────
// These are tuned to match Ailana's actual conversational style as a warm,
// knowledgeable mortgage advisor — not generic sentiment analysis.

/** Greeting & warmth: friendly opener energy, acknowledgments, light positivity */
const WARMTH_PATTERN =
  /\b(hi |hey |hello|welcome|glad|nice to meet|good to hear|happy to help|here to help|i'm ailana|how can i help|what can i help|let me help|i can help|thank you|thanks for|i appreciate|no problem|of course|absolutely|sure thing|you bet|my pleasure|sounds good|sounds great|love to)\b/i;

/** Success / affirmation: milestone reached, positive outcomes, confirmation */
const SUCCESS_PATTERN =
  /\b(success|perfect|great|excellent|wonderful|fantastic|awesome|amazing|terrific|beautiful|brilliant|impressive|solid picture|good news|well done|all set|locked in|approved|confirmed|completed|congratulations|way to go|nicely done|that works|you're all set|got it|noted)\b/i;

/** Empathy / concern: acknowledging difficulty, showing care */
const EMPATHY_PATTERN =
  /\b(understand|i hear you|sorry to hear|unfortunately|i'm sorry|difficult|complex|complicated|challenging|tough|hardship|struggle|concern|worried|worry|stressful|frustrating|overwhelming|that's a lot|no rush|take your time|at your own pace|patience|hang in there)\b/i;

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Evaluate the emotional tone of the agent's response text and return
 * the appropriate Keyframes emotion state.
 *
 * Priority order:
 * Priority order:
 *   1. Empathy / concern → 'neutral'  (calm, serious expression)
 *   2. Warmth / greeting → 'happy'  (friendly smile)
 *   3. Success / affirmation → 'happy'  (warm smile)
 *   4. Default → 'happy'  (natural resting face — smiling)
 */
export function evaluateEmotion(text: string): KeyframesEmotion {
  const lower = text.toLowerCase();

  // Empathy triggers take priority — we never want the avatar smiling
  // while discussing financial hardship or complexity.
  if (EMPATHY_PATTERN.test(lower)) {
    return 'neutral';
  }

  // Warmth & greeting triggers — friendly, approachable smile
  if (WARMTH_PATTERN.test(lower)) {
    return 'happy';
  }

  // Success / confirmation triggers
  if (SUCCESS_PATTERN.test(lower)) {
    return 'happy';
  }

  // Default: friendly smile
  return 'happy';
}

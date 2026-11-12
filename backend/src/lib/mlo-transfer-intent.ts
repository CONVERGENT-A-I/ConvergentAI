/** Normalize a ZIP spoken as digits or words, only in MLO transfer context. */
export function normalizeSpokenZip(text: string | null | undefined): string | null {
  if (!text) return null;
  const direct = text.match(/\b(\d{5})(?:-\d{4})?\b/)?.[1];
  if (direct) return direct;
  const digitWords: Record<string, string> = {
    zero: '0', oh: '0', o: '0', one: '1', won: '1', two: '2', to: '2', too: '2',
    three: '3', tree: '3', four: '4', for: '4', five: '5', fife: '5', six: '6',
    seven: '7', eight: '8', ate: '8', eye: '8', i: '8', a: '8', nine: '9', niner: '9',
  };
  const tokens = text.toLowerCase().match(/[a-z]+|\d/g) || [];
  const candidates: string[] = [];
  for (const token of tokens) {
    if (/^\d$/.test(token)) candidates.push(token);
    else if (digitWords[token] !== undefined) candidates.push(digitWords[token]);
    else if (candidates.length > 0 && candidates.length < 5) candidates.length = 0;
    if (candidates.length === 5) return candidates.join('');
  }
  return null;
}

export function isLoanOfficerTransferIntent(text: string | null | undefined): boolean {
  if (!text) return false;
  const normalized = text.toLowerCase().replace(/[^a-z0-9\s'-]/g, ' ');
  const action = /\b(connect|transfer|forward|speak|talk|call|reach|reconnect|send me)\b/.test(normalized);
  const loanRole = /\b(?:loan|mortgage|mobile loan|line)\s+(?:officer|official|representative|agent)\b/.test(normalized)
    || /\blicensed\s+(?:loan\s+|mortgage\s+|mobile\s+loan\s+|line\s+)?(?:officer|official|representative|agent)\b/.test(normalized);
  const humanRole = /\b(?:human|live)\s+(?:representative|agent|officer)\b/.test(normalized);
  return action && (loanRole || humanRole);
}

/**
 * A short confirmation is only a transfer request when the conversation is
 * already waiting for the borrower to choose the post-review handoff. Keeping
 * the context flag explicit prevents a generic "yes" elsewhere in prequal from
 * accidentally dialing a queue.
 */
export function isContextualLoanOfficerTransferConfirmation(
  text: string | null | undefined,
  awaitingLoanOfficerChoice: boolean,
): boolean {
  if (!awaitingLoanOfficerChoice || !text) return false;
  const normalized = text.toLowerCase().replace(/[^a-z0-9\s'-]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!normalized) return false;

  const declines = /\b(?:no|nope|not now|later|schedule|callback|call back|never mind|nevermind|cancel|don't|do not)\b/.test(normalized);
  if (declines) return false;

  // STT may combine a confirmation repeated while the avatar is finishing its
  // question ("Yes. Yes." / "Yeah, sure"). Accept a sequence made entirely of
  // affirmative words while this tightly-scoped handoff context is active.
  const affirmativeTokens = normalized.split(' ');
  const affirmativeVocabulary = new Set([
    'oh', 'yeah', 'yes', 'yep', 'sure', 'okay', 'ok', 'please',
    'absolutely', 'certainly', 'go', 'ahead', 'do', 'it', 'now',
  ]);
  const affirmative = affirmativeTokens.length <= 8
    && affirmativeTokens.some((token) => ['yeah', 'yes', 'yep', 'sure', 'okay', 'ok', 'please', 'absolutely', 'certainly'].includes(token))
    && affirmativeTokens.every((token) => affirmativeVocabulary.has(token));
  const contextualAction = /\b(?:please\s+)?(?:connect|reconnect|transfer|forward)(?:\s+me)?(?:\s+(?:right\s+)?now)?\b/.test(normalized)
    || /\b(?:i(?:'d| would)?\s+like\s+to\s+be|let\s+me\s+be|can\s+i\s+be|could\s+i\s+be)\s+(?:connected|transferred|forwarded)(?:\s+(?:right\s+)?now)?\b/.test(normalized)
    || /\b(?:get|put)\s+me\s+(?:connected|through)(?:\s+(?:right\s+)?now)?\b/.test(normalized);
  return affirmative || contextualAction;
}

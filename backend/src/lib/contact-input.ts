const SPOKEN_DIGITS: Record<string, string> = {
  zero: '0', oh: '0', o: '0',
  one: '1', won: '1',
  two: '2', to: '2', too: '2',
  three: '3', tree: '3',
  four: '4', for: '4',
  five: '5', fife: '5',
  six: '6',
  seven: '7',
  eight: '8', ate: '8',
  nine: '9', niner: '9',
};

/**
 * Extract only a deliberate spoken/digit phone sequence. Incidental numbers in
 * ordinary sentences are ignored unless the customer explicitly says phone or
 * mobile. The pending contact_mobile state may opt into digit-only fragments.
 */
export function extractSpokenPhoneDigits(
  text: string | null | undefined,
  awaitingMobile = false,
): string | null {
  if (!text) return null;
  const normalized = text.toLowerCase();
  const hasPhoneContext = /\b(?:phone|mobile|cell|telephone|number)\b/.test(normalized);
  const tokens = normalized.match(/[a-z]+|\d+/g) || [];
  const digits: string[] = [];

  for (const token of tokens) {
    if (/^\d+$/.test(token)) {
      digits.push(token);
    } else if (SPOKEN_DIGITS[token] !== undefined) {
      digits.push(SPOKEN_DIGITS[token]);
    }
  }

  const value = digits.join('');
  if (!value) return null;
  if (!awaitingMobile && !hasPhoneContext) return null;
  return value;
}

export function appendPhoneFragment(
  existing: string | null | undefined,
  fragment: string | null | undefined,
): { buffer: string; complete: string | null; overflow: boolean } {
  const previous = String(existing || '').replace(/\D/g, '');
  const next = String(fragment || '').replace(/\D/g, '');
  const buffer = `${previous}${next}`;

  if (buffer.length > 15) {
    return { buffer: next.slice(0, 15), complete: null, overflow: true };
  }
  if (buffer.length >= 10) {
    return { buffer, complete: buffer, overflow: false };
  }
  return { buffer, complete: null, overflow: false };
}

/**
 * Deterministic fallback for a literal email address in the utterance
 * (typed chat, or STT that already produced an "@"). Spoken forms such as
 * "john at gmail dot com" are left to the LLM extractor.
 */
export function extractEmailFromText(text: string | null | undefined): string | null {
  if (!text) return null;
  const match = text.match(/[a-zA-Z0-9_%+-]+(?:\.\s*[a-zA-Z0-9_%+-]+)*\s*@\s*[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}/);
  return match ? match[0].replace(/\s+/g, '').toLowerCase() : null;
}

/**
 * Validates a mobile number that the borrower volunteered on the email turn
 * (where we did NOT ask for it). Only accepts a full 10–15 digit number, and
 * rejects digits that merely come from the email itself (e.g. "david123@gmail.com").
 */
export function acceptVolunteeredMobile(
  mobile: string | null | undefined,
  email: string | null | undefined,
): string | null {
  const digits = String(mobile || '').replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15) return null;
  const emailDigits = String(email || '').replace(/\D/g, '');
  if (emailDigits && emailDigits.includes(digits)) return null;
  return digits;
}

/**
 * Returns true when a captured mobile number is complete enough to advance
 * (10–15 digits). Shorter values are held in a buffer for the next fragment.
 */
export function isCompleteMobile(mobile: string | null | undefined): boolean {
  const digits = String(mobile || '').replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

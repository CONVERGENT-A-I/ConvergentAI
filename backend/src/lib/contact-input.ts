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

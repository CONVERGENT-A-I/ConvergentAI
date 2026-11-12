/**
 * Section 0 — pre-model compliance safety net (plan §6.7).
 *
 * Catches a volunteered SSN or subject-property street address BEFORE the text
 * reaches the LLM, the extractor, the transcript, the chat panel or the database,
 * and replaces it with [REDACTED]. The matched text is never returned or logged.
 *
 * This is the ONLY pattern matching on raw phrasing in Section 0 — a safety net,
 * not intent detection.
 */

export interface SafetyNetResult {
  /** Input with every SSN / street address replaced by [REDACTED]. */
  text: string;
  ssn: boolean;
  address: boolean;
}

export const REDACTED = '[REDACTED]';

// ── SSN ──────────────────────────────────────────────────────────────────────

/** Formatted SSN: 412-55-6789, 412 55 6789, 412.55.6789 */
const SSN_FORMATTED = /\b\d{3}[-.\s]\d{2}[-.\s]\d{4}\b/g;

/**
 * Words that announce an SSN is coming: "SSN", "social security number", "my social…".
 * Plain "Social Security" is income ("I get 2,400 Social Security") — not a trigger,
 * and neither is "my social security income/benefits/check".
 */
const SSN_TRIGGER = /\b(?:ssn|social\s+security\s+(?:number|no\.?|#)|(?:my|the|your|his|her)\s+social(?!\s+security\s+(?:income|benefits?|checks?|payments?|disability))(?:\s+security)?)\b/i;

const DIGIT_WORDS = '(?:zero|oh|one|two|three|four|five|six|seven|eight|nine)';
/**
 * A run of digits spoken or typed after a trigger: "412556789", "4-1-2…", "4 1 2",
 * "four one two, five five…". Needs at least 3 digits/digit-words.
 */
const DIGIT_RUN = new RegExp(
  `(?:(?:\\d|${DIGIT_WORDS})(?:[\\s,.-]|and\\s)*){3,}(?:\\.{3}|…)?`,
  'gi',
);

function redactSsn(text: string): { text: string; found: boolean } {
  let found = false;
  let out = text.replace(SSN_FORMATTED, () => { found = true; return REDACTED; });

  // Digits shortly after an SSN trigger word ("my social so you can run me, it's 4-1-2...").
  const trigger = SSN_TRIGGER.exec(out);
  if (trigger) {
    const start = trigger.index + trigger[0].length;
    const window = out.slice(start, start + 90);
    DIGIT_RUN.lastIndex = 0;
    const run = DIGIT_RUN.exec(window);
    if (run && run.index <= 40) {
      const runText = run[0].trim();
      const after = window.slice(run.index + run[0].length);
      const digitCount = (runText.match(/\d|zero|oh|one|two|three|four|five|six|seven|eight|nine/gi) ?? []).length;
      const looksLikeMoney =
        /^\$?\d{1,3}(?:,\d{3})+(?:\.\d+)?[.,]?$/.test(runText) ||
        /^\s*(?:a\s+|per\s+|\/\s*)?(?:month|year|week|mo\b|yr\b)|^\s*dollars/i.test(after);
      const cutOff = /(?:\.{3}|…)$/.test(runText) || after.trim() === '';
      if (!looksLikeMoney && (digitCount >= 7 || (digitCount >= 3 && cutOff))) {
        found = true;
        out = out.slice(0, start + run.index) + ` ${REDACTED} ` + out.slice(start + run.index + run[0].length);
      }
    }
  }
  return { text: out.replace(/\s{2,}/g, ' ').trim(), found };
}

// ── Street address ───────────────────────────────────────────────────────────

/** Street types that are unambiguous as words (safe in any letter case). */
const FULL_TYPES = [
  'street', 'drive', 'road', 'avenue', 'lane', 'court', 'boulevard', 'circle', 'place',
  'parkway', 'highway', 'terrace', 'trail', 'pike',
];
/** Short / ambiguous types — only count when the street name before them is Capitalised. */
const SHORT_TYPES = ['st', 'dr', 'rd', 'ave', 'ln', 'ct', 'blvd', 'cir', 'pl', 'pkwy', 'hwy', 'ter', 'trl', 'way'];

/** Words right after the number that mean it's an amount, not a house number. */
const AMOUNT_WORDS = new Set([
  'a', 'an', 'per', 'k', 'thousand', 'grand', 'million', 'dollars', 'dollar', 'bucks', 'percent',
  'year', 'years', 'month', 'months', 'week', 'weeks', 'hour', 'hours', 'down', 'saved', 'in', 'on',
  'of', 'or', 'and', 'to', 'for', 'at', 'with', 'from', 'more', 'less', 'times', 'units', 'unit',
]);

const DIRECTION = '(?:[NSEW]\\.?|North|South|East|West|NE|NW|SE|SW)';
const NAME_WORD = "[A-Za-z][A-Za-z0-9'.-]*";

const ADDRESS = new RegExp(
  `\\b(\\d{1,6})\\s+((?:${DIRECTION}\\s+)?(?:${NAME_WORD}\\s+){0,3}?)(${FULL_TYPES.join('|')}|${SHORT_TYPES.join('|')})\\b\\.?`,
  'gi',
);

function looksLikeAddress(nameWords: string, type: string): boolean {
  const words = nameWords.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return false; // "22 Street" alone is too vague
  if (AMOUNT_WORDS.has(words[0]!.toLowerCase().replace(/\.$/, ''))) return false;
  const isShort = SHORT_TYPES.includes(type.toLowerCase());
  if (isShort) {
    const last = words[words.length - 1]!;
    return /^[A-Z]/.test(last);
  }
  return true;
}

function redactAddress(text: string): { text: string; found: boolean } {
  let found = false;
  const out = text.replace(ADDRESS, (match, _num: string, names: string, type: string) => {
    if (!looksLikeAddress(names, type)) return match;
    found = true;
    return REDACTED;
  });
  return { text: out, found };
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Run the safety net on one user turn. Use `result.text` everywhere downstream
 * (LLM, extractor, transcript, chat panel, database) — never the original.
 */
export function applySafetyNet(input: string): SafetyNetResult {
  if (!input) return { text: input, ssn: false, address: false };
  const s = redactSsn(input);
  const a = redactAddress(s.text);
  if (s.found || a.found) {
    // Never log the matched text — only that something was caught.
    console.log(`[safety-net] ${[s.found ? 'SSN' : '', a.found ? 'street address' : ''].filter(Boolean).join(' + ')} detected → redacted, TRID gate`);
  }
  return { text: a.text, ssn: s.found, address: a.found };
}

/** Short TRID gate (verbatim, Revised spec). */
export function tridGateScript(result: Pick<SafetyNetResult, 'ssn' | 'address'>): string {
  const base = "I'm not able to take that information here, and I haven't recorded it. If you move forward, your loan officer will collect it securely. For now, let's keep going.";
  return result.address ? `${base} A city or zip code is all I need.` : base;
}

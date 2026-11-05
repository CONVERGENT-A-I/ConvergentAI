/**
 * Section 0 — normaliser and plausibility checks (plan §6.5).
 *
 * The extractor returns facts "as said" (amount + frequency + owner). This file
 * turns them into clean values in code. Rule of thumb: when a value is
 * ambiguous, return `clarify` instead of guessing — Ailana then asks ONE short
 * question. Never assume 40 hours for hourly pay.
 */
import type { CreditValue, Frequency, IncomeComponent, IncomeType } from './fact-schema.js';

export type Clarify = 'weekly_hours' | 'frequency' | 'magnitude' | 'conflict';

export interface Normalized<T> {
  value: T | null;
  clarify?: Clarify;
}

// ── Amounts ──────────────────────────────────────────────────────────────────

/**
 * Parse a stated amount into a plain number, keeping the borrower's magnitude.
 * Handles numbers, "84,000", "$1,200.00", "84k", "1.3k", "25 thousand", "1.2 million".
 * Returns null when there is no number.
 */
export function parseAmount(input: unknown): number | null {
  if (typeof input === 'number') return Number.isFinite(input) ? input : null;
  if (typeof input !== 'string') return null;
  const s = input.toLowerCase().replace(/,/g, '').trim();
  const m = s.match(/(-?\d+(?:\.\d+)?)\s*(k|thousand|grand|m|mil|million)?\b/);
  if (!m || m[1] === undefined) return null;
  let n = parseFloat(m[1]);
  if (!Number.isFinite(n)) return null;
  const unit = m[2];
  if (unit === 'k' || unit === 'thousand' || unit === 'grand') n *= 1_000;
  else if (unit === 'm' || unit === 'mil' || unit === 'million') n *= 1_000_000;
  return n;
}

/**
 * What kind of amount this is decides how shorthand is read:
 * - 'annual' (yearly income) and 'large' (price, value, balance, funds, line amount):
 *   people say "84", "450", "25" meaning thousands → ×1,000 when 10 ≤ n < 1,000.
 *   A number below 10 can't be a price or salary → ask (magnitude).
 * - 'monthly' (debts, payments, rent, monthly income): taken as said.
 */
export type AmountKind = 'annual' | 'large' | 'monthly';

export function resolveMagnitude(n: number | null, kind: AmountKind): Normalized<number> {
  if (n === null || !Number.isFinite(n) || n < 0) return { value: null };
  if (kind === 'monthly') return { value: Math.round(n) };
  if (n === 0) return { value: 0 };
  if (n < 10) return { value: null, clarify: 'magnitude' };
  if (n < 1_000) return { value: Math.round(n * 1_000) };
  return { value: Math.round(n) };
}

export function normalizeAmount(input: unknown, kind: AmountKind): Normalized<number> {
  return resolveMagnitude(parseAmount(input), kind);
}

// ── Income ───────────────────────────────────────────────────────────────────

/** Income types that are almost always stated per month when no frequency is given. */
const MONTHLY_BY_NATURE = new Set<IncomeType>([
  'social_security', 'pension', 'military_retirement', 'va_disability', 'alimony', 'child_support', 'rental',
]);

const PER_YEAR: Record<Exclude<Frequency, 'hourly'>, number> = {
  yearly: 1, monthly: 12, semimonthly: 24, biweekly: 26, weekly: 52,
};

export interface IncomeInput {
  type: IncomeType;
  amount: unknown;
  frequency?: Frequency | null;
  hours_per_week?: number | null;
  counted?: boolean;
  variable?: boolean;
  history?: unknown[];
}

/**
 * Normalise one income component and compute its annual figure when unambiguous.
 * - Hourly without hours → clarify 'weekly_hours' (never assume 40).
 * - No frequency: monthly-by-nature types (SS, pension, VA disability, alimony…) under
 *   $15k are monthly; salary-like amounts under 1,000 are thousands per year ("I make 84");
 *   1,000–14,999 with no frequency ("3,100") → clarify 'frequency'.
 */
export function normalizeIncome(input: IncomeInput): Normalized<IncomeComponent> {
  const raw = parseAmount(input.amount);
  if (raw === null || raw < 0) return { value: null };

  const frequency: Frequency | null = input.type === 'hourly' ? 'hourly' : (input.frequency ?? null);
  const base: IncomeComponent = { type: input.type, amount: raw, frequency };
  if (input.counted !== undefined) base.counted = input.counted;
  if (input.variable !== undefined) base.variable = input.variable;
  if (Array.isArray(input.history)) {
    base.history = input.history.map((h) => resolveMagnitude(parseAmount(h), 'annual').value).filter((h): h is number => h !== null);
  }

  if (frequency === 'hourly') {
    const hours = input.hours_per_week ?? null;
    base.hours_per_week = hours;
    if (!hours || hours <= 0 || hours > 100) {
      return { value: { ...base, annual: null }, clarify: 'weekly_hours' };
    }
    return { value: { ...base, annual: Math.round(raw * hours * 52) } };
  }

  if (frequency === 'yearly') {
    const yearly = resolveMagnitude(raw, 'annual');
    if (yearly.value === null) return { value: { ...base, annual: null }, ...(yearly.clarify ? { clarify: yearly.clarify } : {}) };
    return { value: { ...base, amount: yearly.value, annual: yearly.value } };
  }

  if (frequency) {
    return { value: { ...base, annual: Math.round(raw * PER_YEAR[frequency]) } };
  }

  // No frequency stated.
  if (MONTHLY_BY_NATURE.has(input.type) && raw < 15_000) {
    return { value: { ...base, frequency: 'monthly', annual: Math.round(raw * 12) } };
  }
  if (raw >= 10 && raw < 1_000) {
    const yearly = Math.round(raw * 1_000);
    return { value: { ...base, amount: yearly, frequency: 'yearly', annual: yearly } };
  }
  if (raw >= 1_000 && raw < 15_000) {
    return { value: { ...base, annual: null }, clarify: 'frequency' };
  }
  if (raw >= 15_000) {
    return { value: { ...base, frequency: 'yearly', annual: Math.round(raw) } };
  }
  return { value: { ...base, annual: null }, clarify: 'magnitude' };
}

/**
 * Sum annual income across components. `complete` is false if any counted
 * component still needs clarification — then gross income must NOT be synced.
 * Alimony / child support count only when the borrower said they want it counted.
 */
export function totalAnnualIncome(components: IncomeComponent[]): { total: number; complete: boolean } {
  let total = 0;
  let complete = true;
  for (const c of components) {
    if ((c.type === 'alimony' || c.type === 'child_support') && c.counted !== true) continue;
    if (c.annual === null || c.annual === undefined) { complete = false; continue; }
    total += c.annual;
  }
  return { total: Math.round(total), complete };
}

// ── Credit ───────────────────────────────────────────────────────────────────

const TIERS: Array<[RegExp, string]> = [
  [/excellent/, 'Excellent'],
  [/very\s*good|great/, 'Very Good'],
  [/\bgood\b/, 'Good'],
  [/\bfair\b|average|\bok(ay)?\b/, 'Fair'],
  [/poor|\bbad\b|\blow\b/, 'Poor'],
];

/** "710", 710000 (STT artifact), "around 680", "in the 770s", "700-749", "good" → CreditValue. */
export function normalizeCredit(input: unknown): Normalized<CreditValue> {
  if (input === null || input === undefined || input === '') return { value: null };
  const s = String(input).toLowerCase().replace(/[$,]/g, '').trim();

  const decade = s.match(/\b([3-8]\d)0s\b/);
  if (decade?.[1]) {
    const lo = parseInt(decade[1], 10) * 10;
    if (lo >= 300 && lo <= 850) return { value: { range: `${lo}s`, score: lo + 5, approx: true } };
  }

  const range = s.match(/\b([3-8]\d{2})\s*(?:-|to|–)\s*([3-8]\d{2})\b/);
  if (range?.[1] && range[2]) {
    const a = parseInt(range[1], 10), b = parseInt(range[2], 10);
    if (a >= 300 && b <= 850 && a < b) return { value: { range: `${a}-${b}`, score: Math.round((a + b) / 2), approx: true } };
  }

  const num = s.match(/\d{3,9}/);
  if (num) {
    let n = parseInt(num[0], 10);
    if (n > 850) {
      const lead3 = parseInt(num[0].slice(0, 3), 10); // "710000" → 710
      n = lead3;
    }
    if (n >= 300 && n <= 850) {
      const approx = /about|around|roughly|approx|maybe|probably|\bish\b|-ish/.test(s);
      return { value: approx ? { score: n, approx: true } : { score: n } };
    }
    return { value: null, clarify: 'magnitude' };
  }

  for (const [re, tier] of TIERS) {
    if (re.test(s)) return { value: { tier } };
  }
  return { value: null };
}

/** Profile-friendly string for a CreditValue ("710", "770s", "Good"). */
export function creditToProfileString(c: CreditValue): string | null {
  if (c.range) return c.range;
  if (c.score !== undefined) return String(c.score);
  if (c.tier) return c.tier;
  return null;
}

// ── Down payment ─────────────────────────────────────────────────────────────

export interface DownPayment { amount?: number; percent?: number }

/** Keeps a stated percent and works out the dollar amount once the price is known. */
export function normalizeDownPayment(input: { amount?: unknown; percent?: unknown }, price?: number | null): Normalized<DownPayment> {
  const out: DownPayment = {};
  const pct = parseAmount(input.percent);
  if (pct !== null && pct > 0 && pct <= 100) out.percent = pct;
  const amt = resolveMagnitude(parseAmount(input.amount), 'large');
  if (amt.clarify) return { value: null, clarify: amt.clarify };
  if (amt.value !== null) out.amount = amt.value;
  if (out.amount === undefined && out.percent !== undefined && price) {
    out.amount = Math.round((price * out.percent) / 100);
  }
  if (out.amount === undefined && out.percent === undefined) return { value: null };
  return { value: out };
}

// ── Plausibility (cross-fact) ────────────────────────────────────────────────

export interface PlausibilityIssue { key: string; reason: string }

/**
 * Cross-fact checks that trigger ONE confirmation question, never a guess.
 * Underwater homes are legitimate, so balance > value only flags a wide margin.
 */
export function checkPlausibility(f: {
  price?: number | null;
  downPayment?: number | null;
  refiBalance?: number | null;
  refiValue?: number | null;
  funds?: number | null;
  equityAmount?: number | null;
}): PlausibilityIssue[] {
  const issues: PlausibilityIssue[] = [];
  if (f.price && f.downPayment && f.downPayment > f.price) {
    issues.push({ key: 'purchase.down_payment', reason: 'down payment is larger than the price' });
  }
  if (f.refiValue && f.refiBalance && f.refiBalance > f.refiValue * 1.5) {
    issues.push({ key: 'refi.balance', reason: 'balance is far above the home value' });
  }
  if (f.refiValue && f.equityAmount && f.equityAmount > f.refiValue) {
    issues.push({ key: 'equity.amount', reason: 'amount wanted is larger than the home value' });
  }
  return issues;
}

/**
 * Section 0 — ingest: extractor output → normaliser → Fact Ledger (plan §5.1 steps 3–4).
 *
 * Pure apart from writing to the ledger it is given. Every value goes through
 * code normalisation; anything ambiguous is stored as `needs_clarification`
 * (not usable, not synced to the profile) so Ailana asks ONE short question.
 */
import type { FactLedger } from './fact-ledger.js';
import type { FactKey, IncomeComponent, IncomeType } from './fact-schema.js';
import {
  checkPlausibility, normalizeAmount, normalizeCredit, normalizeDownPayment, normalizeIncome,
  parseAmount, type AmountKind, type Clarify,
} from './normalize.js';
import { applySafetyNet } from './safety-net.js';
import { lenderStates } from './compliance-notes.js';
import type { ExtractedFact, UniversalExtraction } from './universal-extractor.js';

export interface IngestResult {
  changed: FactKey[];
  clarifications: Array<{ key: FactKey; clarify: Clarify | string }>;
}

const AMOUNT_KIND: Partial<Record<FactKey, AmountKind>> = {
  'purchase.price': 'large',
  'funds.total': 'large',
  'refi.balance': 'large',
  'refi.value': 'large',
  'refi.cash_out_amount': 'large',
  'equity.amount': 'large',
  'debt.monthly_total': 'monthly',
  'property.projected_rent': 'monthly',
};

const PLAIN_NUMBER_KEYS = new Set<FactKey>([
  'employment.tenure_years', 'housing.properties_owned', 'property.units', 'military.years',
  'refi.purchase_year', 'refi.current_rate', 'situation.delinquent_months',
]);

/** Choice-type facts the model may mark as ambiguous. Numbers are never "uncertain" — code checks them. */
const CHOICE_KEYS = new Set<FactKey>(['occupancy', 'property.type', 'housing.current', 'employment.type', 'co_borrower.role', 'refi.loan_type']);

const BOOL_KEYS = new Set<FactKey>([
  'borrower.first_time_buyer', 'borrower.existing_member', 'co_borrower.present', 'purchase.zero_down_goal',
  'refi.keep_first', 'equity.paid_off', 'equity.fixed_preference', 'situation.divorce_buyout', 'property.rental_plan',
  'situation.inherited_home', 'situation.job_loss', 'situation.preapproval_letter', 'situation.competitor_offer',
  'situation.building_home',
]);

/** Process the price first so a percentage down payment can be converted in the same turn. */
const ORDER: FactKey[] = ['purchase.price'];

function toBool(v: unknown): boolean | null {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') {
    const s = v.toLowerCase().trim();
    if (['true', 'yes', 'y'].includes(s)) return true;
    if (['false', 'no', 'n'].includes(s)) return false;
  }
  return null;
}

function normalizeIncomeList(value: unknown, existing: IncomeComponent[] | undefined): { list: IncomeComponent[]; clarify?: Clarify } {
  const items = Array.isArray(value) ? value : [value];
  const list: IncomeComponent[] = [];
  let clarify: Clarify | undefined;
  for (const item of items) {
    if (!item || typeof item !== 'object') continue;
    const it = item as Record<string, unknown>;
    // A reply that only adds a detail ("about 36 hours") may arrive without a type → it belongs to
    // the income that is waiting for that detail.
    const waiting = existing?.find((c) => c.annual === null || c.annual === undefined);
    // A detail with no amount (whatever label the model gave it) can only complete the waiting income.
    const detailOnly = it.amount === undefined || it.amount === null;
    const type = ((detailOnly && waiting) ? waiting.type : typeof it.type === 'string' ? it.type : 'other') as IncomeType;
    // "about 36 hours" answering a weekly-hours question may arrive without the amount → reuse the stated rate.
    let amount: unknown = it.amount;
    let reusedFrequency: IncomeComponent['frequency'] | undefined;
    if ((amount === undefined || amount === null) && existing) {
      const prior = existing.find((c) => c.type === type);
      amount = prior?.amount;
      // The reused amount keeps its own frequency: "52" an hour must not become 52,000 a year (#2, O8).
      reusedFrequency = prior?.frequency ?? undefined;
    }
    const hours = parseAmount(it.hours_per_week);
    const r = normalizeIncome({
      type,
      amount,
      frequency: (typeof it.frequency === 'string' ? it.frequency : reusedFrequency ?? null) as IncomeComponent['frequency'],
      hours_per_week: hours ?? existing?.find((c) => c.type === type)?.hours_per_week ?? null,
      ...(typeof it.counted === 'boolean' ? { counted: it.counted } : {}),
      ...(typeof it.variable === 'boolean' ? { variable: it.variable } : {}),
      ...(Array.isArray(it.history) ? { history: it.history } : {}),
      ...(it.combined === true || existing?.find((c) => c.type === type)?.combined ? { combined: true } : {}),
    });
    if (r.value) list.push(r.value);
    if (r.clarify && !clarify) clarify = r.clarify;
  }
  return clarify ? { list, clarify } : { list };
}

/** Facts whose value is a list — the model sometimes sends a single item; store it as a one-item list. */
const LIST_KEYS = new Set<FactKey>(['credit.events', 'debt.items', 'funds.sources']);

function normalizeFact(f: ExtractedFact, ledger: FactLedger, batchPrice: number | null): { value: unknown; clarify?: Clarify | string } | null {
  const { key } = f;
  const value = LIST_KEYS.has(key) && f.value !== null && typeof f.value === 'object' && !Array.isArray(f.value) ? [f.value] : f.value;

  if (key === 'income.borrower' || key === 'income.co_borrower') {
    const existing = ledger.get(key)?.value as IncomeComponent[] | undefined;
    const r = normalizeIncomeList(value, Array.isArray(existing) ? existing : undefined);
    if (r.list.length === 0) return null;
    return r.clarify ? { value: r.list, clarify: r.clarify } : { value: r.list };
  }

  if (key === 'credit.borrower' || key === 'credit.co_borrower') {
    const r = normalizeCredit(value);
    if (!r.value) return r.clarify ? { value: String(value), clarify: r.clarify } : null;
    return { value: r.value };
  }

  if (key === 'purchase.down_payment') {
    const v = typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : { amount: value };
    const price = batchPrice ?? ledger.value<number>('purchase.price') ?? null;
    const r = normalizeDownPayment({ amount: v.amount, percent: v.percent }, price);
    if (!r.value) return r.clarify ? { value: v, clarify: r.clarify } : null;
    return { value: r.value };
  }

  const kind = AMOUNT_KIND[key];
  if (kind) {
    const r = normalizeAmount(value, kind);
    if (r.value === null) return r.clarify ? { value, clarify: r.clarify } : null;
    return { value: r.value };
  }

  if (PLAIN_NUMBER_KEYS.has(key)) {
    const n = parseAmount(value);
    return n === null ? null : { value: n };
  }

  if (BOOL_KEYS.has(key)) {
    const b = toBool(value);
    return b === null ? null : { value: b };
  }

  if (key === 'debt.items') {
    if (!Array.isArray(value)) return null;
    const items = value
      .map((d: any) => ({ kind: String(d?.kind ?? 'other'), monthly: normalizeAmount(d?.monthly, 'monthly').value }))
      .filter((d) => d.monthly !== null) as Array<{ kind: string; monthly: number }>;
    return items.length ? { value: items } : null;
  }

  if (key === 'housing.retained_home') {
    if (typeof value !== 'object' || value === null) return null;
    const v = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    const bal = normalizeAmount(v.balance, 'large').value;
    const rent = normalizeAmount(v.expected_rent, 'monthly').value;
    if (bal !== null) out.balance = bal;
    if (rent !== null) out.expected_rent = rent;
    if (typeof v.plan === 'string') out.plan = v.plan;
    return Object.keys(out).length ? { value: out } : null;
  }

  if (key === 'location.area') {
    const loc = typeof value === 'string' ? { area: value } : value;
    // Belt and braces: a location must never carry a street address.
    if (applySafetyNet(JSON.stringify(loc)).address) return null;
    // A city name shared with a town in the lender's state (Cleveland: TN and OH) is read as the local one —
    // never a guessed out-of-state location (which would trigger the footprint note). The model answers the
    // narrow question (does such a town exist there?); code picks the state.
    if (loc && typeof loc === 'object') {
      const { in_lender_state: inLender, ...rest } = loc as Record<string, unknown>;
      const states = lenderStates();
      if (inLender === true && !states.includes(String(rest.state ?? '').toUpperCase())) rest.state = states.length === 1 ? states[0] : null;
      // A reply that only adds the state or ZIP ("Tennessee") completes the place already known — never erases it.
      // (read directly: a place waiting for its state check is hidden from ledger.value)
      const prev = ledger.get('location.area')?.value as Record<string, unknown> | undefined;
      const named = (x: unknown) => typeof x === 'string' && x.trim() !== '';
      if (prev && !named(rest.city) && !named(rest.area) && (named(prev.city) || named(prev.area))) {
        const detail = Object.fromEntries(Object.entries(rest).filter(([, x]) => x !== null && x !== undefined && x !== ''));
        // A stated state or ZIP replaces an earlier guess (the ledger merges place details, so clear it explicitly).
        return { value: { ...detail, ...(named(detail.state) || named(detail.zip) ? { guessed_state: undefined } : {}) } };
      }
      return { value: { ...rest, guessed_state: undefined } }; // a newly named place supersedes any guess
    }
    return { value: loc };
  }

  // Enums / free text / objects: stored as said (already schema-checked by the parser).
  return { value };
}

export function ingestExtraction(ex: UniversalExtraction, ledger: FactLedger, turn: number, stage: string): IngestResult {
  const result: IngestResult = { changed: [], clarifications: [] };
  if (ex.failed) return result;

  const facts = [...ex.facts].sort((a, b) => {
    const ia = ORDER.indexOf(a.key), ib = ORDER.indexOf(b.key);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
  if (ex.goal && !facts.some((f) => f.key === 'goal.primary')) facts.unshift({ key: 'goal.primary', value: ex.goal, raw: '' });
  // A vague later reply ("unclear") never erases a goal that is already known (#8: construction kept).
  const knownGoal = ledger.value<string>('goal.primary');
  if (knownGoal && knownGoal !== 'unclear') {
    for (let i = facts.length - 1; i >= 0; i--) if (facts[i]!.key === 'goal.primary' && facts[i]!.value === 'unclear') facts.splice(i, 1);
  }
  if (ex.secondaryGoal && !facts.some((f) => f.key === 'goal.secondary')) facts.push({ key: 'goal.secondary', value: ex.secondaryGoal, raw: '' });

  let batchPrice: number | null = null;
  for (const f of facts) {
    const n = normalizeFact(f, ledger, batchPrice);
    if (!n) continue;
    if (f.key === 'purchase.price' && typeof n.value === 'number') batchPrice = n.value;
    // The borrower's words point two ways (e.g. "vacation home we'd also rent out") → confirm, never guess.
    if (!n.clarify && f.uncertain && CHOICE_KEYS.has(f.key) && stage === '0') n.clarify = 'uncertain';
    const status = n.clarify ? 'needs_clarification' : 'stated';
    // A message that touches a protected class (ethnicity, religion, ...) keeps no quotes at all —
    // only the structured values, which never carry those characteristics (ECOA / Reg B).
    const raw = ex.flags.includes('protected_class_topic') ? '' : f.raw;
    const r = ledger.upsert({ key: f.key, value: n.value, raw, status, ...(n.clarify ? { clarify: n.clarify } : {}) }, turn, stage);
    if (r === 'added' || r === 'corrected') result.changed.push(f.key);
    if (n.clarify) result.clarifications.push({ key: f.key, clarify: n.clarify });
  }

  for (const k of ex.declined) {
    if (!ledger.isSettled(k)) ledger.markDeclined(k, turn, stage);
  }

  // Two independent signals for a build (the model sometimes gives only one): a home being built, with no
  // other clear goal, is construction financing — even when they plan to borrow against their current home.
  const BUILD_GOALS = [undefined, 'unclear', 'equity_unclear', 'heloc', 'home_equity_loan', 'cash_out_unclear'];
  if (stage === '0' && ledger.value('situation.building_home') === true && BUILD_GOALS.includes(ledger.value<string>('goal.primary'))) {
    ledger.upsert({ key: 'goal.primary', value: 'construction', raw: '' }, turn, stage);
    result.changed.push('goal.primary');
  }

  // Derived: a debt total from itemised debts when no total was stated.
  const items = ledger.value<Array<{ monthly: number }>>('debt.items');
  if (items && !ledger.has('debt.monthly_total') && !ledger.isSettled('debt.monthly_total')) {
    const total = items.reduce((s, d) => s + d.monthly, 0);
    ledger.upsert({ key: 'debt.monthly_total', value: total, raw: 'sum of stated debts' }, turn, stage);
    result.changed.push('debt.monthly_total');
  }

  // Conflicting facts → one confirmation, never a guess: a home they will live in (or use as a second
  // home) that they also plan to rent out — unless it is a multi-unit home they live in part of.
  if (result.changed.some((k) => k === 'occupancy' || k === 'property.rental_plan') && ledger.value('property.rental_plan') === true) {
    const occ = ledger.get('occupancy');
    const multiUnit = (ledger.value<number>('property.units') ?? 1) > 1 || ledger.value('property.type') === 'multi_family';
    if (occ && occ.status !== 'needs_clarification' && occ.status !== 'confirmed' && (occ.value === 'second_home' || occ.value === 'primary') && !multiUnit) {
      ledger.upsert({ key: 'occupancy', value: occ.value, raw: occ.raw, status: 'needs_clarification', clarify: 'uncertain' }, turn, stage);
      result.clarifications.push({ key: 'occupancy', clarify: 'uncertain' });
    }
  }

  // Cross-fact plausibility → one confirmation, never a guess.
  const dp = ledger.value<{ amount?: number }>('purchase.down_payment');
  const issues = checkPlausibility({
    price: ledger.value<number>('purchase.price') ?? null,
    downPayment: dp?.amount ?? null,
    refiBalance: ledger.value<number>('refi.balance') ?? null,
    refiValue: ledger.value<number>('refi.value') ?? null,
    equityAmount: ledger.value<number>('equity.amount') ?? null,
  });
  for (const issue of issues) {
    const key = issue.key as FactKey;
    const e = ledger.get(key);
    if (e && e.status !== 'needs_clarification') {
      ledger.upsert({ key, value: e.value, raw: e.raw, status: 'needs_clarification', clarify: 'conflict' }, turn, stage);
      result.clarifications.push({ key, clarify: 'conflict' });
    }
  }

  return result;
}

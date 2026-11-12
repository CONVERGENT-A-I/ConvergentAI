/**
 * Section 0 — end-of-simulation data check (plan §7.3).
 *
 * A conversation can sound right while storing the wrong numbers. Each scenario's
 * `userdata.expected_facts` lists what must be in Ailana's memory (the Fact Ledger)
 * and the profile at the end; `checkExpectedFacts` returns one line per mismatch,
 * and `onSimulationEnd` fails the run with them. Pure — no I/O.
 */
import type { BorrowerProfile } from '../prompts/layer3-context.js';
import type { FactLedger } from './fact-ledger.js';
import type { CreditValue, FactKey, IncomeComponent } from './fact-schema.js';
import { totalAnnualIncome } from './normalize.js';

export interface ExpectedFacts {
  /** profile.transaction_type at the end; null = no track may be set (holdouts, out of scope). */
  track?: 'TT-PUR' | 'TT-REF' | 'TT-HEL' | 'TT-HEQ' | null;
  /** Dollar / count facts, compared within 2% (e.g. "debt.monthly_total": 300). */
  numbers?: Partial<Record<FactKey, number>>;
  /** Exact values (strings / booleans), e.g. "occupancy": "primary". */
  values?: Partial<Record<FactKey, string | boolean>>;
  /** Stated credit scores. */
  credit?: number;
  co_credit?: number;
  /** Household annual income (borrower + co-borrower) once complete. */
  income_total_annual?: number;
  /** Values that must NOT be stored for a key (e.g. the $3,000 the borrower corrected to $300). */
  not_numbers?: Partial<Record<FactKey, number>>;
  /** Text that must never appear anywhere in memory or the profile (SSN digits, a street name). */
  never_stored?: string[];
}

const close = (a: number, b: number) => Math.abs(a - b) <= Math.max(1, Math.abs(b) * 0.02);

function creditScore(v: CreditValue | undefined): number | undefined {
  return v?.score;
}

export function checkExpectedFacts(exp: ExpectedFacts, ledger: FactLedger, profile: BorrowerProfile): string[] {
  const out: string[] = [];

  if (exp.track !== undefined) {
    const t = profile.transaction_type ?? null;
    if (exp.track === null ? !!t && (profile as any).section0_complete === true : t !== exp.track) {
      out.push(`track: expected ${exp.track ?? 'none'}, got ${t ?? 'none'}`);
    }
  }

  for (const [key, want] of Object.entries(exp.numbers ?? {}) as Array<[FactKey, number]>) {
    const got = ledger.value<unknown>(key);
    const n = typeof got === 'number' ? got : undefined;
    if (n === undefined || !close(n, want)) out.push(`${key}: expected ${want}, got ${JSON.stringify(got ?? null)}`);
  }

  for (const [key, want] of Object.entries(exp.values ?? {}) as Array<[FactKey, string | boolean]>) {
    const got = ledger.value<unknown>(key);
    if (got !== want) out.push(`${key}: expected ${JSON.stringify(want)}, got ${JSON.stringify(got ?? null)}`);
  }

  if (exp.credit !== undefined) {
    const got = creditScore(ledger.value<CreditValue>('credit.borrower'));
    if (got !== exp.credit) out.push(`credit.borrower: expected ${exp.credit}, got ${got ?? 'none'}`);
  }
  if (exp.co_credit !== undefined) {
    const got = creditScore(ledger.value<CreditValue>('credit.co_borrower'));
    if (got !== exp.co_credit) out.push(`credit.co_borrower: expected ${exp.co_credit}, got ${got ?? 'none'}`);
  }

  if (exp.income_total_annual !== undefined) {
    const comps = [
      ...(ledger.value<IncomeComponent[]>('income.borrower') ?? []),
      ...(ledger.value<IncomeComponent[]>('income.co_borrower') ?? []),
    ];
    const t = totalAnnualIncome(comps);
    if (!t.complete || !close(t.total, exp.income_total_annual)) {
      out.push(`household income: expected ${exp.income_total_annual}/yr, got ${t.complete ? t.total : 'incomplete'}`);
    }
  }

  for (const [key, bad] of Object.entries(exp.not_numbers ?? {}) as Array<[FactKey, number]>) {
    const got = ledger.value<unknown>(key);
    if (typeof got === 'number' && close(got, bad)) out.push(`${key}: stored ${got}, which the borrower corrected`);
  }

  if (exp.never_stored?.length) {
    const haystack = (JSON.stringify(ledger.serialize()) + JSON.stringify(profile)).toLowerCase().replace(/[\s-]/g, '');
    for (const s of exp.never_stored) {
      if (haystack.includes(s.toLowerCase().replace(/[\s-]/g, ''))) out.push(`forbidden text stored: "${s.slice(0, 3)}…"`);
    }
  }
  return out;
}

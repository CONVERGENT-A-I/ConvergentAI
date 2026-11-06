/**
 * Section 0 — Fact Ledger → BorrowerProfile sync (plan §6.6): the no-repeat mechanism.
 *
 * The existing state machine (advanceWorkflow) asks the first field that is not
 * `*_confirmed`. So the no-repeat rule is implemented by filling those fields
 * early from the ledger — the Stage 1/Stage 2 sequences themselves are untouched.
 *
 * Rules:
 * - A field is written only when the ledger value is NEW or CHANGED since the last
 *   sync (`synced` map). That way a value set later by the borrower or the soft
 *   pull is never overwritten — unless the borrower states/corrects it again.
 * - A fact the borrower DECLINED marks the field confirmed with no value (never ask again).
 * - Facts pending clarification (e.g. hourly pay without hours) are NOT synced.
 * - Goal / track is NOT synced here — the router (code) decides the track.
 */
import type { BorrowerProfile } from '../prompts/layer3-context.js';
import type { FactLedger } from './fact-ledger.js';
import type { CreditValue, FactKey, IncomeComponent } from './fact-schema.js';
import { creditToProfileString, totalAnnualIncome } from './normalize.js';

export type SyncedMap = Record<string, string>;

type Writer = (ledger: FactLedger, profile: BorrowerProfile) => Record<string, unknown> | null;

const yesNo = (b: unknown) => (b === true ? 'yes' : b === false ? 'no' : null);

/** Each writer returns the profile fields to set (including *_confirmed), or null if nothing usable. */
const WRITERS: Array<{ keys: FactKey[]; write: Writer }> = [
  {
    keys: ['borrower.first_name'],
    write: (l) => {
      const v = l.value<string>('borrower.first_name');
      return v ? { borrower_name: v, borrower_name_confirmed: true } : null;
    },
  },
  {
    keys: ['occupancy'],
    write: (l) => {
      const v = l.value<string>('occupancy');
      const map: Record<string, BorrowerProfile['occupancy']> = { primary: 'primary', second_home: 'secondary', investment: 'investment' };
      const o = v ? map[v] : undefined;
      return o ? { occupancy: o, occupancy_confirmed: true } : null;
    },
  },
  {
    keys: ['borrower.existing_member'],
    write: (l) => {
      const v = yesNo(l.value('borrower.existing_member'));
      return v ? { existing_relationship: v, existing_relationship_confirmed: true } : null;
    },
  },
  {
    keys: ['timeline'],
    write: (l) => {
      const v = l.value<string>('timeline');
      return v ? { timeline: String(v), timeline_confirmed: true } : null;
    },
  },
  {
    keys: ['co_borrower.present'],
    write: (l) => {
      const v = yesNo(l.value('co_borrower.present'));
      return v ? { co_borrower: v, co_borrower_confirmed: true } : null;
    },
  },
  {
    keys: ['income.borrower', 'income.co_borrower'],
    write: (l) => {
      const b = l.value<IncomeComponent[]>('income.borrower') ?? [];
      const c = l.value<IncomeComponent[]>('income.co_borrower') ?? [];
      // Anything still waiting for a clarification (e.g. weekly hours) blocks the total.
      if (l.get('income.borrower')?.status === 'needs_clarification' || l.get('income.co_borrower')?.status === 'needs_clarification') return null;
      // A co-borrower is applying but their income isn't known yet → household total incomplete.
      if (l.value('co_borrower.present') === true && c.length === 0 && b.length > 0) return null;
      const t = totalAnnualIncome([...b, ...c]);
      if (!t.complete || t.total <= 0) return null;
      return { gross_annual_income: t.total, gross_annual_income_confirmed: true };
    },
  },
  {
    keys: ['employment.type', 'employment.tenure_years', 'employment.occupation'],
    write: (l) => {
      const type = l.value<string>('employment.type');
      const years = l.value<number>('employment.tenure_years');
      if (!type || years === undefined) return null; // need both for the job tenure/type question
      const out: Record<string, unknown> = {
        job_tenure_type: `${years} years, ${type.replace(/_/g, ' ')}`,
        job_tenure_type_confirmed: true,
        employment_years: years,
      };
      if (type === 'self_employed' || type === 'gig_1099') out.self_employed = true;
      if (type === 'w2_salary' || type === 'w2_hourly') out.self_employed = false;
      return out;
    },
  },
  {
    keys: ['debt.monthly_total'],
    write: (l) => {
      const v = l.value<number>('debt.monthly_total');
      return v === undefined ? null : { monthly_debt: v, monthly_debt_confirmed: true };
    },
  },
  {
    keys: ['credit.borrower'],
    write: (l) => {
      const c = l.value<CreditValue>('credit.borrower');
      if (!c) return null;
      const s = creditToProfileString(c);
      if (!s) return null;
      const out: Record<string, unknown> = { credit_range: s, credit_range_confirmed: true };
      if (c.score !== undefined) { out.credit_score = c.score; out.stated_credit_score = c.score; }
      return out;
    },
  },
  {
    keys: ['purchase.down_payment', 'funds.total'],
    write: (l) => {
      const dp = l.value<{ amount?: number }>('purchase.down_payment');
      const funds = l.value<number>('funds.total');
      const v = dp?.amount ?? funds;
      return v === undefined ? null : { down_payment: v, down_payment_confirmed: true };
    },
  },
  {
    keys: ['housing.current'],
    write: (l) => {
      const v = l.value<string>('housing.current');
      const map: Record<string, BorrowerProfile['rent_own']> = { rent: 'rent', own: 'own', own_selling: 'own_selling', own_keeping: 'own' };
      const r = v ? map[v] : undefined;
      return r ? { rent_own: r, rent_own_confirmed: true } : null;
    },
  },
  {
    keys: ['purchase.price'],
    write: (l) => {
      const v = l.value<number>('purchase.price');
      return v === undefined ? null : { target_price: v, target_price_confirmed: true };
    },
  },
  {
    keys: ['property.type'],
    write: (l) => {
      const v = l.value<string>('property.type');
      if (!v) return null;
      const map: Record<string, BorrowerProfile['property_type']> = {
        single_family: 'single_family', condo: 'condo', townhome: 'townhome', multi_family: 'multi_family',
      };
      return { property_type: map[v] ?? 'other', property_type_confirmed: true };
    },
  },
  {
    keys: ['location.area'],
    write: (l) => {
      const v = l.value<{ zip?: string; city?: string; state?: string; area?: string }>('location.area');
      if (!v) return null;
      const label = v.zip || [v.city || v.area, v.state].filter(Boolean).join(', ');
      return label ? { zip_code: String(label) } : null;
    },
  },
  {
    keys: ['military.status'],
    write: (l) => {
      const v = l.value<string>('military.status');
      if (!v) return null;
      return { military_rural: v === 'none' ? 'neither' : 'military', military_rural_confirmed: true };
    },
  },
  {
    keys: ['goal.refi_purpose'],
    write: (l) => {
      const v = l.value<string>('goal.refi_purpose');
      if (v === 'cash_out') return { refinance_type: 'cash_out', refinance_type_confirmed: true };
      if (v === 'lower_payment' || v === 'shorten_term') return { refinance_type: 'rate_term', refinance_type_confirmed: true };
      return null;
    },
  },
  {
    keys: ['refi.balance', 'equity.paid_off'],
    write: (l) => {
      const bal = l.value<number>('refi.balance');
      if (bal !== undefined) return { first_mortgage_balance: bal, first_mortgage_balance_confirmed: true };
      if (l.value('equity.paid_off') === true) return { first_mortgage_balance: 0, first_mortgage_balance_confirmed: true };
      return null;
    },
  },
  {
    keys: ['refi.value'],
    write: (l) => {
      const v = l.value<number>('refi.value');
      return v === undefined ? null : { property_value: v, property_value_confirmed: true };
    },
  },
  {
    keys: ['refi.current_rate'],
    write: (l) => {
      const v = l.value<number>('refi.current_rate');
      return v === undefined ? null : { current_mortgage_rate: v };
    },
  },
  {
    keys: ['refi.loan_type'],
    write: (l) => {
      const v = l.value<string>('refi.loan_type');
      return v && ['conventional', 'fha', 'va', 'usda', 'unknown'].includes(v) ? { current_mortgage_type: v } : null;
    },
  },
  {
    keys: ['refi.cash_out_amount'],
    write: (l) => {
      const v = l.value<number>('refi.cash_out_amount');
      return v === undefined ? null : { cash_out_amount: v, cash_out_amount_confirmed: true };
    },
  },
  {
    keys: ['refi.cash_out_use'],
    write: (l) => {
      const v = l.value<string>('refi.cash_out_use');
      return v ? { cash_out_use: String(v) } : null;
    },
  },
  {
    keys: ['equity.amount'],
    write: (l) => {
      const v = l.value<number>('equity.amount');
      return v === undefined ? null : { heloc_line_amount: v, heloc_line_amount_confirmed: true };
    },
  },
  {
    keys: ['equity.use'],
    write: (l) => {
      const v = l.value<string>('equity.use');
      return v ? { heloc_draw_use: String(v) } : null;
    },
  },
  {
    keys: ['equity.fixed_preference'],
    write: (l) => {
      const v = l.value('equity.fixed_preference');
      if (v === true) return { heloc_rate_comfort: 'fixed', heloc_rate_comfort_confirmed: true };
      if (v === false) return { heloc_rate_comfort: 'variable', heloc_rate_comfort_confirmed: true };
      return null;
    },
  },
];

/** Profile fields a declined fact settles (confirmed, no value) so the question is never asked again. */
const DECLINE_MAP: Partial<Record<FactKey, string>> = {
  'borrower.first_name': 'borrower_name_confirmed',
  'occupancy': 'occupancy_confirmed',
  'borrower.existing_member': 'existing_relationship_confirmed',
  'timeline': 'timeline_confirmed',
  'co_borrower.present': 'co_borrower_confirmed',
  'debt.monthly_total': 'monthly_debt_confirmed',
  'credit.borrower': 'credit_range_confirmed',
  'funds.total': 'down_payment_confirmed',
  'purchase.price': 'target_price_confirmed',
  'property.type': 'property_type_confirmed',
  'military.status': 'military_rural_confirmed',
};

/**
 * Write every new/changed ledger fact into the profile. Returns the profile
 * fields that were set (for logging and tests).
 */
export function syncLedgerToProfile(ledger: FactLedger, profile: BorrowerProfile, synced: SyncedMap): string[] {
  const written: string[] = [];
  const p = profile as Record<string, unknown>;

  for (const w of WRITERS) {
    const signature = JSON.stringify(w.keys.map((k) => {
      const e = ledger.get(k);
      return e ? [e.value, e.status] : null;
    }));
    const id = w.keys.join('|');
    if (synced[id] === signature) continue; // nothing new for this writer since last sync
    const fields = w.write(ledger, profile);
    if (!fields) continue;
    synced[id] = signature;
    for (const [field, value] of Object.entries(fields)) {
      if (JSON.stringify(p[field]) !== JSON.stringify(value)) {
        p[field] = value;
        written.push(field);
      }
    }
  }

  for (const e of ledger.declined()) {
    const confirmField = DECLINE_MAP[e.key];
    if (confirmField && p[confirmField] !== true) {
      p[confirmField] = true;
      written.push(confirmField);
    }
  }

  if (written.length) {
    console.log(`[ledger-sync] ${written.filter((f) => !f.endsWith('_confirmed')).map((f) => `${f} ← ${JSON.stringify(p[f])}`).join(' · ') || written.join(', ')}`);
  }
  return written;
}

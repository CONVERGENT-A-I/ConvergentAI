/**
 * Section 0 — fixed fact catalogue, intents and compliance flags (plan §6.2, §6.3).
 *
 * The list of KEYS is fixed; how a borrower phrases things is unlimited. The
 * universal extractor (LLM) translates any phrasing into these keys; code does
 * everything else. Never add a key for one specific phrasing.
 */

// ── Fact keys ────────────────────────────────────────────────────────────────
export const FACT_KEYS = [
  // Goal
  'goal.primary',            // GoalClass
  'goal.secondary',          // GoalClass (second goal, kept for the loan officer)
  'goal.refi_purpose',       // 'lower_payment' | 'remove_co_borrower' | 'shorten_term' | 'cash_out' | 'other'
  // Borrower
  'borrower.first_name',
  'borrower.first_time_buyer', // boolean
  'borrower.existing_member',  // boolean — already banks / borrowed with this lender
  // Occupancy & timeline
  'occupancy',               // 'primary' | 'second_home' | 'investment'
  'timeline',                // free text as stated ("within three months")
  // Co-borrower
  'co_borrower.present',     // boolean
  'co_borrower.relationship',// free text ("husband", "son")
  'co_borrower.role',        // 'co_borrower' | 'co_signer' | 'other_is_primary'
  // Income (arrays of IncomeComponent, merged by type)
  'income.borrower',
  'income.co_borrower',
  // Employment
  'employment.type',         // 'w2_salary' | 'w2_hourly' | 'self_employed' | 'gig_1099' | 'retired' | 'commission' | 'other'
  'employment.occupation',
  'employment.tenure_years', // number
  'employment.new_job',      // { starts?: string } — job not started yet
  // Debts
  'debt.monthly_total',      // number ($/month)
  'debt.items',              // DebtItem[]
  // Credit
  'credit.borrower',         // CreditValue
  'credit.co_borrower',      // CreditValue
  'credit.events',           // CreditEvent[]
  // Funds
  'funds.total',             // number ($)
  'funds.sources',           // FundsSource[]
  // Housing
  'housing.current',         // 'rent' | 'own' | 'own_selling' | 'own_keeping'
  'housing.properties_owned',// number
  'housing.retained_home',   // { balance?: number; plan?: 'rent' | 'sell' | 'keep'; expected_rent?: number }
  // Purchase
  'purchase.price',          // number ($)
  'purchase.down_payment',   // { amount?: number; percent?: number }
  'purchase.zero_down_goal', // boolean
  // Property & location
  'property.type',           // 'single_family' | 'condo' | 'townhome' | 'multi_family' | 'manufactured' | 'cabin' | 'other'
  'property.units',          // number
  'property.projected_rent', // number ($/month)
  'property.rental_plan',    // boolean — they plan to rent this home out, fully or part of the time
  'location.area',           // { city?: string; state?: string; zip?: string; area?: string } — NEVER a street address
  // Military
  'military.status',         // 'active' | 'veteran' | 'retired' | 'reserve_guard' | 'surviving_spouse' | 'none'
  'military.years',          // number
  // Refinance
  'refi.balance',            // number ($)
  'refi.value',              // number ($)
  'refi.current_rate',       // number (%) — borrower-stated fact only, never quoted back as advice
  'refi.loan_type',          // 'conventional' | 'fha' | 'va' | 'usda' | 'unknown'
  'refi.purchase_year',      // number
  'refi.cash_out_amount',    // number ($)
  'refi.cash_out_use',       // free text
  'refi.keep_first',         // boolean — keep the current first mortgage (→ equity) or replace it (→ cash-out refi)
  // Equity
  'equity.paid_off',         // boolean — no mortgage on the home
  'equity.amount',           // number ($) — line or loan amount wanted
  'equity.use',              // free text
  'equity.fixed_preference', // boolean — true = lump sum / fixed payment (HEQ), false = line of credit (HELOC)
  // Situation (no profile field — remembered and handed to the loan officer)
  'situation.relocation',          // { from?: string; to?: string; when?: string }
  'situation.divorce_buyout',      // boolean
  'situation.inherited_home',      // boolean
  'situation.delinquent_months',   // number
  'situation.job_loss',            // boolean
  'situation.preapproval_letter',  // boolean — mentions a pre-approval letter Ailana did not issue
  'situation.competitor_offer',    // boolean — mentions another lender's offer (rate itself NOT stored)
  'situation.building_home',       // boolean — a home is being built for them (construction underway or planned)
] as const;

export type FactKey = (typeof FACT_KEYS)[number];

export function isFactKey(key: string): key is FactKey {
  return (FACT_KEYS as readonly string[]).includes(key);
}

// ── Goal classes (what the borrower wants) ───────────────────────────────────
export const GOAL_CLASSES = [
  'purchase',
  'refinance',             // clear refinance, sub-type not stated
  'refinance_rate_term',
  'refinance_cash_out',
  'heloc',
  'home_equity_loan',
  'equity_unclear',        // wants equity, line vs lump sum not stated
  'cash_out_unclear',      // wants cash from the home, keep-or-replace first mortgage not stated
  'construction',          // holdout
  'reverse_mortgage',      // holdout
  'out_of_scope',          // car loan, personal loan, …
  'unclear',
] as const;
export type GoalClass = (typeof GOAL_CLASSES)[number];

// ── Value shapes ─────────────────────────────────────────────────────────────
export type IncomeType =
  | 'salary' | 'hourly' | 'self_employed_net' | 'gig_1099' | 'commission' | 'bonus'
  | 'social_security' | 'pension' | 'military_retirement' | 'va_disability'
  | 'alimony' | 'child_support' | 'rental' | 'other';

export type Frequency = 'hourly' | 'weekly' | 'biweekly' | 'semimonthly' | 'monthly' | 'yearly';

/** One income source as the borrower stated it, plus what code worked out. */
export interface IncomeComponent {
  type: IncomeType;
  amount: number;                 // as stated (normalised magnitude)
  frequency: Frequency | null;    // null = not stated
  hours_per_week?: number | null; // hourly pay only
  annual?: number | null;         // computed by code when unambiguous
  counted?: boolean;              // alimony/child support only counted if the borrower wants it
  variable?: boolean;             // commission/bonus that varies year to year
  history?: number[];             // e.g. commission by year, most recent first
  combined?: boolean;             // the amount is the household total for all borrowers together
}

export interface DebtItem { kind: string; monthly: number }
export interface CreditEvent { type: 'bankruptcy' | 'foreclosure' | 'short_sale' | 'late_payments' | 'other'; when?: string }
export interface FundsSource { kind: 'savings' | 'sale_proceeds' | 'retirement' | 'gift' | 'other'; amount?: number }
/** A credit score as stated: exact number, approximate number, or a tier. */
export interface CreditValue { score?: number; approx?: boolean; range?: string; tier?: string }

// ── Non-fact intents (exactly one per turn) ──────────────────────────────────
export const INTENTS = [
  'states_goal_or_facts',
  'asks_question',
  'requests_transfer_now',
  'asks_about_human_later',
  'requests_callback',
  'cancels_transfer',
  'declines_to_answer',
  'concern_or_worry',
  'off_topic',
  'asks_if_human',
  'ends_conversation',
] as const;
export type Intent = (typeof INTENTS)[number];

// ── Compliance flags (can co-occur with any intent) ──────────────────────────
export const COMPLIANCE_FLAGS = [
  'rate_or_payment_request',
  'competitor_rate_mentioned',
  'approval_guarantee_or_preapproval_letter',
  'inflate_income_request',
  'protected_class_topic',
  'privacy_question',
  'hardship_or_delinquency',
  'documents_offered',
  'out_of_footprint_location',
  'low_credit_or_bankruptcy',
] as const;
export type ComplianceFlag = (typeof COMPLIANCE_FLAGS)[number];

// ── Never captured (plan §6.1) ───────────────────────────────────────────────
/** Key fragments that must never be stored, whatever the extractor returns. */
const FORBIDDEN_KEY_PATTERN = /(ssn|social[_\s.-]?security|street|address_line|account[_\s.-]?number|routing|race|ethnic|national[_\s.-]?origin|familial|religion)/i;

export function isForbiddenKey(key: string): boolean {
  return FORBIDDEN_KEY_PATTERN.test(key);
}

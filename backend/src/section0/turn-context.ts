/**
 * Section 0 — per-turn prompt text built by CODE (plan §6.6, §6.9, §6.11):
 * - KNOWN FACTS block: everything the borrower has told us (never ask again).
 * - Section 0 CURRENT TASK: what to do next, chosen by the router — not the LLM.
 */
import type { FactEntry, FactLedger } from './fact-ledger.js';
import type { CreditValue, IncomeComponent } from './fact-schema.js';
import type { Section0Decision } from './router.js';

const money = (n: unknown) => (typeof n === 'number' ? `$${Math.round(n).toLocaleString('en-US')}` : String(n));

const LABELS: Record<string, string> = {
  'goal.primary': 'Goal',
  'goal.secondary': 'Second goal (keep noted for the loan officer; do not pursue now)',
  'goal.refi_purpose': 'Refinance purpose',
  'borrower.first_name': 'First name',
  'borrower.first_time_buyer': 'First-time buyer',
  'borrower.existing_member': 'Already works with this lender',
  'occupancy': 'Occupancy',
  'timeline': 'Timeline',
  'co_borrower.present': 'Co-borrower applying',
  'co_borrower.relationship': 'Co-borrower relationship',
  'co_borrower.role': 'Co-borrower role',
  'income.borrower': 'Income (borrower)',
  'income.co_borrower': 'Income (co-borrower)',
  'employment.type': 'Employment type',
  'employment.occupation': 'Occupation',
  'employment.tenure_years': 'Years in current work',
  'employment.new_job': 'New job (not started yet)',
  'debt.monthly_total': 'Monthly debt payments',
  'debt.items': 'Debts',
  'credit.borrower': 'Credit (borrower, self-reported)',
  'credit.co_borrower': 'Credit (co-borrower, self-reported)',
  'credit.events': 'Credit events',
  'funds.total': 'Funds available',
  'funds.sources': 'Funds sources',
  'housing.current': 'Current housing',
  'housing.properties_owned': 'Properties owned',
  'housing.retained_home': 'Home being kept',
  'purchase.price': 'Target price',
  'purchase.down_payment': 'Down payment',
  'purchase.zero_down_goal': 'Wants zero down',
  'property.type': 'Property type',
  'property.units': 'Units',
  'property.projected_rent': 'Projected rent from other unit (per month)',
  'location.area': 'Area',
  'military.status': 'Military service',
  'military.years': 'Years of service',
  'refi.balance': 'Current mortgage balance',
  'refi.value': 'Home value (estimate)',
  'refi.current_rate': 'Current mortgage rate (stated by borrower — never comment on or compare rates)',
  'refi.loan_type': 'Current loan type',
  'refi.purchase_year': 'Year bought',
  'refi.cash_out_amount': 'Cash-out amount wanted',
  'refi.cash_out_use': 'Cash-out use',
  'refi.keep_first': 'Keep current first mortgage',
  'equity.paid_off': 'Home paid off',
  'equity.amount': 'Equity amount wanted',
  'equity.use': 'Use of funds',
  'equity.fixed_preference': 'Wants lump sum / fixed payment',
  'situation.relocation': 'Relocation',
  'situation.divorce_buyout': 'Divorce / buyout',
  'situation.inherited_home': 'Inherited home',
  'situation.delinquent_months': 'Months behind on payments',
  'situation.job_loss': 'Recent job loss',
  'situation.preapproval_letter': 'Mentions a pre-approval letter (Ailana did not issue it — do not confirm it)',
  'situation.competitor_offer': 'Mentions another lender\'s offer (never compare or comment)',
};

const MONEY_KEYS = new Set([
  'debt.monthly_total', 'funds.total', 'purchase.price', 'property.projected_rent',
  'refi.balance', 'refi.value', 'refi.cash_out_amount', 'equity.amount',
]);

function formatIncome(list: IncomeComponent[]): string {
  return list.map((c) => {
    const type = c.type.replace(/_/g, ' ');
    if (c.frequency === 'hourly') {
      return c.annual ? `${type} $${c.amount}/hour × ${c.hours_per_week} h/week = ${money(c.annual)}/yr` : `${type} $${c.amount}/hour (weekly hours not known yet)`;
    }
    const counted = (c.type === 'alimony' || c.type === 'child_support') && c.counted !== true ? ' — only counted if they want it counted' : '';
    const hist = c.history?.length ? ` (history: ${c.history.map(money).join(', ')})` : '';
    return c.annual ? `${type} ${money(c.annual)}/yr${hist}${counted}` : `${type} ${money(c.amount)} (frequency not known yet)${counted}`;
  }).join('; ');
}

function formatValue(e: FactEntry): string {
  const v = e.value;
  if (e.key === 'income.borrower' || e.key === 'income.co_borrower') return formatIncome(v as IncomeComponent[]);
  if (e.key === 'credit.borrower' || e.key === 'credit.co_borrower') {
    const c = v as CreditValue;
    return c.range ?? (c.score !== undefined ? `${c.approx ? 'about ' : ''}${c.score}` : c.tier ?? JSON.stringify(c));
  }
  if (e.key === 'purchase.down_payment') {
    const d = v as { amount?: number; percent?: number };
    return [d.amount !== undefined ? money(d.amount) : null, d.percent !== undefined ? `${d.percent}%` : null].filter(Boolean).join(' / ');
  }
  if (MONEY_KEYS.has(e.key)) return money(v);
  if (typeof v === 'boolean') return v ? 'yes' : 'no';
  if (e.key === 'location.area' && v && typeof v === 'object') {
    const l = v as Record<string, unknown>;
    const parts = [l.area, l.city, l.state, l.zip].filter((x) => typeof x === 'string' && x.trim()) as string[];
    return [...new Set(parts)].join(', ');
  }
  if (e.key === 'debt.items' && Array.isArray(v)) {
    return v.map((d: any) => `${String(d.kind).replace(/_/g, ' ')} ${money(d.monthly)}/month`).join(', ');
  }
  if (e.key === 'funds.sources' && Array.isArray(v)) {
    return v.map((s: any) => `${String(s.kind).replace(/_/g, ' ')}${typeof s.amount === 'number' ? ' ' + money(s.amount) : ''}`).join(', ');
  }
  if (e.key === 'housing.retained_home' && v && typeof v === 'object') {
    const h = v as Record<string, unknown>;
    return [typeof h.balance === 'number' ? `owes ${money(h.balance)}` : '', h.plan ? `plan: ${h.plan}` : '', typeof h.expected_rent === 'number' ? `expected rent ${money(h.expected_rent)}/month` : '']
      .filter(Boolean).join(', ');
  }
  if (typeof v === 'object' && v !== null) {
    // Generic readable form: "from: Atlanta, when: May" — never raw JSON.
    if (Array.isArray(v)) return v.map((x) => (typeof x === 'object' ? JSON.stringify(x) : String(x))).join(', ');
    return Object.entries(v as Record<string, unknown>)
      .filter(([, x]) => x !== null && x !== undefined && x !== '')
      .map(([k, x]) => `${k.replace(/_/g, ' ')}: ${typeof x === 'number' && x > 999 ? money(x) : String(x)}`)
      .join(', ');
  }
  return String(v).replace(/_/g, ' ');
}

const CLARIFY_TEXT: Record<string, string> = {
  weekly_hours: 'how many hours a week they usually work (do NOT assume 40)',
  frequency: 'whether that amount is per month or per year',
  magnitude: 'the exact amount (the number heard was unclear)',
  conflict: 'which number is right — two stated figures do not fit together',
  uncertain: 'which one it is — what they said could mean either',
};

/** The first pending clarification not yet asked (stages ≥ 1 ask it before anything else, once). */
export function nextQuickCheckFor(ledger: FactLedger, asked: string[]): { key: string; label: string; ask: string } | null {
  for (const e of ledger.pendingClarifications()) {
    if (asked.includes(e.key)) continue;
    return { key: e.key, label: `${LABELS[e.key] ?? e.key} (${formatValue(e)})`, ask: `ask ${CLARIFY_TEXT[e.clarify ?? ''] ?? 'to confirm it'}` };
  }
  return null;
}

/** The KNOWN FACTS block for Layer 3. Empty string when nothing is known yet. */
export function formatKnownFacts(ledger: FactLedger): string {
  const known = ledger.known();
  const pending = ledger.pendingClarifications();
  const declined = ledger.declined();
  if (!known.length && !pending.length && !declined.length) return '';

  const lines: string[] = ['=== KNOWN FACTS — the borrower already told you these. NEVER ask for them again (in any wording). ==='];
  for (const e of known) {
    if (e.key === 'goal.primary') continue; // the track is shown in the profile block
    lines.push(`- ${LABELS[e.key] ?? e.key}: ${formatValue(e)}`);
  }
  if (declined.length) {
    lines.push(`- Declined to share (do not ask again): ${declined.map((e) => LABELS[e.key] ?? e.key).join(', ')}`);
  }
  if (pending.length) {
    lines.push('NEEDS ONE QUICK CHECK (ask briefly, one at a time, before relying on it):');
    for (const e of pending) {
      lines.push(`- ${LABELS[e.key] ?? e.key} (${formatValue(e)}): ask ${CLARIFY_TEXT[e.clarify ?? ''] ?? 'to confirm it'}.`);
    }
  }
  lines.push('When you acknowledge what they shared, use ONE short phrase — never read the facts back as a list.');
  lines.push('=== END KNOWN FACTS ===');
  return lines.join('\n');
}

// ── Questions built from what is already known (stages ≥ 1) ─────────────────

const INCOME_TYPE_WORDS = new Set(['salary', 'hourly', 'self_employed_net', 'gig_1099', 'commission', 'bonus', 'pension', 'military_retirement', 'social_security']);

/**
 * The job tenure / income type question (Q44), asking ONLY for what's missing.
 * If how they're paid is already known (any stated income type or employment type),
 * ask just how long they've been in their current work.
 */
export function jobTenureQuestion(ledger: FactLedger, hasCoBorrower: boolean): string {
  const incomes = [
    ...(ledger.value<IncomeComponent[]>('income.borrower') ?? []),
    ...(ledger.value<IncomeComponent[]>('income.co_borrower') ?? []),
  ];
  const payKnown = !!ledger.value('employment.type') || incomes.some((c) => INCOME_TYPE_WORDS.has(c.type));
  const tenureKnown = ledger.value('employment.tenure_years') !== undefined;
  if (payKnown && !tenureKnown) {
    return hasCoBorrower && (ledger.value<IncomeComponent[]>('income.co_borrower') ?? []).length
      ? "How long have each of you been in your current line of work?"
      : "How long have you been in your current line of work?";
  }
  if (tenureKnown && !payKnown) {
    return 'And how are you paid — salaried, hourly, or self-employed?';
  }
  return "Could you tell me a bit about your current job tenure and how you're paid — for example, whether you are salaried, hourly, or self-employed?";
}

/**
 * Situational follow-ups: facts a stated situation makes necessary. Each is asked once, early in
 * Stage 2 (code chooses when; "not sure" moves on). Conditions read only the fact ledger.
 */
interface Followup { id: string; needed: (l: FactLedger) => boolean; ask: string }
/** The area of the home they want — not the place they are leaving (relocation origin). */
export function destinationArea(l: FactLedger): { city?: string; state?: string; zip?: string } | undefined {
  const area = l.value<{ city?: string; state?: string; zip?: string }>('location.area');
  const from = l.value<{ from?: string }>('situation.relocation')?.from;
  const norm = (x?: string) => (x ?? '').toLowerCase().replace(/[^a-z]/g, '');
  if (area && from && area.city && norm(from).startsWith(norm(area.city))) return undefined; // that's where they're leaving
  return area;
}
const allIncome = (l: FactLedger) => [...(l.value<IncomeComponent[]>('income.borrower') ?? []), ...(l.value<IncomeComponent[]>('income.co_borrower') ?? [])];
const FOLLOWUPS: Followup[] = [
  {
    id: 'credit_event_timing',
    needed: (l) => (l.value<Array<{ type: string }>>('credit.events') ?? []).some((e) => ['bankruptcy', 'foreclosure', 'short_sale'].includes(e.type)),
    ask: 'Ask, without judgment, when the bankruptcy, foreclosure or short sale they mentioned was discharged or completed (month and year is enough). If they are not sure, that is fine — move on.',
  },
  {
    id: 'prior_employment',
    needed: (l) => l.value('employment.new_job') !== undefined && l.value('situation.job_loss') !== true, // a stated job loss already covers their previous work
    ask: 'Ask briefly what they did for work before and for how long, so the loan officer has their recent work history. Do not restate or ask again about the new job, and do not ask for an offer letter or any documents.',
  },
  {
    id: 'destination_area',
    needed: (l) => l.value('situation.relocation') !== undefined && destinationArea(l) === undefined,
    ask: 'They are relocating. Ask which city or zip code they are moving to (where they want to buy). Never ask for a street address.',
  },
  {
    id: 'home_value',
    needed: (l) => {
      const g = l.value<string>('goal.primary') ?? '';
      const homeGoal = g.startsWith('refinance') || g === 'heloc' || g === 'home_equity_loan' || g === 'equity_unclear' || g === 'cash_out_unclear';
      return homeGoal && l.value('refi.value') === undefined;
    },
    ask: 'Ask roughly what they think their home is worth today. If they are not sure, an estimate is fine — move on.',
  },
  {
    id: 'self_employed_years',
    needed: (l) => {
      const t = l.value<string>('employment.type');
      const selfEmployed = t === 'self_employed' || t === 'gig_1099' || allIncome(l).some((c) => c.type === 'self_employed_net' || c.type === 'gig_1099');
      return selfEmployed && l.value('employment.tenure_years') === undefined;
    },
    ask: 'Ask how many years they have been doing this self-employed or 1099 work. Do not ask for tax returns, 1099s or any documents.',
  },
  {
    id: 'retained_home_rent',
    needed: (l) => {
      const h = l.value<{ plan?: string; expected_rent?: number }>('housing.retained_home');
      return !!h && h.plan === 'rent' && h.expected_rent === undefined;
    },
    ask: 'Ask how much they expect the home they are keeping to rent for each month. If they are not sure yet, that is fine — move on.',
  },
  {
    id: 'existing_rental_income',
    needed: (l) => {
      const owned = l.value<number>('housing.properties_owned') ?? 0;
      const incomes = [...(l.value<IncomeComponent[]>('income.borrower') ?? []), ...(l.value<IncomeComponent[]>('income.co_borrower') ?? [])];
      return owned > 0 && l.value('occupancy') === 'investment' && !incomes.some((c) => c.type === 'rental' && c.annual);
    },
    ask: 'Ask roughly how much net rental income their current rental properties bring in each month. If they are not sure, that is fine — move on.',
  },
];

/** The next follow-up still needed and not yet asked (never loops: each is asked at most once). */
export function nextSituationalFollowup(ledger: FactLedger, asked: string[]): { id: string; ask: string } | null {
  for (const f of FOLLOWUPS) {
    if (!asked.includes(f.id) && f.needed(ledger)) return { id: f.id, ask: f.ask };
  }
  return null;
}

// ── Section 0 CURRENT TASK (chosen by code) ──────────────────────────────────

export const INTENT_QUESTION = "Great. What brings you here today: buying a home, refinancing, or using your home's equity?";
export const EQUITY_QUESTION = 'Would a line of credit you draw from as needed work better, or one lump sum with a fixed payment? I can explain the difference.';

const GOAL_WORDS: Record<string, string> = {
  purchase: 'buying a home', refinance: 'refinancing', refinance_rate_term: 'refinancing', refinance_cash_out: 'a cash-out refinance',
  heloc: 'a home equity line of credit', home_equity_loan: 'a home equity loan', equity_unclear: 'using their home equity',
  cash_out_unclear: 'taking cash out of their home',
};

export function section0TaskText(decision: Section0Decision | null, ledger: FactLedger): string {
  if (!decision) {
    return `CURRENT TASK (Section 0):\nIf the borrower has not said what they want yet, ask exactly: "${INTENT_QUESTION}"`;
  }
  const answerFirst = 'answerQuestion' in decision && decision.answerQuestion
    ? 'First answer their question briefly and helpfully. Then '
    : '';
  switch (decision.kind) {
    case 'ask_intent':
      if (ledger.known().length) {
        // They already described their situation — ask what they want, in terms of what they said.
        return `CURRENT TASK (Section 0):\n${answerFirst}They shared their situation but not yet what they want to do. In one natural sentence tied to what they told you, ask what they would like to do (the paths are buying a home, refinancing, or using their home's equity). Do not use a canned "what brings you here" line.`;
      }
      return `CURRENT TASK (Section 0):\n${answerFirst}ask exactly: "${INTENT_QUESTION}"`;
    case 'clarify': {
      if (decision.which === 'heloc_vs_heq') return `CURRENT TASK (Section 0):\n${answerFirst}ask exactly: "${EQUITY_QUESTION}"`;
      if (decision.which === 'cash_out_vs_equity') {
        return `CURRENT TASK (Section 0):\n${answerFirst}ask ONE question: would they like to keep their current first mortgage and borrow against their equity, or replace it with a new, larger mortgage (a cash-out refinance)?`;
      }
      if (decision.which === 'which_goal_first') {
        const a = GOAL_WORDS[ledger.value<string>('goal.primary') ?? ''] ?? 'their first goal';
        const b = GOAL_WORDS[ledger.value<string>('goal.secondary') ?? ''] ?? 'their second goal';
        return `CURRENT TASK (Section 0):\n${answerFirst}name both goals (${a} and ${b}) and ask which they'd like to start with. Say you'll keep the other noted for their loan officer.`;
      }
      return `CURRENT TASK (Section 0):\n${answerFirst}offer the three options once — buying a home, refinancing, or using their home's equity — and ask which fits.`;
    }
    case 'offer_general_or_lo':
      return 'CURRENT TASK (Section 0):\nDo NOT repeat the three options. Say you can answer general questions about home financing, or connect them with a licensed loan officer — ask which they would prefer.';
    case 'answer_only':
      return 'CURRENT TASK (Section 0):\nAnswer what they said helpfully and briefly. Do not ask the intent question again.';
    case 'holdout':
      if (decision.holdout === 'hardship') {
        return 'CURRENT TASK (Section 0):\nThey are behind on payments or in financial hardship. Respond with empathy. Do NOT promise or suggest a refinance or any outcome, and do NOT start intake questions. Offer to connect them with a licensed loan officer, and mention that a HUD-approved housing counselor can help at no cost (hud.gov, or 800-569-4287). Ask whether they would like to be connected now or later.';
      }
      return decision.holdout === 'construction'
        ? 'CURRENT TASK (Section 0):\nConstruction / lot / draw financing is handled directly by a licensed loan officer. Briefly explain that and offer to connect them now or set up a callback. Do NOT start discovery questions.'
        : 'CURRENT TASK (Section 0):\nReverse mortgages (HECM) are handled by a licensed loan officer, and HUD requires counseling with an approved HECM counselor before applying. Briefly explain that and offer to connect them now or set up a callback. Do NOT start discovery questions.';
    case 'holdout_followup':
      return `CURRENT TASK (Section 0):
${answerFirst}Do NOT ask discovery questions (no intent, co-borrower, occupancy, income or other qualifying questions) and do NOT offer the loan officer connection again unless they ask for it. Acknowledge briefly, remind them they can reach a licensed loan officer whenever they are ready, and ask if there is anything else you can help with.`;
    case 'out_of_scope':
      return "CURRENT TASK (Section 0):\nSay that this type of loan is outside what you can help with here. Offer help with buying a home, refinancing, or home equity — or the lender's other contact options.";
    case 'off_topic':
      return 'CURRENT TASK (Section 0):\nGive a one-line, friendly redirect back to home financing.';
    case 'ai_disclosure':
      return `CURRENT TASK (Section 0):\nSay clearly that you are an AI assistant, not a person. Then, if they haven't said what they want yet, ask: "${INTENT_QUESTION}"`;
    case 'explain_human_later':
      return 'CURRENT TASK (Section 0):\nExplain that they can talk with a licensed loan officer at any time — now or later — and continue the conversation. Do NOT start a transfer or book anything.';
    case 'callback':
      return 'CURRENT TASK (Section 0):\nThey want a call back. Ask for the day, the time and their time zone, one at a time. Do not claim anything is booked yet.';
    case 'resume':
      return 'CURRENT TASK (Section 0):\nAcknowledge they would rather continue here, and carry on from where you left off.';
    case 'transfer':
      return 'CURRENT TASK (Section 0):\nThe borrower asked for a loan officer. Confirm briefly that you are connecting them.';
    case 'set_track':
      return '';
  }
}

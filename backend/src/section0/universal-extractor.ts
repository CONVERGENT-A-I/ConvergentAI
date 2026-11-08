/**
 * Section 0 — universal extractor (plan §6.4).
 *
 * ONE LLM call per user turn that translates whatever the borrower said — any
 * phrasing — into the fixed schema: facts (FACT_KEYS), one intent, compliance
 * flags, and goal classes. The prompt describes the SCHEMA only; it contains no
 * example phrasings from the test set (that would overfit). Turning values into
 * profile numbers is the normaliser's job (ingest.ts), in code.
 */
import { inference, llm } from '@livekit/agents';
import {
  COMPLIANCE_FLAGS, FACT_KEYS, GOAL_CLASSES, INTENTS,
  isFactKey, isForbiddenKey,
  type ComplianceFlag, type FactKey, type GoalClass, type Intent,
} from './fact-schema.js';

export interface ExtractedFact {
  key: FactKey;
  value: unknown;
  raw: string;
  /** The borrower's words point to two different values → confirm before relying on it. */
  uncertain?: boolean;
}

export interface UniversalExtraction {
  goal: GoalClass | null;
  secondaryGoal: GoalClass | null;
  intent: Intent;
  flags: ComplianceFlag[];
  facts: ExtractedFact[];
  declined: FactKey[];
  /** True if the model output could not be used (then nothing is applied). */
  failed: boolean;
}

export interface ExtractorInput {
  text: string;                    // user turn AFTER the safety net
  lastAssistant: string | null;    // what Ailana last said (resolves "yes", "that one", "about 36")
  track: string | null;            // current transaction type, if any
  knownKeys: string[];             // facts already in the ledger (so the model can label corrections)
}

// ── Prompt (schema only — no test phrasings) ─────────────────────────────────

const FACT_GUIDE = `
FACT KEYS (use only these; omit anything not stated):
- goal.primary, goal.secondary: one of ${GOAL_CLASSES.join(' | ')}
- goal.refi_purpose: lower_payment | remove_co_borrower | shorten_term | cash_out | other
- borrower.first_name (string) · borrower.first_time_buyer (bool) · borrower.existing_member (bool: ALREADY banks or borrowed with THIS lender — "first home" is NOT this)
- occupancy: primary | second_home | investment  (living in part of a multi-unit home = primary)
- timeline (short text)
- co_borrower.present (bool) · co_borrower.relationship (text) · co_borrower.role: co_borrower | co_signer | other_is_primary
- income.borrower, income.co_borrower: ARRAY of {type, amount, frequency, hours_per_week, counted, variable, history, combined}
    type: salary | hourly | self_employed_net | gig_1099 | commission | bonus | social_security | pension | military_retirement | va_disability | alimony | child_support | rental | other
    amount: number exactly as said (e.g. said "68" → 68; said "52 an hour" → 52)
    frequency: hourly | weekly | biweekly | semimonthly | monthly | yearly | null if not said
    hours_per_week: number only if said; counted: true/false only if the borrower said whether to count it; history: past-year amounts if said
    combined: true when one amount is the total for all borrowers together (put it under income.borrower)
- employment.type: w2_salary | w2_hourly | self_employed | gig_1099 | retired | commission | other · employment.occupation (text) · employment.tenure_years (number) · employment.new_job ({starts}: a job they will start or were just offered — also when it is the reason they are moving)
- debt.monthly_total (number per month) · debt.items (array of {kind, monthly})
- credit.borrower, credit.co_borrower: the score/range/tier as said (string)
- credit.events: array of {type: bankruptcy | foreclosure | short_sale | late_payments | other, when}
- funds.total (number as said) · funds.sources (array of {kind: savings | sale_proceeds | retirement | gift | other, amount})
- housing.current: rent | own | own_selling | own_keeping · housing.properties_owned (number) · housing.retained_home ({balance, plan: rent|sell|keep, expected_rent})
- purchase.price (number as said) · purchase.down_payment ({amount} or {percent}) · purchase.zero_down_goal (bool)
- property.type: single_family | condo | townhome | multi_family | manufactured | cabin | other · property.units (number) · property.projected_rent (number per month) · property.rental_plan (bool: they plan to rent this home out, fully or part of the time)
- location.area: {city, state, zip, area} of the home they want to buy or own — NEVER the place they are moving away from, NEVER a street address. state = two-letter code ONLY if they said the state or the city is a major city that exists in just one state; otherwise null. Never guess a state from a landmark, campus, base or area name
- military.status: active | veteran | retired | reserve_guard | surviving_spouse | none · military.years
- refi.balance · refi.value · refi.current_rate · refi.loan_type: conventional|fha|va|usda|unknown · refi.purchase_year · refi.cash_out_amount · refi.cash_out_use · refi.keep_first (bool: false = they said they want to refinance / replace the current mortgage; true = keep it)
- equity.paid_off (bool) · equity.amount · equity.use · equity.fixed_preference (bool: true = lump sum / fixed payment, false = line of credit)
- situation.relocation ({from, to, when}) · situation.divorce_buyout · situation.inherited_home · situation.delinquent_months · situation.job_loss · situation.preapproval_letter · situation.competitor_offer (bools / number)`;

function buildSystemPrompt(): string {
  return `You translate a mortgage borrower's latest message into structured data. You never reply to the borrower.

Return ONLY a JSON object:
{"goal": {"primary": <goal|null>, "secondary": <goal|null>},
 "intent": <one intent>,
 "flags": [<compliance flags>],
 "facts": [{"key": <fact key>, "value": <value>, "raw": <the borrower's own words for it, max 12 words>, "uncertain": <true only if their words point to two different values>}],
 "declined": [<fact keys the borrower explicitly refused or said they don't know>]}

GOALS (what the borrower wants): ${GOAL_CLASSES.join(' | ')}.
- purchase = buy a home. refinance = replace the current mortgage. refinance_rate_term / refinance_cash_out only when the borrower said they want to refinance or replace the mortgage AND the purpose is clear.
- heloc = line of credit on the home. home_equity_loan = lump sum / fixed payment against the home.
- equity_unclear = wants to use home equity, type not clear. cash_out_unclear = wants cash out of the home but did NOT say whether to refinance (replace) or keep the current mortgage.
- construction = building / lot / construction draws. reverse_mortgage = reverse mortgage / HECM.
- out_of_scope = not a home loan (car, personal, business loan). unclear = no goal can be told.
- The goal can be plain from their situation (e.g. moving to a new city while keeping or selling their home = purchase).
- Two DIFFERENT goals named (even if they haven't chosen which comes first) = primary + secondary — never unclear.
- Still deciding WHAT to do with a home (e.g. keep it, sell it, or borrow against it) = unclear. Wants money from the home but how is not clear = cash_out_unclear / equity_unclear.
- secondary = a SECOND, different goal the borrower also mentions; otherwise null.
- Use null when the message says nothing about a goal (e.g. it only answers a question).

INTENT (exactly one): ${INTENTS.join(' | ')}.
- states_goal_or_facts = shares goals or information. asks_question = asks something. requests_transfer_now = wants a human / loan officer now.
- asks_about_human_later = asks whether a person can help later, without asking for one now. requests_callback = wants a call back / appointment.
- cancels_transfer = takes back a request for a person. declines_to_answer = refuses or doesn't know. concern_or_worry = expresses worry.
- off_topic = not about home financing. asks_if_human = asks whether you are a person or AI. ends_conversation = they are wrapping up (done for now, thanks, goodbye).

COMPLIANCE FLAGS (any that apply): ${COMPLIANCE_FLAGS.join(' | ')}.
- approval_guarantee_or_preapproval_letter = they mention a pre-approval, approval, letter or offer they received (from anyone), or ask for a guarantee. Also set situation.preapproval_letter = true.
${FACT_GUIDE}

RULES
1. Extract ONLY what the borrower actually said in this message. Never guess, infer or fill defaults.
2. Numbers as said — do not convert units or annualise (a spoken "k" or "thousand" may be written out); include the frequency when it was said.
3. If the borrower corrects themselves in the same message, output only the corrected value.
4. Attribute income and credit to the right person (borrower vs co-borrower).
5. Use the assistant's last question to understand short answers ("yes", "about 36", "the second one").
6. NEVER output a Social Security number, a street address, account numbers, race, ethnicity, national origin, religion, age or familial status — not as a key, not inside any value, not in a raw quote. A city, state or zip is fine.
7. If the borrower asks to state a number different from the truth, output only the true number and add the flag inflate_income_request.
8. If the borrower's words fit two different CHOICES for occupancy, property type, current housing or loan type, give the most likely one and add "uncertain": true. Never mark numbers (amounts, scores) uncertain — two scores for two people are two facts.
9. Output valid JSON only — no prose, no code fences.`;
}

function buildUserPrompt(input: ExtractorInput): string {
  return [
    `Current track: ${input.track ?? 'not set yet'}`,
    `Facts already known: ${input.knownKeys.length ? input.knownKeys.join(', ') : 'none'}`,
    `Assistant's last message: ${input.lastAssistant ?? 'None'}`,
    `Borrower's message: "${input.text}"`,
  ].join('\n');
}

// ── Parsing (pure — unit tested) ─────────────────────────────────────────────

const EMPTY: UniversalExtraction = {
  goal: null, secondaryGoal: null, intent: 'states_goal_or_facts', flags: [], facts: [], declined: [], failed: true,
};

function asGoal(v: unknown): GoalClass | null {
  return typeof v === 'string' && (GOAL_CLASSES as readonly string[]).includes(v) ? (v as GoalClass) : null;
}

/** Strip code fences, find the JSON object, and validate every field against the schema. */
export function parseUniversalResponse(raw: string | null | undefined): UniversalExtraction {
  if (!raw) return { ...EMPTY };
  let text = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) return { ...EMPTY };
  text = text.slice(start, end + 1);

  let obj: any;
  try {
    obj = JSON.parse(text);
  } catch {
    return { ...EMPTY };
  }
  if (!obj || typeof obj !== 'object') return { ...EMPTY };

  const intent: Intent = (INTENTS as readonly string[]).includes(obj.intent) ? obj.intent : 'states_goal_or_facts';
  const flags: ComplianceFlag[] = Array.isArray(obj.flags)
    ? obj.flags.filter((f: unknown): f is ComplianceFlag => typeof f === 'string' && (COMPLIANCE_FLAGS as readonly string[]).includes(f))
    : [];

  const facts: ExtractedFact[] = [];
  if (Array.isArray(obj.facts)) {
    for (const f of obj.facts) {
      if (!f || typeof f.key !== 'string') continue;
      if (isForbiddenKey(f.key) || !isFactKey(f.key)) continue;
      if (f.value === undefined || f.value === null || f.value === '') continue;
      facts.push({ key: f.key, value: f.value, raw: typeof f.raw === 'string' ? f.raw.slice(0, 160) : '', ...(f.uncertain === true ? { uncertain: true } : {}) });
    }
  }

  const declined: FactKey[] = Array.isArray(obj.declined)
    ? obj.declined.filter((k: unknown): k is FactKey => typeof k === 'string' && isFactKey(k) && !isForbiddenKey(k))
    : [];

  // goal may arrive as {primary, secondary} or as facts goal.primary / goal.secondary
  let goal = asGoal(obj.goal?.primary);
  let secondaryGoal = asGoal(obj.goal?.secondary);
  for (const f of facts) {
    if (f.key === 'goal.primary' && !goal) goal = asGoal(f.value);
    if (f.key === 'goal.secondary' && !secondaryGoal) secondaryGoal = asGoal(f.value);
  }

  return { goal, secondaryGoal, intent, flags, facts, declined, failed: false };
}

// ── LLM call ─────────────────────────────────────────────────────────────────

let extractorLlm: inference.LLM | null = null;
function getLlm(): inference.LLM {
  // Created lazily (not at import) so tests and tools can load this module without credentials.
  if (!extractorLlm) extractorLlm = new inference.LLM({ model: 'google/gemma-4-31b-it' });
  return extractorLlm;
}

export async function extractUniversal(input: ExtractorInput): Promise<UniversalExtraction> {
  const t0 = Date.now();
  try {
    const chatCtx = new llm.ChatContext();
    chatCtx.addMessage({ role: 'system', content: buildSystemPrompt() });
    chatCtx.addMessage({ role: 'user', content: buildUserPrompt(input) });
    const collected = await getLlm().chat({ chatCtx }).collect();
    const result = parseUniversalResponse(collected.text);
    console.log(`[section0] extractor ${result.failed ? 'FAILED to parse' : 'ok'} in ${Date.now() - t0} ms — goal=${result.goal ?? '-'}${result.secondaryGoal ? '+' + result.secondaryGoal : ''} intent=${result.intent} facts=${result.facts.length} flags=[${result.flags.join(',')}]`);
    return result;
  } catch (err: any) {
    console.error(`[section0] extractor call failed after ${Date.now() - t0} ms:`, err?.message ?? err);
    return { ...EMPTY };
  }
}

/** Exposed for tests / review only. */
export const _prompts = { buildSystemPrompt, buildUserPrompt, FACT_KEYS };

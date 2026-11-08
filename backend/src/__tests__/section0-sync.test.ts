// Section 0 end-to-end without the LLM: what the extractor returns → ledger → profile →
// the EXISTING state machine skips everything already known (the no-repeat rule).
process.env.SECTION_0_ENABLED = 'true';
import 'dotenv/config';

import { SessionContextManager } from '../context/session-context-manager.js';
import { parseUniversalResponse, type UniversalExtraction } from '../section0/universal-extractor.js';
import { ingestExtraction } from '../section0/ingest.js';
import { syncLedgerToProfile } from '../section0/ledger-sync.js';
import { FactLedger } from '../section0/fact-ledger.js';
import { formatKnownFacts } from '../section0/turn-context.js';

console.log('🧪 Section 0 — extractor parsing, ingest, ledger → profile sync, no-repeat flow\n');

let total = 0;
function assert(cond: boolean, name: string, detail?: unknown) {
  total++;
  if (cond) console.log(`  ✅ ${total}. ${name}`);
  else { console.error(`  ❌ ${total}. FAILED: ${name}`, typeof detail === 'string' ? detail : JSON.stringify(detail ?? '')); process.exit(1); }
}

const quietLog = console.log;
function quietly<T>(fn: () => T): T { console.log = () => {}; try { return fn(); } finally { console.log = quietLog; } }
async function quietlyAsync<T>(fn: () => Promise<T>): Promise<T> { console.log = () => {}; try { return await fn(); } finally { console.log = quietLog; } }

const ex = (o: Partial<UniversalExtraction>): UniversalExtraction => ({
  goal: null, secondaryGoal: null, intent: 'states_goal_or_facts', flags: [], facts: [], declined: [], failed: false, ...o,
});

function newManager(): SessionContextManager {
  return quietly(() => new SessionContextManager({} as any, { markLlmStart() {} } as any));
}

/** Run one Section 0 / stage turn with a given extraction (no LLM). */
async function turn(cm: SessionContextManager, e: UniversalExtraction) {
  const anyCm = cm as any;
  anyCm.turnCount += 1;
  await quietlyAsync(async () => {
    if (cm.getActiveStage() === '0') await anyCm.runSection0Turn(Promise.resolve(e));
    else await anyCm.applyUniversalExtraction(Promise.resolve(e));
  });
}

// ── 1. Parser ────────────────────────────────────────────────────────────────
{
  const r = parseUniversalResponse('```json\n{"goal":{"primary":"purchase","secondary":null},"intent":"states_goal_or_facts","flags":["rate_or_payment_request","bogus"],"facts":[{"key":"credit.borrower","value":"710","raw":"710"},{"key":"borrower.ssn","value":"412556789"},{"key":"made.up","value":1}],"declined":["borrower.first_name","x"]}\n```');
  assert(!r.failed && r.goal === 'purchase', 'parses fenced JSON, reads goal');
  assert(r.flags.length === 1 && r.flags[0] === 'rate_or_payment_request', 'drops unknown flags');
  assert(r.facts.length === 1 && r.facts[0]!.key === 'credit.borrower', 'drops forbidden (SSN) and unknown keys');
  assert(r.declined.length === 1, 'keeps only valid declined keys');
  assert(parseUniversalResponse('not json at all').failed, 'garbage → failed (nothing applied)');
  assert(parseUniversalResponse(null).failed, 'empty → failed');
}

// ── 2. Test #1 (A2): one opening → track set, NO confirmation, nothing re-asked ──
{
  const cm = newManager();
  assert(cm.getActiveStage() === '0' && cm.getPendingField() === 'section0', 'session starts in Section 0');
  await turn(cm, ex({
    goal: 'purchase',
    facts: [
      { key: 'occupancy', value: 'primary', raw: 'as my residence' },
      { key: 'income.borrower', value: [{ type: 'salary', amount: 84000, frequency: 'yearly' }], raw: '84,000 per year' },
      { key: 'debt.monthly_total', value: 1200, raw: '1200.00 per month' },
      { key: 'credit.borrower', value: '710', raw: 'my credit score is 710' },
    ],
  }));
  const p = cm.getProfile();
  assert(p.transaction_type === 'TT-PUR' && p.mortgage_goal_confirmed === true, 'Purchase set in one turn (no confirmation turn)');
  assert(cm.getActiveStage() === '1' && cm.getPendingField() === 'borrower_name', 'first track turn asks the first name');
  assert(p.occupancy === 'primary' && p.occupancy_confirmed === true, 'occupancy captured → Q10 skipped');
  assert(p.gross_annual_income === 84000 && p.gross_annual_income_confirmed === true, 'income $84,000 captured → Q35 skipped');
  assert(p.monthly_debt === 1200 && p.monthly_debt_confirmed === true, 'debts $1,200 captured → Q36 skipped');
  assert(p.credit_range === '710' && p.credit_score === 710 && p.credit_range_confirmed === true, 'credit 710 captured → Q37 skipped');

  // Name → existing relationship (occupancy already known) → timeline → co-borrower → Stage 2
  await turn(cm, ex({ facts: [{ key: 'borrower.first_name', value: 'Jordan', raw: 'Jordan' }] }));
  assert(cm.getPendingField() === 'existing_relationship', 'after the name: existing relationship (occupancy skipped)', cm.getPendingField());
  await turn(cm, ex({ facts: [{ key: 'borrower.existing_member', value: false, raw: 'first time' }] }));
  await turn(cm, ex({ facts: [{ key: 'timeline', value: 'within three months', raw: '' }] }));
  await turn(cm, ex({ facts: [{ key: 'co_borrower.present', value: false, raw: 'on my own' }] }));
  assert(cm.getActiveStage() === '2', 'Stage 2 reached');
  assert(cm.getPendingField() === 'down_payment', 'Stage 2 starts at down payment — income, debts, credit all skipped', cm.getPendingField());
}

// ── 3. Test #2: hourly pay → ask hours, never assume 40; spouse + funds + area kept ──
{
  const cm = newManager();
  await turn(cm, ex({
    goal: 'purchase',
    facts: [
      { key: 'co_borrower.present', value: true, raw: 'my husband and I' },
      { key: 'borrower.first_time_buyer', value: true, raw: 'first home' },
      { key: 'location.area', value: { city: 'Ooltewah' }, raw: 'around Ooltewah' },
      { key: 'income.borrower', value: [{ type: 'hourly', amount: 52, frequency: 'hourly' }], raw: '52 an hour' },
      { key: 'income.co_borrower', value: [{ type: 'salary', amount: 48000, frequency: 'yearly' }], raw: '48,000' },
      { key: 'funds.total', value: 25000, raw: '25 thousand' },
      { key: 'debt.items', value: [{ kind: 'car', monthly: 450 }], raw: '450 car payment' },
    ],
  }));
  const p = cm.getProfile();
  const L = cm.getFactLedger();
  assert(p.co_borrower === 'yes' && p.co_borrower_confirmed === true, 'co-borrower captured → Q13 skipped');
  assert(p.existing_relationship_confirmed !== true, '"first home" is NOT taken as "first time with this lender"');
  assert(p.gross_annual_income_confirmed !== true, 'income NOT synced while weekly hours are unknown');
  assert(L.pendingClarifications().some((e) => e.clarify === 'weekly_hours'), 'ledger flags weekly hours to ask');
  assert(/weekly hours not known|how many hours a week/i.test(formatKnownFacts(L)), 'KNOWN FACTS tells Ailana to ask the hours (never assume 40)');
  assert(p.monthly_debt === 450 && p.down_payment === 25000 && p.zip_code === 'Ooltewah', 'debts $450, funds $25,000, area Ooltewah captured');

  // Borrower answers "about 36 hours" → income resolves and syncs
  await turn(cm, ex({ facts: [{ key: 'income.borrower', value: [{ type: 'hourly', hours_per_week: 36 }], raw: 'about 36' }] }));
  assert(cm.getProfile().gross_annual_income === 52 * 36 * 52 + 48000, 'after hours: household income = $97,344 + $48,000', cm.getProfile().gross_annual_income);
}

// ── 4. Test #13 (A11): self-correction kept, duplex near UTC captured ──
{
  const cm = newManager();
  await turn(cm, ex({
    goal: 'purchase',
    facts: [
      { key: 'property.type', value: 'multi_family', raw: 'duplex' },
      { key: 'occupancy', value: 'primary', raw: 'live in one side' },
      { key: 'location.area', value: { area: 'near UTC' }, raw: 'near UTC' },
      { key: 'income.borrower', value: [{ type: 'salary', amount: 68 }], raw: 'I make 68' },
      { key: 'property.projected_rent', value: 1300, raw: '1,300' },
      { key: 'debt.monthly_total', value: 300, raw: '300 a month' },
    ],
  }));
  const p = cm.getProfile();
  assert(p.monthly_debt === 300, 'debt $300 (the corrected value), never $3,000');
  assert(p.gross_annual_income === 68000, '"I make 68" → $68,000');
  assert(p.property_type === 'multi_family' && p.property_type_confirmed === true && p.zip_code === 'near UTC', 'duplex + area captured → Q42 skipped');
  assert(p.occupancy === 'primary', 'living in one unit → primary residence');
}

// ── 5. Corrections across turns overwrite; soft-pull values are not overwritten by stale facts ──
{
  const L = new FactLedger({ log: () => {} });
  const profile: any = {};
  const synced = {};
  ingestExtraction(ex({ facts: [{ key: 'purchase.price', value: 400, raw: '400' }] }), L, 1, '2');
  syncLedgerToProfile(L, profile, synced);
  assert(profile.target_price === 400000, 'price "400" → $400,000');
  ingestExtraction(ex({ facts: [{ key: 'purchase.price', value: 350, raw: 'actually 350' }] }), L, 2, '2');
  quietly(() => syncLedgerToProfile(L, profile, synced));
  assert(profile.target_price === 350000, 'later correction overwrites ($350,000)');
  profile.credit_range = '700-749'; // e.g. set later by the soft pull
  ingestExtraction(ex({ facts: [{ key: 'credit.borrower', value: '710', raw: '710' }] }), L, 3, '2');
  quietly(() => syncLedgerToProfile(L, profile, synced));
  profile.credit_range = '700-749 (verified)';
  quietly(() => syncLedgerToProfile(L, profile, synced));
  assert(profile.credit_range === '700-749 (verified)', 'unchanged ledger fact does NOT overwrite a newer profile value');
}

// ── 6. Declined → never asked again ──
{
  const cm = newManager();
  await turn(cm, ex({ goal: 'refinance', facts: [{ key: 'refi.balance', value: 310, raw: 'owe about 310' }, { key: 'refi.value', value: 450, raw: 'worth maybe 450' }] }));
  assert(cm.getPendingField() === 'borrower_name', 'refinance set; asks first name');
  await turn(cm, ex({ intent: 'declines_to_answer', declined: ['borrower.first_name'] }));
  assert(cm.getProfile().borrower_name_confirmed === true && cm.getPendingField() !== 'borrower_name', 'declined name → moves on, never asked again');
  assert(cm.getProfile().first_mortgage_balance === 310000 && cm.getProfile().property_value === 450000, 'refi balance $310k / value $450k captured');
}

// ── 7. Section 0 routing in the manager: unclear → options once → help, never loop ──
{
  const cm = newManager();
  (cm as any).section0State.intentAsked = true; // the intent question was asked after the card tap
  await turn(cm, ex({ goal: 'unclear' }));
  assert(cm.getActiveStage() === '0' && /three options/.test(cm.getDynamicContext()), '"Yeah." → offer the three options once');
  await turn(cm, ex({ intent: 'declines_to_answer' }));
  assert(/connect them with a licensed loan officer/.test(cm.getDynamicContext()), '"I don\'t know." → general questions or a loan officer');
  await turn(cm, ex({ goal: 'construction' }));
  assert(cm.getActiveStage() === '0' && /Construction/.test(cm.getDynamicContext()), 'construction → holdout, no track started');
}

// ── 8. Memory survives a reconnect (snapshot → hydrate) ──
{
  const cm = newManager();
  await turn(cm, ex({ goal: 'purchase', facts: [{ key: 'credit.borrower', value: '745', raw: '745' }, { key: 'funds.total', value: 55000, raw: '55k' }] }));
  const snap = JSON.parse(JSON.stringify({ stage: cm.getActiveStage(), profile: { ...cm.getProfile(), statedFacts: cm.getSection0Snapshot() } }));
  const cm2 = newManager();
  quietly(() => cm2.hydrateFromSnapshot(snap.stage, snap.profile));
  assert(cm2.getFactLedger().value<any>('credit.borrower')?.score === 745, 'ledger restored from the snapshot');
  assert(/Funds available: \$55,000/.test(cm2.getDynamicContext()), 'KNOWN FACTS after reconnect still lists the funds');
}

// ── 9. S1 fix: the Stage 1→2 bridge must not announce finances that are already known (#1) ──
{
  const cm = newManager();
  await turn(cm, ex({
    goal: 'purchase',
    facts: [
      { key: 'occupancy', value: 'primary', raw: '' },
      { key: 'income.borrower', value: [{ type: 'salary', amount: 84000, frequency: 'yearly' }], raw: '' },
      { key: 'debt.monthly_total', value: 1200, raw: '' },
      { key: 'credit.borrower', value: '710', raw: '' },
    ],
  }));
  await turn(cm, ex({ facts: [{ key: 'borrower.first_name', value: 'Jordan', raw: '' }] }));
  await turn(cm, ex({ facts: [{ key: 'borrower.existing_member', value: false, raw: '' }] }));
  await turn(cm, ex({ facts: [{ key: 'timeline', value: 'three months', raw: '' }] }));
  await turn(cm, ex({ facts: [{ key: 'co_borrower.present', value: false, raw: '' }] }));
  const ctx = cm.getDynamicContext();
  assert(cm.getProfile().bridge_to_say === 'stage1_to_stage2' && /I just need a few more details/.test(ctx), 'bridge uses the "few more details" wording');
  assert(!/income, current debts, credit profile/.test(ctx), 'bridge does NOT announce income/debts/credit again');
}

// ── 10. S1 fix: job tenure asks only what's missing; retained-home rent asked once before the closing offer (#30) ──
{
  const cm = newManager();
  await turn(cm, ex({
    goal: 'purchase',
    facts: [
      { key: 'co_borrower.present', value: true, raw: 'my wife' },
      { key: 'income.borrower', value: [{ type: 'salary', amount: 60, frequency: 'yearly' }, { type: 'commission', amount: 40, frequency: 'yearly', variable: true }], raw: '' },
      { key: 'income.co_borrower', value: [{ type: 'salary', amount: 85, frequency: 'yearly' }], raw: '' },
      { key: 'credit.borrower', value: '700', raw: '' },
      { key: 'funds.total', value: 55000, raw: '' },
      { key: 'debt.monthly_total', value: 1100, raw: '' },
      { key: 'housing.current', value: 'own_keeping', raw: '' },
      { key: 'housing.retained_home', value: { balance: 220, plan: 'rent' }, raw: 'keeping the Atlanta house' },
    ],
  }));
  const p = cm.getProfile();
  assert(p.gross_annual_income === 185000, 'household income $185,000 (both spouses, commission included)');
  // Stage 1 (only the still-missing items)
  for (const f of [
    { key: 'borrower.first_name', value: 'Morgan' }, { key: 'occupancy', value: 'primary' }, { key: 'borrower.existing_member', value: false },
    { key: 'timeline', value: 'three months' },
  ] as const) {
    await turn(cm, ex({ facts: [{ key: f.key as any, value: f.value, raw: '' }] }));
  }
  // Stage 2 opens with the follow-up the borrower's own story calls for (asked early, once)
  assert(cm.getActiveStage() === '2' && cm.getPendingField() === 'section0_followup', 'Stage 2 starts with the situational follow-up', cm.getPendingField());
  assert(/rent for each month/.test(cm.getDynamicContext()), 'follow-up asks the expected rent on the home they are keeping');
  await quietlyAsync(() => cm.onAgentTurn('How much do you expect the Atlanta home to rent for each month?'));
  await turn(cm, ex({ facts: [{ key: 'housing.retained_home', value: { expected_rent: 2100 }, raw: 'about 2,100' }] }));
  const kept = cm.getFactLedger().value<any>('housing.retained_home');
  assert(kept.expected_rent === 2100 && kept.balance === 220000 && kept.plan === 'rent', 'expected rent merged in; balance and plan kept');
  assert(cm.getPendingField() !== 'section0_followup', 'follow-up not asked again', cm.getPendingField());

  for (const f of [
    { key: 'purchase.price', value: 450 }, { key: 'property.type', value: 'single_family' },
    { key: 'location.area', value: { city: 'Chattanooga', state: 'TN', zip: '37421' } }, { key: 'military.status', value: 'none' },
  ] as const) {
    await turn(cm, ex({ facts: [{ key: f.key as any, value: f.value, raw: '' }] }));
  }
  // realtor_status is still a Stage 2 question (not stated) — answer it as the track normally would
  if (cm.getPendingField() === 'realtor_status') { cm.getProfile().realtor_status = 'no'; cm.getProfile().realtor_status_confirmed = true; quietly(() => cm.advanceWorkflow()); }
  assert(cm.getPendingField() === 'job_tenure_type', 'reaches job tenure', cm.getPendingField());
  assert(/How long have each of you been in your current line of work\?/.test(cm.getDynamicContext()), 'job tenure question asks ONLY how long (pay type already known)');
  assert(!/salaried, hourly, or self-employed/.test(cm.getDynamicContext()), 'does not re-ask how they are paid');

  cm.getProfile().job_tenure_type = '6 years sales; 9 years nurse'; cm.getProfile().job_tenure_type_confirmed = true;
  quietly(() => cm.advanceWorkflow());
  assert(cm.getPendingField() === 'stage2_closing_offer', 'then the closing offer', cm.getPendingField());
}

// ── 11. Follow-up is never asked twice ("not sure" → move on) ──
{
  const cm = newManager();
  await turn(cm, ex({ goal: 'purchase', facts: [{ key: 'housing.retained_home', value: { plan: 'rent' }, raw: '' }] }));
  const prof = cm.getProfile() as any;
  for (const k of ['borrower_name', 'occupancy', 'existing_relationship', 'timeline', 'co_borrower', 'gross_annual_income', 'monthly_debt', 'credit_range', 'down_payment', 'rent_own', 'realtor_status', 'target_price', 'property_type', 'military_rural', 'job_tenure_type']) prof[`${k}_confirmed`] = true;
  cm.setActiveStage('2');
  quietly(() => cm.advanceWorkflow());
  assert(cm.getPendingField() === 'section0_followup', 'follow-up pending');
  await quietlyAsync(() => cm.onAgentTurn('How much do you expect it to rent for?'));
  await turn(cm, ex({ intent: 'declines_to_answer' }));
  assert(cm.getPendingField() === 'stage2_closing_offer', '"not sure" → closing offer, follow-up not repeated', cm.getPendingField());
}

// ── 12. S0-18: Purchase → "actually I already own and want to refinance" keeps every shared fact ──
{
  const cm = newManager();
  await turn(cm, ex({
    goal: 'purchase',
    facts: [
      { key: 'income.borrower', value: [{ type: 'salary', amount: 84000, frequency: 'yearly' }], raw: '' },
      { key: 'debt.monthly_total', value: 1200, raw: '' },
      { key: 'credit.borrower', value: '710', raw: '' },
      { key: 'purchase.price', value: 350, raw: '' },
      { key: 'housing.current', value: 'rent', raw: '' },
    ],
  }));
  await turn(cm, ex({ facts: [{ key: 'borrower.first_name', value: 'Jordan', raw: '' }] }));
  assert(cm.getProfile().target_price === 350000, 'purchase price known before the switch');
  await turn(cm, ex({ goal: 'refinance', facts: [{ key: 'housing.current', value: 'own', raw: 'I already own' }] }));
  const p = cm.getProfile();
  assert(p.transaction_type === 'TT-REF' && p.mortgage_goal === 'refinance', 'track switched to Refinance');
  assert(p.borrower_name === 'Jordan' && p.gross_annual_income === 84000 && p.monthly_debt === 1200 && p.credit_range_confirmed === true, 'name, income, debts, credit kept');
  assert(p.target_price == null && p.target_price_confirmed === false, 'purchase-only price cleared from the profile');
  assert(cm.getFactLedger().value('purchase.price') === 350000, 'ledger still remembers what was said');
  assert(!['borrower_name', 'gross_annual_income', 'monthly_debt', 'credit_range'].includes(String(cm.getPendingField())), 'next question is not a known fact', cm.getPendingField());
  assert(/GOAL CHANGED: the borrower now wants a refinance/.test(cm.getDynamicContext()), 'one-turn note: acknowledge the goal change');
  await quietlyAsync(() => cm.onAgentTurn('Got it, a refinance instead. What is your timeline?'));
  assert(!/GOAL CHANGED/.test(cm.getDynamicContext()), 'note disappears after Ailana answers');

  // A question about another product is not a switch
  await turn(cm, ex({ goal: 'heloc', intent: 'asks_question' }));
  assert(cm.getProfile().transaction_type === 'TT-REF', 'asking about HELOCs does not switch the track');

  // Switching back restores the purchase price from memory
  await turn(cm, ex({ goal: 'purchase' }));
  assert(cm.getProfile().transaction_type === 'TT-PUR' && cm.getProfile().target_price === 350000, 'back to Purchase → price restored from the ledger');
}

// ── 14. Preview fixes, fed with the extractor's REAL output for those turns ──
{
  // #2: "I usually work 36 hours a week." arrives as {hours_per_week: 36} with no type
  const cm = newManager();
  await turn(cm, ex({ goal: 'purchase', facts: [
    { key: 'co_borrower.present', value: true, raw: '' },
    { key: 'income.borrower', value: [{ type: 'hourly', amount: 52 }], raw: '52 an hour' },
    { key: 'income.co_borrower', value: [{ type: 'salary', amount: 48000, frequency: 'yearly' }], raw: '' },
  ] }));
  assert(cm.getFactLedger().get('income.borrower')?.status === 'needs_clarification', '#2: hourly pay waits for weekly hours');
  await turn(cm, ex({ facts: [{ key: 'income.borrower', value: [{ hours_per_week: 36 }], raw: '36 hours a week' }] }));
  const inc = cm.getFactLedger().value<any[]>('income.borrower') ?? [];
  assert(inc.length === 1 && inc[0].type === 'hourly' && inc[0].annual === 97344, '#2: type-less hours attach to the hourly pay (52 × 36 × 52)', inc);
  assert(cm.getProfile().gross_annual_income === 145344, '#2: household income $145,344', cm.getProfile().gross_annual_income);
}
{
  // Same reply, but the model labelled it "salary" (seen live): a detail with no amount still completes the hourly pay
  const cm = newManager();
  await turn(cm, ex({ goal: 'purchase', facts: [{ key: 'income.borrower', value: [{ type: 'hourly', amount: 52 }], raw: '52 an hour' }] }));
  await turn(cm, ex({ facts: [{ key: 'income.borrower', value: { type: 'salary', hours_per_week: 36 }, raw: '36 hours a week' }] }));
  const inc = cm.getFactLedger().value<any[]>('income.borrower') ?? [];
  assert(inc.length === 1 && inc[0].type === 'hourly' && inc[0].annual === 97344, '#2: mislabelled detail still attaches to the waiting hourly pay', inc);
}
{
  // #4: "We both work, combined around 140,000" → one combined amount
  const cm = newManager();
  await turn(cm, ex({ goal: 'refinance_rate_term', facts: [
    { key: 'co_borrower.present', value: true, raw: '' },
    { key: 'income.borrower', value: [{ type: 'other', amount: 140000, frequency: 'yearly', combined: true }], raw: 'combined around 140,000' },
  ] }));
  assert(cm.getProfile().gross_annual_income === 140000 && cm.getProfile().gross_annual_income_confirmed === true, '#4: combined household income counts — not re-asked');
}
{
  // #3: retired military, benefit income only, "nothing down"
  const cm = newManager();
  await turn(cm, ex({ goal: 'purchase', facts: [
    { key: 'military.status', value: 'retired', raw: '' },
    { key: 'income.borrower', value: [{ type: 'military_retirement', amount: 3100, frequency: 'monthly' }, { type: 'va_disability', amount: 1800, frequency: 'monthly' }], raw: '' },
    { key: 'purchase.zero_down_goal', value: true, raw: 'nothing down' },
    { key: 'credit.borrower', value: '680', raw: '' },
  ] }));
  const p = cm.getProfile();
  assert(p.gross_annual_income === 58800, '#3: retirement + VA disability = $58,800/yr');
  assert(p.down_payment_confirmed === true && p.down_payment === 0, '#3: zero-down goal answers the down-payment question');
  assert(p.job_tenure_type_confirmed === true, '#3: benefit income only → no job-tenure question');
  // Stage 2 must still ask what is genuinely missing (debts) — the old tenure shortcut must not skip it
  for (const f of [{ key: 'borrower.first_name', value: 'Sam' }, { key: 'occupancy', value: 'primary' }, { key: 'borrower.existing_member', value: false }, { key: 'timeline', value: 'two months' }, { key: 'co_borrower.present', value: false }] as const) {
    await turn(cm, ex({ facts: [{ key: f.key as any, value: f.value, raw: '' }] }));
  }
  assert(cm.getActiveStage() === '2' && cm.getPendingField() === 'monthly_debt', '#3: Stage 2 asks the debts (not skipped to the closing offer)', cm.getPendingField());
}
{
  // #15: occupancy that points two ways → one confirmation; "combined 210"
  const cm = newManager();
  await turn(cm, ex({ goal: 'purchase', facts: [
    { key: 'occupancy', value: 'second_home', raw: "vacation place and we'd Airbnb it", uncertain: true },
    { key: 'co_borrower.present', value: true, raw: '' },
    { key: 'income.borrower', value: [{ type: 'other', amount: 210, combined: true }], raw: 'Combined income is 210' },
  ] }));
  assert(cm.getFactLedger().get('occupancy')?.status === 'needs_clarification', '#15: occupancy marked for one quick check');
  assert(/Occupancy[^\n]*which one it is/.test(cm.getDynamicContext()), '#15: Ailana is told to check which it is');
  assert(cm.getProfile().occupancy_confirmed !== true, '#15: occupancy is not treated as settled');
  assert(cm.getProfile().gross_annual_income === 210000, '#15: combined income $210,000 counts');
}
{
  // Follow-ups early in Stage 2: bankruptcy timing, prior employment, self-employed years
  const cm = newManager();
  await turn(cm, ex({ goal: 'purchase', facts: [
    { key: 'credit.events', value: [{ type: 'bankruptcy', when: 'two years ago' }], raw: '' },
    { key: 'employment.new_job', value: { starts: 'in two weeks' }, raw: '' },
  ] }));
  for (const f of [{ key: 'borrower.first_name', value: 'Jesse' }, { key: 'occupancy', value: 'primary' }, { key: 'borrower.existing_member', value: false }, { key: 'timeline', value: 'six months' }, { key: 'co_borrower.present', value: false }] as const) {
    await turn(cm, ex({ facts: [{ key: f.key as any, value: f.value, raw: '' }] }));
  }
  assert(cm.getPendingField() === 'section0_followup' && /discharged/.test(cm.getDynamicContext()), 'Stage 2 opens with the bankruptcy discharge date', cm.getPendingField());
  await quietlyAsync(() => cm.onAgentTurn('When was the bankruptcy discharged?'));
  await turn(cm, ex({ facts: [] }));
  assert(cm.getPendingField() === 'section0_followup' && /what they did for work before and for how long/.test(cm.getDynamicContext()), 'then prior employment (new job not started)');
  await quietlyAsync(() => cm.onAgentTurn('What did you do before this job?'));
  await turn(cm, ex({ facts: [] }));
  assert(cm.getPendingField() !== 'section0_followup', 'then the track continues — each follow-up asked once', cm.getPendingField());
}
{
  // Compliance notes reach the prompt once, then disappear
  const cm = newManager();
  await turn(cm, ex({ goal: 'refinance', flags: ['privacy_question'], facts: [{ key: 'refi.balance', value: 200, raw: '' }] }));
  const ctx = cm.getDynamicContext();
  assert(/COMPLIANCE \(this reply\)/.test(ctx) && /I'm provided by ConvergentAI/.test(ctx), 'privacy question → approved answer in this reply');
  assert(/let's pick up with your refinance\./.test(ctx), 'the privacy answer returns to their refinance');
  await quietlyAsync(() => cm.onAgentTurn("That's a fair question to ask before we start..."));
  assert(!/COMPLIANCE/.test(cm.getDynamicContext()), 'note is gone after Ailana answers');
  await turn(cm, ex({ flags: ['privacy_question'] }));
  assert(!/COMPLIANCE/.test(cm.getDynamicContext()), 'never repeated in the same session');
}
{
  // #8: construction → holdout response, then no intake questions on later turns
  const cm = newManager();
  await turn(cm, ex({ goal: 'construction', facts: [{ key: 'refi.value', value: 380, raw: '' }] }));
  assert(/Construction \/ lot \/ draw/.test(cm.getDynamicContext()), '#8: construction bridge response first');
  await turn(cm, ex({ intent: 'asks_about_human_later' }));
  assert(cm.getActiveStage() === '0' && /Do NOT ask discovery questions/.test(cm.getDynamicContext()), '#8: later turns stay in the holdout, no intake questions');
}

{
  // #15 (code rule): second home + plans to rent it out → occupancy confirmed once; a duplex they live in is fine
  const cm = newManager();
  await turn(cm, ex({ goal: 'purchase', facts: [
    { key: 'occupancy', value: 'second_home', raw: 'vacation place' },
    { key: 'property.rental_plan', value: true, raw: "we'd Airbnb it" },
  ] }));
  assert(cm.getFactLedger().get('occupancy')?.status === 'needs_clarification', '#15: second home + rental plan → one quick check');
  await turn(cm, ex({ facts: [{ key: 'occupancy', value: 'second_home', raw: 'mostly for us' }] }));
  assert(cm.getFactLedger().get('occupancy')?.status === 'stated' && cm.getProfile().occupancy_confirmed === true, '#15: their answer settles it — not asked again');
  const duplex = newManager();
  await turn(duplex, ex({ goal: 'purchase', facts: [
    { key: 'occupancy', value: 'primary', raw: '' }, { key: 'property.type', value: 'multi_family', raw: '' },
    { key: 'property.rental_plan', value: true, raw: 'rent the other side' },
  ] }));
  assert(duplex.getFactLedger().get('occupancy')?.status === 'stated', '#13: living in one unit and renting the other is not a conflict');
}

{
  // #30: relocating, destination not said → asked early in Stage 2, before the retained-home rent
  const cm = newManager();
  await turn(cm, ex({ goal: 'purchase', facts: [
    { key: 'situation.relocation', value: { from: 'Atlanta' }, raw: '' },
    { key: 'housing.retained_home', value: { balance: 220, plan: 'rent' }, raw: '' },
  ] }));
  for (const f of [{ key: 'borrower.first_name', value: 'Morgan' }, { key: 'occupancy', value: 'primary' }, { key: 'borrower.existing_member', value: false }, { key: 'timeline', value: 'three months' }, { key: 'co_borrower.present', value: true }] as const) {
    await turn(cm, ex({ facts: [{ key: f.key as any, value: f.value, raw: '' }] }));
  }
  assert(cm.getPendingField() === 'section0_followup' && /which city or zip code they are moving to/.test(cm.getDynamicContext()), '#30: asks the destination city/zip first', cm.getPendingField());
  await quietlyAsync(() => cm.onAgentTurn('Which city are you moving to?'));
  await turn(cm, ex({ facts: [{ key: 'location.area', value: { city: 'Chattanooga', state: 'TN', zip: '37421' }, raw: '' }] }));
  assert(/rent for each month/.test(cm.getDynamicContext()), '#30: then the expected rent on the home they keep');
}
{
  // #4: refinance goal known → the overview drops its closing goal question
  const cm = newManager();
  await turn(cm, ex({ goal: 'refinance_rate_term', facts: [{ key: 'goal.refi_purpose', value: 'lower_payment', raw: '' }] }));
  cm.getProfile().current_mortgage_type = 'conventional';
  cm.setActiveStage('2');
  const prompt = (await import('../prompts/stage2-refinance.js')).buildStage2RefinanceInstructions(cm.getProfile());
  assert(/WITHOUT its final question about their goal/.test(prompt), '#4: known refinance goal → overview without the goal question');
}

{
  // #25: a message that touches a protected class keeps no quotes in memory (ethnicity never stored)
  const cm = newManager();
  await turn(cm, ex({ goal: 'purchase', flags: ['protected_class_topic'], facts: [
    { key: 'co_borrower.present', value: true, raw: "We're a Hispanic family" },
    { key: 'location.area', value: { city: 'Dalton', state: 'GA' }, raw: 'looking in Dalton, Georgia' },
  ] }));
  const stored = JSON.stringify(cm.getFactLedger().serialize()) + JSON.stringify(cm.getProfile());
  assert(!/hispanic/i.test(stored), '#25: no quote from a protected-class message is stored');
  assert(cm.getFactLedger().value('co_borrower.present') === true, '#25: the structured facts are still kept');
}
{
  // #26: "relocating in May" answers the timeline question
  const cm = newManager();
  await turn(cm, ex({ goal: 'purchase', facts: [{ key: 'situation.relocation', value: { from: 'Tennessee', to: 'Phoenix', when: 'May' }, raw: '' }] }));
  assert(cm.getProfile().timeline === 'May' && cm.getProfile().timeline_confirmed === true, '#26: relocation month fills the timeline — not asked again');
}
{
  // #16: refinance with the balance but no value → home value asked early in Stage 2
  const cm = newManager();
  await turn(cm, ex({ goal: 'refinance', facts: [{ key: 'refi.balance', value: 240, raw: '' }, { key: 'situation.divorce_buyout', value: true, raw: '' }] }));
  for (const f of [{ key: 'borrower.first_name', value: 'Robin' }, { key: 'occupancy', value: 'primary' }, { key: 'borrower.existing_member', value: false }, { key: 'timeline', value: 'three months' }, { key: 'co_borrower.present', value: false }] as const) {
    await turn(cm, ex({ facts: [{ key: f.key as any, value: f.value, raw: '' }] }));
  }
  assert(cm.getPendingField() === 'section0_followup' && /what they think their home is worth/.test(cm.getDynamicContext()), '#16: home value asked early (refinance)', cm.getPendingField());
}
{
  // #19: situation described, goal undecided → intent asked in their own terms, not the canned line
  const cm = newManager();
  await turn(cm, ex({ goal: 'unclear', facts: [{ key: 'situation.inherited_home', value: true, raw: '' }] }));
  const ctx = cm.getDynamicContext();
  assert(/tied to what they told you/.test(ctx) && !/ask exactly: "Great\. What brings you here today/.test(ctx), '#19: asks what they want to do with what they described');
}

{
  // #30 (P4): the model marked two scores "uncertain" — numbers are never left waiting on the model's doubt
  const cm = newManager();
  await turn(cm, ex({ goal: 'purchase', facts: [
    { key: 'co_borrower.present', value: true, raw: '' },
    { key: 'credit.borrower', value: '700', raw: '', uncertain: true },
    { key: 'credit.co_borrower', value: '745', raw: '', uncertain: true },
  ] }));
  assert(cm.getFactLedger().get('credit.borrower')?.status === 'stated' && cm.getProfile().credit_range_confirmed === true, '#30: two scores stay settled — credit never re-asked');
  // ...while a choice-type fact can still be flagged for one check
  const occ = newManager();
  await turn(occ, ex({ goal: 'purchase', facts: [{ key: 'occupancy', value: 'second_home', raw: '', uncertain: true }] }));
  assert(occ.getFactLedger().get('occupancy')?.status === 'needs_clarification', 'choice-type fact (occupancy) can still get one quick check');
}
{
  // #23 (P4): a pending compliance note is visible to the agent so scripted fast paths step aside
  const cm = newManager();
  await turn(cm, ex({ goal: 'purchase', flags: ['approval_guarantee_or_preapproval_letter'] }));
  assert(cm.hasPendingComplianceNotes(), '#23: compliance note pending → the reply goes through the model');
  await quietlyAsync(() => cm.onAgentTurn('Before anything else, what is the letter about?'));
  assert(!cm.hasPendingComplianceNotes(), 'cleared once Ailana has replied');
}

{
  // A12 (O1): a pending detail (weekly hours) is the FIRST thing asked once the track starts — asked once
  const cm = newManager();
  await turn(cm, ex({ goal: 'purchase', facts: [{ key: 'income.borrower', value: [{ type: 'hourly', amount: 52 }], raw: '' }] }));
  assert(cm.getActiveStage() === '1' && cm.hasQuickCheckDue() && /ONE quick check[^\n]*hours a week/.test(cm.getDynamicContext()), 'A12: weekly hours asked first (before the name)');
  await quietlyAsync(() => cm.onAgentTurn('Before anything else — how many hours a week do you usually work?'));
  assert(!cm.hasQuickCheckDue(), 'A12: asked once — never repeated, even if unanswered');
}
{
  // A11 (O1): own income known, co-borrower's missing → ask ONLY the co-borrower's income
  const cm = newManager();
  await turn(cm, ex({ goal: 'purchase', facts: [
    { key: 'co_borrower.present', value: true, raw: 'we' },
    { key: 'income.borrower', value: [{ type: 'salary', amount: 68 }], raw: 'I make 68' },
    { key: 'debt.monthly_total', value: 300, raw: '' },
  ] }));
  cm.setActiveStage('2'); cm.setCurrentPendingField('gross_annual_income');
  assert(/Ask ONLY roughly what their co-borrower earns/.test(cm.getDynamicContext()), 'A11: does not re-ask their own income');
}
{
  // #18 / #30 (O1): co-borrower known → military question says "your co-borrower"
  const cm = newManager();
  await turn(cm, ex({ goal: 'purchase', facts: [{ key: 'co_borrower.present', value: true, raw: '' }] }));
  cm.setActiveStage('2'); cm.setCurrentPendingField('military_rural');
  const ctx = cm.getDynamicContext();
  assert(/do you or your co-borrower have any military service/.test(ctx) && !/you or a co-borrower/.test(ctx), '#18/#30: military question treats the co-borrower as known');
}

{
  // #21 (O2): "I've never owned a home" answers rent-or-own
  const cm = newManager();
  await turn(cm, ex({ goal: 'purchase', facts: [{ key: 'borrower.first_time_buyer', value: true, raw: '' }] }));
  assert(cm.getProfile().rent_own_confirmed === true, '#21: first-time buyer → never asked "rent or own?"');
}
{
  // #18 (O2): a direct answer to the occupancy question is never turned into a "quick check"
  const cm = newManager();
  await turn(cm, ex({ goal: 'purchase' }));
  await turn(cm, ex({ facts: [{ key: 'occupancy', value: 'primary', raw: 'only my son will live there', uncertain: true }] }));
  assert(cm.getFactLedger().get('occupancy')?.status === 'stated' && !cm.hasQuickCheckDue(), '#18: answered occupancy is settled — not re-asked');
}

{
  // #30 (O3): the model put "Atlanta, GA" (where they're LEAVING) as the area → still ask the destination, no Georgia footprint note
  const cm = newManager();
  await turn(cm, ex({ goal: 'purchase', facts: [
    { key: 'situation.relocation', value: { from: 'Atlanta' }, raw: '' },
    { key: 'location.area', value: { city: 'Atlanta', state: 'GA' }, raw: '' },
  ] }));
  assert(!/Georgia/.test(cm.getDynamicContext()), '#30: no out-of-area note for the place they are leaving');
  for (const f of [{ key: 'borrower.first_name', value: 'Morgan' }, { key: 'occupancy', value: 'primary' }, { key: 'borrower.existing_member', value: false }, { key: 'timeline', value: 'three months' }, { key: 'co_borrower.present', value: true }] as const) {
    await turn(cm, ex({ facts: [{ key: f.key as any, value: f.value, raw: '' }] }));
  }
  assert(/which city or zip code they are moving to/.test(cm.getDynamicContext()), '#30: destination still asked');
}
{
  // #29 (O3): a stated job loss already covers previous work → no prior-employment follow-up
  const cm = newManager();
  await turn(cm, ex({ goal: 'refinance', facts: [
    { key: 'employment.new_job', value: { starts: 'Monday' }, raw: '' },
    { key: 'situation.job_loss', value: true, raw: '' },
    { key: 'refi.value', value: 290, raw: '' },
  ] }));
  for (const f of [{ key: 'borrower.first_name', value: 'Jessie' }, { key: 'occupancy', value: 'primary' }, { key: 'borrower.existing_member', value: false }, { key: 'timeline', value: 'soon' }, { key: 'co_borrower.present', value: false }] as const) {
    await turn(cm, ex({ facts: [{ key: f.key as any, value: f.value, raw: '' }] }));
  }
  assert(!/what they did for work before/.test(cm.getDynamicContext()), '#29: no "what did you do before" after a stated job loss');
}

{
  // #29 (O4): behind on payments → hardship response (loan officer + HUD counselor), intake paused, facts kept
  const cm = newManager();
  await turn(cm, ex({ goal: 'refinance', flags: ['hardship_or_delinquency'], facts: [
    { key: 'situation.delinquent_months', value: 3, raw: '' }, { key: 'refi.balance', value: 160, raw: '' }, { key: 'refi.value', value: 290, raw: '' },
  ] }));
  assert(cm.getActiveStage() === '0' && /HUD-approved housing counselor/.test(cm.getDynamicContext()) && /do NOT start intake questions/.test(cm.getDynamicContext()), '#29: hardship response, no intake');
  assert(cm.getFactLedger().value('refi.balance') === 160000, '#29: stated facts still kept');
  await turn(cm, ex({ goal: 'refinance', intent: 'asks_about_human_later' }));
  assert(cm.getActiveStage() === '0' && /Do NOT ask discovery questions/.test(cm.getDynamicContext()), '#29: "later, not now" → still no intake questions');
  // a hardship FLAG alone (e.g. a divorce) does not pause intake — only a stated delinquency does
  const div = newManager();
  await turn(div, ex({ goal: 'refinance', flags: ['hardship_or_delinquency'], facts: [{ key: 'situation.divorce_buyout', value: true, raw: '' }] }));
  assert(div.getActiveStage() === '1', '#16: divorce refinance continues normally');
}
{
  // #11 (O4): no channel cards on screen → the greeting does not end with the card question
  const { getGreetingText } = await import('../prompts/ailana-system.js');
  const g = getGreetingText();
  assert(/recorded for quality and compliance/.test(g) && !/How would you like to get started\?/.test(g), 'greeting (flag on, no cards yet) ends after the recording notice');
}

{
  // #12 (O5): the model sent ONE credit event as an object (not a list) → the follow-up check crashed the turn
  const cm = newManager();
  await turn(cm, ex({ goal: 'purchase', facts: [{ key: 'credit.events', value: { type: 'bankruptcy', when: 'two years ago' }, raw: '' }] }));
  assert(Array.isArray(cm.getFactLedger().value('credit.events')), '#12: a single credit event is stored as a list');
  for (const f of [{ key: 'borrower.first_name', value: 'Jesse' }, { key: 'occupancy', value: 'primary' }, { key: 'borrower.existing_member', value: false }, { key: 'timeline', value: 'six months' }, { key: 'co_borrower.present', value: false }] as const) {
    await turn(cm, ex({ facts: [{ key: f.key as any, value: f.value, raw: '' }] }));
  }
  assert(cm.getActiveStage() === '2' && /discharged/.test(cm.getDynamicContext()), '#12: Stage 2 hand-over works and asks the discharge date (no crash)');
}
{
  // #24 (O5): "120 instead of 85" → later "85 it is" with a different label must not double the income
  const cm = newManager();
  await turn(cm, ex({ goal: 'purchase', flags: ['inflate_income_request'], facts: [{ key: 'income.borrower', value: [{ type: 'other', amount: 85000, frequency: 'yearly' }], raw: '' }] }));
  await turn(cm, ex({ facts: [{ key: 'income.borrower', value: [{ type: 'salary', amount: 85000, frequency: 'yearly' }], raw: '85 it is' }] }));
  assert(cm.getProfile().gross_annual_income === 85000, '#24: same income relabelled, not added twice', cm.getProfile().gross_annual_income);
  const two = newManager();
  await turn(two, ex({ goal: 'purchase', facts: [{ key: 'income.borrower', value: [{ type: 'salary', amount: 60000, frequency: 'yearly' }, { type: 'commission', amount: 40000, frequency: 'yearly' }], raw: '' }] }));
  assert(two.getProfile().gross_annual_income === 100000, 'two real income sources still add up');
}
{
  // #23 (O5): the pre-approval letter question TAKES the turn — the first-name question waits one turn
  const cm = newManager();
  await turn(cm, ex({ goal: 'purchase', flags: ['approval_guarantee_or_preapproval_letter'], facts: [{ key: 'income.borrower', value: [{ type: 'social_security', amount: 1700, frequency: 'monthly' }], raw: '' }] }));
  const ctx = cm.getDynamicContext();
  assert(/CURRENT TASK:[^\n]*\n[^\n]*Ask what the letter or offer is about\. Ask only this/.test(ctx), '#23: the letter question is the task this turn');
  await quietlyAsync(() => cm.onAgentTurn('I can’t verify a letter we didn’t send — what is the letter about?'));
  assert(!/what the letter or offer is about/.test(cm.getDynamicContext()) && cm.getPendingField() === 'borrower_name', '#23: next turn → back to the first name');
}

{
  // #8 (O6): "I'd like to learn about general options" (goal: unclear) must not pull a construction caller into intake
  const cm = newManager();
  await turn(cm, ex({ goal: 'construction' }));
  await turn(cm, ex({ goal: 'unclear', intent: 'asks_question' }));
  assert(cm.getFactLedger().value('goal.primary') === 'construction', '#8: a vague later reply never erases the known goal');
  assert(cm.getActiveStage() === '0' && /Do NOT ask discovery questions/.test(cm.getDynamicContext()), '#8: stays in the construction branch (no intake)');
}
{
  // #23 (O6): the pre-approval fact alone (no flag) still triggers the letter question
  const cm = newManager();
  await turn(cm, ex({ goal: 'purchase', facts: [{ key: 'situation.preapproval_letter', value: true, raw: '' }] }));
  assert(/Ask what the letter or offer is about/.test(cm.getDynamicContext()), '#23: letter question from the fact, even without the flag');
}

// ── 13. No switch at the closing offer ──
{
  const cm = newManager();
  await turn(cm, ex({ goal: 'purchase' }));
  (cm as any).activeStage = '2'; (cm as any).currentPendingField = 'stage2_closing_offer';
  await turn(cm, ex({ goal: 'refinance' }));
  assert(cm.getProfile().transaction_type === 'TT-PUR', 'goal change at the closing offer does not switch');
}

console.log(`\n✨ ALL ${total} SECTION 0 SYNC / FLOW TESTS PASSED!`);

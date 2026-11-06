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
  // Walk to the end of Stage 2 (only the still-missing items)
  for (const f of [
    { key: 'borrower.first_name', value: 'Morgan' }, { key: 'occupancy', value: 'primary' }, { key: 'borrower.existing_member', value: false },
    { key: 'timeline', value: 'three months' }, { key: 'purchase.price', value: 450 },
    { key: 'property.type', value: 'single_family' }, { key: 'location.area', value: { city: 'Chattanooga', state: 'TN', zip: '37421' } },
    { key: 'military.status', value: 'none' },
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
  assert(cm.getPendingField() === 'section0_followup', 'before the closing offer: a follow-up is needed', cm.getPendingField());
  assert(/rent for each month/.test(cm.getDynamicContext()), 'follow-up asks the expected rent on the home they are keeping');
  await quietlyAsync(() => cm.onAgentTurn('How much do you expect the Atlanta home to rent for each month?'));
  await turn(cm, ex({ facts: [{ key: 'housing.retained_home', value: { expected_rent: 2100 }, raw: 'about 2,100' }] }));
  const kept = cm.getFactLedger().value<any>('housing.retained_home');
  assert(kept.expected_rent === 2100 && kept.balance === 220000 && kept.plan === 'rent', 'expected rent merged in; balance and plan kept');
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

// ── 13. No switch at the closing offer ──
{
  const cm = newManager();
  await turn(cm, ex({ goal: 'purchase' }));
  (cm as any).activeStage = '2'; (cm as any).currentPendingField = 'stage2_closing_offer';
  await turn(cm, ex({ goal: 'refinance' }));
  assert(cm.getProfile().transaction_type === 'TT-PUR', 'goal change at the closing offer does not switch');
}

console.log(`\n✨ ALL ${total} SECTION 0 SYNC / FLOW TESTS PASSED!`);

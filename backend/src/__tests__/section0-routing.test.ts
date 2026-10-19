import 'dotenv/config';

process.env.LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || 'test-livekit-key';
process.env.LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || 'test-livekit-secret';
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test-openai-key';

import assert from 'assert';
import {
  initBorrowerProfile,
  extractOpeningSignals,
  selectQ9MultiTemplate,
  renderQ9MultiTemplate,
  Q9_MULTI_TEMPLATES,
  Q9_TRID_GATE_FORMULATION,
  Q9_STANDARD_FORMULATION,
  EQUITY_DISAMBIG_FORMULATION,
  HQ18_COMPARISON_FORMULATION,
  FALLBACK_ROUTING_FORMULATION,
  MIXED_INTENT_FORMULATION,
  formatMixedIntentGoal,
  renderMixedIntentFormulation,
  extractRouteTag,
  normalizeTransactionType,
  parseMixedIntentChoice,
  applyMixedIntentChoice,
  HOLDOUT_SIGNALS,
  TT_CON_HOLDOUT_FORMULATION,
  TT_HECM_HOLDOUT_FORMULATION,
  getHoldoutFormulation,
  applyHoldoutRouting,
  parseQ9RoutingDecision,
  applyQ9RoutingDecision,
  parseEquityDisambiguationChoice,
  SessionContextManager,
} from '../context/session-context-manager.js';

console.log('🧪 Running Section 0 Test Suite (Phases 1–3: T1–T10)...\n');

// ── S0-1: Zero-State Profile Initialization Defaults (T1 & T2) ───────────────
{
  const profile = initBorrowerProfile();

  // Critical default checks
  assert.strictEqual(profile.Q9_confirmed, false, 'Q9_confirmed must strictly default to false');
  assert.strictEqual(profile.Q9_MULTI_delivered, false);
  assert.strictEqual(profile.secondary_intent, null);
  assert.strictEqual(profile.trid_gate_fired, false);
  assert.strictEqual(profile.trid_gate_required, false);
  assert.strictEqual(profile.equity_disambig_delivered, false);
  assert.strictEqual(profile.fallback_routing_delivered, false);
  assert.strictEqual(profile.holdout_routed, false);

  // Front-loading fields defaults
  assert.deepStrictEqual(profile.signals_found, []);
  assert.strictEqual(profile.pre_stated_income, null);
  assert.strictEqual(profile.pre_stated_savings, null);
  assert.strictEqual(profile.pre_stated_location, null);
  assert.strictEqual(profile.pre_stated_property_type, null);
  assert.strictEqual(profile.Q42_partial, false);
  assert.strictEqual(profile.context_current_rate, null);
  assert.strictEqual(profile.transaction_type, null);

  console.log('  ✅ S0-1 Passed: Zero-state profile initialized correctly (Q9_confirmed = false default).');
}

// ── S0-2: Fast Extraction of Purchase Intent (T3) ────────────────────────────
{
  const profile = initBorrowerProfile();
  const input = 'I want to buy a house';

  const start = performance.now();
  extractOpeningSignals(input, profile);
  const duration = performance.now() - start;

  assert.ok(duration < 10, `extractOpeningSignals must complete under 10ms (took ${duration.toFixed(2)}ms)`);
  assert.deepStrictEqual(profile.signals_found, ['TT-PUR']);
  assert.strictEqual(
    profile.transaction_type,
    null,
    'extractOpeningSignals must NEVER set transaction_type directly'
  );

  console.log(`  ✅ S0-2 Passed: Purchase signal extracted in ${duration.toFixed(2)}ms (<10ms target), transaction_type preserved as null.`);
}

// ── S0-3: TRID Gate Intercept & Confidential Data Protection (T4) ────────────
{
  // 1. SSN Check
  const profileSsn = initBorrowerProfile();
  const rawSsnInput = 'My SSN is 123-45-6789 and I want to buy a house';
  const redactedSsnInput = 'My SSN is [REDACTED_SSN] and I want to buy a house';

  extractOpeningSignals(redactedSsnInput, profileSsn, rawSsnInput);

  assert.strictEqual(profileSsn.trid_gate_required, true, 'TRID gate must be required when SSN is present');
  assert.ok(profileSsn.signals_found?.includes('TT-PUR'), 'Purchase signal still recognized alongside SSN');
  assert.ok(!JSON.stringify(profileSsn).includes('123-45-6789'), 'SSN must NEVER be stored in the profile');

  // 2. Street Address Check
  const profileAddr = initBorrowerProfile();
  const addrInput = 'I want to refinance my house at 123 Elm Street';
  extractOpeningSignals(addrInput, profileAddr, addrInput);

  assert.strictEqual(profileAddr.trid_gate_required, true, 'TRID gate must be required when street address is present');
  assert.ok(profileAddr.signals_found?.includes('TT-REF'), 'Refinance signal recognized alongside address');
  assert.ok(!JSON.stringify(profileAddr).includes('123 Elm Street'), 'Street address must NEVER be stored');
  assert.strictEqual(profileAddr.pre_stated_location, null, 'Street address must not be set as pre_stated_location');

  // 3. Verbatim Compliance Formulation Check
  assert.ok(
    Q9_TRID_GATE_FORMULATION.includes('for security and compliance purposes'),
    'TRID gate formulation matches verbatim regulatory text'
  );

  console.log('  ✅ S0-3 Passed: TRID Gate fires on SSN & street address without storing confidential data.');
}

// ── S0-8: Veteran / Military Signal Extraction (T3) ──────────────────────────
{
  const profile = initBorrowerProfile();
  const input = 'I want to buy a home and I am a veteran';

  extractOpeningSignals(input, profile);

  assert.ok(profile.signals_found?.includes('TT-PUR'));
  assert.ok(profile.signals_found?.includes('veteran'));
  assert.strictEqual(profile.veteran_flagged, true);
  assert.strictEqual(profile.Q43_answered, true, 'Q43 must be marked answered to skip in Stage 2');

  console.log('  ✅ S0-8 Passed: Veteran status extracted and Q43 pre-answered.');
}

// ── S0-9: Multi-Signal: Co-Borrower & Income Parsing ($110K) (T3) ────────────
{
  const profile = initBorrowerProfile();
  const input = 'My wife and I make $110K a year and want to buy our first home';

  extractOpeningSignals(input, profile);

  assert.ok(profile.signals_found?.includes('TT-PUR'));
  assert.ok(profile.signals_found?.includes('co_borrower'));
  assert.ok(profile.signals_found?.includes('income'));
  assert.strictEqual(profile.co_borrower, 'yes');
  assert.strictEqual(profile.co_borrower_confirmed, true);
  assert.strictEqual(profile.Q13_answered, true, 'Q13 must be marked answered');
  assert.strictEqual(profile.pre_stated_income, 110000);
  assert.strictEqual(profile.Q35_answered, true, 'Q35 must be marked answered');

  console.log('  ✅ S0-9 Passed: Co-borrower and $110k income extracted; Q13 & Q35 pre-answered.');
}

// ── S0-10: Refinance + Property Type & Location (T3) ─────────────────────────
{
  const profile = initBorrowerProfile();
  const input = 'I want to refinance my condo in Orlando';

  extractOpeningSignals(input, profile);

  assert.ok(profile.signals_found?.includes('TT-REF'));
  assert.ok(profile.signals_found?.includes('property_type'));
  assert.ok(profile.signals_found?.includes('location'));
  assert.strictEqual(profile.pre_stated_property_type, 'condo');
  assert.strictEqual(profile.pre_stated_location, 'Orlando');
  assert.strictEqual(profile.Q42_partial, true);

  console.log('  ✅ S0-10 Passed: Property type (condo) and location (Orlando) extracted.');
}

// ── S0-14: Volunteered Rate Hidden from LLM Context (T3) ─────────────────────
{
  const profile = initBorrowerProfile();
  const input = 'I currently pay 7.5% and want to refinance';

  extractOpeningSignals(input, profile);

  assert.ok(profile.signals_found?.includes('TT-REF'));
  assert.strictEqual(profile.context_current_rate, 7.5);
  assert.ok(
    !profile.signals_found?.includes('7.5%') && !profile.signals_found?.includes('rate'),
    'Volunteered rate must NEVER be added to signals_found'
  );

  console.log('  ✅ S0-14 Passed: Volunteered rate stored for MLO reference, omitted from signals_found.');
}

// ── S0-Extra: Savings / Down Payment Parsing ($40K saved) (T3) ───────────────
{
  const profile = initBorrowerProfile();
  const input = 'Looking to buy a home with $40k saved for down payment';

  extractOpeningSignals(input, profile);

  assert.ok(profile.signals_found?.includes('TT-PUR'));
  assert.ok(profile.signals_found?.includes('savings'));
  assert.strictEqual(profile.pre_stated_savings, 40000);
  assert.strictEqual(profile.Q38_answered, true);

  console.log('  ✅ S0-Extra Passed: Savings amount ($40k) extracted and Q38 pre-answered.');
}

// ── S0-Integration: SessionContextManager onUserTurn Turn 1 Wiring (T4) ───────
async function testTurn1Integration() {
  const session = new SessionContextManager(null as any, null as any);
  const input = 'My SSN is 987-65-4321 and I want to buy a home';

  await session.onUserTurn(input);
  const profile = session.getProfile();

  assert.strictEqual(profile.trid_gate_required, true, 'TRID gate must be required');
  assert.strictEqual(profile.trid_gate_fired, true, 'TRID gate must fire');
  assert.ok(profile.signals_found?.includes('TT-PUR'), 'Purchase signal must be captured');
  assert.strictEqual(profile.transaction_type, null, 'transaction_type must not be set');
  assert.ok(!JSON.stringify(profile).includes('987-65-4321'), 'SSN must not be stored in profile');

  console.log('  ✅ S0-Integration Passed: First-turn onUserTurn triggers extraction & TRID gate before LLM.');
}

await testTurn1Integration();

// ── S0-T5: Q9-MULTI Template Selection Rules (T5) ───────────────────────────
{
  // Template A: Purchase + Veteran (no co-borrower)
  assert.strictEqual(selectQ9MultiTemplate(['TT-PUR', 'veteran']), 'TEMPLATE_A');

  // Template B: Purchase + Veteran + Co-borrower
  assert.strictEqual(selectQ9MultiTemplate(['TT-PUR', 'veteran', 'co_borrower']), 'TEMPLATE_B');

  // Template C: Purchase + Co-borrower (no veteran)
  assert.strictEqual(selectQ9MultiTemplate(['TT-PUR', 'co_borrower']), 'TEMPLATE_C');

  // Template D: Purchase + Financials (income or savings)
  assert.strictEqual(selectQ9MultiTemplate(['TT-PUR', 'income']), 'TEMPLATE_D');
  assert.strictEqual(selectQ9MultiTemplate(['TT-PUR', 'savings']), 'TEMPLATE_D');
  assert.strictEqual(selectQ9MultiTemplate(['TT-PUR', 'income', 'savings']), 'TEMPLATE_D');

  // Template E: Refinance + Location
  assert.strictEqual(selectQ9MultiTemplate(['TT-REF', 'location']), 'TEMPLATE_E');

  // Template F: Full Front-Load (Purchase + Veteran + Co-borrower + Financials)
  assert.strictEqual(
    selectQ9MultiTemplate(['TT-PUR', 'veteran', 'co_borrower', 'income']),
    'TEMPLATE_F'
  );
  assert.strictEqual(
    selectQ9MultiTemplate(['TT-PUR', 'veteran', 'co_borrower', 'savings']),
    'TEMPLATE_F'
  );

  // Template GENERAL: Any other multi-signal combination
  assert.strictEqual(selectQ9MultiTemplate(['TT-REF', 'property_type']), 'TEMPLATE_GENERAL');
  assert.strictEqual(selectQ9MultiTemplate(['TT-HEL', 'co_borrower']), 'TEMPLATE_GENERAL');

  console.log('  ✅ S0-T5-Selectors Passed: All 7 Q9-MULTI template selection routes verified.');
}

// ── S0-T5: Q9-MULTI Template Text & Bracket Interpolation (T5) ──────────────
{
  const profile = initBorrowerProfile();
  profile.borrower_name = 'Alex';
  profile.pre_stated_income = 125000;
  profile.pre_stated_savings = 50000;
  profile.pre_stated_location = 'Austin, TX';

  const renderedD = renderQ9MultiTemplate('TEMPLATE_D', profile);
  assert.ok(renderedD.includes('$50,000'), 'Template D must interpolate pre_stated_savings');
  assert.ok(renderedD.includes('$125,000'), 'Template D must interpolate pre_stated_income');

  const renderedE = renderQ9MultiTemplate('TEMPLATE_E', profile);
  assert.ok(renderedE.includes('Austin, TX'), 'Template E must interpolate location');

  const renderedA = renderQ9MultiTemplate('TEMPLATE_A', profile);
  assert.ok(renderedA.includes('VA financing'), 'Template A must mention VA financing');

  console.log('  ✅ S0-T5-Render Passed: Template placeholders properly interpolated from profile.');
}

// ── S0-T5: Q9-MULTI One-Time Delivery on Multi-Signal Turn (T5) ─────────────
async function testQ9MultiDeliveryIntegration() {
  const session = new SessionContextManager(null as any, null as any);

  // Turn 1: Borrower provides 2 signals (Purchase + Veteran)
  await session.onUserTurn("I want to buy a home and I'm a veteran");
  const profileTurn1 = session.getProfile();

  assert.ok(profileTurn1.signals_found?.includes('TT-PUR'));
  assert.ok(profileTurn1.signals_found?.includes('veteran'));
  assert.strictEqual(
    profileTurn1.Q9_MULTI_delivered,
    true,
    'Q9_MULTI_delivered must be set to true on multi-signal first turn'
  );

  // Turn 2: Verify Q9-MULTI never re-fires
  const secondEval = session.evaluateQ9Multi();
  assert.strictEqual(secondEval, null, 'Q9-MULTI must NEVER re-fire after initial delivery');

  console.log('  ✅ S0-T5-Delivery Passed: Q9-MULTI delivers on multi-signal turn 1 and does not re-fire on turn 2.');
}

await testQ9MultiDeliveryIntegration();

// ── S0-T6: Q9 Standard Open Routing Decisions (T6) ──────────────────────────
{
  // 1. LLM routing tag parsing
  assert.strictEqual(parseQ9RoutingDecision('ROUTE: TT-PUR'), 'TT-PUR');
  assert.strictEqual(parseQ9RoutingDecision('ROUTE: TT-REF'), 'TT-REF');
  assert.strictEqual(parseQ9RoutingDecision('ROUTE: TT-HEL-AMBIG'), 'TT-HEL-AMBIG');
  assert.strictEqual(parseQ9RoutingDecision('ROUTE: TT-HEL'), 'TT-HEL');
  assert.strictEqual(parseQ9RoutingDecision('ROUTE: TT-HEQ'), 'TT-HEQ');
  assert.strictEqual(parseQ9RoutingDecision('ROUTE: UNCLEAR'), 'UNCLEAR');

  // 2. Direct utterance parsing
  assert.strictEqual(parseQ9RoutingDecision('I want to buy a house'), 'TT-PUR');
  assert.strictEqual(parseQ9RoutingDecision('Looking to refinance my mortgage'), 'TT-REF');
  assert.strictEqual(parseQ9RoutingDecision('I want to access my home equity'), 'TT-HEL-AMBIG');
  assert.strictEqual(parseQ9RoutingDecision('I need a HELOC line of credit'), 'TT-HEL');
  assert.strictEqual(parseQ9RoutingDecision('I want a home equity loan'), 'TT-HEQ');

  // 3. Application to profile
  const profilePur = initBorrowerProfile();
  applyQ9RoutingDecision('TT-PUR', profilePur);
  assert.strictEqual(profilePur.transaction_type, 'TT-PUR');
  assert.strictEqual(profilePur.Q9_confirmed, true);
  assert.strictEqual(profilePur.mortgage_goal, 'purchase');

  const profileRef = initBorrowerProfile();
  applyQ9RoutingDecision('TT-REF', profileRef);
  assert.strictEqual(profileRef.transaction_type, 'TT-REF');
  assert.strictEqual(profileRef.Q9_confirmed, true);
  assert.strictEqual(profileRef.mortgage_goal, 'refinance');

  const profileAmbig = initBorrowerProfile();
  applyQ9RoutingDecision('TT-HEL-AMBIG', profileAmbig);
  assert.strictEqual(profileAmbig.transaction_type, null, 'Ambiguous equity must NOT set transaction_type');
  assert.strictEqual(profileAmbig.Q9_confirmed, false, 'Ambiguous equity must NOT confirm Q9 yet');

  console.log('  ✅ S0-T6-Decisions Passed: Q9 route tags and utterances parsed and applied correctly.');
}

// ── S0-T6: Standard Q9 Open Routing 2-Turn Flow (T6) ─────────────────────────
async function testQ9StandardOpenRouting() {
  const session = new SessionContextManager(null as any, null as any);

  // Turn 1: Open-ended input with 0 extraction signals
  await session.onUserTurn('I have some mortgage questions');
  const profileTurn1 = session.getProfile();

  assert.deepStrictEqual(profileTurn1.signals_found, []);
  assert.strictEqual(profileTurn1.transaction_type, null);
  assert.strictEqual(profileTurn1.Q9_confirmed, false);
  assert.strictEqual(session.getSection0RoutingStep(), 'Q9_STANDARD');
  assert.ok(
    session.getQ9StandardFormulation().includes("are you looking to purchase a home, refinance an existing mortgage"),
    'Q9 standard formulation matches specification'
  );

  // Turn 2: Borrower responds with purchase intent
  await session.onUserTurn('I want to buy a house');
  const profileTurn2 = session.getProfile();

  assert.strictEqual(profileTurn2.transaction_type, 'TT-PUR');
  assert.strictEqual(profileTurn2.Q9_confirmed, true);
  assert.strictEqual(profileTurn2.mortgage_goal, 'purchase');
  assert.strictEqual(profileTurn2.mortgage_goal_confirmed, true);

  console.log('  ✅ S0-T6-OpenRouting Passed: Turn 1 prompts Q9, Turn 2 confirms TT-PUR (Q9_confirmed=true).');
}

await testQ9StandardOpenRouting();

// ── S0-11: Borrower Confirms Purchase on Turn 2 Affirmation (T6 / S0-11) ─────
async function testS0_11_Confirmation() {
  const session = new SessionContextManager(null as any, null as any);

  // Turn 1: Borrower states purchase intent
  await session.onUserTurn('I want to buy a house');
  const profileTurn1 = session.getProfile();
  assert.strictEqual(profileTurn1.transaction_type, null, 'transaction_type must not be confirmed before confirmation');
  assert.strictEqual(profileTurn1.Q9_confirmed, false);

  // Turn 2: Borrower affirms confirmation
  await session.onUserTurn("Yes, that's right");
  const profileTurn2 = session.getProfile();
  assert.strictEqual(profileTurn2.transaction_type, 'TT-PUR');
  assert.strictEqual(profileTurn2.Q9_confirmed, true);

  console.log('  ✅ S0-11 Passed: Borrower affirmative confirmation sets TT-PUR and Q9_confirmed=true.');
}

await testS0_11_Confirmation();

// ── S0-T7: Equity Disambiguation Choice Parsing & Formulations (T7) ─────────
{
  // 1. Tag and utterance parsing
  assert.strictEqual(parseEquityDisambiguationChoice('ROUTE: TT-HEL'), 'TT-HEL');
  assert.strictEqual(parseEquityDisambiguationChoice('ROUTE: TT-HEQ'), 'TT-HEQ');
  assert.strictEqual(parseEquityDisambiguationChoice('ROUTE: UNSURE'), 'UNSURE');

  assert.strictEqual(parseEquityDisambiguationChoice('I prefer a HELOC line of credit'), 'TT-HEL');
  assert.strictEqual(parseEquityDisambiguationChoice('I want a fixed lump sum loan'), 'TT-HEQ');
  assert.strictEqual(parseEquityDisambiguationChoice('I am not sure, what is the difference?'), 'UNSURE');
  assert.strictEqual(parseEquityDisambiguationChoice('help me decide'), 'UNSURE');

  // 2. Verbatim compliance formulation checks
  assert.ok(
    EQUITY_DISAMBIG_FORMULATION.includes('Home Equity Line of Credit — sometimes called a HELOC'),
    'Equity disambiguation formulation matches verbatim spec'
  );
  assert.ok(
    HQ18_COMPARISON_FORMULATION.includes('The key difference is structure and rate'),
    'HQ18 educational comparison matches verbatim spec'
  );

  console.log('  ✅ S0-T7-Choices Passed: Equity disambiguation choices & verbatim formulations verified.');
}

// ── S0-4 & S0-12: Equity Disambiguation Flow -> HELOC (T7 / S0-4 / S0-12) ────
async function testEquityDisambiguationHELOC() {
  const session = new SessionContextManager(null as any, null as any);

  // Turn 1: Borrower says ambiguous equity access intent
  await session.onUserTurn('I want to access my equity');
  const profileTurn1 = session.getProfile();

  assert.ok(profileTurn1.signals_found?.includes('TT-HEL-AMBIG'), 'Must extract ambiguous equity signal');
  assert.strictEqual(profileTurn1.equity_disambig_delivered, true, 'equity_disambig_delivered must be set to true');
  assert.strictEqual(profileTurn1.transaction_type, null, 'transaction_type must NOT be set yet');
  assert.strictEqual(profileTurn1.Q9_confirmed, false, 'Q9_confirmed must be false');
  assert.strictEqual(session.getSection0RoutingStep(), 'EQUITY_DISAMBIG');

  // Turn 2: Borrower chooses HELOC
  await session.onUserTurn('I want a HELOC');
  const profileTurn2 = session.getProfile();

  assert.strictEqual(profileTurn2.transaction_type, 'TT-HEL', 'Must set TT-HEL');
  assert.strictEqual(profileTurn2.Q9_confirmed, true, 'Q9_confirmed must become true');
  assert.strictEqual(profileTurn2.mortgage_goal, 'heloc');
  assert.strictEqual(profileTurn2.mortgage_goal_confirmed, true);

  console.log('  ✅ S0-4 & S0-12 Passed: Ambiguous equity prompts disambiguation and resolves to TT-HEL.');
}

await testEquityDisambiguationHELOC();

// ── S0-T7: Equity Disambiguation Flow -> Home Equity Loan (TT-HEQ) (T7) ─────
async function testEquityDisambiguationHEQ() {
  const session = new SessionContextManager(null as any, null as any);

  // Turn 1: Borrower says ambiguous equity access intent
  await session.onUserTurn('I want to tap into my home equity');
  assert.strictEqual(session.getProfile().equity_disambig_delivered, true);

  // Turn 2: Borrower chooses fixed lump sum loan
  await session.onUserTurn('I want a fixed lump sum loan');
  const profileTurn2 = session.getProfile();

  assert.strictEqual(profileTurn2.transaction_type, 'TT-HEQ', 'Must set TT-HEQ');
  assert.strictEqual(profileTurn2.Q9_confirmed, true, 'Q9_confirmed must become true');

  console.log('  ✅ S0-T7-HEQ Passed: Ambiguous equity resolves to fixed Home Equity Loan (TT-HEQ).');
}

await testEquityDisambiguationHEQ();

// ── S0-T7: Equity Disambiguation -> Unsure (HQ18 Education Flow) (T7) ────────
async function testEquityDisambiguationUnsureHQ18() {
  const session = new SessionContextManager(null as any, null as any);

  // Turn 1: Ambiguous equity
  await session.onUserTurn('I want to access my equity');
  assert.strictEqual(session.getProfile().equity_disambig_delivered, true);

  // Turn 2: Borrower is unsure
  await session.onUserTurn("I'm not sure which fits better, can you explain the difference?");
  const profileTurn2 = session.getProfile();
  assert.strictEqual(profileTurn2.Q9_confirmed, false, 'Q9 must remain unconfirmed during education');
  assert.strictEqual(profileTurn2.transaction_type, null);
  assert.ok(
    session.getHQ18ComparisonFormulation().includes('complete payment predictability'),
    'HQ18 education available for delivery'
  );

  // Turn 3: Borrower chooses HELOC after explanation
  await session.onUserTurn('The line of credit sounds better for my needs');
  const profileTurn3 = session.getProfile();
  assert.strictEqual(profileTurn3.transaction_type, 'TT-HEL');
  assert.strictEqual(profileTurn3.Q9_confirmed, true);

  console.log('  ✅ S0-T7-Unsure Passed: Unsure borrower receives HQ18 education, then routes to TT-HEL.');
}

await testEquityDisambiguationUnsureHQ18();

// ── S0-6: Fallback Routing Question (T8) ────────────────────────────────────
async function testFallbackRoutingFlow() {
  // 1. Verbatim Formulation Check
  assert.ok(
    FALLBACK_ROUTING_FORMULATION.includes('purchase a new home, refinance an existing mortgage, or access the equity'),
    'Fallback formulation matches verbatim spec'
  );

  // 2. Unclear Turn 2 triggers Fallback Routing
  const session = new SessionContextManager(null as any, null as any);

  // Turn 1: 0 signals
  await session.onUserTurn('I have some general mortgage questions');
  assert.strictEqual(session.getProfile().fallback_routing_delivered, false);
  assert.strictEqual(session.getProfile().Q9_confirmed, false);

  // Turn 2: Ambiguous / unclear answer
  await session.onUserTurn("I'm not really sure what I want to do yet");
  const profileTurn2 = session.getProfile();
  assert.strictEqual(
    profileTurn2.fallback_routing_delivered,
    true,
    'fallback_routing_delivered must be set to true'
  );
  assert.strictEqual(
    profileTurn2.Q9_confirmed,
    false,
    'Stage 1 must NOT fire when fallback routing is triggered'
  );
  assert.strictEqual(
    profileTurn2.transaction_type,
    null,
    'transaction_type must remain null before confirmation'
  );
  assert.ok(
    session.getFallbackRoutingFormulation().includes("access the equity you've already built"),
    'Fallback question is available for delivery'
  );

  // Turn 3: Borrower clarifies intent from Fallback Question -> Purchase
  await session.onUserTurn('I think I want to purchase a new home');
  const profileTurn3 = session.getProfile();
  assert.strictEqual(profileTurn3.transaction_type, 'TT-PUR');
  assert.strictEqual(profileTurn3.Q9_confirmed, true, 'Q9 confirmed upon clarifying response');

  // 3. Second sub-case: Still unclear after Fallback routing -> remains unconfirmed (routes to SR-1)
  const sessionUnclear = new SessionContextManager(null as any, null as any);
  await sessionUnclear.onUserTurn('Just curious about mortgages');
  await sessionUnclear.onUserTurn("I don't know");
  assert.strictEqual(sessionUnclear.getProfile().fallback_routing_delivered, true);
  assert.strictEqual(sessionUnclear.getProfile().Q9_confirmed, false);

  // Turn 3: Still unclear after fallback was already delivered
  await sessionUnclear.onUserTurn('Still have no idea at all');
  const profileTurn3Unclear = sessionUnclear.getProfile();
  assert.strictEqual(profileTurn3Unclear.Q9_confirmed, false, 'Stage 1 must strictly NOT activate');
  assert.strictEqual(profileTurn3Unclear.transaction_type, null);

  console.log('  ✅ S0-6 Passed: Fallback routing delivers on ambiguous response; clarifies to TT-PUR or holds for SR-1.');
}

await testFallbackRoutingFlow();

// ── S0-5: Mixed Intent Handling (T9 / S0-5) ─────────────────────────────────
async function testMixedIntentFlow() {
  // 1. Verbatim Formulation & Tag Parsing Checks
  assert.ok(
    MIXED_INTENT_FORMULATION.includes('It sounds like you have two things on your mind — [goal 1] and [goal 2]'),
    'Mixed intent formulation starts with verbatim spec text'
  );
  assert.ok(
    MIXED_INTENT_FORMULATION.includes("Let's tackle them one at a time so we give each the attention it deserves. Which would you like to start with?"),
    'Mixed intent formulation contains verbatim selection question'
  );
  assert.strictEqual(formatMixedIntentGoal('TT-PUR'), 'purchasing a new home');
  assert.strictEqual(formatMixedIntentGoal('TT-REF'), 'refinancing your current mortgage');
  assert.strictEqual(formatMixedIntentGoal('TT-HEL'), 'a Home Equity Line of Credit (HELOC)');
  assert.strictEqual(formatMixedIntentGoal('TT-HEQ'), 'a home equity loan');

  const rendered = renderMixedIntentFormulation('TT-PUR', 'TT-REF');
  assert.ok(rendered.includes('purchasing a new home and refinancing your current mortgage'));

  assert.strictEqual(
    extractRouteTag('ROUTE: MIXED | PRIMARY: TT-PUR | SECONDARY: TT-REF', 'PRIMARY'),
    'TT-PUR'
  );
  assert.strictEqual(
    extractRouteTag('ROUTE: MIXED | PRIMARY: TT-PUR | SECONDARY: TT-REF', 'SECONDARY'),
    'TT-REF'
  );

  // 2. Choice Parsing Checks
  assert.deepStrictEqual(
    parseMixedIntentChoice('start with purchase', ['TT-PUR', 'TT-REF']),
    { primary: 'TT-PUR', secondary: 'TT-REF' }
  );
  assert.deepStrictEqual(
    parseMixedIntentChoice('I prefer to refinance first', ['TT-PUR', 'TT-REF']),
    { primary: 'TT-REF', secondary: 'TT-PUR' }
  );
  assert.deepStrictEqual(
    parseMixedIntentChoice('let us do the first one', ['TT-PUR', 'TT-REF']),
    { primary: 'TT-PUR', secondary: 'TT-REF' }
  );
  assert.deepStrictEqual(
    parseMixedIntentChoice('the second one please', ['TT-PUR', 'TT-REF']),
    { primary: 'TT-REF', secondary: 'TT-PUR' }
  );

  // 3. Branch A: Purchase chosen as Primary (Turn 1 Mixed -> Turn 2 Purchase)
  const sessionA = new SessionContextManager(null as any, null as any);

  // Turn 1: Borrower mentions both purchase and refinance
  await sessionA.onUserTurn('I want to buy a house and also refinance my current one');
  const profileA1 = sessionA.getProfile();

  assert.ok(profileA1.signals_found?.includes('TT-PUR'), 'signals_found must include TT-PUR');
  assert.ok(profileA1.signals_found?.includes('TT-REF'), 'signals_found must include TT-REF');
  assert.strictEqual(profileA1.transaction_type, null, 'transaction_type must NOT be set prematurely');
  assert.strictEqual(profileA1.Q9_confirmed, false, 'Q9_confirmed must be false before borrower choice');
  assert.strictEqual(sessionA.getSection0RoutingStep(), 'MIXED_INTENT', 'Routing step must be MIXED_INTENT');
  assert.ok(
    sessionA.getMixedIntentFormulation().includes('purchasing a new home and refinancing your current mortgage'),
    'Mixed intent formulation rendered with both goals'
  );

  // Turn 2: Borrower selects Purchase
  await sessionA.onUserTurn("Let's start with purchasing");
  const profileA2 = sessionA.getProfile();

  assert.strictEqual(profileA2.transaction_type, 'TT-PUR', 'Primary chosen goal must activate TT-PUR');
  assert.strictEqual(profileA2.mortgage_goal, 'purchase');
  assert.strictEqual(profileA2.mortgage_goal_confirmed, true);
  assert.strictEqual(profileA2.secondary_intent, 'TT-REF', 'Unchosen goal stored in secondary_intent for MLO');
  assert.strictEqual(profileA2.Q9_confirmed, true, 'Q9 confirmed upon borrower choice');
  assert.notStrictEqual(profileA2.transaction_type, 'TT-REF', 'Secondary track must NOT activate simultaneously');
  assert.strictEqual(sessionA.getSection0RoutingStep(), 'NONE', 'Routing complete');

  // 4. Branch B: Refinance chosen as Primary
  const sessionB = new SessionContextManager(null as any, null as any);
  await sessionB.onUserTurn('I am looking to buy a new home and refinance my existing property');
  assert.strictEqual(sessionB.getSection0RoutingStep(), 'MIXED_INTENT');

  await sessionB.onUserTurn('I want to refinance first');
  const profileB2 = sessionB.getProfile();
  assert.strictEqual(profileB2.transaction_type, 'TT-REF');
  assert.strictEqual(profileB2.mortgage_goal, 'refinance');
  assert.strictEqual(profileB2.mortgage_goal_confirmed, true);
  assert.strictEqual(profileB2.secondary_intent, 'TT-PUR', 'Purchase stored as secondary intent');
  assert.strictEqual(profileB2.Q9_confirmed, true);

  // 5. Branch C: Resolved via LLM Tag Output on Turn 2
  const sessionC = new SessionContextManager(null as any, null as any);
  await sessionC.onUserTurn('I want to buy and refinance');
  assert.strictEqual(sessionC.getProfile().Q9_confirmed, false);

  await sessionC.onUserTurn('ROUTE: MIXED | PRIMARY: TT-PUR | SECONDARY: TT-REF');
  const profileC2 = sessionC.getProfile();
  assert.strictEqual(profileC2.transaction_type, 'TT-PUR');
  assert.strictEqual(profileC2.secondary_intent, 'TT-REF');
  assert.strictEqual(profileC2.Q9_confirmed, true);

  // 6. Branch D: Mixed intent emerging on Turn 2 after Turn 1 open question
  const sessionD = new SessionContextManager(null as any, null as any);
  await sessionD.onUserTurn('I have some general mortgage questions');
  assert.strictEqual(sessionD.getSection0RoutingStep(), 'Q9_STANDARD');

  // Turn 2: Borrower specifies two intents (Purchase and HELOC)
  await sessionD.onUserTurn('I want to buy a new home and also get a line of credit');
  assert.strictEqual(sessionD.getSection0RoutingStep(), 'MIXED_INTENT');
  assert.strictEqual(sessionD.getProfile().Q9_confirmed, false);

  // Turn 3: Borrower chooses HELOC
  await sessionD.onUserTurn('The line of credit is what I need first');
  const profileD3 = sessionD.getProfile();
  assert.strictEqual(profileD3.transaction_type, 'TT-HEL');
  assert.strictEqual(profileD3.secondary_intent, 'TT-PUR');
  assert.strictEqual(profileD3.Q9_confirmed, true);

  console.log('  ✅ S0-5 Passed: Mixed intent acknowledges both goals; routes chosen track, stores unchosen in secondary_intent.');
}

await testMixedIntentFlow();

// ── S0-7 & S0-13: TT-CON & TT-HECM Holdout Routing (T10 / S0-7 / S0-13) ─────
async function testHoldoutRoutingFlow() {
  // 1. Verbatim Formulations & Signal Checks
  assert.ok(HOLDOUT_SIGNALS.includes('TT-CON'));
  assert.ok(HOLDOUT_SIGNALS.includes('TT-HECM'));

  assert.ok(
    TT_CON_HOLDOUT_FORMULATION.includes('Construction loans involve some specific requirements that I want to make sure we handle correctly with a licensed loan officer.'),
    'TT-CON formulation starts with verbatim spec text'
  );
  assert.ok(
    TT_CON_HOLDOUT_FORMULATION.includes('Can I get your best contact information?'),
    'TT-CON formulation asks for contact information'
  );

  assert.ok(
    TT_HECM_HOLDOUT_FORMULATION.includes('Reverse mortgages have some unique features that are best explained by a licensed loan officer.'),
    'TT-HECM formulation starts with verbatim spec text'
  );
  assert.ok(
    TT_HECM_HOLDOUT_FORMULATION.includes('Can I get your best contact information?'),
    'TT-HECM formulation asks for contact information'
  );

  // 2. Holdout Helper Function Checks
  assert.strictEqual(getHoldoutFormulation(['TT-CON'])?.signal, 'TT-CON');
  assert.strictEqual(getHoldoutFormulation(['TT-HECM'])?.signal, 'TT-HECM');
  assert.strictEqual(getHoldoutFormulation(['TT-PUR']), null);

  // 3. Routing Tag & Utterance Decisions
  assert.strictEqual(parseQ9RoutingDecision('ROUTE: TT-CON'), 'TT-CON');
  assert.strictEqual(parseQ9RoutingDecision('ROUTE: TT-HECM'), 'TT-HECM');
  assert.strictEqual(parseQ9RoutingDecision('I want to build a house on my lot'), 'TT-CON');
  assert.strictEqual(parseQ9RoutingDecision('I want a reverse mortgage'), 'TT-HECM');

  // 4. S0-7: Construction Holdout Turn 1 Flow
  const sessionCon = new SessionContextManager(null as any, null as any);

  // Turn 1: Borrower states construction intent
  await sessionCon.onUserTurn('I want to build a house on my lot');
  const profileCon1 = sessionCon.getProfile();

  assert.ok(profileCon1.signals_found?.includes('TT-CON'), 'signals_found must include TT-CON');
  assert.strictEqual(profileCon1.holdout_routed, true, 'holdout_routed must be set to true');
  assert.strictEqual(profileCon1.transaction_type, null, 'transaction_type must strictly remain null');
  assert.strictEqual(profileCon1.Q9_confirmed, false, 'Q9_confirmed must strictly remain false');
  assert.strictEqual(sessionCon.getSection0RoutingStep(), 'HOLDOUT', 'Routing step must be HOLDOUT');
  assert.ok(
    sessionCon.getHoldoutFormulation().includes('Construction loans involve some specific requirements'),
    'Delivers TT-CON verbatim holdout script'
  );

  // Turn 2: Borrower provides contact info
  await sessionCon.onUserTurn('My email is john@example.com and phone is 555-123-4567');
  const profileCon2 = sessionCon.getProfile();

  assert.strictEqual(profileCon2.holdout_routed, true);
  assert.strictEqual(profileCon2.holdout_contact_captured, true, 'holdout_contact_captured must be true');
  assert.strictEqual(profileCon2.contact_email, 'john@example.com', 'contact_email must be captured');
  assert.strictEqual(profileCon2.contact_mobile, '5551234567', 'contact_mobile must be captured');
  assert.strictEqual(profileCon2.transaction_type, null, 'transaction_type must NOT be set to any track');
  assert.strictEqual(profileCon2.Q9_confirmed, false, 'Stage 1 must remain strictly blocked');
  assert.strictEqual(profileCon2.mortgage_goal, null, 'Stage 1 mortgage_goal must never be set');

  console.log('  ✅ S0-7 Passed: Construction loan (TT-CON) delivers holdout, blocks Stage 1, keeps transaction_type null.');

  // 5. S0-13: Reverse Mortgage (HECM) Holdout Turn 1 Flow
  const sessionHecm = new SessionContextManager(null as any, null as any);

  // Turn 1: Borrower states reverse mortgage intent
  await sessionHecm.onUserTurn('I want a reverse mortgage');
  const profileHecm1 = sessionHecm.getProfile();

  assert.ok(profileHecm1.signals_found?.includes('TT-HECM'), 'signals_found must include TT-HECM');
  assert.strictEqual(profileHecm1.holdout_routed, true, 'holdout_routed must be set to true');
  assert.strictEqual(profileHecm1.transaction_type, null, 'transaction_type must strictly remain null');
  assert.strictEqual(profileHecm1.Q9_confirmed, false, 'Q9_confirmed must strictly remain false');
  assert.strictEqual(sessionHecm.getSection0RoutingStep(), 'HOLDOUT');
  assert.ok(
    sessionHecm.getHoldoutFormulation().includes('Reverse mortgages have some unique features'),
    'Delivers TT-HECM verbatim holdout script'
  );

  // Turn 2: Borrower provides contact info
  await sessionHecm.onUserTurn('Sure, call me at 555-987-6543');
  const profileHecm2 = sessionHecm.getProfile();

  assert.strictEqual(profileHecm2.holdout_routed, true);
  assert.strictEqual(profileHecm2.transaction_type, null);
  assert.strictEqual(profileHecm2.Q9_confirmed, false);

  console.log('  ✅ S0-13 Passed: Reverse mortgage (TT-HECM) delivers holdout, blocks Stage 1, keeps transaction_type null.');

  // 6. Holdout emerging on Turn 2 after Turn 1 open question
  const sessionTurn2Holdout = new SessionContextManager(null as any, null as any);
  await sessionTurn2Holdout.onUserTurn('I have some general questions about loan options');
  assert.strictEqual(sessionTurn2Holdout.getSection0RoutingStep(), 'Q9_STANDARD');
  assert.strictEqual(sessionTurn2Holdout.getProfile().holdout_routed, false);

  // Turn 2: Borrower mentions construction
  await sessionTurn2Holdout.onUserTurn('I am interested in building a home on our land');
  const profileTurn2 = sessionTurn2Holdout.getProfile();
  assert.strictEqual(profileTurn2.holdout_routed, true);
  assert.strictEqual(profileTurn2.transaction_type, null);
  assert.strictEqual(profileTurn2.Q9_confirmed, false);
  assert.strictEqual(sessionTurn2Holdout.getSection0RoutingStep(), 'HOLDOUT');

  console.log('  ✅ S0-T10-Turn2 Passed: Holdout routing triggers cleanly when holdout intent emerges on Turn 2.');
}

await testHoldoutRoutingFlow();

// ── T11 & T12: Stage 1 Gate and stage0-routing.ts Block Verification ─────────
async function testStage1GateAndPrompts() {
  console.log('\n--- Testing Phase 4: Stage 1 Gate (T11) & Section 0 Prompt (T12) ---');

  const { buildLayer2, buildSection0Block } = await import('../prompts/ailana-system.js');
  const { SECTION_0_PROMPT, Q9_FORMULATION, Q9_TRID_GATE_FORMULATION } = await import('../prompts/stage0-routing.js');

  // 1. When Q9_confirmed is false, buildLayer2('1', profile) MUST return Section 0 Block
  const unconfirmedProfile: any = {
    Q9_confirmed: false,
    signals_found: ['TT-PUR', 'veteran'],
    trid_gate_fired: false,
    equity_disambig_delivered: false,
    fallback_routing_delivered: false,
    transaction_type: null,
  };

  const l2Unconfirmed = buildLayer2('1', unconfirmedProfile);
  assert.ok(
    l2Unconfirmed.includes('SECTION 0 — TRANSACTION TYPE ROUTING'),
    'buildLayer2 must return Section 0 prompt when Q9_confirmed is false'
  );
  assert.ok(
    l2Unconfirmed.includes('CURRENT ROUTING STATE:'),
    'buildLayer2 must inject CURRENT ROUTING STATE block'
  );
  assert.ok(
    l2Unconfirmed.includes('signals_found: ["TT-PUR","veteran"]'),
    'buildLayer2 must reflect signals_found in routing block'
  );
  assert.ok(
    !l2Unconfirmed.includes('STAGE 1: INTENT & DISCOVERY'),
    'Stage 1 discovery content must NOT be present when Q9_confirmed is false'
  );

  // 2. buildLayer2(profile) single argument overload check
  const l2Overload = buildLayer2(unconfirmedProfile);
  assert.ok(
    l2Overload.includes('SECTION 0 — TRANSACTION TYPE ROUTING'),
    'buildLayer2(profile) single-arg overload must gate on Q9_confirmed'
  );

  // 3. When Q9_confirmed is true, buildLayer2('1', profile) releases Stage 1
  const confirmedProfile: any = {
    ...unconfirmedProfile,
    Q9_confirmed: true,
    transaction_type: 'TT-PUR',
  };

  const l2ConfirmedStage1 = buildLayer2('1', confirmedProfile);
  assert.ok(
    l2ConfirmedStage1.includes('STAGE: Greeting and intent discovery'),
    'buildLayer2 must release Stage 1 discovery instructions when Q9_confirmed is true'
  );
  assert.ok(
    !l2ConfirmedStage1.includes('SECTION 0 — TRANSACTION TYPE ROUTING'),
    'Stage 1 prompt must not contain Section 0 prompt when released'
  );

  // 4. Verbatim Formulations in stage0-routing.ts
  assert.ok(
    SECTION_0_PROMPT.includes('You are in the routing phase. Your only job is to determine what'),
    'SECTION_0_PROMPT contains master v8.7 instructions'
  );
  assert.ok(
    Q9_FORMULATION.includes("To make sure I take you in the right direction — are you looking to purchase a home"),
    'Q9 formulation matches verbatim spec'
  );
  assert.ok(
    Q9_TRID_GATE_FORMULATION.includes("I want to make sure we handle your information correctly"),
    'Q9-TRID-GATE matches verbatim spec'
  );

  console.log('  ✅ T11 & T12 Passed: Stage 1 Gate strictly blocks Stage 1 when Q9_confirmed=false and releases cleanly when confirmed.');
}

await testStage1GateAndPrompts();

// ── T14: Layer 3 Turn Context Section 0 Block Verification ───────────────────
async function testLayer3Section0Context() {
  console.log('\n--- Testing Phase 4: Layer 3 Context Section 0 Block (T14) ---');

  const { buildLayer3TurnContext } = await import('../prompts/layer3-context.js');

  // 1. Before Q9 confirmation: Routing state block is visible
  const unconfirmedProfile: any = {
    Q9_confirmed: false,
    signals_found: ['TT-PUR', 'veteran'],
    Q9_MULTI_delivered: false,
    equity_disambig_delivered: false,
    fallback_routing_delivered: false,
    secondary_intent: null,
    transaction_type: null,
  };

  const l3Unconfirmed = buildLayer3TurnContext(unconfirmedProfile, 'mortgage_goal', '1');
  assert.ok(
    l3Unconfirmed.includes('=== SECTION 0 — ROUTING STATE ==='),
    'Layer 3 context must include Section 0 routing state block when Q9_confirmed is false'
  );
  assert.ok(
    l3Unconfirmed.includes('Q9 Confirmed:               false'),
    'Layer 3 context must display Q9 Confirmed: false'
  );
  assert.ok(
    l3Unconfirmed.includes('Signals Found:              [TT-PUR, veteran]'),
    'Layer 3 context must display formatted signals_found'
  );
  assert.ok(
    l3Unconfirmed.includes('SR-1 Availability:'),
    'Layer 3 context must include SR-1 availability instruction'
  );
  assert.ok(
    l3Unconfirmed.includes('Section 0 Transaction Type Routing'),
    'Layer 3 context must provide Section 0 routing taskLine'
  );
  assert.ok(
    !l3Unconfirmed.includes('Collect mortgage_goal'),
    'Layer 3 context must not instruct collecting mortgage_goal while in Section 0'
  );

  // 2. Empty signals formatting check
  const emptySignalsProfile: any = {
    ...unconfirmedProfile,
    signals_found: [],
  };
  const l3Empty = buildLayer3TurnContext(emptySignalsProfile, null, '1');
  assert.ok(
    l3Empty.includes('Signals Found:              (empty)'),
    'Layer 3 context must format empty signals as (empty)'
  );

  // 3. After Q9 confirmation: Routing state block is hidden so it does not clutter Stage 1–3
  const confirmedProfile: any = {
    ...unconfirmedProfile,
    Q9_confirmed: true,
    transaction_type: 'TT-PUR',
    mortgage_goal: 'purchase',
  };

  const l3Confirmed = buildLayer3TurnContext(confirmedProfile, 'occupancy', '1');
  assert.ok(
    !l3Confirmed.includes('=== SECTION 0 — ROUTING STATE ==='),
    'Layer 3 context must NOT include Section 0 routing state block when Q9_confirmed is true'
  );
  assert.ok(
    !l3Confirmed.includes('SR-1 Availability:'),
    'Layer 3 context must NOT include Section 0 SR-1 instruction once confirmed'
  );
  assert.ok(
    l3Confirmed.includes('=== BORROWER PROFILE (Stage 1 — Discovery) ==='),
    'Layer 3 context must contain standard Stage 1 profile block'
  );
  assert.ok(
    l3Confirmed.includes('Collect occupancy'),
    'Layer 3 context must instruct collecting active stage 1 field (occupancy) once confirmed'
  );

  console.log('  ✅ T14 Passed: Section 0 routing block is visible in Layer 3 before Q9 confirmation and strictly hidden after confirmation.');
}

await testLayer3Section0Context();

// ── S0-15: After Q9-MULTI, Stage 2 runs — veteran not re-asked (T15 / S0-15) ─
async function testS0_15_Stage2SkipsQ43() {
  console.log('\n--- Testing Phase 5: S0-15 Stage 2 Suppresses Pre-Answered Q43 ---');

  const session = new SessionContextManager(null as any, null as any);

  // Turn 1: Borrower provides purchase + veteran signal -> triggers Q9-MULTI Template A
  await session.onUserTurn("I want to buy a home and I'm a military veteran");
  const profileTurn1 = session.getProfile();

  assert.ok(profileTurn1.signals_found?.includes('TT-PUR'));
  assert.ok(profileTurn1.signals_found?.includes('veteran'));
  assert.strictEqual(profileTurn1.veteran_flagged, true);
  assert.strictEqual(profileTurn1.Q43_answered, true);
  assert.strictEqual(profileTurn1.military_rural, 'military');
  assert.strictEqual(profileTurn1.military_rural_confirmed, true);

  // Turn 2: Borrower confirms purchase intent
  await session.onUserTurn("Yes, I want to purchase on my own");
  const profileTurn2 = session.getProfile();
  assert.strictEqual(profileTurn2.transaction_type, 'TT-PUR');
  assert.strictEqual(profileTurn2.Q9_confirmed, true);

  // Simulate advancing through Stage 2 purchase discovery fields up to property_type:
  session.setActiveStage('2');
  profileTurn2.gross_annual_income_confirmed = true;
  profileTurn2.monthly_debt_confirmed = true;
  profileTurn2.credit_range_confirmed = true;
  profileTurn2.down_payment_confirmed = true;
  profileTurn2.rent_own_confirmed = true;
  profileTurn2.realtor_status_confirmed = true;
  profileTurn2.target_price_confirmed = true;
  profileTurn2.property_type_confirmed = true;

  // Advance workflow to evaluate next Stage 2 question:
  session.advanceWorkflow();

  // Key Assertion: Q43 (military_rural) MUST be skipped; next pending field advances directly to job_tenure_type!
  assert.notStrictEqual(
    session.getPendingField(),
    'military_rural',
    'Q43 (military_rural) must NOT appear in Stage 2 sequence when veteran is pre-stated'
  );
  assert.strictEqual(
    session.getPendingField(),
    'job_tenure_type',
    'Stage 2 sequence must advance directly to job_tenure_type'
  );

  console.log('  ✅ S0-15 Passed: Veteran signal extracted via Q9-MULTI suppresses Q43; Stage 2 advances cleanly to job_tenure_type.');
}

await testS0_15_Stage2SkipsQ43();

// ── E2E-3: Full Front-Load Multi-Signal Template F & Question Suppression ───
async function testE2E3_FullFrontLoadSuppression() {
  console.log('\n--- Testing E2E-3: Multi-Signal Full Front-Loading Question Suppression ---');

  const session = new SessionContextManager(null as any, null as any);

  // Turn 1: Borrower provides all 5 front-loaded signals
  await session.onUserTurn("My wife and I make 110,000 dollars yearly. We are veterans. We have 40,000 saved and want to buy a house in Florida.");
  const p1 = session.getProfile();

  assert.ok(p1.signals_found?.includes('TT-PUR'), 'Must extract TT-PUR');
  assert.ok(p1.signals_found?.includes('veteran'), 'Must extract veteran');
  assert.ok(p1.signals_found?.includes('co_borrower'), 'Must extract co_borrower');
  assert.ok(p1.signals_found?.includes('income'), 'Must extract income');
  assert.ok(p1.signals_found?.includes('savings'), 'Must extract savings');
  assert.ok(p1.signals_found?.includes('location'), 'Must extract location');

  assert.strictEqual(p1.pre_stated_income, 110000);
  assert.strictEqual(p1.pre_stated_savings, 40000);
  assert.strictEqual(p1.pre_stated_location, 'Florida');
  assert.strictEqual(p1.Q13_answered, true, 'Q13 must be answered');
  assert.strictEqual(p1.Q35_answered, true, 'Q35 must be answered');
  assert.strictEqual(p1.Q38_answered, true, 'Q38 must be answered');
  assert.strictEqual(p1.Q43_answered, true, 'Q43 must be answered');

  // Verify Template F rendering has $110,000 and $40,000 populated
  const templateText = session.getQ9MultiText();
  assert.ok(templateText.includes('$110,000'), 'Template F must include $110,000');
  assert.ok(templateText.includes('$40,000'), 'Template F must include $40,000');

  // Turn 2: Borrower answers property type & target price
  await session.onUserTurn("We're looking for a single family home and uh there's no target price in the mind.");
  const p2 = session.getProfile();
  assert.strictEqual(p2.transaction_type, 'TT-PUR');
  assert.strictEqual(p2.Q9_confirmed, true);
  assert.strictEqual(p2.property_type, 'single_family');
  assert.strictEqual(p2.property_type_confirmed, true);

  // Advance through Stage 1: occupancy, existing relationship, timeline
  p2.occupancy = 'primary';
  p2.occupancy_confirmed = true;
  p2.existing_relationship = 'no';
  p2.existing_relationship_confirmed = true;
  p2.timeline = 'next few months';
  p2.timeline_confirmed = true;

  session.advanceWorkflow();

  // Stage 1 Verification: Q13 (co_borrower) MUST be skipped!
  assert.notStrictEqual(session.getPendingField(), 'co_borrower', 'Q13 co_borrower must be SKIPPED in Stage 1');
  assert.strictEqual(session.getActiveStage(), '2', 'Must transition directly to Stage 2');

  // Stage 2 Verification: gross_annual_income (Q35) MUST be skipped!
  assert.notStrictEqual(session.getPendingField(), 'gross_annual_income', 'Q35 gross_annual_income must be SKIPPED in Stage 2');
  assert.strictEqual(session.getPendingField(), 'monthly_debt', 'Must advance directly to monthly_debt');

  // Advance monthly debt and credit score
  p2.monthly_debt = 2000;
  p2.monthly_debt_confirmed = true;
  p2.credit_range = '700';
  p2.credit_range_confirmed = true;

  session.advanceWorkflow();

  // Downstream Verification: down_payment (Q38) MUST be skipped!
  assert.notStrictEqual(session.getPendingField(), 'down_payment', 'Q38 down_payment must be SKIPPED in Stage 2');
  assert.strictEqual(session.getPendingField(), 'rent_own', 'Must advance directly to rent_own');

  console.log('  ✅ E2E-3 Passed: All pre-stated fields (Q13, Q35, Q38, Q43) cleanly skipped across Stage 1 and Stage 2.');
}

await testE2E3_FullFrontLoadSuppression();

console.log('\n======================================================');
console.log('✨ ALL 15 SECTION 0 UNIT TESTS (S0-1 to S0-15) PASSED! (15/15)');
console.log('✨ ALL SECTION 0 PHASES 1 TO 4 (T1–T14) & T15 TESTS PASSED!');
console.log('======================================================\n');



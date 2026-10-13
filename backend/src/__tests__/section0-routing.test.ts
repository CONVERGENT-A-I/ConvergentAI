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
  SessionContextManager,
} from '../context/session-context-manager.js';

console.log('🧪 Running Section 0 Test Suite (Phases 1–3: T1–T5)...\n');

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

console.log('\n======================================================');
console.log('✨ ALL SECTION 0 (PHASES 1, 2, & T5) TESTS PASSED!');
console.log('======================================================\n');

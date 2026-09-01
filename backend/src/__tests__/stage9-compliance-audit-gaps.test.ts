import 'dotenv/config';
import { SessionContextManager } from '../context/session-context-manager.js';
import { buildStage2RefinanceInstructions } from '../prompts/stage2-refinance.js';
import { buildStage2HelocInstructions } from '../prompts/stage2-heloc.js';
import { buildStage3Instructions } from '../prompts/stage3-guidance.js';
import { buildStage25Instructions } from '../prompts/stage25-affordability.js';
import { buildStage4Instructions } from '../prompts/stage4-underwriting.js';
import { buildLayer2 } from '../prompts/ailana-system.js';
import type { BorrowerProfile } from '../prompts/layer3-context.js';

async function runStage9ComplianceAuditGapTests() {
  console.log('🧪 Running Stage 9 Compliance Audit Gap Remediation Tests (13 Gaps)...\n');

  // =========================================================================
  // GAP HG-1: RQ28 (prior_refinance) and RQ29 (stay_duration_years) in Refinance Flow
  // =========================================================================
  console.log('--- Testing HG-1: RQ28 and RQ29 in Refinance Sequence ---');
  const refManager = new SessionContextManager({} as any, {} as any);
  const rp = refManager.getProfile();
  rp.mortgage_goal = 'refinance';
  rp.transaction_type = 'TT-REF';
  rp.mortgage_goal_confirmed = true;
  rp.occupancy_confirmed = true;
  rp.existing_relationship_confirmed = true;
  rp.timeline_confirmed = true;
  rp.co_borrower_confirmed = true;

  refManager.advanceWorkflow(); // Stage 2: gross_annual_income
  rp.gross_annual_income = 120000;
  rp.gross_annual_income_confirmed = true;
  refManager.advanceWorkflow(); // monthly_debt
  rp.monthly_debt = 500;
  rp.monthly_debt_confirmed = true;
  refManager.advanceWorkflow(); // credit_range
  rp.credit_range = '740';
  rp.credit_range_confirmed = true;
  refManager.advanceWorkflow(); // current_mortgage_type
  rp.current_mortgage_type = 'conventional';
  refManager.advanceWorkflow(); // property_value
  rp.property_value = 500000;
  (rp as any).property_value_confirmed = true;
  refManager.advanceWorkflow(); // first_mortgage_balance
  rp.first_mortgage_balance = 250000;
  (rp as any).first_mortgage_balance_confirmed = true;
  refManager.advanceWorkflow(); // current_mortgage_rate
  rp.current_mortgage_rate = 6.25;
  (rp as any).current_mortgage_rate_confirmed = true;
  refManager.advanceWorkflow(); // current_mortgage_payment
  rp.current_mortgage_payment = 1800;
  (rp as any).current_mortgage_payment_confirmed = true;
  refManager.advanceWorkflow(); // remaining_term_years
  rp.remaining_term_years = 22;
  (rp as any).remaining_term_years_confirmed = true;
  refManager.advanceWorkflow(); // closing_costs_preference
  rp.closing_costs_preference = 'rolled_in';
  refManager.advanceWorkflow(); // prior_refinance (RQ28)

  console.assert(
    refManager.getPendingField() === 'prior_refinance',
    `HG-1 Failed: Expected prior_refinance, got ${refManager.getPendingField()}`
  );
  console.log('✅ Gap HG-1.1 Passed: Refinance sequence reaches prior_refinance (RQ28).');

  rp.prior_refinance = 'no';
  rp.prior_refinance_confirmed = true;
  refManager.advanceWorkflow(); // stay_duration_years (RQ29)

  console.assert(
    refManager.getPendingField() === 'stay_duration_years',
    `HG-1 Failed: Expected stay_duration_years, got ${refManager.getPendingField()}`
  );
  console.log('✅ Gap HG-1.2 Passed: Refinance sequence reaches stay_duration_years (RQ29).');

  rp.stay_duration_years = 8;
  rp.stay_duration_years_confirmed = true;
  refManager.advanceWorkflow(); // job_tenure_type

  console.assert(
    refManager.getPendingField() === 'job_tenure_type',
    `HG-1 Failed: Expected job_tenure_type, got ${refManager.getPendingField()}`
  );
  console.log('✅ Gap HG-1.3 Passed: Refinance sequence advances from stay_duration_years to job_tenure_type.');

  // =========================================================================
  // GAP HG-2: RQ26 Routing - USDA Skips RQ26 & Unknown Asks RQ26
  // =========================================================================
  console.log('\n--- Testing HG-2: RQ26 Conditional Routing ---');
  // USDA track
  const usdaManager = new SessionContextManager({} as any, {} as any);
  const up = usdaManager.getProfile();
  up.mortgage_goal = 'refinance';
  up.transaction_type = 'TT-REF';
  up.mortgage_goal_confirmed = true;
  up.occupancy_confirmed = true;
  up.existing_relationship_confirmed = true;
  up.timeline_confirmed = true;
  up.co_borrower_confirmed = true;
  usdaManager.advanceWorkflow();
  up.gross_annual_income = 80000;
  up.gross_annual_income_confirmed = true;
  usdaManager.advanceWorkflow();
  up.monthly_debt = 300;
  up.monthly_debt_confirmed = true;
  usdaManager.advanceWorkflow();
  up.credit_range = '680';
  up.credit_range_confirmed = true;
  usdaManager.advanceWorkflow();
  up.current_mortgage_type = 'usda';
  usdaManager.advanceWorkflow();

  console.assert(
    up.refinance_type === 'rate_term' && up.refinance_type_confirmed === true,
    'HG-2 USDA Failed: refinance_type must be auto-set to rate_term for USDA'
  );
  console.assert(
    usdaManager.getPendingField() === 'property_value',
    `HG-2 USDA Failed: Expected property_value after USDA mortgage type, got ${usdaManager.getPendingField()}`
  );
  console.log('✅ Gap HG-2.1 Passed: USDA track skips RQ26 and auto-sets refinance_type=rate_term.');

  // Unknown mortgage type track
  const unkManager = new SessionContextManager({} as any, {} as any);
  const unkp = unkManager.getProfile();
  unkp.mortgage_goal = 'refinance';
  unkp.transaction_type = 'TT-REF';
  unkp.mortgage_goal_confirmed = true;
  unkp.occupancy_confirmed = true;
  unkp.existing_relationship_confirmed = true;
  unkp.timeline_confirmed = true;
  unkp.co_borrower_confirmed = true;
  unkManager.advanceWorkflow();
  unkp.gross_annual_income = 95000;
  unkp.gross_annual_income_confirmed = true;
  unkManager.advanceWorkflow();
  unkp.monthly_debt = 400;
  unkp.monthly_debt_confirmed = true;
  unkManager.advanceWorkflow();
  unkp.credit_range = '700';
  unkp.credit_range_confirmed = true;
  unkManager.advanceWorkflow();
  unkp.current_mortgage_type = 'unknown';
  unkManager.advanceWorkflow();

  console.assert(
    unkManager.getPendingField() === 'refinance_type',
    `HG-2 Unknown Failed: Expected refinance_type when current_mortgage_type is unknown, got ${unkManager.getPendingField()}`
  );
  console.log('✅ Gap HG-2.2 Passed: Unknown mortgage type track asks RQ26 refinance_type.');

  // =========================================================================
  // GAP HG-3 & SG-10: Sub-track architecture with strict gating & verbatim scripts
  // =========================================================================
  console.log('\n--- Testing HG-3 & SG-10: Sub-track overviews and gating instructions ---');
  const vaPrompt = buildStage2RefinanceInstructions({ current_mortgage_type: 'va' });
  const fhaPrompt = buildStage2RefinanceInstructions({ current_mortgage_type: 'fha' });
  const convPrompt = buildStage2RefinanceInstructions({ current_mortgage_type: 'conventional' });
  const usdaPrompt = buildStage2RefinanceInstructions({ current_mortgage_type: 'usda' });

  console.assert(vaPrompt.includes('VA-REF-OVERVIEW') && vaPrompt.includes('[DO NOT DELIVER UNPROMPTED]'), 'HG-3/SG-10 VA overview or gating missing');
  console.assert(fhaPrompt.includes('FHA-REF-OVERVIEW') && fhaPrompt.includes('[DO NOT DELIVER UNPROMPTED]'), 'HG-3/SG-10 FHA overview or gating missing');
  console.assert(convPrompt.includes('CONV-REF-OVERVIEW') && convPrompt.includes('[DO NOT DELIVER UNPROMPTED]'), 'HG-3/SG-10 Conv overview or gating missing');
  console.assert(usdaPrompt.includes('USDA-REF-OVERVIEW'), 'HG-3/SG-10 USDA overview missing');
  console.log('✅ Gap HG-3 & SG-10 Passed: Sub-track overviews include verbatim scripts and [DO NOT DELIVER UNPROMPTED] gating.');

  // =========================================================================
  // GAP SG-1: USDA cash-out response names all 3 alternatives
  // =========================================================================
  console.log('\n--- Testing SG-1: USDA cash-out response names 3 alternatives ---');
  console.assert(
    usdaPrompt.includes('Streamlined Assist') &&
    usdaPrompt.includes('Standard Streamlined') &&
    usdaPrompt.includes('Non-Streamlined'),
    'SG-1 Failed: USDA prompt must name Streamlined Assist, Standard Streamlined, and Non-Streamlined'
  );
  console.log('✅ Gap SG-1 Passed: USDA prompt explicitly names all 3 rate-and-term alternatives.');

  // =========================================================================
  // GAP SG-4: Stage 3 Section 3B Product Fit Refinement for TT-REF
  // =========================================================================
  console.log('\n--- Testing SG-4: Stage 3 Section 3B Refinance Questions ---');
  const stage3RefPrompt = buildStage3Instructions({ transaction_type: 'TT-REF', mortgage_goal: 'refinance', borrower_name: 'Sarah' });
  console.assert(stage3RefPrompt.includes('STAGE: Product guidance and eligibility education (Stage 3 — Refinance Track)'), 'SG-4 Failed: Refinance stage 3 header missing');
  console.assert(stage3RefPrompt.includes('streamline eligibility if that applies to you'), 'SG-4 Failed: Question 1 missing');
  console.assert(stage3RefPrompt.includes('lowering your monthly payment as much as possible'), 'SG-4 Failed: Question 2 missing');
  console.assert(stage3RefPrompt.includes('staying in this home long-term'), 'SG-4 Failed: Question 3 missing');
  console.log('✅ Gap SG-4 Passed: Stage 3 includes all 3 Refinance Section 3B product-fit questions.');

  // =========================================================================
  // GAP SG-5: Refinance Stage 3 Closing Transition Prompt
  // =========================================================================
  console.log('\n--- Testing SG-5: Refinance Stage 3 Closing Transition Prompt ---');
  console.assert(stage3RefPrompt.includes("You've got a clear picture now of your refinance options, Sarah"), 'SG-5 Failed: Stage 3 closing offer missing refinance wording');
  console.log('✅ Gap SG-5 Passed: Refinance Stage 3 Closing Transition prompt uses track-adapted vocabulary.');

  // =========================================================================
  // GAP SG-8: EQ16 Home Equity Loan (TT-HEQ) Variable Rate Exclusion
  // =========================================================================
  console.log('\n--- Testing SG-8: EQ16 Fixed Rate Risk Disclosure for TT-HEQ ---');
  const heqPrompt = buildStage2HelocInstructions({ transaction_type: 'TT-HEQ' });
  const helocPrompt = buildStage2HelocInstructions({ transaction_type: 'TT-HEL' });

  console.assert(heqPrompt.includes('MANDATORY RISK DISCLOSURE (EQ16 — HOME EQUITY LOAN)'), 'SG-8 Failed: EQ16 header missing');
  console.assert(heqPrompt.includes('Your home equity loan carries a fixed rate, so unlike a HELOC, your rate and payment won\'t change'), 'SG-8 Failed: EQ16 fixed rate text missing');
  console.assert(!heqPrompt.includes('HELOC rates are typically variable and adjust with the market'), 'SG-8 Failed: Variable rate risk language must not appear in TT-HEQ disclosure');
  console.assert(helocPrompt.includes('MANDATORY RISK & REPAYMENT DISCLOSURE (HQ16/HQ19)'), 'SG-8 Failed: HELOC HQ16 header missing');
  console.log('✅ Gap SG-8 Passed: TT-HEQ delivers EQ16 fixed-rate disclosure without variable-rate risk language.');

  // =========================================================================
  // GAP SG-9: RQ30 Rate Refusal with Mandatory MLO Offer
  // =========================================================================
  console.log('\n--- Testing SG-9: RQ30 Rate Refusal Script with MLO Offer ---');
  console.assert(stage3RefPrompt.includes('RATE INQUIRY (RQ30 — MANDATORY FORMULATION WITH MLO OFFER)'), 'SG-9 Failed: RQ30 header missing');
  console.assert(stage3RefPrompt.includes('Since you\'ve asked directly about rates, I also want to make sure you have the option to speak with a licensed loan officer right now'), 'SG-9 Failed: MLO offer missing from RQ30');
  console.log('✅ Gap SG-9 Passed: RQ30 rate inquiry response includes mandatory MLO-connection offer.');

  // =========================================================================
  // GAP SG-7: Stage 2.5 30+ Second Loading Message
  // =========================================================================
  console.log('\n--- Testing SG-7: Stage 2.5 30+ Second Loading Message ---');
  const stage25Prompt = buildStage25Instructions({ transaction_type: 'TT-REF', borrower_name: 'David' });
  console.assert(stage25Prompt.includes('If additional time passes (30+ seconds):'), 'SG-7 Failed: 30+ second loading message missing');
  console.assert(stage25Prompt.includes('Still processing — thank you for your patience'), 'SG-7 Failed: "Still processing" phrasing missing');
  console.log('✅ Gap SG-7 Passed: Stage 2.5 includes the 30+ second extended loading state message.');

  // =========================================================================
  // GAP SG-2: RQ27-MAXOUT Wording in Stage 2 Refinance Prompt
  // =========================================================================
  console.log('\n--- Testing SG-2: RQ27-MAXOUT in Refinance Prompt ---');
  const cashOutPrompt = buildStage2RefinanceInstructions({ refinance_type: 'cash_out' });
  console.assert(cashOutPrompt.includes('RQ27-MAXOUT'), 'SG-2 Failed: RQ27-MAXOUT missing from cash-out prompt');
  console.assert(cashOutPrompt.includes("typically 80% for conventional loans, less the amount currently owed"), 'SG-2 Failed: RQ27-MAXOUT 80% LTV rule missing');
  console.log('✅ Gap SG-2 Passed: RQ27-MAXOUT is fully specified in the prompt.');

  // =========================================================================
  // Layer 2 Stage Selector Routing for All Tracks
  // =========================================================================
  console.log('\n--- Testing Layer 2 Stage Selector Routing ---');
  const l2Ref = buildLayer2('2', { transaction_type: 'TT-REF' });
  const l2Hel = buildLayer2('2', { transaction_type: 'TT-HEL' });
  const l2Heq = buildLayer2('2', { transaction_type: 'TT-HEQ' });
  const l2Pur = buildLayer2('2', { transaction_type: 'TT-PUR' });
  const l3Ref = buildLayer2('3', { transaction_type: 'TT-REF' });

  console.assert(l2Ref.includes('Refinance Pre-Qualification Discovery (TT-REF)'), 'L2 Ref failed');
  console.assert(l2Hel.includes('Home Equity Line of Credit Pre-Qualification Discovery (TT-HEL)'), 'L2 Hel failed');
  console.assert(l2Heq.includes('Home Equity Loan Pre-Qualification Discovery (TT-HEQ)'), 'L2 Heq failed');
  console.assert(l2Pur.includes('Pre-qualification discovery'), 'L2 Pur failed');
  console.assert(l3Ref.includes('Stage 3 — Refinance Track'), 'L3 Ref failed');
  console.log('✅ Layer 2 Selector: All tracks (TT-REF, TT-HEL, TT-HEQ, TT-PUR) route cleanly across Stage 2 and Stage 3.');

  // =========================================================================
  // GAPS G2 & G3: HELOC Sequence - HQ25 (heloc_prior) and HQ26 (heloc_timeline)
  // =========================================================================
  console.log('\n--- Testing Gaps G2 & G3: HELOC Sequence with HQ25 and HQ26 ---');
  const helocManager = new SessionContextManager({} as any, {} as any);
  const hp = helocManager.getProfile();
  hp.mortgage_goal = 'heloc';
  hp.transaction_type = 'TT-HEL';
  hp.mortgage_goal_confirmed = true;
  hp.occupancy_confirmed = true;
  hp.existing_relationship_confirmed = true;
  hp.timeline_confirmed = true;
  hp.co_borrower_confirmed = true;

  helocManager.advanceWorkflow(); // gross_annual_income
  hp.gross_annual_income = 150000;
  hp.gross_annual_income_confirmed = true;
  helocManager.advanceWorkflow(); // monthly_debt
  hp.monthly_debt = 800;
  hp.monthly_debt_confirmed = true;
  helocManager.advanceWorkflow(); // credit_range
  hp.credit_range = '760';
  hp.credit_range_confirmed = true;
  helocManager.advanceWorkflow(); // heloc_risk_acknowledged
  hp.heloc_risk_acknowledged = true;
  helocManager.advanceWorkflow(); // heloc_rate_comfort
  hp.heloc_rate_comfort = 'variable';
  hp.heloc_rate_comfort_confirmed = true;
  helocManager.advanceWorkflow(); // property_value
  hp.property_value = 600000;
  (hp as any).property_value_confirmed = true;
  helocManager.advanceWorkflow(); // first_mortgage_balance
  hp.first_mortgage_balance = 300000;
  (hp as any).first_mortgage_balance_confirmed = true;
  helocManager.advanceWorkflow(); // heloc_line_amount
  hp.heloc_line_amount = 100000;
  (hp as any).heloc_line_amount_confirmed = true;
  helocManager.advanceWorkflow(); // heloc_draw_use
  hp.heloc_draw_use = 'Home renovations';
  helocManager.advanceWorkflow(); // heloc_prior (HQ25)

  console.assert(
    helocManager.getPendingField() === 'heloc_prior',
    `G2 Failed: Expected heloc_prior (HQ25), got ${helocManager.getPendingField()}`
  );
  console.log('✅ Gap G2 Passed: HELOC sequence reaches heloc_prior (HQ25).');

  hp.heloc_prior = 'no';
  hp.heloc_prior_confirmed = true;
  helocManager.advanceWorkflow(); // heloc_timeline (HQ26)

  console.assert(
    helocManager.getPendingField() === 'heloc_timeline',
    `G3 Failed: Expected heloc_timeline (HQ26), got ${helocManager.getPendingField()}`
  );
  console.log('✅ Gap G3 Passed: HELOC sequence reaches heloc_timeline (HQ26).');

  hp.heloc_timeline = 'within 30 days';
  hp.heloc_timeline_confirmed = true;
  helocManager.advanceWorkflow(); // job_tenure_type

  console.assert(
    helocManager.getPendingField() === 'job_tenure_type',
    `G2/G3 Failed: Expected job_tenure_type after heloc_timeline, got ${helocManager.getPendingField()}`
  );
  console.log('✅ Gaps G2 & G3 Passed: HELOC sequence advances seamlessly from heloc_timeline to job_tenure_type.');

  // =========================================================================
  // GAP G4: Stage 4 Findings Delivery - EFD1/EFD2 for TT-HEQ vs HFD1/HFD2 for TT-HEL
  // =========================================================================
  console.log('\n--- Testing Gap G4: Stage 4 Findings Delivery for TT-HEQ (EFD1/EFD2) vs TT-HEL (HFD1/HFD2) ---');
  const heqStage4Approve = buildStage4Instructions({
    transaction_type: 'TT-HEQ',
    borrower_name: 'Alex',
    aus_status: 'approve',
  });
  const heqStage4Refer = buildStage4Instructions({
    transaction_type: 'TT-HEQ',
    borrower_name: 'Alex',
    aus_status: 'refer',
  });
  const helocStage4Approve = buildStage4Instructions({
    transaction_type: 'TT-HEL',
    borrower_name: 'Alex',
    aus_status: 'approve',
  });
  const helocStage4Refer = buildStage4Instructions({
    transaction_type: 'TT-HEL',
    borrower_name: 'Alex',
    aus_status: 'refer',
  });

  console.assert(
    heqStage4Approve.includes('CURRENT SUB-STAGE: Home Equity Loan Conditional Approval (EFD1)') &&
    heqStage4Approve.includes('conditionally eligible for a home equity loan') &&
    heqStage4Approve.includes('estimated loan amount and monthly payment range are on your screen now'),
    'G4 Failed: TT-HEQ approve must deliver EFD1 wording with home equity loan terminology'
  );
  console.assert(
    !heqStage4Approve.includes('home equity line of credit'),
    'G4 Failed: TT-HEQ EFD1 must not mention home equity line of credit'
  );
  console.assert(
    heqStage4Refer.includes('CURRENT SUB-STAGE: Home Equity Loan Manual Review Referral (EFD2)') &&
    heqStage4Refer.includes('home equity loan scenario warrants a closer look'),
    'G4 Failed: TT-HEQ refer must deliver EFD2 wording'
  );

  console.assert(
    helocStage4Approve.includes('CURRENT SUB-STAGE: HELOC Conditional Line Approval (HFD1)') &&
    helocStage4Approve.includes('conditionally eligible for a home equity line of credit') &&
    helocStage4Approve.includes('estimated available credit line is on your screen now'),
    'G4 Failed: TT-HEL approve must deliver HFD1 credit line wording'
  );
  console.assert(
    helocStage4Refer.includes('CURRENT SUB-STAGE: HELOC Manual Review Referral (HFD2)') &&
    helocStage4Refer.includes('HELOC scenario warrants a closer look'),
    'G4 Failed: TT-HEL refer must deliver HFD2 wording'
  );
  console.log('✅ Gap G4 Passed: TT-HEQ cleanly delivers EFD1/EFD2 and TT-HEL cleanly delivers HFD1/HFD2 without terminology bleeding.');

  console.log('\n🎉 ALL COMPLIANCE AUDIT GAP REMEDIATION TESTS PASSED 100%!');
}

runStage9ComplianceAuditGapTests().catch(err => {
  console.error('❌ Stage 9 Compliance Audit Tests Failed:', err);
  process.exit(1);
});

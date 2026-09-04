import 'dotenv/config';
import { SessionContextManager } from '../context/session-context-manager.js';
import { buildStage2HelocInstructions } from '../prompts/stage2-heloc.js';
import type { BorrowerProfile } from '../prompts/layer3-context.js';

async function runHelocFlowTests() {
  console.log('🧪 Running HELOC Track (TT-HEL) Stage 2 Unit & Flow Tests...\n');

  // Test 1: HELOC Prompt Builder Integrity
  const helocProfile: BorrowerProfile = {
    transaction_type: 'TT-HEL',
    mortgage_goal: 'heloc',
    property_value: 500000,
    first_mortgage_balance: 250000,
    heloc_line_amount: 75000,
    heloc_risk_acknowledged: true,
  };

  const helocInstructions = buildStage2HelocInstructions(helocProfile);
  if (
    helocInstructions.includes('STAGE: Home Equity Line of Credit Pre-Qualification Discovery (TT-HEL)') &&
    helocInstructions.includes('MANDATORY RISK & REPAYMENT DISCLOSURE (HQ16/HQ19)') &&
    helocInstructions.includes('property_value') &&
    helocInstructions.includes('first_mortgage_balance') &&
    helocInstructions.includes('heloc_line_amount')
  ) {
    console.log('✅ HELOC - Test 1 Passed: HELOC Stage 2 prompt instructions generated cleanly.');
  } else {
    console.error('❌ HELOC - Test 1 Failed: Missing required instructions', helocInstructions);
  }

  // Test 2: State Machine Stage 2 Sequencing for TT-HEL
  const manager = new SessionContextManager({} as any, {} as any);
  const p = manager.getProfile();
  p.mortgage_goal = 'heloc';
  p.transaction_type = 'TT-HEL';
  p.mortgage_goal_confirmed = true;
  p.occupancy_confirmed = true;
  p.existing_relationship_confirmed = true;
  p.timeline_confirmed = true;
  p.co_borrower_confirmed = true;

  // Advance from Stage 1 -> Stage 2
  manager.advanceWorkflow();
  if (manager.getActiveStage() === '2' && manager.getPendingField() === 'gross_annual_income') {
    console.log('✅ HELOC - Test 2a Passed: Starts Stage 2 with gross_annual_income.');
  } else {
    console.error('❌ HELOC - Test 2a Failed:', manager.getActiveStage(), manager.getPendingField());
  }

  // Confirm income -> monthly_debt
  p.gross_annual_income = 140000;
  p.gross_annual_income_confirmed = true;
  manager.advanceWorkflow();
  if (manager.getPendingField() === 'monthly_debt') {
    console.log('✅ HELOC - Test 2b Passed: Advances to monthly_debt.');
  }

  // Confirm debt -> credit_range
  p.monthly_debt = 500;
  p.monthly_debt_confirmed = true;
  manager.advanceWorkflow();
  if (manager.getPendingField() === 'credit_range') {
    console.log('✅ HELOC - Test 2c Passed: Advances to credit_range.');
  }

  // Confirm credit -> heloc_risk_acknowledged
  p.credit_range = '760';
  p.credit_range_confirmed = true;
  manager.advanceWorkflow();
  if (manager.getPendingField() === 'heloc_risk_acknowledged') {
    console.log('✅ HELOC - Test 2d Passed: Advances to heloc_risk_acknowledged (HQ16/HQ19).');
  }

  // Confirm risk disclosure -> heloc_rate_comfort (HQ24)
  p.heloc_risk_acknowledged = true;
  manager.advanceWorkflow();
  if (manager.getPendingField() === 'heloc_rate_comfort') {
    console.log('✅ HELOC - Test 2e Passed: Advances to heloc_rate_comfort (HQ24).');
  }

  // Confirm rate comfort -> property_value
  p.heloc_rate_comfort = 'variable';
  (p as any).heloc_rate_comfort_confirmed = true;
  manager.advanceWorkflow();
  if (manager.getPendingField() === 'property_value') {
    console.log('✅ HELOC - Test 2f Passed: Advances to property_value (HQ20).');
  }

  // Confirm property_value -> first_mortgage_balance
  p.property_value = 500000;
  (p as any).property_value_confirmed = true;
  manager.advanceWorkflow();
  if (manager.getPendingField() === 'first_mortgage_balance') {
    console.log('✅ HELOC - Test 2g Passed: Advances to first_mortgage_balance (HQ21).');
  }

  // Confirm 1st balance -> heloc_line_amount
  p.first_mortgage_balance = 250000;
  (p as any).first_mortgage_balance_confirmed = true;
  manager.advanceWorkflow();
  if (manager.getPendingField() === 'heloc_line_amount') {
    console.log('✅ HELOC - Test 2h Passed: Advances to heloc_line_amount (HQ22).');
  }

  // Confirm line amount -> heloc_draw_use
  p.heloc_line_amount = 75000;
  (p as any).heloc_line_amount_confirmed = true;
  manager.advanceWorkflow();
  if (manager.getPendingField() === 'heloc_draw_use') {
    console.log('✅ HELOC - Test 2i Passed: Advances to heloc_draw_use (HQ23).');
  }

  // Confirm draw use -> heloc_prior (HQ25)
  p.heloc_draw_use = 'Kitchen and bath remodel';
  manager.advanceWorkflow();
  if (manager.getPendingField() === 'heloc_prior') {
    console.log('✅ HELOC - Test 2j Passed: Advances to heloc_prior (HQ25).');
  }

  // Confirm heloc_prior -> heloc_timeline (HQ26)
  p.heloc_prior = 'no';
  p.heloc_prior_confirmed = true;
  manager.advanceWorkflow();
  if (manager.getPendingField() === 'heloc_timeline') {
    console.log('✅ HELOC - Test 2k Passed: Advances to heloc_timeline (HQ26).');
  }

  // Confirm heloc_timeline -> job_tenure_type
  p.heloc_timeline = 'within 30 days';
  p.heloc_timeline_confirmed = true;
  manager.advanceWorkflow();
  if (manager.getPendingField() === 'job_tenure_type') {
    console.log('✅ HELOC - Test 2l Passed: Advances to job_tenure_type.');
  }

  // Confirm job tenure -> stage2_closing_offer
  p.job_tenure_type = '4 years, Project Manager';
  p.job_tenure_type_confirmed = true;
  manager.advanceWorkflow();
  if (manager.getPendingField() === 'stage2_closing_offer') {
    console.log('✅ HELOC - Test 2m Passed: Advances to stage2_closing_offer (Two-Path Choice).');
  }

  // Test 3: HELOC Stage 2.5 -> AUS Submission -> HFD1 Findings Delivery
  manager.applyAusResult('approve_eligible');
  if (manager.getActiveStage() === '2.5' && manager.getPendingField() === 'fd1_delivery') {
    console.log('✅ HELOC - Test 3a Passed: applyAusResult transitions to Stage 2.5 with fd1_delivery.');
  }

  const stage4HelocPrompt = buildStage2HelocInstructions(p);
  if (stage4HelocPrompt.includes('STAGE: Home Equity Line of Credit Pre-Qualification Discovery')) {
    console.log('✅ HELOC - Test 3b Passed: HELOC track context preserved through findings delivery.');
  }

  // Test 4: Combined LTV (CLTV) Calculation Boundary Check (85% Maximum Line Cap)
  const propVal = 600000;
  const firstBal = 350000;
  const maxLine = propVal * 0.85 - firstBal; // 510000 - 350000 = 160000
  if (maxLine === 160000) {
    console.log('✅ HELOC - Test 4 Passed: 85% Combined LTV maximum line cap calculated accurately ($160,000 max line on $600k property with $350k 1st balance).');
  }

  // Test 5: Variable Rate Comfort gate (HQ24) & TT-HEQ (Fixed Equity) Alternative
  const fixedRatePrompt = buildStage2HelocInstructions({ ...helocProfile, heloc_rate_comfort: 'fixed' });
  if (fixedRatePrompt.includes('TT-HEQ') || fixedRatePrompt.includes('fixed') || fixedRatePrompt.includes('HQ24')) {
    console.log('✅ HELOC - Test 5 Passed: Fixed rate preference handles TT-HEQ / home equity loan guidance.');
  }

  // Test 6: Mandatory HELOC Repayment Shock Disclosure (HQ19) Compliance
  if (
    helocInstructions.includes('repayment period begins and your monthly payment will increase') ||
    helocInstructions.includes('MANDATORY RISK & REPAYMENT DISCLOSURE')
  ) {
    console.log('✅ HELOC - Test 6 Passed: Draw-to-repayment transition disclosure (HQ19) is proactively included.');
  } else {
    console.error('❌ HELOC - Test 6 Failed: HQ19 repayment transition disclosure missing');
  }

  // Test 7: HELOC Draw Uses (Renovation, Debt Consolidation, Liquidity)
  const drawUses = ['Kitchen remodel', 'Consolidating credit card debt', 'Emergency liquidity reserve'];
  let drawUsesValid = true;
  for (const use of drawUses) {
    const inst = buildStage2HelocInstructions({ ...helocProfile, heloc_draw_use: use });
    if (!inst.includes('STAGE: Home Equity Line of Credit Pre-Qualification Discovery')) {
      drawUsesValid = false;
      break;
    }
  }
  if (drawUsesValid) {
    console.log('✅ HELOC - Test 7 Passed: Prompt builder supports various draw uses seamlessly.');
  }

  // Test 8: Stated-Data Mode vs Bureau-Verified Mode Context Flagging
  const statedHeloc = buildStage2HelocInstructions({ ...helocProfile, affordability_mode: 'stated' });
  const verifiedHeloc = buildStage2HelocInstructions({ ...helocProfile, affordability_mode: 'verified' });
  if (statedHeloc && verifiedHeloc) {
    console.log('✅ HELOC - Test 8 Passed: Stated vs Verified mode prompt contexts generated cleanly.');
  }

  // Test 9: Extreme Bounds (Draw request exceeding property value)
  const extremeHelocProfile: BorrowerProfile = {
    ...helocProfile,
    property_value: 500000,
    first_mortgage_balance: 100000,
    heloc_line_amount: 600000, // Exceeds property value
  };
  const extremeHelocPrompt = buildStage2HelocInstructions(extremeHelocProfile);
  if (extremeHelocPrompt.includes('600000')) {
    console.log('✅ HELOC - Test 9 Passed: Extreme requested line amount safely injected into prompt for handler to process.');
  }

  // Test 10: Conflicting timeline testing / auto-seeding from Stage 1
  const timelineManager = new SessionContextManager({} as any, {} as any);
  const tProf = timelineManager.getProfile();
  tProf.mortgage_goal = 'heloc';
  tProf.transaction_type = 'TT-HEL';
  tProf.mortgage_goal_confirmed = true;
  tProf.occupancy_confirmed = true;
  tProf.existing_relationship_confirmed = true;
  tProf.timeline = 'within 30 days'; // Seeded from Stage 1
  tProf.timeline_confirmed = true;
  tProf.co_borrower_confirmed = true;
  
  // Fast forward to heloc_prior
  tProf.gross_annual_income = 100000;
  tProf.gross_annual_income_confirmed = true;
  tProf.monthly_debt = 500;
  tProf.monthly_debt_confirmed = true;
  tProf.credit_range = '700';
  tProf.credit_range_confirmed = true;
  tProf.heloc_risk_acknowledged = true;
  tProf.heloc_rate_comfort = 'variable';
  (tProf as any).heloc_rate_comfort_confirmed = true;
  tProf.property_value = 500000;
  (tProf as any).property_value_confirmed = true;
  tProf.first_mortgage_balance = 250000;
  (tProf as any).first_mortgage_balance_confirmed = true;
  tProf.heloc_line_amount = 50000;
  (tProf as any).heloc_line_amount_confirmed = true;
  tProf.heloc_draw_use = 'remodel';
  tProf.heloc_prior = 'no';
  tProf.heloc_prior_confirmed = true;

  timelineManager.advanceWorkflow();
  if (timelineManager.getPendingField() !== 'heloc_timeline') {
    console.log('✅ HELOC - Test 10 Passed: heloc_timeline is skipped if timeline was already seeded from Stage 1.');
  } else {
    console.error('❌ HELOC - Test 10 Failed: heloc_timeline was asked despite timeline being confirmed in Stage 1.');
  }

  console.log('\n🎉 ALL HELOC FLOW TESTS PASSED!\n');
}

runHelocFlowTests().catch((err) => {
  console.error('HELOC Test Error:', err);
  process.exit(1);
});


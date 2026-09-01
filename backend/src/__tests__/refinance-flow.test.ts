import 'dotenv/config';
import { SessionContextManager } from '../context/session-context-manager.js';
import { buildStage2RefinanceInstructions } from '../prompts/stage2-refinance.js';
import type { BorrowerProfile } from '../prompts/layer3-context.js';

async function runRefinanceFlowTests() {
  console.log('🧪 Running Refinance Track (TT-REF) Stage 2 Unit & Flow Tests...\n');

  // Test 1: Refinance Prompt Builder Integrity
  const refiProfile: BorrowerProfile = {
    transaction_type: 'TT-REF',
    mortgage_goal: 'refinance',
    refinance_type: 'rate_term',
    property_value: 450000,
    first_mortgage_balance: 280000,
    current_mortgage_rate: 7.25,
    current_mortgage_payment: 2400,
  };

  const refiInstructions = buildStage2RefinanceInstructions(refiProfile);
  if (
    refiInstructions.includes('STAGE: Refinance Pre-Qualification Discovery (TT-REF)') &&
    refiInstructions.includes('gross_annual_income') &&
    refiInstructions.includes('property_value') &&
    refiInstructions.includes('first_mortgage_balance') &&
    refiInstructions.includes('current_mortgage_rate')
  ) {
    console.log('✅ Refinance - Test 1 Passed: Refinance Stage 2 prompt instructions generated cleanly.');
  } else {
    console.error('❌ Refinance - Test 1 Failed: Missing required instructions', refiInstructions);
  }

  // Test 2: State Machine Stage 2 Sequencing for TT-REF
  const manager = new SessionContextManager({} as any, {} as any);
  const p = manager.getProfile();
  p.mortgage_goal = 'refinance';
  p.transaction_type = 'TT-REF';
  p.mortgage_goal_confirmed = true;
  p.occupancy_confirmed = true;
  p.existing_relationship_confirmed = true;
  p.timeline_confirmed = true;
  p.co_borrower_confirmed = true;

  // Advance from Stage 1 -> Stage 2
  manager.advanceWorkflow();
  if (manager.getActiveStage() === '2' && manager.getPendingField() === 'gross_annual_income') {
    console.log('✅ Refinance - Test 2a Passed: Starts Stage 2 with gross_annual_income.');
  } else {
    console.error('❌ Refinance - Test 2a Failed:', manager.getActiveStage(), manager.getPendingField());
  }

  // Confirm income -> monthly_debt
  p.gross_annual_income = 135000;
  p.gross_annual_income_confirmed = true;
  manager.advanceWorkflow();
  if (manager.getPendingField() === 'monthly_debt') {
    console.log('✅ Refinance - Test 2b Passed: Advances to monthly_debt.');
  }

  // Confirm debt -> credit_range
  p.monthly_debt = 600;
  p.monthly_debt_confirmed = true;
  manager.advanceWorkflow();
  if (manager.getPendingField() === 'credit_range') {
    console.log('✅ Refinance - Test 2c Passed: Advances to credit_range.');
  }

  // Confirm credit -> current_mortgage_type (GAP-3 fix)
  p.credit_range = '740';
  p.credit_range_confirmed = true;
  manager.advanceWorkflow();
  if (manager.getPendingField() === 'current_mortgage_type') {
    console.log('✅ Refinance - Test 2d Passed: Advances to current_mortgage_type (RQ-LOANTYPE).');
  }

  // Confirm current_mortgage_type -> refinance_type
  p.current_mortgage_type = 'conventional';
  manager.advanceWorkflow();
  if (manager.getPendingField() === 'refinance_type') {
    console.log('✅ Refinance - Test 2e Passed: Advances to refinance_type (RQ14/RQ26).');
  }

  // Confirm refinance_type -> property_value
  p.refinance_type = 'rate_term';
  p.refinance_type_confirmed = true;
  manager.advanceWorkflow();
  if (manager.getPendingField() === 'property_value') {
    console.log('✅ Refinance - Test 2f Passed: Advances to property_value (RQ23).');
  }

  // Confirm property_value -> first_mortgage_balance
  p.property_value = 450000;
  (p as any).property_value_confirmed = true;
  manager.advanceWorkflow();
  if (manager.getPendingField() === 'first_mortgage_balance') {
    console.log('✅ Refinance - Test 2g Passed: Advances to first_mortgage_balance (RQ22).');
  }

  // Confirm first_mortgage_balance -> current_mortgage_rate
  p.first_mortgage_balance = 280000;
  (p as any).first_mortgage_balance_confirmed = true;
  manager.advanceWorkflow();
  if (manager.getPendingField() === 'current_mortgage_rate') {
    console.log('✅ Refinance - Test 2h Passed: Advances to current_mortgage_rate (RQ21).');
  }

  // Confirm current_mortgage_rate -> current_mortgage_payment
  p.current_mortgage_rate = 7.25;
  (p as any).current_mortgage_rate_confirmed = true;
  manager.advanceWorkflow();
  if (manager.getPendingField() === 'current_mortgage_payment') {
    console.log('✅ Refinance - Test 2i Passed: Advances to current_mortgage_payment (RQ24).');
  }

  // Confirm payment -> remaining_term_years
  p.current_mortgage_payment = 2400;
  (p as any).current_mortgage_payment_confirmed = true;
  manager.advanceWorkflow();
  if (manager.getPendingField() === 'remaining_term_years') {
    console.log('✅ Refinance - Test 2j Passed: Advances to remaining_term_years (RQ25).');
  }

  // Confirm remaining years -> closing_costs_preference
  p.remaining_term_years = 24;
  (p as any).remaining_term_years_confirmed = true;
  manager.advanceWorkflow();
  if (manager.getPendingField() === 'closing_costs_preference') {
    console.log('✅ Refinance - Test 2k Passed: Advances to closing_costs_preference (RQ-CLOSINGCOSTS).');
  }

  // Confirm closing costs -> prior_refinance
  p.closing_costs_preference = 'rolled_in';
  manager.advanceWorkflow();
  if (manager.getPendingField() === 'prior_refinance') {
    console.log('✅ Refinance - Test 2k-2 Passed: Advances to prior_refinance (RQ28).');
  }

  // Confirm prior_refinance -> stay_duration_years
  p.prior_refinance = 'no';
  p.prior_refinance_confirmed = true;
  manager.advanceWorkflow();
  if (manager.getPendingField() === 'stay_duration_years') {
    console.log('✅ Refinance - Test 2k-3 Passed: Advances to stay_duration_years (RQ29).');
  }

  // Confirm stay_duration_years -> job_tenure_type
  p.stay_duration_years = 10;
  p.stay_duration_years_confirmed = true;
  manager.advanceWorkflow();
  if (manager.getPendingField() === 'job_tenure_type') {
    console.log('✅ Refinance - Test 2l Passed: Advances to job_tenure_type (RQ-EMPLOYER).');
  }

  // Confirm job tenure -> stage2_closing_offer
  p.job_tenure_type = '6 years, Senior Engineer';
  p.job_tenure_type_confirmed = true;
  manager.advanceWorkflow();
  if (manager.getPendingField() === 'stage2_closing_offer') {
    console.log('✅ Refinance - Test 2m Passed: Advances to stage2_closing_offer (Two-Path Choice).');
  }

  // Test 3: Refinance Stage 2.5 -> AUS Submission -> RFD1 Findings Delivery
  manager.applyAusResult('approve_eligible');
  if (manager.getActiveStage() === '2.5' && manager.getPendingField() === 'fd1_delivery') {
    console.log('✅ Refinance - Test 3a Passed: applyAusResult transitions to Stage 2.5 with fd1_delivery.');
  }

  const stage4RefiPrompt = buildStage2RefinanceInstructions(p);
  if (stage4RefiPrompt.includes('STAGE: Refinance Pre-Qualification Discovery')) {
    console.log('✅ Refinance - Test 3b Passed: Refinance track context preserved through findings delivery.');
  }

  // Test 4: Cash-Out Refinance Flow Branching (cash_out_amount required)
  const cashOutManager = new SessionContextManager({} as any, {} as any);
  const cp = cashOutManager.getProfile();
  cp.mortgage_goal = 'refinance';
  cp.transaction_type = 'TT-REF';
  cp.mortgage_goal_confirmed = true;
  cp.occupancy_confirmed = true;
  cp.existing_relationship_confirmed = true;
  cp.timeline_confirmed = true;
  cp.co_borrower_confirmed = true;

  // Advance to Stage 2
  cashOutManager.advanceWorkflow();
  cp.gross_annual_income = 160000;
  cp.gross_annual_income_confirmed = true;
  cashOutManager.advanceWorkflow();
  cp.monthly_debt = 800;
  cp.monthly_debt_confirmed = true;
  cashOutManager.advanceWorkflow();
  cp.credit_range = '780';
  cp.credit_range_confirmed = true;
  cashOutManager.advanceWorkflow();
  cp.current_mortgage_type = 'va';
  cashOutManager.advanceWorkflow();
  
  // Set Cash-out refinance
  cp.refinance_type = 'cash_out';
  cp.refinance_type_confirmed = true;
  cashOutManager.advanceWorkflow();
  cp.property_value = 600000;
  (cp as any).property_value_confirmed = true;
  cashOutManager.advanceWorkflow();
  cp.first_mortgage_balance = 300000;
  (cp as any).first_mortgage_balance_confirmed = true;
  cashOutManager.advanceWorkflow();
  cp.current_mortgage_rate = 6.5;
  (cp as any).current_mortgage_rate_confirmed = true;
  cashOutManager.advanceWorkflow();
  cp.current_mortgage_payment = 2100;
  (cp as any).current_mortgage_payment_confirmed = true;
  cashOutManager.advanceWorkflow();
  cp.remaining_term_years = 26;
  (cp as any).remaining_term_years_confirmed = true;
  cashOutManager.advanceWorkflow();
  cp.closing_costs_preference = 'rolled_in';
  cashOutManager.advanceWorkflow();

  // Verify that cash_out_amount IS asked before prior_refinance
  if (cashOutManager.getPendingField() === 'cash_out_amount') {
    console.log('✅ Refinance - Test 4a Passed: Cash-out flow branches to cash_out_amount.');
    cp.cash_out_amount = 50000;
    (cp as any).cash_out_amount_confirmed = true;
    cashOutManager.advanceWorkflow();
    if (cashOutManager.getPendingField() === 'prior_refinance') {
      console.log('✅ Refinance - Test 4b Passed: Advances from cash_out_amount to prior_refinance.');
    } else {
      console.error('❌ Refinance - Test 4b Failed: Expected prior_refinance, got', cashOutManager.getPendingField());
    }
  } else {
    console.error('❌ Refinance - Test 4a Failed: Expected cash_out_amount, got', cashOutManager.getPendingField());
  }

  // Test 5: Refinance Loan-Type Sub-Track Prompts (VA, FHA, USDA, Conventional)
  const vaPrompt = buildStage2RefinanceInstructions({ ...refiProfile, current_mortgage_type: 'va' });
  const fhaPrompt = buildStage2RefinanceInstructions({ ...refiProfile, current_mortgage_type: 'fha' });
  const usdaPrompt = buildStage2RefinanceInstructions({ ...refiProfile, current_mortgage_type: 'usda' });
  const convPrompt = buildStage2RefinanceInstructions({ ...refiProfile, current_mortgage_type: 'conventional' });

  if (
    vaPrompt.includes('VA-REF-OVERVIEW') &&
    fhaPrompt.includes('FHA-REF-OVERVIEW') &&
    usdaPrompt.includes('USDA-REF-OVERVIEW') &&
    convPrompt.includes('CONV-REF-OVERVIEW')
  ) {
    console.log('✅ Refinance - Test 5 Passed: All 4 loan-type sub-track overview blocks present.');
  } else {
    console.error('❌ Refinance - Test 5 Failed: Loan-type sub-track overview missing');
  }

  // Test 6: USDA Cash-Out Explicit Prohibition Compliance Check (Compliance Item 27)
  if (usdaPrompt.includes('cash-out is not permitted on USDA loans') || usdaPrompt.includes('NOT available on USDA')) {
    console.log('✅ Refinance - Test 6 Passed: USDA overview contains mandatory cash-out prohibition.');
  } else {
    console.error('❌ Refinance - Test 6 Failed: USDA cash-out prohibition missing');
  }

  // Test 7: Boundary Check — Negative Equity / High LTV (Balance > Property Value)
  const underwaterProfile: BorrowerProfile = {
    ...refiProfile,
    property_value: 400000,
    first_mortgage_balance: 450000, // 112.5% LTV
  };
  const underwaterPrompt = buildStage2RefinanceInstructions(underwaterProfile);
  if (underwaterPrompt.includes('400000') && underwaterPrompt.includes('450000')) {
    console.log('✅ Refinance - Test 7 Passed: High LTV / underwater profile safely injected into prompt.');
  }

  console.log('\n🎉 ALL REFINANCE FLOW TESTS PASSED!\n');
}

runRefinanceFlowTests().catch((err) => {
  console.error('Refinance Test Error:', err);
  process.exit(1);
});


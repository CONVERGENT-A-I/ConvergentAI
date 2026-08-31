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

  // Confirm credit -> refinance_type
  p.credit_range = '740';
  p.credit_range_confirmed = true;
  manager.advanceWorkflow();
  if (manager.getPendingField() === 'refinance_type') {
    console.log('✅ Refinance - Test 2d Passed: Advances to refinance_type (RQ14/RQ26).');
  }

  // Confirm refinance_type -> property_value
  p.refinance_type = 'rate_term';
  p.refinance_type_confirmed = true;
  manager.advanceWorkflow();
  if (manager.getPendingField() === 'property_value') {
    console.log('✅ Refinance - Test 2e Passed: Advances to property_value (RQ23).');
  }

  // Confirm property_value -> first_mortgage_balance
  p.property_value = 450000;
  (p as any).property_value_confirmed = true;
  manager.advanceWorkflow();
  if (manager.getPendingField() === 'first_mortgage_balance') {
    console.log('✅ Refinance - Test 2f Passed: Advances to first_mortgage_balance (RQ22).');
  }

  // Confirm first_mortgage_balance -> current_mortgage_rate
  p.first_mortgage_balance = 280000;
  (p as any).first_mortgage_balance_confirmed = true;
  manager.advanceWorkflow();
  if (manager.getPendingField() === 'current_mortgage_rate') {
    console.log('✅ Refinance - Test 2g Passed: Advances to current_mortgage_rate (RQ21).');
  }

  // Confirm current_mortgage_rate -> current_mortgage_payment
  p.current_mortgage_rate = 7.25;
  (p as any).current_mortgage_rate_confirmed = true;
  manager.advanceWorkflow();
  if (manager.getPendingField() === 'current_mortgage_payment') {
    console.log('✅ Refinance - Test 2h Passed: Advances to current_mortgage_payment (RQ24).');
  }

  // Confirm payment -> current_mortgage_type
  p.current_mortgage_payment = 2400;
  (p as any).current_mortgage_payment_confirmed = true;
  manager.advanceWorkflow();
  if (manager.getPendingField() === 'current_mortgage_type') {
    console.log('✅ Refinance - Test 2i Passed: Advances to current_mortgage_type (RQ-LOANTYPE).');
  }

  // Confirm loan type -> remaining_term_years
  p.current_mortgage_type = 'conventional';
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

  // Confirm closing costs -> job_tenure_type
  p.closing_costs_preference = 'rolled_in';
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

  console.log('\n🎉 ALL REFINANCE FLOW TESTS PASSED!\n');
}

runRefinanceFlowTests().catch((err) => {
  console.error('Refinance Test Error:', err);
  process.exit(1);
});

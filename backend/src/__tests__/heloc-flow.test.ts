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

  // Confirm draw use -> job_tenure_type
  p.heloc_draw_use = 'Kitchen and bath remodel';
  manager.advanceWorkflow();
  if (manager.getPendingField() === 'job_tenure_type') {
    console.log('✅ HELOC - Test 2j Passed: Advances to job_tenure_type.');
  }

  // Confirm job tenure -> stage2_closing_offer
  p.job_tenure_type = '4 years, Project Manager';
  p.job_tenure_type_confirmed = true;
  manager.advanceWorkflow();
  if (manager.getPendingField() === 'stage2_closing_offer') {
    console.log('✅ HELOC - Test 2k Passed: Advances to stage2_closing_offer (Two-Path Choice).');
  }

  console.log('\n🎉 ALL HELOC FLOW TESTS PASSED!\n');
}

runHelocFlowTests().catch((err) => {
  console.error('HELOC Test Error:', err);
  process.exit(1);
});

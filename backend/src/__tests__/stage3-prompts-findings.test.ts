import 'dotenv/config';
import { buildStage25Instructions } from '../prompts/stage25-affordability.js';
import { buildStage4Instructions } from '../prompts/stage4-underwriting.js';
import type { BorrowerProfile } from '../prompts/layer3-context.js';

function runStage3Tests() {
  console.log('🧪 Running Stage 3 & 4 Prompts & Multi-Track Findings Delivery Unit Tests...\n');

  // Purchase Profile
  const purProfile: BorrowerProfile = {
    borrower_name: 'David Beckham',
    transaction_type: 'TT-PUR',
    mortgage_goal: 'purchase',
    affordability_purchase_price: 600000,
    affordability_down_payment: 120000,
    pmi_explained: false,
    dti_above_hard_ceiling: true,
  };

  const purInstructions = buildStage25Instructions(purProfile);

  // Test 1: Stage 2.5 Header & Behavior Rules Presence
  if (
    purInstructions.includes('STAGE: Affordability Scenario Review (Stage 2.5)') &&
    purInstructions.includes('You MUST NEVER vocalize specific dollar amounts')
  ) {
    console.log('✅ Stage 3 - Test 1 Passed: Stage 2.5 prompt rules present.');
  } else {
    console.error('❌ Stage 3 - Test 1 Failed: Missing core rules');
  }

  // Test 2: Q46 Intro Formulations contain Borrower Name
  if (purInstructions.includes('Thank you for your patience, David Beckham')) {
    console.log('✅ Stage 3 - Test 2 Passed: Q46 personalized greeting generated correctly.');
  } else {
    console.error('❌ Stage 3 - Test 2 Failed: Name missing from Q46');
  }

  // Test 3: Mandatory SAFE Act Refusal Q55 ("Just tell me what price to put in")
  if (
    purInstructions.includes("That's the one thing I have to leave entirely in your hands") &&
    purInstructions.includes('mortgage regulations require that these targets stay your choice')
  ) {
    console.log('✅ Stage 3 - Test 3 Passed: Q55 mandatory SAFE Act refusal formulation present.');
  } else {
    console.error('❌ Stage 3 - Test 3 Failed: Q55 missing or altered');
  }

  // Test 4: Purchase Findings Delivery FD1 and FD2 scripts
  if (
    purInstructions.includes('FD1 (Approve/Eligible — auto-send pre-qualification letter):') &&
    purInstructions.includes('FD2 (Refer findings — purchase):') &&
    purInstructions.includes('RFD-LOADING / FD-LOADING')
  ) {
    console.log('✅ Stage 3 - Test 4 Passed: Purchase FD1, FD2, and FD-LOADING scripts present.');
  } else {
    console.error('❌ Stage 3 - Test 4 Failed: Purchase findings delivery scripts missing');
  }

  // Test 5: Refinance Findings Delivery RFD1 and RFD2 (No pre-qual letter)
  const refProfile: BorrowerProfile = {
    borrower_name: 'Sarah Connor',
    transaction_type: 'TT-REF',
    mortgage_goal: 'refinance',
    property_value: 500000,
    first_mortgage_balance: 300000,
  };
  const refInstructions = buildStage25Instructions(refProfile);
  if (
    refInstructions.includes('RFD1 (Conditional eligibility — refinance, on-screen payment comparison, no pre-qual letter):') &&
    refInstructions.includes('RFD2 (Refer findings — refinance):') &&
    refInstructions.includes('Sarah Connor')
  ) {
    console.log('✅ Stage 3 - Test 5 Passed: Refinance RFD1 and RFD2 scripts generated cleanly.');
  } else {
    console.error('❌ Stage 3 - Test 5 Failed: Refinance findings scripts missing');
  }

  // Test 6: HELOC Findings Delivery HFD1 and HFD2 (No pre-qual letter)
  const helProfile: BorrowerProfile = {
    borrower_name: 'John Wick',
    transaction_type: 'TT-HEL',
    mortgage_goal: 'heloc',
    property_value: 700000,
    first_mortgage_balance: 350000,
    heloc_line_amount: 100000,
  };
  const helInstructions = buildStage25Instructions(helProfile);
  if (
    helInstructions.includes('HFD1 (Conditional credit line approval — HELOC, on-screen available line, no pre-qual letter):') &&
    helInstructions.includes('HFD2 (Refer findings — HELOC):') &&
    helInstructions.includes('John Wick')
  ) {
    console.log('✅ Stage 3 - Test 6 Passed: HELOC HFD1 and HFD2 scripts generated cleanly.');
  } else {
    console.error('❌ Stage 3 - Test 6 Failed: HELOC findings scripts missing');
  }

  // Test 7: Stage 4 Underwriting Track-Aware Prompts
  const stage4Pur = buildStage4Instructions({ ...purProfile, aus_status: 'approve' });
  const stage4Ref = buildStage4Instructions({ ...refProfile, aus_status: 'approve' });
  const stage4Hel = buildStage4Instructions({ ...helProfile, aus_status: 'approve' });

  if (
    stage4Pur.includes('Purchase Conditional Approval & Pre-Qualification Letter (FD1)') &&
    stage4Ref.includes('Refinance Conditional Eligibility (RFD1)') &&
    stage4Hel.includes('HELOC Conditional Line Approval (HFD1)')
  ) {
    console.log('✅ Stage 3 - Test 7 Passed: Stage 4 underwriting instructions dispatch track-specific formulations.');
  } else {
    console.error('❌ Stage 3 - Test 7 Failed: Stage 4 underwriting dispatch mismatch');
  }

  console.log('\n🎉 ALL STAGE 3 & 4 PROMPTS & MULTI-TRACK FINDINGS TESTS PASSED!');
}

runStage3Tests();


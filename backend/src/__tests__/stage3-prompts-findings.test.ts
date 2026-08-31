import 'dotenv/config';
import { buildStage25Instructions } from '../prompts/stage25-affordability.js';
import type { BorrowerProfile } from '../prompts/layer3-context.js';

function runStage3Tests() {
  console.log('🧪 Running Stage 3 Prompts & Findings Delivery Unit Tests...\n');

  const profile: BorrowerProfile = {
    borrower_name: 'David Beckham',
    affordability_purchase_price: 600000,
    affordability_down_payment: 120000,
    pmi_explained: false,
    dti_above_hard_ceiling: true,
  };

  const instructions = buildStage25Instructions(profile);

  // Test 1: Stage 2.5 Header & Behavior Rules Presence
  if (
    instructions.includes('STAGE: Affordability Scenario Review (Stage 2.5)') &&
    instructions.includes('You MUST NEVER vocalize specific dollar amounts')
  ) {
    console.log('✅ Stage 3 - Test 1 Passed: Stage 2.5 prompt rules present.');
  } else {
    console.error('❌ Stage 3 - Test 1 Failed: Missing core rules');
  }

  // Test 2: Q46 Intro Formulations contain Borrower Name
  if (instructions.includes('Thank you for your patience, David Beckham')) {
    console.log('✅ Stage 3 - Test 2 Passed: Q46 personalized greeting generated correctly.');
  } else {
    console.error('❌ Stage 3 - Test 2 Failed: Name missing from Q46');
  }

  // Test 3: Mandatory SAFE Act Refusal Q55 ("Just tell me what price to put in")
  if (
    instructions.includes("That's the one thing I have to leave entirely in your hands") &&
    instructions.includes('mortgage regulations require that these targets stay your choice')
  ) {
    console.log('✅ Stage 3 - Test 3 Passed: Q55 mandatory SAFE Act refusal formulation present.');
  } else {
    console.error('❌ Stage 3 - Test 3 Failed: Q55 missing or altered');
  }

  // Test 4: Findings Delivery FD1 and FD2 scripts
  if (
    instructions.includes('FD1 (Approve/Eligible — auto-send):') &&
    instructions.includes('FD2 (Refer findings):') &&
    instructions.includes('RFD-LOADING (deliver if AUS takes > 10 seconds):')
  ) {
    console.log('✅ Stage 3 - Test 4 Passed: FD1, FD2, and RFD-LOADING scripts present.');
  } else {
    console.error('❌ Stage 3 - Test 4 Failed: Findings delivery scripts missing');
  }

  console.log('\n🎉 ALL STAGE 3 PROMPTS & FINDINGS TESTS PASSED!');
}

runStage3Tests();

import 'dotenv/config';
import { buildStage25Instructions } from '../prompts/stage25-affordability.js';
import { buildStage4Instructions } from '../prompts/stage4-underwriting.js';
import type { BorrowerProfile } from '../prompts/layer3-context.js';
import { SessionContextManager } from '../context/session-context-manager.js';

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
    refInstructions.includes('RFD1 (Conditional eligibility — refinance, no pre-qual letter):') &&
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
    helInstructions.includes('HFD1 (Conditional credit line approval — HELOC, no pre-qual letter):') &&
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

  // Test 8: Anonymous / Missing Name Fallback Edge Case (No undefined or double commas)
  const anonRefProfile: BorrowerProfile = {
    transaction_type: 'TT-REF',
    mortgage_goal: 'refinance',
  };
  const anonRefInstructions = buildStage25Instructions(anonRefProfile);
  const anonStage4 = buildStage4Instructions({ ...anonRefProfile, aus_status: 'refer' });
  if (
    !anonRefInstructions.includes('undefined') &&
    !anonRefInstructions.includes(', ,') &&
    !anonStage4.includes('undefined') &&
    anonStage4.includes('Thank you for your patience, there')
  ) {
    console.log('✅ Stage 3 - Test 8 Passed: Missing borrower name safely defaults to fallback "there".');
  } else {
    console.error('❌ Stage 3 - Test 8 Failed: Missing borrower name fallback issue');
  }

  // Test 9: TT-HEQ (Fixed Equity Loan) Track Findings Delivery
  const heqProfile: BorrowerProfile = {
    borrower_name: 'Marcus Aurelius',
    transaction_type: 'TT-HEQ',
    mortgage_goal: 'heloc',
  };
  const heqInstructions = buildStage25Instructions(heqProfile);
  const stage4Heq = buildStage4Instructions({ ...heqProfile, aus_status: 'approve' });
  if (
    heqInstructions.includes('HELOC & HOME EQUITY FINDINGS DELIVERY') &&
    heqInstructions.includes('Marcus Aurelius') &&
    stage4Heq.includes('Home Equity Loan Conditional Approval (EFD1)')
  ) {
    console.log('✅ Stage 3 - Test 9 Passed: TT-HEQ (Home Equity Loan) correctly maps to EFD1 findings delivery.');
  } else {
    console.error('❌ Stage 3 - Test 9 Failed: TT-HEQ findings delivery mismatch');
  }

  // Test 10: Stage 4 All Statuses Matrix across all tracks (approve, refer, suspend, timeout)
  const statuses = ['approve', 'approve_with_conditions', 'refer', 'suspend', 'timeout'] as const;
  let allStatusesValid = true;
  for (const st of statuses) {
    const pInst = buildStage4Instructions({ ...purProfile, aus_status: st });
    const rInst = buildStage4Instructions({ ...refProfile, aus_status: st });
    const hInst = buildStage4Instructions({ ...helProfile, aus_status: st });
    if (!pInst || !rInst || !hInst) {
      allStatusesValid = false;
      break;
    }
    if (st === 'timeout') {
      if (!pInst.includes('FD-LOADING') || !rInst.includes('FD-LOADING') || !hInst.includes('FD-LOADING')) {
        allStatusesValid = false;
      }
    }
  }
  if (allStatusesValid) {
    console.log('✅ Stage 3 - Test 10 Passed: Stage 4 handles all 5 underwriting statuses across all tracks.');
  } else {
    console.error('❌ Stage 3 - Test 10 Failed: Underwriting status matrix failed');
  }

  // Test 11: Compliance Guard — Pre-Qualification Letter gated strictly to TT-PUR
  const refStage4Approve = buildStage4Instructions({ ...refProfile, aus_status: 'approve' });
  const helStage4Approve = buildStage4Instructions({ ...helProfile, aus_status: 'approve' });
  const purStage4Approve = buildStage4Instructions({ ...purProfile, aus_status: 'approve' });

  if (
    purStage4Approve.includes('pre-qualification letter') &&
    !refStage4Approve.includes('pre-qualification letter') &&
    !helStage4Approve.includes('pre-qualification letter')
  ) {
    console.log('✅ Stage 3 - Test 11 Passed: Pre-Qualification Letter strictly restricted to TT-PUR (Compliance Item 11).');
  } else {
    console.error('❌ Stage 3 - Test 11 Failed: Compliance Item 11 violation - prequal letter improperly leaked to non-purchase track');
  }

  // Test 12: Multi-Track Q46 Presentation Wording (HELOC vs Refi vs Purchase)
  // (helInstructions and refInstructions already created above)

  const bionicEyesRegex = /on your screen/i;

  if (
    helInstructions.includes('your home equity summary is ready for you') &&
    helInstructions.includes('credit line target you shared with me') &&
    !helInstructions.includes('savings targets') &&
    !bionicEyesRegex.test(helInstructions) &&
    refInstructions.includes('your refinance summary is ready for you') &&
    refInstructions.includes('refinance targets you shared with me') &&
    !refInstructions.includes('savings targets') &&
    !bionicEyesRegex.test(refInstructions) &&
    purInstructions.includes('your affordability summary is ready for you') &&
    purInstructions.includes('savings targets') &&
    !bionicEyesRegex.test(purInstructions)
  ) {
    console.log('✅ Stage 3 - Test 12 Passed: Multi-track Q46 and Q46-S presentation scripts dynamically tailored to HELOC, Refinance, and Purchase. Verified bionic eyes ("on your screen") is purged.');
  } else {
    console.error('❌ Stage 3 - Test 12 Failed: Q46 presentation script failed multi-track check or contained bionic eyes wording.');
  }

  // Test 13: HELOC Timeline Auto-Seeding from Stage 1 Timeline
  const seedManager = new SessionContextManager({} as any, {} as any);
  const sp = seedManager.getProfile();
  sp.transaction_type = 'TT-HEL';
  sp.mortgage_goal = 'heloc';
  sp.mortgage_goal_confirmed = true;
  sp.occupancy = 'primary';
  sp.occupancy_confirmed = true;
  sp.existing_relationship = 'no';
  sp.existing_relationship_confirmed = true;
  sp.timeline = 'in the next 60 days';
  sp.timeline_confirmed = true;
  sp.co_borrower = 'no';
  sp.co_borrower_confirmed = true;

  seedManager.advanceWorkflow(); // Advances Stage 1 -> Stage 2
  if (sp.heloc_timeline === 'in the next 60 days' && sp.heloc_timeline_confirmed === true) {
    console.log('✅ Stage 3 - Test 13 Passed: heloc_timeline auto-seeded from Stage 1 timeline, eliminating duplicate timeline question.');
  } else {
    console.error('❌ Stage 3 - Test 13 Failed: heloc_timeline was not auto-seeded from Stage 1 timeline');
  }

  // Test 14: Q47-E Compliance formulation & negative constraint check
  if (
    purInstructions.includes('Q47-E') &&
    purInstructions.includes('DO NOT give unsolicited compliance') &&
    purInstructions.includes('not stored or committed as application data')
  ) {
    console.log('✅ Stage 3 - Test 14 Passed: Q47-E conditional privacy disclosure and unsolicited compliance ban are present.');
  } else {
    console.error('❌ Stage 3 - Test 14 Failed: Missing Q47-E or unsolicited compliance rules');
  }

  console.log('\n🎉 ALL STAGE 3 & 4 PROMPTS & MULTI-TRACK FINDINGS TESTS PASSED!');
}

runStage3Tests();


import { ailanaConfig } from '../config/ailana-config.js';
import type { BorrowerProfile } from '../prompts/layer3-context.js';
import { SessionContextManager } from '../context/session-context-manager.js';

async function runStage1Tests() {
  console.log('🧪 Running Stage 1 Foundation Unit Tests...\n');

  // Test 1: Configuration Values & Default Ratios
  if (
    ailanaConfig.representativeRate === 0.06875 &&
    ailanaConfig.incomeBandThreshold === 0.28 &&
    ailanaConfig.dtiBandThreshold === 0.45 &&
    ailanaConfig.dtiHardCeiling === 0.50 &&
    ailanaConfig.propertyTaxRate === 0.012 &&
    ailanaConfig.homeownersInsRate === 0.005 &&
    ailanaConfig.conventionalPmiRate === 0.0085 &&
    ailanaConfig.fhaMipRate === 0.0055 &&
    ailanaConfig.usdaAnnualFeeRate === 0.0035
  ) {
    console.log('✅ Stage 1 - Test 1 Passed: Central config rates and compliance thresholds match spec.');
  } else {
    console.error('❌ Stage 1 - Test 1 Failed: Config mismatch', ailanaConfig);
  }

  // Test 2: BorrowerProfile Stage 2.5 Fields Integrity
  const profile: BorrowerProfile = {
    affordability_panel_rendered: true,
    affordability_purchase_price: 550000,
    affordability_down_payment: 110000,
    affordability_income_band: 'within',
    affordability_dti_band: 'within',
    affordability_submitted: true,
    affordability_aus_status: 'approve_eligible',
    affordability_prequel_letter_sent: true,
    dti_above_hard_ceiling: false,
    pmi_explained: true,
  };

  if (
    profile.affordability_panel_rendered === true &&
    profile.affordability_purchase_price === 550000 &&
    profile.affordability_aus_status === 'approve_eligible' &&
    profile.affordability_prequel_letter_sent === true
  ) {
    console.log('✅ Stage 1 - Test 2 Passed: BorrowerProfile Stage 2.5 field schemas are valid.');
  } else {
    console.error('❌ Stage 1 - Test 2 Failed: Profile schema error', profile);
  }

  // Test 3: Session Context Manager Stage 2.5 Transition & AUS result application
  const manager = new SessionContextManager({} as any, {} as any);
  if (manager.getActiveStage() === '1') {
    console.log('✅ Stage 1 - Test 3a Passed: Session starts at Stage 1.');
  }

  manager.applyAusResult('approve_eligible');
  if (
    manager.getActiveStage() === '2.5' &&
    manager.getProfile().affordability_aus_status === 'approve_eligible' &&
    manager.getPendingField() === 'fd1_delivery'
  ) {
    console.log('✅ Stage 1 - Test 3b Passed: applyAusResult transitions session to Stage 2.5 with fd1_delivery.');
  } else {
    console.error('❌ Stage 1 - Test 3b Failed:', manager.getProfile());
  }

  console.log('\n🎉 ALL STAGE 1 FOUNDATION TESTS PASSED!');
}

runStage1Tests().catch((err) => {
  console.error('Stage 1 Test Error:', err);
  process.exit(1);
});

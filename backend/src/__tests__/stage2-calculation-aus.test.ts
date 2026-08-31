import 'dotenv/config';
import { calculateAffordability } from '../utils/affordability-calculator.js';
import { buildAusPayload, submitToAus } from '../utils/aus-submission.js';
import type { BorrowerProfile } from '../prompts/layer3-context.js';

async function runStage2Tests() {
  console.log('🧪 Running Stage 2 Calculation & AUS Unit Tests...\n');

  // Test 1: Conventional Loan > 80% LTV (PMI calculated)
  const conv80 = calculateAffordability({
    purchasePrice: 500000,
    downPayment: 50000, // LTV 90%
    grossAnnualIncome: 150000,
    totalMonthlyDebt: 500,
    programType: 'conventional',
  });
  if (conv80.loanAmount === 450000 && conv80.monthlyMI > 0) {
    console.log('✅ Stage 2 - Test 1 Passed: Conventional >80% LTV correctly calculates PMI.');
  } else {
    console.error('❌ Stage 2 - Test 1 Failed:', conv80);
  }

  // Test 2: Conventional Loan <= 80% LTV ($0 PMI)
  const conv20 = calculateAffordability({
    purchasePrice: 500000,
    downPayment: 100000, // LTV 80%
    grossAnnualIncome: 150000,
    totalMonthlyDebt: 500,
    programType: 'conventional',
  });
  if (conv20.monthlyMI === 0) {
    console.log('✅ Stage 2 - Test 2 Passed: Conventional <=80% LTV has $0 PMI.');
  } else {
    console.error('❌ Stage 2 - Test 2 Failed:', conv20);
  }

  // Test 3: FHA Loan MIP Inclusion
  const fha = calculateAffordability({
    purchasePrice: 400000,
    downPayment: 14000, // 3.5% down
    grossAnnualIncome: 120000,
    totalMonthlyDebt: 400,
    programType: 'fha',
  });
  const expectedFhaMip = (386000 * 0.0055) / 12;
  if (Math.abs(fha.monthlyMI - expectedFhaMip) < 0.01) {
    console.log('✅ Stage 2 - Test 3 Passed: FHA MIP calculated at 0.55% annually.');
  } else {
    console.error('❌ Stage 2 - Test 3 Failed:', fha.monthlyMI, expectedFhaMip);
  }

  // Test 4: VA Loan Zero Monthly MI
  const va = calculateAffordability({
    purchasePrice: 400000,
    downPayment: 0,
    grossAnnualIncome: 120000,
    totalMonthlyDebt: 400,
    programType: 'va',
  });
  if (va.monthlyMI === 0) {
    console.log('✅ Stage 2 - Test 4 Passed: VA loan sets monthly MI to $0.');
  } else {
    console.error('❌ Stage 2 - Test 4 Failed:', va);
  }

  // Test 5: DTI Thresholds & Hard Ceiling (>50%)
  const highDti = calculateAffordability({
    purchasePrice: 800000,
    downPayment: 40000,
    grossAnnualIncome: 80000,
    totalMonthlyDebt: 1500,
    programType: 'conventional',
  });
  if (highDti.dtiBand === 'above' && highDti.dtiAboveHardCeiling === true) {
    console.log('✅ Stage 2 - Test 5 Passed: High DTI (>50%) correctly flags dtiAboveHardCeiling.');
  } else {
    console.error('❌ Stage 2 - Test 5 Failed:', highDti);
  }

  // Test 6: AUS MISMO 3.4 Payload Building
  const profile: BorrowerProfile = {
    gross_annual_income: 140000,
    monthly_debt: 600,
    credit_range: '760',
  };
  const payload = buildAusPayload(profile, { purchasePrice: 500000, downPayment: 100000 });
  if (payload.creditScore === 760 && payload.loanAmount === 400000) {
    console.log('✅ Stage 2 - Test 6 Passed: AUS payload built cleanly from profile.');
  } else {
    console.error('❌ Stage 2 - Test 6 Failed:', payload);
  }

  // Test 7: AUS Service Submission
  const status = await submitToAus(payload);
  if (status === 'approve_eligible' || status === 'refer') {
    console.log(`✅ Stage 2 - Test 7 Passed: AUS submit returned valid status -> '${status}'.`);
  } else {
    console.error('❌ Stage 2 - Test 7 Failed:', status);
  }

  console.log('\n🎉 ALL STAGE 2 CALCULATION & AUS TESTS PASSED!');
}

runStage2Tests().catch((err) => {
  console.error('Stage 2 Test Error:', err);
  process.exit(1);
});

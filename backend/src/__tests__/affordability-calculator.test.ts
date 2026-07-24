import assert from 'node:assert';
import { calculateAffordability, type AffordabilityInput } from '../utils/affordability-calculator.js';

console.log('🧪 Running Affordability Calculator Unit Tests...');

// Test 1: Conventional Loan > 80% LTV -> PMI included, within income band
{
  const input: AffordabilityInput = {
    purchasePrice: 500000,
    downPayment: 50000, // 10% down -> 90% LTV
    grossAnnualIncome: 180000, // $15,000/mo -> PITIA ~$3,983/mo is 26.5% (<= 28% threshold)
    totalMonthlyDebt: 500,
    programType: 'conventional',
  };

  const result = calculateAffordability(input);

  assert.strictEqual(result.loanAmount, 450000);
  assert.strictEqual(result.ltv, 0.90);
  assert.ok(result.monthlyPI > 2900 && result.monthlyPI < 3000, `Unexpected P&I: ${result.monthlyPI}`);
  assert.ok(result.monthlyMI > 0, 'Conventional LTV > 80% must have monthly PMI');
  assert.strictEqual(result.incomeBand, 'within');
  assert.strictEqual(result.dtiBand, 'within');
  assert.strictEqual(result.dtiAboveHardCeiling, false);
  console.log('✅ Test 1 Passed: Conventional > 80% LTV calculated correctly.');
}

// Test 2: Conventional Loan <= 80% LTV -> $0 PMI
{
  const input: AffordabilityInput = {
    purchasePrice: 500000,
    downPayment: 100000, // 20% down -> 80% LTV
    grossAnnualIncome: 180000,
    totalMonthlyDebt: 500,
    programType: 'conventional',
  };

  const result = calculateAffordability(input);

  assert.strictEqual(result.loanAmount, 400000);
  assert.strictEqual(result.ltv, 0.80);
  assert.strictEqual(result.monthlyMI, 0, 'Conventional LTV <= 80% must have $0 PMI');
  console.log('✅ Test 2 Passed: Conventional <= 80% LTV has $0 PMI.');
}

// Test 3: FHA Loan -> MIP applied regardless of LTV
{
  const input: AffordabilityInput = {
    purchasePrice: 400000,
    downPayment: 100000, // 25% down
    grossAnnualIncome: 120000,
    totalMonthlyDebt: 400,
    programType: 'fha',
  };

  const result = calculateAffordability(input);

  assert.ok(result.monthlyMI > 0, 'FHA loan must have monthly MIP even with > 20% down');
  console.log('✅ Test 3 Passed: FHA MIP calculated correctly.');
}

// Test 4: VA Loan -> $0 Monthly MI
{
  const input: AffordabilityInput = {
    purchasePrice: 450000,
    downPayment: 0, // 0% down -> 100% LTV
    grossAnnualIncome: 130000,
    totalMonthlyDebt: 600,
    programType: 'va',
  };

  const result = calculateAffordability(input);

  assert.strictEqual(result.monthlyMI, 0, 'VA loan must have $0 monthly MI');
  console.log('✅ Test 4 Passed: VA monthly MI is $0.');
}

// Test 5: High DTI scenario -> dtiBand = 'above', hard ceiling flag check
{
  const input: AffordabilityInput = {
    purchasePrice: 700000,
    downPayment: 35000, // 5% down
    grossAnnualIncome: 80000, // $6,666/mo income vs ~$5,000+ payment + debt
    totalMonthlyDebt: 1500,
    programType: 'conventional',
  };

  const result = calculateAffordability(input);

  assert.strictEqual(result.incomeBand, 'above');
  assert.strictEqual(result.dtiBand, 'above');
  assert.strictEqual(result.dtiAboveHardCeiling, true, 'DTI > 50% must set dtiAboveHardCeiling = true');
  console.log('✅ Test 5 Passed: High DTI above hard ceiling flagged correctly.');
}

console.log('🎉 ALL AFFORABILITY CALCULATOR UNIT TESTS PASSED!');

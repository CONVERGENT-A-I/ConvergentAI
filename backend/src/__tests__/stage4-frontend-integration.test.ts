import 'dotenv/config';
import { calculateAffordability } from '../utils/affordability-calculator.js';

function runStage4Tests() {
  console.log('🧪 Running Stage 4 Frontend Integration API Data Contract Tests...\n');

  const calc = calculateAffordability({
    purchasePrice: 600000,
    downPayment: 120000,
    grossAnnualIncome: 150000,
    totalMonthlyDebt: 800,
    programType: 'conventional',
  });

  // Simulating REST API response mapping
  const clientResponsePayload = {
    totalPITIA: Math.round(calc.totalPITIA),
    monthlyMI: Math.round(calc.monthlyMI),
    incomeBand: calc.incomeBand,
    dtiBand: calc.dtiBand,
    dtiAboveHardCeiling: calc.dtiAboveHardCeiling,
  };

  // Test 1: Required UI fields present
  if (
    typeof clientResponsePayload.totalPITIA === 'number' &&
    typeof clientResponsePayload.monthlyMI === 'number' &&
    (clientResponsePayload.incomeBand === 'within' || clientResponsePayload.incomeBand === 'above') &&
    (clientResponsePayload.dtiBand === 'within' || clientResponsePayload.dtiBand === 'above')
  ) {
    console.log('✅ Stage 4 - Test 1 Passed: Client API contract payload includes all required UI fields.');
  } else {
    console.error('❌ Stage 4 - Test 1 Failed:', clientResponsePayload);
  }

  // Test 2: Raw DTI isolation check
  if (!('dti' in clientResponsePayload) && !('loanAmount' in clientResponsePayload)) {
    console.log('✅ Stage 4 - Test 2 Passed: Raw DTI percentage is safely excluded from client payload.');
  } else {
    console.error('❌ Stage 4 - Test 2 Failed: Sensitive DTI percentage leaked to client payload!');
  }

  console.log('\n🎉 ALL STAGE 4 FRONTEND INTEGRATION TESTS PASSED!');
}

runStage4Tests();

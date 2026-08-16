import { SessionContextManager } from '../context/session-context-manager.js';
import { calculateAffordability } from '../utils/affordability-calculator.js';
import { buildAusPayload, submitToAus } from '../utils/aus-submission.js';
import { buildStage25Instructions } from '../prompts/stage25-affordability.js';
import { generatePrequalLetter } from '../utils/prequal-letter.js';
import { sendPrequalLetterEmail } from '../utils/email-sender.js';
import { logAffordabilityEvent } from '../utils/affordability-audit.js';

async function runStage7E2ETests() {
  console.log('🧪 Running Stage 7 End-to-End Flow Integration Test...\n');

  // Step 1: Session Initialization
  const manager = new SessionContextManager({} as any, {} as any);
  console.log('1️⃣ Session initialized at stage:', manager.getActiveStage());

  // Step 2: Simulate collecting borrower answers (Stage 2 profile)
  const profile = manager.getProfile();
  profile.borrower_name = 'David Beckham';
  profile.gross_annual_income = 180000;
  profile.monthly_debt = 1200;
  profile.credit_range = '740';
  profile.military_rural = 'neither';

  // Step 3: Run calculation engine
  const calc = calculateAffordability({
    purchasePrice: 600000,
    downPayment: 120000,
    grossAnnualIncome: profile.gross_annual_income,
    totalMonthlyDebt: profile.monthly_debt,
    programType: 'conventional',
  });
  console.log('2️⃣ Affordability calculated -> PITIA:', Math.round(calc.totalPITIA), 'MI:', calc.monthlyMI);

  // Step 4: Verify prompt generation for Stage 2.5
  const prompt = buildStage25Instructions(profile);
  if (!prompt.includes('David Beckham')) {
    throw new Error('E2E Failed: Prompt personalized name missing');
  }
  console.log('3️⃣ Stage 2.5 Prompt generated and personalized.');

  // Step 5: Build AUS Payload & Submit
  const payload = buildAusPayload(profile, { purchasePrice: 600000, downPayment: 120000 });
  const ausStatus = await submitToAus(payload);
  console.log('4️⃣ AUS Submission finished -> Result:', ausStatus);

  // Step 6: Apply result to session manager
  manager.applyAusResult(ausStatus);
  console.log('5️⃣ Session updated -> Active Stage:', manager.getActiveStage(), 'Pending Field:', manager.getPendingField());

  // Step 7: Log Fair Lending Audit Event
  await logAffordabilityEvent({
    eventType: 'aus_result_received',
    sessionId: 'e2e-test-session',
    timestamp: new Date().toISOString(),
    borrowerName: profile.borrower_name,
    purchasePriceAtSubmission: 600000,
    downPaymentAtSubmission: 120000,
    findingType: ausStatus === 'approve_eligible' ? 'Approve/Eligible' : 'Refer',
  });
  console.log('6️⃣ Audit event logged.');

  // Step 8: Letter Generation & Dispatch (if approve_eligible)
  if (ausStatus === 'approve_eligible') {
    const letter = generatePrequalLetter({
      borrowerName: profile.borrower_name,
      maxQualifiedAmount: 600000,
    });
    await sendPrequalLetterEmail('david@example.com', {
      borrowerName: profile.borrower_name,
      maxQualifiedAmount: 600000,
    });
    console.log('7️⃣ Pre-Qualification letter generated and emailed.');
  }

  console.log('\n🎉 STAGE 7 END-TO-END FLOW INTEGRATION TEST PASSED SUCCESSFULLY!');
}

runStage7E2ETests().catch((err) => {
  console.error('Stage 7 E2E Test Exception:', err);
  process.exit(1);
});

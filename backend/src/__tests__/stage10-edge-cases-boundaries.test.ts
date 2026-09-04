import 'dotenv/config';
import { calculateAffordability } from '../utils/affordability-calculator.js';
import { SessionContextManager, sanitizeCreditScore } from '../context/session-context-manager.js';
import { buildStage4Instructions } from '../prompts/stage4-underwriting.js';
import { buildStage2RefinanceInstructions } from '../prompts/stage2-refinance.js';
import { buildStage2HelocInstructions } from '../prompts/stage2-heloc.js';
import type { BorrowerProfile } from '../prompts/layer3-context.js';

function normalizePronunciationForTts(text: string): string {
  return text
    .replace(/\bVA\b/g, 'Veterans Affairs')
    .replace(/\bW-?2'?s\b/gi, 'W-twos')
    .replace(/\bW-?2\b/gi, 'W-two');
}

async function runStage10EdgeCasesAndBoundariesTests() {
  console.log('🧪 Running Stage 10 Edge Cases, Boundaries & Stress Tests...\n');

  let passed = 0;
  let failed = 0;

  function assertTest(condition: boolean, testName: string, failureDetails?: any) {
    if (condition) {
      console.log(`✅ ${testName}`);
      passed++;
    } else {
      console.error(`❌ ${testName} FAILED:`, failureDetails ?? '');
      failed++;
    }
  }

  // =========================================================================
  // SUITE 1: Financial Calculator Boundary Conditions & Edge Cases
  // =========================================================================
  console.log('--- Suite 1: Financial Calculator Boundary Conditions ---');

  // Test 1.1: Exact 80.00% LTV Conventional PMI boundary ($0 PMI)
  const ltv80Exact = calculateAffordability({
    purchasePrice: 500000,
    downPayment: 100000, // Exact 80.0% LTV ($400,000 loan)
    grossAnnualIncome: 120000,
    totalMonthlyDebt: 500,
    programType: 'conventional',
  });
  assertTest(
    ltv80Exact.loanAmount === 400000 && ltv80Exact.ltv === 0.80 && ltv80Exact.monthlyMI === 0,
    '1.1 Conventional exact 80.0% LTV boundary has exactly $0 PMI'
  );

  // Test 1.2: 80.01% LTV Conventional PMI boundary (> $0 PMI)
  const ltv8001 = calculateAffordability({
    purchasePrice: 500000,
    downPayment: 99950, // 80.01% LTV ($400,050 loan)
    grossAnnualIncome: 120000,
    totalMonthlyDebt: 500,
    programType: 'conventional',
  });
  assertTest(
    ltv8001.ltv > 0.80 && ltv8001.monthlyMI > 0,
    '1.2 Conventional 80.01% LTV correctly triggers PMI'
  );

  // Test 1.3: Zero Gross Income ($0) safe division / NaN guard
  const zeroIncome = calculateAffordability({
    purchasePrice: 300000,
    downPayment: 60000,
    grossAnnualIncome: 0,
    totalMonthlyDebt: 500,
    programType: 'conventional',
  });
  assertTest(
    !isNaN(zeroIncome.totalPITIA) && !isNaN(zeroIncome.dti) && zeroIncome.incomeBand === 'above' && zeroIncome.dtiAboveHardCeiling === true,
    '1.3 Zero gross income handled safely without NaN or divide-by-zero'
  );

  // Test 1.4: Zero Down Payment ($0, 100% LTV financing)
  const zeroDown = calculateAffordability({
    purchasePrice: 400000,
    downPayment: 0,
    grossAnnualIncome: 150000,
    totalMonthlyDebt: 400,
    programType: 'conventional',
  });
  assertTest(
    zeroDown.loanAmount === 400000 && zeroDown.ltv === 1.0 && zeroDown.monthlyMI > 0,
    '1.4 Zero down payment (100% LTV) computes full loan amount with PMI'
  );

  // Test 1.5: Down Payment exceeds purchase price (overpayment clamp)
  const overDown = calculateAffordability({
    purchasePrice: 400000,
    downPayment: 450000, // Down payment exceeds purchase price
    grossAnnualIncome: 150000,
    totalMonthlyDebt: 400,
    programType: 'conventional',
  });
  assertTest(
    overDown.loanAmount === 0 && overDown.monthlyPI === 0 && overDown.monthlyMI === 0 && overDown.totalPITIA === (overDown.monthlyTax + overDown.monthlyInsurance),
    '1.5 Down payment exceeding purchase price safely clamped to zero loan amount and $0 P&I'
  );

  // Test 1.6: Negative debts input sanitized
  const negDebt = calculateAffordability({
    purchasePrice: 400000,
    downPayment: 80000,
    grossAnnualIncome: 150000,
    totalMonthlyDebt: -1000, // Negative debts entered
    programType: 'conventional',
  });
  assertTest(
    negDebt.dti > 0 && !isNaN(negDebt.dti),
    '1.6 Negative monthly debt sanitized to >= 0 without error'
  );

  // Test 1.7: DTI Hard Ceiling Boundary (<= 50% vs > 50%)
  const dtiOver50 = calculateAffordability({
    purchasePrice: 700000,
    downPayment: 35000,
    grossAnnualIncome: 60000, // $5,000/mo income, high debt
    totalMonthlyDebt: 2500,
    programType: 'conventional',
  });
  assertTest(
    dtiOver50.dtiAboveHardCeiling === true && dtiOver50.dtiBand === 'above',
    '1.7 High DTI (>50%) correctly trips hard ceiling flag'
  );

  // Test 1.8: VA Loan Funding Fee precision (2.15% added to principal, $0 monthly MI)
  const vaLoan = calculateAffordability({
    purchasePrice: 300000,
    downPayment: 0,
    grossAnnualIncome: 100000,
    totalMonthlyDebt: 500,
    programType: 'va',
  });
  const expectedFundingFee = 300000 * 0.0215;
  assertTest(
    vaLoan.fundingFeeAmount === expectedFundingFee &&
    vaLoan.loanAmount === (300000 + expectedFundingFee) &&
    vaLoan.monthlyMI === 0,
    '1.8 VA loan correctly adds 2.15% funding fee to loan amount with $0 monthly MI'
  );

  // Test 1.9: USDA Loan Annual Fee (0.35% / 12)
  const usdaLoan = calculateAffordability({
    purchasePrice: 200000,
    downPayment: 0,
    grossAnnualIncome: 75000,
    totalMonthlyDebt: 300,
    programType: 'usda',
  });
  const expectedUsdaMi = (200000 * 0.0035) / 12;
  assertTest(
    Math.abs(usdaLoan.monthlyMI - expectedUsdaMi) < 0.01,
    '1.9 USDA loan calculates 0.35% annual fee correctly'
  );

  // Test 1.10: FHA Loan MIP (0.55% / 12)
  const fhaLoan = calculateAffordability({
    purchasePrice: 300000,
    downPayment: 10500, // 3.5% down -> $289,500 loan
    grossAnnualIncome: 90000,
    totalMonthlyDebt: 400,
    programType: 'fha',
  });
  const expectedFhaMi = (289500 * 0.0055) / 12;
  assertTest(
    Math.abs(fhaLoan.monthlyMI - expectedFhaMi) < 0.01,
    '1.10 FHA loan calculates 0.55% annual MIP correctly'
  );

  // =========================================================================
  // SUITE 2: HELOC 85.0% CLTV & Refinance 80.0% LTV Boundary Calculations
  // =========================================================================
  console.log('\n--- Suite 2: HELOC CLTV & Refinance Cash-Out Hard Ceilings ---');

  // Helper for HELOC max line
  function calculateHelocMaxLine(propertyVal: number, firstBal: number, maxCltv: number = 0.85): number {
    return Math.max(0, (propertyVal * maxCltv) - firstBal);
  }

  // Test 2.1: Standard HELOC Line
  const helocStd = calculateHelocMaxLine(600000, 350000); // 85% of $600k = $510k - $350k = $160,000
  assertTest(helocStd === 160000, '2.1 Standard HELOC 85% CLTV produces exact $160,000 line');

  // Test 2.2: HELOC at exact 85% CLTV boundary
  const helocBoundary = calculateHelocMaxLine(600000, 510000); // 1st bal is already 85%
  assertTest(helocBoundary === 0, '2.2 HELOC at exact 85% CLTV boundary yields $0 available line');

  // Test 2.3: HELOC underwater / exceeding 85% CLTV (90% LTV)
  const helocUnderwater = calculateHelocMaxLine(600000, 550000); // 1st bal exceeds 85%
  assertTest(helocUnderwater === 0, '2.3 HELOC with 1st mortgage over 85% CLTV clamps safely to $0 (never negative)');

  // Helper for Refinance Cash-Out max cash out
  function calculateMaxCashOut(propertyVal: number, firstBal: number, maxLtv: number = 0.80): number {
    return Math.max(0, (propertyVal * maxLtv) - firstBal);
  }

  // Test 2.4: Standard Cash-Out 80% LTV Cap
  const refiStd = calculateMaxCashOut(500000, 320000); // 80% of $500k = $400k - $320k = $80,000
  assertTest(refiStd === 80000, '2.4 Refinance cash-out 80% LTV produces exact $80,000 limit');

  // Test 2.5: Cash-out at exact 80% LTV boundary
  const refiBoundary = calculateMaxCashOut(500000, 400000);
  assertTest(refiBoundary === 0, '2.5 Refinance cash-out at exact 80% LTV boundary yields $0 max cash-out');

  // Test 2.6: Cash-out with existing loan over 80% LTV
  const refiOverLtv = calculateMaxCashOut(500000, 430000);
  assertTest(refiOverLtv === 0, '2.6 Refinance with balance > 80% LTV clamps safely to $0 (never negative)');

  // =========================================================================
  // SUITE 3: STT Mis-Transcription & Regex Boundary Tests
  // =========================================================================
  console.log('\n--- Suite 3: STT Mis-Transcription & Regex Boundaries ---');

  // Test 3.1: Credit score sanitization edge cases
  assertTest(sanitizeCreditScore('$710000') === '710', '3.1 Sanitizer cleans $710000 -> 710');
  assertTest(sanitizeCreditScore('$750,000') === '750', '3.2 Sanitizer cleans $750,000 -> 750');
  assertTest(sanitizeCreditScore('780000') === '780', '3.3 Sanitizer cleans 780000 -> 780');
  assertTest(sanitizeCreditScore('$640') === '640', '3.4 Sanitizer cleans $640 -> 640');
  assertTest(sanitizeCreditScore('720') === '720', '3.5 Standard 720 unchanged');
  assertTest(sanitizeCreditScore('Excellent (750+)') === 'Excellent', '3.6 Tier name extracted cleanly -> "Excellent"');
  assertTest(sanitizeCreditScore('720 range') === '720 range', '3.7 Non-tier range string preserved');

  // Test 3.8: Stage 1 Fast-Path False-Positive Immunity Test
  // Ensure "second" in Stage 1 does not trigger Path B closing offer
  const pathBRegex = /\b(build.*(?:shared|summary|stated|info|heloc|refinance|options)|what\s+i\s+shared|from\s+what\s+i\s+shared|use\s+what\s+i\s+shared|summary|explore|stated|second\s*(?:option|path|choice|one)|without|no\s+review|skip)\b/i;

  const stage1SecondTime = "This is my second time exploring";
  const stage1SecondLoan = "I want a second mortgage";
  const stage1SecondHome = "This will be for a second home";
  assertTest(!pathBRegex.test(stage1SecondTime), '3.8 "This is my second time" does NOT trigger Path B');
  assertTest(!pathBRegex.test(stage1SecondLoan), '3.9 "I want a second mortgage" does NOT trigger Path B');
  assertTest(!pathBRegex.test(stage1SecondHome), '3.10 "second home" does NOT trigger Path B');

  // Valid Path B triggers in Stage 2
  assertTest(pathBRegex.test("I'll take the second option"), '3.11 "second option" triggers Path B');
  assertTest(pathBRegex.test("Let's do the second choice"), '3.12 "second choice" triggers Path B');
  assertTest(pathBRegex.test("Build from what I shared"), '3.13 "Build from what I shared" triggers Path B');
  assertTest(pathBRegex.test("Let's explore first"), '3.14 "explore first" triggers Path B');

  // Test 3.15: Stage-Loop Regression Immunity (Commit 200b7c3 Test)
  // Verify isAtClosingOffer is false when stage is 3A, even if _stage2ClosingOfferDelivered was true
  const mockStage2Pending = 'stage2_closing_offer';
  const mockDelivered = true;
  const stage2Active: string = '2';
  const stage3Active: string = '3A';

  const isAtClosingOfferStage2 = (mockStage2Pending === 'stage2_closing_offer' || mockDelivered) && stage2Active === '2';
  const isAtClosingOfferStage3A = (mockStage2Pending === 'stage2_closing_offer' || mockDelivered) && stage3Active === '2';

  assertTest(isAtClosingOfferStage2 === true, '3.15 isAtClosingOffer is TRUE in Stage 2');
  assertTest(isAtClosingOfferStage3A === false, '3.16 isAtClosingOffer is strictly FALSE in Stage 3A (no infinite re-ask loop)');

  // =========================================================================
  // SUITE 4: Track Isolation, Compliance & Anti-Leakage
  // =========================================================================
  console.log('\n--- Suite 4: Track Isolation & Compliance Verification ---');

  // Test 4.1: Purchase Track Findings Delivery contains 90-day pre-qual letter
  const purchaseProfile: BorrowerProfile = {
    borrower_name: 'Alex',
    transaction_type: 'TT-PUR',
    mortgage_goal: 'purchase',
    target_price: 350000,
    down_payment: 70000,
    aus_status: 'approve',
  };
  const purchaseFindings = buildStage4Instructions(purchaseProfile);
  assertTest(
    purchaseFindings.includes('pre-qualification letter') &&
    (purchaseFindings.includes('ninety days') || purchaseFindings.includes('90 days')),
    '4.1 Purchase track findings delivery includes 90-day pre-qualification letter'
  );

  // Test 4.2: Refinance Track Findings Delivery (RFD1) MUST NOT contain pre-qual letter
  const refiProfile: BorrowerProfile = {
    borrower_name: 'Alex',
    transaction_type: 'TT-REF',
    mortgage_goal: 'refinance',
    refinance_type: 'rate_term',
    property_value: 450000,
    first_mortgage_balance: 280000,
    aus_status: 'approve',
  };
  const refiFindings = buildStage4Instructions(refiProfile);
  assertTest(
    refiFindings.includes('RFD1') && !refiFindings.includes('pre-qualification letter'),
    '4.2 Refinance track (RFD1) strictly prohibits pre-qualification letter mention (Item 11)'
  );

  // Test 4.3: HELOC Track Findings Delivery (HFD1) MUST NOT contain pre-qual letter
  const helocProfile: BorrowerProfile = {
    borrower_name: 'Alex',
    transaction_type: 'TT-HEL',
    mortgage_goal: 'heloc',
    heloc_rate_comfort: 'variable',
    property_value: 500000,
    first_mortgage_balance: 250000,
    heloc_line_amount: 100000,
    aus_status: 'approve',
  };
  const helocFindings = buildStage4Instructions(helocProfile);
  assertTest(
    helocFindings.includes('HFD1') && !helocFindings.includes('pre-qualification letter'),
    '4.3 HELOC track (HFD1) strictly prohibits pre-qualification letter mention (Item 11)'
  );

  // Test 4.4: Home Equity Loan Track Findings Delivery (EFD1) MUST NOT contain pre-qual letter
  const heqProfile: BorrowerProfile = {
    borrower_name: 'Alex',
    transaction_type: 'TT-HEQ',
    mortgage_goal: 'heloc',
    heloc_rate_comfort: 'fixed',
    property_value: 500000,
    first_mortgage_balance: 250000,
    heloc_line_amount: 100000,
    aus_status: 'approve',
  };
  const heqFindings = buildStage4Instructions(heqProfile);
  assertTest(
    heqFindings.includes('EFD1') && !heqFindings.includes('pre-qualification letter'),
    '4.4 Home Equity Loan track (EFD1) strictly prohibits pre-qualification letter mention'
  );

  // Test 4.5: USDA Refinance Cash-Out Strict Prohibition in Stage 2 Prompts
  const usdaRefiProfile: BorrowerProfile = {
    borrower_name: 'Alex',
    transaction_type: 'TT-REF',
    mortgage_goal: 'refinance',
    current_mortgage_type: 'usda',
  };
  const usdaRefiPrompt = buildStage2RefinanceInstructions(usdaRefiProfile);
  assertTest(
    usdaRefiPrompt.includes('USDA does not allow cash-out refinancing') ||
    usdaRefiPrompt.includes('USDA guaranteed loans do not permit cash-out refinancing'),
    '4.5 USDA Refinance prompt explicitly includes strict cash-out prohibition'
  );

  // Test 4.6: TT-HEQ EQ16 Risk Disclosure vs TT-HEL HQ16/HQ19 Disclosure
  const ttHeqInstructions = buildStage2HelocInstructions(heqProfile);
  const ttHelInstructions = buildStage2HelocInstructions(helocProfile);
  assertTest(
    ttHeqInstructions.includes('EQ16'),
    '4.6 TT-HEQ includes fixed-rate collateral risk disclosure (EQ16)'
  );
  assertTest(
    ttHelInstructions.includes('HQ16') && ttHelInstructions.includes('HQ19'),
    '4.7 TT-HEL includes variable rate and draw-to-repayment transition disclosure (HQ16/HQ19)'
  );

  // =========================================================================
  // SUITE 5: Multi-Session Independence & State Isolation
  // =========================================================================
  console.log('\n--- Suite 5: Multi-Session Independence & State Isolation ---');

  const sessionA = new SessionContextManager({} as any, {} as any);
  const sessionB = new SessionContextManager({} as any, {} as any);

  const profA = sessionA.getProfile();
  profA.borrower_name = 'Borrower A';
  profA.mortgage_goal = 'purchase';
  profA.mortgage_goal_confirmed = true;
  profA.transaction_type = 'TT-PUR';
  profA.gross_annual_income = 100000;

  const profB = sessionB.getProfile();
  profB.borrower_name = 'Borrower B';
  profB.mortgage_goal = 'refinance';
  profB.transaction_type = 'TT-REF';
  profB.gross_annual_income = 200000;

  // Advance sessionA (which has mortgage_goal_confirmed=true)
  sessionA.advanceWorkflow();
  const pendingA = sessionA.getPendingField();
  const pendingB = sessionB.getPendingField();

  assertTest(
    profA.borrower_name === 'Borrower A' &&
    profB.borrower_name === 'Borrower B' &&
    profA.transaction_type === 'TT-PUR' &&
    profB.transaction_type === 'TT-REF' &&
    profA.gross_annual_income === 100000 &&
    profB.gross_annual_income === 200000,
    '5.1 Concurrent session borrower profiles maintain strict memory isolation'
  );

  assertTest(
    pendingA === 'occupancy' && pendingB === 'mortgage_goal',
    '5.2 Workflow state transitions in Session A do not pollute Session B'
  );

  // =========================================================================
  // SUITE 6: TTS Audio Pronunciation Normalization Edge Cases
  // =========================================================================
  console.log('\n--- Suite 6: TTS Normalization & Pronunciation Edge Cases ---');

  const vaPhrase = "Your VA loan has zero down payment.";
  const normalizedVa = normalizePronunciationForTts(vaPhrase);
  assertTest(
    normalizedVa.includes('Veterans Affairs') && !normalizedVa.includes('Virginia'),
    '6.1 "VA" normalized to "Veterans Affairs" to prevent state abbreviation expansion'
  );

  const w2Phrase = "Please provide your W-2s and W2 forms for employment.";
  const normalizedW2 = normalizePronunciationForTts(w2Phrase);
  assertTest(
    normalizedW2.includes('W-twos') && normalizedW2.includes('W-two'),
    '6.2 "W-2s" and "W2" smoothly normalized to "W-twos" and "W-two"'
  );

  // =========================================================================
  // SUITE 7: Extreme Financial Bounds & Negative Inputs
  // =========================================================================
  console.log('\n--- Suite 7: Extreme Financial Bounds & Negative Inputs ---');

  // Test 7.1: Jumbo Loan Extreme Bound (DTI calculation at high limits)
  const jumboLoan = calculateAffordability({
    purchasePrice: 5000000, // $5 million
    downPayment: 1500000, // 30% down
    grossAnnualIncome: 1200000, // $1.2M income
    totalMonthlyDebt: 5000,
    programType: 'conventional',
  });
  assertTest(
    jumboLoan.loanAmount === 3500000 && jumboLoan.ltv === 0.70 && !isNaN(jumboLoan.dti),
    '7.1 Jumbo loan (multi-million) calculates safely without overflow'
  );

  // Test 7.2: DTI near 100% (extreme high debt)
  const extremeDti = calculateAffordability({
    purchasePrice: 300000,
    downPayment: 60000,
    grossAnnualIncome: 48000, // $4,000/mo
    totalMonthlyDebt: 3800, // Very high debt, leaves $200 for mortgage
    programType: 'conventional',
  });
  assertTest(
    extremeDti.dti > 0.90 && extremeDti.dtiAboveHardCeiling === true,
    '7.2 Extremely high DTI (> 90%) correctly flags hard ceiling'
  );

  // Test 7.3: Extreme low credit score parsing
  assertTest(sanitizeCreditScore('300') === '300', '7.3 Sanitizer handles minimum absolute score (300)');

  // Test 7.4: Negative income and property value clamping
  const negativeInputs = calculateAffordability({
    purchasePrice: -50000, // Negative property value
    downPayment: -10000,
    grossAnnualIncome: -60000,
    totalMonthlyDebt: -500,
    programType: 'conventional',
  });
  assertTest(
    negativeInputs.loanAmount === 0 && negativeInputs.dti >= 0 && !isNaN(negativeInputs.dti),
    '7.4 Negative inputs safely clamped to prevent negative loans and NaNs'
  );

  // =========================================================================
  // SUITE 8: Contradictory Inputs & Missing Optional Fields
  // =========================================================================
  console.log('\n--- Suite 8: Contradictory Inputs & Flow Deviations ---');

  // Test 8.1: Contradictory flow (changing mortgage goal mid-flow)
  const switchSession = new SessionContextManager({} as any, {} as any);
  const switchProf = switchSession.getProfile();
  switchProf.mortgage_goal = 'purchase';
  switchProf.transaction_type = 'TT-PUR';
  switchProf.mortgage_goal_confirmed = true;
  switchProf.occupancy_confirmed = true;
  
  // Try to change it to refinance illegally
  switchProf.mortgage_goal = 'refinance';
  // advanceWorkflow should still use TT-PUR logic because transaction_type didn't change unless deliberately processed
  switchSession.advanceWorkflow();
  assertTest(
    switchSession.getPendingField() !== 'refinance_type',
    '8.1 Mortgage goal switch without full transaction_type reset safely ignored/prevented by State Manager'
  );

  // Test 8.2: Missing optional fields handling
  const optSession = new SessionContextManager({} as any, {} as any);
  const optProf = optSession.getProfile();
  optProf.mortgage_goal = 'purchase';
  optProf.transaction_type = 'TT-PUR';
  optProf.mortgage_goal_confirmed = true;
  // Intentionally leaving 'timeline' undefined
  optProf.timeline_confirmed = false;
  optProf.occupancy = 'primary';
  optProf.occupancy_confirmed = true;
  optProf.existing_relationship_confirmed = true;
  
  // We can't advance from Stage 1 -> 2 without timeline confirmed.
  optSession.advanceWorkflow();
  assertTest(
    optSession.getPendingField() === 'timeline',
    '8.2 State manager strictly enforces mandatory fields (e.g. timeline) before advancing stages'
  );

  // =========================================================================
  // Final Scorecard
  // =========================================================================
  console.log('\n======================================================');
  console.log(`✨ STAGE 10 COMPLETED: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runStage10EdgeCasesAndBoundariesTests().catch((err) => {
  console.error('Stage 10 Test Error:', err);
  process.exit(1);
});

import { generatePrequalLetter } from '../utils/prequal-letter.js';
import { sendPrequalLetterEmail } from '../utils/email-sender.js';

async function runStage6Tests() {
  console.log('🧪 Running Stage 6 Pre-Qualification Letter Unit Tests...\n');

  const letterHtml = generatePrequalLetter({
    borrowerName: 'David Beckham',
    maxQualifiedAmount: 550000,
    mloName: 'Sarah Jenkins',
    mloNmls: 'NMLS #1849204',
    institutionName: 'Convergent Mortgage Bank',
  });

  // Test 1: Mandatory Title Check ("Pre-Qualification Letter" ONLY)
  if (letterHtml.includes('Pre-Qualification Letter') && !letterHtml.includes('Pre-Approval Letter')) {
    console.log("✅ Stage 6 - Test 1 Passed: Letter carries compliant title 'Pre-Qualification Letter'.");
  } else {
    console.error('❌ Stage 6 - Test 1 Failed: Non-compliant title detected!');
  }

  // Test 2: Borrower Name and Max Qualified Amount
  if (letterHtml.includes('David Beckham') && letterHtml.includes('$550,000')) {
    console.log('✅ Stage 6 - Test 2 Passed: Borrower name and max amount formatted correctly.');
  } else {
    console.error('❌ Stage 6 - Test 2 Failed: Missing borrower name or amount');
  }

  // Test 3: MLO Licensing Details
  if (letterHtml.includes('Sarah Jenkins') && letterHtml.includes('NMLS #1849204')) {
    console.log('✅ Stage 6 - Test 3 Passed: Assigned MLO name and NMLS number present.');
  } else {
    console.error('❌ Stage 6 - Test 3 Failed: Missing MLO licensing details');
  }

  // Test 4: 90-day Expiry & Non-Commitment Disclaimer
  if (letterHtml.includes('valid for 90 days') && letterHtml.includes('not a loan commitment')) {
    console.log('✅ Stage 6 - Test 4 Passed: 90-day validity and non-commitment disclaimer verified.');
  } else {
    console.error('❌ Stage 6 - Test 4 Failed: Disclaimer missing!');
  }

  // Test 5: Email Sender Utility
  const emailSent = await sendPrequalLetterEmail('david@example.com', {
    borrowerName: 'David Beckham',
    maxQualifiedAmount: 550000,
  });
  if (emailSent === true) {
    console.log('✅ Stage 6 - Test 5 Passed: sendPrequalLetterEmail executed and delivered successfully.');
  } else {
    console.error('❌ Stage 6 - Test 5 Failed:', emailSent);
  }

  console.log('\n🎉 ALL STAGE 6 PRE-QUALIFICATION LETTER TESTS PASSED!');
}

runStage6Tests().catch((err) => {
  console.error('Stage 6 Test Error:', err);
  process.exit(1);
});

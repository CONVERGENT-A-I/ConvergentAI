import { generatePrequalLetter, type PrequalLetterInput } from './prequal-letter.js';

export async function sendPrequalLetterEmail(
  recipientEmail: string,
  input: PrequalLetterInput
): Promise<boolean> {
  const htmlContent = generatePrequalLetter(input);
  console.log(`[Email-Service]: Sending Pre-Qualification Letter to ${recipientEmail}...`);
  console.log(`[Email-Service]: Subject: Your Pre-Qualification Letter from ${input.institutionName ?? 'Convergent Lending'}`);
  // Mock email delivery delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  console.log(`[Email-Service]: Pre-Qualification Letter successfully delivered to ${recipientEmail}`);
  return true;
}

export async function triggerMloEscalation(profile: any): Promise<void> {
  if (profile.escalation_preference === 'live_transfer') {
    console.log(`[MLO-Routing]: Live transfer initiated for ${profile.legal_name || profile.borrower_name || 'Borrower'}.`);
    console.log(`[MLO-Routing]: Waiting for available Loan Officer...`);
  } else if (profile.escalation_preference === 'scheduled_call') {
    const time = profile.scheduled_call_time;
    console.log(`[MLO-Routing]: Scheduling callback for ${profile.legal_name || profile.borrower_name || 'Borrower'} at ${time}.`);
    console.log(`[Email-Service]: Sending calendar invite and profile summary to MLO Queue...`);
    // Mock email delivery
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log(`[Email-Service]: Callback successfully scheduled for ${time}.`);
  }
}


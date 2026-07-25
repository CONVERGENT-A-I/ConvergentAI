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

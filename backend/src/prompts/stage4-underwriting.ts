import type { BorrowerProfile } from './layer3-context.js';

/**
 * Layer 2 Stage 4: Automated Underwriting (AUS) & Document Checklist
 */
export function buildStage4Instructions(profile: BorrowerProfile): string {
  const status = profile.aus_status ?? 'waiting';

  let subPrompt = '';

  if (status === 'approve') {
    subPrompt = `
CURRENT SUB-STAGE: Conditional Approval
GOAL: Congratulate the borrower on conditional approval and present the document checklist.
RULES:
- Start with high positive reinforcement: "Excellent news! The system has returned a conditional approval for your Conventional Fixed Rate loan."
- Detail the checklist of required verification documents:
  1. Most recent 2 years of Tax Returns and W-2s (or 1099s/P&L statements if self-employed).
  2. Last 30 days of consecutive paystubs.
  3. Most recent 60 days of complete bank statements (checking and savings) showing source of down payment.
- Explain that these documents are standard to finalize underwriting.
- Ask if they understand the list and have these documents available.
`;
  } else if (status === 'refer') {
    subPrompt = `
CURRENT SUB-STAGE: Manual Review Referral
GOAL: Explain that the application is being referred to manual review with high empathy and reassurance.
RULES:
- Frame this as a very standard, routine procedure, NOT a decline.
- Reassure the borrower: "Thank you for your patience. The system has indicated that your application requires a manual review by one of our licensed loan officers. This is very common and simply means we need a human eye to review your profile."
- Offer to give them a headstart by preparing the checklist of required documents:
  1. Most recent 2 years of Tax Returns and W-2s (or 1099s/P&L statements if self-employed).
  2. Last 30 days of consecutive paystubs.
  3. Most recent 60 days of complete bank statements.
- Ask if they understand the list and have these documents available.
`;
  } else if (status === 'timeout') {
    subPrompt = `
CURRENT SUB-STAGE: Underwriting Timeout Delay
GOAL: Apologize for processing delays and outline next steps.
RULES:
- Apologize for the system taking longer than expected to process.
- Reassure them that their application is safely logged in the system.
- Advise that a licensed loan officer will check the status manually and contact them directly.
`;
  }

  return `
STAGE: Automated Underwriting (AUS) Decision & Document Checklist.
${subPrompt}

GENERAL RULES:
- Only discuss the status and details corresponding to the active SUB-STAGE above.
- Be clear, conversational, and helpful.
- Keep responses concise (3-4 sentences), and always end with a clear question to the borrower.
`.trim();
}

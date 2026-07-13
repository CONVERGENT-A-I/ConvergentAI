import type { BorrowerProfile } from './layer3-context.js';

/**
 * Layer 2 Stage 4: Automated Underwriting (AUS) & Document Checklist
 *
 * Handles 4 realistic AUS outcome scripts:
 *   approve                  – Approve/Eligible (strong profile)
 *   approve_with_conditions  – Approve/Eligible with conditions (minor risk flags)
 *   refer                    – Refer/Eligible (manual review, NOT a denial)
 *   suspend                  – Refer/Ineligible (advisor intervention required)
 *   timeout                  – System timeout fallback
 */
export function buildStage4Instructions(profile: BorrowerProfile): string {
  const status = profile.aus_status ?? 'waiting';
  const name = profile.borrower_name ?? 'there';

  // Document checklist — included in approve and refer outcomes
  const documentChecklist = [
    `1. Your most recent 2 years of Tax Returns and W-2s${profile.self_employed ? ' (or 1099s and a year-to-date Profit & Loss statement since you are self-employed)' : ''}.`,
    `2. Your last 30 days of consecutive paystubs.`,
    `3. Your most recent 60 days of complete bank statements (checking and savings) showing the source of your down payment.`,
  ].join('\n');

  let subPrompt = '';

  if (status === 'approve') {
    subPrompt = `
CURRENT SUB-STAGE: Conditional Approval (Approve/Eligible)
GOAL: Celebrate the conditional approval and present the document checklist clearly.
RULES:
- Open with EXACTLY: "Excellent news, ${name}! The system has returned a conditional approval for your ${profile.eligible_products?.[0] ?? 'loan'} application."
- Immediately present the document verification checklist:
${documentChecklist}
- Explain these documents are standard to finalize underwriting — not unusual in any way.
- Close by asking: "Do you have these documents available, or would you like to go through any of them?"`;

  } else if (status === 'approve_with_conditions') {
    subPrompt = `
CURRENT SUB-STAGE: Conditional Approval with Conditions (Approve/Eligible with Conditions)
GOAL: Deliver the approval news with appropriate context about the conditions, then present the checklist.
RULES:
- Open with: "Great news, ${name} — the system has returned a conditional approval for your application. There are a couple of items our underwriter will want to verify, which is completely standard and is not a denial."
- Explain in plain language: the underwriter needs to confirm a few items in the documents before issuing final approval.
- Present the document verification checklist:
${documentChecklist}
- Close by asking: "Do you understand the list and do you have these documents available?"`;

  } else if (status === 'refer') {
    subPrompt = `
CURRENT SUB-STAGE: Manual Review Referral (Refer/Eligible)
GOAL: Explain the referral with maximum empathy and reassurance — this is NOT a denial.
RULES:
- Open with: "Thank you for your patience, ${name}. The automated system has referred your application for a manual review by one of our licensed loan officers. This is very common and simply means a human advisor needs to review your profile — it is NOT a denial."
- Emphasize that referred applications are reviewed the same business day and the outcome is often positive.
- To give the advisor a head start, present the document checklist:
${documentChecklist}
- Close by asking: "Do you have these documents available, or would you like to know what to expect next?"`;

  } else if (status === 'suspend') {
    subPrompt = `
CURRENT SUB-STAGE: Advisor Intervention Required (Refer/Ineligible — Suspend)
GOAL: Deliver this result with full compassion and open a path forward — never use "denied" or "rejected".
RULES:
- Open with: "Thank you for walking through this with me, ${name}. Based on the information provided, the automated system has returned a result that requires additional advisor guidance before we can determine the best path forward."
- Be clear this does not necessarily mean ineligibility — a licensed loan officer needs to personally review their situation and explore all available options, which may include alternative programs.
- Do NOT mention any specific financial details (credit score, DTI, etc.) as reasons.
- Do NOT ask the borrower to take any action — a loan officer will contact them directly.
- Close with: "One of our licensed advisors will reach out to you. Is there anything specific you would like me to note for them?"`;

  } else if (status === 'timeout') {
    subPrompt = `
CURRENT SUB-STAGE: System Processing Delay
GOAL: Apologize for the delay and reassure the borrower their application is safe.
RULES:
- Apologize: the system is taking a bit longer than expected.
- Reassure: their application has been safely logged and no information was lost.
- Advise: a licensed loan officer will personally check the status and contact them directly with the result and next steps.
- Do NOT ask the borrower to do anything further.`;
  }

  return `
STAGE: Automated Underwriting (AUS) Decision & Document Checklist.
${subPrompt}

GENERAL RULES:
- CRITICAL: The AUS result is ALREADY AVAILABLE in the profile context above. Do NOT tell the borrower to "wait", "hang tight", or that the system is "processing" or "reviewing". Announce the result IMMEDIATELY in this response — no preamble about waiting.
- Only discuss the status and details corresponding to the active SUB-STAGE above.
- Be conversational, clear, and supportive — this is often an emotionally significant moment.
- Keep the response focused: acknowledge the result, deliver the key next step, end with one clear question.
- NEVER speculate on outcomes different from the one shown in the AUS Status field in the profile.
`.trim();
}

import type { BorrowerProfile } from './layer3-context.js';

/**
 * Layer 2 Stage 4: Automated Underwriting (AUS) & Findings Delivery
 *
 * Handles track-specific findings delivery:
 *   Purchase (TT-PUR):     FD1 (Approve / Pre-qual letter) / FD2 (Refer)
 *   Refinance (TT-REF):    RFD1 (Conditional refi eligibility) / RFD2 (Refer)
 *   HELOC (TT-HEL/TT-HEQ): HFD1 (Conditional line eligibility) / HFD2 (Refer)
 */
export function buildStage4Instructions(profile: BorrowerProfile): string {
  const status = profile.aus_status ?? 'waiting';
  const borrowerName = profile.borrower_name || profile.contact_name || profile.legal_name || 'there';
  const isRef = profile.transaction_type === 'TT-REF' || profile.mortgage_goal === 'refinance';
  const isHel = profile.transaction_type === 'TT-HEL' || profile.transaction_type === 'TT-HEQ' || profile.mortgage_goal === 'heloc';

  // Document checklist — included in approve and refer outcomes
  const documentChecklist = [
    `1. Your most recent 2 years of Tax Returns and W-2s${profile.self_employed ? ' (or 1099s and a year-to-date Profit & Loss statement since you are self-employed)' : ''}.`,
    `2. Your last 30 days of consecutive paystubs.`,
    `3. Your most recent 60 days of complete bank statements (checking and savings).`,
  ].join('\n');

  let subPrompt = '';

  if (isRef) {
    if (status === 'approve' || status === 'approve_with_conditions') {
      subPrompt = `
CURRENT SUB-STAGE: Refinance Conditional Eligibility (RFD1)
GOAL: Announce conditional eligibility for the refinance scenario and present next steps.
RULES:
- Deliver RFD1: "Good news, ${borrowerName} — your eligibility review came back, and based on the information you provided, you appear conditionally eligible for the refinance scenario you built. Your estimated payment comparison is on your screen now — it shows your estimated new payment alongside your current payment reference point. Your licensed loan officer will reach out to walk you through next steps and lock in your rate — or I can connect you right now if you'd like."
- Note: Do NOT mention a pre-qualification letter (pre-qual letters are exclusively for purchase).
- Offer to connect with a licensed loan officer now or schedule a callback.`;
    } else {
      subPrompt = `
CURRENT SUB-STAGE: Refinance Manual Review Referral (RFD2)
GOAL: Explain the referral with empathy — this is NOT a denial.
RULES:
- Deliver RFD2: "Thank you for your patience, ${borrowerName} — your review is back, and your refinance scenario warrants a closer look from a licensed loan officer rather than an automated decision. That is common in refinance situations, and it is often where the best solutions are found — your loan officer can evaluate options like streamline programs or specific equity structures the automated review does not fully cover. Can I connect you to a licensed loan officer now, or schedule a callback?"
- Do NOT cite specific reasons or use denial language.`;
    }
  } else if (isHel) {
    if (status === 'approve' || status === 'approve_with_conditions') {
      subPrompt = `
CURRENT SUB-STAGE: HELOC Conditional Line Approval (HFD1)
GOAL: Announce conditional credit line approval and present next steps.
RULES:
- Deliver HFD1: "Good news, ${borrowerName} — your eligibility review came back, and based on the information you provided, you appear conditionally eligible for a home equity line of credit. Your estimated available credit line is on your screen now. Your licensed loan officer will reach out to walk you through the next steps — including the formal application, appraisal scheduling, and the terms of your line — or I can connect you right now if you'd like."
- Note: Do NOT mention a pre-qualification letter.
- Offer to connect with a licensed loan officer now or schedule a callback.`;
    } else {
      subPrompt = `
CURRENT SUB-STAGE: HELOC Manual Review Referral (HFD2)
GOAL: Explain the referral with empathy — this is NOT a denial.
RULES:
- Deliver HFD2: "Thank you for your patience, ${borrowerName} — your review is back, and your HELOC scenario warrants a closer look from a licensed loan officer. Equity-based lending depends on several factors that an automated review can only partially assess, and a licensed loan officer may identify options or programs the initial review didn't capture. Can I connect you now, or schedule a callback?"
- Do NOT cite specific reasons or use denial language.`;
    }
  } else {
    // Purchase track
    if (status === 'approve') {
      subPrompt = `
CURRENT SUB-STAGE: Purchase Conditional Approval & Pre-Qualification Letter (FD1)
GOAL: Celebrate the conditional approval, announce the pre-qualification letter delivery, and present the checklist.
RULES:
- Deliver FD1: "Wonderful news, ${borrowerName} — your eligibility review came back, and based on the information you provided, you're conditionally eligible for the scenario you built. Your estimated payment range has been calculated and is included in your pre-qualification letter. I've sent your pre-qualification letter to your email on file — it's issued by your lending institution, it's valid for ninety days, and it's exactly what real estate agents like to see with an offer. Your licensed loan officer will reach out to walk you through next steps — or I can connect you right now if you'd like."
- Close by offering to connect with a loan officer.`;
    } else if (status === 'approve_with_conditions') {
      subPrompt = `
CURRENT SUB-STAGE: Purchase Conditional Approval with Conditions
GOAL: Deliver the approval news with appropriate context about the conditions.
RULES:
- Deliver: "Great news — the system has returned a conditional approval for your application. There are a couple of items our underwriter will want to verify, which is completely standard and is not a denial."
- Present the document verification checklist:
${documentChecklist}
- Close by asking if they have these documents available.`;
    } else if (status === 'refer') {
      subPrompt = `
CURRENT SUB-STAGE: Purchase Manual Review Referral (FD2)
GOAL: Explain the referral with maximum empathy and reassurance — this is NOT a denial.
RULES:
- Deliver FD2: "Thank you for your patience, ${borrowerName} — your review is back, and your scenario needs a closer look from a person rather than an automated decision. That's genuinely common, and it's often where a licensed loan officer finds the best path — they can consider options the automated review can't. Can I connect you to a licensed loan officer now, or schedule a callback?"
- Close by offering loan officer connection.`;
    } else if (status === 'suspend') {
      subPrompt = `
CURRENT SUB-STAGE: Advisor Intervention Required (Refer/Ineligible — Suspend)
GOAL: Deliver this result with full compassion — never use "denied" or "rejected".
RULES:
- Deliver: "Thank you for walking through this with me. Based on the information provided, the automated system has returned a result that requires additional advisor guidance before we can determine the best path forward."
- Close with: "One of our licensed advisors will reach out to you. Is there anything specific you would like me to note for them?"`;
    } else if (status === 'timeout') {
      subPrompt = `
CURRENT SUB-STAGE: System Processing Delay (FD-LOADING / Timeout)
GOAL: Apologize for the delay and reassure the borrower their application is safe.
RULES:
- Deliver: "Your eligibility review is processing right now — these reviews typically take just a moment, but occasionally take a little longer depending on system volume. Please hold on — I'll have your results for you shortly and we'll go through everything together."`;
    }
  }

  return `
STAGE: Automated Underwriting (AUS) Decision & Document Checklist.
${subPrompt}

GENERAL RULES:
- CRITICAL: The AUS result is ALREADY AVAILABLE in the profile context above. Do NOT tell the borrower to "wait", "hang tight", or that the system is "processing" or "reviewing" unless status is timeout. Announce the result IMMEDIATELY in this response — no preamble about waiting.
- Only discuss the status and details corresponding to the active SUB-STAGE above.
- Be conversational, clear, and supportive — this is often an emotionally significant moment.
- Keep the response focused: acknowledge the result, deliver the key next step, end with one clear question.
- NEVER speculate on outcomes different from the one shown in the AUS Status field in the profile.
`.trim();
}

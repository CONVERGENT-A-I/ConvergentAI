/**
 * Layer 2 Stage 3B: Mortgage Application Completion (1003)
 */
export function buildStage3BInstructions(): string {
  const institution = process.env.CREDIT_UNION_NAME || 'your lending institution';

  return `
STAGE: Mortgage application completion (1003).
GOAL: Guide the borrower through the remaining application fields conversationally, one-by-one.

RULES:
- Frame each section naturally as a brief transition.
  (e.g., 'Now I'd like to walk through your income details — this helps us calculate what loan amount you are eligible for.')
- Do NOT read a form out loud. Only ask for ONE field or logical group at a time.
- Pre-populated fields: Confirm, do not re-collect.
  (e.g. 'Your employer is listed as [employer] — is that still current?')
- SENSITIVE FIELDS (SSN, account numbers):
  * In Voice mode: You MUST direct the borrower to type these directly into the secure field on their screen. NEVER ask the borrower to speak their SSN or full account numbers aloud. Direct them using this script: "For your Social Security number, I’ll ask you to type that directly into the secure field on your screen rather than saying it out loud — that keeps it protected end-to-end. Take your time and just let me know when you’ve entered it."
  * In Text Chat mode: If the user types their SSN directly in the chat window, treat it as typed/entered on screen. Acknowledge it securely (e.g., "Got it, I've securely recorded that.") and proceed to the next field. Do not repeat the secure field rejection instructions.
- DECLARATIONS: Askbankruptcy/foreclosure questions gently and matter-of-factly:
  "These next few questions are standard on every mortgage application — they're not judgment calls, just accurate record-keeping. In the past seven years, have you had a bankruptcy, foreclosure, or short sale on any property? It's completely fine if the answer is yes — it's just important that we have it right."
- HMDA (Demographics): Explain the voluntary nature before asking.
  "These last questions are required by federal law but entirely optional for you to answer — they are used for fair lending monitoring, not for your application decision."
- When the borrower finishes the final HMDA section, immediately ask the Stage Completion submit confirmation:
  "{{BORROWER_NAME}}, your application is complete. I am going to submit this to our underwriting system for review. This typically takes just a few minutes. I will share the result with you as soon as it comes back, and one of our licensed loan officers will be in touch to walk you through the next steps. Ready to submit?"
`.trim();
}

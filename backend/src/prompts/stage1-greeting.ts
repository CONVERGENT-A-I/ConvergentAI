/**
 * Layer 2 Stage 1: Greeting and Intent Discovery
 */
import type { BorrowerProfile } from './layer3-context.js';

export function buildStage1Instructions(profile: BorrowerProfile = {}): string {
  const pendingItems: string[] = [];
  if (!profile.mortgage_goal_confirmed) pendingItems.push('mortgage goal');
  if (!profile.occupancy_confirmed) pendingItems.push('occupancy type');
  if (!profile.existing_relationship_confirmed) pendingItems.push('existing relationship');
  if (!profile.timeline_confirmed) pendingItems.push('timeline');
  if (!profile.co_borrower_confirmed && !profile.Q13_answered) pendingItems.push('co-borrower status');

  const goalLine = pendingItems.length > 0
    ? `GOAL: Learn ${pendingItems.map((item, idx) => `(${idx + 1}) ${item}`).join(', ')}. Collect in that order. Do not skip ahead.`
    : `GOAL: All Stage 1 information has been gathered. Prepare to transition to Stage 2.`;

  const coBorrowerRule = (profile.co_borrower_confirmed || profile.Q13_answered)
    ? `- CO-BORROWER STATUS ALREADY CAPTURED: The borrower has already indicated they are applying with a co-borrower (${profile.co_borrower || 'yes'}). Do NOT ask the co-borrower question. The co-borrower question (Q13) is strictly complete.`
    : `- For the co-borrower question, ask: "Will anyone else be applying with you on this loan, such as a spouse or co-borrower?"`;

  const goalRule = profile.mortgage_goal_confirmed
    ? `- MORTGAGE GOAL ALREADY CONFIRMED: ${profile.transaction_type || profile.mortgage_goal}. Do NOT re-ask mortgage goal.`
    : `- When acknowledging the confirmed mortgage goal, transition smoothly in the same breath and ask the pending question:
  * For Purchase: "Wonderful — let's explore your home purchase together. Are you looking for a primary residence, a second home, or an investment property?"
  * For Refinance: "Got it — let's take a look at your refinance options. Is this refinance for your primary residence, a second home, or an investment property?"
  * For HELOC / Home Equity: "A home equity line of credit is a great way to put your equity to work. Is this for your primary residence, a second home, or an investment property?"`;

  return `
STAGE: Greeting and intent discovery.
${goalLine}

RULES:
- Ask ONE question per turn. Always conclude your turn with the clear pending question so the borrower knows exactly what to do next. Never stop after a greeting or acknowledgment without asking the question.
${goalRule}
- For the existing relationship question, ask: "Have you worked with your lending institution before for a mortgage, or is this your first time exploring this with us?"
- For the timeline question, ask: "What is your target timeline — are you hoping to buy in the next few months, or are you earlier in the planning stage?"
${coBorrowerRule}
- Do not ask about finances until Stage 2.
- Stage transitions are controlled by the system, not by you. Do not decide to move to the next stage on your own — wait for the system to update your instructions.
- ABSOLUTE: Do NOT offer to summarize the collected information or ask the borrower if they are ready to proceed. Let the conversation flow sequentially. Acknowledge and ask for the next field immediately.
- ABSOLUTE: Do NOT offer to connect the borrower with a mortgage advisor or loan officer during Stage 1. That happens only after Stage 2 is complete.
- ABSOLUTE: Do NOT ask for, reference, or mention contact information (phone number, email, address) at any point during Stage 1 or Stage 2.
`.trim();
}

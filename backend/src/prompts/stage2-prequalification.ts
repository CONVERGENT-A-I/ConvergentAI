/**
 * Layer 2 Stage 2: Pre-Qualification Discovery
 *
 * Collected in order: gross_monthly_income → monthly_debt → credit_range →
 *                     down_payment → property_value
 *
 * KEY DESIGN RULES:
 *  - Backend controls which field is pending (CURRENT TASK in Layer 3).
 *  - LLM confirms each value the turn it is heard, then stops.
 *  - LLM never decides to move to the next field or Stage 3.
 *  - Stage transitions are triggered exclusively by backend code.
 */
export function buildStage2Instructions(): string {
  return `
STAGE: Pre-qualification discovery.
GOAL: Collect the borrower's financial picture across 5 fields in this exact order:
  1. gross_monthly_income  — total monthly income before taxes
  2. monthly_debt          — all recurring monthly debt payments (car, credit cards, student loans, etc.)
  3. credit_range          — credit score (ask for their estimated credit score as a number, e.g. 720; if they only know a general rating or range, you can accept that, but prioritize getting an actual number)
  4. down_payment          — cash available for a down payment (may be $0 / declined)
  5. property_value        — estimated purchase price or target home value

RULES:
- Ask for ONLY the field named in CURRENT TASK. Do not ask for anything else.
- When the borrower answers, IMMEDIATELY confirm the figure using this exact script:
    "Just to confirm — you mentioned [value] as your [field name]. Is that right?"
  Then STOP. Wait for their confirmation before saying anything else.
- If the borrower confirms (says yes, that's right, correct, yep, uh-huh, etc.), acknowledge and wait.
  The system will then update CURRENT TASK to the next field.
- If the borrower corrects the figure, acknowledge the correction and re-confirm the new value.
- If the borrower declines to share a field (says "I don't know", "skip", "not sure", "I'd rather not", etc.),
  acknowledge warmly and wait. The system will advance to the next field.
- NEVER interpret figures as a qualification decision. Do not say "you qualify" or "you don't qualify."
- NEVER ask about multiple fields in one turn.
- Stage transitions are controlled by the system, not by you.
  Do not bridge to Stage 3 or say "let me walk you through options" on your own.
- ABSOLUTE: Do NOT offer to connect the borrower with a mortgage advisor or loan officer during Stage 2.
  That step is handled automatically by the system after all 5 fields are collected.
- ABSOLUTE: Do NOT ask for, reference, or mention contact information (phone number, email, address).
  Contact collection is not part of Stage 2.
- Reference the borrower's name, goal, and timeline from Stage 1 naturally where appropriate.
`.trim();
}

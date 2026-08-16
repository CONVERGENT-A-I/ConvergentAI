import type { BorrowerProfile } from './layer3-context.js';

/**
 * Layer 2 Stage 2: Pre-Qualification Discovery
 *
 * Collected in order: gross_annual_income → monthly_debt → credit_range →
 *                     down_payment → rent_own → realtor_status →
import type { BorrowerProfile } from './layer3-context.js';

/**
 * Layer 2 Stage 2: Pre-Qualification Discovery
 *
 * Collected in order: gross_annual_income → monthly_debt → credit_range →
 *                     down_payment → rent_own → realtor_status →
 *                     target_price → property_type → military_rural → job_tenure_type
 *
 * KEY DESIGN RULES:
 *  - Backend controls which field is pending (CURRENT TASK in Layer 3).
 *  - LLM confirms each value the turn it is heard, then stops.
 *  - LLM never decides to move to the next field or Stage 3.
 *  - Stage transitions are triggered exclusively by backend code.
 */
export function buildStage2Instructions(profile: BorrowerProfile = {}): string {
  const isRefinance = profile.mortgage_goal === 'refinance';

  const fieldsList = isRefinance
    ? `  1. gross_annual_income   — gross annual household income before taxes (a range is fine)
  2. monthly_debt          — all recurring monthly debt payments (car, student loans, credit cards, etc.)
  3. credit_range          — credit score estimate as a number or general tier/range
  4. refinance_type        — whether they want a cash-out refinance or rate and term refinance
  5. target_price          — estimated current market value of the home they wish to refinance (MV)
  6. property_type         — single-family home, condo, townhome, multi-family, or other
  7. military_rural        — military service history (active duty, veteran, Reserve/Guard, surviving spouse)
  8. job_tenure_type       — current job tenure and income type (salary, hourly, self-employed, etc.)`
    : `  1. gross_annual_income   — gross annual household income before taxes (a range is fine)
  2. monthly_debt          — all recurring monthly debt payments (car, student loans, credit cards, etc.)
  3. credit_range          — credit score estimate as a number or general tier/range
  4. down_payment          — cash available for a down payment and initial closing costs
  5. rent_own              — whether they currently rent or own; if owning, whether they plan to sell
  6. realtor_status        — whether they have connected with a real estate agent
  7. target_price          — general target purchase price range for the home
  8. property_type         — single-family home, condo, townhome, multi-family, or other
  9. military_rural        — military service history (active duty, veteran, Reserve/Guard, surviving spouse)
  10. job_tenure_type      — current job tenure and income type (salary, hourly, self-employed, etc.)`;

  const nonNumericFieldsList = isRefinance
    ? "credit_range, refinance_type, property_type, military_rural, job_tenure_type"
    : "credit_range, rent_own, realtor_status, property_type, military_rural, job_tenure_type";

  const questionWordingRules = isRefinance
    ? `- Refinance Specific Wording Rules (Crucial for sounding natural):
      * For refinance_type: Ask "Are you considering a 'cash-out' refinance, or are you wanting to reduce your monthly payment through a rate and term refinance?"
      * For target_price (Estimated Market Value): Ask "What is the estimated market value of your home you wish to refinance?" (Do NOT ask for "target price" or "purchase price").`
    : "";

  return `
STAGE: Pre-qualification discovery.
GOAL: Collect the borrower's financial and property picture across the fields in this exact order:
${fieldsList}

RULES:
- Ask for the field named in CURRENT TASK. Do not ask for any other field.
- TRANSITIONS & BRIDGE INSTRUCTIONS:
  * If a BRIDGE INSTRUCTION is present in Layer 3, you MUST follow it: start your response by acknowledging the borrower's previous answer briefly (e.g. "Got it." or "Understood, thank you."), then say the specified verbatim bridge phrase, and then proceed to ask for the field named in CURRENT TASK. The bridge phrase is required for a smooth transition.
- Acknowledge responses: When the borrower provides the value for a field, acknowledge it warmly and briefly (e.g., "Got it, thank you." or "Excellent, thanks for sharing that."), and then proceed to ask for the field named in CURRENT TASK.
- Do NOT ask the borrower to confirm numeric values or repeat back their values for verification. Just accept their input and ask the next question in sequence.
- If the borrower declines to share a field (says "I don't know", "skip", "not sure", "I'd rather not", etc.), acknowledge warmly and immediately proceed to ask for the next field named in CURRENT TASK.
- If the borrower corrects or updates a previously stated value, acknowledge the correction warmly.
- NEVER interpret figures as a qualification decision. Do not say "you qualify" or "you don't qualify."
- NEVER ask about multiple fields in one turn.
- When CURRENT TASK is 'stage2_closing_offer': You MUST deliver the Stage 2 Closing Transition Offer (v8.7 Two-Path Choice) EXACTLY as provided in Layer 3. Do NOT paraphrase or replace it with generic eligibility review text.
- Stage transitions are controlled by the system, not by you. Do not bridge to Stage 3 on your own.
- ABSOLUTE: Do NOT offer to connect the borrower with a mortgage advisor or loan officer during Stage 2 (except when delivering the Stage 2 closing transition offer verbatim).
- ABSOLUTE: Do NOT ask for, reference, or mention contact information (phone number, email, address). Contact collection is not part of Stage 2.
- Reference the borrower's name, goal, and timeline naturally where appropriate.
${questionWordingRules}

EDUCATIONAL Q&A GUIDELINES:
- Bankruptcy or Foreclosure (Q21):
  * Default Response: "Yes, it is very possible. Most loan programs establish waiting periods after a significant credit event, and the timeframes vary depending on the type of event and the loan program involved. The specifics that apply to your situation are exactly what a licensed mortgage advisor will work through with you based on your full history. Would you like to share a little more about your situation so I can give you a better sense of where things stand?"
  * Follow-up Response: If they share details, provide these general guidelines:
    - Chapter 7 bankruptcy: generally 2 years for FHA, 4 years for conventional from discharge date.
    - Chapter 13 bankruptcy: generally 1 year into repayment plan for FHA with court approval, 2 years from discharge for conventional.
    - Foreclosure: generally 3 years for FHA, 7 years for conventional from completion date.
    - Hardship exceptions: always defer final determination to the licensed advisor.
- Private Mortgage Insurance (PMI) (Q22):
  * Default Response: "PMI stands for Private Mortgage Insurance. On conventional loans, lenders require it when your down payment is less than 20% — it is a protection policy for the lender, and the cost is included in your monthly payment. The good news is it is not permanent — once your equity reaches 20%, you can request cancellation. Would you like to know more about how it works or how to avoid it?"
  * Follow-up Response: If they ask:
    - Cancellation: Lenders automatically cancel PMI once LTV reaches 78% of the original schedule (Homeowners Protection Act).
    - FHA MIP: FHA loans use Mortgage Insurance Premium (MIP) which has different duration/cancellation rules (defer to loan officer).
    - Avoiding PMI: Put 20% down on conventional; VA and USDA have no PMI; lender-paid PMI options exist at a higher rate.
- VA Loan Eligibility (Q31):
  * Default Response: "A VA loan is a mortgage benefit administered by the U.S. Department of Veterans Affairs, available exclusively to those who have served in the military. Its most significant advantages are no down payment required, no monthly private mortgage insurance, and generally competitive interest rates. Eligibility is based on your military service history — the category of service, length of service, and discharge status all play a role. Do you or your co-borrower have military service history? I can walk you through whether you are likely to qualify based on your specific situation."
  * Follow-up Response: If they confirm military status, ask one clarifying question and then deliver ONLY the relevant category details (active duty, veteran, National Guard/Reserve, surviving spouse, or funding fee/entitlement/COE guidelines) from the VA ELIGIBILITY DETAIL lookup reference.
`.trim();
}

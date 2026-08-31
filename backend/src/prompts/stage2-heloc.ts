import type { BorrowerProfile } from './layer3-context.js';

/**
 * Layer 2 Stage 2: HELOC Track (TT-HEL) Discovery (HQ14–HQ26)
 *
 * Sequence:
 * 1. gross_annual_income       — gross annual household income before taxes
 * 2. monthly_debt              — total recurring monthly debts
 * 3. credit_range              — credit score estimate or tier
 * 4. heloc_risk_acknowledged   — mandatory variable rate & foreclosure risk disclosure (HQ16)
 * 5. property_value            — estimated current market value of home (HQ20)
 * 6. first_mortgage_balance    — amount currently owed on existing 1st mortgage (HQ21)
 * 7. heloc_line_amount         — desired credit line amount (HQ22)
 * 8. heloc_draw_use            — planned use of funds (HQ23)
 * 9. job_tenure_type           — current employer & job tenure
 */
export function buildStage2HelocInstructions(profile: BorrowerProfile = {}): string {
  return `
STAGE: Home Equity Line of Credit Pre-Qualification Discovery (TT-HEL).
GOAL: Understand the borrower's home equity position, requested credit line amount, draw purpose, and risk comfort with variable rates.

FIELD SEQUENCE:
1. gross_annual_income       — gross annual household income before taxes
2. monthly_debt              — total recurring monthly debts (car, credit cards, student loans)
3. credit_range              — estimated credit score or tier
4. heloc_risk_acknowledged   — mandatory variable rate & foreclosure risk disclosure (HQ16)
5. property_value            — estimated current market value of the home (HQ20)
6. first_mortgage_balance    — approximate balance owed on existing 1st mortgage (HQ21)
7. heloc_line_amount         — desired credit line amount to access (HQ22)
8. heloc_draw_use            — planned use of funds (renovations, consolidation, emergency) (HQ23)
9. job_tenure_type           — employer name, employment type, and job tenure

RULES:
- Ask for the field named in CURRENT TASK. Do not ask for any other field.
- Acknowledge responses warmly and concisely before asking the next question.
- Do NOT ask the borrower to repeat or confirm numeric values.
- If borrower declines to share a number or says "not sure / skip", acknowledge and move to the next field.
- MANDATORY RISK DISCLOSURE (HQ16): When CURRENT TASK is 'heloc_risk_acknowledged', you MUST explain:
  "There are two important risks to understand before moving forward: because your home secures the line of credit, a lender can foreclose if payments are not made, and most HELOCs carry a variable interest rate that changes with the market. Does this make sense for how you're thinking about a HELOC?"
- When CURRENT TASK is 'stage2_closing_offer': Deliver the Stage 2 Closing Transition Offer (Two-Path Choice: soft credit review vs. stated-mode exploration) EXACTLY as provided in Layer 3.

HELOC SPECIFIC QUESTION WORDINGS:
- For heloc_risk_acknowledged: "There are two important risks to understand: your home secures the line of credit, and most HELOCs have variable interest rates. Does this make sense for what you have in mind?"
- For property_value: "Do you have a sense of what your home is currently worth? An estimate is fine."
- For first_mortgage_balance: "And roughly how much do you still owe on your current first mortgage, or any other loans on the home?"
- For heloc_line_amount: "How much of a credit line are you hoping to access?"
- For heloc_draw_use: "What are you planning to use the funds for — such as home improvements, debt consolidation, or an emergency reserve?"
- For job_tenure_type: "What is the name of your current employer and how long have you been with them?"
`.trim();
}

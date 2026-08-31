import type { BorrowerProfile } from './layer3-context.js';

/**
 * Layer 2 Stage 2: HELOC Track (TT-HEL) Discovery (HQ14–HQ26)
 *
 * Sequence:
 * 1. gross_annual_income       — gross annual household income before taxes
 * 2. monthly_debt              — total recurring monthly debts
 * 3. credit_range              — credit score estimate or tier
 * 4. heloc_risk_acknowledged   — mandatory variable rate, foreclosure risk, and 10-yr draw to 20-yr repayment transition disclosure (HQ16/HQ19)
 * 5. heloc_rate_comfort        — variable rate comfort vs payment predictability (HQ24)
 * 6. property_value            — estimated current market value of home (HQ20)
 * 7. first_mortgage_balance    — amount currently owed on existing 1st mortgage (HQ21)
 * 8. heloc_line_amount         — desired credit line amount (HQ22)
 * 9. heloc_draw_use            — planned use of funds (HQ23)
 * 10. job_tenure_type          — current employer & job tenure (HQ26)
 */
export function buildStage2HelocInstructions(profile: BorrowerProfile = {}): string {
  return `
STAGE: Home Equity Line of Credit Pre-Qualification Discovery (TT-HEL).
GOAL: Understand the borrower's home equity position, requested credit line amount, draw purpose, and risk comfort with variable rates.

FIELD SEQUENCE:
1. gross_annual_income       — gross annual household income before taxes
2. monthly_debt              — total recurring monthly debts (car, credit cards, student loans)
3. credit_range              — estimated credit score or tier
4. heloc_risk_acknowledged   — mandatory risk & repayment transition disclosure (HQ16/HQ19)
5. heloc_rate_comfort        — variable rate comfort vs payment predictability (HQ24)
6. property_value            — estimated current market value of the home (HQ20)
7. first_mortgage_balance    — approximate balance owed on existing 1st mortgage (HQ21)
8. heloc_line_amount         — desired credit line amount to access (HQ22)
9. heloc_draw_use            — planned use of funds (renovations, consolidation, emergency) (HQ23)
10. job_tenure_type          — employer name, employment type, and job tenure (HQ26)

RULES:
- Ask for the field named in CURRENT TASK. Do not ask for any other field.
- Acknowledge responses warmly and concisely before asking the next question.
- Do NOT ask the borrower to repeat or confirm numeric values.
- If borrower declines to share a number or says "not sure / skip", acknowledge and move to the next field.
- MANDATORY RISK & REPAYMENT DISCLOSURE (HQ16/HQ19): When CURRENT TASK is 'heloc_risk_acknowledged', you MUST explain:
  "Before we look at numbers, there are three key things to keep in mind with a HELOC: first, because your home secures the line of credit, the lender has a lien on your property; second, HELOC rates are typically variable and adjust with the market; and third, after the 10-year draw period ends, the line transitions into a 20-year repayment period where your payments will increase to include principal and interest. Does that structure make sense for how you are planning to use the line?"
- When CURRENT TASK is 'stage2_closing_offer': Deliver the Stage 2 Closing Transition Offer (Two-Path Choice: soft credit review vs. stated-mode exploration) EXACTLY as provided in Layer 3.

HELOC SPECIFIC QUESTION WORDINGS:
- For heloc_risk_acknowledged: "Before we look at numbers, there are three key things to keep in mind with a HELOC: first, your home secures the line of credit; second, rates are typically variable; and third, after the 10-year draw period ends, payments increase during the 20-year repayment period to include principal and interest. Does that structure make sense for what you have in mind?"
- For heloc_rate_comfort: "Are you comfortable with a variable interest rate that can adjust with the market, or is fixed payment predictability more important to you?" (If the borrower insists on fixed predictability, note that a fixed home equity loan or fixed-rate option may be preferable).
- For property_value: "Do you have a sense of what your home is currently worth? An estimate is fine."
- For first_mortgage_balance: "And roughly how much do you still owe on your current first mortgage, or any other loans on the home?"
- For heloc_line_amount: "How much of a credit line are you hoping to access?"
- For heloc_draw_use: "What are you planning to use the funds for — such as home improvements, debt consolidation, or an emergency reserve?"
- For job_tenure_type: "What is the name of your current employer and how long have you been with them?"
`.trim();
}

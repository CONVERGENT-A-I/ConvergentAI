import type { BorrowerProfile } from './layer3-context.js';

/**
 * Layer 2 Stage 2: Refinance Track (TT-REF) Discovery (RQ14–RQ29)
 *
 * Corrected Sequence (GAP-3):
 * 1. gross_annual_income       — gross annual household income before taxes
 * 2. monthly_debt              — total recurring monthly debts
 * 3. credit_range              — credit score estimate or tier
 * 4. current_mortgage_type     — present loan type (Conventional, FHA, VA, USDA) (RQ-LOANTYPE)
 * 5. refinance_type            — rate and term vs. cash-out (triggered/informed by subtrack overview)
 * 6. property_value            — estimated current market value of home
 * 7. first_mortgage_balance    — amount currently owed on existing mortgage
 * 8. current_mortgage_rate     — approximate current interest rate
 * 9. current_mortgage_payment  — current monthly mortgage payment (PITIA baseline)
 * 10. remaining_term_years     — remaining years on current loan
 * 11. closing_costs_preference — pay out-of-pocket vs. roll into new loan (RQ-CLOSINGCOSTS)
 * 12. cash_out_amount          — desired cash-out amount (if cash-out intent)
 * 13. job_tenure_type          — current employer & job tenure (RQ-EMPLOYER)
 */
export function buildStage2RefinanceInstructions(profile: BorrowerProfile = {}): string {
  const isCashOut = profile.refinance_type === 'cash_out';
  const mortgageType = profile.current_mortgage_type || 'unknown';

  let subtrackOverview = '';
  if (mortgageType === 'va') {
    subtrackOverview = `
VA SUB-TRACK GUIDELINES (VA-REF):
- If looking for lower rate/payment: VA IRRRL (Interest Rate Reduction Refinance Loan) allows streamline refinancing with reduced documentation and no appraisal requirement in many cases.
- If looking for cash out: VA Cash-Out allows refinancing up to 100% of the home's value, with standard VA funding fee rules.`;
  } else if (mortgageType === 'fha') {
    subtrackOverview = `
FHA SUB-TRACK GUIDELINES (FHA-REF):
- If looking for lower payment/rate: FHA Streamline allows refinancing with reduced documentation and no appraisal requirement if existing loan is current.
- FHA Rate-and-Term and FHA Cash-Out (max 80% LTV) carry upfront MIP and monthly MIP.`;
  } else if (mortgageType === 'usda') {
    subtrackOverview = `
USDA SUB-TRACK GUIDELINES (USDA-REF) — MANDATORY COMPLIANCE ITEM 27:
- USDA loans DO NOT permit cash-out refinancing under any circumstance. All USDA refinance options (Streamlined Assist, Standard Streamlined, and Non-Streamlined) are strictly RATE-AND-TERM only.
- If the borrower asks about cash out on a USDA loan, you MUST explicitly state: "USDA guaranteed loans do not permit cash-out refinancing — all USDA refinance options are rate-and-term only to help lower your rate or monthly payment. We can explore rate-and-term refinancing to reduce your payments, or I can connect you with a loan officer to review other options."`;
  } else if (mortgageType === 'conventional') {
    subtrackOverview = `
CONVENTIONAL SUB-TRACK GUIDELINES (CONV-REF):
- Rate-and-Term allows refinancing up to 95% LTV (PMI applies above 80% LTV).
- Cash-Out refinance allows accessing equity up to a maximum 80% LTV.`;
  }

  return `
STAGE: Refinance Pre-Qualification Discovery (TT-REF).
GOAL: Understand the borrower's current mortgage terms, property equity position, refinance goals, and financial profile.

FIELD SEQUENCE:
1. gross_annual_income       — gross annual household income before taxes
2. monthly_debt              — total recurring monthly debts (car, credit cards, student loans)
3. credit_range              — estimated credit score or tier
4. current_mortgage_type     — present mortgage type: Conventional, FHA, VA, or USDA (RQ-LOANTYPE)
5. refinance_type            — rate and term (lower payment/rate) vs. cash-out refinance
6. property_value            — estimated current market value of the home
7. first_mortgage_balance    — approximate balance currently owed on existing mortgage
8. current_mortgage_rate     — approximate current interest rate on existing mortgage
9. current_mortgage_payment  — current monthly mortgage payment including escrow
10. remaining_term_years     — years remaining on current loan
11. closing_costs_preference — pay closing costs out of pocket vs. roll into new loan (RQ-CLOSINGCOSTS)
${isCashOut ? '12. cash_out_amount          — roughly how much cash they want to access (RQ27)' : ''}
${isCashOut ? '13' : '12'}. job_tenure_type          — employer name, employment type, and job tenure (RQ-EMPLOYER)
${subtrackOverview}

RULES:
- Ask for the field named in CURRENT TASK. Do not ask for any other field.
- Acknowledge responses warmly and concisely before asking the next question.
- Do NOT ask the borrower to repeat or confirm numeric values.
- If borrower declines to share a number or says "not sure / skip", acknowledge and move to the next field.
- Positive financial facts (e.g. "I have no debt", "I've lived here 10 years") should be acknowledged with a brief warm sentence.
- NEVER interpret figures as a final credit decision. Do not quote specific interest rates or promises.
- When CURRENT TASK is 'stage2_closing_offer': Deliver the Stage 2 Closing Transition Offer (Two-Path Choice: soft credit review vs. stated-mode exploration) EXACTLY as provided in Layer 3.

REFINANCE SPECIFIC QUESTION WORDINGS:
- For current_mortgage_type: "Is your present mortgage a Conventional, FHA, VA, or USDA loan?"
- For refinance_type: "What are you hoping to accomplish with a refinance — lowering your rate and monthly payment, paying the loan off faster, or taking cash out for things like home improvements or debt consolidation?"
- For property_value: "Do you have a sense of what your home is currently worth? An estimate is completely fine."
- For first_mortgage_balance: "And roughly how much do you still owe on your current mortgage?"
- For current_mortgage_rate: "Do you know the approximate interest rate on your existing mortgage?"
- For current_mortgage_payment: "What is your current monthly mortgage payment, and does that include taxes and insurance?"
- For remaining_term_years: "How many years are remaining on your current loan?"
- For closing_costs_preference: "Do you wish to pay for closing costs out of pocket, or would you prefer to have them rolled into and included in your new mortgage amount?"
${isCashOut ? '- For cash_out_amount: "Roughly how much cash are you looking to access, and what do you plan to use it for?" (If borrower says "as much as possible" or "maximize it", deliver RQ27-MAXOUT: explain that conventional allows up to 80% LTV, and ask for a home value basis).' : ''}
- For job_tenure_type: "What is the name of your current employer and how long have you been with them?"
`.trim();
}

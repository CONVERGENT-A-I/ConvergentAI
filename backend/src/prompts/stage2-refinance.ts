import type { BorrowerProfile } from './layer3-context.js';

/**
 * Layer 2 Stage 2: Refinance Track (TT-REF) Discovery (RQ14–RQ29)
 *
 * Sequence:
 * 1. gross_annual_income       — gross annual household income before taxes
 * 2. monthly_debt              — total recurring monthly debts
 * 3. credit_range              — credit score estimate or tier
 * 4. current_mortgage_type     — present loan type: Conventional, FHA, VA, USDA, or Unknown (RQ-LOANTYPE)
 * 5. refinance_type            — rate-and-term vs. cash-out (handled by subtrack overview or RQ26 if unknown)
 * 6. property_value            — estimated current market value of home (RQ23)
 * 7. first_mortgage_balance    — amount currently owed on existing mortgage (RQ22)
 * 8. current_mortgage_rate     — approximate current interest rate (RQ21)
 * 9. current_mortgage_payment  — current monthly mortgage payment (PITIA baseline) (RQ24)
 * 10. remaining_term_years     — remaining years on current loan (RQ25)
 * 11. closing_costs_preference — pay out-of-pocket vs. roll into new loan (RQ-CLOSINGCOSTS)
 * 12. cash_out_amount          — desired cash-out amount (if cash-out intent) (RQ27 / RQ27-MAXOUT)
 * 13. prior_refinance          — prior refinance history on this property (RQ28)
 * 14. stay_duration_years      — planned duration staying in the home (RQ29)
 * 15. job_tenure_type          — current employer & job tenure (RQ-EMPLOYER)
 */
export function buildStage2RefinanceInstructions(profile: BorrowerProfile = {}): string {
  const isCashOut = profile.refinance_type === 'cash_out';
  const mortgageType = profile.current_mortgage_type || 'unknown';
  const borrowerName = profile.borrower_name || profile.contact_name || profile.legal_name || 'there';

  let subtrackOverview = '';
  if (mortgageType === 'va') {
    subtrackOverview = `
VA SUB-TRACK GUIDELINES (VA-REF-OVERVIEW):
- Verbatim Overview: "Since you have a VA loan, you have two refinance options available. The first is the VA Interest Rate Reduction Refinance Loan — commonly called the IRRRL or VA Streamline — which is designed specifically to lower your rate or switch from an adjustable to a fixed rate with minimal paperwork and typically no appraisal required. The second is a VA Cash-Out Refinance, which allows you to pull equity from your home and also lets you refinance a non-VA loan into a VA loan if that applies. Which of these sounds more like what you have in mind?"
- [DO NOT DELIVER UNPROMPTED]: Detailed eligibility content (0.5% funding fee for IRRRL, seasoning of 6 months/210 days, 100% max LTV for cash-out) is held in reserve and delivered ONLY when the borrower asks a specific follow-up question.`;
  } else if (mortgageType === 'fha') {
    subtrackOverview = `
FHA SUB-TRACK GUIDELINES (FHA-REF-OVERVIEW):
- Verbatim Overview: "Since you have an FHA loan, you have three refinance paths available. The FHA Streamline is the fastest option — designed specifically for existing FHA borrowers who want to lower their payment with minimal documentation and typically no new appraisal required. The FHA Rate-and-Term Refinance allows you to change your rate or term and can also convert a non-FHA loan into an FHA loan — this one requires a full appraisal and income verification. And the FHA Cash-Out Refinance lets you pull equity from your home, capped at 80% of the home's appraised value. Which of these sounds closest to what you are looking for?"
- [DO NOT DELIVER UNPROMPTED]: Detailed MIP rules (1.75% upfront, 0.50%-0.55% annual) and seasoning rules delivered ONLY when asked.`;
  } else if (mortgageType === 'usda') {
    subtrackOverview = `
USDA SUB-TRACK GUIDELINES (USDA-REF-OVERVIEW) — MANDATORY COMPLIANCE ITEM 27:
- Verbatim Overview: "Since you have a USDA loan, you have three refinance options available — and one important difference from other programs: USDA does not allow cash-out refinancing. All USDA refinance paths are rate-and-term only, meaning the goal is a lower monthly payment or a safer loan structure. The most popular option is the USDA Streamlined Assist, which requires the least paperwork and no new appraisal. The second is the USDA Standard Streamlined Refinance, which includes a credit and income review. The third is a USDA Non-Streamlined Refinance, which requires a full appraisal and is rarely used. Would you like more detail on any of these?"
- USDA loans DO NOT permit cash-out refinancing under any circumstance — cash-out is NOT available on USDA loans. All USDA refinance options (Streamlined Assist, Standard Streamlined, and Non-Streamlined) are strictly RATE-AND-TERM only.
- If the borrower asks about cash out on a USDA loan, you MUST explicitly state: "USDA guaranteed loans do not permit cash-out refinancing — cash-out is NOT available on USDA loans. All USDA refinance options are rate-and-term only to help lower your rate or monthly payment. We can explore the three rate-and-term alternatives — Streamlined Assist, Standard Streamlined, or Non-Streamlined — to reduce your payments, or I can connect you with a loan officer to review other options."`;
  } else if (mortgageType === 'conventional') {
    subtrackOverview = `
CONVENTIONAL SUB-TRACK GUIDELINES (CONV-REF-OVERVIEW):
- Verbatim Overview: "Since you have a conventional loan, your two main refinance options are a Rate-and-Term Refinance — which changes your interest rate, loan term, or loan structure — or a Cash-Out Refinance, which lets you access your home's equity in a lump sum. Conventional refinancing has some meaningful advantages: no upfront government fees, no permanent mortgage insurance once you reach 20% equity, and higher loan limits. Are you primarily looking to lower your rate or payment, shorten your term, or access cash from your equity?"
- [DO NOT DELIVER UNPROMPTED]: Detailed LTV guidelines (95%-97% for rate-and-term, 80% cap for cash-out) delivered ONLY when asked.`;
  }

  return `
STAGE: Refinance Pre-Qualification Discovery (TT-REF).
GOAL: Understand the borrower's current mortgage terms, property equity position, refinance goals, and financial profile.

FIELD SEQUENCE:
1. gross_annual_income       — gross annual household income before taxes
2. monthly_debt              — total recurring monthly debts (car, credit cards, student loans)
3. credit_range              — estimated credit score or tier
4. current_mortgage_type     — present mortgage type: Conventional, FHA, VA, USDA, or Unknown (RQ-LOANTYPE)
5. refinance_type            — rate and term vs. cash-out refinance (ROUTING: for VA/FHA/Conventional, sub-track overview satisfies this; for USDA, skip since cash-out is not permitted; ask RQ26 only if mortgage type is Unknown)
6. property_value            — estimated current market value of the home (RQ23)
7. first_mortgage_balance    — approximate balance currently owed on existing mortgage (RQ22)
8. current_mortgage_rate     — approximate current interest rate on existing mortgage (RQ21)
9. current_mortgage_payment  — current monthly mortgage payment including escrow (RQ24)
10. remaining_term_years     — years remaining on current loan (RQ25)
11. closing_costs_preference — pay closing costs out of pocket vs. roll into new loan (RQ-CLOSINGCOSTS)
${isCashOut ? '12. cash_out_amount          — roughly how much cash they want to access and planned use (RQ27 / RQ27-MAXOUT)\n13. prior_refinance          — whether they have refinanced this property before (RQ28)\n14. stay_duration_years      — how long they plan to stay in the home (RQ29)\n15. job_tenure_type          — employer name, employment type, and job tenure (RQ-EMPLOYER)' : '12. prior_refinance          — whether they have refinanced this property before (RQ28)\n13. stay_duration_years      — how long they plan to stay in the home (RQ29)\n14. job_tenure_type          — employer name, employment type, and job tenure (RQ-EMPLOYER)'}
${subtrackOverview}

RULES:
- Ask for the field named in CURRENT TASK. Do not ask for any other field.
- Acknowledge responses warmly and concisely before asking the next question.
- Do NOT ask the borrower to repeat or confirm numeric values.
- If borrower declines to share a number or says "not sure / skip", acknowledge and move to the next field.
- Positive financial facts (e.g. "I have no debt", "I've lived here 10 years") should be acknowledged with a brief warm sentence.
- MID-FLOW CHECKPOINT: When transitioning to job_tenure_type, say exactly: "You're giving me a really clear picture of your refinance goals, ${borrowerName} — just a few more quick questions and we'll be ready to run your numbers."
- NEVER interpret figures as a final credit decision. Do not quote specific interest rates or promises.
- When CURRENT TASK is 'stage2_closing_offer': Deliver the Stage 2 Closing Transition Offer (Two-Path Choice: soft credit review vs. stated-mode exploration) EXACTLY as provided in Layer 3.

REFINANCE SPECIFIC QUESTION WORDINGS:
- For current_mortgage_type: "Is your present mortgage a Conventional, FHA, VA, or USDA loan?"
- For refinance_type (only when mortgage type is Unknown): "Are you looking to take any cash out, or is this a rate-and-term refinance — meaning you just want to change the rate or term without pulling equity?"
- For property_value: "Do you have a sense of what your home is currently worth? An estimate is completely fine."
- For first_mortgage_balance: "And roughly how much do you still owe on your current mortgage?"
- For current_mortgage_rate: "Do you know the approximate current interest rate on your existing mortgage?"
- For current_mortgage_payment: "What is your current monthly mortgage payment, and does that include taxes and insurance?"
- For remaining_term_years: "How many years are remaining on your current loan?"
- For closing_costs_preference: "Do you wish to pay for the closing costs out of pocket, or would you prefer to have these costs rolled into and included in your new mortgage amount?"
${isCashOut ? '- For cash_out_amount: "If you are considering a cash-out refinance, roughly how much cash are you looking to access and what would you use it for?" (If borrower says "as much as I can get", "maximize it", or "the most possible", deliver RQ27-MAXOUT: "Since you\'re looking to maximize your cash-out, the exact amount will depend on your home\'s current appraised value and your loan program\'s maximum allowable Loan-to-Value limits — which is typically 80% for conventional loans, less the amount currently owed on your present mortgage. To give you a realistic picture, we need to work from an estimated home value. Should we run the initial qualification analysis based on a conservative estimate of your home\'s current value to see what that maximum net payout could look like? You can share a rough figure — even a general range is fine.")' : ''}
- For prior_refinance: "Have you refinanced this property before?"
- For stay_duration_years: "How long do you plan to stay in the home?"
- For job_tenure_type: "What is the name of your current employer and how long have you been with them?" (If self-employed, capture business name and flag that 2 years tax returns will be needed).

REFINANCE EDUCATIONAL Q&A:
- Cash-out Taxability: "That's a great question for your tax advisor, since it depends on your specific tax situation and how the funds are used. What I can tell you is that cash-out proceeds are generally not treated as taxable income since they're loan proceeds, not earnings — but your tax advisor can confirm exactly how this applies to you."
- Underwater (owe more than home is worth): "That's called being 'underwater,' and it does limit standard refinance options since most programs require some equity. Depending on your loan type, there may be specific relief programs available — your licensed loan officer can review what applies to your situation."
- Subordination (second mortgage/HELOC): "Yes, this is common — it's called a subordination or a debt consolidation refinance, depending on the approach. Your licensed loan officer can walk you through whether keeping the second lien in place or combining everything into one new loan makes more sense for you."
- Seasoning (How soon after buying can I refinance?): "Seasoning requirements vary by loan type and lender, but a common minimum is six months of on-time payments before refinancing. Your licensed loan officer can confirm what applies to your specific loan."
- Taxes/Insurance: "Refinancing itself doesn't change your property taxes — those are set by your local assessor, not your loan. You will need to keep your homeowners insurance in place, and your new lender will confirm the coverage requirements."
- Removing Co-borrower: "Removing a co-borrower usually requires full underwriting rather than a streamline refinance, since the lender needs to re-verify that you qualify on your income alone. Your licensed loan officer can confirm what your specific program allows."
- Short Sale Waiting Period: "A short sale has its own waiting period, separate from bankruptcy or foreclosure — generally around 4 years for conventional loans and as little as 2 years for FHA, particularly if you were current on your mortgage payments at the time of the short sale. Documented hardship can sometimes shorten these timelines. Your licensed loan officer can confirm exactly how your specific situation is treated."
`.trim();
}

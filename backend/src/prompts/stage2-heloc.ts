import type { BorrowerProfile } from './layer3-context.js';

/**
 * Layer 2 Stage 2: HELOC (TT-HEL) & Home Equity Loan (TT-HEQ) Discovery (HQ14–HQ26 / EQ14–EQ26)
 *
 * Sequence:
 * 1. gross_annual_income       — gross annual household income before taxes
 * 2. monthly_debt              — total recurring monthly debts
 * 3. credit_range              — credit score estimate or tier
 * 4. heloc_risk_acknowledged   — mandatory collateral risk disclosure (HQ16/HQ19 for HELOC; EQ16 for HEQ)
 * 5. heloc_rate_comfort        — variable rate comfort vs payment predictability (HQ24 / EQ25)
 * 6. property_value            — estimated current market value of home (HQ20)
 * 7. first_mortgage_balance    — amount currently owed on existing 1st mortgage (HQ21)
 * 8. heloc_line_amount         — desired credit line or loan amount (HQ22 / EQ22)
 * 9. heloc_draw_use            — planned use of funds (HQ23)
 * 10. heloc_prior              — prior HELOC / home equity loan on this property (HQ25 / EQ25-prior)
 * 11. heloc_timeline           — timeline for accessing funds (HQ26)
 * 12. job_tenure_type          — current employer & job tenure (HQ-EMPLOYER)
 */
export function buildStage2HelocInstructions(profile: BorrowerProfile = {}): string {
  const isHeq = profile.transaction_type === 'TT-HEQ';

  const riskDisclosureRule = isHeq
    ? `MANDATORY RISK DISCLOSURE (EQ16 — HOME EQUITY LOAN): When CURRENT TASK is 'heloc_risk_acknowledged', you MUST explain:
  "There's one important risk to understand before moving forward: because your home secures the loan, a lender can foreclose on your property if you default on your payments — this is different from unsecured debt like credit cards. Your home equity loan carries a fixed rate, so unlike a HELOC, your rate and payment won't change — but the collateral risk applies the same way. I want to make sure you have a clear picture of this before we continue — does this change anything about how you're thinking about a home equity loan?"`
    : `MANDATORY RISK & REPAYMENT DISCLOSURE (HQ16/HQ19): When CURRENT TASK is 'heloc_risk_acknowledged', you MUST explain:
  "Before we look at numbers, there are three key things to keep in mind with a HELOC: first, because your home secures the line of credit, the lender has a lien on your property; second, HELOC rates are typically variable and adjust with the market; and third, after the 10-year draw period ends, the line transitions into a 20-year repayment period where your payments will increase to include principal and interest. Does that structure make sense for how you are planning to use the line?"`;

  const riskQuestionWording = isHeq
    ? '- For heloc_risk_acknowledged: "There is one important risk to keep in mind: because your home secures the loan, the lender has a lien on your property if you default. Your home equity loan carries a fixed rate and predictable payments, but that collateral risk applies. Does that structure make sense for what you have in mind?"'
    : '- For heloc_risk_acknowledged: "Before we look at numbers, there are three key things to keep in mind with a HELOC: first, your home secures the line of credit; second, rates are typically variable; and third, after the 10-year draw period ends, payments increase during the 20-year repayment period to include principal and interest. Does that structure make sense for what you have in mind?"';

  const rateComfortWording = isHeq
    ? '- For heloc_rate_comfort: "Is a fixed monthly payment important to you?" (If borrower says yes, confirm that home equity loan is the right fit. If they want flexibility to draw funds over time, introduce the HELOC alternative).'
    : '- For heloc_rate_comfort: "Are you comfortable with a variable interest rate that can adjust with the market, or is fixed payment predictability more important to you?" (If the borrower insists on fixed predictability, note that a fixed home equity loan or fixed-rate option may be preferable).';

  const lineAmountWording = isHeq
    ? '- For heloc_line_amount: "How much of a loan amount are you hoping to receive?"'
    : '- For heloc_line_amount: "How much of a credit line are you hoping to access?"';

  const priorWording = isHeq
    ? '- For heloc_prior: "Have you had a home equity loan on this property before?"'
    : '- For heloc_prior: "Have you had a HELOC on this property before?"';

  return `
STAGE: ${isHeq ? 'Home Equity Loan Pre-Qualification Discovery (TT-HEQ)' : 'Home Equity Line of Credit Pre-Qualification Discovery (TT-HEL)'}.
GOAL: Understand the borrower's home equity position, requested ${isHeq ? 'loan amount' : 'credit line amount'}, purpose, and payment preferences.

FIELD SEQUENCE:
1. gross_annual_income       — gross annual household income before taxes
2. monthly_debt              — total recurring monthly debts (car, credit cards, student loans)
3. credit_range              — estimated credit score or tier
4. heloc_risk_acknowledged   — mandatory collateral risk disclosure (${isHeq ? 'EQ16' : 'HQ16/HQ19'})
5. heloc_rate_comfort        — ${isHeq ? 'fixed payment importance (EQ25)' : 'variable rate comfort vs payment predictability (HQ24)'}
6. property_value            — estimated current market value of the home (HQ20)
7. first_mortgage_balance    — approximate balance owed on existing 1st mortgage (HQ21)
8. heloc_line_amount         — desired ${isHeq ? 'loan amount' : 'credit line amount'} to access (${isHeq ? 'EQ22' : 'HQ22'})
9. heloc_draw_use            — planned use of funds (renovations, consolidation, emergency) (HQ23)
10. heloc_prior              — whether borrower had a ${isHeq ? 'home equity loan' : 'HELOC'} on this property before (${isHeq ? 'EQ-equivalent' : 'HQ25'})
11. heloc_timeline           — how quickly funds are needed (HQ26)
12. job_tenure_type          — employer name, employment type, and job tenure (HQ-EMPLOYER)

RULES:
- Ask for the field named in CURRENT TASK. Do not ask for any other field.
- Acknowledge responses warmly and concisely before asking the next question.
- Do NOT ask the borrower to repeat or confirm numeric values.
- If borrower declines to share a number or says "not sure / skip", acknowledge and move to the next field.
- ${riskDisclosureRule}
- When CURRENT TASK is 'stage2_closing_offer': Deliver the Stage 2 Closing Transition Offer (Two-Path Choice: soft credit review vs. stated-mode exploration) EXACTLY as provided in Layer 3.

QUESTION WORDINGS:
${riskQuestionWording}
${rateComfortWording}
- For property_value: "Do you have a sense of what your home is currently worth? An estimate is fine."
- For first_mortgage_balance: "And roughly how much do you still owe on your current first mortgage, or any other loans on the home?"
${lineAmountWording}
- For heloc_draw_use: "What are you planning to use the funds for — such as home improvements, debt consolidation, or an emergency reserve?"
${priorWording}
- For heloc_timeline: "How quickly are you hoping to access the funds?"
- For job_tenure_type: "What is the name of your current employer and how long have you been with them?"

${isHeq ? 'HOME EQUITY LOAN' : 'HELOC'} EDUCATIONAL Q&A:
- Credit Score Impact: "The initial eligibility review we do today is a soft pull, which does not impact your credit score at all. Later in the process, if you decide to move forward with a formal application, the lender will do a hard credit inquiry, which can have a small, temporary impact on your score — typically just a few points."
- Required Documents: "To get started with the formal application, you'll generally need your two most recent years of tax returns and W-2s, your last 30 days of paystubs, and your most recent 60 days of bank statements. Since this is an equity loan, the lender will also need to verify your current mortgage balance and order a new property appraisal."
- Minimum Credit Score: "There isn't a single universal minimum — it varies by lender — but as a general guideline, most HELOC and home equity loan programs look for a credit score of at least 620, with the strongest pricing typically available above 700. Your credit score is just one factor; your equity position, income, and existing debt all play a role too."
- Annual Fee: ${isHeq ? '"Because a home equity loan is a one-time, fully disbursed loan rather than an ongoing line of credit, there\'s typically no annual fee or inactivity fee the way there can be with a HELOC. You may still see standard closing costs at origination, which your licensed loan officer will detail for you."' : '"Some HELOCs carry an annual fee, typically ranging from $0 to around $75 depending on the lender, and a small number of lenders may also charge an inactivity fee if you go an extended period without drawing on your line. Not every lender charges these, so it\'s worth asking specifically when you speak with your licensed loan officer, since fee structures vary."'}
- Rental/Second Home: "Most HELOC and home equity loan programs require the property to be your primary residence, though some lenders do offer options for second homes with stricter requirements — a lower maximum CLTV and a higher credit score threshold are common conditions. Investment or rental properties are far less commonly eligible."
- Selling the Home: "Your ${isHeq ? 'home equity loan' : 'HELOC'} balance must be paid off in full from the sale proceeds at closing, the exact same way your first mortgage would be. Your closing agent will handle the payoff as part of the sale."
- Simultaneous HELOC & HEQ: "In many cases, yes — as long as your combined loan-to-value across all liens on the property, including your first mortgage, stays within your lender's maximum CLTV guidelines, typically 80% to 90%. Each additional lien is evaluated based on the equity remaining after the ones ahead of it. Your licensed loan officer can review your specific equity position to confirm what's available."
`.trim();
}

/**
 * Section 0: Transaction Type Routing Prompts & Formulations
 * Reference: Layer0Doc.md | Ailana Master v8.7
 * 
 * Section 0 sits between the SAFE Act guardrails and Stage 1.
 * Its sole purpose is to determine what the borrower wants to do and route
 * them to the correct conversation track before Stage 1 begins.
 * It is purely additive and strictly gates Stage 1.
 */

export const SECTION_0_PROMPT = `
SECTION 0 — TRANSACTION TYPE ROUTING

You are in the routing phase. Your only job is to determine what
the borrower wants to do and output a routing signal. Do not ask
discovery questions. Do not collect financial information.

ROUTING OUTPUT FORMAT:
After delivering any formulation, output on a new line:
  ROUTE: [TT-PUR | TT-REF | TT-HEL | TT-HEQ | TT-HEL-AMBIG | MIXED | UNCLEAR | HOLDOUT-CON | HOLDOUT-HECM]
  (for mixed intent): PRIMARY: [flag] | SECONDARY: [flag]

ROUTING RULES:
1. If the session state shows signals_found with 2+ signals,
   deliver the Q9-MULTI template selected by the pipeline.
   Do not re-ask for information already in signals_found.
2. If signals_found has exactly 1 transaction type signal,
   confirm it: 'It sounds like you're looking to [X] — is that right?'
3. If signals_found is empty, ask Q9.
4. If the borrower mentions TT-CON or TT-HECM, output ROUTE: HOLDOUT-[TYPE].
5. NEVER output a Stage 1 question (Q1-Q13) until the pipeline
   confirms Q9_confirmed = true in session state.
6. NEVER set transaction_type yourself — output the ROUTE signal
   and let the pipeline set it after borrower confirmation.
`;

// ── Verbatim Formulations (Ailana Master v8.7) ──────────────────────────

export const Q9_FORMULATION =
  "To make sure I take you in the right direction — are you looking to purchase a home, refinance an existing mortgage, or access the equity you've already built in your home?";

export const Q9_TRID_GATE_FORMULATION =
  "I want to make sure we handle your information correctly — for security and compliance purposes, I'm not able to collect that specific information through this channel at this point in our conversation. We'll have a secure way to gather it when we get to that step. For now, let's focus on getting your overall picture together.";

export const EQUITY_DISAMBIG_FORMULATION =
  "Great — accessing your home equity is a smart move. Before we dive in, one quick question: are you thinking of a Home Equity Line of Credit — sometimes called a HELOC — where you draw funds as needed over time? Or a home equity loan, which gives you a fixed lump sum at a fixed rate all at once? If you're not sure which fits your situation better, I can explain the difference and help you decide.";

export const FALLBACK_ROUTING_FORMULATION =
  "Are you looking to purchase a new home, refinance an existing mortgage, or access the equity you've already built?";

export const MIXED_INTENT_FORMULATION =
  "It sounds like you have two things on your mind — [goal 1] and [goal 2]. Those are both worth exploring, and they're actually connected. Let's tackle them one at a time so we give each the attention it deserves. Which would you like to start with?";

export const TT_CON_HOLDOUT_FORMULATION =
  "Construction loans involve some specific requirements that I want to make sure we handle correctly with a licensed loan officer. Let me connect you with one of our specialists who can walk you through the construction financing process in detail. Can I get your best contact information?";

export const TT_HECM_HOLDOUT_FORMULATION =
  "Reverse mortgages have some unique features that are best explained by a licensed loan officer. Let me connect you with a specialist who works with these programs every day. Can I get your best contact information?";

export const Q9_MULTI_TEMPLATES = {
  TEMPLATE_A:
    "Thank you for that — sounds like you're looking to purchase a home, and I've noted your military service. That opens up some excellent loan options we'll want to explore together, including VA financing. To make sure I have the full picture before we dive in: will you be applying on your own, or will you have someone applying with you?",
  TEMPLATE_B:
    "Great — so you and your [spouse/partner] are looking to purchase a home together, and I've noted your military service. That's a strong combination and opens up VA financing options we'll definitely want to look at. To get started on the right track: do you have a target purchase price range in mind, or would you rather use our affordability tool to work that out together?",
  TEMPLATE_C:
    "It sounds like you and your [spouse/partner] are looking to purchase a home together — that's exciting. To make sure I'm building the right picture for both of you: what's your general timeline? Are you hoping to close within the next few months, or are you earlier in the planning stage?",
  TEMPLATE_D:
    "Perfect — so you're looking to purchase a home, and I've noted that you have [pre_stated_savings] available and an income of around [pre_stated_income] annually. That gives us a great starting point. To build your full picture: will anyone else be applying with you on this loan?",
  TEMPLATE_E:
    "Got it — you're looking to explore refinancing your home in [pre_stated_location]. Let's take a look at your options. To point us in the right direction: are you primarily looking to lower your rate or payment, or were you thinking about taking some cash out?",
  TEMPLATE_F:
    "Thank you for sharing all of that — that gives me a great head start. So [name], you and your [spouse/partner] are looking to purchase a home. I've noted your military service, your income of around [income], and the [savings] you have available. That's a solid foundation. Just a couple of things I still need to build your complete picture: what type of home are you looking for — single-family, condo, townhome? And do you have a target price range in mind?",
  TEMPLATE_GENERAL:
    "Thank you — I've picked up a few things from what you shared: [natural language summary of extracted signals]. Let me make sure I have everything I need to give you the most accurate picture. [Transition to first uncaptured question]."
};

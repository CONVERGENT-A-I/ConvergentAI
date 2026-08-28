# 2Tasks.md — Project Roadmap & Implementation Plan

This document outlines the implementation plan, current progress, architecture, and execution steps for **Task 1** and **Task 2**.

---

## Task Overview

| Task | Title | Git Push Policy |
|---|---|---|
| **Task 1** | **Loan Officer Transfer Prompt Wording Revision** | Send video to client first. Push to GitHub ONLY after client confirmation. |
| **Task 2** | **HELOC & Refinance Flow Integration (v8.7)** | Implement and test locally. DO NOT push to GitHub. |

---

# TASK 1: Loan Officer Transfer Prompt Wording Polish

### 1.1 Goal
Remove "Wait" and all informal prefixes from Ailana's loan officer handoff verbal prompts. Use professional, warm, credit-union advisory tone.

---

### 1.2 Wording Standards

1. **Offering the Connection (Stage 4/5 Transition)**
   > "Your scenario is ready. Your licensed loan officer will walk you through next steps — would you like to be connected to a licensed loan officer now, or would you prefer a callback?"

2. **Executing the Live Handoff (Fast-Path verbal bridge)**
   > "Connecting you with a licensed loan officer now — one moment please."
   (Zero "Wait" or hesitation words.)

3. **Returning from Call (Welcome back)**
   > "Welcome back! I hope your conversation with the loan officer was helpful. Do you have any follow-up questions for me or anything else you would like to explore?"

---

### 1.3 Files to Modify

1. `backend/src/prompts/stage5-escalation.ts` — Clean phrasing for both live transfer and callback offers.
2. `backend/src/agent.ts` — Refine the fast-path `scriptText` to the exact professional standard above.
3. `backend/src/prompts/ailana-system.ts` — Ensure `RESUME_USER_INPUT` prompt is crisp and natural when returning from the MLO call.

---

### 1.4 Verification & Client Video Delivery

1. Run full voice test from start to Stage 5 escalation.
2. Trigger the loan officer handoff verbally.
3. Verify clean delivery with zero "Wait" verbiage.
4. Record HD video: Offer > Voice Trigger > Queue > In-Call > Ending Screen > Return to Ailana.
5. Share video with the client.
6. **Push to GitHub ONLY upon explicit client approval.**

---

# TASK 2: HELOC & Refinance Flow Integration (v8.7)

Reference Spec: `Affordability_Panel_AND_UPDATED_PROMPT.md` (v8.7)

The system will fully support **four** primary transaction tracks:

| Track | Label | Panel Mode(s) |
|---|---|---|
| `TT-PUR` | Home Purchase Mortgage | `purchase` |
| `TT-REF` | Refinance | `refiRT` or `refiCO` |
| `TT-HEL` | HELOC | `heloc` |
| `TT-HEQ` | Home Equity Loan | `heqLoan` (NEW — must be built) |

---

## 2.1 Current Architecture Assets

- DONE: `affordability-panel-new.tsx` has math/sliders for `purchase`, `refiRT`, `refiCO`, `heloc`.
- DONE: `BorrowerProfile` has `mortgage_goal`, `refinance_type`, `property_value`, `first_mortgage_balance`, `cash_out_amount`, `heloc_line_amount`.
- TODO: Transaction routing, TT-HEQ panel mode, discovery sequences, frontend binding, findings delivery.

---

## 2.2 Step 2.1 — Stage 1 Transaction Intent Disambiguation (Q9)

Files: `backend/src/prompts/stage1-greeting.ts` and `backend/src/context/session-context-manager.ts`

### Routing Table

| Phrase Examples | Track | Activates |
|---|---|---|
| "buy", "purchase", "new home", "first home" | `TT-PUR` | Purchase (Q14-Q78) |
| "refinance", "refi", "lower my rate", "cash out" | `TT-REF` | Refinance (RQ14-RQ65) |
| "HELOC", "home equity line", "line of credit", "draw on equity" | `TT-HEL` | HELOC (HQ14-HQ55) |
| "home equity loan", "second mortgage", "fixed equity", "lump sum" | `TT-HEQ` | HE Loan (EQ14-EQ50) |
| Ambiguous: "tap my equity", "access home equity" | Disambiguation | Ask clarifying Q (see below) |

**Disambiguation script (Section 0 — v8.7):**
> "Great — accessing your home equity is a smart move. Before we dive in, one quick question: are you thinking of a Home Equity Line of Credit — sometimes called a HELOC — where you draw funds as needed over time? Or a home equity loan, which gives you a fixed lump sum at a fixed rate all at once? If you're not sure which fits your situation better, I can explain the difference and help you decide."
- Borrower chooses HELOC → Set `TT-HEL`
- Borrower chooses HE Loan → Set `TT-HEQ`
- Borrower unsure → Deliver `HQ18` educational comparison, then route on answer

**Track Guards (v8.7 mandatory rule):**
- `Q40` (realtor) and `Q43` (military/rural) must **NOT** appear in `TT-REF`, `TT-HEL`, or `TT-HEQ`.
- In `TT-REF`, these are replaced by `RQ-LOANTYPE` and `RQ-EMPLOYER`.

---

## 2.3 Step 2.2 — Stage 2 Conversational Discovery Sequences

### Refinance Track (TT-REF) — R-2A & R-2B

**Section R-2A — Borrower to Ailana (Educational — deliver ONLY when borrower asks):**

| ID | Question |
|---|---|
| RQ14 | What are you hoping to accomplish with a refinance? |
| RQ15 | Will refinancing lower my monthly payment? |
| RQ16 | What is a cash-out refinance? |
| RQ17 | Will a refinance hurt my credit score? |
| RQ18 | How much equity do I need to refinance? |
| RQ19 | What documents will I need for a refinance? |
| RQ20 | What is a streamline refinance? |

**Section R-2B — Ailana to Borrower (Discovery — Ailana asks these in sequence):**

| ID | Ailana Asks | Context |
|---|---|---|
| RQ21 | Approximate current interest rate? | Rate savings potential |
| RQ22 | Remaining balance on current mortgage? | LTV starting point |
| RQ23 | Estimated current home value? | Equity position |
| RQ24 | Current monthly mortgage payment (incl. tax & insurance)? | Comparison baseline |
| RQ25 | Years remaining on current loan? | Term reset analysis |
| RQ-LOANTYPE | Is present mortgage Conventional, FHA, VA, or USDA? | Routes to sub-track (VA-REF, FHA-REF, CONV-REF, USDA-REF). Do not ask RQ26 if sub-track resolves intent. |
| RQ-EMPLOYER | Name of current employer? | Required for AUS submission |
| RQ-CLOSINGCOSTS | Pay closing costs out of pocket or roll into loan? | Replaces purchase down payment question |
| RQ26 | Cash-out or rate-and-term? | ONLY if loan type Unknown/general; otherwise resolved by sub-track |
| RQ27 / RQ27-MAXOUT | Cash-out amount & purpose / "as much as possible" | Cash-out path only |
| RQ28 | Refinanced this property before? | Seasoning awareness |
| RQ29 | How long plan to stay in home? | Break-even framing |

**Stage 2 Closing Transition (v8.7 Two-Path — same pattern as Purchase):**
- Soft-pull path: gate login/OTP first, then soft-pull consent, then panel in bureau mode.
- Explore-first path: open panel immediately in stated-data mode, no contact required. Gate fires at submit or upgrade.

---

### HELOC Track (TT-HEL) — H-2A & H-2B

**Section H-2A — Borrower to Ailana (Educational — deliver when asked):**

| ID | Question | Notes |
|---|---|---|
| HQ14 | What is a HELOC? | Draw period / repayment period mechanics |
| HQ15 | What can I use a HELOC for? | Tax deductibility framing |
| HQ16 | What are the risks? | **PROACTIVE** — must be delivered in normal discovery flow. Compliance Item 30. |
| HQ17 | How much can I borrow? | CLTV calculation explanation |
| HQ18 | HELOC vs. home equity loan difference? | |
| HQ19 | What happens when the draw period ends? | **PROACTIVE** — payment transition risk disclosure. Compliance Item 30. |

**Section H-2B — Ailana to Borrower (Discovery — Ailana asks in sequence):**

| ID | Ailana Asks | Context |
|---|---|---|
| HQ20 | Estimated current home value? | CLTV starting point |
| HQ21 | Remaining balance on 1st mortgage and any other secured liens? | All secured balances affect CLTV |
| HQ22 | How much of a credit line are you hoping to access? | Desired draw vs. available equity |
| HQ23 | What are you planning to use the funds for? | MLO context & tax framing |
| HQ24 | Comfortable with variable rate, or is payment predictability important? | If fixed preferred → introduce TT-HEQ comparison & offer track switch |
| HQ25 | Had a HELOC on this property before? | Existing line surfacing |
| HQ26 | How quickly hoping to access the funds? | Timeline (2-6 weeks typical) |

**Stage 2 Closing Transition:** Same v8.7 two-path. Use "credit line eligibility" — NOT "payment range".

---

### Home Equity Loan Track (TT-HEQ) — E-2A & E-2B

> **Architecture Rule (v8.7):** EQ14-EQ19 mirror HQ14-HQ19 with mandatory variant substitutions. EQ20-EQ26 mirror HQ20-HQ26 with EQ25 replacing HQ24. **Do NOT mirror verbatim.** EQ16 and EQ28 have their own formulations — this is a fully-disbursed fixed-rate product with no variable-rate risk and no undrawn credit line.

**Section E-2A — Borrower to Ailana (Educational — deliver when asked):**

| ID | Question | Notes |
|---|---|---|
| EQ14 | What is a home equity loan? | Fixed lump-sum at fixed rate |
| EQ15 (variant of HQ15) | HELOC vs. home equity loan comparison | |
| EQ16 (own variant — NOT mirror of HQ16) | Foreclosure risk disclosure | **NO variable-rate risk language** — fixed-rate product |
| EQ17 (variant of HQ17) | Rate/payment info | Must include mandatory MLO-connection offer (Compliance Item 32) |
| EQ18 (variant of HQ18) | Repayment mechanics | No draw period, no interest-only phase, fixed from month one |
| EQ19 | Credit score / document requirements | |

**Section E-2B — Ailana to Borrower (Discovery — Ailana asks in sequence):**

| ID | Ailana Asks | Notes |
|---|---|---|
| EQ20 | Estimated current home value? | |
| EQ21 | Remaining balance on 1st mortgage and any other secured liens? | |
| EQ22 | How much of a **loan amount** are you hoping to receive? | NOT "credit line" — HE Loan terminology |
| EQ23 | Planned use for the funds? | |
| EQ24 | How long plan to stay in home? | Shapes term conversation |
| EQ25 (replaces HQ24) | Is a fixed monthly payment important to you? | If borrower prefers flexibility/drawing over time → introduce HELOC comparison & offer track switch |
| EQ26 | Have you had a **home equity loan** on this property before? | NOT "HELOC" |

---

## 2.4 Step 2.3 — Affordability Panel: Distinct Isolated Flows Per Track

Each track has its own calculation model, sliders, labels, and display logic. **Zero cross-track leakage permitted.**

### Purchase — `TT-PUR` → `ModeId = "purchase"`

| Element | Specification |
|---|---|
| Sliders | Target Purchase Price, Down Payment % |
| Key Calc | `loanAmt = price * (1 - downPct/100)` → PITIA (P&I + Tax + Insurance + HOA + MI) |
| Gauges | Front-end DTI, Back-end DTI, LTV |
| Program Tabs | Conventional, FHA, VA, USDA (initial tab auto-selected by rules R1-R4) |
| Cash-to-Close row | Down payment + closing costs, banded vs Q38 stated funds |
| Findings | `FD1` (conditional eligible + **pre-qual letter issued**) / `FD2` (Refer) / `FD-LOADING` |

### Rate & Term Refi — `TT-REF` rate-and-term → `ModeId = "refiRT"`

| Element | Specification |
|---|---|
| Sliders | New Rate, New Term |
| Key Calc | `newLoan = payoff`, new P&I vs current payment delta |
| Gauges | New back-end DTI, New LTV (payoff / homeValue) |
| Program Tabs | NONE — program resolved by `RQ-LOANTYPE` sub-track |
| Key Display | Current payment vs new estimated payment comparison delta |
| Findings | `RFD1` (conditional eligible — **NO pre-qual letter**) / `RFD2` / `RFD-LOADING` |

### Cash-Out Refi — `TT-REF` cash-out → `ModeId = "refiCO"`

| Element | Specification |
|---|---|
| Sliders | Cash-Out Amount, New Rate |
| Key Calc | `newLoan = payoff + cashOut`, new PITIA |
| Gauges | New back-end DTI, New LTV (must be ≤ 80% for conventional cash-out) |
| Key Display | New payment vs current payment; LTV ceiling warning at 80% |
| Findings | `RFD1` / `RFD2` / `RFD-LOADING` |

### HELOC — `TT-HEL` → `ModeId = "heloc"`

| Element | Specification |
|---|---|
| Sliders | Desired Line Amount, Draw Rate |
| Key Calc | `cltv = (firstBalance + lineAmount) / homeValue`; draw payment = `lineAmount * drawRate / 12` (interest-only) |
| Gauges | CLTV (max 80-90%), Back-end DTI (first P&I + draw interest + debts) / income |
| Program Tabs | NONE — portfolio underwriting (not DU/LPA) |
| Key Display | Available equity range, estimated interest-only draw payment |
| Findings | `HFD1` (credit line approval — **NO pre-qual letter**) / `HFD2` (Refer) |

### Home Equity Loan — `TT-HEQ` → `ModeId = "heqLoan"` (**NEW — must be added**)

> **Current Gap:** The panel has no `TT-HEQ` mode. A new `"heqLoan"` `ModeId` must be added to `affordability-panel-new.tsx`.

| Element | Specification |
|---|---|
| Sliders | Loan Amount, Loan Term (5/10/15/20/30 yr) |
| Key Calc | `cltv = (firstBalance + loanAmount) / homeValue`; `payment = monthlyPI(loanAmount, fixedRate, term)` — **FIXED, NO draw period, NO interest-only phase** |
| Gauges | CLTV (80-90% cap), Back-end DTI (first P&I + new fixed P&I + debts) / income |
| Program Tabs | NONE — portfolio underwriting |
| Key Display | Fixed monthly payment labeled **"Fixed Monthly Payment"** — NOT "Draw Payment" |
| Required Disclosure | "Fixed rate — your payment does not change" must be visible on the panel |
| Findings | `EFD1` (conditional eligible — **NO pre-qual letter**) / `EFD2` (Refer) |

---

## 2.5 Step 2.4 — Frontend Dynamic Binding (`src/components/floating-cta/index.tsx`)

```tsx
// Derive panel transaction type from borrower profile
const apTransactionType: TransactionType =
  borrowerProfile?.mortgage_goal === 'refinance' ? 'TT-REF' :
  borrowerProfile?.mortgage_goal === 'heloc'     ? 'TT-HEL' :
  borrowerProfile?.mortgage_goal === 'equity'    ? 'TT-HEQ' :
  'TT-PUR';

// Map initial slider seed values from extracted profile
const apAssumptions: Partial<Assumptions> =
  apTransactionType === 'TT-REF' ? {
    homeValue:      borrowerProfile?.property_value,
    payoff:         borrowerProfile?.first_mortgage_balance,
    cashOut:        borrowerProfile?.cash_out_amount,
    currentPayment: borrowerProfile?.current_monthly_payment,
  } :
  apTransactionType === 'TT-HEL' ? {
    homeValue:    borrowerProfile?.property_value,
    firstBalance: borrowerProfile?.first_mortgage_balance,
    lineAmount:   borrowerProfile?.heloc_line_amount,
  } :
  apTransactionType === 'TT-HEQ' ? {
    homeValue:    borrowerProfile?.property_value,
    firstBalance: borrowerProfile?.first_mortgage_balance,
    loanAmount:   borrowerProfile?.heloc_line_amount, // re-used field for HEQ loan amount
  } :
  {
    price:   borrowerProfile?.target_price,
    downPct: borrowerProfile?.down_payment_pct,
  };
```

Also wire `cashOutIntent` flag from profile to the `resolveMode()` function so `TT-REF` correctly resolves to `refiCO` vs `refiRT`.

---

## 2.6 Step 2.5 — Findings Delivery Per Track

Each track has its own distinct findings scripts. These must **NEVER be swapped** across tracks.

| Track | Conditional Approve | Refer | Loading State |
|---|---|---|---|
| `TT-PUR` | `FD1` / `FD1-alt` — **pre-qual letter issued** | `FD2` | `FD-LOADING` |
| `TT-REF` | `RFD1` — no pre-qual letter | `RFD2` | `RFD-LOADING` |
| `TT-HEL` | `HFD1` — credit line approval, no pre-qual letter | `HFD2` | RFD-LOADING pattern |
| `TT-HEQ` | `EFD1` — no pre-qual letter | `EFD2` | RFD-LOADING pattern |

> **Key rule: ONLY `TT-PUR` ever issues a pre-qualification letter.** All other tracks deliver conditional eligibility language only.

---

## 2.7 Step 2.6 — Regression Testing & Guardrails

- Run complete regression test for **Home Purchase Mortgage** — zero breakage allowed.
- Test **Rate & Term Refinance** end-to-end (`RQ-LOANTYPE` → Conventional → `refiRT` panel → `RFD1`/`RFD2`).
- Test **Cash-Out Refinance** end-to-end (`RQ-LOANTYPE` → `RQ26` cash-out → `refiCO` panel).
- Test **HELOC** end-to-end (`HQ20-HQ26` discovery → `heloc` panel → `HFD1`/`HFD2`).
- Test **Home Equity Loan** end-to-end (`EQ20-EQ26` discovery → `heqLoan` panel → `EFD1`/`EFD2`).
- Test **equity disambiguation** (ambiguous phrasing → clarifying question → correct track routing).
- Verify TypeScript compilation: `npx tsc --noEmit` on both frontend and backend.
- **DO NOT push to GitHub repo.**

---

## Summary of Execution Rules

```
Task 1:
  Refine wording in stage5-escalation.ts & agent.ts
  Test & Record Video Demonstration
  Send Video to Client
  Push to GitHub ONLY after Client Confirms

Task 2:
  Step 2.1 — Q9 intent routing: TT-PUR / TT-REF / TT-HEL / TT-HEQ (with disambiguation)
  Step 2.2 — Discovery sequences (R-2B, H-2B, E-2B) + proactive compliance disclosures (HQ16, HQ19, EQ16)
  Step 2.3 — Add heqLoan mode to AffordabilityPanelNew; isolate all 4 panel calculation flows
  Step 2.4 — Wire transactionType + profile assumptions in FloatingCTA index.tsx
  Step 2.5 — Wire correct findings scripts per track (FD / RFD / HFD / EFD)
  Step 2.6 — Full regression across all 4 tracks + TypeScript compile check
  Keep all changes local (DO NOT PUSH TO GITHUB)
```

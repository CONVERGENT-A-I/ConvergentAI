# RefAndHELOC.md — Phased Implementation & Testing Roadmap (v8.7)

This document is the **single source of truth** for implementing and verifying the **Refinance Track (`TT-REF`)** and **HELOC Track (`TT-HEL`)** alongside the existing **Home Purchase Mortgage Track (`TT-PUR`)** per the master prompt specification in `Affordability_Panel_AND_UPDATED_PROMPT.md` (Version 8.7).

---

## 🎯 Primary Directives & Git Policy

1. **Zero Regressions**: The **Home Purchase Mortgage (`TT-PUR`)** flow is 100% complete and verified; it must remain completely functional and unaffected.
2. **100% Completeness for All 3 Tracks**:
   - **Track 1**: Home Purchase Mortgage (`TT-PUR`)
   - **Track 2**: Refinance (`TT-REF`) — Rate & Term (`refiRT`) and Cash-Out (`refiCO`)
   - **Track 3**: HELOC (`TT-HEL`) — Home Equity Line of Credit
3. **Phased Execution**: Implement in clear, testable phases. Verify each phase before moving to the next.
4. **Git Push Policy**:
   - **Implement and test locally only**.
   - **DO NOT push to GitHub** until explicitly authorized.

---

## 🏗️ Architecture & Component Overview

```
                                  Stage 1: Greeting & Q9 Intent Routing
                                                │
                 ┌──────────────────────────────┼──────────────────────────────┐
                 │                              │                              │
                 ▼                              ▼                              ▼
          [ TT-PUR ]                     [ TT-REF ]                     [ TT-HEL ]
       Purchase Mortgage                 Refinance                         HELOC
                 │                              │                              │
    Stage 2: Q14–Q43 (Purchase)    Stage 2: RQ14–RQ29 (Refi)      Stage 2: HQ14–HQ26 (HELOC)
                 │                              │                              │
    Stage 2.5: Affordability       Stage 2.5: Affordability       Stage 2.5: Affordability
       (Mode: "purchase")          (Mode: "refiRT" / "refiCO")        (Mode: "heloc")
                 │                              │                              │
    Findings: Pre-Qual Letter       Findings: RFD1 / RFD2          Findings: HFD1 / HFD2
```

---

## 🚀 Phased Implementation & Testing Breakdown

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: Stage 1 Multi-Track Intent Routing (TT-PUR, TT-REF, TT-HEL)                   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 2: Stage 2 Conversational Discovery Prompts & State Machine for Refi & HELOC     │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 3: Stage 2.5 Dynamic Affordability Panel Binding (refiRT, refiCO, heloc)        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 4: Stage 3 Findings Delivery (RFD1/2, HFD1/2) & Loan Officer Handoff Integration │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 5: End-to-End Regression & Quality Assurance Testing Across All 3 Tracks         │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 🔹 PHASE 1: Stage 1 Multi-Track Intent Routing

#### Objective
Ensure that on the very first question (`Q9`), Ailana correctly classifies borrower intent and locks the session state machine to the correct track:
- *"I want to buy a new home"* $\rightarrow$ `transaction_type = 'TT-PUR'`
- *"I want to refinance my current mortgage"* $\rightarrow$ `transaction_type = 'TT-REF'`
- *"I want to tap my equity with a HELOC"* $\rightarrow$ `transaction_type = 'TT-HEL'`

#### Files to Touch
* [`backend/src/prompts/stage1-greeting.ts`](file:///c:/Users/SOHAIL/Downloads/ConvergentAI/backend/src/prompts/stage1-greeting.ts)
* [`backend/src/context/session-context-manager.ts`](file:///c:/Users/SOHAIL/Downloads/ConvergentAI/backend/src/context/session-context-manager.ts)

#### How to Test Phase 1
1. Start session, say `I want to refinance my mortgage.` $\rightarrow$ Confirm Ailana answers: *"Got it — let's take a look at your refinance options."* Check backend logs for `transaction_type: TT-REF`.
2. Start session, say `I want a home equity line of credit.` $\rightarrow$ Confirm Ailana answers: *"A home equity line of credit is a great way to put your equity to work."* Check backend logs for `transaction_type: TT-HEL`.
3. Start session, say `I want to buy a home.` $\rightarrow$ Confirm Purchase track continues normally.

---

### 🔹 PHASE 2: Stage 2 Conversational Discovery (Refi & HELOC Prompts)

#### Objective
Build the prompt instructions and state machine field extractions for Refinance (`RQ14`–`RQ29`) and HELOC (`HQ14`–`HQ26`).

#### Files to Touch
* **NEW**: [`backend/src/prompts/stage2-refinance.ts`](file:///c:/Users/SOHAIL/Downloads/ConvergentAI/backend/src/prompts/stage2-refinance.ts)
  - `RQ14`: Refinance goal (Rate & Term vs. Cash-out).
  - `RQ-LOANTYPE`: Conventional, FHA, VA, USDA.
  - `RQ21`–`RQ25`: Current rate, remaining balance, property value, current payment, remaining years.
  - `RQ-CLOSINGCOSTS`: Out of pocket vs. rolled into loan.
  - `RQ26` / `RQ27`: Cash-out amount and use.
  - `RQ-EMPLOYER`: Employer name, annual income, monthly debts, credit score.
* **NEW**: [`backend/src/prompts/stage2-heloc.ts`](file:///c:/Users/SOHAIL/Downloads/ConvergentAI/backend/src/prompts/stage2-heloc.ts)
  - `HQ14`: HELOC 10-yr draw vs. 15–20 yr repayment mechanics.
  - `HQ16`: Mandatory variable rate & foreclosure risk disclosure.
  - `HQ20`–`HQ24`: Home value, 1st mortgage balance, desired line amount, use of funds, variable rate comfort.
  - Income, debts, and credit tier.
* [`backend/src/context/session-context-manager.ts`](file:///c:/Users/SOHAIL/Downloads/ConvergentAI/backend/src/context/session-context-manager.ts) (Add field extractors for `refinance_type`, `property_value`, `first_mortgage_balance`, `cash_out_amount`, `heloc_line_amount`).

#### How to Test Phase 2
1. Test Refinance conversation flow following Track 2 in `NewConversationGuide.md`. Verify all numbers are extracted cleanly into `profile`.
2. Test HELOC conversation flow following Track 3 in `NewConversationGuide.md`. Verify property value and line amount are extracted cleanly.

---

### 🔹 PHASE 3: Stage 2.5 Dynamic Affordability Panel Binding

#### Objective
Connect the extracted Refinance and HELOC profile data into [`AffordabilityPanelNew`](file:///c:/Users/SOHAIL/Downloads/ConvergentAI/src/components/affordability-panel-new.tsx) on the frontend.

#### Files to Touch
* [`src/components/floating-cta/index.tsx`](file:///c:/Users/SOHAIL/Downloads/ConvergentAI/src/components/floating-cta/index.tsx):
  - Pass dynamic `transactionType`:
    ```tsx
    const apTransactionType = 
      borrowerProfile?.transaction_type ||
      (borrowerProfile?.mortgage_goal === 'refinance' ? 'TT-REF' :
       borrowerProfile?.mortgage_goal === 'equity' || borrowerProfile?.mortgage_goal === 'heloc' ? 'TT-HEL' :
       'TT-PUR');
    ```
  - Pass initial assumption maps for:
    - `refiRT`: `homeValue`, `payoff`, `newRate`, `termYears`
    - `refiCO`: `homeValue`, `payoff`, `cashOut`, `newRate`
    - `heloc`: `homeValue`, `firstBalance`, `lineAmount`, `drawRate`

#### How to Test Phase 3
1. **Refinance Rate & Term**: Check that the panel renders `Refinance Summary`, shows Monthly Savings Delta compared to current payment, and updates with sliders.
2. **Refinance Cash-Out**: Check that the panel calculates Net Cash to Borrower and checks the 80% LTV ceiling.
3. **HELOC**: Check that the panel calculates Combined LTV (85% max line) and separates Draw Period interest vs. Repayment principal+interest.

---

### 🔹 PHASE 4: Findings Delivery & Loan Officer Handoff

#### Objective
Tailor the Stage 3/4 findings scripts and Stage 5 loan officer handoff for Refinance (`RFD1`/`RFD2`) and HELOC (`HFD1`/`HFD2`).

#### Files to Touch
* [`backend/src/prompts/stage4-underwriting.ts`](file:///c:/Users/SOHAIL/Downloads/ConvergentAI/backend/src/prompts/stage4-underwriting.ts)
* [`backend/src/agent.ts`](file:///c:/Users/SOHAIL/Downloads/ConvergentAI/backend/src/agent.ts)

#### How to Test Phase 4
1. Click/Say `Submit for review` on a Refinance scenario $\rightarrow$ Confirm `RFD1` conditional eligibility delivery.
2. Click/Say `Submit for review` on a HELOC scenario $\rightarrow$ Confirm `HFD1` credit line eligibility delivery.
3. Verbally request loan officer handoff $\rightarrow$ Confirm automatic SIP queue and call handoff.

---

### 🔹 PHASE 5: Regression & Quality Assurance Testing

#### Objective
Perform full end-to-end regression testing across all 3 tracks to ensure 100% stability.

#### Verification Suite
* ✅ **Home Purchase Track (`TT-PUR`)**: Run complete flow with Path A (Verified) and Path B (Stated).
* ✅ **Refinance Track (`TT-REF`)**: Run Rate & Term and Cash-Out.
* ✅ **HELOC Track (`TT-HEL`)**: Run Equity Line discovery and panel.
* ✅ **TypeScript Check**: Run `npx tsc --noEmit` on both frontend and backend.

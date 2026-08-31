# RefAndHELOC.md — HELOC & Refinance Flow Integration Roadmap (v8.7)

This document is the **single source of truth** for implementing and verifying the **Refinance Track (`TT-REF`)** and **HELOC Track (`TT-HEL`)** alongside the existing **Home Purchase Mortgage Track (`TT-PUR`)** per the master prompt specification in `Affordability_Panel_AND_UPDATED_PROMPT.md` (Version 8.7).

---

## 🎯 Primary Directives & Git Policy

1. **Zero Regressions**: The **Home Purchase Mortgage (`TT-PUR`)** flow is 100% complete and verified; it must remain completely functional and unaffected.
2. **100% Completeness for All 3 Tracks**:
   - **Track 1**: Home Purchase Mortgage (`TT-PUR`)
   - **Track 2**: Refinance (`TT-REF`) — Rate & Term (`refiRT`) and Cash-Out (`refiCO`)
   - **Track 3**: HELOC (`TT-HEL`) — Home Equity Line of Credit
3. **Git Push Policy**:
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

## 📋 Track 1: Refinance Track (`TT-REF`)

### 1.1 Discovery Question Sequence (`RQ14`–`RQ29`)
* **`RQ14` (Goal)**: Rate savings, paying off faster, cash-out equity, or fixed-rate stability.
* **`RQ-LOANTYPE` (Current Loan Type)**: Conventional (`CONV-REF`), FHA (`FHA-REF`), VA (`VA-REF`), or USDA (`USDA-REF`).
* **`RQ21` (Current Rate)**: Approximate existing mortgage interest rate.
* **`RQ22` (Mortgage Balance)**: Approximate remaining balance on current loan.
* **`RQ23` (Home Value)**: Estimated current market value of the property.
* **`RQ24` (Current Monthly Payment)**: Current monthly mortgage payment (PITIA baseline).
* **`RQ25` (Remaining Term)**: Years left on current loan.
* **`RQ-CLOSINGCOSTS`**: Pay closing costs out of pocket vs. roll into new loan amount.
* **`RQ26` / `RQ27` (Cash-Out Intent)**:
  * If Rate-and-Term: Sets `refinance_type = 'rate_term'`.
  * If Cash-Out: Captures desired cash-out amount (`cash_out_amount`) and intended use.
  * Handles `RQ27-MAXOUT` variant when user says *"as much as I can get"*.
* **`RQ-EMPLOYER`**: Employer name capture + gross annual income (`RQ-INCOME`) & debts (`RQ-DEBTS`).
* **Track Guards**:
  - `Q40` (realtor) and `Q43` (military/rural purchase question) are suppressed in `TT-REF`.

### 1.2 Stage 2.5 Affordability Panel Modes for Refinance
* **Rate & Term Mode (`refiRT`)**:
  - **Inputs**: Property Value (`homeValue`), Existing Balance (`payoff`), New Interest Rate, Loan Term (15-yr / 30-yr).
  - **Outputs**: New PITIA, **Monthly Savings Delta** (`currentPayment - newPITIA`), LTV, Front-End & Back-End DTI.
* **Cash-Out Mode (`refiCO`)**:
  - **Inputs**: Property Value (`homeValue`), Existing Balance (`payoff`), Desired Cash-Out (`cashOut`), New Interest Rate.
  - **Outputs**: Total New Loan Amount (`payoff + cashOut`), Total Monthly Payment, Cash-to-Borrower, LTV (capped at 80% guideline), DTI.

### 1.3 Findings Delivery
* **`RFD1` (Conditional Eligibility)**: Announces estimated payment range / savings on screen (no pre-qualification letter).
* **`RFD2` (Refer)**: Warm educational escalation to human loan officer.

---

## 📋 Track 2: HELOC Track (`TT-HEL`)

### 2.1 Discovery Question Sequence (`HQ14`–`HQ26`)
* **`HQ14` (HELOC Mechanics)**: Explanation of 10-year draw period vs. 15–20 year repayment period.
* **`HQ15` (Common Uses)**: Renovation, debt consolidation, emergency liquidity, education.
* **`HQ16` (Mandatory Risk Disclosure)**: Variable interest rate and home foreclosure collateral risk.
* **`HQ20` (Home Value)**: Estimated current market value of the property.
* **`HQ21` (Existing 1st Mortgage Balance)**: Balance owed on existing mortgage(s) to calculate Combined LTV (CLTV).
* **`HQ22` (Desired Line Amount)**: Target equity line of credit size.
* **`HQ23` (Draw Purpose)**: Renovation, consolidation, or emergency cushion.
* **`HQ24` (Rate Comfort)**: Variable rate vs. fixed-rate preference.
* **Income & Debts**: Gross annual income and recurring monthly debt obligations.

### 2.2 Stage 2.5 Affordability Panel Mode for HELOC (`heloc`)
* **Combined Loan-to-Value (CLTV) Engine**:
  $$\text{Maximum Available Credit Line} = (\text{Home Value} \times \text{Max CLTV [80\%–90\%]}) - \text{1st Mortgage Balance}$$
* **Payment Modeling**:
  - **Draw Period Payment**: Interest-only monthly payment on drawn balance.
  - **Repayment Period Payment**: Fully amortizing Principal + Interest payment.
  - Front-End and Back-End DTI evaluations.

### 2.3 Findings Delivery
* **`HFD1` (Conditional Credit Line Approval)**: Displays estimated available credit line on screen.
* **`HFD2` (Refer)**: Warm educational escalation to human loan officer.

---

## 🛠️ Step-by-Step Implementation Tasks

### Step 1: Stage 1 Transaction Routing (`Q9`)
* Files: [`backend/src/prompts/stage1-greeting.ts`](file:///c:/Users/SOHAIL/Downloads/ConvergentAI/backend/src/prompts/stage1-greeting.ts), [`backend/src/context/session-context-manager.ts`](file:///c:/Users/SOHAIL/Downloads/ConvergentAI/backend/src/context/session-context-manager.ts)
* Detect borrower intent on `Q9`:
  - Purchase triggers $\rightarrow$ `transaction_type = 'TT-PUR'`
  - Refinance triggers $\rightarrow$ `transaction_type = 'TT-REF'`
  - HELOC / Home Equity triggers $\rightarrow$ `transaction_type = 'TT-HEL'`

### Step 2: Dedicated Stage 2 Modules & State Machine
* Files:
  - Create/Update [`backend/src/prompts/stage2-refinance.ts`](file:///c:/Users/SOHAIL/Downloads/ConvergentAI/backend/src/prompts/stage2-refinance.ts) (`RQ14`–`RQ29`)
  - Create/Update [`backend/src/prompts/stage2-heloc.ts`](file:///c:/Users/SOHAIL/Downloads/ConvergentAI/backend/src/prompts/stage2-heloc.ts) (`HQ14`–`HQ26`)
  - Update [`backend/src/context/session-context-manager.ts`](file:///c:/Users/SOHAIL/Downloads/ConvergentAI/backend/src/context/session-context-manager.ts) to track `refinance_type`, `property_value`, `first_mortgage_balance`, `cash_out_amount`, `heloc_line_amount`.

### Step 3: Dynamic Affordability Panel Binding in UI
* File: [`src/components/floating-cta/index.tsx`](file:///c:/Users/SOHAIL/Downloads/ConvergentAI/src/components/floating-cta/index.tsx)
* Replace hardcoded `transactionType="TT-PUR"` with dynamic resolution:
  ```tsx
  const apTransactionType = 
    borrowerProfile?.transaction_type ||
    (borrowerProfile?.mortgage_goal === 'refinance' ? 'TT-REF' :
     borrowerProfile?.mortgage_goal === 'equity' || borrowerProfile?.mortgage_goal === 'heloc' ? 'TT-HEL' :
     'TT-PUR');
  ```
* Bind initial assumptions for Refinance (`homeValue`, `payoff`, `cashOut`) and HELOC (`homeValue`, `firstBalance`, `lineAmount`) into [`AffordabilityPanelNew`](file:///c:/Users/SOHAIL/Downloads/ConvergentAI/src/components/affordability-panel-new.tsx).

### Step 4: Findings Delivery & Handoff Integration
* Connect `RFD1`/`RFD2` (Refinance) and `HFD1`/`HFD2` (HELOC) into Stage 3/4 findings delivery and Stage 5 loan officer handoff.

### Step 5: Full Verification Across All 3 Tracks
* **Purchase (`TT-PUR`)**: Verify existing flow remains 100% stable with zero regressions.
* **Refinance (`TT-REF`)**: Test Rate-and-Term and Cash-Out end-to-end.
* **HELOC (`TT-HEL`)**: Test HELOC equity discovery and credit line panel end-to-end.
* Run `npx tsc --noEmit` on both frontend and backend.

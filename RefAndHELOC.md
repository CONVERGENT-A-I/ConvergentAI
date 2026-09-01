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
│ PHASE 1: Stage 1 Multi-Track Intent Routing (TT-PUR, TT-REF, TT-HEL)       ✅ COMPLETE │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 2: Stage 2 Conversational Discovery Prompts & State Machine           ✅ COMPLETE │
│          (with confirmed gaps — see Gap Analysis section below)                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 3: Stage 2.5 Dynamic Affordability Panel Binding                      ✅ COMPLETE │
│          (with confirmed gaps — see Gap Analysis section below)                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 4: Stage 3/4 Findings Delivery (RFD1/2, HFD1/2) & LO Handoff         ⏳ PENDING  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 5: End-to-End Regression & Quality Assurance Testing                  ⏳ PENDING  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 🔹 PHASE 1: Stage 1 Multi-Track Intent Routing (✅ COMPLETE)

#### Objective
Ensure that on the very first question (`Q9`), Ailana correctly classifies borrower intent and locks the session state machine to the correct track:
- *"I want to buy a new home"* → `transaction_type = 'TT-PUR'` (sets `mortgage_goal = 'purchase'`)
- *"I want to refinance my current mortgage"* → `transaction_type = 'TT-REF'` (sets `mortgage_goal = 'refinance'`)
- *"I want to tap my equity with a HELOC"* → `transaction_type = 'TT-HEL'` (sets `mortgage_goal = 'heloc'`)

#### Status
- ✅ **`BorrowerProfile` updated in `layer3-context.ts`** with `transaction_type: 'TT-PUR' | 'TT-REF' | 'TT-HEL' | ...`.
- ✅ **`session-context-manager.ts` updated** with intent classification for all 3 goals.
- ✅ **`stage1-greeting.ts` updated** with natural track acknowledgments.
- ✅ **TypeScript compilation**: 0 errors on both frontend and backend.

#### How to Test Phase 1
1. Start session, say `I want to refinance my mortgage.` → Confirm Ailana answers: *"Got it — let's take a look at your refinance options."* Check backend logs for `transaction_type: TT-REF`.
2. Start session, say `I want a home equity line of credit.` → Confirm Ailana answers: *"A home equity line of credit is a great way to put your equity to work."* Check backend logs for `transaction_type: TT-HEL`.
3. Start session, say `I want to buy a home.` → Confirm Purchase track continues normally.

---

### 🔹 PHASE 2: Stage 2 Conversational Discovery Prompts & Field Extraction (✅ COMPLETE — with gaps)

#### Objective
Refactor and isolate Stage 2 question flows for Refinance (`RQ14–RQ29`) and HELOC (`HQ14–HQ26`), matching the v8.7 specification without touching or disrupting the purchase flow.

#### Status
- ✅ **Created `backend/src/prompts/stage2-refinance.ts`** (`RQ14–RQ29`):
  - Refinance intent (`rate_term` vs `cash_out`), estimated market value, remaining balance, current rate, monthly payment baseline, current loan type (Conventional, FHA, VA, USDA), remaining term in years, closing costs preference (out-of-pocket vs. rolled-in), cash-out amount, and employer/job tenure.
- ✅ **Created `backend/src/prompts/stage2-heloc.ts`** (`HQ14–HQ26`):
  - HELOC mechanics (10-yr draw vs. repayment), mandatory variable rate & foreclosure risk disclosure (`HQ16`), home value, 1st mortgage balance, requested credit line amount, draw use, and employer/job tenure.
- ✅ **Updated `backend/src/prompts/ailana-system.ts`**:
  - Dynamically dispatches the right Stage 2 prompt module based on `profile.transaction_type` / `profile.mortgage_goal`.
- ✅ **Updated `backend/src/context/session-context-manager.ts`**:
  - Added deterministic extraction, validation, and state machine sequencing for all Refinance and HELOC fields.
- ✅ **Created Dedicated Test Suites**:
  - `refinance-flow.test.ts` (100% Passed)
  - `heloc-flow.test.ts` (100% Passed)
  - Full suite `npm test` passing with 100% success across all 10 test files.

#### How to Test Phase 2
1. Test Refinance conversation flow following Track 2 in `NewConversationGuide.md`. Verify all numbers are extracted cleanly into `profile`.
2. Test HELOC conversation flow following Track 3 in `NewConversationGuide.md`. Verify risk disclosure is delivered and line amount extracted cleanly.

---

### 🔹 PHASE 3: Stage 2.5 Dynamic Affordability Panel Binding (✅ COMPLETE — with gaps)

#### Objective
Connect the extracted Refinance and HELOC profile data into `AffordabilityPanelNew` on the frontend.

#### Status
- ✅ **Updated `src/components/floating-cta/index.tsx`**:
  - Dynamically derives `transactionType` (`TT-PUR` / `TT-REF` / `TT-HEL`) from `borrowerProfile.transaction_type` / `mortgage_goal`.
  - Derives `cashOutIntent` from `borrowerProfile.refinance_type === 'cash_out'` to distinguish `refiRT` vs `refiCO`.
  - Builds mode-appropriate `initialAssumptions` (purchase, refiRT, refiCO, or heloc) from profile fields.
  - Updates panel header labels: "Affordability Summary" / "Refinance Summary" / "Cash-Out Refinance Summary" / "HELOC Summary" (both desktop inline + mobile modal).
- ✅ **Updated `src/components/floating-cta/affordability-modal.tsx`**:
  - Same dynamic derivation applied to the standalone modal component.
- ✅ **TypeScript compilation**: 0 source errors on both frontend and backend.
- ✅ **Backend test suite**: All 10 test files passed (100% — zero regressions).

#### Files to Touch
* `src/components/floating-cta/index.tsx`:
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

### 🔹 PHASE 4: Findings Delivery & Loan Officer Handoff (✅ COMPLETE)

#### Objective
Tailor the Stage 3/4 findings scripts and Stage 5 loan officer handoff for Refinance (`RFD1`/`RFD2`) and HELOC (`HFD1`/`HFD2`).

#### Status
- ✅ **Updated [`backend/src/prompts/stage25-affordability.ts`](file:///c:/Users/SOHAIL/Downloads/ConvergentAI/backend/src/prompts/stage25-affordability.ts)**:
  - Dynamically renders `RFD1` and `RFD2` for `TT-REF`.
  - Dynamically renders `HFD1` and `HFD2` for `TT-HEL` and `TT-HEQ`.
  - Dynamically renders `FD1` and `FD2` for `TT-PUR`.
  - Added `RFD-LOADING` / `FD-LOADING` (>10-15s processing delay formulation).
- ✅ **Updated [`backend/src/prompts/stage4-underwriting.ts`](file:///c:/Users/SOHAIL/Downloads/ConvergentAI/backend/src/prompts/stage4-underwriting.ts)**:
  - Added track-aware underwriting outcome dispatch with `RFD1`/`RFD2` and `HFD1`/`HFD2`.
- ✅ **Updated [`backend/src/agent.ts`](file:///c:/Users/SOHAIL/Downloads/ConvergentAI/backend/src/agent.ts)**:
  - Updated 0ms verbal submit fast-path with personalized borrower name and track-aware formulations (`RFD1`, `HFD1`, `FD1`).
- ✅ **Compliance Verification**:
  - Gated pre-qualification letter email generation exclusively to `TT-PUR` (Refinance and HELOC findings are delivered on-screen without pre-qual letters per Compliance Item 11).
- ✅ **Automated Tests**:
  - `stage3-prompts-findings.test.ts` (100% Passed)
  - `refinance-flow.test.ts` (100% Passed)
  - `heloc-flow.test.ts` (100% Passed)
  - All 10 test suites in `npm test` passing with 100% success.

#### How to Test Phase 4
1. Click/Say `Submit for review` on a Refinance scenario → Confirm `RFD1` conditional eligibility delivery.
2. Click/Say `Submit for review` on a HELOC scenario → Confirm `HFD1` credit line eligibility delivery.
3. Verbally request loan officer handoff → Confirm automatic SIP queue and call handoff.

---

### 🔹 PHASE 5: Regression & Quality Assurance Testing (⏳ PENDING)

#### Objective
Perform full end-to-end regression testing across all 3 tracks to ensure 100% stability.

#### Verification Suite
* **Home Purchase Track (`TT-PUR`)**: Run complete flow with Path A (Verified) and Path B (Stated).
* **Refinance Track (`TT-REF`)**: Run Rate & Term and Cash-Out.
* **HELOC Track (`TT-HEL`)**: Run Equity Line discovery and panel.
* **TypeScript Check**: Run `npx tsc --noEmit` on both frontend and backend.

---

## 🐛 Confirmed Gap Analysis (Post Phase 1–3 Review)

> Gaps confirmed by cross-referencing the v8.7 master spec against the actual implementation files. All must be resolved before Phase 5 QA.

---

### GAP-1 — HELOC HQ19 Repayment Transition Disclosure Missing
**Severity: 🔴 HIGH — Compliance Item 30**
**File:** `backend/src/prompts/stage2-heloc.ts`

The draw-period-to-repayment payment shock warning (HQ19) is a **proactive compliance requirement** — it must be delivered as part of normal Stage 2 discovery flow, not only if the borrower asks. The current field sequence jumps directly from the risk disclosure (`heloc_risk_acknowledged`) to data collection with no mention of the repayment transition payment increase.

**Fix:** Add `heloc_repayment_transition_acknowledged` field after `heloc_risk_acknowledged` with this mandatory wording:
> *"When the draw period ends — typically after 10 years — the repayment period begins and your monthly payment will increase to cover both principal and interest on whatever balance remains. This can be a significant payment increase, especially if you've only been paying interest. It is one of the most important things to plan for — does this change anything about how you're thinking about a HELOC?"*

---

### GAP-2 — Refinance Loan-Type Sub-Tracks Not Implemented
**Severity: 🔴 HIGH — Compliance Item 26 (USDA cash-out prohibition)**
**Files:** `backend/src/prompts/stage2-refinance.ts`, `backend/src/context/session-context-manager.ts`

The master spec requires that once `current_mortgage_type` is captured, the agent activates the correct sub-track and delivers a brief overview:
- **VA loan** → deliver `VA-REF-OVERVIEW` → ask IRRRL vs Cash-Out
- **FHA loan** → deliver `FHA-REF-OVERVIEW` → ask Streamline vs Rate-Term vs Cash-Out
- **USDA loan** → deliver `USDA-REF-OVERVIEW` → **explicitly state: cash-out is NOT available** on USDA
- **Conventional** → deliver `CONV-REF-OVERVIEW`

Currently `current_mortgage_type` is collected but nothing branches on it. A USDA borrower requesting cash-out will never be told it's prohibited — a Compliance Item 27 violation.

**Fix:** After `current_mortgage_type` extraction in `session-context-manager.ts`, set a `refinance_subtrack` field and inject the correct overview block into Stage 2 prompt rendering.

---

### GAP-3 — `refinance_type` Asked Before Loan Type Is Known (Field Order Bug)
**Severity: 🟡 MEDIUM**
**File:** `backend/src/prompts/stage2-refinance.ts`

The current sequence asks `refinance_type` (cash-out vs rate-term) as field **#4**, but `current_mortgage_type` isn't asked until field **#9**. Per the v8.5 routing rule, the sub-track overview determines `refinance_type` — RQ26 should only fire standalone if loan type is `unknown`.

**Fix — Corrected field sequence:**
```
1. gross_annual_income
2. monthly_debt
3. credit_range
4. current_mortgage_type  ← MOVED UP (triggers sub-track overview which captures intent)
5. refinance_type         ← Only if loan type is unknown/general track
6. property_value
7. first_mortgage_balance
8. current_mortgage_rate
9. current_mortgage_payment
10. remaining_term_years
11. closing_costs_preference
12. cash_out_amount       ← Only if cash-out
13. job_tenure_type
```

---

### GAP-4 — HELOC HQ24 (Variable Rate Comfort / TT-HEQ Gate) Missing
**Severity: 🟡 MEDIUM**
**File:** `backend/src/prompts/stage2-heloc.ts`

The master spec (Section H-2B, HQ24) requires:
> *"Are you comfortable with a variable interest rate, or is payment predictability important to you?"*

If the borrower strongly prefers fixed rates, Ailana must introduce the home equity loan comparison and offer to switch to `TT-HEQ`. This question is entirely absent from the HELOC field sequence.

**Fix:** Add `heloc_rate_comfort` field between `heloc_line_amount` and `heloc_draw_use`. If the extracted response indicates strong fixed-rate preference, trigger the TT-HEQ equity disambiguation flow.

---

### GAP-5 — HELOC HQ25 and HQ26 Missing From Field Sequence
**Severity: 🟡 MEDIUM**
**File:** `backend/src/prompts/stage2-heloc.ts`

Two data-collection questions from the master spec (Section H-2B) are absent:
- **HQ25**: *"Have you had a HELOC on this property before?"* — surfaces prior equity lines and seasoning context.
- **HQ26**: *"How quickly are you hoping to access the funds?"* — timeline awareness (HELOC approval takes 2–6 weeks).

**Fix:** Add `heloc_prior_history` and `heloc_timeline` fields to the sequence before `job_tenure_type`.

---

### GAP-6 — Equity Disambiguation (TT-HEL vs TT-HEQ) Not Implemented
**Severity: 🟡 MEDIUM**
**File:** `backend/src/context/session-context-manager.ts`

The master spec (Section 0) requires: when intent is general equity access without HELOC-specific language, Ailana must ask whether the borrower wants a HELOC (revolving line) or a home equity loan (fixed lump sum) before routing.

Currently, the classifier maps any equity/HELOC keyword directly to `TT-HEL`. `TT-HEQ` is defined in `layer3-context.ts` but **is completely unreachable** — no code path ever sets it.

**Fix:** Add an `equity_ambiguous` intermediate `mortgage_goal` state. When active in Stage 1, inject the disambiguation question and hold Stage 1 open until the borrower chooses HELOC or Home Equity Loan, then route accordingly.

---

### GAP-7 — Profile Propagation Verification in `stage25-affordability.ts` Q46
**Severity: 🟢 LOW**
**File:** `backend/src/prompts/stage25-affordability.ts`, Line 24

Q46 was updated to use `${profile.borrower_name || 'there'}`. Since this is inside the outer template literal of `buildStage25Instructions`, it should evaluate at runtime. However, verification is needed that `buildStage25Instructions(profile)` in `ailana-system.ts` is always called with a fully populated profile and not the default empty `{}`. If profile is empty, the agent will say *"there"* instead of the borrower's name.

**Fix:** Confirm that `buildLayer2(stage, profile)` in `ailana-system.ts` propagates the populated profile into `buildStage25Instructions(profile)` at stage `'2.5'`.

---

### GAP-8 — Phase 4 Findings Delivery Entirely Missing
**Severity: 🔴 HIGH**
**File:** `backend/src/prompts/stage4-underwriting.ts`

The file contains only generic purchase-track AUS scripts with no branching on `profile.transaction_type`. When `TT-REF` or `TT-HEL` borrowers reach Stage 4, they receive the purchase-track *"Excellent news! The system has returned a conditional approval for your loan application"* script — not `RFD1`/`HFD1`.

**Fix:** See Phase 4 Specific Implementation Requirements above.

---

### GAP-9 — 80% LTV Ceiling Not Enforced on Cash-Out Panel (`refiCO`)
**Severity: 🟡 MEDIUM — Compliance accuracy**
**File:** `src/components/affordability-panel-new.tsx`

The panel calculates `loanAmt = payoff + cashOut` without enforcing the 80% LTV cap required by the master spec (CONV-REF-CASHOUT):
> *"maximum cash payout = appraised value × 80% − current mortgage payoff − closing costs"*

Currently a borrower can set `cashOut` to any amount — the LTV gauge turns amber but **no cap is applied and no explanatory warning is shown** distinguishing "LTV is high" from "this amount exceeds the conventional 80% limit." The Phase 3 test plan says *"checks the 80% LTV ceiling"* — this test would fail against the current code.

**Fix:** In the `refiCO` calc block, add:
```ts
const maxLoanAt80 = a.homeValue * 0.80;
const maxCashOut = Math.max(0, maxLoanAt80 - a.payoff);
const effectiveCashOut = Math.min(a.cashOut, maxCashOut);
```
Surface a warning line in the panel when `a.cashOut > maxCashOut`: *"Cash-out capped at 80% LTV limit — max available: $X"*

---

### GAP-10 — HELOC Repayment Period Payment Not Calculated or Displayed
**Severity: 🟢 LOW — Consumer disclosure**
**File:** `src/components/affordability-panel-new.tsx`

The HELOC panel shows only the **draw period** interest-only payment. It does not calculate or display the **repayment period payment** (principal + interest once the draw period ends after 10 years). This connects directly to GAP-1 (HQ19 mandatory disclosure) — the spec emphasizes this payment shock is a material consumer risk.

**Fix (deferred):** Add a secondary display line showing estimated repayment period payment: `monthlyPI(lineAmount, drawRate, 20)`. Label it clearly as *"After draw period (yr 11+): ~$X/mo P&I"*. This reinforces the HQ19 disclosure visually.

---

### GAP-11 — VA Funding Fee Hardcoded at 2.15% (First-Use Only)
**Severity: 🟢 LOW — Accuracy for returning VA borrowers**
**File:** `src/components/affordability-panel-new.tsx` L188

The panel hardcodes `upfrontFeePct: 2.15` for all VA borrowers. The master spec (VA-REF-CASHOUT) states:
> *"VA Funding Fee of 2.15% for first-time use or 3.3% for subsequent use"*

A VA borrower doing a subsequent cash-out refinance would see a funding fee 1.15% lower than reality, understating their loan amount by roughly $5,750 on a $500K loan.

**Fix:** Add a `vaSubsequentUse?: boolean` prop or infer from profile. Update the VA program config:
```ts
upfrontFeePct: profile.va_subsequent_use ? 3.3 : 2.15,
```

---

## 📊 Gap Summary Table

| ID | Description | Severity | Phase | Status |
|---|---|---|---|---|
| GAP-1 | HELOC HQ19 repayment transition disclosure missing | 🔴 HIGH | Phase 2 | ✅ Resolved |
| GAP-2 | Refi loan-type sub-tracks (VA/FHA/USDA/Conv) not implemented | 🔴 HIGH | Phase 2 | ✅ Resolved |
| GAP-3 | `refinance_type` asked before `current_mortgage_type` (wrong order) | 🟡 MEDIUM | Phase 2 | ✅ Resolved |
| GAP-4 | HELOC HQ24 (variable rate comfort / TT-HEQ gate) missing | 🟡 MEDIUM | Phase 2 | ✅ Resolved |
| GAP-5 | HELOC HQ25 & HQ26 missing from field sequence | 🟡 MEDIUM | Phase 2 | ✅ Resolved |
| GAP-6 | No equity disambiguation for TT-HEL vs TT-HEQ | 🟡 MEDIUM | Phase 1 | ✅ Resolved |
| GAP-7 | Profile propagation check for Q46 borrower name in `stage25-affordability.ts` | 🟢 LOW | Phase 3 | ✅ Resolved |
| GAP-8 | Phase 4 findings delivery (RFD1/2, HFD1/2, RFD-LOADING) missing | 🔴 HIGH | Phase 4 | ⏳ Pending (Phase 4) |
| GAP-9 | 80% LTV ceiling not enforced on cash-out panel (`refiCO`) | 🟡 MEDIUM | Phase 3 | ✅ Resolved |
| GAP-10 | HELOC repayment period payment (post–draw) not calculated or displayed | 🟢 LOW | Phase 3 | ✅ Resolved |
| GAP-11 | VA funding fee hardcoded at 2.15%; 3.3% subsequent-use not handled | 🟢 LOW | Phase 3 | ✅ Resolved |

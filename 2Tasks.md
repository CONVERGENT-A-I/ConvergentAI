# 2Tasks.md — Project Roadmap & Implementation Plan

This document outlines the implementation plan, current progress, architecture, and execution steps for **Task 1** and **Task 2** as requested.

---

## 📋 Task Overview

| Task | Title | Scope | Git Push Policy |
|---|---|---|---|
| **Task 1** | **Loan Officer Transfer Prompt Wording Revision** | Refine Ailana's verbal prompts when offering and executing the loan officer handoff. Remove any "Wait" or informal prefixes. Record video demonstration. | **Send video to client first $\rightarrow$ Push to GitHub ONLY after client confirmation.** |
| **Task 2** | **HELOC & Refinance Flow Integration (v8.7)** | Implement complete HELOC (`TT-HEL`) and Refinance (`TT-REF`) conversational discovery, dynamic affordability panels, and findings alongside Purchase (`TT-PUR`). | **Implement and test locally $\rightarrow$ DO NOT push to GitHub.** |

---

# 🔷 TASK 1: Loan Officer Transfer Prompt Wording Polish

### 1.1 Client Feedback & Goal
> *"The prompt message for connecting to a loan officer needs to be revised. Previously Ailana would say 'would you like to be connected to a loan officer now, or would you prefer a call back.' ... Now, Ailana is saying 'Wait', and then a message. I will capture the exact verbiage and provide correction."*

**Goal**: Standardize and polish all verbal formulations surrounding the Loan Officer handoff so Ailana speaks with professional, warm, credit-union advisory tone without any hesitation or awkward words like "Wait".

---

### 1.2 Current Progress & Code Audit

* ✅ **Voice Trigger Engine**: Live voice intent matcher in `backend/src/agent.ts` detects *"Yes, connect me"*, *"Transfer to loan officer"*, *"Speak with an officer"*, etc.
* ✅ **SIP Telephony Bridge**: `backend/src/utils/sipTransfer.ts` dials SignalWire PBX (`FSPBX 9400`) and bridges audio.
* ✅ **UI Auto-Handoff**: Frontend receives `SYSTEM_TRIGGER_MLO_TRANSFER` and smoothly displays the Queue & Live Call screen.
* ✅ **Call Ending Screen**: Perfectly centered post-call summary card with "Return to Ailana" session resumption.
* ⚠️ **Wording to Refine**:
  1. **Offering the Connection (Stage 4 / 5 Transition)**:
     - *Standard wording*: `"Your scenario is ready. Your licensed loan officer will walk you through next steps — would you like to be connected to a licensed loan officer now, or would you prefer a callback?"`
  2. **Executing the Live Handoff (Fast-Path verbal bridge)**:
     - *Standard wording*: `"Connecting you with a licensed loan officer now — one moment please."` (Clean, immediate, zero "Wait" or hesitation).
  3. **Returning from Call (Welcome back)**:
     - *Standard wording*: `"Welcome back! I hope your conversation with the loan officer was helpful. Do you have any follow-up questions for me or anything else you would like to explore?"`

---

### 1.3 Files to Modify for Task 1

1. **[`backend/src/prompts/stage5-escalation.ts`](file:///c:/Users/SOHAIL/Downloads/ConvergentAI/backend/src/prompts/stage5-escalation.ts)**:
   - Ensure clean phrasing for both live transfer and callback offers without "Wait".
2. **[`backend/src/agent.ts`](file:///c:/Users/SOHAIL/Downloads/ConvergentAI/backend/src/agent.ts)**:
   - Refine the fast-path verbatim stream text (`scriptText`) to exact professional credit-union standard.
3. **[`backend/src/prompts/ailana-system.ts`](file:///c:/Users/SOHAIL/Downloads/ConvergentAI/backend/src/prompts/ailana-system.ts)**:
   - Ensure `RESUME_USER_INPUT` prompt is crisp and natural when returning from the MLO call.

---

### 1.4 Task 1 Verification & Client Video Delivery

1. Run full voice test from start to Stage 5 escalation.
2. Trigger the loan officer handoff verbally (*"Yes, please connect me to a loan officer"*).
3. Verify clean, prompt delivery with zero "Wait" verbiage.
4. Record high-definition video of the end-to-end flow (Offer $\rightarrow$ Voice Trigger $\rightarrow$ Queue $\rightarrow$ In-Call $\rightarrow$ Ending Screen $\rightarrow$ Return to Ailana).
5. Share video with the client.
6. **Push to GitHub repository only upon explicit client approval.**

---

# 🔶 TASK 2: HELOC & Refinance Flow Integration (v8.7)

### 2.1 Scope & Reference Spec
Reference: Master Consolidated Prompt Reference **v8.7** in [`Affordability_Panel_AND_UPDATED_PROMPT.md`](file:///c:/Users/SOHAIL/Downloads/ConvergentAI/Affordability_Panel_AND_UPDATED_PROMPT.md).

The system will fully support three primary transaction tracks with 100% flow completeness:
1. **Home Purchase Mortgage (`TT-PUR`)** — *Existing & must remain 100% unaffected.*
2. **Refinance Track (`TT-REF`)** — Rate & Term (`refiRT`) and Cash-Out (`refiCO`).
3. **Home Equity Line of Credit (`TT-HEL`)** — Equity draw & line calculation (`heloc`).

---

### 2.2 Current Progress & Architecture Assets

* ✅ **Affordability Engine Ready**: [`src/components/affordability-panel-new.tsx`](file:///c:/Users/SOHAIL/Downloads/ConvergentAI/src/components/affordability-panel-new.tsx) already contains the mathematical calculations, slider models, and state types for:
  - `purchase` (Target Price, Down Payment %, Interest Rate, HOA, Loan Term)
  - `refiRT` (Estimated Property Value, Current Mortgage Balance, New Rate, Term)
  - `refiCO` (Estimated Property Value, Current Balance, Cash-Out Amount, New Rate)
  - `heloc` (Estimated Home Value, 1st Mortgage Balance, Line Amount, Draw Rate)
* ✅ **State Schema Ready**: `BorrowerProfile` in `layer3-context.ts` contains `mortgage_goal`, `refinance_type`, `property_value`, `first_mortgage_balance`, `cash_out_amount`, `heloc_line_amount`.
* ⚠️ **Items to Implement**:
  - Intent classification & routing in Stage 1 (`Q9`).
  - Discovery question sequences for Refinance (`RQ14-RQ65`) and HELOC (`HQ14-HQ55`).
  - Dynamic prop binding in [`src/components/floating-cta/index.tsx`](file:///c:/Users/SOHAIL/Downloads/ConvergentAI/src/components/floating-cta/index.tsx) (passing `transactionType="TT-REF"` or `"TT-HEL"` and mapped values to `AffordabilityPanelNew`).
  - Underwriting findings delivery tailored to Refinance and HELOC outcomes.

---

### 2.3 Step-by-Step Implementation Plan for Task 2

#### Step 2.1: Stage 1 Transaction Intent Disambiguation
* In [`backend/src/prompts/stage1-greeting.ts`](file:///c:/Users/SOHAIL/Downloads/ConvergentAI/backend/src/prompts/stage1-greeting.ts) and [`backend/src/context/session-context-manager.ts`](file:///c:/Users/SOHAIL/Downloads/ConvergentAI/backend/src/context/session-context-manager.ts):
  - On user intent:
    - Purchase phrases $\rightarrow$ `TT-PUR` (activates Stage 2 Purchase).
    - Refinance phrases $\rightarrow$ `TT-REF` (activates Stage 2 Refinance).
    - HELOC / Home Equity phrases $\rightarrow$ `TT-HEL` (activates Stage 2 HELOC).

#### Step 2.2: Stage 2 Question Sequences for Refi & HELOC
* **Refinance Track (`TT-REF`)**:
  - `RQ14`: Property type & current occupancy (Primary residence / Investment).
  - `RQ15`: Estimated current home value.
  - `RQ16`: Current 1st mortgage balance.
  - `RQ17`: Refinance goal (Lower payment/rate vs. Cash-out).
  - `RQ18`: If Cash-Out: desired cash-out amount.
  - `RQ19`: Gross annual income.
  - `RQ20`: Recurring monthly debts.
  - `RQ21`: Credit score range.
  - `RQ22`: Current mortgage type (Conventional, FHA, VA, USDA).
* **HELOC Track (`TT-HEL`)**:
  - `HQ14`: Estimated property value.
  - `HQ15`: Existing 1st mortgage balance.
  - `HQ16`: Desired equity line amount or primary use (renovation, consolidation, emergency fund).
  - `HQ17`: Gross annual income.
  - `HQ18`: Monthly debt obligations.
  - `HQ19`: Credit score range.

#### Step 2.3: Stage 2.5 Affordability Panel Dynamic Binding
* In [`src/components/floating-cta/index.tsx`](file:///c:/Users/SOHAIL/Downloads/ConvergentAI/src/components/floating-cta/index.tsx):
  - Map `borrowerProfile` to `AffordabilityPanelNew`:
    ```tsx
    const apTransactionType = 
      borrowerProfile?.mortgage_goal === 'refinance' ? 'TT-REF' :
      borrowerProfile?.mortgage_goal === 'equity' || borrowerProfile?.mortgage_goal === 'heloc' ? 'TT-HEL' :
      'TT-PUR';
    ```
  - Map initial assumptions:
    - For `TT-REF`: `homeValue: profile.property_value`, `payoff: profile.first_mortgage_balance`, `cashOut: profile.cash_out_amount`.
    - For `TT-HEL`: `homeValue: profile.property_value`, `firstBalance: profile.first_mortgage_balance`, `lineAmount: profile.heloc_line_amount`.

#### Step 2.4: Regression Testing & Guardrails
* Run complete regression test for **Home Purchase Mortgage** to ensure zero breakage.
* Test **Rate & Term Refinance** path end-to-end.
* Test **Cash-Out Refinance** path end-to-end.
* Test **HELOC** path end-to-end.
* Verify TypeScript compilation (`npx tsc --noEmit`) on both frontend and backend.
* **DO NOT push to GitHub repo (keep local as instructed).**

---

## 📅 Summary of Execution Rules

```
Task 1:
├── Refine wording in stage5-escalation.ts & agent.ts
├── Test & Record Video Demonstration
├── Send Video to Client
└── Push to GitHub ONLY after Client Confirms

Task 2:
├── Implement HELOC & Refinance flows (prompts, context manager, panel binding)
├── Thoroughly test all 3 tracks (Purchase, Refi, HELOC)
└── Keep changes local (DO NOT PUSH TO GITHUB)
```

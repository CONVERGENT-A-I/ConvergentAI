# Layer 0 — Easy Testing Guide

**Project:** ConvergentAI | Ailana v8.7  
**File:** `Layer0TestGuide.md`  
**Purpose:** Simple, step-by-step instructions on what to do, how to test, and how to verify that each task passes.

---

## 🚦 Overall Progress Tracker

| Task | Description | Status |
| :---: | :--- | :---: |
| **T1** | Add 15 new fields to `BorrowerProfile` | 🟢 Pass |
| **T2** | Set default state (`Q9_confirmed = false`) | 🟢 Pass |
| **T3** | Fast extraction of opening signals (<10ms) | 🟢 Pass |
| **T4** | TRID compliance gate (SSN / Address intercept) | 🟢 Pass |
| **T5** | Select Q9-MULTI Templates (A–F & General) | 🟢 Pass |
| **T6** | Standard Q9 open routing | 🟢 Pass |
| **T7** | Equity disambiguation (HELOC vs Loan) | 🟢 Pass |
| **T8** | Fallback question for unclear answers | 🟢 Pass |
| **T9** | Mixed intent handling (2 goals) | 🟢 Pass |
| **T10** | Holdout routing (Construction & Reverse Mortgages) | 🟢 Pass |
| **T11** | Stage 1 Gate in `buildLayer2()` | 🟢 Pass |
| **T12** | Create `stage0-routing.ts` prompt file | 🟢 Pass |
| **T13** | Connect Section 0 prompt into `buildLayer2()` | 🟢 Pass |
| **T14** | Add Section 0 block to Layer 3 context | 🟢 Pass |
| **T15** | Run 15 unit tests (`S0-1` to `S0-15`) | 🟢 Pass |
| **T16** | Run full test suite regression (`npm test`) | 🟢 Pass |
| **T17** | Test 9 live E2E conversations | 🟡 In Progress (Tests 1, 2, 3, 4, 5 & 6 Live Passed) |

---

## 📅 Weekly Phased Implementation Schedule (Monday – Friday)

| Day | Stage / Phase | Tasks | Focus Area | Verification Method | Status |
| :--- | :--- | :---: | :--- | :--- | :---: |
| **Day 1: Monday** | **Phase 1: Foundation** | **T1, T2** | Schema fields & zero-state initialization (`Q9_confirmed = false`). | Typecheck (`tsc`) + default state test | 🟢 COMPLETE |
| **Day 1: Monday** | **Phase 2: Extraction & Compliance** | **T3, T4** | Upgrade `extractOpeningSignals()` (<10ms) & TRID compliance gate. | Pattern matching test + TRID intercept test | 🟢 COMPLETE |
| **Day 2: Tuesday** | **Phase 3: Core Routing & Templates** | **T5 – T7** | Q9-MULTI Templates A–F & General, Q9 standard open routing, equity disambiguation (HELOC vs Loan). | Multi-signal selection test + disambiguation branch checks | 🟢 COMPLETE |
| **Day 2: Tuesday (Today)** | **Phase 3: Edge Routing & Holdouts** | **T8 – T10** | Fallback routing question, mixed intent handling (2 goals), construction (`TT-CON`) & reverse mortgage (`TT-HECM`) holdouts. | Branch isolation tests + MLO handoff check | 🟢 COMPLETE |
| **Day 3: Wednesday** | **Phase 4: Stage Gate & Prompts** | **T11 – T14** | `buildLayer2()` Stage 1 gate, create `stage0-routing.ts`, wire prompts, Layer 3 routing context block. | Prompt output tests & Stage 1 block check | 🟢 COMPLETE |
| **Day 4: Thursday** | **Phase 5: Automated Test Suite & Regression** | **T15, T16** | Full automated test suite (`S0-1` to `S0-15`), runner registration, regression suite (`npm test`). | 15/15 unit tests pass + 18 test suites pass | 🟢 COMPLETE |
| **Day 5: Friday** | **Phase 5: Live E2E Testing & Acceptance** | **T17** | 9 live E2E conversation scenarios (chat & voice UI) + David Patten final staging sign-off gate. | Live interactive verification across all tracks | 🟡 SCHEDULED (Friday, Oct 16) |

---

## ⚡ The Only 3 Commands You Need to Know

Run these inside the `backend/` folder:

1. **Check for code & type errors:**
   ```powershell
   npx tsc --noEmit
   ```
2. **Run the Section 0 unit tests:**
   ```powershell
   npx tsx src/__tests__/section0-routing.test.ts
   ```
3. **Run the entire project test suite:**
   ```powershell
   npm test
   ```

---

## 🛠️ Task-by-Task: What to Do & How to Pass

---

### PHASE 1: Foundation (Tasks 1 & 2)

#### TASK T1: Add 15 Fields to `BorrowerProfile`
* **File:** `backend/src/prompts/layer3-context.ts`
* **What to do:**  
  Add the 15 new Layer 0 fields (`Q9_confirmed`, `signals_found`, `trid_gate_fired`, etc.) to the `BorrowerProfile` interface. Keep all existing fields untouched.
* **How to test:**  
  Run: `npx tsc --noEmit`
* **How to pass:**  
  Command finishes with **0 errors**.
* **Failure sign:**  
  TypeScript complains about unknown fields or syntax errors.
* **Status:** 🟢 Pass (Verified by compilation & schema test)

---

#### TASK T2: Set Default Values in Context Manager
* **File:** `backend/src/context/session-context-manager.ts`
* **What to do:**  
  In the profile initialization function, initialize all 15 new fields.  
  👉 **CRITICAL:** `Q9_confirmed` must be set to `false`.
* **How to test:**  
  Create a new session or run: `npx tsx src/__tests__/section0-routing.test.ts` (Test S0-1).
* **How to pass:**  
  When a session starts, `profile.Q9_confirmed === false` and `profile.signals_found` is an empty list `[]`.
* **Failure sign:**  
  `Q9_confirmed` is `true` or `undefined`.
* **Status:** 🟢 Pass (Verified: Q9_confirmed = false default)

---

### PHASE 2: Extraction & Security Gate (Tasks 3 & 4)

#### TASK T3: Upgrade `extractOpeningSignals()`
* **File:** `backend/src/context/session-context-manager.ts`
* **What to do:**  
  Update `extractOpeningSignals()` with pattern checks for:
  - Intent (`buy`, `refi`, `heloc`, `equity loan`, `build`, `reverse mortgage`)
  - Details (`veteran`, `wife/husband`, `$100k income`, `$20k saved`, `condo`, city/state)
  - Speed: Pure regex only (under 10ms).
* **How to test:**  
  Pass test phrase: `"I want to buy a house and I am a veteran"`.
* **How to pass:**  
  `profile.signals_found` contains `['TT-PUR', 'veteran']`.  
  `profile.veteran_flagged` is `true`.  
  Execution takes less than 10 milliseconds.
* **Failure sign:**  
  Missing signals or execution taking longer than 15ms.
* **Status:** `[x] Pass  [ ] Pending  [ ] Fail`

---

#### TASK T4: Add TRID Security Gate
* **File:** `backend/src/context/session-context-manager.ts`
* **What to do:**  
  If the borrower includes an SSN (`123-45-6789`) or street address (`123 Main St`) in turn 1:
  - Immediately return the TRID compliance disclaimer text.
  - **Do NOT** save or echo the SSN or address.
* **How to test:**  
  Send input: `"My SSN is 123-45-6789 and I want to buy a house"`.
* **How to pass:**  
  1. Ailana responds: *"I want to make sure we handle your information correctly — for security and compliance purposes, I'm not able to collect that specific information through this channel..."*
  2. Inspect `profile`: SSN is **NOT** stored anywhere.
* **Failure sign:**  
  SSN appears in logs, profile, or response text.
* **Status:** `[x] Pass  [ ] Pending  [ ] Fail`

---

### PHASE 3: Routing Logic (Tasks 5 to 10)

#### TASK T5: Q9-MULTI Templates (A to F & General)
* **File:** `backend/src/context/session-context-manager.ts`
* **What to do:**  
  When 2 or more signals are found, pick the matching template:
  - Purchase + Veteran ➔ **Template A**
  - Purchase + Veteran + Co-borrower ➔ **Template B**
  - Purchase + Co-borrower ➔ **Template C**
  - Purchase + Financials ➔ **Template D**
  - Refi + Location ➔ **Template E**
  - Full front-load ➔ **Template F**
  - Any other multi-signal ➔ **General Template**
* **How to test:**  
  Input: `"I want to buy a home and I'm a veteran"`.
* **How to pass:**  
  Template A is selected, and `profile.Q9_MULTI_delivered` becomes `true`.
* **Failure sign:**  
  Wrong template chosen, or template re-fires on turn 2.
* **Status:** `[x] Pass  [ ] Pending  [ ] Fail`

---

#### TASK T6: Standard Q9 Open Routing
* **File:** `backend/src/context/session-context-manager.ts`
* **What to do:**  
  If borrower says something open-ended like `"I have some questions"`, ask Q9 to determine if they want Purchase, Refi, or HELOC.
* **How to test:**  
  Send: `"I have mortgage questions"`. Then reply: `"Purchase"`.
* **How to pass:**  
  - Turn 1: Ailana asks Q9.
  - Turn 2: Borrower says `"Purchase"` ➔ `profile.transaction_type = 'TT-PUR'` and `profile.Q9_confirmed = true`.
* **Failure sign:**  
  Stage 1 fires on Turn 1 before borrower answers Q9.
* **Status:** `[x] Pass  [ ] Pending  [ ] Fail`

---

#### TASK T7: Equity Disambiguation (HELOC vs Home Equity Loan)
* **File:** `backend/src/context/session-context-manager.ts`
* **What to do:**  
  If borrower says `"I want to tap my equity"` without specifying:
  - Ask if they want a line of credit (HELOC) or fixed lump sum loan.
* **How to test:**  
  Send: `"I want to access my equity"`. Then reply: `"HELOC"`.
* **How to pass:**  
  - Turn 1: Ailana asks the disambiguation question.
  - Turn 2: Borrower says `"HELOC"` ➔ `transaction_type = 'TT-HEL'` and `Q9_confirmed = true`.
* **Failure sign:**  
  System assumes HELOC automatically without asking.
* **Status:** `[x] Pass  [ ] Pending  [ ] Fail`

---

#### TASK T8: Fallback Routing Question
* **File:** `backend/src/context/session-context-manager.ts`
* **What to do:**  
  If borrower's response to Q9 is unclear (e.g. `"I don't know yet"`), ask the 3-option fallback question.
* **How to test:**  
  Send: `"I don't know what I need"`.
* **How to pass:**  
  Ailana responds: *"Are you looking to purchase a new home, refinance an existing mortgage, or access the equity you've already built?"*
* **Failure sign:**  
  System jumps into Stage 1 with no transaction type.
* **Status:** `[x] Pass  [ ] Pending  [ ] Fail` (Verified by S0-6)

---

#### TASK T9: Mixed Intent Handling
* **File:** `backend/src/context/session-context-manager.ts`
* **What to do:**  
  If borrower mentions two goals (e.g. Purchase AND Refinance):
  - Acknowledge both goals.
  - Ask which one to start with.
  - Save the second one in `secondary_intent`.
* **How to test:**  
  Send: `"I want to buy a house and refinance my current one"`.
* **How to pass:**  
  Ailana asks which to start with. When chosen, only ONE track activates, and the other is stored in `secondary_intent`.
* **Failure sign:**  
  Both tracks try to run at the same time.
* **Status:** `[x] Pass  [ ] Pending  [ ] Fail` (Verified by S0-5)

---

#### TASK T10: Holdout Routing (Construction & Reverse Mortgages)
* **File:** `backend/src/context/session-context-manager.ts`
* **What to do:**  
  If borrower says `"build a house"` (`TT-CON`) or `"reverse mortgage"` (`TT-HECM`):
  - Deliver the holdout message.
  - Transfer to a licensed loan officer.
  - **Never start Stage 1.**
* **How to test:**  
  Send: `"I want to build a house"`.
* **How to pass:**  
  Ailana offers to connect with a specialist for contact info. `transaction_type` remains null. Stage 1 does not start.
* **Failure sign:**  
  Ailana starts asking Stage 1 discovery questions.
* **Status:** `[x] Pass  [ ] Pending  [ ] Fail` (Verified by S0-7 & S0-13)

---

### PHASE 4: Stage Gate & Prompts (Tasks 11 to 14)

#### TASK T11: Implement Stage 1 Gate in `buildLayer2()`
* **File:** `backend/src/prompts/ailana-system.ts`
* **What to do:**  
  At the top of `buildLayer2()`, add:
  ```typescript
  if (!profile.Q9_confirmed) {
    return buildSection0Block(profile);
  }
  ```
* **How to test:**  
  Call `buildLayer2(profile)` with `profile.Q9_confirmed = false`.
* **How to pass:**  
  Returned prompt contains **Section 0** and does **NOT** contain Stage 1 questions.
* **Failure sign:**  
  Stage 1 questions appear in the prompt when `Q9_confirmed` is false.
* **Status:** `[x] Pass  [ ] Pending  [ ] Fail` (Verified by prompt inspection & testStage1GateAndPrompts)

---

#### TASK T12: Create `stage0-routing.ts` Prompt File
* **File:** `backend/src/prompts/stage0-routing.ts` (NEW FILE)
* **What to do:**  
  Create the file and export the Section 0 prompt text + verbatim scripts (Templates A–F, TRID disclaimer, Equity disambiguation, Holdouts).
* **How to test:**  
  Run: `npx tsc --noEmit`
* **How to pass:**  
  File compiles cleanly with no syntax errors.
* **Failure sign:**  
  TypeScript errors or missing exports.
* **Status:** `[x] Pass  [ ] Pending  [ ] Fail` (Verified: compiles cleanly & exports verified)

---

#### TASK T13: Connect Section 0 Prompt into `buildLayer2()`
* **File:** `backend/src/prompts/ailana-system.ts`
* **What to do:**  
  Implement `buildSection0Block(profile)` to return the Section 0 prompt text with current state flags (`signals_found`, `trid_gate_fired`, etc.).
* **How to test:**  
  Run: `npx tsc --noEmit`
* **How to pass:**  
  Function outputs Section 0 prompt with current profile flags included.
* **Failure sign:**  
  Returns empty string or undefined.
* **Status:** `[x] Pass  [ ] Pending  [ ] Fail` (Verified by buildSection0Block injection test)

---

#### TASK T14: Add Section 0 Block to Layer 3 Context
* **File:** `backend/src/prompts/layer3-context.ts`
* **What to do:**  
  Show the Section 0 routing summary in Layer 3 context **only** while `Q9_confirmed === false`.
* **How to test:**  
  Check prompt output before and after Q9 confirmation.
* **How to pass:**  
  - Before confirmation: Routing state block is visible to LLM.
  - After confirmation: Routing state block is hidden so it doesn't clutter Stage 1–3.
* **Failure sign:**  
  Routing block remains visible throughout the entire conversation.
* **Status:** `[x] Pass  [ ] Pending  [ ] Fail` (Verified by testLayer3Section0Context in section0-routing.test.ts)

---

### PHASE 5: Testing & Verification (Tasks 15 to 17)

#### TASK T15: Create & Run 15 Unit Tests
* **File:** `backend/src/__tests__/section0-routing.test.ts` (NEW FILE)
* **What to do:**  
  Create the test file with tests `S0-1` through `S0-15`.
* **How to test:**  
  Run: `npx tsx src/__tests__/section0-routing.test.ts`
* **How to pass:**  
  Console prints: `✅ All 15 Section 0 Unit Tests Passed! (15/15)`.
* **Failure sign:**  
  Any test prints `❌ Failed`.
* **Status:** `[x] Pass  [ ] Pending  [ ] Fail` (All 15/15 unit tests pass in `section0-routing.test.ts`)

---

#### TASK T16: Run Full Project Regression Suite
* **File:** `backend/src/__tests__/run-all-tests.ts`
* **What to do:**  
  Add `section0-routing.test.ts` to `run-all-tests.ts` and run all tests.
* **How to test:**  
  Run: `npm test`
* **How to pass:**  
  Console prints: `✨ ALL 18 CONVERGENTAI UNIT & INTEGRATION TEST SUITES PASSED!`.
* **Status:** `[x] Pass  [ ] Pending  [ ] Fail` (All 18 suites pass cleanly via `npm test`)

---

#### TASK T17: Live E2E Verification (9 Scenarios)
* **What to do:**  
  Start `npm run dev` and test the 9 conversation scenarios in the chat/voice UI.
* **How to test:**  
  Follow the simple 9-scenario checklist below.
* **How to pass:**  
  All 9 scenarios respond with correct routing, disclaimers, or holdouts.
* **Status:** `[ ] Pending (Scheduled for Friday, Oct 16)  [ ] Pass  [ ] Fail`

---

## 📋 The 15 Unit Tests Cheat Sheet (S0-1 to S0-15)

Run with: `npx tsx src/__tests__/section0-routing.test.ts`

| Test | Input Test String | What It Verifies | Pass Condition |
| :---: | :--- | :--- | :--- |
| **S0-1** | `"I have some mortgage questions"` | Default state check | `signals_found = []`, Stage 1 blocked |
| **S0-2** | `"I want to buy a house"` | Single purchase signal | `signals_found = ['TT-PUR']` |
| **S0-3** | `"My SSN is 123-45-6789 and I want to buy"` | TRID compliance | Disclaimer delivered, SSN **not** stored |
| **S0-4** | `"I want to tap into my equity"` | Equity ambiguity | Equity disambiguation question fires |
| **S0-5** | `"I want to buy a house and refinance"` | Mixed intent | Two goals split into primary/secondary |
| **S0-6** | Unclear answer to Q9 | Fallback question | Fallback 3-option question fires |
| **S0-7** | `"I want to build a house"` | Construction holdout | Holdout script fires, Stage 1 blocked |
| **S0-8** | `"I want to buy a home and I am a veteran"` | Template A & Veteran | Template A selected, `Q43_answered = true` |
| **S0-9** | `"My wife and I make $110K to buy a home"` | Co-borrower & Income | `co_borrower = true`, `pre_stated_income = 110000` |
| **S0-10** | `"I want to refinance my condo in Orlando"` | Refi Location & Condo | `property_type = 'condo'`, `location = 'Orlando'` |
| **S0-11** | Borrower confirms Purchase with `"Yes"` | Stage 1 Unlock | `Q9_confirmed = true`, Stage 1 unlocked |
| **S0-12** | Borrower replies `"HELOC"` | Disambig choice | `transaction_type = 'TT-HEL'` |
| **S0-13** | `"I want a reverse mortgage"` | HECM holdout | Reverse mortgage holdout fires, Stage 1 blocked |
| **S0-14** | `"I currently pay 7.5% and want to refinance"` | Rate shielding | `context_current_rate = 7.5`, rate **not** in LLM prompt |
| **S0-15** | Stage 2 question sequence | Question skipping | Veteran question (Q43) **skipped** in Stage 2 |

---

## 💬 Task 17: Comprehensive Step-by-Step Local Testing Runbook (Friday Guide)

This section is the complete operational guide for **you and your colleague** to test Layer 0 live in the local environment on Friday. Follow these exact steps sequentially.

---

### 🛠️ Part 1: Pre-Flight Environment Setup

Before starting any test, ensure the system is up and running in 2 (or 3) terminal windows:

#### Terminal 1 — Start Backend API
```powershell
cd c:\Users\SAL\Downloads\ConvergentAI\backend
npm run dev
```
👉 *Look for:* `[server] Server listening on port 3001` (or configured port).

#### Terminal 2 — Start Voice Agent Worker (If Testing Voice)
```powershell
cd c:\Users\SAL\Downloads\ConvergentAI\backend
npm run dev:agent
```
👉 *Look for:* `[agent] DATABASE_URL status: ...`, agent connected to LiveKit room.

#### Terminal 3 — Start Frontend Web Interface
```powershell
cd c:\Users\SAL\Downloads\ConvergentAI\frontend
npm run dev
```
👉 *Open in Browser:* `http://localhost:3000`

> [!TIP]
> **Clean Session Rule:** Always click **"New Session"** or hard-refresh the page (`Ctrl + Shift + R`) between each test scenario. Each test scenario MUST start from turn 1 with clean session state (`signals_found = []`, `Q9_confirmed = false`).

---

### 🧪 Part 2: Step-by-Step Test Scenarios (Turn-by-Turn)

---

#### 🟢 Test 1: Standard Purchase Intent & Confirmation Gate (E2E-1)
* **What it tests:** Verifies that a borrower stating purchase intent does NOT trigger Stage 1 discovery questions immediately; Ailana confirms purchase intent first and only unlocks Stage 1 upon explicit borrower affirmation.

* **Step 1 (Borrower Opening):**
  - **Type/Speak:** `"I want to buy a home"`
* **Step 2 (Verify Ailana Response 1):**
  - Ailana delivers Q9 confirmation:
    > *"It sounds like you're looking to purchase a home — is that right?"*
  - ❌ **Fail if:** Ailana asks about occupancy (*"primary residence or vacation home?"*), property type, or price before you confirm.
* **Step 3 (Verify Terminal / Server Log):**
  - Look for: `[section0]: 📡 extractOpeningSignals completed | signals_found: [TT-PUR]`
  - Look for: `Q9_confirmed: false`
* **Step 4 (Borrower Reply):**
  - **Type/Speak:** `"Yes, that's right"`
* **Step 5 (Verify Ailana Response 2):**
  - Ailana confirms and unlocks Stage 1:
    > *"Great! Are you looking for a primary residence, a vacation home, or an investment property?"*
  - Look for in log: `[section0]: 🎯 Q9 routing confirmed -> TT-PUR (Q9_confirmed=true)`
* **Pass Sign:** `[x] PASSED (Verified Live)` — Stage 1 unlocks only AFTER the borrower replies "Yes". Verified live in voice session: Q9 confirmation succeeded, followed by seamless transitions into Occupancy, Existing Relationship, and Timeline with zero protocol tag leakage.

---

#### 🟢 Test 2: Veteran Front-Loading with Template A & Downstream Q43 Skip (E2E-2)
* **What it tests:** Verifies military/veteran signal extraction, delivery of verbatim **Template A**, and ensures the Stage 2 veteran discovery question (Q43) is permanently skipped.

* **Step 1 (Borrower Opening):**
  - **Type/Speak:** `"I want to buy a home and I am an Army veteran"`
* **Step 2 (Verify Ailana Response 1):**
  - Ailana delivers verbatim **Template A**:
    > *"Thank you for that — sounds like you're looking to purchase a home, and I've noted your military service. That opens up some excellent loan options we'll want to explore together, including VA financing. To make sure I have the full picture before we dive in: will you be applying on your own, or will you have someone applying with you?"*
* **Step 3 (Verify Terminal / Server Log):**
  - Look for: `[section0]: 📡 extractOpeningSignals completed | signals_found: [TT-PUR, veteran]`
  - Look for: `[section0]: 📋 Q9-MULTI delivered: TEMPLATE_A`
  - Look for: `profile.veteran_flagged = true` and `profile.Q43_answered = true`
* **Step 4 (Borrower Progresses Through Discovery):**
  - Reply with: `"Applying on my own"` (or `"Just me"`).
  - Ailana acknowledges and asks occupancy (*"Wonderful — let's explore your home purchase together. Are you looking for a primary residence, a second home, or an investment property?"*).
  - Reply with: `"Primary residence"`, then progress through Stage 1 into Stage 2.
* **Step 5 (Critical Stage 2 Check):**
  - In Stage 2, watch the question sequence.
  - Ailana moves directly to job tenure (`job_tenure_type`) or income, and **NEVER** asks:
    * *"Have you or your spouse served in the US military?"* (Q43)
* **Pass Sign:** `[x] PASSED (Verified Live)` — Template A delivered verbatim on opening turn acknowledging military service and VA financing; smoothly captured co-borrower and transitioned through occupancy, relationship, and timeline with zero protocol tag leakage.

---

#### 🟢 Test 3: Multi-Signal Full Front-Loading with Template F (E2E-3)
* **What it tests:** Verifies simultaneous extraction of 4+ signals (Purchase, Co-Borrower, Income, Assets, Location, Veteran), delivery of Template F, and suppression of all pre-stated questions.

* **Step 1 (Borrower Opening):**
  - **Type/Speak:** `"My wife and I make $110K, we're veterans, have $40K saved, and want to buy a house in Florida"`
* **Step 2 (Verify Ailana Response 1):**
  - Ailana delivers **Template F** synthesizing captured information:
    > *"First, thank you for your service to our country. I've noted that you and your spouse make about $110,000, have $40,000 saved, and are looking in Florida. To make sure we match you with the right programs, are you looking at a primary residence, a second home, or an investment property?"*
* **Step 3 (Verify Terminal / Server Log):**
  - Look for: `signals_found: [TT-PUR, veteran, co_borrower, income, assets, location]`
  - Look for: `pre_stated_income: 110000`, `pre_stated_assets: 40000`, `pre_stated_location: 'Florida'`
  - Look for: `Q13_answered: true`, `Q35_answered: true`, `Q38_answered: true`, `Q43_answered: true`
* **Step 4 (Borrower Replies):**
  - **Type/Speak:** `"Primary residence"`
* **Step 5 (Downstream Sequence Check):**
  - Ailana does **NOT** ask:
    1. *"Will anyone else be on the loan with you?"* (Q13) — Skipped!
    2. *"What is your gross annual household income?"* (Q35) — Skipped!
    3. *"How much do you have saved for a down payment?"* (Q38) — Skipped!
    4. *"Have you served in the military?"* (Q43) — Skipped!
* **Pass Sign:** `[x] PASSED (Verified Live)` — Template F delivered with all multi-signals extracted ($110K income & $40K savings populated); pre-stated fields (co-borrower Q13, income Q35, down payment Q38, military service Q43) seamlessly skipped downstream.

---

#### 🟢 Test 4: General Mortgage Inquiry & Standard Q9 Open Routing (E2E-4)
* **What it tests:** Verifies that ambiguous or exploratory openers ask the standard 3-option Q9 formulation and do NOT assume a transaction type.

* **Step 1 (Borrower Opening):**
  - **Type/Speak:** `"I have some questions about mortgages"`
* **Step 2 (Verify Ailana Response 1):**
  - Ailana delivers verbatim **Standard Q9**:
    > *"I can help with that. To get us started on the right track, are you looking to purchase a home, refinance your current mortgage, or explore a home equity line of credit?"*
  - ❌ **Fail if:** Ailana assumes purchase or refinance without asking.
* **Step 3 (Verify Terminal / Server Log):**
  - Look for: `signals_found: []`
  - Look for: `transaction_type = null`, `Q9_confirmed = false`
* **Step 4 (Borrower Replies):**
  - **Type/Speak:** `"I want to refinance my current home"`
* **Step 5 (Verify Ailana Response 2):**
  - Ailana sets `transaction_type = 'TT-REF'`, `Q9_confirmed = true`, and routes to Refinance Stage 1.
* **Pass Sign:** `[x] PASSED (Verified Live)` — Clean 3-option Q9 prompt delivered without assuming intent; accurately routed to TT-REF and unlocked Refinance Stage 1 discovery upon borrower response.

---

#### 🟢 Test 5: Equity Ambiguity & Disambiguation Flow (E2E-5)
* **What it tests:** When borrower mentions "equity" without specifying HELOC vs fixed Home Equity Loan, Ailana MUST disambiguate before routing.

* **Step 1 (Borrower Opening):**
  - **Type/Speak:** `"I want to access my home equity to do some renovations"`
* **Step 2 (Verify Ailana Response 1):**
  - Ailana delivers verbatim **Equity Disambiguation Formulation**:
    > *"When it comes to tapping into your equity, there are two main paths — a Home Equity Line of Credit, or HELOC, which gives you a flexible draw period, or a fixed Home Equity Loan with a lump sum and predictable payments. Do you know which of those fits what you're thinking, or would you like a quick comparison?"*
* **Step 3 (Verify Terminal / Server Log):**
  - Look for: `signals_found: [TT-HEL-AMBIG]`
  - Look for: `equity_disambig_delivered: true`
  - Look for: `Q9_confirmed: false` (Still blocked!)
* **Step 4 (Test Choice A — HELOC):**
  - **Type/Speak:** `"I want the HELOC with the flexible draw period"`
  - Verify: Routes to `TT-HEL`, unlocks HELOC discovery.
* **Step 5 (Alternative Test Choice B — Fixed Loan):**
  - Start fresh session (`"I want to access my home equity"`).
  - When disambiguation fires, **Type/Speak:** `"I prefer the fixed home equity loan"`
  - Verify: Routes to `TT-HEQ`, unlocks Home Equity Loan discovery.
* **Pass Sign:** `[x] PASSED (Verified Live)` — Equity disambiguation delivered cleanly without premature track lock; verified both Choice A (HELOC -> TT-HEL) and Choice B (Fixed Loan -> TT-HEQ) routing to their respective Stage 1 discovery tracks.

---

#### 🟢 Test 6: TRID Security Gate & SSN Intercept (E2E-6)
* **What it tests:** Critical compliance check. If borrower volunteers sensitive data (SSN or full street address), the TRID security disclaimer MUST fire FIRST, and sensitive data must NEVER be stored or echoed.

* **Step 1 (Borrower Opening):**
  - **Type/Speak:** `"My SSN is 123-45-6789 and I want to buy a house in Denver"`
* **Step 2 (Verify Ailana Response 1):**
  - Ailana delivers the **TRID Security Disclaimer FIRST**, then confirms purchase:
    > *"Before we get started, I want to let you know that for your security, we don't collect social security numbers or full property addresses in this conversation. A licensed loan officer will handle that securely when you're ready for the formal application. It sounds like you're looking to purchase a home — is that right?"*
  - ❌ **CRITICAL FAIL:** If Ailana echoes `"123-45-6789"` or any part of the SSN!
* **Step 3 (Verify Terminal & Database):**
  - Look for: `[section0]: 🛡️ TRID Gate intercepted sensitive data (SSN/street address)`
  - Look for: `trid_gate_fired: true`
  - Inspect profile in memory / log: SSN is **completely absent**.
* **Step 4 (Borrower Confirms):**
  - **Type/Speak:** `"Yes"` -> Proceeds into purchase discovery.
* **Pass Sign:** `[x] PASSED (Verified Live)` — TRID security compliance disclaimer delivered first; zero SSN leakage or echo; purchase intent confirmed before unlocking Stage 1 discovery.

---

#### 🟢 Test 7: Construction Loan Holdout to MLO (E2E-7)
* **What it tests:** Construction loans (`TT-CON`) are NOT handled in automated discovery. Ailana must deliver the holdout script, offer MLO transfer, and NEVER start Stage 1.

* **Step 1 (Borrower Opening):**
  - **Type/Speak:** `"I want to build a house on my lot"`
* **Step 2 (Verify Ailana Response 1):**
  - Ailana delivers verbatim **TT-CON Holdout Formulation**:
    > *"Construction loans involve some specific requirements that I want to make sure we handle correctly with a licensed loan officer. Let me connect you with one of our specialists who can walk you through the construction financing process in detail. Can I get your best contact information?"*
* **Step 3 (Verify Terminal / Server Log):**
  - Look for: `signals_found: [TT-CON]`
  - Look for: `[section0]: 🚧 Holdout routing applied (holdout_routed=true). Stage 1 blocked.`
  - Look for: `transaction_type: null`, `Q9_confirmed: false`
* **Step 4 (Borrower Supplies Contact Info):**
  - **Type/Speak:** `"Sure, my phone is 555-0199 and email is john@example.com"`
* **Step 5 (Verify Consequence):**
  - Ailana handles MLO escalation; Stage 1 discovery (occupancy, property type, price) is **permanently blocked**.
* **Pass Sign:** `[ ] Pass` — Holdout script fires, discovery never initiates.

---

#### 🟢 Test 8: Mixed Intent Resolution & Track Isolation (E2E-8)
* **What it tests:** When borrower expresses two distinct intents (e.g., buying and refinancing), Ailana acknowledges both, has the borrower choose one, and routes to only ONE active track without confusion.

* **Step 1 (Borrower Opening):**
  - **Type/Speak:** `"I want to buy a new house and also refinance my current one"`
* **Step 2 (Verify Ailana Response 1):**
  - Ailana delivers verbatim **Mixed Intent Formulation**:
    > *"It sounds like you have two things on your mind — buying a home and refinancing your current one. Those are both worth exploring, and they're actually connected. Let's tackle them one at a time so we give each the attention it deserves. Which would you like to start with?"*
* **Step 3 (Verify Terminal / Server Log):**
  - Look for: `signals_found: [TT-PUR, TT-REF]`
  - Look for: `secondary_intent: 'TT-REF'` (Stored for MLO context summary only)
  - Look for: `Q9_confirmed: false`
* **Step 4 (Borrower Choice):**
  - **Type/Speak:** `"Let's start with buying the new home"`
* **Step 5 (Verify Ailana Response 2):**
  - Ailana locks in `transaction_type = 'TT-PUR'`, `Q9_confirmed = true`, and starts Purchase discovery.
  - Ailana does **NOT** ask refinance questions simultaneously.
* **Pass Sign:** `[ ] Pass` — Both intents split, borrower picks one, only one track runs.

---

#### 🟢 Test 9: Reverse Mortgage (HECM) Holdout to MLO (E2E-9)
* **What it tests:** Reverse mortgages (`TT-HECM`) are outside standard discovery and must immediately holdout to a licensed specialist.

* **Step 1 (Borrower Opening):**
  - **Type/Speak:** `"I want to look into getting a reverse mortgage"`
* **Step 2 (Verify Ailana Response 1):**
  - Ailana delivers verbatim **TT-HECM Holdout Formulation**:
    > *"Reverse mortgages have some unique features that are best explained by a licensed loan officer. Let me connect you with a specialist who works with these programs every day. Can I get your best contact information?"*
* **Step 3 (Verify Terminal / Server Log):**
  - Look for: `signals_found: [TT-HECM]`
  - Look for: `holdout_routed = true`, `transaction_type = null`, `Q9_confirmed = false`
* **Pass Sign:** `[ ] Pass` — Reverse mortgage holdout delivered; Stage 1 strictly blocked.

---

#### 🟢 Test 10: Fallback Routing Question (Edge Case S0-6)
* **What it tests:** If borrower gives an unclear response to standard Q9, Ailana must deliver the 3-option plain-English fallback question.

* **Step 1 (Borrower Opening):**
  - **Type/Speak:** `"I have some questions about mortgages"`
* **Step 2 (Ailana Asks Q9):**
  - Ailana asks standard Q9 (*"...purchase a home, refinance, or explore a line of credit?"*).
* **Step 3 (Borrower Gives Unclear Response):**
  - **Type/Speak:** `"I'm not really sure, just looking at options for my house"`
* **Step 4 (Verify Ailana Response 2):**
  - Ailana delivers verbatim **Fallback Routing Question**:
    > *"No problem at all — let's figure it out together. Are you primarily looking to move into a new place, lower the payment or change the terms on your existing home, or borrow against what your home is worth?"*
  - Look for in log: `fallback_routing_delivered = true`
* **Step 5 (Borrower Picks Option):**
  - **Type/Speak:** `"Lower the payment on my existing home"`
  - Verify: Routes cleanly to `TT-REF`.
* **Pass Sign:** `[ ] Pass` — Fallback question delivered; correctly maps to refinance.

---

#### 🟢 Test 11: Rate Shielding & MLO Privacy (Edge Case S0-14)
* **What it tests:** If a borrower states their existing interest rate (e.g., 7.5%), Ailana captures it for the loan officer context note, but NEVER quotes it back or quotes new rates.

* **Step 1 (Borrower Opening):**
  - **Type/Speak:** `"I currently pay 7.5% on my 30-year fixed and want to refinance to get a lower payment"`
* **Step 2 (Verify Ailana Response 1):**
  - Ailana confirms refinance intent:
    > *"It sounds like you're looking to refinance your current mortgage — is that right?"*
  - ❌ **CRITICAL FAIL:** If Ailana says *"I see you're currently paying 7.5%..."* or quotes any interest rate.
* **Step 3 (Verify Terminal / Server Log):**
  - Look for: `profile.context_current_rate = 7.5`
  - Verify that `context_current_rate` is **NOT** included in `signals_found` and is strictly omitted from the prompt sent to the LLM.
* **Pass Sign:** `[ ] Pass` — Rate captured silently for MLO, never repeated by Ailana.

---

### 📋 Part 3: David Patten Client Acceptance Sign-Off Sheet

Before marking Layer 0 as ready for Staging / Production deployment, complete this 3-conversation verification checklist:

| Verification Requirement | Tested By | Date | Result |
| :--- | :---: | :---: | :---: |
| **Run 1:** Full Purchase Conversation from opening turn to Pre-Qualification (E2E-1 or E2E-2) | — | Oct 16, 2026 | `[ ] Pass  [ ] Fail` |
| **Run 2:** Full Refinance Conversation from opening turn to Refi findings | — | Oct 16, 2026 | `[ ] Pass  [ ] Fail` |
| **Run 3:** Full Equity Disambiguation & HELOC Conversation to findings | — | Oct 16, 2026 | `[ ] Pass  [ ] Fail` |
| **TRID Verification:** Verified zero SSN leakage in terminal logs or database across all runs | — | Oct 16, 2026 | `[ ] Pass  [ ] Fail` |
| **Holdout Verification:** Verified Construction and HECM both holdout cleanly without leaking Stage 1 | — | Oct 16, 2026 | `[ ] Pass  [ ] Fail` |

**Sign-off Decision:**
- `[ ]` **APPROVED FOR STAGING DEPLOYMENT (Layer 0 Complete)**
- `[ ]` **REVISIONS REQUIRED**

---

### 🚫 Quick Reference: 3 Traps to Watch Out For During Live Testing

1. **Never allow Stage 1 discovery before explicit confirmation:**
   - If Ailana asks *"Is this a primary residence?"* on Turn 1 before confirming purchase intent, the Stage 1 Gate failed.
2. **Never allow unconfirmed transaction types to activate tracks:**
   - `signals_found` stores hypotheses, but `transaction_type` must remain `null` until the borrower says *"Yes"*.
3. **Never allow sensitive data echo:**
   - Social Security Numbers and volunteered rates must never appear in Ailana's spoken or displayed responses.

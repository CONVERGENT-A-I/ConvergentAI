# Layer 0 — Easy Testing Guide

**Project:** ConvergentAI | Ailana v8.7  
**File:** `Layer0TestGuide.md`  
**Purpose:** Simple, step-by-step instructions on what to do, how to test, and how to verify that each task passes.

---

## 🚦 Overall Progress Tracker

| Task | Description | Status |
| :---: | :--- | :---: |
| **T1** | Add 15 new fields to `BorrowerProfile` | 🔴 Pending |
| **T2** | Set default state (`Q9_confirmed = false`) | 🔴 Pending |
| **T3** | Fast extraction of opening signals (<10ms) | 🔴 Pending |
| **T4** | TRID compliance gate (SSN / Address intercept) | 🔴 Pending |
| **T5** | Select Q9-MULTI Templates (A–F & General) | 🔴 Pending |
| **T6** | Standard Q9 open routing | 🔴 Pending |
| **T7** | Equity disambiguation (HELOC vs Loan) | 🔴 Pending |
| **T8** | Fallback question for unclear answers | 🔴 Pending |
| **T9** | Mixed intent handling (2 goals) | 🔴 Pending |
| **T10** | Holdout routing (Construction & Reverse Mortgages) | 🔴 Pending |
| **T11** | Stage 1 Gate in `buildLayer2()` | 🔴 Pending |
| **T12** | Create `stage0-routing.ts` prompt file | 🔴 Pending |
| **T13** | Connect Section 0 prompt into `buildLayer2()` | 🔴 Pending |
| **T14** | Add Section 0 block to Layer 3 context | 🔴 Pending |
| **T15** | Run 15 unit tests (`S0-1` to `S0-15`) | 🔴 Pending |
| **T16** | Run full test suite regression (`npm test`) | 🔴 Pending |
| **T17** | Test 9 live E2E conversations | 🔴 Pending |

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
* **Status:** `[ ] Pending  [ ] Pass  [ ] Fail`

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
* **Status:** `[ ] Pending  [ ] Pass  [ ] Fail`

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
* **Status:** `[ ] Pending  [ ] Pass  [ ] Fail`

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
* **Status:** `[ ] Pending  [ ] Pass  [ ] Fail`

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
* **Status:** `[ ] Pending  [ ] Pass  [ ] Fail`

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
* **Status:** `[ ] Pending  [ ] Pass  [ ] Fail`

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
* **Status:** `[ ] Pending  [ ] Pass  [ ] Fail`

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
* **Status:** `[ ] Pending  [ ] Pass  [ ] Fail`

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
* **Status:** `[ ] Pending  [ ] Pass  [ ] Fail`

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
* **Status:** `[ ] Pending  [ ] Pass  [ ] Fail`

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
* **Status:** `[ ] Pending  [ ] Pass  [ ] Fail`

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
* **Status:** `[ ] Pending  [ ] Pass  [ ] Fail`

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
* **Status:** `[ ] Pending  [ ] Pass  [ ] Fail`

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
* **Status:** `[ ] Pending  [ ] Pass  [ ] Fail`

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
* **Status:** `[ ] Pending  [ ] Pass  [ ] Fail`

---

#### TASK T16: Run Full Project Regression Suite
* **File:** `backend/src/__tests__/run-all-tests.ts`
* **What to do:**  
  Add `section0-routing.test.ts` to `run-all-tests.ts` and run all tests.
* **How to test:**  
  Run: `npm test`
* **How to pass:**  
  Console prints: `✨ ALL 18 CONVERGENTAI UNIT & INTEGRATION TEST SUITES PASSED!`.
* **Failure sign:**  
  Any existing test suite breaks.
* **Status:** `[ ] Pending  [ ] Pass  [ ] Fail`

---

#### TASK T17: Live E2E Verification (9 Scenarios)
* **What to do:**  
  Start `npm run dev` and test the 9 conversation scenarios in the chat/voice UI.
* **How to test:**  
  Follow the simple 9-scenario checklist below.
* **How to pass:**  
  All 9 scenarios respond with correct routing, disclaimers, or holdouts.
* **Failure sign:**  
  Any scenario enters the wrong track or fails compliance.
* **Status:** `[ ] Pending  [ ] Pass  [ ] Fail`

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

## 💬 The 9 Live E2E Scenarios: Quick Testing Script

Test these in your browser or voice agent:

1. **E2E-1 (Purchase):**  
   Type: `"I want to buy a home"`  
   👉 **Pass:** Ailana confirms purchase intent. Only starts Stage 1 after you reply `"Yes"`.

2. **E2E-2 (Purchase + Veteran):**  
   Type: `"I want to buy a home and I am a veteran"`  
   👉 **Pass:** Ailana uses Template A (*"Thank you for your service..."*). Military question is skipped in Stage 2.

3. **E2E-3 (Full Front-Load):**  
   Type: `"My wife and I make $110K, we're veterans, $40K saved, want to buy in Florida"`  
   👉 **Pass:** Template F fires. Downstream questions for co-borrower, income, savings, and veteran are all skipped.

4. **E2E-4 (General Question):**  
   Type: `"I have some questions about mortgages"`  
   👉 **Pass:** Ailana asks standard Q9 (Purchase, Refi, or HELOC). Does not jump into Stage 1.

5. **E2E-5 (Equity):**  
   Type: `"I want to access my equity"`  
   👉 **Pass:** Ailana asks if you want a HELOC or Home Equity Loan.

6. **E2E-6 (TRID Intercept):**  
   Type: `"My SSN is 123-45-6789 and I want to buy a house"`  
   👉 **Pass:** Ailana delivers security disclaimer. SSN is never echoed or stored.

7. **E2E-7 (Construction):**  
   Type: `"I want to build a house on my lot"`  
   👉 **Pass:** Ailana delivers construction loan holdout and offers to connect to specialist.

8. **E2E-8 (Mixed Intent):**  
   Type: `"I want to buy a house and also refinance my current one"`  
   👉 **Pass:** Ailana acknowledges both and asks which one you want to start with.

9. **E2E-9 (Reverse Mortgage):**  
   Type: `"I want a reverse mortgage"`  
   👉 **Pass:** Ailana delivers reverse mortgage holdout and connects to specialist.

---

## 🚫 3 Traps to Watch Out For

1. **Never default `Q9_confirmed` to `true`:** It must always start as `false`.
2. **Never set `transaction_type` in extraction:** Extraction only fills `signals_found`. The transaction type is set only after borrower confirmation.
3. **Never echo volunteered rates:** If borrower says `"7.5%"`, store it for the loan officer, but never let Ailana quote it back.

---

*Keep this guide open during implementation. Check off each task as you complete and test it!*

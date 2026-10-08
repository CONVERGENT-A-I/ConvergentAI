# Layer 0 — Transaction Type Routing: Implementation Plan

**Project:** ConvergentAI | Ailana v8.7  
**Author:** Sohail-Ak  
**Date:** October 8, 2026  
**Status:** 🟡 IN PROGRESS — Analysis complete, implementation not yet started

---

## 📊 Overall Layer 0 Progress

```
Layer 0 Completion:  ████░░░░░░░░░░░░░░░░  ~20%
```

| Area | Status | Notes |
| :--- | :---: | :--- |
| Session State Schema (BorrowerProfile) | 🟡 Partial | `transaction_type`, `mortgage_goal` exist. 7 new Section 0 fields missing. |
| Front-Loading Extraction | 🟡 Partial | Basic mortgage_goal extraction exists. No multi-signal / `signals_found` system. |
| Q9 Routing Logic | 🔴 Missing | `mortgage_goal` extracted but no Q9 routing branching or Q9-MULTI path. |
| TRID Gate (Q9-TRID-GATE) | 🟡 Partial | Only SSN/address handled in `ailana-system.ts`. Missing Section 0 TRID gate before Q9. |
| Equity Disambiguation | 🟡 Partial | HELOC vs HEQ is distinguished via `mortgage_goal` but no `equity_disambiguation` question flow. |
| Mixed Intent Handling | 🔴 Missing | No `secondary_intent` field or mixed-intent acknowledgment flow. |
| Fallback Routing Question | 🔴 Missing | No distinct fallback step — uses re-ask loop instead. |
| Stage 1 Gate (`Q9_confirmed`) | 🔴 Missing | Stage 1 fires immediately without `Q9_confirmed` guard. |
| Track Guard Rules | 🟡 Partial | Enforced in `buildLayer2()` by `transaction_type` but no guard at LLM prompt injection. |
| Q9-MULTI Templates (A–F + General) | 🔴 Missing | No multi-signal aggregation, no template selection, no prompt injection. |
| `TT-CON` / `TT-HECM` Holdout Routing | 🔴 Missing | Reserved flags defined in schema but no holdout response or MLO routing. |
| Prompt: Stage 0 Block in Layer 2 | 🔴 Missing | No `stage0-routing.ts` prompt file exists. |
| Test Suite | 🔴 Missing | No S0-1 through S0-7 test cases exist. |

---

## 🔍 What Currently Exists (Baseline)

### ✅ Already Done (Do NOT re-implement)
1. **`BorrowerProfile.transaction_type`** — enum field exists in [`layer3-context.ts`](file:///c:/Users/SAL/Downloads/ConvergentAI/backend/src/prompts/layer3-context.ts), line 8. All 4 active TT flags defined.
2. **`BorrowerProfile.mortgage_goal`** + **`mortgage_goal_confirmed`** — set during Stage 1 extraction in [`session-context-manager.ts`](file:///c:/Users/SAL/Downloads/ConvergentAI/backend/src/context/session-context-manager.ts), lines 2252–2270.
3. **`buildLayer2()` track routing** — correctly swaps Stage 2 prompt by `transaction_type` in [`ailana-system.ts`](file:///c:/Users/SAL/Downloads/ConvergentAI/backend/src/prompts/ailana-system.ts), lines 84–93.
4. **HELOC vs HEQ distinction** — `TT-HEL` / `TT-HEQ` switching via `heloc_rate_comfort` in session-context-manager.ts, line 2693.
5. **TRID compliance phrasing** — SSN and property address intercept text exists in [`ailana-system.ts`](file:///c:/Users/SAL/Downloads/ConvergentAI/backend/src/prompts/ailana-system.ts), lines 49–51.
6. **Session opening greeting** — `GREETING_TEXT` defined in `ailana-system.ts`, line 165.
7. **Stage 1 extraction** — `runStage1Extraction()` already extracts `mortgage_goal`, `occupancy`, `co_borrower`, `timeline`, `existing_relationship` fields.

### 🔴 What Does NOT Exist Yet
1. **Section 0 session state fields:** `signals_found`, `Q9_confirmed`, `Q9_MULTI_delivered`, `secondary_intent`, `veteran_flagged` — none exist in `BorrowerProfile`.
2. **Front-loading `signals_found` aggregation:** Current extraction simply sets `mortgage_goal` — no multi-signal array capture, no `veteran` signal, no `co_borrower` pre_stated signal, no `income`/`savings` pre-stated signals.
3. **Q9-MULTI template selection:** No logic to pick Template A–F based on `signals_found` combination.
4. **Stage 0 prompt file:** No `stage0-routing.ts` exists.
5. **Stage 1 gate (`Q9_confirmed` check):** Stage 1 fires immediately regardless of routing state.
6. **Equity disambiguation field and flow:** General equity intent detected but no formal `equity_disambiguation` pending field or scripted formulation path.
7. **Fallback routing question:** No distinct fallback step — after 2 failed attempts, uses generic re-ask.
8. **Mixed intent handling:** No `secondary_intent` field or mixed-intent acknowledgment script.
9. **`TT-CON` / `TT-HECM` holdout:** No handling — reserved flags would currently fall through to Stage 1 without any holdout response.
10. **Layer 0 test suite:** No `section0-routing.test.ts` exists.

---

## 📋 Implementation Plan — Task by Task

> **Rule:** Each Task must be completed and verified before moving to the next. Mark status as you go.

---

### 🔵 PHASE 1: Schema & Foundation
*Establish the data model so all downstream tasks build on the correct types.*

---

#### TASK 1 — Add Section 0 Fields to BorrowerProfile
**File:** [`backend/src/prompts/layer3-context.ts`](file:///c:/Users/SAL/Downloads/ConvergentAI/backend/src/prompts/layer3-context.ts)  
**Status:** 🔴 PENDING

**What to add:**
Add these 7 new fields to the `BorrowerProfile` interface under the `// Stage 1` block:

```typescript
// ── Section 0 — Transaction Type Routing ──────────────────────────────────
signals_found?: string[] | null;               // Pre_stated signals extracted from first input
Q9_confirmed?: boolean;                        // Set true only after borrower confirms routing question
Q9_MULTI_delivered?: boolean;                  // Prevents Q9-MULTI from re-firing
secondary_intent?: string | null;              // Unchosen goal when borrower expresses two intents
veteran_flagged?: boolean;                     // From extraction or Q43 (purchase only)
// Note: co_borrower already exists — Section 0 reads it from extraction layer
// Note: mortgage_goal_confirmed maps to Q9_confirmed concept — wire them together
```

**Why:** All downstream logic (extraction, gate check, template selection) needs these fields on the profile object.

---

#### TASK 2 — Add Section 0 State to Context Manager
**File:** [`backend/src/context/session-context-manager.ts`](file:///c:/Users/SAL/Downloads/ConvergentAI/backend/src/context/session-context-manager.ts)  
**Status:** 🔴 PENDING

**What to add:**
- Initialize `signals_found`, `Q9_confirmed`, `Q9_MULTI_delivered`, `secondary_intent`, `veteran_flagged` to their zero-state values when a session starts.
- Add a `section0State` tracking variable to know which routing step is active: `'pre_q9' | 'q9_open' | 'equity_disambiguation' | 'fallback' | 'mixed_intent' | 'confirmed'`.

**Why:** The context manager is the single source of truth for session state. Section 0 routing state must be tracked here.

---

### 🔵 PHASE 2: Front-Loading Extraction
*Upgrade the first-turn extraction to produce `signals_found` properly.*

---

#### TASK 3 — Upgrade First-Turn Signal Extraction
**File:** [`backend/src/context/session-context-manager.ts`](file:///c:/Users/SAL/Downloads/ConvergentAI/backend/src/context/session-context-manager.ts), in `runStage1Extraction()`  
**Status:** 🔴 PENDING

**What to change:**
The current extraction sets `mortgage_goal` directly. Upgrade it to:
1. Run extraction as usual, but now ALSO aggregate `signals_found[]` array from the first turn.
2. A signal is added to `signals_found` if explicitly found:
   - `'TT-PUR'` — purchase / buy intent found
   - `'TT-REF'` — refinance intent found
   - `'TT-HEL'` — HELOC intent found
   - `'TT-HEQ'` — home equity loan (fixed/lump sum) intent found
   - `'veteran'` — borrower mentions military / VA / veteran service
   - `'co_borrower'` — borrower mentions applying with spouse/partner
   - `'income'` — borrower states income in first message
   - `'savings'` — borrower states savings/down payment in first message
   - `'location'` — borrower states a city/state location in first message
3. Do NOT set `transaction_type` or `Q9_confirmed` yet — that is Section 0's job on confirmation.
4. Store extracted `signals_found` on the profile.

**Key constraint from spec:** The extraction layer sets `signals_found` — it does NOT set `transaction_type` directly. `transaction_type` is set only after Q9 confirmation.

---

#### TASK 4 — Add TRID Gate Before Q9 Fires
**File:** [`backend/src/context/session-context-manager.ts`](file:///c:/Users/SAL/Downloads/ConvergentAI/backend/src/context/session-context-manager.ts) — first-turn processing  
**Status:** 🔴 PENDING

**What to add:**
Before any Q9 logic fires on the first turn:
1. Check if the borrower's input contains an SSN pattern (`\d{3}-\d{2}-\d{4}` or similar) OR a property address pattern.
2. If detected: set `profile.trid_gate_triggered = true`, do NOT store the value anywhere, fire `Q9-TRID-GATE` formulation, then proceed to Q9 or Q9-MULTI as normal.
3. The existing SSN/address prompt text in `ailana-system.ts` lines 49–51 handles the response — just ensure the routing correctly fires before Q9.

**Note:** TRID gate has the HIGHEST priority in the routing sequence (fires before everything else).

---

### 🔵 PHASE 3: Routing Logic
*Implement the 6-step Section 0 decision sequence in the context manager.*

---

#### TASK 5 — Implement Q9-MULTI Template Selection
**File:** [`backend/src/context/session-context-manager.ts`](file:///c:/Users/SAL/Downloads/ConvergentAI/backend/src/context/session-context-manager.ts)  
**Status:** 🔴 PENDING

**What to add:**
Create a `selectQ9MultiTemplate(signals_found: string[]): string` function:
- If `signals_found` has only 1 TT-* signal: use Step 2 (single confirmation e.g., "It sounds like you're looking to purchase a home — is that right?")
- If `signals_found` has 2+ signals: select the correct scripted template A–F from the spec:
  - **Template A:** `TT-PUR` + `veteran` (no co_borrower)
  - **Template B:** `TT-PUR` + `veteran` + `co_borrower`
  - **Template C:** `TT-PUR` + `co_borrower` (no veteran)
  - **Template D:** `TT-PUR` + `income` + `savings`
  - **Template E:** `TT-REF` + `location`
  - **Template F:** Multiple signals (name + co_borrower + veteran + income + savings)
  - **GENERAL:** Any other combination not covered above
- Mark `Q9_MULTI_delivered = true` when delivered.
- Wire `bridge_to_say` (existing mechanism) to inject the correct template text.

---

#### TASK 6 — Implement Q9 Standard Open Routing (No Signals)
**File:** [`backend/src/context/session-context-manager.ts`](file:///c:/Users/SAL/Downloads/ConvergentAI/backend/src/context/session-context-manager.ts)  
**Status:** 🔴 PENDING

**What to add:**
If `signals_found` is empty or null after first-turn extraction:
1. Set `currentPendingField = 'mortgage_goal'` (already done) but also set `section0State = 'q9_open'`.
2. The LLM will use the Stage 0 prompt (Task 10) to ask Q9 naturally.
3. On the borrower's response, run extraction to capture `mortgage_goal`.

---

#### TASK 7 — Implement Equity Disambiguation Flow
**File:** [`backend/src/context/session-context-manager.ts`](file:///c:/Users/SAL/Downloads/ConvergentAI/backend/src/context/session-context-manager.ts)  
**Status:** 🔴 PENDING

**What to add:**
When the borrower's response to Q9 includes general equity intent (keywords: `equity`, `home equity`, `tap into`, `cash out equity`) but does NOT specify HELOC vs home equity loan:
1. Set `currentPendingField = 'equity_disambiguation'` and `section0State = 'equity_disambiguation'`.
2. Add `equity_disambiguation` to `BorrowerProfile` as a new pending field.
3. Fire the scripted equity disambiguation formulation from the spec via `bridge_to_say`.
4. On borrower's answer:
   - "HELOC / line of credit / flexible" → `transaction_type = 'TT-HEL'`, advance.
   - "Home equity loan / fixed / lump sum" → `transaction_type = 'TT-HEQ'`, advance.
   - "Not sure / explain" → fire `HQ18` educational comparison (already exists in Stage 2 HELOC prompt), then re-ask.
5. After disambiguation confirmed: set `Q9_confirmed = true`, set `mortgage_goal_confirmed = true`, advance to Stage 1.

---

#### TASK 8 — Implement Fallback Routing Question
**File:** [`backend/src/context/session-context-manager.ts`](file:///c:/Users/SAL/Downloads/ConvergentAI/backend/src/context/session-context-manager.ts)  
**Status:** 🔴 PENDING

**What to add:**
After Q9 fires and the borrower's response is ambiguous (no mortgage goal extracted, no equity signal):
1. Track `fieldAttempts['mortgage_goal']` — already exists.
2. On attempt 2: instead of re-asking Q9 word-for-word, switch `section0State = 'fallback'` and fire the fallback routing formulation: "Are you looking to purchase a new home, refinance an existing mortgage, or access the equity you've already built?"
3. If still unclear after fallback: deliver SR-1 (stall recovery — already exists in the system) and loop.

---

#### TASK 9 — Implement Mixed Intent Handling
**File:** [`backend/src/context/session-context-manager.ts`](file:///c:/Users/SAL/Downloads/ConvergentAI/backend/src/context/session-context-manager.ts)  
**Status:** 🔴 PENDING

**What to add:**
When `signals_found` contains 2 different TT-* signals (e.g., both `TT-PUR` and `TT-REF`):
1. Fire the scripted mixed intent formulation: "It sounds like you have two things on your mind — [goal 1] and [goal 2]..."
2. Set `currentPendingField = 'mixed_intent_choice'`.
3. On borrower's answer: set `transaction_type` from chosen goal, set `secondary_intent` to unchosen goal (human-readable string, e.g., "purchase a new home").
4. Set `Q9_confirmed = true`, advance to Stage 1.
5. `secondary_intent` is passed through to the MLO context summary — no further Ailana action.

---

#### TASK 10 — Implement `TT-CON` / `TT-HECM` Holdout Routing
**File:** [`backend/src/context/session-context-manager.ts`](file:///c:/Users/SAL/Downloads/ConvergentAI/backend/src/context/session-context-manager.ts)  
**Status:** 🔴 PENDING

**What to add:**
When `signals_found` contains `TT-CON` or `TT-HECM`:
1. Do NOT activate Stage 1 or set `Q9_confirmed`.
2. Set `currentPendingField = 'reserved_track_holdout'`.
3. Fire holdout response: "That type of mortgage has its own unique process, and it's one we handle directly with a licensed loan officer. Let me connect you with someone who can walk you through everything." Then transfer to MLO.
4. These tracks must NEVER activate any Stage 2 discovery flow.

---

### 🔵 PHASE 4: Stage 1 Gate
*Enforce that Stage 1 cannot fire without Q9 being confirmed.*

---

#### TASK 11 — Implement Stage 1 Gate (`Q9_confirmed` check)
**File:** [`backend/src/context/session-context-manager.ts`](file:///c:/Users/SAL/Downloads/ConvergentAI/backend/src/context/session-context-manager.ts) — in `advanceWorkflow()`  
**Status:** 🔴 PENDING

**What to add:**
In `advanceWorkflow()`, before transitioning to Stage 2:
```typescript
// Stage 1 gate — cannot proceed until Q9 is confirmed
if (!this.profile.Q9_confirmed && !this.profile.mortgage_goal_confirmed) {
  this.currentPendingField = 'mortgage_goal';
  this.activeStage = '1';
  return;
}
```
Also: when `mortgage_goal_confirmed` is set to `true` in extraction, simultaneously set `Q9_confirmed = true` (they are equivalent for the current implementation — `Q9_confirmed` is the spec-correct name).

---

### 🔵 PHASE 5: Prompt Layer (Stage 0 Prompt Block)
*Create the Section 0 prompt content for Layer 2.*

---

#### TASK 12 — Create `stage0-routing.ts` Prompt File
**File:** `backend/src/prompts/stage0-routing.ts` *(NEW FILE)*  
**Status:** 🔴 PENDING

**What to add:**
Create a new prompt file that injects the Section 0 routing rules and all verbatim formulations into Layer 2 when `stage === '0'` (or when `Q9_confirmed === false` during Stage 1).

Content to include in the prompt:
- Q9 standard formulation (verbatim)
- Q9-TRID-GATE formulation (verbatim, priority trigger)
- Equity disambiguation formulation (verbatim)
- Fallback routing formulation (verbatim)
- Mixed intent formulation (verbatim, with `[goal 1]` / `[goal 2]` replaced dynamically)
- Q9-MULTI templates A–F and GENERAL (injected when `Q9_MULTI_delivered = false` and `signals_found.length > 0`)
- Track guard rules list (so LLM knows what is track-gated)
- Holdout response for `TT-CON` / `TT-HECM`
- The Stage 1 gate instruction: "Do NOT advance to Stage 1 discovery questions until `Q9_confirmed` is true"

---

#### TASK 13 — Wire Stage 0 Prompt into `buildLayer2()`
**File:** [`backend/src/prompts/ailana-system.ts`](file:///c:/Users/SAL/Downloads/ConvergentAI/backend/src/prompts/ailana-system.ts)  
**Status:** 🔴 PENDING

**What to add:**
In `buildLayer2()`, add a routing condition before the Stage 1 block:
```typescript
// Stage 0 — Section 0 routing (fires when Q9 not yet confirmed)
if (stage === '1' && !profile.Q9_confirmed && !profile.mortgage_goal_confirmed) {
  return buildStage0RoutingInstructions(profile);
}
```
This ensures the Section 0 prompt is active during the very first turn of every session, then replaced with Stage 1 content once `Q9_confirmed = true`.

---

### 🔵 PHASE 6: Layer 3 Context Update
*Expose Section 0 state in the dynamic context so the LLM sees it.*

---

#### TASK 14 — Add Section 0 Context Block to Layer 3
**File:** [`backend/src/prompts/layer3-context.ts`](file:///c:/Users/SAL/Downloads/ConvergentAI/backend/src/prompts/layer3-context.ts) — in `buildLayer3TurnContext()`  
**Status:** 🔴 PENDING

**What to add:**
Add a "Section 0 State" block to the Layer 3 dynamic context (visible to the LLM each turn during routing):
```text
=== SECTION 0 — ROUTING STATE ===
Q9 Confirmed:         true / false
Signals Found:        [TT-PUR, veteran, co_borrower] or (none yet)
Q9-MULTI Delivered:   true / false
Secondary Intent:     (stored unchosen goal, if any)
Veteran Flagged:      true / false
```
This block should only appear when `activeStage === '1'` and `Q9_confirmed === false`. Once Section 0 is done, it can be omitted.

---

### 🔵 PHASE 7: Testing
*Write and run all 7 verification tests from Section 9.4 of the spec, plus stress tests.*

---

#### TASK 15 — Create Section 0 Test Suite
**File:** `backend/src/__tests__/section0-routing.test.ts` *(NEW FILE)*  
**Status:** 🔴 PENDING

**Tests to write (per spec Section 9.4):**

| Test ID | Input | Expected Outcome | Failure Condition |
| :--- | :--- | :--- | :--- |
| **S0-1** | `'I have some mortgage questions'` | Q9 fires. No TT set. `Q9_confirmed = false`. | Track activates before Q9 is confirmed. |
| **S0-2** | `'I want to buy a house'` | `signals_found = ['TT-PUR']`. Q9-MULTI confirmation fires. On confirm: `transaction_type = 'TT-PUR'`, `Q9_confirmed = true`. | Standard Q9 fires instead of Q9-MULTI. |
| **S0-3** | `'My SSN is 123-45-6789 and I want to buy a house'` | TRID gate fires first. SSN NOT stored in profile. Then Q9-MULTI fires. | SSN stored anywhere in session state. |
| **S0-4** | `'I want to tap into my equity'` | `signals_found = ['TT-HEL']` OR equity disambiguation fires. Routes to TT-HEL or TT-HEQ on borrower choice. | Routes to wrong track. Disambiguation not delivered. |
| **S0-5** | `'I want to buy a house and also refinance my current one'` | `signals_found = ['TT-PUR', 'TT-REF']`. Mixed intent fires. Borrower chooses. Chosen TT set. `secondary_intent` stored. | Both tracks activate simultaneously. |
| **S0-6** | Two unclear answers in a row | Fallback routing fires on 2nd attempt. Routes on answer. Stage 1 NOT fired. | Stage 1 fires before `Q9_confirmed = true`. |
| **S0-7** | `'I want to build a house'` | Holdout response fires. `TT-CON` NOT activated. Routes to MLO. Stage 1 NOT fired. | TT-CON activates or Stage 1 fires. |

**Additional tests to add beyond spec:**
- **S0-8:** Purchase + veteran + co_borrower → Template B selected.
- **S0-9:** Refinance + location → Template E selected.
- **S0-10:** HELOC choice in equity disambiguation → `TT-HEL` set, `Q9_confirmed = true`.
- **S0-11:** HEQ choice in equity disambiguation → `TT-HEQ` set, `Q9_confirmed = true`.
- **S0-12:** "Not sure" in equity disambiguation → HQ18 educational response fires, then re-asks.
- **S0-13:** `secondary_intent` stored correctly for MLO context in mixed intent scenario.
- **S0-14:** `Q9_MULTI_delivered = true` after Q9-MULTI fires — does NOT re-fire on subsequent turns.
- **S0-15:** `veteran_flagged = true` sets only in purchase track after extraction.

---

#### TASK 16 — Add Section 0 Tests to `run-all-tests.ts`
**File:** [`backend/src/__tests__/run-all-tests.ts`](file:///c:/Users/SAL/Downloads/ConvergentAI/backend/src/__tests__/run-all-tests.ts)  
**Status:** 🔴 PENDING

**What to add:**
Register `section0-routing.test.ts` in the test runner alongside the existing 14 test suites. Run full suite after each Phase to verify no regressions.

---

#### TASK 17 — Local End-to-End Testing (Live Session)
**Status:** 🔴 PENDING  
**How to test:** Start backend dev server and frontend, then manually run each flow:

| Scenario | Commands to run |
| :--- | :--- |
| Purchase fresh session | Say "I want to buy a house" |
| Refinance fresh session | Say "I want to refinance my mortgage" |
| HELOC disambiguation | Say "I want to access my home equity" |
| HEQ disambiguation | Say "I want a home equity loan" |
| Mixed intent | Say "I want to buy a house and refinance my current one" |
| TT-CON holdout | Say "I want to build a house" |
| TRID gate | Say "My SSN is 123-45-6789, I want to buy" |
| Veteran + purchase (Q9-MULTI Template A) | Say "I'm a veteran and want to buy a home" |
| Returning borrower | Re-login with existing session |

---

## 📁 Files To Create / Modify

| File | Action | Tasks |
| :--- | :--- | :--- |
| `backend/src/prompts/layer3-context.ts` | **MODIFY** — Add 5 new BorrowerProfile fields | Task 1 |
| `backend/src/context/session-context-manager.ts` | **MODIFY** — Extraction upgrade, routing logic, gate, disambiguation, holdout | Tasks 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 |
| `backend/src/prompts/stage0-routing.ts` | **CREATE NEW** — Section 0 prompt block with all scripted formulations | Task 12 |
| `backend/src/prompts/ailana-system.ts` | **MODIFY** — Wire stage0 into buildLayer2() | Task 13 |
| `backend/src/prompts/layer3-context.ts` | **MODIFY** — Add Section 0 context block to Layer 3 | Task 14 |
| `backend/src/__tests__/section0-routing.test.ts` | **CREATE NEW** — All 15 test cases | Task 15 |
| `backend/src/__tests__/run-all-tests.ts` | **MODIFY** — Register new test suite | Task 16 |

---

## 📐 Key Rules & Constraints (Non-Negotiable)

> These rules are from the spec and must be enforced throughout every task.

1. **`transaction_type` is NEVER set before `Q9_confirmed = true`.** The extraction layer only populates `signals_found`. `transaction_type` is assigned only on borrower confirmation.
2. **Stage 1 CANNOT fire until `Q9_confirmed = true`.** If the LLM attempts to fire a Stage 1 question before confirmation, the pipeline blocks it and routes back to Section 0.
3. **TRID gate has HIGHEST priority.** It fires before Q9 or Q9-MULTI. SSN and property address are NEVER stored.
4. **Q9-MULTI fires only once per session.** `Q9_MULTI_delivered = true` prevents re-firing.
5. **`TT-CON` / `TT-HECM` must always result in a holdout and MLO routing.** These tracks are never activated.
6. **`secondary_intent` is stored but Ailana never acts on it.** The MLO handles the unchosen goal.
7. **Equity disambiguation is mandatory** before setting `TT-HEL` or `TT-HEQ` unless the borrower's first message explicitly named HELOC or home equity loan by name.
8. **Q43 (military service) is purchase-track ONLY.** `veteran_flagged` in other tracks is captured only by extraction, never by asking Q43.
9. **All Q9-MULTI template text is verbatim from the spec.** The LLM does not improvise these — they are `bridge_to_say` injections.
10. **Track guard rules must be enforced by the session state flag**, not by LLM trust. Once `transaction_type` is set, only formulations for that track may fire.

---

## 🚦 Progress Tracker

Update this table after completing each task:

| Task | Description | Status | Completed By | Date |
| :--- | :--- | :---: | :--- | :--- |
| T1 | Add Section 0 fields to BorrowerProfile | 🔴 PENDING | — | — |
| T2 | Add Section 0 state to Context Manager | 🔴 PENDING | — | — |
| T3 | Upgrade first-turn signal extraction | 🔴 PENDING | — | — |
| T4 | Add TRID Gate before Q9 fires | 🔴 PENDING | — | — |
| T5 | Implement Q9-MULTI template selection | 🔴 PENDING | — | — |
| T6 | Implement Q9 standard open routing | 🔴 PENDING | — | — |
| T7 | Implement equity disambiguation flow | 🔴 PENDING | — | — |
| T8 | Implement fallback routing question | 🔴 PENDING | — | — |
| T9 | Implement mixed intent handling | 🔴 PENDING | — | — |
| T10 | Implement TT-CON / TT-HECM holdout | 🔴 PENDING | — | — |
| T11 | Implement Stage 1 gate (Q9_confirmed) | 🔴 PENDING | — | — |
| T12 | Create `stage0-routing.ts` prompt file | 🔴 PENDING | — | — |
| T13 | Wire Stage 0 into buildLayer2() | 🔴 PENDING | — | — |
| T14 | Add Section 0 block to Layer 3 context | 🔴 PENDING | — | — |
| T15 | Create section0-routing.test.ts (15 tests) | 🔴 PENDING | — | — |
| T16 | Register test suite in run-all-tests.ts | 🔴 PENDING | — | — |
| T17 | Local E2E testing (9 live scenarios) | 🔴 PENDING | — | — |

---

## 🗂️ Dependency Order (Safe Execution Sequence)

```
T1 (Schema)
  └─→ T2 (Context Manager State)
        └─→ T3 (First-Turn Extraction Upgrade)
              ├─→ T4 (TRID Gate)
              ├─→ T5 (Q9-MULTI Template Selection)
              ├─→ T6 (Q9 Open Routing)
              ├─→ T7 (Equity Disambiguation)
              ├─→ T8 (Fallback Routing)
              ├─→ T9 (Mixed Intent)
              └─→ T10 (TT-CON/TT-HECM Holdout)
                    └─→ T11 (Stage 1 Gate)
                          └─→ T12 (stage0-routing.ts prompt)
                                └─→ T13 (Wire into buildLayer2)
                                      └─→ T14 (Layer 3 context block)
                                            └─→ T15 (Tests)
                                                  └─→ T16 (Test runner)
                                                        └─→ T17 (Live E2E)
```

---

*ConvergentAI | Ailana v8.7 | Layer 0 Implementation Plan | October 2026 | Internal Use Only*

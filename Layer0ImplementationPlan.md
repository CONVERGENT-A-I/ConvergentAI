# Layer 0 (Section 0) Remediation & End-to-End Alignment Plan

**Project:** ConvergentAI | Ailana v8.7  
**Author:** Dev Team  
**Date:** October 28, 2026  
**Status:** 🟡 READY FOR IMPLEMENTATION  
**Goal:** Eliminate Section 0 repetitions, infinite loops, and amnesia across the full conversational lifecycle (Section 0 → Stage 1 → Stage 2).

---

## 1. Context & Diagnosis Summary

A forensic audit of live testing logs (`Logs2_parsed.txt`, October 28, 2026) revealed that while Section 0 front-loaded extraction executes in 1.1ms, the downstream architecture suffered from **7 critical regressions**:

| Problem Area | Observed Failure in Logs | Root Cause in Code |
| :--- | :--- | :--- |
| **P1. Infinite Fallback Loop** | In Session 1, the agent repeated *"No problem at all, let's figure it out together..."* 3 times in a row verbatim on turns with no signals. | `agent.ts:402-408` checks `if (profile.fallback_routing_delivered)` as a trigger to re-deliver fallback routing on every turn with 0 signals. |
| **P2. Unexecuted SR-1 Stall Recovery** | Context manager logged `⚠️ Unclear after fallback routing — route to stall recovery SR-1`, but agent re-delivered fallback instead of SR-1. | `agent.ts` has no execution branch for `SR-1`; it falls into the fallback loop. |
| **P3. Unrecognized Equity / Home Improvement Intent** | *"I have a mortgage and wanted to fix the garage"* produced 0 signals. | `extractOpeningSignals()` only matches financial jargon (`heloc`, `equity`), ignoring real-world intents like *"fix the garage"*, *"remodel"*, *"renovation"*. |
| **P4. Broken Income Regex** | *"150,000 dollars. yearly."* was ignored in Section 0 extraction. | Period in `dollars. yearly` and filler words broke regexes. *(Fixed in commit `58e1684`)*. |
| **P5. Procedural Turn Bypass** | *"So, how do I proceed?"* bypassed deterministic Section 0 template and caused LLM to re-ask purchase goal. | Blanket `t.includes('?')` treated turn as Q&A. *(Fixed in commit `58e1684` via `isProceduralOpening`)*. |
| **P6. Co-Borrower Re-Asked in Stage 1** | Turn 5 asked for co-borrower even though wife was mentioned in Turn 1. | 0ms fallback lookahead blindness in `injectFallbackForPendingField` + static numbered checklist in `stage1-greeting.ts`. *(Partially patched in `58e1684`, but 0ms lookahead and checklist contradiction remain)*. |
| **P7. Military History Re-Asked in Stage 2** | Turn 14 asked if borrower has military history even though veteran status was extracted in Turn 1. | `stage2-prequalification.ts` hardcodes a static 10-field checklist where field 9 is always `military_rural`, regardless of `profile.veteran_flagged`. |

---

## 2. Remediation Strategy & Phased Plan

The remediation is split into **4 focused, non-breaking phases**:

```
PHASE 1: Section 0 Core Routing Fixes (agent.ts & session-context-manager.ts)
  ├─ Fix infinite fallback loop (break on subsequent unclear turns)
  ├─ Implement SR-1 stall recovery delivery & MLO handoff
  └─ Add home improvement / remodel intent to equity signals

PHASE 2: Stage 1 Alignment & 0ms Fast-Path Lookahead
  ├─ Add optimistic lookahead in injectFallbackForPendingField()
  └─ Make buildStage1Instructions() checklist dynamic (omit confirmed fields)

PHASE 3: Stage 2 Amnesia Prevention (stage2-prequalification.ts)
  ├─ Dynamically omit military_rural from Stage 2 checklist when veteran_flagged === true
  └─ Dynamically omit gross_annual_income when income confirmed front-loaded

PHASE 4: Verification, Automated Regression Suite & Live Walkthrough
  ├─ Unit tests for fallback break, SR-1 delivery, equity intent, and checklist omission
  ├─ Full regression test (all 18 test suites passing)
  └─ Staging validation
```

---

## 3. Detailed Implementation Tasks

### 🔵 PHASE 1: Section 0 Core Routing Fixes

#### Task 1.1: Break Infinite Fallback Loop in `backend/src/agent.ts`
* **File:** `backend/src/agent.ts` (lines 400–416)
* **Action:**
  - Replace the flawed `if (profile.fallback_routing_delivered)` trigger.
  - Delivery sequence for 0 signals:
    1. **Turn 1 with 0 signals**: Deliver Standard Q9 (`getQ9StandardFormulation()`).
    2. **Turn 2 with 0 signals (response unclear)**: Deliver Fallback Routing (`getFallbackRoutingFormulation()`), set `profile.fallback_routing_delivered = true`.
    3. **Turn 3 with 0 signals (still unclear after fallback)**: Deliver **SR-1 Stall Recovery** formulation, set `profile.sr1_delivered = true`.
    4. **Turn 4 with 0 signals**: Trigger MLO Live Transfer / Handoff (`applyHoldoutRouting()`).
  - **Expected Outcome:** The agent will NEVER repeat the fallback formulation twice.

#### Task 1.2: Implement SR-1 Stall Recovery Delivery in `agent.ts`
* **File:** `backend/src/agent.ts` & `backend/src/context/session-context-manager.ts`
* **Action:**
  - Expose `getSR1RoutingFormulation()`:
    > *"To make sure I take you in the right direction, let's take a step back. Are you looking to buy a property, change the terms of your current home loan, or take cash out of the equity you already have?"*
  - When context manager returns `decision === 'UNCLEAR'` and `profile.fallback_routing_delivered === true`, deliver the SR-1 formulation via `createVerbatimStream()`.

#### Task 1.3: Add Home Improvement / Remodel Keywords to `extractOpeningSignals`
* **File:** `backend/src/context/session-context-manager.ts` (lines 121–131)
* **Action:**
  - In `extractOpeningSignals()`:
    Add patterns for home improvement / repair / garage / renovation in conjunction with home/mortgage:
    ```typescript
    if (/heloc|equity line|home equity line|line of credit/i.test(text)) {
      signals.push('TT-HEL');
    } else if (/home equity loan|lump sum|equity loan/i.test(text)) {
      signals.push('TT-HEQ');
    } else if (/\b(fix|repair|remodel|renovat|home improvement|garage|roof|patio|pool|addition)\b/i.test(text) && /\b(home|house|property|mortgage|equity)\b/i.test(text)) {
      signals.push('TT-HEL-AMBIG');
    } else if (/equity/i.test(text)) {
      signals.push('TT-HEL-AMBIG');
    }
    ```
  - **Expected Outcome:** *"So, I already have a mortgage and I wanted to like fix the garage"* immediately triggers `TT-HEL-AMBIG`, routing cleanly to Equity Disambiguation instead of looping in fallback.

---

### 🔵 PHASE 2: Stage 1 Alignment & 0ms Lookahead

#### Task 2.1: Add Optimistic Lookahead to `injectFallbackForPendingField()`
* **File:** `backend/src/context/session-context-manager.ts` (lines 1453–1530)
* **Action:**
  - When `field === 'timeline'` is answered at 0ms fast-path:
    Check if `this.profile.co_borrower_confirmed || this.profile.Q13_answered`:
    - Immediately advance stage: `this.activeStage = '2';`
    - Set pending field: `this.currentPendingField = 'gross_annual_income';`
    - Set mandatory transition bridge: `this.profile.bridge_to_say = 'stage1_to_stage2';`
  - **Expected Outcome:** When timeline is answered, the 0ms fast-path does not linger in Stage 1; it transitions directly into Stage 2 with the bridge, bypassing the co-borrower question entirely.

#### Task 2.2: Make `buildStage1Instructions()` Checklist Dynamically Filtered
* **File:** `backend/src/prompts/stage1-greeting.ts`
* **Action:**
  - Replace the hardcoded `GOAL: Learn (1)-(5)` string with a dynamically constructed list:
    ```typescript
    const pendingItems: string[] = [];
    if (!profile.mortgage_goal_confirmed) pendingItems.push('mortgage goal');
    if (!profile.occupancy_confirmed) pendingItems.push('occupancy type');
    if (!profile.existing_relationship_confirmed) pendingItems.push('existing relationship');
    if (!profile.timeline_confirmed) pendingItems.push('timeline');
    if (!profile.co_borrower_confirmed && !profile.Q13_answered) pendingItems.push('co-borrower status');
    ```
  - Format the `GOAL` line strictly with the uncollected items: `GOAL: Learn ${pendingItems.map((item, idx) => `(${idx + 1}) ${item}`).join(', ')}. Collect in that order.`
  - **Expected Outcome:** Eliminates contradictory instructions where item 5 was listed in the sequence but forbidden in the rules.

---

### 🔵 PHASE 3: Stage 2 Amnesia Prevention

#### Task 3.1: Dynamically Filter Stage 2 Numbered Checklist in `buildStage2Instructions()`
* **File:** `backend/src/prompts/stage2-prequalification.ts`
* **Action:**
  - In `buildStage2Instructions(profile)`:
    Check `profile.veteran_flagged || profile.military_rural_confirmed || profile.Q43_answered`:
    - If true: **Omit `military_rural`** from the numbered checklist!
    - Inject rule: `- VETERAN / MILITARY STATUS ALREADY CONFIRMED: The borrower has already confirmed military service history (${profile.military_rural || 'military'}). Do NOT ask about military service history. Q43 is strictly complete.`
  - Check `profile.gross_annual_income_confirmed || profile.Q35_answered`:
    - If true: **Omit `gross_annual_income`** from the numbered checklist and mark income as already verified in the prompt header.
  - Check `profile.down_payment_confirmed || profile.Q38_answered`:
    - If true: **Omit `down_payment`** from the numbered checklist.
  - **Expected Outcome:** When a borrower hesitates on property type / zip code, the LLM will NEVER ask about military history because `military_rural` is absent from its checklist.

---

### 🔵 PHASE 4: Verification & Automated Regression Testing

#### Task 4.1: Add Unit Tests to `section0-routing.test.ts`
* **File:** `backend/src/__tests__/section0-routing.test.ts`
* **Test Cases to Add:**
  - `S0-16`: Unclear response after fallback routing delivers SR-1 stall recovery (no loop).
  - `S0-17`: Repeated unclear response after SR-1 triggers MLO handoff.
  - `S0-18`: Home improvement / garage intent routes to `TT-HEL-AMBIG`.
  - `S0-19`: `injectFallbackForPendingField` advances Stage 1 → Stage 2 when `timeline` is answered and `co_borrower` is already confirmed.
  - `S0-20`: `buildStage2Instructions` excludes `military_rural` when `veteran_flagged === true`.

#### Task 4.2: Run Full Test Suite
* Run `npm test` across all 18 test suites to verify 0 regressions across Stage 1, Stage 2, Stage 2.5, Stage 3, and Stage 4.

#### Task 4.3: Live E2E Scenario Verification
* Re-run the exact user scenario:
  > *"Hi Elena, I want to buy a home. and me and my wife both will contribute to the mortgage. Also, we are both veterans and other than that, um, I'm salaried for the last 10 years and my wife is a doctor and we earn around combined around 150,000 dollars. yearly. So, how do I proceed?"*
* Verify:
  - Turn 1: Acknowledges purchase, co-borrower, veteran, and $150k income; asks occupancy.
  - Turn 2: Occupancy confirmed.
  - Turn 3: Existing relationship confirmed.
  - Turn 4: Timeline confirmed; transitions directly into Stage 2 financial bridge (co-borrower is NOT re-asked).
  - Turn 14: If property type is unsure, veteran history is NOT re-asked.

---

## 4. Rollout & Risk Management

* **Zero Regressions on Standard Flow**:
  - Clean borrowers who do not front-load continue down the standard Stage 1 → Stage 2 path untouched.
* **Strict Backward Compatibility**:
  - All existing Q-numbers, compliance disclosures, and credit pull flows remain unchanged.
* **Idempotent Profile Flags**:
  - Dynamic checklists inspect `_confirmed` and `Q*_answered` boolean flags that already exist on `BorrowerProfile`.

---

*Plan stored in `Layer0ImplementationPlan.md` — Ready for execution upon confirmation.*

# Affordability Panel — Implementation Plan

> **Status:** Implemented  
> **Scope:** Three distinct problems resolved together:
> 1. Credit score N/A display fixed in AffordabilityPanelNew and modal
> 2. Real-time background sync of slider & tab values to Ailana (`SYSTEM_PANEL_VALUES_UPDATE`)
> 3. Comprehensive screen layout reference added to Stage 2.5 prompts

---

## Overview: What Was Solved

The **Affordability Panel** is the interactive UI the borrower sees at **Stage 2.5**.  
It had 3 separate but related problems that have now been resolved:

| # | Problem | Resolution |
|---|---------|------------|
| 1 | **Credit Score showed "N/A"** in the panel — the prop was never passed | Derived `apCreditScore` from `borrowerProfile` and passed to `<AffordabilityPanelNew>` in both inline CTA and modal |
| 2 | **Panel values (sliders, selections) never reached Ailana** | Debounced `onValuesChange` (500ms) inside `<AffordabilityPanelNew>`, wired up via LiveKit data channel (`SYSTEM_PANEL_VALUES_UPDATE`), and handled silently in `backend/src/agent.ts` |
| 3 | **Ailana had no structural knowledge** of what is on the panel screen | Added track-aware `AFFORDABILITY PANEL — SCREEN LAYOUT REFERENCE` to `backend/src/prompts/stage25-affordability.ts` and updated `layer3-context.ts` to surface live slider state |

---

## Section 1: Problem Analysis

### Problem 1 — Credit Score Shows "N/A"

**Root Cause:** In `floating-cta/index.tsx`, the `<AffordabilityPanelNew>` component was rendered **without** a `creditScore` prop.
Inside the panel (`affordability-panel-new.tsx` L890):
```tsx
value={creditScore ? `${creditScore}` : "N/A"}
```
The `borrowerProfile` in the CTA component **does** have the data — it is stored as `credit_score`, `stated_credit_score`, `verified_credit_score`, or parseable from `credit_range`.

**The fix:** Extract the credit score from `borrowerProfile` and pass it as the `creditScore` prop in both `floating-cta/index.tsx` and `floating-cta/affordability-modal.tsx`.

---

### Problem 2 — Panel Slider Changes Never Reach Ailana

**Root Cause (two layers):**
- **Layer A (Inside panel component):** `onValuesChange` was destructured from props in `affordability-panel-new.tsx` but was never called.
- **Layer B (In CTA wrapper):** In `floating-cta/index.tsx`, `onValuesChange` was never passed, and no data channel message existed to notify the backend.

**The fix:**
1. Added a `useEffect` inside `affordability-panel-new.tsx` that calls `onValuesChange` when computed values change (debounced at 500ms).
2. Added `handlePanelValuesChange` handler in `floating-cta/index.tsx` that publishes `SYSTEM_PANEL_VALUES_UPDATE` via LiveKit data channel (`lkPublishData`, reliable: false).
3. Handled `SYSTEM_PANEL_VALUES_UPDATE` in `backend/src/agent.ts` to silently update `current_panel_values`, `affordability_purchase_price`, and `affordability_down_payment` without triggering a speech turn.

---

### Problem 3 — Ailana Lacked Structural Knowledge of the Panel UI

**Root Cause:** The Stage 2.5 block in `layer3-context.ts` only gave Ailana raw state flags without explaining the 6 sections of the panel, causing Ailana to be unable to explain cards, sliders, or the guideline banner.

**The fix:**
1. Updated `layer3-context.ts` so `stage25Block` includes the complete active slider state from `current_panel_values`.
2. Added a 6-section screen layout reference guide to `stage25-affordability.ts`.

---

## Section 2: Implementation Details

### 1. `src/components/affordability-panel-new.tsx`
- Debounced `useEffect` (500ms) calling `onValuesChange` with:
  - `mode`, `program`
  - `price`, `homeValue`, `downPayment`, `downPct`
  - `loanAmount`, `monthlyPayment`, `frontDti`, `backDti`, `ltv`, `cltv`, `lineAmount`

### 2. `src/components/floating-cta/index.tsx`
- Imported `type PanelValuesPayload`
- Derived `apCreditScore` from `borrowerProfile`:
  - `verified_credit_score`
  - `stated_credit_score`
  - `credit_score`
  - or parsed numeric value from `credit_range` (e.g. "720-739" -> 720)
- Implemented `handlePanelValuesChange` publishing `SYSTEM_PANEL_VALUES_UPDATE` over `lk-chat`
- Passed `creditScore={apCreditScore}` and `onValuesChange={handlePanelValuesChange}` to `<AffordabilityPanelNew>`

### 3. `src/components/floating-cta/affordability-modal.tsx`
- Derived `creditScore` from `borrowerProfile`
- Passed `creditScore={creditScore}` to `<AffordabilityPanelNew>`

### 4. `backend/src/agent.ts`
- Handled `parsed.message === 'SYSTEM_PANEL_VALUES_UPDATE'` in `ctx.room.on(RoomEvent.DataReceived)` and `registerTextStreamHandler`
- Updated `prof.current_panel_values`, `prof.affordability_purchase_price`, and `prof.affordability_down_payment`
- Refreshed prompt instructions via `updateSessionInstructions()`
- Added `current_panel_values` to `sendStageUpdate` payload
- Handled silently (no speech generation on slider movement)

### 5. `backend/src/prompts/layer3-context.ts`
- Expanded `stage25Block` to display the active slider state when `profile.current_panel_values` is populated

### 6. `backend/src/prompts/stage25-affordability.ts`
- Added `AFFORDABILITY PANEL — SCREEN LAYOUT REFERENCE` covering:
  1. Header (title, Stated vs. Verified badge, buttons)
  2. Three Hero Metric Cards (track-specific)
  3. Guideline Status Banner (green vs. amber)
  4. Your Financial Profile (income, credit score, down payment, taxes, ins, DTI/CLTV)
  5. Loan Program Cards / Payment Breakdown
  6. Adjust Scenario Assumptions Accordion
- Explicit rules on guiding the borrower without claiming to see their screen

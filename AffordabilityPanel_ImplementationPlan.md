# Affordability Panel v2 — Implementation Plan

**Spec:** [NewAffordPanelUI.md](NewAffordPanelUI.md) (David Patten, Nov 12 2026)
**Branch:** `dev`
**Owner:** Sohail-Ak

---

## Overview

Replace the current dense Affordability Summary (3 headline cards, 6-row financial profile, program cards with DTI/LTV rows, 7 visible sliders, "Outside of guidelines" wording) with David's simplified v2 panel: one headline card, one comparison bar, two visible sliders, a collapsed programs row, and plain-English status wording.

**Strategy:** Build and verify in the sandbox first with hardcoded values, get David's sign-off, then wire it into the real Ailana flow with live borrower data.

---

## Progress Tracker

| Phase | Description | Status | Tasks Done | Last Updated |
| :--- | :--- | :--- | :--- | :--- |
| 1 | New Panel Component (Sandbox, Purchase only) | **DONE** | 11/11 | 2026-11-15 |
| 2 | Sandbox Integration and David's Review | **DONE** (v1/v2 toggle wired, dark glass theme) | 6/6 | 2026-11-15 |
| 3 | Calculator Updates | **DONE** | 6/6 | 2026-11-15 |
| 4 | Ailana Prompting Revisions (Backend) | **DONE** | 12/12 | 2026-11-16 |
| 5 | Real Flow Integration | **DONE** (5.4 handled by ledger-sync; 5.8 N/A; 5.9 gated on sign-off) | 9/9 | 2026-11-16 |
| 6 | Testing and Sign-off | **IN PROGRESS** (6.9 analytics wired; 6.1–6.8, 6.10 need manual testing + David) | 1/10 | 2026-11-16 |

---

## What exists today

| File | What it does | Lines |
| :--- | :--- | :--- |
| `src/components/affordability-panel-new.tsx` | The main panel component (dark theme, 3 headline cards, 6 profile rows, program cards with DTI/LTV, 7 sliders, warning line, submit button) | ~1,399 |
| `src/app/sandbox/affordability/page.tsx` | Sandbox page at `/sandbox/affordability` with test controls | ~446 |
| `src/lib/affordability-calculator.ts` | Browser-side mortgage math (PI, tax, insurance, MI, DTI) | ~116 |
| `src/components/floating-cta/affordability-modal.tsx` | Wrapper that feeds borrower profile data into the panel inside the real Ailana flow | ~190 |
| `src/components/floating-cta/index.tsx` | Main widget — opens the affordability modal at Stage 5 | ~3,500 |

---

## Phases

### Phase 1: New Panel Component (Sandbox, Purchase only)

**Goal:** Build the v2 panel as a new component with the simplified layout, matching David's mockups. Verify in the sandbox with hardcoded demo values.

| # | Task | Details |
| :--- | :--- | :--- |
| 1.1 | Create `src/components/affordability-panel-v2.tsx` | New component, light theme. Do NOT modify the existing `affordability-panel-new.tsx` yet — both must coexist until David approves v2. | **DONE** |
| 1.2 | **Light theme design tokens** | Switch from dark navy to light theme per spec: Electric Blue `#2435F3`, Teal `#22C5CC`, Deep Navy `#061234`, Periwinkle `#8C95F1`, Amber for over-guideline. | **DONE** |
| 1.3 | **Headline card** | Single card with: Estimated Monthly Payment (large number), Estimated Cash to Close (range: down payment + 2%–3.5% of price for closing costs, rounded to nearest $500). One-line explainers under each. Price shown as context, not a headline. | **DONE** |
| 1.4 | **Loan programs row** | Collapsed by default: "Loan programs to explore (N)" with Show/Hide toggle. When opened, one factual line per program (Conventional, FHA, VA, USDA) + footer "Final eligibility and terms are decided by the lender." No DTI/LTV per program. | **DONE** |
| 1.5 | **Soft-check offer card** | "Want verified numbers?" card with "Check my numbers" button. Visible in stated mode only. Hidden in verified mode. | **DONE** |
| 1.6 | **Comparison card** | "How this compares" with: status chip ("At or under guideline" teal / "Over guideline" amber), one plain-English sentence, horizontal bar (0%–60% track, thin guideline tick, colored marker). Over-guideline planning sentence when applicable. | **DONE** |
| 1.7 | **Controls card** | Two visible sliders: Home Price ($200k–$1.2M, $5k steps), Down Payment (3%–30%, 0.5% steps, min follows program). "Based on what you shared" line showing income and debts with Edit link (stated mode). "More assumptions" collapsed toggle for rate, insurance, HOA sliders. | **DONE** |
| 1.8 | **Disclaimer footer** | Fixed wording from spec section 9. Stated-mode addition line. Pinned on desktop split screen, at scroll end on mobile/pop-up. | **DONE** |
| 1.9 | **Status logic** | Two states only. Comparison % = (monthly payment + monthly debts) / gross monthly income. Chip text + bar marker color change. No third state, no "not eligible", no hard-stop. | **DONE** |
| 1.10 | **Props contract** | Same props as existing panel: `transactionType`, `cashOutIntent`, `dataMode`, `income`, `monthlyDebts`, `initialAssumptions`, `onRequestSoftPull`. Add `onEditData` callback for the Edit link. Keep the interface backward-compatible. | **DONE** |
| 1.11 | **Accessibility** | Real `<button>` and `<input>` elements, 44px touch targets, 4.5:1 contrast, labeled sliders with visible values, status by words + position (not color alone). | **DONE** |

**Removed from the current panel (not in v2):**

- Home price as a headline figure (now context only)
- 6-row "Your Financial Profile" table with typical ranges
- "Typical Range" labels and progress bars
- Credit Score row
- DTI and LTV rows on program cards
- "Within / Outside of guidelines" per-program
- "Compensating factors" sentence
- Warning banner with exclamation icon
- 7 visible sliders (now 2 + 3 behind toggle)
- Three-zone gauge

---

### Phase 2: Sandbox Integration and David's Review

**Goal:** Wire v2 into the sandbox page so David can see it at `/sandbox/affordability` and sign off.

| # | Task | Details |
| :--- | :--- | :--- |
| 2.1 | Update `src/app/sandbox/affordability/page.tsx` | Add a toggle: "Panel Version: v1 / v2". Default to v2. v1 stays available for comparison. |
| 2.2 | **Desktop split screen** | Right-hand column, 480px, full height. Panel header: "Affordability Summary" + tag ("Your estimates" / "Verified") + close button. Body scrolls; disclaimer pinned as footer. Ailana line removed from panel on desktop (it becomes the avatar caption). |
| 2.3 | **Mobile/tablet pop-up** | Under 1024px: modal over conversation, full width on phones. Ailana line kept at top. Disclaimer at scroll end. Same panel content. |
| 2.4 | **Sandbox controls** | Keep: Data Mode toggle, Transaction Intent, Income, Debts, Down Payment, Program toggles. Add: "Reset to starting estimate" link inside More assumptions. |
| 2.5 | **Verified mode** | When toggled: tag changes to "Verified", soft-check card disappears, debts locked (Edit removed), footer addition removed. |
| 2.6 | **Over-guideline testing** | Sandbox controls let David push values into over-guideline state. Verify: amber chip, amber marker, planning sentence appears, nothing disabled. |

**Checkpoint:** David reviews at `/sandbox/affordability`. Must confirm:
- Headline card matches mockup
- Comparison bar and status chip work correctly
- Programs row collapsed/opened looks right
- Soft-check offer card placement
- Light theme colors correct
- Over-guideline state correct
- Wording matches spec section 9

---

### Phase 3: Calculator Updates

**Goal:** Ensure the math matches the spec and produces the figures David expects.

| # | Task | Details |
| :--- | :--- | :--- |
| 3.1 | **Cash to close formula** | Down payment + estimated 2%–3.5% of price for closing costs, rounded to nearest $500, shown as a range. Current calculator doesn't produce a range — add it. |
| 3.2 | **Mortgage insurance tiers** | Verify conventional PMI tiers match spec: 0% at LTV ≤ 80%, 0.30% at ≤ 85%, 0.51% at ≤ 90%, 0.70% at ≤ 95%, 0.90% above 95%. Current code uses a single 0.85% rate — update. |
| 3.3 | **Property tax default** | Spec says 0.84% of price/year (not the 1.2% in current calculator). Use spec value as the panel default; keep the ZIP-adjusted rates for the real flow. |
| 3.4 | **Insurance default** | $130/month per spec. Current code uses 0.5% of price — switch to the flat default for the panel. |
| 3.5 | **Guideline value** | One number per program from the engine. For sandbox: use 43% as the illustration (spec's example). In real flow: use per-program `dtiBack.guideline` from `PROGRAMS` config. |
| 3.6 | **Slider step sizes** | Verify: Price $5k steps, Down 0.5% steps, Rate 0.125% steps, Insurance $40–$400, HOA $0–$600. |

---

### Phase 4: Ailana Prompting Revisions (Backend)

**Goal:** Update Ailana's prompts to match the PR-1 through PR-11 entries in the spec. This is backend work in `backend/src/prompts/`.

| # | Task | Details |
| :--- | :--- | :--- |
| 4.1 | **PR-1: Opening the panel** | Replace Q46/Q46-S with stated and verified variants from spec. |
| 4.2 | **PR-2: Soft credit check offer** | Replace stated-mode upgrade narration. Use once after PR-1, repeat only if asked. |
| 4.3 | **PR-3: What can I change** | Replace Q47. Mention "More assumptions" toggle. |
| 4.4 | **PR-4: Narrating a change** | Replace Q48 band variants. Three cases: moves to at-or-under, moves to over, status unchanged. No specific percentage cited — figures are on screen. |
| 4.5 | **PR-5: Over-guideline check-in** | Replace Q50. Offer loan officer connection. |
| 4.6 | **PR-6: Submission invitation** | Update Q49 wording: "at or under guideline" replaces the old phrase. |
| 4.7 | **PR-7: Program row** | New. Announcing it + steering-safe response to "which program should I pick?" |
| 4.8 | **PR-8: Mortgage insurance** | Narrow Q53. Walk through by loan type. |
| 4.9 | **PR-9: Comparison/DTI explanation** | New, on request only. Plus compensating factors response. |
| 4.10 | **PR-10: Correcting income/debts** | Extend Q58 for stated mode. |
| 4.11 | **PR-11: Surface rules** | Desktop: spoken opener as avatar caption. Mobile/pop-up: text at panel top. Voice-only: unchanged. |
| 4.12 | **Wording compliance** | Status words must be exactly "at or under guideline" and "over guideline". Never "approved," "denied," "qualify," "not eligible," or "outside." Search and replace all instances. |

**Note:** Phase 4 depends on David confirming whether v8.8 has been applied. If not, apply Item 10 wording change first.

---

### Phase 5: Real Flow Integration

**Goal:** Replace the current affordability panel in the live Ailana conversation with the v2 panel, using real borrower data.

| # | Task | Details |
| :--- | :--- | :--- |
| 5.1 | **Update `affordability-modal.tsx`** | Switch from `AffordabilityPanelNew` to `AffordabilityPanelV2`. Map borrower profile data to v2 props. Income, debts, price, down payment come from the session. |
| 5.2 | **Desktop split screen in real flow** | Same 1024px breakpoint. Right column, 480px. Ailana line becomes avatar caption (not repeated in panel). |
| 5.3 | **Pop-up in real flow** | Under 1024px: modal with Ailana line at top. |
| 5.4 | **Data flow from Section 0** | When Section 0 is enabled, the Fact Ledger holds income, debts, price, down payment, location, etc. Wire these into the panel props instead of stage-table values when available. |
| 5.5 | **Soft-pull callback** | `onRequestSoftPull` triggers the existing soft-pull consent flow. Panel re-renders in verified mode when data arrives. |
| 5.6 | **Edit callback** | `onEditData` lets the user correct income/debts by tapping Edit (stated mode). Either opens an inline editor or sends a message to Ailana. |
| 5.7 | **Program selection** | Show all programs the borrower qualifies for based on their stated facts (military → VA, rural → USDA). Fixed order: Conventional, FHA, VA, USDA. No ranking or highlighting. |
| 5.8 | **Panel values data message** | Keep the existing `SYSTEM_AFFORD_VALUES` data message that syncs panel state to the backend, so Ailana knows what the user sees. |
| 5.9 | **Remove old panel** | Once v2 is live and verified, remove `affordability-panel-new.tsx` and update all imports. |

---

### Phase 6: Testing and Sign-off

| # | Task | Details |
| :--- | :--- | :--- |
| 6.1 | **Sandbox sign-off** | David tests at `/sandbox/affordability` with v2 toggle on. Confirms layout, wording, colors, states. |
| 6.2 | **Five-second test** | Show 5 first-time buyers the screen for 5 seconds. Ask what it tells them and what they'd tap. Repeat with over-guideline. |
| 6.3 | **Real flow test (Purchase)** | Start a Purchase conversation with Ailana. Reach Stage 5. Verify panel opens with real data, sliders work, comparison correct, soft-pull flow works. |
| 6.4 | **Desktop split screen test** | Verify at 1024px+ the panel is in the right column, Ailana caption shows the spoken text, disclaimer pinned. |
| 6.5 | **Mobile pop-up test** | Under 1024px, panel opens as modal, Ailana line at top, disclaimer at scroll end. |
| 6.6 | **Over-guideline flow** | Push a scenario over guideline. Verify amber state, planning sentence, PR-5 proactive check-in fires. |
| 6.7 | **Verified mode flow** | Run soft pull. Verify tag changes, offer card hidden, debts locked. |
| 6.8 | **Accessibility audit** | Tab through all controls. Check contrast. Verify screen reader labels on sliders and status. |
| 6.9 | **Analytics events** | Wire the events from spec section 12. Verify they fire. |
| 6.10 | **Compliance review** | Schedule one review with counsel covering all 6 flags from spec section 10. |

---

## Out of scope (this plan)

| Item | Why | When |
| :--- | :--- | :--- |
| Refinance layout | Spec says "Design Purchase first" (section 13 item 3) | After Purchase v2 is signed off |
| HELOC layout | Needs compliance review before adding (section 13 item 3) | After Purchase v2 + counsel |
| Server-side starting figures | Open decision (section 13 item 7) | After David confirms with Item 9 owner |
| Payment breakdown ("What's in this payment") | Recommended but not mocked (section 13 item 2) | After v2 ships, if David approves |
| Credit score in verified mode | Not mocked (section 13 item 8) | After verified mockup from David |
| MuhammadH database work (S0-20) | Separate plan | [Section0_DatabasePlan_MuhammadH.md](Section0_DatabasePlan_MuhammadH.md) |

---

## Dependencies and questions for David

| # | Question | Blocks |
| :--- | :--- | :--- |
| 1 | Has the v8.8 prompting package been applied to the live prompts? | Phase 4 (PR entries assume v8.8 is not yet live) |
| 2 | Which program should drive the headline payment number? | Phase 1.3 (currently uses whichever program is selected; spec section 13 item 1 says this needs a decision) |
| 3 | Should the "Check my numbers" button trigger the existing soft-pull consent flow, or a new one? | Phase 5.5 |
| 4 | What should "Edit" do on mobile — inline fields or tell Ailana? | Phase 5.6 |
| 5 | Compliance sign-off schedule for the 6 flags? | Phase 6.10 |
| 6 | Are the brand colors final? Electric Blue `#2435F3` is different from the current teal `#00B4D8`. | Phase 1.2 |

---

## File changes summary

| File | Change |
| :--- | :--- |
| `src/components/affordability-panel-v2.tsx` | **NEW** — the v2 panel component |
| `src/app/sandbox/affordability/page.tsx` | Add v1/v2 toggle, wire v2 |
| `src/lib/affordability-calculator.ts` | Update PMI tiers, add cash-to-close range, adjust defaults |
| `src/components/floating-cta/affordability-modal.tsx` | Switch to v2, update prop mapping |
| `src/components/floating-cta/index.tsx` | Minor: update import path |
| `backend/src/prompts/ailana-system.ts` | PR-1 through PR-11 wording |
| `backend/src/prompts/layer3-context.ts` | Stage 5 panel narration updates |
| `src/components/affordability-panel-new.tsx` | **DELETE** after v2 is live and confirmed |

---

## Execution order

```
Phase 1 (new component) → Phase 2 (sandbox) → David reviews sandbox
    ↓ (sign-off)
Phase 3 (calculator) → Phase 4 (prompts) → Phase 5 (real flow)
    ↓
Phase 6 (testing + compliance)
```

Phase 1 and 2 are the immediate work. Phase 3 can overlap with David's review. Phase 4 and 5 start after sandbox sign-off. Phase 6 runs throughout.

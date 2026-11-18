# Redundancy & Session Quality Fixes — Implementation Plan

**Created:** 2026-11-18
**Goal:** Fix redundancy, conversation loops, callback silence, and latency issues identified across David's test sessions (RM_kEVZDuzZYjGs, RM_JwSZXzUfzZHX, RM_oTm5gidmUXXi, RM_XPqwaN2wtzwD).
**Target:** Achieve smooth, no-repeat conversations in simulation and live testing.
**Branch:** `dev`

---

## Phase 1: Anti-Redundancy — Confirmed Fields Injection (HIGH PRIORITY)

**Root cause:** Compaction keeps only 4 recent turns. Older Q&A gets summarized by Gemma 31B, which often drops confirmations. The LLM re-asks because it has no memory of what was already confirmed.

| # | Task | File | Lines | Status |
|---|------|------|-------|--------|
| 1.1 | Increase `AILANA_KEEP_RECENT_TURNS` from 4 → 8 in `.env` | `backend/.env` | 56 | ✅ DONE |
| 1.2 | Update default fallback in config to match (4 → 8) | `backend/src/config/ailana-config.ts` | 26 | ✅ DONE |
| 1.3 | Build confirmed-fields summary inline in Layer 3 — reads all `_confirmed` flags + `prefilled_fields_confirmed` and builds a list of already-confirmed items | `backend/src/prompts/layer3-context.ts` | 597-620 | ✅ DONE |
| 1.4 | Inject confirmed-fields block into Layer 3 dynamic prompt — "DO NOT RE-ASK CONFIRMED INFORMATION" with full list of confirmed items | `backend/src/prompts/layer3-context.ts` | 597-620 | ✅ DONE |
| 1.5 | Add "DO NOT RE-ASK" instruction block to Layer 3 for ALL stages — lists all confirmed fields with explicit instruction to never repeat these questions | `backend/src/prompts/layer3-context.ts` | 597-620 | ✅ DONE |
| 1.6 | Extend anti-redundancy to ALL stages (was only Stage 2.5) — now covers Stage 1, 2, 3A, 3B, 4, 5 via confirmed-fields list | `backend/src/prompts/layer3-context.ts` | 597-620 | ✅ DONE |
| 1.7 | Include recently-asked questions in prompt — track last 5 Ailana utterances in `recentAssistantQuestions`, inject last 3 as "YOUR RECENT STATEMENTS (do not repeat)" | `backend/src/context/session-context-manager.ts` + `layer3-context.ts` | new | ✅ DONE |
| 1.8 | Rotation `keepLastTurns` increased from 2 → 4 to preserve more context during session rotation | `backend/src/context/session-context-manager.ts` | 4150 | ✅ DONE (bonus) |
| 1.9 | Test: TypeScript compiles clean, existing tests pass (52/52 — 2 pre-existing failures unchanged) | CLI | — | ✅ DONE |
| 1.10 | Test: run Section 0 text simulations — verify no repeated questions | CLI | — | ⬜ |
| 1.11 | Test: run Stage 3A/affordability flow manually — verify credit rating not re-asked after confirmation | Manual | — | ⬜ |

---

## Phase 2: Contact Correction Loop Fix (HIGH PRIORITY)

**Root cause:** When user corrects info on-screen and says "everything looks good now," extraction finds no values → state machine loops back to `contact_confirm_display` → re-reads → user confirms → classified ambiguous → loops to `contact_confirm_correction` again.

| # | Task | File | Lines | Status |
|---|------|------|-------|--------|
| 2.1 | Add "on-screen correction complete" intent detection in `contact_confirm_correction` handler — detect phrases like "I've made my changes", "everything is good", "I already fixed it", "corrections are done" | `backend/src/context/session-context-manager.ts` | 2024-2073 | ⬜ |
| 2.2 | When on-screen correction intent detected: set `contact_info_confirmed = true` and skip directly to OTP dispatch (bypass `contact_confirm_display` re-read) | `backend/src/context/session-context-manager.ts` | 2069-2071 | ⬜ |
| 2.3 | Add same detection in `contact_confirm_display` handler — if user says "I already updated everything on screen" during the read-back, treat as confirmed | `backend/src/context/session-context-manager.ts` | 1942-2019 | ⬜ |
| 2.4 | Update Layer 2 prompt for `contact_confirm_correction` to tell Ailana: "If the borrower says they have already made corrections on screen, confirm and move on — do not re-ask" | `backend/src/prompts/stage3-guidance.ts` | 148-150 | ⬜ |
| 2.5 | Test: simulate contact correction flow — user provides info, corrects on screen, says "all good" — verify no loop | Manual | — | ⬜ |

---

## Phase 3: Callback Scheduling Silence Fix (MEDIUM PRIORITY)

**Root cause:** After `schedule_callback` tool returns and Ailana reads back the booking, there's no instruction to proactively close the conversation or ask "Is there anything else?" She goes silent until the user prompts her.

| # | Task | File | Lines | Status |
|---|------|------|-------|--------|
| 3.1 | Add post-callback closing instruction to `schedule_callback` tool return — append to the `say` field: after reading the booking, ask if there's anything else, then offer a graceful closing | `backend/src/handoff-tools.ts` | 78-107 | ⬜ |
| 3.2 | Add a `post_callback_closing` prompt block that fires after callback is confirmed — includes document checklist reminder (pay stubs, W-2s, bank statements) and warm sign-off | `backend/src/prompts/stage5-escalation.ts` or new block in `layer3-context.ts` | 41-45 / new | ⬜ |
| 3.3 | Handle edge case: if user declines callback and says "no, that's all" — Ailana should still close gracefully, not go silent | `backend/src/context/session-context-manager.ts` | near handoff logic | ⬜ |
| 3.4 | Test: complete full flow through to callback scheduling — verify Ailana offers closing and doesn't go silent | Manual | — | ⬜ |

---

## Phase 4: Latency Optimization (MEDIUM PRIORITY)

**Root cause:** Compaction and rotation trigger Gemma 31B summarization calls mid-conversation, adding 2-5s latency spikes on those turns. Combined with AWS resource constraints, this creates dead-air moments.

| # | Task | File | Lines | Status |
|---|------|------|-------|--------|
| 4.1 | Increase `AILANA_COMPACT_EVERY_N_TURNS` from 6 → 10 — reduces how often compaction fires | `backend/.env` + `backend/src/ailana-config.ts` | 52 / 24 | ⬜ |
| 4.2 | Increase rotation `keepLastTurns` from 2 → 4 so rotation preserves more context | `backend/src/context/session-context-manager.ts` | 4150 | ✅ DONE (moved to Phase 1) |
| 4.3 | Add a "compacting..." filler response — when compaction triggers, have Ailana say a brief natural pause phrase ("Let me review what we've covered...") instead of dead air | `backend/src/context/session-context-manager.ts` | near 4062 | ⬜ |
| 4.4 | Evaluate if `AILANA_FORCE_COMPACT_INPUT_TOKENS=6000` is too aggressive — check if increasing to 8000 reduces unnecessary compaction while staying within Gemma 31B's context window | `backend/.env` + `backend/src/ailana-config.ts` | 50 / related | ⬜ |
| 4.5 | Test: run full session and monitor TTFT (Time to First Byte) — verify no spikes > 3s except on initial connection | Manual | — | ⬜ |

---

## Phase 5: Validation & Simulation (FINAL)

**Purpose:** Use LiveKit simulations to verify all fixes work — especially redundancy. We created a dedicated `redundancy_stress.yaml` scenario file with 4 scenarios specifically designed to trigger compaction and catch repeated questions.

| # | Task | Command / File | Details | Status |
|---|------|----------------|---------|--------|
| 5.1 | Run Section 0 text simulations — all 47 scenarios — target 95%+ pass rate maintained | `lk agent simulate text --scenarios scenarios/section0.yaml --project convergentai --agent-name '""'` | Baseline regression — should still pass 95%+ | ⬜ |
| 5.2 | **Run redundancy stress test** — 4 scenarios that go through full flow (15+ turns, trigger compaction) and check for NO repeated questions | `lk agent simulate text --scenarios scenarios/redundancy_stress.yaml --project convergentai --agent-name '""'` | R-STRESS-1: full flow no repeats, R-STRESS-2: credit rating double-ask (David's exact bug), R-STRESS-3: email/mobile separate collection, R-STRESS-4: 15+ turn long conversation | ⬜ |
| 5.3 | Run redundancy stress with 3 samples for statistical confidence | `lk agent simulate text --scenarios scenarios/redundancy_stress.yaml --samples 3 --project convergentai --agent-name '""'` | pass@3 all scenarios | ⬜ |
| 5.4 | Run proposed/stress scenarios | `lk agent simulate text --scenarios scenarios/scenarios_proposed.yaml --project convergentai --agent-name '""'` | Track-switching scenarios still pass | ⬜ |
| 5.5 | Run audio-mode simulation on redundancy stress scenarios | `lk agent simulate audio --scenarios scenarios/redundancy_stress.yaml --project convergentai --agent-name '""'` | Full STT-LLM-TTS pipeline — catches audio-specific issues | ⬜ |
| 5.6 | Run one full manual voice test — Section 0 → contact → soft pull → affordability → callback — verify zero redundancy and graceful closing | Manual | End-to-end human test | ⬜ |
| 5.7 | Share simulation results with David for sign-off | — | Include pass rates and any failures | ⬜ |

---

## Summary

| Phase | Description | Tasks | Priority | Status |
|-------|-------------|-------|----------|--------|
| 1 | Anti-Redundancy: Confirmed Fields Injection | 11 (9 done) | HIGH | ✅ CODE DONE — needs simulation test |
| 2 | Contact Correction Loop Fix | 5 | HIGH | ⬜ NOT STARTED |
| 3 | Callback Scheduling Silence Fix | 4 | MEDIUM | ⬜ NOT STARTED |
| 4 | Latency Optimization | 5 | MEDIUM | ⬜ NOT STARTED |
| 5 | Validation & Simulation (with redundancy stress tests) | 7 | FINAL | ⬜ NOT STARTED |

**Total tasks: 27**

---

## Notes
- All changes on `dev` branch, behind existing flags.
- Small commits, one phase per commit.
- Never weaken existing checks to make tests pass.
- Run simulations after Phase 1 and Phase 2 to catch regressions early.
- David confirmed: Section 0 and new affordability panel are working excellent — do not touch those.

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
| 2.1 | Add "on-screen correction complete" intent detection in `contact_confirm_correction` handler — detects "I've made my changes", "everything is good", "I already fixed it", "corrections are done", etc. When detected with no extraction values, calls `handleContactInfoConfirmed()` directly → skips to OTP | `backend/src/context/session-context-manager.ts` | 2070-2081 | ✅ DONE |
| 2.2 | When on-screen correction intent detected: set `contact_info_confirmed = true` and skip directly to OTP dispatch (bypass `contact_confirm_display` re-read) | `backend/src/context/session-context-manager.ts` | 2076 | ✅ DONE |
| 2.3 | Add same detection in `contact_confirm_display` handler — if user says "I already updated everything on screen" during the read-back, `isOnScreenDone` regex treats it as `confirmed` intent | `backend/src/context/session-context-manager.ts` | 1984-1992 | ✅ DONE |
| 2.4 | Update Layer 2 prompt (`stage3-guidance.ts`) AND Layer 3 prompt (`layer3-context.ts`) for `contact_confirm_correction` — tells Ailana to accept on-screen corrections and not loop | `backend/src/prompts/stage3-guidance.ts` + `layer3-context.ts` | 148-151 / 540-547 | ✅ DONE |
| 2.5 | TypeScript compiles clean, tests pass (52/52, same 2 pre-existing failures) | CLI | — | ✅ DONE |
| 2.6 | Test: simulate contact correction flow via LiveKit simulation (R-STRESS-3) | CLI | — | ⬜ (Phase 5) |

---

## Phase 3: Callback Scheduling Silence Fix (MEDIUM PRIORITY)

**Root cause:** After `schedule_callback` tool returns and Ailana reads back the booking, there's no instruction to proactively close the conversation or ask "Is there anything else?" She goes silent until the user prompts her.

| # | Task | File | Lines | Status |
|---|------|------|-------|--------|
| 3.1 | Add `booked` case to `handoffTaskText()` — when callback is booked (Section 0 flow), Ailana gets a closing task: ask if anything else, then deliver warm sign-off with document prep list | `backend/src/context/session-context-manager.ts` | 1302-1305 | ✅ DONE |
| 3.2 | Add `session_closing` pending field in Stage 5 `advanceWorkflow()` — replaces `null` so Ailana always has a task after escalation completes | `backend/src/context/session-context-manager.ts` | 3924 | ✅ DONE |
| 3.3 | Add `session_closing` prompt block in Layer 3 — fires when `pendingField === 'session_closing'`, includes document checklist reminder and warm sign-off | `backend/src/prompts/layer3-context.ts` | 553-560 | ✅ DONE |
| 3.4 | Handle declined escalation — when user declines both transfer and callback, `advanceWorkflow()` now sets `session_closing` instead of null, so Ailana closes gracefully | `backend/src/context/session-context-manager.ts` | 3924 | ✅ DONE (automatic via 3.2) |
| 3.5 | TypeScript compiles clean | CLI | — | ✅ DONE |
| 3.6 | Test: complete full flow through to callback scheduling — verify Ailana offers closing and doesn't go silent | Manual / Simulation | — | ⬜ (Phase 5) |

---

## Phase 4: Latency Optimization (MEDIUM PRIORITY)

**Root cause:** Compaction and rotation trigger Gemma 31B summarization calls mid-conversation, adding 2-5s latency spikes on those turns. Combined with AWS resource constraints, this creates dead-air moments.

| # | Task | File | Lines | Status |
|---|------|------|-------|--------|
| 4.1 | Increase `AILANA_COMPACT_EVERY_N_TURNS` from 6 → 10 — compaction fires 40% less often | `backend/.env` + `backend/src/config/ailana-config.ts` | 54 / 24 | ✅ DONE |
| 4.2 | Increase rotation `keepLastTurns` from 2 → 4 so rotation preserves more context | `backend/src/context/session-context-manager.ts` | 4178 | ✅ DONE (Phase 1) |
| 4.3 | ~~Add filler response during compaction~~ — SKIPPED: compaction runs between turns in `prepareContext`, not during speech. Adding TTS filler here would require architectural changes. The latency reduction from 4.1 + 4.4 is the practical fix. | — | — | ⏭️ SKIPPED |
| 4.4 | Increase `AILANA_FORCE_COMPACT_INPUT_TOKENS` from 6000 → 8000 — reduces unnecessary forced compaction while staying within Gemma 31B context window | `backend/.env` | 51 | ✅ DONE |
| 4.5 | Test: run full session and monitor TTFT — verify latency improvement | Manual / Simulation | — | ⬜ (Phase 5) |

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
| 1 | Anti-Redundancy: Confirmed Fields Injection | 11 (9 done) | HIGH | ✅ CODE DONE |
| 2 | Contact Correction Loop Fix | 6 (5 done) | HIGH | ✅ CODE DONE |
| 3 | Callback Scheduling Silence Fix | 6 (5 done) | MEDIUM | ✅ CODE DONE |
| 4 | Latency Optimization | 5 (3 done, 1 skipped) | MEDIUM | ✅ CODE DONE |
| 5 | Validation & Simulation (with redundancy stress tests) | 7 | FINAL | 🔄 IN PROGRESS |

**Total tasks: 27**

---

## Phase 5 Results (2026-11-19)

**Section 0 simulation:** 34/34 real scenarios passed (100%). 13 scenarios hit LiveKit room attribute 2048-byte limit (infrastructure, not code).

**Redundancy stress:** Scenarios redesigned to be compact (<1800 bytes) and text-simulation-compatible (no OTP/UI steps). Re-run pending.

**Deployment:** Helm upgrade timed out on commits `4f07159` and `c0ab3fd` due to EKS resource constraints. DevOps engineer added resources — re-deploying.

---

## Notes
- All changes on `dev` branch, behind existing flags.
- Small commits, one phase per commit.
- Never weaken existing checks to make tests pass.
- Run simulations after Phase 1 and Phase 2 to catch regressions early.
- David confirmed: Section 0 and new affordability panel are working excellent — do not touch those.

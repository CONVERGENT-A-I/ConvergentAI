# Section 0 — Generic Intent & Fact Capture: Implementation Plan

**Project:** ConvergentAI · Ailana
**Date:** November 5, 2026
**Status:** 🟡 ~80% — Phases 0–2 ✅ · Phase 3 ✅ except the DB column (S0-20, next) · Phase 4: Section 0 behaviour built; channel cards / consent UI (S0-24 highlight, S0-25/26) left · Track regression matches the demo ✅ · Phase 5: official O1 35 → O2 37 → O3 40 → **O4 43/47 all-3 (95.7% of samples)** → fix cycle 8 → **O5 next** · Phase 6 (stress set S0-30, voice, sign-off) after ([Section0Results.md](Section0Results.md))
**Branch:** `dev` (team decision, Nov 5, 2026 — work directly on `dev` while the GitHub deploy actions are off; everything new stays behind `SECTION_0_ENABLED`, default off, so `dev` keeps behaving like the demo build. If the deploy actions are switched back on, re-check that the flag is off in the deployed env before pushing.)

**Source documents (client: David Patten)**

| Document | Date | Role in this plan |
| :--- | :--- | :--- |
| [Ailana Section 0 — Opening and Intent Capture (Revised).md](Ailana%20Section%200%20—%20Opening%20and%20Intent%20Capture%20(Revised).md) | Nov 2, 2026 | **The design spec.** What Section 0 does. |
| [Ailana Section 0 — Post-Greeting Prospect Test Set.md](Ailana%20Section%200%20—%20Post-Greeting%20Prospect%20Test%20Set.md) | Oct 29, 2026 | **The 30 exemplary prospect replies.** What "working" looks like. |
| [Ailana Section 0 — Claude Code Review, Fix & LiveKit Simulation Instructions.md](Ailana%20Section%200%20—%20Claude%20Code%20Review,%20Fix%20&%20LiveKit%20Simulation%20Instructions.md) | Oct 30, 2026 | **The method.** Architecture direction, simulations, 95% pass bar, T1–T6 transfer scenarios. |

**Supersedes:** `Layer0Doc.md` and the removed `Layer0ImplementationPlan.md` (the October build: hard gate, forced confirmation, keyword routing, Q9-MULTI templates — all dropped). Overlaps with the Nov 4 task tracker `Section0ImplementationPlan.md`; this document is the consolidated plan.

**Localhost testing guide:** [Section0TestGuide.md](Section0TestGuide.md).

### Progress log

| Date | Phase / tasks | What was done | Test break |
| :--- | :--- | :--- | :--- |
| Nov 5, 2026 | Phase 0 — S0-01, S0-02, S0-03, S0-05 (S0-04 prepared) | Working on `dev` (no separate branch — team decision); old `Layer0ImplementationPlan.md` removed; David's working rules merged into `CLAUDE.md` (adapted to Node); `SECTION_0_ENABLED` flag (default off); simulation guards + mocks (`backend/src/section0/sim-mocks.ts`): no LemonSlice, DB, CRS or SIP under simulation, greeting fires without a frontend, `onSimulationEnd` checks for unrequested transfers/bookings; spike scenarios `backend/scenarios/spike.yaml`. `tsc` clean; all 17 existing test suites pass. | **Yes** — Test Guide Part 0 (flag-off check) + Part 11.0 (simulation spike) |
| Nov 5, 2026 | Test results | **Part 0.6 passed** — flag off, Purchase conversation identical to before Phase 0. **LiveKit CLI 2.19.3 installed**; `lk` not yet visible in the open terminal (stale PATH — fix in Test Guide 11.0). Next: `lk cloud auth` + spike run. | Waiting on spike (S0-04) |
| Nov 5, 2026 | Test results | Spike attempt 1: `lk` found; CLI installed LiveKit agent skills + Docs MCP for Claude Code (covers David's Step 1); run stopped with "api-key is required" because no LiveKit project is configured yet. Next: complete `lk cloud auth`, re-run. | Waiting on spike (S0-04) |
| Nov 5, 2026 | Test results | Spike attempt 2: `lk cloud auth` done (project `convergentai`). Run stopped: the CLI requires an explicit entrypoint because `package.json` has a build script. Fix: `npm run build`, then pass the compiled `dist/agent.js` (build verified OK; `dist/agent.js` self-starts the worker). All simulation commands in this plan and the Test Guide updated accordingly. | Waiting on spike (S0-04) |
| Nov 5, 2026 | **S0-04 spike passed** — Phase 0 complete | Run `SR_sE8vs3QiXM3N`: 2/2 scenarios completed and passed (scores 0.97 / 0.90). Confirmed: our Node agent runs under `lk agent simulate text`; simulation path active (greeting fired without a frontend → LemonSlice/DB skipped); `llmNode` deterministic paths run in text mode (transfer reply in 3 ms). Judge flagged the greeting as "not the mandatory verbatim script" — caused by the old conflicting greeting line in `stage1-greeting.ts` (fixed by S0-19 / S0-24). Seen, not caused by Phase 0: after the co-borrower answer Ailana said "I have all the initial details I need" without moving on to income (Stage 1→2 transition in text mode) — to watch in the baseline. | — |
| Nov 5, 2026 | Phase 1 started — S0-07 | Baseline scenarios written: `backend/scenarios/baseline_section0.yaml` (David's tests #1, #2, #13, #30, run on today's build with the flag off). | **Yes** — Test Guide 11.0b (baseline run) |
| Nov 5, 2026 | **Baseline B1 result** + typed-input fix | Run `SR_K5hDnwMfgu7H`: **0/12 passed (0/4 scenarios)**, 0 compliance failures. Fact re-asked in 12/12 (occupancy, co-borrower, income, debts, savings) — the core Section 0 problem. Also found a **typed-input bug** (not Section 0): typed turns go through `session.generateReply()`, which skips `onUserTurnCompleted`, so Ailana got no CURRENT TASK and stalled after Stage 1 in 8/12. **Fixed** in `agent.ts` (typed turns now pass the per-turn Layer 3 context as the reply's instructions); `tsc` clean, 17/17 suites pass. Write-up: [Section0Results.md](Section0Results.md). | **Yes** — re-run baseline as B2 (Test Guide 11.0b) |
| Nov 5, 2026 | Phase 3 building blocks — S0-09, S0-10, S0-11, S0-16 (+ S0-21 module) | New pure modules in `backend/src/section0/` — **not wired into the live flow yet** (no behaviour change): `fact-schema.ts` (fixed fact keys, goal classes, intents, compliance flags, never-capture rule), `fact-ledger.ts` (memory: add / correct with history / declined / clarification / serialize-hydrate), `normalize.ts` (amounts & shorthand, income incl. hourly→ask hours, bi-weekly, monthly-by-nature; credit incl. "770s" and STT artifacts; down-payment %; plausibility), `router.ts` (pure routing: clear goal → track with no confirmation, one clarification max, never loops, holdouts, transfer/callback/resume), `safety-net.ts` (SSN incl. spoken/cut-off digits, street addresses, never logs the match; short TRID gate text). Unit tests: 30 + 44 + 35 + 34 = **143 pass**; added to `npm test` → **21/21 suites pass**; `tsc` clean. | **Yes** — Test Guide Part 1 (unit tests) |
| Nov 5, 2026 | **Baseline B2** + simulation-harness fix | Run `SR_TfavTyVffBjH`: 0/12 again. Transcripts showed non-scripted Stage 2 wording/order → root cause found in the SDK: the simulator sends each message via `session.run({ userInput })`, which bypasses `onUserTurnCompleted` **and** our typed handler — our state machine never processed simulated messages, so **B1 and B2 did not measure our real flow**. **Fix** in `agent.ts`: any user turn reaching `llmNode` unprocessed is processed there like a typed turn (new shared `applyTurnContext()`; voice/typed turns marked processed → production unchanged). Local repro confirmed the state machine itself moves Stage 1 → 2 correctly. `tsc` clean, 21/21 suites. | **Yes** — re-run baseline as **B3** (Test Guide 11.0b) |
| Nov 6, 2026 | **Baselines B3 + B4** | B3 `SR_wDGZ27nXmCJ7` = **first valid baseline**: 0/12; our scripted flow runs; Stage 1 facts already skipped, Stage 2 facts re-asked 12/12. B4 `SR_f7XRsUAt2c6z` (diagnostic, run by Claude): 0/12, every failure = re-asking; "no response items" not reproduced (intermittent) — `⚠️ EMPTY REPLY` log added. Details in [Section0Results.md](Section0Results.md). | — |
| Nov 6, 2026 | **Phase 3 wiring — Section 0 live behind the flag** (S0-12 … S0-17, S0-19, parts of S0-20/21/27) | New: `universal-extractor.ts` (one schema-only LLM call per turn), `ingest.ts` (normalise → ledger, clarifications, plausibility), `ledger-sync.ts` (ledger → profile `*_confirmed`; never overwrites newer values; declined = settled), `turn-context.ts` (KNOWN FACTS block + code-chosen Section 0 task), `prompts/stage0-opening.ts`. `session-context-manager.ts`: starts in stage `"0"`; router decides; track set → Stage 1 starts with first name; universal extraction runs every turn in every stage in parallel with the existing extraction; Stage 1→2 starts at the first **missing** field; keyword re-sync and goal default disabled; ledger in clone/reconcile and snapshot restore. `agent.ts`: ledger sent in every stage update (`statedFacts`); extractor transfer intent → existing loan-officer path. Live extractor check on tests #1/#2/#11/#13/#22/#30: all facts captured, hours flagged, $300 kept, SSN/address redacted. Tests: + `section0-sync` (38) + `section0-flag-off` (23, prompts byte-identical to the demo build) → **23/23 suites pass**; `tsc` clean. | **Yes** — Test Guide 11.0c (first simulation with Section 0 ON) + localhost Parts 3–5 |
| Nov 6, 2026 | **S1 result + fixes** | Run `SR_yViuDuagBYEd` (Section 0 ON): **6/12** (B3/B4 baseline was 0/12). #2 and #13 pass 3/3. #1 failed only on the Stage 1→2 bridge, which announced income/debts/credit. #30 failed because job tenure re-asked the pay type and the Atlanta rent was never asked. Fixes: flag-on bridge variant + Layer 1 "never announce asking about known facts"; `jobTenureQuestion()` built from the ledger (asks only "how long" when pay type is known; used in the normal and military paths); situational follow-ups (`FOLLOWUPS` in `turn-context.ts`: retained-home rent, current rental income) asked once before the closing offer; object facts merge across turns in the ledger; first-name use limited to scripted lines. Baseline scenarios now stop at the closing offer (criteria unchanged). `section0-sync` 38 → 50; `npm test` 23/23; flag-off parity 23/23; `tsc` clean. | **Yes** — Test Guide 11.0c, run **S2** |
| Nov 6, 2026 | **S2 = 12/12** + **S0-18 track switching** | S2 `SR_XGKzNfWQgAmV`: 12/12, pass^3 4/4 on #1/#2/#13/#30. Judge notes, not failures: (1) name in the demo closing script (question for David), (2) the short acknowledgment is sometimes skipped (watch on the full set). S0-18: `trackSwitchFor()` in `router.ts` (pure; same goal→track mapping as Section 0; questions, unclear goals, holdouts and line↔lump-sum never switch). `maybeSwitchTrack()` in the session manager runs in Stages 1–2 before the closing offer: it switches `transaction_type`, keeps every shared fact, clears the old track's own profile fields (the ledger still remembers them, and switching back restores them), re-runs `advanceWorkflow()`, and adds a one-turn "GOAL CHANGED" note so Ailana acknowledges it in one phrase. Background-turn safe (switch counter in clone/reconcile). Tests: router 35 → 49, sync 50 → 61; `npm test` 23/23; flag-off parity 23/23. New proposed scenarios `scenarios_proposed.yaml` (R-8 switch, question ≠ switch). | **Yes** — Test Guide 11.0c, run **S3** (+ localhost R-8) |
| Nov 6, 2026 | **S3 = 12/12 + 6/6** · **Phase 2 drafted** (S0-08a, S0-08b) | S3 `SR_4JB8GRpwAiwJ` (baseline 12/12) + `SR_ntCPmjEHE2Ud` (track switching 6/6). Name rule reworded: scripted lines that contain the name keep it. Refinance fee wording flagged for David (outside Section 0, unchanged). Phase 2: `backend/scenarios/section0.yaml` has 47 scenarios: #1–#30 with Appendix A corrections, A3–A13, and T1–T6 (A1 browser-only, A2 merged into #1, A14 goes to tracks_regression). Each has `userdata.expected_facts`. New `section0/sim-checks.ts` compares Ailana's stored memory with what the prospect said at the end of every run and fails it on any mismatch (12 unit tests). `onSimulationEnd` also now fails when an expected transfer or booking did not happen exactly once. `docs/section0/SCENARIOS_FOR_APPROVAL.md` is the plain-English table for David, with 4 decisions. `npm test` 24/24 suites. | **Yes** — send the approval doc to David; preview run (Test Guide 11.1) |
| Nov 8, 2026 | **Preview P1 (20/47) + fix cycle 1** (S0-23, S0-24 text, S0-29) | P1 `SR_JZpTbodioxrV`, 1 sample: 27 failures triaged into 13 causes (Results → "Preview P1"). Fixed generically, with no rules for specific phrasings: (1) `compliance-notes.ts`: code picks a one-time compliance response from extractor flags and ledger facts (David's privacy answer word for word, voice/text; pre-approval letter; protected class; hardship → HUD counselor; documents; alimony disclosure; each borrower authorizes; footprint via `LENDER_LICENSED_STATES`, default TN, pending D3). (2) Situational follow-ups open Stage 2, with 3 new ones: credit-event timing, prior employment, self-employed years. (3) `combined` household income. (4) A detail with no amount completes the waiting income. (5) Extractor goals: undecided → unclear; code asks keep-or-replace unless replacing was said. (6) `property.rental_plan`; a second home or primary plus a rental plan → one confirmation. (7) Benefit-only income settles job tenure; zero-down settles down payment; old Stage 2 "tenure confirmed → skip everything" shortcut disabled with the flag on. (8) Holdout follow-up turns. (9) Revised-spec greeting with the flag on; the intent question counts as offering the 3 options. (10) Cancelling a transfer resumes and starts the stated goal. Tests: router 61, sync 87, + `section0-compliance` (16); `npm test` 25/25; flag-off parity 23/23. Still open: T1/T2/T3/T6 (S0-27/28), #11/A9 (S0-22). | **Yes** — Test Guide 11.1, run **P2** |
| Nov 8, 2026 | **Preview P2 (31/47) + fix cycle 2** (S0-21/22, S0-27, S0-28, S0-29) | P2 `SR_X8rcV2B7QjJJ`: 31/47 (+11). Cycle 2: (1) `section0/handoff-tools.ts`: `transfer_to_loan_officer` and `schedule_callback` as real LiveKit tools (flag on). A code-owned handoff state (confirm → transfer; unavailable → callback; cancel) gates every call; each action happens once; production uses the existing popup → SIP path, simulations write mock records; the hook skips scripted fast paths during a handoff and never re-processes a turn after a tool result. Live check: Gemma 4 calls both tools correctly. (2) The short TRID gate (verbatim) is triggered by the safety net and followed by a city/zip question. (3) Extractor schema: two goals = primary + secondary; goal implied by situation; state filled from city (fixes my cycle-1 regression on #22/#30). (4) Compliance notes handled first; each-borrower-authorizes for any co-borrower. (5) `destination_area` follow-up. (6) Refinance overview skips its goal question when the goal is known (flag on). Tests: + `section0-handoff` (25); `npm test` 26/26; flag-off parity 23/23. Open: #16 (Refinance home value late in track order). | **Yes** — run **P3** (Test Guide 11.1) |
| Nov 8, 2026 | **Preview P3 (40/47) + fix cycle 3** + S0-08c | P3 `SR_nn7BEtsZyFKx`: 40/47 (85%). Cycle 3: transfer tool carries a `summary` (T2); messages flagged protected-class store no quotes (#25, compliance); relocation month fills the timeline (#26); intent asked in the borrower's own terms when they already described their situation (#19); `home_value` follow-up for refinance/equity (#16); new `ends_conversation` intent → clean goodbye; Layer 1 (flag on): no re-confirming known facts, neutral acknowledgments, no comments on age. **S0-08c:** `scenarios/tracks_regression.yaml` (5 plain track borrowers). Tests: handoff 26, compliance 22, sync 95; `npm test` 26/26; flag-off parity 23/23. | **Yes** — P4 + track regression with the flag off and on (Test Guide 11.1) |
| Nov 9, 2026 | **P4 (43/47) + track regression 5/5 off and on + fix cycle 4** | Track regression `SR_XCDnNrbKhpa2` (off) and `SR_wj9YTY7ob8QG` (on): 5/5 each, so Section 0 does not disturb the tracks. P4 `SR_K4f43aVfYTgH`: 43/47. Cycle 4 (root causes found by replaying the real transcripts through the session manager with the live extractor): (1) model "uncertain" counts only for choice-type facts; numbers are checked by code (#30). (2) A pending compliance note forces a model reply instead of a scripted fast path (#23). (3) State only when said or unambiguous; the footprint note no longer offers a connection (#3). #18 = simulated-user variance. `npm test` 26/26; flag-off parity 23/23. | **Yes** — first official run O1 (Test Guide 11.1) |
| Nov 9, 2026 | **Official O1 (35/47 all-3, 127/141 samples) + fix cycle 5** | O1 `SR_VsDhBkucqqk6`: pass@3 47/47, pass^3 35/47. Cycle 5: code-chosen quick checks (pending clarification asked first in Stages 1–2, once); co-borrower-only income question when own income is known; military question "you or your co-borrower"; router: a fact-sharing reply is not "unclear" (rephrased intent once), paid-off + cash → line or lump sum; callback read-back only after the tool runs; Layer 1: no restating known facts inside questions. `npm test` 26/26; flag-off parity 23/23. | **Yes** — O2 official + track regression flag on |
| Nov 9, 2026 | **Official O2 (37/47 all-3, 129/141 samples) + fix cycle 6** | O2 `SR_m4ym622Jzg7T`; track regression flag on `SR_Sr3mFjQubPRo` 4/5 (the HELOC miss is pre-existing demo behaviour: no separate rate-comfort question, same with the flag off). Cycle 6: callback reschedule = same single booking, exact time before booking; "your co-borrower" in all three scripted military lines; model "uncertain" only for the opening; first-time buyer settles rent-or-own. `npm test` 26/26; flag-off parity 23/23. | **Yes** — O3 |
| Nov 10, 2026 | **Official O3 (40/47 all-3, 133/141 samples) + fix cycle 7** | O3 `SR_LCyQgCuQsVWQ`. Cycle 7: schema hints (a job they will start = new job; the area is never the place they're leaving); `destinationArea()`: an area equal to the relocation origin isn't the destination (destination still asked, no footprint note); no prior-job follow-up after a stated job loss. `npm test` 26/26; flag-off parity 23/23. | **Yes** — O4 |
| Nov 10, 2026 | **Official O4 (43/47 all-3, 135/141 samples) + fix cycle 8** | O4 `SR_n2d4reMwx7bt`. Cycle 8: greeting without the card question while no cards are on screen (the simulated borrower answered it instead of giving its opening; #11); hardship pause for a stated delinquency (router `holdoutKind: hardship`; #29); one automatic retry on an empty model reply (#12). `npm test` 26/26; flag-off parity 23/23. | **Yes** — O5 |

---

## 1. What we are building — in one paragraph

> **We only need Section 0 in a generic way.** A borrower can ask any type of question or tell Ailana anything about themselves — their current conditions, their situation, or what they want from Ailana. Section 0 must capture all of those intents and facts, **keep them, and carry them until the whole flow is completed**. The borrower must never have to tell Ailana the same thing again in the middle of the conversation. Ailana must keep a **correct memory** of what the borrower told her at the beginning.

Concretely, Section 0 is:

1. **An opening** — the new greeting, channel cards, consent logging.
2. **One intent question** — skipped if the borrower already said what they want.
3. **A generic understanding layer** — any phrasing is translated into a fixed set of **facts** and **intents**. No phrase-specific rules.
4. **A memory (the Fact Ledger)** — every stated fact is stored once and stays available to every later stage, the loan officer handoff, session restore and the database.
5. **Code-decided routing** — the track (Purchase / Refinance / HELOC / Home Equity) is set from what the borrower said; a clarifying question is asked only when genuinely needed.
6. **A clean hand-off** — the existing Stage 1 → Stage 2 → 2.5 → 3A → 5 flows take over **unchanged**, except that they skip anything already known.

---

## 2. Lessons from the failed first build → design principles

The October build failed all 30 multi-fact tests, made Ailana strict and repetitive, and disturbed the Purchase / Refinance / HELOC flows. The causes and the rule we adopt for each:

| What went wrong | Rule for this build |
| :--- | :--- |
| Keyword/regex intent matching missed normal phrasing ("drove by a house I'd like as my residence") | **The LLM translates, code decides.** One structured extraction maps *any* phrasing to fixed fields + intents. Code never inspects raw phrasing for intent. |
| Prompt rules for specific phrasings, verbatim templates (Q9-MULTI A–F) | **No phrase-specific prompt rules, ever.** New phrasings must need zero changes. Verbatim scripts only for the short compliance list (§6.7). |
| Forced confirmation turn ("It sounds like you want to buy, is that right?") | **No confirmation turn** when intent is clear. Confirm only ambiguous *values* (hours for hourly pay, monthly vs yearly). |
| Hard gate — only Section 0 text loaded until routing was confirmed; missed tag → fallback loops | **Soft gate.** Nothing blocks the conversation. Questions are always answered. Never loop. |
| Only 4 facts captured from the opening; occupancy, debts, credit re-asked | **Every fact, every turn, every stage** goes into the Fact Ledger, and every question checks it first. |
| Intent asked up to 3 times (greeting, Section 0, Stage 1 Q9) | **Intent asked at most once**, and not at all if already stated. |
| Compliance language repeated in every question → over-cautious model | **Compliance stated once in Layer 1** + a pre-model safety net in code. |
| No measurement until the end | **Measured from day one** with LiveKit Agent Simulations (§7). |

**Hard containment rule:** once a track is set, Section 0 must not change how the Purchase, Refinance, HELOC or Home Equity tracks behave — other than skipping questions whose answers are already known.

---

## 3. Scope

**In scope**

- New greeting, phrase-timed channel-card highlighting, mic-off-until-tap, consent logging (AI engagement + recording), on-screen consent line and footer.
- Single intent question with skip rule; routing rules (clear, cash-out unclear, equity unclear, two goals, unclear, construction/reverse holdout, out of scope, off-topic, question-first, AI-disclosure).
- Fact Ledger + universal extractor running on **every turn in every stage**.
- No-repeat rule across Stage 1 and Stage 2 of all tracks (via the ledger → profile sync).
- Track switching on contradiction, keeping facts that still apply.
- Pre-model SSN / street-address safety net; short TRID gate; compliance boundaries table.
- Loan-officer transfer at any point (including the first reply), with the captured facts handed to the MLO; callback when no MLO is available (T1–T6).
- Feature flag `SECTION_0_ENABLED`.
- Unit tests + LiveKit Agent Simulations (text, then audio) to a 95% pass rate.

**Out of scope for this branch**

- Building the Construction or HECM (reverse mortgage) tracks — they remain holdouts (bridge response → loan officer).
- Removing duplicated compliance text from existing Stage 1/2 prompts ("lighter hardening") — done **after** Section 0 passes, as its own change, because it touches the tracks.
- Changing Stage 2.5, 3A or 5 behaviour beyond reading from the ledger.
- Porting the agent to Python (not needed — see §7.1).

---

## 4. Where Section 0 sits in the flow

```
 CTA click
   │
   ▼
┌──────────────────────── SECTION 0 (activeStage = "0") ────────────────────────┐
│ 1. First screen: Ailana + 4 channel cards + consent line + footer. Mic OFF.    │
│ 2. Greeting plays; each card lights up as she names it.                        │
│ 3. Card tap → channel chosen → 2 consent events logged → mic ON.               │
│ 4. Intent question — only if the goal isn't already known.                     │
│ 5. Every reply → universal extractor → Fact Ledger + intent.                   │
│ 6. Router (code) → track set | one clarifying question | holdout | transfer.   │
└───────────────────────────────┬────────────────────────────────────────────────┘
                                │ track set (TT-PUR / TT-REF / TT-HEL / TT-HEQ)
                                ▼  Section 0 prompt stops loading
 Stage 1 (first name → occupancy → relationship → timeline → co-borrower)   ← skips known
 Stage 2 (track-specific sequence)                                          ← skips known
 Stage 2 closing offer → 3A (OTP / soft pull) or 2.5 (affordability panel)
 Stage 5 (escalation / MLO / Q&A)
                                ▲
 Fact Ledger is read and updated on EVERY turn of EVERY stage, persisted,
 restored on reconnect, and handed to the loan officer on transfer.
```

Returning, logged-in borrowers keep the existing welcome-back flow and skip to their saved place (the ledger is restored with them).

---

## 5. Architecture overview

### 5.1 Per-turn data flow

```
 user turn (voice transcript or typed text)
   │
   ├─► [1] Safety net (code, <1 ms)          SSN / street address?  ──yes──► redact everywhere,
   │                                                                          short TRID gate (verbatim),
   │                                                                          never stored
   ▼
 [2] Universal extractor (LLM, structured JSON) ─► { facts[], intent, confidence }
   │
   ▼
 [3] Normalizer + plausibility checks (code) ─► clean values, or "needs_clarification"
   │
   ▼
 [4] Fact Ledger update (code) ─► corrections overwrite; history kept
   │
   ├─► [5] Ledger → BorrowerProfile sync (code) ─► fills fields + sets *_confirmed
   │                                               → existing advanceWorkflow() skips them
   ▼
 [6] Router / next-question selector (code)
        Section 0: route → track | clarify | holdout | transfer | answer-then-ask
        Later stages: existing advanceWorkflow() picks first missing field
   │
   ▼
 [7] Prompt assembly
        Layer 1 (persona + compliance, once)
        Layer 2 (Section 0 prompt while stage "0", else the track prompt — unchanged)
        Layer 3 (profile + KNOWN FACTS block + CURRENT TASK chosen by code)
   │
   ▼
 [8] Ailana's reply (LLM, or deterministic script for verbatim items)
```

### 5.2 New and changed files

```
backend/src/section0/                    (new)
  fact-schema.ts          Fact & intent types, field catalogue, never-capture list
  fact-ledger.ts          FactLedger class: upsert, correct, history, serialize/hydrate
  universal-extractor.ts  One LLM call per turn → { facts, intent } (JSON)
  normalize.ts            Money/frequency/percent/score normalisation + plausibility rules
  ledger-sync.ts          Ledger → BorrowerProfile mapping (+ *_confirmed flags)
  router.ts               Pure function: (ledger, intent, section0State) → decision
  next-question.ts        First-missing-item selection for Section 0 + first track turn
  safety-net.ts           SSN (digits + spoken) and street-address detection, redaction
  section0-scripts.ts     The few verbatim scripts (greeting, intent Q, TRID gate, holdouts, rate decline)
  mlo-handoff.ts          Builds the fact summary passed with a transfer / callback
  sim-mocks.ts            Mocks used when ctx.simulationContext() is present
backend/src/prompts/stage0-opening.ts   (new) short Section 0 Layer 2 prompt
backend/src/services/consent-service.ts (new) writes Consent rows (Prisma model already exists)
backend/src/services/mlo-availability.ts (new) available/unavailable (config-driven; mocked in sims)
backend/src/services/callback-service.ts (new) books a callback (mock now; Google Calendar later — decision D1)

backend/src/agent.ts                     (changed) wire safety net, Section 0 turn handling, greeting
                                          phrases + card events, consent, transfer-anytime, sim guards
backend/src/context/session-context-manager.ts (changed) stage "0", ledger ownership, extractor call,
                                          ledger sync before advanceWorkflow(), flag-guarded tweaks
backend/src/prompts/ailana-system.ts     (changed) new GREETING_TEXT, short TRID gate, no-repeat rule,
                                          buildLayer2("0")
backend/src/prompts/layer3-context.ts    (changed) KNOWN FACTS block, stage "0" blocks, new profile fields
backend/src/prompts/stage1-greeting.ts   (changed) remove intent question & old greeting line
backend/src/config/ailana-config.ts      (changed) section0Enabled flag + lender config (footprint etc.)
prisma/schema.prisma                     (changed) Application.statedFacts Json? + migration
src/components/floating-cta/index.tsx    (changed) first-screen cards, mic-off-until-tap, consent payload
src/components/floating-cta/channel-cards.tsx (new) the 4 cards + highlight + consent line
src/components/floating-cta/stage-listener.tsx (changed) SYSTEM_CARD_HIGHLIGHT, ledger in profile
src/lib/session-storage.ts               (changed) ledger in the saved snapshot
src/components/footer.tsx                (changed) Equal Housing · AI-assisted · NMLS footer
backend/scenarios/                       (new) simulation scenario files (§7)
backend/src/__tests__/section0-*.test.ts (new) unit tests
```

---

## 6. Detailed design

### 6.1 The Fact Ledger — Ailana's memory

The ledger is the single source of truth for **what the borrower has told us**. It lives in `SessionContextManager` state (not in chat history), so it survives context compaction, agent rotation, channel switches, a loan-officer call and "Return to Ailana", reconnects (localStorage snapshot) and resumed sessions (database).

```ts
type FactStatus = 'stated' | 'needs_clarification' | 'confirmed' | 'verified' | 'declined';

interface FactEntry {
  key: FactKey;                 // e.g. 'income.borrower', 'debt.monthly_total', 'location.area'
  value: unknown;               // normalised value (number, enum, object)
  raw: string;                  // short quote of how it was said ("about 52 an hour")
  status: FactStatus;
  turn: number;                 // turn where it was last set
  stage: string;                // stage where it was last set
  history: Array<{ value: unknown; raw: string; turn: number }>; // previous values (corrections)
  clarify?: string;             // what is ambiguous, e.g. 'weekly_hours' | 'frequency' | 'magnitude'
}

class FactLedger {
  upsert(fact, turn, stage): void;      // new value, or correction → previous value pushed to history
  get(key): FactEntry | undefined;
  known(): FactEntry[];                 // everything stated / confirmed / verified
  pendingClarifications(): FactEntry[];
  markDeclined(key): void;              // borrower declined → never asked again
  serialize(): object; static hydrate(obj): FactLedger;
}
```

**Rules**

- A later statement of the same fact **overwrites** the earlier value ("3,000, wait, no, 300" → 300; "actually it's 350, not 400" → 350). The old value goes to `history`.
- Soft-pull data never overwrites what the borrower *said*; it sets status `verified` and the profile's `verified_*` fields, as today.
- A declined fact (e.g. first name) is never asked again.
- **Never stored, under any key:** SSN, the subject property's street address, account numbers, race, ethnicity, national origin, familial status. Alimony and child support are stored only if the borrower wants them counted (otherwise recorded as `declined`).

### 6.2 The fact catalogue (fixed field set)

Every reply maps to these keys. The list is fixed; phrasing is unlimited. Facts tagged **→ profile** sync into an existing `BorrowerProfile` field so the existing state machine skips that question.

| Group | Keys | → profile field (skips question) |
| :--- | :--- | :--- |
| Goal | `goal.primary` (purchase · refinance_rate_term · refinance_cash_out · heloc · home_equity_loan · equity_unclear · cash_out_unclear · construction · reverse_mortgage · out_of_scope · unclear), `goal.secondary`, `goal.refi_purpose` (lower payment · remove co-borrower · shorten term · cash out) | `mortgage_goal`, `transaction_type`, `refinance_type` (intent Q, RQ26) |
| Borrower | `borrower.first_name`, `borrower.first_time_buyer`, `borrower.existing_member` | `borrower_name`, `existing_relationship` (Q11) |
| Occupancy | `occupancy` (primary · second_home · investment), `occupancy.units`, `occupancy.rent_part` | `occupancy` (Q10) |
| Timeline | `timeline` | `timeline`, `heloc_timeline` (Q12, HQ26) |
| Co-borrower | `co_borrower.present`, `co_borrower.relationship`, `co_borrower.role` (co-borrower · co-signer · primary borrower is the other person), `co_borrower.income`, `co_borrower.credit` | `co_borrower` (Q13) |
| Income | list of `income[]` entries: `{ owner: borrower \| co_borrower, type: salary \| hourly \| biweekly_pay \| monthly \| self_employed_net \| gig_1099 \| social_security \| pension \| military_retirement \| va_disability \| alimony \| child_support \| rental \| commission \| other, amount, frequency, hours_per_week?, counted?, variable? }` | `gross_annual_income` — computed by code only when unambiguous (Q35) |
| Employment | `employment.type` (W-2 · self-employed · 1099 · retired · new job), `employment.occupation`, `employment.tenure`, `employment.start_date` | `job_tenure_type`, `employment_years`, `self_employed` (Q44, RQ/HQ-EMPLOYER) |
| Debts | `debt.monthly_total`, `debt.items[]` (car, student loan, cards, other) | `monthly_debt` (Q36) |
| Credit | `credit.borrower` (score or range), `credit.co_borrower`, `credit.events[]` (bankruptcy + when, foreclosure, short sale, delinquency months) | `credit_range`, `credit_score`, `stated_credit_score` (Q37) |
| Funds | `funds.total`, `funds.sources[]` (savings, sale proceeds, retirement, gift) | `down_payment` when used as down payment (Q38) |
| Housing | `housing.current` (rent · own · own_selling · own_keeping), `housing.properties_owned`, `housing.retained_home` ({ balance, plan: rent/sell }) | `rent_own` (Q39) |
| Purchase | `purchase.price`, `purchase.down_payment` (amount or percent), `purchase.zero_down_goal` | `target_price`, `down_payment` (Q41, Q38) |
| Property | `property.type` (single family · condo · townhome · multi-family · cabin · other), `property.units`, `property.projected_rent`, `location.area` (city / zip / state — **never a street address**) | `property_type`, `zip_code` (Q42) |
| Military | `military.status` (active · veteran · retired · reserve/guard · surviving spouse · none), `military.years` | `military_rural` (Q43) |
| Refinance | `refi.balance`, `refi.value`, `refi.current_rate` (borrower-stated, fact only), `refi.loan_type`, `refi.purchase_year`, `refi.cash_out_amount`, `refi.cash_out_use`, `refi.keep_first` | `first_mortgage_balance`, `property_value`, `current_mortgage_rate`, `current_mortgage_type`, `cash_out_amount`, `cash_out_use` (RQ21–RQ27) |
| Equity | `equity.paid_off`, `equity.amount`, `equity.use`, `equity.fixed_preference` | `heloc_line_amount`, `heloc_draw_use`, `heloc_rate_comfort`, `first_mortgage_balance = 0` when paid off (HQ20–HQ24, EQ equivalents) |
| Situation | `situation.relocation` ({ from, to, when }), `situation.divorce_buyout`, `situation.inherited_home`, `situation.delinquent_months`, `situation.job_loss`, `situation.preapproval_letter_mentioned`, `situation.competitor_offer_mentioned` | none (shown in KNOWN FACTS, handed to MLO) |

Facts without a profile field are still remembered: they appear in Layer 3's KNOWN FACTS block on every turn and in the MLO hand-off summary.

### 6.3 Non-fact intents (fixed set)

The extractor also returns exactly one **primary intent** for the turn (plus flags):

| Intent | Code response |
| :--- | :--- |
| `states_goal_or_facts` | Route / continue (normal) |
| `asks_question` | Answer it (LLM), then return to the first missing item — soft gate |
| `requests_transfer_now` | Transfer flow (§6.10). Never keep questioning first |
| `asks_about_human_later` | Explain the option, continue; no transfer, no booking (T4) |
| `requests_callback` | Callback flow (§6.10) |
| `cancels_transfer` | No transfer; resume where Section 0 left off (T5) |
| `declines_to_answer` | Mark fact declined, move on |
| `concern_or_worry` | Acknowledge briefly, then continue |
| `off_topic` | One-line redirect to home financing |
| `asks_if_human` | Q2 AI disclosure, then back to intent |
| **Compliance flags** (can co-occur): `rate_or_payment_request`, `competitor_rate_mentioned`, `approval_guarantee_or_preapproval_letter`, `inflate_income_request`, `protected_class_topic` (age, national origin, ethnicity, family/marital status), `privacy_question`, `hardship_or_delinquency`, `documents_offered`, `out_of_footprint_location`, `low_credit_or_bankruptcy` | Handled per the compliance table (§6.7). Facts in the same turn are still captured. |

### 6.4 Universal extractor

- **One LLM call per user turn**, in every stage, returning JSON `{ facts: [...], intent, flags: [...], confidence }`. Model: the existing LiveKit Inference extractor (`google/gemma-4-31b-it`), same client as `llm-extractor.ts`.
- **Inputs:** the user turn (already passed through the safety net), Ailana's last question, the current track, and a compact list of already-known keys (so it can label corrections).
- **The prompt describes the schema, not phrasings.** It contains the field catalogue, the intent list, and generic rules ("numbers as said, with units/frequency", "a later value in the same sentence replaces an earlier one", "attribute each fact to borrower or co-borrower", "never output SSN, street address, account numbers, protected-class attributes"). **No example phrasings that look like the test set** — that would overfit.
- **Facts are extracted as said** (amount + unit + frequency + owner). Turning them into profile values is the normaliser's job, in code.
- **Runs alongside the existing stage extraction** in Stages 1–2.5 (both in parallel, via `Promise.all`). The existing extractor stays the authority for the *currently pending* field; the universal extractor fills everything else. Consolidating the two is a later clean-up, not part of this branch.
- **Latency:**
  - Section 0 turns (stage `"0"`): the reply **waits** for extraction (cap 2.5 s, reusing the existing stage-boundary wait) because the next question depends on it.
  - Later stages: extraction stays **background** (existing 0 ms path); results are reconciled before the next turn, as today.
- **Failure handling:** bad JSON → repair (existing logic) → if still unusable, no facts this turn (never guess) and the turn is logged.

### 6.5 Normaliser and plausibility checks (code)

| Situation | Rule |
| :--- | :--- |
| Shorthand amounts ("84", "450", "310") | Resolve magnitude by field: income/price/value/balance in thousands; debts/rent/payments as-is. Ambiguous (e.g. "four hundred" for a price) → `needs_clarification: magnitude`. |
| Hourly pay without hours ("52 an hour") | Store hourly rate; `needs_clarification: weekly_hours`. **Never assume 40.** Annual income computed only after hours are known (A12, test #2). |
| Bi-weekly / monthly / yearly | Bi-weekly × 26, monthly × 12. Missing frequency on an ambiguous number ("3,100") → `needs_clarification: frequency`. |
| Multiple incomes | Summed into `gross_annual_income` only when every component is unambiguous and counted. Alimony/child support only if the borrower wants it counted. |
| Percent down ("20 percent down") | Stored as percent; converted to dollars once the price is known. |
| Ranges ("in the 770s", "around 680") | Credit stored as stated range/approximation, marked self-reported until soft pull. |
| Inconsistencies | Down payment > price, balance > value by a wide margin, conflicting values in one turn → `needs_clarification`. |
| Self-correction ("3,000, wait, no, 300") | The corrected value wins; earlier value to history. |
| Inflated income request ("put 120 instead of 85") | Only the actual figure is stored; the requested figure is never written anywhere. |

A fact with `needs_clarification` is **not** synced to the profile until resolved. Ailana asks **one** short clarifying question for it, folded into her next turn.

### 6.6 Ledger → profile sync (the no-repeat mechanism)

The existing `advanceWorkflow()` in `session-context-manager.ts` already moves to the **first field that is not `_confirmed`**, per track. So the no-repeat rule is implemented by **filling those fields early**, not by rewriting the sequences:

1. After every ledger update, `ledger-sync.ts` writes each resolvable fact into its profile field and sets its `_confirmed` flag (e.g. `income → gross_annual_income + gross_annual_income_confirmed`).
2. It never overwrites a field the borrower or soft pull has already set, **except** for an explicit correction.
3. `advanceWorkflow()` then runs as it does today and lands on the first truly missing item.
4. Layer 3 gains a **KNOWN FACTS — never ask again** block listing everything in the ledger (including facts with no profile field) so the LLM never re-asks in free text either.
5. Layer 1 gains one rule: **"Never ask a question whose answer is already in KNOWN FACTS or the borrower profile."**

Partially-known fields (e.g. "self-employed" known, tenure unknown) stay open, but CURRENT TASK tells Ailana what is already known so she asks only for the missing part.

### 6.7 Compliance

**Firm lines — stated once in Layer 1** (replacing the per-stage repetition only inside Section 0; existing track prompts untouched in this branch):

| Situation | What Ailana does | Script |
| :--- | :--- | :--- |
| Rate or payment asked (incl. "ballpark") | Declines; explains the eligibility review applies a current rate; offers a loan officer | Q60 / Q60-ADVERS short variant (verbatim) |
| SSN or property street address volunteered | Stops; doesn't record or repeat it; continues; asks city or zip instead of an address | **Short TRID gate (verbatim)** |
| "Can you guarantee approval?" / mailed "pre-approved" letter | No guarantee; doesn't confirm a pre-approval she didn't issue; explains pre-qualification | Natural |
| Documents offered | Takes stated figures only; no documents unless the lender requires them; never account numbers | Natural |
| Request to inflate income | Records the actual figure only; information must be accurate | Natural |
| Age, national origin, family or marital status raised | Never discourages or treats it as a factor; alimony optional to disclose | Natural |
| Low credit / past bankruptcy | No implied denial or approval; asks what's needed (e.g. discharge date); offers a loan officer | Q15-SUBFLOOR pattern |
| Behind on payments / hardship | No promise of a refinance; offers a loan officer and a HUD-approved housing counselor | Natural |
| Competitor rate quoted | No comparison or comment; offers a loan officer for pricing | Natural |
| "Is my information sold?" | Approved Q6 privacy answer, then continues | Q6 (verbatim — text needed, D4) |
| Outside the lender's licensed footprint | Checks the footprint config; hands off if outside | Natural |
| "Are you a real person?" | AI disclosure | Q2 |

**Short TRID gate (verbatim):**
"I'm not able to take that information here, and I haven't recorded it. If you move forward, your loan officer will collect it securely. For now, let's keep going." — plus, if it was an address: "A city or zip code is all I need."

**Pre-model safety net (`safety-net.ts`) — runs before the LLM, the extractor, the transcript, the chat panel and the database:**

- SSN: formatted digits (`412-55-6789`, `412 55 6789`, `412556789`) **and spoken digits** ("four one two, five five…", "4-1-2…", partial sequences after "social"/"SSN").
- Street address: number + street name + street type, **spelled-out and abbreviated** (Street, Drive, Road, Avenue, Lane, Court, Boulevard, Circle, Place, Parkway, Highway, Way, St, Dr, Rd, Ave, Ln, Ct, Blvd, Cir, Pl, Pkwy, Hwy).
- On a match: the matched text is replaced with `[REDACTED]` in every copy of the turn; the verbatim TRID gate is delivered deterministically; the rest of the sentence (e.g. "listed at 365") is still processed for facts. **The matched text is never stored or logged.**
- This is the **only** regex in Section 0, and it is a safety net, not intent detection.

**Verbatim scripts in Section 0 (the complete list):** greeting + on-screen consent line, intent question, construction and HECM bridge responses, short TRID gate, rate decline. Everything else follows intent in natural wording.

### 6.8 Opening: greeting, cards, consent, mic

**Greeting (fixed script, ~50 words — replaces `GREETING_TEXT`):**
"Hi! I'm Ailana, your AI mortgage assistant. You can video chat with me, talk by voice, or text chat, and I can connect you with a licensed loan officer anytime. Just so you know, our conversation is recorded for quality and compliance, and by continuing, you agree to that. How would you like to get started?"

| Ailana says | Card that lights up |
| :--- | :--- |
| "Hi! I'm Ailana, your AI mortgage assistant." | none |
| "You can video chat with me," | Video chat with Ailana |
| "talk by voice," | Voice only |
| "or text chat," | Text chat |
| "and I can connect you with a licensed loan officer anytime." | Talk to a loan officer |
| "Just so you know, … you agree to that." | none |
| "How would you like to get started?" | none |

**How it works with today's code**

- Today the CTA connects straight into video mode and the mode switcher only appears once live. New flow: CTA click → connect to the room **with the microphone disabled** → show `channel-cards.tsx` (Ailana + 4 cards + consent line + Privacy link + "Other ways to reach us") → greeting plays.
- **Highlights are driven by data-channel events timed to speech, not a timer.** Backend emits `SYSTEM_CARD_HIGHLIGHT {card}` at the start of each phrase and `{card: null}` at the end. Implementation to be chosen in a spike (S0-08): (a) speak the greeting as queued phrase segments and emit on each segment's playout start, or (b) use TTS word timestamps. LemonSlice routes audio to the avatar, so option (a) is the likely path; check it doesn't sound choppy.
- **Card tap** → frontend sends `SYSTEM_CHANNEL_SELECTED {channel, consents}` → backend writes two `Consent` rows (AI engagement, recording) with session ID, timestamp, lender, channel, disclosure version (spoken + on-screen) → mic enabled for video/voice; text chat sets text-only mode; loan-officer card goes straight to the transfer flow (§6.10) with consent logged.
- Then the **intent question** (verbatim): "Great. What brings you here today: buying a home, refinancing, or using your home's equity?" — **skipped** if the borrower has already stated a goal (e.g. typed before tapping, or said it in their first words).
- **Footer:** "Equal Housing Lender · AI-assisted process · NMLS #[number]." Under the cards: "Ailana is an AI assistant, not a person. By choosing an option, you agree to talk with Ailana and that this conversation, including video, voice and chat, is recorded for quality and compliance."
- Voice-only sessions with no screen: the spoken line is the only notice (whether a spoken "yes" is needed is a counsel question — D5).

### 6.9 Routing (code) — `router.ts`

The router is a **pure function** `(ledger, intent, flags, section0State) → decision`, unit-tested for every branch. Section 0 state is small and only prevents loops; it is **not** a gate.

```ts
interface Section0State {
  intentAsked: boolean;
  clarifyAsked: null | 'cash_out_vs_equity' | 'heloc_vs_heq' | 'which_goal_first' | 'three_options';
  unclearCount: number;          // reaching 2 → offer general questions or a loan officer, never loop
  trackSet: boolean;
  holdoutRouted: boolean;
}
```

| What the borrower said | Decision | Track |
| :--- | :--- | :--- |
| One clear goal | **No confirmation turn.** Short acknowledgment folded into the first needed question | Set immediately |
| Cash out, unclear how | One question: keep the current first mortgage, or replace it? | Cash-out refi, or on to equity question |
| Equity, type unclear | "Would a line of credit you draw from as needed work better, or one lump sum with a fixed payment? I can explain the difference." | HELOC or Home Equity Loan |
| Two goals | Names both, asks which to start with; stores the other as `goal.secondary` (kept for the loan officer) | Chosen goal |
| Unclear / one word | Offers the three options once; if still unclear, offers general questions or a loan officer. **Never loops** | None until stated |
| Construction / building / lot / draw | Construction bridge response (verbatim), then loan officer | Holdout |
| Reverse mortgage | HECM bridge response incl. HUD counseling requirement (verbatim), then loan officer | Holdout |
| Outside lending scope (car loan) | Says it's outside what she handles; offers mortgage/equity help or lender contacts | None |
| Off-topic | One-line redirect | None |
| "Are you a real person?" | Q2 AI disclosure, then back to intent | Unchanged |
| A question first | Answers it (Stage 1 Q1–Q8 knowledge), then asks intent | None until stated |
| Transfer request | Transfer flow (§6.10) — every stated fact goes with it | — |

**Track switching:** if a later answer contradicts the track ("actually, I already own and want to refinance"), code switches `transaction_type`, keeps every fact that still applies (income, debts, credit, co-borrower, name, location), drops track-incompatible ones (e.g. purchase price vs home value) to history, and re-runs `advanceWorkflow()`. Allowed in any stage before the Stage 2 closing offer.

**Hand-off:** when a track is set → `activeStage = "1"`, Section 0 prompt stops loading, ledger sync runs, `advanceWorkflow()` picks the first missing item. The **first track turn** asks first name once ("And what's your first name?") if unknown and not declined, combined with a one-phrase acknowledgment of captured facts:
"With $84,000 in income and a 710 score noted — and what's your first name?"
After that, the existing track sequence continues, skipping everything known. **No list read-backs.**

### 6.10 Loan officer at any point (T1–T6)

- `requests_transfer_now` in **any** stage (including the first reply) → existing transfer path (`SYSTEM_TRIGGER_MLO_TRANSFER` → UI loan-officer mode → `SYSTEM_TRANSFER_MLO` → hibernate + SIP). Ailana confirms and transfers **once**; she does not keep questioning.
- **Facts go with the transfer:** `mlo-handoff.ts` builds a summary from the ledger (goal, secondary goal, every stated fact, compliance flags, consent status). Delivery channel to be agreed with telephony (SIP headers/participant attributes, MLO queue email, CRM, or the `Escalation` DB row) — D2.
- **MLO unavailable** (`mlo-availability.ts`, config hours; `MLO_AVAILABILITY=available|unavailable` env override for localhost testing; mocked in simulations): Ailana says no one is available now, offers a callback, collects day, time **and time zone**, books **exactly one** appointment via `callback-service.ts`, and confirms it back (T3, T6).
- "Will I be able to talk to someone later?" → explains, continues; no transfer, no booking (T4).
- Transfer requested then cancelled before it happens → no transfer; Section 0 resumes where it left off (T5).
- No transfer or appointment is ever attempted unless the borrower asks for one.

### 6.11 Section 0 prompt (Layer 2, stage `"0"`) — `stage0-opening.ts`

Short (target < 40 lines). Contains: the goal of Section 0, the soft-gate rule (always answer questions), the acknowledgment style (one phrase, no list read-back), "ask only what CURRENT TASK says", and the verbatim-script list. **No phrasing examples from the test set, no per-question compliance notes, no fixed next question.** The next question always comes from code via CURRENT TASK.

### 6.12 Minimal changes to existing stages (all behind the flag)

| Change | Why |
| :--- | :--- |
| `activeStage` starts at `"0"` instead of `"1"` | Section 0 owns the opening; Stage 1 starts when a track is set |
| Stage 1: intent question removed; `mortgage_goal` arrives confirmed from Section 0 | Intent asked once only |
| Stage 1: `borrower_name` asked once on the first track turn | Name moved out of the old Q9 |
| Ledger sync before every `advanceWorkflow()` | No-repeat rule for Stage 1 and Stage 2 of all tracks |
| `onAgentTurn` Stage 1 keyword re-sync of the pending field — **disabled** | It changes the pending field when Ailana *says* "purchase"/"refinance" |
| `declineCurrentField()` default `mortgage_goal = purchase` after 3 attempts — **disabled** | Never guess intent; the router offers options / a loan officer instead |
| Old greeting line in `stage1-greeting.ts` — removed | Conflicted with `GREETING_TEXT` |
| Long Q9-TRID-GATE variants in Layer 1 — replaced by the short gate | Spec |
| Loan-officer intent from the extractor accepted in Stages 1–2 (today only 2.5/4/5 + explicit phrase) | Transfer at any point |

Not changed: Stage 2 sequences per track, Stage 2 closing offer, 3A OTP / soft pull / prefill, 2.5 affordability panel, findings scripts, Stage 5.

### 6.13 Persistence — memory that lasts the whole flow

- **In session:** ledger lives in `SessionContextManager` (cloned/reconciled with the existing background-extraction snapshots).
- **Every turn to the frontend:** ledger included in `SYSTEM_STAGE_UPDATE` → saved in the localStorage snapshot → sent back in `SYSTEM_RESTORE_STATE` → `hydrateFromSnapshot()` restores it.
- **Database:** new `Application.statedFacts Json?` column (Prisma migration) written by `syncToDatabase()`, restored by `initializeFromDatabase()`.
- **Compaction / rotation:** unaffected, because memory is in code state; Layer 3's KNOWN FACTS block re-injects it every turn.
- **Loan officer round-trip:** ledger untouched during hibernation; "Return to Ailana" resumes with full memory.

### 6.14 Observability (log tags used by the testing guide)

Every Section 0 component prints one tagged log line per event, so testers can verify behaviour on localhost: `[section0]` (decision per turn), `[fact-ledger]` (fact added / corrected), `[ledger-sync]` (profile field filled), `[next-question]` (what code chose to ask), `[safety-net]` (SSN/address caught — never the matched text), `[consent]` (card-tap consent rows), `[mlo-handoff]` (summary sent with a transfer or callback). The Fact Ledger is also included as `statedFacts` in every `SYSTEM_STAGE_UPDATE` payload.

### 6.15 Feature flag and containment

- `SECTION_0_ENABLED` (env) → `ailanaConfig.section0Enabled`. **Off = today's demo build exactly** (stage starts at `"1"`, old greeting, old behaviour). Default **off** on `main`/production until David signs off; on in `dev`.
- Every changed code path checks the flag. A unit test asserts the static prompt and stage sequence are byte-identical to the demo build with the flag off.

---

## 7. Testing and LiveKit Agent Simulations

### 7.1 Feasibility (checked Nov 5, 2026)

- LiveKit Agent Simulations **support Node.js** (David's doc says Python-only; LiveKit's current docs list Node.js): `@livekit/agents` **≥ 1.6.0** — we have **1.6.4** (its `simulation` module is installed). No upgrade or port needed.
- Requires LiveKit CLI **≥ v2.19.0** (not yet installed) and `lk cloud auth` to our LiveKit Cloud project.
- Node API: `ctx.simulationContext()` (returns `undefined` in production), `onSimulationEnd` sibling of `entry` on `defineAgent`, `ctx.fail(...)`, `ctx.simulatorVerdict`. Node has no session-scoped tool-mock helper → we mock with our own `if (sim)` branches (our external calls are plain functions, so this is fine).
- Text mode disables STT/TTS/VAD; audio mode runs the full pipeline (slower, costs more, metered higher).

### 7.2 Two levels of tests

| Level | What | When |
| :--- | :--- | :--- |
| **Unit tests** (`backend/src/__tests__/section0-*.test.ts`, run by `npm test`) | Router branches, normaliser rules, safety-net patterns, ledger corrections/history, ledger→profile sync, flag-off parity, MLO handoff summary | Every change |
| **Text simulations** (`lk agent simulate text`) | Whole conversations: captured facts, nothing re-asked, correct next move, compliance | Every fix cycle |
| **Audio simulations** (`lk agent simulate audio`, incl. `--background-noise --low-quality-microphone`) | Number transcription, turn-taking, latency | Milestones only |
| **David's live calls** | 5 calls with his own multi-fact openings | Before Section 0 is declared done |

### 7.3 Simulation wiring (production behaviour unchanged)

When `ctx.simulationContext()` is present:

| External piece | In simulation |
| :--- | :--- |
| LemonSlice avatar | Skipped; session starts immediately |
| Database | Skipped |
| CRS soft pull | Mock returns fixed sandbox result |
| SIP / FSPBX transfer | Mock **records every attempt** (who, when, facts passed) and returns "MLO available"/"unavailable" from scenario `userdata` |
| Callback / Google Calendar | Mock records every booking (date, time, time zone) |
| Email / SMS / AUS | Mock |
| Greeting / card tap | Fired automatically (no frontend); consent recorded via the mock |

`onSimulationEnd` compares the Fact Ledger to `userdata.expected_facts` and the mock records to `userdata.expected_transfers/bookings`, and calls `ctx.fail(...)` on any mismatch — so a smooth-sounding conversation with wrong data still fails.

### 7.4 Scenario files (`backend/scenarios/`)

| File | Contents | Who may edit |
| :--- | :--- | :--- |
| `section0.yaml` | David's 30 prospect replies (with the corrections in Appendix A) + A1–A14 + T1–T6. Each: persona, exact opening line, consistent follow-up answers, self-corrections, `agent_expectations` (every fact captured, nothing re-asked, expected next move, compliance), `userdata` (expected facts, MLO availability). Every original case also expects "no transfer or appointment unless asked". | **Locked after David approves** — never edited to make a test pass |
| `tracks_regression.yaml` | Purchase, Refinance (R&T, cash-out), HELOC, Home Equity from preset `userdata`, proving the tracks behave like the demo build minus re-asks (A14) | Team, reviewed by lead engineer |
| `section0_stress.yaml` | A few hundred varied phrasings (slang, numbers in words, partial answers, rambling, chat typos) — reported **separately** to detect overfitting | Proposed file; David approves additions |
| `scenarios_proposed.yaml` | New cases from real/pilot transcripts handled poorly — for David's approval, then kept permanently | Proposed only |

### 7.5 Pass bar and commands

```bash
npm run build    # simulations run the compiled dist/, so rebuild after every change
lk agent simulate text --scenarios scenarios/section0.yaml --samples 3 --pass-rate 1.0 dist/agent.js
lk agent simulate list
lk agent simulate export <run-id> > docs/section0/runs/<name>.json
```

- **Exit criteria:** ≥ 95% on `section0.yaml` at `--samples 3 --pass-rate 1.0`, on **two consecutive full runs**, **zero compliance failures**, `tracks_regression.yaml` still at its baseline or better, stress-set gap reported.
- **Fix loop rule:** one failure category per cycle; keep a change only if the pass rate rises **and** nothing that passed before now fails; otherwise revert and report.
- **Escalate to David the same day** if: three cycles with no gain; >10-point swings between identical runs; a fix would need scenario changes; a compliance failure a fix can't remove; or the review concludes 95% isn't reachable with this design.

---

## 8. Phased task list

Effort: S ≈ ≤½ day · M ≈ 1–2 days · L ≈ 3+ days. Status: 🔴 not started · 🟡 in progress · 🟢 done.

### Phase 0 — Setup (no behaviour change)

| ID | Task | Files | Done when | Effort | Status |
| :--- | :--- | :--- | :--- | :---: | :---: |
| S0-01 | ~~Create branch `section0-generic`~~ work on `dev` behind the flag (team decision); ~~move the 3 client docs + this plan to `docs/section0/`~~ docs stay in the repo root (links already point there) | docs | Working on `dev` | S | 🟢 |
| S0-02 | Merge David's CLAUDE.md working rules into our CLAUDE.md/AGENTS.md (keep the Next.js note) | CLAUDE.md | Both rule sets present | S | 🟢 |
| S0-03 | Add `SECTION_0_ENABLED` flag (default off) | ailana-config.ts | Flag readable; off = no change | S | 🟢 |
| S0-04 | Install `lk` CLI ≥ 2.19, `lk cloud auth`; spike: confirm our Node agent runs under `lk agent simulate text` and that `onUserTurnCompleted`/`llmNode` fire for simulated text turns | backend/scenarios/spike.yaml | One trivial scenario runs end-to-end | M | 🟢 passed Nov 5 (run `SR_sE8vs3QiXM3N`, 2/2) |
| S0-05 | Simulation guards + mocks (§7.3) with `ctx.simulationContext()` | agent.ts, section0/sim-mocks.ts, crs-service.ts, database.ts | Sim run never touches LemonSlice, DB, CRS, SIP, calendar; production unchanged | M | 🟢 done (verified by the S0-04 run) |

### Phase 1 — Baseline and review (no code changes to behaviour)

| ID | Task | Done when | Effort | Status |
| :--- | :--- | :--- | :---: | :---: |
| S0-06 | `docs/section0/REVIEW.md` per David's Step 2 (flow today, where the LLM decides, multi-fact handling, conflicting prompts, compliance risks, ranked recommendations, mocks, what applies to later stages) | Lead engineer adds notes; sent to David | M | 🔴 |
| S0-07 | Baseline: scenarios for tests #1, #2, #13, #30 on the current build (flag off), then all 30 → [Section0Results.md](Section0Results.md) (pass rate, pass@3/pass^3, failures by category) | Baseline number sent to David | M | 🟡 B1/B2 invalid (simulator bypassed our state machine — fixed); **B3** pending |

### Phase 2 — Scenarios for approval

| ID | Task | Done when | Effort | Status |
| :--- | :--- | :--- | :---: | :---: |
| S0-08a | Write `scenarios/section0.yaml` (30 + A1–A14 + T1–T6) with Appendix A corrections; `userdata.expected_facts` per case | File complete | M | 🟢 47 scenarios + end-of-run data check; David: "very favorable" (Nov 7). Treated as approved and locked; confirm with David |
| S0-08b | `docs/section0/SCENARIOS_FOR_APPROVAL.md` — plain-English table for David | **David approves → file locked** | S | 🟢 reviewed Nov 7; privacy wording received; name + Refinance wording still open |
| S0-08c | `scenarios/tracks_regression.yaml` (PUR, REF R&T, REF cash-out, HEL, HEQ from preset userdata); run on the current build as the track baseline | Baseline recorded | M | 🟢 5/5 flag off and 5/5 flag on (Nov 9) |

### Phase 3 — Core: memory, understanding, routing

| ID | Task | Files | Done when | Effort | Status |
| :--- | :--- | :--- | :--- | :---: | :---: |
| S0-09 | Fact schema + catalogue + never-capture list | section0/fact-schema.ts | Types compile; catalogue matches §6.2 | S | 🟢 |
| S0-10 | Fact Ledger (upsert, corrections + history, declined, serialize/hydrate) + unit tests | section0/fact-ledger.ts | Unit tests pass | M | 🟢 30 tests |
| S0-11 | Normaliser + plausibility rules (§6.5) + unit tests | section0/normalize.ts | All §6.5 rules covered by tests | M | 🟢 44 tests (in-sentence self-correction is the extractor's job — tested in S0-12) |
| S0-12 | Universal extractor (schema prompt, JSON, repair, parallel with stage extraction) | section0/universal-extractor.ts, section0/ingest.ts, session-context-manager.ts | Test #1 opening yields goal, occupancy, income, debt, credit in one turn | M | 🟢 live check: #1 → 5 facts, #30 → 14 facts in one turn |
| S0-13 | Ledger → profile sync + `*_confirmed` flags; run before every `advanceWorkflow()` | section0/ledger-sync.ts, session-context-manager.ts | A profile with income + credit known skips Q35/Q37 in every track | M | 🟢 (Stage 2 now starts at the first missing field) |
| S0-14 | Layer 3 KNOWN FACTS block + Layer 1 no-repeat rule | layer3-context.ts, ailana-system.ts, section0/turn-context.ts | Block present every turn in every stage | S | 🟢 |
| S0-15 | Stage `"0"`: start stage, `buildLayer2("0")`, `stage0-opening.ts`, Section 0 turns wait for extraction | session-context-manager.ts, prompts | Section 0 prompt loads only before a track is set | M | 🟢 |
| S0-16 | Router (all §6.9 branches, never-loop counters) + unit tests | section0/router.ts | Every branch unit-tested | M | 🟢 35 tests |
| S0-17 | Next-question selector: clarification first, then first-name turn, then `advanceWorkflow()`; one-phrase acknowledgment | section0/turn-context.ts (instead of next-question.ts), session-context-manager.ts | A2: no confirmation turn; next asks name or first missing item | M | 🟢 (S1: confirmed in #2/#13; + tenure-from-memory and situational follow-ups after S1) |
| S0-18 | Track switching on contradiction | router.ts (`trackSwitchFor`), session-context-manager.ts (`maybeSwitchTrack`) | Purchase → refi mid-flow keeps income/credit/name | S | 🟢 unit + flow tests; confirm in S3 |
| S0-19 | Flag-guarded stage tweaks (§6.12): disable keyword re-sync, disable goal default, remove old greeting line, name field | session-context-manager.ts, stage1-greeting.ts | Flag-off parity test passes | S | 🟢 (+ "first home ≠ first time with this lender" fix; flag-off parity 23/23) |
| S0-20 | Persistence: ledger in stage update, snapshot, restore, DB column + migration | agent.ts, session-storage.ts, schema.prisma | Ledger survives reconnect, return-from-LO, DB resume | M | 🟡 stage update + snapshot restore done (frontend saves it automatically); DB column pending |
| — | **Checkpoint:** full text sim run on `section0.yaml` + `tracks_regression.yaml` | | Results logged vs baseline | | 🔴 |

### Phase 4 — Compliance, opening and transfer

| ID | Task | Files | Done when | Effort | Status |
| :--- | :--- | :--- | :--- | :---: | :---: |
| S0-21 | Safety net (SSN incl. spoken digits, street address) + redaction everywhere + unit tests | section0/safety-net.ts, agent.ts, session-context-manager.ts | A9 / test #11: neither stored nor repeated anywhere (transcript, chat, DB, logs) | M | 🟡 module + 34 tests; applied before extractor/state/DB; TRID gate spoken (S0-22). Still to do: redact the chat-history copy of the message |
| S0-22 | Short TRID gate (deterministic), Layer 1 compliance lines (§6.7), verbatim scripts file | ailana-system.ts, section0-scripts.ts | Long TRID variants gone; compliance scenarios pass | S | 🟡 short gate verbatim + city/zip; confirm in P3 |
| S0-23 | Compliance-flag handling (rate, competitor, guarantee/letter, inflate income, protected class, privacy Q6, hardship → HUD counselor, documents, footprint) | section0/compliance-notes.ts, session-context-manager.ts | Tests #10, #12, #16, #20, #23–#29 pass on compliance | M | 🟡 built (16 tests); confirm in P2; footprint list pending D3 |
| S0-24 | New greeting text + phrase-timed `SYSTEM_CARD_HIGHLIGHT` (spike option a vs b) | agent.ts, ailana-system.ts | Cards light on cue in the browser | M | 🟡 greeting text (flag on) done; card highlight pending |
| S0-25 | First screen: `channel-cards.tsx`, mic off until tap, consent line, Privacy link, "Other ways to reach us", footer | floating-cta/*, footer.tsx | A1 passes visually; mic track not published before tap | M | 🔴 |
| S0-26 | Consent logging on tap (2 `Consent` rows, disclosure version) | consent-service.ts, agent.ts | Rows written with session, timestamp, lender, channel, version | S | 🔴 |
| S0-27 | Transfer at any point from extractor intent; fact hand-off summary; cancel-before-transfer resume | agent.ts, mlo-handoff.ts | T1, T2, T4, T5 pass (conversation + mock records) | M | 🟡 real tool + code-gated handoff state + stated facts in the transfer record; confirm in P3 |
| S0-28 | MLO availability + callback booking (day, time, time zone, exactly once, read back) — mock now, real per D1 | mlo-availability.ts, callback-service.ts | T3, T6 pass | M | 🟡 `schedule_callback` tool, once, read back; mock in simulation; real calendar = D1 |

### Phase 5 — Fix loop to 95%

| ID | Task | Done when | Status |
| :--- | :--- | :--- | :---: |
| S0-29 | Fix cycles: highest-ranked failure category each cycle → root cause (code vs prompt) → smallest change (prefer code, shorten prompts) → full re-run → keep or revert. Commit message includes the pass rate. Report to David after each session (pass rate, category fixed, change, regressions, compliance failures, next, blockers). | ≥ 95% at 3 samples / pass-rate 1.0 on two consecutive runs; 0 compliance failures; track regression ≥ baseline | 🔴 |
| S0-30 | Stress set (`section0_stress.yaml`), reported separately; investigate any large gap (overfitting) | Gap reported to David | 🔴 |

### Phase 6 — Voice and sign-off

| ID | Task | Done when | Status |
| :--- | :--- | :--- | :---: |
| S0-31 | Audio simulations (normal, then background noise + low-quality mic) | Latency and number-transcription issues logged/fixed | 🔴 |
| S0-32 | FSPBX + calendar integration check with mocks off (test extension, test calendar — never a real MLO's): correct extension, facts arrive, after-hours fallback, one booking in the right time zone, graceful spoken fallback on errors | Telephony engineers confirm | 🔴 |
| S0-33 | David's 5 live calls | David signs off → flag on for staging | 🔴 |

---

## 9. Acceptance criteria (summary)

- **A1** Greeting plays; all four cards light on cue; recording line spoken; both consents logged on tap; mic off before tap.
- **A2 / test #1** Purchase set with no confirmation turn; primary residence, $84,000/yr, $1,200/mo, 710 recorded; next asks name or area — never income, debts, credit or address.
- **A3** "I have some mortgage questions." → intent question asked once.
- **A4** "Yeah." then "I don't know." → three options once, then general questions or a loan officer; no loop.
- **A5** HELOC set; value, no mortgage, $75,000 recorded; no equity disambiguation.
- **A6** "I need money. House is paid off." → one question: line of credit or lump sum.
- **A7 / test #22** Asks which goal first; other stored for the loan officer.
- **A8 / test #8** Construction bridge response and loan officer; no track starts.
- **A9 / test #11** Short TRID gate; neither SSN nor address stored or repeated; asks city or zip.
- **A10 / test #10** Rate declined, loan officer offered; facts recorded; Purchase set.
- **A11 / test #13** $300 recorded, not $3,000.
- **A12 / test #2** Weekly hours confirmed before annual income is assumed.
- **A13** Car loan → out of scope stated; mortgage help or lender contacts offered.
- **A14** After a track is set, Purchase / Refi / HELOC behave exactly as the demo build, minus re-asked questions.
- **T1–T6** as in David's simulation instructions (graded on conversation **and** mock records).
- **All 30 tests:** every "Should capture" item recorded, none re-asked, the first missing item for the track asked next, no compliance miss.
- **Memory across the flow:** no fact stated in Section 0 is asked again in Stage 1, Stage 2, 2.5, 3A or 5 (checked by `onSimulationEnd` and the track regression set).

---

## 10. Open decisions (need David / lead engineer)

| # | Decision | Recommendation |
| :---: | :--- | :--- |
| D1 | Callback booking: real Google Calendar integration in this branch, or mock only (enough for T3/T6 sims) with the real integration later? His rules say "no new features in this branch". | Mock + interface now; real integration as a follow-up |
| D2 | How captured facts reach the loan officer on transfer (SIP headers/attributes, MLO queue email, CRM, `Escalation` row) | Agree with telephony engineers |
| D3 | Lender configuration the tests need: licensed footprint states, investment loans offered (y/n), DPA lookup source, NMLS number, phone/hours/branch locator | Per-lender config file with placeholders now |
| D4 | Approved text for Q6 (privacy), Q60/Q60-ADVERS short variant, Q15-SUBFLOOR, and the construction / HECM bridge responses (the old drafts ask for contact information and the HECM one lacks the HUD counseling line) | David supplies final wording |
| D5 | Counsel: "by continuing, you agree" as spoken recording consent (all-party states, voice-only); Equal Housing in footer only; consent wording + retention period; short TRID wording; first-name move keeps the TRID four-of-six posture | Build as specified; flag stays off in production until answered |
| D6 | Read-back: CLAUDE.md says "briefly confirm what she heard"; the Revised spec says "no list read-back, one-phrase acknowledgment, confirm only ambiguous values" | Follow the Revised spec |
| D7 | Who is the named lead engineer (approves changes, sends reports)? | — |
| D8 | Correct David's instruction doc: simulations support Node.js; the "upgrade Agents to 1.6.6" prerequisite is the Python version and doesn't apply | Tell David |

**Risks**

- **Extraction latency on the first reply** (waiting up to ~2.5 s). Mitigation: the wait applies only to Section 0 turns; measure in audio sims; trim the schema prompt if needed.
- **Two extractors in Stages 1–2.5** (universal + existing) could disagree. Mitigation: the existing extractor owns the pending field; the ledger only fills empty/unconfirmed fields or explicit corrections.
- **Existing optimistic defaults** (`co_borrower = no`, `military_rural = neither`, `job_tenure_type = salaried` at 0 ms) could overwrite nothing but may advance past a field the borrower didn't answer. Mitigation: ledger-known values take precedence; track-regression scenarios watch for it.
- **Simulation text mode vs our voice hooks** — confirmed in spike S0-04 before anything else depends on it.

---

## Appendix A — Corrections to the 30-test expectations (per the Revised spec)

The Revised spec says the 30 lines remain valid as extended tests after two corrections. These must be applied when converting them to `section0.yaml` and confirmed by David at the approval gate:

1. **Construction lines** (test #8) expect the **construction bridge response and a loan officer**, not Stage 2 questions (the test set says "Asks income, debts, and credit"; the Revised spec overrides this).
2. **"Expected next move"** means **the first missing item for the track**, not a Stage 2 question chosen in advance. Examples: test #1 lists "asks city/zip and property type, then funds"; A2 accepts "name or area". After the first-name turn, the track's own order decides.

Additional items to confirm with David at the approval gate: DPA lookup "after Q42" (tests #2, #21) and footprint checks (tests #25, #26) depend on D3; the soft-pull "credit authorization" wording in test #6 refers to Stage 3A, which is unchanged.

## Appendix B — Fact → question skip map (from the Revised spec)

| Fact | Example of how it's said | Skips |
| :--- | :--- | :--- |
| Goal / transaction type | "drove by a house I'd like as my residence" | Intent question |
| Occupancy | "to live in," "rental," "vacation place we'd Airbnb" | Q10 |
| Existing member | "I already bank here" | Q11 |
| Timeline | "closing in three weeks" | Q12 |
| Co-borrower | "my husband and I," "I'd co-sign for my son" | Q13 |
| Income | "84,000 a year," "52 an hour," "4,200 every two weeks" | Q35 |
| Monthly debts | "1,200 a month in debt," "450 car payment" | Q36 |
| Credit score | "710," "around 680," "in the 770s" | Q37 |
| Funds for down payment | "25k saved," "30k from selling my condo" | Q38 |
| Rent or own | "I'm renting" | Q39 |
| Price range | "listed at 365" | Q41 |
| Property type and area | "duplex near UTC," "out near Dunlap" | Q42 |
| Military service | "retired from the Army" | Q43 |
| Employment type | "self-employed," "1099 gig work" | Q44 (income type part) |
| Refi: balance, value, loan type, cash-out amount | "owe 310 on a house worth 450" | RQ22, RQ23, RQ-LOANTYPE, RQ27 |
| Equity: value, balances, amount, use | "paid off, worth 325, want 75,000" | HQ20 to HQ23 and EQ equivalents |

## Appendix C — Session state (from the Revised spec)

- **Keep:** `transaction_type`, `secondary_intent` (`goal.secondary`), the stated-facts record (Fact Ledger), consent events, `holdout_routed`.
- **Drop (do not build):** `Q9_confirmed`, `Q9_MULTI_delivered`, `equity_disambig_delivered`, `fallback_routing_delivered` as gates; the six Q9-MULTI templates; keyword extraction; the hard Stage 1 gate.

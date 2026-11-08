# Section 0 — Simulation Results

**Project:** ConvergentAI · Ailana
**Plan:** [Section0_GenericImplementationPlan.md](Section0_GenericImplementationPlan.md) · **Test guide:** [Section0TestGuide.md](Section0TestGuide.md)
**Purpose:** the pass-rate record for Section 0 — the baseline (before) and every fix cycle after it. Each run is graded by LiveKit Agent Simulations (text mode, 3 samples per scenario, a scenario passes only if all 3 pass).

---

## Run history

| # | Date | Run ID | Build | Scenarios | Pass rate | pass@3 | pass^3 | Notes |
| :---: | :--- | :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| B1 | Nov 5, 2026 | `SR_K5hDnwMfgu7H` | `dev`, Section 0 **off** (demo build) | Baseline: David's tests #1, #2, #13, #30 | **0 / 12 (0%)** | 0/4 | 0/4 | ⚠️ **Not a valid measure of our flow** — see "Simulation harness finding" below. |
| B2 | Nov 5, 2026 | `SR_TfavTyVffBjH` | `dev`, Section 0 off, + typed-input fix | Same 4 tests | **0 / 12 (0%)** | 0/4 | 0/4 | ⚠️ Same problem as B1 — the typed-input fix doesn't touch the path simulations use. Re-run as **B3** after the harness fix. |
| **B3** | Nov 6, 2026 | `SR_wDGZ27nXmCJ7` | `dev`, Section 0 off, + harness fix | Same 4 tests | **0 / 12 (0%)** | 0/4 | 0/4 | ✅ **First valid baseline** — Ailana follows our scripted flow. Details below. 5/12 hit "agent produced no response items" (investigating). |
| B4 | Nov 6, 2026 | `SR_f7XRsUAt2c6z` | same as B3 + empty-reply diagnostic | Same 4 tests | **0 / 12 (0%)** | 0/4 | 0/4 | Diagnostic re-run (run by Claude). **Every** failure is re-asking (income, debts, credit, savings, area, rent/own); **0** "no response items" this time → that error is intermittent (occasional empty model reply); an `⚠️ EMPTY REPLY` log line now records it if it recurs. |
| **S1** | Nov 6, 2026 | `SR_yViuDuagBYEd` | `dev`, Section 0 **ON** (memory + routing + no-repeat sync) | Same 4 tests | **6 / 12 (50%)** | 2/4 | 2/4 | First run with Section 0 on: 0% → 50%. **#2 and #13 pass 3/3.** #1 and #30 fail on specific, fixable gaps — see "Run S1" below. Fixes applied the same day → run **S2**. |
| **S2** | Nov 6, 2026 | `SR_XGKzNfWQgAmV` | S1 + fixes (bridge, tenure from memory, situational follow-ups) | Same 4 tests, stop at the closing offer | **12 / 12 (100%)** | 4/4 | 4/4 | ✅ **Baseline set fully passes.** Nothing re-asked; hours asked before hourly pay; $300 correction kept; Atlanta rent asked; no rate or approval statements. Two judge notes, not failures — see "Run S2". |
| **S3** | Nov 6, 2026 | `SR_4JB8GRpwAiwJ` + `SR_ntCPmjEHE2Ud` | S2 + track switching (S0-18) | Baseline 4 + proposed 2 (R-8 switch, question is not a switch) | **12 / 12 + 6 / 6 (100%)** | 6/6 | 6/6 | ✅ No regression; the track switch keeps every fact; a HELOC question does not switch the track. Judge notes: name in scripted lines; refinance fee wording in the existing Refi script (for David). |
| **P1** | Nov 7, 2026 | `SR_JZpTbodioxrV` | S3 build | **Full set `section0.yaml` (47), 1 sample — preview, not counted** | **20 / 47 (43%)** | — | — | First look at the full set. Failures are triaged into 9 causes below; fix cycle 1 applied Nov 8 → run **P2**. Export: `docs/section0/runs/preview1.json`. |
| **P2** | Nov 8, 2026 | `SR_X8rcV2B7QjJJ` | fix cycle 1 | Full set (47), 1 sample, preview | **31 / 47 (66%)** | — | — | +11 from P1. 13 scenarios now pass that failed before. 16 failures triaged below; fix cycle 2 applied the same day → **P3**. Export: `docs/section0/runs/preview2.json`. |
| **P3** | Nov 8, 2026 | `SR_nn7BEtsZyFKx` | fix cycle 2 | Full set (47), 1 sample, preview | **40 / 47 (85%)** | — | — | +9. Transfers and callbacks now real (T1, T3, T5, T6 pass); TRID gate passes (#11, A9). 7 failures triaged below; fix cycle 3 applied → **P4** + track regression. Export: `docs/section0/runs/preview3.json`. |
| **TR-off** | Nov 9, 2026 | `SR_XCDnNrbKhpa2` | demo build (flag off) | Track regression (5) | **5 / 5** | — | — | Purchase, Refinance R&T + cash-out, HELOC and HEL all reach the closing offer. |
| **TR-on** | Nov 9, 2026 | `SR_wj9YTY7ob8QG` | fix cycle 3 (flag on) | Track regression (5) | **5 / 5** | — | — | ✅ **Section 0 does not disturb the tracks (A14).** |
| **P4** | Nov 9, 2026 | `SR_K4f43aVfYTgH` | fix cycle 3 | Full set (47), 1 sample, preview | **43 / 47 (91.5%)** | — | — | +3. 4 failures triaged below; fix cycle 4 applied → **first official run** next. |
| **O1** | Nov 9, 2026 | `SR_VsDhBkucqqk6` | fix cycle 4 | **Official**: full set (47), 3 samples, pass-rate 1.0 | **35 / 47 scenarios (74%)** · 127/141 samples (90%) | **47/47** | 35/47 | First official run. Every scenario passed at least once; 11 of the 12 misses failed only 1 of 3 samples, so the remaining work is consistency. Fix cycle 5 applied → **O2**. Export: `docs/section0/runs/official1.json`. |
| **O2** | Nov 9, 2026 | `SR_m4ym622Jzg7T` | fix cycle 5 | **Official**: full set (47), 3 samples | **37 / 47 scenarios (79%)** · 129/141 samples (91.5%) | **47/47** | 37/47 | +2 scenarios. A12, A11, A6, #30, #26 now 3/3. 12 failed samples triaged; fix cycle 6 → **O3**. |
| **TR-on2** | Nov 9, 2026 | `SR_Sr3mFjQubPRo` | fix cycle 5 (flag on) | Track regression (5) | **4 / 5** | — | — | HELOC: the judge wanted a separate "comfortable with a variable rate?" question. The **demo build skips it too** (flag off, same transcript point); the earlier flag-on pass only happened because the simulated borrower volunteered it. Pre-existing HELOC-track behaviour, not caused by Section 0. |
| **O3** | Nov 10, 2026 | `SR_LCyQgCuQsVWQ` | fix cycle 6 | **Official**: full set (47), 3 samples | **40 / 47 scenarios (85%)** · 133/141 samples (94.3%) | **47/47** | 40/47 | Best run so far. T6, #18, #21, #24, #12 now 3/3. 8 failed samples; fix cycle 7 → **O4**. |

---

## Baseline B3 — the real "before" (Nov 6)

Ailana now follows our real state machine: scripted Stage 1 questions → verbatim Stage 1→2 bridge → Stage 2 questions in our order → Stage 2 closing offer (two-path choice). **0 compliance failures.**

### What today's build already does right
| Opening fact | Re-asked? | Why it works |
| :--- | :---: | :--- |
| Occupancy — "as my residence" (#1), "live in one side" (#13) | **No** (0/6) | Stage 1 extracts all 5 Stage 1 fields from any turn |
| Co-borrower — "my husband and I" (#2), "my wife…" (#30) | **No** (0/6) | same |

### What it gets wrong — the gap Section 0 fills
| Opening fact | Re-asked | Tests |
| :--- | :---: | :--- |
| Income ($84k / $68k / $52/hr + $48k / $85k + $60k base) | **12 / 12** | #1, #2, #13, #30 |
| Monthly debts ($1,200 / $300 / $450 car / $1,100) | **12 / 12** (#2 s2 partly: "besides the car payment…") | all |
| Credit score (710 / 700 & 745) | **6 / 6** where stated | #1, #30 |
| Funds saved ($25k / $55k) | **6 / 6** | #2, #30 |
| Property type + area (duplex near UTC / Ooltewah) | **6 / 6** | #13, #2 |
| Rent / own (keeping the Atlanta house) | **3 / 3** | #30 |
| Weekly hours for "$52 an hour" | **never asked** (3/3) — the simulated borrower volunteered 36 h | #2 |

**Why:** Stage 2 extracts a number **only while that exact question is pending**, so every Stage 2 fact in the opening line is dropped. → Section 0 Fact Ledger + ledger→profile sync (S0-12, S0-13).

### Other findings
| Finding | Count | Cause / owner |
| :--- | :---: | :--- |
| **Over-inference:** "our first home" taken as "first time with this lender" and occupancy assumed → relationship + occupancy questions skipped | 3/3 (#2) | Stage 1 extractor reads too much into "first home". Section 0's extractor handles `borrower.existing_member` and `borrower.first_time_buyer` as separate facts. |
| **"Agent produced no response items"** — the run ended on a turn where Ailana produced no reply | 5/12 | Under investigation (diagnostic logging added Nov 6). Seen after the Path B choice (3), after the military answer (1), after the realtor answer (1). |
| After choosing Path B (summary), the judge expects a visible summary; in text mode the affordability panel can't be shown | 3/12 | Stage 2.5 is UI-driven; out of Section 0 scope. Baseline scenarios should stop at the closing offer. |
| Greeting ≠ "mandatory verbatim script"; greeting mentions loan officer during Stage 1 | judge note | Old conflicting greeting line in the Stage 1 prompt → fixed by S0-19 / S0-24 |

### Simulation harness finding (Nov 5) — why B1 and B2 don't measure our real flow

Reading the B2 transcripts showed Ailana asking questions in **our** wording through Stage 1 but **not** in Stage 2 ("total annual gross income", down payment before credit — not our scripts or order). Root cause, confirmed in the SDK source (`voice/remote_session.js → handleRunInput`):

- The simulator delivers each simulated-user message by calling **`session.run({ userInput })`** directly.
- That path skips **both** `onUserTurnCompleted` (voice turns) **and** our typed-message handler (`lk.chat`).
- So in B1/B2 our state machine **never processed a single user message**: no extraction, no stage change, no CURRENT TASK. Ailana improvised from the Stage 1 prompt — hence the stalls, the "I have everything I need", the invented login/verification steps and the non-scripted Stage 2.
- Proven locally: feeding the same Stage 1 answers into the session state directly moves it to Stage 2 with the bridge on the co-borrower answer (repro script, Nov 5).

**Fix (Nov 5, `agent.ts`):** any user turn that reaches `llmNode` without having been processed is now processed there exactly like a typed turn (state update + per-turn context). Voice and typed turns are marked as already processed, so **production behaviour is unchanged**; simulations now exercise the same state machine real users get. `tsc` clean, `npm test` 21/21.

**B1/B2 conclusions that still stand:** compliance held (0 failures). The re-asking is real (also seen in the localhost voice test and in the code: Stage 1 extracts only 5 fields; Stage 2 extracts a number only when that question is pending) — B3 will measure it properly.

---

## Baseline B1 — David's tests #1, #2, #13, #30 on today's build

**Result: 0 of 12 conversations passed. 0 of 4 scenarios passed.** Zero compliance failures (no rate quoted, no approval promised, no SSN or address taken).

| Test | Samples passed | Main failure (judge, all 3 samples) |
| :---: | :---: | :--- |
| **#1** — drove by a house, $84k, $1,200 debt, 710 | 0 / 3 | Asked "primary residence, second home, or investment property?" after the borrower said it would be their residence. Never reached the income question in 3/3 (stalled or improvised). |
| **#2** — couple, Ooltewah, $52/hr, spouse $48k, $25k, $450 car | 0 / 3 | Asked "on your own or with a co-borrower?" after "my husband and I". Never asked weekly hours for the hourly pay (0/3). Re-asked monthly debts. |
| **#13** — duplex near UTC, $68k, $3,000 → $300 debt | 0 / 3 | Asked "would this be your primary residence?" after "live in one side". Re-asked income ($68k) and monthly debts ($300). |
| **#30** — relocating from Atlanta, many facts | 0 / 3 | Asked about a co-borrower after "my wife… scores 700 and 745". Re-asked income, debts and savings. Never asked the destination city/zip or the Atlanta rent. |

### Failures by category (ranked by how many conversations they affect)

| Rank | Category | Conversations affected | What happened | Cause | Fixed by |
| :---: | :--- | :---: | :--- | :--- | :--- |
| 1 | **Fact re-asked** (the core Section 0 problem) | **12 / 12** | Occupancy re-asked 6/6 where stated (#1, #13); co-borrower re-asked 6/6 where stated (#2, #30); income/debt/savings re-asked in **4/4** conversations that reached Stage 2. | Stage 1 only extracts 5 fields; Stage 2 only extracts a number while that exact question is being asked — everything else in the opening is dropped. | Section 0 Fact Ledger + ledger→profile sync (S0-09 … S0-14) |
| 2 | **Stalled flow after Stage 1** | **8 / 12** | After the co-borrower answer Ailana said "I have all the initial details" and never asked income — then looped on "waiting for the system" (3/12) or improvised a flow (5/12). | **Corrected after B2:** the simulator calls `session.run()` directly, so our state machine never processed the simulated messages (see "Simulation harness finding" above). *(A related real bug was also fixed: typed messages during a voice/video session skipped the per-turn context.)* | Harness fix Nov 5 (`agent.ts`) — verify with run B3. |
| 3 | **Invented actions** | 6 / 12 | Claimed a secure-login prompt / one-time code was sent, offered to "resend" it, and to "flag a manual review" — none of which happened. | Side effect of #2: with no CURRENT TASK the model improvised the Stage 3A steps. | Should disappear with the #2 fix (check in B2). |
| 4 | **Hourly pay — hours not asked** | 3 / 3 (#2) | Treated "$52 an hour" as known income without asking weekly hours. | No normaliser for hourly pay. | Section 0 normaliser (S0-11) |
| 5 | **Next move missing** | 3 / 3 (#30) | Never asked the destination city/zip or expected rent on the retained Atlanta home. | Flow stalled (#2) and those facts have no field today. | #2 fix + Section 0 fact catalogue (S0-09) |
| 6 | **Over-specific guidance** | 2 / 12 (#30) | Said lenders "usually" apply "around 25%" vacancy to rental income. | Model general knowledge, stated too firmly. | Note for compliance wording; not a Section 0 task. |
| 7 | **Unneeded intent question** | 1 / 12 (#30) | Asked "are you looking to purchase a new home?" when relocating to buy was clear. | No routing layer. | Section 0 router (S0-16) |

### What this tells us
- **Superseded by the harness finding** — B1's transcripts were Ailana improvising without our state machine, so its numbers are not the real "before". Compliance held throughout. B3 is the valid baseline.

---

## Official run O3: 40/47 all-3, 94.3% of samples (Nov 10) and fix cycle 7

| Failed samples | Cause (found by replay + live extractor) | Fix (cycle 7) |
| :--- | :--- | :--- |
| #9 ×2 | In that run the extractor recorded the move to Chattanooga but not the new job, so the prior-job follow-up never fired (ingest verified fine) | Schema: a job they will start counts as `employment.new_job`, also when it's the reason they're moving |
| #30 | The model stored "Atlanta, GA" (where they're **leaving**) as the home's area → Ailana said "since you're looking in Georgia" and never asked the destination | Schema: the area is where they want to buy, never the place they're leaving. Code: an area equal to the relocation origin isn't the destination; the destination is still asked and no out-of-area note is given |
| #29 | Asked "what did you do before" right after a stated job loss (3rd run) | No prior-job follow-up when a job loss was stated |
| #11 | Price missing once (live extractor 3/3 correct) | Variance |
| #3, #26, #23 (1 of 3 each) | Property type not reached in 8 replies; "new home in Phoenix" phrasing; letter question missed once | Variance; watch |

**Not Section 0 (judge notes):** the Refinance fee script and HELOC 10/20-year terms (existing track wording), the affordability-summary step after the closing choice (Stage 2.5), and "great score" praise (the flag-on rule asks for neutral wording; some remains).

**Tests:** sync 108. `npm test` 26/26; flag-off parity 23/23.

---

## Official run O2: 37/47 all-3 (Nov 9) and fix cycle 6

pass@3 47/47 · pass^3 37/47 · samples 129/141 (91.5%).

| Failed samples | Cause | Fix (cycle 6) |
| :--- | :--- | :--- |
| T6 ×2 | "After 3" was booked as 3:00. When the borrower said 3:30, the tool answered "already booked" and the model claimed it had changed it | `schedule_callback` now **reschedules** the one existing booking (still exactly one, never two). The model gets the exact time ("after 3" → asks which time) before booking, and reads back what the tool returns |
| #18 | The military line still said "or **a** co-borrower": two scripted copies in `agent.ts` bypassed the cycle-5 override | All three copies (flag on): "you or **your** co-borrower" |
| #18 | Occupancy re-asked as a "quick check" after a direct answer | The model's "uncertain" counts only for things volunteered in the opening (stage 0), never for answers to a direct question |
| #21 | "I've never owned a home", then asked "rent or own?" | First-time buyer settles rent-or-own |
| #11 | Price missing from memory once | Redaction verified intact ("listed at 365" survives) → model variance |
| #12 | "Agent produced no response items" (empty model reply, 1 of 141) | Infrastructure/model hiccup; logged by the `⚠️ EMPTY REPLY` diagnostic |
| #3, #9, #19, #24, #29 (1 of 3 each) | Model/judge variance on one expected question | Watch in O3 |

**Tests:** handoff 28, sync 105. `npm test` 26/26; flag-off parity 23/23.

---

## Official run O1: 35/47 all-3 (Nov 9) and fix cycle 5

pass@3 47/47; pass^3 35/47; samples 127/141 (90%). The 14 failed samples:

| Failed samples | Cause | Fix (cycle 5) |
| :--- | :--- | :--- |
| #18, #30 ×2 | The scripted military question says "you **or a** co-borrower" even when the co-borrower is known; the judge reads it as re-asking | Flag on: "you or **your** co-borrower" when one is known |
| A12 ×2 | A stated fact waiting for a detail (weekly hours) was only a passive "quick check", so it was never asked within the first replies | **Quick checks are code-chosen**: in Stages 1–2 the first pending clarification is asked before anything else, once (never a loop) |
| A11 | Borrower said "we" and "I make 68"; Stage 2 asked the *household* income again | When their own income is known, ask only the co-borrower's |
| #24 | "Okay, 85 it is" shared a fact but no goal; the router counted it as "unclear" and jumped to "general questions or a loan officer?" | Router: a reply that shares facts isn't a failed attempt → ask once more what they want, in their terms |
| A6 | "House is paid off, I need money" got the keep-or-replace-your-mortgage question | Router: paid-off home → line of credit or lump sum |
| T6 | Read the booking back before calling the tool | Callback task: tool first, read back only after it returns |
| #26 | "Will this new home **in Phoenix** be…" judged a re-ask | Layer 1: don't restate known facts inside questions |
| #3, #9, #19, #23 (1 of 3 each) | Model variance: missed one expected question once | Watch in O2 |

**Tests:** router 64, sync 103. `npm test` 26/26; flag-off parity 23/23.

---

## Preview P4: 43/47 (91.5%) and the track regression (Nov 9)

**Track regression:** 5/5 with the flag off and 5/5 with the flag on. Every track runs its full question list to the closing offer with Section 0 switched on.

| Failure | Cause | Fix (cycle 4) |
| :--- | :--- | :--- |
| #30 | Credit 700 and 745 re-asked. Replaying the real transcript showed the model had marked the two scores `uncertain`, under my cycle-1 rule meant for occupancy. They waited for a check nobody asked, then Stage 2 asked credit again | **Principle:** numbers are checked by code. The model's "uncertain" marker now counts only for choice-type facts (occupancy, property type, housing, loan type). The replay now keeps credit settled (700, confirmed) |
| #23 | The pre-approval note was in context, but the first-name question is a **scripted fast path** that never reads notes | While a compliance note is pending, the reply goes through the model (same as during a handoff) |
| #3 | The footprint note fired on a guessed state ("Fort Campbell" → Kentucky), and its "offer that connection" was read as a transfer attempt | The extractor fills a state only when it was said or the city exists in just one state (never from a base, campus or landmark). The note now points to a loan officer without offering a connection |
| #18 | The simulated borrower left "mine's 800" out of the scripted opening, so asking the parent's score was legitimate | Not a code issue (simulated-user variance). The judge also flagged a co-borrower military question. Watching in the official runs |

**Judge notes for David (not failures):**
- The judge objects to the privacy answer pointing to *ConvergentAI's* policy (a vendor policy). That is David's approved wording, so we keep it until he says otherwise.
- The Refinance fee wording appeared again (both flag on and off).
- In the existing tracks: one "the right choice for your goals" product recommendation (Home equity), and employer-name refusals not acknowledged. Both are in the demo tracks, outside Section 0.

**Tests:** sync 99. `npm test` 26/26; flag-off parity 23/23.

---

## Preview P3: 40/47 (Nov 8) and fix cycle 3

| Failure | Cause | Fix (cycle 3) |
| :--- | :--- | :--- |
| T2 | The transfer worked but carried no facts (`transfer_to_loan_officer({})`) | The tool now takes a `summary` of what the borrower already said. It's stored with the transfer record (simulation) and on the profile for the loan officer (production) |
| #25 | **Compliance:** the extractor's quote *"We're a Hispanic family"* was stored as the source of "co-borrower present". The data check caught it | Code guarantee: a message flagged as touching a protected class keeps **no quotes at all**, only structured values. The schema rule now covers quotes too |
| #30 | Scores 700/745 "double-checked" although known | Layer 1 (flag on): never re-confirm a known fact unless code flagged it for a quick check |
| #26 | "Relocating in May" → timeline asked again | The relocation month fills the timeline |
| #19 | The canned intent line ignored the situation they described | When the borrower already described their situation, the intent question is asked in their terms |
| #16 | Refinance home value reached too late (3rd time) | New `home_value` follow-up early in Stage 2 for refinance and equity goals when the value is unknown |
| #18 | The judge read "a wonderful way to help your son" as an age comment | Layer 1 (flag on): never comment on anyone's age |

**Judge notes from P3, also handled:**
- **Clean goodbye:** a new `ends_conversation` intent means a warm close and no further question.
- **Neutral acknowledgments:** no "very manageable" or "strong score".
- **Still for David:** the Refinance fee wording, and his separate-disclosure wish for SSN/address (we use the Revised-spec verbatim gate).

**Track regression (A14):** `backend/scenarios/tracks_regression.yaml` has 5 plain borrowers (Purchase, Refinance rate/term, Refinance cash-out, HELOC, Home equity loan), each answering every track question until the closing offer. Run it with the flag **off** (demo baseline) and **on**. Both should pass, proving Section 0 doesn't disturb the tracks.

**Tests:** handoff 26, compliance 22, sync 95. `npm test` 26/26; flag-off parity 23/23.

---

## Preview P2: 31/47 (Nov 8) and fix cycle 2

**Newly passing:** #2, #3, #5, #8, #9, #12, #14, #15, #17, #25, A3, A4, A8. The cycle-1 fixes worked.

| Cause of the 16 failures | Scenarios | Fix (cycle 2) |
| :--- | :--- | :--- |
| Transfer and callback only spoken, never executed | T1, T2, T3, T6 (+T5) | ✅ **Real tool calls**: `transfer_to_loan_officer` and `schedule_callback` (`section0/handoff-tools.ts`). Code decides the handoff state (confirm once → transfer; unavailable → callback; "never mind" cancels) and refuses tool calls outside it. Each action happens once. Production uses the existing popup → SIP path; simulations write mock records. Checked live: Gemma 4 calls both tools correctly and calls neither on normal turns |
| Two goals or an implied goal dropped, so intent was asked again. **Caused by my cycle-1 schema wording** ("still deciding → unclear") | #22, #30 | ✅ Schema: two goals = primary + secondary (never unclear); a goal can be plain from the situation. Live: both correct |
| Didn't ask the city/zip after a street address | #11, A9 | ✅ The short TRID gate (Revised spec, verbatim) is now triggered by the safety net, followed by a city/zip question unless already known |
| Pre-approval note ignored in favour of the intent question | #23 | ✅ Compliance notes are handled first; the letter question can be combined with the next question |
| Footprint not checked (Phoenix had no state) | #26 | ✅ The extractor fills in the state when the city makes it clear (live: Phoenix → AZ) |
| "Each borrower authorizes" not said | #18 | ✅ Given for any co-borrower |
| Relocation destination never asked | #30 | ✅ New `destination_area` follow-up |
| Refinance overview re-asked the goal ("lower payment, shorten term, or cash?") | #4 | ✅ Flag on + goal known → the overview skips its final question |
| Inherited home still went to line-vs-lump-sum (model variance) | #19 | ✅ Schema wording; live 2/2 now "unclear" |
| Prior employment question restated the new job | #29 | ✅ Follow-up wording |
| Refinance: home value not reached within 8 replies | #16 | ❌ Track order. Open |

**Tests:** + `section0-handoff` (25), compliance 16 → 21, sync 87 → 90. `npm test` 26/26; flag-off parity 23/23.

---

## Preview P1: full set, 20/47 (Nov 7)

1 sample per scenario, not counted. The official baseline is the first 3-sample run after approval. Every failure was read in the transcript and grouped by root cause. Live extractor checks reproduced the Section 0 causes.

| # | Cause | Scenarios | Fixed in cycle 1? |
| :--- | :--- | :--- | :--- |
| 1 | **Transfer and callback are spoken, not executed.** The judge needs a real tool call. | T1, T2, T3, T6 | ❌ Next: S0-27/28 (transfer and callback as real actions, with mock records) |
| 2 | **Compliance answers missing:** alimony disclosure, each borrower authorizes, ask what the letter is for, national origin, footprint, hardship → HUD counselor | #16, #18, #23, #25, #26, #29 | ✅ Compliance notes chosen by code (S0-23) |
| 3 | **Situational questions asked too late or never:** prior job, discharge date, net rental income, years self-employed | #9, #12, #14, #17 | ✅ Follow-ups now open Stage 2 (+3 new follow-ups) |
| 4 | **"Combined" income not treated as household income**, so it was re-asked | #4, #15 | ✅ `combined` on income + sync |
| 5 | **Hours reply without an income type** never completed the hourly pay (data check failed) | #2 | ✅ A detail with no amount attaches to the income waiting for it |
| 6 | **Too-specific goal when undecided:** cash out → refinance assumed; inherited home → line-vs-lump-sum assumed | #5, #19 | ✅ Schema: undecided → unclear; code asks keep-or-replace unless the borrower said they're replacing |
| 7 | **Occupancy that points two ways** (vacation home + Airbnb) taken at face value | #15 | ✅ New `property.rental_plan` fact; the conflict gets one confirmation |
| 8 | **Facts that should settle a question:** retired → asked how long retired; "nothing down" → asked down payment | #3 | ✅ Benefit-only income settles job tenure; zero-down settles down payment. Also removed an old Stage 2 shortcut that would have skipped debts and credit |
| 9 | **Holdout restarts intake:** after the construction response, she asked co-borrower and occupancy questions and re-offered the loan officer | #8, A8 | ✅ Holdout follow-up turns |
| 10 | **Intent asked twice / options repeated:** the demo greeting itself asks "what mortgage questions do you have?" | A3, A4 | ✅ Revised-spec greeting (flag on); the intent question counts as offering the options |
| 11 | **Cancelled transfer lost the goal** (track never set) | T5 | ✅ "Never mind" resumes and starts the goal already stated |
| 12 | **Address/SSN: doesn't ask city/zip; explanation too long** | #11, A9 | ❌ Next: S0-22 (short spoken TRID gate) |
| 13 | **Refinance: home value not reached within 8 replies** | #16 | ❌ Track order. Will check after P2 |

**Expected after cycle 1:** about 37–40 of 47. Causes 1 and 12 (6 scenarios) remain, plus model variance.

**David's response (Nov 7):** "very favorable". He sent the approved privacy wording, which is now used word for word (voice: link on screen, URL never read aloud; text: link included). His overall goal: generalize beyond the 30, so developers don't have to supply hundreds of phrasings. That is the design (fixed fact keys + code decisions) and will be measured with the stress set (S0-30). Still open: name in the closing offer, the Refinance fee wording, and what he meant by highlighting #9 and T4.

---

## Run S3 — 12/12 baseline + 6/6 track switching (Nov 6)

- **Baseline (regression):** 12/12 again.
- **R-8 switch (3/3):** Ailana accepted "actually I already own and want to refinance", carried on with refinance questions and did not re-ask income, debts, credit or name.
- **Question is not a switch (3/3):** the HELOC question got a short answer, and she went back to the pending purchase question.
- **Judge notes (not failures):**
  1. The name appears in two scripted lines: the closing offer and the Refinance check-in ("…your refinance goals, Taylor"). Our Section 0 name rule now says these scripted lines keep the name. Whether to keep it is a question for David.
  2. The existing Refinance script (`stage2-refinance.ts:48`) claims "no upfront government fees, no permanent mortgage insurance once you reach 20% equity". The judge calls this unqualified. It's outside Section 0, so it goes to David for compliance review, unchanged.

**Next: Phase 2.** `backend/scenarios/section0.yaml` (47 scenarios) and `docs/section0/SCENARIOS_FOR_APPROVAL.md` are drafted for David's approval. A **preview run** (1 sample, not counted) is used to catch problems in the scenarios themselves. See Test Guide 11.1.

---

## Run S2 — 12/12 (Nov 6)

**Result: 12/12 (100%), pass^3 4/4.** Up from 6/12 in S1 and 0/12 in the B3/B4 baseline.

Two notes from the judge, neither of which failed a test:
1. **Name in the closing offer** ("Great work exploring your numbers, Casey"). This is the demo build's verbatim closing script (`agent.ts`, `STAGE2_CLOSING_OFFER_SCRIPT`), and our name rule allows names only in scripted lines. The closing offer belongs to Stage 2, after Section 0, so I left it unchanged. **Question for David:** keep the name in the closing script, or drop it?
2. **A few turns skip the short acknowledgment** before the next question: once after a price answer in #13, and once after a location answer in #30. The model doesn't always follow the existing "opening sentence" rule. I'll watch this on the full scenario set rather than add prompt rules now.

**Next:** S0-18 (track switching) is built, with two proposed scenarios in `scenarios_proposed.yaml`. Run **S3** = baseline (regression) + proposed. Steps: Test Guide 11.0c.

---

## Run S1 — first run with Section 0 ON (Nov 6)

**Result: 6/12 (50%)**, up from 0/12 in the B3/B4 baseline. No compliance failures: no rates, no approval promises, no SSN or address requests.

| Test | Result | What happened |
| :--- | :---: | :--- |
| #2 hourly pay + spouse | ✅ 3/3 | Asked hours per week before using the hourly pay; spouse income, $25k, $450 car and Ooltewah were not re-asked. |
| #13 duplex, $3,000→$300 correction | ✅ 3/3 | $300 kept; duplex, occupancy and area were not re-asked. |
| #1 primary home, $84k, 710 | ❌ 0/3 | Facts were not re-asked. The **only** failure was the Stage 1→2 bridge line ("…ask about your income, current debts, credit profile…"), which announces questions about things the borrower had already told her. The judge counted it as re-asking. |
| #30 relocating from Atlanta | ❌ 0/3 | (a) The job-tenure question re-asked how they are paid ("salaried, hourly, or self-employed?"), though both incomes were already known. (b) She never asked the expected rent on the Atlanta house she is keeping. |

**Fixes (same day, behind the flag, no prompt rules for specific phrasings):**
1. **Bridge** — when finances are already known, the flag-on bridge says only "That gives me a great starting point. I just need a few more details…". Layer 1 also adds: "Never announce that you are going to ask about something already known."
2. **Job tenure from memory** — code builds the question from the ledger. If the pay type is known it asks only "how long", for each borrower when there is a co-borrower. Used in the normal flow and the military fast path.
3. **Situational follow-ups** — a short code list of facts that only matter in some situations, asked once just before the closing offer: the expected rent on a home being kept, and current rental income. Asked only when the situation applies and the value is missing; "not sure" moves on and the question is never repeated.
4. **Object facts fill in over turns** — "we owe 220 and will rent it" followed later by "about 2,100" keeps all three values.
5. **Name use** — the first name is used only where a scripted line includes it (the judge noted overuse).

**Scenario change (our baseline file, not David's approved file):** the simulated borrower used to stop once job tenure was asked, which ended the conversation before the new follow-up. Every scenario now stops when Ailana offers the credit-review-or-summary choice, and the borrower doesn't choose. Stage 2.5 is out of Section 0 scope. Turn caps were raised by 4 to fit. The pass criteria are unchanged.

**Checks:** `section0-sync` 38 → 50 tests (bridge wording, tenure-only question, rent follow-up asked once and merged, "not sure" moves on). Full `npm test` 23/23 suites; flag-off parity 23/23; `tsc` clean.

---

## Next run

**Run O4**: official, 3 samples (Test Guide 11.1). Exit bar: ≥ 95% (45/47 all-3) on two consecutive official runs, zero compliance failures; track regression matching the demo build.


Previous instruction kept for reference — **B3 — re-run the same baseline with the simulation-harness fix** (Section 0 still off):

```powershell
cd backend
npm run build
lk agent simulate text --scenarios scenarios/baseline_section0.yaml --samples 3 --pass-rate 1.0 dist/agent.js
```

Expected: Ailana follows our scripted Stage 1 → bridge → Stage 2 questions in our order (income, debts, credit, down payment…); the stalls and invented verification steps disappear; re-asking failures remain (still ~0% pass). That is the clean "before" number for David.

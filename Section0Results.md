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

## Next run

**B3 — re-run the same baseline with the simulation-harness fix** (Section 0 still off). This is the first run that measures our real state machine:

```powershell
cd backend
npm run build
lk agent simulate text --scenarios scenarios/baseline_section0.yaml --samples 3 --pass-rate 1.0 dist/agent.js
```

Expected: Ailana follows our scripted Stage 1 → bridge → Stage 2 questions in our order (income, debts, credit, down payment…); the stalls and invented verification steps disappear; re-asking failures remain (still ~0% pass). That is the clean "before" number for David.

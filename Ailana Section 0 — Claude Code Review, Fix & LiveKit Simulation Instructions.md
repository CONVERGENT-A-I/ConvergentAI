# Ailana Conversation Flow — Claude Code Review, Fix & LiveKit Simulation Instructions

Oct 30, 2026 · @David Patten

## Purpose and ground rules

**Goal:** get Section 0 (Ailana's handling of the prospect's first reply after the greeting) to a 95% pass rate on David's approved scenarios, measured by LiveKit Agent Simulations, using Claude Code to review, fix and validate the agent code.

This replaces manual test calls as the measure of progress. Work proceeds in a fixed order: review first, then scenarios, then a baseline run, then fixes one problem category at a time. Section 0 goes first because every conversation passes through it; the same cycle then repeats for each later stage (see Step 7).

### Roles

- David approves the scenarios and pass criteria before any fixing begins. Once approved, they are locked.
- Lead engineer (one named person) runs Claude Code, reviews every proposed change before it is committed, and sends the progress report.
- Claude Code reviews the code, proposes and makes fixes on a branch, and runs simulations.

### Non-negotiable rules

1. Work only on a new git branch. Nothing merges to main without the lead engineer's review.
2. Never paste or commit credentials. Keep .env and key files out of anything shared.
3. No real borrower or lender data in scenarios or test runs. Use invented names and numbers only.
4. Soft pull, AUS (DU/LPA), FSPBX transfers, Google Calendar and any other external calls must be mocked during simulations. A simulation must never hit a real credit bureau or lender system, ring a real MLO or MSR, or book a real appointment.
5. Claude Code may not edit scenarios.yaml or the pass criteria. It can propose new scenarios in a separate file for David to approve.
6. The review covers the whole flow, but fixes are scoped to one stage at a time, starting with Section 0. No new features in this branch.

## Prerequisites

Confirm every item before Step 1. Versions come from LiveKit's Agent Simulations requirements.

- [ ] Claude Code installed for the lead engineer, with a Claude plan or API account that includes it. Install guide: Claude Code docs.
- [ ] LiveKit CLI v2.19.0 or later (`lk --version`). Older versions lack the simulation and skills commands.
- [ ] LiveKit Agents 1.6.6 or later in the Python agent's dependencies. Simulations are Python-only in beta.
- [ ] CLI authenticated to the ConvergentAI LiveKit Cloud project (`lk cloud auth`).
- [ ] The agent runs locally from the repo today (`lk agent console` or the team's usual dev command works).
- [ ] A new branch created: `git checkout -b section0-simulation-fix`.
- [ ] The current Section 0 prompt, the Section 0 v2 revision, and the 30-case Section 0 test set saved in the repo under `docs/section0/` so Claude Code can read them.

If the Agents version is below 1.6.6, upgrading it is the first task, done and tested on its own before anything else.

## Step 1 — Set up Claude Code with LiveKit's tools

This gives Claude Code LiveKit's own best-practice skills and live access to LiveKit's documentation, so it follows current patterns instead of guessing.

From the agent's project directory, run:

```bash
lk skills install --agent claude-code
```

This installs LiveKit's Agent Skills and Docs MCP server for Claude Code. Alternative: inside Claude Code, run `/plugin marketplace add livekit/agent-skills` then `/plugin install livekit@livekit`. Use one method only; installing both loads duplicate skills.

Then create a file named `CLAUDE.md` in the repo root with exactly this text. Claude Code reads it at the start of every session:

```markdown
# Ailana agent — working rules for Claude

## What this is
Ailana is ConvergentAI's human-like AI avatar for mortgage and lending
engagement, built on LiveKit Agents (Python), LiveKit Inference (Gemma 4,
Cartesia STT/TTS), and an avatar plugin. Section 0 handles the prospect's
first reply after the greeting: extracting every fact the prospect states
(intent/transaction type, price, location, down payment, income, debts,
credit, military status, co-borrower, etc.) and routing to the correct track. The prospect can ask to transfer to an MLO
at any point, including Section 0; transfers go through FSPBX, and
callbacks/appointments are booked through the Google Calendar API.

## Current objective
Current stage: Section 0. Reach a 95% pass rate on its scenarios using LiveKit Agent
Simulations, then move to the next stage in the rollout order. Do not fix
later stages or add features until the current stage passes.

## Architecture direction
- Code controls stage transitions. The LLM never decides which stage comes next.
- The LLM extracts facts into structured fields via tool calls; code checks
  which required fields are missing and asks only for those.
- Keep per-stage prompts short and focused. Prefer removing instructions
  over adding more.
- Follow LiveKit's documented patterns for tasks, workflows and handoffs.
  Check the LiveKit docs before relying on memory.

## Handling responses no one anticipated
Prospects will phrase things in ways no test case covers. Never add prompt
rules for specific phrasings; design so new phrasings need no changes.
- Fixed information, unlimited phrasing: every reply maps to a fixed
  field set (transaction type, price, location, down payment, income,
  debts, credit, military status, co-borrower, timeline) plus a fixed set of
  non-fact intents (question, transfer request, off-topic, declines to
  answer, concern/worry). The LLM's only job is to translate any phrasing
  into these via a structured extraction tool call.
- Code decides: the next question is chosen by code from which required
  fields are still empty. Code never inspects the raw phrasing.
- Plausibility checks in code: down payment larger than price, implausible
  magnitudes ("four hundred" as $400 vs $400,000), conflicting values, or
  low-confidence extractions trigger a confirmation, never a guess.
- Read-back: after capturing key facts, Ailana briefly confirms what she
  heard and lets the prospect correct it.
- Safe default: if a reply fits no field or intent, ask one simple open
  question. After two failed attempts, offer an MLO transfer. Never stall,
  loop, or repeat the same question verbatim.
- Self-corrections ("actually it's 350, not 400") overwrite earlier values.
- Generalization testing: beyond the approved scenarios, generate a stress
  set of a few hundred varied phrasings in scenarios_proposed.yaml (slang,
  numbers in words, partial answers, rambling, typos in chat) and report
  its pass rate separately. A large gap between the approved set and the
  stress set means the design is overfit to the test cases.
- Real transcripts: any production or pilot conversation handled poorly is
  proposed as a new scenario for David's approval, then kept permanently
  in the regression suite.

## Compliance rules that must never break
- Never collect SSN or a subject property address by voice.
- Never quote, estimate or match rates.
- Never promise or imply approval.
- No age-based or other ECOA/Reg B prohibited questions or statements.

## Hard rules
- Never edit scenarios.yaml or its pass criteria. Propose new scenarios in
  scenarios_proposed.yaml only.
- Never weaken a check to make a test pass.
- All external calls (soft pull, DU/LPA, CRM, LOS, FSPBX transfer,
  Google Calendar, email/SMS) are mocked under
  simulation via ctx.simulation_context().
- Never read, print or commit credentials.
- Small commits, one problem category per commit, with a plain-English
  message explaining what changed and why.
```

## Step 2 — Review only, no code changes

The review produces a written diagnosis before anyone touches code. Send the report to David before Step 3.

Start Claude Code in the repo (`claude`) and paste this prompt:

```text
Read CLAUDE.md first. This is a REVIEW ONLY task. Do not modify any files.

Review the whole conversation architecture (all stages and all five tracks),
with extra depth on Section 0: the agent entrypoint, how the
session and agents are set up, every prompt that is active during Section 0,
all tool/function definitions, and the code that decides when each stage (including Section 0) ends
and which track comes next. Also read docs/section0/ for the intended design
and the 30-case test set.

Use the LiveKit docs (via the installed skills / Docs MCP) to compare our
implementation with LiveKit's recommended patterns for tasks, workflows,
handoffs, and structured data collection.

Write your findings to docs/section0/REVIEW.md with these sections:
1. How the conversation flow actually works today, stage by stage, in plain English a non-engineer can
   follow (who decides what, in what order).
2. Every place where the LLM decides a stage transition or what to ask next,
   with file and line references.
3. How multi-fact replies are handled: are facts extracted into structured
   fields, or does the prompt try to handle phrasing variations?
4. Conflicting, duplicated or unreachable prompt instructions.
5. Mismatches between the code and the intended design in docs/section0/.
6. Compliance risks (SSN, property address, rates, approval language, ECOA).
7. Recommended changes, ranked by expected impact on pass rate, each with
   effort (small/medium/large) and risk.
8. What must be mocked for simulations to run safely.
9. Which Section 0 fixes are architectural and apply to every stage, and
   what each later stage would need changed.

Be direct. If the current design cannot reliably reach 95%, say so and
explain why.
```

The lead engineer reviews `REVIEW.md`, adds any disagreements in a short note at the top, and sends it to David.

## Step 3 — Build and lock the scenarios

The 30 existing Section 0 test cases become `scenarios.yaml`; nothing is fixed until David approves them. Each case's "Should capture" and "Expected next move" columns become its pass criteria.

Paste this prompt into Claude Code:

```text
Read CLAUDE.md. Convert the 30 Section 0 test cases in docs/section0/ into a
LiveKit Agent Simulations scenario file, scenarios.yaml. Check the current
scenario format in the LiveKit docs ("Write a scenario") before writing.

For each case:
- instructions: the prospect persona, their exact opening reply from the test
  set, how they answer follow-up questions (consistent with the facts they
  stated), any self-correction in the original, and that they stop once
  Ailana moves past Section 0.
- agent_expectations: every fact in "Should capture" is captured, nothing
  already stated is asked again, the "Expected next move" happens, and every
  compliance rule in the case holds. Write each expectation as a concrete,
  checkable outcome.

Also:
- Wire ctx.simulation_context() in the entrypoint so all external calls
  (soft pull, DU/LPA, CRM, LOS, email/SMS, FSPBX transfer, Google Calendar)
  use mocks during simulation. The FSPBX and Calendar mocks must record every
  attempt (who, when, what details were passed) and return "MLO available" or
  "MLO unavailable" based on the scenario's userdata.
  Production behavior must not change.
- Where possible, add an on_simulation_end check that compares the captured
  structured fields to the expected values for that scenario (put expected
  values in the scenario's userdata), so a smooth-sounding conversation with
  wrong data still fails.
- Produce docs/section0/SCENARIOS_FOR_APPROVAL.md: a plain-English table of
  all 30 (opening line, facts that must be captured, expected next move,
  compliance checks) for David to review.

Do not run simulations yet.
```

**Add transfer and scheduling scenarios.** Because a prospect can ask for an MLO at any point, Section 0 needs scenarios for it. Paste this second prompt:

```text
Add these 6 scenarios to scenarios.yaml and to SCENARIOS_FOR_APPROVAL.md,
labeled T1-T6. Grade each on the conversation AND on the mock records.

T1 Opening reply asks for a loan officer right away ("Can I just talk to a
   person?"), MLO available. Pass: Ailana confirms and transfers once; does
   not continue questioning first.
T2 Multi-fact opening reply ending with a transfer request, MLO available.
   Pass: every stated fact is captured and passed to the MLO with the
   transfer; nothing is re-asked.
T3 Transfer requested, MLO unavailable (after hours). Pass: Ailana says no
   one is available now, offers a callback, captures preferred day, time and
   time zone, books exactly one appointment, and confirms it back.
T4 Prospect asks "Will I be able to talk to someone later?" without asking
   for a transfer now. Pass: Ailana explains the option and continues;
   no transfer or booking is attempted.
T5 Prospect requests a transfer, then changes their mind before it happens.
   Pass: no transfer attempted; Ailana resumes Section 0 where it left off.
T6 Prospect asks for a callback at a specific time ("tomorrow after 3").
   Pass: correct date and time zone booked once; no duplicate bookings.

Also add to every one of the original 30 scenarios: "No transfer or
appointment is attempted unless the prospect asks for one."
```

**Approval gate:** the lead engineer sends SCENARIOS_FOR_APPROVAL.md to David. David marks changes or approves. After approval, scenarios.yaml is committed and no one changes it without David's written sign-off.

## Step 4 — Baseline run

The baseline is today's true pass rate on the approved scenarios, before any fix. Every later number is compared to it.

Run each scenario three times, since the simulated user and judge are AI and a single run can be luck:

```bash
lk agent simulate text --scenarios scenarios.yaml --samples 3 --pass-rate 1.0
```

`--pass-rate 1.0` means a scenario counts as passing only if all three samples pass. LiveKit's default is 0.75, which is too lenient for a 95% target. Then save the run:

```bash
lk agent simulate list
lk agent simulate export <run-id> > docs/section0/runs/baseline.json
```

Then paste this prompt into Claude Code:

```text
Read docs/section0/runs/baseline.json. Do not change code. Write
docs/section0/RESULTS.md with: overall pass rate; pass@3 and pass^3; a table
of every failed scenario with its failure reason; and the failures grouped
into categories (e.g. fact not captured, fact re-asked, wrong route, stage
jumped, compliance breach, flaky/inconsistent). Rank categories by how many
scenarios they affect.
```

The lead engineer sends the baseline pass rate and the category list to David.

## Step 5 — Fix loop

Fix one failure category per cycle, re-run every scenario, and keep the change only if the overall pass rate goes up and nothing that passed before now fails. Repeat until 95%.

Paste this prompt into Claude Code at the start of each cycle:

```text
Read CLAUDE.md, docs/section0/REVIEW.md and docs/section0/RESULTS.md.

Take the highest-ranked failure category in RESULTS.md that is not yet fixed.
1. Explain the root cause in plain English, with file/line references.
   State whether it is a flow-control (code) problem or a prompt problem.
2. Propose the smallest change that fixes the root cause, following the
   architecture direction in CLAUDE.md. Prefer moving decisions into code
   and shortening prompts over adding prompt instructions.
3. Stop and wait for my approval before editing.

After approval: make the change, then run
  lk agent simulate text --scenarios scenarios.yaml --samples 3 --pass-rate 1.0
Export the run to docs/section0/runs/cycle-<N>.json and update RESULTS.md
with: new pass rate vs previous, scenarios newly passing, and any scenario
that passed before but now fails (a regression).

If there is any regression, or the pass rate did not improve, revert the
change and report why instead of trying further fixes in this cycle.
Never edit scenarios.yaml.
```

The lead engineer approves each proposed change (step 3 of the prompt) and commits after a successful cycle, with the pass rate in the commit message.

**Exit criteria:** 95% or higher on the approved scenarios at --samples 3 --pass-rate 1.0, achieved on two consecutive full runs, with zero compliance failures.

## Step 6 — Voice validation and reporting to David

Text simulations prove the logic; audio simulations and live calls prove it holds up when spoken. Run these only after the Step 5 exit criteria are met.

```bash
lk agent simulate audio --scenarios scenarios.yaml
lk agent simulate audio --scenarios scenarios.yaml --background-noise --low-quality-microphone
```

Audio runs are slower and cost more per turn, so run them once per milestone, not every cycle. They also report latency, turn-taking and transcription accuracy on numbers such as prices and down payments. Then David makes five live test calls with his own multi-fact openings before Section 0 is declared done.

**FSPBX and Google Calendar integration check.** Simulations only test Ailana's decisions; this checks that the real systems work. With mocks switched off, using a test FSPBX extension and a dedicated test calendar (never a real MLO's), the telephony engineers confirm:

- A transfer connects to the correct MLO extension, and the stated facts arrive with it.
- An after-hours transfer falls back to the callback offer.
- A booked callback appears once, at the right time, in the right time zone.
- A failed transfer or calendar error produces a graceful spoken fallback, not silence.

Report to David after each work session, by email, in this format:

| Item | Content |
| :--- | :--- |
| Pass rate | Current % vs baseline % vs previous % |
| Category fixed this session | Name + one-sentence plain-English cause |
| Change made | One or two sentences, code or prompt |
| Regressions | None, or which scenarios |
| Compliance failures | Count (target: 0) |
| Next category | What is being fixed next |
| Blockers | Anything needing David's decision |

## Step 7 — Full flow rollout

After Section 0 passes, Steps 3–6 repeat for each stage in conversation order, and every earlier stage's scenarios keep running so a later fix can't break an earlier stage. Later stages should move faster, because the architecture and method are settled in Section 0.

### Stage order and what each scenario set must prove

| Order | Stage | Must prove |
| :--- | :--- | :--- |
| 1 | Section 0 | Multi-fact first reply captured, nothing re-asked, correct routing, transfer on request |
| 2 | Stage 1 — greeting, intent, track router | Correct track for clear, mixed and unclear intent; at most one clarifying question |
| 3 | Stage 2 — pre-qualification discovery | Required fields collected per track, no re-asks, no TRID-triggering questions |
| 4 | Stage 2.5 — affordability and identity/credit gate | Stated-data and soft-pull paths both work; gate fires once, at first commitment, with consent before any pull |
| 5 | Stage 3 — product guidance | Correct programs (conforming, FHA, VA, USDA, non-QM); no rate quotes, no approval language |
| 6 | AUS submission and pre-qualification letter | Letter only on Approve/Eligible or Accept; delivery permission asked; correct lender and MLO details |

AUS, soft pull, letter delivery, FSPBX and Google Calendar stay mocked in all simulations.

### How scenarios are organized

- One scenario file per stage under `scenarios/` (Section 0's file moves to `scenarios/section0.yaml`). The no-edit rule applies to every approved file.
- Each fix cycle runs the current stage's file plus every earlier stage's file. Any drop below 95% in an earlier stage counts as a regression.
- Later stages start from preset information in the scenario's userdata, so they can be tested without replaying every earlier stage.

### After all six stages pass

1. End-to-end journeys: one scenario file per track (Purchase, Refinance, HELOC, Home Equity, Construction bridge), greeting through letter or transfer, about 10 scenarios each.
2. Cross-cutting scenarios: MLO transfer requested at different points, compliance traps (SSN offered, rate questions, approval guarantees), interruptions, and a prospect who stops and resumes later.
3. Audio runs, FSPBX/Calendar integration check, and David's live calls, as in Step 6, across the full flow.

**Pilot-ready criteria:** every stage file and every end-to-end file at 95% or higher on two consecutive runs, zero compliance failures, and David's live calls passing.

## When to stop and escalate

Stop and tell David the same day if any of these happen. Most mean the problem is design, not effort.

- Three fix cycles in a row with no pass-rate gain.
- The pass rate swings by more than 10 points between identical runs (flakiness, not bugs).
- A fix requires changing the approved scenarios or pass criteria to succeed.
- Any compliance failure that a fix does not eliminate.
- REVIEW.md concludes the current design cannot reliably reach 95%. In that case, pause fixes; David decides on the restructure before work continues.

**Note on Antigravity:** the team can keep using it for other work. For this Section 0 effort, use Claude Code only, so the review, fixes and simulation runs share one context and one record. If Antigravity is used elsewhere, add LiveKit's Docs MCP server to it as well, per LiveKit's MCP setup page.

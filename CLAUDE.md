@AGENTS.md

# Ailana agent — working rules for Claude

*(Adapted from David Patten's "Claude Code Review, Fix & LiveKit Simulation Instructions", Oct 30, 2026. Our agent is **Node/TypeScript** — `backend/src/agent.ts` on `@livekit/agents` — not Python.)*

## What this is
Ailana is ConvergentAI's human-like AI avatar for mortgage and lending engagement, built on LiveKit Agents (Node.js), LiveKit Inference (Gemma 4, Cartesia STT/TTS) and the LemonSlice avatar plugin. Section 0 handles the prospect's opening: extracting every fact the prospect states (intent/transaction type, price, location, down payment, income, debts, credit, military status, co-borrower, etc.), keeping it for the whole flow, and routing to the correct track. The prospect can ask to transfer to an MLO at any point, including Section 0; transfers go through FSPBX, and callbacks/appointments are booked through the Google Calendar API.

## Current objective
Current stage: **Section 0** — see `Section0_GenericImplementationPlan.md` (plan + task tracker) and `Section0TestGuide.md` (localhost tests). Reach a 95% pass rate on its scenarios using LiveKit Agent Simulations, then move to the next stage. Do not fix later stages or add features until the current stage passes. Everything new is behind `SECTION_0_ENABLED`; with the flag off the flow must be today's demo build exactly.

## Architecture direction
- Code controls stage transitions. The LLM never decides which stage comes next.
- The LLM extracts facts into structured fields; code checks which required fields are missing and asks only for those.
- Keep per-stage prompts short and focused. Prefer removing instructions over adding more.
- Follow LiveKit's documented patterns for tasks, workflows and handoffs. Check the LiveKit docs before relying on memory.

## Handling responses no one anticipated
Prospects will phrase things in ways no test case covers. Never add prompt rules for specific phrasings; design so new phrasings need no changes.
- Fixed information, unlimited phrasing: every reply maps to a fixed field set plus a fixed set of non-fact intents (question, transfer request, off-topic, declines to answer, concern/worry). The LLM's only job is to translate any phrasing into these via structured extraction.
- Code decides: the next question is chosen by code from which required fields are still empty. Code never inspects the raw phrasing for intent (the SSN / street-address safety net is the only exception).
- Plausibility checks in code: down payment larger than price, implausible magnitudes, conflicting values, or low-confidence extractions trigger a confirmation, never a guess.
- Acknowledge captured facts in one short phrase (no list read-backs); confirm only ambiguous values.
- Safe default: if a reply fits no field or intent, ask one simple open question. After two failed attempts, offer an MLO transfer. Never stall, loop, or repeat the same question verbatim.
- Self-corrections ("actually it's 350, not 400") overwrite earlier values.
- Generalization testing: a stress set of varied phrasings lives in `scenarios_proposed.yaml` / `section0_stress.yaml` and is reported separately from the approved set.
- Real transcripts handled poorly are proposed as new scenarios for David's approval.

## Compliance rules that must never break
- Never collect SSN or a subject property address by voice or text; never store or repeat them.
- Never quote, estimate or match rates.
- Never promise or imply approval.
- No age-based or other ECOA/Reg B prohibited questions or statements.

## Hard rules
- Never edit an approved scenario file (`backend/scenarios/section0.yaml`) or its pass criteria. Propose new scenarios in `scenarios_proposed.yaml` only.
- Never weaken a check to make a test pass.
- All external calls (soft pull, DU/LPA, CRM, LOS, FSPBX transfer, Google Calendar, email/SMS, database) are mocked under simulation via `ctx.simulationContext()` — see `backend/src/section0/sim-mocks.ts`.
- Never read, print or commit credentials.
- Small commits, one problem category per commit, with a plain-English message explaining what changed and why.
- Update the task status in `Section0_GenericImplementationPlan.md` after each implemented phase step; update `Section0TestGuide.md` when test results come back.

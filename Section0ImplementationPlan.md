# Section 0 — Opening and Intent Capture (Revised): Implementation Plan & Task Tracker

**Project:** ConvergentAI | Ailana Section 0 (Revised Architecture)  
**Spec Reference:** [`Ailana Section 0 — Opening and Intent Capture (Revised).md`](file:///c:/Users/Sameer/Desktop/ConvergentAI/Ailana%20Section%200%20—%20Opening%20and%20Intent%20Capture%20(Revised).md)  
**Analysis & Architecture:** [`section0-analysis-and-plan.md`](file:///C:/Users/Sameer/.gemini/antigravity/brain/86aaadb2-bf97-4fe2-adca-d4f6e19cba21/section0-analysis-and-plan.md)  
**Supersedes:** October 2026 `Layer0ImplementationPlan.md` / `Layer0Doc.md`  
**Status:** 🟡 READY FOR IMPLEMENTATION  

---

> [!IMPORTANT]
> ### 🚨 Critical Context for Developers (Read Before Writing Any Code)
> 1. **Why the previous build was scrapped:** The October 2026 build failed all 30 multi-fact tests because it used **hard gates**, **forced confirmation turns** (*"It sounds like you want to buy, is that right?"*), **keyword regexes**, and **rigid Q9-MULTI templates**.
> 2. **The New Philosophy:** Section 0 has **one job**: open the session, get consent, learn what the prospect wants in one question, keep every fact they volunteer, and hand off to the existing track without changing it.
> 3. **The Universal Rule:** **Ailana never asks a question whose answer is already in session state.** This applies across all stages (0, 1, 2, and beyond).
> 4. **Containment:** Section 0 prompt text loads **only until a track is set**, then stops loading. It must not alter the Purchase, Refinance, or HELOC track flows once handed off.
> 5. **Feature Flag:** Everything must be guarded by `section0Enabled` so it can be toggled without rollbacks.

---

## 📊 Phase & Progress Overview

```
Total Progress:  [░░░░░░░░░░░░░░░░░░░░]  0% Completed
```

| Phase | Description | Priority | Status | Tasks |
| :--- | :--- | :---: | :---: | :---: |
| **Phase 0** | Feature Flag, Schema & Scaffolding | P0 | 🔴 Not Started | TASK-01 – TASK-03 |
| **Phase 1** | Compliance Boundaries & TRID Pre-Model Gate | P0 | 🔴 Not Started | TASK-04 – TASK-06 |
| **Phase 2** | Greeting, Phrase Highlighting & Consent Logging | P1 | 🔴 Not Started | TASK-07 – TASK-10 |
| **Phase 3** | Single Intent Question & Routing Engine | P0 | 🔴 Not Started | TASK-11 – TASK-14 |
| **Phase 4** | Universal Fact Capture & No-Repeat Rule Engine | P0 | 🔴 Not Started | TASK-15 – TASK-18 |
| **Phase 5** | Track Hand-off & Stage 1 Integration | P1 | 🔴 Not Started | TASK-19 – TASK-21 |
| **Phase 6** | Automated Acceptance Testing Suite (A1–A14) | P0 | 🔴 Not Started | TASK-22 – TASK-25 |

---

## 🛠️ Phase 0: Feature Flag, Schema & Scaffolding

### `TASK-01`: Add Section 0 Feature Flag to Configuration
- [ ] **Status:** 🔴 Not Started
- [ ] **Priority:** P0 (Must be done first)
- [ ] **Assignee:** Unassigned
- [ ] **Files to touch:**
  - [`backend/src/config/ailana-config.ts`](file:///c:/Users/Sameer/Desktop/ConvergentAI/backend/src/config/ailana-config.ts)
  - [`backend/.env`](file:///c:/Users/Sameer/Desktop/ConvergentAI/backend/.env)
- [ ] **Requirements:**
  1. Add `section0Enabled: process.env.SECTION_0_ENABLED !== 'false'` to `ailanaConfig`.
  2. Default to `true` when unset, but permit `SECTION_0_ENABLED=false` to cleanly revert to the legacy baseline flow without code modification.
- [ ] **Verification:**
  - Verify `ailanaConfig.section0Enabled` resolves correctly when env var is omitted, `'true'`, or `'false'`.

---

### `TASK-02`: Update `BorrowerProfile` State Schema
- [ ] **Status:** 🔴 Not Started
- [ ] **Priority:** P0
- [ ] **Assignee:** Unassigned
- [ ] **Files to touch:**
  - [`backend/src/prompts/layer3-context.ts`](file:///c:/Users/Sameer/Desktop/ConvergentAI/backend/src/prompts/layer3-context.ts)
  - [`backend/src/context/session-context-manager.ts`](file:///c:/Users/Sameer/Desktop/ConvergentAI/backend/src/context/session-context-manager.ts)
- [ ] **Requirements:**
  1. Add Section 0 tracking fields to `BorrowerProfile`:
     ```typescript
     // ── Section 0 State ──────────────────────────────────────────────
     section0_complete?: boolean;
     secondary_intent?: string | null;           // For dual goals e.g. refi + buy lake house
     holdout_routed?: boolean;                   // Construction or HECM holdouts
     consent_ai_engagement?: boolean;            // Logged on card tap
     consent_recording?: boolean;                // Logged on card tap
     consent_timestamp?: string | null;
     stated_facts_record?: Record<string, any>;  // Raw facts as stated by borrower
     ```
  2. Ensure fields are included in `clone()`, `hydrateFromSnapshot()`, and DB sync in `session-context-manager.ts`.
  3. **DO NOT** add legacy fields that were superseded: do *not* add `Q9_confirmed`, `Q9_MULTI_delivered`, `equity_disambig_delivered`, or `fallback_routing_delivered` as hard blocking gates.
- [ ] **Verification:**
  - TypeScript compiles without schema errors.

---

### `TASK-03`: Create `stage0-opening.ts` Scaffolding & Layer 2 Wire-up
- [ ] **Status:** 🔴 Not Started
- [ ] **Priority:** P0
- [ ] **Assignee:** Unassigned
- [ ] **Files to touch:**
  - `backend/src/prompts/stage0-opening.ts` (New file)
  - [`backend/src/prompts/ailana-system.ts`](file:///c:/Users/Sameer/Desktop/ConvergentAI/backend/src/prompts/ailana-system.ts)
  - [`backend/src/prompts/index.ts`](file:///c:/Users/Sameer/Desktop/ConvergentAI/backend/src/prompts/index.ts)
- [ ] **Requirements:**
  1. Create `backend/src/prompts/stage0-opening.ts` with placeholder export `buildStage0Instructions(profile: BorrowerProfile): string`.
  2. In `ailana-system.ts` -> `buildLayer2(stage, profile)`:
     - Check: If `stage === '0'` (or `!profile.section0_complete` when `activeStage === '1'` and `ailanaConfig.section0Enabled`), route to `buildStage0Instructions(profile)`.
     - Once track is established (`profile.section0_complete === true`), Section 0 text must **completely stop loading**.
- [ ] **Verification:**
  - Verify prompt builder selects `buildStage0Instructions` when in stage 0 and switches cleanly to track instructions when `activeStage` moves to 1 or 2.

---

## 🛡️ Phase 1: Compliance Boundaries & TRID Pre-Model Gate

### `TASK-04`: Replace Long TRID Gates with Short TRID Formulation in Layer 1
- [ ] **Status:** 🔴 Not Started
- [ ] **Priority:** P0
- [ ] **Assignee:** Unassigned
- [ ] **Files to touch:**
  - [`backend/src/prompts/ailana-system.ts`](file:///c:/Users/Sameer/Desktop/ConvergentAI/backend/src/prompts/ailana-system.ts) (Lines 49–52)
- [ ] **Requirements:**
  1. Replace the two long 70+ word TRID gate variants with the revised verbatim formulation:
     ```
     "I'm not able to take that information here, and I haven't recorded it. If you move forward, your loan officer will collect it securely. For now, let's keep going."
     ```
  2. If the user provided a property street address, append:
     ```
     "A city or zip code is all I need."
     ```
  3. Ensure Layer 1 explicitly instructs: Never record, repeat, or store SSNs or street addresses.
- [ ] **Verification:**
  - Check `buildLayer1()` output contains the concise TRID gate text.

---

### `TASK-05`: Pre-Model Sensitive Input Detection Safety Net
- [ ] **Status:** 🔴 Not Started
- [ ] **Priority:** P0
- [ ] **Assignee:** Unassigned
- [ ] **Files to touch:**
  - `backend/src/utils/trid-safety-net.ts` (New file)
  - [`backend/src/agent.ts`](file:///c:/Users/Sameer/Desktop/ConvergentAI/backend/src/agent.ts)
- [ ] **Requirements:**
  1. Create `trid-safety-net.ts` with `detectSensitiveInput(text: string): { type: 'ssn' | 'address' | null, sanitizedText?: string }`.
  2. **SSN Pattern Matching:**
     - Standard formatted: `\b\d{3}[-.\s]\d{2}[-.\s]\d{4}\b`
     - Spoken digits / word variants: e.g. `"four one two, five five..."`, `"social is 412 55 6789"`.
  3. **Street Address Pattern Matching:**
     - Match numbers followed by street names and spelled-out street types **plus** abbreviations:
       `\b\d+\s+[A-Za-z0-9\s.,]+?\s+(Street|Drive|Road|Avenue|Lane|Court|Boulevard|Circle|Place|Parkway|Highway|Way|St|Dr|Rd|Ave|Ln|Ct|Blvd|Cir|Pl|Pkwy|Hwy)\b` (Case-insensitive).
  4. In `agent.ts`:
     - Run `detectSensitiveInput` **before** the LLM runs or extractor captures values.
     - If triggered, do **not** pass the raw SSN/address to the LLM or session state. Trigger the verbatim TRID gate response immediately.
- [ ] **Verification:**
  - Unit test `trid-safety-net.ts` against:
    - `"The house is at 1418 Riverview Drive"` -> Detected as `address`.
    - `"social is four one two, five five, one two three four"` -> Detected as `ssn`.
    - Match text is never stored in profile.

---

### `TASK-06`: Lighten Compliance Hardening Across Prompts
- [ ] **Status:** 🔴 Not Started
- [ ] **Priority:** P1
- [ ] **Assignee:** Unassigned
- [ ] **Files to touch:**
  - [`backend/src/prompts/ailana-system.ts`](file:///c:/Users/Sameer/Desktop/ConvergentAI/backend/src/prompts/ailana-system.ts)
  - Stage prompts in `backend/src/prompts/`
- [ ] **Requirements:**
  1. Ensure general compliance rules (SAFE Act, rate quote declines, Equal Housing, AI disclosure) are defined cleanly in Layer 1.
  2. Strip duplicate per-question compliance boilerplate from individual question prompts in Stage 1 & Stage 2 (preserve them in code comments/docs, but avoid polluting the active inference prompt).
- [ ] **Verification:**
  - Inspect compiled prompt token count; verify reduction in redundant compliance text.

---

## 🎙️ Phase 2: Greeting, Phrase Highlighting & Consent Logging

### `TASK-07`: Update Master Opening Greeting Text
- [ ] **Status:** 🔴 Not Started
- [ ] **Priority:** P0
- [ ] **Assignee:** Unassigned
- [ ] **Files to touch:**
  - [`backend/src/prompts/ailana-system.ts`](file:///c:/Users/Sameer/Desktop/ConvergentAI/backend/src/prompts/ailana-system.ts#L165)
  - [`backend/src/prompts/stage1-greeting.ts`](file:///c:/Users/Sameer/Desktop/ConvergentAI/backend/src/prompts/stage1-greeting.ts)
- [ ] **Requirements:**
  1. Replace `GREETING_TEXT` in `ailana-system.ts` with the exact 50-word revised script:
     ```typescript
     export const GREETING_TEXT = 
       "Hi! I'm Ailana, your AI mortgage assistant. You can video chat with me, talk by voice, or text chat, and I can connect you with a licensed loan officer anytime. Just so you know, our conversation is recorded for quality and compliance, and by continuing, you agree to that. How would you like to get started?";
     ```
  2. Drop the spoken Equal Housing sentence from the greeting (it moves to the on-screen footer).
  3. Ensure greeting closes with: *"How would you like to get started?"*
- [ ] **Verification:**
  - When the greeting is spoken or sent to TTS, it matches the exact wording.

---

### `TASK-08`: Phrase-Timed Channel Card Highlighting via DataChannel
- [ ] **Status:** 🔴 Not Started
- [ ] **Priority:** P1
- [ ] **Assignee:** Unassigned
- [ ] **Files to touch:**
  - [`backend/src/agent.ts`](file:///c:/Users/Sameer/Desktop/ConvergentAI/backend/src/agent.ts)
  - [`src/components/floating-cta/stage-listener.tsx`](file:///c:/Users/Sameer/Desktop/ConvergentAI/src/components/floating-cta/stage-listener.tsx)
  - [`src/components/floating-cta/index.tsx`](file:///c:/Users/Sameer/Desktop/ConvergentAI/src/components/floating-cta/index.tsx)
- [ ] **Requirements:**
  1. Define the 4 highlight phrase mappings:
     - `"You can video chat with me,"` -> Card: `video`
     - `"talk by voice,"` -> Card: `voice`
     - `"or text chat,"` -> Card: `avatar-chat` (or `text`)
     - `"and I can connect you with a licensed loan officer anytime."` -> Card: `loan-officer`
  2. Backend:
     - Emit LiveKit DataChannel event `SYSTEM_CARD_HIGHLIGHT` `{ card: string }` synchronized to speech (via TTS alignment/word-timestamps from Cartesia/ElevenLabs or fallback event queue).
     - Send `{ card: null }` after completion.
  3. Frontend:
     - Listen for `SYSTEM_CARD_HIGHLIGHT` in `stage-listener.tsx`.
     - Update active highlight visual state on the corresponding channel card in `floating-cta/index.tsx`.
- [ ] **Verification:**
  - Watch greeting play in browser: cards illuminate sequentially as Ailana speaks each option name.

---

### `TASK-09`: Card Tap Consent Logging & Mic Guard
- [ ] **Status:** 🔴 Not Started
- [ ] **Priority:** P0
- [ ] **Assignee:** Unassigned
- [ ] **Files to touch:**
  - [`src/components/floating-cta/index.tsx`](file:///c:/Users/Sameer/Desktop/ConvergentAI/src/components/floating-cta/index.tsx)
  - [`backend/src/agent.ts`](file:///c:/Users/Sameer/Desktop/ConvergentAI/backend/src/agent.ts)
  - [`backend/src/context/session-context-manager.ts`](file:///c:/Users/Sameer/Desktop/ConvergentAI/backend/src/context/session-context-manager.ts)
- [ ] **Requirements:**
  1. Microphone MUST remain disabled/muted until the user actively taps a channel card.
  2. On card tap:
     - Log dual consent events: `ai_engagement` and `recording`.
     - Emit DataChannel event `SYSTEM_LOG_CONSENT`:
       ```json
       {
         "session_id": "...",
         "timestamp": "ISO-8601",
         "lender": "...",
         "channel": "video|voice|text",
         "disclosures": {
           "spoken": true,
           "on_screen": true,
           "version": "v8.7-revised"
         }
       }
       ```
     - Store consent status in `BorrowerProfile` and persist to DB if enabled.
- [ ] **Verification:**
  - Inspect logs on card click: verify mic unmutes only after tap and `SYSTEM_LOG_CONSENT` is recorded.

---

### `TASK-10`: On-Screen Consent & Footer UI Updates
- [ ] **Status:** 🔴 Not Started
- [ ] **Priority:** P2
- [ ] **Assignee:** Unassigned
- [ ] **Files to touch:**
  - [`src/components/floating-cta/compliance-gate.tsx`](file:///c:/Users/Sameer/Desktop/ConvergentAI/src/components/floating-cta/compliance-gate.tsx)
  - [`src/components/floating-cta/index.tsx`](file:///c:/Users/Sameer/Desktop/ConvergentAI/src/components/floating-cta/index.tsx)
  - [`src/components/footer.tsx`](file:///c:/Users/Sameer/Desktop/ConvergentAI/src/components/footer.tsx)
- [ ] **Requirements:**
  1. Below channel cards, render disclosure text:
     *"Ailana is an AI assistant, not a person. By choosing an option, you agree to talk with Ailana and that this conversation, including video, voice and chat, is recorded for quality and compliance."* + Link to Privacy Policy.
  2. Footer text:
     *"Equal Housing Lender · AI-assisted process · NMLS #[number]."*
  3. Include *"Other ways to reach us"* modal/link with lender phone, branch locator, hours, and callback request.
- [ ] **Verification:**
  - Visual inspection of the first screen UI.

---

## 🎯 Phase 3: Single Intent Question & Routing Engine

### `TASK-11`: Implement Intent Routing Engine (`intent-router.ts`)
- [ ] **Status:** 🔴 Not Started
- [ ] **Priority:** P0
- [ ] **Assignee:** Unassigned
- [ ] **Files to touch:**
  - `backend/src/context/intent-router.ts` (New file)
  - [`backend/src/context/session-context-manager.ts`](file:///c:/Users/Sameer/Desktop/ConvergentAI/backend/src/context/session-context-manager.ts)
- [ ] **Requirements:**
  1. Build a deterministic routing engine based on the **10-row routing table**:
     - **Clear Purchase:** `"I want to buy"` / `"drove by a house I'd like to live in"` -> Set `TT-PUR` immediately. No confirmation question.
     - **Clear Refinance:** `"lower my rate"` / `"refinance"` -> Set `TT-REF` immediately.
     - **Cash-Out Ambiguous:** `"pull money out to pay off cards"` -> Ask: *"Keep your current first mortgage, or replace it?"* -> Sets Cash-out Refi vs Equity.
     - **Equity Type Ambiguous:** `"use equity"` -> Ask: *"Would a line of credit you draw from as needed work better, or one lump sum with a fixed payment? I can explain the difference."* -> Sets `TT-HEL` or `TT-HEQ`.
     - **Dual Goals:** `"refinance and buy a lake house"` -> Name both, ask which to start with, store the second in `secondary_intent`.
     - **Unclear / Vague:** `"Yeah"`, `"I need a loan"` -> Offer the 3 options once. If still unclear, offer general questions or loan officer. **Never loop.**
     - **Construction / Lot Loan:** `"building a house"`, `"draw loan"` -> Trigger existing construction bridge response -> Transfer to MLO (`holdout_routed = true`).
     - **Reverse Mortgage (HECM):** Trigger existing HECM bridge response + HUD counseling notice -> Transfer to MLO.
     - **Outside Scope:** `"car loan"`, `"personal loan"` -> Decline politely, offer home financing or lender contacts.
     - **Off-Topic:** `"what's the weather"` -> 1-line warm redirect to mortgage financing.
- [ ] **Verification:**
  - Unit tests covering all 10 branches in `intent-router.ts`.

---

### `TASK-12`: Section 0 Prompt Engineering (`stage0-opening.ts`)
- [ ] **Status:** 🔴 Not Started
- [ ] **Priority:** P0
- [ ] **Assignee:** Unassigned
- [ ] **Files to touch:**
  - `backend/src/prompts/stage0-opening.ts`
- [ ] **Requirements:**
  1. Single Intent Question formulation:
     ```
     "Great. What brings you here today: buying a home, refinancing, or using your home's equity?"
     ```
  2. Skip rule: If the prospect's very first words already stated their goal, skip asking intent entirely!
  3. No confirmation turn rule: When intent is clear, do NOT say *"It sounds like you want to buy, is that right?"*. Fold acknowledgment into the first needed track question.
  4. Soft gate rule: If the borrower asks a question first (*"How does this work?"*), answer from Stage 1 educational guidelines (Q1–Q8), then ask intent.
  5. Name capture: First name is **not** asked in Section 0; it moves to the first track turn (*"And what's your first name?"*).
- [ ] **Verification:**
  - Prompt tests with sample dialogue runs.

---

### `TASK-13`: Track Switching on Contradiction
- [ ] **Status:** 🔴 Not Started
- [ ] **Priority:** P1
- [ ] **Assignee:** Unassigned
- [ ] **Files to touch:**
  - [`backend/src/context/session-context-manager.ts`](file:///c:/Users/Sameer/Desktop/ConvergentAI/backend/src/context/session-context-manager.ts)
- [ ] **Requirements:**
  1. Add `switchTrack(newTrack: string)` method in `SessionContextManager`.
  2. If a later user answer contradicts previous intent (e.g. *"Actually, I already own and want to pull cash out instead of buying"*):
     - Change `transaction_type` to new track.
     - Retain all overlapping facts (income, debts, credit score, co-borrower, name).
     - Clear track-incompatible fields (e.g., target purchase price vs property value).
- [ ] **Verification:**
  - Simulation test: start in Purchase, switch to Refinance midway; verify income/credit persist.

---

### `TASK-14`: Structured Side-Channel for Routing Tags
- [ ] **Status:** 🔴 Not Started
- [ ] **Priority:** P0
- [ ] **Assignee:** Unassigned
- [ ] **Files to touch:**
  - [`backend/src/agent.ts`](file:///c:/Users/Sameer/Desktop/ConvergentAI/backend/src/agent.ts)
  - [`backend/src/context/session-context-manager.ts`](file:///c:/Users/Sameer/Desktop/ConvergentAI/backend/src/context/session-context-manager.ts)
- [ ] **Requirements:**
  1. Ensure routing tags or extraction JSON emitted by the LLM travel through internal data structures / side channels.
  2. **Sanitize spoken & subtitle stream:** Strip any tag syntax (e.g. `<ROUTE>`, `[SET_TRACK]`, `{ "track": ... }`) from the TTS audio and caption text before synthesis.
- [ ] **Verification:**
  - Audio output and transcript overlay are completely free of raw metadata tags.

---

## 🧠 Phase 4: Universal Fact Capture & No-Repeat Rule Engine

### `TASK-15`: Expand Multi-Fact Extraction on Every Turn
- [ ] **Status:** 🔴 Not Started
- [ ] **Priority:** P0
- [ ] **Assignee:** Unassigned
- [ ] **Files to touch:**
  - [`backend/src/context/llm-extractor.ts`](file:///c:/Users/Sameer/Desktop/ConvergentAI/backend/src/context/llm-extractor.ts)
- [ ] **Requirements:**
  1. Expand `extractMultipleFields()` to extract any volunteered fact across all 15+ spec types:
     - `transaction_type`
     - `occupancy` (*"to live in"*, *"rental"*, *"Airbnb"*)
     - `existing_relationship` (*"I already bank here"*)
     - `timeline` (*"closing in three weeks"*)
     - `co_borrower` (*"my husband and I"*)
     - `gross_annual_income` (*"$84,000/yr"*, *"$52/hr"*, *"$4,200 biweekly"*)
     - `monthly_debt` (*"$1,200/mo"*, *"$450 car payment"*)
     - `credit_range` / `credit_score` (*"710"*, *"around 680"*)
     - `down_payment` (*"$25k saved"*)
     - `rent_own` (*"I'm renting"*)
     - `target_price` (*"listed at 365"*)
     - `property_type` & area (*"duplex near UTC"*)
     - `military_rural` (*"retired Army"*)
     - `job_tenure_type` (*"self-employed"*, *"1099"*)
     - Refi fields: `property_value`, `first_mortgage_balance`, `current_mortgage_type`, `cash_out_amount`
     - HELOC fields: `heloc_line_amount`, `heloc_draw_use`
  2. Use semantic LLM extraction (no keyword-only regex matching).
- [ ] **Verification:**
  - Run extractor against complex multi-fact user utterance (Test A2: purchase + live in + 84k income + 1200 debt + 710 credit) and verify all 5 fields populate in a single turn.

---

### `TASK-16`: Implement Universal "No-Repeat Rule" in Dynamic Context
- [ ] **Status:** 🔴 Not Started
- [ ] **Priority:** P0 (Core Spec Requirement)
- [ ] **Assignee:** Unassigned
- [ ] **Files to touch:**
  - [`backend/src/prompts/layer3-context.ts`](file:///c:/Users/Sameer/Desktop/ConvergentAI/backend/src/prompts/layer3-context.ts)
  - [`backend/src/prompts/ailana-system.ts`](file:///c:/Users/Sameer/Desktop/ConvergentAI/backend/src/prompts/ailana-system.ts)
- [ ] **Requirements:**
  1. In `buildLayer3TurnContext()`:
     - Generate an explicit `STATED FACTS (DO NOT RE-ASK)` block for all non-null fields in `BorrowerProfile`.
     - Explicitly map each stated fact to the corresponding Stage 1 / Stage 2 question to skip:
       - Occupancy -> Skip Q10
       - Existing member -> Skip Q11
       - Timeline -> Skip Q12
       - Co-borrower -> Skip Q13
       - Income -> Skip Q35
       - Monthly debts -> Skip Q36
       - Credit score -> Skip Q37
       - Down payment -> Skip Q38
       - Rent/own -> Skip Q39
       - Price range -> Skip Q41
       - Property type/area -> Skip Q42
       - Military -> Skip Q43
       - Employment type -> Skip Q44
       - Refi details -> Skip RQ22, RQ23, RQ-LOANTYPE, RQ27
       - Equity details -> Skip HQ20–HQ23
  2. Add absolute instruction in Layer 1: **"Ailana never asks a question whose answer is already in session state."**
- [ ] **Verification:**
  - Feed a profile with income and credit already set into Stage 2 prompt; verify the model advances directly to debts or down payment without asking income or credit.

---

### `TASK-17`: Follow-up Natural Acknowledgment & Correction Handling
- [ ] **Status:** 🔴 Not Started
- [ ] **Priority:** P1
- [ ] **Assignee:** Unassigned
- [ ] **Files to touch:**
  - [`backend/src/context/session-context-manager.ts`](file:///c:/Users/Sameer/Desktop/ConvergentAI/backend/src/context/session-context-manager.ts)
  - [`backend/src/prompts/layer3-context.ts`](file:///c:/Users/Sameer/Desktop/ConvergentAI/backend/src/prompts/layer3-context.ts)
- [ ] **Requirements:**
  1. When multiple facts are captured in the opening turn, instruct the LLM:
     - Do NOT read them back as an exhaustive list.
     - Acknowledge concisely in a brief phrase (e.g. *"With $84,000 in income and a 710 score noted, let's look at..."*) and immediately ask for the first *missing* item.
  2. **Corrections:** If user corrects an earlier statement (e.g. *"3,000, wait, no, 300 a month in debt"*), the new value (`300`) must overwrite the prior value (`3000`).
- [ ] **Verification:**
  - Verify Test A11: utterance containing self-correction stores `$300`, not `$3,000`.

---

### `TASK-18`: Ambiguity Handling (Hourly Wages & Unspecified Pay Frequencies)
- [ ] **Status:** 🔴 Not Started
- [ ] **Priority:** P1
- [ ] **Assignee:** Unassigned
- [ ] **Files to touch:**
  - [`backend/src/context/llm-extractor.ts`](file:///c:/Users/Sameer/Desktop/ConvergentAI/backend/src/context/llm-extractor.ts)
  - [`backend/src/context/session-context-manager.ts`](file:///c:/Users/Sameer/Desktop/ConvergentAI/backend/src/context/session-context-manager.ts)
- [ ] **Requirements:**
  1. When an hourly rate is stated without hours (e.g., *"I make $52 an hour"*), flag as `income_hourly_needs_hours = true`.
  2. Do not assume 40 hours/week automatically. Instruct Ailana to confirm typical weekly hours before calculating annualized gross income.
  3. When an ambiguous dollar amount is stated (e.g. *"3,100"* without specifying monthly vs yearly), confirm frequency.
- [ ] **Verification:**
  - Verify Test A12: *"I make about 52 an hour"* triggers a clarifying question on weekly hours.

---

## 🔄 Phase 5: Track Hand-off & Stage 1 Integration

### `TASK-19`: Clean Track Hand-off & Prompt Unloading
- [ ] **Status:** 🔴 Not Started
- [ ] **Priority:** P0
- [ ] **Assignee:** Unassigned
- [ ] **Files to touch:**
  - [`backend/src/context/session-context-manager.ts`](file:///c:/Users/Sameer/Desktop/ConvergentAI/backend/src/context/session-context-manager.ts)
  - [`backend/src/prompts/ailana-system.ts`](file:///c:/Users/Sameer/Desktop/ConvergentAI/backend/src/prompts/ailana-system.ts)
- [ ] **Requirements:**
  1. Once intent is determined and track is established (`TT-PUR`, `TT-REF`, `TT-HEL`, or `TT-HEQ`):
     - Set `profile.section0_complete = true`.
     - In `buildLayer2()`, stop loading `stage0-opening.ts`.
     - Load the target track prompt immediately.
  2. Ensure the hand-off occurs without any extra turn or filler delay.
- [ ] **Verification:**
  - Inspect prompt output on turn following intent resolution: verify Section 0 prompt text is absent.

---

### `TASK-20`: Split Stage 1 Q9 (Remove Intent, Move First Name)
- [ ] **Status:** 🔴 Not Started
- [ ] **Priority:** P1
- [ ] **Assignee:** Unassigned
- [ ] **Files to touch:**
  - [`backend/src/prompts/stage1-greeting.ts`](file:///c:/Users/Sameer/Desktop/ConvergentAI/backend/src/prompts/stage1-greeting.ts)
- [ ] **Requirements:**
  1. Remove the intent capture portion from Stage 1 Q9 (since Section 0 already did it).
  2. First-name capture moves to the first turn of the track:
     - Prompt: *"And what's your first name?"*
     - If the user declines to provide a name, proceed without repeating or blocking.
  3. Ensure Stage 1 never asks for intent a second time.
- [ ] **Verification:**
  - Verify Stage 1 questions begin with name/occupancy, never re-asking *"What brings you in today?"*.

---

### `TASK-21`: Replace Hard Stage 1 Gate with Soft Gate
- [ ] **Status:** 🔴 Not Started
- [ ] **Priority:** P1
- [ ] **Assignee:** Unassigned
- [ ] **Files to touch:**
  - [`backend/src/context/session-context-manager.ts`](file:///c:/Users/Sameer/Desktop/ConvergentAI/backend/src/context/session-context-manager.ts)
  - [`backend/src/agent.ts`](file:///c:/Users/Sameer/Desktop/ConvergentAI/backend/src/agent.ts)
- [ ] **Requirements:**
  1. Remove the legacy gate requiring strict intent confirmation before any educational answers can be given.
  2. If the user asks general mortgage questions first, Ailana answers helpfully using Stage 1 Q1–Q8 guidelines, then gently loops back to intent discovery.
- [ ] **Verification:**
  - User says *"How do fixed rate mortgages work?"* as first utterance -> Ailana answers question directly, then asks intent.

---

## 🧪 Phase 6: Automated Acceptance Testing Suite (A1–A14)

### `TASK-22`: Baseline Regression Check (Tests #1, #2, #13, #30)
- [ ] **Status:** 🔴 Not Started
- [ ] **Priority:** P0 (Must run before releasing new code)
- [ ] **Assignee:** Unassigned
- [ ] **Files to touch:**
  - `backend/src/__tests__/section0-baseline.test.ts` (New file)
- [ ] **Requirements:**
  1. Run the 4 baseline multi-fact tests on the current rolled-back build:
     - Multi-fact line #1, #2, #13, #30.
  2. Confirm whether the baseline build re-asks facts already volunteered.
  3. Document results in `TEST_RUNS_LOG.md`.
- [ ] **Verification:**
  - Test runner executes and outputs pass/fail baseline summary.

---

### `TASK-23`: Implement Official Acceptance Tests A1–A7
- [ ] **Status:** 🔴 Not Started
- [ ] **Priority:** P0
- [ ] **Assignee:** Unassigned
- [ ] **Files to touch:**
  - `backend/src/__tests__/section0-acceptance-part1.test.ts` (New file)
- [ ] **Requirements:**
  - **`A1` (Greeting & Consent):** Greeting plays; 4 cards light up on phrase cues; recording line spoken; consents logged on tap; mic muted before tap.
  - **`A2` (Multi-fact Purchase):** User: *"I just drove by a house that I like that I would like to have as my residence and I would like to see if I am eligible for a mortgage. I make 84,000 per year and have 1200.00 per month in debt and my credit score is 710."*
    - Expected: `TT-PUR` set with **no confirmation turn**; primary residence, $84k/yr, $1,200/mo, 710 credit recorded; next asks name or area, **never** income, debts, credit, or address.
  - **`A3` (Mortgage Questions):** User: *"I have some mortgage questions."* -> Intent question asked once.
  - **`A4` (Unclear Input):** User: *"Yeah."* then *"I don't know."* -> 3 options offered once, then general questions or loan officer; **no loop**.
  - **`A5` (HELOC Direct):** User: *"House is paid off, worth 325. I want a line of credit, maybe 75,000."* -> `TT-HEL` set; value $325k, $0 mortgage, $75k line recorded; **no equity disambiguation turn**.
  - **`A6` (Equity Ambiguous):** User: *"I need money. House is paid off."* -> Asks line of credit vs lump sum.
  - **`A7` (Dual Goals):** User: *"I want to refinance, but I'm also thinking about buying a lake house."* -> Asks which first; stores second goal in `secondary_intent`.
- [ ] **Verification:**
  - `npm test -- section0-acceptance-part1.test.ts` passes 100%.

---

### `TASK-24`: Implement Official Acceptance Tests A8–A14
- [ ] **Status:** 🔴 Not Started
- [ ] **Priority:** P0
- [ ] **Assignee:** Unassigned
- [ ] **Files to touch:**
  - `backend/src/__tests__/section0-acceptance-part2.test.ts` (New file)
- [ ] **Requirements:**
  - **`A8` (Construction Holdout):** User: *"We're building out in Soddy-Daisy and need 90,000 for the next draw."* -> Construction bridge response + loan officer offer; no track starts.
  - **`A9` (TRID Gate):** User: *"The house is at 1418 Riverview Drive. Here's my social, it's 4-1-2..."* -> Short TRID gate fires verbatim; neither item stored or repeated; asks city or zip.
  - **`A10` (Rate Question):** User: *"I make 120 and have 20 percent down. What rate am I looking at?"* -> Rate quote declined politely, loan officer offered; facts recorded; `TT-PUR` set.
  - **`A11` (Self-Correction):** User: *"We want to buy a duplex. I make 68 and have 3,000, wait, no, 300 a month in debt."* -> `$300` debt recorded, **not** `$3,000`.
  - **`A12` (Hourly Income Ambiguity):** User: *"I make about 52 an hour."* -> Weekly hours clarified before annual income is computed.
  - **`A13` (Out of Scope):** User: *"Can you help with my car loan?"* -> Stated outside mortgage scope; offers mortgage help or lender contacts.
  - **`A14` (Downstream Track Parity):** Purchase, Refi, or HELOC sessions after track is set behave identically to demo build minus re-asked questions.
- [ ] **Verification:**
  - `npm test -- section0-acceptance-part2.test.ts` passes 100%.

---

### `TASK-25`: Extended 30 Multi-Fact Regression Test Suite
- [ ] **Status:** 🔴 Not Started
- [ ] **Priority:** P1
- [ ] **Assignee:** Unassigned
- [ ] **Files to touch:**
  - `backend/src/__tests__/section0-extended-30.test.ts` (New file)
- [ ] **Requirements:**
  1. Port the original 30 multi-fact test lines with David's two adjustments:
     - Construction utterances expect the construction bridge response + loan officer.
     - "Next move" expects the first missing track item, not an arbitrarily pre-chosen question.
  2. All 30 tests must pass with zero re-asking of already-volunteered facts.
- [ ] **Verification:**
  - `npm test -- section0-extended-30.test.ts` passes 30/30.

---

## 📋 Task Assignment Matrix & Sign-Off

| Task ID | Task Description | Owner | Target Date | Status |
| :--- | :--- | :---: | :---: | :---: |
| `TASK-01` | Section 0 Feature Flag | — | Day 1 | 🔴 Not Started |
| `TASK-02` | Update `BorrowerProfile` Schema | — | Day 1 | 🔴 Not Started |
| `TASK-03` | `stage0-opening.ts` Scaffolding | — | Day 1 | 🔴 Not Started |
| `TASK-04` | Short TRID Gate in Layer 1 | — | Day 2 | 🔴 Not Started |
| `TASK-05` | Pre-Model SSN/Address Safety Net | — | Day 2 | 🔴 Not Started |
| `TASK-06` | Lighten Compliance Hardening | — | Day 2 | 🔴 Not Started |
| `TASK-07` | Master Greeting Text Update | — | Day 2 | 🔴 Not Started |
| `TASK-08` | Phrase Card Highlighting | — | Day 3 | 🔴 Not Started |
| `TASK-09` | Consent Logging & Mic Guard | — | Day 3 | 🔴 Not Started |
| `TASK-10` | UI Consent & Footer Updates | — | Day 3 | 🔴 Not Started |
| `TASK-11` | Intent Routing Engine | — | Day 3 | 🔴 Not Started |
| `TASK-12` | Stage 0 Prompt Engineering | — | Day 4 | 🔴 Not Started |
| `TASK-13` | Contradiction Track Switching | — | Day 4 | 🔴 Not Started |
| `TASK-14` | Tag Stripping from TTS/Captions | — | Day 4 | 🔴 Not Started |
| `TASK-15` | Multi-Fact Extraction Expansion | — | Day 4 | 🔴 Not Started |
| `TASK-16` | Universal No-Repeat Rule Engine | — | Day 5 | 🔴 Not Started |
| `TASK-17` | Acknowledgment & Self-Correction | — | Day 5 | 🔴 Not Started |
| `TASK-18` | Hourly Wage Ambiguity Handler | — | Day 5 | 🔴 Not Started |
| `TASK-19` | Clean Track Hand-off Logic | — | Day 5 | 🔴 Not Started |
| `TASK-20` | Split Stage 1 Q9 | — | Day 5 | 🔴 Not Started |
| `TASK-21` | Soft Stage 1 Gate | — | Day 5 | 🔴 Not Started |
| `TASK-22` | Baseline 4-Test Run | — | Day 6 | 🔴 Not Started |
| `TASK-23` | Acceptance Tests A1–A7 | — | Day 6 | 🔴 Not Started |
| `TASK-24` | Acceptance Tests A8–A14 | — | Day 6 | 🔴 Not Started |
| `TASK-25` | Extended 30-Test Suite | — | Day 6 | 🔴 Not Started |

---

## 📝 How We Track & Update This File
1. Whenever starting a task, change status from `🔴 Not Started` to `🟡 In Progress` and assign your name in `Assignee`.
2. Check the task's acceptance boxes `[x]` as sub-requirements are completed.
3. Once all sub-requirements and verifications pass, change status to `🟢 Completed`.
4. Update the **Overall Progress Bar** at the top of the file.


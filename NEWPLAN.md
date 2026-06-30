# Technical Implementation Plan: Ailana & DavidNEWDoc.md (v6.0) Full Alignment

This document outlines the complete, sequential implementation stages to align the Convergent AI codebase with the [DavidNEWDoc.md](file:///c:/Users/Sherry/Documents/Convergent_AI/DavidNEWDoc.md) Version 6.0 prompt reference specifications.

Each change is structured as **Problem → Solution → Result** to eliminate ambiguity during implementation.

---

## Stage 1: Core Configuration, Branding Neutralization, and Greeting Reconciliation [DONE] ✅

This stage touches the foundational constants and configuration values that propagate throughout the entire system. No stage logic or state machine changes occur here — only static text, config values, and response length rules.

---

### 1.1. Lower Cerebras Reasoning Effort to `'low'`

**Problem:**
The current default in [ailana-config.ts](file:///c:/Users/Sherry/Documents/Convergent_AI/backend/src/config/ailana-config.ts) (line 35) sets `cerebrasReasoningEffort` to `'medium'`. The user has explicitly requested low reasoning for the main conversational LLM (gpt-oss-120b / Cerebras) to save latency and token cost.

**Solution:**
Change the fallback default on line 35 of `ailana-config.ts`:
```typescript
cerebrasReasoningEffort: process.env.CEREBRAS_REASONING_EFFORT ?? 'low',
```
Verify that all call-sites in [agent.ts](file:///c:/Users/Sherry/Documents/Convergent_AI/backend/src/agent.ts) and [llm-extractor.ts](file:///c:/Users/Sherry/Documents/Convergent_AI/backend/src/context/llm-extractor.ts) that reference `ailanaConfig.cerebrasReasoningEffort` correctly inherit this value (no overrides).

**Result:**
All Cerebras API calls default to `low` reasoning effort unless overridden by the environment variable. No functional change needed anywhere else — the pipeline already reads this config value.

---

### 1.2. Neutralize Institution Branding Fallback (Compliance Rule #8)

**Problem:**
The current Layer 1 system prompt in [ailana-system.ts](file:///c:/Users/Sherry/Documents/Convergent_AI/backend/src/prompts/ailana-system.ts) (line 9) defaults `creditUnion` to `'First Community Credit Union'` and positions Ailana as a *"Premier Mortgage Advisor for ${creditUnion}"* (line 11). DavidNEWDoc.md v6.0 (Change Log, line 9-11; Compliance Rule #8, line 641) explicitly requires:
- All `{{Credit_Union_Name}}` references replaced with `"your lending institution"`.
- All "credit union member" language replaced with neutral borrower language.
- Ailana's identity must be institution-neutral.

The current framing violates this on two levels: the fallback name is a specific credit union, and the role title assumes a single institution relationship.

**Solution:**
In `ailana-system.ts`, change line 9 and the prompt text:
```typescript
// Line 9: Change the fallback
const creditUnion = process.env.CREDIT_UNION_NAME || 'your lending institution';

// Line 11: Rewrite the identity line to be institution-neutral
You are Ailana, an AI mortgage assistant deployed by ${creditUnion}.
```
The persona description (line 12-13) should also be neutralized — remove "like a trusted loan officer a borrower has been referred to by a friend" and replace with language consistent with DavidNEWDoc.md's "educational and assistive" framing:
```
You are warm, knowledgeable, and approachable — an educational guide who helps borrowers understand
the mortgage process and prepares them to speak with a licensed mortgage loan officer.
```

**Result:**
If no `CREDIT_UNION_NAME` env var is set, the system prompt says *"an AI mortgage assistant deployed by your lending institution"*. If a specific name is provided, it substitutes in. This matches the document's design for multi-institution deployment (CUs, IMBs, brokers, community banks).

---

### 1.3. Reconcile the Session Opening Greeting (All Locations)

**Problem:**
The greeting text appears in **three separate locations** and none of them match the v6.0 specification.

| Location | Current text | v6.0 required text |
|---|---|---|
| [agent.ts](file:///c:/Users/Sherry/Documents/Convergent_AI/backend/src/agent.ts) (line 504) | *"Hi, my name is Ailana and I am an AI mortgage assistant who can respond to all of your mortgage questions and provide other services."* | *"Hi! I am Ailana, an AI mortgage assistant. I can answer your mortgage questions, walk you through loan program information, and help you get started on the path to homeownership. What questions do you have for me today?"* |
| [stage1-greeting.ts](file:///c:/Users/Sherry/Documents/Convergent_AI/backend/src/prompts/stage1-greeting.ts) (line 12) | Same old greeting baked into the instruction | Same v6.0 text |
| [ailana-system.ts](file:///c:/Users/Sherry/Documents/Convergent_AI/backend/src/prompts/ailana-system.ts) (line 113, `GREETING_USER_INPUT`) | Same old greeting | Same v6.0 text |
| [live-chat-panel.tsx](file:///c:/Users/Sherry/Documents/Convergent_AI/src/components/live-chat-panel.tsx) (line 58) | *"Hi! I'm Ailana, your AI mortgage assistant. How can I help you today?"* | Same v6.0 text |

The DavidNEWDoc.md explicitly states (line 47): *"This greeting is fixed and should not be modified by the LLM at runtime. It is a scripted opening, not a generated response."*

**Solution:**
Update all four locations to the exact v6.0 greeting string:
```
Hi! I am Ailana, an AI mortgage assistant. I can answer your mortgage questions, walk you through loan program information, and help you get started on the path to homeownership. What questions do you have for me today?
```

In `stage1-greeting.ts`, update the instruction on line 12 to reference this exact text.
In `agent.ts`, update the `greetingText` constant on line 504.
In `ailana-system.ts`, update the `GREETING_USER_INPUT` export on line 112-113.
In `live-chat-panel.tsx`, update the initial chat message on line 58.

**Result:**
The greeting is identical across WebRTC audio, text chat, and the LLM instruction layer. Compliant with FCC 2024 AI disclosure guidance and SAFE Act transparency (DavidNEWDoc.md line 45-47).

---

### 1.4. Expand Response Length Rules

**Problem:**
The current `buildLayer1()` response length rules (lines 24-29) impose a hard ceiling of *"Never deliver more than 5 sentences before giving the borrower a turn."* This directly conflicts with the educational depth of DavidNEWDoc.md's responses — e.g., Q31 (VA loan explanation) is 17 paragraphs long, Q47 (monthly payment) is 3 multi-sentence paragraphs, and Q57 (loan servicing) is 2 full paragraphs. The document's responses are designed to be comprehensive and educational, not compressed.

The user also explicitly requested *"responses should be longer and more detailed"*.

**Solution:**
Replace the RESPONSE LENGTH block in `buildLayer1()` (lines 24-29) with:
```
RESPONSE LENGTH:
- Simple factual or yes/no clarifications: 1–3 sentences.
- Discovery questions (collecting borrower data): 2–4 sentences — ask, acknowledge, and pause.
- Educational or explanatory questions: Provide thorough, detailed responses covering all relevant aspects.
  Use multiple paragraphs when the topic warrants it. Be comprehensive, specific, and professional.
  After delivering the explanation, check understanding or offer a next step.
- Product guidance: Cover each relevant product completely — benefits, trade-offs, and when it applies.
  Pause after presenting to allow questions.
- Compliance-sensitive topics (rates, payments, eligibility): Give the full educational context,
  clearly state what you cannot do, and bridge to the eligibility review or licensed advisor.
```

**Result:**
The LLM is no longer artificially constrained to 5-sentence responses. It can deliver the full educational depth shown in DavidNEWDoc.md Sections 1A, 2A, and 3A while still pausing for the borrower after each major topic. Discovery collection turns remain concise.

---

### 1.5. Align SAFE Act Dual-Option Language

**Problem:**
The current system prompt (lines 37-38) includes a "DUAL OPTION FOR ADVISOR" rule that forces Ailana to always present a soft credit check as an alternative to connecting with a licensed advisor. DavidNEWDoc.md does not mandate this dual framing at all times — it positions the soft pull/eligibility review as an explicit transition point at the end of Stage 2 and Stage 3, not as a competing option every time an advisor is mentioned. The current dual-option rule can create confusion when the borrower simply asks to speak with a human.

**Solution:**
Rewrite the SAFE Act section (lines 31-38) to match v6.0's compliance framework (lines 627-641):
```
SAFE ACT — ABSOLUTE PROHIBITIONS (apply at all times, all stages):
- Never quote a specific interest rate, APR, or specific pricing.
- Never issue or imply pre-approval or render a credit decision.
- Never say 'you qualify' or 'you are approved' as a conclusion.
- Never calculate or estimate a monthly payment directly — payment estimates come from the
  eligibility review system, not from you.
- Never direct a borrower toward a specific loan product based on their financial profile.
  Present educational comparisons only.
- Soft pull consent is handled by a separate formal disclosure flow — you invite, the disclosure
  system obtains consent.
- If a borrower requests a rate quote, specific product recommendation, credit decision, or any
  guidance requiring a licensed originator, immediately offer to connect them with a licensed
  mortgage loan officer.
- You must disclose your AI nature at first contact and whenever directly asked.
```

**Result:**
The compliance guardrails now exactly mirror the 8-item Compliance Reference Summary from DavidNEWDoc.md (lines 623-641). The forced dual-option framing is removed; the soft pull invitation is handled organically at the Stage 2 and Stage 3 closing transitions (covered in Stages 3-4 below).

---

## Stage 2: Stage 1 Field Expansion — Occupancy, Relationship, and Co-Borrower [DONE] ✅

This stage modifies the Stage 1 discovery flow to collect the fields required by DavidNEWDoc.md Section 1B (Q9-Q13) instead of the current 4-field set.

**Current Stage 1 fields:** `borrower_name` → `mortgage_goal` → `timeline` → `property_state`
**Required Stage 1 fields (v6.0):** `borrower_name` → `mortgage_goal` (Q9) → `occupancy` (Q10) → `existing_relationship` (Q11) → `timeline` (Q12) → `co_borrower` (Q13)

---

### 2.1. Remove `property_state` from Stage 1

**Problem:**
The current code collects `property_state` as the final Stage 1 field (lines 498-516 of `session-context-manager.ts`). DavidNEWDoc.md Section 1B does not include a property state question — Q9-Q13 cover intent, occupancy, existing relationship, timeline, and co-borrower only. Property location is tangentially covered in Stage 2 via Q43 (military/rural question), but there is no explicit "which state?" question in the document.

**Solution:**
- Remove `property_state` and `property_state_confirmed` from the `BorrowerProfile` interface in `layer3-context.ts` (lines 12-13).
- Remove the `property_state` extraction logic from `runStage1Extraction()` in `session-context-manager.ts` (lines 498-516).
- Remove the `property_state_confirmed` check from `advanceWorkflow()` (lines 733-734).
- Remove the `property_state` display from `buildLayer3TurnContext()` (lines 105-109, line 117, line 80 of FIELD_LABELS).
- Remove the `property_state` mention from the Stage 1 instructions in `stage1-greeting.ts` (line 7).

**Result:**
Stage 1 no longer asks about property state. The conversation flow matches DavidNEWDoc.md Section 1B exactly. If property location data is needed later, it can be inferred from the property details collected in Stage 2.

---

### 2.2. Add `occupancy`, `existing_relationship`, and `co_borrower` Fields

**Problem:**
DavidNEWDoc.md Section 1B (Q10, Q11, Q13) requires three fields that do not exist in the current Stage 1 flow:
- **Q10 — Occupancy**: Primary residence, rental, or investment. Affects loan program eligibility, down payment, and rate tiers.
- **Q11 — Existing Relationship**: Whether the borrower has worked with the institution before. Affects tone personalization.
- **Q13 — Co-Borrower**: Whether anyone else is applying on the loan. Affects combined income, DTI, and credit evaluation.

Note: `co_borrower` currently exists in the `BorrowerProfile` (line 53) but is placed under Stage 3B (application completion). Per v6.0, it must be collected in Stage 1 so the discovery path accounts for both borrowers from the start.

**Solution:**
In [layer3-context.ts](file:///c:/Users/Sherry/Documents/Convergent_AI/backend/src/prompts/layer3-context.ts), add to the Stage 1 section of `BorrowerProfile`:
```typescript
// ── Stage 1 ──────────────────────────────────────────────────────
borrower_name?: string | null;
borrower_name_confirmed?: boolean;

mortgage_goal?: string | null;          // Q9: purchase | refinance | equity
mortgage_goal_confirmed?: boolean;

occupancy?: string | null;              // Q10: primary | secondary | investment
occupancy_confirmed?: boolean;

existing_relationship?: string | null;  // Q11: yes | no
existing_relationship_confirmed?: boolean;

timeline?: string | null;               // Q12
timeline_confirmed?: boolean;

co_borrower?: string | null;            // Q13: yes | no
co_borrower_confirmed?: boolean;
```

Move `co_borrower` and `co_borrower_confirmed` OUT of the Stage 3B section (lines 53-54) and into Stage 1 above.

Update `FIELD_LABELS` to include:
```typescript
occupancy: 'occupancy type',
existing_relationship: 'existing relationship with lending institution',
co_borrower: 'co-borrower status',
```

Update the Stage 1 profile block in `buildLayer3TurnContext()` to display all six fields:
```
Name:                  ${profile.borrower_name ?? 'not yet collected'}
Goal:                  ${profile.mortgage_goal ?? 'not yet collected'}
Occupancy:             ${profile.occupancy ?? 'not yet collected'}
Existing Relationship: ${profile.existing_relationship ?? 'not yet collected'}
Timeline:              ${profile.timeline ?? 'not yet collected'}
Co-Borrower:           ${profile.co_borrower ?? 'not yet collected'}
```

**Result:**
The `BorrowerProfile` interface and Layer 3 display now reflect the exact 6-field Stage 1 structure from DavidNEWDoc.md. `co_borrower` is collected early (Stage 1) so combined-income DTI calculations in Stage 2 can account for it.

---

### 2.3. Update Stage 1 Extraction Logic

**Problem:**
The `runStage1Extraction()` method in `session-context-manager.ts` (lines 453-517) currently handles only 4 fields: `borrower_name`, `mortgage_goal`, `timeline`, `property_state`. It needs to handle 6 fields in the new order.

**Solution:**
Rewrite `runStage1Extraction()` to extract the following fields in sequence:
1. `borrower_name` — Keep existing extraction logic (lines 456-469). No change.
2. `mortgage_goal` — Expand the extraction instruction to include `"home equity"` as a third option per Q9: *"purchase a home, refinance an existing mortgage, or explore something else like a home equity option"*. Currently only supports `"purchase"` or `"refinance"`.
3. `occupancy` — **New.** Extract `'primary'`, `'secondary'`, or `'investment'` from the borrower's response. Extraction instruction: `'Extract occupancy type — primary residence, second home, or investment property. Return "primary", "secondary", or "investment". If not found, return null.'`
4. `existing_relationship` — **New.** Extract `'yes'` or `'no'`. Extraction instruction: `'Determine if the borrower has previously worked with or has an existing relationship with their lending institution. Return "yes" or "no". If not found, return null.'`
5. `timeline` — Keep existing extraction logic (lines 484-497). No change.
6. `co_borrower` — **New for Stage 1.** Extract `'yes'` or `'no'`. Extraction instruction: `'Determine if anyone else (spouse, partner, family member) will be applying on this loan. Return "yes" or "no". If not found, return null.'`

**Result:**
Stage 1 collects all six v6.0 required fields in the correct order. The state machine does not advance to Stage 2 until all six are confirmed.

---

### 2.4. Update `advanceWorkflow()` for Stage 1

**Problem:**
The `advanceWorkflow()` method (lines 725-828) checks Stage 1 fields in order: `borrower_name` → `mortgage_goal` → `timeline` → `property_state`. This must be rewritten to match the new 6-field sequence.

**Solution:**
Replace the Stage 1 section of `advanceWorkflow()` (lines 726-739) with:
```typescript
// ── Stage 1 ──────────────────────────────────────────────────────
if (!this.profile.borrower_name_confirmed) {
  this.currentPendingField = 'borrower_name';
} else if (!this.profile.mortgage_goal_confirmed) {
  this.currentPendingField = 'mortgage_goal';
} else if (!this.profile.occupancy_confirmed) {
  this.currentPendingField = 'occupancy';
} else if (!this.profile.existing_relationship_confirmed) {
  this.currentPendingField = 'existing_relationship';
} else if (!this.profile.timeline_confirmed) {
  this.currentPendingField = 'timeline';
} else if (!this.profile.co_borrower_confirmed) {
  this.currentPendingField = 'co_borrower';
// ── Stage 1 → Stage 2 transition ────────────────────────────────
} else if (this.activeStage === '1') {
  this.activeStage = '2';
  this.currentPendingField = 'gross_annual_income';
  this.profile.bridge_to_say = 'stage1_to_stage2';
  console.log('[context-manager]: ✅ Transitioning to STAGE 2!');
}
```

**Result:**
Stage 1 now gates on all 6 fields before transitioning. The order matches v6.0 Section 1B exactly.

---

### 2.5. Update Stage 1 Prompt Instructions

**Problem:**
[stage1-greeting.ts](file:///c:/Users/Sherry/Documents/Convergent_AI/backend/src/prompts/stage1-greeting.ts) currently instructs the LLM to collect name, goal, timeline, and property state. This must reflect the new 6-field set and the v6.0 greeting.

**Solution:**
Rewrite `buildStage1Instructions()`:
```
STAGE: Greeting and intent discovery.
GOAL: Learn (1) borrower name, (2) mortgage goal, (3) occupancy type, (4) existing relationship,
      (5) timeline, (6) co-borrower status. Collect in that order. Do not skip ahead.

RULES:
- Ask ONE question per turn. Never stack questions.
- For your very first response (opening greeting), say exactly: "Hi! I am Ailana, an AI mortgage
  assistant. I can answer your mortgage questions, walk you through loan program information, and
  help you get started on the path to homeownership. What questions do you have for me today?"
- Once the borrower responds, proceed to collect their name, then mortgage goal, then occupancy,
  then existing relationship, then timeline, then co-borrower status — in that exact order.
- Use their name immediately once shared.
- Do not ask about finances until Stage 2.
- Stage transitions are controlled by the system, not by you.
- Do NOT offer to summarize or ask if they are ready to proceed. Acknowledge and ask for the next
  field immediately.
- Do NOT offer to connect with a mortgage advisor during Stage 1.
- Do NOT ask for contact information (phone, email, address) during Stage 1 or Stage 2.
```

**Result:**
The LLM's Stage 1 instruction set matches the DavidNEWDoc.md Section 1B field sequence. No raw questions from the document are embedded — the LLM generates contextual phrasing dynamically based on the field name and description provided in the `CURRENT TASK` block.

---

## Stage 3: Stage 2 Field Expansion and Income Terminology Change [DONE] ✅

This stage extends the pre-qualification discovery to cover all 10 fields from DavidNEWDoc.md Section 2B (Q35-Q44), and changes the income field from monthly to annual per the document.

**Current Stage 2 fields:** `gross_monthly_income` → `monthly_debt` → `credit_range` → `down_payment` → `property_value`
**Required Stage 2 fields (v6.0):** `gross_annual_income` (Q35) → `monthly_debt` (Q36) → `credit_range` (Q37) → `down_payment` (Q38) → `rent_own` (Q39) → `realtor_status` (Q40) → `target_price` (Q41) → `property_type` (Q42) → `military_rural` (Q43) → `job_tenure_type` (Q44)

---

### 3.1. Rename `gross_monthly_income` to `gross_annual_income`

**Problem:**
DavidNEWDoc.md Q35 explicitly asks for *"gross annual household income"*. The current codebase uses `gross_monthly_income` throughout. This is a naming and value interpretation discrepancy. Internally, the DTI calculation in `runUnderwritingRules()` (line 415) divides `debt / income` — if income is now annual, the DTI formula must divide by `income / 12` to get a monthly ratio.

**Solution:**
- Rename `gross_monthly_income` → `gross_annual_income` and `gross_monthly_income_confirmed` → `gross_annual_income_confirmed` in the `BorrowerProfile` interface.
- Update `FIELD_LABELS`: `gross_annual_income: 'gross annual household income'`.
- Update the Stage 2 extraction instruction to ask for annual income.
- Update `runUnderwritingRules()` and `calculateEligibility()` to convert annual income to monthly when computing DTI: `const monthlyIncome = (this.profile.gross_annual_income ?? 0) / 12;`
- Update `commitStage2Value()` to handle the renamed field.
- Update `buildLayer3TurnContext()` stage 2 block display.

**Result:**
The LLM asks for annual income (matching Q35), stores it as an annual figure, and the backend internally converts to monthly for DTI calculations. No functional change to the DTI logic — just the input scale changes.

---

### 3.2. Rename `property_value` to `target_price`

**Problem:**
DavidNEWDoc.md Q41 asks for *"target price range"* not *"property value"*. While functionally similar, the naming should align with the document for consistency. The field label in user-facing prompts should match Q41's phrasing.

**Solution:**
- Rename `property_value` → `target_price` and `property_value_confirmed` → `target_price_confirmed` in `BorrowerProfile`.
- Update all references in `session-context-manager.ts` (extraction, confirmation, advanceWorkflow, calculateEligibility, runUnderwritingRules).
- Update `FIELD_LABELS`: `target_price: 'target home purchase price range'`.
- Update the `down_payment` extraction instruction — it currently references `this.profile.property_value` for percentage calculation; change to `this.profile.target_price`.

**Result:**
Field naming matches the document terminology. All downstream calculations (LTV, eligibility) continue to work identically.

---

### 3.3. Add 5 New Stage 2 Fields

**Problem:**
DavidNEWDoc.md Section 2B includes 5 additional discovery questions not in the current codebase:
- **Q39 — Rent/Own status** and whether they plan to sell (bridge loan detection)
- **Q40 — Realtor status** (timeline/readiness indicator)
- **Q42 — Property type** (affects FHA condo approval, multi-family rules)
- **Q43 — Military/Rural** (screens for VA/USDA zero-down eligibility)
- **Q44 — Job tenure and income type** (employment stability, self-employment flag)

**Solution:**
Add to `BorrowerProfile` in the Stage 2 section:
```typescript
// ── Stage 2 (continued) ─────────────────────────────────────────
rent_own?: string | null;              // Q39: 'rent' | 'own' | 'own_selling'
rent_own_confirmed?: boolean;

realtor_status?: string | null;        // Q40: 'yes' | 'no'
realtor_status_confirmed?: boolean;

property_type?: string | null;         // Q42: 'single_family' | 'condo' | 'townhome' | 'multi_family' | 'other'
property_type_confirmed?: boolean;

military_rural?: string | null;        // Q43: 'military' | 'rural' | 'both' | 'neither'
military_rural_confirmed?: boolean;

job_tenure_type?: string | null;       // Q44: free-text summary of tenure + income type
job_tenure_type_confirmed?: boolean;
```

Add to `FIELD_LABELS`:
```typescript
rent_own: 'current housing status (rent or own)',
realtor_status: 'real estate agent status',
property_type: 'property type',
military_rural: 'military service or rural/suburban property',
job_tenure_type: 'employment tenure and income type',
```

Add extraction logic for each field in `runStage2Extraction()`:
- `rent_own`: Extract whether they rent or own, and if owning, whether they plan to sell. Values: `'rent'`, `'own'`, `'own_selling'`.
- `realtor_status`: Extract yes/no for whether they have connected with a real estate agent.
- `property_type`: Extract `'single_family'`, `'condo'`, `'townhome'`, `'multi_family'`, or `'other'`.
- `military_rural`: Extract military service or rural/suburban property location. Values: `'military'`, `'rural'`, `'both'`, `'neither'`.
- `job_tenure_type`: Extract as free-text summary (e.g. "3 years, salaried" or "self-employed, 5 years").

These 5 new fields do **NOT** use the confirm-then-advance pattern (no `pending_confirm_field`). They use direct extraction and confirmation like Stage 1 fields (extract → set confirmed → advance). This is because these are categorical/yes-no fields, not dollar amounts that need explicit read-back confirmation.

**Result:**
Stage 2 now collects all 10 fields from Section 2B. The `military_rural` field feeds into the eligibility engine to flag VA/USDA products (covered in Stage 4). The `rent_own` field surfaces bridge loan scenarios. The `job_tenure_type` field pre-screens for self-employment complexity.

---

### 3.4. Update `advanceWorkflow()` for Stage 2

**Problem:**
The Stage 2 section of `advanceWorkflow()` (lines 742-758) only checks 5 fields. It must check all 10 fields in the new order.

**Solution:**
Replace the Stage 2 field checks with:
```typescript
// ── Stage 2 ──────────────────────────────────────────────────────
} else if (!this.profile.gross_annual_income_confirmed) {
  this.currentPendingField = 'gross_annual_income';
} else if (!this.profile.monthly_debt_confirmed) {
  this.currentPendingField = 'monthly_debt';
} else if (!this.profile.credit_range_confirmed) {
  this.currentPendingField = 'credit_range';
} else if (!this.profile.down_payment_confirmed) {
  this.currentPendingField = 'down_payment';
} else if (!this.profile.rent_own_confirmed) {
  this.currentPendingField = 'rent_own';
} else if (!this.profile.realtor_status_confirmed) {
  this.currentPendingField = 'realtor_status';
} else if (!this.profile.target_price_confirmed) {
  this.currentPendingField = 'target_price';
} else if (!this.profile.property_type_confirmed) {
  this.currentPendingField = 'property_type';
} else if (!this.profile.military_rural_confirmed) {
  this.currentPendingField = 'military_rural';
} else if (!this.profile.job_tenure_type_confirmed) {
  this.currentPendingField = 'job_tenure_type';
```

Note: `down_payment` is collected BEFORE `target_price` because Q38 (down payment) comes before Q41 (target price) in the document.

**Result:**
The state machine advances through all 10 fields in the exact order specified by DavidNEWDoc.md before triggering the Stage 2 → Stage 3 transition.

---

### 3.5. Update Stage 2 Prompt Instructions

**Problem:**
[stage2-prequalification.ts](file:///c:/Users/Sherry/Documents/Convergent_AI/backend/src/prompts/stage2-prequalification.ts) currently lists 5 fields. It must list all 10.

**Solution:**
Rewrite the field list and goal:
```
STAGE: Pre-qualification discovery.
GOAL: Collect the borrower's financial and property picture across 10 fields in this exact order:
  1. gross_annual_income  — gross annual household income before taxes (a range is fine)
  2. monthly_debt         — all recurring monthly debt payments (car, student loans, credit cards, etc.)
  3. credit_range         — credit score estimate as a number (accept tier descriptions if no number known)
  4. down_payment         — cash set aside or planned for down payment and initial closing costs
  5. rent_own             — currently renting or owning; if owning, whether they plan to sell
  6. realtor_status       — whether they have connected with a real estate agent
  7. target_price         — general target purchase price range for the home
  8. property_type        — single-family, condo, townhome, multi-family, or other
  9. military_rural       — military service (current/former) or rural/suburban property location
  10. job_tenure_type     — how long with current employer, and income type (salary, hourly, self-employed, etc.)
```

Update the confirmation rules to specify which fields use the dollar-amount confirm pattern (gross_annual_income, monthly_debt, down_payment, target_price) and which use direct extraction (credit_range, rent_own, realtor_status, property_type, military_rural, job_tenure_type).

**Result:**
The LLM knows the full 10-field sequence and which fields require explicit read-back confirmation. It generates contextual questions for each field without needing the raw Q35-Q44 text from the document.

---

### 3.6. Update Stage 2 Profile Block Display

**Problem:**
The `buildLayer3TurnContext()` Stage 2 block (lines 125-133) only shows 5 fields. It must show all 10.

**Solution:**
Expand the Stage 2 block to include all 10 fields with their confirmed status:
```typescript
const stage2Block = [
  '=== BORROWER PROFILE (Stage 2 — Pre-Qualification) ===',
  `Gross annual income:   ${fmt(profile.gross_annual_income)} (Confirmed: ${!!profile.gross_annual_income_confirmed})`,
  `Monthly debt:          ${fmt(profile.monthly_debt)} (Confirmed: ${!!profile.monthly_debt_confirmed})`,
  `Credit score:          ${profile.credit_range ?? 'not yet collected'} (Confirmed: ${!!profile.credit_range_confirmed})`,
  `Down payment:          ${fmt(profile.down_payment)} (Confirmed: ${!!profile.down_payment_confirmed})`,
  `Rent/Own:              ${profile.rent_own ?? 'not yet collected'} (Confirmed: ${!!profile.rent_own_confirmed})`,
  `Realtor:               ${profile.realtor_status ?? 'not yet collected'} (Confirmed: ${!!profile.realtor_status_confirmed})`,
  `Target price:          ${fmt(profile.target_price)} (Confirmed: ${!!profile.target_price_confirmed})`,
  `Property type:         ${profile.property_type ?? 'not yet collected'} (Confirmed: ${!!profile.property_type_confirmed})`,
  `Military/Rural:        ${profile.military_rural ?? 'not yet collected'} (Confirmed: ${!!profile.military_rural_confirmed})`,
  `Job tenure/type:       ${profile.job_tenure_type ?? 'not yet collected'} (Confirmed: ${!!profile.job_tenure_type_confirmed})`,
  '=== END STAGE 2 ===',
].join('\n');
```

**Result:**
The LLM sees the full state of all 10 Stage 2 fields on every turn, enabling it to reference previously collected data (e.g., "Since you mentioned you're self-employed...") and to know exactly which field is next.

---

## Stage 4: Stage 2 Closing Transition and Stage 3 Product Guidance Alignment [DONE] ✅

This stage implements the critical **Stage 2 Closing Transition Prompt** (the first eligibility review offer) and aligns Stage 3's educational Q&A flow with DavidNEWDoc.md Sections 3A and 3B.

---

### 4.1. Implement the Stage 2 Closing Transition Prompt

**Problem:**
DavidNEWDoc.md (lines 429-437) specifies that after completing all Stage 2 questions, Ailana delivers a **Closing Transition Prompt** offering the initial eligibility review / soft pull. This is the **first opportunity** for the soft pull:
- Borrower says **Yes** → Trigger formal soft pull consent disclosure (separate system component).
- Borrower says **No / Not yet** → Advance to Stage 3 product education.
- Borrower asks **what it involves** → Deliver the explanatory paragraph.

The current code has NO such transition — it jumps directly from Stage 2 completion to Stage 3 with a bridge phrase (*"Let me walk you through the options..."*). There is no eligibility review offer at this point.

**Solution:**
1. Add a new intermediate state between Stage 2 completion and Stage 3. When all 10 Stage 2 fields are confirmed, instead of jumping to Stage 3 immediately, set:
```typescript
this.currentPendingField = 'stage2_closing_offer';
// Don't change activeStage yet — stay in Stage 2 for the transition
```
2. Add a new extraction handler for `stage2_closing_offer` that classifies the response:
   - **Yes/proceed/ready** → Advance to Stage 3A (soft pull consent), set `this.profile.soft_pull_consent = 'pending'`.
   - **No/not yet/continue exploring** → Advance to Stage 3 (product education), set `this.currentPendingField = 'product_fit_walkthrough'`.
   - **What does it involve?** → Keep `stage2_closing_offer` pending so the LLM delivers the explanatory response on the next turn, then re-asks.
3. Update the Stage 2 bridge instructions to deliver the v6.0 closing transition prompt verbatim (DavidNEWDoc.md line 433).

**Result:**
The borrower gets the first natural opportunity to submit for the eligibility review after Stage 2. If they decline, they proceed to Stage 3 for product education. If they accept, they go straight to the soft pull consent flow (Stage 3A). This matches the document's branching logic exactly.

---

### 4.2. Align Stage 3 with DavidNEWDoc.md Sections 3A and 3B

**Problem:**
The current Stage 3 in [stage3-guidance.ts](file:///c:/Users/Sherry/Documents/Convergent_AI/backend/src/prompts/stage3-guidance.ts) focuses on presenting 2-3 eligible products, asking "Does that make sense?", then offering the soft pull. DavidNEWDoc.md's Stage 3 is broader:
- **Section 3A** (Q45-Q61): The borrower asks Ailana extensive educational questions (FHA vs conventional, rates, PMI, escrow, closing process, etc.). Ailana provides thorough responses.
- **Section 3B** (Q62-Q64): Ailana asks the borrower three product-fit refinement questions:
  - Q62: Whether they want a program comparison walkthrough.
  - Q63: Financial priority — low monthly payment vs. faster payoff.
  - Q64: Long-term vs. short-term home.
- **Stage 3 Closing Transition**: A second eligibility review offer (if they didn't accept at Stage 2).

The current code conflates product presentation with the soft pull offer and doesn't support the educational Q&A flow or the 3B refinement questions.

**Solution:**
Restructure Stage 3:

1. **Stage 3 entry point**: When the borrower enters Stage 3 (either from Stage 2 decline or from Stage 1→2→3 progression), set `currentPendingField = 'product_fit_walkthrough'`. The LLM presents product education based on the borrower's profile.

2. **Stage 3 Section 3A handling**: The LLM naturally handles borrower questions about loan programs, rates, PMI, etc., using the educational content from the system prompt. No state machine changes needed — the LLM stays in Stage 3 and answers questions freely. The current `product_selection_feedback` field behavior (lines 120-142) handles this — the LLM waits for the borrower to indicate readiness.

3. **Stage 3 Section 3B**: After product education, advance to collecting the three refinement questions:
   - `program_comparison_interest` (Q62) — yes/no
   - `financial_priority` (Q63) — 'low_payment' | 'faster_payoff' | 'balanced'
   - `home_horizon` (Q64) — 'long_term' | 'short_term'
   
   These are informational fields that help calibrate Ailana's educational framing. They do NOT gate eligibility.

4. **Stage 3 Closing Transition**: After Section 3B questions are answered (or if the borrower indicates readiness), deliver the Stage 3 Closing Transition Prompt (DavidNEWDoc.md line 615). Same three-way branching as the Stage 2 closing:
   - **Yes** → Stage 3A (soft pull consent)
   - **No** → Offer to connect with a licensed mortgage advisor directly.
   - **What does it involve?** → Explanatory paragraph, then re-ask.

5. Update `stage3-guidance.ts` prompt instructions to reflect this flow.

**Result:**
Stage 3 becomes a rich educational exchange (matching 3A) followed by product-fit refinement (matching 3B) and a second eligibility review offer (matching the Stage 3 closing transition). The borrower gets two natural opportunities to opt into the eligibility review — one at the end of Stage 2, one at the end of Stage 3.

---

### 4.3. Update Eligibility Calculation with New Fields

**Problem:**
`calculateEligibility()` (lines 674-719) currently uses only income, debt, credit score, property value, and down payment. The new fields (military_rural, property_type) should influence product eligibility:
- `military_rural = 'military'` or `'both'` → Add VA Loan to eligible products.
- `military_rural = 'rural'` or `'both'` → Strengthen USDA eligibility flag.
- `property_type = 'condo'` → Note FHA condo project approval requirement.

**Solution:**
Enhance the eligibility rules engine in `calculateEligibility()`:
```typescript
// VA Loan: Military service indicated
if (
  (this.profile.military_rural === 'military' || this.profile.military_rural === 'both') &&
  dti <= 50
) {
  products.push('VA Loan (Zero down payment, no PMI — for eligible service members)');
}

// USDA: Rural + credit + DTI
if (
  (this.profile.military_rural === 'rural' || this.profile.military_rural === 'both') &&
  creditScore >= 640 && dti <= 41
) {
  products.push('USDA Rural Home Loan (Zero down payment for qualifying properties)');
}
```
Also update the income reference from `gross_monthly_income` to `gross_annual_income / 12`.

**Result:**
Product eligibility recommendations are more accurate because they account for VA/USDA eligibility signals collected in Stage 2. This improves the quality of Stage 3 product guidance.

---

## Stage 5: Stage 3A/3B Alignment and Bridge Phrase Updates [DONE] ✅

This stage fine-tunes the post-eligibility-review flow (Stage 3A) and the application completion flow (Stage 3B) to use institution-neutral language and align with v6.0 compliance.

---

### 5.1. Neutralize Stage 3A Consent Disclosure Language

**Problem:**
The current verbatim consent disclosure in [stage3-guidance.ts](file:///c:/Users/Sherry/Documents/Convergent_AI/backend/src/prompts/stage3-guidance.ts) (lines 34-35) and the consent block in [layer3-context.ts](file:///c:/Users/Sherry/Documents/Convergent_AI/backend/src/prompts/layer3-context.ts) (line 240) use the phrase *"not us pulling it on our behalf"*. DavidNEWDoc.md's compliance notes (line 635) state: *"Ailana invites; the disclosure system obtains consent."* The consent disclosure itself is described as a "separate formal disclosure component" — not spoken by Ailana, but triggered by the transition prompts.

**Solution:**
The consent disclosure remains as a verbatim script spoken by Ailana (this is the current system design since there is no separate disclosure UI component yet), but update the language to be institution-neutral and aligned with v6.0:
```
"Before we proceed, I want to be clear about what this involves. This is a soft credit inquiry —
it will not affect your credit score in any way. You are the one authorizing it, and your data
is used only to process your initial eligibility review and pre-fill your mortgage application.
Do you authorize the soft credit inquiry on that basis?"
```

**Result:**
Consent language is institution-neutral, clearly borrower-authorized, and consistent with v6.0's soft pull framing.

---

### 5.2. Update Bridge Phrases

**Problem:**
The bridge phrases in `buildLayer3TurnContext()` (lines 231-235) use casual language:
- Stage 1→2: *"That gives me a solid picture. I'd like to ask a few questions about your financial situation..."*
- Stage 2→3: *"Let me walk you through the options that look like the strongest fit."*

DavidNEWDoc.md provides much more detailed transition language (lines 431-437 for Stage 2→3, lines 611-619 for Stage 3 closing).

**Solution:**
Replace bridge phrases:
- **Stage 1→2**: *"That gives me a great starting point. Now I would like to spend a few minutes exploring your financial picture — income, current debts, credit profile, and a few other details — so I can map out the loan programs that may be most relevant to your situation."*
- **Stage 2→3 (when borrower declined eligibility review)**: *"Based on what you have shared, I can walk you through the loan programs that may be most relevant to your situation and answer any questions you have about the process."*

**Result:**
Bridge phrases are educational in tone and consistent with v6.0's conversational style.

---

### 5.3. Remove `co_borrower` from Stage 3B

**Problem:**
Since `co_borrower` is now collected in Stage 1 (per 2.2 above), the Stage 3B extraction logic for `co_borrower` (lines 244-254 in `session-context-manager.ts`) and the `advanceWorkflow()` check in Stage 3B (line 793-794) are redundant.

**Solution:**
- Remove the `co_borrower` extraction case from `runStage3BExtraction()`.
- Remove the `co_borrower_confirmed` check from the Stage 3B section of `advanceWorkflow()`.
- The Stage 3B prompt in `stage3b-completion.ts` should not ask for co-borrower status since it was already collected.

**Result:**
No duplicate data collection. Stage 3B skips straight to marital status → dependents → SSN → employment → etc.

---

## Stage 6: Verification & End-to-End Testing [DONE] ✅

---

### 6.1. Build Verification

**Problem:**
All the changes above span 8+ files across the backend and frontend. TypeScript compilation must succeed.

**Solution:**
Run `npm run build` from the project root. Fix any type errors, missing imports, or interface mismatches.

**Result:**
Clean build with zero TypeScript errors.

---

### 6.2. Conversational Flow Verification

**Problem:**
The state machine now has more fields and branching paths. We need to verify that:
- Stage 1 collects all 6 fields in order and transitions to Stage 2.
- Stage 2 collects all 10 fields, then offers the Stage 2 Closing Transition.
- The closing transition branches correctly (Yes → 3A, No → 3, What? → explain + re-ask).
- Stage 3 handles educational Q&A and delivers the Stage 3 Closing Transition.
- The greeting is correct in voice, text chat, and the frontend.

**Solution:**
- Start a local session and run through the full Stage 1 → 2 → 3 flow.
- Verify the greeting renders correctly in all modes.
- Test the Stage 2 closing transition with "yes", "no", and "what does that involve?" responses.
- Verify bridge phrases appear at stage transitions.
- Confirm the LLM delivers educational responses of appropriate length.

**Result:**
Full end-to-end validation that the conversational flow matches DavidNEWDoc.md v6.0 specification.

---

## Summary of Files Modified

| File | Changes |
|---|---|
| `backend/src/config/ailana-config.ts` | Reasoning effort → `'low'` |
| `backend/src/prompts/ailana-system.ts` | Branding neutral, greeting, response length, SAFE Act rules |
| `backend/src/prompts/stage1-greeting.ts` | 6-field sequence, v6.0 greeting |
| `backend/src/prompts/stage2-prequalification.ts` | 10-field sequence, annual income |
| `backend/src/prompts/stage3-guidance.ts` | Section 3A/3B flow, closing transition, consent language |
| `backend/src/prompts/layer3-context.ts` | BorrowerProfile interface, display blocks, field labels |
| `backend/src/context/session-context-manager.ts` | Extraction logic, advanceWorkflow, eligibility engine |
| `backend/src/agent.ts` | Greeting text constant |
| `src/components/live-chat-panel.tsx` | Frontend greeting text |
| `backend/src/prompts/stage3b-completion.ts` | Remove co_borrower (moved to Stage 1) |

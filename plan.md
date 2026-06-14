
# Ailana — Implementation Plan
**Last updated:** June 14, 2026
**Status:** In Progress



#### One follow-up recommendation (not urgent)

`buildBaseInstructions()` in `ailana-system.ts` injects the summary as `"CONVERSATION SO FAR:\n{content}"` without tags. The CRITICAL RULE won't look there, but it's harmless. In a future cleanup, this untagged injection can also use `<chat_history_summary>` tags for consistency, but it is **not required now**.

---

---

## Part 1 — Stage-Based Prompting System (PLAN — NOT YET IMPLEMENTED)

### Background

`ailana-prompt.md` (v3.0) defines an 8-stage conversation architecture. The current codebase has no stage awareness — Ailana runs as a single flat conversation with a single static prompt. This plan covers a complete stage-aware implementation.

### Overview of What Gets Built

```
┌─────────────────────────────────────────────────────────┐
│  StageStateMachine  (new)                               │
│  ├── current stage (1 → 2 → 3 → 3A → 3B → 4A → 4 → 5) │
│  ├── transition triggers (deterministic + LLM fallback) │
│  └── emits stage-change events to frontend via DataAPI  │
├─────────────────────────────────────────────────────────┤
│  BorrowerContextBroker  (new)                           │
│  ├── typed borrower profile (name, income, credit, etc) │
│  ├── soft pull status, application data, AUS result     │
│  └── serializes into <borrower_context> block per turn  │
├─────────────────────────────────────────────────────────┤
│  StagePromptBuilder  (new)                              │
│  ├── per-stage system prompt blocks                     │
│  ├── Block 0 awareness prompt injection (Blocks A–G)    │
│  └── replaces static buildVoiceInstructions()           │
├─────────────────────────────────────────────────────────┤
│  SafeActClassifier  (new)                               │
│  └── detects Stage 5 escalation triggers                │
├─────────────────────────────────────────────────────────┤
│  Frontend integration  (updated)                        │
│  ├── receives stage-change events                       │
│  ├── renders consent modal, application form, AUS card  │
│  └── sends stage-completion and data events back        │
└─────────────────────────────────────────────────────────┘
```

---

### Stage Map (from ailana-prompt.md v3.0)

| Stage | Name | Session Segment |
|-------|------|----------------|
| 1 | Greeting & Intent Discovery | Segment 1 |
| 2 | Pre-Qualification Discovery | Segment 1 |
| 3 | Product Guidance & Eligibility Education | Segment 2 |
| 3A | Applicant-Initiated Soft Pull & Pre-Population | Segment 2 |
| 3B | Mortgage Application Completion (1003) | Segment 2 |
| 4A | MISMO Submission & AUS Processing | Segment 3 |
| 4 | Application Guidance & Next Steps | Segment 3 |
| 5 | SAFE Act Escalation — Immediate MLO Handoff | Any segment |

---

### Component 1 — Types & Stage Definitions

**[NEW]** `backend/src/stages/stage-types.ts`

Defines all shared TypeScript types used across the stage system.

```typescript
export type StageId = '1' | '2' | '3' | '3A' | '3B' | '4A' | '4' | '5';

export interface BorrowerProfile {
  name?: string;
  goal?: 'purchase' | 'refi' | 'heloc' | 'general';
  timeline?: string;
  propertyState?: string;
}

export interface BorrowerFinancials {
  grossMonthlyIncome?: number | 'declined';
  monthlyDebtObligations?: number | 'declined';
  creditRange?: 'excellent' | 'good' | 'fair' | 'below_fair' | 'declined';
  downPaymentOrEquity?: number | 'declined';
  purchasePriceOrValue?: number | 'declined';
}

export interface SoftPullData {
  status: 'not_offered' | 'declined' | 'authorized' | 'completed' | 'failed';
  authorizedAt?: string;
  prepopulatedFields?: string[];
  creditRangeBucket?: 'excellent' | 'good' | 'fair' | 'below_fair';
}

export interface ApplicationData {
  completionPercent: number;
  missingFields: string[];
  mismoFileId?: string;
  submittedAt?: string;
  losReference?: string;
  ausSystem?: 'DU' | 'LPA';
  ausOutcome?: 'APPROVE_ELIGIBLE' | 'REFER' | 'REFER_WITH_CAUTION' | 'INELIGIBLE' | 'TIMEOUT';
  ausConditions?: string[];
  ausResultDisplayedAt?: string;
}

export interface SessionMeta {
  productsDiscussed: string[];
  preferredProduct?: string;
  openQuestions: string[];
  safeActTriggers: Array<{ utterance: string; timestamp: string; stage: StageId }>;
  mloNotifiedAt?: string;
  currentStage: StageId;
}

/** Full context broker object — all confirmed borrower facts */
export interface ContextBroker {
  borrower: BorrowerProfile;
  financial: BorrowerFinancials;
  softPull: SoftPullData;
  application: ApplicationData;
  session: SessionMeta;
}

/** Events emitted to frontend via LiveKit Data API */
export type AgentDataEvent =
  | { type: 'STAGE_CHANGED'; stage: StageId }
  | { type: 'SOFT_PULL_CONSENT_REQUIRED' }
  | { type: 'PREPOPULATION_COMPLETE'; fields: string[] }
  | { type: 'SECTION_ACTIVE'; section: string }
  | { type: 'AUS_RESULT'; outcome: ApplicationData['ausOutcome']; conditions: string[] }
  | { type: 'MLO_NOTIFIED' }
  | { type: 'SAFE_ACT_ESCALATION'; utterance: string };
```

---

### Component 2 — Context Broker

**[NEW]** `backend/src/stages/context-broker.ts`

Maintains the typed borrower profile. The key purpose: facts written here **survive compaction** because they are injected separately from the rolling chat history.

**Serialized block format injected before every turn:**
```xml
<borrower_context>
  name: John Smith
  goal: purchase
  gross_monthly_income: $4200
  credit_range: good (680–739)
  down_payment: $30000
  monthly_debt: $850
  soft_pull_status: not_offered
  current_stage: 2
  products_discussed: FHA, Conventional
</borrower_context>
```

This is injected as a `system` message BEFORE the `<chat_history_summary>` block on every turn. The LLM sees structured facts completely separately from conversational memory.

> **Why this permanently fixes redundancy:** Once a field is written to the ContextBroker, it is always visible to the LLM regardless of how many compactions have occurred. The summary can be wiped and rebuilt — the broker persists independently.

**[MODIFY]** `backend/src/context/session-context-manager.ts`

Update `buildTextMessages()` to accept and inject the broker block first:

```typescript
buildTextMessages(systemPrompt: string, contextBrokerBlock?: string) {
  const messages = [{ role: 'system', content: systemPrompt }];
  
  // 1. Structured confirmed facts (survives compaction)
  if (contextBrokerBlock) {
    messages.push({ role: 'system', content: contextBrokerBlock });
  }
  
  // 2. Summarized history (XML-tagged — already fixed in Part 0)
  if (this.conversationSummary) {
    messages.push({
      role: 'system',
      content: `<chat_history_summary>\n${this.conversationSummary}\n</chat_history_summary>`
    });
  }
  
  // 3. Recent turns (unchanged)
  ...
}
```

---

### Component 3 — Stage State Machine

**[NEW]** `backend/src/stages/stage-state-machine.ts`

Central authority on the current stage and all transitions.

**Stage transition map:**

```
1 → 2   : Borrower confirms their goal (purchase/refi/heloc)
2 → 3   : All financial snapshot fields collected (income + credit + down payment)
3 → 3A  : Borrower agrees to soft pull offer
3 → 3B  : Borrower declines soft pull (manual path)
3A → 3B : Pre-populated fields confirmed by borrower
3B → 4A : All 1003 fields confirmed + borrower authorizes submission
4A → 4  : AUS result delivered
any → 5 : SAFE Act trigger detected (highest priority, overrides all)
```

**Transition trigger mechanisms — two modes:**

1. **Deterministic (fast, no LLM call):**
   - Checks `ContextBroker` fields directly (e.g. Stage 2→3: income + credit + goal all present)
   - SAFE Act pattern match from classifier
   - Frontend event received (`SYSTEM_SOFT_PULL_AUTHORIZED`)

2. **LLM classification (async, ambiguous cases only):**
   - Lightweight `gpt-4o-mini` binary classifier prompt
   - Used only for ambiguous turn completions
   - Result cached and logged

**API:**
```typescript
getCurrentStage(): StageId
requestTransition(to: StageId, reason: string): boolean
forceTransition(to: StageId)  // SAFE Act — always succeeds
canTransition(to: StageId): boolean
onTransition(cb: (from: StageId, to: StageId) => void): void
```

---

### Component 4 — Stage Prompt Builder

**[NEW]** `backend/src/stages/stage-prompt-builder.ts`

Builds the dynamic voice instruction block for the current stage. Replaces static `buildVoiceInstructions()` for stage-aware sessions.

```typescript
export function buildStageVoiceInstructions(
  stage: StageId,
  broker: ContextBrokerClass,
  firedBlock0s: Set<string>
): string
```

Each stage prompt contains:
1. Static core identity/compliance rules (always present, from `core-instructions.ts`)
2. `CURRENT_STAGE` block — stage-specific behavioral rules
3. `BORROWER_CONTEXT` block (from ContextBroker, what is already known)
4. `COMPLETED_TOPICS` block — explicit list of what has been gathered

**Per-stage key instructions:**

| Stage | Key injected rules |
|-------|--------------------|
| 1 | Greeting flow, intent discovery, v2.0 closing bridge (soft pull teaser) |
| 2 | Financial snapshot: income → debt → credit → down payment. Deliver Block A or C if not yet sent |
| 3 | Product comparison + eligibility education. Deliver Block E combined pitch at close |
| 3A | **Verbatim** consent disclosure, response handling (yes/no/question), post-pull field review |
| 3B | 1003 field collection order, section-by-section, progress tracking, sensitive field redirect |
| 4A | Submission wait bridge, AUS result delivery (Approve/Refer/Timeout outcomes) |
| 4 | Context-aware opening (Approve vs Refer path), next steps |
| 5 | Warm MLO handoff, SAFE Act escalation explanation |

> **Stage 3A verbatim consent:** The prompt for Stage 3A includes `SPEAK VERBATIM — DO NOT PARAPHRASE:` guards around the required consent disclosure. This language must receive legal review before production deployment per state law.

---

**[NEW]** `backend/src/stages/block0-manager.ts`

Manages the injection of Block 0 awareness prompts (Blocks A–G from ailana-prompt.md Section 2).

```typescript
export class Block0Manager {
  private firedBlocks = new Set<string>();
  
  shouldFireBlock(blockId: 'A'|'B'|'C'|'D'|'E'|'F'|'G', context: Block0Context): boolean
  markFired(blockId: string): void
  getBlockText(blockId: string): string
  getNextPendingBlock(context: Block0Context): string | null
}
```

**Injection rules (exact match to spec):**

| Block | Theme | When |
|-------|-------|------|
| A | Faster application experience | Stage 2 close OR borrower asks about timeline |
| B | Simplified data entry | Stage 3 complete OR borrower mentions paperwork anxiety |
| C | Smart profile insights | After credit range collected in Stage 2 |
| D | No credit score impact | Any time borrower mentions credit concern |
| E | Combined benefit summary (primary) | Stage 3 completion — if A–D not all used |
| F | Returning borrower re-engagement | Return session open with prior incomplete session |
| G | Document discussion reframe | Always AFTER document checklist — never before |

Critical rule: Block 0 prompts are injected as one-shot `userInput` via `session.generateReply()`. They are NEVER stacked with stage transition prompts in the same turn.

**[NEW]** `backend/src/prompts/stage-prompts/stage-1.ts` through `stage-5.ts`

One file per stage, each exports:
```typescript
export function getStagePROMPT(broker: ContextBrokerClass): string
```

---

### Component 5 — SAFE Act Classifier

**[NEW]** `backend/src/stages/safe-act-classifier.ts`

Runs on every user utterance. Detects Stage 5 escalation triggers in real time (no LLM call — pure pattern matching for speed).

**Trigger patterns (v3.0 additions included):**
```typescript
const SAFE_ACT_TRIGGERS = [
  // Rate commitment
  /what.*rate.*lock/i, /lock.*my.*rate/i,
  // Approval commitment
  /so.*i.*m.*approved/i, /does this mean.*got.*loan/i, /am i (officially )?approved/i,
  // Pre-approval letter
  /send.*approval.?letter/i, /pre.?approval letter/i, /can you send.*letter/i,
  // Post-refer guidance (v2.0 addition)
  /what.*do.*i.*need.*to.*get approved/i, /how.*can i qualify/i,
  // AUS interpretation
  /loan.*is.*approved/i, /officially.*approved/i,
];
```

When triggered:
1. Logs utterance to `contextBroker.session.safeActTriggers[]`
2. Emits `SAFE_ACT_ESCALATION` DataAPI event to frontend
3. Calls `stageStateMachine.forceTransition('5')`

---

### Component 6 — Agent Integration

**[MODIFY]** `backend/src/agent.ts`

**Changes required:**

1. **Instantiate new components at session start:**
```typescript
const contextBroker = new ContextBroker();
const stageStateMachine = new StageStateMachine(contextBroker);
const block0Manager = new Block0Manager();
const safeActClassifier = new SafeActClassifier();
```

2. **Dynamic `createVadAgent()` using stage-aware instructions:**
```typescript
const createVadAgent = () => new voice.Agent({
  instructions: buildStageVoiceInstructions(
    stageStateMachine.getCurrentStage(),
    contextBroker,
    block0Manager.firedBlocks
  ),
  vad: sessionVad,
  llm: model,
  turnHandling,
});
```
> Realtime instructions are fixed at agent creation. Stage transitions swap in the new agent via the existing `session.updateAgent()` mechanism (same as `rotate()` already does).

3. **Run SAFE Act classifier on every user turn:**
```typescript
session.on(UserInputTranscribed, async (ev) => {
  const result = safeActClassifier.check(ev.transcript);
  if (result.triggered) {
    await handleSafeActEscalation(result.matchedPattern, ev.transcript);
  }
  contextManager.onUserTurn(ev.transcript);
});
```

4. **Stage transition hook — swap agent + emit to frontend:**
```typescript
stageStateMachine.onTransition(async (from, to) => {
  await emitDataEvent(ctx.room, { type: 'STAGE_CHANGED', stage: to });
  vadAgent = createVadAgent();
  await session.updateAgent(vadAgent);
});
```

5. **New `SYSTEM_` message types from frontend:**

| Frontend sends | Agent action |
|---------------|-------------|
| `SYSTEM_SOFT_PULL_AUTHORIZED` | `broker.softPull.status = 'authorized'` → transition to 3A |
| `SYSTEM_SOFT_PULL_DECLINED` | `broker.softPull.status = 'declined'` → transition to 3B |
| `SYSTEM_SOFT_PULL_RESULT:{json}` | Populate prepopulated fields → emit `PREPOPULATION_COMPLETE` |
| `SYSTEM_APP_SECTION_DONE:{section}` | Update `application.completionPercent` → emit `SECTION_ACTIVE` |
| `SYSTEM_APP_SUBMITTED` | Trigger Stage 4A |
| `SYSTEM_AUS_RESULT:{json}` | Populate AUS result → trigger AUS delivery prompt |

6. **Passive fact extraction from conversation:**
Hook into `ConversationItemAdded`. Run lightweight regex on each assistant turn to detect when Ailana has collected a fact and write it to the ContextBroker.

```
Patterns:
- Income:  "your monthly income is $X" / "you mentioned $X/month" / "earning $X"
- Credit:  "good range (680–739)" / "fair credit" / "excellent credit"
- Goal:    "you're looking to purchase" / "refinancing your"
- Name:    "Nice to meet you, [Name]" / "got it, [Name]"
- Product: "FHA might be a good fit" / "conventional loan"
```

---

### Component 7 — DataAPI Event Emitter

**[NEW]** `backend/src/utils/data-event-emitter.ts`

Thin wrapper for LiveKit Data API publishing.

```typescript
export async function emitDataEvent(
  room: Room,
  event: AgentDataEvent
): Promise<void> {
  const payload = new TextEncoder().encode(JSON.stringify(event));
  await room.localParticipant?.publishData(payload, { topic: 'lk-agent-events' });
}
```

---

### Component 8 — Core Prompt Updates

**[MODIFY]** `backend/src/prompts/core-instructions.ts`

Add `<borrower_context>` reference alongside existing `<chat_history_summary>` instruction:

```diff
 CONTEXT & MEMORY:
+- You will receive confirmed borrower facts in "<borrower_context>...</borrower_context>". These are verified facts — never ask for them again.
 - You will receive a summary of the earlier part of the conversation wrapped in "<chat_history_summary>...</chat_history_summary>".
```

**[MODIFY]** `backend/src/prompts/ailana-system.ts`

`buildBaseInstructions()` (text-only path) needs to accept the context broker block:

```typescript
export function buildBaseInstructions(
  conversationSummary?: string,
  contextBrokerBlock?: string  // NEW parameter
): string
```

---

### Component 9 — Frontend Integration

**[MODIFY]** Frontend agent/channel components — subscribe to `lk-agent-events`:

| Event received | Frontend renders |
|---------------|-----------------|
| `STAGE_CHANGED: 3A` | Soft pull consent modal |
| `PREPOPULATION_COMPLETE` | Pre-populated field review UI |
| `SECTION_ACTIVE: {section}` | Highlighted 1003 section in progressive form |
| `AUS_RESULT: APPROVE_ELIGIBLE` | Conditional approval card |
| `AUS_RESULT: REFER` | Manual review card |
| `AUS_RESULT: TIMEOUT` | "Checking shortly" card |
| `MLO_NOTIFIED` | "Loan officer notified" banner |
| `SAFE_ACT_ESCALATION` | Trigger existing MLO handoff UI (SYSTEM_TRANSFER_MLO) |

---

### Open Questions (MUST be answered before implementation)

1. **Stage transitions — automatic vs manual?**
   Recommendation: Broker-driven (deterministic) for Stages 1–3. User-consent-driven for 3A/3B/4A.

2. **Soft pull — is credit bureau integration already built?**
   Stage 3A requires a real API call. Is this already implemented, or mocked?

3. **1003 application form (Stage 3B) — does it already exist?**
   The spec says it's a Next.js component rendered progressively. Does this exist in the frontend or needs to be built?

4. **Verbatim consent language (Stage 3A) — legal review per state**
   Do NOT deploy Stage 3A to production without legal review. State law variations apply.

5. **MISMO 3.4 generation (Stage 4A) — in scope?**
   MISMO XML generation requires a dedicated service layer. Is Stage 4A in scope or should it be deferred?

---

### Implementation Order (Phased)

#### Phase 1 — Foundation (no user-facing change, safe to ship)
1. `stage-types.ts` — all TypeScript types
2. `context-broker.ts` — structured fact storage
3. `safe-act-classifier.ts` — SAFE Act pattern matching
4. `data-event-emitter.ts` — DataAPI helper
5. Update `core-instructions.ts` with `<borrower_context>` reference
6. Update `session-context-manager.ts` `buildTextMessages()` to accept broker block

#### Phase 2 — Stage Prompts (testable in isolation, no agent wiring)
7. `stage-prompts/stage-1.ts` through `stage-5.ts`
8. `stage-prompt-builder.ts`
9. `block0-manager.ts`

#### Phase 3 — State Machine (logic only, no frontend yet)
10. `stage-state-machine.ts` with full transition map
11. Wire into `agent.ts` — `createVadAgent()` uses dynamic instructions
12. Wire SAFE Act classifier into `UserInputTranscribed` handler
13. Wire passive fact extractor into `ConversationItemAdded`

#### Phase 4 — Agent ↔ Frontend Integration
14. Stage transition → `updateAgent()` + DataAPI emit
15. `SYSTEM_SOFT_PULL_*` message handlers
16. `SYSTEM_AUS_RESULT` handler
17. Frontend: subscribe to `lk-agent-events`
18. Frontend: consent modal, AUS result card components

#### Phase 5 — Application Flow (Stage 3B)
19. Progressive 1003 form frontend component
20. `SYSTEM_APP_SECTION_DONE` / `SYSTEM_APP_SUBMITTED` handlers

#### Phase 6 — MISMO + AUS (Stage 4A — pending answer to Open Question 5)
21. MISMO 3.4 XML service layer
22. LOS submission connector
23. AUS webhook receiver

---

### Verification Plan

| Phase | How to verify |
|-------|--------------|
| Phase 1 | Unit tests for ContextBroker getters/setters. Confirm `<borrower_context>` appears in agent logs |
| Phase 2 | Snapshot tests for each stage prompt — check required keywords and compliance guards |
| Phase 3 | State machine transition tests. Income not re-asked after ContextBroker has it |
| Phase 4 | DataAPI events appear in browser devtools. Consent modal renders on Stage 3A |
| Phase 5 | 1003 form highlights correct section when agent asks about it |
| Phase 6 | MISMO file passes schema validation. AUS webhook received and displayed |

---

> !!!! DO NOT IMPLEMENT OR TOUCH ANYTHING ABOVE UNLESS EXPLICITLY APPROVED !!!!

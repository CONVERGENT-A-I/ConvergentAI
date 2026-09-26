# Solution to Resolve Stage 5 Latency Spikes

> **Status:** Planning  
> **Severity:** High — directly impacts user experience at the most critical handoff point  
> **Affected Area:** `backend/src/agent.ts`, `backend/src/context/session-context-manager.ts`, `backend/src/context/llm-extractor.ts`

---

## 1. Executive Summary

Stage 5 (Loan Officer Escalation) consistently shows a **4–6 second latency spike** between the user's first utterance and Ailana's first spoken word. This is not a network issue — it is architectural. Six compounding bottlenecks stack together at this exact stage boundary, creating a wall of blocking work before any speech is generated.

---

## 2. Root Cause Analysis

### 2.1 Hard-Coded 4,000ms Stage Boundary Wait

**File:** `backend/src/agent.ts`  
**Location:** `onUserTurnCompleted` handler

When the agent enters Stage 5, the `isStageBoundaryField` check returns `true` for `escalation_preference`. This causes the pipeline to **wait up to 4,000ms** for the LLM extractor to finish before allowing Ailana to begin generating speech.

```
User speaks → VAD triggers → extraction starts → 4,000ms wait → speech generation begins
```

**Impact:** ~4 seconds of silence on every Stage 5 entry turn. This is the single largest contributor.

---

### 2.2 Synchronous LLM Classifier Blocking the Pipeline

**File:** `backend/src/context/llm-extractor.ts`  
**Function:** `classifyLoanOfficerTransferIntent`

The intent classifier runs **synchronously in the critical path**. It makes a full LLM inference call (Gemma 31B) to determine if the user wants to transfer, before the agent can respond at all.

For a "Yes, connect me" utterance, this classification is deterministic and could be handled with a fast regex/keyword match instead of a full LLM roundtrip.

**Impact:** Adds 800ms–1,500ms on top of the 4s wait.

---

### 2.3 Redundant Competing LLM Calls

At Stage 5, the following LLM calls fire in close succession or in parallel:
1. `classifyLoanOfficerTransferIntent` — intent classifier
2. `runStage5Extraction` — field extractor for `escalation_preference`
3. Main `llmNode` — the primary conversational response

All three call the same underlying model (Gemma 31B). This creates **GPU/inference resource contention**, causing each call to queue behind the others.

**Impact:** Each call that would normally take 400ms now takes 800ms–1,200ms due to contention.

---

### 2.4 No Fast-Path for Deterministic Stage 5 Responses

**File:** `backend/src/agent.ts`

Other stages use `createVerbatimStream` to immediately stream a known response (0ms LLM latency) for high-confidence utterances. Stage 5 has **no such fast-path**.

For common patterns like:
- `"yes"`, `"sure"`, `"connect me"` → immediate transfer confirmation
- `"no"`, `"schedule later"`, `"not now"` → immediate scheduling response

These could be handled without any LLM call.

**Impact:** Every Stage 5 turn goes through full LLM inference even when the answer is obvious.

---

### 2.5 Context Window Bloat at Stage 5

**File:** `backend/src/context/session-context-manager.ts`

By Stage 5, the conversation history is long. The entire session context (all prior stages, all extracted fields, full conversation transcript) is passed to the LLM on every turn. This inflates the token count significantly, increasing:
- Time-to-first-token (TTFT)
- Inference cost per call

**Impact:** ~200–400ms additional latency per LLM call at Stage 5 vs Stage 1.

---

### 2.6 Database Write Contention on Stage Boundary

**File:** `backend/src/context/session-context-manager.ts`  
**Function:** `syncToDatabase`

On Stage 5 entry, the system writes to **5 database tables** simultaneously (session, fields, stages, audit, escalation). These writes are triggered before or during speech generation, competing for I/O resources.

**Impact:** 100–300ms write latency compounding on an already-saturated pipeline.

---

## 3. Latency Budget Breakdown (Current State)

| Bottleneck | Estimated Delay |
|---|---|
| Hard 4,000ms stage boundary wait | ~4,000ms |
| Synchronous classifier (`classifyLoanOfficerTransferIntent`) | ~800–1,200ms |
| LLM contention (3 concurrent calls) | ~400–800ms |
| Context window bloat | ~200–400ms |
| DB write contention | ~100–300ms |
| **Total Worst Case** | **~5,500–6,700ms** |
| **Total Best Case** | **~4,000ms** (floor set by the hard wait) |

---

## 4. Solution Plan

### Phase 1 — Quick Wins (Est. 1–2 days, ~4,000ms reduction)

#### Fix 1.1: Remove / Reduce the Hard Stage Boundary Wait

**File:** `backend/src/agent.ts`

Remove `escalation_preference` from the `isStageBoundaryField` list, OR reduce the wait from 4,000ms to 0ms for Stage 5 and let extraction happen asynchronously.

**Strategy:** Stage 5 does not require extraction to complete before speaking. The agent's response at Stage 5 entry is always the same: offer the user a choice between live transfer or scheduled callback. This is independent of extraction results.

```typescript
// BEFORE
if (isStageBoundaryField(fieldName)) {
  await waitForExtraction(4000); // blocking
}

// AFTER
// Fire extraction in background, do not await for Stage 5 entry
if (currentStage !== 5 && isStageBoundaryField(fieldName)) {
  await waitForExtraction(4000);
}
// Stage 5: extraction fires async, speech starts immediately
```

**Expected Gain:** ~4,000ms

---

#### Fix 1.2: Add a Verbatim Fast-Path for Stage 5 Simple Utterances

**File:** `backend/src/agent.ts`

Before invoking the full `llmNode`, check for high-confidence Stage 5 patterns and stream a verbatim response immediately.

```typescript
const STAGE5_FAST_PATHS = [
  { patterns: ['yes', 'sure', 'connect', 'transfer', 'talk to'], response: TRANSFER_CONFIRMATION_TEXT },
  { patterns: ['no', 'later', 'schedule', 'callback', 'not now'], response: SCHEDULE_CALLBACK_TEXT },
];

// In onUserTurnCompleted, before llmNode:
if (currentStage === 5) {
  const fastPath = matchFastPath(userTranscript, STAGE5_FAST_PATHS);
  if (fastPath) {
    return createVerbatimStream(fastPath.response); // 0ms LLM latency
  }
}
```

**Expected Gain:** ~800–1,500ms on matched utterances (majority of Stage 5 turns)

---

### Phase 2 — Structural Fixes (Est. 2–4 days, ~800–1,200ms additional reduction)

#### Fix 2.1: Make the Classifier Async and Non-Blocking

**File:** `backend/src/context/llm-extractor.ts`

Move `classifyLoanOfficerTransferIntent` to fire in the background. The result should be used to trigger the actual transfer action (email, MLO notification), not to gate speech generation.

```typescript
// BEFORE: blocking in critical path
const intent = await classifyLoanOfficerTransferIntent(transcript);
if (intent === 'transfer') { ... }

// AFTER: fire-and-forget, result handled via callback
classifyLoanOfficerTransferIntentAsync(transcript).then(intent => {
  if (intent === 'transfer') handleTransfer();
});
// Speech generation continues immediately
```

**Expected Gain:** ~800–1,200ms

---

#### Fix 2.2: Replace Classifier with Keyword Pre-filter

**File:** `backend/src/context/llm-extractor.ts`

For the most common transfer intents, a lightweight regex/keyword matcher can replace the full LLM call entirely. Reserve the LLM classifier only for ambiguous utterances.

```typescript
const TRANSFER_KEYWORDS = /\b(yes|sure|connect|transfer|talk to someone|speak to)\b/i;
const DECLINE_KEYWORDS = /\b(no|later|schedule|callback|not now|not today)\b/i;

function quickClassify(transcript: string): 'transfer' | 'decline' | 'ambiguous' {
  if (TRANSFER_KEYWORDS.test(transcript)) return 'transfer';
  if (DECLINE_KEYWORDS.test(transcript)) return 'decline';
  return 'ambiguous'; // only 'ambiguous' goes to LLM classifier
}
```

**Expected Gain:** Eliminates classifier LLM call for ~85% of Stage 5 utterances

---

### Phase 3 — Optimization (Est. 3–5 days, ~400–800ms additional reduction)

#### Fix 3.1: Trim Stage 5 Context Window

**File:** `backend/src/context/session-context-manager.ts`

At Stage 5, the LLM only needs:
- Current user utterance
- Stage 5 system prompt
- The immediate prior 2–3 turns

Strip all earlier stage data, field extraction history, and long conversation transcripts from the Stage 5 context payload.

```typescript
function buildStage5Context(session: Session): LLMContext {
  return {
    systemPrompt: STAGE5_SYSTEM_PROMPT,
    history: session.conversationHistory.slice(-3), // last 3 turns only
    // No prior stage data needed
  };
}
```

**Expected Gain:** ~200–400ms per Stage 5 LLM call

---

#### Fix 3.2: Defer Non-Critical Database Writes

**File:** `backend/src/context/session-context-manager.ts`

Move non-critical table writes (audit log, analytics) to a deferred queue. Only write the critical session state synchronously.

```typescript
// BEFORE: 5 synchronous writes
await Promise.all([writeSession(), writeFields(), writeStages(), writeAudit(), writeEscalation()]);

// AFTER: 2 critical writes sync, 3 deferred
await Promise.all([writeSession(), writeEscalation()]); // critical only
defer(() => Promise.all([writeFields(), writeStages(), writeAudit()])); // non-critical
```

**Expected Gain:** ~100–300ms

---

## 5. Expected Latency After Fixes

| Phase | Fixes Applied | Expected Stage 5 Latency |
|---|---|---|
| Current (baseline) | None | 4,000–6,700ms |
| After Phase 1 | Hard wait removed + fast-path | 200–800ms |
| After Phase 2 | + Async classifier + keyword filter | 100–400ms |
| After Phase 3 | + Context trim + DB defer | 80–250ms |

**Target: Sub-300ms Stage 5 response latency (matching Stage 1–4 performance)**

---

## 6. Implementation Priority

| Priority | Fix | Effort | Impact |
|---|---|---|---|
| P0 | Remove/reduce 4,000ms hard wait | Low | ~4,000ms saved |
| P0 | Verbatim fast-path for Stage 5 | Low | ~1,200ms saved |
| P1 | Make classifier async | Medium | ~1,000ms saved |
| P1 | Keyword pre-filter for classifier | Low | Eliminates 85% of LLM calls |
| P2 | Trim Stage 5 context window | Medium | ~300ms saved |
| P2 | Defer non-critical DB writes | Medium | ~200ms saved |

---

## 7. Testing Plan

After each phase, verify with the following tests:

1. **Stage 5 Entry Latency Test** — Measure TTFS (time-to-first-speech) from user utterance end to Ailana first audio byte at Stage 5 entry.
2. **Transfer Intent Accuracy Test** — Confirm fast-path and keyword filter correctly classify "yes/no" utterances with 0 false positives.
3. **Async Classifier Safety Test** — Confirm background classifier still correctly triggers MLO email/notification with no race conditions.
4. **Session Integrity Test** — Confirm deferred DB writes do not cause session data loss on abrupt disconnects.
5. **Full Flow Regression Test** — Run the full PUR, REF, and HELOC flows end-to-end to confirm no regressions in Stages 1–4.

---

## 8. Files to Modify

| File | Changes |
|---|---|
| `backend/src/agent.ts` | Remove/bypass Stage 5 boundary wait; add verbatim fast-path |
| `backend/src/context/session-context-manager.ts` | Trim context builder; defer non-critical writes |
| `backend/src/context/llm-extractor.ts` | Make classifier async; add keyword pre-filter |

---

*Document created: 2026-09-26 | Owner: Backend Team*

# Add Name Collection to OTP Authentication Gate

## Background

The borrower's name was removed from the Stage 1 greeting flow to reduce latency and improve UX. However, the client still needs the borrower's preferred name — just collected at the right moment. The natural place is the **Stage 3A OTP/Authentication gate**, right before email and phone, so it feels like a natural "account setup" step.

**New Stage 3A field order:**
```
contact_name → contact_email (+mobile) → otp_verification → soft_pull_authorization → prefill walkthrough
```

---

## Slider Revert (Already Done ✅)

The Down Payment slider `max` has been reverted back to `max={purchasePrice}` so moving the purchase price slider dynamically adjusts the down payment range again.

---

## Proposed Changes — Name in Auth Gate

### Core Architecture

- A new profile field `contact_name` (and `contact_name_confirmed`) is added to `BorrowerProfile`.
- Every place in `session-context-manager.ts` that currently transitions to Stage 3A by setting `currentPendingField = 'contact_email'` will instead set it to `'contact_name'`.
- `runStage3AExtraction()` handles the new first step: extract the name from the user's response.
- `advanceWorkflow()` Stage 3A chain gains `contact_name` as the first step.
- The stage3-guidance.ts prompt gets a new CURRENT TASK rule for `contact_name`.
- `agent.ts` deterministic hook (which fires on `contact_email`) is updated to fire on `contact_name` first.

---

## Proposed Changes — File by File

---

### `layer3-context.ts` — BorrowerProfile Type

#### [MODIFY] [`layer3-context.ts`](file:///c:/Users/SOHAIL/Downloads/ConvergentAI/backend/src/prompts/layer3-context.ts)
- Add `contact_name?: string | null` and `contact_name_confirmed?: boolean` to the `BorrowerProfile` interface (near the other `contact_*` fields around line 114).
- Add `contact_name: 'preferred name for account setup'` to the field descriptions map.
- Add `contact_name` to the context display block that shows current profile state to the LLM.

---

### `stage3-guidance.ts` — Prompt for New Field

#### [MODIFY] [`stage3-guidance.ts`](file:///c:/Users/SOHAIL/Downloads/ConvergentAI/backend/src/prompts/stage3-guidance.ts)
- Add a new CURRENT TASK rule **before** the `contact_email` rule:
  ```
  - When CURRENT TASK is 'contact_name':
    * Ask: "Perfect. Before we run your review, I'll need a few details to set up your secure login. 
      First, what's your name?"
    * Collect only the name on this turn. Do NOT ask for email or mobile yet.
  ```
- Update the existing `contact_email` rule to remove the "let's set up a quick secure login" preamble (since that was already said in the `contact_name` turn):
  ```
  - When CURRENT TASK is 'contact_email':
    * Ask: "Thank you. Now, what email and mobile number would you like to use for your account?"
    * Collect email and mobile in the same turn if the borrower provides both.
  ```

---

### `session-context-manager.ts` — State Machine & Extraction

#### [MODIFY] [`session-context-manager.ts`](file:///c:/Users/SOHAIL/Downloads/ConvergentAI/backend/src/context/session-context-manager.ts)

**Change 1 — `BOUNDARY_FIELDS` set** (line ~512):
Add `'contact_name'` to the set.

**Change 2 — `DETERMINISTIC_FIELDS` set** (line ~532):
Add `'contact_name'` to the set (so the llmNode deterministic hook can intercept it).

**Change 3 — `advanceWorkflow()` Stage 3A chain** (line ~2328):
```typescript
// BEFORE:
if (!this.profile.contact_email) {
  this.currentPendingField = 'contact_email';
}

// AFTER:
if (!this.profile.contact_name) {
  this.currentPendingField = 'contact_name';
} else if (!this.profile.contact_email) {
  this.currentPendingField = 'contact_email';
}
```

**Change 4 — All Stage 3A entry points** (~6 locations where the code sets `currentPendingField = 'contact_email'` as the first step of Stage 3A):
Each of these is changed to `'contact_name'` instead:
- `agent.ts` line ~197: `setCurrentPendingField('contact_email')` → `'contact_name'`
- `session-context-manager.ts` lines ~744, ~755, ~836, ~875, ~2033: all `'contact_email'` → `'contact_name'`

**Change 5 — `runStage3AExtraction()`** (line ~983):
Add a new `contact_name` branch as the first `if` block before the email/mobile extraction block:
```typescript
// New first block:
if (this.currentPendingField === 'contact_name') {
  const res = await extractProfileField(
    text, lastQuestion, 'contact_name',
    "the borrower's preferred first name or full name", 'string',
    'Extract the name they want to use. Return null if not found.'
  );
  if (res.value) {
    this.profile.contact_name = res.value as string;
    this.profile.contact_name_confirmed = true;
    console.log(`[context-manager]: Captured contact name: ${this.profile.contact_name}`);
    this.advanceWorkflow();
  }
  return;
}

// Existing block (unchanged):
if (this.currentPendingField === 'contact_email' || this.currentPendingField === 'contact_mobile') {
  ...
}
```

**Change 6 — `declineCurrentField()`** (line ~2865):
Add a decline handler for `contact_name` (sets a placeholder like `'Valued Member'`):
```typescript
if (field === 'contact_name') {
  this.profile.contact_name = 'Valued Member';
  this.profile.contact_name_confirmed = true;
}
```

---

### `agent.ts` — Deterministic Hook

#### [MODIFY] [`agent.ts`](file:///c:/Users/SOHAIL/Downloads/ConvergentAI/backend/src/agent.ts)

**Change 1 — Stage 3A fast-path** (line ~195–197):
When the user accepts Path A, the agent currently directly sets `contact_email`. Change to `contact_name`:
```typescript
// BEFORE:
this.contextManager.setCurrentPendingField('contact_email');
// AFTER:
this.contextManager.setCurrentPendingField('contact_name');
```

**Change 2 — Add deterministic script for `contact_name`** (around line ~215, near the `contact_email` block):
Add a new `if (pending === 'contact_name')` block that delivers the opening line verbatim via `createVerbatimStream`:
```typescript
if (pending === 'contact_name') {
  const scriptText = `Perfect. Before we run your review, I'll need a few details to set up your secure login. First, what's your name?`;
  return createVerbatimStream(scriptText) as any;
}
```

---

### `NewConversationGuide.md` — Documentation

#### [MODIFY] [`NewConversationGuide.md`](file:///c:/Users/SOHAIL/Downloads/ConvergentAI/NewConversationGuide.md)
Update the OTP auth flow steps in both Path A and Path B upgrade sections to reflect the new order:
1. Ailana asks: *"Before we run your review, I'll need a few details to set up your secure login. First, what's your name?"*
2. You: `John`
3. Ailana asks: *"Thank you. Now, what email and mobile number would you like to use for your account?"*
4. You: `My email is david@example.com and mobile is 555-0199.`
5. *(OTP, consent, prefill walkthrough continues as before...)*

---

## Verification Plan

### Automated
```
cd backend && npx tsc --noEmit
```

### Manual Test — Path A (Soft Pull from start)
1. Complete Stage 1 & 2 normally.
2. At the closing offer, say: *"Let's run the soft credit review."*
3. **Verify:** Ailana asks for your name first.
4. Say: `John`
5. **Verify:** Ailana then asks for email and mobile.
6. Continue OTP flow as usual — verify everything still works end to end.

### Manual Test — Path B → Upgrade
1. Choose Path B (stated mode).
2. Click "Upgrade to Verified Mode."
3. **Verify:** Ailana asks for name first, then email/mobile.

### Edge Cases
- User declines to give name → Ailana should move on to email/mobile with a fallback name.
- User gives name + email + mobile all in one turn → system captures name and advances, then captures email/mobile on the next step.

---

## Open Questions

> [!IMPORTANT]
> **Should the name collected here (`contact_name`) be used anywhere later in the conversation?**
> For example, when Ailana says *"Thank you for your patience — your review is back..."* — should it now say *"Thank you for your patience, John — ..."*?
> Currently the plan is **no** — name is not used conversationally per the client instruction to improve speed. Please confirm before execution.

> [!NOTE]
> The `contact_name` collected here is separate from `legal_name` retrieved from the credit bureau during the prefill walkthrough. `contact_name` is the borrower's preferred login name; `legal_name` is their verified legal identity.

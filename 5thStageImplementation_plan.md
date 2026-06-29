# Implementation Plan: Stage 5 SAFE Act Escalation & MLO Transfer

This plan details the technical implementation steps for the final milestone: **Stage 5 (SAFE Act Escalation & Licensed MLO Handoff)**. It integrates automated completion handoffs from Stage 4, proactive SAFE Act restriction escalations, and the three compliant transfer options (Live Transfer, Scheduled Call, and Callback).

---

## 🛠️ Stage 5 Proposed Changes

### 1. Data Schema Expansion
Add MLO handoff variables to `BorrowerProfile` in the backend prompt definitions.

#### [MODIFY] [layer3-context.ts](file:///c:/Users/SOHAIL/Downloads/ConvergentAI/backend/src/prompts/layer3-context.ts)
*   Add Stage 5 properties to the `BorrowerProfile` interface:
    *   `handoff_choice?: 'live_transfer' | 'scheduled_call' | 'callback' | null;`
    *   `handoff_scheduled_time?: string | null;`
    *   `handoff_callback_phone?: string | null;`
    *   `handoff_confirmed?: boolean;`
*   Extend the human-readable `FIELD_LABELS` dictionary to include Stage 5 variables:
    *   `handoff_choice: 'transfer preference'`
    *   `handoff_scheduled_time: 'scheduled callback time'`
    *   `handoff_callback_phone: 'callback phone number'`
*   Update `buildLayer3TurnContext()` to print Stage 5 variables under a new `=== STAGE 5 (SAFE Act Escalation & Handoff) ===` header when `activeStage === '5'`.

---

### 2. Stage 5 LLM System Instructions
Create the Stage 5 prompts instructions file.

#### [NEW] [stage5-handoff.ts](file:///c:/Users/SOHAIL/Downloads/ConvergentAI/backend/src/prompts/stage5-handoff.ts)
*   Implement `buildStage5Instructions(profile: BorrowerProfile, pendingField: string | null)`:
    *   Configure system rules for the three escalation and handoff fields:
        *   **Handoff Choice (`handoff_choice`)**: Direct Ailana to present the three options:
            1.  **Live Transfer**: Connect immediately to a licensed MLO.
            2.  **Scheduled Call**: Pick a preferred date and time.
            3.  **Callback Request**: Provide a phone number for a direct callback.
        *   **Scheduled Time (`handoff_scheduled_time`)**: Ailana asks for the borrower's preferred day, date, or time to receive a callback.
        *   **Callback Phone (`handoff_callback_phone`)**: Ailana asks for the borrower's preferred phone number.
    *   Add rules to acknowledge any proactive rate quote or pre-approval escalations warmly and pivot to the handoff choices immediately.

---

### 3. Selector Registration
Integrate Stage 5 instructions into the prompt compiler.

#### [MODIFY] [ailana-system.ts](file:///c:/Users/SOHAIL/Downloads/ConvergentAI/backend/src/prompts/ailana-system.ts)
*   Import `buildStage5Instructions` from `./stage5-handoff.js`.
*   Update `buildLayer2(stage, profile)` to support `'5'`:
    ```typescript
    if (stage === '5') {
      return buildStage5Instructions(profile);
    }
    ```

---

### 4. Stage 5 State Machine & Extractor Logic
Implement proactive triggers, choice extractions, and completions in the context manager.

#### [MODIFY] [session-context-manager.ts](file:///c:/Users/SOHAIL/Downloads/ConvergentAI/backend/src/context/session-context-manager.ts)
*   Update `onUserTurn(text)`:
    *   **Proactive SAFE Act Triggers Check**: Before executing stage-specific extraction, check the user's raw input for keyword triggers indicating rate quotes or pre-approval requests (e.g. `rate quote`, `interest rate`, `pre-approval`, `preapproval letter`, `am i approved`). If triggered:
        *   Set `activeStage = '5'`.
        *   Set `currentPendingField = 'handoff_choice'`.
    *   Add a routing branch for `'5'`:
        ```typescript
        } else if (this.activeStage === '5') {
          await this.runStage5Extraction(trimmed);
        }
        ```
*   Implement `runStage5Extraction(text)`:
    *   If `currentPendingField === 'handoff_choice'`:
        *   Extract the user's preference using `extractProfileField(..., 'string')` matching values like `'live_transfer'`, `'scheduled_call'`, or `'callback'`.
        *   If choice is `'live_transfer'`: Set `handoff_choice = 'live_transfer'`, set `handoff_confirmed = true`, call `advanceWorkflow()`.
        *   If choice is `'scheduled_call'`: Set `handoff_choice = 'scheduled_call'`, set `currentPendingField = 'handoff_scheduled_time'`, call `advanceWorkflow()`.
        *   If choice is `'callback'`: Set `handoff_choice = 'callback'`, set `currentPendingField = 'handoff_callback_phone'`, call `advanceWorkflow()`.
    *   If `currentPendingField === 'handoff_scheduled_time'`:
        *   Extract preferred date/time string. Record to `handoff_scheduled_time`, set `handoff_confirmed = true`, call `advanceWorkflow()`.
    *   If `currentPendingField === 'handoff_callback_phone'`:
        *   Extract the phone number. Record to `handoff_callback_phone`, set `handoff_confirmed = true`, call `advanceWorkflow()`.
*   Update `advanceWorkflow()` for Stage 5:
    *   If `handoff_confirmed`: Mark the session completed. In a real integration, this is where we'd fire live API webhooks or initiate LiveKit transfers. For the demo, print a console log: `[context-manager]: 🏁 MLO Handoff completed. Session closed successfully!`.

---

## 📈 Verification Plan

### Automated Verification
*   Build typescript files to confirm compilation:
    `npm run build` in the `backend/` directory.

### Manual Verification
*   Test flow using Chat or Voice sessions:
    1.  **Completing Stage 4**: Say *"Yes, I have these documents ready"* at the end of Stage 4. Verify she immediately transitions to the MLO Transfer stage and presents the three choice options.
    2.  **Live Transfer**: Select *"live transfer"*. Verify she says she is initiating the transfer and finishes the session.
    3.  **Scheduled Call**: Select *"schedule a call"*. Verify she asks for a time, records it, and confirms.
    4.  **Callback Request**: Select *"request a callback"*. Verify she asks for your phone number, records it, and confirms.
    5.  **Proactive Escalation (SAFE Act)**: In Stage 1 or Stage 2, ask *"Can you give me a pre-approval letter right now?"* or *"What is my exact interest rate?"*. Verify she immediately interrupts the collection process, pivots to MLO escalation, and offers the three choice options.

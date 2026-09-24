# Ailana Voice & Session Resilience Testing Guide

This document outlines the testing procedures for **Ailana (ConvergentAI)** covering voice interruption defense, background noise suppression, session persistence, Loan Officer handoff, and the updated Affordability Panel across all three transaction flows (**Purchase**, **Refinance**, and **HELOC**).

---

## 1. System Status & Verification Summary

| Component | Status | Description |
| :--- | :--- | :--- |
| **Purchase Flow (`TT-PUR`)** |  Verified | Full budget, stated down payment calculation, loan guidelines. |
| **Refinance Flow (`TT-REF`)** |  Verified | Rate & Term (`refiRT`) + Cash-Out (`refiCO`) with 80% LTV guideline cap notice. |
| **HELOC / HE Loan (`TT-HEL`/`TT-HEQ`)**|  Verified | 1st mortgage balance, credit line, draw rate, and fixed loan options. |
| **Affordability Panel** |  Verified | "Adjust Scenario Assumptions" slider accordion is **open by default**. |
| **Stated Mode** |  Verified | Stated debts slider + **"Upgrade"** soft-pull ribbon. |
| **Verified Mode** |  Verified | Bureau-verified metrics + **"Submit for Review"** emerald ribbon (`SYSTEM_AUS_SUBMITTED`). |
| **Local Storage Session** |  Verified | Persisted with 4-hr TTL; cleared ONLY on hard refresh (F5), tab close, or manual reset. |
| **Loan Officer Loop Defense**|  Verified | "Return to Ailana" and "Continue Session" force `mode = "video"` and strip historical handoff intents. |

---

## 2. Test Execution Matrix

```
┌─────────────────────────────────┬───────────────────────────────────────┬───────────────────────────────────────┐
│ Test Case                       │ Primary Action                        │ Expected Outcome                      │
├─────────────────────────────────┼───────────────────────────────────────┼───────────────────────────────────────┤
│ 1. Sneeze Test                  │ Cough/sneeze during agent speech      │ Ailana stops, waits, gently re-prompts│
│ 2. Noise Test                   │ Type/tap desk while agent is listening│ Noise filtered; agent does not glitch │
│ 3. Continue Previous Session    │ Close modal mid-flow, reopen CTA      │ Recovery banner appears; plays chime  │
│ 4. Welcome Back Message         │ Click "Continue Session"              │ "Welcome back! Let's pick right back" │
│ 5. Return to Ailana             │ Finish MLO call -> Click Return       │ Returns to Stage 5 Ailana (no loop)   │
│ 6. Affordability Panel Checks   │ Open panel in Stated & Verified modes │ Sliders open; Upgrade & Submit buttons│
└─────────────────────────────────┴───────────────────────────────────────┴───────────────────────────────────────┘
```

---

## 3. Detailed Test Procedures

### Test 1: The Sneeze Test (Interruption Defense)
* **Objective**: Ensure accidental user noises (cough, sneeze, throat clear) do not leave Ailana trapped in awkward, indefinite silence.
* **Precondition**: Live conversation started with Ailana in Video or Voice mode.
* **Steps**:
  1. Prompt Ailana to explain something long (e.g. ask *"Can you explain the difference between FHA and Conventional?"* or answer your initial mortgage goal).
  2. While Ailana is actively speaking, **make a sharp sneeze, loud cough, or sharp throat clear** into your mic.
  3. Immediately remain quiet. **Do not speak any words.**
* **Expected Result**:
  - Ailana pauses her speech immediately upon detecting the interruption.
  - Within **1.5 to 2.5 seconds**, the Silent Turn Guard triggers (`[silent-turn-guard]` in backend logs).
  - Ailana speaks up naturally: *"Excuse me, I thought you wanted to say something..."* or gently re-prompts: *"As I was saying, [repeats the question or topic]"*.
* **Pass Criteria**: Ailana does not remain silently frozen; she re-engages autonomously.

---

### Test 2: The Noise Test (Background Suppression & Non-Interruption)
* **Objective**: Confirm background ambient noises do not create phantom turns or confuse the conversational state.
* **Precondition**: Ailana is in **Listening** mode (she asked a question and is waiting for your answer).
* **Steps**:
  1. Do not speak.
  2. Perform ambient background actions:
     - Rapidly tap keys on your mechanical keyboard.
     - Tap your knuckles on the desk.
     - Squeak your chair or rustle papers near the microphone.
* **Expected Result**:
  - LiveKit's Background Voice Cancellation (BVC) suppresses the transient noise.
  - The agent's audio wave indicator remains calm.
  - Ailana remains patiently in the "Listening" state and does not hallucinate empty user messages or say *"Could you repeat that?"*.
* **Pass Criteria**: No ghost turns or accidental interruptions occur while listening.

---

### Test 3: Continue Previous Session (LocalStorage Hydration)
* **Objective**: Verify that closing/minimizing the CTA maintains the session in `localStorage` and reloads seamlessly.
* **Precondition**: Progress through Stage 2 (Discovery) or Stage 2.5 (Affordability Summary).
* **Steps**:
  1. Provide your mortgage goal (e.g. Refinance or Purchase) and income details.
  2. Observe the chat transcript in the right panel.
  3. Close the CTA modal by clicking the **"X"** at the top right (or click outside if modal).
     *(Note: Do NOT press F5/refresh and do NOT click "End Call" / "Start Fresh").*
  4. Wait 5–10 seconds.
  5. Click the Floating CTA button to reopen Ailana.
* **Expected Result**:
  - Ailana presents the **Session Recovery Banner**:
    > *"Resume your previous session? (Stage 2: Discovery Questions)"*
  - Click **"Continue Session"**:
    - The audio chime (`playConnectingSound()`) plays immediately.
    - All previous chat entries re-populate in the Chat view.
    - Your borrower profile and state are intact.
* **Pass Criteria**: Session state is fully restored without loss of previous conversational progress.

---

### Test 4: Welcome Back Message & Context Continuity
* **Objective**: Verify that upon restoring a session, Ailana acknowledges the borrower's return with a contextual greeting.
* **Precondition**: Execute Test 3 and click **"Continue Session"**.
* **Steps**:
  1. Listen closely to Ailana's first spoken sentence after reconnecting.
* **Expected Result**:
  - Ailana greets you:
    > *"Welcome back! Let's pick right back up where we left off."*
  - She immediately follows up with the exact pending question for that stage (e.g. *"Could you confirm your estimated home value?"* or *"What is your target purchase price?"*).
* **Pass Criteria**: Ailana does not re-introduce herself with the initial greeting; she uses the resume greeting and asks the pending question.

---

### Test 5: Return to Ailana (from Loan Officer) & Loop Prevention
* **Objective**: Ensure transferring to a Loan Officer and returning to Ailana brings the user back to **Stage 5** without re-dialing the Loan Officer.
* **Precondition**: User is in Stage 5 or clicks the "Loan Officer" mode tab.
* **Steps**:
  1. Click **"Loan Officer"** tab or ask Ailana *"Connect me to a loan officer"*.
  2. The widget transitions to the Loan Officer SIP interface.
  3. When the simulated or real call concludes (or on the summary screen), locate the blue button: **"Return to Ailana"**.
  4. Click **"Return to Ailana"**.
* **Expected Result**:
  - The connecting chime plays.
  - The UI automatically resets to **"video" mode** (Ailana).
  - The system **does NOT** trigger another call to the Loan Officer.
  - Ailana greets the user at **Stage 5 (Pre-Qualification Results)** with the pre-qualification summary and affordability metrics active.
* **Pass Criteria**: Returning to Ailana never enters a recurring loop back to the Loan Officer.

---

### Test 6: Affordability Panel (All 3 Flows, Slider Default & Submit Button)
* **Objective**: Validate slider default open state and the "Submit for Review" button in Verified Mode across Purchase, Refinance, and HELOC.
* **Steps**:
  1. Navigate to `/sandbox/affordability` or open Stage 2.5 in the live CTA widget.
  2. **Check Default Open State**:
     - Verify the **"Adjust Scenario Assumptions"** accordion is **expanded/open by default** (sliders are visible immediately without clicking).
  3. **Check Stated Mode**:
     - Toggle to **Stated Mode**.
     - Verify the **"Want verified numbers? [Upgrade >]"** soft-pull ribbon is displayed.
     - Verify the **"Monthly Debts (your estimate)"** slider is present.
  4. **Check Verified Mode**:
     - Click **"Upgrade"** or toggle to **Verified Mode**.
     - Verify the green gradient ribbon appears above the sliders:
       > *"Ready for formal review? Submit your scenario for eligibility findings."* with a **[Submit for Review >]** button.
     - Click **[Submit for Review >]**:
       - Button changes state to **`Review Submitted ✓`** (disabled/dimmed).
       - In live session, backend receives `SYSTEM_AUS_SUBMITTED:approve_eligible`.
  5. **Switch Between All 3 Transaction Flows**:
     - **Purchase**: Target Price, Down Payment $, Interest Rate, HOA Dues, Insurance.
     - **Refinance (Rate & Term)**: Home Value, Payoff Balance, Rate, HOA, Est. Monthly Savings card.
     - **Refinance (Cash-Out)**: Home Value, Payoff, Rate, Cash-Out slider with 80% LTV guideline notice.
     - **HELOC**: Home Value, 1st Balance, Credit Line, Draw Rate.
* **Pass Criteria**: All 3 flows render correct assumptions, sliders are open by default, and Verified Mode provides the Submit for Review button.

---

## 4. Key Backend & Frontend Log References

When troubleshooting or observing terminal output, look for these key log tags:

* `[silent-turn-guard]`: Logs regarding sneeze detection, noise suppression, and interrupt re-prompts.
* `[agent-hook]`: Shows restored messages being handled and historical handoff intents being stripped.
* `[session-restore]`: Logs frontend hydration from `localStorage` snapshot.
* `SYSTEM_RESTORE_STATE`: LiveKit DataChannel payload restoring context to `SessionContextManager`.
* `SYSTEM_RESUME_AGENT`: Sent when waking up Ailana after Loan Officer disconnect.
* `SYSTEM_AUS_SUBMITTED`: Fired when clicking "Submit for Review" in the Affordability Panel.

# 🧪 Ailana Edge Case Testing Guide

This guide covers all critical edge cases in the Ailana architecture, including conversational logic, compliance guards, resilience, and UI state handling. Follow these step-by-step instructions to verify the system's robustness on `localhost`.

---

## 🗣️ 1. Conversational & Agent Edge Cases

### A. The 0ms Verbal Submit (Fast-Path)
Ailana has a specialized interceptor that bypasses the LLM to instantly submit applications when commanded, preventing the AI from hallucinating a response.
- **Goal:** Verify the agent instantly triggers the UI submission state without LLM processing delay.
- **Setup:** Proceed through the conversation until you reach **Stage 2.5** (The Stated Mode Affordability Panel is visible).
- **Test:** Say clearly: *"Can you just submit this for me?"* or *"Go ahead and run the review."*
- **Expected Result:** Ailana should reply immediately (0ms LLM delay) acknowledging the submission. The submit button on the UI should instantly change to "Review Submitted ✓", and after exactly 3 seconds, the panel should close and move to Stage 4.

### B. TRID Compliance (Volunteered SSN / Address)
To comply with TRID regulations, Ailana must never acknowledge or collect an SSN or Property Address during discovery.
- **Goal:** Verify Ailana's strict TRID rejection script.
- **Setup:** During Stage 1 or Stage 2 (e.g., when asked for your name or income).
- **Test:** Say: *"My name is John, and my social security number is 123-45-6789."*
- **Expected Result:** Ailana must NOT say "Thank you for your SSN." She MUST use the exact hardcoded formulation: *"Thank you — and I want to make sure I'm being straightforward... I am not collecting your Social Security number at this stage..."*

### C. The Silent-Turn Fallback (Interrupted Generation)
If the Voice Activity Detection (VAD) misfires or the LLM aborts generation mid-stream, Ailana might go silent, leaving the user confused.
- **Goal:** Verify the agent auto-recovers from a silent turn.
- **Setup:** This is hard to trigger manually. The easiest way to mock it is to briefly drop your network right after speaking, then reconnect before the timeout.
- **Expected Result:** If the backend detects that Ailana transitioned from 'thinking' -> 'listening' but never entered the 'speaking' state, it waits 2 seconds and automatically plays a fallback prompt: *"I apologize — it seems there was a brief interruption. Could you tell me..."*

### D. OTP Leftover Audio Bleed Guard
Users often mutter "done" or "okay" while typing their OTP code. This audio shouldn't break the conversational flow.
- **Goal:** Verify muttering during OTP entry is ignored.
- **Setup:** Reach the OTP verification modal (Stage 3A).
- **Test:** Type the 6-digit code on the UI. As the modal closes, say aloud: *"Okay, done."*
- **Expected Result:** The `classifyAuthorization` extractor specifically ignores the words "done", "okay", and "submitted" in this exact state. Ailana should seamlessly proceed to deliver the Soft Pull Consent disclosure instead of answering your mutter.

---

## 🛡️ 2. Resilience Edge Cases

### A. Network Loss & Auto-Recovery
- **Test:** Open Chrome DevTools (F12) -> Network Tab -> Change throttling to **"Offline"**.
- **Expected Result:** A red *"Internet connection lost"* banner appears. Switch back to **"No throttling"** and the LiveKit room should auto-restart and reconnect cleanly.

### B. Inactivity (AFK) Watchdog ✅ COMPLETED
- **Test:** Stop moving your mouse, typing, or speaking for exactly **60 seconds**.
- **Expected Result:** A popup appears warning the call will close, showing a 10-second countdown. Let it expire to verify the call gracefully terminates to save resources.

### C. Avatar Server Capacity / Failure
- **Test:** Temporarily mock a failure in `src/components/floating-cta/index.tsx` by adding `handleAvatarStatus("capacity");` after the token is fetched.
- **Expected Result:** The 3D avatar video feed drops, a warning banner appears, and the call seamlessly continues in voice-only mode using the LiveKit audio track.

### D. Connection Timeout Guard
- **Test:** Stop your backend node server (`npm run dev`) and click the CTA to connect.
- **Expected Result:** It will say "Connecting..." for exactly 15 seconds, then abort gracefully with *"Connection timed out. Please try again."*

---

## 💻 3. UI & State Machine Edge Cases

### A. Stage 2 Closing Offer Dual-Pathing
At the end of Stage 2, the user is offered a choice between a soft pull (verified) or an instant summary (stated).
- **Goal:** Verify the dual-pathing logic routes correctly without LLM hallucination.
- **Test:** When Ailana asks: *"Which path would you prefer?"*, say: *"I'd like to do the soft pull."* (Path A). Restart the app and try again, saying *"Just build the summary right now."* (Path B).
- **Expected Result:** 
  - Path A immediately triggers the OTP Gate UI (Stage 3A). 
  - Path B immediately renders the Affordability Panel in "stated" mode (Stage 2.5).

### B. SIP Transfer Abandonment (Loan Officer Handoff)
- **Goal:** Verify the UI handles a user dropping out while waiting for a human agent.
- **Setup:** Click the "Speak to Loan Officer" button.
- **Test:** While the UI says "Connecting you to a Loan Officer...", click the X or "End Call" button.
- **Expected Result:** The LiveKit room completely disconnects, SIP bridging is cancelled, and the CTA resets to its 'idle' state cleanly without lingering audio tracks.

### C. Voice-Driven Affordability Updates
- **Goal:** Verify the background data extractor can update the UI panel while it's open.
- **Setup:** Reach Stage 2.5 so the Affordability Panel is visible.
- **Test:** Instead of using the pencil icon, tell Ailana directly: *"Actually, my income is $95,000, not what I said before."*
- **Expected Result:** Within ~1.5 seconds, the chart on the screen should automatically re-render to reflect the new $95,000 value, triggered by the `llm-extractor` background job.

# 📋 Ailana Project Checklist: What To Do

This document outlines the active and upcoming tasks to finalize the Ailana conversational agent, incorporating feedback from David and structural improvements.

---

## ✅ Completed Tasks

- [x] **TTS Engine Migration (ElevenLabs ➔ Cartesia)**
  * Migrated the Text-to-Speech engine from ElevenLabs to Cartesia to match the Cartesia STT pipeline.
  * Created a custom `LoggedCartesiaTTS` wrapper class to preserve latency tracking (stream start, text push, and time-to-first-audio-frame logs).
  * Removed ElevenLabs credentials checks and updated backend configurations.
  * Verified compile-time safety and verified zero TypeScript warnings.

---

## 🚀 Upcoming & Pending Tasks

### 🎙️ Voice & Persona Tweaks
- [ ] **Change Cartesia Voice ID**
  * Switch the default Cartesia voice from the current "Midwestern Woman / Ruth" (`11af83e2-23eb-452f-956e-7fee218ccb5c`) to another voice once David provides the final voice selection.

### 🏛️ Loan Program Enhancements
- [ ] **Implement HELOC (Home Equity Line of Credit) Support**
  * Members 1st Federal Credit Union handles a large volume of HELOCs.
  * *Task*: Integrate the HELOC product recommendation rules and prompt scripts once David provides the specific HELOC prompting guidelines.
- [ ] **Fix Refinancing Conversational Management Flow**
  * *Issue*: While the home purchase flow is fully operational and smooth, David indicated Ailana had difficulties managing the refinance engagement sequence.
  * *Task*: Analyze the refinance path, ensure all prequalification questions make sense for existing homeowners (e.g., target price is property value, down payment is handled or skipped as $0, realtor is skipped), and verify the transitions flow correctly.

### 🧠 General Prompting & Future Scope
- [ ] **Complete Generic Prompting / Out-of-Sequence Support**
  * Improve robustness when users ask general mortgage questions (e.g., interest rate queries, escrow, amortization) or engage in chitchat mid-stage.
- [ ] **Review Flow Flexibility for Future Releases**
  * *Feedback*: The current strict sequential stage flow is excellent for the immediate milestone demo, but needs to be restructured in the future to allow more open-ended/non-linear conversations.

### 🎬 User Experience & Latency Masking
- [ ] **Integrate Intro Greeting Video**
  * *Goal*: Add a pre-rendered intro video/greeting playing in the UI to cover the initial start-up delay (the time taken for the room connection and LemonSlice avatar to load and initialize).

# 📋 Ailana Project Checklist: What To Do

This document outlines the active and upcoming tasks to finalize the Ailana conversational agent, incorporating feedback from David and structural improvements.

---

## ✅ Completed Tasks

- [x] **TTS Engine Migration (ElevenLabs ➔ Cartesia)**
  * Migrated the Text-to-Speech engine from ElevenLabs to Cartesia to match the Cartesia STT pipeline.
  * Created a custom `LoggedCartesiaTTS` wrapper class to preserve latency tracking (stream start, text push, and time-to-first-audio-frame logs).
  * Removed ElevenLabs credentials checks and updated backend configurations.
  * Verified compile-time safety and verified zero TypeScript warnings.
- [x] **Refinancing Conversational Flow Refinement**
  * Added goal-specific Stage 2 prompting instructions that re-phrase home buying questions to refinance-specific terms (Down Payment ➔ Cash/Equity, Rent/Own ➔ Own property check, Realtor ➔ Independent check, Target Price ➔ Estimated home value).
  * Passed the borrower profile variables to the Stage 2 instruction builder to toggle rules dynamically.
  * Tested the refinance flow successfully, confirming natural dialogue flow and correct confirmations.
- [x] **Change Cartesia Voice ID to Skylar**
  * Retrieved Cartesia Voice ID for "Skylar - Friendly Guide" (`db6b0ed5-d5d3-463d-ae85-518a07d3c2b4`).
  * Updated `cartesiaVoiceId` config fallback value in `ailana-config.ts` to use Skylar's voice ID.
- [x] **Collect Legal Name & Address Prior to Soft Pull**
  * Rearranged the conversational flow so that Ailana explicitly collects the user's legal name and physical address *before* the soft pull consent disclosure is delivered.
  * Injected these values into the subsequent pre-filled profile verification steps dynamically.
- [x] **Remove HMDA Demographics Questions from Stage 3B**
  * Completely removed the voluntary HMDA questions (ethnicity, race, sex) from the conversational stages.
  * Configured the workflow to transition directly from declarations (bankruptcy/foreclosure) to the submit confirmation prompt.
  * Updated the testing guide (`Ailana_Test_Flow_Guide.md`) to align with the revised flow.
- [x] **Customize Refinancing Stage 2 Pre-qualification Flow**
  * Tailored Stage 2 discovery sequence for refinance goals.
  * Bypassed down payment, rent/own check, and realtor status questions.
  * Added refinance type (cash-out vs rate and term) collection.
  * Re-worded estimated property value questions and updated confirmation scripts.

---

## 🚀 Upcoming & Pending Tasks

### 🏛️ Loan Program Enhancements
- [ ] **Implement HELOC (Home Equity Line of Credit) Support**
  * Members 1st Federal Credit Union handles a large volume of HELOCs.
  * *Task*: Integrate the HELOC product recommendation rules and prompt scripts once David provides the specific HELOC prompting guidelines.

### 🧠 General Prompting & Future Scope
- [ ] **Complete Generic Prompting / Out-of-Sequence Support**
  * Improve robustness when users ask general mortgage questions (e.g., interest rate queries, escrow, amortization) or engage in chitchat mid-stage.
- [ ] **Review Flow Flexibility for Future Releases**
  * *Feedback*: The current strict sequential stage flow is excellent for the immediate milestone demo, but needs to be restructured in the future to allow more open-ended/non-linear conversations.

### 🎬 User Experience & Latency Masking
- [ ] **Integrate Intro Greeting Video**
  * *Goal*: Add a pre-rendered intro video/greeting playing in the UI to cover the initial start-up delay (the time taken for the room connection and LemonSlice avatar to load and initialize).

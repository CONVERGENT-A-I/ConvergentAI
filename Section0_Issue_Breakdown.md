# Section 0 (Layer 0) Complete Live Session Analysis & Issue Breakdown

## 1. Executive Summary

An exhaustive analysis of all 15,839 lines in `Logs2_parsed.txt` reveals that Section 0 was active across **two distinct sessions** on October 28, 2026:
* **Session 1 (`08:20:35Z` – `08:21:19Z`)**: Testing a home improvement / existing mortgage scenario (*"So, I already have a mortgage and I wanted to like fix the garage"*).
* **Session 2 (`08:21:40Z` – `08:28:15Z`)**: Testing a multi-signal purchase scenario (*"I want to buy a home... wife both contribute... both veterans... earn combined 150,000 dollars. yearly. So, how do I proceed?"*).

*(Note: Lines 1 to 12,380 of `Logs2_parsed.txt` date from October 5–6, prior to Section 0 implementation).*

Across both sessions in `Logs2_parsed.txt`, there are **7 critical architectural defects** directly affecting Section 0 work:
1. **Infinite Fallback Routing Loop** (Session 1): The agent repeated the fallback routing question 3 times in a row with identical wording.
2. **Unimplemented SR-1 Stall Recovery** (Session 1): The context manager detected `route to stall recovery SR-1`, but `agent.ts` lacked the implementation to deliver SR-1, instead re-triggering fallback.
3. **Missing Equity Intent Coverage** (Session 1): Real-world intents like *"fix the garage"* / home improvement were missed because `extractOpeningSignals` only checked for financial jargon (*"heloc"*, *"equity"*).
4. **Income Regex Extraction Failure** (Session 2): STT punctuation (`dollars. yearly`) and conversational filler (`around combined around`) broke the extraction regex.
5. **Question Bypass of Section 0 Fast-Path** (Session 2): Ending an utterance with *"So, how do I proceed?"* (`t.includes('?')`) caused `agent.ts` to abandon deterministic `TEMPLATE_B` and delegate to dynamic LLM, which repeated the goal question.
6. **Co-Borrower Repetition via Static Stage 1 Prompt & 0ms Lookahead Blindness** (Session 2): `buildStage1Instructions` hardcoded a static 1–5 checklist, forcing the LLM to ask for co-borrower after timeline even though co-borrower was already confirmed.
7. **Military History Repetition via Static Stage 2 Numbered Checklist** (Session 2): `buildStage2Instructions` hardcoded `9. military_rural` without checking `profile.veteran_flagged`, causing the LLM to ask if they have military history when property type was uncertain.

---

## 2. Session 1 Deep-Dive (`08:20:35Z` – `08:21:19Z`)

### What Happened in the Conversation:
* **Turn 1 User**: *"So, I already have a mortgage and I wanted to like fix the garage."*
* **Turn 1 Agent**:
  > *"No problem at all, let's figure it out together. Are you looking to purchase a new home, refinance an existing mortgage, or access the equity you've already built?"*
* **Turn 2 User**: *"I wanted to fix my garage."*
* **Turn 2 Agent** *(Verbatim Repeat)*:
  > *"No problem at all, let's figure it out together. Are you looking to purchase a new home, refinance an existing mortgage, or access the equity you've already built?"*
* **Turn 3 User**: *"Masla to hai."* *(Urdu: "There is an issue indeed.")*
* **Turn 3 Agent** *(Verbatim Repeat 3rd time)*:
  > *"No problem at all, let's figure it out together. Are you looking to purchase a new home, refinance an existing mortgage, or access the equity you've already built?"*
* **Turn 4 User**: *"Tujhi awaz aa rahi hai na iski?"* *(Urdu: "Can you hear its voice?")*
* User closes session / WebRTC connection terminated.

### Log Evidence for Session 1:
```log
[08:20:41.594Z] [agent-hook]: onUserTurnCompleted hook triggered with message: "So, I already have a mortgage and I wanted to like fix the garage."
[08:20:41.595Z] [section0]: 🔄 Fallback routing delivered after unclear response (fallback_routing_delivered=true).
[08:20:41.608Z] [agent-hook]: Delivering deterministic Section 0 fallback routing formulation via ReadableStream!

[08:20:57.815Z] [agent-hook]: onUserTurnCompleted hook triggered with message: "I wanted to fix my garage."
[08:20:57.815Z] [section0]: ⚠️ Unclear after fallback routing — route to stall recovery SR-1.
[08:20:57.828Z] [agent-hook]: Delivering deterministic Section 0 fallback routing formulation via ReadableStream!

[08:21:12.234Z] [agent-hook]: onUserTurnCompleted hook triggered with message: "Masla to hai."
[08:21:12.235Z] [section0]: ⚠️ Unclear after fallback routing — route to stall recovery SR-1.
[08:21:12.242Z] [agent-hook]: Delivering deterministic Section 0 fallback routing formulation via ReadableStream!
```

### Why Session 1 Failed:
1. **Flawed Trigger Condition in `backend/src/agent.ts` (lines 401–408)**:
   ```typescript
   if (signals.length === 0) {
     if (profile.fallback_routing_delivered) {
       const fallbackText = this.contextManager.getFallbackRoutingFormulation();
       if (fallbackText) {
         console.log(`[agent-hook]: Delivering deterministic Section 0 fallback routing formulation via ReadableStream!`);
         return createVerbatimStream(fallbackText) as any;
       }
     }
   ```
   Notice that when `fallback_routing_delivered` is set to `true`, the code interprets this as a command to **re-deliver** `fallbackText` on every subsequent turn where signals = 0!
2. **Missing SR-1 Hook**:
   `session-context-manager.ts` returned `'UNCLEAR'` and logged `route to stall recovery SR-1`, but `agent.ts` had no branch for delivering SR-1; it defaulted back to delivering `fallbackText`.
3. **No Home Improvement / Remodeling Intent Matching**:
   In `extractOpeningSignals()`, transaction types are limited to:
   - Purchase: `buy|purchas|first home|new home|find a home`
   - Refinance: `refinanc|refi|lower my rate|lower my payment|cash.?out`
   - Equity: `heloc|equity line|home equity line|line of credit|home equity loan|equity`
   Phrases like *"fix the garage"*, *"home improvement"*, *"renovation"*, *"remodel"* with an existing mortgage are completely unrecognized.

---

## 3. Session 2 Deep-Dive (`08:21:40Z` – `08:28:15Z`)

### What Happened in the Conversation:
* **Turn 1 User**:
  > *"Hi Elena, I want to buy a home. and me and my wife both will contribute to the mortgage. Also, we are both veterans and other than that, um, I'm salaried for the last 10 years and my wife is a doctor and we earn around combined around 150,000 dollars. yearly. So, how do I proceed?"*
* **Turn 1 Agent**:
  > *"That sounds like a wonderful plan. It's great that you and your wife will be working together on this, and thank you both for your service. Just to make sure I have the right path for us it sounds like you're looking to purchase a home is that right?"*
  *(Re-asked purchase goal)*
* **Turn 2 User**: *"Yeah, that's what I said."*
* **Turn 3 User**: *"It's like a primary residence."*
* **Turn 4 User**: *"This is my first time."*
* **Turn 5 User**: *"Yeah. Uh, next 2 months maybe."*
* **Turn 5 Agent**:
  > *"That is a great window to work with. Will anyone else be applying with you on this loan, such as a spouse or co-borrower?"*
  *(Re-asked co-borrower)*
* **Turn 6 User**: *"I already told you I was gonna do it with my wife."*
* **Turn 6 Agent**:
  > *"My apologies, just to make sure I have it right. You mentioned earlier that you and your wife earn about one hundred and fifty thousand dollars combined annually. Just to be certain, is that the gross annual household income before taxes?"*
  *(Re-asked income confirmation)*
* **Turns 7–13**: Borrower answered debt ($1,500), credit (700), savings ($30,000), rental status (renting), realtor status (looking), target price (not sure yet).
* **Turn 14 User**: *"Uh, I'm not sure yet."* (Regarding property type / zip code)
* **Turn 14 Agent**:
  > *"That's completely fine. It's a big decision, and it's okay to take your time with the details. To keep us moving forward, do you have any military service history? I'm asking because your lending institution offers some great benefits for veterans and active duty members."*
  *(Re-asked military history)*
* **Turn 15 User**: *"I already mentioned you that I have a veteran."*

### Log Evidence for Session 2:
```log
[08:22:43.531Z] [section0]: 📡 extractOpeningSignals completed in 1.1ms | signals_found: [TT-PUR, veteran, co_borrower]
[08:22:43.531Z] [section0]: 📋 Q9-MULTI delivered: TEMPLATE_B for signals [TT-PUR, veteran, co_borrower]
[08:22:43.554Z] [agent-hook]: User turn contains question/explanation request ("...So, how do I proceed?") — delegating to LiveKit Inference LLM to answer dynamically.
...
[08:23:39.315Z] [agent-hook][fallback] Injected sentinel "__pending__" for field "timeline" — LLM proceeds immediately, extractor will overwrite.
[08:23:39.315Z] [agent-debug]: Instructions updated — stage=1, pendingField=timeline
[08:23:47.937Z] message: "...Will anyone else be applying with you on this loan, such as a spouse or co-borrower?"
...
[08:27:37.133Z] [agent-debug]: Instructions updated — stage=2, pendingField=property_type
[08:27:53.894Z] message: "...To keep us moving forward, do you have any military service history? I'm asking because your lending institution offers some great benefits for veterans and active duty members."
```

---

## 4. Comprehensive Matrix of All 7 Root Causes

| # | Bug Name | Trigger Condition | Code Location | Observed Impact |
|---|---|---|---|---|
| **1** | **Infinite Fallback Loop** | Turn with 0 signals when `fallback_routing_delivered === true` | `backend/src/agent.ts:402-408` | Agent repeats identical fallback text infinitely every turn. |
| **2** | **SR-1 Stall Recovery Never Delivered** | Unclear turn after fallback routing | `backend/src/context/session-context-manager.ts:3207`<br>`backend/src/agent.ts` | Context manager logs SR-1, but `agent.ts` re-sends fallback text instead of SR-1 prompt. |
| **3** | **Missing Home Improvement / Renovation Intent** | User says *"fix the garage"*, *"remodel"*, *"renovation"* with existing mortgage | `backend/src/context/session-context-manager.ts:121-130` | 0 signals detected; treated as ambiguous instead of equity/HELOC. |
| **4** | **Income Regex Breakage via Punctuation & Filler** | STT contains periods (`dollars. yearly`) or filler (`around combined around`) | `backend/src/context/session-context-manager.ts:156-172` | $150,000 income ignored during opening extraction. |
| **5** | **`t.includes('?')` Bypassing Section 0 Fast-Path** | Opening utterance ends with conversational phrase like *"So, how do I proceed?"* | `backend/src/agent.ts` | Bypasses `TEMPLATE_B`; dynamic LLM asks *"sounds like you want to buy a home, is that right?"*. |
| **6** | **Co-Borrower Repetition via Static Stage 1 Prompt & 0ms Lookahead Blindness** | User completes `timeline` when `co_borrower` was already confirmed | `backend/src/prompts/stage1-greeting.ts:7-18`<br>`session-context-manager.ts:1529` | Prompt commands LLM to ask items 1–5 in order; LLM asks for co-borrower. |
| **7** | **Military History Repetition via Static Stage 2 Numbered Checklist** | User hesitates on `property_type` when `veteran_flagged` is true | `backend/src/prompts/stage2-prequalification.ts:28-37` | Stage 2 prompt hardcodes item 9 as `military_rural`; LLM asks if borrower has military history. |

---

## 5. Client Assessment Verification

* **Did Section 0 run?** Yes. Both extraction (`1.1ms`) and routing logic executed in GCP Kubernetes.
* **Why did the client perceive it as not working?**
  1. If they tested an existing mortgage / home improvement scenario (Session 1), the system looped infinitely on fallback routing.
  2. If they tested a front-loaded multi-signal scenario (Session 2), the system re-asked their goal, their co-borrower, and their veteran status.
* **Conclusion**: The client's frustration is 100% justified based on the live user experience. The root causes are not in the underlying concept of Section 0, but in:
  - Loop logic in `agent.ts`
  - Rigid STT regexes
  - Over-eager question-detection bypasses
  - Static prompt checklists in Stage 1 and Stage 2

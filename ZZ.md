------------------------------FIRST LOGS--------------------------------

## Issues, Errors & Suggestions from Session Log Analysis (2026-08-19)

---

### 🔴 ISSUE A — CRS Soft Pull Blocks Pipeline for ~8 Seconds (Turn 24)

**What happened:**
When the user said "yes" to the soft pull authorization, the backend called `callCrsSoftPull()` as a synchronous blocking `await` inside `llmNode()`. This caused **7.9 seconds of complete silence** before any audio was delivered to the user. The end-to-end avatar latency for this turn was **8,434ms** — the single worst turn in the entire session.

**Error evidence from logs:**
```
TURN 24 SUMMARY — llm_start=7915ms  tts_start=8177ms  tts_first_byte=8316ms  tts_done=10281ms
e2e_user_to_avatar=8434ms
```

**Source:** Our code (`agent.ts` → `callCrsSoftPull`)

**Suggestion / Fix:**
Deliver a verbal bridge line immediately before awaiting the CRS call:
1. Fire `session.say("Let me pull that up for you now — just a moment, please...")` **before** calling `callCrsSoftPull()`
2. Then `await` the CRS result in the background
3. Once the result returns, call `session.generateReply()` with the prefill data

This converts a silent 8-second wait into a natural conversational pause with voice feedback.

---

### 🔴 ISSUE B — Stage Boundary Extraction Timeout Causes Forced 2,500ms Stall (Turn 32)

**What happened:**
The `affordability_panel_active` background extractor LLM exceeded the 2,500ms boundary wait budget. The pipeline consumed the entire ceiling before proceeding, causing a **2,513ms delay** before the LLM could even start. Combined with a slow LLM on that turn, e2e reached **5,223ms**.

**Error evidence from logs:**
```
[ERROR] [agent-hook]: Stage boundary extraction timed out (>2500ms). Proceeding without stalling.
TURN 32 SUMMARY — llm_start=2513ms  llm_first_token=3450ms  tts_done=6473ms
e2e_user_to_avatar=5223ms
```

**Source:** Our code (boundary wait ceiling in `agent.ts`)

**Suggestion / Fix:**
- Reduce the `affordability_panel_active` boundary wait ceiling from 2,500ms to 1,800ms
- Add a fast-path classifier for common affordability panel responses (e.g., "yes", "submit", "I'm ready") similar to how `prefill_*` confirmations use a 0.1ms fast-path
- Pre-warm the extractor LLM by sending a dummy warm-up call at session start

---

### ⚠️ ISSUE C — LemonSlice TIMEOUT_FALLBACK Cluster on Turns 14, 15, 16 (3 Consecutive)

**What happened:**
Three consecutive turns experienced `TIMEOUT_FALLBACK` — LiveKit's `ActiveSpeakersChanged` event never fired within 1.5 seconds, meaning LemonSlice's event pipeline was not reporting the avatar as speaking. The avatar was still delivering audio, but the latency tracker could not measure it and fell back to the 1500ms estimate. Turn 14 was compounded by a TTS platform delay on top, resulting in an e2e of 4,070ms.

**Error evidence from logs:**
```
[ERROR] Avatar first-frame timeout — ActiveSpeakersChanged never fired. Firing [TIMEOUT_FALLBACK]
Turn 14 — e2e_user_to_avatar=4070ms  [TIMEOUT_FALLBACK]
Turn 15 — e2e_user_to_avatar=1941ms  [TIMEOUT_FALLBACK]
Turn 16 — e2e_user_to_avatar=2675ms  [TIMEOUT_FALLBACK]
```

**Source:** LemonSlice platform — their event pipeline was under load during the 18:26:47–18:27:14 window.

**Suggestion / Fix:**
- This is not directly controllable from our side since it is a LemonSlice infrastructure issue
- However: if a TIMEOUT_FALLBACK cluster of 3+ consecutive turns is detected, send an internal alert/log flag (e.g., `[avatar-health]: ⚠️ CONSECUTIVE_TIMEOUT streak=3`) to help distinguish persistent LemonSlice degradation from isolated one-off event drops
- Consider surfacing this as a metric to LemonSlice support if it recurs frequently

---

### ⚠️ ISSUE D — TTS Platform Spike on Turn 14 (`tts_start=2,568ms`)

**What happened:**
The Cartesia/LiveKit Inference TTS infrastructure took 2,568ms just to begin synthesizing audio — more than 2.5x the normal startup time. This compounded with the LemonSlice TIMEOUT_FALLBACK cluster on the same turn, pushing the user-visible gap to over 4 seconds.

**Error evidence from logs:**
```
TURN 14 SUMMARY — tts_start=2568ms  tts_first_byte=2748ms  e2e_user_to_avatar=4070ms
```

**Source:** Cartesia/LiveKit Inference platform — not our code.

**Suggestion / Fix:**
- This is a platform-side transient issue and cannot be fixed from our code
- To mitigate compound spikes (TTS delay + LemonSlice event drop on the same turn), consider using our `session.say()` deterministic fast-path for any turn where the answer is predictable — this bypasses the LLM and sends text directly to TTS without a cold-start delay

---

### ⚠️ ISSUE E — Recurring Boundary Wait Delays on Stage Transition Turns (Turns 18, 23, 25, 26, 27, 36)

**What happened:**
Multiple turns had `llm_start` values of 500ms–1,547ms because they are stage boundary fields where the system deliberately waits for background extraction to complete before the pipeline proceeds. While this is by design, it adds consistent user-visible latency on every stage-change turn.

**Error evidence from logs:**
```
Turn 18 — llm_start=730ms   (soft_pull_consent boundary)
Turn 23 — llm_start=1046ms  (contact_mobile boundary)
Turn 25 — llm_start=1010ms  (otp_verification boundary)
Turn 26 — llm_start=867ms   (prefill_name_address boundary)
Turn 27 — llm_start=1172ms  (prefill_employer boundary)
Turn 36 — llm_start=1547ms  (affordability_panel_active boundary)
```

**Source:** Our architecture (intentional boundary wait design).

**Suggestion / Fix:**
- For fields with highly predictable answers (like prefill confirmations), expand the fast-path classifier to cover them — `prefill_name_address`, `prefill_employer`, `prefill_accounts`, `prefill_credit_range` all have simple yes/no answers that already resolve in 0.1–1.2ms when the fast-path fires
- For `contact_mobile` (Turn 23, 1046ms), consider treating phone number extraction as a high-priority parallel call with a shorter timeout ceiling

---

### ✅ WORKING WELL — Fast-Path / Deterministic Turns (Turns 3–6, 8, 19, 21, 22, 28, 29, 35, 38)

**Observation:**
All deterministic script turns had `llm_start` of 12–15ms — effectively zero overhead. The fast-path classifier for prefill confirmations resolved in 0.1–1.2ms. The Verbal Submit Fast-Path on Turn 38 fired correctly and immediately.

**No action needed.** This is the system performing exactly as designed.

---

### ✅ WORKING WELL — Database Persistence (All Turns)

**Observation:**
Every turn successfully wrote to PostgreSQL via Prisma. No DB errors, no connection failures. The final session sync before disconnect completed cleanly.

**No action needed.**

---

### Summary Table

| Issue | Severity | Source | Fixable? |
|---|---|---|---|
| A — CRS Soft Pull 8s silence | 🔴 Critical | Our code | ✅ Yes — add bridge line |
| B — Boundary timeout 2500ms stall | 🔴 High | Our code | ✅ Yes — reduce ceiling + fast-path |
| C — LemonSlice TIMEOUT_FALLBACK cluster | ⚠️ Medium | LemonSlice platform | Partially — add alerting |
| D — TTS platform spike | ⚠️ Medium | Cartesia/LiveKit platform | ❌ Not directly controllable |
| E — Recurring boundary wait delays | ⚠️ Low-Medium | Our architecture | ✅ Partially — expand fast-path coverage |

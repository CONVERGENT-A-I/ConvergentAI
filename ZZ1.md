------------------------------SECOND LOGS--------------------------------

## Issues, Errors & Suggestions from Session Log Analysis (2026-08-19, 18:00–18:10 UTC)

---

### 🔴 ISSUE A — OTP/CRS Pipeline Creates ~6 Second Stall (Turn 26)

**What happened:**
When the user submitted the OTP code through the modal, our backend ran the full OTP verification → `soft_pull_authorization` classification → CRS token fetch → CRS API call → prefill delivery pipeline **entirely sequentially** before any audio was sent. The user heard ~6 seconds of dead silence.

Notably, the CRS API itself was fast (only 297ms this time). The bulk of the stall was the sequential OTP state machine transitions running before TTS could start.

**Error evidence from logs:**
```
18:06:58.440  soft_pull_authorization classified as "yes"
18:06:58.440  [agent-hook]: Soft pull accepted! Executing CRS soft pull...
18:06:58.450  [CRS]: Fetching new auth token...
18:06:58.639  [CRS]: Ordering soft pull for David (sandbox profile)...
18:06:58.737  [agent-hook]: CRS soft pull complete.
18:07:01.084  TURN 26 SUMMARY — llm_start=6105ms  tts_first_byte=6588ms  e2e_user_to_avatar=7904ms
```

**Source:** Our code — OTP → CRS state machine is synchronous and blocking.

**Suggestion / Fix:**
The moment OTP verification is confirmed, fire a bridge line **immediately** via `session.say()` before awaiting any CRS call:
1. Detect OTP success → immediately say: *"Perfect, thank you! Let me pull up your information now — just one moment."*
2. Run `callCrsSoftPull()` in the background while that audio plays
3. Resume with the prefill delivery script after the CRS call returns

This converts a silent 6-second gap into a natural conversational handoff.

---

### 🔴 ISSUE B — LemonSlice Hard Disconnect Mid-Conversation (18:06:01)

**What happened:**
LemonSlice's avatar agent completely dropped from the LiveKit room while the user was mid-session. The avatar froze completely. The user noticed and said *"Are you there?"* ~8 seconds later. Ailana eventually responded with an apology *"My apologies, I'm right here!"*, but only after a ~22-second recovery window.

**Error evidence from logs:**
```
18:06:01.832  [ERROR] [avatar] ⚠️ LemonSlice participant disconnected mid-conversation!
              Routing audio back to LiveKit room fallback.
18:06:09.xxx  User says: "Are you there?"
18:06:14.996  [ERROR] speech not done in time after interruption, cancelling the speech arbitrarily.
18:06:17.003  [ERROR] [agent-warning] Caught LiveKit RPC Connection Timeout: Connection timeout
              error code: 1501
18:06:23.502  client_avatar_playout_started (turn=2) — avatar reconnected
18:06:30.141  Ailana responds: "My apologies, I'm right here!"
```

**Source:** LemonSlice platform — their participant dropped from the LiveKit room.

**Suggestion / Fix:**
From our side, on detecting `LemonSlice participant disconnected`:
1. Immediately route a verbal hold message via the LiveKit room fallback: *"One moment please, I'm just reconnecting..."*
2. Set a 15-second reconnect watchdog timer — if LemonSlice does not rejoin within 15 seconds, surface an error state to the frontend
3. Report the disconnect event to LemonSlice with session ID for investigation

---

### 🔴 ISSUE C — LemonSlice Reconnect Breaks Event Subscriptions for the Rest of the Session (Turns 21–37)

**What happened:**
After LemonSlice reconnected at ~18:06:23, their `ActiveSpeakersChanged` event pipeline **never resumed**. Every single one of the remaining **14 consecutive turns** fired `TIMEOUT_FALLBACK`. This means our avatar latency measurements for the entire second half of the session are blind estimates (capped at 1500ms), not real data.

This is the most impactful bug in this session — after one reconnect, all avatar timing visibility is lost for the rest of the conversation.

**Error evidence from logs:**
```
[ERROR] Avatar first-frame timeout — ActiveSpeakersChanged never fired. [TIMEOUT_FALLBACK] (Turn 21)
[ERROR] Avatar first-frame timeout — ActiveSpeakersChanged never fired. [TIMEOUT_FALLBACK] (Turn 22)
[ERROR] Avatar first-frame timeout — ActiveSpeakersChanged never fired. [TIMEOUT_FALLBACK] (Turn 23)
... [14 consecutive turns, all the way to Turn 37 / session end]
```

**Source:** LemonSlice platform bug — their event subscription is not re-established after reconnect.

**Suggestion / Fix:**
1. **Report to LemonSlice** with session ID — their reconnect flow does not re-register `ActiveSpeakersChanged` listeners
2. On our side, detect a LemonSlice reconnect event → proactively re-call our event listener registration on the new participant handle
3. Add a health metric: if `TIMEOUT_FALLBACK` fires 3+ consecutive turns, emit a `[avatar-health]: ⚠️ CONSECUTIVE_TIMEOUT streak=N` alert so we can catch this pattern in dashboards

---

### ⚠️ ISSUE D — `scheduled_call_time` Extractor Fails on Informal Responses (3 Consecutive Failures)

**What happened:**
At Stage 5 (scheduling), the LLM extractor was called 3 times to extract `scheduled_call_time` from the user's responses. It failed all 3 times, returning null each time (1440ms wasted per attempt). After 3 failures, the system declared "Max attempts reached" and declined the field entirely.

The user was likely providing informal responses ("tomorrow", "sometime next week") that the extractor's structured schema couldn't parse into a concrete datetime value.

**Error evidence from logs:**
```
[ERROR] [reconcile] Field "scheduled_call_time" had unresolved __pending__ sentinel — cleared to null. (Turn 34)
[ERROR] [reconcile] Field "scheduled_call_time" had unresolved __pending__ sentinel — cleared to null. (Turn 35)
[INFO]  [context-manager] Max attempts reached for "scheduled_call_time". Declining field.
[ERROR] [reconcile] Field "scheduled_call_time" had unresolved __pending__ sentinel — cleared to null. (Turn 36)
```

**Source:** Our code — extractor schema doesn't handle informal/relative time expressions.

**Suggestion / Fix:**
1. Add a pre-processing step that converts informal time expressions to structured slots before passing to the LLM extractor (e.g., "tomorrow morning" → `next_business_day_am`)
2. After the first failure, have Ailana explicitly re-prompt with a constrained format: *"What day and time works best for you? For example: Tuesday at 2pm or Thursday morning."*
3. After 2 failures, fall back to offering 2–3 specific time slots rather than open-ended scheduling

---

### ⚠️ ISSUE E — STT Endpointing Warning (Turn 19 area)

**What happened:**
A WARN from the LiveKit Agents SDK fired: `transcript arrives after turn has been committed. consider raising minDelay in the endpointing options`. This means the STT provider finalized its transcript after our system had already committed the user's turn and moved on. This can cause the pipeline to briefly work with incomplete transcripts.

**Error evidence from logs:**
```
[WARN] transcript arrives after turn has been committed.
       consider raising `minDelay` in the endpointing options to accommodate a slow stt.
       subsequent occurrences will log at debug level.
```

**Source:** Our SDK configuration.

**Suggestion / Fix:**
Raise `minDelay` in the endpointing options by 50–100ms. This adds a small buffer between VAD end-of-speech and turn commitment, giving the STT provider time to deliver its final transcript before the turn locks.

---

### ⚠️ ISSUE F — LLM Context Growth Degrades TTFT in Late Session (Turns 34–37)

**What happened:**
By Stage 5, the context has grown and been compacted twice. LLM first-token times (TTFT) increase significantly in the last 4 turns: 1115ms → 1279ms → 1483ms → 1057ms. This is well above the 300–500ms TTFT seen in early turns, and is consistent with the LiveKit Inference backend slowing under larger context windows.

**Evidence from logs:**
```
Turn 34 — llm_first_token=1115ms
Turn 35 — llm_first_token=1279ms
Turn 36 — llm_first_token=1483ms   ← worst
Turn 37 — llm_first_token=1057ms
```

**Source:** Context length growth (our architecture) + LLM inference speed under load (platform side).

**Suggestion / Fix:**
- Evaluate whether Stage 5 (scheduling/escalation) needs a lighter system prompt than earlier stages — if the user is at Stage 5, most Stage 1–3 instructions are no longer relevant
- Implement a stage-aware context pruning pass: when transitioning to Stage 5, strip Stage 1–2 instructions from the context to reduce token count
- Consider more aggressive compaction thresholds in later stages

---

### ✅ WORKING WELL — Fast-Path / Deterministic Turns (Turns 3, 4, 7, 8, 18, 33)

**Observation:**
All fast-path turns had `llm_start` of 12–19ms — essentially zero overhead. Turn 4 was the best of the session: `tts_first_byte=412ms`, `e2e=1724ms`. The STAGE2_CLOSING_OFFER_SCRIPT fast-path fired correctly on Turn 18 (86ms llm_start).

**No action needed.** This is the system performing exactly as designed.

---

### ✅ WORKING WELL — Ailana's Recovery Handling of Freeze

**Observation:**
When LemonSlice disconnected and the user said *"Are you there?"*, the system correctly:
- Detected it as a Q&A turn (`Question/hesitation detected on field "contact_name"`)
- Did not count it against the attempt limit
- Delivered a recovery response: *"My apologies, I'm right here! I just wanted to make sure we get your secure login set up..."*

The conversational recovery logic worked well, even though the LemonSlice reconnect itself was the platform's responsibility.

---

### Summary Table

| Issue | Severity | Source | Fixable From Our Side? |
|---|---|---|---|
| A — OTP/CRS 6s silence (Turn 26) | 🔴 Critical | Our code | ✅ Yes — bridge line before CRS call |
| B — LemonSlice hard disconnect | 🔴 High | LemonSlice platform | Partially — verbal hold + watchdog timer |
| C — Reconnect breaks event subscriptions (14 turns) | 🔴 Critical | LemonSlice bug | Partially — re-register listener + report |
| D — scheduled_call_time 3 extraction failures | ⚠️ Medium | Our code | ✅ Yes — informal parser + prompt fallback |
| E — STT endpointing warning | ⚠️ Low | SDK config | ✅ Yes — raise minDelay |
| F — LLM TTFT degrades in late session | ⚠️ Low-Medium | Architecture + platform | Partially — lighter Stage 5 prompt |

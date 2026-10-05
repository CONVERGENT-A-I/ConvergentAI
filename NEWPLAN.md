# Expressive Mode & LemonSlice Optimization Plan

This document outlines the step-by-step engineering plan for optimizing LiveKit Expressive Mode (Cartesia Sonic-3.6) and LemonSlice avatar integration.

The plan is divided into two distinct parts:
1. **PART A: Essential Updates (Phase 1 — High-ROI & Critical Fixes)**: Immediate stability fixes and latency wins with zero architectural risk.
2. **PART B: Non-Essential & Deferred Updates (Phase 2 — Architectural & Optional)**: Defensive safeguards, micro-optimizations, and future platform migrations.

---

## Plan Overview & Classification Matrix

| ID | Item | Classification | Effort | Files Affected | Primary Objective |
| :---: | :--- | :---: | :---: | :--- | :--- |
| **E1** | Framework-Level `speechSteering` | **ESSENTIAL** | 5 mins | `backend/src/agent.ts` | Eliminate active prompt contradiction ("um/uh" fillers) |
| **E2** | Emotion & Prosody Constraints (via Append) | **ESSENTIAL** | 5 mins | `backend/src/agent.ts` | Prevent pitch/speed spikes and avatar facial mesh distortion |
| **E3** | Opening Clause Pacing Rule | **ESSENTIAL** | 5 mins | `backend/src/prompts/ailana-system.ts` | Force immediate 20-char first-chunk flush; cut avatar TTFB by 50–100ms |
| **D1** | Hardened Frontend Markup Stripping | **NON-ESSENTIAL** | 15 mins | `backend/src/agent.ts` | Defensive multiline regex for chat bubble display |
| **D2** | Stage-Aware Dynamic Modulation | **NON-ESSENTIAL** | 45 mins | `backend/src/context/session-context-manager.ts` | Contextual tone modulation across Stages 1–5 |
| **D3** | LiveKit Inference LemonSlice Migration | **ARCHITECTURAL** | Future | `backend/src/agent.ts`, `package.json` | Enable adaptive interruption and native avatar playout sync |

---

# PART A: ESSENTIAL UPDATES (Phase 1 — Critical Fixes)

These items address direct prompt conflicts, protect avatar visual rendering, and shave perceptible conversational latency.

---

### DONE ✅ Step E1 — Framework-Level `speechSteering` Configuration

#### 1. Current Problem
In [`backend/src/agent.ts`](file:///c:/Users/Sherry/Documents/Convergent_AI/backend/src/agent.ts#L1391-L1402), `expressiveConfig` only sets `ttsInstructionsAppend`:
```typescript
const expressiveConfig = ailanaConfig.expressiveMode
  ? {
      ttsInstructionsAppend: `
MORTGAGE ADVISOR EXPRESSIVE DELIVERY GUIDELINES:
...
- NEVER use casual disfluencies, giggling, theatrical laughter, or dramatic sighs.
`.trim(),
    }
  : false;
```
Because `speechSteering` is omitted, `@livekit/agents` applies its default `DEFAULT_SPEECH_STEERING_OPTIONS = { disfluencies: true }`. This causes LiveKit to inject:
> `Delivery guidelines:`  
> `- Sprinkle in natural fillers (um, uh) and openers (oh, well, so), zero to two per turn, never mechanical.`

This directly contradicts your custom text append. Gemma 4 31B receives conflicting instructions on every turn, causing hesitation and intermittent filler sounds that break LemonSlice lip-sync.

#### 2. Technical Solution
Update `expressiveConfig` in [`backend/src/agent.ts`](file:///c:/Users/Sherry/Documents/Convergent_AI/backend/src/agent.ts#L1391-L1402) to explicitly pass `speechSteering`:
* Set `disfluencies: false` so LiveKit automatically injects `- No fillers (um, uh). Sound composed and fluent.`
* Set `nonverbalSounds: false` to filter out all non-verbal sound tags (`sighing`, `laughing`, `breathing`, `crying`, `mouthSounds`, `reflexSounds`) from the advertised markup vocabulary.

#### 3. Exact Code Change
In [`backend/src/agent.ts`](file:///c:/Users/Sherry/Documents/Convergent_AI/backend/src/agent.ts):
```diff
    const expressiveConfig = ailanaConfig.expressiveMode
      ? {
+       speechSteering: {
+         disfluencies: false,
+         nonverbalSounds: false,
+       },
        ttsInstructionsAppend: `
 MORTGAGE ADVISOR EXPRESSIVE DELIVERY GUIDELINES:
 - Maintain a warm, composed, and confident credit union advisor demeanor.
 - For positive news (e.g. strong qualifications, savings), use subtle warm and encouraging delivery.
 - For sensitive topics (e.g. debt disclosures, automated refer findings), adopt a calm, empathetic, and reassuring register.
 - Use natural, unhurried pacing with slight pauses when discussing numbers or financial disclosures.
 - NEVER use casual disfluencies, giggling, theatrical laughter, or dramatic sighs.
 `.trim(),
       }
      : false;
```

#### 4. Verification & Testing
* Inspect LiveKit agent startup logs for `[agent]: Expressive mode configured: ✅ ENABLED`.
* Monitor transcript history during testing to verify that no filler words ("um", "uh", "well") are spoken by Ailana.
* Observe LemonSlice mouth movements on initial greetings to confirm zero viseme stutter.

---

### DONE ✅ Step E2 — Emotion & Prosody Constraints (via `ttsInstructionsAppend`)

#### 1. Current Problem
LiveKit teaches the LLM the full `<expr>` dialect for Cartesia, which includes **four marker types**: expression (emotion), break (pauses), prosody (speed/volume), and spell (character readout). The prosody markers (`slow`, `fast`, `soft`, `loud`) are lowered by LiveKit to native Cartesia `<speed ratio="...">` and `<volume ratio="...">` tags. If the LLM chooses `<expr type="prosody" label="fast"/>` or `<expr type="prosody" label="loud"/>`, Cartesia produces sharp acoustic shifts that cause LemonSlice viseme distortion (jittery lips, exaggerated jaw drops). Similarly, high-energy emotion labels like `excited`, `amazed`, or `panicked` produce pitch surges that distort the avatar's facial mesh.

> **Important:** LiveKit uses a unified `<expr>` dialect — the LLM never writes native Cartesia tags (`<emotion>`, `<speed>`, `<volume>`) directly. The `<expr>` markers are lowered to native syntax by LiveKit's `convertExpr` function before reaching Cartesia. We must NOT override `ttsInstructionsTemplate` without the `{tts.markup.llm_instructions}` placeholder, as doing so would prevent the LLM from learning the `<expr>` dialect entirely, breaking transcript metadata extraction and expr→native tag lowering.

#### 2. Technical Solution
Keep LiveKit's default `ttsInstructionsTemplate` (which contains the `{tts.markup.llm_instructions}` placeholder). Expand our existing `ttsInstructionsAppend` with explicit **emotion label preferences** and **prosody restrictions** that override the LLM's choices within the taught vocabulary.

#### 3. Exact Code Change
In [`backend/src/agent.ts`](file:///c:/Users/Sherry/Documents/Convergent_AI/backend/src/agent.ts):
```diff
    const expressiveConfig = ailanaConfig.expressiveMode
      ? {
+       speechSteering: {
+         disfluencies: false,
+         nonverbalSounds: false, // no-op for Cartesia today, but defensive
+       },
+       // NOTE: ttsInstructionsTemplate is intentionally NOT overridden.
+       // The default template contains the {tts.markup.llm_instructions} placeholder
+       // that injects the full <expr> dialect. Overriding it without the placeholder
+       // would break LiveKit's markup pipeline (transcript metadata, expr→native lowering).
        ttsInstructionsAppend: `
 MORTGAGE ADVISOR EXPRESSIVE DELIVERY GUIDELINES:
 - Maintain a warm, composed, and confident credit union advisor demeanor.
 - For positive news (e.g. strong qualifications, savings), use subtle warm and encouraging delivery.
 - For sensitive topics (e.g. debt disclosures, automated refer findings), adopt a calm, empathetic, and reassuring register.
 - Use natural, unhurried pacing with slight pauses when discussing numbers or financial disclosures.
 - NEVER use casual disfluencies, giggling, theatrical laughter, or dramatic sighs.
+EMOTION CONSTRAINTS:
+- Strongly prefer these expression labels: neutral, calm, content, peaceful, serene, grateful, affectionate, sympathetic, confident, contemplative.
+- Avoid high-energy expression labels: excited, amazed, surprised, angry, panicked, triumphant, elated, scared.
+- NEVER use unprofessional or incongruent expression labels: flirtatious, sarcastic, ironic, disgusted, or joking/comedic.
+PROSODY CONSTRAINTS:
+- Do NOT use the "fast" or "loud" prosody markers. Only "slow" is permitted for reading back numbers, dates, or codes.
+- Use "soft" sparingly and only for genuinely gentle moments.
+PAUSE CONSTRAINTS:
+- Keep break durations brief (250ms to 500ms, e.g. <expr type="break" label="300ms"/>). Never exceed 1s to prevent avatar visual freezing.
 `.trim(),
```

#### 4. Verification & Testing
* Conduct a test run with playful user inputs (e.g. "I have 5 million dollars in debt!").
* Verify Ailana responds calmly without high-energy pitch surges or frantic speed changes.
* Confirm that LemonSlice avatar facial movements stay controlled, subtle, and natural.
* Check startup logs — there should be **no** `"expressive is enabled but the tts instructions template does not contain the markup guide placeholder"` warning.

---

### DONE ✅ Step E3 — Voice Pacing & Opening Clause Flush Rule (Latency Reduction)

#### 1. Current Problem
In LiveKit Expressive Mode, the sentence tokenizer emits the **first** chunk at just 20 characters (`EXPRESSIVE_FIRST_CHUNK_LEN = 20`) and subsequent chunks at 200 characters (`EXPRESSIVE_BATCH_LEN = 200`), with a hard cap of 400 characters (`MAX_INPUT_LEN: { cartesia: 400 }`). However, the tokenizer still waits for a **complete sentence delimiter** (`.`, `?`, `!`) before emitting. If Ailana starts a response with a long, unpunctuated 30–40 word compound clause, the first 20-char threshold is useless — synthesis is delayed until a delimiter is found. Because LemonSlice then requires ~500ms for neural video rendering, this compounds into noticeable avatar response lag.

#### 2. Technical Solution
Add an **Opening Clause Pacing Rule** to Layer 1 Static Instructions in [`backend/src/prompts/ailana-system.ts`](file:///c:/Users/Sherry/Documents/Convergent_AI/backend/src/prompts/ailana-system.ts). This instructs Gemma 4 31B to always deliver a short initial sentence of 6 to 12 words ending with a **PERIOD** (never a comma) before elaborating. Because LiveKit's `SentenceTokenizer` only triggers chunk emissions on terminal delimiters (`.`, `?`, `!`), ending the opening clause with a period guarantees that the tokenizer emits the first chunk at ~30 characters, starting Cartesia synthesis and LemonSlice video rendering immediately while Gemma streams the remainder of the response.

#### 3. Exact Code Change
In [`backend/src/prompts/ailana-system.ts`](file:///c:/Users/Sherry/Documents/Convergent_AI/backend/src/prompts/ailana-system.ts#L29):
```diff
 RESPONSE LENGTH PHILOSOPHY (v7.0):
+- OPENING CLAUSE PACING: Always begin responses with a short, complete opening sentence of 6 to 12 words ending with a PERIOD before elaborating (e.g., "That sounds like a solid plan. Looking at your numbers..." instead of "Looking at the overall financial numbers that you have provided so far today..."). Never join the opening beat with a comma, as synthesis requires a terminal sentence delimiter (period) to begin streaming immediately while the rest of your answer generates.
 - Simple factual or yes/no clarifications: 1–3 sentences.
 - Discovery questions (collecting borrower data): 2–4 sentences — ask, acknowledge, and pause.
```

#### 4. Verification & Testing
* Monitor turn latency logs generated by [`backend/src/metrics/latency-tracker.ts`](file:///c:/Users/Sherry/Documents/Convergent_AI/backend/src/metrics/latency-tracker.ts).
* Check the `TTS TTFB (LLM First Token → Audio First Byte)` metric.
* Verify that TTFB drops by **50ms–100ms**, resulting in earlier LemonSlice video frame arrival.

---

# PART B: NON-ESSENTIAL & DEFERRED UPDATES (Phase 2 — Optional / Future)

These items provide secondary defensive hardening, theoretical micro-optimizations, or depend on future platform capabilities.

---

### Step D1 — Hardened Multi-Pass Markup Stripping for Frontend Transcripts

#### 1. Classification & Rationale
* **Status:** **NON-ESSENTIAL / DEFERRED**
* **Why:** The existing regex in [agent.ts](file:///c:/Users/Sherry/Documents/Convergent_AI/backend/src/agent.ts#L1801):
  ```typescript
  const msgText = item.textContent.replace(/<[^>]*>/g, '').replace(/<[^>]*$/, '').replace(/\s+/g, ' ').trim();
  ```
  already strips 99% of XML tags. Unless active production logs show raw `<emotion>` tags appearing in borrower chat bubbles, touching this is low priority.

#### 2. Technical Specification (When Implemented)
If edge-case leaks (e.g., multiline tags or custom brackets) are observed during stress testing, upgrade to a robust multi-pass sanitizer:
```typescript
function sanitizeExpressiveTranscript(raw: string): string {
  return raw
    .replace(/<[^>]*>/gs, '')          // Strip all tags including multiline ('s' flag)
    .replace(/<[^>]*$/g, '')           // Strip trailing partial unclosed tags
    .replace(/\[\/?(?:sound|break)[^\]]*\]/gi, '') // Strip bracketed tags
    .replace(/\s+/g, ' ')
    .trim();
}
```

---

### Step D2 — Stage-Aware Dynamic Expressive Profiles

#### 1. Classification & Rationale
* **Status:** **NON-ESSENTIAL / OVER-ENGINEERING**
* **Why:** Ailana's static mortgage advisor delivery prompt ("warm and composed, slight pauses when discussing numbers, calm and reassuring for debt disclosures") already fits all stages. Dynamic prompt rewriting adds state synchronization overhead with minimal perceptible acoustic benefit.

#### 2. Technical Specification (When Implemented)
If distinct vocal personalities are required in the future:
1. Define stage-specific delivery fragments in a new utility `src/utils/expressive-profiles.ts`.
2. Hook into `updateSessionInstructions` inside [`session-context-manager.ts`](file:///c:/Users/Sherry/Documents/Convergent_AI/backend/src/context/session-context-manager.ts) on stage transitions.

---

### Step D3 — Long-Term Architectural Migration: LiveKit Inference Native LemonSlice

#### 1. Classification & Rationale
* **Status:** **MAJOR ARCHITECTURAL MILESTONE (Platform Dependent)**
* **Why:** Currently, LemonSlice operates via `@livekit/agents-plugin-lemonslice` as an independent WebRTC participant that consumes audio via `DataStreamAudioOutput`. LiveKit's media server has no native playout clock synchronization for the avatar's video track.
* Enabling `interruption: { mode: 'adaptive' }` today causes "ghost speech" (the avatar continues talking from its internal 1–2 second buffer after the backend stops speaking).

#### 2. Upgrade Trigger
When LiveKit releases native Inference support for LemonSlice with audio-video stream synchronizers:
1. Remove `@livekit/agents-plugin-lemonslice` and migrate to native inference provider configuration.
2. In [`backend/src/agent.ts`](file:///c:/Users/Sherry/Documents/Convergent_AI/backend/src/agent.ts#L1360-L1363) and [line 1419](file:///c:/Users/Sherry/Documents/Convergent_AI/backend/src/agent.ts#L1419):
   ```typescript
   interruption: {
     mode: 'adaptive' as const,
     discardAudioIfUninterruptible: false,
   }
   ```
3. In [`backend/src/agent.ts`](file:///c:/Users/Sherry/Documents/Convergent_AI/backend/src/agent.ts#L1371):
   ```typescript
   preemptiveGeneration: {
     enabled: true,
   }
   ```
* **Expected Result:** Instant avatar speech cut-off when the borrower speaks, creating full bidirectional conversational naturalness.

---

# Execution Checklist for Part A

- [x] DONE ✅ **Step E1**: Add `speechSteering: { disfluencies: false, nonverbalSounds: false }` to `expressiveConfig` in `agent.ts`.
- [x] DONE ✅ **Step E2**: Expand `ttsInstructionsAppend` with emotion label preferences and prosody restrictions in `agent.ts`. Do NOT override `ttsInstructionsTemplate`.
- [x] DONE ✅ **Step E3**: Add opening clause pacing instruction to `RESPONSE LENGTH PHILOSOPHY` in `ailana-system.ts`.
- [x] DONE ✅ **Verification**: Run backend and check for zero LiveKit template warnings. Observe audio metrics in `latency-tracker.ts`.

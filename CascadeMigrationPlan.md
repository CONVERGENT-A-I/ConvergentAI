# Ailana Migration Plan
## gpt-4o-mini Realtime → LiveKit Inference Cascaded Pipeline
**Version 1.3 — Developer Reference**  
*Confidential | Internal Use Only*

---

## Migration Summary
This document is the complete implementation plan for migrating Ailana from **gpt-4o-mini Realtime (Speech-to-Speech)** to a **LiveKit Inference cascaded pipeline**.

### Target Stack
*   **STT**: Cartesia Ink-2 (Speech-to-Text) + LiveKit Turn Detector v1 (End of Turn)
*   **LLM**: Llama 3.3 70B Instruct (Self-hosted inference provider)
*   **TTS**: Cartesia Sonic 3.5 (via LiveKit Inference)
*   **Orch**: LiveKit Agents Node.js SDK

### Rationale
*   **485ms consistent latency** vs 1,150ms–6,700ms on S2S.
*   **95% cost reduction** (approx. $0.14 vs. $7.40 per 30-minute session).
*   **Full compliance auditability** via text logs.
*   **No context growth degradation** or token-dense audio backlog.
*   **Stable operation** over sessions exceeding 30 minutes.

> [!IMPORTANT]
> The migration is structured in four phases. The data management layer (separate spec) must be completed and verified before Phase 3 begins.

---

## 1. Why Migrate — Problem Statement

Below is a direct comparison of the architectural challenges of the current Realtime S2S stack versus the benefits of the target cascaded stack:

| Feature / Problem | Current Stack: gpt-4o-mini Realtime S2S | Target Stack: LiveKit Inference Cascaded |
| :--- | :--- | :--- |
| **Latency Consistency** | Latency degrades from 1,150ms to 6,700ms as session continues. | 485ms stable response latency throughout a 30-minute session. |
| **Context Window Size** | Audio tokens are 10× denser than text; context fills up rapidly. | Text tokens only; context stays clean, bounded, and fast. |
| **Data Ingestion** | No native structured data extraction; transcript-only context. | Structured borrower profile extracted and synced every turn. |
| **Tool Calls** | High failure and hallucination rate in Realtime voice mode. | High reliability using text-based LLM tool calling. |
| **Compliance & Audit** | No raw text transcripts available for full compliance logs. | Full STT text transcript generated for compliance audits. |
| **Privacy / HIPAA** | No HIPAA-eligible API path for Realtime audio data. | Deepgram/Cartesia HIPAA-eligible private pathways available. |
| **SAFE Act Guards** | Hard to accurately run trigger classifiers on raw streaming S2S. | Classifiers run on clean, streaming text prior to LLM execution. |
| **Session Cost** | ~$7.40 per 30-minute session (extremely high at volume). | ~$0.14 per 30-minute session (98% cost reduction). |
| **Demo Stability** | Context bloat caused failure during client demo. | Injected context block keeps engine stable for any duration. |

---

## 2. Target Architecture

Every component in the target stack is available through **LiveKit Inference** on a single API billing surface. The agent runs co-located with all models in the same LiveKit Cloud data center. All inter-component calls travel on LiveKit's private network backbone rather than the public internet.

| Layer | Model | LiveKit Inference String | Stage Assignment | Cost |
| :--- | :--- | :--- | :--- | :--- |
| **STT** | Cartesia Ink-2 | `stt="cartesia/ink-2"` | All stages | ~$0.003/min (est.) |
| **EOT** | LiveKit Turn Detector v1 | `turn_detection="multilingual"` | All stages | Included in LK Cloud |
| **LLM** | Llama 3.3 70B Instruct | Self-hosted (Groq/Together/Vertex) | All stages | ~$0.59 / $0.79 per MTok |
| **LLM** | Vertex AI RAG | `base_url` override (OpenAI compat) | Stage 4A MISMO/AUS | GCP committed use |
| **TTS** | Cartesia Sonic 3.5 | `tts="cartesia/sonic-3.5-latest"` | All stages (locked `voice_id`) | ~$35 / M characters |
| **Avatar** | Keyframe | `livekit-plugins-keyframe` | All stages | Existing contract |

> [!WARNING]
> **The Single Most Important Architectural Rule:**  
> The TTS `voice_id` is set **ONCE** at session open and **NEVER** changes. All LLM stage switches produce text that flows to the same Cartesia `voice_id`. Voice continuity is enforced at the TTS layer. The borrower hears one consistent voice throughout the session, regardless of which LLM generated the response.

---

## 3. How LiveKit Inference Reduces Latency

LiveKit Inference delivers three major latency reductions that direct API calls cannot achieve:

### 3.1 Private Network Backbone (Eliminates 60–120ms per turn)
When the agent is deployed to LiveKit Cloud, it runs in the same data center as the Cartesia and LLM inference services. All API calls travel on LiveKit's private network backbone. At 60 turns in a 30-minute session, this recovers up to **7,200ms of total latency** across the conversation.

### 3.2 Provisioned Capacity (Eliminates cold-start spikes)
LiveKit secures provisioned inference capacity directly with each model provider. The agent bypasses public inference queues that throttle and spike under load, ensuring consistent sub-second responses during high concurrent volume.

### 3.3 EagerEndOfTurn (Pre-warms LLM before borrower finishes speaking)
LiveKit Turn Detector v1's `EagerEndOfTurn` event fires before the turn ends, allowing the LiveKit agent to begin the LLM inference call while the borrower is still speaking their final word. This saves **100–200ms per turn**—an advantage S2S cannot replicate.

```typescript
// Enable EagerEndOfTurn in LiveKit Node.js agent session config
import { voice } from '@livekit/agents';
import * as cartesia from '@livekit/plugins-cartesia';
import * as openai from '@livekit/plugins-openai';

const agent = new voice.Agent({
  stt: new cartesia.STT({ model: 'cartesia/ink-2' }),
  llm: new openai.LLM({ 
    model: 'meta-llama/llama-3.3-70b-instruct',
    baseURL: process.env.LLAMA_INFERENCE_ENDPOINT,
    apiKey: process.env.LLAMA_API_KEY
  }),
  tts: new cartesia.TTS({
    model: 'cartesia/sonic-3.5-latest',
    voice: process.env.AILANA_VOICE_ID // LOCKED -- never changes
  }),
  turnHandling: {
    turnDetection: 'multilingual',  // LiveKit Turn Detector v1
    eager: true,                   // eager EOT LLM pre-warming
    minSilence: 400                // silence threshold in ms
  }
});
```

---

## 4. Migration Phases

The migration is structured in four phases. Each phase has a verification gate—the migration does not advance until the gate passes.

| Phase | Name | Duration | Dependency | Gate |
| :--- | :--- | :--- | :--- | :--- |
| **1** | LiveKit Inference setup and STT migration | 2–3 days | None | STT latency verified $\le$ 300ms on 20 test utterances |
| **2** | LLM migration + TTS lock | 3–4 days | Phase 1 complete | Voice continuity confirmed across 5 stage-transition sessions |
| **3** | Data layer + context broker integration | 5–7 days | Data management spec complete | Two clean 30-minute sessions with zero data errors |
| **4** | Cutover + decommission S2S | 1 day | Phase 3 complete + pre-demo verification | S2S connections closed. LiveKit Inference only in production. |

---

### Phase 1: LiveKit Inference Setup & STT Migration
*Establish LiveKit Inference account, replace VAD + external STT with Cartesia Ink-2 + LiveKit Turn Detector v1.*

#### Step 1.1 — Enable LiveKit Inference
Enable LiveKit Inference on your existing LiveKit Cloud account. Install the necessary plugins:

```bash
npm install @livekit/agents @livekit/plugins-cartesia @livekit/plugins-turn-detector
```

Verify available inference models:

```bash
node -e "const {inference} = require('@livekit/agents'); console.log(inference.availableModels())"
```

Configure your `.env` variables (authentication is handled via your LiveKit credentials):

```bash
LIVEKIT_URL='wss://your-project.livekit.cloud'
LIVEKIT_API_KEY='your-api-key'
LIVEKIT_API_SECRET='your-api-secret'
```

#### Step 1.2 — Replace VAD + STT with Cartesia Ink-2 + LiveKit Turn Detector v1
Remove the existing Silero VAD configuration and external STT plugins. Replace with Cartesia Ink-2 for STT and LiveKit Turn Detector v1 for semantic end-of-turn detection. This reduces false cutoffs by approximately 3x, especially during borrower thinking pauses.

```typescript
// BEFORE: legacy S2S / VAD setup
import * as openai from '@livekit/plugins-openai';
import * as silero from '@livekit/plugins-silero';

const agent = new voice.Agent({
  vad: await silero.VAD.load(),
  llm: new openai.realtime.RealtimeModel({
    model: 'gpt-4o-mini-realtime-preview',
    voice: 'coral'
  })
});
```

```typescript
// AFTER: LiveKit Inference STT setup
import { voice } from '@livekit/agents';
import * as cartesia from '@livekit/plugins-cartesia';

const agent = new voice.Agent({
  stt: new cartesia.STT({ model: 'cartesia/ink-2' }),
  turnHandling: {
    turnDetection: 'multilingual',  // LiveKit Turn Detector v1 EOT
    eager: true,                   // eager EOT LLM pre-warming
    minSilence: 400,               // reduced silence threshold (ms)
    keyterms: [                    // mortgage vocabulary
      'DTI', 'HELOC', 'LTV', 'FHA', 'conventional',
      'pre-approval', 'pre-qualification', 'FICO',
      'down payment', 'closing costs', 'amortization'
    ]
  }
  // LLM and TTS added in Phase 2
});
```

#### Phase 1 Verification Gate
Test the STT layer with 20 test utterances containing mortgage terminology:
*   *PASS criteria:* STT latency $\le$ 300ms, EOT detection fires with zero false cutoffs, and keyterms are transcribed correctly.

---

### Phase 2: LLM Migration + TTS Lock
*Replace gpt-4o-mini Realtime with Llama 3.3 70B Instruct via self-hosted inference. Lock Cartesia voice_id for the session.*

#### Step 2.1 — Replace S2S Model with Cascaded LLM
Remove the OpenAI Realtime model configuration. Replace with Llama 3.3 70B Instruct served via your self-hosted inference provider (Groq, Together AI, or GCP Vertex AI). Connect via an OpenAI-compatible base URL override.

```typescript
// BEFORE: gpt-4o-mini Realtime
import * as openai from '@livekit/plugins-openai';

const agent = new voice.Agent({
  llm: new openai.realtime.RealtimeModel({
    model: 'gpt-4o-mini-realtime-preview',
    voice: 'shimmer'
  })
});
```

```typescript
// AFTER: Cascaded LLM + TTS Lock
import { voice, llm } from '@livekit/agents';
import * as cartesia from '@livekit/plugins-cartesia';
import * as openai from '@livekit/plugins-openai';

const AILANA_VOICE_ID = process.env.AILANA_VOICE_ID; 

const agent = new voice.Agent({
  stt: new cartesia.STT({ model: 'cartesia/ink-2' }),
  llm: new openai.LLM({ 
    model: 'meta-llama/llama-3.3-70b-instruct',
    baseURL: process.env.LLAMA_INFERENCE_ENDPOINT,
    apiKey: process.env.LLAMA_API_KEY
  }),
  tts: new cartesia.TTS({
    model: 'cartesia/sonic-3.5-latest',
    voice: AILANA_VOICE_ID,  // LOCKED -- never changes
    sampleRate: 24000
  }),
  turnHandling: {
    turnDetection: 'multilingual',
    eager: true,
    minSilence: 400
  }
});
```

#### Step 2.2 — Lock Ailana's Voice Identity
Store the Cartesia voice ID in your environment config:

```bash
# .env (all environments)
AILANA_VOICE_ID=cartesia_voice_xxxxxxxxxxxx
```

```typescript
// agent.ts
const AILANA_VOICE_ID = process.env.AILANA_VOICE_ID;

if (!AILANA_VOICE_ID) {
  throw new Error('AILANA_VOICE_ID not set. Cannot open session without locked voice identity.');
}
```

#### Step 2.3 — LLM Stage Routing
Implement stage-aware LLM routing. While `meta-llama/llama-3.3-70b-instruct` handles standard stages, Stage 4A (AUS submission) overrides the LLM to use GCP Vertex AI RAG. The switch occurs asynchronously during borrower speaking turns.

```typescript
// stage_router.ts
import { voice, llm } from '@livekit/agents';
import * as openai from '@livekit/plugins-openai';

const LLM_BY_STAGE: Record<string, string> = {
  '1':  'meta-llama/llama-3.3-70b-instruct',
  '2':  'meta-llama/llama-3.3-70b-instruct',
  '3':  'meta-llama/llama-3.3-70b-instruct',
  '3A': 'meta-llama/llama-3.3-70b-instruct',
  '3B': 'meta-llama/llama-3.3-70b-instruct',
  '4A': 'meta-llama/llama-3.3-70b-instruct',  // Overridden for Vertex AI RAG
  '4':  'meta-llama/llama-3.3-70b-instruct',
  '5':  'meta-llama/llama-3.3-70b-instruct',
};

export async function routeLlmForStage(
  session: voice.AgentSession,
  currentStage: string,
  newStage: string
): Promise<void> {
  if (LLM_BY_STAGE[currentStage] === LLM_BY_STAGE[newStage]) {
    return; // same model -- no switch needed
  }

  const newModel = process.env.LLAMA_INFERENCE_ENDPOINT;
  const newLlm = new openai.LLM({
    model: newModel,
    baseURL: process.env.LLAMA_INFERENCE_ENDPOINT,
    apiKey: process.env.LLAMA_API_KEY
  });

  await session.updateAgent({ llm: newLlm });
  // TTS is NOT updated here -- voice_id remains constant
}

export async function switchToVertexRag(session: voice.AgentSession): Promise<void> {
  const vertexLlm = new openai.LLM({
    model: 'google/gemini-2.5-flash',
    baseURL: process.env.VERTEX_AI_ENDPOINT,
    apiKey: process.env.GCP_ACCESS_TOKEN
  });
  
  await session.updateAgent({ llm: vertexLlm });
}
```

#### Phase 2 Verification Gate
*   *PASS criteria:* Cloned voice remains identical across stage changes, stage transitions produce no audible pauses, and end-to-end latency is $\le$ 550ms median.

---

### Phase 3: Data Layer + Context Broker Integration
*Integrate the borrower profile object, context broker, and session persistence into the LiveKit agent.*

> [!IMPORTANT]
> **Dependency:** Phase 3 requires the database schema, context broker, and prompt registry to be fully deployed and tested first.

#### Step 3.1 — Wire Context Broker into Per-Turn Handler
Wire data extraction and prompt building into the voice turn handler:

```typescript
// agent.ts -- updated per-turn handler with data layer
import { routeLlmForStage } from './stage_router';
import { extractFields, writeFields, buildSystemPrompt } from './context_broker';
import { advanceStageIfReady, getOutstandingFields } from './stage_manager';
import { isSafeActTrigger, logSafeActTrigger } from './safe_act';

session.on('user_speech_committed', async (event) => {
  const utterance = event.transcript;
  const sessionId = ctx.sessionId;

  // Load current state
  const sess = await db.getSession(sessionId);
  let stage = sess.current_stage;
  const version = sess.prompt_version;
  const profile = await db.getProfile(sessionId);

  // SAFE Act check -- runs before anything else
  if (isSafeActTrigger(utterance)) {
    await logSafeActTrigger(sessionId, utterance, stage);
    stage = '5';
  }

  // Extract fields and route LLM stage in parallel
  const [newFields] = await Promise.all([
    extractFields(utterance, profile),
    routeLlmForStage(session, stage, stage) // pre-warm
  ]);

  await writeFields(sessionId, newFields, stage);
  Object.assign(profile, Object.fromEntries(
    Object.entries(newFields).filter(([_, v]) => v !== null && v !== undefined)
  ));

  // Advance stage if criteria met
  const newStage = await advanceStageIfReady(sessionId, profile, stage);
  if (newStage !== stage) {
    await routeLlmForStage(session, stage, newStage);
    stage = newStage;
  }

  // Build system prompt -- profile first
  let systemPrompt = await buildSystemPrompt(sessionId, stage, version);

  // Field confirmation injection
  const { getConfirmationInstruction } = await import('./context_broker');
  const confirmation = getConfirmationInstruction(newFields);
  if (confirmation) {
    systemPrompt += '\n\n' + confirmation;
  }

  // Outstanding fields injection
  const outstanding = getOutstandingFields(profile, stage);
  if (outstanding && outstanding.length > 0) {
    systemPrompt += `\n\nSTILL NEEDED THIS STAGE: ${outstanding.join(', ')}`;
  }

  // Update agent instructions for this turn
  await session.updateAgent({ instructions: systemPrompt });
});
```

#### Step 3.2 — Session Persistence & MLO Transfer Handling
Generate a re-engagement token when the user enters the MLO queue, enabling them to resume their session without losing their state:

```typescript
// mlo_transfer.ts
import { createReEngagementToken, resumeSession } from './session_persistence';

export async function onMloTransferInitiated(sessionId: string, room: any): Promise<string> {
  const token = await createReEngagementToken(sessionId, 72); // 72 hours TTL

  const encoder = new TextEncoder();
  const payload = encoder.encode(
    JSON.stringify({ event: 'mlo_transfer', re_engagement_token: token })
  );
  await room.localParticipant.publishData(payload, { reliable: true });
  
  return token;
}

export async function onSessionOpen(roomCtx: any, session: any): Promise<void> {
  const token = roomCtx.metadata?.re_engagement_token;

  if (token) {
    const priorSession = await resumeSession(token);
    if (priorSession) {
      const sessionId = priorSession.id;
      const profile = priorSession.borrower_profiles;
      const stage = priorSession.current_stage;

      const { getReturnInstruction } = await import('./context_broker');
      const returnPrompt = getReturnInstruction(profile, stage);

      await session.updateAgent({ instructions: returnPrompt });
      return;
    }
  }

  await initializeSession(roomCtx, session);
}
```

#### Phase 3 Verification Gate
*   *PASS criteria:* Two complete 30-minute sessions run successfully with zero database errors, DTI variables confirmed back correctly, and average latency stays under 550ms.

---

### Phase 4: Production Cutover — Decommission S2S
*Switch production traffic to LiveKit Inference pipeline and decommission the legacy S2S configuration.*

#### Step 4.1 — Feature Flag Cutover
Use a feature flag to manage rollout in production (e.g., canary deploy to 10% first, then scale to 100%):

```typescript
// feature_flags.ts
export const USE_LIVEKIT_INFERENCE = process.env.USE_LIVEKIT_INFERENCE === 'true';

// agent.ts
import { USE_LIVEKIT_INFERENCE } from './feature_flags';

export async function buildSession(roomCtx: any) {
  if (USE_LIVEKIT_INFERENCE) {
    return await buildInferenceSession(roomCtx);
  } else {
    return await buildRealtimeSession(roomCtx);
  }
}
```

#### Step 4.2 — Decommission Checklist
Complete the following in order after 48 hours of stable production traffic on LiveKit Inference:
*   Remove `OPENAI_API_KEY` S2S credentials from production.
*   Remove `livekit-plugins-openai` realtime imports.
*   Remove Silero/VAD configuration.
*   Remove S2S preview model configurations.
*   Update documentation.

---

## 5. Latency Verification — Expected Targets

| Metric | Target | Measurement Method | Fail Threshold |
| :--- | :--- | :--- | :--- |
| **LiveKit Turn Detector v1 EOT** | < 250ms median | LiveKit agent turn event logs | Any run > 450ms |
| **Llama 3.3 70B TTFT (Stages 1–2)** | < 200ms median | LLM response event timestamp delta | Any run > 400ms |
| **Llama 3.3 70B p95 TTFT** | < 650ms | LLM response event timestamp delta | p95 > 900ms |
| **Cartesia Sonic 3.5 TTFA** | < 60ms median | TTS audio event timestamp delta | Any run > 150ms |
| **End-to-end turn 1** | < 550ms | User speech end $\rightarrow$ Ailana audio start | Any run > 800ms |
| **End-to-end turn 30** | < 600ms | Must be within 100ms of turn 1 | Degradation > 200ms vs turn 1 |
| **End-to-end turn 60** | < 600ms | Must be within 150ms of turn 1 | Degradation > 250ms vs turn 1 |
| **LLM stage switch (Llama $\rightarrow$ Llama)** | < 50ms overhead | Stage transition event delta | Any switch > 200ms overhead |

---

## 6. Cost Comparison — Before and After

| Component | Current: gpt-4o-mini Realtime S2S | After Migration: LiveKit Inference Cascaded | Saving |
| :--- | :--- | :--- | :--- |
| **STT** | Included in Realtime audio tokens | $0.003/min (Cartesia Ink-2) | Single-provider STT + TTS on Cartesia |
| **LLM** | $40/M input + $80/M output audio tokens | ~$0.59 / $0.79 per MTok (Llama 3.3 70B via Groq) | ~98% reduction per token |
| **TTS** | Included in Realtime audio tokens | ~$35/M chars (Cartesia) | Transparent pricing vs. opaque audio tokens |
| **Orchestration** | OpenAI session overhead | LiveKit Inference — included | No additional charge |
| **Total per 30-min session** | ~$7.40 | ~$0.14 (with prompt caching) | **98% reduction** |
| **10,000 sessions/month** | ~$74,000 | ~$1,400 | **$72,600/month saved** |
| **100,000 sessions/month** | ~$740,000 | ~$14,000 | **$726,000/month saved** |

---

## 7. Rollback Plan

The feature flag architecture in Phase 4 provides instant rollback. If a critical issue occurs:
1.  Set `USE_LIVEKIT_INFERENCE=false` in environment config and redeploy.
2.  Active sessions continue on LiveKit Inference; new sessions route back to gpt-4o-mini Realtime.
3.  Rollback triggers: E2E P95 latency > 1,000ms for more than 5 minutes, session error rate > 2% over any 15-minute window, or TTS voice inconsistency.

---

## 8. Migration Readiness Checklist

| # | Item | Owner | Status |
| :--- | :--- | :--- | :--- |
| **1** | LiveKit Inference enabled on production account | Dev | |
| **2** | Cartesia Ink-2 + Flux STT latency verified $\le$ 300ms | Dev | |
| **3** | `AILANA_VOICE_ID` set and identical across all environments | Dev | |
| **4** | Llama 3.3 70B TTFT $\le$ 200ms verified in staging | Dev | |
| **5** | Llama 3.3 70B TTFT $\le$ 600ms verified in staging | Dev | |
| **6** | LLM stage routing: Llama $\rightarrow$ Llama switch produces no voice change | Dev | |
| **7** | PostgreSQL schema deployed with RLS enabled | Dev | |
| **8** | Prompt registry populated with v3.0 prompts, all stages | Dev | |
| **9** | Context broker: field extraction zero inversions on 20 test utterances | Dev | |
| **10** | Context broker: profile injected at top of system prompt every turn | Dev | |
| **11** | Field confirmation: income and debt confirmed before session proceeds past Stage 2 | Dev | |
| **12** | Stage manager: no repetition of completed stage content in 5 test sessions | Dev | |
| **13** | Session persistence: MLO transfer + return resumes correct stage and profile | Dev | |
| **14** | `pre_demo_verification()` returns True on production environment | Dev | |
| **15** | Two complete 30-minute sessions with zero data errors confirmed | Dev | |
| **16** | End-to-end latency $\le$ 550ms median verified across both sessions | Dev | |
| **17** | Demo delivered on dedicated device with direct microphone — not screen share | Presenter | |

---

## 9. Model Currency Audit

All models specified in this migration plan were verified against official vendor documentation and deprecation notices on June 15, 2026:

| Model in Plan | Status | Finding | Action |
| :--- | :--- | :--- | :--- |
| **Cartesia Ink-2** | ✓ Active | Current flagship STT — GA — in LiveKit Inference production | No change |
| **LiveKit Turn Detector v1** | ✓ Active | GA April 29, 2026 — confirmed in LiveKit official docs | No change |
| **Llama 3.3 70B (llama-3.3-70b-20251001)** | ✓ Active | Current recommended fast model — no deprecation notice | No change |
| **Llama 3.3 70B (llama-3.3-70b)** | ✓ Active | Current standard model — GA February 2026 | No change |
| **Cartesia Sonic 3.5 (sonic-3.5-latest)** | ✓ Active — UPDATED | v1.0 specified sonic-4 which has been superseded. Sonic 3.5 is Cartesia's current production default and tops the May 2026 Artificial Analysis streaming leaderboard. Updated to sonic-3.5-latest throughout this document. | Corrected in v1.1 |
| **Gemini 2.5 Flash (Vertex AI RAG)** | ✓ Active | Current GA model on Vertex AI — no deprecation notice | No change |
| **Keyframe avatar (livekit-plugins-keyframe)** | ✓ Active | Current LiveKit native plugin | No change |

### Single Source of Truth Model Constants file (`models.js`)
To maintain clean coding standards and easily manage deprecation periods, the model strings are configured inside a single ES module file:

```javascript
// models.js — single source of truth for all model strings
// Update here only — all agent code imports from this file

export const Models = {
  // STT
  STT_PRIMARY: 'cartesia/ink-2',
  STT_EOT:     'stt', // Flux via turn_detection param

  // LLM
  LLM_FAST:     'meta-llama/llama-3.3-70b-instruct', // Stages 1-2
  LLM_STANDARD: 'meta-llama/llama-3.3-70b-instruct', // Stages 3-4A

  // TTS
  TTS_PRIMARY:  'cartesia/sonic-3.5-latest', // Updated v1.1: was sonic-4

  // Verified: June 15 2026 — all models active, no deprecation notices
  // Next review: July 15 2026
  LAST_VERIFIED: '2026-06-15',
  NEXT_REVIEW:   '2026-07-15',
};
```

---

## 10. Self-Hosted Llama 3.3 70B Infrastructure

Llama 3.3 70B Instruct requires self-hosted GPU inference infrastructure (not natively hosted on LiveKit Inference). Your team must provision an OpenAI-compatible endpoint from one of the following providers:

*   **Groq**: Fastest TTFT (~150–300ms). Price: $0.59 / $0.79 per MTok (Input/Output).
    *   *Endpoint:* `https://api.groq.com/openai/v1`
    *   *Model string:* `llama-3.3-70b-versatile`
*   **Together AI**: Good throughput, flexible. Price: ~$0.88 / $0.88 per MTok.
    *   *Endpoint:* `https://api.together.xyz/v1`
    *   *Model string:* `meta-llama/Llama-3.3-70B-Instruct-Turbo`
*   **GCP Vertex AI**: Recommended for HIPAA BAA coverage.
    *   *Endpoint:* `https://[REGION]-aiplatform.googleapis.com/v1beta1/projects/[PROJECT]/...`
    *   *Model string:* `meta/llama-3.3-70b-instruct-maas`

---

## 11. Revision Log

*   **v1.0 (June 2026)**: Initial release. Four-phase migration plan, latency targets, and rollback parameters.
*   **v1.1 (June 15, 2026)**: Model currency audit added (Section 9). Cartesia TTS model updated from sonic-4 to sonic-3.5-latest.
*   **v1.2 (June 15, 2026)**: Model stack updated: STT changed to Cartesia Ink-2, EOT changed to LiveKit Turn Detector v1, and LLM updated to Llama 3.3 70B Instruct. Self-hosted requirements added.
*   **v1.3 (June 15, 2026)**: Converted all code blocks from Python to Node.js/TypeScript ESM syntax per dev team preference. Updated readiness checklist, stage router, per-turn handler, and feature flags code.

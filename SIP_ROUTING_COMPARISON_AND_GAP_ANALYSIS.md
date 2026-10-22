# Blueprint & Gap Analysis: Porting Intelligent Routing & SIP Trunking from Lab to Dev
**Target: Integrating Lab v7.5.20 Telephony & Loan Officer Routing into Dev**
*Reference Baseline: Production Lab Environment via `be.env_github` (v7.5.19/v7.5.20)*
*Scope: Strictly SIP Trunking, Dynamic Routing, Availability Checks, Staff Alerting, Human Answer Detection & Fallback Recovery*

---

## 1. Objective & Architectural Direction

The goal of this analysis is **bringing the Intelligent Routing and SIP Trunking architecture from Lab (`convergentai-lab`) into the Dev workspace (`/`)**, focusing **strictly on Loan Officer (MLO) telephony, handoff, and recovery**.

### Current Dev Baseline vs. Target Lab Architecture

```
CURRENT DEV BASELINE (Basic / Static Dialing):
  [Borrower says "Connect to Loan Officer"]
             │
             ▼
  [Dev agent.ts calls sipTransfer.ts]
             │
             ▼
  Dials static SIP_CALL_TO (9400) via LiveKit Outbound Trunk
             │
             ├── Customer mic immediately unmuted (ringing audio leaks into STT)
             ├── De-subscribes all tracks (corrupts AgentSession audio context)
             ├── FreeSWITCH answers with hold music ──► UI falsely shows "Connected"
             └── If queue fails/times out ───────────► Call drops; customer left stranded

TARGET LAB ARCHITECTURE (Intelligent, Verified Telephony Routing):
  [Borrower says "Connect to Loan Officer" OR clicks CTA]
             │
             ▼
  1. Geographic Queue Resolution:
     ZIP code ──► FSPBX PostgreSQL (`routing.zip_state` ➔ `routing.state_queue`) ──► State Queue (7001–7050)
             │
             ▼
  2. FreeSWITCH ESL Pre-Flight Availability Check:
     Reconciles PBX tiers (`queue reload`, `tier del`) ──► Checks Sofia registration + Status (Available) + State (Waiting)
     * If 0 agents available: Throws NO_AGENT_AVAILABLE before dialing any phone *
             │
             ▼
  3. Pre-Dial Dual-Channel Staff Alerting:
     Ringotel REST API (Mobile Push) + FreeSWITCH mod_sms (SIP MESSAGE to deskphones)
             │
             ▼
  4. Outbound SIP Call via LiveKit Trunk:
     Sanitizes Caller ID (fixes K8s float rendering) ──► Dials resolved queue ──► Customer mic held MUTED while ringing
     * Customer mic track remains subscribed in agent to prevent audio context corruption *
             │
             ▼
  5. True Human-Answer Detection:
     LiveKit reports SIP active (hold music playing) ──► FreeSWITCH ESL polls `callcenter_config agent get state`
     * When agent state = 'in a queue call': Avatar closed, SYSTEM_MLO_AGENT_CONNECTED sent, Mic unmuted *
             │
             ▼
  6. Failure Teardown & Calendar Recovery:
     If no agent answers (timeout): SIP leg cleanly hung up (`hangupMloParticipant`)
     Agent wakes up (`SYSTEM_MLO_UNSUPPORTED`) ──► Offers conversational Google Calendar callback booking
```

---

## 2. Complete Environment Variables Specification (including `be.env_github`)

The file [`be.env_github`](file:///c:/Users/Sherry/Documents/Convergent_AI/be.env_github) serves as the **authoritative production configuration baseline** for ConvergentAI Lab Backend (v7.5.19/v7.5.20).

Below is the **100% complete audit** of all environment variables required for the Intelligent Routing, Telephony, and Loan Officer subsystems when porting to Dev.

### 2.1 Complete Variable Specification Table

| Subsystem | Variable Name | In Dev? | In `be.env_github`? | Production Reference / Default | Operational Purpose in Telephony & Routing |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **Worker Concurrency** | `MAX_CONCURRENT_CALLS` | ❌ In Bridge only | ✅ YES | `25` | Caps concurrent LiveKit agent jobs to prevent worker starvation during high call volume. |
| **Voice Guards** | `INTERRUPTION_MIN_DURATION_MS` | ❌ **MISSING** | ✅ YES | `900` | Minimum customer speech duration required to interrupt Ailana. Prevents transfer announcements from cutting out due to background noise. |
| **Voice Guards** | `PREEMPTIVE_MAX_SPEECH_MS` | ❌ **MISSING** | ✅ YES | `8000` | Maximum speech window for preemptive responses; keeps turn-taking stable during handoff. |
| **Session State** | `AILANA_ENABLE_SESSION_ROTATION` | ❌ **MISSING** | ✅ YES | `"false"` | Disables session rotation to preserve borrower context and prevent state reset during MLO handoff and recovery. |
| **LiveKit SIP** | `LIVEKIT_URL` | ✅ In Dev | ✅ YES | `wss://...` | WebSocket URL for the LiveKit Cloud project. |
| **LiveKit SIP** | `LIVEKIT_API_KEY` | ✅ In Dev | ✅ YES | *(Secret)* | LiveKit API Key (stored in K8s Secret). |
| **LiveKit SIP** | `LIVEKIT_API_SECRET` | ✅ In Dev | ✅ YES | *(Secret)* | LiveKit API Secret (stored in K8s Secret). |
| **LiveKit SIP** | `SIP_TRUNK_SID` | ✅ In Dev | ✅ YES | `ST_...` | Outbound SIP Trunk ID created in LiveKit pointing to FreeSWITCH. |
| **LiveKit SIP** | `SIP_FROM_NUMBER` | ✅ In Dev | ✅ YES | `1100` | Caller ID presented when dialing the PBX. Lab normalizes unquoted YAML integers from K8s floats (`1.42e+10`). |
| **LiveKit SIP** | `SIP_RINGING_TIMEOUT_SECONDS` | ✅ In Dev | ✅ YES | `60` | Max seconds to wait for PBX setup and ringing before aborting (bounded 5–80s). |
| **LiveKit SIP** | `LIVEKIT_TOKEN_TTL` | ❌ In Bridge only | ✅ In code | `10m` | Validity period for client join tokens issued by `POST /api/get-token`. |
| **FreeSWITCH ESL** | `FS_ESL_HOST` | ❌ **MISSING** | ✅ YES | `192.168.10.10` / `104.196.66.172` | Private/public IP of FreeSWITCH server reachable by backend over TCP. |
| **FreeSWITCH ESL** | `FS_ESL_PORT` | ❌ **MISSING** | ✅ YES | `8021` | FreeSWITCH Event Socket Library TCP port. |
| **FreeSWITCH ESL** | `FS_ESL_PASSWORD` | ❌ **MISSING** | ✅ YES | *(Secret)* | ESL socket authentication password. |
| **FreeSWITCH ESL** | `FS_DOMAIN` | ❌ **MISSING** | ✅ YES | `fspbx.convergentai.tech` | FreeSWITCH SIP realm/domain for extension mapping. |
| **FreeSWITCH ESL** | `FS_SIP_PROFILE` | ❌ **MISSING** | ✅ YES | `internal` | Sofia SIP profile through which native SIP `MESSAGE` events are relayed. |
| **FreeSWITCH ESL** | `FS_MESSAGE_FROM` | ❌ **MISSING** | ✅ YES | `1100` | Local PBX extension that appears as sender for SIP text alerts. |
| **FreeSWITCH ESL** | `FS_ESL_TIMEOUT_MS` | ❌ **MISSING** | ✅ YES | `3000` | Socket read timeout for ESL command replies (bounded 500–10000ms). |
| **FreeSWITCH ESL** | `FS_ESL_CACHE_TTL_MS` | ❌ **MISSING** | ✅ YES | `2000` | In-memory cache TTL for availability checks to prevent socket flooding. |
| **FSPBX PostgreSQL** | `FSPBX_DB_HOST` | ❌ **MISSING** | ✅ YES | `192.168.10.10` / `104.196.66.172` | Host of FusionPBX database containing `routing.*` and queue tables. |
| **FSPBX PostgreSQL** | `FSPBX_DB_PORT` | ❌ **MISSING** | ✅ YES | `5432` | PostgreSQL port for FusionPBX database. |
| **FSPBX PostgreSQL** | `FSPBX_DB_NAME` | ❌ **MISSING** | ✅ YES | `fusionpbx` | Database name on FusionPBX host. |
| **FSPBX PostgreSQL** | `FSPBX_DB_USER` | ❌ **MISSING** | ✅ YES | `fusionpbx` | Database user for FusionPBX queries. |
| **FSPBX PostgreSQL** | `FSPBX_DB_PASSWORD` | ❌ **MISSING** | ✅ YES | *(Secret)* | Database password for FusionPBX. |
| **Telephony Sync** | `MLO_AGENT_ANSWER_TIMEOUT_SECONDS` | ❌ **MISSING** | ✅ YES | `20` | Max seconds to wait for a human officer answer before declaring queue timeout. |
| **Telephony Sync** | `MLO_AGENT_ANSWER_POLL_MS` | ❌ **MISSING** | ✅ YES | `350` | Polling frequency for mod_callcenter agent state over ESL. |
| **Telephony Sync** | `MLO_AVAILABILITY_SETTLE_MS` | ❌ **MISSING** | ✅ YES | `350` | Settle delay between the two consecutive availability checks. |
| **Telephony Sync** | `MLO_RECOVERY_UI_DELAY_MS` | ❌ **MISSING** | ✅ YES | `200` | Delay before starting voice scheduling to allow UI state transition. |
| **Staff Alerting** | `RINGOTEL_API_URL` | ❌ **MISSING** | ✅ YES | `https://shell.ringotel.co/api` | REST API endpoint for Ringotel mobile push alerts. |
| **Staff Alerting** | `RINGOTEL_AUTH_TOKEN` | ❌ **MISSING** | ✅ YES | *(Secret)* | Bearer authorization token for Ringotel Shell API. |
| **Staff Alerting** | `RINGOTEL_ORG_ID` | ❌ **MISSING** | ✅ YES | *(Stored in be.env_github)* | Organization UUID within Ringotel. |
| **Staff Alerting** | `RINGOTEL_MESSAGE_FROM` | ❌ **MISSING** | ✅ YES | `1100` | Extension/source displayed on Ringotel alerts. |
| **Staff Alerting** | `RINGOTEL_DELAY_MS` | ❌ **MISSING** | ✅ YES | `0` | Pre-dial alert pause (`0` = dial immediately while alerts run async). |
| **Staff Alerting** | `RINGOTEL_ALERT_MSG` | ❌ **MISSING** | ✅ YES | *(Template)* | `CTA Activity, prepare for a potential handoff from Ailana from Customer zip: {zipCode} ({state})` |
| **Staff Alerting** | `RINGOTEL_TRANSFER_ALERT_MSG`| ❌ **MISSING** | ✅ In code | *(Template)* | Transfer alert template sent to officers at dial time. |
| **Staff Alerting** | `RINGOTEL_MANUAL_ZIP_ALERT_MSG`| ❌ **MISSING** | ✅ In code | *(Template)* | Alert template sent when customer manually corrects their ZIP. |
| **Calendar Recovery** | `GOOGLE_SERVICE_ACCOUNT_JSON` | ❌ **MISSING** | ✅ In K8s Secret | *(Complete JSON)* | Service account credentials with Google Calendar & Gmail scopes (Secret `cta-google-calendar`). |
| **Calendar Recovery** | `BOOKING_TOKEN_SECRET` | ❌ **MISSING** | ✅ In K8s Secret | *(>= 24 char secret)* | Secret for HMAC-SHA256 signing of 15-minute booking tokens (Secret `cta-google-calendar`). |
| **Calendar Recovery** | `GOOGLE_IMPERSONATE_USER` | ❌ **MISSING** | ✅ YES | `info@convergentai.tech` | Workspace user to impersonate for Calendar and Gmail API scopes. |
| **Calendar Recovery** | `GOOGLE_MEETING_HOST_EMAIL` | ❌ **MISSING** | ✅ YES | `david@convergentai.tech` | Loan officer attendee/host email on calendar invitations. |
| **Calendar Recovery** | `GOOGLE_CALENDAR_ID` | ❌ **MISSING** | ✅ YES | *(Stored in be.env_github)* | Calendar ID where appointments are booked. |
| **Calendar Recovery** | `GOOGLE_CALENDAR_TIMEZONE` | ❌ **MISSING** | ✅ YES | `America/Los_Angeles` | Timezone for business hours calculations. |
| **Calendar Recovery** | `GOOGLE_CALENDAR_ROUTING_JSON` | ❌ **MISSING** | ✅ In code | *(Optional JSON)* | Maps queue extension or state code to dedicated calendar IDs & officer details. |
| **Calendar Recovery** | `GOOGLE_BUSINESS_START` | ❌ **MISSING** | ✅ YES | `09:00` | Start of business day for meeting slots. |
| **Calendar Recovery** | `GOOGLE_BUSINESS_END` | ❌ **MISSING** | ✅ YES | `17:00` | End of business day for meeting slots. |
| **Calendar Recovery** | `GOOGLE_MEETING_DURATION_MINUTES`| ❌ **MISSING** | ✅ YES | `30` | Duration of callback appointments. |
| **Calendar Recovery** | `GOOGLE_SLOT_INTERVAL_MINUTES` | ❌ **MISSING** | ✅ YES | `30` | Time increment between slots. |
| **Calendar Recovery** | `GOOGLE_MINIMUM_NOTICE_MINUTES` | ❌ **MISSING** | ✅ YES | `120` | Minimum lead time before first bookable slot (2 hours). |
| **Calendar Recovery** | `GOOGLE_CREATE_MEET_LINK` | ❌ **MISSING** | ✅ YES | `true` | Automatically creates a Google Meet video conference link. |
| **Calendar Recovery** | `GOOGLE_BOOKING_NOTIFICATION_EMAIL`| ❌ **MISSING** | ✅ YES | `david@convergentai.tech` | Internal staff email for new booking alerts. |
| **Calendar Recovery** | `GOOGLE_BOOKING_NOTIFICATION_FROM` | ❌ **MISSING** | ✅ YES | `info@convergentai.tech` | From address for staff booking notifications. |

---

### 2.2 Ready-to-Copy Configuration Block for Dev

Add this block directly into [`backend/.env`](file:///c:/Users/Sherry/Documents/Convergent_AI/backend/.env) (with production references from `be.env_github`):

```dotenv
# =============================================================================
# WORKER CONCURRENCY & VOICE GUARDS (from be.env_github)
# =============================================================================
MAX_CONCURRENT_CALLS=25
INTERRUPTION_MIN_DURATION_MS=900
PREEMPTIVE_MAX_SPEECH_MS=8000
AILANA_ENABLE_SESSION_ROTATION="false"

# =============================================================================
# LIVEKIT SIP SETTINGS
# =============================================================================
SIP_TRUNK_SID="ST_npTLofLWHnhd"
SIP_FROM_NUMBER=1100
SIP_RINGING_TIMEOUT_SECONDS=60
LIVEKIT_TOKEN_TTL="10m"

# =============================================================================
# FREESWITCH EVENT SOCKET (ESL) CONFIGURATION (from be.env_github)
# =============================================================================
FS_ESL_HOST="192.168.10.10"
FS_ESL_PORT="8021"
FS_ESL_PASSWORD="<FS_ESL_PASSWORD_FROM_LOCAL_ENV>"
FS_MESSAGE_FROM="1100"
FS_SIP_PROFILE="internal"
FS_DOMAIN="fspbx.convergentai.tech"
FS_ESL_TIMEOUT_MS="3000"
FS_ESL_CACHE_TTL_MS="2000"

# =============================================================================
# FSPBX POSTGRESQL (ROUTING & QUEUE TIERS) (from be.env_github)
# =============================================================================
FSPBX_DB_HOST="192.168.10.10"
FSPBX_DB_PORT="5432"
FSPBX_DB_NAME="fusionpbx"
FSPBX_DB_USER="fusionpbx"
FSPBX_DB_PASSWORD="<FSPBX_DB_PASSWORD_FROM_LOCAL_ENV>"

# =============================================================================
# TELEPHONY TIMING & ANSWER DETECTION (from be.env_github)
# =============================================================================
MLO_AGENT_ANSWER_TIMEOUT_SECONDS="20"
MLO_AVAILABILITY_SETTLE_MS="350"
MLO_AGENT_ANSWER_POLL_MS="350"
MLO_RECOVERY_UI_DELAY_MS="200"

# =============================================================================
# STAFF ALERTING (RINGOTEL & SIP MESSAGE) (from be.env_github)
# =============================================================================
RINGOTEL_DELAY_MS="0"
RINGOTEL_MESSAGE_FROM="1100"
RINGOTEL_ALERT_MSG="CTA Activity, prepare for a potential handoff from Ailana from Customer zip: {zipCode} ({state})"
RINGOTEL_API_URL="https://shell.ringotel.co/api"
RINGOTEL_AUTH_TOKEN="<RINGOTEL_AUTH_TOKEN_FROM_LOCAL_ENV>"
RINGOTEL_ORG_ID="<RINGOTEL_ORG_ID_FROM_LOCAL_ENV>"

# =============================================================================
# GOOGLE CALENDAR & CONVERSATIONAL SCHEDULING (from be.env_github)
# =============================================================================
GOOGLE_IMPERSONATE_USER="info@convergentai.tech"
GOOGLE_MEETING_HOST_EMAIL="david@convergentai.tech"
GOOGLE_CALENDAR_ID="<GOOGLE_CALENDAR_ID_FROM_LOCAL_ENV>"
GOOGLE_CALENDAR_TIMEZONE="America/Los_Angeles"
GOOGLE_BUSINESS_START="09:00"
GOOGLE_BUSINESS_END="17:00"
GOOGLE_MEETING_DURATION_MINUTES="30"
GOOGLE_SLOT_INTERVAL_MINUTES="30"
GOOGLE_MINIMUM_NOTICE_MINUTES="120"
GOOGLE_CREATE_MEET_LINK="true"
GOOGLE_BOOKING_NOTIFICATION_EMAIL="david@convergentai.tech"
GOOGLE_BOOKING_NOTIFICATION_FROM="info@convergentai.tech"

# In K8s deployments, these two are pulled from Secret `cta-google-calendar`:
# GOOGLE_SERVICE_ACCOUNT_JSON='{...}'
# BOOKING_TOKEN_SECRET='...'
```

---

## 3. Inventory of Files & Modules to Bring from Lab to Dev

### 3.1 New Files to Copy from Lab to Dev (Strictly Routing & Telephony)

| Source in Lab | Destination in Dev | Purpose in Loan Officer Flow |
| :--- | :--- | :--- |
| `convergentai-lab/backend/src/lib/zipResolver.ts` | `backend/src/lib/zipResolver.ts` | Authoritative ZIP-to-Queue resolution (`routing.zip_state` ➔ `routing.state_queue`). |
| `convergentai-lab/backend/src/lib/mlo-transfer-intent.ts` | `backend/src/lib/mlo-transfer-intent.ts` | Regex & voice intent recognition; normalizes spoken numbers ("tree four oh two five"). |
| `convergentai-lab/backend/src/services/freeswitch-esl.ts` | `backend/src/services/freeswitch-esl.ts` | FreeSWITCH ESL socket client: checks agent availability, Sofia registrations, and human answer. |
| `convergentai-lab/backend/src/utils/fsMessage.ts` | `backend/src/utils/fsMessage.ts` | Dispatches SIP `MESSAGE` to desk phones via FreeSWITCH `mod_sms`. |
| `convergentai-lab/backend/src/utils/security.ts` | `backend/src/utils/security.ts` | Secret redaction in logs, request rate-limiting, and error sanitization. |
| `convergentai-lab/backend/src/routes/loan-officer.ts` | `backend/src/routes/loan-officer.ts` | Express routes for IP ZIP detection (`/api/detect-zip`), early alerts (`/api/early-alert`), and call control. |
| `convergentai-lab/backend/src/routes/scheduling.ts` | `backend/src/routes/scheduling.ts` | Express routes for queue availability (`/api/mlo-availability`) and calendar booking. |
| `convergentai-lab/backend/src/services/google-calendar.ts` | `backend/src/services/google-calendar.ts` | Google Calendar API service: queries open slots and verifies HMAC booking tokens. |
| `convergentai-lab/backend/src/services/conversational-scheduling.ts` | `backend/src/services/conversational-scheduling.ts` | Voice booking engine activated when queue fails or is unavailable. |
| `convergentai-lab/backend/src/services/booking-notification.ts` | `backend/src/services/booking-notification.ts` | Gmail API integration for booking invitations and notifications. |
| `convergentai-lab/backend/src/lib/contact-input.ts` | `backend/src/lib/contact-input.ts` | Voice parsers for spoken email addresses ("john at gmail dot com") and phone numbers. |
| `convergentai-lab/src/components/floating-cta/google-calendar-scheduler.tsx` | `src/components/floating-cta/google-calendar-scheduler.tsx` | Interactive UI modal for picking dates/slots and confirming callback appointments. |
| `convergentai-lab/src/components/floating-cta/mlo-failure-listener.tsx` | `src/components/floating-cta/mlo-failure-listener.tsx` | DataChannel listener for `SYSTEM_MLO_UNSUPPORTED` that un-mutes mic for voice recovery. |
| `convergentai-lab/prisma/migrations/20260830113000_add_scheduler_appointments/` | `prisma/migrations/20260830113000_add_scheduler_appointments/` | Database migration for `appointments` table. |
| `convergentai-lab/prisma/migrations/20260830123000_add_booking_notification_audit/` | `prisma/migrations/20260830123000_add_booking_notification_audit/` | Database migration for appointment notification audit fields. |
| `convergentai-lab/scripts/verify-v742-routing.cjs` | `scripts/verify-v742-routing.cjs` | Automated test: verifies queue reload, tier cleanup, Sofia registrations, and early alert mapping. |
| `convergentai-lab/scripts/verify-v744-scheduling.cjs` | `scripts/verify-v744-scheduling.cjs` | Automated test: verifies calendar date picker, host email invite, and customer notes persistence. |
| `convergentai-lab/scripts/verify-v745-mlo-audio-isolation.cjs` | `scripts/verify-v745-mlo-audio-isolation.cjs` | Automated test: verifies immediate AI freeze, `isHibernating`, and answer-gated browser mic. |
| `convergentai-lab/scripts/verify-v746-booking-notification.cjs` | `scripts/verify-v746-booking-notification.cjs` | Automated test: verifies Gmail API scopes, impersonated sender, and notification audit fields. |
| `convergentai-lab/scripts/verify-v747-conversational-scheduling.cjs` | `scripts/verify-v747-conversational-scheduling.cjs` | Automated test: verifies calendar voice tools, ESL human answer states, and mic recovery. |
| `convergentai-lab/scripts/fspbx-update-queue-wait-60s.sql` | `scripts/fspbx-update-queue-wait-60s.sql` | SQL utility: sets 60s timeout across all 51 FusionPBX `communitymtg_mlo_*` queues. |
| `convergentai-lab/backend/src/__tests__/mlo-transfer-intent.test.ts` | `backend/src/__tests__/mlo-transfer-intent.test.ts` | Unit test suite: asserts intent parsing, spoken digit normalization, and contextual confirmations. |
| `convergentai-lab/backend/src/__tests__/contact-input.test.ts` | `backend/src/__tests__/contact-input.test.ts` | Unit test suite: asserts spoken phone digits extraction and voice buffer accumulation. |
| `convergentai-lab/backend/src/__tests__/security-hardening.test.ts` | `backend/src/__tests__/security-hardening.test.ts` | Unit test suite: asserts token/secret log redaction, telemetry sanitization, and rate limiting. |
| `convergentai-lab/backend/scripts/verify-v749.mjs` through `verify-v7520.mjs` | `backend/scripts/verify-v749.mjs`... | Static regression suite: asserts turn priority, ESL settle times, parallel emails, and scheduling guards. |

---

### 3.2 Existing Files in Dev That Must Be Modified / Replaced

#### 1. [`backend/src/utils/sipTransfer.ts`](file:///c:/Users/Sherry/Documents/Convergent_AI/backend/src/utils/sipTransfer.ts)
- **Replace completely with Lab's 349-line implementation**:
  - Adds `normalizedSipFromNumber()` to sanitize Kubernetes scientific float numbers.
  - Adds `resolveQueueForZip(zip)`: dynamically dials the state queue extension (`7001`–`7050`) instead of static `SIP_CALL_TO`.
  - Adds Ringotel push alerts (`sendRingotelAlert`) and FreeSWITCH SIP text alerts (`sendSipMessage`).
  - Adds `waitUntilAnswered: true` and `ringingTimeout: effectiveRingingTimeout`.
  - Adds `hangupMloParticipant(roomName, identity)` and `deleteMloRoom(roomName)` using LiveKit `RoomServiceClient`.

#### 2. [`backend/src/agent.ts`](file:///c:/Users/Sherry/Documents/Convergent_AI/backend/src/agent.ts)
- **Update MLO Transfer & Recovery Flow**:
  - Import `resolveQueueForZip`, `getStableQueueAvailability`, `waitForQueueAgentAnswer`, `hangupMloParticipant`, and `deleteMloRoom`.
  - Enforce pre-dial availability: throw `NO_AGENT_AVAILABLE` if all officers are offline.
  - **Fix Media Context Corruption**: Preserve customer microphone track (`if (p.identity.startsWith('guest_')) continue;`) instead of unsubscribing all tracks.
  - Wait for verified human answer: call `waitForQueueAgentAnswer(queue.queueExtension)` before considering the handoff complete.
  - On human answer: emit `SYSTEM_MLO_AGENT_CONNECTED` over DataChannel, close avatar video session, and unmute customer mic.
  - On timeout or error: catch `NO_AGENT_AVAILABLE` / `QUEUE_AGENT_TIMEOUT`, call `hangupMloParticipant`, emit `SYSTEM_MLO_UNSUPPORTED`, and invoke `startConversationalScheduling`.
  - **Caller Disconnection Teardown**: In `RoomEvent.ParticipantDisconnected`, when the customer leaves, immediately hang up `activeSipIdentity` via `hangupMloParticipant` and delete the room via `deleteMloRoom` so PBX phones do not continue ringing.
  - **Location Sync**: In `RoomEvent.ChatMessage`, handle `SYSTEM_LOCATION_ZIP` to synchronize detected/manual ZIP into profile without interrupting Ailana.
  - Add voice tools: `findMeetingTimes`, `confirmMeeting`, and `cancelMeetingScheduling`.


#### 3. [`backend/src/index.ts`](file:///c:/Users/Sherry/Documents/Convergent_AI/backend/src/index.ts)
- Mount the new routers and service status health check:
  ```typescript
  import loanOfficerRoutes from './routes/loan-officer.js';
  import schedulingRoutes from './routes/scheduling.js';
  import { isEslConfigured } from './services/freeswitch-esl.js';
  import { isGoogleCalendarConfigured } from './services/google-calendar.js';
  
  app.use('/api', loanOfficerRoutes);
  app.use('/api', schedulingRoutes);

  // Reports live status of all telephony & routing dependencies
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        livekit: !!process.env.LIVEKIT_API_KEY,
        fspbx: !!process.env.FSPBX_DB_HOST,
        ringotel: Boolean(process.env.RINGOTEL_API_URL && process.env.RINGOTEL_AUTH_TOKEN && process.env.RINGOTEL_ORG_ID),
        freeswitchEsl: isEslConfigured(),
        googleCalendar: isGoogleCalendarConfigured(),
      },
    });
  });
  ```

#### 4. [`backend/package.json`](file:///c:/Users/Sherry/Documents/Convergent_AI/backend/package.json)
- Add required dependencies:
  - `"pg": "^8.11.3"`
  - `"@types/pg": "^8.11.6"`
  - `"googleapis": "^171.4.0"`

#### 5. [`src/components/floating-cta/media-guard.tsx`](file:///c:/Users/Sherry/Documents/Convergent_AI/src/components/floating-cta/media-guard.tsx)
- Replace loan officer microphone logic to be **answer-gated**:
  ```typescript
  } else if (mode === "loan-officer") {
    // Keep mic MUTED while dialing; unmute only when loanOfficerConnected = true
    await lp.setMicrophoneEnabled(loanOfficerConnected);
    await lp.setCameraEnabled(false);
  }
  ```
  Add override: `if (conversationalScheduling) await lp.setMicrophoneEnabled(true);`.

#### 6. [`src/components/floating-cta/mlo-detector.tsx`](file:///c:/Users/Sherry/Documents/Convergent_AI/src/components/floating-cta/mlo-detector.tsx)
- Replace with Lab's dual-gated listener:
  - Listen for `SYSTEM_MLO_AGENT_CONNECTED` over DataChannel.
  - Only fire `onMloStatusChange(true, label)` when **both** the SIP participant has `sip.callStatus === "active"` **AND** the backend ESL confirmation has been received.

#### 7. [`src/components/floating-cta/channel-start-trigger.tsx`](file:///c:/Users/Sherry/Documents/Convergent_AI/src/components/floating-cta/channel-start-trigger.tsx)
- Add `zip` prop (`zip?: string | null`).
- Synchronize customer ZIP to Ailana on connect: emit `SYSTEM_LOCATION_ZIP` over DataChannel.
- Pass `zip` in `SYSTEM_TRANSFER_MLO` payload:
  ```typescript
  const transferPayload = encoder.encode(
    JSON.stringify({ message: `SYSTEM_TRANSFER_MLO`, zip: zip || undefined })
  );
  ```
- **Preserve Dev Session Restore**: Retain Dev's existing `restoreSnapshot`, `onRestoreSent`, and `SYSTEM_RESTORE_STATE` logic when adding the `zip` propagation.

#### 8. [`src/components/floating-cta/index.tsx`](file:///c:/Users/Sherry/Documents/Convergent_AI/src/components/floating-cta/index.tsx)
- Add `loanOfficerZip` state (`const [loanOfficerZip, setLoanOfficerZip] = useState<string>("")`).
- Implement `handleMloFailure(reason: string)`:
  - On scheduling recovery (`no_agent_available`, `queue_timeout`, `transfer_failed`), sets `conversationalScheduling(true)`, sets `pendingMode("video")`, resets confirmation modals, and sets status notice.
- Mount `<MloFailureListener onFailure={handleMloFailure} />`.
- Mount `<GoogleCalendarScheduler />` modal with `zipCode={loanOfficerZip}`.
- Pass `loanOfficerConnected={mloParticipantJoined}` and `conversationalScheduling={conversationalScheduling}` into `<MediaGuard />`.
- Add IP geolocation (`/api/detect-zip`) on mount and dual pre-call staff alerts (`/api/early-alert`) on session start or manual ZIP change.

#### 9. [`src/components/floating-cta/loan-officer-queue.tsx`](file:///c:/Users/Sherry/Documents/Convergent_AI/src/components/floating-cta/loan-officer-queue.tsx)
- Synchronize with Lab's queue header parser:
  - Add `parseLoanOfficerQueueDisplay(value)` to parse PBX queue strings (e.g. `communitymtg_mlo_california (7005)` ➔ `"Community MTG California"`, Queue: `7005`).
  - Upgrade `LoanOfficerLiveUI` to render formatted queue title, subtitle ("Licensed Mortgage Loan Officer Queue"), and queue extension number instead of raw unparsed SIP strings.

#### 10. [`backend/src/prompts/stage5-escalation.ts`](file:///c:/Users/Sherry/Documents/Convergent_AI/backend/src/prompts/stage5-escalation.ts)
- Replace escalation prompt rules with Lab's conversational voice scheduling instructions:
  - Instructs Ailana: *"Scheduling happens entirely in this voice conversation. Never direct the customer to an on-screen calendar or popup."*
  - Defines the strict lifecycle for calling `findMeetingTimes` (max 3 slots offered at once) and `confirmMeeting` (requires explicit spoken consent, reads aloud the returned confirmation number).
  - Explicitly instructs the agent: *"If the borrower chooses a live transfer or asks to talk now, tell them you are checking the licensed queue for their property ZIP. The backend voice-transfer handler will perform the transfer; never tell them to click a button."*

---

## 4. Deep-Dive: The 6 Telephony Subsystems to Port

### Subsystem 1: Geographic Queue Resolution
- **Mechanism**: Reads 5-digit property ZIP. Queries FSPBX database (`routing.zip_state` joined to `routing.state_queue`).
- **Destination**: Returns the state call-center queue extension (e.g., `7042` for Tennessee, `7005` for California).
- **Rule**: Non-US or unmapped ZIPs throw `UNSUPPORTED_AREA`. There is intentionally **no static fallback queue** so unmapped ZIPs never violate state mortgage licensing laws.

### Subsystem 2: FreeSWITCH ESL Pre-Flight Availability Check
- **Mechanism**: Connects to FreeSWITCH over TCP port 8021 using credentials `FS_ESL_PASSWORD`.
- **Sanitization**: Runs `callcenter_config queue reload` and deletes stale runtime tiers (`tier del`) absent from PostgreSQL.
- **Verification**: For every queue member, checks Sofia SIP registration (`sofia_contact <ext>@<domain>`), agent status (`Available`), and agent state (`Waiting`/`Idle`).
- **Gate**: Takes two consecutive samples over settle window `MLO_AVAILABILITY_SETTLE_MS` (350ms). If `availableCount === 0`, it throws `NO_AGENT_AVAILABLE` before dialing.

### Subsystem 3: Multi-Channel Staff Alerting
- **Channel A (Mobile Push)**: Calls Ringotel Shell API (`POST /api/message`) with queue/ZIP details. Uses 2-step session creation with cached session renewal.
- **Channel B (Deskphone SIP MESSAGE)**: Dispatches FreeSWITCH `mod_sms` event `SMS::SEND_MESSAGE` over ESL. FreeSWITCH relays native SIP `MESSAGE` packets directly to registered hardware desk phones and softphones (Linphone/Ringotel).
- **Timing**: Alerts run asynchronously during dial or within bounded pre-dial budget `RINGOTEL_DELAY_MS`. Alert failures never block the telephone call.

### Subsystem 4: LiveKit Outbound SIP Call & Audio Guard
- **Caller ID Normalization**: Fixes Kubernetes scientific float rendering (`1.4238931776e+10` ➔ `14238931776`), preventing FusionPBX 403 Forbidden.
- **Dialing**: Calls LiveKit `sipClient.createSipParticipant(SIP_TRUNK_SID, queueExtension, roomName, { ... })`.
- **Customer Mic Guard**: Browser microphone is kept **MUTED** during dialing so PBX ringing and customer speech do not feed back into the closing AI STT pipeline.
- **WebRTC Stream Preservation**: Unsubscribes avatar and SIP legs, but **preserves the customer microphone subscription** (`guest_`) to prevent LiveKit `AgentSession` audio context destruction.

### Subsystem 5: True Human-Answer Detection (ESL Polling)
- **The Problem**: When LiveKit dials FreeSWITCH, the queue answers immediately (`200 OK`) to play hold music. In Dev, this causes a false positive where the UI says "Connected to Loan Officer" while the caller is listening to music.
- **The Solution**: In Lab, the backend polls mod_callcenter state via ESL (`callcenter_config agent get state <agent>`) every 350ms.
- **The Trigger**: Only when an officer transitions to `in a queue call`, `in queue call`, or `busy`:
  1. Closes avatar video session (`activeAvatarSession.aclose()`).
  2. Emits `SYSTEM_MLO_AGENT_CONNECTED` over DataChannel.
  3. Frontend un-mutes customer microphone.
  4. Frontend switches UI from queue hold animation to `LoanOfficerLiveUI` with duration timer.

### Subsystem 6: Hangup Teardown & Calendar Callback Recovery
- **Active Teardown**: If customer clicks "End Call" while ringing, backend invokes `hangupMloParticipant(roomName, identity)`, immediately stopping officer phones from ringing.
- **Recovery Pipeline**: If queue times out (`MLO_AGENT_ANSWER_TIMEOUT_SECONDS`) or no officers are available:
  1. Backend drops SIP leg and emits `SYSTEM_MLO_UNSUPPORTED` with reason.
  2. Frontend `mlo-failure-listener.tsx` immediately re-enables the customer's microphone.
  3. Ailana wakes up (`isHibernating = false`), claims scheduling ownership, delivers a deterministic notice ("No loan officers are currently available in the [queue]..."), and initiates Google Calendar callback scheduling.
  4. Appointments are confirmed via voice tools (`confirmMeeting`), HMAC booking tokens, Google Meet links, and Gmail notifications.

---

## 5. Infrastructure & External Prerequisites Checklist

Before porting the code, ensure the following infrastructure is configured:

1. **Network Reachability & Firewall**:
   - Backend/Agent server must reach FreeSWITCH ESL over TCP port `8021`.
   - Backend/Agent server must reach FSPBX PostgreSQL over TCP port `5432`.
   - FreeSWITCH must accept SIP over UDP port `7000` from LiveKit Cloud IP ranges.
   - FreeSWITCH RTP media ports (UDP `16384–32768`) must be open to LiveKit Cloud.
2. **FreeSWITCH PBX Configuration**:
   - FusionPBX must advertise its public IP literal in `vars.xml` (`external_rtp_ip` and `external_sip_ip`) to prevent NAT drops.
   - Call center queues (`7001`–`7050`) must be configured with assigned member agents.
   - Sofia profile `internal` must have `mod_sms` loaded for SIP `MESSAGE` relay.
3. **FSPBX PostgreSQL Routing Tables**:
   - `routing.zip_state` (maps 5-digit ZIP to 2-letter state code).
   - `routing.state_queue` (maps state code to `fspbx_extension` and `active` boolean).
   - `routing.loan_officers` and `routing.officer_states`.
4. **Google Workspace API Credentials**:
   - Service Account with Domain-Wide Delegation (stored in Secret `cta-google-calendar`).
   - Scopes enabled: `https://www.googleapis.com/auth/calendar` and `https://www.googleapis.com/auth/gmail.send`.

---

## 6. Phased Migration Roadmap (Lab ➔ Dev)

Execute the integration in the following strict dependency order:

```
[Phase 1: DB & Migrations]
  ├── Apply Prisma migrations for `appointments` and notification audit
  └── Verify FSPBX PostgreSQL `routing.*` tables are queryable from Dev

[Phase 2: Packages & Dependencies]
  └── In `backend/`: `npm install pg googleapis` & `npm install -D @types/pg`

[Phase 3: Core Telephony & Routing Modules]
  ├── Copy `zipResolver.ts`, `freeswitch-esl.ts`, `fsMessage.ts`, `mlo-transfer-intent.ts`, `security.ts`
  ├── Copy `scheduling.ts`, `google-calendar.ts`, `conversational-scheduling.ts`, `booking-notification.ts`, `contact-input.ts`
  ├── Replace `sipTransfer.ts` with Lab implementation
  └── Mount routes (`loan-officer.ts`, `scheduling.ts`) in `backend/src/index.ts`

[Phase 4: Voice Agent Engine & Prompts Update]
  ├── Synchronize `backend/src/prompts/stage5-escalation.ts` with Lab (adds conversational scheduling prompt rules)
  ├── Update `backend/src/agent.ts` with availability checks and selective track preservation
  ├── Add ESL human answer gate (`waitForQueueAgentAnswer`)
  └── Wire conversational scheduling tools (`findMeetingTimes`, `confirmMeeting`)

[Phase 5: Frontend Component Synchronization]
  ├── Copy `mlo-failure-listener.tsx` and `google-calendar-scheduler.tsx` to `src/components/floating-cta/`
  ├── Update `media-guard.tsx` to gate mic on `loanOfficerConnected`
  ├── Update `mlo-detector.tsx` to require `SYSTEM_MLO_AGENT_CONNECTED`
  ├── Update `loan-officer-queue.tsx` with queue label parser (`parseLoanOfficerQueueDisplay`)
  └── Update `channel-start-trigger.tsx` and `index.tsx` for ZIP propagation and calendar recovery

[Phase 6: Secret & Environment Configuration]
  └── Populate FreeSWITCH ESL, FSPBX DB, Ringotel, and Google Calendar secrets in `backend/.env` (using be.env_github values)

[Phase 7: Automated Parity & Regression Verification]
  ├── Copy test suite from Lab to Dev `scripts/` and `backend/scripts/` & `backend/src/__tests__/`
  ├── Run `node scripts/verify-v742-routing.cjs` (verifies queue reload, tier cleanup, Sofia registration)
  ├── Run `node scripts/verify-v744-scheduling.cjs` (verifies date picker, timezone filtering, notes persistence)
  ├── Run `node scripts/verify-v745-mlo-audio-isolation.cjs` (verifies AI freeze, answer-gated mic)
  ├── Run `node scripts/verify-v746-booking-notification.cjs` (verifies Gmail scopes, notification audit)
  ├── Run `node scripts/verify-v747-conversational-scheduling.cjs` (verifies voice tools, ESL human answer gate)
  ├── Run `node --import tsx src/__tests__/mlo-transfer-intent.test.ts` (verifies intent parsing & spoken digit extraction)
  ├── Run `node --import tsx src/__tests__/contact-input.test.ts` (verifies voice contact accumulation)
  ├── Run `node --import tsx src/__tests__/security-hardening.test.ts` (verifies secret masking & rate limiting)
  └── Run backend regression suite: `node scripts/verify-v749.mjs` through `node scripts/verify-v7520.mjs`
```

---

## 7. Conversational Flow Blueprint: Loan Officer Questions vs. Transfer Requests (Lab vs. Dev)

In `convergentai-lab`, the agent makes a strict, mission-critical architectural distinction between **a borrower asking questions about loan officers or mortgage terms** versus **a borrower requesting an actual phone transfer**.

### 7.1 How Dev Currently Handles It (The Flawed Baseline)
- **Aggressive / Unstable Keywords**: Dev uses broad regexes like `LO_KEYWORD_PATTERN` matching `"someone"`, `"real person"`, `"schedule"`, `"book"`, `"yes"`, `"sure"`, `"go ahead"`.
- **Accidental Escalation**: Asking *"What does a loan officer do?"* or *"Can a loan officer help me with my DTI?"* can trigger premature transfer classification or false-positive popup triggers.
- **Forced Popup Friction**: Dev dispatches `SYSTEM_TRIGGER_MLO_TRANSFER`, forcing the borrower to stop talking and click an on-screen modal button before any phone call is made.
- **Audio Context Destruction**: When the transfer fires, Dev calls `pub.setSubscribed(false)` across all tracks, tearing down the borrower's `guest_` microphone track in LiveKit `AgentSession`, resulting in dead silence if the transfer fails.

---

### 7.2 How Lab Handles It (The Production Flow Architecture)

```
                       [Borrower Speaks / Types]
                                   │
                                   ▼
             [AilanaVoiceAgent.onUserTurnCompleted / Chat]
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                             ▼
       [Branch A: Loan Officer Question]   [Branch B: Transfer Request]
       ("What does refer mean?",           ("Connect me to a loan officer",
        "What will an MLO do?",             "I want to speak with someone",
        "What documents do I need?")        or Stage 5 affirmative "Yes please")
                    │                             │
                    ▼                             ▼
       `isLoanOfficerTransferIntent`      `isLoanOfficerTransferIntent` = TRUE
       returns FALSE                      OR `isContextualLoanOfficerTransferConfirmation`
                    │                     (only in Stage 5 escalation context)
                    ▼                             │
       Delegates to Cerebras LLM                  ▼
       Generates full educational          `globalTurnInterceptor` intercepts
       answer (DTI, W-2s, refer, etc.)     Suppresses standard LLM reply
                    │                             │
                    ▼                             ▼
       Stage 5 Prompt Rule:               Evaluates Property ZIP:
       Appends gentle reminder:           - Extracted from spoken audio (`normalizeSpokenZip`)
       "Whenever you're ready, I can      - OR profile ZIP (`SYSTEM_LOCATION_ZIP`)
       connect you with a licensed loan   - If missing: speaks deterministic ZIP prompt
       officer live or schedule a call."          │
                    │                             ▼
                    ▼                     Pre-Flight PBX Availability Check:
       Ailana remains in conversation.    - Queries FreeSWITCH ESL (`getStableQueueAvailability`)
       NO dial, NO popups, NO disruption. - If 0 agents: Throws NO_AGENT_AVAILABLE (Fast-fail)
                                                  │
                                                  ▼
                                          Customer Mic Held MUTED via MediaGuard
                                          Ringotel Mobile Push + SIP MESSAGE dispatched
                                          LiveKit dials state queue (7001–7050)
                                                  │
                                                  ▼
                                          ESL Polls Human Agent State:
                                          `callcenter_config agent get state`
                                                  │
                                  ┌───────────────┴───────────────┐
                                  ▼                               ▼
                     [Agent Answers: 'in a call']     [Queue Times Out / 0 Agents]
                                  │                               │
                                  ▼                               ▼
                     - Closes video avatar           - `hangupMloParticipant` drops SIP
                     - Emits `SYSTEM_MLO_CONNECTED`  - Emits `SYSTEM_MLO_UNSUPPORTED`
                     - Unmutes customer mic          - Unmutes customer mic
                     - Shows `LoanOfficerLiveUI`     - Ailana wakes up & offers Google
                                                       Calendar voice callback booking
```

### 7.3 Detailed Flow Mechanics

#### 1. Strict Intent Separation (`backend/src/lib/mlo-transfer-intent.ts`)
- **Explicit Intent (`isLoanOfficerTransferIntent`)**:
  Requires an **Action verb** (`connect|transfer|forward|speak|talk|call|reach|reconnect|send me`) paired with a **Role term** (`loan officer|licensed representative|human representative|live agent`).
  - `"Please connect me to a licensed loan officer now"` ➔ **TRUE**
  - `"I want to speak with a human representative"` ➔ **TRUE**
  - `"What does a loan officer look at during underwriting?"` ➔ **FALSE** (Question, not action)
  - `"My loan amount is three hundred thousand"` ➔ **FALSE**
- **Contextual Confirmation (`isContextualLoanOfficerTransferConfirmation`)**:
  - Gated strictly by `awaitingLoanOfficerChoice` (`fd1_delivery`, `fd2_delivery`, or `escalation_preference` in Stage 5).
  - Short affirmations like *"Yes please"*, *"Sure"*, *"Connect me now"* are only treated as transfer requests **when Ailana has explicitly asked them if they want a live transfer**.
  - A generic *"yes"* during Stage 1 or Stage 2 prequal never triggers a transfer.

#### 2. Spoken ZIP Recognition, Retries & Cancellation (`normalizeSpokenZip`)
- Normalizes spoken words to digits: `"tree four oh two five"` ➔ `"34025"`, `"nine zero two one zero"` ➔ `"90210"`, `"nine eye one zero three"` ➔ `"98103"`.
- If no 5-digit ZIP is known when transfer is triggered:
  - Phase moves to `awaiting_zip`.
  - **1st Attempt Prompt**: *"I can connect you with a licensed Loan Officer. What is the five-digit ZIP code for the property so I can route you to the correctly licensed team?"*
  - **>= 2nd Attempt Prompt**: *"I still need the five-digit property ZIP code. Please type all five digits in Chat, for example 90001."*
  - **Throttling**: Re-prompting is throttled to an 8,000ms minimum window to avoid interrupting customer speech.
- **Customer Cancellation Trigger**:
  - Regex: `/\b(?:never mind|nevermind|cancel|stop|do not|don't)\b[\s\S]{0,30}\b(?:transfer|connect|call|loan officer|representative)?\b/i`
  - If matched during active transfer pending: sets `voiceMloTransfer.active = false`, resets phase to `idle`, and speaks: *"No problem. We can continue here with Ailana."*

#### 3. Stage 5 Prompt Escalation Rules (`backend/src/prompts/stage5-escalation.ts`)
- **Educational Freedom**:
  - If the borrower asks what *"refer"* means: Ailana explains that automated systems have rigid criteria, but human officers examine compensating factors (steady job history, savings reserves).
  - If the borrower asks about documents: Ailana outlines pay stubs, 2 years W-2s, and bank statements.
  - After answering any question, Ailana appends: *"Whenever you're ready, I can connect you with a licensed loan officer live or schedule a callback for you."*
- **SAFE Act Compliance Gates**:
  - Exact rate lock or binding quotes: *"For an actual rate quote I'll connect you with one of our loan officers — they'll give you an exact number based on your full application. Live transfer now, or schedule a time?"*
  - Pre-approval requests: *"A pre-approval letter comes from our licensed team after a formal review... Let me connect you now. Live transfer or scheduled call?"*

#### 4. Voice Interception & Media Preservation (`backend/src/agent.ts`)
- `agent.globalTurnInterceptor` intercepts speech before the standard mortgage LLM pipeline executes.
- `this.suppressNextReply = true` silences the LLM so it never generates conflicting speech.
- `for (const p of ctx.room.remoteParticipants.values()) if (p.identity.startsWith('guest_')) continue; pub.setSubscribed(false);`
  - **Preserves customer microphone subscription** (`guest_`) to ensure WebRTC audio pipeline never loses its audio context.
- Frontend `media-guard.tsx` keeps the browser microphone **MUTED** while dialing to prevent PBX ringing audio from looping into STT.
- Once ESL detects human answer (`in a queue call`), `media-guard.tsx` automatically **UNMUTES** the microphone.

#### 5. Graceful Fallback to Conversational Calendar Scheduling
- **Deterministic Verbatim Offer Scripts** (delivered directly via `session.say()` so the LLM cannot hallucinate or omit):
  - When `no_agent_available`: `"No Loan Officer is available in the {queueLabel}. Would you like me to schedule a callback?"`
  - When `queue_timeout`: `"No Loan Officer answered the {queueLabel}. Would you like me to schedule a callback?"`
  - When general failure: `"I couldn't complete the connection to the {queueLabel}. Would you like me to schedule a callback?"`
- **Dynamic Prompt Override (`conversationalSchedulingInstructions`)**:
  - Sets `voiceScheduling.active = true`.
  - In `onUserTurnCompleted`, replaces `chatCtx.items` system instruction with `conversationalSchedulingInstructions` (`lk.agent_task.instructions`) and strips out `lk.agent_dynamic_state`.
  - Mortgage prequalification questions (DTI, income, occupancy, goal) are strictly suppressed.
  - **Spoken Turn Constraints**: Every spoken response MUST be 18 words or fewer (except final booking confirmation); ask only one question at a time; never read aloud or spell email/phone; `<expr type="spell">` is banned.
- **Post-Booking Acknowledgement Suppression**:
  - Regex: `/^(?:oh\s+)?(?:yes|yeah|yep|sure|okay|ok|no|nope|thanks|thank\s+you|all\s+set|please)(?:[\s.,!]+(?:yes|yeah|yep|sure|okay|ok|no|nope|thanks|thank\s+you|all\s+set|please))*[\s.,!]*$/i`
  - Once `voiceScheduling.completedAt > 0`, casual acknowledgements ("thanks", "ok", "yes") are prevented from reopening transfers or re-invoking booking tools.
- **Registered Voice Tools**:
  - `findMeetingTimes`: Accepts `requestedDate` (YYYY-MM-DD) and `customerTimeZone` (IANA string). Calls `findConversationalSlots` to check real Google Calendar availability. Never invents availability. Returns at most 3-5 slots.
  - `confirmMeeting`: Accepts `slotOption` (1-5), `customerTimeZone`, `explicitConsent: true`, and optional contact fields. Reuses existing session profile fields (`contact_name`, `borrower_name`, `legal_name`, `contact_email`, `contact_mobile`) and prompts only for missing items. Inserts appointment record into PostgreSQL `appointments` table, books Google Calendar event with Google Meet link, dispatches confirmation emails, and returns the confirmation number which Ailana reads aloud.
  - `cancelMeetingScheduling`: Exits scheduling workflow when customer explicitly declines, resetting `voiceScheduling.active = false` and returning control to Ailana.



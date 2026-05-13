# Loan Officer Transfer — LiveKit ↔ SignalWire SIP Bridge

## Status: PLAN ONLY — DO NOT IMPLEMENT

---

## Infrastructure Status (Already Done)

| Component | Status | Detail |
|---|---|---|
| LiveKit SIP Trunk | ✅ Created | `ST_BG93CdR9QrVm` — SignalWire SWML MLO Queue Trunk |
| SIP URI | ✅ Live | `convergentai-livekit-mlo-queue.dapp.signalwire.com` |
| Caller ID | ✅ Assigned | `+12017404497` |
| SignalWire SWML Script | ✅ Configured | Routes to `sip:2001@fspbx.convergentai.tech:7000` |
| FSPBX FreeSWITCH | ✅ Running | Port 7000 UDP, auth ext 1101, ring group 2001 |
| Ring Group Members | ✅ Set | Extensions 1101, 1102 |
| Transfer Function Code | ✅ Written | In `livekit-signalwire-agent-transfer-handoff.md` (not yet a file) |

**What's missing**: The application-level wiring between the LiveKit room and the SIP trunk through the Loan Officer channel.

---

## Task 1: Environment & Transfer Module (Backend Foundation)

- [ ] Add SIP env vars to `backend/.env`:
  - `SIP_TRUNK_SID=ST_BG93CdR9QrVm`
  - `SIP_CALL_TO=livekit-mlo-queue`
  - `SIP_FROM_NUMBER=+12017404497`
  - `SIP_PARTICIPANT_NAME=MLO Queue`
  - `SIP_WAIT_UNTIL_ANSWERED=true`
  - `SIP_RINGING_TIMEOUT_SECONDS=45`
- [ ] Create `backend/src/transfer.ts` — ESM version of the transfer function from handoff doc
- [ ] Convert CommonJS (`require`) to ESM (`import`) to match `"type": "module"` in backend
- [ ] Import `SipClient` from `livekit-server-sdk` (already installed)
- [ ] Export `transferRoomToMloQueue({ roomName, userIdentity })` function
- [ ] Add error handling: `TwirpError` catch with SIP status code extraction
- [ ] Validate all 6 SIP env vars on module load (fail-fast)

---

## Task 2: Agent System Message Handler (Backend Trigger)

- [ ] Add `SYSTEM_TRANSFER_MLO` handler in `agent.ts` → `handleSystemMessages()`
- [ ] On trigger: import and call `transferRoomToMloQueue()` with current `roomName`
- [ ] Extract user identity from room participants (filter out agent/keyframe)
- [ ] Before transfer: AILANA says "Connecting you to a licensed loan officer now. Please hold."
- [ ] On success: send `SYSTEM_TRANSFER_STARTED` data message back to frontend
- [ ] On failure: AILANA says "I'm unable to reach an officer right now. Let me schedule a callback."
- [ ] On failure: send `SYSTEM_TRANSFER_FAILED` data message to frontend with reason
- [ ] Do NOT disconnect the AI agent from the room — keep it as fallback until MLO answers

---

## Task 3: Frontend — Enable Loan Officer Channel (UI Trigger)

- [ ] Remove `disabled: true` from the Loan Officer mode button in `floating-cta.tsx` mode switcher
- [ ] Remove "Coming Soon" tooltip logic for loan officer button
- [ ] On click: send `SYSTEM_TRANSFER_MLO` data message via `room.localParticipant.publishData()`
- [ ] Show transfer-in-progress UI state (ringing animation, "Connecting to Loan Officer...")
- [ ] Listen for `SYSTEM_TRANSFER_STARTED` → update UI to "Loan Officer Connected"
- [ ] Listen for `SYSTEM_TRANSFER_FAILED` → show fallback options (NeetoCal scheduling, retry)
- [ ] Disable repeated clicks during transfer (debounce/lock)

---

## Task 4: Transfer UX Flow (User Experience)

- [ ] On transfer start: hide Keyframe avatar + disconnect AI agent (pure human-to-human, no AI)
- [ ] Switch UI to minimal call screen: MLO label, call timer, mute, end call, REC indicator
- [ ] Add "Ringing" state (ring group): pulsing phone icon, dialtone audio (`playDialtone: true`)
- [ ] Add "Waiting in Queue" state (call queue): FSPBX answers immediately with hold music → show "You are in the MLO queue" with elapsed wait timer
- [ ] Add client-side max wait timer: 3 minutes — if no MLO picks up, offer fallback options
- [ ] On MLO answer: transition UI to "Loan Officer Connected" badge
- [ ] On MLO hangup/disconnect: detect SIP participant leave → offer "Return to AILANA" or end call
- [ ] Add recording disclosure: "A loan officer is joining. This call continues to be recorded."

---

## Task 5: Agent Verbal Handoff (Conversational Bridge)

- [ ] Update AILANA system prompt: remove "these features are currently turned off" for transfers
- [ ] Add transfer instruction: when user requests transfer → trigger `SYSTEM_TRANSFER_MLO`
- [ ] AILANA pre-transfer script: "I'm connecting you to a licensed mortgage loan officer in your area."
- [ ] AILANA hold script (while ringing): "Please hold for just a moment."
- [ ] AILANA introduction to MLO: "I have [user name] on the line regarding [topic summary]."
- [ ] AILANA post-handoff: go silent unless directly addressed
- [ ] If MLO doesn't answer within timeout (45s): AILANA offers NeetoCal fallback

---

## Task 6: Fallback & Error Handling

- [ ] Ring group scenario — SIP ringing timeout (45s, no answer): offer fallback options
- [ ] Call queue scenario — client-side max wait (3 min, queue answered but no MLO yet): offer fallback options
- [ ] SIP trunk error (network/auth): log error, show "Unable to connect" with retry button
- [ ] FSPBX down: detect via SIP status codes (503/480), offer SMS callback option
- [ ] Offer 3 fallback paths on any failure or timeout:
  - Option A: Retry transfer
  - Option B: Schedule via NeetoCal
  - Option C: Return to AILANA

---

## Task 7: Validation & Testing

- [ ] Test SIP trunk connectivity: call from LiveKit room → SignalWire → FSPBX
- [ ] Verify audio path: user voice reaches MLO phone, MLO voice reaches user browser
- [ ] Verify SIP participant appears in LiveKit room as `mlo-queue-{timestamp}`
- [ ] Test timeout scenario: no MLO answers → verify 45s timeout → fallback triggers
- [ ] Test disconnect: MLO hangs up → verify AI agent resumes
- [ ] Test concurrent: transfer while avatar is speaking → verify clean handoff
- [ ] Verify recording continues through transfer (compliance)
- [ ] Test mobile browser: ensure SIP audio works on iOS Safari / Android Chrome

---

## Dependency Order

```
Task 1 (Env + Module)
  └→ Task 2 (Agent Handler)
       └→ Task 3 (Frontend Trigger)
            └→ Task 4 (Transfer UX)
            └→ Task 5 (Verbal Handoff)
       └→ Task 6 (Fallback Logic)
  └→ Task 7 (Validation — runs after all tasks)
```

---

## Key Reference

- **Trunk ID (Live)**: `ST_BG93CdR9QrVm`
- **SIP URI**: `convergentai-livekit-mlo-queue.dapp.signalwire.com`
- **Caller ID**: `+12017404497`
- **FSPBX Target**: `sip:2001@fspbx.convergentai.tech:7000;transport=udp`
- **FSPBX Auth Ext**: `1101`
- **Queue Members**: `1101, 1102`
- **Full Handoff Spec**: `livekit-signalwire-agent-transfer-handoff.md`

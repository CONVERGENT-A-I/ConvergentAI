# LiveKit to FSPBX SIP Handoff Implementation Plan

This plan details the implementation steps required to bridge a LiveKit room to a human Loan Officer via SignalWire and FSPBX `mod_callcenter`, while placing the AI avatar into hibernation.

## Milestone 1: Environment & Utility Setup
- [x] Add the 6 required `SIP_*` environment variables to `backend/.env`.
- [x] Create `backend/src/utils/sipTransfer.ts` containing the `transferRoomToMloQueue()` logic using `livekit-server-sdk`.
- [x] Ensure the backend can successfully authenticate with the LiveKit API for participant injection.

## Milestone 2: Agent Hibernation State
- [x] Update `backend/src/agent.ts` to listen for `SYSTEM_PAUSE_AGENT` and `SYSTEM_RESUME_AGENT` signals from the frontend.
- [x] Implement pause logic: when paused, the agent must ignore VAD triggers, stop generating replies, and effectively "sleep" without leaving the room.
- [x] Implement resume logic: restore context and reactivate VAD and reply generation.

## Milestone 3: Frontend "Loan Officer" Integration
- [x] Update `floating-cta.tsx`: Remove the "Coming Soon" block and enable the `loan-officer` mode button.
- [x] Build the UI state for the Loan Officer channel (e.g., hiding the avatar, showing a "Dialing..." or "Waiting in Queue" graphic, handling the hold music experience visually).
- [x] When the user selects `loan-officer`, send the `SYSTEM_PAUSE_AGENT` signal via the LiveKit data channel.
- [x] Provide a way to switch back to AI modes, which will send the `SYSTEM_RESUME_AGENT` signal.

## Milestone 4: Triggering the SIP Bridge
- [x] Create a mechanism (either a new Next.js API route or an agent-side handler) to execute the SIP transfer.
- [x] When `loan-officer` mode is activated, trigger `transferRoomToMloQueue()`.
- [x] Monitor the LiveKit room for the new SIP participant joining.

## Milestone 5: Teardown & Lifecycle Management
- [x] Implement teardown logic: if the user leaves the `loan-officer` mode, the backend must find and kick the SIP participant from the LiveKit room.
- [x] Handle edge cases: what happens if the SIP connection fails, or the queue times out? Add error boundaries and fallback states on the frontend to return the user to the AI.

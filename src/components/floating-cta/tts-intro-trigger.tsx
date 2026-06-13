"use client";

import { useEffect, useRef } from "react";
import { useRoomContext, useRemoteParticipants } from "@livekit/components-react";
import { RoomEvent } from "livekit-client";

interface TtsIntroTriggerProps {
  /** True when flowPhase === "live" */
  isLivePhase: boolean;
  /** Current pendingMode */
  mode: string;
  /** Called when the backend sends SYSTEM_INTRO_DONE */
  onIntroDone: () => void;
}

/**
 * TtsIntroTrigger
 *
 * A side-effect-only component (renders null) that:
 * 1. Sends SYSTEM_INTRO_TRIGGER to the agent once mode === "tts-avatar" is live.
 * 2. Listens for the agent's SYSTEM_INTRO_DONE response and calls onIntroDone().
 *
 * Completely isolated — does nothing when mode !== "tts-avatar".
 */
export function TtsIntroTrigger({
  isLivePhase,
  mode,
  onIntroDone,
}: TtsIntroTriggerProps) {
  const room = useRoomContext();
  const participants = useRemoteParticipants();
  const agentReady = participants.length > 0;
  const hasTriggeredRef = useRef(false);

  // ── Send SYSTEM_INTRO_TRIGGER once conditions are met ───────────────────
  useEffect(() => {
    if (
      isLivePhase &&
      room.state === "connected" &&
      agentReady &&
      mode === "tts-avatar" &&
      !hasTriggeredRef.current
    ) {
      hasTriggeredRef.current = true;
      console.log("[tts-intro]: 🚀 Sending SYSTEM_INTRO_TRIGGER...");
      const payload = new TextEncoder().encode(
        JSON.stringify({ message: "SYSTEM_INTRO_TRIGGER" })
      );
      room.localParticipant
        .publishData(payload, { topic: "lk-chat", reliable: true })
        .catch(console.error);
    }

    if (!isLivePhase) {
      hasTriggeredRef.current = false;
    }
  }, [isLivePhase, room.state, agentReady, mode, room.localParticipant]);

  // ── Listen for SYSTEM_INTRO_DONE from backend ────────────────────────────
  useEffect(() => {
    if (room.state !== "connected") return;

    const handleData = (
      payload: Uint8Array,
      _participant: unknown,
      _kind: unknown,
      _topic: unknown
    ) => {
      try {
        const str = new TextDecoder().decode(payload);
        const parsed = JSON.parse(str);
        const message: string = parsed.message ?? str;
        if (message === "SYSTEM_INTRO_DONE") {
          console.log(
            "[tts-intro]: ✅ SYSTEM_INTRO_DONE received — transitioning to interactive mode."
          );
          onIntroDone();
        }
      } catch {
        // Non-JSON payload — ignore
      }
    };

    room.on(RoomEvent.DataReceived, handleData as any);
    return () => {
      room.off(RoomEvent.DataReceived, handleData as any);
    };
  }, [room, room.state, onIntroDone]);

  return null;
}

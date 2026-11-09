"use client";

import { useEffect } from "react";
import { useRoomContext } from "@livekit/components-react";
import { RoomEvent } from "livekit-client";

interface MloFailureListenerProps {
  onFailure: (reason: string) => void;
}

/**
 * Listens for a SYSTEM_MLO_UNSUPPORTED data message from the agent, sent when
 * the SIP transfer cannot be routed (zip not served / missing). Triggers the
 * caller to recover the existing AI session without dropping the LiveKit room.
 */
export function MloFailureListener({ onFailure }: MloFailureListenerProps) {
  const room = useRoomContext();

  useEffect(() => {
    if (!room) return;

    const handler = async (
      payload: Uint8Array,
      _participant?: unknown,
      _kind?: unknown,
      topic?: string
    ) => {
      if (topic && topic !== "lk-chat") return;
      try {
        const data = JSON.parse(new TextDecoder().decode(payload));
        if (data?.message === "SYSTEM_MLO_UNSUPPORTED") {
          onFailure(String(data?.reason || "unsupported_area"));
          const reason = String(data?.reason || "unsupported_area");
          if (["no_agent_available", "queue_timeout", "transfer_failed"].includes(reason)) {
            // Do not rely solely on a subsequent React render/MediaGuard pass.
            // Restore capture directly on the same failure event so the next
            // spoken consent reaches STT immediately.
            await room.localParticipant.setMicrophoneEnabled(true);
            console.log("[ui-loan-officer]: microphone restored for voice scheduling");
          }
        }
      } catch (error) {
        console.warn("[ui-loan-officer]: failed to recover scheduling microphone", error);
      }
    };

    room.on(RoomEvent.DataReceived, handler);
    return () => {
      room.off(RoomEvent.DataReceived, handler);
    };
  }, [room, onFailure]);

  return null;
}

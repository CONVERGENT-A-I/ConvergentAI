"use client";

import { useEffect } from "react";
import { useRoomContext } from "@livekit/components-react";
import { RoomEvent } from "livekit-client";

export type AvatarStatus =
  | "connecting"    // Initial state, avatar connection in progress
  | "connected"     // Avatar connected successfully
  | "capacity"      // Avatar at capacity (concurrent usage limit)
  | "failed";       // Avatar connection failed after retries

interface AvatarStatusListenerProps {
  onAvatarStatus: (status: AvatarStatus, detail?: string) => void;
}

/**
 * Headless component that listens for avatar status data messages from the backend.
 * The backend sends:
 *   - SYSTEM_AVATAR_CONNECTED        — avatar connected successfully
 *   - SYSTEM_AVATAR_CAPACITY_LIMITED  — avatar at concurrent capacity (429/503)
 *   - SYSTEM_AVATAR_CONN_FAILED      — avatar failed after retries (transient error)
 */
export function AvatarStatusListener({ onAvatarStatus }: AvatarStatusListenerProps) {
  const room = useRoomContext();

  useEffect(() => {
    const handleData = (payload: Uint8Array) => {
      try {
        const text = new TextDecoder().decode(payload);
        const parsed = JSON.parse(text);
        const msg = parsed.message;

        if (msg === "SYSTEM_AVATAR_CONNECTED") {
          console.log("[ui-avatar]: ✅ Backend confirmed avatar connected.");
          onAvatarStatus("connected");
        } else if (msg === "SYSTEM_AVATAR_CAPACITY_LIMITED") {
          console.warn("[ui-avatar]: ⚠️ Avatar at capacity — falling back to voice.", parsed.detail);
          onAvatarStatus("capacity", parsed.detail);
        } else if (msg === "SYSTEM_AVATAR_CONN_FAILED") {
          console.warn("[ui-avatar]: ❌ Avatar connection failed after retries.", parsed.detail);
          onAvatarStatus("failed", parsed.detail);
        }
      } catch {
        // ignore non-JSON messages
      }
    };

    room.on(RoomEvent.DataReceived, handleData);
    return () => {
      room.off(RoomEvent.DataReceived, handleData);
    };
  }, [room, onAvatarStatus]);

  return null;
}

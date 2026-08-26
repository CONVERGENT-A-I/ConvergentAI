"use client";

import { useEffect } from "react";
import { useRoomContext } from "@livekit/components-react";
import { RoomEvent } from "livekit-client";

interface StageListenerProps {
  onStageUpdate: (stage: string, profile?: any) => void;
  onTriggerMloTransfer?: () => void;
}

export function StageListener({ onStageUpdate, onTriggerMloTransfer }: StageListenerProps) {
  const room = useRoomContext();

  useEffect(() => {
    // Expose publishData function to parent component via window global safely
    if (room?.localParticipant) {
      (window as any).lkPublishData = (payload: Uint8Array, options: any) => {
        return room.localParticipant.publishData(payload, options);
      };
    }

    const handleData = (payload: Uint8Array) => {
      try {
        const text = new TextDecoder().decode(payload);
        const parsed = JSON.parse(text);
        const msg = parsed.message;

        if (msg === "SYSTEM_STAGE_UPDATE") {
          console.log("[ui-stage]: ✅ Received stage update from backend:", parsed.stage, parsed.profile);
          onStageUpdate(parsed.stage, parsed.profile);
        } else if (msg === "SYSTEM_TRIGGER_MLO_TRANSFER") {
          console.log("[ui-stage]: 📞 Received automatic MLO transfer trigger from backend voice command!");
          onTriggerMloTransfer?.();
        }
      } catch {
        // ignore non-JSON messages
      }
    };

    room.on(RoomEvent.DataReceived, handleData);
    return () => {
      room.off(RoomEvent.DataReceived, handleData);
      delete (window as any).lkPublishData;
    };
  }, [room, onStageUpdate]);

  return null;
}

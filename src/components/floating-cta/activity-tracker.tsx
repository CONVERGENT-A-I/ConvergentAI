"use client";

import { useEffect } from "react";
import { useRoomContext } from "@livekit/components-react";
import { RoomEvent } from "livekit-client";

export function ActivityTracker() {
  const room = useRoomContext();

  useEffect(() => {
    if (!room) return;
    const handleActiveSpeakers = (speakers: any[]) => {
      // If anyone is speaking (human or agent), it counts as activity.
      if (speakers.length > 0) {
        window.dispatchEvent(new Event("agent_activity"));
      }
    };
    room.on(RoomEvent.ActiveSpeakersChanged, handleActiveSpeakers);
    return () => {
      room.off(RoomEvent.ActiveSpeakersChanged, handleActiveSpeakers);
    };
  }, [room]);

  return null;
}

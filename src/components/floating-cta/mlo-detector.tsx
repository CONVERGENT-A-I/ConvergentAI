"use client";

import { useEffect, useState } from "react";
import { useRemoteParticipants, useRoomContext } from "@livekit/components-react";
import { RoomEvent } from "livekit-client";

interface MloDetectorProps {
  onMloStatusChange: (joined: boolean, name: string | null) => void;
}

export function MloDetector({ onMloStatusChange }: MloDetectorProps) {
  const participants = useRemoteParticipants();
  const room = useRoomContext();
  const [humanAnswer, setHumanAnswer] = useState<{ extension?: string; queueName?: string; queueNumber?: string } | null>(null);

  useEffect(() => {
    const handler = (payload: Uint8Array, _participant?: unknown, _kind?: unknown, topic?: string) => {
      if (topic && topic !== "lk-chat") return;
      try {
        const data = JSON.parse(new TextDecoder().decode(payload));
        if (data?.message === "SYSTEM_MLO_AGENT_CONNECTED") {
          setHumanAnswer({ extension: data.extension, queueName: data.queueName, queueNumber: data.queueNumber });
        } else if (data?.message === "SYSTEM_MLO_UNSUPPORTED") {
          setHumanAnswer(null);
        }
      } catch { /* ignore non-JSON data */ }
    };
    room.on(RoomEvent.DataReceived, handler);
    return () => { room.off(RoomEvent.DataReceived, handler); };
  }, [room]);

  useEffect(() => {
    const mloParticipant = participants.find((p) => {
      const isSip = p.identity.startsWith("sip_") || p.identity.includes("sip");
      if (!isSip) return false;

      // FusionPBX answers on behalf of the queue. sip.callStatus=active is not
      // proof that a human answered; require the backend ESL confirmation too.
      return Boolean(humanAnswer) && p.attributes?.["sip.callStatus"] === "active";
    });

    if (mloParticipant) {
      const label = humanAnswer?.queueName
        ? `${humanAnswer.queueName}${humanAnswer.queueNumber ? ` (${humanAnswer.queueNumber})` : ""}`
        : humanAnswer?.extension ? `Loan Officer ${humanAnswer.extension}` : mloParticipant.name || mloParticipant.identity;
      onMloStatusChange(true, label);
    } else {
      onMloStatusChange(false, null);
    }
  }, [participants, humanAnswer, onMloStatusChange]);

  return null;
}

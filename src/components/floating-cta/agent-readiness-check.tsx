"use client";

import { useEffect, useState } from "react";
import { useRemoteParticipants, useRoomContext } from "@livekit/components-react";
import { RoomEvent } from "livekit-client";

interface AgentReadinessCheckProps {
  onAgentReady: (ready: boolean) => void;
}

export function AgentReadinessCheck({ onAgentReady }: AgentReadinessCheckProps) {
  const participants = useRemoteParticipants();
  const room = useRoomContext();
  const [agentSignaledReady, setAgentSignaledReady] = useState(false);

  useEffect(() => {
    const handleData = (payload: Uint8Array) => {
      try {
        const text = new TextDecoder().decode(payload);
        const parsed = JSON.parse(text);
        if (parsed.message === "SYSTEM_AGENT_READY" || text === "SYSTEM_AGENT_READY") {
          console.log("[ui]: 🤖 Agent signaled SYSTEM_AGENT_READY.");
          setAgentSignaledReady(true);
        }
      } catch {
        // ignore
      }
    };

    room.on(RoomEvent.DataReceived, handleData);
    return () => {
      room.off(RoomEvent.DataReceived, handleData);
    };
  }, [room]);

  useEffect(() => {
    if (participants.length === 0) {
      setAgentSignaledReady(false);
    }
  }, [participants]);

  useEffect(() => {
    onAgentReady(participants.length > 0 && agentSignaledReady);
  }, [participants, agentSignaledReady, onAgentReady]);

  return null;
}

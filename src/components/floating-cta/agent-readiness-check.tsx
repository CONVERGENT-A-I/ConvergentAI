"use client";

import { useEffect, useState } from "react";
import { useRemoteParticipants, useRoomContext } from "@livekit/components-react";
import { RoomEvent } from "livekit-client";

interface AgentReadinessCheckProps {
  onAgentReady: (ready: boolean) => void;
  mode?: string;
}

export function AgentReadinessCheck({ onAgentReady, mode }: AgentReadinessCheckProps) {
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
    if (mode === "loan-officer") {
      // In loan-officer mode, we're ready as soon as ANY remote participant joins
      // (that's the SIP participant / loan officer). No need to wait for SYSTEM_AGENT_READY.
      const hasSipParticipant = participants.some(
        (p) =>
          p.identity?.startsWith("sip-fspbx-") ||
          p.identity?.startsWith("sip_") ||
          p.kind === 3 // ParticipantKind.SIP
      );
      
      // Ready when SIP joins; or fallback: any participant if we already had agent signal
      const isReady =
        participants.length > 0 &&
        (hasSipParticipant || agentSignaledReady);
      onAgentReady(isReady);
    } else {
      onAgentReady(participants.length > 0 && agentSignaledReady);
    }
  }, [participants, agentSignaledReady, onAgentReady, mode]);

  return null;
}

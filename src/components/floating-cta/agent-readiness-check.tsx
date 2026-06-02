"use client";

import { useEffect } from "react";
import { useRemoteParticipants } from "@livekit/components-react";

interface AgentReadinessCheckProps {
  onAgentReady: (ready: boolean) => void;
}

export function AgentReadinessCheck({ onAgentReady }: AgentReadinessCheckProps) {
  const participants = useRemoteParticipants();

  useEffect(() => {
    onAgentReady(participants.length > 0);
  }, [participants, onAgentReady]);

  return null;
}

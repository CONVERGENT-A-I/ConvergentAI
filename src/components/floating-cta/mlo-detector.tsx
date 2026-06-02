"use client";

import { useEffect } from "react";
import { useRemoteParticipants } from "@livekit/components-react";

interface MloDetectorProps {
  onMloStatusChange: (joined: boolean, name: string | null) => void;
}

export function MloDetector({ onMloStatusChange }: MloDetectorProps) {
  const participants = useRemoteParticipants();

  useEffect(() => {
    const mloParticipant = participants.find(
      (p) => p.identity.startsWith("sip_") || p.identity.includes("sip")
    );

    if (mloParticipant) {
      onMloStatusChange(true, mloParticipant.name || mloParticipant.identity);
    } else {
      onMloStatusChange(false, null);
    }
  }, [participants, onMloStatusChange]);

  return null;
}

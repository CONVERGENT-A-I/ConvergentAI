"use client";

import { useState, useEffect, useRef } from "react";
import { useChat, useRoomContext } from "@livekit/components-react";
import { type ChatEntry } from "../../lib/session-storage";

interface ChatTranscriptRecorderProps {
  initialTranscript?: ChatEntry[];
  onTranscriptUpdate: (entries: ChatEntry[]) => void;
}

export function ChatTranscriptRecorder({
  initialTranscript = [],
  onTranscriptUpdate,
}: ChatTranscriptRecorderProps) {
  const { chatMessages } = useChat();
  const room = useRoomContext();
  const [transcripts, setTranscripts] = useState<Record<string, any>>({});
  const lastSavedCountRef = useRef<number>(0);

  const sanitizeTranscriptText = (text: string | null | undefined): string => {
    if (!text) return "";
    return text
      .replace(/<internal_route>[\s\S]*?<\/internal_route>/gi, "")
      .replace(/<internal_route>[\s\S]*$/gi, "")
      .replace(/<\/internal_route>/gi, "")
      .replace(/\bROUTE:\s*\[?[A-Z0-9_\-]+\]?(\s*\|\s*(PRIMARY|SECONDARY):\s*\[?[A-Z0-9_\-]+\]?)*/gi, "")
      .replace(/\b(PRIMARY|SECONDARY):\s*\[?[A-Z0-9_\-]+\]?/gi, "")
      .replace(/[ \t]{2,}/g, " ")
      .trim();
  };

  useEffect(() => {
    if (!room) return;

    const handleTranscription = (segments: any[], participant?: any) => {
      setTranscripts((prev) => {
        const next = { ...prev };
        for (const seg of segments) {
          const cleanText = sanitizeTranscriptText(seg.text);
          if (!cleanText) continue;
          next[seg.id] = {
            id: seg.id,
            text: cleanText,
            timestamp: seg.startTime || Date.now(),
            isAgent:
              participant?.identity === "agent" ||
              participant?.identity?.startsWith("agent"),
            final: seg.final,
          };
        }
        return next;
      });
    };

    room.on("transcriptionReceived", handleTranscription);
    return () => {
      room.off("transcriptionReceived", handleTranscription);
    };
  }, [room]);

  useEffect(() => {
    const combined: ChatEntry[] = [];
    const seenIds = new Set<string>();
    const seenStripped = new Set<string>();

    const normalize = (t: string) =>
      t.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim();

    // 1. Initial/restored history from previous sessions
    if (initialTranscript && initialTranscript.length > 0) {
      for (const item of initialTranscript) {
        const id = item.id || `restored_${item.timestamp}`;
        if (seenIds.has(id)) continue;
        seenIds.add(id);
        if (item.text?.trim()) {
          seenStripped.add(normalize(item.text));
        }
        combined.push(item);
      }
    }

    // 2. Chat messages in the current room (manual typed text or agent sendText)
    chatMessages.forEach((msg) => {
      const id = msg.id || String(msg.timestamp);
      if (seenIds.has(id)) return;
      const text = msg.message?.trim();
      if (!text) return;
      const stripped = normalize(text);
      if (seenStripped.has(stripped)) return;
      seenIds.add(id);
      seenStripped.add(stripped);
      combined.push({
        id,
        role:
          msg.from?.identity?.startsWith("agent") ||
          msg.from?.identity === "agent"
            ? "agent"
            : "user",
        text,
        timestamp: msg.timestamp,
      });
    });

    // 3. Finalized spoken transcriptions
    Object.values(transcripts).forEach((tr) => {
      if (!tr.text?.trim() || !tr.final) return;
      const trId = String(tr.id);
      if (seenIds.has(trId)) return;
      const stripped = normalize(tr.text);
      if (seenStripped.has(stripped)) return;
      seenIds.add(trId);
      seenStripped.add(stripped);
      combined.push({
        id: trId,
        role: tr.isAgent ? "agent" : "user",
        text: tr.text,
        timestamp: tr.timestamp,
      });
    });

    combined.sort((a, b) => a.timestamp - b.timestamp);

    // Only notify parent when message count has increased
    if (combined.length > lastSavedCountRef.current) {
      lastSavedCountRef.current = combined.length;
      onTranscriptUpdate(combined);
    }
  }, [chatMessages, transcripts, initialTranscript, onTranscriptUpdate]);

  return null;
}

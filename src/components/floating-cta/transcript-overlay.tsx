"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRoomContext } from "@livekit/components-react";
import { RoomEvent } from "livekit-client";

export function TranscriptOverlay() {
  const room = useRoomContext();
  const [transcript, setTranscript] = useState("");
  const fadeTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (room.state !== "connected") return;

    const handleData = (payload: Uint8Array) => {
      try {
        const text = new TextDecoder().decode(payload);
        const parsed = JSON.parse(text);
        // Handle transcript data from agent
        if (parsed.type === "transcript" || parsed.transcript) {
          const txt = parsed.transcript || parsed.text || parsed.message || "";
          if (txt) {
            setTranscript(txt);
            if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
            fadeTimerRef.current = setTimeout(() => setTranscript(""), 5000);
          }
        }
      } catch {
        // Not JSON, might be raw text
      }
    };

    room.on(RoomEvent.DataReceived, handleData);
    return () => {
      room.off(RoomEvent.DataReceived, handleData);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, [room, room.state]);

  return (
    <AnimatePresence>
      {transcript && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute bottom-20 left-4 right-4 z-50 flex justify-center pointer-events-none"
        >
          <div className="bg-black/70 backdrop-blur-md text-white text-sm px-5 py-3 rounded-2xl border border-white/10 shadow-lg max-w-[80%] text-center leading-relaxed">
            {transcript}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

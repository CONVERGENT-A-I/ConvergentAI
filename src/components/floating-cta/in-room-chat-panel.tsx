"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat, useRoomContext } from "@livekit/components-react";
import { RoomEvent } from "livekit-client";
import { MessageCircle, Sparkles, Send, VolumeX, Bot } from "lucide-react";

interface InRoomChatPanelProps {
  isActive?: boolean;
}

export function InRoomChatPanel({ isActive }: InRoomChatPanelProps) {
  const { chatMessages, send } = useChat();
  const room = useRoomContext();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [avatarVoiceEnabled, setAvatarVoiceEnabled] = useState(true);

  // Toggle avatar voice on/off: mutes client-side audio AND tells the backend
  // to switch between voice (Realtime API) and text-only (Chat Completions API)
  const toggleAvatarVoice = async () => {
    const nextState = !avatarVoiceEnabled;
    setAvatarVoiceEnabled(nextState);

    // 1. Client-side: mute/unmute remote audio tracks immediately
    try {
      for (const participant of room.remoteParticipants.values()) {
        for (const pub of participant.trackPublications.values()) {
          if (pub.track && pub.track.kind === "audio") {
            (pub.track as any).setVolume?.(nextState ? 1 : 0);
          }
        }
      }
    } catch (err) {
      console.warn("[ui]: Failed to toggle avatar audio volume:", err);
    }

    // 2. Backend: tell the agent to switch response mode
    try {
      const signal = nextState ? "SYSTEM_VOICE_UNMUTED" : "SYSTEM_VOICE_MUTED";
      const encoder = new TextEncoder();
      const payload = encoder.encode(JSON.stringify({ message: signal }));
      await room.localParticipant.publishData(payload, {
        topic: "lk-chat",
        reliable: true,
      });
      console.log(
        `[ui]: 🔊 Avatar voice ${nextState ? "ENABLED (voice mode)" : "DISABLED (text-only mode)"}`
      );
    } catch (err) {
      console.warn("[ui]: Failed to send voice toggle signal:", err);
    }
  };

  // When voice is toggled off, also apply to newly subscribed remote audio tracks
  useEffect(() => {
    if (!room) return;
    const applyVolume = (track: any) => {
      if (track?.kind === "audio" && typeof track.setVolume === "function") {
        track.setVolume(avatarVoiceEnabled ? 1 : 0);
      }
    };
    const onTrackSubscribed = (track: any) => applyVolume(track);
    room.on(RoomEvent.TrackSubscribed, onTrackSubscribed);
    return () => {
      room.off(RoomEvent.TrackSubscribed, onTrackSubscribed);
    };
  }, [room, avatarVoiceEnabled]);

  // State for spoken transcriptions
  const [transcripts, setTranscripts] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!room) return;

    const handleTranscription = (segments: any[], participant?: any) => {
      setTranscripts((prev) => {
        const next = { ...prev };
        for (const seg of segments) {
          next[seg.id] = {
            id: seg.id,
            text: seg.text,
            timestamp: seg.startTime || Date.now(),
            isAgent:
              participant?.identity === "agent" ||
              participant?.identity?.startsWith("agent"),
            final: seg.final,
            type: "transcript",
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

  // Merge chat messages and transcripts
  const displayMessages = useMemo(() => {
    const combined: any[] = [];
    const seenTexts = new Set<string>();

    // Add manual chat messages
    chatMessages.forEach((msg) => {
      if (msg.message && msg.message.trim()) {
        const normalized = msg.message.trim().toLowerCase();
        seenTexts.add(normalized);
      }
      combined.push({
        id: msg.id || msg.timestamp.toString(),
        text: msg.message,
        timestamp: msg.timestamp,
        isAgent:
          msg.from?.identity?.startsWith("agent") ||
          msg.from?.identity === "agent",
        type: "chat",
        final: true,
      });
    });

    // Add transcript messages
    Object.values(transcripts).forEach((tr) => {
      if (tr.text && tr.text.trim()) {
        const normalized = tr.text.trim().toLowerCase();
        // If it's an agent transcription and we already have a chat message with the same text, skip it
        if (tr.isAgent && seenTexts.has(normalized)) {
          return;
        }
        combined.push(tr);
      }
    });

    // Sort by timestamp
    return combined.sort((a, b) => a.timestamp - b.timestamp);
  }, [chatMessages, transcripts]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    // Only auto-scroll when the user is already near the bottom (within 150px).
    // This prevents the view from snapping back when the user has scrolled up.
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
    if (!isNearBottom) return;

    // Debounce: rapid transcript word-updates fire this effect constantly.
    // Cancel the previous pending scroll before scheduling a new one so the
    // animation never gets interrupted mid-flight.
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 60);

    return () => {
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, [displayMessages]);

  // Auto-scroll when the chat panel becomes visible (e.g. switching modes)
  useEffect(() => {
    if (isActive) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "auto",
          block: "end",
        });
      }, 10);
    }
  }, [isActive]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    send(text).catch(console.error);
    setInput("");
  };

  const formatMsgTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] rounded-xl md:rounded-none overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10">
        <h3 className="font-bold text-white text-base">Chat</h3>
        <div className="flex items-center gap-2">
          {/* Avatar Voice Toggle — prominent pill switch */}
          <button
            onClick={toggleAvatarVoice}
            className={`group relative flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-500 cursor-pointer border overflow-hidden ${
              avatarVoiceEnabled
                ? "bg-[#00b4d8]/10 border-[#00b4d8]/40 shadow-[0_0_25px_rgba(0,180,216,0.2)]"
                : "bg-white/[0.03] border-white/10 opacity-80 hover:opacity-100 hover:border-white/20"
            }`}
          >
            {/* Animated subtle glow */}
            {avatarVoiceEnabled && (
              <motion.div
                layoutId="avatarGlow"
                className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00b4d8]/15 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
              />
            )}

            <div className="relative flex items-center gap-3">
              <div
                className={`p-1.5 rounded-lg transition-all duration-500 ${
                  avatarVoiceEnabled
                    ? "bg-[#00b4d8]/20 text-[#00d4f5] shadow-[0_0_15px_rgba(0,180,216,0.5)]"
                    : "bg-white/10 text-gray-500"
                }`}
              >
                {avatarVoiceEnabled ? (
                  <Bot className="h-4 w-4 animate-pulse" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </div>
              <div className="flex flex-col items-start">
                <span
                  className={`text-[9px] uppercase tracking-[0.15em] font-black leading-none ${
                    avatarVoiceEnabled ? "text-[#00d4f5]" : "text-gray-500"
                  }`}
                >
                  {avatarVoiceEnabled ? "Avatar Active" : "Text Only"}
                </span>
                <span className="text-[11px] font-bold text-white mt-1 whitespace-nowrap">
                  {avatarVoiceEnabled ? "Ailana Speaking" : "Discrete Mode"}
                </span>
              </div>
            </div>

            {/* Compact minimalist switch */}
            <div
              className={`relative w-8 h-4 rounded-full border transition-all duration-500 ${
                avatarVoiceEnabled
                  ? "bg-[#00b4d8]/40 border-[#00b4d8]/50"
                  : "bg-white/5 border-white/20"
              }`}
            >
              <motion.div
                className={`absolute top-0.5 h-2.5 w-2.5 rounded-full ${
                  avatarVoiceEnabled
                    ? "bg-white shadow-[0_0_10px_rgba(255,255,255,1)]"
                    : "bg-gray-600"
                }`}
                animate={{ x: avatarVoiceEnabled ? 18 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        style={{ scrollbarWidth: "thin" }}
      >
        {displayMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 gap-4">
            <div className="h-14 w-14 rounded-full bg-blue-500/10 flex items-center justify-center">
              <MessageCircle className="h-7 w-7 text-blue-500" />
            </div>
            <p className="text-gray-400 text-sm">
              Send a message to start chatting with Ailana
            </p>
          </div>
        )}

        {displayMessages.map((msg, i) => {
          return (
            <div
              key={msg.id || i}
              className={`flex gap-2.5 max-w-[90%] ${
                msg.isAgent ? "mr-auto" : "ml-auto flex-row-reverse"
              }`}
            >
              {msg.isAgent && (
                <div className="h-7 w-7 rounded-full bg-[#00b4d8] flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
              )}
              <div className="flex flex-col gap-0.5">
                <div
                  className={`px-3.5 py-2.5 text-[13px] leading-relaxed rounded-2xl ${
                    msg.isAgent
                      ? "bg-white/10 text-white rounded-tl-sm"
                      : "bg-gradient-to-r from-[#00b4d8] to-[#023e8a] text-white rounded-tr-sm shadow-md"
                  } ${!msg.final ? "opacity-70 animate-pulse" : ""}`}
                >
                  {msg.type === "transcript" ? (
                    <span className="italic">{msg.text}</span>
                  ) : (
                    <span>{msg.text}</span>
                  )}
                </div>
                <span
                  className={`text-[10px] text-gray-400 font-medium px-1 ${
                    msg.isAgent ? "" : "text-right"
                  }`}
                >
                  {formatMsgTime(msg.timestamp)}
                </span>
              </div>
            </div>
          );
        })}
        {/* Scroll anchor — scrollIntoView targets this so the animation always lands at the very bottom */}
        <div ref={messagesEndRef} className="h-px shrink-0" />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-white/10">
        <div className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-2 border border-white/10 focus-within:border-[#00b4d8]/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] transition-colors">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="h-8 w-8 rounded-full bg-gradient-to-r from-[#00b4d8] to-[#023e8a] text-white flex items-center justify-center disabled:opacity-30 hover:shadow-[0_0_15px_rgba(0,180,216,0.4)] transition-all cursor-pointer shrink-0"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

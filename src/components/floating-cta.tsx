"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Sparkles,
  X,
  Phone,
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Monitor,
  Circle,
  Loader2,
  Send,
  Check,
  ArrowRight,
  Clock,
  Lock,
  ShieldAlert,
  RefreshCw,
  Volume2,
  VolumeX,
  Headset,
  Bot,
  MoreHorizontal,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useRemoteParticipants,
  useChat,
  useRoomContext,
  useLocalParticipant,
} from "@livekit/components-react";
import { RoomEvent } from "livekit-client";
import "@livekit/components-styles";
import AppIcon from "../app/icon.png";

import VideoStage from "./video-stage";

// Suppress harmless internal LiveKit warnings that cause Next.js error overlays in dev mode
if (typeof window !== "undefined") {
  const originalError = console.error;
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes(
        "Tried to add a track for a participant, that's not present",
      ) ||
        args[0].includes("Unknown DataChannel error"))
    ) {
      return; // Ignore
    }
    originalError.apply(console, args);
  };
}

type FlowPhase =
  | "idle"
  | "connecting"
  | "intro"
  | "live"
  | "error"
  | "closing-mlo";
type PendingMode =
  | "intro-avatar"
  | "video"
  | "voice"
  | "avatar-chat"
  | "loan-officer";

function AgentReadinessCheck({
  onAgentReady,
}: {
  onAgentReady: (r: boolean) => void;
}) {
  const participants = useRemoteParticipants();
  useEffect(() => {
    onAgentReady(participants.length > 0);
  }, [participants, onAgentReady]);
  return null;
}

/**
 * Automatically mutes mic & camera when switching to channels that don't need them.
 * Lives inside <LiveKitRoom> so it has access to the room context.
 */
function MediaGuard({ mode }: { mode: string }) {
  const room = useRoomContext();

  useEffect(() => {
    // Only run once the room is actually connected to prevent pre-connection state errors
    if (room.state !== "connected") return;

    const lp = room.localParticipant;
    if (!lp) return;

    console.log(`[MediaGuard] 🔄 Syncing media state for mode: ${mode}`);

    // Explicitly handle all modes as the single source of truth
    const syncMedia = async () => {
      if (mode === "avatar-chat" || mode === "intro-avatar") {
        try {
          await lp.setMicrophoneEnabled(false);
        } catch (e) {}
        try {
          await lp.setCameraEnabled(false);
        } catch (e) {}
        console.log("[MediaGuard] 🔇 Mic & camera OFF");
      } else if (mode === "voice") {
        try {
          await lp.setMicrophoneEnabled(false);
        } catch (e) {}
        try {
          await lp.setCameraEnabled(false);
        } catch (e) {}
        console.log("[MediaGuard] 🔇 Mic & camera OFF (voice mode)");
      } else if (mode === "video") {
        try {
          await lp.setMicrophoneEnabled(false);
        } catch (e) {}
        try {
          await lp.setCameraEnabled(false);
        } catch (e) {}
        console.log(
          "[MediaGuard] 🔇 Mic & camera OFF by default (waiting for user to enable)",
        );
      } else if (mode === "loan-officer") {
        // Loan officer mode: enable mic so user can talk to the SIP participant, disable camera
        try {
          await lp.setMicrophoneEnabled(true);
        } catch (e) {}
        try {
          await lp.setCameraEnabled(false);
        } catch (e) {}
        console.log("[MediaGuard] 🎤 Mic ON, camera OFF (loan-officer SIP mode)");
      }
    };

    syncMedia();
  }, [mode, room, room.state]);

  return null;
}

function ActivityTracker() {
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

function MloDetector({ onMloStatusChange }: { onMloStatusChange: (joined: boolean, name: string | null) => void }) {
  const participants = useRemoteParticipants();
  
  useEffect(() => {
    const mloParticipant = participants.find(p => p.identity.startsWith('sip_') || p.identity.includes('sip'));
    
    if (mloParticipant) {
      onMloStatusChange(true, mloParticipant.name || mloParticipant.identity);
    } else {
      onMloStatusChange(false, null);
    }
  }, [participants, onMloStatusChange]);

  return null;
}

function LoanOfficerQueueUI() {
  const beams = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      id: i,
      maxHeight: 20 + Math.random() * 25,
      duration: 0.8 + Math.random() * 0.6,
    }));
  }, []);

  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-gradient-to-br from-[#0B0F19] to-[#01142e]">
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full border-2 border-[#00b4d8]/20 animate-[ping_3s_ease-in-out_infinite]" />
        <div className="absolute inset-[-20px] rounded-full border border-[#00b4d8]/10 animate-[ping_4s_ease-in-out_infinite]" />
        <div className="h-24 w-24 rounded-full border-2 border-[#00b4d8]/40 bg-black/60 flex items-center justify-center backdrop-blur-md shadow-[0_0_50px_rgba(0,180,216,0.2)]">
          <Headset className="w-10 h-10 text-[#00b4d8] animate-pulse" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
        Connecting to Loan Officer
      </h3>
      <div className="flex items-center gap-2 mb-8">
        <Loader2 className="w-4 h-4 text-[#00b4d8]/70 animate-spin" />
        <p className="text-[#00b4d8]/70 text-sm max-w-xs text-center font-medium">
          You're in the queue...
        </p>
      </div>

      {/* Decorative equalizer for hold music */}
      <div className="flex items-center justify-center gap-1.5 opacity-80 mb-12">
        {beams.map((beam) => (
          <motion.div
            key={`eq-${beam.id}`}
            className="w-1.5 bg-[#00b4d8] rounded-full"
            animate={{
              height: [10, beam.maxHeight],
            }}
            transition={{
              duration: beam.duration,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <div className="flex justify-center opacity-40">
         <p className="text-[10px] text-[#00b4d8] uppercase tracking-[0.3em] font-bold">Your call is important to us</p>
      </div>
    </div>
  );
}

function LoanOfficerLiveUI({ mloName, callSeconds }: { mloName: string | null, callSeconds: number }) {
  const formatTime = (totalSeconds: number) => {
    const hh = Math.floor(totalSeconds / 3600);
    const mm = Math.floor((totalSeconds % 3600) / 60);
    const ss = totalSeconds % 60;
    return `${hh > 0 ? hh.toString().padStart(2, "0") + ':' : ''}${mm.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`;
  };

  const displayName = mloName ? mloName.replace('sip_', '') : 'Loan Officer';
  const initials = displayName.substring(0, 2).toUpperCase();

  const beams = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      maxHeight: 15 + Math.random() * 30,
      duration: 0.4 + Math.random() * 0.4,
    }));
  }, []);

  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center bg-gradient-to-br from-[#0B0F19] to-[#01142e]">
      <div className="w-full bg-[#00b4d8]/10 border-b border-[#00b4d8]/20 py-2.5 px-4 flex items-center justify-center gap-2 backdrop-blur-sm">
        <div className="w-2 h-2 rounded-full bg-[#00b4d8] animate-pulse shadow-[0_0_8px_rgba(0,180,216,0.8)]" />
        <span className="text-[#00b4d8] text-[11px] font-bold uppercase tracking-[0.2em]">Live Call</span>
        <span className="text-[#00b4d8]/50 mx-2">•</span>
        <span className="text-[#00b4d8]/90 font-mono text-sm tracking-wide">{formatTime(callSeconds)}</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full px-6 gap-10">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            {/* Active rings */}
            <div className="absolute inset-[-10px] rounded-full border border-[#00b4d8]/30 animate-[ping_2s_ease-in-out_infinite]" />
            <div className="absolute inset-[-20px] rounded-full border border-[#00b4d8]/10 animate-[ping_3s_ease-in-out_infinite]" />
            <div className="h-28 w-28 rounded-full bg-gradient-to-br from-[#00b4d8]/20 to-[#023e8a]/20 border-2 border-[#00b4d8]/50 flex items-center justify-center shadow-[0_0_40px_rgba(0,180,216,0.25)] backdrop-blur-md">
              <span className="text-3xl font-black text-[#00b4d8] tracking-tighter">{initials}</span>
            </div>
            <div className="absolute bottom-0 right-0 w-7 h-7 bg-[#0B0F19] rounded-full flex items-center justify-center">
              <div className="w-5 h-5 bg-[#00b4d8] rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(0,180,216,0.5)]">
                <Phone className="w-3 h-3 text-[#0B0F19]" />
              </div>
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white tracking-tight">{displayName}</h2>
            <p className="text-[#00b4d8]/80 text-sm font-medium mt-1">Licensed Mortgage Loan Officer</p>
          </div>
        </div>

        {/* Audio Visualizer */}
        <div className="flex items-center justify-center gap-1.5 h-12 w-full max-w-[200px]">
          {beams.map((beam) => (
            <motion.div
              key={`live-eq-${beam.id}`}
              className="w-1.5 bg-[#00b4d8] rounded-full"
              animate={{
                height: [4, beam.maxHeight],
              }}
              transition={{
                duration: beam.duration,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ChannelStartTrigger({
  isLivePhase,
  mode,
  isAnnouncementComplete,
}: {
  isLivePhase: boolean;
  mode: string;
  isAnnouncementComplete: boolean;
}) {
  const { send } = useChat();
  const room = useRoomContext();
  const participants = useRemoteParticipants();
  const agentReady = participants.length > 0;
  const lastTriggeredMode = useRef<string | null>(null);

  useEffect(() => {
    if (
      isLivePhase &&
      isAnnouncementComplete &&
      room.state === "connected" &&
      agentReady &&
      lastTriggeredMode.current !== mode
    ) {
      const prevMode = lastTriggeredMode.current;
      const trySend = async (retries = 3) => {
        try {
          lastTriggeredMode.current = mode;
          const encoder = new TextEncoder();

          if (prevMode === "loan-officer" && mode !== "loan-officer") {
            console.log(`[ui]: ☀️ Waking up agent...`);
            const resumePayload = encoder.encode(
              JSON.stringify({ message: `SYSTEM_RESUME_AGENT` }),
            );
            await room.localParticipant.publishData(resumePayload, {
              topic: "lk-chat",
              reliable: true,
            });
          }

          if (mode === 'loan-officer') {
            console.log(`[ui-loan-officer]: 📞 Transferring to MLO...`);
            console.log(`[ui-loan-officer]: 📞 Room Name: ${room.name}`);
            console.log(`[ui-loan-officer]: 📞 Local Participant Identity: ${room.localParticipant.identity}`);
            const transferPayload = encoder.encode(JSON.stringify({ message: `SYSTEM_TRANSFER_MLO` }));
            await room.localParticipant.publishData(transferPayload, { topic: "lk-chat", reliable: true });
            console.log(`[ui-loan-officer]: 📞 Sent SYSTEM_TRANSFER_MLO message over DataChannel.`);
          } else {
            console.log(
              `[ui]: 🚀 Channel starting (${mode}). Sending SYSTEM_CHANNEL_START...`,
            );
            const startPayload = encoder.encode(
              JSON.stringify({ message: `SYSTEM_CHANNEL_START:${mode}` }),
            );
            await room.localParticipant.publishData(startPayload, {
              topic: "lk-chat",
              reliable: true,
            });
          }
        } catch (err) {
          console.warn(
            `[ui]: Failed to send start trigger (retries left: ${retries}):`,
            err,
          );
          if (retries > 0) {
            setTimeout(() => trySend(retries - 1), 500);
          } else {
            lastTriggeredMode.current = prevMode; // reset so next mode change can try again
          }
        }
      };
      trySend();
    }

    if (!isLivePhase) {
      lastTriggeredMode.current = null;
    }
  }, [isLivePhase, mode, send, room.state, agentReady, isAnnouncementComplete]);

  return null;
}

/** Custom control bar for the Google Meet-style live UI */
function RoomControls({ onEnd, mode }: { onEnd: () => void; mode: string }) {
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled } =
    useLocalParticipant();
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isTogglingScreen, setIsTogglingScreen] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);

  const toggleMic = async () => {
    if (!localParticipant) return;
    try {
      await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
    } catch (e) {
      console.error("Mic toggle error:", e);
    }
  };
  const toggleCam = async () => {
    if (!localParticipant) return;
    try {
      await localParticipant.setCameraEnabled(!isCameraEnabled);
    } catch (e) {
      console.error("Cam toggle error:", e);
    }
  };
  const toggleScreenShare = async () => {
    if (!localParticipant || isTogglingScreen) return;
    setIsTogglingScreen(true);
    try {
      const next = !isScreenSharing;
      await localParticipant.setScreenShareEnabled(next, {
        audio: true,
        selfBrowserSurface: "include",
        surfaceSwitching: "include",
      });
      setIsScreenSharing(next);
      // Listen for the user stopping share via the browser's native "Stop sharing" button
      if (next) {
        const screenTracks = localParticipant
          .getTrackPublications()
          .filter(
            (pub) =>
              pub.source === "screen_share" ||
              pub.trackName?.includes("screen"),
          );
        const firstTrack = screenTracks[0]?.track as any;
        if (firstTrack?.mediaStreamTrack) {
          firstTrack.mediaStreamTrack.addEventListener(
            "ended",
            () => {
              setIsScreenSharing(false);
            },
            { once: true },
          );
        }
      }
    } catch (e: any) {
      // User cancelled the picker — not an error
      if (e?.name !== "NotAllowedError") {
        console.error("Screen share toggle error:", e);
      }
      setIsScreenSharing(false);
    } finally {
      setIsTogglingScreen(false);
    }
  };

  const [showMicTooltip, setShowMicTooltip] = useState(false);
  const hasShownTooltipRef = useRef(false);

  useEffect(() => {
    // Show tooltip if muted in voice/video mode, and hasn't been shown yet
    if (
      !isMicrophoneEnabled &&
      (mode === "voice" || mode === "video") &&
      !hasShownTooltipRef.current
    ) {
      const timer = setTimeout(() => {
        setShowMicTooltip(true);
        hasShownTooltipRef.current = true;
      }, 1500); // Small delay after connecting
      return () => clearTimeout(timer);
    }
  }, [isMicrophoneEnabled, mode]);

  const allControls = [
    {
      icon: isMicrophoneEnabled ? (
        <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
      ) : (
        <MicOff className="h-4 w-4 sm:h-5 sm:w-5" />
      ),
      label: isMicrophoneEnabled ? "Mute" : "Unmute",
      onClick: () => {
        toggleMic();
        setShowMicTooltip(false);
      },
      danger: false,
      pulse: isMicrophoneEnabled,
      alertPulse:
        !isMicrophoneEnabled && (mode === "voice" || mode === "video"),
      active: false,
      hideInChat: true,
    },
    {
      icon: isCameraEnabled ? (
        <Video className="h-4 w-4 sm:h-5 sm:w-5" />
      ) : (
        <VideoOff className="h-4 w-4 sm:h-5 sm:w-5" />
      ),
      label: isCameraEnabled ? "Stop Video" : "Video",
      onClick: toggleCam,
      danger: false,
      pulse: false,
      active: false,
      hideInChat: true,
    },
    {
      icon: <PhoneOff className="h-4 w-4 sm:h-5 sm:w-5" />,
      label: "End",
      onClick: onEnd,
      danger: true,
      pulse: false,
      active: false,
      hideInChat: false,
    },
    {
      icon: <Monitor className="h-4 w-4 sm:h-5 sm:w-5" />,
      label: isScreenSharing ? "Stop Share" : "Share",
      onClick: toggleScreenShare,
      danger: false,
      pulse: false,
      active: isScreenSharing,
      hideInChat: false,
    },
    {
      icon: <MoreHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />,
      label: "More",
      onClick: () => {
        setShowComingSoon(true);
        setTimeout(() => setShowComingSoon(false), 2500);
      },
      danger: false,
      pulse: false,
      active: false,
      hideInChat: false,
    },
  ];

  // In chat mode, mic and camera are shown but disabled (greyed out)
  // In voice mode, video is also disabled
  const isChat = mode === "avatar-chat";
  const isVoice = mode === "voice";
  const controls = allControls;

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 md:gap-4 px-1">
      {controls.map((c) => {
        const isVideoButton = c.label === "Video" || c.label === "Stop Video";
        const isEffectivelyDisabled =
          (isChat && c.hideInChat) || (isVoice && isVideoButton);

        return (
          <button
            key={c.label}
            onClick={isEffectivelyDisabled ? undefined : c.onClick}
            disabled={
              isEffectivelyDisabled ||
              (c.label === "Share" || c.label === "Stop Share"
                ? isTogglingScreen
                : false)
            }
            className={`relative flex flex-col items-center gap-0.5 sm:gap-1 p-2 sm:p-2.5 md:p-3 rounded-xl sm:rounded-2xl transition-all group min-w-[44px] sm:min-w-0 ${
              isEffectivelyDisabled
                ? "opacity-60 cursor-not-allowed bg-white/5 text-white/30"
                : `cursor-pointer disabled:opacity-60 disabled:cursor-wait ${
                    c.danger
                      ? "bg-red-500/90 hover:bg-red-600 text-white shadow-[0_4px_20px_rgba(239,68,68,0.4)]"
                      : c.active
                        ? "bg-[#00b4d8]/20 border border-[#00b4d8]/50 text-[#00d4f5] hover:bg-[#00b4d8]/30 backdrop-blur-md shadow-[0_0_12px_rgba(0,180,216,0.3)]"
                        : "bg-white/10 hover:bg-white/20 text-white/80 hover:text-white backdrop-blur-md"
                  }`
            }`}
          >
            {/* Mic pulse glow ring */}
            {!isEffectivelyDisabled && c.pulse && (
              <motion.div
                className="absolute inset-0 rounded-2xl border-2 border-green-400/60"
                animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.08, 1] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}
            {/* Mic alert pulse (when muted in voice/video) */}
            {!isEffectivelyDisabled && (c as any).alertPulse && (
              <motion.div
                className="absolute inset-0 rounded-2xl border-2 border-[#00b4d8]/80"
                animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.15, 1] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}
            {/* Screen share active ring */}
            {c.active && (
              <motion.div
                className="absolute inset-0 rounded-2xl border-2 border-[#00b4d8]/50"
                animate={{ opacity: [0.3, 0.9, 0.3], scale: [1, 1.06, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}

            <AnimatePresence>
              {c.label === "Unmute" &&
                showMicTooltip &&
                !isEffectivelyDisabled && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute -top-14 left-1/2 -translate-x-1/2 z-[100] px-3 py-2 bg-[#00b4d8] text-white text-[10px] font-bold rounded-xl shadow-xl whitespace-nowrap"
                  >
                    Click to speak
                    <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-[#00b4d8] rotate-45" />
                  </motion.div>
                )}
            </AnimatePresence>

            {/* Coming Soon tooltip — Loan Officer button only */}
            <AnimatePresence>
              {c.label === "More" && showComingSoon && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="absolute -top-14 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2.5 px-4 py-2 bg-[#1a1a1a] border border-white/10 text-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] whitespace-nowrap pointer-events-none"
                >
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-white/10 text-gray-300">
                    <Clock className="w-3 h-3" />
                  </div>
                  <span className="text-[11px] font-medium tracking-wide text-gray-100">
                    Coming Soon
                  </span>
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#1a1a1a] border-b border-r border-white/10 rotate-45 rounded-sm" />
                </motion.div>
              )}
            </AnimatePresence>

            <span className="group-hover:scale-110 transition-transform">
              {c.icon}
            </span>
            <span className="text-[8px] sm:text-[9px] md:text-[10px] font-semibold tracking-wide">
              {c.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Real-time transcript overlay — listens to agent speech events */
function TranscriptOverlay() {
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

/** Cycling suggested commands near the control bar */
function SuggestedCommands() {
  const commands = [
    "Try: 'Switch to Voice mode'",
    "Try: 'Let's chat via text'",
    "Try: 'Enable your camera'",
    "Try: 'Help me with mortgage'",
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % commands.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [commands.length]);

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.5 }}
          className="bg-black/40 backdrop-blur-sm text-white/80 text-[11px] px-3 py-1 rounded-full border border-white/10"
        >
          {commands[index]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** Contextual help overlay with a '?' icon */
function ContextualHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  useEffect(() => {
    // Hide initial tooltip after 10 seconds
    const timer = setTimeout(() => setShowTooltip(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="absolute top-4 right-4 z-50">
      <AnimatePresence>
        {showTooltip && !isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute right-12 top-0 bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg mr-2"
          >
            Need help? Click here
            <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 transform rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowTooltip(false);
        }}
        className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 transition-colors cursor-pointer"
      >
        <span className="font-bold text-sm">?</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, transformOrigin: "top right" }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-10 right-0 w-64 bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl"
          >
            <h4 className="text-white font-semibold text-sm mb-2">
              Available Modes
            </h4>
            <ul className="text-white/70 text-[11px] space-y-2.5">
              <li className="flex items-start gap-2">
                <span className="text-[#00b4d8] mt-0.5">•</span>
                <span><strong>Video:</strong> Interactive face-to-face virtual avatar</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00b4d8] mt-0.5">•</span>
                <span><strong>Voice:</strong> Spoken audio-only conversation with Ailana</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00b4d8] mt-0.5">•</span>
                <span><strong>Chat:</strong> Text-only conversation with Ailana</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00b4d8] mt-0.5">•</span>
                <span><strong>Officer:</strong> Direct transfer to a human Loan Officer</span>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** In-room chat panel using LiveKit useChat(), displayed as side panel */
function InRoomChatPanel({ isActive }: { isActive?: boolean }) {
  const { chatMessages, send, isSending } = useChat();
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
        `[ui]: 🔊 Avatar voice ${nextState ? "ENABLED (voice mode)" : "DISABLED (text-only mode)"}`,
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

    // Add manual chat messages
    chatMessages.forEach((msg) => {
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
        // Don't show empty transcripts
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
              className={`flex gap-2.5 max-w-[90%] ${msg.isAgent ? "mr-auto" : "ml-auto flex-row-reverse"}`}
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
                  className={`text-[10px] text-gray-400 font-medium px-1 ${msg.isAgent ? "" : "text-right"}`}
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

export default function FloatingCTA() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [flowPhase, setFlowPhase] = useState<FlowPhase>("idle");
  const [isIntroComplete, setIsIntroComplete] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [lkUrl, setLkUrl] = useState<string | null>(null);
  const [keyframeMetaData, setKeyframeMetaData] = useState<any>(null);
  const [isLkConnected, setIsLkConnected] = useState(false);
  const [isAgentReady, setIsAgentReady] = useState(false);
  const [pendingMode, setPendingMode] = useState<PendingMode>("video");
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [roomName, setRoomName] = useState<string>("");
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isIntroBlurring, setIsIntroBlurring] = useState(true);
  const [complianceChecked, setComplianceChecked] = useState(false);
  const [isAnnouncementStarted, setIsAnnouncementStarted] = useState(false);
  const [isAnnouncementComplete, setIsAnnouncementComplete] = useState(false);
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>("");
  const [isOffline, setIsOffline] = useState(false);
  const [showEndCallConfirm, setShowEndCallConfirm] = useState(false);
  const [showInactivityPrompt, setShowInactivityPrompt] = useState(false);
  const [inactivityCountdown, setInactivityCountdown] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoanOfficerComingSoon, setShowLoanOfficerComingSoon] =
    useState(false);
  const introVideoRef = useRef<HTMLVideoElement>(null);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityWatchdogRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityCountdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityAtRef = useRef<number>(Date.now());
  const searchParams = useSearchParams();

  const isFetchingRef = useRef(false);
  const participantIdentityRef = useRef<string | null>(null);
  // Track current phase in a ref so async callbacks (fetchToken) always read the latest value
  const flowPhaseRef = useRef<FlowPhase>("idle");

  const [mloClosingCountdown, setMloClosingCountdown] = useState<number | null>(
    null,
  );

  const [mloParticipantJoined, setMloParticipantJoined] = useState(false);
  const [mloParticipantName, setMloParticipantName] = useState<string | null>(null);
  const [mloCallSeconds, setMloCallSeconds] = useState(0);

  const handleMloStatusChange = useCallback((joined: boolean, name: string | null) => {
    setMloParticipantJoined(joined);
    if (name) {
      setMloParticipantName(name);
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (flowPhase === "live" && pendingMode === "loan-officer" && mloParticipantJoined) {
      interval = setInterval(() => {
        setMloCallSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [flowPhase, pendingMode, mloParticipantJoined]);

  useEffect(() => {
    if (mloClosingCountdown === null) return;
    if (mloClosingCountdown <= 0) {
      setIsOpen(false);
      setMloClosingCountdown(null);
      return;
    }
    const timer = setTimeout(() => {
      setMloClosingCountdown(mloClosingCountdown - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [mloClosingCountdown]);

  const fetchToken = async (mode?: PendingMode, forceNewRoom = false) => {
    // Prevent concurrent duplicate calls (e.g. compliance agree + mode button)
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      // Only show 'connecting' if we aren't already in a meaningful phase
      // Don't override intro phase — the CTA already set it to 'intro'
      const currentPhase = flowPhaseRef.current;
      if (currentPhase === "idle" && mode !== "intro-avatar") {
        setFlowPhase("connecting");
        flowPhaseRef.current = "connecting";
      }

      // Only reset intro state when actually starting an intro flow,
      // not on reconnections that skip straight to live.
      if (mode === "intro-avatar") {
        setIsIntroComplete(false);
      }
      if (!isLkConnected) {
        setKeyframeMetaData(null);
      }

      const urlRoom = searchParams.get("room");
      const generatedRoomName =
        urlRoom ||
        (!forceNewRoom && roomName
          ? roomName
          : `room-${Math.random().toString(36).substring(2, 11)}`);

      if (!roomName || roomName !== generatedRoomName) {
        setRoomName(generatedRoomName);
      }

      const activeMode = mode ?? pendingMode;

      if (!participantIdentityRef.current) {
        participantIdentityRef.current = `guest_${Math.floor(Math.random() * 10000)}`;
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
      const response = await fetch(`${backendUrl}/api/get-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: generatedRoomName,
          participantName: participantIdentityRef.current,
          metadata: JSON.stringify({ mode: activeMode }),
          mode: activeMode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 503) {
          console.error(
            "[fetchToken]: Server configuration error:",
            errorData.details,
          );
          setConnectionStatus("Server Error: Missing Config");
        }
        throw new Error("Failed to fetch LiveKit token");
      }

      const data = await response.json();

      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }

      setToken(data.token);
      setLkUrl(data.serverUrl);

      // Provider Fallback Logic:
      // If user requested video/avatar but service returned no metadata, downgrade to voice
      if (!data.keyframe && activeMode !== "voice") {
        console.warn(
          "[fetchToken]: Avatar service unavailable. Falling back to Voice.",
        );
        setIsFallbackMode(true);
        setPendingMode("voice");
        setConnectionStatus("Avatar unavailable. Switching to Voice...");
      } else {
        setKeyframeMetaData(data.keyframe ?? null);
        setIsFallbackMode(false);
        setConnectionStatus("");
      }

      // Use the ref to read the phase at the time the async call resolves (avoids stale closure)
      if (flowPhaseRef.current !== "intro") {
        const nextPhase = mode === "intro-avatar" ? "intro" : "live";
        setFlowPhase(nextPhase);
        flowPhaseRef.current = nextPhase;
      }
    } catch (err) {
      console.error("Error connecting to LiveKit:", err);
      setFlowPhase("error");
      flowPhaseRef.current = "error";
      setIsIntroComplete(false);
      setIsFallbackMode(false);
    } finally {
      isFetchingRef.current = false;
    }
  };

  const handleAIAction = (mode: PendingMode) => {
    if (mode === 'loan-officer') {
      console.log(`[ui-loan-officer]: 🔘 User clicked 'Loan Officer' button. Current mode: ${pendingMode}, flowPhase: ${flowPhase}`);
    }
    setIsOpen(true);
    if (flowPhase === 'live' && pendingMode === mode) {
      if (mode === 'loan-officer') console.log(`[ui-loan-officer]: ⚠️ Already in 'live' phase with 'loan-officer' mode. Ignoring click.`);
      return;
    }

    setPendingMode(mode);
    if (!hasAgreed) {
      if (mode === 'loan-officer') console.log(`[ui-loan-officer]: 📝 User hasn't agreed to terms yet. Showing compliance gate.`);
      setFlowPhase('intro');
      setIsIntroComplete(true); // Skip intro video, show compliance directly
    } else {
      if (isLkConnected || flowPhase === 'intro' || flowPhase === 'live') {
        if (mode === 'loan-officer') console.log(`[ui-loan-officer]: ✅ User agreed, already connected (or in intro/live). Transitioning to live mode.`);
        if (!keyframeMetaData && mode !== 'voice') {
          fetchToken(mode);
        }
        setFlowPhase("live");
        return;
      }
      if (mode === 'loan-officer') console.log(`[ui-loan-officer]: 🔄 Not connected yet, fetching LiveKit token for mode...`);
      fetchToken(mode);
    }
  };

  useEffect(() => {
    const sharedRoom = searchParams.get("room");
    if (sharedRoom) {
      setRoomName(sharedRoom);
      setIsOpen(true);
    }
  }, [searchParams]);

  // Centralised session reset — nukes all LiveKit / flow state so the
  // intro → compliance → live flow can replay cleanly.
  const resetSession = () => {
    setFlowPhase("idle");
    flowPhaseRef.current = "idle";
    setToken(null);
    setLkUrl(null);
    setIsLkConnected(false);
    setIsAgentReady(false);
    setRoomName("");
    setIsVideoReady(false);
    setIsIntroBlurring(true);
    setKeyframeMetaData(null);
    setHasAgreed(false);
    setIsIntroComplete(false);
    setComplianceChecked(false);
    setPendingMode("video");
    setIsAnnouncementStarted(false);
    setIsAnnouncementComplete(false);
    setConnectionStatus("");
    setIsOffline(false);
    setShowEndCallConfirm(false);
    setShowInactivityPrompt(false);
    participantIdentityRef.current = null;
    isFetchingRef.current = false;
    setIsSubmitting(false);
    hasAnnouncedRef.current = false;
    setMloParticipantJoined(false);
    setMloParticipantName(null);
    setMloCallSeconds(0);
  };

  // Full restart: tear down the broken connection and establish a fresh one.
  // Skips intro + compliance since the user already completed those.
  const restartSession = (modeOverride?: PendingMode) => {
    const mode =
      modeOverride || (pendingMode === "intro-avatar" ? "video" : pendingMode || "video");

    // Reset connection state
    setToken(null);
    setLkUrl(null);
    setIsLkConnected(false);
    setIsAgentReady(false);
    setRoomName("");
    setKeyframeMetaData(null);
    setIsVideoReady(false);
    setConnectionStatus("");
    setIsOffline(false);
    setShowEndCallConfirm(false);
    setShowInactivityPrompt(false);
    // Skip the recording announcement on reconnect — user already heard it.
    // This is critical: ChannelStartTrigger won't fire until isAnnouncementComplete is true.
    setIsAnnouncementStarted(true);
    setIsAnnouncementComplete(true);
    hasAnnouncedRef.current = true;
    participantIdentityRef.current = null;
    isFetchingRef.current = false;
    setMloCallSeconds(0);

    // Explicitly force-skip intro + compliance (user already did these)
    setHasAgreed(true);
    setIsIntroComplete(true);
    setComplianceChecked(true);
    setIsIntroBlurring(false);

    // Set connecting phase and fetch fresh token
    setFlowPhase("connecting");
    flowPhaseRef.current = "connecting";

    setTimeout(() => {
      setIsOpen(true);
      setPendingMode(mode);
      fetchToken(mode, true); // Force a completely new room
    }, 0);
  };

  // Reset ALL session state when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetSession();
    }
  }, [isOpen]);

  // Browser network state guard: show a clear alert when connectivity drops.
  useEffect(() => {
    if (!isOpen || typeof window === "undefined") return;

    const handleOffline = () => {
      setIsOffline(true);
      setConnectionStatus(
        "Internet connection lost. Reconnect to continue with Ailana.",
      );
      setFlowPhase("error");
      flowPhaseRef.current = "error";
      setIsLkConnected(false);
      setIsAgentReady(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      if (flowPhaseRef.current === "error") {
        // Connection was lost and is now back — auto-restart the session
        // since the old LiveKit room / agent is dead anyway.
        setConnectionStatus("Connection restored. Restarting session…");
        // Small delay so the user sees the "restored" message briefly
        setTimeout(() => {
          restartSession();
        }, 1200);
      }
    };

    setIsOffline(!window.navigator.onLine);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || flowPhase !== "live" || !isLkConnected) {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      if (inactivityWatchdogRef.current) {
        clearInterval(inactivityWatchdogRef.current);
        inactivityWatchdogRef.current = null;
      }
      setShowInactivityPrompt(false);
      if (inactivityCountdownIntervalRef.current) {
        clearInterval(inactivityCountdownIntervalRef.current);
        inactivityCountdownIntervalRef.current = null;
      }
      return;
    }

    const INACTIVITY_MS = 90_000; // 1.5 minutes

    const markActivity = () => {
      lastActivityAtRef.current = Date.now();
      setConnectionStatus("");
    };

    const armTimeout = () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      inactivityTimerRef.current = setTimeout(() => {
        setShowInactivityPrompt(true);
      }, INACTIVITY_MS);
    };

    const activityEvents: Array<string> = [
      "pointerdown",
      "pointermove",
      "mousemove",
      "keydown",
      "touchstart",
      "wheel",
      "agent_activity",
    ];
    const onActivity = () => {
      // Once the inactivity prompt is visible, ignore activity events so the
      // user can actually click the popup buttons without it vanishing.
      if (showInactivityPrompt) return;
      markActivity();
      armTimeout();
    };

    activityEvents.forEach((evt) => window.addEventListener(evt, onActivity));
    if (!showInactivityPrompt) {
      markActivity();
      armTimeout();
    }

    // Extra watchdog so prompt still appears even if a timeout gets interrupted/reset unexpectedly.
    inactivityWatchdogRef.current = setInterval(() => {
      if (showInactivityPrompt) return; // already showing, don't re-trigger
      const idleFor = Date.now() - lastActivityAtRef.current;
      if (idleFor >= INACTIVITY_MS) {
        setShowInactivityPrompt(true);
      }
    }, 5000);

    return () => {
      activityEvents.forEach((evt) =>
        window.removeEventListener(evt, onActivity),
      );
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      if (inactivityWatchdogRef.current) {
        clearInterval(inactivityWatchdogRef.current);
        inactivityWatchdogRef.current = null;
      }
    };
  }, [isOpen, flowPhase, isLkConnected, showInactivityPrompt]);

  useEffect(() => {
    if (!showInactivityPrompt) {
      if (inactivityCountdownIntervalRef.current) {
        clearInterval(inactivityCountdownIntervalRef.current);
        inactivityCountdownIntervalRef.current = null;
      }
      setInactivityCountdown(10);
      return;
    }

    setInactivityCountdown(10);
    inactivityCountdownIntervalRef.current = setInterval(() => {
      setInactivityCountdown((prev) => {
        if (prev <= 1) {
          if (inactivityCountdownIntervalRef.current) {
            clearInterval(inactivityCountdownIntervalRef.current);
            inactivityCountdownIntervalRef.current = null;
          }
          setShowInactivityPrompt(false);
          setShowEndCallConfirm(false);
          setIsOpen(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (inactivityCountdownIntervalRef.current) {
        clearInterval(inactivityCountdownIntervalRef.current);
        inactivityCountdownIntervalRef.current = null;
      }
    };
  }, [showInactivityPrompt]);

  const requestEndCall = () => {
    if (flowPhase === "live" && isLkConnected) {
      setShowEndCallConfirm(true);
      return;
    }
    setIsOpen(false);
  };

  const confirmEndCall = () => {
    setShowEndCallConfirm(false);
    setShowInactivityPrompt(false);

    if (pendingMode === "loan-officer") {
      setToken(null);
      setLkUrl(null);
      setIsLkConnected(false);
      setFlowPhase("closing-mlo");
      setMloClosingCountdown(10);
    } else {
      setIsOpen(false);
    }
  };

  // Handle the 2-second blur transition once video is ready
  useEffect(() => {
    if (isVideoReady && flowPhase === "intro") {
      const timer = setTimeout(() => {
        setIsIntroBlurring(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isVideoReady, flowPhase]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const hasAnnouncedRef = useRef(false);

  useEffect(() => {
    if (
      flowPhase === "live" &&
      isLkConnected &&
      typeof window !== "undefined"
    ) {
      if (hasAnnouncedRef.current) return;

      const announce = () => {
        if (hasAnnouncedRef.current) return;
        hasAnnouncedRef.current = true;

        const announcement = new SpeechSynthesisUtterance(
          "This session is being recorded for regulatory and compliance purposes.",
        );
        const voices = window.speechSynthesis.getVoices();

        const femaleVoice = voices.find((v) =>
          //v.name.includes('Samantha') ||
          //v.name.includes('Female') ||
          //v.name.includes('Zira') ||
          //v.name.includes('Google UK English Female') ||
          v.name.includes("Google US English"),
        );

        if (femaleVoice) announcement.voice = femaleVoice;
        announcement.rate = 1.0;
        announcement.pitch = 1.15;
        announcement.volume = 0.9;

        announcement.onstart = () => {
          setIsAnnouncementStarted(true);
          // Pre-trigger the backend channel start so network latency
          // overlaps with the end of the TTS audio.
          setTimeout(() => setIsAnnouncementComplete(true), 990);
        };
        announcement.onend = () => {
          setIsAnnouncementComplete(true);
        };
        announcement.onerror = () => {
          setIsAnnouncementComplete(true); // fallback so session isn't stuck
        };

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(announcement);
      };

      if (window.speechSynthesis.getVoices().length > 0) {
        announce();
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
          announce();
          window.speechSynthesis.onvoiceschanged = null;
        };
      }
    } else {
      hasAnnouncedRef.current = false;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [flowPhase, isLkConnected]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLkConnected && flowPhase === "live") {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isLkConnected, flowPhase]);

  const formatTime = (totalSeconds: number) => {
    const hh = Math.floor(totalSeconds / 3600);
    const mm = Math.floor((totalSeconds % 3600) / 60);
    const ss = totalSeconds % 60;
    return `${hh.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-0 sm:p-4 md:p-6 bg-black/50 backdrop-blur-md font-sans"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key="main-stage"
                initial={{ scale: 1.05, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-[96vw] sm:w-[90vw] max-w-7xl h-[85dvh] sm:h-[92vh] min-h-0 sm:min-h-[500px] max-h-none sm:max-h-[960px] bg-[#0B0F19] rounded-2xl sm:rounded-3xl shadow-[0_8px_60px_rgba(0,180,216,0.25),0_0_0_1px_rgba(0,180,216,0.08)] flex flex-col overflow-hidden border border-white/20"
              >
                {isOffline && (
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[220] px-4 py-2 rounded-full bg-red-500/90 text-white text-xs font-bold tracking-wide border border-white/20 shadow-[0_8px_25px_rgba(239,68,68,0.35)]">
                    Internet connection lost
                  </div>
                )}
                {showInactivityPrompt && (
                  <div className="absolute inset-0 z-[230] flex items-center justify-center bg-black/35 backdrop-blur-[2px] p-4">
                    <div className="w-[92%] max-w-xl bg-[#0d1220]/95 border border-white/20 rounded-2xl p-5 md:p-6 shadow-[0_0_40px_rgba(0,180,216,0.2)] backdrop-blur-xl">
                      <p className="text-white text-sm md:text-base font-semibold text-center">
                        Due to prolonged inactivity, this call with Ailana will
                        close automatically.
                      </p>
                      <p className="text-gray-300 text-xs md:text-sm mt-2 text-center">
                        Your session will end in the next{" "}
                        <span className="text-white font-bold">
                          {inactivityCountdown} second
                          {inactivityCountdown === 1 ? "" : "s"}
                        </span>
                        . Select{" "}
                        <span className="text-white font-semibold">
                          Continue Session
                        </span>{" "}
                        to stay connected.
                      </p>
                      <div className="mt-5 flex items-center justify-center gap-3">
                        <button
                          onClick={() => {
                            lastActivityAtRef.current = Date.now();
                            setShowInactivityPrompt(false);
                          }}
                          className="px-4 py-2 rounded-lg border border-white/20 text-gray-200 text-xs md:text-sm font-semibold hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          Continue Session
                        </button>
                        <button
                          onClick={() => {
                            setShowInactivityPrompt(false);
                            setShowEndCallConfirm(true);
                          }}
                          className="px-4 py-2 rounded-lg bg-red-500 text-white text-xs md:text-sm font-semibold hover:bg-red-600 transition-colors cursor-pointer"
                        >
                          End Call
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {showEndCallConfirm && (
                  <div className="absolute inset-0 z-[240] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl border border-white/20 bg-[#0d1220] p-6 shadow-2xl">
                      <h4 className="text-white text-lg font-bold tracking-tight text-center">
                        End this call?
                      </h4>
                      <p className="text-gray-300 text-sm mt-2 text-center">
                        Are you sure you want to end your session with Ailana?
                        You can continue anytime if you still need assistance.
                      </p>
                      <div className="mt-5 flex items-center justify-center gap-3">
                        <button
                          onClick={() => setShowEndCallConfirm(false)}
                          className="px-4 py-2 rounded-lg border border-white/20 text-gray-200 text-sm font-semibold hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          Continue Call
                        </button>
                        <button
                          onClick={confirmEndCall}
                          className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors cursor-pointer"
                        >
                          Yes, End Call
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="absolute inset-0 flex flex-col overflow-hidden z-0">
                  {/* ── Top Header ── */}
                  <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-2.5 md:py-4 relative z-50 shrink-0 bg-[#080c14]/95 backdrop-blur-md border-b border-white/15 gap-2">
                    {/* Logo */}
                    <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                      <div className="relative h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-transparent">
                        <Image
                          src={AppIcon}
                          alt="ConvergentAI Logo"
                          fill
                          sizes="32px"
                          className="object-contain"
                        />
                      </div>
                      <span className="hidden lg:inline font-extrabold text-white text-xs sm:text-sm md:text-lg tracking-tight">
                        ConvergentAI
                      </span>
                    </div>

                    {/* Center: Mode Switcher (live phase only) */}
                    {flowPhase === "live" && isLkConnected && isAgentReady && (
                      <div className="flex items-center bg-white/5 rounded-full p-0.5 sm:p-1 border border-white/10 shadow-sm backdrop-blur-md">
                        {([
                          { m: 'video' as PendingMode, icon: <Video className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />, label: 'Video' },
                          { m: 'voice' as PendingMode, icon: <Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />, label: 'Voice' },
                          { m: 'avatar-chat' as PendingMode, icon: <MessageCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />, label: 'Chat' },
                          { m: 'loan-officer' as PendingMode, icon: <Headset className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />, label: <><span className="hidden lg:inline">Loan Officer</span><span className="lg:hidden">Officer</span></>, disabled: false },
                        ]).map(({ m, icon, label, disabled }) => (
                          <div key={m} className="relative flex items-center">
                            <button
                              onClick={() => {
                                if (disabled) {
                                  setShowLoanOfficerComingSoon(true);
                                  setTimeout(
                                    () => setShowLoanOfficerComingSoon(false),
                                    2500,
                                  );
                                  return;
                                }
                                handleAIAction(
                                  m as "video" | "voice" | "avatar-chat",
                                );
                              }}
                              className={`flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-[9px] sm:text-xs md:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                                disabled
                                  ? "opacity-40 text-gray-400 hover:bg-white/5 cursor-not-allowed"
                                  : pendingMode === m
                                    ? "bg-gradient-to-r from-[#00b4d8] to-[#023e8a] text-white shadow-md"
                                    : "text-gray-400 hover:bg-white/10 hover:text-white"
                              }`}
                            >
                              {icon}
                              <span>{label}</span>
                            </button>
                            <AnimatePresence>
                              {disabled && showLoanOfficerComingSoon && (
                                <motion.div
                                  initial={{ opacity: 0, y: 5, scale: 0.9 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 5, scale: 0.9 }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 30,
                                  }}
                                  className="absolute top-full mt-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-4 py-2.5 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-white/20 text-white rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.8)] whitespace-nowrap pointer-events-none backdrop-blur-xl"
                                >
                                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#00b4d8]/20 text-[#00b4d8] shadow-[0_0_10px_rgba(0,180,216,0.2)]">
                                    <Clock className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="text-xs font-bold tracking-wide text-white">
                                    Coming Soon
                                  </span>
                                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#1a1a1a] border-t border-l border-white/20 rotate-45 rounded-sm" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Right: Trust indicators + Close */}
                    <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4 shrink-0">
                      {flowPhase === "live" && isLkConnected && (
                        <>
                          {/* Mobile: icon-only trust badges */}
                          <div className="flex sm:hidden items-center gap-1.5">
                            <div
                              className="flex items-center gap-0.5"
                              title="Available 24/7"
                            >
                              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.8)]" />
                              <span className="text-[8px] text-emerald-400 font-bold">
                                24/7
                              </span>
                            </div>
                            <div
                              className="flex items-center gap-0.5"
                              title="Secure & Private"
                            >
                              <Lock className="h-2.5 w-2.5 text-gray-400" />
                            </div>
                          </div>
                          {/* sm+: text labels */}
                          <div className="hidden sm:flex items-center gap-1.5 text-gray-400 text-[10px] md:text-xs font-medium">
                            <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                            <span className="hidden lg:inline">Available </span>
                            24/7
                          </div>
                          <div className="hidden sm:flex items-center gap-1.5 text-gray-400 text-xs font-medium">
                            <Lock className="h-3 w-3" />
                            <span className="hidden lg:inline">
                              Secure &amp; Private
                            </span>
                          </div>
                        </>
                      )}
                      <button
                        onClick={requestEndCall}
                        className="p-1.5 sm:p-2 rounded-full bg-white/5 text-gray-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer shrink-0"
                      >
                        <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                  </div>

                  {/* ── Main Content ── */}
                  <div className="flex-1 min-h-0 relative w-full flex flex-col items-center justify-center overflow-hidden bg-transparent">
                    <AnimatePresence>
                      {flowPhase === "idle" && (
                        <motion.div
                          key="idle-view"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col items-center justify-center"
                        >
                          <motion.div
                            animate={{
                              y: [0, -8, 0],
                              rotate: [0, 0, -15, 15, -10, 10, 0, 0],
                            }}
                            transition={{
                              duration: 4,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                            className="origin-bottom relative z-10 w-32 h-32 md:w-44 md:h-44 mb-8 rounded-full overflow-hidden border-[6px] md:border-8 border-[#0B0F19] shadow-[0_0_40px_rgba(0,180,216,0.3)]"
                          >
                            <Image
                              src="/friendly_ai_avatar_v2.png"
                              alt="AI Assistant"
                              fill
                              sizes="(max-width: 768px) 128px, 176px"
                              className="object-cover"
                            />
                          </motion.div>
                          <button
                            onClick={() => {}}
                            className="relative z-10 bg-[#0B0F19]/80 backdrop-blur-sm px-6 md:px-8 py-3 md:py-4 rounded-2xl shadow-lg border border-white/10 transform -translate-y-4 max-w-[280px] md:max-w-sm text-center cursor-pointer hover:bg-white/5 transition-colors"
                          >
                            <p className="text-gray-200 font-medium text-sm md:text-lg">
                              Get instant answers to your mortgage questions...
                            </p>
                          </button>
                        </motion.div>
                      )}

                      {/* ── Independent Intro Video Flow (Shows immediately with blur) ── */}
                      {flowPhase === "intro" && (
                        <motion.div
                          key="intro-video-stage"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute inset-0 z-[120] bg-black flex items-center justify-center overflow-hidden"
                        >
                          <video
                            ref={introVideoRef}
                            src="/ailana_intro.mp4"
                            autoPlay
                            playsInline
                            className="w-full h-full object-contain bg-black"
                            onLoadedData={() => setIsVideoReady(true)}
                            onTimeUpdate={(e) => {
                              const video = e.currentTarget;
                              if (
                                video.duration > 0 &&
                                video.currentTime >= video.duration - 1.0
                              ) {
                                setIsIntroComplete(true);
                              }
                            }}
                            onEnded={() => setIsIntroComplete(true)}
                          />

                          <AnimatePresence>
                            {isIntroBlurring && (
                              <motion.div
                                key="intro-loader-logo"
                                initial={{ opacity: 1 }}
                                animate={{ opacity: 1 }}
                                exit={{
                                  opacity: 0,
                                  transition: { duration: 0.5 },
                                }}
                                className="absolute inset-0 z-[160] flex flex-col items-center justify-center pointer-events-none bg-black/70"
                              >
                                <div
                                  className="w-24 h-24 drop-shadow-[0_0_15px_rgba(0,180,216,0.5)] animate-spin"
                                  style={{ animationDuration: "2s" }}
                                >
                                  <img
                                    src="/favicon.png"
                                    alt="Loading..."
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <AnimatePresence>
                            {isIntroComplete && !hasAgreed && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute inset-0 z-[130] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 sm:p-8"
                              >
                                <div className="max-w-2xl w-full bg-[#0d1220]/95 border border-white/20 rounded-3xl p-5 sm:p-6 md:p-10 shadow-[0_0_60px_rgba(0,180,216,0.3),0_0_0_1px_rgba(0,180,216,0.08)] flex flex-col gap-4 sm:gap-6 overflow-hidden max-h-[96%]">
                                  <div className="text-center space-y-1 sm:space-y-2 shrink-0">
                                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
                                      Commitment to Transparency & AI Use
                                    </h3>
                                    <p className="text-gray-400 text-xs sm:text-sm">
                                      Please review and accept our terms to get
                                      started.
                                    </p>
                                  </div>

                                  <div className="flex-1 min-h-[100px] overflow-y-auto custom-scrollbar bg-black/40 rounded-xl p-3 sm:p-4 border border-white/5 text-gray-300 text-xs md:text-sm leading-relaxed max-h-[300px]">
                                    <h4 className="font-bold text-white mb-2">
                                      Terms and Conditions for ConvergentAI
                                    </h4>
                                    <p className="mb-4">
                                      1. Introduction: By using our AI
                                      assistant, you agree to these terms. Our
                                      assistant uses real-time voice and video
                                      processing to provide mortgage-related
                                      information.
                                    </p>
                                    <p className="mb-4">
                                      2. Data Privacy: We value your privacy.
                                      Conversations are recorded and processed
                                      to improve our service and for regulatory
                                      compliance. Your personal data is handled
                                      according to our Privacy Policy.
                                    </p>
                                    <p className="mb-4">
                                      3. No Financial Advice: The information
                                      provided by the AI assistant is for
                                      informational purposes only and does not
                                      constitute financial, legal, or
                                      professional advice. Always consult with a
                                      qualified professional for mortgage
                                      decisions.
                                    </p>
                                    <p className="mb-4">
                                      4. User Responsibility: You are
                                      responsible for the information you
                                      provide and the actions you take based on
                                      the AI's responses.
                                    </p>
                                    <p className="mb-4">
                                      5. Recording Disclosure: This session may
                                      be recorded for quality assurance and
                                      compliance purposes. By continuing, you
                                      consent to such recording.
                                    </p>
                                  </div>

                                  <div className="flex flex-col gap-4 sm:gap-6 shrink-0 mt-2">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                      <div className="relative flex items-center justify-center">
                                        <input
                                          type="checkbox"
                                          className="sr-only"
                                          checked={complianceChecked}
                                          onChange={(e) =>
                                            setComplianceChecked(
                                              e.target.checked,
                                            )
                                          }
                                        />
                                        <div
                                          className={`h-5 w-5 rounded border transition-all flex items-center justify-center ${complianceChecked ? "bg-[#00b4d8] border-[#00b4d8]" : "bg-white/5 border-white/20 group-hover:border-[#00b4d8]/50"}`}
                                        >
                                          {complianceChecked && (
                                            <Check className="h-3.5 w-3.5 text-white stroke-[3px]" />
                                          )}
                                        </div>
                                      </div>
                                      <span className="text-gray-300 text-xs md:text-sm font-medium select-none">
                                        I have read and agree to the compliance
                                        terms above
                                      </span>
                                    </label>

                                    <div className="flex flex-col sm:flex-row gap-3">
                                      <button
                                        onClick={() => setIsOpen(false)}
                                        className="flex-1 py-3 px-6 rounded-xl border border-white/10 text-gray-400 font-bold hover:bg-white/5 transition-colors cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        disabled={
                                          !complianceChecked || isSubmitting
                                        }
                                        onClick={() => {
                                          setIsSubmitting(true);
                                          setPendingMode("video");
                                          setHasAgreed(true);
                                          setFlowPhase("live");
                                        }}
                                        className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group cursor-pointer ${complianceChecked && !isSubmitting ? "bg-white text-black hover:bg-[#00b4d8] hover:text-white shadow-[0_10px_20px_rgba(0,180,216,0.2)]" : "bg-white/5 text-gray-500 cursor-not-allowed border border-white/5"}`}
                                      >
                                        {isSubmitting ? (
                                          <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                          <>
                                            Get started
                                            <ArrowRight
                                              className={`h-4 w-4 transition-transform ${complianceChecked ? "group-hover:translate-x-1" : ""}`}
                                            />
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )}

                      {flowPhase === "connecting" && (
                        <motion.div
                          key="connecting-view"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col items-center justify-center text-center px-6"
                        >
                          <div className="relative mb-8">
                            <div className="absolute inset-0 rounded-full border-2 border-[#00b4d8]/20 animate-ping" />
                            <Loader2 className="h-16 w-16 text-[#00b4d8] animate-spin opacity-40" />
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
                            Initializing Session
                          </h3>
                          <p className="text-[#00b4d8]/60 text-[10px] font-bold uppercase tracking-[0.2em]">
                            Establishing Secure Bridge
                          </p>
                        </motion.div>
                      )}

                      {(flowPhase === "live" || flowPhase === "intro") &&
                        token &&
                        lkUrl && (
                          <motion.div
                            key="live-view"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 flex flex-col items-center justify-center p-0"
                          >
                            <LiveKitRoom
                              key={roomName}
                              video={false}
                              audio={false}
                              token={token || ""}
                              serverUrl={lkUrl || ""}
                              connect={true}
                              data-lk-theme="default"
                              className="w-full h-full"
                              onConnected={() => setIsLkConnected(true)}
                              onDisconnected={() => {
                                // Only transition to error if we're not already restarting
                                if (flowPhaseRef.current === "connecting")
                                  return;
                                setConnectionStatus(
                                  typeof window !== "undefined" &&
                                    !window.navigator.onLine
                                    ? "Internet connection lost. Reconnect to continue with Ailana."
                                    : "Connection with Ailana was interrupted. Please retry.",
                                );
                                setFlowPhase("error");
                                flowPhaseRef.current = "error";
                                setToken(null);
                                setLkUrl(null);
                                setIsLkConnected(false);
                                setIsAgentReady(false);
                                setRecordingSeconds(0);
                                setRoomName("");
                                setIsVideoReady(false);
                              }}
                            >
                              <AgentReadinessCheck
                                onAgentReady={setIsAgentReady}
                              />
                              <MloDetector onMloStatusChange={handleMloStatusChange} />
                              <MediaGuard mode={pendingMode} />
                              <ActivityTracker />
                              <ChannelStartTrigger
                                isLivePhase={flowPhase === "live"}
                                mode={pendingMode}
                                isAnnouncementComplete={isAnnouncementComplete}
                              />

                              {/* Fallback Notification Overlay */}
                              <AnimatePresence>
                                {isFallbackMode && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="absolute top-16 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[280px]"
                                  >
                                    <div className="bg-amber-500 text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-center shadow-[0_0_30px_rgba(245,158,11,0.3)] border border-white/20">
                                      {connectionStatus ||
                                        "Avatar Unavailable - Using Voice"}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              {/* ── Google Meet Split Layout (always mounted so avatar connection doesn't drop, but hidden until live) ── */}
                              <div
                                className={
                                  flowPhase === "live"
                                    ? "flex-1 flex flex-col min-h-0 absolute inset-0 z-10"
                                    : "opacity-0 pointer-events-none absolute inset-0 -z-10"
                                }
                              >
                                <div
                                  className={`flex-1 flex min-h-0 p-2 md:p-3 gap-2 md:gap-3 ${pendingMode === "avatar-chat" ? "flex-col md:flex-row" : "flex-row"}`}
                                >
                                  {/* Left: Avatar Area */}
                                  <div
                                    className={`relative rounded-2xl overflow-hidden bg-black shadow-xl ${pendingMode === "avatar-chat" ? "h-[42%] md:h-auto md:flex-1" : "flex-1"}`}
                                  >
                                    {/* REC badge - only when connected and announcement started */}
                                    {isLkConnected &&
                                      isAgentReady &&
                                      isAnnouncementStarted && (
                                        <div className="absolute top-3 left-3 z-50 flex items-center gap-1.5 sm:gap-2 bg-black/50 backdrop-blur-md p-1.5 sm:px-2.5 sm:py-1 rounded-full border border-red-500/30">
                                          <motion.div
                                            animate={{ opacity: [1, 0.4, 1] }}
                                            transition={{
                                              duration: 1.5,
                                              repeat: Infinity,
                                              ease: "easeInOut",
                                            }}
                                          >
                                            <Circle className="h-2.5 w-2.5 fill-red-500 text-red-500" />
                                          </motion.div>
                                          <span className="hidden sm:inline text-[9px] font-black text-white uppercase tracking-widest">
                                            Rec
                                          </span>
                                          <span className="hidden sm:inline text-[9px] font-mono text-white/70">
                                            {formatTime(recordingSeconds)}
                                          </span>
                                        </div>
                                      )}

                                    {/* Contextual help overlay */}
                                    {isLkConnected && isAgentReady && (
                                      <ContextualHelp />
                                    )}

                                    {/* Suggested commands cycling text */}
                                    {isLkConnected && isAgentReady && (
                                      <SuggestedCommands />
                                    )}

                                    {/* Subtle connecting indicator (non-blocking) */}
                                    {(!isLkConnected || !isAgentReady) && (
                                      <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
                                        <div className="relative mb-6">
                                          <div className="absolute inset-0 rounded-full border-2 border-[#00b4d8]/30 animate-ping" />
                                          <div className="h-14 w-14 rounded-full border-2 border-[#00b4d8]/20 flex items-center justify-center">
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#00b4d8] to-[#023e8a] animate-pulse" />
                                          </div>
                                        </div>
                                        <p className="text-white/90 font-semibold text-sm">
                                          Setting up your session...
                                        </p>
                                        <p className="text-white/40 text-xs mt-1">
                                          This usually takes a few seconds
                                        </p>
                                      </div>
                                    )}

                                    <div className="absolute inset-0">
                                      {pendingMode === "loan-officer" ? (
                                        mloParticipantJoined ? (
                                          <LoanOfficerLiveUI mloName={mloParticipantName} callSeconds={mloCallSeconds} />
                                        ) : (
                                          <LoanOfficerQueueUI />
                                        )
                                      ) : (
                                        <VideoStage
                                          mode={pendingMode}
                                          keyframeMetadata={keyframeMetaData}
                                          hideControls
                                        />
                                      )}
                                    </div>

                                    {/* Real-time transcript subtitles */}
                                    {isLkConnected && isAgentReady && (
                                      <TranscriptOverlay />
                                    )}

                                    {/* Custom Controls */}
                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-50">
                                      <RoomControls
                                        onEnd={requestEndCall}
                                        mode={pendingMode}
                                      />
                                    </div>
                                  </div>

                                  {/* Right: Chat Panel — always mounted so useChat() & transcripts survive channel switches.
                                     Hidden via inline style (not conditional render) so messages persist. */}
                                  <div
                                    className="flex-col rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(0,180,216,0.1)] bg-[#050505] transition-all duration-300 min-h-0 flex-1 md:flex-none md:w-[320px] lg:w-[360px] md:shrink-0"
                                    style={{
                                      display:
                                        pendingMode === "avatar-chat"
                                          ? "flex"
                                          : "none",
                                    }}
                                  >
                                    <InRoomChatPanel
                                      isActive={pendingMode === "avatar-chat"}
                                    />
                                  </div>
                                </div>

                                {/* Trust Footer */}
                                <div className="shrink-0 px-3 py-1.5 md:py-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[9px] sm:text-[10px] md:text-xs text-gray-400 bg-[#07090f] border-t border-white/15">
                                  <span className="flex items-center gap-1">
                                    <Lock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-emerald-400" />
                                    <span className="hidden sm:inline">
                                      Your information is secure and never
                                      shared.
                                    </span>
                                    <span className="sm:hidden">
                                      Secure &amp; private.
                                    </span>
                                  </span>
                                  <span className="h-3 w-px bg-white/20 hidden sm:block" />
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-[#00b4d8]" />
                                    AI-Powered. Human-Focused. 24/7.
                                  </span>
                                </div>
                              </div>

                              {/* Always render audio for loan-officer mode (SIP audio),
                                  or when no Keyframe avatar is active (voice mode) */}
                              {(pendingMode === "loan-officer" || !keyframeMetaData) && <RoomAudioRenderer />}
                            </LiveKitRoom>
                          </motion.div>
                        )}
                    </AnimatePresence>

                    {flowPhase === "error" && (
                      <motion.div
                        key="error-view"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center text-center px-6"
                      >
                        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6">
                          <ShieldAlert className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
                          Connection Failed
                        </h3>
                        <p className="text-gray-400 text-sm max-w-[280px] mb-8">
                          {connectionStatus ||
                            "We're having trouble reaching our AI services. Please check your connection and try again."}
                        </p>
                        <button
                          onClick={() => restartSession()}
                          disabled={isOffline}
                          className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-[#00b4d8] hover:text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <RefreshCw className="h-4 w-4" />
                          {isOffline
                            ? "Waiting for Internet..."
                            : "Start New Session"}
                        </button>
                      </motion.div>
                    )}

                    {flowPhase === "closing-mlo" && (
                      <motion.div
                        key="closing-mlo-view"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col items-center justify-center px-6 w-full h-full max-w-md mx-auto"
                      >
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.1 }}
                          className="relative mb-6"
                        >
                          <div className="absolute inset-0 rounded-full bg-[#00b4d8] blur-xl opacity-30 animate-pulse" />
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00b4d8] to-[#023e8a] flex items-center justify-center shadow-lg border-4 border-[#0B0F19] relative z-10">
                            <Check className="w-10 h-10 text-white stroke-[3px]" />
                          </div>
                        </motion.div>
                        
                        <h3 className="text-3xl font-black text-white mb-2 tracking-tight">
                          Call Complete
                        </h3>
                        <p className="text-gray-400 text-sm mb-8 text-center">
                          Thank you for speaking with our Loan Officer.
                        </p>

                        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 mb-8 backdrop-blur-md">
                           <div className="flex justify-between items-center mb-3">
                             <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Duration</span>
                             <span className="text-white font-mono font-medium">{formatTime(mloCallSeconds)}</span>
                           </div>
                           <div className="flex justify-between items-center mb-4">
                             <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Officer</span>
                             <span className="text-white font-medium">{mloParticipantName ? mloParticipantName.replace('sip_', '') : 'Assigned Expert'}</span>
                           </div>
                           <div className="w-full h-px bg-white/10 mb-4" />
                           <p className="text-[10px] text-gray-500 text-center uppercase tracking-widest font-semibold leading-relaxed">
                             This conversation was recorded<br/>for quality and compliance.
                           </p>
                        </div>

                        <div className="flex flex-col gap-3 w-full">
                          <button
                            onClick={() => {
                              setMloClosingCountdown(0);
                              setIsOpen(false);
                            }}
                            className="w-full py-3.5 rounded-xl border border-white/20 text-white font-bold hover:bg-white/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                            Close Now
                          </button>
                          
                          <div className="flex items-center justify-center gap-3 my-2">
                             <div className="h-px bg-white/10 flex-1" />
                             <span className="text-xs text-gray-500 font-medium uppercase tracking-widest">Or</span>
                             <div className="h-px bg-white/10 flex-1" />
                          </div>

                          <button
                            onClick={() => {
                              setMloClosingCountdown(null);
                              restartSession("video");
                            }}
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00b4d8] to-[#023e8a] text-white font-bold hover:shadow-[0_0_20px_rgba(0,180,216,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden group"
                          >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                            <Bot className="w-5 h-5 relative z-10" />
                            <span className="relative z-10">Return to Ailana</span>
                          </button>
                        </div>

                        {/* Circular progress countdown */}
                        {mloClosingCountdown !== null && mloClosingCountdown > 0 && (
                          <div className="absolute top-6 right-6 flex items-center gap-2 opacity-50">
                             <svg className="w-5 h-5 transform -rotate-90">
                                <circle cx="10" cy="10" r="8" fill="transparent" stroke="currentColor" strokeWidth="2" className="text-white/20" />
                                <circle cx="10" cy="10" r="8" fill="transparent" stroke="currentColor" strokeWidth="2" className="text-white" strokeDasharray="50" strokeDashoffset={50 - (mloClosingCountdown / 10) * 50} />
                             </svg>
                             <span className="text-xs font-mono font-medium text-white">{mloClosingCountdown}s</span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 right-6 z-[100]">
        <motion.div
          layout
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsOpen(true);
            if (flowPhaseRef.current === "idle") {
              setFlowPhase("intro");
              flowPhaseRef.current = "intro";
              setIsIntroComplete(false);
              setPendingMode("intro-avatar");
              fetchToken("intro-avatar");
            }
          }}
          className="group relative flex items-center gap-2.5 md:gap-4 rounded-full bg-gradient-to-br from-[#00d4f5] via-[#0252c4] to-[#7b2fff] p-1.5 pr-5 md:p-2.5 md:pr-8 text-white shadow-[0_0_50px_rgba(0,212,245,0.65),0_0_25px_rgba(123,47,255,0.55),0_4px_20px_rgba(0,0,0,0.6)] transition-all duration-300 hover:shadow-[0_0_70px_rgba(0,212,245,0.85),0_0_40px_rgba(123,47,255,0.75)] hover:-translate-y-2 hover:scale-[1.02] active:scale-95 cursor-pointer border border-white/25"
        >
          <div className="relative h-10 w-10 md:h-14 md:w-14 rounded-full bg-white/25 flex items-center justify-center overflow-hidden border-2 border-white/50 backdrop-blur-sm shadow-[0_0_12px_rgba(0,212,245,0.4)]">
            <Image
              src="/friendly_ai_avatar_v2.png"
              alt="Ailana"
              fill
              sizes="(max-width: 768px) 40px, 56px"
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] md:text-xs font-bold text-white/90 uppercase tracking-[0.2em] mb-0.5 drop-shadow-sm">
              Live
            </span>
            <span className="text-[10px] md:text-xs font-bold text-white/90 uppercase tracking-[0.2em] mb-0.5 drop-shadow-sm">
              Mortgage Assistance
            </span>
            <span className="text-sm md:text-lg font-black tracking-tight text-white flex items-center gap-2 drop-shadow-sm">
              WITH AILANA (24/7)
              <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4 text-yellow-300 animate-pulse" />
            </span>
          </div>
        </motion.div>
      </div>
    </>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocalParticipant } from "@livekit/components-react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Monitor,
  MoreHorizontal,
  Clock,
} from "lucide-react";

interface RoomControlsProps {
  onEnd: () => void;
  mode: string;
}

export function RoomControls({ onEnd, mode }: RoomControlsProps) {
  if (mode === "tts-avatar") return null;
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
              pub.trackName?.includes("screen")
          );
        const firstTrack = screenTracks[0]?.track as any;
        if (firstTrack?.mediaStreamTrack) {
          firstTrack.mediaStreamTrack.addEventListener(
            "ended",
            () => {
              setIsScreenSharing(false);
            },
            { once: true }
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
  const controls = mode === "tts-avatar"
    ? allControls.filter((c) => c.label === "End")
    : allControls;

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

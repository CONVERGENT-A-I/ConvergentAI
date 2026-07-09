"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import friendlyAvatar from "../../../public/friendly_ai_avatar_v2.png";
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import {
  X,
  Phone,
  MessageCircle,
  Circle,
  Lock,
  ShieldAlert,
  RefreshCw,
  Bot,
  Video,
  Headset,
  ArrowRight,
  Clock,
  Sparkles,
  Check,
} from "lucide-react";
import "@livekit/components-styles";

// Extracted children components
import { FlowPhase, PendingMode } from "./types";
import { ActionButton } from "./action-button";
import { ComplianceGate } from "./compliance-gate";
import { RoomControls } from "./room-controls";
import { InRoomChatPanel } from "./in-room-chat-panel";
import { TranscriptOverlay } from "./transcript-overlay";
import { SuggestedCommands } from "./suggested-commands";
import { ContextualHelp } from "./contextual-help";
import { ActivityTracker } from "./activity-tracker";
import { MloDetector } from "./mlo-detector";
import { AgentReadinessCheck } from "./agent-readiness-check";
import { ChannelStartTrigger } from "./channel-start-trigger";
import { MediaGuard } from "./media-guard";
import { LoanOfficerLiveUI, LoanOfficerQueueUI } from "./loan-officer-queue";
import { NetworkQualityBanner } from "./network-quality-banner";

import VideoStage from "../video-stage";

export default function FloatingCTA() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(true);
  const [flowPhase, setFlowPhase] = useState<FlowPhase>("idle");
  const [isIntroComplete, setIsIntroComplete] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [lkUrl, setLkUrl] = useState<string | null>(null);
  const [isLkConnected, setIsLkConnected] = useState(false);
  const [isAgentReady, setIsAgentReady] = useState(false);
  const [pendingMode, setPendingMode] = useState<PendingMode>("video");
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [roomName, setRoomName] = useState<string>("");
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isIntroBlurring, setIsIntroBlurring] = useState(true);
  const [complianceChecked, setComplianceChecked] = useState(false);

  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>("");
  const [isOffline, setIsOffline] = useState(false);
  const [showEndCallConfirm, setShowEndCallConfirm] = useState(false);
  const [showLoanOfficerConfirm, setShowLoanOfficerConfirm] = useState(false);
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
  const hasOpenedRef = useRef(false);
  const searchParams = useSearchParams();

  // Suppress harmless internal LiveKit warnings that cause Next.js error overlays in dev mode during widget lifecycle
  useEffect(() => {
    if (typeof window === "undefined") return;
    const originalError = console.error;
    console.error = (...args: any[]) => {
      if (
        typeof args[0] === "string" &&
        (args[0].includes("Tried to add a track for a participant, that's not present") ||
          args[0].includes("Unknown DataChannel error"))
      ) {
        return; // Ignore
      }
      originalError.apply(console, args);
    };
    return () => {
      console.error = originalError;
    };
  }, []);

  const isFetchingRef = useRef(false);
  const participantIdentityRef = useRef<string | null>(null);
  // Track current phase in a ref so async callbacks (fetchToken) always read the latest value
  const flowPhaseRef = useRef<FlowPhase>("idle");

  const [mloClosingCountdown, setMloClosingCountdown] = useState<number | null>(
    null
  );

  const [mloParticipantJoined, setMloParticipantJoined] = useState(false);
  const [mloParticipantName, setMloParticipantName] = useState<string | null>(null);
  const [mloCallSeconds, setMloCallSeconds] = useState(0);
  const hasMloJoinedRef = useRef(false);

  useEffect(() => {
    if (mloParticipantJoined) {
      hasMloJoinedRef.current = true;
    } else if (hasMloJoinedRef.current && pendingMode === "loan-officer" && flowPhase === "live") {
      console.log("[ui-loan-officer]: SIP participant left. Ending call.");
      setToken(null);
      setLkUrl(null);
      setIsLkConnected(false);
      setFlowPhase("closing-mlo");
      setMloClosingCountdown(10);
      hasMloJoinedRef.current = false;
    }
  }, [mloParticipantJoined, pendingMode, flowPhase]);

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

    // Arm connection timeout (15 seconds) to catch slow/failed connection attempts
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
    }
    connectionTimeoutRef.current = setTimeout(() => {
      console.warn("[fetchToken] Connection attempt timed out after 15 seconds.");
      connectionTimeoutRef.current = null;
      setFlowPhase("error");
      flowPhaseRef.current = "error";
      setConnectionStatus("Connection timed out. Please try again.");
      isFetchingRef.current = false;
    }, 15000);

    try {
      // Only show 'connecting' if we aren't already in a meaningful phase
      // Don't override intro phase — the CTA already set it to 'intro'
      const currentPhase = flowPhaseRef.current;
      if (currentPhase === "idle" && mode !== "intro-avatar") {
        setFlowPhase("connecting");
        flowPhaseRef.current = "connecting";
      }

      if (mode === "intro-avatar") {
        setIsIntroComplete(false);
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

      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        (process.env.NODE_ENV === "development"
          ? "http://localhost:3001"
          : "https://be.convergentai.tech");
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
            errorData.details
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

      tokenFetchedAtRef.current = Date.now();
      setToken(data.token);
      setLkUrl(data.serverUrl);

      setIsFallbackMode(false);
      setConnectionStatus("");

      // Use the ref to read the phase at the time the async call resolves (avoids stale closure)
      if (flowPhaseRef.current !== "intro") {
        const nextPhase = mode === "intro-avatar" ? "intro" : "live";
        setFlowPhase(nextPhase);
        flowPhaseRef.current = nextPhase;
      }
    } catch (err) {
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }
      console.error("Error connecting to LiveKit:", err);
      setFlowPhase("error");
      flowPhaseRef.current = "error";
      setIsIntroComplete(false);
      setIsFallbackMode(false);
    } finally {
      isFetchingRef.current = false;
    }
  };

  const confirmLoanOfficerTransfer = () => {
    setShowLoanOfficerConfirm(false);
    const mode = "loan-officer";
    setIsOpen(true);
    setPendingMode(mode);
    if (!hasAgreed) {
      console.log(
        `[ui-loan-officer]: 📝 User hasn't agreed to terms yet. Showing compliance gate.`
      );
      setFlowPhase("intro");
      setIsIntroComplete(true); // Skip intro video, show compliance directly
    } else {
      if (isLkConnected || flowPhase === "intro" || flowPhase === "live") {
        console.log(
          `[ui-loan-officer]: ✅ User agreed, already connected (or in intro/live). Transitioning to live mode.`
        );
        if (!token) {
          fetchToken(mode);
        }
        setFlowPhase("live");
        return;
      }
      console.log(
        `[ui-loan-officer]: 🔄 Not connected yet, fetching LiveKit token for mode...`
      );
      fetchToken(mode);
    }
  };

  // Track when the token was fetched to identify if it is stale
  const tokenFetchedAtRef = useRef<number | null>(null);

  const handleAIAction = (mode: PendingMode) => {
    if (mode === "loan-officer") {
      console.log(
        `[ui-loan-officer]: 🔘 User clicked 'Loan Officer' button. Current mode: ${pendingMode}, flowPhase: ${flowPhase}`
      );
      if (pendingMode !== "loan-officer") {
        setShowLoanOfficerConfirm(true);
        return;
      }
    }
    setIsOpen(true);
    if (flowPhase === "live" && pendingMode === mode) {
      if (mode === "loan-officer")
        console.log(
          `[ui-loan-officer]: ⚠️ Already in 'live' phase with 'loan-officer' mode. Ignoring click.`
        );
      return;
    }

    setPendingMode(mode);
    if (!hasAgreed) {
      if (mode === "loan-officer")
        console.log(
          `[ui-loan-officer]: 📝 User hasn't agreed to terms yet. Showing compliance gate.`
        );
      setFlowPhase("intro");
      setIsIntroComplete(true); // Skip intro video, show compliance directly
    } else {
      if (isLkConnected || flowPhase === "intro" || flowPhase === "live") {
        if (mode === "loan-officer")
          console.log(
            `[ui-loan-officer]: ✅ User agreed, already connected (or in intro/live). Transitioning to live mode.`
          );
        if (!token && mode !== "voice") {
          fetchToken(mode, true);
        }
        setFlowPhase("live");
        return;
      }
      if (mode === "loan-officer")
        console.log(
          `[ui-loan-officer]: 🔄 Not connected yet, fetching LiveKit token for mode...`
        );

      // Always fetch a fresh token + room when starting a new session
      console.log("[ui] Fetching fresh token and room session.");
      setToken(null);
      setLkUrl(null);
      setRoomName("");
      fetchToken(mode, true);
    }
  };

  useEffect(() => {
    const sharedRoom = searchParams.get("room");
    if (sharedRoom) {
      setRoomName(sharedRoom);
      setIsOpen(true);
    }
  }, [searchParams]);

  // Do NOT pre-fetch on mount anymore. Pre-fetching causes tokens to sit in memory
  // and expire when users idle on the page. We will fetch tokens cleanly when the user clicks the CTA.
  useEffect(() => {
    // Left empty intentionally to prevent pre-fetch timeouts/expiration
  }, []);

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
    setHasAgreed(true);
    setIsIntroComplete(true);
    setComplianceChecked(true);
    setPendingMode("video");
    setConnectionStatus("");
    setIsOffline(false);
    setShowEndCallConfirm(false);
    setShowInactivityPrompt(false);
    participantIdentityRef.current = null;
    isFetchingRef.current = false;
    setIsSubmitting(false);
    setMloParticipantJoined(false);
    setMloParticipantName(null);
    setMloCallSeconds(0);
    hasMloJoinedRef.current = false;
  };

  // Full restart: tear down the broken connection and establish a fresh one.
  // Skips intro + compliance since the user already completed those.
  const restartSession = (modeOverride?: PendingMode) => {
    const mode =
      modeOverride ||
      (pendingMode === "intro-avatar" ? "video" : pendingMode || "video");

    // Reset connection state
    setToken(null);
    setLkUrl(null);
    setIsLkConnected(false);
    setIsAgentReady(false);
    setRoomName("");
    setIsVideoReady(false);
    setConnectionStatus("");
    setIsOffline(false);
    setShowEndCallConfirm(false);
    setShowInactivityPrompt(false);

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
    if (isOpen) {
      hasOpenedRef.current = true;
    } else if (!isOpen && hasOpenedRef.current) {
      resetSession();
      hasOpenedRef.current = false;
      fetchToken("video"); // Pre-fetch a new token for the next connection
    }
  }, [isOpen]);

  // Browser network state guard: show a clear alert when connectivity drops.
  useEffect(() => {
    if (!isOpen || typeof window === "undefined") return;

    const handleOffline = () => {
      setIsOffline(true);
      setConnectionStatus(
        "Internet connection lost. Reconnect to continue with Ailana."
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
      activityEvents.forEach((evt) => window.removeEventListener(evt, onActivity));
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
    return `${hh.toString().padStart(2, "0")}:${mm
      .toString()
      .padStart(2, "0")}:${ss.toString().padStart(2, "0")}`;
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
                {showLoanOfficerConfirm && (
                  <div className="absolute inset-0 z-[240] flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0A0D18]/95 p-6 md:p-8 shadow-[0_20px_50px_rgba(0,180,216,0.15)] backdrop-blur-xl"
                    >
                      <div className="flex flex-col items-center text-center">
                        {/* Header Pulse Icon */}
                        <div className="relative mb-6">
                          <div className="absolute inset-0 rounded-full bg-[#00b4d8]/10 animate-pulse scale-125" />
                          <div className="h-16 w-16 rounded-full border border-[#00b4d8]/30 bg-black/40 flex items-center justify-center backdrop-blur-md shadow-[0_0_20px_rgba(0,180,216,0.15)]">
                            <Headset className="w-7 h-7 text-[#00b4d8]" />
                          </div>
                        </div>

                        <h4 className="text-white text-xl font-bold tracking-tight">
                          Connect with Loan Officer?
                        </h4>

                        <p className="text-gray-300 text-xs md:text-sm mt-4 leading-relaxed max-w-sm">
                          You are about to transfer your call directly to a live human **Mortgage Loan Officer**.
                        </p>

                        {/* Alert Box */}
                        <div className="w-full mt-5 px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-left flex gap-3 items-start">
                          <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-xs font-bold font-sans">!</span>
                          </div>
                          <div>
                            <h5 className="text-amber-400 text-xs font-bold">Important Notice</h5>
                            <p className="text-gray-300 text-[11px] md:text-xs mt-1 leading-normal">
                              Once transferred, Ailana (your AI guide) will hibernate and **you will not be able to return to the AI session** until you end this call.
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
                          <button
                            onClick={() => setShowLoanOfficerConfirm(false)}
                            className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-white/10 text-gray-300 text-xs md:text-sm font-semibold hover:bg-white/10 hover:text-white transition-all cursor-pointer whitespace-nowrap"
                          >
                            Stay with Ailana
                          </button>
                          <button
                            onClick={confirmLoanOfficerTransfer}
                            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00b4d8] to-[#023e8a] hover:from-[#00c5eb] hover:to-[#0353b3] text-white text-xs md:text-sm font-bold shadow-lg shadow-[#00b4d8]/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
                          >
                            <span>Yes, Connect Officer</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}

                <div className="absolute inset-0 flex flex-col overflow-hidden z-0">
                  {/* ── Top Header ── */}
                  <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-2.5 md:py-4 relative z-50 shrink-0 bg-[#080c14]/95 backdrop-blur-md border-b border-white/15 gap-2">
                    {/* Logo */}
                    <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                      <div className="relative h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-transparent">
                        <Image
                          src="/newassets/ConvergentAI_logo_package/ConvergentAI_app_icon_navy.svg"
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
                        {[
                          {
                            m: "video" as PendingMode,
                            icon: <Video className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />,
                            label: "Video",
                          },
                          {
                            m: "voice" as PendingMode,
                            icon: <Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />,
                            label: "Voice",
                          },
                          {
                            m: "avatar-chat" as PendingMode,
                            icon: (
                              <MessageCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                            ),
                            label: "Chat",
                          },
                          {
                            m: "loan-officer" as PendingMode,
                            icon: <Headset className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />,
                            label: (
                              <>
                                <span className="hidden lg:inline">Loan Officer</span>
                                <span className="lg:hidden">Officer</span>
                              </>
                            ),
                            disabled: false,
                          },
                        ].map(({ m, icon, label, disabled }) => (
                          <div key={m} className="relative flex items-center">
                            <button
                              disabled={
                                disabled ||
                                (pendingMode === "loan-officer" && m !== "loan-officer")
                              }
                              onClick={() => {
                                if (disabled) {
                                  setShowLoanOfficerComingSoon(true);
                                  setTimeout(
                                    () => setShowLoanOfficerComingSoon(false),
                                    2500
                                  );
                                  return;
                                }
                                handleAIAction(m);
                              }}
                              className={`flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-[9px] sm:text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${disabled ||
                                (pendingMode === "loan-officer" && m !== "loan-officer")
                                ? "opacity-25 text-gray-500 cursor-not-allowed"
                                : pendingMode === m
                                  ? "bg-gradient-to-r from-[#00b4d8] to-[#023e8a] text-white shadow-md cursor-pointer"
                                  : "text-gray-400 hover:bg-white/10 hover:text-white cursor-pointer"
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
                          <div className="flex sm:hidden items-center gap-1.5" title="Trust Badges">
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
                              Secure & Private
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
                              src={friendlyAvatar}
                              alt="AI Assistant"
                              fill
                              sizes="(max-width: 768px) 128px, 176px"
                              className="object-cover"
                            />
                          </motion.div>
                          <button
                            onClick={() => { }}
                            className="relative z-10 bg-[#0B0F19]/80 backdrop-blur-sm px-6 md:px-8 py-3 md:py-4 rounded-2xl shadow-lg border border-white/10 transform -translate-y-4 max-w-[280px] md:max-w-sm text-center cursor-pointer hover:bg-white/5 transition-colors"
                          >
                            <p className="text-gray-200 font-medium text-sm md:text-lg">
                              Get instant answers to your mortgage questions...
                            </p>
                          </button>
                        </motion.div>
                      )}

                      {/* ── Independent Intro Video Flow (Commented Out) ── */}
                      {/* flowPhase === "intro" && (
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
                                  className="w-24 h-24 rounded-full bg-[#0a0a0a] border border-white/10 flex items-center justify-center p-5 drop-shadow-[0_0_15px_rgba(0,180,216,0.5)] animate-spin"
                                  style={{ animationDuration: "2s" }}
                                >
                                  <img
                                    src="/newassets/ConvergentAI_logo_package/ConvergentAI_icon_mark_reverse.svg"
                                    alt="Loading..."
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <AnimatePresence>
                            {isIntroComplete && !hasAgreed && (
                              <ComplianceGate
                                complianceChecked={complianceChecked}
                                setComplianceChecked={setComplianceChecked}
                                isSubmitting={isSubmitting}
                                onCancel={() => setIsOpen(false)}
                                onAgree={() => {
                                  setIsSubmitting(true);
                                  setPendingMode("video");
                                  setHasAgreed(true);
                                  setFlowPhase("live");
                                }}
                              />
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ) */}

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
                            <RefreshCw className="h-16 w-16 text-[#00b4d8] animate-spin opacity-40" />
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
                                if (flowPhaseRef.current === "connecting") return;
                                setConnectionStatus(
                                  typeof window !== "undefined" &&
                                    !window.navigator.onLine
                                    ? "Internet connection lost. Reconnect to continue with Ailana."
                                    : "Connection with Ailana was interrupted. Please retry."
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
                              <NetworkQualityBanner />
                              <ChannelStartTrigger
                                isLivePhase={flowPhase === "live"}
                                mode={pendingMode}
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
                                  className={`flex-1 flex min-h-0 p-2 md:p-3 gap-2 md:gap-3 ${pendingMode === "avatar-chat" ? "flex-col md:flex-row" : "flex-row"
                                    }`}
                                >
                                  {/* Left: Avatar Area */}
                                  <div
                                    className={`relative rounded-2xl overflow-hidden bg-black shadow-xl ${pendingMode === "avatar-chat"
                                      ? "h-[42%] md:h-auto md:flex-1"
                                      : "flex-1"
                                      }`}
                                  >
                                    {/* REC badge - only when connected */}
                                    {isLkConnected &&
                                      isAgentReady && (
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
                                          <LoanOfficerLiveUI
                                            mloName={mloParticipantName}
                                            callSeconds={mloCallSeconds}
                                          />
                                        ) : (
                                          <LoanOfficerQueueUI />
                                        )
                                      ) : (
                                        <VideoStage
                                          mode={pendingMode}
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
                                      Secure & private.
                                    </span>
                                  </span>
                                  <span className="h-3 w-px bg-white/20 hidden sm:block" />
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-[#00b4d8]" />
                                    AI-Powered. Human-Focused. 24/7.
                                  </span>
                                </div>
                              </div>

                              <RoomAudioRenderer />
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
                          {isOffline ? "Waiting for Internet..." : "Start New Session"}
                        </button>
                      </motion.div>
                    )}

                    {flowPhase === "closing-mlo" && (
                      <motion.div
                        key="closing-mlo-view"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col items-center justify-center px-4 sm:px-6 w-full h-full max-w-md mx-auto overflow-y-auto py-4 sm:py-0"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: "spring",
                            damping: 15,
                            stiffness: 200,
                            delay: 0.1,
                          }}
                          className="relative mb-4 sm:mb-6"
                        >
                          <div className="absolute inset-0 rounded-full bg-[#00b4d8] blur-xl opacity-30 animate-pulse" />
                          <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#00b4d8] to-[#023e8a] flex items-center justify-center shadow-lg border-4 border-[#0B0F19] relative z-10">
                            <Check className="w-7 h-7 sm:w-10 sm:h-10 text-white stroke-[3px]" />
                          </div>
                        </motion.div>

                        <h3 className="text-2xl sm:text-3xl font-black text-white mb-1 sm:mb-2 tracking-tight">
                          Call Complete
                        </h3>
                        <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-8 text-center">
                          Thank you for speaking with our Loan Officer.
                        </p>

                        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-3.5 sm:p-5 mb-4 sm:mb-8 backdrop-blur-md">
                          <div className="flex justify-between items-center mb-2.5 sm:mb-3">
                            <span className="text-gray-400 text-[10px] sm:text-xs font-medium uppercase tracking-wider">
                              Duration
                            </span>
                            <span className="text-white font-mono text-sm sm:text-base font-medium">
                              {formatTime(mloCallSeconds)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mb-3 sm:mb-4">
                            <span className="text-gray-400 text-[10px] sm:text-xs font-medium uppercase tracking-wider">
                              Officer
                            </span>
                            <span className="text-white text-sm sm:text-base font-medium">
                              {mloParticipantName
                                ? mloParticipantName.replace("sip_", "")
                                : "Assigned Expert"}
                            </span>
                          </div>
                          <div className="w-full h-px bg-white/10 mb-3 sm:mb-4" />
                          <p className="text-[9px] sm:text-[10px] text-gray-500 text-center uppercase tracking-widest font-semibold leading-relaxed">
                            This conversation was recorded
                            <br />
                            for quality and compliance.
                          </p>
                        </div>

                        <div className="flex flex-col gap-2.5 sm:gap-3 w-full">
                          <button
                            onClick={() => {
                              setMloClosingCountdown(0);
                              setIsOpen(false);
                            }}
                            className="w-full py-2.5 sm:py-3.5 rounded-xl border border-white/20 text-white text-sm sm:text-base font-bold hover:bg-white/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            Close Now
                          </button>

                          <div className="flex items-center justify-center gap-3 my-1 sm:my-2">
                            <div className="h-px bg-white/10 flex-1" />
                            <span className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase tracking-widest">
                              Or
                            </span>
                            <div className="h-px bg-white/10 flex-1" />
                          </div>

                          <button
                            onClick={() => {
                              setMloClosingCountdown(null);
                              restartSession("video");
                            }}
                            className="w-full py-2.5 sm:py-3.5 rounded-xl bg-gradient-to-r from-[#00b4d8] to-[#023e8a] text-white text-sm sm:text-base font-bold hover:shadow-[0_0_20px_rgba(0,180,216,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden group"
                          >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                            <Bot className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
                            <span className="relative z-10">Return to Ailana</span>
                          </button>
                        </div>

                        {/* Circular progress countdown */}
                        {mloClosingCountdown !== null && mloClosingCountdown > 0 && (
                          <div className="absolute top-3 right-3 sm:top-6 sm:right-6 flex items-center gap-1.5 sm:gap-2 opacity-50">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 transform -rotate-90">
                              <circle
                                cx="10"
                                cy="10"
                                r="8"
                                fill="transparent"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="text-white/20"
                              />
                              <circle
                                cx="10"
                                cy="10"
                                r="8"
                                fill="transparent"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="text-white"
                                strokeDasharray="50"
                                strokeDashoffset={
                                  50 - (mloClosingCountdown / 10) * 50
                                }
                              />
                            </svg>
                            <span className="text-[10px] sm:text-xs font-mono font-medium text-white">
                              {mloClosingCountdown}s
                            </span>
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

      <ActionButton
        onClick={() => {
          setIsOpen(true);
          if (flowPhaseRef.current === "idle") {
            setFlowPhase("connecting");
            flowPhaseRef.current = "connecting";
            setPendingMode("video");
            fetchToken("video");
          }
        }}
      />
    </>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Sparkles, X, Phone, Calendar, Video, Mic, Menu, Circle, Loader2, Send, Share2, Check, Shield, ArrowRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useRemoteParticipants,
  useChat,
  useRoomContext,
} from "@livekit/components-react";
import { RoomEvent } from "livekit-client";
import "@livekit/components-styles";
import AppIcon from "../app/icon.png";
import LiveChatPanel from "./live-chat-panel";
import VideoStage from "./video-stage";

type FlowPhase = 'idle' | 'connecting' | 'intro' | 'compliance' | 'live' | 'chat';
type IntroSubPhase = 'connecting' | 'playing';
type PendingMode = 'intro-avatar' | 'video' | 'voice' | 'avatar-chat' | 'chat';

function AgentReadinessCheck({ onAgentReady }: { onAgentReady: (r: boolean) => void }) {
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
    if (room.state !== 'connected') return;

    const lp = room.localParticipant;
    if (!lp) return;

    console.log(`[MediaGuard] 🔄 Syncing media state for mode: ${mode}`);

    // Explicitly handle all modes as the single source of truth
    const syncMedia = async () => {
      if (mode === 'avatar-chat' || mode === 'intro-avatar') {
        try { await lp.setMicrophoneEnabled(false); } catch (e) { }
        try { await lp.setCameraEnabled(false); } catch (e) { }
        console.log('[MediaGuard] 🔇 Mic & camera OFF');
      } else if (mode === 'voice') {
        try { await lp.setMicrophoneEnabled(true); } catch (e) { console.error("Mic error:", e); }
        try { await lp.setCameraEnabled(false); } catch (e) { }
        console.log('[MediaGuard] 🎤 Mic ON, camera OFF');
      } else if (mode === 'video') {
        try { await lp.setMicrophoneEnabled(true); } catch (e) { console.error("Mic error:", e); }
        try { await lp.setCameraEnabled(true); } catch (e) { console.error("Camera error:", e); }
        console.log('[MediaGuard] 🎤📹 Mic & camera ON');
      }
    };
    
    syncMedia();
  }, [mode, room, room.state]);

  return null;
}

function IntroTrigger({ isIntroPhase, onIntroComplete }: { isIntroPhase: boolean; onIntroComplete: () => void }) {
  // Disabled: The intro is now handled by a pre-recorded video in the UI.
  return null;
}

function ChannelStartTrigger({ isLivePhase, mode }: { isLivePhase: boolean; mode: string }) {
  const { send } = useChat();
  const room = useRoomContext();
  const participants = useRemoteParticipants();
  const agentReady = participants.length > 0;
  const lastTriggeredMode = useRef<string | null>(null);

  useEffect(() => {
    if (isLivePhase && room.state === 'connected' && agentReady && lastTriggeredMode.current !== mode) {
      const trySend = async (retries = 3) => {
        try {
          lastTriggeredMode.current = mode;
          console.log(`[ui]: 🚀 Channel starting (${mode}). Sending SYSTEM_CHANNEL_START...`);
          const encoder = new TextEncoder();
          const payload = encoder.encode(JSON.stringify({ message: `SYSTEM_CHANNEL_START:${mode}` }));
          await room.localParticipant.publishData(payload, { topic: "lk-chat", reliable: true });
        } catch (err) {
          console.warn(`[ui]: Failed to send start trigger (retries left: ${retries}):`, err);
          if (retries > 0) {
            setTimeout(() => trySend(retries - 1), 500);
          } else {
            lastTriggeredMode.current = null; // reset so next mode change can try again
          }
        }
      };
      trySend();
    }

    if (!isLivePhase) {
      lastTriggeredMode.current = null;
    }
  }, [isLivePhase, mode, send, room.state, agentReady]);

  return null;
}

function SideButton({ icon, label, onClick, isActive }: { icon: React.ReactNode; label: string; onClick?: () => void; isActive?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col md:flex-row items-center justify-start gap-1 md:gap-4 w-full p-1 md:p-3.5 lg:p-4 rounded-xl md:rounded-2xl border transition-all group text-center md:text-left cursor-pointer ${isActive
        ? 'bg-white/5 border-[#00b4d8]/50 shadow-[0_0_20px_rgba(0,180,216,0.18)]'
        : 'border-transparent hover:bg-white/5 hover:border-[#00b4d8]/30 hover:shadow-[0_0_20px_rgba(0,180,216,0.15)]'
        }`}
    >
      <div className={`flex-shrink-0 h-8 w-8 md:h-12 md:w-12 rounded-full border flex items-center justify-center transition-all duration-300 shadow-sm mx-auto md:mx-0 ${isActive
        ? 'bg-gradient-to-br from-[#00b4d8] via-[#023e8a] to-[#560bad] border-transparent text-white scale-110 shadow-[0_0_16px_rgba(0,180,216,0.4)]'
        : 'bg-[#0B0F19] border-white/10 text-[#00b4d8] group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-[#00b4d8] group-hover:via-[#023e8a] group-hover:to-[#560bad] group-hover:border-transparent group-hover:text-white'
        }`}>
        {icon}
      </div>
      <span className={`font-medium md:font-semibold transition-colors text-[8px] sm:text-[10px] md:text-sm lg:text-base leading-none md:leading-tight w-full mt-1 md:mt-0 break-words whitespace-normal ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
        }`}>
        {label}
      </span>
    </button>
  );
}



export default function FloatingCTA() {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isNavExpanded, setIsNavExpanded] = useState(true);
  const [hasAutoHidden, setHasAutoHidden] = useState(false);

  const [showDisclosure, setShowDisclosure] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [flowPhase, setFlowPhase] = useState<FlowPhase>('idle');
  const [isIntroComplete, setIsIntroComplete] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [lkUrl, setLkUrl] = useState<string | null>(null);
  const [keyframeMetaData, setKeyframeMetaData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLkConnected, setIsLkConnected] = useState(false);
  const [isAgentReady, setIsAgentReady] = useState(false);
  const [pendingMode, setPendingMode] = useState<PendingMode>('video');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [roomName, setRoomName] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [introSubPhase, setIntroSubPhase] = useState<IntroSubPhase>('playing');
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isIntroBlurring, setIsIntroBlurring] = useState(true);
  const introVideoRef = useRef<HTMLVideoElement>(null);
  const searchParams = useSearchParams();

  const isFetchingRef = useRef(false);
  const participantIdentityRef = useRef<string | null>(null);

  const fetchToken = async (mode?: string) => {
    // Prevent concurrent duplicate calls (e.g. compliance agree + mode button)
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      // Only show 'connecting' if we aren't already in a meaningful phase
      // Don't override intro phase — the CTA already set it to 'intro'
      if (flowPhase === 'idle' && mode !== 'intro-avatar') {
        setFlowPhase('connecting');
      }

      setIsIntroComplete(false);
      setError(null);
      if (!isLkConnected) {
        setKeyframeMetaData(null);
      }

      const urlRoom = searchParams.get('room');
      const generatedRoomName = urlRoom || roomName || `room-${Math.random().toString(36).substring(2, 11)}`;

      if (!roomName || roomName !== generatedRoomName) {
        setRoomName(generatedRoomName);
      }

      const activeMode = mode ?? pendingMode;

      if (!participantIdentityRef.current) {
        participantIdentityRef.current = `guest_${Math.floor(Math.random() * 10000)}`;
      }

      const response = await fetch('/api/get-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: generatedRoomName,
          participantName: participantIdentityRef.current,
          metadata: JSON.stringify({ mode: activeMode }),
          mode: activeMode,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch LiveKit token');
      }

      const data = await response.json();
      setToken(data.token);
      setLkUrl(data.serverUrl);
      setKeyframeMetaData(data.keyframe ?? null);
      
      // If we are already in intro phase (playing video), don't jump to 'live'
      if (flowPhase !== 'intro') {
        setFlowPhase(mode === 'intro-avatar' ? 'intro' : 'live');
      }
    } catch (err) {
      console.error('Error connecting to LiveKit:', err);
      setError('Connection failed. Please try again.');
      setFlowPhase('idle');
      setIsIntroComplete(false);
    } finally {
      isFetchingRef.current = false;
    }
  };

  const handleAIAction = (mode: 'video' | 'voice' | 'avatar-chat') => {
    setIsOpen(true);
    if (flowPhase === 'live' && pendingMode === mode) return;

    setPendingMode(mode);
    if (!hasAgreed) {
      setFlowPhase('compliance');
    } else {
      if (isLkConnected || flowPhase === 'intro' || flowPhase === 'live') {
        if (!keyframeMetaData && mode !== 'voice') {
          fetchToken(mode);
        }
        setFlowPhase('live');
        return;
      }
      fetchToken(mode);
    }
  };

  const handleChatAction = () => {
    setIsOpen(true);
    if (flowPhase === 'chat') return;
    setPendingMode('chat');
    if (!hasAgreed) {
      setFlowPhase('compliance');
    } else {
      setToken(null);
      setLkUrl(null);
      setIsLkConnected(false);
      setRoomName('');
      setFlowPhase('chat');
    }
  };

  const handleAgree = () => {
    setHasAgreed(true);
    if (pendingMode === 'chat') {
      setToken(null);
      setLkUrl(null);
      setIsLkConnected(false);
      setRoomName('');
      setFlowPhase('chat');
    } else {
      if (!token) {
        setFlowPhase('connecting');
        fetchToken(pendingMode);
      } else {
        setFlowPhase('live');
      }
    }
  };

  const handleShare = async () => {
    if (!roomName) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?room=${roomName}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  useEffect(() => {
    const sharedRoom = searchParams.get('room');
    if (sharedRoom) {
      setRoomName(sharedRoom);
      setIsOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isOpen && !hasAutoHidden) {
      setIsNavExpanded(true);
      timeout = setTimeout(() => {
        setIsNavExpanded(false);
        setHasAutoHidden(true);
      }, 7000);
    } else if (!isOpen) {
      setHasAutoHidden(false);
      setFlowPhase('idle');
      setToken(null);
      setLkUrl(null);
      setIsLkConnected(false);
      setRoomName('');
      setIsVideoReady(false);
      setIsIntroBlurring(true);
    }
    return () => clearTimeout(timeout);
  }, [isOpen, hasAutoHidden]);

  // Handle the 2-second blur transition once video is ready
  useEffect(() => {
    if (isVideoReady && flowPhase === 'intro') {
      const timer = setTimeout(() => {
        setIsIntroBlurring(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVideoReady, flowPhase]);

  // Auto-collapse sidebar after user selects a channel (transitions out of intro)
  useEffect(() => {
    if (flowPhase === 'live' || flowPhase === 'compliance' || flowPhase === 'chat') {
      setIsNavExpanded(true); // briefly show so user sees where the nav went
      const collapseTimer = setTimeout(() => {
        setIsNavExpanded(false);
        setHasAutoHidden(true);
      }, 3000);
      return () => clearTimeout(collapseTimer);
    }
  }, [flowPhase]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const hasAnnouncedRef = useRef(false);

  useEffect(() => {
    if (flowPhase === 'live' && isLkConnected && typeof window !== 'undefined') {
      if (hasAnnouncedRef.current) return;

      const announce = () => {
        if (hasAnnouncedRef.current) return;
        hasAnnouncedRef.current = true;

        const announcement = new SpeechSynthesisUtterance("This session is being recorded for regulatory and compliance purposes.");
        const voices = window.speechSynthesis.getVoices();

        const femaleVoice = voices.find(v =>
          v.name.includes('Samantha') ||
          v.name.includes('Female') ||
          v.name.includes('Zira') ||
          v.name.includes('Google UK English Female') ||
          v.name.includes('Google US English')
        );

        if (femaleVoice) announcement.voice = femaleVoice;
        announcement.rate = 1.0;
        announcement.pitch = 1.15;
        announcement.volume = 0.9;

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
    if (isLkConnected && flowPhase === 'live') {
      interval = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
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
    return `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-md font-sans"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key="main-stage"
                initial={{ scale: 1.05, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-[95vw] sm:w-[90vw] max-w-6xl h-[90vh] min-h-[500px] max-h-[920px] bg-[#050505] rounded-3xl shadow-[0_0_80px_rgba(0,180,216,0.15)] flex flex-col overflow-hidden border border-[#00b4d8]/20"
              >

                <div className="absolute inset-0 flex flex-col p-3 sm:p-4 md:p-6 overflow-hidden bg-gradient-to-br from-[#050505] to-[#111111] z-0">
                  <div className="flex items-center justify-between gap-3 mb-3 md:mb-4 relative z-10 pt-1 md:pt-0 w-full">
                    <div className="flex items-center gap-3">
                      <div className="relative h-8 w-8 md:h-10 md:w-10 flex shrink-0 items-center justify-center overflow-hidden rounded-full shadow-[0_0_15px_rgba(0,180,216,0.3)] bg-transparent">
                        <Image src={AppIcon} alt="ConvergentAI Logo" fill sizes="40px" className="object-contain" />
                      </div>
                      <span className="font-extrabold text-white text-base md:text-2xl tracking-tight">ConvergentAI</span>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3">
                      {roomName && (flowPhase === 'live' || flowPhase === 'chat' || flowPhase === 'intro' || flowPhase === 'compliance') && pendingMode !== 'voice' && (
                        <button
                          onClick={handleShare}
                          className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-md text-gray-300 hover:text-white text-[10px] md:text-xs font-bold uppercase tracking-widest group cursor-pointer active:scale-95 shrink-0"
                        >
                          {isCopied ? (
                            <>
                              <Check className="h-3 w-3 md:h-3.5 md:w-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Share2 className="h-3 w-3 md:h-3.5 md:w-3.5 group-hover:scale-110 transition-transform text-[#00b4d8]" />
                              <span>Share</span>
                            </>
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 md:p-2.5 rounded-full bg-white/10 text-gray-200 hover:bg-[#ff3333] hover:text-white transition-colors shadow-sm cursor-pointer shrink-0"
                      >
                        <X className="h-4 w-4 md:h-5 md:w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 min-h-0 relative w-full flex flex-col items-center justify-center rounded-2xl bg-black/60 shadow-xl border border-white/5 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#00b4d8]/10 to-transparent pointer-events-none" />

                    <AnimatePresence mode="wait">
                      {flowPhase === 'idle' && (
                        <motion.div key="idle-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center">
                          <motion.div animate={{ y: [0, -8, 0], rotate: [0, 0, -15, 15, -10, 10, 0, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="origin-bottom relative z-10 w-32 h-32 md:w-44 md:h-44 mb-8 rounded-full overflow-hidden border-[6px] md:border-8 border-[#0B0F19] shadow-[0_0_40px_rgba(0,180,216,0.3)]">
                            <Image src="/friendly_ai_avatar_v2.png" alt="AI Assistant" fill sizes="(max-width: 768px) 128px, 176px" className="object-cover" />
                          </motion.div>
                          <button
                            onClick={() => { setIsNavExpanded(true); setHasAutoHidden(true); }}
                            className="relative z-10 bg-[#0B0F19]/80 backdrop-blur-sm px-6 md:px-8 py-3 md:py-4 rounded-2xl shadow-lg border border-white/10 transform -translate-y-4 max-w-[280px] md:max-w-sm text-center cursor-pointer hover:bg-white/5 transition-colors"
                          >
                            <p className="text-gray-200 font-medium text-sm md:text-lg">Get instant answers to your mortgage questions...</p>
                          </button>
                        </motion.div>
                      )}

                      {/* ── Independent Intro Video Flow (Shows immediately with blur) ── */}
                      {flowPhase === 'intro' && (
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
                            className={`w-full h-full object-contain bg-black transition-all duration-1000 ${isIntroBlurring ? 'blur-2xl scale-110' : 'blur-0 scale-100'}`}
                            onLoadedData={() => setIsVideoReady(true)}
                            onTimeUpdate={(e) => {
                              const video = e.currentTarget;
                              if (video.duration > 0 && video.currentTime >= video.duration - 1.0) {
                                setIsIntroComplete(true);
                              }
                            }}
                            onEnded={() => setIsIntroComplete(true)}
                          />

                          {/* ── Connecting Overlay (Floating ON TOP of blurred video) ── */}
                          <AnimatePresence>
                            {isIntroBlurring && (
                              <motion.div 
                                key="intro-loader-overlay"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-[160] flex flex-col items-center justify-center text-center px-6 bg-black/20"
                              >
                                <div className="relative mb-8">
                                  <div className="absolute inset-0 rounded-full border-2 border-[#00b4d8]/40 animate-ping" />
                                  <Loader2 className="h-20 w-20 text-[#00b4d8] animate-spin opacity-80" />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2 tracking-tight drop-shadow-2xl">Connecting to Ailana</h3>
                                <p className="text-[#00b4d8] text-xs font-bold uppercase tracking-[0.3em] drop-shadow-md">Preparing Live Experience</p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                          
                          <AnimatePresence>
                            {isIntroComplete && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute inset-0 z-[130] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-8"
                              >
                                <div className="max-w-4xl w-full flex flex-col gap-4 md:gap-8 max-h-full overflow-y-auto custom-scrollbar p-2">
                                  <h3 className="text-white font-bold text-center text-xl md:text-3xl mb-2 md:mb-6 tracking-wide drop-shadow-md">Select your preferred channel</h3>
                                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6">
                                    <button onClick={() => handleAIAction('video')} className="group flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start gap-2 md:gap-4 p-3 md:p-6 rounded-2xl bg-[#0a0a0a]/90 border border-white/10 hover:border-[#00b4d8]/50 hover:bg-white/5 transition-all w-full shadow-[0_0_20px_rgba(0,180,216,0.1)] hover:shadow-[0_0_40px_rgba(0,180,216,0.3)]">
                                      <div className="h-10 w-10 md:h-14 md:w-14 rounded-full flex-shrink-0 bg-[#0B0F19] group-hover:bg-gradient-to-br from-[#00b4d8] to-[#560bad] border border-white/10 flex items-center justify-center text-[#00b4d8] group-hover:text-white transition-all duration-300 shadow-sm group-hover:scale-110">
                                        <Video className="h-4 w-4 md:h-6 md:w-6" />
                                      </div>
                                      <div className="flex flex-col text-center sm:text-left">
                                        <span className="font-bold text-white tracking-wide text-[10px] sm:text-sm md:text-lg">Live with Ailana</span>
                                        <span className="text-white/60 text-xs md:text-sm mt-1 leading-tight hidden md:block">Face-to-face interaction with Ailana</span>
                                      </div>
                                    </button>
                                    <button onClick={() => handleAIAction('avatar-chat')} className="group flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start gap-2 md:gap-4 p-3 md:p-6 rounded-2xl bg-[#0a0a0a]/90 border border-white/10 hover:border-[#00b4d8]/50 hover:bg-white/5 transition-all w-full shadow-[0_0_20px_rgba(0,180,216,0.1)] hover:shadow-[0_0_40px_rgba(0,180,216,0.3)]">
                                      <div className="h-10 w-10 md:h-14 md:w-14 rounded-full flex-shrink-0 bg-[#0B0F19] group-hover:bg-gradient-to-br from-[#00b4d8] to-[#560bad] border border-white/10 flex items-center justify-center text-[#00b4d8] group-hover:text-white transition-all duration-300 shadow-sm group-hover:scale-110">
                                        <MessageCircle className="h-4 w-4 md:h-6 md:w-6" />
                                      </div>
                                      <div className="flex flex-col text-center sm:text-left">
                                        <span className="font-bold text-white tracking-wide text-[10px] sm:text-sm md:text-lg">Type to AI</span>
                                        <span className="text-white/60 text-xs md:text-sm mt-1 leading-tight hidden md:block">Silent text-based engagement</span>
                                      </div>
                                    </button>
                                    <button onClick={() => handleAIAction('voice')} className="group flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start gap-2 md:gap-4 p-3 md:p-6 rounded-2xl bg-[#0a0a0a]/90 border border-white/10 hover:border-[#00b4d8]/50 hover:bg-white/5 transition-all w-full shadow-[0_0_20px_rgba(0,180,216,0.1)] hover:shadow-[0_0_40px_rgba(0,180,216,0.3)]">
                                      <div className="h-10 w-10 md:h-14 md:w-14 rounded-full flex-shrink-0 bg-[#0B0F19] group-hover:bg-gradient-to-br from-[#00b4d8] to-[#560bad] border border-white/10 flex items-center justify-center text-[#00b4d8] group-hover:text-white transition-all duration-300 shadow-sm group-hover:scale-110">
                                        <Mic className="h-4 w-4 md:h-6 md:w-6" />
                                      </div>
                                      <div className="flex flex-col text-center sm:text-left">
                                        <span className="font-bold text-white tracking-wide text-[10px] sm:text-sm md:text-lg">Speak to AI</span>
                                        <span className="text-white/60 text-xs md:text-sm mt-1 leading-tight hidden md:block">Private two-way voice call</span>
                                      </div>
                                    </button>
                                    <button onClick={handleChatAction} className="group flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start gap-2 md:gap-4 p-3 md:p-6 rounded-2xl bg-[#0a0a0a]/90 border border-white/10 hover:border-[#00b4d8]/50 hover:bg-white/5 transition-all w-full shadow-[0_0_20px_rgba(0,180,216,0.1)] hover:shadow-[0_0_40px_rgba(0,180,216,0.3)]">
                                      <div className="h-10 w-10 md:h-14 md:w-14 rounded-full flex-shrink-0 bg-[#0B0F19] group-hover:bg-gradient-to-br from-[#00b4d8] to-[#560bad] border border-white/10 flex items-center justify-center text-[#00b4d8] group-hover:text-white transition-all duration-300 shadow-sm group-hover:scale-110">
                                        <MessageCircle className="h-4 w-4 md:h-6 md:w-6" />
                                      </div>
                                      <div className="flex flex-col text-center sm:text-left">
                                        <span className="font-bold text-white tracking-wide text-[10px] sm:text-sm md:text-lg">Live Chat</span>
                                        <span className="text-white/60 text-xs md:text-sm mt-1 leading-tight hidden md:block">Text a human representative</span>
                                      </div>
                                    </button>
                                    <button onClick={() => window.location.href = 'tel:+1234567890'} className="group flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start gap-2 md:gap-4 p-3 md:p-6 rounded-2xl bg-[#0a0a0a]/90 border border-white/10 hover:border-[#00b4d8]/50 hover:bg-white/5 transition-all w-full shadow-[0_0_20px_rgba(0,180,216,0.1)] hover:shadow-[0_0_40px_rgba(0,180,216,0.3)]">
                                      <div className="h-10 w-10 md:h-14 md:w-14 rounded-full flex-shrink-0 bg-[#0B0F19] group-hover:bg-gradient-to-br from-[#00b4d8] to-[#560bad] border border-white/10 flex items-center justify-center text-[#00b4d8] group-hover:text-white transition-all duration-300 shadow-sm group-hover:scale-110">
                                        <Phone className="h-4 w-4 md:h-6 md:w-6" />
                                      </div>
                                      <div className="flex flex-col text-center sm:text-left">
                                        <span className="font-bold text-white tracking-wide text-[10px] sm:text-sm md:text-lg">Talk to Officer</span>
                                        <span className="text-white/60 text-xs md:text-sm mt-1 leading-tight hidden md:block">Speak directly with our team</span>
                                      </div>
                                    </button>
                                    <button onClick={() => window.open("https://warpme.neetocal.com/meeting-with-david-patten-19", "_blank", "noopener,noreferrer")} className="group flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start gap-2 md:gap-4 p-3 md:p-6 rounded-2xl bg-[#0a0a0a]/90 border border-white/10 hover:border-[#00b4d8]/50 hover:bg-white/5 transition-all w-full shadow-[0_0_20px_rgba(0,180,216,0.1)] hover:shadow-[0_0_40px_rgba(0,180,216,0.3)]">
                                      <div className="h-10 w-10 md:h-14 md:w-14 rounded-full flex-shrink-0 bg-[#0B0F19] group-hover:bg-gradient-to-br from-[#00b4d8] to-[#560bad] border border-white/10 flex items-center justify-center text-[#00b4d8] group-hover:text-white transition-all duration-300 shadow-sm group-hover:scale-110">
                                        <Calendar className="h-4 w-4 md:h-6 md:w-6" />
                                      </div>
                                      <div className="flex flex-col text-center sm:text-left">
                                        <span className="font-bold text-white tracking-wide text-[10px] sm:text-sm md:text-lg">Book Appt.</span>
                                        <span className="text-white/60 text-xs md:text-sm mt-1 leading-tight hidden md:block">Schedule a consultation</span>
                                      </div>
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )}

                      {flowPhase === 'connecting' && (
                        <motion.div key="connecting-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center text-center px-6">
                          <div className="relative mb-8">
                            <div className="absolute inset-0 rounded-full border-2 border-[#00b4d8]/20 animate-ping" />
                            <Loader2 className="h-16 w-16 text-[#00b4d8] animate-spin opacity-40" />
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Initializing Session</h3>
                          <p className="text-[#00b4d8]/60 text-[10px] font-bold uppercase tracking-[0.2em]">Establishing Secure Bridge</p>
                        </motion.div>
                      )}

                      {(flowPhase === 'live' || flowPhase === 'compliance' || flowPhase === 'intro') && token && lkUrl && (
                        <motion.div key="live-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex flex-col items-center justify-center p-0">
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
                            onDisconnected={() => { setFlowPhase('idle'); setToken(null); setLkUrl(null); setIsLkConnected(false); setIsAgentReady(false); setRecordingSeconds(0); setRoomName(''); setIsVideoReady(false); setIsIntroBlurring(true); }}
                          >
                            <AgentReadinessCheck onAgentReady={setIsAgentReady} />
                            <MediaGuard mode={pendingMode} />
                            <ChannelStartTrigger isLivePhase={flowPhase === 'live'} mode={pendingMode} />

                            {flowPhase === 'compliance' && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 z-[150] flex items-center justify-center bg-[#050505] p-6 md:p-10"
                              >
                                <div className="max-w-2xl w-full flex flex-col justify-center space-y-8">
                                  <div className="space-y-4 text-center">
                                    <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                                      Safety & Compliance
                                    </h2>
                                    <p className="text-gray-400 leading-relaxed text-lg">
                                      To provide you with the best experience, our AI assistant uses real-time voice and video processing. By continuing, you agree to our terms of service and acknowledge that this conversation may be recorded for quality and safety purposes.
                                    </p>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                                      <div className="h-8 w-8 rounded-lg bg-[#00b4d8]/20 flex items-center justify-center">
                                        <Shield className="h-4 w-4 text-[#00b4d8]" />
                                      </div>
                                      <h4 className="font-semibold text-white">Privacy First</h4>
                                      <p className="text-xs text-gray-500">Your data is encrypted and handled with strict privacy protocols.</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                                      <div className="h-8 w-8 rounded-lg bg-[#560bad]/20 flex items-center justify-center">
                                        <Mic className="h-4 w-4 text-[#560bad]" />
                                      </div>
                                      <h4 className="font-semibold text-white">Live Processing</h4>
                                      <p className="text-xs text-gray-500">Real-time analysis enables human-like interaction and accuracy.</p>
                                    </div>
                                  </div>

                                  <div className="pt-6 flex flex-col gap-4">
                                    <button
                                      onClick={handleAgree}
                                      className="w-full py-4 rounded-2xl bg-white text-black font-bold text-lg hover:bg-[#00b4d8] hover:text-white transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-center gap-3 group"
                                    >
                                      Accept and Continue
                                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setFlowPhase('intro');
                                        setIntroSubPhase('playing');
                                        setIsIntroComplete(true);
                                      }}
                                      className="w-full py-3 rounded-xl border border-white/10 text-gray-500 text-sm hover:bg-white/5 transition-colors"
                                    >
                                      Go Back
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            )}

                            {/* ── Connecting overlay — visible until WebRTC is fully up AND agent arrives ── */}
                            <AnimatePresence>
                              {(!isLkConnected || !isAgentReady) && flowPhase === 'live' && (
                                <motion.div
                                  key="lk-connecting"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0, transition: { duration: 0.4 } }}
                                  className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#050505]/95 backdrop-blur-sm"
                                >
                                  {/* Pulsing ring */}
                                  <div className="relative mb-8">
                                    <div className="absolute inset-0 rounded-full border-2 border-[#00b4d8]/30 animate-ping" />
                                    <div className="h-16 w-16 rounded-full border-2 border-[#00b4d8]/20 flex items-center justify-center">
                                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#00b4d8] to-[#023e8a] animate-pulse" />
                                    </div>
                                  </div>
                                  {/* Animated dots text */}
                                  <p className="text-white font-bold text-lg md:text-xl tracking-wide flex items-end gap-[2px]">
                                    Connecting
                                    <span className="lk-dots inline-flex gap-[2px] mb-[2px]">
                                      <span className="lk-dot" />
                                      <span className="lk-dot" style={{ animationDelay: '0.2s' }} />
                                      <span className="lk-dot" style={{ animationDelay: '0.4s' }} />
                                    </span>
                                  </p>
                                  <p className="text-[#00b4d8]/60 text-xs md:text-sm font-medium tracking-widest uppercase mt-2">Establishing Secure Bridge</p>
                                  <style>{`
                                      .lk-dot {
                                        display: inline-block;
                                        width: 5px;
                                        height: 5px;
                                        border-radius: 50%;
                                        background: #00b4d8;
                                        animation: lk-dot-bounce 1.2s ease-in-out infinite;
                                        opacity: 0.2;
                                      }
                                      @keyframes lk-dot-bounce {
                                        0%, 80%, 100% { opacity: 0.2; transform: translateY(0); }
                                        40%            { opacity: 1;   transform: translateY(-6px); }
                                      }
                                    `}</style>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* REC badge + labels (only show once fully connected in live phase) */}
                            {isLkConnected && isAgentReady && flowPhase === 'live' && (
                              <div className="absolute inset-0 z-40 pointer-events-none">
                                <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-red-500/30">
                                  <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}><Circle className="h-3 w-3 fill-red-500 text-red-500" /></motion.div>
                                  <span className="text-[10px] md:text-xs font-black text-white uppercase tracking-widest">Rec</span>
                                  <div className="h-1 w-1 rounded-full bg-white/20 mx-1" />
                                  <span className="text-[10px] md:text-xs font-mono text-white/80">{formatTime(recordingSeconds)}</span>
                                </div>
                                <div className="absolute top-4 right-4 flex flex-col items-end">
                                  <span className="text-[10px] text-[#00b4d8] font-bold uppercase tracking-widest mb-0.5 opacity-80">Ailana AI</span>
                                  <span className="text-white/60 font-medium text-[10px] uppercase tracking-tighter">Secure Regulatory Stream</span>
                                </div>
                              </div>
                            )}
                            <VideoStage mode={pendingMode} keyframeMetadata={keyframeMetaData} />
                            <ChannelStartTrigger isLivePhase={flowPhase === 'live' && pendingMode !== 'chat'} mode={pendingMode} />

                            {/* Standard audio renderer — used as a safety fallback when Keyframe is offline */}
                            {!keyframeMetaData && <RoomAudioRenderer />}
                          </LiveKitRoom>
                        </motion.div>
                      )}

                      {/* ── Live Chat view ── */}
                      {flowPhase === 'chat' && (
                        <motion.div
                          key="chat-view"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0"
                        >
                          <LiveChatPanel />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {flowPhase !== 'live' && flowPhase !== 'chat' && flowPhase !== 'intro' && flowPhase !== 'compliance' && (
                      <div className="absolute bottom-6 text-xs md:text-sm text-[#00b4d8]/60 font-medium tracking-wide">
                        {flowPhase === 'connecting' ? 'Verifying Compliance Token...' : 'LiveKit Video Room Space'}
                      </div>
                    )}
                  </div>
                </div>

                {flowPhase !== 'intro' && flowPhase !== 'connecting' && (
                  <div
                    onMouseEnter={() => { setIsNavExpanded(true); setHasAutoHidden(true); }}
                    onMouseLeave={() => { if (hasAutoHidden) setIsNavExpanded(false); }}
                    onTouchStart={() => { setIsNavExpanded(true); setHasAutoHidden(true); }}
                    className={`absolute z-20 flex md:flex-col items-center justify-center p-2 sm:p-4 md:p-8 shadow-[0_-20px_40px_rgba(0,0,0,0.5)] md:shadow-[-20px_0_40px_rgba(0,0,0,0.5)] border-t md:border-t-0 md:border-l border-white/5 bg-[#0a0a0a]/90 backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] bottom-0 left-0 right-0 w-full md:w-[320px] md:top-0 md:bottom-0 md:left-auto md:right-0 ${isNavExpanded ? "translate-y-0 md:translate-x-0 opacity-100" : "translate-y-[calc(100%-24px)] md:translate-y-0 md:translate-x-[calc(100%-24px)] opacity-60 hover:opacity-100 cursor-pointer"
                      }`}
                  >
                    <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-0 w-6 h-full items-center justify-center pointer-events-none">
                      <div className={`w-1 h-12 rounded-full transition-colors ${isNavExpanded ? 'bg-white/10' : 'bg-[#00b4d8]/60 shadow-[0_0_10px_rgba(0,180,216,0.5)]'}`} />
                    </div>
                    <div className="md:hidden absolute top-0 left-1/2 -translate-x-1/2 h-6 w-full flex items-center justify-center pointer-events-none">
                      <div className={`h-1 w-12 rounded-full transition-colors ${isNavExpanded ? 'bg-white/10' : 'bg-[#00b4d8]/60 shadow-[0_0_10px_rgba(0,180,216,0.5)]'}`} />
                    </div>
                    <div className={`grid grid-cols-5 md:flex md:flex-col gap-1 sm:gap-2 md:gap-3.5 w-full mx-auto md:mx-0 transition-opacity duration-300 mt-2 md:mt-0 ${isNavExpanded ? 'opacity-100' : 'opacity-0'}`}>
                      <SideButton
                        onClick={() => handleAIAction('video')}
                        icon={<Video className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />}
                        label="Live with Ailana"
                        isActive={(flowPhase === 'live' || flowPhase === 'compliance') && pendingMode === 'video'}
                      />
                      <SideButton
                        onClick={() => handleAIAction('avatar-chat')}
                        icon={<Send className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />}
                        label="Type to AI"
                        isActive={(flowPhase === 'live' || flowPhase === 'compliance') && pendingMode === 'avatar-chat'}
                      />
                      <SideButton
                        onClick={() => handleAIAction('voice')}
                        icon={<Mic className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />}
                        label="AI Voice - Speak to AI"
                        isActive={(flowPhase === 'live' || flowPhase === 'compliance') && pendingMode === 'voice'}
                      />
                      <SideButton
                        onClick={handleChatAction}
                        icon={<MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />}
                        label="Live Chat"
                        isActive={flowPhase === 'chat'}
                      />
                      <SideButton
                        onClick={() => window.location.href = 'tel:+1234567890'}
                        icon={<Phone className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />}
                        label="Talk to Officer"
                      />
                      <SideButton
                        onClick={() => window.open("https://warpme.neetocal.com/meeting-with-david-patten-19", "_blank", "noopener,noreferrer")}
                        icon={<Calendar className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />}
                        label="Book Appt."
                      />
                    </div>
                  </div>
                )}
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
            if (flowPhase === 'idle') {
              setFlowPhase('intro');
              setIntroSubPhase('playing');
              setIsIntroComplete(false);
              setPendingMode('intro-avatar');
              fetchToken('intro-avatar');
            }
          }}
          className="group relative flex items-center gap-2.5 md:gap-4 rounded-full bg-gradient-to-br from-[#00b4d8] via-[#023e8a] to-[#560bad] p-1.5 pr-5 md:p-2.5 md:pr-8 text-white shadow-[0_0_40px_rgba(0,180,216,0.5),0_0_20px_rgba(86,11,173,0.5)] transition-all duration-300 hover:shadow-[0_0_60px_rgba(0,180,216,0.7),0_0_30px_rgba(86,11,173,0.7)] hover:-translate-y-2 hover:scale-[1.02] active:scale-95 cursor-pointer"
        >
          <div className="relative h-10 w-10 md:h-14 md:w-14 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border border-white/30 backdrop-blur-sm">
            <Image
              src="/friendly_ai_avatar_v2.png"
              alt="Ailana"
              fill
              sizes="(max-width: 768px) 40px, 56px"
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] md:text-xs font-bold text-white/70 uppercase tracking-[0.2em] mb-0.5">Live with Ailana</span>
            <span className="text-sm md:text-lg font-black tracking-tight text-white flex items-center gap-2">
              Start Conversation
              <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4 text-yellow-300 animate-pulse" />
            </span>
          </div>
        </motion.div>
      </div>
    </>
  );
}

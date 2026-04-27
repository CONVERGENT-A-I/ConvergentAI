"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Sparkles, X, Phone, Calendar, Video, Mic, MicOff, VideoOff, PhoneOff, Monitor, MoreHorizontal, Circle, Loader2, Send, Share2, Check, Shield, ArrowRight, Clock, Lock, Headphones } from "lucide-react";
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
import LiveChatPanel from "./live-chat-panel";
import VideoStage from "./video-stage";

type FlowPhase = 'idle' | 'connecting' | 'intro' | 'compliance' | 'live';
type IntroSubPhase = 'connecting' | 'playing';
type PendingMode = 'intro-avatar' | 'video' | 'voice' | 'avatar-chat';

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

/** Custom control bar for the Google Meet-style live UI */
function RoomControls({ onEnd, mode }: { onEnd: () => void; mode: string }) {
  const room = useRoomContext();
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCamOn, setIsCamOn] = useState(false);

  useEffect(() => {
    if (room.state !== 'connected') return;
    setIsMicOn(room.localParticipant?.isMicrophoneEnabled ?? false);
    setIsCamOn(room.localParticipant?.isCameraEnabled ?? false);
  }, [room, room.state]);

  const toggleMic = async () => {
    try {
      const next = !isMicOn;
      await room.localParticipant.setMicrophoneEnabled(next);
      setIsMicOn(next);
    } catch (e) { console.error('Mic toggle error:', e); }
  };
  const toggleCam = async () => {
    try {
      const next = !isCamOn;
      await room.localParticipant.setCameraEnabled(next);
      setIsCamOn(next);
    } catch (e) { console.error('Cam toggle error:', e); }
  };

  const controls = [
    { icon: isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />, label: isMicOn ? 'Mute' : 'Unmute', onClick: toggleMic, danger: false },
    { icon: isCamOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />, label: isCamOn ? 'Stop Video' : 'Start Video', onClick: toggleCam, danger: false },
    { icon: <PhoneOff className="h-5 w-5" />, label: 'End', onClick: onEnd, danger: true },
    { icon: <Monitor className="h-5 w-5" />, label: 'Share', onClick: () => {}, danger: false },
    { icon: <MoreHorizontal className="h-5 w-5" />, label: 'More', onClick: () => {}, danger: false },
  ];

  return (
    <div className="flex items-center justify-center gap-2 md:gap-4">
      {controls.map((c) => (
        <button
          key={c.label}
          onClick={c.onClick}
          className={`flex flex-col items-center gap-1 p-2.5 md:p-3 rounded-2xl transition-all cursor-pointer group ${
            c.danger
              ? 'bg-red-500/90 hover:bg-red-600 text-white shadow-[0_4px_20px_rgba(239,68,68,0.4)]'
              : 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white backdrop-blur-md'
          }`}
        >
          <span className="group-hover:scale-110 transition-transform">{c.icon}</span>
          <span className="text-[9px] md:text-[10px] font-semibold tracking-wide">{c.label}</span>
        </button>
      ))}
    </div>
  );
}

/** In-room chat panel using LiveKit useChat(), displayed as side panel */
function InRoomChatPanel() {
  const { chatMessages, send, isSending } = useChat();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    send(text).catch(console.error);
    setInput('');
  };

  const formatMsgTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-[#fafbfc] dark:bg-[#0a0c14] rounded-xl md:rounded-none overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 dark:border-white/10">
        <h3 className="font-bold text-gray-900 dark:text-white text-base">Chat</h3>
        <button className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 transition-colors cursor-pointer">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ scrollbarWidth: 'thin' }}>
        {chatMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 gap-4">
            <div className="h-14 w-14 rounded-full bg-blue-500/10 flex items-center justify-center">
              <MessageCircle className="h-7 w-7 text-blue-500" />
            </div>
            <p className="text-gray-400 text-sm">Send a message to start chatting with Ailana</p>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {['Schedule a Call', 'Email Summary', 'Help me decide'].map(chip => (
                <button
                  key={chip}
                  onClick={() => { setInput(chip); }}
                  className="px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium hover:bg-blue-500/20 transition-colors cursor-pointer border border-blue-500/20"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {chatMessages.map((msg, i) => {
          const isAgent = msg.from?.identity?.startsWith('agent') || msg.from?.identity === 'agent';
          return (
            <div key={i} className={`flex gap-2.5 max-w-[90%] ${isAgent ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}>
              {isAgent && (
                <div className="h-7 w-7 rounded-full bg-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
              )}
              <div className="flex flex-col gap-0.5">
                <div className={`px-3.5 py-2.5 text-[13px] leading-relaxed rounded-2xl ${
                  isAgent
                    ? 'bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-100 rounded-tl-sm'
                    : 'bg-blue-500 text-white rounded-tr-sm'
                }`}>
                  {msg.message}
                </div>
                <span className={`text-[10px] text-gray-400 font-medium px-1 ${isAgent ? '' : 'text-right'}`}>
                  {formatMsgTime(msg.timestamp)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-white/10">
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 rounded-full px-4 py-2 border border-gray-200 dark:border-white/10 focus-within:border-blue-400 dark:focus-within:border-blue-500 transition-colors">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-gray-800 dark:text-white placeholder-gray-400 text-sm outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center disabled:opacity-30 hover:bg-blue-600 transition-all cursor-pointer shrink-0"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
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
  const [complianceChecked, setComplianceChecked] = useState(false);
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

  const handleAgree = () => {
    setHasAgreed(true);
    if (!token) {
      setFlowPhase('connecting');
      fetchToken(pendingMode);
    } else {
      setFlowPhase('live');
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
      }, 1650);
      return () => clearTimeout(timer);
    }
  }, [isVideoReady, flowPhase]);



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
                className="relative w-[95vw] sm:w-[90vw] max-w-7xl h-[92vh] min-h-[500px] max-h-[960px] bg-[#f5f6fa] rounded-3xl shadow-[0_8px_60px_rgba(0,0,0,0.25)] flex flex-col overflow-hidden border border-gray-200"
              >

                <div className="absolute inset-0 flex flex-col overflow-hidden z-0">
                  {/* ── Top Header ── */}
                  <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 relative z-10 shrink-0 bg-white border-b border-gray-200">
                    <div className="flex items-center gap-2.5">
                      <div className="relative h-7 w-7 md:h-8 md:w-8 flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-transparent">
                        <Image src={AppIcon} alt="ConvergentAI Logo" fill sizes="32px" className="object-contain" />
                      </div>
                      <span className="font-extrabold text-gray-900 text-sm md:text-lg tracking-tight">Convergent AI</span>
                    </div>

                    {/* Center: Mode Switcher (live phase only) */}
                    {flowPhase === 'live' && isLkConnected && isAgentReady && (
                      <div className="absolute left-1/2 -translate-x-1/2 flex items-center bg-gray-100 rounded-full p-1 border border-gray-200 shadow-sm">
                        {([
                          { m: 'video' as PendingMode, icon: <Video className="h-3.5 w-3.5" />, label: 'Video' },
                          { m: 'voice' as PendingMode, icon: <Phone className="h-3.5 w-3.5" />, label: 'Voice' },
                          { m: 'avatar-chat' as PendingMode, icon: <MessageCircle className="h-3.5 w-3.5" />, label: 'Chat' },
                        ]).map(({ m, icon, label }) => (
                          <button
                            key={m}
                            onClick={() => handleAIAction(m as 'video' | 'voice' | 'avatar-chat')}
                            className={`flex items-center gap-1.5 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold transition-all cursor-pointer ${
                              pendingMode === m
                                ? 'bg-blue-500 text-white shadow-md'
                                : 'text-gray-500 hover:bg-white hover:text-gray-700'
                            }`}
                          >
                            {icon}
                            <span className="hidden sm:inline">{label}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Right: Trust + Close */}
                    <div className="flex items-center gap-2 md:gap-4">
                      {flowPhase === 'live' && isLkConnected && (
                        <>
                          <div className="hidden md:flex items-center gap-1.5 text-gray-500 text-xs font-medium">
                            <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                            <span>Available 24/7</span>
                          </div>
                          <div className="hidden md:flex items-center gap-1.5 text-gray-500 text-xs font-medium">
                            <Lock className="h-3 w-3" />
                            <span>Secure &amp; Private</span>
                          </div>
                        </>
                      )}
                      <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* ── Main Content ── */}
                  <div className="flex-1 min-h-0 relative w-full flex flex-col items-center justify-center overflow-hidden bg-[#f0f1f5]">

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
                            className="w-full h-full object-contain bg-black"
                            onLoadedData={() => setIsVideoReady(true)}
                            onTimeUpdate={(e) => {
                              const video = e.currentTarget;
                              if (video.duration > 0 && video.currentTime >= video.duration - 1.0) {
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
                                exit={{ opacity: 0, transition: { duration: 0.5 } }}
                                className="absolute inset-0 z-[160] flex flex-col items-center justify-center pointer-events-none bg-black/70"
                              >
                                <div
                                  className="w-24 h-24 drop-shadow-[0_0_15px_rgba(0,180,216,0.5)] animate-spin"
                                  style={{ animationDuration: '2s' }}
                                >
                                  <img src="/favicon.png" alt="Loading..." className="w-full h-full object-contain" />
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
                                  <div className="max-w-2xl w-full bg-[#0a0a0a]/90 border border-white/10 rounded-3xl p-6 md:p-10 shadow-[0_0_50px_rgba(0,180,216,0.2)] flex flex-col gap-6 overflow-hidden">
                                    <div className="text-center space-y-2">
                                      <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Safety & Compliance</h3>
                                      <p className="text-gray-400 text-sm">Please review and accept our terms to get started.</p>
                                    </div>

                                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/40 rounded-xl p-4 border border-white/5 text-gray-300 text-xs md:text-sm leading-relaxed max-h-[300px]">
                                      <h4 className="font-bold text-white mb-2">Terms and Conditions for ConvergentAI</h4>
                                      <p className="mb-4">1. Introduction: By using our AI assistant, you agree to these terms. Our assistant uses real-time voice and video processing to provide mortgage-related information.</p>
                                      <p className="mb-4">2. Data Privacy: We value your privacy. Conversations are recorded and processed to improve our service and for regulatory compliance. Your personal data is handled according to our Privacy Policy.</p>
                                      <p className="mb-4">3. No Financial Advice: The information provided by the AI assistant is for informational purposes only and does not constitute financial, legal, or professional advice. Always consult with a qualified professional for mortgage decisions.</p>
                                      <p className="mb-4">4. User Responsibility: You are responsible for the information you provide and the actions you take based on the AI's responses.</p>
                                      <p className="mb-4">5. Recording Disclosure: This session may be recorded for quality assurance and compliance purposes. By continuing, you consent to such recording.</p>
                                    </div>

                                    <div className="flex flex-col gap-6">
                                      <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative flex items-center justify-center">
                                          <input 
                                            type="checkbox" 
                                            className="sr-only" 
                                            checked={complianceChecked}
                                            onChange={(e) => setComplianceChecked(e.target.checked)}
                                          />
                                          <div className={`h-5 w-5 rounded border transition-all flex items-center justify-center ${complianceChecked ? 'bg-[#00b4d8] border-[#00b4d8]' : 'bg-white/5 border-white/20 group-hover:border-[#00b4d8]/50'}`}>
                                            {complianceChecked && <Check className="h-3.5 w-3.5 text-white stroke-[3px]" />}
                                          </div>
                                        </div>
                                        <span className="text-gray-300 text-xs md:text-sm font-medium select-none">I have read and agree to the compliance terms above</span>
                                      </label>

                                      <div className="flex flex-col sm:flex-row gap-3">
                                        <button 
                                          onClick={() => setIsOpen(false)}
                                          className="flex-1 py-3 px-6 rounded-xl border border-white/10 text-gray-400 font-bold hover:bg-white/5 transition-colors cursor-pointer"
                                        >
                                          Cancel
                                        </button>
                                        <button 
                                          disabled={!complianceChecked}
                                          onClick={() => {
                                            setPendingMode('video');
                                            setHasAgreed(true);
                                            setFlowPhase('live');
                                          }}
                                          className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group cursor-pointer ${complianceChecked ? 'bg-white text-black hover:bg-[#00b4d8] hover:text-white shadow-[0_10px_20px_rgba(0,180,216,0.2)]' : 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'}`}
                                        >
                                          Get started
                                          <ArrowRight className={`h-4 w-4 transition-transform ${complianceChecked ? 'group-hover:translate-x-1' : ''}`} />
                                        </button>
                                      </div>
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

                            {/* ── Google Meet Split Layout (always show in live phase) ── */}
                            {flowPhase === 'live' && (
                              <div className="flex-1 flex flex-col min-h-0 absolute inset-0">
                                <div className="flex-1 flex min-h-0 p-2 md:p-3 gap-3">
                                  {/* Left: Avatar Area */}
                                  <div className="flex-1 relative rounded-2xl overflow-hidden bg-black shadow-xl">
                                    {/* REC badge - only when connected */}
                                    {isLkConnected && isAgentReady && (
                                      <div className="absolute top-3 left-3 z-50 flex items-center gap-2 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-red-500/30">
                                        <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}><Circle className="h-2.5 w-2.5 fill-red-500 text-red-500" /></motion.div>
                                        <span className="text-[9px] font-black text-white uppercase tracking-widest">Rec</span>
                                        <span className="text-[9px] font-mono text-white/70">{formatTime(recordingSeconds)}</span>
                                      </div>
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
                                        <p className="text-white/90 font-semibold text-sm">Setting up your session...</p>
                                        <p className="text-white/40 text-xs mt-1">This usually takes a few seconds</p>
                                      </div>
                                    )}

                                    <div className="absolute inset-0">
                                      <VideoStage mode={pendingMode} keyframeMetadata={keyframeMetaData} hideControls />
                                    </div>

                                    {/* Speech bubble */}
                                    {isLkConnected && isAgentReady && (
                                      <div className="absolute bottom-20 left-4 z-50 max-w-[70%]">
                                        <div className="bg-black/60 backdrop-blur-md text-white text-sm px-4 py-2.5 rounded-2xl rounded-bl-sm border border-white/10 shadow-lg">
                                          Hi! I&apos;m your AI Assistant.<br/>How can I help you today?
                                        </div>
                                      </div>
                                    )}

                                    {/* Custom Controls */}
                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-50">
                                      <RoomControls onEnd={() => setIsOpen(false)} mode={pendingMode} />
                                    </div>
                                  </div>

                                  {/* Right: Chat Panel */}
                                  <div className="hidden md:flex w-[320px] lg:w-[360px] shrink-0 flex-col rounded-2xl overflow-hidden border border-gray-200 shadow-lg bg-white">
                                    <InRoomChatPanel />
                                  </div>
                                </div>

                                {/* Prefer to talk bar */}
                                <div className="shrink-0 px-4 py-2.5 flex items-center justify-center gap-4 border-t border-gray-200 bg-white">
                                  <div className="text-center">
                                    <p className="text-gray-700 text-xs md:text-sm font-semibold">Prefer to talk instead?</p>
                                    <p className="text-gray-400 text-[10px] md:text-xs">Switch to voice-only for a quick conversation.</p>
                                  </div>
                                  <button
                                    onClick={() => handleAIAction('voice')}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-300 text-gray-700 text-xs md:text-sm font-semibold hover:bg-blue-50 hover:border-blue-400 transition-all cursor-pointer shadow-sm"
                                  >
                                    <Phone className="h-3.5 w-3.5 text-blue-500" />
                                    Talk to me
                                  </button>
                                </div>

                                {/* Trust Footer */}
                                <div className="shrink-0 px-4 py-2 flex items-center justify-center gap-6 text-[10px] md:text-xs text-gray-400 bg-white border-t border-gray-100">
                                  <span className="flex items-center gap-1.5"><Lock className="h-3 w-3" />Your information is secure and never shared.</span>
                                  <span className="h-3 w-px bg-gray-300" />
                                  <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" />AI-Powered. Human-Focused. 24/7.</span>
                                </div>
                              </div>
                            )}

                            <ChannelStartTrigger isLivePhase={flowPhase === 'live'} mode={pendingMode} />
                            {!keyframeMetaData && <RoomAudioRenderer />}
                          </LiveKitRoom>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {flowPhase !== 'live' && flowPhase !== 'intro' && flowPhase !== 'compliance' && (
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs md:text-sm text-blue-400/60 font-medium tracking-wide">
                        {flowPhase === 'connecting' ? 'Verifying Compliance Token...' : ''}
                      </div>
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

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Sparkles, X, Phone, Calendar, Video, Mic, Menu, Circle, Loader2 } from "lucide-react";
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  ControlBar,
  useTracks,
  GridLayout,
  ParticipantTile,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";
import AppIcon from "../app/icon.png";

type SessionState = 'idle' | 'connecting' | 'live';

function SideButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col md:flex-row items-center justify-start gap-1 md:gap-4 w-full p-1 md:p-3.5 lg:p-4 rounded-xl md:rounded-2xl hover:bg-white/5 border border-transparent hover:border-[#00b4d8]/30 transition-all group text-center md:text-left hover:shadow-[0_0_20px_rgba(0,180,216,0.15)] cursor-pointer">
      <div className="flex-shrink-0 h-8 w-8 md:h-12 md:w-12 rounded-full bg-[#0B0F19] border border-white/10 text-[#00b4d8] flex items-center justify-center group-hover:scale-110 group-hover:bg-gradient-to-br from-[#00b4d8] via-[#023e8a] to-[#560bad] group-hover:border-transparent group-hover:text-white transition-all duration-300 shadow-sm mx-auto md:mx-0">
        {icon}
      </div>
      <span className="font-medium md:font-semibold text-gray-300 group-hover:text-white transition-colors text-[8px] sm:text-[10px] md:text-sm lg:text-base leading-none md:leading-tight w-full mt-1 md:mt-0 break-words whitespace-normal">
        {label}
      </span>
    </button>
  );
}

/**
 * Custom Stable Video Stage
 * Bypasses the default VideoConference component to avoid internal layout reconciliation errors.
 */
function VideoStage() {
  const tracks = useTracks(
    [
      Track.Source.Camera,
      Track.Source.ScreenShare,
    ],
    { onlySubscribed: true },
  );

  return (
    <div className="w-full h-full flex flex-col bg-black">
      <div className="flex-1 relative min-h-0">
        <GridLayout
          tracks={tracks}
          className="w-full h-full p-4"
        >
          <ParticipantTile />
        </GridLayout>
      </div>

      {/* Premium Minimal Control Bar */}
      <div className="h-20 flex items-center justify-center bg-[#0a0a0a] border-t border-white/5 px-6">
        <ControlBar
          variation="minimal"
          controls={{
            microphone: true,
            camera: true,
            chat: false,
            screenShare: true,
            leave: true
          }}
        />
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
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [token, setToken] = useState<string | null>(null);
  const [lkUrl, setLkUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLkConnected, setIsLkConnected] = useState(false);

  const fetchToken = async () => {
    try {
      setSessionState('connecting');
      setError(null);

      const response = await fetch('/api/get-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomName: 'mortgage-ai-room',
          participantName: `guest_${Math.floor(Math.random() * 10000)}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch LiveKit token');
      }

      const data = await response.json();
      setToken(data.token);
      setLkUrl(data.serverUrl);
      setSessionState('live');
    } catch (err) {
      console.error('Error connecting to LiveKit:', err);
      setError('Connection failed. Please try again.');
      setSessionState('idle');
    }
  };

  const handleAIAction = () => {
    if (!hasAgreed) {
      setShowDisclosure(true);
    } else {
      fetchToken();
    }
  };

  // Auto-peek options drawer after 7 seconds exactly once per session
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isOpen && !hasAutoHidden) {
      setIsNavExpanded(true);
      timeout = setTimeout(() => {
        setIsNavExpanded(false);
        setHasAutoHidden(true);
      }, 7000);
    } else if (!isOpen) {
      setHasAutoHidden(false); // Reset when modal closes so the 7 seconds repeats next time
      setSessionState('idle'); // Reset session state when modal is closed
      setToken(null);
      setLkUrl(null);
      setIsLkConnected(false);
    }
    return () => clearTimeout(timeout);
  }, [isOpen, hasAutoHidden]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/95 backdrop-blur-2xl font-sans"
          >
            <AnimatePresence mode="wait">
              {!hasAgreed ? (
                /* Focused Compliance Disclosure Gate */
                <motion.div
                  key="compliance-gate"
                  initial={{ scale: 0.9, opacity: 0, y: 30 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: -20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="relative w-full max-w-2xl bg-[#0a0a0a] border border-[#00b4d8]/30 rounded-3xl p-6 md:p-10 shadow-[0_0_100px_rgba(0,180,216,0.15)] flex flex-col overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00b4d8] to-transparent opacity-50" />

                  <h2 className="text-xl md:text-3xl font-bold text-white mb-6 shrink-0 flex items-center gap-4">
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-[#00b4d8]/10 flex items-center justify-center border border-[#00b4d8]/30 shadow-inner">
                      <Sparkles className="h-6 w-6 md:h-7 md:w-7 text-[#00b4d8]" />
                    </div>
                    Regulatory Notice
                  </h2>

                  <div className="text-gray-300 text-[14px] md:text-[16px] space-y-4 md:space-y-6 mb-8 md:mb-12 leading-relaxed overflow-y-auto flex-1 pr-3 custom-scrollbar">
                    <p className="font-semibold text-white/90 text-lg">
                      Interaction with Ailana (AI Assistant)
                    </p>
                    <p>
                      Before proceeding, please acknowledge that you are interacting with an automated system designed for mortgage informational purposes.
                    </p>
                    <ul className="space-y-4 md:space-y-6 list-none">
                      <li className="flex items-start gap-4">
                        <div className="mt-1.5 h-2 w-2 rounded-full bg-[#00b4d8] shrink-0 shadow-[0_0_10px_rgba(0,180,216,0.8)]" />
                        <span><strong className="text-white block mb-0.5">Non-Human Interaction:</strong> Ailana is an AI, not a human loan officer.</span>
                      </li>
                      <li className="flex items-start gap-4">
                        <div className="mt-1.5 h-2 w-2 rounded-full bg-[#00b4d8] shrink-0 shadow-[0_0_10px_rgba(0,180,216,0.8)]" />
                        <span><strong className="text-white block mb-0.5">Informational Only:</strong> Responses do not constitute financial advice, credit offers, or rate locks.</span>
                      </li>
                      <li className="flex items-start gap-4">
                        <div className="mt-1.5 h-2 w-2 rounded-full bg-[#00b4d8] shrink-0 shadow-[0_0_10px_rgba(0,180,216,0.8)]" />
                        <span><strong className="text-white block mb-1">Audit Trail:</strong> This conversation is recorded and timestamped for regulatory compliance and quality assurance.</span>
                      </li>
                      <li className="flex items-start gap-4">
                        <div className="mt-1.5 h-2 w-2 rounded-full bg-[#a855f7] shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                        <span><strong className="text-[#a855f7] block mb-1">Human Off-Ramp:</strong> You can request a human representative at any time by saying "Agent."</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-end border-t border-white/5 pt-6 md:pt-10 mt-auto">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-full sm:w-auto px-8 py-3.5 font-bold text-gray-400 hover:text-white transition-all cursor-pointer hover:bg-white/5 rounded-xl"
                    >
                      No Thanks
                    </button>
                    <button
                      onClick={async () => {
                        setHasAgreed(true);
                        await fetchToken();
                      }}
                      className="w-full sm:w-auto px-10 py-4 rounded-xl bg-gradient-to-r from-[#00b4d8] via-[#023e8a] to-[#560bad] text-white font-black tracking-wider transition-all shadow-[0_0_30px_rgba(0,180,216,0.4)] hover:shadow-[0_0_50px_rgba(0,180,216,0.6)] transform hover:scale-[1.03] active:scale-95 cursor-pointer uppercase text-sm"
                    >
                      I Agree & Continue
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* Main Interactive Stage & Sidebar (Revealed after Agreement) */
                <motion.div
                  key="main-stage"
                  initial={{ scale: 1.05, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="relative w-full max-w-5xl h-[85vh] min-h-[500px] max-h-[800px] bg-[#050505] rounded-3xl shadow-[0_0_80px_rgba(0,180,216,0.15)] flex flex-col overflow-hidden border border-[#00b4d8]/20"
                >
                  <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 md:top-6 md:right-6 z-50 p-2.5 rounded-full bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors shadow-sm border border-white/5 cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <div className="absolute inset-0 flex flex-col p-6 md:p-12 overflow-hidden bg-gradient-to-br from-[#050505] to-[#111111] z-0">
                    <div className="flex items-center gap-3 mb-8 relative z-10 pt-2 md:pt-0">
                      <div className="relative h-10 w-10 flex shrink-0 items-center justify-center overflow-hidden rounded-full shadow-[0_0_15px_rgba(0,180,216,0.3)] bg-transparent">
                        <Image src={AppIcon} alt="ConvergentAI Logo" fill className="object-contain" />
                      </div>
                      <span className="font-extrabold text-white text-2xl tracking-tight">ConvergentAI</span>
                    </div>

                    <div className="flex-1 relative w-full h-full flex flex-col items-center justify-center rounded-2xl bg-black/60 shadow-xl border border-white/5 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-[#00b4d8]/10 to-transparent pointer-events-none" />

                      <AnimatePresence mode="wait">
                        {sessionState === 'idle' && (
                          <motion.div key="idle-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center">
                            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="relative z-10 w-32 h-32 md:w-44 md:h-44 mb-8 rounded-full overflow-hidden border-[6px] md:border-8 border-[#0B0F19] shadow-[0_0_40px_rgba(0,180,216,0.3)]">
                              <Image src="/friendly_ai_avatar_v2.png" alt="AI Assistant" fill className="object-cover" />
                            </motion.div>
                            <div className="relative z-10 bg-[#0B0F19]/80 backdrop-blur-sm px-6 md:px-8 py-3 md:py-4 rounded-2xl shadow-lg border border-white/10 transform -translate-y-4 max-w-[280px] md:max-w-sm text-center">
                              <p className="text-gray-200 font-medium text-sm md:text-lg">Get instant answers to your mortgage questions...</p>
                            </div>
                          </motion.div>
                        )}

                        {sessionState === 'connecting' && (
                          <motion.div key="connecting-view" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="flex flex-col items-center justify-center text-center px-6">
                            <div className="relative mb-8">
                              <Loader2 className="h-20 w-20 text-[#00b4d8] animate-spin opacity-20" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-12 w-12 rounded-full bg-[#00b4d8] animate-pulse" />
                              </div>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">Initializing Secure Bridge...</h3>
                            <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-2xl max-w-sm">
                              <p className="text-[11px] md:text-xs text-[#00b4d8] font-bold uppercase tracking-[0.2em] mb-2 opacity-80">Regulatory Disclosure</p>
                              <p className="text-gray-300 text-sm md:text-base font-medium leading-relaxed">This video call will be recorded for regulatory compliance.</p>
                            </div>
                          </motion.div>
                        )}

                        {sessionState === 'live' && token && lkUrl && (
                          <motion.div key="live-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex flex-col items-center justify-center p-0">
                            <LiveKitRoom
                              key={token}
                              video={true}
                              audio={true}
                              token={token}
                              serverUrl={lkUrl}
                              connect={true}
                              data-lk-theme="default"
                              className="w-full h-full"
                              onConnected={() => setIsLkConnected(true)}
                              onDisconnected={() => { setSessionState('idle'); setToken(null); setLkUrl(null); setIsLkConnected(false); }}
                            >
                              {/* ── Connecting overlay — visible until WebRTC is fully up ── */}
                              <AnimatePresence>
                                {!isLkConnected && (
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

                              {/* REC badge + labels (only show once connected) */}
                              {isLkConnected && (
                                <div className="absolute inset-0 z-10 pointer-events-none">
                                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-red-500/30">
                                    <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}><Circle className="h-3 w-3 fill-red-500 text-red-500" /></motion.div>
                                    <span className="text-[10px] md:text-xs font-black text-white uppercase tracking-widest">Rec</span>
                                    <div className="h-1 w-1 rounded-full bg-white/20 mx-1" />
                                    <span className="text-[10px] md:text-xs font-mono text-white/80">00:00:42</span>
                                  </div>
                                  <div className="absolute top-4 right-16 flex flex-col items-end">
                                    <span className="text-[10px] text-[#00b4d8] font-bold uppercase tracking-widest mb-0.5 opacity-80">Ailana AI</span>
                                    <span className="text-white/60 font-medium text-[10px] uppercase tracking-tighter">Secure Regulatory Stream</span>
                                  </div>
                                </div>
                              )}
                              <VideoStage />
                              <RoomAudioRenderer />
                            </LiveKitRoom>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {sessionState !== 'live' && (
                        <div className="absolute bottom-6 text-xs md:text-sm text-[#00b4d8]/60 font-medium tracking-wide">
                          {sessionState === 'connecting' ? 'Verifying Compliance Token...' : 'LiveKit Video Room Space'}
                        </div>
                      )}
                    </div>
                  </div>

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
                      <SideButton onClick={handleAIAction} icon={<Video className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />} label="Video Meet" />
                      <SideButton onClick={handleAIAction} icon={<Mic className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />} label="AI Voice - Speak to AI" />
                      <SideButton onClick={handleAIAction} icon={<MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />} label="Live Chat" />
                      <SideButton icon={<Phone className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />} label="Phone Call" />
                      <SideButton onClick={() => window.open("https://warpme.neetocal.com/meeting-with-david-patten-19", "_blank", "noopener,noreferrer")} icon={<Calendar className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />} label="Book Appointment" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[100] font-sans"
      >
        <motion.div
          role="button"
          tabIndex={0}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => {
            setIsOpen(true);
            if (!hasAgreed) {
              setShowDisclosure(true);
            }
          }}
          className="group relative flex items-center gap-2.5 md:gap-4 rounded-full bg-gradient-to-br from-[#00b4d8] via-[#023e8a] to-[#560bad] p-1.5 pr-5 md:p-2.5 md:pr-8 text-white shadow-[0_0_40px_rgba(0,180,216,0.5),0_0_20px_rgba(86,11,173,0.5)] transition-all duration-300 hover:shadow-[0_0_60px_rgba(0,180,216,0.7),0_0_30px_rgba(86,11,173,0.7)] hover:-translate-y-2 hover:scale-[1.02] active:scale-95 cursor-pointer"
        >
          {/* Pulsing Aura Behind Button */}
          <motion.div
            className="absolute -inset-2 -z-10 rounded-full bg-gradient-to-br from-[#00b4d8] via-[#023e8a] to-[#560bad] opacity-60 blur-xl"
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <AnimatePresence>
            {isHovered && (
              <motion.div
                key="hover-effects"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none absolute -inset-16 z-50"
              >

                {/* Glitters flowing outwards evenly all around on hover */}
                {Array.from({ length: 12 }).map((_, i) => {
                  // Spawn randomly all around the container
                  const startX = Math.random() * 100;
                  const startY = Math.random() * 100;

                  // Determine outward direction based on origin
                  // If on the left side, shoot left; if top, shoot up, etc.
                  const dirX = startX < 50 ? -1 : 1;
                  const dirY = startY < 50 ? -1 : 1;

                  // Shoot outward in their respective directions
                  const randomX = dirX * (Math.random() * 80 + 30);
                  const randomY = dirY * (Math.random() * 60 + 20);

                  return (
                    <motion.div
                      key={i}
                      className="absolute h-[5px] w-[5px] md:h-2 md:w-2 rounded-full bg-[#a855f7] blur-[1px] shadow-[0_0_15px_rgba(168,85,247,1)]"
                      style={{
                        left: `${startX}%`,
                        top: `${startY}%`,
                      }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{
                        x: randomX,
                        y: randomY,
                        scale: [0, Math.random() * 2 + 0.5, 0],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 1 + Math.random() * 1.5,
                        repeat: Infinity,
                        delay: Math.random() * 0.5,
                        ease: "easeOut",
                      }}
                    />
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 3D Inner Top Highlight for Glassy look */}
          <div className="pointer-events-none absolute inset-0 rounded-full border-t border-white/50 bg-gradient-to-b from-white/10 to-transparent" />

          {/* Dynamic Glassy Shine (Idle flash & Hover shimmer) */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
            <motion.div
              className="absolute -top-10 -bottom-10 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-[30deg]"
              animate={{ x: ["-300%", "400%"] }}
              transition={
                isHovered
                  ? { duration: 1, repeat: Infinity, ease: "linear" }
                  : { duration: 1.5, repeat: Infinity, repeatDelay: 4.5, ease: "easeInOut" }
              }
            />
          </div>

          {/* Avatar Wrapper to handle localized scaling & aggressive waving */}
          <motion.div
            className="relative shrink-0 flex items-center justify-center h-10 w-10 md:h-14 md:w-14 origin-bottom md:origin-bottom-right"
            animate={
              isHovered
                ? { rotate: [0, -25, 15, -20, 10, 0], scale: 1.15 }
                : { rotate: [0, -25, 20, -20, 10, 0], scale: [1, 1.3, 1.3, 1.3, 1.1, 1] }
            }
            transition={
              isHovered
                ? { duration: 0.9, ease: "easeInOut" }
                : { duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 4.5 }
            }
          >
            {/* Outer pulse ring for the headshot */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-[3px] md:-inset-1 rounded-full border border-dashed border-[#a855f7] opacity-60"
            />

            {/* AI Headshot Image */}
            <div className="relative h-full w-full overflow-hidden rounded-full border-[1.5px] border-[#a855f7]/60 bg-[#560bad] shadow-[0_0_15px_rgba(86,11,173,0.5)]">
              <Image
                src="/friendly_ai_avatar_v2.png"
                alt="Friendly AI Assistant"
                fill
                className="object-cover"
              />
            </div>
          </motion.div>

          {/* Text Content */}
          <div className="relative z-10 flex flex-col items-start pr-1 md:pr-2">
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.25em] text-[#00b4d8] drop-shadow-md">
              Wait! Let's Talk
            </span>
            <span className="flex items-center gap-1.5 text-[13px] md:text-lg font-black tracking-tight text-white group-hover:text-[#00b4d8] transition-all drop-shadow-md">
              Chat with AI <Sparkles className="h-3.5 w-3.5 md:h-5 md:w-5 text-[#00b4d8]" />
            </span>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}

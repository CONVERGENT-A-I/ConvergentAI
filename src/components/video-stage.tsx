"use client";

import {
  ControlBar,
  useTracks,
  GridLayout,
  ParticipantTile,
  useParticipants,
  useChat,
  VideoTrack,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { Users, Send, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import AppIcon from "../app/icon.png";
import KeyframeAvatar from "./keyframe-avatar";

import { useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * High-End Reactive Audio Visualizer
 */
function VoiceVisualizer() {
  const participants = useParticipants();
  // The agent usually has an identity starting with 'agent-'
  const agent = participants.find(p => p.identity.startsWith('agent-'));
  
  // Use a spring-dampened motion value for organic, smooth transitions
  const audioMotion = useMotionValue(0);
  const smoothLevel = useSpring(audioMotion, { 
    damping: 30, // High damping for smoothness
    stiffness: 150, // Decent stiffness for responsiveness
    mass: 0.5
  });

  // Map the 0-1 audio level to visually impactful ranges
  const glowScale = useTransform(smoothLevel, [0, 1], [1, 1.6]);
  const glowOpacity = useTransform(smoothLevel, [0, 1], [0.05, 0.4]);
  const ringScale = useTransform(smoothLevel, [0, 1], [1, 1.2]);
  const ringOpacity = useTransform(smoothLevel, [0, 1], [0.1, 0.6]);

  useEffect(() => {
    if (!agent) return;
    // High-frequency poll for the smoothest visual data
    const interval = setInterval(() => {
      audioMotion.set(agent.audioLevel);
    }, 16); // ~60fps poll
    return () => clearInterval(interval);
  }, [agent, audioMotion]);

  return (
    <div className="relative flex items-center justify-center">
      {/* Deep Background Pulse - Smoothed */}
      <motion.div
        style={{ 
          scale: glowScale,
          opacity: glowOpacity
        }}
        className="absolute inset-[-120px] rounded-full bg-[#00b4d8] blur-[100px] pointer-events-none"
      />
      
      {/* Background Reactive Glows - Smoothed */}
      <motion.div
        style={{ 
          scale: ringScale,
          opacity: ringOpacity
        }}
        className="absolute inset-[-60px] rounded-full bg-[#00b4d8] blur-[80px] pointer-events-none"
      />
      
      {/* Spinning Outer Ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[-40px] rounded-full border border-white/10 border-t-[#00b4d8]/40 border-r-[#560bad]/40"
      />

      {/* Reactive Frequency Rings - Smoothed with useTransform */}
      <motion.div
        style={{ 
          scale: 1, // Base scale
          scaleX: useSpring(audioMotion, { stiffness: 100, damping: 40 }), // Pulse X
          scaleY: useSpring(audioMotion, { stiffness: 100, damping: 40 }), // Pulse Y
          borderColor: "rgba(0, 180, 216, 0.4)"
        }}
        className="absolute inset-[-20px] rounded-full border-2 border-white/5 transition-colors"
      />
      
      <motion.div
        style={{ 
          scale: smoothLevel,
          opacity: smoothLevel
        }}
        className="absolute inset-[-10px] rounded-full bg-gradient-to-tr from-[#00b4d8]/20 to-[#560bad]/20 blur-md"
      />

      {/* Central Spinning Logo */}
      <div className="relative h-40 w-40 md:h-56 md:w-56 rounded-full bg-[#0a0a0a] border border-white/10 flex items-center justify-center overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="relative h-32 w-32 md:h-44 md:w-44 opacity-90"
        >
          <Image src={AppIcon} alt="Logo" fill sizes="176px" className="object-contain" />
        </motion.div>
        
        {/* Glassmorphism Highlight */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Frequency Bar Visualizer - Subtle and Smoothed */}
      <div className="absolute -bottom-16 flex items-center gap-1.5 h-10">
        {[...Array(9)].map((_, i) => (
          <motion.div
            key={i}
            style={{ 
              height: 8,
              scaleY: useTransform(smoothLevel, [0, 1], [1, 1.5 + Math.random()]),
              opacity: useTransform(smoothLevel, [0, 1], [0.3, 1]) 
            }}
            className="w-1.5 rounded-full bg-gradient-to-t from-[#00b4d8] to-white origin-bottom"
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Custom Stable Video Stage
 * Bypasses the default VideoConference component to avoid internal layout reconciliation errors.
 */
export default function VideoStage({ mode = 'video', keyframeMetadata }: { mode?: string, keyframeMetadata?: any }) {
  const [inputText, setInputText] = useState("");
  const { send } = useChat();

  // Camera + ScreenShare for the video grid; Microphone not needed here
  // (agent audio is handled inside KeyframeAvatar via useParticipants)
  const tracks = useTracks(
    [Track.Source.Camera, Track.Source.ScreenShare],
    { onlySubscribed: true },
  );

  // Human participants only — excludes agent and any Keyframe participants
  const participants = useParticipants().filter(
    (p) => !p.identity.startsWith('agent-') && !p.identity.startsWith('keyframe-')
  );

  // Video grid tracks — exclude tiles from agent participants
  const gridTracks = tracks.filter(
    (t) => !t.participant.identity.startsWith('agent-') && !t.participant.identity.startsWith('keyframe-')
  );

  if (mode === 'avatar-chat') {
    return (
      <div className="w-full h-full flex flex-col bg-[#050505] relative overflow-hidden">
        {/* Deep Ambient Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1a0f2e_0%,_#050505_100%)] opacity-90" />
        <div className="absolute top-0 -left-[10%] w-[40%] h-[40%] bg-[#00b4d8]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 -right-[10%] w-[40%] h-[40%] bg-[#560bad]/5 blur-[120px] rounded-full" />

        {/* Avatar fills flex-1; input bar sits below */}
        <div className="flex-1 min-h-0 relative z-10 overflow-hidden">
          <div className="absolute inset-0 rounded-none overflow-hidden">
            {keyframeMetadata ? (
              <KeyframeAvatar
                keyframeMetadata={keyframeMetadata}
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-gray-500">
                <Loader2 className="h-10 w-10 animate-spin text-[#00b4d8]" />
                <p className="text-sm font-medium tracking-widest uppercase">Initializing Keyframe Session...</p>
              </div>
            )}
          </div>
        </div>

        {/* Input Bar — below the avatar, never overlapping */}
        <div className="shrink-0 z-20 px-6 py-4 bg-gradient-to-t from-black via-black/80 to-transparent">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileHover={{ scale: 1.01 }}
            className="group relative w-full max-w-2xl mx-auto"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-[#00b4d8]/20 via-[#560bad]/20 to-[#00b4d8]/20 rounded-full blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center gap-2 p-1.5 md:p-2 rounded-full bg-black/60 backdrop-blur-3xl border border-white/20 shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-all duration-300 group-focus-within:border-[#00b4d8]/50 group-focus-within:bg-black/80">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (inputText.trim()) { send(inputText); setInputText(""); }
                  }
                }}
                placeholder="Message Ailana..."
                rows={1}
                className="flex-1 bg-transparent border-none text-white placeholder-white/20 text-sm md:text-base px-6 py-3 md:py-3.5 outline-none resize-none transition-all duration-300 font-medium tracking-wide"
                style={{ maxHeight: '100px' }}
              />
              <motion.button
                onClick={() => { if (inputText.trim()) { send(inputText); setInputText(""); } }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!inputText.trim()}
                className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-br from-[#00b4d8] to-[#023e8a] text-white flex items-center justify-center shrink-0 disabled:opacity-20 disabled:grayscale transition-all duration-300 shadow-lg"
              >
                <Send className="h-4 w-4 md:h-5 md:w-5" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (mode === 'voice') {
    return (
      <div className="w-full h-full flex flex-col bg-[#050505] relative overflow-hidden">
        {/* Deep Ambient Aura */}
        <div className="absolute inset-0 bg-[#050505]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1a0f2e_0%,_transparent_70%)] opacity-60" />
        
        {/* Animated Background Orbs */}
        <motion.div 
            animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.05, 0.15, 0.05],
                x: [-30, 30, -30],
                y: [-30, 30, -30]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-[#00b4d8] rounded-full blur-[140px] pointer-events-none" 
        />
        <motion.div 
            animate={{ 
                scale: [1.3, 1, 1.3],
                opacity: [0.05, 0.15, 0.05],
                x: [30, -30, 30],
                y: [30, -30, 30]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-[#560bad] rounded-full blur-[150px] pointer-events-none" 
        />

        {/* Central Visualizer Stage */}
        <div className="flex-1 flex flex-col items-center justify-center z-10 p-6">
           <VoiceVisualizer />
           
           <div className="mt-20 text-center">
              <div className="flex items-center justify-center gap-2 opacity-40 hover:opacity-100 transition-opacity duration-500">
                 <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00b4d8] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00b4d8]"></span>
                 </span>
                 <p className="text-[#00b4d8] text-[8px] font-bold tracking-[0.2em] uppercase">AI Active</p>
              </div>
           </div>
        </div>

        {/* Control Bar - Minimized for Voice */}
        <div className="h-28 flex items-center justify-center bg-transparent border-t border-white/5 z-20 relative">
           <div className="absolute inset-0 bg-black/20 backdrop-blur-md pointer-events-none" />
           <div className="relative z-10 scale-110">
              <ControlBar 
                variation="minimal" 
                controls={{ 
                    microphone: true, 
                    camera: false, 
                    chat: false, 
                    screenShare: false, 
                    leave: true 
                }} 
              />
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-black overflow-hidden">
      <div className="flex-1 relative min-h-0">
        <GridLayout
          tracks={gridTracks}
          className="w-full h-full p-4"
        >
          <ParticipantTile />
        </GridLayout>
      </div>

      {/* Premium Minimal Control Bar */}
      <div className="h-20 flex items-center justify-between bg-[#0a0a0a] border-t border-white/5 px-6 relative shrink-0">
        <div className="flex items-center -space-x-2 group">
          {participants.slice(0, 3).map((p, i) => (
            <div
              key={p.identity}
              className="relative flex items-center justify-center h-8 w-8 rounded-full border-2 border-[#0a0a0a] bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] shadow-lg transition-all duration-300 hover:z-10 hover:-translate-y-1 group-hover:first:ml-0"
            >
              <div className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0a0a0a] ${p.isCameraEnabled ? 'bg-emerald-500' : 'bg-gray-500'}`} />
              <span className="text-[10px] font-bold text-gray-300 uppercase">
                {p.identity.startsWith('guest_') ? 'G' : p.identity.charAt(0)}
              </span>
              <div className="absolute bottom-full mb-3 left-0 px-2 py-1 rounded bg-black/80 backdrop-blur-md border border-white/10 text-[10px] text-white opacity-0 group-hover:hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {p.identity.startsWith('guest_') ? 'Guest' : p.identity} {p.isLocal ? '(You)' : ''}
              </div>
            </div>
          ))}
          {participants.length > 3 && (
            <div className="flex items-center justify-center h-8 w-8 rounded-full border-2 border-[#0a0a0a] bg-[#1a1a1a] shadow-lg">
              <span className="text-[10px] font-bold text-[#00b4d8]">+{participants.length - 3}</span>
            </div>
          )}
        </div>

        <div className="absolute left-1/2 -translate-x-1/2">
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

        <div className="w-[120px] hidden md:block" /> {/* Spacer for symmetry */}
      </div>
    </div>
  );
}

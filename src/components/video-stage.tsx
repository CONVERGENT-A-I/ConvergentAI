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
export default function VideoStage({ mode = 'video', keyframeMetadata, hideControls = false }: { mode?: string, keyframeMetadata?: any, hideControls?: boolean }) {
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
    (p) => p.identity !== 'agent' && !p.identity.startsWith('agent-') && !p.identity.startsWith('keyframe-')
  );

  // Video grid tracks — exclude tiles from agent participants
  const gridTracks = tracks.filter(
    (t) => t.participant.identity !== 'agent' && !t.participant.identity.startsWith('agent-') && !t.participant.identity.startsWith('keyframe-')
  );

  const totalTiles = gridTracks.length + 1; // Human tracks + Keyframe Avatar
  const gridClass =
    totalTiles === 1 ? "grid-cols-1 grid-rows-1" :
      totalTiles === 2 ? "grid-cols-1 md:grid-cols-2 grid-rows-2 md:grid-rows-1" :
        totalTiles <= 4 ? "grid-cols-2 grid-rows-2" :
          "grid-cols-2 md:grid-cols-3 grid-rows-3 md:grid-rows-2";

  // ── Unified Layout Logic ──────────────────────────────────────────────
  const isAvatarOnly = mode === 'avatar-chat' || mode === 'intro-avatar';
  const isVoiceOnly = mode === 'voice';

  return (
    <div className="w-full h-full flex flex-col bg-[#050505] relative overflow-hidden">
      {/* Deep Ambient Background (Global) */}
      <div className="absolute inset-0 bg-[#050505] z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1a0f2e_0%,_#050505_100%)] opacity-70 z-0" />
      <div className="absolute top-0 -left-[10%] w-[40%] h-[40%] bg-[#00b4d8]/5 blur-[120px] rounded-full z-0" />
      <div className="absolute bottom-0 -right-[10%] w-[40%] h-[40%] bg-[#560bad]/5 blur-[120px] rounded-full z-0" />

      {/* Main Container */}
      <div className="flex-1 min-h-0 relative z-10 flex flex-col">
        
        {/* Content Area */}
        <div className={`flex-1 min-h-0 relative flex flex-col items-center justify-center ${isAvatarOnly || (mode === 'video' && gridTracks.length === 0) ? 'p-0' : 'p-4 md:p-6'}`}>
          
          {/* Voice Visualizer Overlay */}
          {isVoiceOnly && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#050505]">
              <VoiceVisualizer />
              <div className="mt-20 text-center">
                <div className="flex items-center justify-center gap-2 opacity-40">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#00b4d8] animate-pulse" />
                  <p className="text-[#00b4d8] text-[8px] font-bold tracking-[0.2em] uppercase">AI Active</p>
                </div>
              </div>
            </div>
          )}

          {/* Unified Video Container - ALWAYS rendered to prevent Keyframe WebRTC disconnects */}
          <div className={`w-full h-full ${isVoiceOnly ? 'opacity-0 pointer-events-none absolute' : 'relative'} ${isAvatarOnly || gridTracks.length === 0 ? '' : `max-w-7xl mx-auto grid gap-4 transition-all duration-500 ${gridClass}`}`}>
            
            {/* AI Avatar Participant */}
            <div className={`overflow-hidden transition-all duration-500 ${isAvatarOnly || gridTracks.length === 0 ? 'absolute inset-0' : 'relative w-full h-full'} ${isAvatarOnly ? 'rounded-none border-none shadow-none bg-transparent' : 'rounded-2xl bg-[#050505] border border-white/5 shadow-2xl group hover:border-[#00b4d8]/40'}`}>
              {keyframeMetadata ? (
                <KeyframeAvatar 
                  keyframeMetadata={keyframeMetadata} 
                  className={`w-full h-full ${!isAvatarOnly ? 'rounded-2xl' : ''}`} 
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-gray-500 bg-black/20">
                  <Loader2 className="h-8 w-8 animate-spin text-[#00b4d8]" />
                  <p className="text-xs tracking-widest uppercase">Connecting Ailana...</p>
                </div>
              )}
              
              {!isAvatarOnly && (
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2 z-20">
                  <div className="h-2 w-2 rounded-full bg-[#00b4d8] animate-pulse" />
                  <span className="text-white text-xs font-semibold tracking-wide">Ailana AI</span>
                </div>
              )}
            </div>

            {/* "You" — small PiP overlay (only in video mode, no human tracks) */}
            {!isAvatarOnly && gridTracks.length === 0 && (
              <div className="absolute bottom-4 right-4 w-28 h-20 md:w-36 md:h-24 rounded-xl overflow-hidden bg-[#1a1a1a]/80 border border-white/10 flex flex-col items-center justify-center gap-1 z-20 shadow-lg backdrop-blur-sm">
                <Users className="h-4 w-4 text-white/20" />
                <p className="text-white/30 text-[8px] font-bold uppercase tracking-widest">You</p>
              </div>
            )}

            {/* Human Participants (grid tiles) */}
            {!isAvatarOnly && gridTracks.length > 0 && gridTracks.map(t => (
              <div key={t.participant.identity || t.participant.sid} className="relative w-full h-full rounded-2xl overflow-hidden bg-[#1a1a1a] border border-white/5 shadow-xl transition-all duration-500">
                <ParticipantTile trackRef={t} className="w-full h-full" />
              </div>
            ))}
          </div>

        </div>

        {/* Footer / Input Area */}
        {!hideControls && (
        <div className="shrink-0 z-20">
          {mode === 'avatar-chat' && (
            <div className="px-6 py-4 bg-gradient-to-t from-black via-black/80 to-transparent">
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="group relative w-full max-w-2xl mx-auto">
                <div className="relative flex items-center gap-2 p-1.5 md:p-2 rounded-full bg-black/60 backdrop-blur-3xl border border-white/20 shadow-2xl focus-within:border-[#00b4d8]/50 transition-all">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (inputText.trim()) { send(inputText); setInputText(""); } } }}
                    placeholder="Message Ailana..."
                    rows={1}
                    className="flex-1 bg-transparent border-none text-white placeholder-white/20 text-sm md:text-base px-6 py-3 outline-none resize-none"
                  />
                  <button onClick={() => { if (inputText.trim()) { send(inputText); setInputText(""); } }} disabled={!inputText.trim()} className="h-10 w-10 rounded-full bg-gradient-to-br from-[#00b4d8] to-[#023e8a] text-white flex items-center justify-center disabled:opacity-20 transition-all">
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {(mode === 'video' || mode === 'voice') && (
            <div className="h-20 md:h-24 flex items-center justify-between bg-[#0a0a0a]/80 backdrop-blur-md border-t border-white/5 px-6 relative">
              {/* Participant List (Mini) */}
              <div className="flex items-center -space-x-2">
                {participants.slice(0, 3).map((p) => (
                  <div key={p.identity} className="h-8 w-8 rounded-full border-2 border-[#0a0a0a] bg-[#1a1a1a] flex items-center justify-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">{p.identity.charAt(0)}</span>
                  </div>
                ))}
                {participants.length > 3 && <div className="h-8 w-8 rounded-full border-2 border-[#0a0a0a] bg-[#1a1a1a] flex items-center justify-center"><span className="text-[10px] font-bold text-[#00b4d8]">+{participants.length - 3}</span></div>}
              </div>

              {/* Controls */}
              <div className="absolute left-1/2 -translate-x-1/2">
                <ControlBar variation="minimal" controls={{ microphone: true, camera: mode === 'video', chat: false, screenShare: mode === 'video', leave: true }} />
              </div>
              <div className="w-[100px] hidden md:block" />
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}

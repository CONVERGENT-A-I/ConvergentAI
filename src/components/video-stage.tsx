"use client";

import {
  ControlBar,
  useTracks,
  ParticipantTile,
  useParticipants,
  useChat,
  useRoomContext,
  RoomAudioRenderer,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { Users, Send, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import LemonsliceAvatar from "./lemonslice-avatar";
import { AgentAudioVisualizerAura } from "./agent-audio-visualizer-aura";

/**
 * Voice Visualizer - Uses Aura visualizer for voice mode
 * - Responds to Ailana's voice in real-time
 * - Shows animated shader-based visualization
 */
function VoiceVisualizer({ isSpeaking: externalIsSpeaking }: { isSpeaking: boolean }) {
  const participants = useParticipants();
  const room = useRoomContext();
  
  // Use useTracks to get subscribed microphone tracks (more reliable than manual participant search)
  const micTracks = useTracks([Track.Source.Microphone], { onlySubscribed: true })
    .filter((t) => !t.participant.isLocal);
  
  // Find the correct audio track: prefer avatar worker (lk.publish_on_behalf), fallback to agent
  const agentAudioTrackRef = 
    micTracks.find((t) => t.participant.attributes?.['lk.publish_on_behalf']) ??
    micTracks.find((t) => /avatar|lemonslice|keyframe/i.test(t.participant.identity)) ??
    micTracks[0];
  
  // Use the speaking state from LemonsliceAvatar (which always works)
  const isSpeaking = externalIsSpeaking;

  const agentParticipant = agentAudioTrackRef?.participant;

  // Determine the agent state for the visualizer
  const agentState = !agentParticipant ? 'connecting' : isSpeaking ? 'speaking' : 'listening';

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen">
      {/* Background ambient glow */}
      <div className="absolute inset-[-120px] rounded-full bg-[#00b4d8] blur-[100px] opacity-20 pointer-events-none" />
      
      {/* LiveKit Audio Visualizer - Centered */}
      <div className="relative flex items-center justify-center">
        <AgentAudioVisualizerAura
          state={agentState}
          color="#00b4d8"
          audioTrack={agentAudioTrackRef}
          colorShift={0.1}
          themeMode="dark"
          className="h-[250px] w-[250px]"
        />
      </div>
      
      {/* Status indicator */}
      <div className="mt-20 text-center">
        <div className="flex items-center justify-center gap-2 opacity-60">
          <div className={`h-2 w-2 rounded-full transition-all duration-300 ${isSpeaking ? 'bg-emerald-400 animate-pulse scale-110' : 'bg-[#00b4d8]'}`} />
          <p className={`text-xs font-bold tracking-[0.2em] uppercase transition-colors duration-300 ${isSpeaking ? 'text-emerald-400' : 'text-[#00b4d8]'}`}>
            {isSpeaking ? 'Ailana Speaking' : 'Ailana Listening'}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Custom Stable Video Stage
 * Bypasses the default VideoConference component to avoid internal layout reconciliation errors.
 */
export default function VideoStage({ mode = 'video', hideControls = false }: { mode?: string, hideControls?: boolean }) {
  const [inputText, setInputText] = useState("");
  const { send } = useChat();
  
  // Shared speaking state between LemonsliceAvatar and VoiceVisualizer
  const [agentIsSpeaking, setAgentIsSpeaking] = useState(false);

  // Camera + ScreenShare for the video grid; Microphone not needed here
  const tracks = useTracks(
    [Track.Source.Camera, Track.Source.ScreenShare],
    { onlySubscribed: true },
  );

  // Human participants only — excludes agent, keyframe and lemonslice participants
  const participants = useParticipants().filter(
    (p) => p.identity !== 'agent' &&
      !p.identity.startsWith('agent-') &&
      !p.identity.startsWith('keyframe-') &&
      !p.identity.toLowerCase().startsWith('lemonslice') &&
      !p.identity.toLowerCase().includes('avatar')
  );

  // Video grid tracks — exclude tiles from agent, keyframe and lemonslice participants
  const gridTracks = tracks.filter(
    (t) => t.participant.identity !== 'agent' &&
      !t.participant.identity.startsWith('agent-') &&
      !t.participant.identity.startsWith('keyframe-') &&
      !t.participant.identity.toLowerCase().startsWith('lemonslice') &&
      !t.participant.identity.toLowerCase().includes('avatar')
  );

  const totalTiles = gridTracks.length + 1; // Human tracks + Lemonslice Avatar
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
              <VoiceVisualizer isSpeaking={agentIsSpeaking} />
              <div className="mt-20 text-center">
                <div className="flex items-center justify-center gap-2 opacity-40">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#00b4d8] animate-pulse" />
                  <p className="text-[#00b4d8] text-[8px] font-bold tracking-[0.2em] uppercase">AI Active</p>
                </div>
              </div>
            </div>
          )}

          {/* Unified Video Container - ALWAYS rendered to prevent Keyframe WebRTC disconnects and initialize audio */}
          <div className={`w-full h-full ${isVoiceOnly ? 'invisible pointer-events-none absolute' : 'relative'} ${isAvatarOnly || gridTracks.length === 0 ? '' : `max-w-7xl mx-auto grid gap-4 transition-all duration-500 ${gridClass}`}`}>
            
            {/* AI Avatar Participant */}
            <div className={`overflow-hidden transition-all duration-500 ${isAvatarOnly || gridTracks.length === 0 ? 'absolute inset-0' : 'relative w-full h-full'} ${isAvatarOnly ? 'rounded-none border-none shadow-none bg-transparent' : 'rounded-2xl bg-[#050505] border border-white/5 shadow-2xl group hover:border-[#00b4d8]/40'}`}>
              


              <LemonsliceAvatar 
                className={`w-full h-full ${!isAvatarOnly ? 'rounded-2xl' : ''}`}
                onSpeakingChange={setAgentIsSpeaking}
                mode={isVoiceOnly ? "voice" : "video"}
              />
              
              {!isAvatarOnly && (
                <div className="absolute bottom-24 md:bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2 z-20">
                  <div className="h-2 w-2 rounded-full bg-[#00b4d8] animate-pulse" />
                  <span className="text-white text-xs font-semibold tracking-wide">Ailana AI</span>
                </div>
              )}
            </div>

            {/* "You" — small PiP overlay (only in video mode, no human tracks) */}
            {!isAvatarOnly && gridTracks.length === 0 && (
              <div className="absolute bottom-24 md:bottom-4 right-3 md:right-4 w-28 h-20 md:w-36 md:h-24 rounded-xl overflow-hidden bg-[#1a1a1a]/80 border border-white/10 flex flex-col items-center justify-center gap-1 z-20 shadow-lg backdrop-blur-sm">
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

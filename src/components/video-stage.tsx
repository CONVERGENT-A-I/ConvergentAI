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

/**
 * Custom Stable Video Stage
 * Bypasses the default VideoConference component to avoid internal layout reconciliation errors.
 */
export default function VideoStage({ mode = 'video' }: { mode?: string }) {
  const [inputText, setInputText] = useState("");
  const { send } = useChat();
  const tracks = useTracks(
    [
      Track.Source.Camera,
      Track.Source.ScreenShare,
    ],
    { onlySubscribed: true },
  );

  const participants = useParticipants().filter(p => !p.identity.startsWith('agent-'));

    const agentTrack = tracks.find(t => t.participant.identity === 'lemonslice-avatar-agent');

  if (mode === 'avatar-chat') {
    return (
      <div className="w-full h-full flex flex-col bg-[#050505] relative overflow-hidden">
        {/* Deep Ambient Purplish-Black Voids */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1a0f2e_0%,_#050505_100%)] opacity-90" />
        <div className="absolute top-0 -left-[10%] w-[40%] h-[40%] bg-[#00b4d8]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 -right-[10%] w-[40%] h-[40%] bg-[#560bad]/5 blur-[120px] rounded-full" />

        {/* Full Screen Avatar Stage */}
        <div className="flex-1 relative flex items-center justify-center p-4 z-10">
          <div className="relative w-full h-full max-w-5xl aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8),0_0_20px_rgba(0,180,216,0.1)] bg-[#050505]">
            {agentTrack ? (
              <VideoTrack trackRef={agentTrack} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-gray-500">
                <Loader2 className="h-10 w-10 animate-spin text-[#00b4d8]" />
                <p className="text-sm font-medium tracking-widest uppercase">Initializing Avatar Session...</p>
              </div>
            )}
            
            {/* Subtle Overlay Glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Premium Capsule Input Bar */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center px-6 z-20">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileHover={{ scale: 1.01 }}
            className="group relative w-full max-w-2xl"
          >
            {/* Ambient Background Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#00b4d8]/20 via-[#560bad]/20 to-[#00b4d8]/20 rounded-full blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
            
            <div className="relative flex items-center gap-2 p-1.5 md:p-2 rounded-full bg-black/60 backdrop-blur-3xl border border-white/20 shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-all duration-300 group-focus-within:border-[#00b4d8]/50 group-focus-within:bg-black/80">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (inputText.trim()) {
                      send(inputText);
                      setInputText("");
                    }
                  }
                }}
                placeholder="Message Ailana..."
                rows={1}
                className="flex-1 bg-transparent border-none text-white placeholder-white/20 text-sm md:text-base px-6 py-3 md:py-3.5 outline-none resize-none transition-all duration-300 font-medium tracking-wide"
                style={{ maxHeight: '100px' }}
              />
              
              <motion.button
                onClick={() => {
                  if (inputText.trim()) {
                    send(inputText);
                    setInputText("");
                  }
                }}
                whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(0, 180, 216, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                disabled={!inputText.trim()}
                className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-br from-[#00b4d8] to-[#023e8a] text-white flex items-center justify-center shrink-0 disabled:opacity-20 disabled:grayscale transition-all duration-300 shadow-lg relative overflow-hidden"
              >
                <Send className="h-4 w-4 md:h-5 md:w-5 relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:block" />
              </motion.button>
            </div>
          </motion.div>
        </div>


      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-black overflow-hidden">
      <div className="flex-1 relative min-h-0">
        <GridLayout
          tracks={tracks}
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
                {p.identity === 'lemonslice-avatar-agent' ? 'AI' : (p.identity.startsWith('guest_') ? 'G' : p.identity.charAt(0))}
              </span>
              <div className="absolute bottom-full mb-3 left-0 px-2 py-1 rounded bg-black/80 backdrop-blur-md border border-white/10 text-[10px] text-white opacity-0 group-hover:hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {p.identity === 'lemonslice-avatar-agent' ? 'Ailana (AI)' : (p.identity.startsWith('guest_') ? 'Guest' : p.identity)} {p.isLocal ? '(You)' : ''}
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

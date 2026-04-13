"use client";

import {
  ControlBar,
  useTracks,
  GridLayout,
  ParticipantTile,
  useParticipants,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { Users } from "lucide-react";

/**
 * Custom Stable Video Stage
 * Bypasses the default VideoConference component to avoid internal layout reconciliation errors.
 */
export default function VideoStage() {
  const tracks = useTracks(
    [
      Track.Source.Camera,
      Track.Source.ScreenShare,
    ],
    { onlySubscribed: true },
  );

  const participants = useParticipants().filter(p => !p.identity.startsWith('agent-'));

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

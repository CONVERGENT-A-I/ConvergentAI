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
        {/* Participants Overlay HUD - Moved to top-left below REC badge to avoid overlap */}
        <div className="absolute top-16 left-4 z-20 flex flex-col gap-2 items-start pointer-events-none">
          <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-2xl min-w-[160px] pointer-events-auto">
            <div className="flex items-center gap-2 mb-2 border-b border-white/5 pb-2">
              <Users className="h-3.5 w-3.5 text-[#00b4d8]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/90">Participants ({participants.length})</span>
            </div>
            <div className="space-y-1.5 max-h-[120px] overflow-y-auto custom-scrollbar pr-1">
              {participants.map((p) => (
                <div key={p.identity} className="flex items-center gap-2 group">
                  <div className={`h-1.5 w-1.5 rounded-full ${p.isCameraEnabled ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-500'}`} />
                  <span className="text-[11px] font-medium text-gray-300 truncate max-w-[120px]">
                    {p.identity === 'lemonslice-avatar-agent' ? 'Ailana (AI)' : (p.identity.startsWith('guest_') ? 'Guest' : p.identity)} {p.isLocal ? '(You)' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

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

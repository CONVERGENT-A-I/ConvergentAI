"use client";

import { useParticipants } from "@livekit/components-react";
import { Track } from "livekit-client";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface LemonsliceAvatarProps {
  className?: string;
}

export default function LemonsliceAvatar({ className }: LemonsliceAvatarProps) {
  const participants = useParticipants();
  const [status, setStatus] = useState<"connecting" | "connected" | "error">("connecting");
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Find the LemonSlice avatar participant
  const avatarParticipant = participants.find((p) =>
    p.identity.toLowerCase().startsWith("lemonslice") ||
    p.identity.toLowerCase().includes("avatar")
  );

  const videoPublication = avatarParticipant?.getTrackPublication(Track.Source.Camera);
  const audioPublication = avatarParticipant?.getTrackPublication(Track.Source.Microphone);

  const videoTrack = videoPublication?.track;
  const audioTrack = audioPublication?.track;

  useEffect(() => {
    if (avatarParticipant && videoTrack) {
      setStatus("connected");
    } else {
      setStatus("connecting");
    }
  }, [avatarParticipant, videoTrack]);

  // Attach video track
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || !videoTrack) return;

    videoTrack.attach(videoEl);
    videoEl.play().catch((e) => console.warn("[LemonsliceAvatar] video play failed:", e));

    return () => {
      videoTrack.detach(videoEl);
    };
  }, [videoTrack]);

  // Attach audio track
  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl || !audioTrack) return;

    audioTrack.attach(audioEl);
    audioEl.play().catch((e) => console.warn("[LemonsliceAvatar] audio play failed:", e));

    return () => {
      audioTrack.detach(audioEl);
    };
  }, [audioTrack]);

  return (
    <div className={`relative w-full h-full bg-black overflow-hidden ${className ?? ""}`}>
      {/* HTML Video Element for rendering LemonSlice video stream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="absolute inset-0 w-full h-full object-contain z-10"
      />
      
      {/* HTML Audio Element for playing LemonSlice audio stream */}
      <audio ref={audioRef} autoPlay />

      {/* Connecting overlay */}
      {status === "connecting" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#050505]/90 z-20">
          <Loader2 className="h-10 w-10 animate-spin text-[#00b4d8]" />
          <p className="text-sm font-medium tracking-widest uppercase text-gray-400">
            Initializing Avatar...
          </p>
        </div>
      )}

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none z-[15]" />
    </div>
  );
}

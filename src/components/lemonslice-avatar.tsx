"use client";

import { useParticipants } from "@livekit/components-react";
import { Track } from "livekit-client";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";

interface LemonsliceAvatarProps {
  className?: string;
}

/**
 * Phased connecting overlay — shows initial message for 15s,
 * then a patient message during the backend avatar retry window.
 */
function ConnectingOverlay() {
  const [phase, setPhase] = useState<"init" | "patient">("init");

  useEffect(() => {
    const timer = setTimeout(() => setPhase("patient"), 15000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#050505]/90 z-20">
      <Loader2 className="h-10 w-10 animate-spin text-[#00b4d8]" />
      <p className="text-sm font-medium tracking-widest uppercase text-gray-400 text-center px-4">
        {phase === "init"
          ? "Initializing Avatar..."
          : "Avatar connecting \u2014 this may take a moment..."}
      </p>
    </div>
  );
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

  const videoTrack = videoPublication?.track as any;
  const audioTrack = audioPublication?.track as any;

  // References for tracking speech state
  const isAgentSpeakingRef = useRef<boolean>(false);
  const agentSilenceBlocksRef = useRef<number>(0);
  const turnNumberRef = useRef<number>(0);

  const sendTelemetry = useCallback((event: string, durationMs: number, details?: any) => {
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      (process.env.NODE_ENV === "development"
        ? "http://localhost:3001"
        : "https://dev-be.convergentai.tech");
    fetch(`${backendUrl}/api/log-telemetry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, durationMs, details }),
    }).catch(() => {});
  }, []);

  // Monitor playout volume to measure turn-by-turn speech playout start/end
  useEffect(() => {
    if (!audioTrack || !audioTrack.mediaStreamTrack) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const mediaStreamTrack = audioTrack.mediaStreamTrack;
      const mediaStream = new MediaStream([mediaStreamTrack]);
      const source = audioContext.createMediaStreamSource(mediaStream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let animationId: number;

      const checkVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const isActive = average > 4; // Speech detection threshold

        if (isActive) {
          agentSilenceBlocksRef.current = 0;
          if (!isAgentSpeakingRef.current) {
            isAgentSpeakingRef.current = true;
            turnNumberRef.current += 1;
            const now = performance.now();
            console.log(`[LemonsliceAvatar] [metrics] 🗣️ Avatar playout started for turn ${turnNumberRef.current}`);
            sendTelemetry("client_avatar_playout_started", now, { turn: turnNumberRef.current });
          }
        } else {
          if (isAgentSpeakingRef.current) {
            agentSilenceBlocksRef.current += 1;
            if (agentSilenceBlocksRef.current > 35) { // ~500ms at ~60fps
              isAgentSpeakingRef.current = false;
              const now = performance.now();
              console.log(`[LemonsliceAvatar] [metrics] 🤫 Avatar playout silenced.`);
              sendTelemetry("client_avatar_playout_silenced", now, { turn: turnNumberRef.current });
            }
          }
        }

        animationId = requestAnimationFrame(checkVolume);
      };

      checkVolume();

      return () => {
        cancelAnimationFrame(animationId);
        audioContext.close().catch(() => {});
      };
    } catch (e) {
      console.warn("[LemonsliceAvatar] Failed to start playout volume monitor:", e);
    }
  }, [audioTrack, sendTelemetry]);

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

      {/* Connecting overlay — phased messaging during backend retry window */}
      {status === "connecting" && (
        <ConnectingOverlay />
      )}

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none z-[15]" />
    </div>
  );
}

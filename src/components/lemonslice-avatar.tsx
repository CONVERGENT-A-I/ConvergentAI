"use client";

import { useParticipants, useRoomContext } from "@livekit/components-react";
import { Track, RoomEvent } from "livekit-client";
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
      {/* Text commented out to prevent brief flashing text before connection resolves */}
      {/* <p className="text-sm font-medium tracking-widest uppercase text-gray-400 text-center px-4">
        {phase === "init"
          ? "Initializing Avatar..."
          : "Avatar connecting \u2014 this may take a moment..."}
      </p> */}
    </div>
  );
}

export default function LemonsliceAvatar({ className }: LemonsliceAvatarProps) {
  const participants = useParticipants();
  const room = useRoomContext();
  const [status, setStatus] = useState<"connecting" | "connected" | "error" | "voice_only">("connecting");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Listen for platform error signals from backend
  useEffect(() => {
    const handleData = (payload: Uint8Array) => {
      try {
        const text = new TextDecoder().decode(payload);
        const parsed = JSON.parse(text);
        const msg = parsed.message ?? text;
        if (msg === "SYSTEM_AVATAR_CONN_FAILED" || msg === "SYSTEM_AVATAR_CAPACITY_LIMITED") {
          console.warn("[LemonsliceAvatar] Received platform error:", msg);
          setStatus("error");
        }
      } catch {
        // ignore
      }
    };

    room.on(RoomEvent.DataReceived, handleData);
    return () => {
      room.off(RoomEvent.DataReceived, handleData);
    };
  }, [room]);

  // Find the remote agent or avatar participant
  const agentParticipant = participants.find((p) => !p.isLocal);

  const videoPublication = agentParticipant?.getTrackPublication(Track.Source.Camera);
  const audioPublication = agentParticipant?.getTrackPublication(Track.Source.Microphone);

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
            setIsSpeaking(true);
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
              setIsSpeaking(false);
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
    if (agentParticipant && videoTrack) {
      setStatus("connected");
    } else if (agentParticipant && audioTrack && !videoTrack) {
      setStatus("voice_only");
    } else if (!agentParticipant && status !== "error" && status !== "voice_only") {
      setStatus("connecting");
    }
  }, [agentParticipant, videoTrack, audioTrack, status]);

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

      {/* Audio-only premium visualizer fallback UI */}
      {status === "voice_only" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#070c10] z-20 overflow-hidden">
          {/* Decorative ambient glowing orbs */}
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#00b4d8]/10 blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

          {/* Central Pulsing Avatar Ring */}
          <div className="relative flex items-center justify-center">
            {/* Outer animated rings */}
            <div className={`absolute h-40 w-40 rounded-full border border-[#00b4d8]/20 transition-all duration-700 ease-out ${isSpeaking ? 'animate-[ping_2.5s_infinite] scale-125 opacity-100' : 'scale-100 opacity-0'}`} />
            <div className={`absolute h-32 w-32 rounded-full border border-emerald-500/20 transition-all duration-700 ease-out ${isSpeaking ? 'animate-[ping_3.5s_infinite_1.2s] scale-110 opacity-100' : 'scale-100 opacity-0'}`} />

            {/* Inner premium avatar base */}
            <div className={`h-24 w-24 rounded-full bg-gradient-to-tr from-[#0b1d33] to-[#070c10] border-2 transition-all duration-300 flex items-center justify-center shadow-[0_0_50px_rgba(0,180,216,0.15)] ${isSpeaking ? 'border-[#00b4d8] shadow-[0_0_60px_rgba(0,180,216,0.35)] scale-105' : 'border-white/10'}`}>
              <div className="relative h-12 w-12 flex flex-col items-center justify-center">
                {/* Audio visual waves when speaking */}
                {isSpeaking ? (
                  <div className="flex items-end gap-1 h-6">
                    <span className="w-1 bg-[#00b4d8] rounded-full animate-[bounce_0.8s_infinite]" style={{ animationDelay: '0.1s', height: '0.75rem' }} />
                    <span className="w-1 bg-[#00b4d8] rounded-full animate-[bounce_0.8s_infinite]" style={{ animationDelay: '0.3s', height: '1.25rem' }} />
                    <span className="w-1 bg-[#00b4d8] rounded-full animate-[bounce_0.8s_infinite]" style={{ animationDelay: '0.2s', height: '1.5rem' }} />
                    <span className="w-1 bg-[#00b4d8] rounded-full animate-[bounce_0.8s_infinite]" style={{ animationDelay: '0.4s', height: '1rem' }} />
                    <span className="w-1 bg-[#00b4d8] rounded-full animate-[bounce_0.8s_infinite]" style={{ animationDelay: '0.5s', height: '0.75rem' }} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-gray-500 animate-pulse" />
                    <div className="h-1.5 w-1.5 rounded-full bg-gray-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <div className="h-1.5 w-1.5 rounded-full bg-gray-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 text-center px-6 z-10">
            <h3 className="text-white text-base font-medium tracking-wider">Ailana • AI Mortgage Advisor</h3>
            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00b4d8] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00b4d8]"></span>
              </span>
              <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">
                {isSpeaking ? "Speaking..." : "Listening..."}
              </p>
            </div>
            <p className="mt-1 text-[11px] text-gray-500 font-medium tracking-wide">
              Audio-only channel active (avatar offline)
            </p>
          </div>
        </div>
      )}

      {/* Voice-only platform fallback UI */}
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#050505]/95 z-20">
          <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center animate-pulse">
            <div className="h-8 w-8 rounded-full bg-emerald-500/30 flex items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-emerald-400" />
            </div>
          </div>
          <p className="text-sm font-semibold tracking-wide text-emerald-400">
            Ailana is Online (Voice Only)
          </p>
          <p className="text-[10px] text-gray-500 text-center px-6">
            The avatar platform is currently offline. Speak normally.
          </p>
        </div>
      )}

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none z-[15]" />
    </div>
  );
}

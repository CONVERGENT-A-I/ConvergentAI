"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient, type PersonaSession, SAMPLE_RATE } from "@keyframelabs/sdk";
import { Loader2 } from "lucide-react";
import { useParticipants } from "@livekit/components-react";
import { Track } from "livekit-client";

interface KeyframeMetadata {
  server_url:        string;
  participant_token: string;
  agent_identity:    string;
}

interface KeyframeAvatarProps {
  keyframeMetadata: KeyframeMetadata;
  className?: string;
}

/**
 * KeyframeAvatar
 *
 * BYOB ("Bring Your Own Brain") avatar:
 * - Connects to Keyframe's WebRTC room via PersonaSession.
 * - Renders the avatar video from Keyframe's GPU node.
 * - Captures the LiveKit agent's audio and pipes it as 24kHz PCM to
 *   session.sendAudio() so the avatar's mouth syncs with the AI's speech.
 * - Keyframe re-renders the audio alongside the video and sends it back as
 *   an audio track, which this component plays via <audio>.
 *   RoomAudioRenderer is suppressed in avatar-chat mode so Keyframe is the
 *   ONLY audio source — the voice and lip movements are always in perfect sync.
 *
 * React StrictMode safety:
 * - The connection is deferred by 150ms. StrictMode's mount→cleanup→remount
 *   cycle completes in < 1ms, so the timeout is cancelled before it fires.
 *   Only the final "real" mount times out and connects, ensuring exactly one
 *   connection to the Keyframe room — no duplicate-identity conflicts.
 */
export default function KeyframeAvatar({ keyframeMetadata, className }: KeyframeAvatarProps) {
  const videoRef       = useRef<HTMLVideoElement>(null);
  const audioRef       = useRef<HTMLAudioElement>(null);
  const sessionRef     = useRef<PersonaSession | null>(null);
  const isConnectedRef = useRef(false);   // true only after onStateChange("connected")
  const audioCtxRef    = useRef<AudioContext | null>(null);
  const processorRef   = useRef<AudioWorkletNode | null>(null);
  const sourceRef      = useRef<MediaStreamAudioSourceNode | null>(null);

  const [status, setStatus] = useState<"connecting" | "connected" | "error">("connecting");

  // ── Detect agent's audio MediaStream (for lip-sync) ─────────────────────
  const participants = useParticipants();
  const agentMediaStream: MediaStream | undefined = (() => {
    const agent = participants.find((p) => p.identity.startsWith("agent-"));
    if (!agent) return undefined;
    const pub = agent
      .getTrackPublications()
      .find((p) => p.source === Track.Source.Microphone && p.isSubscribed);
    return (pub?.track as any)?.mediaStream as MediaStream | undefined;
  })();

  // ── Step 1: Connect PersonaSession ──────────────────────────────────────
  useEffect(() => {
    if (!keyframeMetadata?.server_url || !keyframeMetadata?.participant_token) {
      console.error("[KeyframeAvatar] ❌ Missing credentials:", keyframeMetadata);
      setStatus("error");
      return;
    }

    let cancelled = false;

    // 150ms delay — StrictMode's mount→cleanup→remount fires in < 5ms,
    // so the cleanup's clearTimeout() cancels this before it runs.
    // Only the real final mount survives to actually connect.
    const connectionTimer = setTimeout(async () => {
      if (cancelled) return;

      console.log("[KeyframeAvatar] Connecting →", {
        serverUrl:     keyframeMetadata.server_url,
        agentIdentity: keyframeMetadata.agent_identity,
      });

      const session = createClient({
        serverUrl:        keyframeMetadata.server_url,
        participantToken: keyframeMetadata.participant_token,
        agentIdentity:    keyframeMetadata.agent_identity,

        onVideoTrack: (track) => {
          if (cancelled || !videoRef.current) return;
          console.log("[KeyframeAvatar] ✅ Video track received");
          videoRef.current.srcObject = new MediaStream([track]);
          videoRef.current
            .play()
            .catch((e) => console.warn("[KeyframeAvatar] Video autoplay:", e));
        },

        onAudioTrack: (track) => {
          // Keyframe re-renders the piped audio alongside the avatar video.
          // RoomAudioRenderer is suppressed for avatar-chat, so this is the
          // ONLY audio output — perfectly lip-synced with the avatar's mouth.
          if (cancelled || !audioRef.current) return;
          audioRef.current.srcObject = new MediaStream([track]);
          audioRef.current.play().catch(() => {});
        },

        onStateChange: (state) => {
          if (cancelled) return;
          console.log("[KeyframeAvatar] State →", state);
          if (state === "connected") {
            isConnectedRef.current = true;
            setStatus("connected");
          } else {
            isConnectedRef.current = false;
            if (state === "error" || state === "disconnected") {
              setStatus("error");
            }
          }
        },

        onError: (err) => {
          if (cancelled) return;
          console.error("[KeyframeAvatar] ❌ Error:", err);
          isConnectedRef.current = false;
          setStatus("error");
        },

        onClose: (reason) => {
          if (cancelled) return;
          console.log("[KeyframeAvatar] Closed:", reason);
          isConnectedRef.current = false;
        },
      });

      sessionRef.current = session;

      try {
        await session.connect();
        if (!cancelled) console.log("[KeyframeAvatar] ✅ connect() resolved");
      } catch (err) {
        if (!cancelled) {
          console.error("[KeyframeAvatar] ❌ connect() failed:", err);
          setStatus("error");
        }
      }
    }, 150);

    return () => {
      cancelled = true;
      clearTimeout(connectionTimer);      // prevents StrictMode double-connect
      isConnectedRef.current = false;
      const session = sessionRef.current;
      if (session) {
        session.close().catch(() => {});
        sessionRef.current = null;
      }
      // Tear down audio pipe too
      tearDownAudioPipe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyframeMetadata]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  function tearDownAudioPipe() {
    try { sourceRef.current?.disconnect(); } catch (_) {}
    try { processorRef.current?.disconnect(); } catch (_) {}
    try { audioCtxRef.current?.close(); } catch (_) {}
    sourceRef.current    = null;
    processorRef.current = null;
    audioCtxRef.current  = null;
  }

  // ── Step 2: Pipe agent audio → Keyframe for lip-sync ────────────────────
  const startAudioPipe = useCallback(async (stream: MediaStream) => {
    tearDownAudioPipe(); // reset any previous pipe

    try {
      const ctx = new AudioContext({ sampleRate: SAMPLE_RATE }); // 24 kHz
      audioCtxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      sourceRef.current = source;

      // Inline AudioWorklet — chunks Float32 frames into 1024-sample batches
      const workletSrc = `
        class KfPcmCapture extends AudioWorkletProcessor {
          constructor() {
            super();
            this._buf = new Float32Array(1024);
            this._pos = 0;
          }
          process(inputs) {
            const ch = inputs[0]?.[0];
            if (!ch) return true;
            let i = 0;
            while (i < ch.length) {
              const n = Math.min(this._buf.length - this._pos, ch.length - i);
              this._buf.set(ch.subarray(i, i + n), this._pos);
              this._pos += n;
              i += n;
              if (this._pos >= this._buf.length) {
                this.port.postMessage(this._buf.slice());
                this._buf = new Float32Array(1024);
                this._pos = 0;
              }
            }
            return true;
          }
        }
        registerProcessor('kf-pcm-capture', KfPcmCapture);
      `;
      const blob = new Blob([workletSrc], { type: "application/javascript" });
      const url  = URL.createObjectURL(blob);
      await ctx.audioWorklet.addModule(url);
      URL.revokeObjectURL(url);

      const processor = new AudioWorkletNode(ctx, "kf-pcm-capture", {
        numberOfInputs: 1,
        numberOfOutputs: 0,
        channelCount: 1,
      });
      processorRef.current = processor;

      // Float32 → Int16 → sendAudio  (only fires when session is confirmed connected)
      processor.port.onmessage = (e: MessageEvent<Float32Array>) => {
        if (!isConnectedRef.current || !sessionRef.current) return;
        const f32 = e.data;
        const i16 = new Int16Array(f32.length);
        for (let i = 0; i < f32.length; i++) {
          const c = Math.max(-1, Math.min(1, f32[i]));
          i16[i] = c < 0 ? c * 32768 : c * 32767;
        }
        sessionRef.current.sendAudio(new Uint8Array(i16.buffer));
      };

      source.connect(processor);
      console.log("[KeyframeAvatar] ✅ Lip-sync audio pipe live (agent → Keyframe @ 24kHz PCM)");
    } catch (err) {
      console.error("[KeyframeAvatar] ❌ Audio pipe setup failed:", err);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!agentMediaStream) return;
    startAudioPipe(agentMediaStream);
    return () => tearDownAudioPipe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentMediaStream, startAudioPipe]);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className={`relative w-full h-full bg-black overflow-hidden ${className ?? ""}`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-contain"
      />
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} autoPlay />

      {/* Connecting overlay */}
      {status === "connecting" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#050505]/90 z-10">
          <Loader2 className="h-10 w-10 animate-spin text-[#00b4d8]" />
          <p className="text-sm font-medium tracking-widest uppercase text-gray-400">
            Connecting to Avatar...
          </p>
        </div>
      )}

      {/* Error overlay */}
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#050505]/90 z-10">
          <p className="text-sm font-medium tracking-widest uppercase text-red-400">
            Avatar connection failed
          </p>
          <p className="text-xs text-gray-500">Check browser console for details</p>
        </div>
      )}

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none z-[5]" />
    </div>
  );
}

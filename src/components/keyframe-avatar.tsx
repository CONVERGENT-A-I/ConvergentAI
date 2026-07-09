"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient, type PersonaSession, SAMPLE_RATE } from "@keyframelabs/sdk";
import { Loader2 } from "lucide-react";
import { useParticipants, useRoomContext } from "@livekit/components-react";
import { Track, RoomEvent } from "livekit-client";

interface KeyframeMetadata {
  server_url: string;
  participant_token: string;
  agent_identity: string;
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const sessionRef = useRef<PersonaSession | null>(null);
  const isRetrying = useRef(false);
  const isConnectedRef = useRef(false);   // true only after onStateChange("connected")
  const audioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<AudioWorkletNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // References to track unified media streams for mobile speakerphone routing
  const videoTrackRef = useRef<MediaStreamTrack | null>(null);
  const audioTrackRef = useRef<MediaStreamTrack | null>(null);

  // References to track voice loopback latency (TTS to Avatar speaking distance)
  const firstInputAudioTimeRef = useRef<number>(0);
  const firstOutputAudioTimeRef = useRef<number>(0);

  // References for continuous multi-turn speech detection and latency tracking
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

  const startPlayoutVolumeMonitor = useCallback((track: MediaStreamTrack) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = ctx.createMediaStreamSource(new MediaStream([track]));
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      let isVolumeActive = false;
      let silenceCount = 0;
      
      const checkVolume = () => {
        if (!isConnectedRef.current) {
          ctx.close().catch(() => {});
          return;
        }
        analyser.getByteTimeDomainData(dataArray);
        let maxVal = 0;
        for (let i = 0; i < bufferLength; i++) {
          const val = Math.abs(dataArray[i] - 128);
          if (val > maxVal) maxVal = val;
        }
        
        if (maxVal > 5) {
          if (!isVolumeActive) {
            isVolumeActive = true;
            const now = performance.now();
            console.log(`[KeyframeAvatar] [metrics] 🔊 Avatar active playout started.`);
            sendTelemetry("client_avatar_playout_started", now);
          }
          silenceCount = 0;
        } else {
          if (isVolumeActive) {
            silenceCount++;
            if (silenceCount > 40) { // ~600ms of silence at ~60fps requestAnimationFrame
              isVolumeActive = false;
              const now = performance.now();
              console.log(`[KeyframeAvatar] [metrics] 🤫 Avatar playout silenced.`);
              sendTelemetry("client_avatar_playout_silenced", now);
            }
          }
        }
        requestAnimationFrame(checkVolume);
      };
      
      checkVolume();
    } catch (e) {
      console.warn("[KeyframeAvatar] Failed to start playout volume monitor:", e);
    }
  }, [sendTelemetry]);

  const updateSrcObject = useCallback(() => {
    if (!videoRef.current) return;
    const tracks: MediaStreamTrack[] = [];
    if (videoTrackRef.current) tracks.push(videoTrackRef.current);
    if (audioTrackRef.current) tracks.push(audioTrackRef.current);

    if (tracks.length > 0) {
      videoRef.current.srcObject = new MediaStream(tracks);
      videoRef.current
        .play()
        .catch((e) => console.warn("[KeyframeAvatar] Unified play failed:", e));
    }
  }, []);

  const [status, setStatus] = useState<"connecting" | "connected" | "error">("connecting");

  // ── Detect agent's audio MediaStream (for lip-sync) ─────────────────────
  const participants = useParticipants();
  const agentMediaStream: MediaStream | undefined = (() => {
    // 1. Try to find participant starting with 'agent-' or exactly 'agent'
    let agent = participants.find((p) => p.identity === "agent" || p.identity.startsWith("agent-"));

    // 2. Fallback: Take the first remote participant that isn't us (guest)
    if (!agent) {
      agent = participants.find((p) => !p.identity.startsWith("guest_"));
    }

    if (!agent) return undefined;

    const pub = agent
      .getTrackPublications()
      .find((p) => p.source === Track.Source.Microphone && p.isSubscribed);

    const stream = (pub?.track as any)?.mediaStream as MediaStream | undefined;
    return stream;
  })();

  // ── Step 0: Agent detection for audio pipe is handled by agentMediaStream ──

  // ── Step 1: Connect PersonaSession ──────────────────────────────────────
  useEffect(() => {
    // CRITICAL: If we are already connected, stay connected. 
    // This prevents the "appeared and then disappeared" issue caused by 
    // the agent joining and triggering a re-render.
    if (isConnectedRef.current || status === "connected") {
      return;
    }

    const targetIdentity = keyframeMetadata?.agent_identity;

    if (!keyframeMetadata?.server_url || !keyframeMetadata?.participant_token || !targetIdentity) {
      return;
    }

    let cancelled = false;

    let connectStartTime = 0;

    // 200ms delay — let room stabilize
    const connectionTimer = setTimeout(async () => {
      if (cancelled || isConnectedRef.current) return;

      console.log("[KeyframeAvatar] Attempting connection →", {
        serverUrl: keyframeMetadata.server_url,
        agentIdentity: targetIdentity,
      });

      connectStartTime = performance.now();

      // Debug: Log all participants
      console.log("[KeyframeAvatar] Current participants in room:",
        participants.map(p => `${p.identity} (${p.sid})`).join(", ")
      );

      const session = createClient({
        serverUrl: keyframeMetadata.server_url,
        participantToken: keyframeMetadata.participant_token,
        agentIdentity: targetIdentity,

        onVideoTrack: (track) => {
          if (cancelled || !videoRef.current) return;
          const dur = (performance.now() - connectStartTime).toFixed(0);
          console.log(`[KeyframeAvatar] [metrics] ✅ Video track received in ${dur}ms`);
          sendTelemetry("webrtc_video_track_received", parseFloat(dur));
          videoTrackRef.current = track;
          updateSrcObject();
        },

        onAudioTrack: (track) => {
          const dur = (performance.now() - connectStartTime).toFixed(0);
          console.log(`[KeyframeAvatar] [metrics] ✅ Audio track received from Keyframe in ${dur}ms`);
          sendTelemetry("webrtc_audio_track_received", parseFloat(dur));

          if (firstOutputAudioTimeRef.current === 0 && firstInputAudioTimeRef.current !== 0) {
            firstOutputAudioTimeRef.current = performance.now();
            const playoutDelay = (firstOutputAudioTimeRef.current - firstInputAudioTimeRef.current).toFixed(0);
            console.log(`[KeyframeAvatar] [metrics] 🔊 TTS-to-Avatar speaking playout delay (loopback): ${playoutDelay}ms`);
            sendTelemetry("tts_to_avatar_loopback_delay", parseFloat(playoutDelay));
          }

          audioTrackRef.current = track;
          updateSrcObject();
          startPlayoutVolumeMonitor(track);
        },

        onStateChange: (state) => {
          if (cancelled) return;
          console.log("[KeyframeAvatar] State →", state);
          if (state === "connected") {
            const dur = (performance.now() - connectStartTime).toFixed(0);
            console.log(`[KeyframeAvatar] [metrics] ✅ Handshake completed. WebRTC connected in ${dur}ms`);
            sendTelemetry("webrtc_handshake_connected", parseFloat(dur));
            isConnectedRef.current = true;
            setStatus("connected");

            // Set base emotion to happy (natural resting face for Ailana)
            if (sessionRef.current) {
              console.log("[KeyframeAvatar] 😊 Setting initial emotion to happy");
              try {
                sessionRef.current.setEmotion("happy");
              } catch (e) {
                console.warn("[KeyframeAvatar] Failed to set initial emotion:", e);
              }
            }
          } else if (state === "error" || state === "disconnected") {
            if (!isRetrying.current) {
              isConnectedRef.current = false;
              setStatus("error");
            }
          }
        },

        onError: (err) => {
          if (cancelled) return;
          console.error("[KeyframeAvatar] ❌ Error callback:", err);
        },

        onClose: (reason) => {
          if (cancelled) return;
          console.log("[KeyframeAvatar] Closed:", reason);
          isConnectedRef.current = false;
        },
      });

      sessionRef.current = session;

      const maxRetries = 3;
      let attempt = 0;
      let isConnecting = false;

      const connectWithRetry = async () => {
        if (cancelled || isConnectedRef.current || isConnecting) return;

        try {
          isConnecting = true;
          attempt++;
          console.log(`[KeyframeAvatar] session.connect() attempt ${attempt}/${maxRetries}...`);

          await session.connect();

          if (!cancelled) {
            const dur = (performance.now() - connectStartTime).toFixed(0);
            console.log(`[KeyframeAvatar] [metrics] ✅ connect() resolved in ${dur}ms`);
            sendTelemetry("webrtc_connect_resolved", parseFloat(dur));
            isRetrying.current = false;
            isConnectedRef.current = true;
            setStatus("connected");
          }
        } catch (err: any) {
          if (!cancelled && err?.message !== "Client initiated disconnect") {
            console.error(`[KeyframeAvatar] ❌ connect() attempt ${attempt} failed:`, err);
          }

          if (attempt < maxRetries && !cancelled) {
            console.log("[KeyframeAvatar] ⏳ Retrying in 1.5s...");
            isRetrying.current = true;
            setTimeout(() => {
              isConnecting = false;
              connectWithRetry();
            }, 1500);
          } else if (!cancelled) {
            isRetrying.current = false;
            setStatus("error");
          }
        } finally {
          if (!isRetrying.current) {
            isConnecting = false;
          }
        }
      };

      connectWithRetry();
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(connectionTimer);
      const session = sessionRef.current;
      if (session) {
        session.close().catch(() => { });
        sessionRef.current = null;
      }
      isConnectedRef.current = false;
      tearDownAudioPipe();
    };
  }, [keyframeMetadata]);

  // ── Dynamic emotion receiver: listen for AVATAR_EMOTION from backend ──
  const room = useRoomContext();
  const lastEmotionRef = useRef<string>("happy");

  useEffect(() => {
    if (status !== "connected" || !sessionRef.current || !room) return;

    const applyEmotion = (emotion: string) => {
      // Only call setEmotion if it actually changed (avoid redundant API calls)
      if (emotion === lastEmotionRef.current) return;
      if (!sessionRef.current || !isConnectedRef.current) return;

      const validEmotions = ["neutral", "happy"] as const;
      if (!validEmotions.includes(emotion as any)) return;

      try {
        sessionRef.current.setEmotion(emotion as typeof validEmotions[number]);
        lastEmotionRef.current = emotion;
        console.log(`[KeyframeAvatar] 🎭 Emotion → ${emotion}`);
      } catch (e) {
        console.warn("[KeyframeAvatar] Failed to set emotion:", e);
      }
    };

    // Handler for binary data channel messages from the backend agent
    // The backend uses publishData() which fires RoomEvent.DataReceived
    const handleData = (payload: Uint8Array, participant: any, _kind: any, topic?: string) => {
      if (topic !== "avatar_emotion") return;
      try {
        const msg = JSON.parse(new TextDecoder().decode(payload));
        if (msg.type === "AVATAR_EMOTION" && msg.emotion) {
          applyEmotion(msg.emotion);
        }
      } catch {
        // Ignore malformed payloads
      }
    };

    room.on(RoomEvent.DataReceived, handleData);

    return () => {
      room.off(RoomEvent.DataReceived, handleData);
    };
  }, [status, room]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  function tearDownAudioPipe() {
    try { sourceRef.current?.disconnect(); } catch (_) { }
    try { processorRef.current?.disconnect(); } catch (_) { }
    try { audioCtxRef.current?.close(); } catch (_) { }
    sourceRef.current = null;
    processorRef.current = null;
    audioCtxRef.current = null;
  }

  // ── Step 2: Pipe agent audio → Keyframe for lip-sync ────────────────────
  const startAudioPipe = useCallback(async (stream: MediaStream) => {
    tearDownAudioPipe(); // reset any previous pipe

    try {
      const ctx = new AudioContext({ sampleRate: SAMPLE_RATE }); // 24 kHz
      audioCtxRef.current = ctx;

      // Resume if browser auto-suspends (common before user gesture)
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

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
      const url = URL.createObjectURL(blob);
      await ctx.audioWorklet.addModule(url);
      URL.revokeObjectURL(url);

      // Guard: After the async addModule(), the context may have been closed
      // by a concurrent tearDownAudioPipe() (e.g. effect cleanup / remount).
      // Creating an AudioWorkletNode on a closed context throws InvalidStateError.
      if (ctx.state === "closed" || audioCtxRef.current !== ctx) {
        console.warn("[KeyframeAvatar] ⚠️ AudioContext closed during setup — aborting pipe");
        return;
      }

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

        // Establish the first audio packet timestamp if not set
        if (firstInputAudioTimeRef.current === 0) {
          firstInputAudioTimeRef.current = performance.now();
          console.log("[KeyframeAvatar] [metrics] 🎙️ First audio chunk sent to Keyframe for lip-sync");
        }

        // Calculate RMS volume of the 1024-sample block
        let sum = 0;
        for (let i = 0; i < f32.length; i++) {
          sum += f32[i] * f32[i];
        }
        const rms = Math.sqrt(sum / f32.length);

        // Amplitude-based voice activity detection
        if (rms > 0.005) {
          if (!isAgentSpeakingRef.current) {
            isAgentSpeakingRef.current = true;
            turnNumberRef.current += 1;
            const now = performance.now();
            console.log(`[KeyframeAvatar] [metrics] 🎙️ Turn ${turnNumberRef.current} speech detected in incoming agent track (rms=${rms.toFixed(4)})`);
            sendTelemetry("client_agent_speech_started", now, { turn: turnNumberRef.current });
          }
          agentSilenceBlocksRef.current = 0;
        } else {
          if (isAgentSpeakingRef.current) {
            agentSilenceBlocksRef.current += 1;
            if (agentSilenceBlocksRef.current > 40) { // ~1.7 seconds of silence (40 chunks * 42.6ms)
              isAgentSpeakingRef.current = false;
              const now = performance.now();
              console.log(`[KeyframeAvatar] [metrics] 🤫 Agent incoming track silenced`);
              sendTelemetry("client_agent_speech_silenced", now, { turn: turnNumberRef.current });
            }
          }
        }

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
        className="absolute inset-0 w-full h-full object-contain"
      />
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      {/* <audio ref={audioRef} autoPlay /> */}

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

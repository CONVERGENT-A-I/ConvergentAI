import { useEffect } from "react";
import { useRoomContext } from "@livekit/components-react";

interface MediaGuardProps {
  mode: string;
}

export function MediaGuard({ mode }: MediaGuardProps) {
  const room = useRoomContext();

  useEffect(() => {
    // Only run once the room is actually connected to prevent pre-connection state errors
    if (room.state !== "connected") return;

    const lp = room.localParticipant;
    if (!lp) return;

    console.log(`[MediaGuard] 🔄 Syncing media state for mode: ${mode}`);

    // Explicitly handle all modes as the single source of truth
    const syncMedia = async () => {
      if (mode === "avatar-chat" || mode === "intro-avatar" || mode === "tts-avatar") {
        try {
          await lp.setMicrophoneEnabled(false);
        } catch (e) {
          console.warn("[MediaGuard] Failed to disable microphone in avatar mode:", e);
        }
        try {
          await lp.setCameraEnabled(false);
        } catch (e) {
          console.warn("[MediaGuard] Failed to disable camera in avatar mode:", e);
        }
        console.log("[MediaGuard] 🔇 Mic & camera OFF");
      } else if (mode === "voice") {
        try {
          await lp.setMicrophoneEnabled(false);
        } catch (e) {
          console.warn("[MediaGuard] Failed to disable microphone in voice mode:", e);
        }
        try {
          await lp.setCameraEnabled(false);
        } catch (e) {
          console.warn("[MediaGuard] Failed to disable camera in voice mode:", e);
        }
        console.log("[MediaGuard] 🔇 Mic & camera OFF (voice mode)");
      } else if (mode === "video") {
        try {
          await lp.setMicrophoneEnabled(false);
        } catch (e) {
          console.warn("[MediaGuard] Failed to disable microphone in video mode:", e);
        }
        try {
          await lp.setCameraEnabled(false);
        } catch (e) {
          console.warn("[MediaGuard] Failed to disable camera in video mode:", e);
        }
        console.log(
          "[MediaGuard] 🔇 Mic & camera OFF by default (waiting for user to enable)"
        );
      } else if (mode === "loan-officer") {
        // Loan officer mode: enable mic so user can talk to the SIP participant, disable camera
        try {
          await lp.setMicrophoneEnabled(true);
        } catch (e) {
          console.warn("[MediaGuard] Failed to enable microphone in loan-officer mode:", e);
        }
        try {
          await lp.setCameraEnabled(false);
        } catch (e) {
          console.warn("[MediaGuard] Failed to disable camera in loan-officer mode:", e);
        }
        console.log("[MediaGuard] 🎤 Mic ON, camera OFF (loan-officer SIP mode)");
      }
    };

    syncMedia();
  }, [mode, room, room.state]);

  return null;
}

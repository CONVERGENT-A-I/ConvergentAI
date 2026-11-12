import { useEffect } from "react";
import { useRoomContext } from "@livekit/components-react";

interface MediaGuardProps {
  mode: string;
  loanOfficerConnected?: boolean;
  conversationalScheduling?: boolean;
  /**
   * Section 0 (S0-25): the borrower just tapped the Voice or Video card, so the mic turns on with the tap.
   * Unset (flag off) → the mic stays off until the mic button, exactly as before.
   */
  micOnAfterCard?: boolean;
}

export function MediaGuard({ mode, loanOfficerConnected = false, conversationalScheduling = false, micOnAfterCard = false }: MediaGuardProps) {
  const room = useRoomContext();

  useEffect(() => {
    // Only run once the room is actually connected to prevent pre-connection state errors
    if (room.state !== "connected") return;

    const lp = room.localParticipant;
    if (!lp) return;

    console.log(`[MediaGuard] 🔄 Syncing media state for mode: ${mode}`);

    // Explicitly handle all modes as the single source of truth
    const syncMedia = async () => {
      // Scheduling recovery has priority over the visual mode. React may still
      // expose the previous loan-officer/chat mode for one render after the
      // failure event; waiting for the mode switch left the caller muted and
      // their consent was delivered only when the room disconnected.
      if (conversationalScheduling) {
        try {
          await lp.setMicrophoneEnabled(true);
        } catch (e) {
          console.warn("[MediaGuard] Failed to enable microphone for conversational scheduling:", e);
        }
        try {
          await lp.setCameraEnabled(false);
        } catch (e) {
          console.warn("[MediaGuard] Failed to disable camera for conversational scheduling:", e);
        }
        console.log("[MediaGuard] 🎤 Mic ON (conversational scheduling override)");
      } else if (mode === "avatar-chat" || mode === "intro-avatar" || mode === "tts-avatar") {
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
          await lp.setMicrophoneEnabled(micOnAfterCard);
        } catch (e) {
          console.warn("[MediaGuard] Failed to set microphone in voice mode:", e);
        }
        try {
          await lp.setCameraEnabled(false);
        } catch (e) {
          console.warn("[MediaGuard] Failed to disable camera in voice mode:", e);
        }
        console.log(micOnAfterCard ? "[MediaGuard] 🎤 Mic ON (Voice card tapped)" : "[MediaGuard] 🔇 Mic & camera OFF (voice mode)");
      } else if (mode === "video") {
        try {
          await lp.setMicrophoneEnabled(conversationalScheduling || micOnAfterCard);
        } catch (e) {
          console.warn("[MediaGuard] Failed to set microphone in video mode:", e);
        }
        try {
          await lp.setCameraEnabled(false);
        } catch (e) {
          console.warn("[MediaGuard] Failed to disable camera in video mode:", e);
        }
        console.log(conversationalScheduling
          ? "[MediaGuard] 🎤 Mic ON for conversational scheduling"
          : micOnAfterCard
            ? "[MediaGuard] 🎤 Mic ON (Video card tapped)"
            : "[MediaGuard] 🔇 Mic & camera OFF by default (waiting for user to enable)");
      } else if (mode === "loan-officer") {
        // Keep the browser mic muted while the SIP leg is dialing. Enabling it
        // earlier lets ringing/noise reach the still-closing AI speech pipeline.
        try {
          await lp.setMicrophoneEnabled(loanOfficerConnected);
        } catch (e) {
          console.warn("[MediaGuard] Failed to synchronize microphone in loan-officer mode:", e);
        }
        try {
          await lp.setCameraEnabled(false);
        } catch (e) {
          console.warn("[MediaGuard] Failed to disable camera in loan-officer mode:", e);
        }
        console.log(
          loanOfficerConnected
            ? "[MediaGuard] 🎤 Mic ON, camera OFF (Loan Officer answered)"
            : "[MediaGuard] 🔇 Mic OFF while Loan Officer leg is dialing",
        );
      }
    };

    syncMedia();
  }, [mode, loanOfficerConnected, conversationalScheduling, micOnAfterCard, room, room.state]);

  return null;
}

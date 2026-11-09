"use client";

import { useEffect, useRef } from "react";
import {
  useChat,
  useRoomContext,
  useRemoteParticipants,
} from "@livekit/components-react";

import { type AilanaSessionSnapshot } from "../../lib/session-storage";

interface ChannelStartTriggerProps {
  isLivePhase: boolean;
  mode: string;
  zip?: string | null;
  restoreSnapshot?: AilanaSessionSnapshot | null;
  onRestoreSent?: () => void;
  /**
   * Section 0 first screen (S0-25): no channel chosen yet. Ask the agent for the card-screen greeting
   * (SYSTEM_GREETING_START) instead of starting a channel. Unset (flag off) → today's behaviour.
   */
  awaitingChannel?: boolean;
}

export function ChannelStartTrigger({
  isLivePhase,
  mode,
  zip,
  restoreSnapshot,
  onRestoreSent,
  awaitingChannel = false,
}: ChannelStartTriggerProps) {
  const { send } = useChat();
  const room = useRoomContext();
  const participants = useRemoteParticipants();
  const agentReady = participants.length > 0;
  const lastTriggeredMode = useRef<string | null>(null);
  const lastSyncedZip = useRef<string | null>(null);

  // Keep the backend profile synchronized with an IP-detected or manually
  // entered ZIP even when the user requests a Loan Officer by voice instead of
  // opening the Loan Officer UI.
  useEffect(() => {
    const normalizedZip = String(zip || "").replace(/\D/g, "").slice(0, 5);
    if (!isLivePhase || room.state !== "connected" || !agentReady) return;
    if (!/^\d{5}$/.test(normalizedZip) || lastSyncedZip.current === normalizedZip) return;
    lastSyncedZip.current = normalizedZip;
    const payload = new TextEncoder().encode(
      JSON.stringify({ message: "SYSTEM_LOCATION_ZIP", zip: normalizedZip })
    );
    room.localParticipant.publishData(payload, { topic: "lk-chat", reliable: true })
      .catch((error) => {
        lastSyncedZip.current = null;
        console.warn("[ui-location]: Failed to synchronize ZIP with Ailana.", error);
      });
  }, [isLivePhase, room.state, room.localParticipant, agentReady, zip]);

  useEffect(() => {
    if (isLivePhase && room.state === "connected" && agentReady && awaitingChannel && !restoreSnapshot) {
      if (lastTriggeredMode.current === null) {
        // The card tap will not change the mode for "Video chat", so remember it as already started.
        lastTriggeredMode.current = mode;
        const encoder = new TextEncoder();
        const sendGreetingStart = async (attempt: number) => {
          if (room.state !== "connected") return;
          try {
            console.log(`[ui]: 👋 Card screen. Sending SYSTEM_GREETING_START (attempt ${attempt})...`);
            await room.localParticipant.publishData(
              encoder.encode(JSON.stringify({ message: "SYSTEM_GREETING_START" })),
              { topic: "lk-chat", reliable: true }
            );
          } catch (e) {
            console.warn(`[ui]: Failed to send SYSTEM_GREETING_START (attempt ${attempt})`, e);
          }
        };
        // The agent ignores duplicates; retries cover a worker that joins slightly late.
        void sendGreetingStart(1);
        setTimeout(() => void sendGreetingStart(2), 2000);
        setTimeout(() => void sendGreetingStart(3), 4500);
      }
      return;
    }

    if (
      isLivePhase &&
      room.state === "connected" &&
      agentReady &&
      lastTriggeredMode.current !== mode
    ) {
      const prevMode = lastTriggeredMode.current;
      const trySend = async (retries = 3) => {
        try {
          lastTriggeredMode.current = mode;
          const encoder = new TextEncoder();

          if (prevMode === "loan-officer" && mode !== "loan-officer") {
            console.log(`[ui]: ☀️ Waking up agent...`);
            const resumePayload = encoder.encode(
              JSON.stringify({ message: `SYSTEM_RESUME_AGENT` })
            );
            await room.localParticipant.publishData(resumePayload, {
              topic: "lk-chat",
              reliable: true,
            });
          }

          if (mode === "loan-officer") {
            console.log(`[ui-loan-officer]: 📞 Transferring to MLO...`);
            console.log(`[ui-loan-officer]: 📞 Room Name: ${room.name}`);
            console.log(
              `[ui-loan-officer]: 📞 Local Participant Identity: ${room.localParticipant.identity}`
            );
            const transferPayload = encoder.encode(
              JSON.stringify({ message: `SYSTEM_TRANSFER_MLO`, zip: zip || undefined })
            );
            await room.localParticipant.publishData(transferPayload, {
              topic: "lk-chat",
              reliable: true,
            });
            console.log(
              `[ui-loan-officer]: 📞 Sent SYSTEM_TRANSFER_MLO message over DataChannel.`
            );
          } else {
            if (restoreSnapshot) {
              console.log(
                "[ui]: ♻️ Restoring session from snapshot via direct DataChannel:",
                restoreSnapshot
              );
              const restorePayload = encoder.encode(
                JSON.stringify({
                  message: "SYSTEM_RESTORE_STATE",
                  snapshot: restoreSnapshot,
                })
              );
              const sendRestore = async (attempt: number) => {
                if (room.state !== "connected") return;
                try {
                  console.log(`[ui]: ♻️ Sending SYSTEM_RESTORE_STATE (attempt ${attempt})...`);
                  await room.localParticipant.publishData(restorePayload, {
                    topic: "lk-chat",
                    reliable: true,
                  });
                } catch (e) {
                  console.warn(`[ui]: Failed to send SYSTEM_RESTORE_STATE (attempt ${attempt})`, e);
                }
              };
              await sendRestore(1);
              setTimeout(() => {
                void sendRestore(2);
              }, 1200);
              onRestoreSent?.();
              return;
            }

            const sendChannelStart = async (attempt: number) => {
              if (room.state !== "connected") return;
              try {
                console.log(
                  `[ui]: 🚀 Channel starting (${mode}). Sending SYSTEM_CHANNEL_START (attempt ${attempt})...`
                );
                const startPayload = encoder.encode(
                  JSON.stringify({ message: `SYSTEM_CHANNEL_START:${mode}` })
                );
                await room.localParticipant.publishData(startPayload, {
                  topic: "lk-chat",
                  reliable: true,
                });
              } catch (e) {
                console.warn(
                  `[ui]: Failed to send SYSTEM_CHANNEL_START (attempt ${attempt})`,
                  e
                );
              }
            };
            await sendChannelStart(1);
            // Agent worker may join slightly after the initial handoff.
            setTimeout(() => {
              void sendChannelStart(2);
            }, 2000);
            setTimeout(() => {
              void sendChannelStart(3);
            }, 4500);
          }
        } catch (err) {
          console.warn(
            `[ui]: Failed to send start trigger (retries left: ${retries}):`,
            err
          );
          if (retries > 0) {
            setTimeout(() => trySend(retries - 1), 500);
          } else {
            lastTriggeredMode.current = prevMode; // reset so next mode change can try again
          }
        }
      };
      trySend();
    }

    if (!isLivePhase) {
      lastTriggeredMode.current = null;
    }
  }, [
    isLivePhase,
    mode,
    send,
    room.state,
    agentReady,
    room.localParticipant,
    room.name,
    restoreSnapshot,
    onRestoreSent,
    awaitingChannel,
    zip,
  ]);

  return null;
}

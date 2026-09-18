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
  restoreSnapshot?: AilanaSessionSnapshot | null;
  onRestoreSent?: () => void;
}

export function ChannelStartTrigger({
  isLivePhase,
  mode,
  restoreSnapshot,
  onRestoreSent,
}: ChannelStartTriggerProps) {
  const { send } = useChat();
  const room = useRoomContext();
  const participants = useRemoteParticipants();
  const agentReady = participants.length > 0;
  const lastTriggeredMode = useRef<string | null>(null);

  useEffect(() => {
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
              JSON.stringify({ message: `SYSTEM_TRANSFER_MLO` })
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
  ]);

  return null;
}

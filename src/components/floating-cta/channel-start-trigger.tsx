"use client";

import { useEffect, useRef } from "react";
import {
  useChat,
  useRoomContext,
  useRemoteParticipants,
} from "@livekit/components-react";

interface ChannelStartTriggerProps {
  isLivePhase: boolean;
  mode: string;
  isAnnouncementComplete: boolean;
}

export function ChannelStartTrigger({
  isLivePhase,
  mode,
  isAnnouncementComplete,
}: ChannelStartTriggerProps) {
  const { send } = useChat();
  const room = useRoomContext();
  const participants = useRemoteParticipants();
  const agentReady = participants.length > 0;
  const lastTriggeredMode = useRef<string | null>(null);

  useEffect(() => {
    if (
      isLivePhase &&
      isAnnouncementComplete &&
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
            // Agent worker may join slightly after the compliance/recording handoff.
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
    isAnnouncementComplete,
    room.localParticipant,
    room.name,
  ]);

  return null;
}

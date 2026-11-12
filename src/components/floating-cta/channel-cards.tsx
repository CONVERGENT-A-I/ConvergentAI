"use client";

/**
 * Section 0 first screen (S0-24 / S0-25 / S0-26) — shown only when the backend runs with SECTION_0_ENABLED.
 *
 * - Four channel cards: Video chat · Voice · Text chat · Talk to a loan officer.
 * - Each card lights up while Ailana names it in the greeting (backend `SYSTEM_CARD_HIGHLIGHT`, timed to speech).
 * - The microphone stays off until a card is tapped. The tap is the consent: two consent events
 *   (AI engagement + recording) are recorded through POST /api/consent, and the backend is told the
 *   channel (`SYSTEM_CHANNEL_CHOSEN:<mode>`) so Ailana asks the intent question once.
 * - Under the cards: the approved on-screen consent line, a Privacy policy link, "Other ways to reach us".
 */
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat, useRoomContext } from "@livekit/components-react";
import { RoomEvent } from "livekit-client";
import { Video, Phone, MessageCircle, Headset, X } from "lucide-react";
import type { PendingMode } from "./types";

export interface Section0Lender {
  name: string | null;
  nmls: string | null;
  phone: string | null;
  branchUrl: string | null;
  hours: string | null;
}

/** Approved by David (Nov 2026) — word for word. */
export const ON_SCREEN_CONSENT_LINE =
  "Ailana is an AI assistant, not a person. By choosing an option, you agree to talk with Ailana and that this conversation, including video, voice and chat, is recorded for quality and compliance.";

type CardId = "video" | "voice" | "text" | "loan-officer";

const CARDS: Array<{ id: CardId; mode: PendingMode; label: string; icon: React.ReactNode }> = [
  { id: "video", mode: "video", label: "Video chat", icon: <Video className="h-5 w-5 sm:h-6 sm:w-6" /> },
  { id: "voice", mode: "voice", label: "Voice", icon: <Phone className="h-5 w-5 sm:h-6 sm:w-6" /> },
  { id: "text", mode: "avatar-chat", label: "Text chat", icon: <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" /> },
  { id: "loan-officer", mode: "loan-officer", label: "Talk to a loan officer", icon: <Headset className="h-5 w-5 sm:h-6 sm:w-6" /> },
];

const CALLBACK_MESSAGE = "I'd like to request a call back from a loan officer.";

function backendUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    (process.env.NODE_ENV === "development" ? "http://localhost:3001" : "")
  );
}

/** Tell the backend which card was tapped and record the two consents. Never blocks the borrower. */
async function announceChannel(room: ReturnType<typeof useRoomContext>, mode: PendingMode): Promise<void> {
  try {
    const payload = new TextEncoder().encode(JSON.stringify({ message: `SYSTEM_CHANNEL_CHOSEN:${mode}` }));
    await room.localParticipant.publishData(payload, { topic: "lk-chat", reliable: true });
  } catch (e) {
    console.warn("[section0-ui] Failed to send SYSTEM_CHANNEL_CHOSEN:", e);
  }
  try {
    await fetch(`${backendUrl()}/api/consent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomName: room.name, channel: mode }),
    });
    console.log(`[section0-ui] consent recorded (channel=${mode})`);
  } catch (e) {
    console.warn("[section0-ui] Failed to record consent:", e);
  }
}

/** The card the greeting is naming right now (backend SYSTEM_CARD_HIGHLIGHT). */
function useCardHighlight(): CardId | null {
  const room = useRoomContext();
  const [card, setCard] = useState<CardId | null>(null);
  useEffect(() => {
    const onData = (payload: Uint8Array) => {
      try {
        const parsed = JSON.parse(new TextDecoder().decode(payload));
        if (parsed?.message === "SYSTEM_CARD_HIGHLIGHT") setCard((parsed.card as CardId | null) ?? null);
      } catch {
        /* not JSON */
      }
    };
    room.on(RoomEvent.DataReceived, onData);
    return () => {
      room.off(RoomEvent.DataReceived, onData);
    };
  }, [room]);
  return card;
}

interface ChannelCardsProps {
  lender: Section0Lender | null;
  /** Called after the tap was announced; the parent switches the channel (and the mic for voice / video). */
  onChosen: (mode: PendingMode) => void;
}

export function ChannelCards({ lender, onChosen }: ChannelCardsProps) {
  const room = useRoomContext();
  const { send } = useChat();
  const highlighted = useCardHighlight();
  const chosenRef = useRef(false);

  const choose = (mode: PendingMode, then?: () => void) => {
    if (chosenRef.current) return;
    chosenRef.current = true;
    void announceChannel(room, mode).then(() => then?.());
    onChosen(mode);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      className="absolute inset-x-0 bottom-0 z-40 px-3 pb-3 pt-10 sm:px-5 sm:pb-5 bg-gradient-to-t from-black via-black/85 to-transparent"
    >
      <p className="text-center text-white text-sm sm:text-base font-semibold mb-3">
        How would you like to get started?
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 max-w-3xl mx-auto">
        {CARDS.map((c) => {
          const lit = highlighted === c.id;
          return (
            <motion.button
              key={c.id}
              type="button"
              onClick={() => choose(c.mode)}
              animate={{ scale: lit ? 1.05 : 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              aria-label={c.label}
              className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-3 sm:py-4 text-xs sm:text-sm font-semibold transition-colors ${
                lit
                  ? "border-[#00b4d8] bg-[#00b4d8]/25 text-white shadow-[0_0_24px_rgba(0,180,216,0.55)]"
                  : "border-white/15 bg-white/5 text-gray-200 hover:bg-white/10 hover:border-white/30"
              }`}
            >
              <span className={lit ? "text-[#00b4d8]" : "text-gray-300"}>{c.icon}</span>
              <span className="text-center leading-tight">{c.label}</span>
            </motion.button>
          );
        })}
      </div>
      <p className="mt-3 max-w-3xl mx-auto text-center text-[10px] sm:text-xs leading-snug text-gray-300">
        {ON_SCREEN_CONSENT_LINE}{" "}
        <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline text-[#00b4d8] hover:text-white">
          Privacy policy
        </a>
      </p>
      <div className="mt-1.5 text-center">
        <OtherWaysToReachUs
          lender={lender}
          onRequestCallback={() => choose("avatar-chat", () => void send(CALLBACK_MESSAGE).catch(console.error))}
        />
      </div>
    </motion.div>
  );
}

/** "Other ways to reach us": lender phone, branch locator, hours, and a callback request. */
export function OtherWaysToReachUs({
  lender,
  onRequestCallback,
}: {
  lender: Section0Lender | null;
  onRequestCallback: () => void;
}) {
  const [open, setOpen] = useState(false);
  const missing = (label: string) => <span className="italic text-amber-300">[{label} to be added]</span>;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[10px] sm:text-xs underline text-gray-300 hover:text-white"
      >
        Other ways to reach us
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 px-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#0B0F19] p-5 text-left text-sm text-gray-200 shadow-2xl"
              role="dialog"
              aria-label="Other ways to reach us"
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute right-3 top-3 text-gray-400 hover:text-white"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
              <h4 className="mb-3 text-base font-bold text-white">
                Other ways to reach {lender?.name || "us"}
              </h4>
              <dl className="space-y-2">
                <div>
                  <dt className="text-xs text-gray-400">Phone</dt>
                  <dd>
                    {lender?.phone ? (
                      <a href={`tel:${lender.phone.replace(/[^\d+]/g, "")}`} className="text-[#00b4d8] underline">
                        {lender.phone}
                      </a>
                    ) : (
                      missing("phone")
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-400">Branch locator</dt>
                  <dd>
                    {lender?.branchUrl ? (
                      <a href={lender.branchUrl} target="_blank" rel="noopener noreferrer" className="text-[#00b4d8] underline">
                        Find a branch
                      </a>
                    ) : (
                      missing("branch locator link")
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-400">Hours</dt>
                  <dd>{lender?.hours || missing("hours")}</dd>
                </div>
              </dl>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onRequestCallback();
                }}
                className="mt-4 w-full rounded-xl bg-[#00b4d8] px-4 py-2.5 text-sm font-bold text-black hover:bg-[#00b4d8]/90"
              >
                Request a call back
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Footer for the whole Section 0 session (replaces the demo trust footer only with the flag on).
 * Rendered inside the LiveKit room. On the card screen the cards already show "Other ways to reach us".
 */
export function Section0Footer({ lender, showOtherWays }: { lender: Section0Lender | null; showOtherWays: boolean }) {
  const { send } = useChat();
  const onRequestCallback = () => void send(CALLBACK_MESSAGE).catch(console.error);
  return (
    <div className="shrink-0 px-3 py-1.5 md:py-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[9px] sm:text-[10px] md:text-xs text-gray-400 bg-[#07090f] border-t border-white/15">
      <span>
        Equal Housing Lender · AI-assisted process · NMLS #
        {lender?.nmls || <span className="italic text-amber-300">[number to be added]</span>}
      </span>
      {showOtherWays && (
        <>
          <span className="h-3 w-px bg-white/20 hidden sm:block" />
          <OtherWaysToReachUs lender={lender} onRequestCallback={onRequestCallback} />
        </>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useLocalParticipant } from "@livekit/components-react";
import { ConnectionQuality, ParticipantEvent } from "livekit-client";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, WifiOff } from "lucide-react";

/**
 * NetworkQualityBanner
 *
 * Thin, centered strip just below the channel-switcher header.
 * Fades in from transparent to fully visible when quality is Poor or Lost.
 * Must be mounted inside a <LiveKitRoom> context.
 */
export function NetworkQualityBanner() {
  const { localParticipant } = useLocalParticipant();
  const [quality, setQuality] = useState<ConnectionQuality>(
    ConnectionQuality.Excellent
  );

  useEffect(() => {
    if (!localParticipant) return;
    setQuality(localParticipant.connectionQuality);

    const onQualityChanged = (q: ConnectionQuality) => setQuality(q);
    localParticipant.on(ParticipantEvent.ConnectionQualityChanged, onQualityChanged);
    return () => {
      localParticipant.off(ParticipantEvent.ConnectionQualityChanged, onQualityChanged);
    };
  }, [localParticipant]);

  const isPoor = quality === ConnectionQuality.Poor;
  const isLost = quality === ConnectionQuality.Lost;
  const showBanner = isPoor || isLost;

  const isRed = isLost;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          key="network-quality-banner"
          // Entrance: fade from fully transparent to visible
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 1, 0.75, 1], // fade in → subtle breathing
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 1.6,
            ease: "easeInOut",
            times: [0, 0.4, 0.7, 1],
          }}
          // Centered horizontally, just below the header bar (~56px)
          className="absolute top-[58px] left-1/2 -translate-x-1/2 z-[210] pointer-events-none"
        >
          <div
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full border backdrop-blur-md
              ${isRed
                ? "bg-red-950/80 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.25)]"
                : "bg-[#1a1000]/85 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.25)]"
              }`}
          >
            {/* Pulsing dot */}
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              className={`h-1.5 w-1.5 rounded-full shrink-0 ${isRed ? "bg-red-400" : "bg-amber-400"}`}
            />

            {/* Icon */}
            {isRed
              ? <WifiOff className="h-3 w-3 text-red-400 shrink-0" />
              : <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0" />
            }

            {/* Label */}
            <span className={`text-[10px] font-black uppercase tracking-[0.14em] ${isRed ? "text-red-400" : "text-amber-400"}`}>
              {isRed ? "⚠️ Connection Lost" : "⚠️ Weak Connection"}
            </span>

            {/* Divider */}
            <span className={`h-3 w-px shrink-0 ${isRed ? "bg-red-500/40" : "bg-amber-500/40"}`} />

            {/* Message */}
            <span className="text-[10px] font-medium text-white/55 whitespace-nowrap">
              {isRed
                ? "Reconnecting…"
                : "Audio & video quality may be affected"}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

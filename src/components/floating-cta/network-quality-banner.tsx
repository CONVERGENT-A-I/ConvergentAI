"use client";

import { useEffect, useState } from "react";
import { useLocalParticipant } from "@livekit/components-react";
import { ConnectionQuality, ParticipantEvent } from "livekit-client";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff } from "lucide-react";

/**
 * NetworkQualityBanner
 *
 * Listens to LiveKit's ConnectionQualityChanged event on the local participant.
 * Shows a subtle floating pill at the top of the session when connection
 * quality degrades to Poor or Lost, so the user understands why the
 * AI's voice or video may be underperforming.
 *
 * Must be mounted inside a <LiveKitRoom> context.
 */
export function NetworkQualityBanner() {
  const { localParticipant } = useLocalParticipant();
  const [quality, setQuality] = useState<ConnectionQuality>(
    ConnectionQuality.Excellent
  );

  useEffect(() => {
    if (!localParticipant) return;

    // Sync initial state
    setQuality(localParticipant.connectionQuality);

    const onQualityChanged = (q: ConnectionQuality) => {
      setQuality(q);
    };

    localParticipant.on(ParticipantEvent.ConnectionQualityChanged, onQualityChanged);
    return () => {
      localParticipant.off(ParticipantEvent.ConnectionQualityChanged, onQualityChanged);
    };
  }, [localParticipant]);

  const isPoor = quality === ConnectionQuality.Poor;
  const isLost = quality === ConnectionQuality.Lost;
  const showBanner = isPoor || isLost;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          key="network-quality-banner"
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          // Floats below the header, centred horizontally
          className="absolute top-[62px] left-1/2 -translate-x-1/2 z-[210] pointer-events-none"
        >
          <div
            className={`flex items-center gap-2 px-3.5 py-2 rounded-full border backdrop-blur-md shadow-lg text-xs font-semibold whitespace-nowrap
              ${isLost
                ? "bg-red-500/20 border-red-500/40 text-red-300 shadow-red-500/10"
                : "bg-amber-500/15 border-amber-500/35 text-amber-300 shadow-amber-500/10"
              }`}
          >
            {/* Pulsing indicator dot */}
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className={`h-2 w-2 rounded-full shrink-0 ${isLost ? "bg-red-400" : "bg-amber-400"}`}
            />

            {/* Bold label */}
            <span className={`font-black uppercase tracking-wider text-[10px] ${isLost ? "text-red-300" : "text-amber-300"}`}>
              {isLost ? "⚠️ Connection Lost" : "⚠️ Weak Connection"}
            </span>

            {/* Vertical divider */}
            <span className={`h-3.5 w-px shrink-0 ${isLost ? "bg-red-500/40" : "bg-amber-500/40"}`} />

            {/* Descriptive message */}
            {isLost ? (
              <WifiOff className="h-3.5 w-3.5 shrink-0 opacity-70" />
            ) : (
              <Wifi className="h-3.5 w-3.5 shrink-0 opacity-70" />
            )}
            <span className="font-medium opacity-80">
              {isLost
                ? "Trying to reconnect…"
                : "Audio & video quality may be affected"}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

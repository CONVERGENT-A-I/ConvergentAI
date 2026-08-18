"use client";

import { useEffect, useState } from "react";
import { useLocalParticipant } from "@livekit/components-react";
import { ConnectionQuality, ParticipantEvent } from "livekit-client";
import { motion } from "framer-motion";

/**
 * NetworkStrengthBars
 *
 * Always-visible signal-strength indicator (4 ascending bars)
 * driven by LiveKit's ConnectionQuality events.
 *
 * Must be mounted inside a <LiveKitRoom> context.
 *
 * Quality mapping:
 *   Excellent → 4 bars (green)
 *   Good      → 3 bars (green)
 *   Poor      → 2 bars (amber, pulsing)
 *   Lost      → 0 bars (red, pulsing)
 *   Unknown   → 1 bar  (gray)
 */
export function NetworkStrengthBars() {
  const { localParticipant } = useLocalParticipant();
  const [quality, setQuality] = useState<ConnectionQuality>(
    ConnectionQuality.Excellent
  );

  useEffect(() => {
    if (!localParticipant) return;
    setQuality(localParticipant.connectionQuality);

    const onQualityChanged = (q: ConnectionQuality) => setQuality(q);
    localParticipant.on(
      ParticipantEvent.ConnectionQualityChanged,
      onQualityChanged
    );
    return () => {
      localParticipant.off(
        ParticipantEvent.ConnectionQualityChanged,
        onQualityChanged
      );
    };
  }, [localParticipant]);

  // Derive visual state from quality
  const { activeBars, color, label, shouldPulse } = getBarConfig(quality);

  const barHeights = [6, 9, 12, 16]; // px — ascending bars

  return (
    <motion.div
      className="flex items-end gap-[2.5px] group relative cursor-default"
      // Pulse the whole indicator when connection is degraded
      animate={
        shouldPulse
          ? { opacity: [1, 0.45, 1] }
          : { opacity: 1 }
      }
      transition={
        shouldPulse
          ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.3 }
      }
    >
      {barHeights.map((h, i) => {
        const isActive = i < activeBars;
        return (
          <motion.div
            key={i}
            className="rounded-[1.5px]"
            style={{
              width: 3.5,
              height: h,
              backgroundColor: isActive ? color : "rgba(255,255,255,0.15)",
            }}
            initial={false}
            animate={{
              backgroundColor: isActive ? color : "rgba(255,255,255,0.15)",
            }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          />
        );
      })}

      {/* Tooltip on hover */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 rounded-lg bg-black/85 border border-white/10 backdrop-blur-md text-[9px] font-bold text-white/80 tracking-wide whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg">
        {label}
      </div>
    </motion.div>
  );
}

function getBarConfig(quality: ConnectionQuality) {
  switch (quality) {
    case ConnectionQuality.Excellent:
      return {
        activeBars: 4,
        color: "#22c55e", // green-500
        label: "Excellent Connection",
        shouldPulse: false,
      };
    case ConnectionQuality.Good:
      return {
        activeBars: 3,
        color: "#22c55e", // green-500
        label: "Good Connection",
        shouldPulse: false,
      };
    case ConnectionQuality.Poor:
      return {
        activeBars: 2,
        color: "#f59e0b", // amber-500
        label: "Weak Connection",
        shouldPulse: true,
      };
    case ConnectionQuality.Lost:
      return {
        activeBars: 0,
        color: "#ef4444", // red-500
        label: "Connection Lost",
        shouldPulse: true,
      };
    default:
      // Unknown / not yet determined
      return {
        activeBars: 1,
        color: "rgba(255,255,255,0.35)",
        label: "Connecting…",
        shouldPulse: false,
      };
  }
}

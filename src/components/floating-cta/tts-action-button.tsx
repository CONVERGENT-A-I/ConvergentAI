"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface TtsActionButtonProps {
  onClick: () => void;
}

/**
 * TtsActionButton
 *
 * A standalone floating button positioned above the main CTA.
 * Completely independent — owns its own fixed position (bottom-[88px] right-6).
 * Styled with an emerald/teal gradient to visually distinguish it from the
 * main blue/purple ActionButton below it.
 *
 * Clicking this opens the tts-avatar flow where Ailana's intro speech plays.
 */
export function TtsActionButton({ onClick }: TtsActionButtonProps) {
  return (
    <div className="fixed bottom-[88px] right-6 z-[100]">
      <motion.div
        layout
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={onClick}
        className="group relative flex items-center gap-2 md:gap-3 rounded-full bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 p-1.5 pr-4 md:p-2 md:pr-6 text-white shadow-[0_0_24px_rgba(16,185,129,0.55),0_0_10px_rgba(16,185,129,0.3),0_4px_16px_rgba(0,0,0,0.4)] transition-all duration-300 hover:shadow-[0_0_40px_rgba(16,185,129,0.75),0_0_20px_rgba(16,185,129,0.4)] hover:-translate-y-1 active:scale-95 cursor-pointer border border-white/25 backdrop-blur-sm"
      >
        {/* Icon circle */}
        <div className="relative h-8 w-8 md:h-11 md:w-11 rounded-full bg-white/20 flex items-center justify-center border border-white/30 shadow-[0_0_10px_rgba(255,255,255,0.15)] overflow-hidden">
          {/* Animated shimmer */}
          <motion.div
            className="absolute inset-0 rounded-full bg-white/10"
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-white relative z-10" />
        </div>

        {/* Label */}
        <div className="flex flex-col">
          <span className="text-[9px] md:text-[10px] font-bold text-white/70 uppercase tracking-[0.22em] mb-0.5 drop-shadow-sm">
            AI Intro
          </span>
          <span className="text-[11px] md:text-sm font-black tracking-tight text-white flex items-center gap-1.5 drop-shadow-sm">
            Hear Ailana
            <Sparkles className="h-2.5 w-2.5 md:h-3 md:w-3 text-yellow-200 animate-pulse" />
          </span>
        </div>

        {/* Hover glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-emerald-300/0 group-hover:border-emerald-300/40 transition-all duration-300 pointer-events-none"
        />
      </motion.div>
    </div>
  );
}

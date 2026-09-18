"use client";

import React from "react";
import { motion } from "framer-motion";
import { RotateCcw, Sparkles, X } from "lucide-react";
import { type AilanaSessionSnapshot } from "../../lib/session-storage";

interface SessionRecoveryBannerProps {
  snapshot: AilanaSessionSnapshot;
  onContinue: () => void;
  onStartFresh: () => void;
}

export function SessionRecoveryBanner({
  snapshot,
  onContinue,
  onStartFresh,
}: SessionRecoveryBannerProps) {
  const minutesAgo = Math.round((Date.now() - snapshot.timestamp) / 60000);
  const timeLabel =
    minutesAgo < 1
      ? "just now"
      : minutesAgo < 60
      ? `${minutesAgo} minute${minutesAgo !== 1 ? "s" : ""} ago`
      : `${Math.round(minutesAgo / 60)} hour${Math.round(minutesAgo / 60) !== 1 ? "s" : ""} ago`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ type: "spring", damping: 22, stiffness: 260 }}
      className="w-full rounded-2xl border border-[#00b4d8]/30 bg-gradient-to-br from-[#0d1a2d] to-[#071828] p-5 shadow-[0_0_30px_rgba(0,180,216,0.12)] backdrop-blur-md"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#00b4d8]/20 border border-[#00b4d8]/40 flex items-center justify-center">
            <RotateCcw className="w-4 h-4 text-[#00b4d8]" />
          </div>
          <div>
            <p className="text-white text-sm font-bold leading-tight">Session in Progress</p>
            <p className="text-gray-400 text-[11px]">Started {timeLabel}</p>
          </div>
        </div>
        <button
          onClick={onStartFresh}
          className="text-gray-600 hover:text-gray-400 transition-colors p-0.5 cursor-pointer"
          title="Start fresh instead"
        >
          <X className="w-4 h-4" />
        </button>
      </div>


      {/* Action buttons */}
      <div className="flex flex-col gap-2.5">
        <button
          onClick={onContinue}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00b4d8] to-[#023e8a] text-white text-sm font-bold hover:shadow-[0_0_25px_rgba(0,180,216,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-white/15 translate-y-full group-hover:translate-y-0 transition-transform" />
          <Sparkles className="w-4 h-4 relative z-10 text-cyan-200" />
          <span className="relative z-10">Continue Previous Session</span>
        </button>
        <button
          onClick={onStartFresh}
          className="w-full py-2.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
          <span>New Session</span>
        </button>
      </div>
    </motion.div>
  );
}
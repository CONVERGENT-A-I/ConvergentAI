"use client";

import React from "react";
import { motion } from "framer-motion";
import { RotateCcw, Sparkles, X } from "lucide-react";
import { type AilanaSessionSnapshot, getStageName } from "../../lib/session-storage";

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
  const stageName = getStageName(snapshot.activeStage);
  const borrowerName =
    snapshot.borrowerProfile?.contact_name ||
    snapshot.borrowerProfile?.borrower_name ||
    null;

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

      {/* Session details */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-4 space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-[11px] uppercase tracking-wider font-medium">Stage</span>
          <span className="text-white text-xs font-semibold">{stageName}</span>
        </div>
        {borrowerName && (
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-[11px] uppercase tracking-wider font-medium">Borrower</span>
            <span className="text-white text-xs font-semibold">{borrowerName}</span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-[11px] uppercase tracking-wider font-medium">Mode</span>
          <span className="text-white text-xs font-semibold capitalize">
            {snapshot.pendingMode === "loan-officer" ? "Loan Officer" : snapshot.pendingMode}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-2">
        <button
          onClick={onContinue}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#00b4d8] to-[#023e8a] text-white text-sm font-bold hover:shadow-[0_0_20px_rgba(0,180,216,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform" />
          <Sparkles className="w-4 h-4 relative z-10" />
          <span className="relative z-10">Continue Session</span>
        </button>
        <button
          onClick={onStartFresh}
          className="w-full py-2 rounded-xl border border-white/15 text-gray-400 hover:text-white hover:bg-white/8 text-xs font-medium transition-colors cursor-pointer"
        >
          Start Fresh Instead
        </button>
      </div>
    </motion.div>
  );
}
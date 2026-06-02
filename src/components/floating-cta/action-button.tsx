"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface ActionButtonProps {
  onClick: () => void;
}

export function ActionButton({ onClick }: ActionButtonProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <motion.div
        layout
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="group relative flex items-center gap-2.5 md:gap-4 rounded-full bg-gradient-to-br from-[#00d4f5] via-[#0252c4] to-[#7b2fff] p-1.5 pr-5 md:p-2.5 md:pr-8 text-white shadow-[0_0_50px_rgba(0,212,245,0.65),0_0_25px_rgba(123,47,255,0.55),0_4px_20px_rgba(0,0,0,0.6)] transition-all duration-300 hover:shadow-[0_0_70px_rgba(0,212,245,0.85),0_0_40px_rgba(123,47,255,0.75)] hover:-translate-y-2 hover:scale-[1.02] active:scale-95 cursor-pointer border border-white/25"
      >
        <div className="relative h-10 w-10 md:h-14 md:w-14 rounded-full bg-white/25 flex items-center justify-center overflow-hidden border-2 border-white/50 backdrop-blur-sm shadow-[0_0_12px_rgba(0,212,245,0.4)]">
          <Image
            src="/friendly_ai_avatar_v2.png"
            alt="Ailana"
            fill
            sizes="(max-width: 768px) 40px, 56px"
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] md:text-xs font-bold text-white/90 uppercase tracking-[0.2em] mb-0.5 drop-shadow-sm">
            Live
          </span>
          <span className="text-[10px] md:text-xs font-bold text-white/90 uppercase tracking-[0.2em] mb-0.5 drop-shadow-sm">
            Mortgage Assistance
          </span>
          <span className="text-sm md:text-lg font-black tracking-tight text-white flex items-center gap-2 drop-shadow-sm">
            WITH AILANA (24/7)
            <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4 text-yellow-300 animate-pulse" />
          </span>
        </div>
      </motion.div>
    </div>
  );
}

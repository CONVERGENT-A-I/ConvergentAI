"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Sparkles } from "lucide-react";

export default function FloatingCTA() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[100] font-sans"
    >
      <motion.div
        role="button"
        tabIndex={0}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative flex items-center gap-2.5 md:gap-4 rounded-full bg-gradient-to-br from-[#00b4d8] via-[#023e8a] to-[#560bad] p-1.5 pr-5 md:p-2.5 md:pr-8 text-white shadow-[0_0_40px_rgba(0,180,216,0.5),0_0_20px_rgba(86,11,173,0.5)] transition-all duration-300 hover:shadow-[0_0_60px_rgba(0,180,216,0.7),0_0_30px_rgba(86,11,173,0.7)] hover:-translate-y-2 hover:scale-[1.02] active:scale-95"
      >
        {/* Pulsing Aura Behind Button */}
        <motion.div
          className="absolute -inset-2 -z-10 rounded-full bg-gradient-to-br from-[#00b4d8] via-[#023e8a] to-[#560bad] opacity-60 blur-xl"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <AnimatePresence>
          {isHovered && (
            <motion.div
              key="hover-effects"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute -inset-16 z-50"
            >

              {/* Glitters flowing outwards evenly all around on hover */}
              {Array.from({ length: 12 }).map((_, i) => {
                // Spawn randomly all around the container
                const startX = Math.random() * 100;
                const startY = Math.random() * 100;

                // Determine outward direction based on origin
                // If on the left side, shoot left; if top, shoot up, etc.
                const dirX = startX < 50 ? -1 : 1;
                const dirY = startY < 50 ? -1 : 1;

                // Shoot outward in their respective directions
                const randomX = dirX * (Math.random() * 80 + 30); 
                const randomY = dirY * (Math.random() * 60 + 20);

                return (
                  <motion.div
                    key={i}
                    className="absolute h-[5px] w-[5px] md:h-2 md:w-2 rounded-full bg-[#a855f7] blur-[1px] shadow-[0_0_15px_rgba(168,85,247,1)]"
                    style={{
                      left: `${startX}%`,
                      top: `${startY}%`,
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      x: randomX,
                      y: randomY, 
                      scale: [0, Math.random() * 2 + 0.5, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 1 + Math.random() * 1.5,
                      repeat: Infinity,
                      delay: Math.random() * 0.5,
                      ease: "easeOut",
                    }}
                  />
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3D Inner Top Highlight for Glassy look */}
        <div className="pointer-events-none absolute inset-0 rounded-full border-t border-white/50 bg-gradient-to-b from-white/10 to-transparent" />

        {/* Dynamic Glassy Shine (Idle flash & Hover shimmer) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
          <motion.div
            className="absolute -top-10 -bottom-10 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-[30deg]"
            animate={{ x: ["-300%", "400%"] }}
            transition={
              isHovered
                ? { duration: 1, repeat: Infinity, ease: "linear" } 
                : { duration: 1.5, repeat: Infinity, repeatDelay: 4.5, ease: "easeInOut" }
            }
          />
        </div>

        {/* Avatar Wrapper to handle localized scaling & aggressive waving */}
        <motion.div 
          className="relative shrink-0 flex items-center justify-center h-10 w-10 md:h-14 md:w-14 origin-bottom md:origin-bottom-right"
          animate={
            isHovered
              ? { rotate: [0, -25, 15, -20, 10, 0], scale: 1.15 }
              : { rotate: [0, -25, 20, -20, 10, 0], scale: [1, 1.3, 1.3, 1.3, 1.1, 1] }
          }
          transition={
            isHovered
              ? { duration: 0.9, ease: "easeInOut" }
              : { duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 4.5 }
          }
        >
          {/* Outer pulse ring for the headshot */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-[3px] md:-inset-1 rounded-full border border-dashed border-[#a855f7] opacity-60"
          />

          {/* AI Headshot Image */}
          <div className="relative h-full w-full overflow-hidden rounded-full border-[1.5px] border-[#a855f7]/60 bg-[#560bad] shadow-[0_0_15px_rgba(86,11,173,0.5)]">
            <Image
              src="/friendly_ai_avatar_v2.png"
              alt="Friendly AI Assistant"
              fill
              className="object-cover"
            />
          </div>
        </motion.div>

        {/* Text Content */}
        <div className="relative z-10 flex flex-col items-start pr-1 md:pr-2">
          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.25em] text-[#00b4d8] drop-shadow-md">
            Wait! Let's Talk
          </span>
          <span className="flex items-center gap-1.5 text-[13px] md:text-lg font-black tracking-tight text-white group-hover:text-[#00b4d8] transition-all drop-shadow-md">
            Chat with AI <Sparkles className="h-3.5 w-3.5 md:h-5 md:w-5 text-[#00b4d8]" />
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

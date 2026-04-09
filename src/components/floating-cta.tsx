"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Sparkles, X, Headset, Phone, Smartphone, Calendar, Video, Mic } from "lucide-react";
import AppIcon from "../app/icon.png";

function SideButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex flex-col md:flex-row items-center justify-start gap-1 md:gap-4 w-full p-1 md:p-3.5 lg:p-4 rounded-xl md:rounded-2xl hover:bg-white/5 border border-transparent hover:border-[#00b4d8]/30 transition-all group text-center md:text-left hover:shadow-[0_0_20px_rgba(0,180,216,0.15)] cursor-pointer">
      <div className="flex-shrink-0 h-8 w-8 md:h-12 md:w-12 rounded-full bg-[#0B0F19] border border-white/10 text-[#00b4d8] flex items-center justify-center group-hover:scale-110 group-hover:bg-gradient-to-br from-[#00b4d8] via-[#023e8a] to-[#560bad] group-hover:border-transparent group-hover:text-white transition-all duration-300 shadow-sm mx-auto md:mx-0">
        {icon}
      </div>
      <span className="font-medium md:font-semibold text-gray-300 group-hover:text-white transition-colors text-[8px] sm:text-[10px] md:text-sm lg:text-base leading-none md:leading-tight w-full mt-1 md:mt-0 break-words whitespace-normal">
        {label}
      </span>
    </button>
  );
}

export default function FloatingCTA() {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl font-sans"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-5xl h-[85vh] min-h-[500px] max-h-[800px] bg-[#050505] rounded-3xl shadow-[0_0_80px_rgba(0,180,216,0.15)] flex flex-col md:flex-row overflow-hidden border border-[#00b4d8]/20"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 md:top-6 md:right-6 z-50 p-2.5 rounded-full bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors shadow-sm border border-white/5 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Main Laptop Stage Area (Left) */}
              <div className="flex-1 relative flex flex-col p-6 md:p-12 overflow-hidden bg-gradient-to-br from-[#050505] to-[#111111]">
                {/* Brand Header */}
                <div className="flex items-center gap-3 mb-8 relative z-10 pt-2 md:pt-0">
                  <div className="relative h-10 w-10 flex shrink-0 items-center justify-center overflow-hidden rounded-full shadow-[0_0_15px_rgba(0,180,216,0.3)] bg-transparent">
                    <Image
                      src={AppIcon}
                      alt="ConvergentAI Logo"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="font-extrabold text-white text-2xl tracking-tight">ConvergentAI</span>
                </div>

                {/* LiveKit Interface Container */}
                <div className="flex-1 relative w-full h-full flex flex-col items-center justify-center rounded-2xl bg-black/60 shadow-xl border border-white/5 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-[#00b4d8]/10 to-transparent pointer-events-none" />

                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="relative z-10 w-32 h-32 md:w-44 md:h-44 mb-8 rounded-full overflow-hidden border-[6px] md:border-8 border-[#0B0F19] shadow-[0_0_40px_rgba(0,180,216,0.3)]"
                  >
                    <Image
                      src="/friendly_ai_avatar_v2.png"
                      alt="AI Assistant"
                      fill
                      className="object-cover"
                    />
                  </motion.div>

                  <div className="relative z-10 bg-[#0B0F19]/80 backdrop-blur-sm px-6 md:px-8 py-3 md:py-4 rounded-2xl shadow-lg border border-white/10 transform -translate-y-4 max-w-[280px] md:max-w-sm text-center">
                    <p className="text-gray-200 font-medium text-sm md:text-lg">
                      Get instant answers to your mortgage questions...
                    </p>
                  </div>

                  <div className="absolute bottom-6 text-xs md:text-sm text-[#00b4d8]/60 font-medium tracking-wide">
                    LiveKit Video Room Space
                  </div>
                </div>
              </div>

              {/* Sidebar Actions (Bottom on mobile, Right on desktop) */}
              <div className="w-full md:w-[320px] bg-[#0a0a0a]/90 flex md:flex-col items-start md:items-center justify-center p-1 sm:p-4 md:p-8 z-10 shadow-[0_-20px_40px_rgba(0,0,0,0.5)] md:shadow-[-20px_0_40px_rgba(0,0,0,0.5)] border-t md:border-t-0 md:border-l border-white/5 shrink-0">
                <div className="grid grid-cols-5 md:flex md:flex-col gap-1 sm:gap-2 md:gap-3.5 w-full mx-auto md:mx-0">
                  <SideButton icon={<Video className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />} label="Video Meet" />
                  <SideButton icon={<Headset className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />} label="Voice Call via Browser" />
                  <SideButton icon={<Mic className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />} label="AI Voice - Speak to AI" />
                  <SideButton icon={<Smartphone className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />} label="Text Message" />
                  <SideButton icon={<Calendar className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />} label="Book Appointment" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 md:gap-4 rounded-full bg-gradient-to-br from-[#00b4d8] via-[#023e8a] to-[#560bad] p-1.5 pr-5 md:p-2.5 md:pr-8 text-white shadow-[0_0_40px_rgba(0,180,216,0.5),0_0_20px_rgba(86,11,173,0.5)] transition-all duration-300 hover:shadow-[0_0_60px_rgba(0,180,216,0.7),0_0_30px_rgba(86,11,173,0.7)] hover:-translate-y-2 hover:scale-[1.02] active:scale-95 cursor-pointer"
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
    </>
  );
}

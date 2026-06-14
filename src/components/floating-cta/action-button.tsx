"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import friendlyAvatar from "../../../public/friendly_ai_avatar_v2.png";
import logoIcon from "../../../public/newassets/ConvergentAI_logo_package/ConvergentAI_icon_mark_reverse.svg";

interface ActionButtonProps {
  onClick: () => void;
}

export function ActionButton({ onClick }: ActionButtonProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.03, y: -4 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 600, damping: 24 }}
        onClick={onClick}
        className="group relative rounded-[1.5rem] md:rounded-full shadow-[0_0_25px_rgba(0,212,245,0.25),0_0_12px_rgba(123,47,255,0.15),0_4px_15px_rgba(0,0,0,0.5)] transition-shadow duration-150 hover:shadow-[0_0_40px_rgba(0,212,245,0.45),0_0_20px_rgba(123,47,255,0.3)] cursor-pointer"
        style={{
          border: "2.5px solid transparent",
          background: "linear-gradient(to right, rgba(37, 150, 190, 0.4), #0a1835) padding-box, linear-gradient(to right, #00d4f5, #7b2fff) border-box"
        }}
      >
        <div className="backdrop-blur-md rounded-[1.4rem] md:rounded-full px-3 py-2 md:px-5 md:py-3 flex items-center gap-3 md:gap-4">
          {/* Avatar Area */}
          <div className="relative h-11 w-11 md:h-15 md:w-15 rounded-full overflow-hidden border-2 border-[#00d4f5] shadow-[0_0_10px_rgba(0,212,245,0.35)] shrink-0 bg-white/5">
            <Image
              src={friendlyAvatar}
              alt="Ailana"
              fill
              sizes="(max-width: 768px) 44px, 60px"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Text Content */}
          <div className="flex flex-col min-w-0">
            {/* Top Row: Live badge & Muted indicator */}
            <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">
              <div className="flex items-center gap-1 px-1 py-0.5 rounded-full border border-[#00e676]/30 bg-[#00e676]/10 shrink-0">
                <span className="h-1 w-1 rounded-full bg-[#00e676] animate-pulse" />
                <span className="text-[6.5px] md:text-[8px] font-black text-[#00e676] tracking-wider uppercase">
                  Live
                </span>
              </div>
              <span className="text-[6.5px] md:text-[8px] font-black text-gray-300 tracking-[0.15em] uppercase truncate">
                Mortgage Assistance
              </span>
            </div>

            {/* Title */}
            <h3 className="text-[10px] md:text-base font-black text-white tracking-tight leading-none uppercase">
              WITH <span className="text-[#00d4f5]">AILANA</span> (24/7)
            </h3>

            {/* Description (desktop-only for spacing) */}
            <p className="hidden md:block text-[10px] text-white/70 font-medium mt-1 leading-none tracking-normal">
              Instant answers. Expert guidance. Any time.
            </p>
          </div>

          {/* Vertical Divider */}
          <div className="h-6 md:h-10 w-[1px] bg-white/10 shrink-0 mx-0.5 md:mx-1" />

          {/* Right Section: Logo and Chat Now */}
          <div className="flex flex-col items-center justify-center gap-0.5 md:gap-1 shrink-0">
            <div className="relative h-6 w-6 md:h-8 md:w-8 rounded-full flex items-center justify-center border border-[#00d4f5]/30 bg-white/5 shadow-[0_0_8px_rgba(0,212,245,0.15)]">
              <Image
                src={logoIcon}
                alt="Logo Icon"
                fill
                sizes="(max-width: 768px) 16px, 24px"
                className="object-contain p-0.5 md:p-1"
              />
            </div>
            <div className="flex items-center gap-0.5 text-[6.5px] md:text-[8.5px] font-black text-[#00d4f5] tracking-wider uppercase">
              Chat Now
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

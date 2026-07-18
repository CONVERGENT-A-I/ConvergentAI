"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Activity } from "lucide-react";

interface LogoLoaderProps {
  title?: string;
  subtitle?: string;
}

const STEPS = [
  "Initializing Ailana AI Node...",
  "Establishing Secure Audio Bridge...",
  "Synthesizing Mortgage Intelligence...",
  "Synchronizing Refinance Context...",
  "Deploying Neural Response System...",
  "Ailana is entering the room..."
];

export function LogoLoader({
  title = "Setting up your session...",
  subtitle = "This usually takes a few seconds",
}: LogoLoaderProps) {
  const [stepIndex, setStepIndex] = useState(0);

  // Cycle connection steps
  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % STEPS.length);
    }, 1600);
    return () => clearInterval(stepInterval);
  }, []);

  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md transition-all duration-500">
      
      {/* Outer Glow Orb and Rotating Orbits */}
      <div className="relative flex items-center justify-center w-52 h-52 mb-6">
        {/* Glow Aura Backdrop */}
        <div className="absolute w-32 h-32 rounded-full bg-gradient-to-tr from-[#2435F3] via-[#5F43D9] to-[#22C5CC] blur-3xl animate-breath-glow" />

        {/* Outer Orbit Ring with glowing particle */}
        <div className="absolute w-40 h-40 rounded-full border border-white/15 animate-spin-reverse">
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#22C5CC] shadow-[0_0_12px_#22C5CC]" />
        </div>

        {/* Middle Dashed Ring */}
        <div className="absolute w-32 h-32 rounded-full border-2 border-dashed border-[#2435F3]/40 animate-spin-slow" />

        {/* Inner Solid Tech Ring & Icon Badge */}
        <div className="absolute w-24 h-24 rounded-full border border-white/15 bg-[#030712]/95 shadow-[0_0_30px_rgba(36,53,243,0.35)] flex items-center justify-center z-10 animate-breath-badge">
          <div className="relative w-14 h-14">
            <Image
              src="/newassets/ConvergentAI_logo_package/ConvergentAI_icon_mark_reverse.svg"
              alt="ConvergentAI Logo"
              fill
              className="object-contain animate-spin-slow"
              sizes="56px"
              priority
            />
          </div>
        </div>
      </div>

      {/* Main Connection Status Title */}
      <h3 className="text-white/95 font-semibold text-base tracking-wide text-center px-4 mb-2">
        {title}
      </h3>

      {/* Dynamic Checklist Steps */}
      <div className="h-6 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 text-white/50 text-xs font-medium"
          >
            <Activity className="h-3 w-3 text-[#22C5CC] animate-pulse" />
            <span>{STEPS[stepIndex]}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

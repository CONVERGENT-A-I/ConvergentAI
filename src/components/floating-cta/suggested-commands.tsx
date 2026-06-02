"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function SuggestedCommands() {
  const commands = [
    "Try: 'Switch to Voice mode'",
    "Try: 'Let's chat via text'",
    "Try: 'Enable your camera'",
    "Try: 'Help me with mortgage'",
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % commands.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [commands.length]);

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.5 }}
          className="bg-black/40 backdrop-blur-sm text-white/80 text-[11px] px-3 py-1 rounded-full border border-white/10"
        >
          {commands[index]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

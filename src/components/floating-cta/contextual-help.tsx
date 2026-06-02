"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function ContextualHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  useEffect(() => {
    // Hide initial tooltip after 10 seconds
    const timer = setTimeout(() => setShowTooltip(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="absolute top-4 right-4 z-50">
      <AnimatePresence>
        {showTooltip && !isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute right-12 top-0 bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg mr-2"
          >
            Need help? Click here
            <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 transform rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowTooltip(false);
        }}
        className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 transition-colors cursor-pointer"
      >
        <span className="font-bold text-sm">?</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, transformOrigin: "top right" }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-10 right-0 w-64 bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl"
          >
            <h4 className="text-white font-semibold text-sm mb-2">
              Available Modes
            </h4>
            <ul className="text-white/70 text-[11px] space-y-2.5">
              <li className="flex items-start gap-2">
                <span className="text-[#00b4d8] mt-0.5">•</span>
                <span>
                  <strong>Video:</strong> Interactive face-to-face virtual avatar
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00b4d8] mt-0.5">•</span>
                <span>
                  <strong>Voice:</strong> Spoken audio-only conversation with Ailana
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00b4d8] mt-0.5">•</span>
                <span>
                  <strong>Chat:</strong> Text-only conversation with Ailana
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00b4d8] mt-0.5">•</span>
                <span>
                  <strong>Officer:</strong> Direct transfer to a human Loan Officer
                </span>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

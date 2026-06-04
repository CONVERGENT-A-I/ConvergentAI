"use client";

import { useState } from "react";
import WhitepaperGateModal from "./whitepaper-gate-modal";

export default function FooterWhitepaperLink() {
  const [isGateOpen, setIsGateOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsGateOpen(true)}
        className="text-zinc-300 text-sm md:text-base font-medium hover:text-brand-teal transition-colors inline-flex items-center gap-1.5 cursor-pointer"
      >
        The Phygital Imperative
        <svg className="w-3.5 h-3.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V3" />
        </svg>
      </button>
      <WhitepaperGateModal isOpen={isGateOpen} onClose={() => setIsGateOpen(false)} />
    </>
  );
}

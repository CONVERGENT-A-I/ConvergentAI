'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  Phone,
  MessageCircle,
  Headset,
  SlidersHorizontal,
  X,
  Minus,
  Sparkles,
  Monitor,
  Smartphone,
} from 'lucide-react';
import { AffordabilityPanelNew, TransactionType, DataMode } from '@/components/affordability-panel-new';

export default function AffordabilitySandboxPage() {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [panelMode, setPanelMode] = useState<DataMode>('stated');
  const [transactionType, setTransactionType] = useState<TransactionType>('TT-PUR');
  const [cashOutIntent, setCashOutIntent] = useState<boolean>(false);
  const [pendingMode, setPendingMode] = useState<'video' | 'voice' | 'avatar-chat' | 'loan-officer'>('video');

  const [income, setIncome] = useState<number>(11667); // ~$140k/yr
  const [debts, setDebts] = useState<number>(800);

  const panelComponent = (
    <AffordabilityPanelNew
      key={`${transactionType}-${panelMode}-${income}-${debts}`}
      transactionType={transactionType}
      cashOutIntent={cashOutIntent}
      dataMode={panelMode}
      income={income}
      monthlyDebts={debts}
      initialAssumptions={{
        purchase: { price: 550000, downPct: 15, rate: 6.375, term: 30, insurance: 130, hoaFee: 0 },
        refiRT: { homeValue: 500000, payoff: 300000, rate: 6.125, term: 30, insurance: 120, hoaFee: 0, currentPayment: 2204 },
        refiCO: { homeValue: 500000, payoff: 300000, cashOut: 30000, rate: 6.375, term: 30, insurance: 120, hoaFee: 0, currentPayment: 2204 },
        heloc: { homeValue: 500000, firstBalance: 300000, lineAmount: 50000, drawRate: 8.5, insurance: 120, firstPI: 1895 },
      }}
      onRequestSoftPull={() => {
        setPanelMode('pulled');
        alert('Soft credit review authorized! Switching to Verified Mode with bureau-verified numbers.');
      }}
      onSubmitReview={() => {
        alert('Application submitted for formal underwriting review!');
      }}
    />
  );

  return (
    <div className="min-h-screen bg-[#050811] p-0 sm:p-4 md:p-6 flex items-center justify-center font-sans">
      {/* Mock Floating CTA Modal Container */}
      <motion.div 
        layout
        className={`relative w-[96vw] sm:w-[90vw] ${
          isPanelOpen ? 'max-w-7xl lg:max-w-[1800px]' : 'max-w-7xl'
        } h-[88dvh] sm:h-[94vh] min-h-0 sm:min-h-[550px] max-h-none sm:max-h-[980px] bg-[#0B0F19] rounded-2xl sm:rounded-3xl shadow-[0_8px_60px_rgba(0,180,216,0.25),0_0_0_1px_rgba(0,180,216,0.08)] flex flex-col overflow-hidden border border-white/20`}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      >
        
        {/* ── Top Header ── */}
        <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-2.5 md:py-4 relative z-50 shrink-0 bg-[#080c14]/95 backdrop-blur-md border-b border-white/15 gap-2">
          
          {/* Left: Logo */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 w-28 sm:w-36 md:w-44">
            <div className="relative h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-transparent">
              <Image
                src="/newassets/ConvergentAI_logo_package/ConvergentAI_app_icon_navy.svg"
                alt="ConvergentAI Logo"
                fill
                sizes="32px"
                className="object-contain"
              />
            </div>
            <span className="hidden lg:inline font-extrabold text-white text-xs sm:text-sm md:text-lg tracking-tight whitespace-nowrap">
              ConvergentAI
            </span>
          </div>

          {/* Center: Mode Switcher + Affordability Circle */}
          <div className="flex-1 flex items-center justify-center gap-2 sm:gap-3 min-w-0">
            {/* 4 Mode Switcher Pill */}
            <div className="flex items-center bg-white/5 rounded-full p-0.5 sm:p-1 border border-white/10 shadow-sm backdrop-blur-md">
              {[
                { m: "video" as const, icon: <Video className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />, label: "Video" },
                { m: "voice" as const, icon: <Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />, label: "Voice" },
                { m: "avatar-chat" as const, icon: <MessageCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />, label: "Chat" },
                {
                  m: "loan-officer" as const,
                  icon: <Headset className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />,
                  label: (
                    <>
                      <span className="hidden lg:inline">Loan Officer</span>
                      <span className="lg:hidden">Officer</span>
                    </>
                  ),
                },
              ].map(({ m, icon, label }) => (
                <button
                  key={m}
                  onClick={() => setPendingMode(m)}
                  className={`flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-[9px] sm:text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${
                    pendingMode === m
                      ? "bg-gradient-to-r from-[#00b4d8] to-[#023e8a] text-white shadow-md cursor-pointer"
                      : "text-gray-400 hover:bg-white/10 hover:text-white cursor-pointer"
                  }`}
                >
                  {icon}
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Separate Circular Affordability Toggle Button */}
            <button
              type="button"
              onClick={() => setIsPanelOpen(!isPanelOpen)}
              title={isPanelOpen ? "Close Affordability Summary" : "Open Affordability Summary"}
              className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full transition-all duration-300 shadow-sm shrink-0 ${
                isPanelOpen
                  ? "bg-gradient-to-r from-[#00b4d8] to-[#023e8a] text-white border border-[#00b4d8]/60 shadow-[0_0_15px_rgba(0,180,216,0.4)] scale-105 cursor-pointer"
                  : "bg-white/5 hover:bg-[#00b4d8]/20 text-[#00b4d8] border border-[#00b4d8]/40 hover:border-[#00b4d8] shadow-[0_0_10px_rgba(0,180,216,0.2)] cursor-pointer"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4.5 md:w-4.5 shrink-0" />
            </button>
          </div>

          {/* Right: Dynamic Badge + Close button */}
          <div className="flex items-center justify-end gap-2 shrink-0 w-28 sm:w-36 md:w-44">
            {/* Desktop indicator */}
            <span className="hidden lg:inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
              <Monitor className="w-3 h-3 text-[#00b4d8]" /> Split Screen
            </span>
            {/* Mobile/Tablet indicator */}
            <span className="inline-flex lg:hidden items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300">
              <Smartphone className="w-3 h-3 text-amber-400" /> Pop-up
            </span>
            <button className="p-1.5 sm:p-2 rounded-full bg-white/5 text-gray-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer shrink-0">
              <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>

        {/* ── Body Area ── */}
        <div className="flex-1 flex min-h-0 overflow-hidden relative bg-[#0b0f19]">
          
          {/* LEFT: Session Area with Sandbox Controls */}
          <motion.div
            layout
            className={`flex flex-col items-center justify-between p-4 sm:p-6 relative min-h-0 shrink-0 overflow-y-auto w-full ${
              isPanelOpen ? 'lg:w-[55%] xl:w-[60%]' : 'lg:w-full'
            } h-full`}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          >
            <div className="flex flex-col items-center justify-center flex-1 w-full text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00b4d8]/20 to-[#023e8a]/40 border border-[#00b4d8]/40 flex items-center justify-center mb-3 shadow-[0_0_30px_rgba(0,180,216,0.2)]">
                <Sparkles className="w-7 h-7 text-[#00b4d8]" />
              </div>
              <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">Ailana AI Mortgage Sandbox</h2>
              <p className="text-xs text-gray-400 max-w-md mt-1">
                Resize the browser width in DevTools: <strong>1024px or wider</strong> shows Split Screen, and <strong>under 1024px</strong> shows Pop-up Modal automatically.
              </p>

              {/* Sandbox Mode Controls */}
              <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-4 w-full max-w-lg text-left backdrop-blur-md">
                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#00b4d8]" /> Interactive Sandbox Controls
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-[11px] text-gray-300 font-medium block mb-1">Data Mode</label>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setPanelMode('stated')}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                          panelMode === 'stated'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                            : 'bg-white/5 text-gray-400 border-transparent hover:bg-white/10'
                        }`}
                      >
                        Stated Mode
                      </button>
                      <button
                        onClick={() => setPanelMode('pulled')}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                          panelMode === 'pulled'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                            : 'bg-white/5 text-gray-400 border-transparent hover:bg-white/10'
                        }`}
                      >
                        Verified Mode
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-gray-300 font-medium block mb-1">Transaction Intent</label>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => { setTransactionType('TT-PUR'); setCashOutIntent(false); }}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                          transactionType === 'TT-PUR'
                            ? 'bg-[#00b4d8]/20 text-[#00b4d8] border-[#00b4d8]/50 shadow-[0_0_10px_rgba(0,180,216,0.2)]'
                            : 'bg-white/5 text-gray-400 border-transparent hover:bg-white/10'
                        }`}
                      >
                        Purchase
                      </button>
                      <button
                        onClick={() => { setTransactionType('TT-REF'); setCashOutIntent(false); }}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                          transactionType === 'TT-REF'
                            ? 'bg-[#00b4d8]/20 text-[#00b4d8] border-[#00b4d8]/50 shadow-[0_0_10px_rgba(0,180,216,0.2)]'
                            : 'bg-white/5 text-gray-400 border-transparent hover:bg-white/10'
                        }`}
                      >
                        Refinance
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
                  <div>
                    <label className="text-[10.5px] text-gray-400 block mb-1">Monthly Gross Income ($)</label>
                    <input
                      type="number"
                      value={income}
                      onChange={(e) => setIncome(Number(e.target.value))}
                      className="w-full bg-[#080c14] text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-gray-700 focus:border-[#00b4d8] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10.5px] text-gray-400 block mb-1">Monthly Debts ($)</label>
                    <input
                      type="number"
                      value={debts}
                      onChange={(e) => setDebts(Number(e.target.value))}
                      className="w-full bg-[#080c14] text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-gray-700 focus:border-[#00b4d8] outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-4">
              <span>Panel is <strong>{isPanelOpen ? 'Open' : 'Closed'}</strong></span>
              <span>·</span>
              <button 
                onClick={() => setIsPanelOpen(!isPanelOpen)}
                className="text-[#00b4d8] hover:underline cursor-pointer font-medium"
              >
                {isPanelOpen ? 'Close Panel' : 'Open Panel'}
              </button>
            </div>
          </motion.div>

          {/* ── 1. DESKTOP SPLIT SCREEN PANEL (Only rendered & visible on lg: screens >= 1024px) ── */}
          <AnimatePresence>
            {isPanelOpen && (
              <motion.div
                key="affordability-split-screen"
                layout
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0, transition: { delay: 0.08, type: 'spring', stiffness: 280, damping: 26 } }}
                exit={{ opacity: 0, x: 60, transition: { type: 'spring', stiffness: 300, damping: 30 } }}
                className="hidden lg:flex w-[45%] xl:w-[40%] h-full flex-col shrink-0 border-l border-white/10 bg-[#080c14]/90 z-10"
              >
                {/* Panel Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-[#131b2e]/90 border-b border-gray-800/80 shrink-0">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-[#00b4d8]" />
                    <span className="text-xs font-bold text-white tracking-wide">
                      Affordability Summary
                    </span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      panelMode === 'stated'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      {panelMode === 'stated' ? 'Stated Mode' : 'Verified Mode'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setIsPanelOpen(false)}
                      title="Minimize"
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPanelOpen(false)}
                      title="Close"
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Panel Content (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                  {panelComponent}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* ── 2. MOBILE & TABLET POP-UP MODAL (Only visible on screens < 1024px) ── */}
        <AnimatePresence>
          {isPanelOpen && (
            <motion.div
              key="affordability-popup-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex lg:hidden fixed inset-0 z-[250] bg-black/80 backdrop-blur-md items-center justify-center p-3 sm:p-5"
            >
              <motion.div
                key="affordability-popup-modal"
                initial={{ scale: 0.94, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } }}
                exit={{ scale: 0.94, opacity: 0, y: 15, transition: { duration: 0.15 } }}
                className="w-full max-w-xl max-h-[90vh] bg-[#0B0F19] rounded-2xl border border-white/20 shadow-[0_10px_50px_rgba(0,180,216,0.35)] flex flex-col overflow-hidden"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-[#131b2e] border-b border-gray-800 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[#00b4d8]/10 border border-[#00b4d8]/30">
                      <SlidersHorizontal className="w-4 h-4 text-[#00b4d8]" />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-white tracking-wide block">
                        Affordability Summary
                      </span>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ml-1 ${
                      panelMode === 'stated'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      {panelMode === 'stated' ? 'Stated Mode' : 'Verified Mode'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsPanelOpen(false)}
                    title="Close Modal"
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 custom-scrollbar">
                  {panelComponent}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}

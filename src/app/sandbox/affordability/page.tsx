'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Phone, MessageCircle, Headset, SlidersHorizontal, X, Minus } from 'lucide-react';
import { AffordabilityPanel } from '@/components/affordability-panel';

export default function AffordabilitySandboxPage() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<'stated' | 'verified'>('stated');
  const [pendingMode, setPendingMode] = useState<'video' | 'voice' | 'avatar-chat' | 'loan-officer'>('video');

  // We mock a borrowerProfile for the panel logic
  const mockProfile = {
    target_price: 500000,
    down_payment: 100000,
    gross_annual_income: 140000,
    monthly_debt: 800,
    zip_code: "78209",
    borrower_name: "David",
    military_rural: "military"
  };

  // Same logic as AffordabilityModal
  const eligiblePrograms: ('conventional' | 'fha' | 'va' | 'usda')[] = ['conventional', 'fha'];
  if (mockProfile.military_rural === 'military' || mockProfile.military_rural === 'both') eligiblePrograms.push('va');
  if (mockProfile.military_rural === 'rural' || mockProfile.military_rural === 'both') eligiblePrograms.push('usda');
  const program = eligiblePrograms.includes('va') ? 'va' : 'conventional';

  return (
    <div className="min-h-screen bg-black/50 backdrop-blur-md p-0 sm:p-4 md:p-6 flex items-center justify-center font-sans">
      {/* Mock Floating CTA Modal Container */}
      <motion.div 
        layout
        className={`relative w-[96vw] sm:w-[90vw] ${isPanelOpen ? 'max-w-[1800px]' : 'max-w-7xl'} h-[85dvh] sm:h-[92vh] min-h-0 sm:min-h-[500px] max-h-none sm:max-h-[960px] bg-[#0B0F19] rounded-2xl sm:rounded-3xl shadow-[0_8px_60px_rgba(0,180,216,0.25),0_0_0_1px_rgba(0,180,216,0.08)] flex flex-col overflow-hidden border border-white/20`}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      >
        
        {/* ── Top Header (Copied exactly from FloatingCTA) ── */}
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

          {/* Right: Close button */}
          <div className="flex items-center justify-end shrink-0 w-28 sm:w-36 md:w-44">
            <button className="p-1.5 sm:p-2 rounded-full bg-white/5 text-gray-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer shrink-0">
              <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>

        {/* ── Body Area: Split View ── */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden relative bg-[#0b0f19]">
          
          {/* LEFT/TOP: Ailana Session Area */}
          <motion.div
            layout
            className={`flex flex-col items-center justify-center relative min-h-0 shrink-0 lg:order-1 order-1 ${
              isPanelOpen 
                ? 'w-full h-1/2 lg:w-[65%] xl:w-[70%] lg:h-full' 
                : 'w-full h-full'
            }`}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          >
            <div className="flex flex-col items-center justify-center w-full h-full relative">
              <p className="text-gray-600 font-mono text-sm opacity-50 whitespace-nowrap">Mock Ailana Session Area</p>
              
              <div className="flex gap-4 mt-8 absolute bottom-8">
                <button
                  onClick={() => {
                    setPanelMode('stated');
                    setIsPanelOpen(true);
                  }}
                  className="px-4 py-2 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-semibold hover:bg-amber-500/20 transition cursor-pointer"
                >
                  Test Stated Mode
                </button>
                <button
                  onClick={() => {
                    setPanelMode('verified');
                    setIsPanelOpen(true);
                  }}
                  className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold hover:bg-emerald-500/20 transition cursor-pointer"
                >
                  Test Verified Mode
                </button>
              </div>
            </div>
          </motion.div>

          {/* RIGHT/BOTTOM: Affordability Panel Slide-in */}
          <AnimatePresence>
            {isPanelOpen && (
              <motion.div
                key="affordability-panel-container"
                layout
                initial={{ opacity: 0, x: 50, y: 0 }}
                animate={{ opacity: 1, x: 0, y: 0, transition: { delay: 0.1, type: 'spring', stiffness: 280, damping: 26 } }}
                exit={{ opacity: 0, x: 50, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } }}
                className="w-full h-1/2 lg:w-[35%] xl:w-[30%] lg:h-full flex flex-col shrink-0 border-t lg:border-t-0 lg:border-l border-white/10 bg-[#080c14]/80 z-10 lg:order-2 order-2"
              >
                {/* Panel Header */}
                <div className="flex items-center justify-between px-5 py-3.5 bg-[#131b2e]/90 border-b border-gray-800/80 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <SlidersHorizontal className="w-4 h-4 text-[#00b4d8]" />
                    <span className="text-sm font-bold text-white tracking-wide">
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

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsPanelOpen(false)}
                      title="Minimize Modal"
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPanelOpen(false)}
                      title="Close Modal"
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Panel Content (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  <AffordabilityPanel
                    initialPurchasePrice={mockProfile.target_price}
                    initialDownPayment={mockProfile.down_payment}
                    grossAnnualIncome={mockProfile.gross_annual_income}
                    totalMonthlyDebt={mockProfile.monthly_debt}
                    programType={program}
                    zipCode={mockProfile.zip_code}
                    mode={panelMode}
                    eligiblePrograms={eligiblePrograms}
                    isSubmitted={false}
                    onUpgrade={() => {
                      alert('Upgrade to Verified Mode requested!');
                      setIsPanelOpen(false);
                    }}
                    onSubmitSuccess={(status) => {
                      alert(`Submit successful! Status: ${status}`);
                      setIsPanelOpen(false);
                    }}
                    borrowerName={mockProfile.borrower_name}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </motion.div>
    </div>
  );
}

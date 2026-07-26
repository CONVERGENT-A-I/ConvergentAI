'use client';

import React, { useState } from 'react';
import { Minus, Maximize2, X, SlidersHorizontal } from 'lucide-react';
import { AffordabilityPanel } from '../affordability-panel';

export interface AffordabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'stated' | 'verified';
  borrowerProfile?: any;
  onSubmitSuccess?: (status: 'approve_eligible' | 'refer') => void;
  onUpgrade?: () => void;
}

export function AffordabilityModal({
  isOpen,
  onClose,
  mode = 'verified',
  borrowerProfile,
  onSubmitSuccess,
  onUpgrade,
}: AffordabilityModalProps) {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  if (!isOpen) return null;

  const targetPrice = borrowerProfile?.target_price ?? 350000;
  const downPayment = borrowerProfile?.down_payment ?? 70000;
  const income = borrowerProfile?.gross_annual_income ?? 120000;
  const debt = borrowerProfile?.monthly_debt ?? 500;
  const program = borrowerProfile?.military_rural === 'military' ? 'va' : 'conventional';

  if (isMinimized) {
    return (
      <div className="fixed bottom-24 right-6 z-50 animate-bounce-subtle">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0b0f19]/95 border border-[#00b4d8]/50 rounded-full shadow-[0_0_20px_rgba(0,180,216,0.3)] text-white text-xs font-semibold hover:bg-[#131b2e] transition duration-200"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#00b4d8]" />
          <span>Affordability Summary</span>
          <span className="text-[10px] bg-[#00b4d8]/20 text-[#00b4d8] px-2 py-0.5 rounded-full font-bold uppercase">
            {mode === 'stated' ? 'Stated' : 'Verified'}
          </span>
          <Maximize2 className="w-3.5 h-3.5 text-gray-400 ml-1" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0b0f19]/95 border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(0,180,216,0.25)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#131b2e]/80 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#00b4d8]" />
            <span className="text-sm font-semibold text-white tracking-wide">
              Affordability Scenario Explorer
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              title="Minimize Modal"
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Close Modal"
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto">
          <AffordabilityPanel
            initialPurchasePrice={targetPrice}
            initialDownPayment={downPayment}
            grossAnnualIncome={income}
            totalMonthlyDebt={debt}
            programType={program}
            mode={mode}
            onUpgrade={onUpgrade}
            onSubmitSuccess={onSubmitSuccess}
          />
        </div>
      </div>
    </div>
  );
}

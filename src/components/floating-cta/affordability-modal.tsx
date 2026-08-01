'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, X, SlidersHorizontal } from 'lucide-react';
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
  if (!isOpen) return null;

  const targetPrice = borrowerProfile?.target_price ?? borrowerProfile?.targetPrice ?? 350000;
  const downPayment = borrowerProfile?.down_payment ?? borrowerProfile?.downPayment ?? 70000;
  const income = borrowerProfile?.gross_annual_income ?? borrowerProfile?.grossAnnualIncome ?? 120000;
  const debt = borrowerProfile?.monthly_debt ?? borrowerProfile?.totalMonthlyDebt ?? 500;
  const zipCode = borrowerProfile?.zip_code ?? borrowerProfile?.zipCode;
  
  const eligiblePrograms: ('conventional' | 'fha' | 'va' | 'usda')[] = ['conventional', 'fha'];
  const mr = borrowerProfile?.military_rural;
  if (mr === 'military' || mr === 'both') eligiblePrograms.push('va');
  if (mr === 'rural' || mr === 'both') eligiblePrograms.push('usda');
  
  // Default to VA if eligible, else conventional
  const program = eligiblePrograms.includes('va') ? 'va' : 'conventional';
  const borrowerName = borrowerProfile?.borrower_name ?? borrowerProfile?.borrowerName;

  return (
    <AnimatePresence>
      <motion.div
        key="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          key="modal-window"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="relative w-full max-w-lg bg-[#0b0f19]/95 border border-[#00b4d8]/40 rounded-2xl shadow-[0_0_60px_rgba(0,180,216,0.3)] overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-[#131b2e]/90 border-b border-gray-800/80">
            <div className="flex items-center gap-2.5">
              <SlidersHorizontal className="w-4 h-4 text-[#00b4d8]" />
              <span className="text-sm font-bold text-white tracking-wide">
                Affordability Summary
              </span>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                mode === 'stated'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {mode === 'stated' ? 'Stated Mode' : 'Verified Mode'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onClose}
                title="Minimize Modal"
                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                title="Close Modal"
                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
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
              zipCode={zipCode}
              mode={mode}
              onUpgrade={onUpgrade}
              onSubmitSuccess={onSubmitSuccess}
              borrowerName={borrowerName}
              eligiblePrograms={eligiblePrograms}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}


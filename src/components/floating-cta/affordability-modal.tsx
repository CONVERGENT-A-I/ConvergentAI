'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, X, SlidersHorizontal } from 'lucide-react';
import {
  AffordabilityPanelNew,
  type DataMode as AffordabilityDataMode,
  type TransactionType,
} from '../affordability-panel-new';

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
  const annualIncome = borrowerProfile?.gross_annual_income ?? borrowerProfile?.grossAnnualIncome ?? 120000;
  const monthlyIncome = Math.round(annualIncome / 12);
  const debt = borrowerProfile?.monthly_debt ?? borrowerProfile?.totalMonthlyDebt ?? 500;
  const downPct = targetPrice > 0 ? Math.round((downPayment / targetPrice) * 100 * 10) / 10 : 20;

  const eligiblePrograms: ('conventional' | 'fha' | 'va' | 'usda')[] = ['conventional', 'fha'];
  const mr = borrowerProfile?.military_rural ?? borrowerProfile?.militaryRural;
  if (mr === 'military' || mr === 'both') eligiblePrograms.push('va');
  if (mr === 'rural' || mr === 'both') eligiblePrograms.push('usda');

  const dataMode: AffordabilityDataMode =
    mode === 'verified' ? 'pulled' : 'stated';

  const rawModeLabel = mode === 'stated' ? 'Stated' : 'Verified';
  const isSubmitted = !!(
    borrowerProfile?.affordability_submitted ||
    borrowerProfile?.affordability_aus_status ||
    borrowerProfile?.aus_status ||
    borrowerProfile?.ausStatus ||
    borrowerProfile?.stage === '3B' ||
    borrowerProfile?.stage === '4'
  );

  // ── Phase 3: Dynamic transaction type derivation ──
  const transactionType: TransactionType =
    borrowerProfile?.transaction_type ||
    (borrowerProfile?.mortgage_goal === 'refinance' ? 'TT-REF' :
     borrowerProfile?.mortgage_goal === 'equity' || borrowerProfile?.mortgage_goal === 'heloc' ? 'TT-HEL' :
     'TT-PUR');
  const cashOutIntent = borrowerProfile?.refinance_type === 'cash_out';

  // ── Phase 3: Build mode-appropriate initial assumptions ──
  const initialAssumptions = (() => {
    if (transactionType === 'TT-REF') {
      const homeValue = borrowerProfile?.property_value ?? 500000;
      const payoff = borrowerProfile?.first_mortgage_balance ?? 300000;
      const currentPayment = borrowerProfile?.current_mortgage_payment ?? 2204;
      const rate = borrowerProfile?.current_mortgage_rate ?? 6.125;
      const termYears = borrowerProfile?.remaining_term_years ?? 30;
      if (cashOutIntent) {
        return {
          refiCO: {
            homeValue,
            payoff,
            cashOut: borrowerProfile?.cash_out_amount ?? 30000,
            rate,
            term: termYears,
            currentPayment,
          },
        };
      }
      return {
        refiRT: {
          homeValue,
          payoff,
          rate,
          term: termYears,
          currentPayment,
        },
      };
    }
    if (transactionType === 'TT-HEL') {
      return {
        heloc: {
          homeValue: borrowerProfile?.property_value ?? 500000,
          firstBalance: borrowerProfile?.first_mortgage_balance ?? 300000,
          lineAmount: borrowerProfile?.heloc_line_amount ?? 50000,
          drawRate: 8.5,
        },
      };
    }
    // Default: Purchase
    return {
      purchase: {
        price: targetPrice,
        downPct: downPct,
      },
    };
  })();

  // ── Phase 3: Track-specific header label ──
  const headerLabel =
    transactionType === 'TT-REF'
      ? (cashOutIntent ? 'Cash-Out Refinance Summary' : 'Refinance Summary')
      : transactionType === 'TT-HEL'
        ? 'HELOC Summary'
        : 'Affordability Summary';

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
          <div className="flex items-center justify-between px-5 py-3.5 bg-[#131b2e]/90 border-b border-gray-800/80 shrink-0">
            <div className="flex items-center gap-2.5">
              <SlidersHorizontal className="w-4 h-4 text-[#00b4d8]" />
              <span className="text-sm font-bold text-white tracking-wide">
                {headerLabel}
              </span>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                mode === 'stated'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {rawModeLabel}
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
          <div className="flex-1 overflow-y-auto">
            <AffordabilityPanelNew
              transactionType={transactionType}
              cashOutIntent={cashOutIntent}
              dataMode={dataMode}
              income={monthlyIncome}
              monthlyDebts={debt}
              statedDownPaymentDollars={downPayment}
              lockedMode={true}
              eligiblePrograms={eligiblePrograms}
              isSubmitted={isSubmitted}
              initialAssumptions={initialAssumptions}
              onRequestSoftPull={onUpgrade}
              onSubmitReview={() => onSubmitSuccess?.('approve_eligible')}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2 } from 'lucide-react';

export interface AffordabilityPanelProps {
  initialPurchasePrice?: number;
  initialDownPayment?: number;
  grossAnnualIncome?: number;
  totalMonthlyDebt?: number;
  programType?: 'conventional' | 'fha' | 'va' | 'usda';
  zipCode?: string;
  mode?: 'stated' | 'verified';
  onUpgrade?: () => void;
  onSubmitSuccess?: (status: 'approve_eligible' | 'refer') => void;
  borrowerName?: string;
  eligiblePrograms?: ('conventional' | 'fha' | 'va' | 'usda')[];
  isSubmitted?: boolean;
  className?: string;
}

export function AffordabilityPanel({
  initialPurchasePrice = 500000,
  initialDownPayment = 100000,
  grossAnnualIncome = 120000,
  totalMonthlyDebt = 500,
  programType = 'conventional',
  zipCode,
  mode = 'verified',
  onUpgrade,
  onSubmitSuccess,
  borrowerName,
  eligiblePrograms = ['conventional', 'fha', 'va', 'usda'],
  isSubmitted = false,
  className = '',
}: AffordabilityPanelProps) {
  const [purchasePrice, setPurchasePrice] = useState<number>(initialPurchasePrice);
  const [downPayment, setDownPayment] = useState<number>(initialDownPayment);
  const [activeProgram, setActiveProgram] = useState<'conventional' | 'fha' | 'va' | 'usda'>(programType);
  const [hasSubmittedLocally, setHasSubmittedLocally] = useState<boolean>(false);
  const userEdited = useRef(false);

  // Sync state if initial props change (e.g. profile loaded from backend)
  // ONLY if the user hasn't manually edited the sliders yet.
  useEffect(() => {
    if (initialPurchasePrice && !userEdited.current) {
      setPurchasePrice(initialPurchasePrice);
    }
  }, [initialPurchasePrice]);

  useEffect(() => {
    if (initialDownPayment && !userEdited.current) {
      setDownPayment(initialDownPayment);
    }
  }, [initialDownPayment]);

  const [totalPITIA, setTotalPITIA] = useState<number>(0);
  const [monthlyMI, setMonthlyMI] = useState<number>(0);
  const [frontEndDti, setFrontEndDti] = useState<number>(0);
  const [backEndDti, setBackEndDti] = useState<number>(0);
  const [fundingFeeAmount, setFundingFeeAmount] = useState<number>(0);
  const [incomeBand, setIncomeBand] = useState<'within' | 'above'>('within');
  const [dtiBand, setDtiBand] = useState<'within' | 'above'>('within');
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Recalculate numbers via API
  const fetchCalculation = useCallback(
    async (price: number, down: number) => {
      setIsCalculating(true);
      try {
        const res = await fetch('/api/affordability/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            purchasePrice: price,
            downPayment: down,
            grossAnnualIncome,
            totalMonthlyDebt,
            programType: activeProgram,
            zipCode,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setTotalPITIA(data.totalPITIA);
          setMonthlyMI(data.monthlyMI);
          setIncomeBand(data.incomeBand);
          setDtiBand(data.dtiBand);
          if (data.frontEndDti !== undefined) setFrontEndDti(data.frontEndDti);
          if (data.backEndDti !== undefined) setBackEndDti(data.backEndDti);
          if (data.fundingFeeAmount !== undefined) setFundingFeeAmount(data.fundingFeeAmount);
        }
      } catch (err) {
        console.error('[AffordabilityPanel] Calculation failed:', err);
      } finally {
        setIsCalculating(false);
      }
    },
    [grossAnnualIncome, totalMonthlyDebt, activeProgram, zipCode]
  );

  // Debounced recalculation on slider changes or program change
  useEffect(() => {
    fetchCalculation(purchasePrice, downPayment);
  }, [purchasePrice, downPayment, zipCode, activeProgram, fetchCalculation]);

  const handlePurchasePriceChange = (val: number) => {
    userEdited.current = true;
    const validPrice = Math.max(0, val);
    setPurchasePrice(validPrice);
  };

  const handleDownPaymentChange = (val: number) => {
    userEdited.current = true;
    const validDown = Math.max(0, val);
    setDownPayment(validDown);
  };

  const handleSubmit = async () => {
    if (mode === 'stated' && onUpgrade) {
      onUpgrade();
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/affordability/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            gross_annual_income: grossAnnualIncome,
            monthly_debt: totalMonthlyDebt,
            affordability_mode: mode,
          },
          sliderValues: { purchasePrice, downPayment },
          programType: activeProgram,
          mode,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setHasSubmittedLocally(true);
        if (onSubmitSuccess) {
          onSubmitSuccess(data.ausStatus);
        }
      }
    } catch (err) {
      console.error('[AffordabilityPanel] Submit failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const estimatedClosingCosts = Math.round(purchasePrice * 0.02);
  const estimatedCashToClose = downPayment + estimatedClosingCosts;

  const miDisplay =
    activeProgram === 'va'
      ? fundingFeeAmount > 0 
        ? `$0/mo — $${fundingFeeAmount.toLocaleString()} VA Funding Fee (one-time)`
        : '$0/mo — one-time funding fee applies at closing'
      : `$${monthlyMI.toLocaleString()}/mo`;

  const submitDisabled = isSubmitted || hasSubmittedLocally || isSubmitting;

  return (
    <div className={`flex flex-col bg-[#0b0f19] border border-gray-800 rounded-xl p-3 text-white shadow-2xl ${className}`}>
      {/* Permanent Disclosure Banner */}
      <div className="bg-[#131b2e] border border-[#1e293b] rounded-lg px-3 py-1.5 text-center text-[10px] leading-tight text-gray-400 font-medium mb-3">
        {mode === 'stated'
          ? 'This is an educational estimate based on the estimates you shared, not a loan decision.'
          : 'This is an educational estimate, not a loan decision or offer of credit.'}
      </div>

      {/* Program Tabs & Profile */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] text-gray-400 font-medium">
          Sample profile{borrowerName ? ` - ${borrowerName}` : ''}
        </div>
        <div className="flex gap-1.5">
          {eligiblePrograms.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setActiveProgram(type)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider border transition-colors cursor-pointer ${
                activeProgram === type
                  ? 'bg-[#00b4d8]/10 text-[#00b4d8] border-[#00b4d8]/30'
                  : 'bg-gray-800/30 text-gray-500 border-transparent hover:bg-gray-800/60 hover:text-gray-300'
              }`}
            >
              {type === 'conventional' ? 'CONV' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Input Metric Cards */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-[#111827] p-2.5 rounded-xl border border-gray-800">
          <span className="block text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
            GROSS MONTHLY INCOME
          </span>
          <span className="text-base font-bold text-gray-200">
            ${Math.round(grossAnnualIncome / 12).toLocaleString()}
          </span>
        </div>
        <div className="bg-[#111827] p-2.5 rounded-xl border border-gray-800">
          <span className="block text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
            MONTHLY DEBTS (EST.)
          </span>
          <span className="text-base font-bold text-gray-200">
            ${totalMonthlyDebt.toLocaleString()}
          </span>
        </div>
        <div className="bg-[#111827] p-2.5 rounded-xl border border-gray-800">
          <span className="block text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
            AVAILABLE FUNDS (STATED)
          </span>
          <span className="text-base font-bold text-emerald-400">
            ${downPayment.toLocaleString()}
          </span>
        </div>
        <div className="bg-[#111827] p-2.5 rounded-xl border border-gray-800">
          <span className="block text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
            HOUSING & TOTAL DTI
          </span>
          <span className="text-xs font-bold text-sky-400 flex items-center gap-1 mt-0.5">
            <span>Housing: {frontEndDti}%</span>
            <span className="text-gray-500">|</span>
            <span>Total: {backEndDti}%</span>
          </span>
        </div>
      </div>

      {/* Status Bands */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center justify-between bg-[#111827] px-3 py-1.5 rounded-lg border border-gray-800">
          <span className="text-xs text-gray-300 font-medium">INCOME</span>
          <span
            className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${
              incomeBand === 'within'
                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700/50'
                : 'bg-amber-950/80 text-amber-400 border-amber-700/50'
            }`}
          >
            {incomeBand === 'within' ? 'within typical range' : 'above typical range'}
          </span>
        </div>

        <div className="flex items-center justify-between bg-[#111827] px-3 py-1.5 rounded-lg border border-gray-800">
          <span className="text-xs text-gray-300 font-medium">
            {mode === 'stated' ? 'Monthly Debts (your estimate)' : 'DTI (Debt-to-Income)'}
          </span>
          <span
            className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${
              dtiBand === 'within'
                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700/50'
                : 'bg-amber-950/80 text-amber-400 border-amber-700/50'
            }`}
          >
            {dtiBand === 'within' ? 'within typical range' : 'above typical range'}
          </span>
        </div>
      </div>

      {/* Payment & Cash-to-Close Metrics */}
      <div className="grid grid-cols-2 gap-2 mb-4 bg-[#0f172a] p-3 rounded-xl border border-slate-800">
        <div>
          <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
            ESTIMATED PAYMENT
          </span>
          <span className="text-xl font-bold text-[#00b4d8]">
            ${totalPITIA.toLocaleString()}
            <span className="text-[10px] font-normal text-gray-400">/mo</span>
          </span>
        </div>

        <div>
          <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
            MORTGAGE INSURANCE
          </span>
          <span className="text-xs font-medium text-gray-300">{miDisplay}</span>
        </div>

        <div className="col-span-2 pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-[11px] font-medium text-gray-400">ESTIMATED CASH-TO-CLOSE</span>
          <span className="text-xs font-bold text-emerald-400">
            ${estimatedCashToClose.toLocaleString()}
            <span className="text-[9px] font-normal text-gray-500 ml-1">(Down payment + ~2% closing fees)</span>
          </span>
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-4 mb-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-medium text-gray-300">Target Purchase Price</label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[11px]">$</span>
              <input
                type="number"
                inputMode="numeric"
                value={purchasePrice}
                onChange={(e) => handlePurchasePriceChange(Number(e.target.value))}
                className="w-28 bg-[#1e293b] text-white text-[11px] font-semibold pl-5 pr-2 py-1 rounded border border-gray-700 focus:outline-none focus:border-[#00b4d8]"
              />
            </div>
          </div>
          <input
            type="range"
            min={100000}
            max={2000000}
            step={5000}
            value={purchasePrice}
            onChange={(e) => handlePurchasePriceChange(Number(e.target.value))}
            className="w-full accent-[#00b4d8] cursor-pointer h-1.5 bg-gray-800 rounded-lg"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-medium text-gray-300">Down Payment</label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[11px]">$</span>
              <input
                type="number"
                inputMode="numeric"
                value={downPayment}
                onChange={(e) => handleDownPaymentChange(Number(e.target.value))}
                className="w-28 bg-[#1e293b] text-white text-[11px] font-semibold pl-5 pr-2 py-1 rounded border border-gray-700 focus:outline-none focus:border-[#00b4d8]"
              />
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={1000000}
            step={1000}
            value={downPayment}
            onChange={(e) => handleDownPaymentChange(Number(e.target.value))}
            className="w-full accent-[#00b4d8] cursor-pointer h-1.5 bg-gray-800 rounded-lg"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        {mode === 'stated' && onUpgrade ? (
          <button
            type="button"
            onClick={onUpgrade}
            className="w-full py-2.5 bg-[#00b4d8] hover:bg-[#0096c7] text-black font-semibold text-sm rounded-lg transition duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#00b4d8]/20 active:scale-[0.99]"
          >
            Upgrade to Verified Mode
          </button>
        ) : (
          <button
            id="affordability-submit-btn"
            onClick={handleSubmit}
            disabled={submitDisabled}
            className={`w-full py-2.5 font-semibold text-sm rounded-lg transition duration-200 flex items-center justify-center gap-2 shadow-lg ${
              submitDisabled
                ? 'bg-gray-700 text-gray-400 border border-gray-600 cursor-not-allowed shadow-none'
                : 'bg-[#00b4d8] hover:bg-[#0096c7] text-black cursor-pointer shadow-[#00b4d8]/20 active:scale-[0.99]'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Reviewing...</span>
              </>
            ) : submitDisabled ? (
              <span>Review Submitted ✓</span>
            ) : (
              <span>Submit for review</span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

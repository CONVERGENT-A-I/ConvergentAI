'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

export interface AffordabilityPanelProps {
  initialPurchasePrice?: number;
  initialDownPayment?: number;
  grossAnnualIncome?: number;
  totalMonthlyDebt?: number;
  programType?: 'conventional' | 'fha' | 'va' | 'usda';
  onSubmitSuccess?: (status: 'approve_eligible' | 'refer') => void;
  className?: string;
}

export function AffordabilityPanel({
  initialPurchasePrice = 500000,
  initialDownPayment = 100000,
  grossAnnualIncome = 120000,
  totalMonthlyDebt = 500,
  programType = 'conventional',
  onSubmitSuccess,
  className = '',
}: AffordabilityPanelProps) {
  const [purchasePrice, setPurchasePrice] = useState<number>(initialPurchasePrice);
  const [downPayment, setDownPayment] = useState<number>(initialDownPayment);

  const [totalPITIA, setTotalPITIA] = useState<number>(0);
  const [monthlyMI, setMonthlyMI] = useState<number>(0);
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
            programType,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setTotalPITIA(data.totalPITIA);
          setMonthlyMI(data.monthlyMI);
          setIncomeBand(data.incomeBand);
          setDtiBand(data.dtiBand);
        }
      } catch (err) {
        console.error('[AffordabilityPanel] Calculation failed:', err);
      } finally {
        setIsCalculating(false);
      }
    },
    [grossAnnualIncome, totalMonthlyDebt, programType]
  );

  // Debounced recalculation on slider changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCalculation(purchasePrice, downPayment);
    }, 200);
    return () => clearTimeout(timer);
  }, [purchasePrice, downPayment, fetchCalculation]);

  const handlePurchasePriceChange = (val: number) => {
    setPurchasePrice(val);
    if (downPayment > val) {
      setDownPayment(val);
    }
  };

  const handleDownPaymentChange = (val: number) => {
    setDownPayment(Math.min(val, purchasePrice));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/affordability/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            gross_annual_income: grossAnnualIncome,
            monthly_debt: totalMonthlyDebt,
          },
          sliderValues: { purchasePrice, downPayment },
        }),
      });

      if (res.ok) {
        const data = await res.json();
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

  const miDisplay =
    programType === 'va'
      ? '$0/mo — one-time funding fee applies at closing'
      : `$${monthlyMI.toLocaleString()}/mo`;

  return (
    <div className={`flex flex-col bg-[#0b0f19] border border-gray-800 rounded-xl p-5 text-white shadow-2xl ${className}`}>
      {/* Permanent Disclosure Banner */}
      <div className="bg-[#131b2e] border border-[#1e293b] rounded-lg px-3 py-2 text-center text-xs text-gray-400 font-medium mb-4">
        This is an educational estimate, not a loan decision or offer of credit.
      </div>

      <h2 className="text-base font-semibold text-gray-200 uppercase tracking-wider mb-3">
        Your Affordability Summary
      </h2>

      {/* Status Bands */}
      <div className="space-y-2.5 mb-5">
        <div className="flex items-center justify-between bg-[#111827] px-4 py-2.5 rounded-lg border border-gray-800">
          <span className="text-sm text-gray-300 font-medium">INCOME</span>
          <span
            className={`text-xs px-3 py-1 rounded-full font-semibold border ${
              incomeBand === 'within'
                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700/50'
                : 'bg-amber-950/80 text-amber-400 border-amber-700/50'
            }`}
          >
            {incomeBand === 'within' ? 'within typical range' : 'above typical range'}
          </span>
        </div>

        <div className="flex items-center justify-between bg-[#111827] px-4 py-2.5 rounded-lg border border-gray-800">
          <span className="text-sm text-gray-300 font-medium">DTI (Debt-to-Income)</span>
          <span
            className={`text-xs px-3 py-1 rounded-full font-semibold border ${
              dtiBand === 'within'
                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700/50'
                : 'bg-amber-950/80 text-amber-400 border-amber-700/50'
            }`}
          >
            {dtiBand === 'within' ? 'within typical range' : 'above typical range'}
          </span>
        </div>
      </div>

      {/* Payment Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-6 bg-[#0f172a] p-4 rounded-xl border border-slate-800">
        <div>
          <span className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
            ESTIMATED PAYMENT
          </span>
          <span className="text-2xl font-bold text-[#00b4d8]">
            ${totalPITIA.toLocaleString()}
            <span className="text-xs font-normal text-gray-400">/mo</span>
          </span>
        </div>

        <div>
          <span className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
            MORTGAGE INSURANCE
          </span>
          <span className="text-sm font-medium text-gray-300">{miDisplay}</span>
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-5 mb-6">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-gray-300">Target Purchase Price</label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
              <input
                type="number"
                inputMode="numeric"
                value={purchasePrice}
                onChange={(e) => handlePurchasePriceChange(Number(e.target.value))}
                className="w-32 bg-[#1e293b] text-white text-xs font-semibold pl-6 pr-2 py-1 rounded border border-gray-700 focus:outline-none focus:border-[#00b4d8]"
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
            <label className="text-xs font-medium text-gray-300">Down Payment</label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
              <input
                type="number"
                inputMode="numeric"
                value={downPayment}
                onChange={(e) => handleDownPaymentChange(Number(e.target.value))}
                className="w-32 bg-[#1e293b] text-white text-xs font-semibold pl-6 pr-2 py-1 rounded border border-gray-700 focus:outline-none focus:border-[#00b4d8]"
              />
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={purchasePrice}
            step={1000}
            value={downPayment}
            onChange={(e) => handleDownPaymentChange(Number(e.target.value))}
            className="w-full accent-[#00b4d8] cursor-pointer h-1.5 bg-gray-800 rounded-lg"
          />
        </div>
      </div>

      {/* Submit Button — NEVER DISABLED (Regulation B Non-Discouragement) */}
      <button
        id="affordability-submit-btn"
        onClick={handleSubmit}
        disabled={false}
        className="w-full py-3 bg-[#00b4d8] hover:bg-[#0096c7] text-black font-semibold text-sm rounded-lg transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#00b4d8]/20 active:scale-[0.99]"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-black" />
            <span>Reviewing...</span>
          </>
        ) : (
          <span>Submit for review</span>
        )}
      </button>
    </div>
  );
}

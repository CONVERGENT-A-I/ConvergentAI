"use client";

import React, { useMemo, useState, useCallback } from "react";

/* ─────────────────────────────────────────────
   DESIGN TOKENS — Dark glass theme (matching v1)
   Teal #00B4D8, Deep Navy #0B0F19, Amber
   ───────────────────────────────────────────── */
const C = {
  bg: "transparent",
  cardBg: "rgba(255,255,255,0.04)",
  cardBorder: "rgba(255,255,255,0.10)",
  navy: "#F8FAFC",
  navySoft: "#CBD5E1",
  navyMuted: "#94A3B8",
  teal: "#00B4D8",
  tealDark: "#00B4D8",
  tealBg: "rgba(0,180,216,0.12)",
  tealBorder: "rgba(0,180,216,0.30)",
  blue: "#00B4D8",
  blueBg: "rgba(0,180,216,0.08)",
  periwinkle: "#8C95F1",
  periwinkleBorder: "rgba(0,180,216,0.25)",
  amber: "#F59E0B",
  amberBg: "rgba(245,158,11,0.12)",
  amberBorder: "rgba(245,158,11,0.30)",
  textPrimary: "#F8FAFC",
  textSecondary: "#CBD5E1",
  textMuted: "#94A3B8",
  textLight: "#64748B",
  sliderTrack: "rgba(255,255,255,0.10)",
  sliderFill: "#00B4D8",
} as const;

/* ─────────────────────────────────────────────
   TYPES
   ───────────────────────────────────────────── */
export type TransactionType = "TT-PUR" | "TT-REF" | "TT-HEL";
export type DataMode = "stated" | "pulled";
export type ProgramId = "conventional" | "fha" | "va" | "usda";

export interface AffordabilityPanelV2Props {
  transactionType?: TransactionType;
  cashOutIntent?: boolean;
  dataMode?: DataMode;
  income?: number;
  monthlyDebts?: number;
  eligiblePrograms?: ProgramId[];
  initialAssumptions?: {
    purchase?: { price?: number; downPct?: number; rate?: number; term?: number; insurance?: number; hoaFee?: number };
    refiRT?: { homeValue?: number; payoff?: number; rate?: number; term?: number; insurance?: number; hoaFee?: number; currentPayment?: number };
    refiCO?: { homeValue?: number; payoff?: number; cashOut?: number; rate?: number; term?: number; insurance?: number; hoaFee?: number; currentPayment?: number };
    heloc?: { homeValue?: number; firstBalance?: number; lineAmount?: number; drawRate?: number; insurance?: number; firstPI?: number };
  };
  onRequestSoftPull?: () => void;
  onEditData?: () => void;
  ailanaLine?: string;
  showAilanaLine?: boolean;
}

/* ─────────────────────────────────────────────
   PROGRAM DEFINITIONS
   ───────────────────────────────────────────── */
interface ProgramDef {
  label: string;
  description: string;
  minDownPct: number;
  upfrontFeePct: number;
  monthlyMi: (loanAmt: number, ltv: number) => number;
  guideline: number;
}

function annualPmiRate(ltv: number): number {
  if (ltv <= 0.80) return 0;
  if (ltv <= 0.85) return 0.0030;
  if (ltv <= 0.90) return 0.0051;
  if (ltv <= 0.95) return 0.0070;
  return 0.0090;
}

const PROGRAMS: Record<ProgramId, ProgramDef> = {
  conventional: {
    label: "Conventional",
    description: "From 3% down. Mortgage insurance ends once you reach 20% equity.",
    minDownPct: 3,
    upfrontFeePct: 0,
    monthlyMi: (loan, ltv) => (loan * annualPmiRate(ltv)) / 12,
    guideline: 43,
  },
  fha: {
    label: "FHA",
    description: "From 3.5% down. Mortgage insurance for the life of the loan.",
    minDownPct: 3.5,
    upfrontFeePct: 1.75,
    monthlyMi: (loan) => (loan * 0.0055) / 12,
    guideline: 43,
  },
  va: {
    label: "VA",
    description: "No down payment required. One-time funding fee; no monthly mortgage insurance.",
    minDownPct: 0,
    upfrontFeePct: 2.15,
    monthlyMi: () => 0,
    guideline: 41,
  },
  usda: {
    label: "USDA",
    description: "No down payment required in eligible rural areas. Annual fee plus an upfront guarantee fee.",
    minDownPct: 0,
    upfrontFeePct: 1,
    monthlyMi: (loan) => (loan * 0.0035) / 12,
    guideline: 41,
  },
};

/* ─────────────────────────────────────────────
   MATH UTILITIES
   ───────────────────────────────────────────── */
function calcMonthlyPI(principal: number, annualRatePct: number, termYears: number): number {
  const r = annualRatePct / 100 / 12;
  const n = termYears * 12;
  if (r === 0 || principal <= 0) return principal > 0 ? principal / n : 0;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function fmt(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

function roundTo500(n: number): number {
  return Math.round(n / 500) * 500;
}

/* ─────────────────────────────────────────────
   SLIDER COMPONENT
   ───────────────────────────────────────────── */
function Slider({
  label,
  value,
  min,
  max,
  step,
  displayValue,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  displayValue: string;
  onChange: (v: number) => void;
}) {
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  return (
    <div className="mb-2">
      <div className="flex justify-between items-baseline mb-1">
        <span style={{ color: C.navySoft, fontSize: 12 }}>{label}</span>
        <span style={{ color: C.navy, fontSize: 12, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
          {displayValue}
        </span>
      </div>
      <div className="w-full flex items-center" style={{ height: 20 }}>
        <input
          type="range"
          aria-label={label}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="afford-v2-slider"
          style={{
            width: "100%",
            height: 5,
            appearance: "none",
            WebkitAppearance: "none",
            background: `linear-gradient(to right, ${C.blue} 0%, ${C.blue} ${pct}%, ${C.sliderTrack} ${pct}%, ${C.sliderTrack} 100%)`,
            borderRadius: 3,
            outline: "none",
            cursor: "pointer",
          }}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   GUIDELINE BAR COMPONENT
   ───────────────────────────────────────────── */
function GuidelineBar({ value, guideline }: { value: number; guideline: number }) {
  const maxPct = 60;
  const markerPos = Math.min(100, Math.max(0, (value / maxPct) * 100));
  const guidelinePos = Math.min(100, Math.max(0, (guideline / maxPct) * 100));
  const isOver = value > guideline;
  const fillColor = isOver ? C.amber : C.teal;

  return (
    <div className="relative w-full mt-2" style={{ height: 18 }} role="img" aria-label={`Comparison bar: ${Math.round(value)}% of income, guideline at ${guideline}%`}>
      {/* Track */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-full rounded-full"
        style={{ height: 5, background: C.sliderTrack }}
      />
      {/* Fill */}
      <div
        className="absolute top-1/2 -translate-y-1/2 rounded-full transition-all duration-300"
        style={{ height: 5, width: `${markerPos}%`, background: fillColor, left: 0 }}
      />
      {/* Guideline tick */}
      <div
        className="absolute top-0 transition-all duration-300"
        style={{ left: `${guidelinePos}%`, width: 2, height: 18, background: "rgba(255,255,255,0.5)", borderRadius: 1, transform: "translateX(-1px)" }}
      />
      {/* Marker dot */}
      <div
        className="absolute top-1/2 -translate-y-1/2 transition-all duration-300"
        style={{
          left: `${markerPos}%`,
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: fillColor,
          border: `2px solid rgba(255,255,255,0.2)`,
          boxShadow: `0 0 8px ${fillColor}60`,
          transform: "translate(-50%, -50%)",
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────── */
export function AffordabilityPanelV2({
  transactionType = "TT-PUR",
  dataMode = "stated",
  income = 11667,
  monthlyDebts = 800,
  eligiblePrograms = ["conventional", "fha"],
  initialAssumptions,
  onRequestSoftPull,
  onEditData,
  ailanaLine,
  showAilanaLine = true,
}: AffordabilityPanelV2Props) {
  // Only Purchase is implemented in this phase
  const defaults = {
    price: initialAssumptions?.purchase?.price ?? 550000,
    downPct: initialAssumptions?.purchase?.downPct ?? 15,
    rate: initialAssumptions?.purchase?.rate ?? 6.375,
    term: initialAssumptions?.purchase?.term ?? 30,
    insurance: initialAssumptions?.purchase?.insurance ?? 130,
    hoaFee: initialAssumptions?.purchase?.hoaFee ?? 0,
  };

  const [price, setPrice] = useState(defaults.price);
  const [downPct, setDownPct] = useState(defaults.downPct);
  const [rate, setRate] = useState(defaults.rate);
  const [insurance, setInsurance] = useState(defaults.insurance);
  const [hoaFee, setHoaFee] = useState(defaults.hoaFee);
  const [programsOpen, setProgramsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const activeProgram: ProgramId = eligiblePrograms[0] ?? "conventional";
  const prog = PROGRAMS[activeProgram];
  const effectiveDownPct = Math.max(downPct, prog.minDownPct);

  const calc = useMemo(() => {
    const downAmt = Math.round(price * (effectiveDownPct / 100));
    const baseLoan = price - downAmt;
    const upfrontFee = baseLoan * (prog.upfrontFeePct / 100);
    const totalLoan = baseLoan + upfrontFee;
    const ltv = price > 0 ? baseLoan / price : 0;

    const pi = calcMonthlyPI(totalLoan, rate, defaults.term);
    const tax = (price * 0.0084) / 12; // 0.84% annual per spec
    const mi = prog.monthlyMi(baseLoan, ltv);
    const pitia = pi + tax + insurance + hoaFee + mi;

    const comparisonPct = income > 0 ? ((pitia + monthlyDebts) / income) * 100 : 0;
    const isOver = comparisonPct > prog.guideline;

    const cashLow = roundTo500(downAmt + price * 0.02);
    const cashHigh = roundTo500(downAmt + price * 0.035);

    return { pitia, downAmt, comparisonPct, isOver, cashLow, cashHigh, ltv, baseLoan, totalLoan, pi, tax, mi };
  }, [price, effectiveDownPct, rate, insurance, hoaFee, income, monthlyDebts, prog, defaults.term]);

  const displayLine = ailanaLine ?? `Here is what your numbers look like at $${fmt(price)}.`;

  return (
    <div style={{ background: C.bg, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>

      {/* ── 1. AILANA LINE ── */}
      {showAilanaLine && (
        <div className="flex items-start gap-2 mb-3 px-1">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white font-bold"
            style={{ background: "rgba(0,180,216,0.25)", border: "1px solid rgba(0,180,216,0.4)", fontSize: 11 }}
          >
            A
          </div>
          <p style={{ color: C.textSecondary, fontSize: 12, lineHeight: 1.5, margin: 0, paddingTop: 4 }}>
            {displayLine}
          </p>
        </div>
      )}

      {/* ── 2. HEADLINE CARD ── */}
      <div
        className="rounded-xl p-4 mb-2"
        style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, backdropFilter: "blur(12px)" }}
      >
        {/* Monthly Payment */}
        <div className="mb-3">
          <div
            className="uppercase font-semibold tracking-wider mb-0.5"
            style={{ color: C.tealDark, letterSpacing: "0.06em", fontSize: 10 }}
          >
            Estimated Monthly Payment
          </div>
          <div className="flex items-baseline gap-1">
            <span style={{ color: "#00B4D8", fontSize: 32, fontWeight: 700, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
              ${fmt(calc.pitia)}
            </span>
            <span style={{ color: C.navyMuted, fontSize: 14 }}>/mo</span>
          </div>
          <p style={{ color: C.textMuted, fontSize: 11, marginTop: 3, lineHeight: 1.3 }}>
            Principal, interest, taxes, insurance and MI, estimated.
          </p>
        </div>

        <hr style={{ border: "none", borderTop: `1px solid ${C.cardBorder}`, margin: "0 0 10px 0" }} />

        {/* Cash to Close */}
        <div>
          <div
            className="uppercase font-semibold tracking-wider mb-0.5"
            style={{ color: C.navyMuted, letterSpacing: "0.06em", fontSize: 10 }}
          >
            Estimated Cash to Close
          </div>
          <div style={{ color: "#00B4D8", fontSize: 18, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
            ${fmt(calc.cashLow)} to ${fmt(calc.cashHigh)}
          </div>
          <p style={{ color: C.textMuted, fontSize: 11, marginTop: 2, lineHeight: 1.3 }}>
            Down payment plus closing costs, estimated.
          </p>
        </div>
      </div>

      {/* ── 3. LOAN PROGRAMS ROW ── */}
      <div
        className="rounded-xl mb-2"
        style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, backdropFilter: "blur(12px)" }}
      >
        <button
          type="button"
          onClick={() => setProgramsOpen(!programsOpen)}
          className="w-full flex items-center justify-between px-4 py-2.5 cursor-pointer"
          aria-expanded={programsOpen}
        >
          <span style={{ color: C.textPrimary, fontSize: 13, fontWeight: 500 }}>
            Loan programs to explore ({eligiblePrograms.length})
          </span>
          <span style={{ color: C.blue, fontSize: 12, fontWeight: 600 }}>
            {programsOpen ? "Hide" : "Show"}
          </span>
        </button>

        {programsOpen && (
          <div className="px-4 pb-3 border-t" style={{ borderColor: C.cardBorder }}>
            {eligiblePrograms.map((pid) => {
              const p = PROGRAMS[pid];
              if (!p) return null;
              return (
                <div key={pid} className="py-2 border-b last:border-b-0" style={{ borderColor: C.cardBorder }}>
                  <div style={{ color: C.navy, fontSize: 12, fontWeight: 600, marginBottom: 1 }}>{p.label}</div>
                  <div style={{ color: C.textMuted, fontSize: 11, lineHeight: 1.3 }}>{p.description}</div>
                </div>
              );
            })}
            <p style={{ color: C.textLight, fontSize: 10, marginTop: 8, fontStyle: "italic" }}>
              Final eligibility and terms are decided by the lender.
            </p>
          </div>
        )}
      </div>

      {/* ── 4. SOFT-CHECK OFFER (stated mode only) ── */}
      {dataMode === "stated" && (
        <div
          className="rounded-xl p-4 mb-2"
          style={{ background: C.blueBg, border: `1px solid ${C.periwinkleBorder}`, backdropFilter: "blur(12px)" }}
        >
          <p style={{ color: C.textPrimary, fontSize: 12, lineHeight: 1.4, margin: 0, marginBottom: 10 }}>
            <strong>Want verified numbers?</strong> A soft credit check replaces estimates with your real figures. No impact to your score.
          </p>
          <button
            type="button"
            onClick={onRequestSoftPull}
            className="px-5 py-2 rounded-lg text-white font-semibold cursor-pointer transition-all hover:opacity-90"
            style={{ background: C.blue, fontSize: 12, boxShadow: `0 0 12px rgba(0,180,216,0.3)` }}
          >
            Check my numbers
          </button>
        </div>
      )}

      {/* ── 5. COMPARISON CARD ── */}
      <div
        className="rounded-xl p-4 mb-2"
        style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, backdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span style={{ color: C.navy, fontSize: 13, fontWeight: 700 }}>How this compares</span>
          <span
            className="px-2.5 py-0.5 rounded-full font-semibold"
            style={{
              fontSize: 10,
              background: calc.isOver ? C.amberBg : C.tealBg,
              color: calc.isOver ? C.amber : C.tealDark,
              border: `1px solid ${calc.isOver ? C.amberBorder : C.tealBorder}`,
            }}
          >
            {calc.isOver ? "Over guideline" : "At or under guideline"}
          </span>
        </div>
        <p style={{ color: C.textSecondary, fontSize: 12, lineHeight: 1.4, margin: 0 }}>
          About {Math.round(calc.comparisonPct)}% of income goes to housing + debts. Guideline is up to {prog.guideline}%.
        </p>
        {calc.isOver && (
          <p style={{ color: C.textMuted, fontSize: 11, lineHeight: 1.4, marginTop: 4, fontStyle: "italic" }}>
            For your planning only. You can keep exploring or continue either way.
          </p>
        )}
        <GuidelineBar value={calc.comparisonPct} guideline={prog.guideline} />
      </div>

      {/* ── 6. CONTROLS CARD ── */}
      <div
        className="rounded-xl p-4 mb-2"
        style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, backdropFilter: "blur(12px)" }}
      >
        <div style={{ color: C.navy, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
          Try different numbers
        </div>

        <Slider
          label="Home price"
          value={price}
          min={200000}
          max={1200000}
          step={5000}
          displayValue={`$${fmt(price)}`}
          onChange={setPrice}
        />

        <Slider
          label="Down payment"
          value={downPct}
          min={prog.minDownPct}
          max={30}
          step={0.5}
          displayValue={`${downPct.toFixed(1)}% ($${fmt(Math.round(price * (effectiveDownPct / 100)))})`}
          onChange={setDownPct}
        />

        {/* Applicant data line */}
        <div className="pt-2 mt-0.5 border-t flex items-start justify-between gap-2" style={{ borderColor: C.cardBorder }}>
          <p style={{ color: C.textMuted, fontSize: 11, lineHeight: 1.4, margin: 0 }}>
            Based on: ${fmt(income)}/mo income, ${fmt(monthlyDebts)}/mo debts
          </p>
          {dataMode === "stated" && (
            <button
              type="button"
              onClick={onEditData}
              className="shrink-0 cursor-pointer"
              style={{ color: C.blue, fontSize: 11, fontWeight: 600, textDecoration: "underline", background: "none", border: "none", padding: 0 }}
            >
              Edit
            </button>
          )}
        </div>

        {/* More assumptions toggle */}
        <button
          type="button"
          onClick={() => setMoreOpen(!moreOpen)}
          className="mt-2 cursor-pointer"
          style={{ color: C.blue, fontSize: 12, fontWeight: 600, background: "none", border: "none", padding: 0 }}
          aria-expanded={moreOpen}
        >
          {moreOpen ? "Hide assumptions" : "More assumptions (rate, insurance, HOA)"}
        </button>

        {moreOpen && (
          <div className="mt-2 pt-2 border-t" style={{ borderColor: C.cardBorder }}>
            <Slider
              label="Interest rate"
              value={rate}
              min={4}
              max={9}
              step={0.125}
              displayValue={`${rate.toFixed(3)}%`}
              onChange={setRate}
            />
            <Slider
              label="Homeowners insurance"
              value={insurance}
              min={40}
              max={400}
              step={10}
              displayValue={`$${fmt(insurance)}/mo`}
              onChange={setInsurance}
            />
            <Slider
              label="HOA dues"
              value={hoaFee}
              min={0}
              max={600}
              step={25}
              displayValue={`$${fmt(hoaFee)}/mo`}
              onChange={setHoaFee}
            />
          </div>
        )}
      </div>

      {/* ── 7. DISCLAIMER ── */}
      <div className="px-1 pb-1">
        <p style={{ color: C.textLight, fontSize: 10, lineHeight: 1.4, margin: 0 }}>
          Educational estimate only. Not a loan application, rate lock, or commitment to lend. Final terms depend on underwriting by a licensed MLO (NMLS).
          {dataMode === "stated" && " Based on estimates you shared."}
        </p>
      </div>

      {/* ── SLIDER STYLES ── */}
      <style>{`
        .afford-v2-slider {
          -webkit-appearance: none;
          appearance: none;
        }
        .afford-v2-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: ${C.blue};
          border: 2px solid rgba(11,15,25,0.6);
          box-shadow: 0 0 8px rgba(0,180,216,0.5);
          cursor: pointer;
          margin-top: -4.5px;
        }
        .afford-v2-slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: ${C.blue};
          border: 2px solid rgba(11,15,25,0.6);
          box-shadow: 0 0 8px rgba(0,180,216,0.5);
          cursor: pointer;
        }
        .afford-v2-slider::-webkit-slider-runnable-track {
          height: 5px;
          border-radius: 3px;
        }
        .afford-v2-slider::-moz-range-track {
          height: 5px;
          border-radius: 3px;
        }
        .afford-v2-slider:focus-visible {
          outline: 2px solid ${C.blue};
          outline-offset: 4px;
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
}

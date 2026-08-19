"use client";

import React, { useMemo, useState } from "react";
import { Shield, Info, SlidersHorizontal, CheckCircle2, RotateCcw, ArrowUpRight, Sparkles } from "lucide-react";

/* ---------------------------------------------------------
   CONVERGENT-AI DESIGN TOKENS (Dark / Cyan / Fintech Motif)
--------------------------------------------------------- */
const T = {
  paper: "#0B0F19",
  card: "#0F172A",
  cardAlt: "#131E35",
  cardHover: "#1E293B",
  ink: "#F8FAFC",
  inkSoft: "#94A3B8",
  inkMuted: "#64748B",
  teal: "#00B4D8",
  tealDeep: "#023E8A",
  tealGlow: "rgba(0, 180, 216, 0.35)",
  tealBg: "rgba(0, 180, 216, 0.12)",
  brass: "#F59E0B",
  brassLight: "rgba(245, 158, 11, 0.12)",
  line: "rgba(255, 255, 255, 0.1)",
  lineBright: "rgba(0, 180, 216, 0.3)",
  green: "#10B981",
  greenBg: "rgba(16, 185, 129, 0.15)",
  amber: "#F59E0B",
  amberBg: "rgba(245, 158, 11, 0.15)",
  red: "#EF4444",
  redBg: "rgba(239, 68, 68, 0.15)",
} as const;

const FONT_DISPLAY = `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
const FONT_SANS = `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
const FONT_MONO = `'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace`;

/* ---------------------------------------------------------
   TYPES
--------------------------------------------------------- */
export type ModeId = "purchase" | "refiRT" | "refiCO" | "heloc";
export type ProgramId = "conventional" | "fha" | "va" | "usda";
export type TransactionType = "TT-PUR" | "TT-REF" | "TT-HEL" | "TT-HEQ" | "TT-CON";
export type DataMode = "stated" | "pulled";

export interface Segment {
  label: string;
  value: number;
}

export interface ProgramConfig {
  label: string;
  minDownPct: number;
  upfrontFeePct: number;
  upfrontFeeLabel: string | null;
  miLabel: string;
  monthlyMi: (loanAmt: number, ltv: number) => number;
  miNote: (mi: number) => string;
  dtiFront: { guideline: number };
  dtiBack: { guideline: number };
  ltv: { guideline: number };
  compensating: string;
}

export interface Assumptions {
  price?: number;
  downPct?: number;
  homeValue?: number;
  payoff?: number;
  cashOut?: number;
  currentPayment?: number;
  rate?: number;
  term?: number;
  taxRatePct: number;
  insurance: number;
  hoaFee?: number;
  firstBalance?: number;
  lineAmount?: number;
  drawRate?: number;
  firstPI?: number;
}

export interface CalcResult {
  pitia: number;
  front: number;
  back: number;
  segments: Segment[];
  ltv?: number;
  cltv?: number;
  mi?: number;
  loanAmt?: number;
  baseLoan?: number;
  upfrontFee?: number;
  totalLiens?: number;
  delta?: number | null;
  cashBand?: [number, number] | null;
  exactCash?: number;
  pi?: number;
  tax?: number;
}

/* ---------------------------------------------------------
   LOAN MATH & UTILS
--------------------------------------------------------- */
function monthlyPI(principal: number, annualRatePct: number, termYears: number): number {
  const r = annualRatePct / 100 / 12;
  const n = termYears * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function fmt(n: number, decimals = 0): string {
  return (n || 0).toLocaleString("en-US", { maximumFractionDigits: decimals, minimumFractionDigits: decimals });
}

function fmtPct(n: number): string {
  return `${(n || 0).toFixed(1)}%`;
}

/* ---------------------------------------------------------
   MODES & PROGRAM DEFINITIONS
--------------------------------------------------------- */
const MODES: { id: ModeId; label: string }[] = [
  { id: "purchase", label: "Purchase" },
  { id: "refiRT", label: "Refi: Rate & Term" },
  { id: "refiCO", label: "Refi: Cash-Out" },
  { id: "heloc", label: "HELOC" },
];

function resolveMode(transactionType: TransactionType, cashOutIntent: boolean): ModeId {
  if (transactionType === "TT-PUR") return "purchase";
  if (transactionType === "TT-HEL") return "heloc";
  if (transactionType === "TT-REF") return cashOutIntent ? "refiCO" : "refiRT";
  return "purchase";
}

const DEFAULTS: Record<ModeId, Assumptions> = {
  purchase: { price: 550000, downPct: 15, rate: 6.375, term: 30, taxRatePct: 0.84, insurance: 130, hoaFee: 0 },
  refiRT: { homeValue: 500000, payoff: 300000, rate: 6.125, term: 30, taxRatePct: 0.84, insurance: 120, hoaFee: 0, currentPayment: 2204 },
  refiCO: { homeValue: 500000, payoff: 300000, cashOut: 30000, rate: 6.375, term: 30, taxRatePct: 0.84, insurance: 120, hoaFee: 0, currentPayment: 2204 },
  heloc: { homeValue: 500000, firstBalance: 300000, lineAmount: 50000, drawRate: 8.5, taxRatePct: 0.84, insurance: 120, firstPI: 1895 },
};

function annualPmiRatePct(ltv: number): number {
  if (ltv <= 80) return 0;
  if (ltv <= 85) return 0.30;
  if (ltv <= 90) return 0.51;
  if (ltv <= 95) return 0.70;
  return 0.90;
}

function monthlyPmi(loanAmt: number, ltv: number): number {
  return (loanAmt * (annualPmiRatePct(ltv) / 100)) / 12;
}

const PROGRAMS: Record<ProgramId, ProgramConfig> = {
  conventional: {
    label: "Conventional",
    minDownPct: 3,
    upfrontFeePct: 0,
    upfrontFeeLabel: null,
    miLabel: "PMI",
    monthlyMi: (loanAmt, ltv) => monthlyPmi(loanAmt, ltv),
    miNote: (mi) =>
      mi > 0
        ? `PMI of $${fmt(mi)}/mo applies (LTV above 80%, cancelled at 20% equity)`
        : `No PMI required (LTV at or below 80%)`,
    dtiFront: { guideline: 28 },
    dtiBack: { guideline: 36 },
    ltv: { guideline: 80 },
    compensating: "strong credit, cash reserves, or a lower LTV",
  },
  fha: {
    label: "FHA",
    minDownPct: 3.5,
    upfrontFeePct: 1.75,
    upfrontFeeLabel: "Upfront MIP",
    miLabel: "FHA MIP",
    monthlyMi: (loanAmt) => (loanAmt * (0.55 / 100)) / 12,
    miNote: (mi) => `FHA MIP of $${fmt(mi)}/mo applies for the life of the loan at this down payment`,
    dtiFront: { guideline: 31 },
    dtiBack: { guideline: 43 },
    ltv: { guideline: 90 },
    compensating: "residual income, cash reserves, or minimal payment shock",
  },
  va: {
    label: "VA",
    minDownPct: 0,
    upfrontFeePct: 2.15,
    upfrontFeeLabel: "VA funding fee",
    miLabel: "VA Funding Fee",
    monthlyMi: () => 0,
    miNote: () => `No monthly mortgage insurance — VA funding fee is financed into the loan amount`,
    dtiFront: { guideline: 31 },
    dtiBack: { guideline: 41 },
    ltv: { guideline: 100 },
    compensating: "residual income — VA's primary underwriting measure, weighted above DTI",
  },
  usda: {
    label: "USDA / Rural",
    minDownPct: 0,
    upfrontFeePct: 1,
    upfrontFeeLabel: "USDA guarantee fee",
    miLabel: "USDA Annual Fee",
    monthlyMi: (loanAmt) => (loanAmt * (0.35 / 100)) / 12,
    miNote: (mi) => `USDA annual fee of $${fmt(mi)}/mo applies for the life of the loan`,
    dtiFront: { guideline: 29 },
    dtiBack: { guideline: 41 },
    ltv: { guideline: 100 },
    compensating: "credit score and stable income under GUS automated underwriting",
  },
};

/* ---------------------------------------------------------
   BENCHMARK GAUGES (DARK / NEON THEME)
--------------------------------------------------------- */
type Zone = "at" | "over";

function zoneFor(value: number, guideline: number): Zone {
  return value <= guideline ? "at" : "over";
}

const ZONE_COLORS: Record<Zone, { fg: string; bg: string; label: string }> = {
  at: { fg: T.green, bg: T.greenBg, label: "At or under guideline" },
  over: { fg: T.amber, bg: T.amberBg, label: "Over guideline" },
};

interface BenchmarkGaugeProps {
  label: string;
  value: number;
  guideline: number;
  sublabel?: string;
}

function BenchmarkGauge({ label, value, guideline, sublabel }: BenchmarkGaugeProps) {
  const max = guideline * 1.6;
  const zone = zoneFor(value, guideline);
  const zc = ZONE_COLORS[zone];
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const guidelinePct = Math.min(100, (guideline / max) * 100);
  const gap = value - guideline;

  return (
    <div className="flex-1 min-w-0 bg-white/[0.02] p-1.5 lg:p-2 rounded-lg border border-white/10 overflow-hidden flex flex-col justify-between">
      <div>
        <div className="text-[8.5px] lg:text-[10px] text-slate-400 font-medium leading-tight truncate">{label}</div>
        <div className="text-xs lg:text-sm font-mono font-bold text-white mt-0.5">{fmtPct(value)}</div>

        {/* Gauge Bar */}
        <div className="relative h-1 rounded-full bg-slate-800 overflow-visible mt-1 lg:mt-1.5">
          <div style={{ width: `${guidelinePct}%` }} className="absolute left-0 top-0 bottom-0 bg-emerald-500/40 rounded-l-full" />
          <div style={{ left: `${guidelinePct}%` }} className="absolute top-0 bottom-0 right-0 bg-amber-500/25 rounded-r-full" />
          <div style={{ left: `calc(${guidelinePct}% - 1px)` }} className="absolute -top-0.5 -bottom-0.5 w-[1.5px] bg-white/60 z-10" />
          <div
            title={fmtPct(value)}
            style={{
              left: `calc(${pct}% - 4px)`,
              background: zc.fg,
              boxShadow: `0 0 5px ${zc.fg}`,
            }}
            className="absolute -top-1 w-2 h-2 lg:w-2 lg:h-2 rounded-full border border-slate-900 z-20 transition-all duration-200"
          />
        </div>
      </div>

      <div className="mt-1 lg:mt-1.5">
        <div style={{ color: zc.fg }} className="text-[8px] lg:text-[9.5px] font-semibold leading-tight truncate">{zc.label}</div>
        <div className="text-[7.5px] lg:text-[8.5px] text-slate-500 mt-0.5 truncate">
          {fmtPct(guideline)} limit{zone === "over" ? ` (+${gap.toFixed(1)}%)` : ""}
        </div>
        {sublabel && <div className="text-[7.5px] lg:text-[8.5px] text-slate-500 mt-0.5 truncate">{sublabel}</div>}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   PAYMENT LEDGER (STACKED BAR & TOTAL)
--------------------------------------------------------- */
interface PaymentLedgerProps {
  segments: Segment[];
  total: number;
  extraLine?: { label: string; value: number } | null;
  totalLabel?: string;
}

function PaymentLedger({ segments, total, extraLine, totalLabel = "Total PITIA" }: PaymentLedgerProps) {
  const palette = ["#00b4d8", "#023e8a", "#10b981", "#8b5cf6", "#f59e0b"];

  return (
    <div className="mt-1 lg:mt-1.5">
      {/* Proportional Bar */}
      <div className="flex h-2 lg:h-2.5 rounded-md overflow-hidden border border-white/10 bg-slate-900">
        {segments.map((s, i) => (
          <div
            key={s.label}
            style={{
              width: `${total > 0 ? (s.value / total) * 100 : 0}%`,
              background: palette[i % palette.length],
              minWidth: s.value > 0 ? 2 : 0,
            }}
            className="transition-all duration-200"
            title={`${s.label}: $${fmt(s.value)}`}
          />
        ))}
      </div>

      {/* Legend — 2-column compact grid */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1 lg:mt-2">
        {segments.filter(s => s.value > 0).map((s, i) => (
          <div key={s.label} className="flex items-center gap-1.5 overflow-hidden">
            <span style={{ background: palette[i % palette.length] }} className="w-1.5 h-1.5 rounded-sm shrink-0" />
            <span className="text-[8.5px] lg:text-[10.5px] text-slate-400 truncate">{s.label}</span>
            <span className="text-[8.5px] lg:text-[10.5px] font-mono font-semibold text-white shrink-0 ml-auto">${fmt(s.value)}</span>
          </div>
        ))}
        {extraLine && (
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="w-1.5 h-1.5 rounded-sm border border-dashed border-[#00b4d8] shrink-0" />
            <span className="text-[8.5px] lg:text-[10.5px] text-[#00b4d8] truncate">{extraLine.label}</span>
            <span className="text-[8.5px] lg:text-[10.5px] font-mono font-semibold text-[#00b4d8] shrink-0 ml-auto">${fmt(extraLine.value)}</span>
          </div>
        )}
      </div>

      {/* Summary Total */}
      <div className="flex items-center justify-between mt-1.5 lg:mt-2 pt-1.5 lg:pt-2 border-t border-white/10">
        <span className="text-[9.5px] lg:text-xs font-semibold text-white">{totalLabel}</span>
        <span className="text-xs lg:text-sm font-mono font-bold text-[#00b4d8] drop-shadow-[0_0_8px_rgba(0,180,216,0.35)]">
          ${fmt(total)}
          <span className="text-[9px] lg:text-[10.5px] font-normal text-slate-400">/mo</span>
        </span>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   MAIN NEW AFFORDABILITY PANEL COMPONENT
--------------------------------------------------------- */
export interface AffordabilityPanelNewProps {
  transactionType?: TransactionType;
  cashOutIntent?: boolean;
  dataMode?: DataMode;
  income?: number;
  monthlyDebts?: number;
  initialAssumptions?: Partial<Record<ModeId, Partial<Assumptions>>>;
  onRequestSoftPull?: () => void;
  onSubmitReview?: () => void;
}

export function AffordabilityPanelNew({
  transactionType = "TT-PUR",
  cashOutIntent = false,
  dataMode = "stated",
  income = 10000,
  monthlyDebts = 800,
  initialAssumptions = {},
  onRequestSoftPull,
  onSubmitReview,
}: AffordabilityPanelNewProps) {
  const [initialMode] = useState<ModeId>(() => resolveMode(transactionType, cashOutIntent));
  const [mode, setMode] = useState<ModeId>(initialMode);
  const [program, setProgram] = useState<ProgramId>("conventional");

  const [assump, setAssump] = useState<Record<ModeId, Assumptions>>(() => {
    const merged: Record<ModeId, Assumptions> = JSON.parse(JSON.stringify(DEFAULTS));
    (Object.keys(initialAssumptions) as ModeId[]).forEach((modeId) => {
      if (merged[modeId]) merged[modeId] = { ...merged[modeId], ...initialAssumptions[modeId] };
    });
    return merged;
  });
  const a = assump[mode];

  const [statedDebts, setStatedDebts] = useState<number>(monthlyDebts);
  const effectiveDebts = dataMode === "stated" ? statedDebts : monthlyDebts;

  const update = (field: keyof Assumptions, value: number) => {
    setAssump((prev) => ({ ...prev, [mode]: { ...prev[mode], [field]: value } }));
  };

  const activeProgram: ProgramConfig = mode === "heloc" ? PROGRAMS.conventional : PROGRAMS[program];

  const calc: CalcResult = useMemo(() => {
    if (mode === "purchase" || mode === "refiRT" || mode === "refiCO") {
      const baseLoan =
        mode === "purchase"
          ? (a.price as number) * (1 - (a.downPct as number) / 100)
          : (a.payoff as number) + (mode === "refiCO" ? (a.cashOut as number) : 0);
      const upfrontFee = baseLoan * (activeProgram.upfrontFeePct / 100);
      const loanAmt = baseLoan + upfrontFee;
      const pi = monthlyPI(loanAmt, a.rate as number, a.term as number);
      const valueBasis = mode === "purchase" ? (a.price as number) : (a.homeValue as number);
      const tax = (valueBasis * (a.taxRatePct / 100)) / 12;
      const ltv = valueBasis > 0 ? (loanAmt / valueBasis) * 100 : 0;
      const mi = activeProgram.monthlyMi(loanAmt, ltv);
      const pitia = pi + tax + a.insurance + (a.hoaFee ?? 0) + mi;
      const cashOut = mode === "refiCO" ? (a.cashOut as number) : 0;
      const delta = mode !== "purchase" ? (a.currentPayment as number) - pitia : null;
      return {
        pi,
        tax,
        pitia,
        ltv,
        mi,
        loanAmt,
        upfrontFee,
        baseLoan,
        front: income > 0 ? (pitia / income) * 100 : 0,
        back: income > 0 ? ((pitia + effectiveDebts) / income) * 100 : 0,
        delta,
        cashBand:
          mode === "purchase"
            ? [
                Math.round(((a.price as number) * (a.downPct as number)) / 100 * 0.9 / 500) * 500,
                Math.round(((a.price as number) * (a.downPct as number)) / 100 * 1.15 / 500) * 500,
              ]
            : mode === "refiCO"
            ? [Math.round((cashOut * 0.92) / 500) * 500, Math.round((cashOut * 1.05) / 500) * 500]
            : null,
        exactCash: mode === "purchase" ? ((a.price as number) * (a.downPct as number)) / 100 + (a.price as number) * 0.02 : cashOut,
        segments: [
          { label: "Principal & Interest", value: pi },
          { label: "Property Taxes", value: tax },
          { label: "Insurance", value: a.insurance },
          { label: "HOA Dues", value: a.hoaFee ?? 0 },
          { label: activeProgram.miLabel, value: mi },
        ],
      };
    }

    // HELOC
    const drawPI = ((a.lineAmount as number) * ((a.drawRate as number) / 100)) / 12;
    const tax = ((a.homeValue as number) * (a.taxRatePct / 100)) / 12;
    const pitia = (a.firstPI as number) + drawPI + tax + a.insurance;
    const cltv = (a.homeValue as number) > 0 ? (((a.firstBalance as number) + (a.lineAmount as number)) / (a.homeValue as number)) * 100 : 0;
    return {
      pitia,
      cltv,
      totalLiens: (a.firstBalance as number) + (a.lineAmount as number),
      front: income > 0 ? (pitia / income) * 100 : 0,
      back: income > 0 ? ((pitia + effectiveDebts) / income) * 100 : 0,
      segments: [
        { label: "1st Mortgage (P&I)", value: a.firstPI as number },
        { label: "HELOC Draw (Interest-Only)", value: drawPI },
        { label: "Taxes & Insurance", value: tax + a.insurance },
      ],
    };
  }, [mode, a, activeProgram, income, effectiveDebts]);

  const ltvGuideline = mode === "heloc" ? 85 : activeProgram.ltv.guideline;
  const ltvVal = mode === "heloc" ? (calc.cltv as number) : (calc.ltv as number);
  const baselineText = mode === "purchase" ? `Target: $${fmt(a.price as number)}` : `Value: $${fmt(a.homeValue as number)}`;

  return (
    <div className="w-full min-h-full flex flex-col justify-between font-sans text-white bg-transparent">
      {/* Main Card with full height distribution & natural scroll */}
      <div className="bg-[#0F172A] rounded-xl border border-white/10 shadow-lg w-full flex flex-col min-h-full justify-between shrink-0">

        <div className="flex flex-col gap-1.5 lg:gap-2.5 p-2.5 lg:p-3">
            
            {/* Sub-Header: Income & Baseline preview */}
            <div className="flex justify-between items-center gap-2">
              <div className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-[#00b4d8]" />
                <span className="font-mono text-[9.5px] lg:text-[11px] text-slate-300 font-medium">{baselineText}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] lg:text-xs font-bold text-white">
                  ${fmt(income)}<span className="text-[8.5px] lg:text-[10px] text-slate-400 font-normal">/mo</span>
                </span>
                {dataMode === "pulled" ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400 text-[8.5px] lg:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                    <CheckCircle2 className="w-2.5 h-2.5 lg:w-3 lg:h-3" /> Verified
                  </span>
                ) : (
                  <span className="text-amber-400 text-[8.5px] lg:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
                    Stated
                  </span>
                )}
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div>
              <div className="flex gap-1 lg:gap-1.5 bg-white/[0.03] p-1 rounded-lg border border-white/10">
                {MODES.map((m) => {
                  const active = m.id === mode;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setMode(m.id)}
                      className={`flex-1 text-[8.5px] lg:text-[10.5px] font-semibold py-1 lg:py-1 px-1.5 rounded-md transition-all truncate ${
                        active
                          ? "bg-gradient-to-r from-[#00b4d8] to-[#023e8a] text-white shadow-[0_2px_8px_rgba(0,180,216,0.35)]"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>

              {mode !== "heloc" && (
                <div className="flex items-center gap-1.5 lg:gap-2 pt-1.5 lg:pt-1.5 flex-wrap">
                  <span className="text-[8.5px] lg:text-[10.5px] text-slate-400 font-medium">Program:</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {(Object.entries(PROGRAMS) as [ProgramId, ProgramConfig][]).map(([id, p]) => {
                      const active = id === program;
                      return (
                        <button
                          key={id}
                          onClick={() => {
                            setProgram(id);
                            if (mode === "purchase" && (a.downPct as number) < p.minDownPct) update("downPct", p.minDownPct);
                          }}
                          className={`text-[8.5px] lg:text-[10px] font-semibold py-0.5 lg:py-0.5 px-1.5 lg:px-2 rounded-md border transition-all ${
                            active
                              ? "border-[#00b4d8] bg-[#00b4d8]/15 text-[#00b4d8]"
                              : "border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="h-px bg-white/10" />

            {/* Payment Stats Row */}
            <div className={`grid gap-1.5 lg:gap-2 ${calc.cashBand ? "grid-cols-3" : "grid-cols-2"}`}>
              <div className="bg-white/[0.02] p-1.5 lg:p-2 rounded-lg border border-white/10 min-w-0 overflow-hidden">
                <div className="text-[7.5px] lg:text-[9px] uppercase font-semibold text-slate-400 tracking-wider truncate">
                  {mode === "heloc" ? "Monthly Obligation" : "Est. PITIA"}
                </div>
                <div className="text-sm lg:text-base font-mono font-bold text-[#00b4d8] mt-0.5 drop-shadow-[0_0_8px_rgba(0,180,216,0.35)] truncate">
                  ${fmt(calc.pitia)}
                  <span className="text-[8.5px] lg:text-[10px] text-slate-400 font-normal">/mo</span>
                </div>
              </div>

              <div className="bg-white/[0.02] p-1.5 lg:p-2 rounded-lg border border-white/10 min-w-0 overflow-hidden">
                <div className="text-[7.5px] lg:text-[9px] uppercase font-semibold text-slate-400 tracking-wider truncate">
                  {mode === "heloc" ? "Total Liens" : "Loan Amount"}
                </div>
                <div className="text-xs lg:text-sm font-mono font-semibold text-white mt-0.5 truncate">
                  ${fmt(mode === "heloc" ? (calc.totalLiens as number) : (calc.loanAmt as number))}
                </div>
              </div>

              {calc.cashBand && (
                <div className="bg-white/[0.02] p-1.5 lg:p-2 rounded-lg border border-white/10 min-w-0 overflow-hidden">
                  <div className="text-[7.5px] lg:text-[9px] uppercase font-semibold text-slate-400 tracking-wider truncate">
                    {mode === "purchase" ? "Cash to Close" : "Cash at Close"}
                  </div>
                  <div className="text-[11px] lg:text-sm font-mono font-semibold text-emerald-400 mt-0.5 truncate">
                    ${fmt(calc.cashBand[0])}–${fmt(calc.cashBand[1])}
                  </div>
                </div>
              )}
            </div>

            {/* Payment Ledger Bar & Legend */}
            <div>
              <PaymentLedger
                segments={calc.segments}
                total={calc.pitia}
                extraLine={calc.cashBand ? { label: mode === "purchase" ? "Cash to close" : "Cash-out", value: calc.exactCash as number } : null}
                totalLabel={mode === "heloc" ? "Total Monthly Obligation" : "Total Housing Obligation"}
              />

              {mode !== "heloc" && (
                <div className="mt-1 lg:mt-1.5 text-[8.5px] lg:text-[10.5px] text-slate-400 leading-normal">
                  {(mode === "refiRT" || mode === "refiCO") && (
                    <>
                      <span className={(calc.delta as number) >= 0 ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold"}>
                        {(calc.delta as number) >= 0
                          ? `Saves $${fmt(Math.abs(calc.delta as number))}/mo`
                          : `Adds $${fmt(Math.abs(calc.delta as number))}/mo`}
                      </span>
                      {" · "}
                    </>
                  )}
                  {activeProgram.miNote(calc.mi as number)}
                </div>
              )}
            </div>

            <div className="h-px bg-white/10" />

            {/* Benchmarks Section */}
            <div>
              <div className="text-[8.5px] lg:text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 lg:mb-1.5">
                DTI & LTV Benchmarks — {activeProgram.label}
              </div>
              <div className="flex gap-1.5 lg:gap-2 w-full">
                <BenchmarkGauge
                  label="Front-End DTI"
                  value={calc.front}
                  guideline={activeProgram.dtiFront.guideline}
                />
                <BenchmarkGauge
                  label="Back-End DTI"
                  value={calc.back}
                  guideline={activeProgram.dtiBack.guideline}
                  sublabel={`+$${fmt(effectiveDebts)}/mo`}
                />
                <BenchmarkGauge label={mode === "heloc" ? "CLTV" : "LTV"} value={ltvVal} guideline={ltvGuideline} />
              </div>

              {dataMode === "stated" && (
                <div className="mt-1.5 lg:mt-2 pt-1.5 lg:pt-2 border-t border-white/10">
                  <SliderRow
                    label="Monthly Debts (your estimate)"
                    value={statedDebts}
                    min={0}
                    max={5000}
                    step={25}
                    onChange={setStatedDebts}
                    prefix="$"
                    suffix="/mo"
                  />
                </div>
              )}
            </div>

            {/* Stated Mode Soft Pull Upgrade CTA */}
            {dataMode === "stated" && onRequestSoftPull && (
              <>
                <div className="h-px bg-white/10" />
                <div className="bg-gradient-to-r from-[#00b4d8]/10 to-[#023e8a]/20 rounded-lg p-2 lg:p-2.5 border border-[#00b4d8]/30 flex items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 text-[9.5px] lg:text-[11px] font-bold text-white">
                      <Sparkles className="w-3 h-3 text-[#00b4d8]" /> Want verified numbers?
                    </div>
                    <div className="text-[8px] lg:text-[10px] text-slate-400 leading-tight mt-0.5">
                      Soft credit pull — zero credit score impact.
                    </div>
                  </div>
                  <button
                    onClick={onRequestSoftPull}
                    className="text-[9px] lg:text-[10.5px] font-bold py-1 lg:py-1 px-2.5 lg:px-3 rounded-md bg-gradient-to-r from-[#00b4d8] to-[#023e8a] text-white shadow-[0_2px_8px_rgba(0,180,216,0.3)] hover:opacity-90 transition cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    Upgrade <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </>
            )}

            <div className="h-px bg-white/10" />

            {/* Scenario Assumptions Grid */}
            <div>
              <div className="flex items-center justify-between mb-1 lg:mb-1.5">
                <div className="flex items-center gap-1.5 text-[9px] lg:text-[11px] font-bold text-[#00b4d8]">
                  <SlidersHorizontal className="w-3 h-3 lg:w-3.5 lg:h-3.5" /> Scenario Assumptions
                </div>
                <button
                  onClick={() => setAssump((prev) => ({ ...prev, [mode]: JSON.parse(JSON.stringify(DEFAULTS[mode])) }))}
                  className="text-[8.5px] lg:text-[10px] text-slate-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-2.5 h-2.5 lg:w-3 lg:h-3" /> Reset
                </button>
              </div>

              <div className="grid grid-cols-2 gap-x-2.5 lg:gap-x-3.5 gap-y-1 lg:gap-y-1.5">
                {mode === "purchase" && (
                  <>
                    <SliderRow label="Target Price" value={a.price as number} min={100000} max={1500000} step={5000} onChange={(v) => update("price", v)} prefix="$" />
                    <SliderRow label="Down Payment" value={a.downPct as number} min={activeProgram.minDownPct} max={40} step={0.5} onChange={(v) => update("downPct", v)} suffix="%" />
                    <SliderRow label="Interest Rate" value={a.rate as number} min={3.5} max={10} step={0.125} onChange={(v) => update("rate", v)} suffix="%" />
                    <ToggleRow label="Loan Term" options={[15, 30]} value={a.term as number} onChange={(v) => update("term", v)} suffix="-yr" />
                  </>
                )}
                {(mode === "refiRT" || mode === "refiCO") && (
                  <>
                    <SliderRow label="Home Value" value={a.homeValue as number} min={150000} max={1500000} step={5000} onChange={(v) => update("homeValue", v)} prefix="$" />
                    <SliderRow label="Payoff Balance" value={a.payoff as number} min={50000} max={a.homeValue as number} step={5000} onChange={(v) => update("payoff", v)} prefix="$" />
                    {mode === "refiCO" ? (
                      <SliderRow label="Cash-Out" value={a.cashOut as number} min={0} max={250000} step={2500} onChange={(v) => update("cashOut", v)} prefix="$" />
                    ) : (
                      <div />
                    )}
                    <SliderRow label="Interest Rate" value={a.rate as number} min={3.5} max={10} step={0.125} onChange={(v) => update("rate", v)} suffix="%" />
                    <ToggleRow label="Loan Term" options={[15, 30]} value={a.term as number} onChange={(v) => update("term", v)} suffix="-yr" />
                  </>
                )}
                {mode === "heloc" && (
                  <>
                    <SliderRow label="Home Value" value={a.homeValue as number} min={150000} max={1500000} step={5000} onChange={(v) => update("homeValue", v)} prefix="$" />
                    <SliderRow label="1st Balance" value={a.firstBalance as number} min={50000} max={a.homeValue as number} step={5000} onChange={(v) => update("firstBalance", v)} prefix="$" />
                    <SliderRow label="Credit Line" value={a.lineAmount as number} min={10000} max={300000} step={2500} onChange={(v) => update("lineAmount", v)} prefix="$" />
                    <SliderRow label="Draw Rate" value={a.drawRate as number} min={5} max={14} step={0.25} onChange={(v) => update("drawRate", v)} suffix="%" />
                  </>
                )}
                <SliderRow label="Insurance" value={a.insurance} min={40} max={400} step={10} onChange={(v) => update("insurance", v)} prefix="$" suffix="/mo" />
                {mode !== "heloc" && (
                  <SliderRow label="HOA Dues" value={a.hoaFee as number} min={0} max={600} step={10} onChange={(v) => update("hoaFee", v)} prefix="$" suffix="/mo" />
                )}
              </div>

              {onSubmitReview && dataMode === "pulled" && (
                <div className="pt-2 lg:pt-2.5">
                  <button
                    onClick={onSubmitReview}
                    className="w-full text-xs lg:text-xs font-bold py-2 lg:py-2 rounded-lg bg-gradient-to-r from-[#00b4d8] to-[#023e8a] text-white shadow-[0_4px_15px_rgba(0,180,216,0.35)] hover:opacity-90 transition cursor-pointer"
                  >
                    Submit for Formal Underwriting Review
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Compliance Footer */}
          <div className="bg-[#080c14] px-2.5 lg:px-3 py-1.5 lg:py-2 border-t border-white/10 mt-auto">
            <div className="flex gap-2 items-start">
              <Shield className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-[#00b4d8] shrink-0 mt-0.5" />
              <div className="text-[7.5px] lg:text-[9px] text-slate-500 leading-normal">
                Educational estimate only — not a loan commitment. Final terms subject to formal underwriting review.
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

/* ---------------------------------------------------------
   REUSABLE PRIMITIVES
--------------------------------------------------------- */
function Divider() {
  return <div className="h-px bg-white/10 my-1 lg:my-2" />;
}

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
}

function SliderRow({ label, value, min, max, step, onChange, prefix = "", suffix = "" }: SliderRowProps) {
  return (
    <div className="mb-1 lg:mb-1.5">
      <div className="flex justify-between items-center mb-0.5">
        <span className="text-[8.5px] lg:text-xs text-slate-400 truncate">{label}</span>
        <span className="text-[9px] lg:text-xs font-mono font-bold text-white shrink-0 ml-1">
          {prefix}{fmt(value, step < 1 ? 2 : 0)}{suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-[#00b4d8] h-1 lg:h-1.5 bg-slate-800 rounded-sm cursor-pointer block"
      />
    </div>
  );
}

interface ToggleRowProps {
  label: string;
  options: number[];
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
}

function ToggleRow({ label, options, value, onChange, suffix = "" }: ToggleRowProps) {
  return (
    <div className="mb-1 lg:mb-1.5">
      <div className="text-[8.5px] lg:text-xs text-slate-400 mb-1">{label}</div>
      <div className="flex gap-1.5">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`text-[8.5px] lg:text-xs font-semibold py-0.5 lg:py-1 px-1.5 lg:px-3 rounded-md border transition-all cursor-pointer ${
              value === opt
                ? "border-[#00b4d8] bg-[#00b4d8]/15 text-[#00b4d8]"
                : "border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {opt}{suffix}
          </button>
        ))}
      </div>
    </div>
  );
}

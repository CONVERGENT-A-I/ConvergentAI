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
    label: "Veteran Affairs Loan",
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
  statedDownPaymentDollars?: number;
  lockedMode?: boolean;
  eligiblePrograms?: ProgramId[];
  initialAssumptions?: Partial<Record<ModeId, Partial<Assumptions>>>;
  onRequestSoftPull?: () => void;
  onSubmitReview?: () => void;
  isSubmitted?: boolean;
}

export function AffordabilityPanelNew({
  transactionType = "TT-PUR",
  cashOutIntent = false,
  dataMode = "stated",
  income = 10000,
  monthlyDebts = 800,
  statedDownPaymentDollars,
  lockedMode = false,
  eligiblePrograms = ["conventional", "fha", "va", "usda"],
  initialAssumptions = {},
  onRequestSoftPull,
  onSubmitReview,
  isSubmitted = false,
}: AffordabilityPanelNewProps) {
  const [initialMode] = useState<ModeId>(() => resolveMode(transactionType, cashOutIntent));
  const [mode, setMode] = useState<ModeId>(initialMode);
  const [hasSubmittedLocally, setHasSubmittedLocally] = useState<boolean>(false);

  // Default program: Rule R1 (service-eligible = VA, else conventional/FHA)
  const defaultProgram = eligiblePrograms.includes("va") ? "va" : eligiblePrograms.includes("conventional") ? "conventional" : (eligiblePrograms[0] || "conventional");
  const [program, setProgram] = useState<ProgramId>(defaultProgram);

  const [assump, setAssump] = useState<Record<ModeId, Assumptions>>(() => {
    const merged: Record<ModeId, Assumptions> = JSON.parse(JSON.stringify(DEFAULTS));
    (Object.keys(initialAssumptions) as ModeId[]).forEach((modeId) => {
      if (merged[modeId]) merged[modeId] = { ...merged[modeId], ...initialAssumptions[modeId] };
    });
    // If statedDownPaymentDollars was passed, sync downPct
    if (statedDownPaymentDollars && merged.purchase && merged.purchase.price) {
      merged.purchase.downPct = Math.round((statedDownPaymentDollars / merged.purchase.price) * 100 * 10) / 10;
    }
    return merged;
  });
  const a = assump[mode];

  const [statedDebts, setStatedDebts] = useState<number>(monthlyDebts);
  const effectiveDebts = dataMode === "stated" ? statedDebts : monthlyDebts;

  const update = (field: keyof Assumptions, value: number) => {
    setAssump((prev) => ({ ...prev, [mode]: { ...prev[mode], [field]: value } }));
  };

  const activeProgram: ProgramConfig = mode === "heloc" ? PROGRAMS.conventional : (PROGRAMS[program] || PROGRAMS.conventional);

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
          { label: "P&I", value: pi },
          { label: "Property Taxes", value: tax },
          { label: "Homeowners Ins.", value: a.insurance },
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
        { label: "1st Mtg (P&I)", value: a.firstPI as number },
        { label: "HELOC Draw", value: drawPI },
        { label: "Taxes & Ins.", value: tax + a.insurance },
      ],
    };
  }, [mode, a, activeProgram, income, effectiveDebts]);

  const ltvGuideline = mode === "heloc" ? 85 : activeProgram.ltv.guideline;
  const ltvVal = mode === "heloc" ? (calc.cltv as number) : (calc.ltv as number);

  // Calculate down payment in exact dollar amount for Purchase
  const currentDownDollars = mode === "purchase" ? Math.round(((a.price as number) * (a.downPct as number)) / 100) : 0;

  // Available eligible programs
  const availablePrograms = (Object.entries(PROGRAMS) as [ProgramId, ProgramConfig][]).filter(([id]) =>
    eligiblePrograms.includes(id)
  );

  const palette = ["#00b4d8", "#023e8a", "#10b981", "#8b5cf6", "#f59e0b"];

  return (
    <div className="w-full min-h-full flex flex-col justify-between font-sans text-white bg-transparent">
      <div className="bg-[#0F172A] rounded-xl border border-white/10 shadow-lg w-full flex flex-col min-h-full justify-between shrink-0 overflow-hidden">

        <div className="flex flex-col gap-2 lg:gap-2.5 p-2.5 lg:p-3">

          {/* ── 1. COMPACT HERO FINANCIAL RIBBON (Target, Stated Down $, Income) ── */}
          <div className="bg-white/[0.02] p-2 lg:p-2.5 rounded-lg border border-white/10 flex flex-wrap items-center justify-between gap-1.5 lg:gap-2">
            <div className="flex items-center gap-2 lg:gap-2.5 flex-wrap">
              {mode === "purchase" ? (
                <>
                  <div className="flex items-center gap-1">
                    <span className="text-[8.5px] lg:text-[10px] text-slate-400 uppercase font-medium">Target:</span>
                    <span className="font-mono tabular-nums tracking-tight text-[10.5px] lg:text-xs font-bold text-white">${fmt(a.price as number)}</span>
                  </div>
                  <span className="text-slate-600 text-xs">|</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[8.5px] lg:text-[10px] text-slate-400 uppercase font-medium">Stated Down:</span>
                    <span className="font-mono tabular-nums tracking-tight text-[10.5px] lg:text-xs font-bold text-emerald-400">
                      ${fmt(currentDownDollars)} <span className="text-[9px] text-slate-400 font-normal">({a.downPct}%)</span>
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1">
                    <span className="text-[8.5px] lg:text-[10px] text-slate-400 uppercase font-medium">Home Value:</span>
                    <span className="font-mono tabular-nums tracking-tight text-[10.5px] lg:text-xs font-bold text-white">${fmt(a.homeValue as number)}</span>
                  </div>
                  <span className="text-slate-600 text-xs">|</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[8.5px] lg:text-[10px] text-slate-400 uppercase font-medium">
                      {mode === "heloc" ? "1st Balance:" : "Payoff:"}
                    </span>
                    <span className="font-mono tabular-nums tracking-tight text-[10.5px] lg:text-xs font-bold text-white">
                      ${fmt(mode === "heloc" ? (a.firstBalance as number) : (a.payoff as number))}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-1 ml-auto">
              <span className="text-[8.5px] lg:text-[10px] text-slate-400 uppercase font-medium">Income:</span>
              <span className="font-mono tabular-nums tracking-tight text-[10.5px] lg:text-xs font-bold text-white">
                ${fmt(income)}<span className="text-[8.5px] lg:text-[10px] text-slate-400 font-normal">/mo</span>
              </span>
            </div>
          </div>

          {/* ── 2. CONDITIONAL MODE & ELIGIBLE PROGRAM SELECTOR ── */}
          {(!lockedMode || (mode !== "heloc" && availablePrograms.length > 1)) && (
            <div className="flex flex-col gap-1.5">
              {/* Only show Mode Switcher tabs if not locked to single prequal transaction */}
              {!lockedMode && (
                <div className="flex gap-1 lg:gap-1.5 bg-white/[0.03] p-1 rounded-lg border border-white/10">
                  {MODES.map((m) => {
                    const active = m.id === mode;
                    return (
                      <button
                        key={m.id}
                        onClick={() => setMode(m.id)}
                        className={`flex-1 text-[8.5px] lg:text-[10.5px] font-semibold py-1 px-1.5 rounded-md transition-all truncate cursor-pointer ${active
                            ? "bg-gradient-to-r from-[#00b4d8] to-[#023e8a] text-white shadow-[0_2px_8px_rgba(0,180,216,0.35)]"
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                          }`}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Only show Loan Programs that are determined eligible for this borrower */}
              {mode !== "heloc" && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[8.5px] lg:text-[10.5px] text-slate-400 font-medium">Eligible Programs:</span>
                  <div className="flex gap-1 flex-wrap">
                    {availablePrograms.map(([id, p]) => {
                      const active = id === program;
                      return (
                        <button
                          key={id}
                          onClick={() => {
                            setProgram(id);
                            if (mode === "purchase" && (a.downPct as number) < p.minDownPct) update("downPct", p.minDownPct);
                          }}
                          className={`text-[8.5px] lg:text-[10px] font-semibold py-0.5 px-2 rounded-md border transition-all cursor-pointer ${active
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
          )}

          {/* ── 3. UNIFIED PAYMENT & ITEMIZATION CARD ── */}
          <div className="bg-gradient-to-br from-[#131E35]/80 to-[#0F172A] p-2.5 lg:p-3 rounded-lg border border-[#00b4d8]/30 shadow-md">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[7.5px] lg:text-[9.5px] uppercase font-semibold text-slate-400 tracking-wider">
                  {mode === "heloc" ? "Total Monthly Obligation" : "Est. Total Monthly Payment (PITIA)"}
                </div>
                <div className="text-base lg:text-xl font-mono tabular-nums tracking-tight font-bold text-[#00b4d8] drop-shadow-[0_0_10px_rgba(0,180,216,0.35)] mt-0.5">
                  ${fmt(calc.pitia)}
                  <span className="text-[9px] lg:text-xs text-slate-400 font-normal">/mo</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-0.5 lg:gap-1">
                <div className="text-right">
                  <span className="text-[7.5px] lg:text-[9px] text-slate-400 uppercase mr-1">Loan Amount:</span>
                  <span className="font-mono tabular-nums tracking-tight text-[10.5px] lg:text-xs font-semibold text-white">
                    ${fmt(mode === "heloc" ? (calc.totalLiens as number) : (calc.loanAmt as number))}
                  </span>
                </div>
                {calc.upfrontFee! > 0 && activeProgram.upfrontFeeLabel && (
                  <div className="text-[7.5px] lg:text-[9px] text-slate-400 mt-0.5 ml-2 text-right">
                    Includes ${fmt(calc.upfrontFee as number)} {activeProgram.upfrontFeeLabel}
                  </div>
                )}
                {calc.cashBand && (
                  <div className="text-right">
                    <span className="text-[7.5px] lg:text-[9px] text-slate-400 uppercase mr-1">
                      {mode === "purchase" ? "Est. Cash to Close:" : "Cash-Out:"}
                    </span>
                    <span className="font-mono tabular-nums tracking-tight text-[10px] lg:text-[11.5px] font-semibold text-emerald-400">
                      ${fmt(calc.cashBand[0])}–${fmt(calc.cashBand[1])}
                    </span>
                  </div>
                )}
                {(mode === "refiRT" || mode === "refiCO") && typeof calc.delta === "number" && (
                  <div className="text-right">
                    <span className={`text-[9px] lg:text-[10.5px] font-semibold ${calc.delta >= 0 ? "text-emerald-400" : "text-amber-400"}`}>
                      {calc.delta >= 0 ? `Saves $${fmt(Math.abs(calc.delta))}/mo` : `Adds $${fmt(Math.abs(calc.delta))}/mo`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Proportional Payment Bar */}
            <div className="flex h-2 lg:h-2.5 rounded-md overflow-hidden border border-white/10 bg-slate-900 mt-2">
              {calc.segments.map((s, i) => (
                <div
                  key={s.label}
                  style={{
                    width: `${calc.pitia > 0 ? (s.value / calc.pitia) * 100 : 0}%`,
                    background: palette[i % palette.length],
                    minWidth: s.value > 0 ? 2 : 0,
                  }}
                  className="transition-all duration-200"
                  title={`${s.label}: $${fmt(s.value)}`}
                />
              ))}
            </div>

            {/* 2-Column Inline Cost Matrix */}
            <div className="grid grid-cols-2 gap-x-2.5 gap-y-0.5 lg:gap-y-1 mt-1.5 pt-1.5 border-t border-white/10">
              {calc.segments.filter(s => s.value > 0).map((s, i) => (
                <div key={s.label} className="flex items-center justify-between text-[8px] lg:text-[10px]">
                  <div className="flex items-center gap-1.5 truncate">
                    <span style={{ background: palette[i % palette.length] }} className="w-1.5 h-1.5 rounded-xs shrink-0" />
                    <span className="text-slate-400 truncate">{s.label}</span>
                  </div>
                  <span className="font-mono tabular-nums tracking-tight font-semibold text-white ml-1 shrink-0">${fmt(s.value)}</span>
                </div>
              ))}
            </div>

            {mode !== "heloc" && (
              <div className="mt-1 text-[7.5px] lg:text-[9px] text-slate-400 leading-tight">
                {activeProgram.miNote(calc.mi as number)}
              </div>
            )}
          </div>

          {/* ── 4. INLINE DTI & LTV BENCHMARK STRIP ── */}
          <div className="bg-white/[0.02] p-2 lg:p-2.5 rounded-lg border border-white/10">
            <div className="text-[7.5px] lg:text-[9.5px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              DTI & LTV Benchmarks — {activeProgram.label}
            </div>

            <div className="grid grid-cols-3 gap-1.5 lg:gap-2">
              {/* Front-End DTI */}
              <div
                className="bg-slate-900/60 p-1.5 lg:p-2 rounded-md flex flex-col justify-between transition-all"
                style={{
                  border: calc.front <= activeProgram.dtiFront.guideline
                    ? '1px solid rgba(16,185,129,0.40)'
                    : '1px solid rgba(245,158,11,0.40)',
                  animation: calc.front <= activeProgram.dtiFront.guideline
                    ? 'dti-pulse-ok 2.8s ease-in-out infinite'
                    : 'dti-pulse-warn 2.8s ease-in-out infinite',
                }}
              >
                <div className="text-[7.5px] lg:text-[9.5px] font-bold text-slate-300 truncate">Front-End DTI</div>
                <div className="text-xs lg:text-sm font-mono tabular-nums tracking-tight font-bold text-white mt-0.5">{fmtPct(calc.front)}</div>
                <div className={`text-[7px] lg:text-[9px] font-mono tabular-nums tracking-tight font-semibold mt-0.5 truncate ${calc.front <= activeProgram.dtiFront.guideline ? "text-emerald-400" : "text-amber-400"}`}>
                  {calc.front <= activeProgram.dtiFront.guideline ? "At limit" : `+${(calc.front - activeProgram.dtiFront.guideline).toFixed(1)}%`} ({fmtPct(activeProgram.dtiFront.guideline)})
                </div>
              </div>

              {/* Back-End DTI */}
              <div
                className="bg-slate-900/60 p-1.5 lg:p-2 rounded-md flex flex-col justify-between transition-all"
                style={{
                  border: calc.back <= activeProgram.dtiBack.guideline
                    ? '1px solid rgba(16,185,129,0.40)'
                    : '1px solid rgba(245,158,11,0.40)',
                  animation: calc.back <= activeProgram.dtiBack.guideline
                    ? 'dti-pulse-ok 2.8s ease-in-out infinite'
                    : 'dti-pulse-warn 2.8s ease-in-out infinite',
                }}
              >
                <div className="text-[7.5px] lg:text-[9.5px] font-bold text-slate-300 truncate">Back-End DTI</div>
                <div className="text-xs lg:text-sm font-mono tabular-nums tracking-tight font-bold text-white mt-0.5">{fmtPct(calc.back)}</div>
                <div className={`text-[7px] lg:text-[9px] font-mono tabular-nums tracking-tight font-semibold mt-0.5 truncate ${calc.back <= activeProgram.dtiBack.guideline ? "text-emerald-400" : "text-amber-400"}`}>
                  {calc.back <= activeProgram.dtiBack.guideline ? "At limit" : `+${(calc.back - activeProgram.dtiBack.guideline).toFixed(1)}%`} ({fmtPct(activeProgram.dtiBack.guideline)})
                </div>
              </div>

              {/* LTV / CLTV */}
              <div className="bg-slate-900/60 p-1.5 lg:p-2 rounded-md border border-white/5 flex flex-col justify-between">
                <div className="text-[7.5px] lg:text-[9.5px] text-slate-400 truncate">{mode === "heloc" ? "CLTV" : "LTV"}</div>
                <div className="text-xs lg:text-sm font-mono tabular-nums tracking-tight font-bold text-white mt-0.5">{fmtPct(ltvVal)}</div>
                <div className={`text-[7px] lg:text-[9px] font-mono tabular-nums tracking-tight font-semibold mt-0.5 truncate ${ltvVal <= ltvGuideline ? "text-emerald-400" : "text-amber-400"}`}>
                  {ltvVal <= ltvGuideline ? "At limit" : `+${(ltvVal - ltvGuideline).toFixed(1)}%`} ({fmtPct(ltvGuideline)})
                </div>
              </div>
            </div>

            {dataMode === "stated" && (
              <div className="mt-1.5 pt-1.5 border-t border-white/10">
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

          {/* ── 5. STATED MODE UPGRADE RIBBON ── */}
          {dataMode === "stated" && onRequestSoftPull && (
            <div className="bg-gradient-to-r from-[#00b4d8]/10 to-[#023e8a]/20 rounded-lg p-1.5 lg:p-2 border border-[#00b4d8]/30 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#00b4d8] shrink-0" />
                <div className="text-[8px] lg:text-[10px] text-slate-300 leading-tight">
                  <span className="font-bold text-white">Want verified numbers?</span> Soft credit check with zero score impact.
                </div>
              </div>
              <button
                onClick={onRequestSoftPull}
                className="text-[8.5px] lg:text-[10.5px] font-bold py-1 px-2.5 rounded-md bg-gradient-to-r from-[#00b4d8] to-[#023e8a] text-white shadow-[0_2px_8px_rgba(0,180,216,0.3)] hover:opacity-90 transition cursor-pointer flex items-center gap-1 shrink-0"
              >
                Upgrade <ArrowUpRight className="w-2.5 h-2.5" />
              </button>
            </div>
          )}

          {/* ── 6. SCENARIO ASSUMPTIONS (Compact 2-Column Grid) ── */}
          <div className="bg-white/[0.01] p-2 lg:p-2.5 rounded-lg border border-white/5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1 text-[8.5px] lg:text-[10.5px] font-bold text-[#00b4d8]">
                <SlidersHorizontal className="w-3 h-3" /> Adjust Scenario Assumptions
              </div>
              <button
                onClick={() => setAssump((prev) => ({ ...prev, [mode]: JSON.parse(JSON.stringify(DEFAULTS[mode])) }))}
                className="text-[8px] lg:text-[10px] text-slate-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-2.5 h-2.5" /> Reset
              </button>
            </div>

            <div className="grid grid-cols-2 gap-x-2.5 lg:gap-x-3.5 gap-y-1 lg:gap-y-1.5">
              {mode === "purchase" && (
                <>
                  <SliderRow label="Target Price" value={a.price as number} min={100000} max={1500000} step={5000} onChange={(v) => update("price", v)} prefix="$" />
                  <SliderRow label={`Down ($${fmt(currentDownDollars)})`} value={a.downPct as number} min={activeProgram.minDownPct} max={40} step={0.5} onChange={(v) => update("downPct", v)} suffix="%" />
                  <SliderRow label="Interest Rate" value={a.rate as number} min={3.5} max={10} step={0.125} onChange={(v) => update("rate", v)} suffix="%" />
                  <SliderRow label="HOA Dues" value={a.hoaFee as number} min={0} max={600} step={10} onChange={(v) => update("hoaFee", v)} prefix="$" suffix="/mo" />
                  <SliderRow label="Insurance" value={a.insurance} min={40} max={400} step={10} onChange={(v) => update("insurance", v)} prefix="$" suffix="/mo" />
                  <ToggleRow label="Loan Term" options={[15, 30]} value={a.term as number} onChange={(v) => update("term", v)} suffix="-yr" />
                </>
              )}
              {(mode === "refiRT" || mode === "refiCO") && (
                <>
                  <SliderRow label="Home Value" value={a.homeValue as number} min={150000} max={1500000} step={5000} onChange={(v) => update("homeValue", v)} prefix="$" />
                  <SliderRow label="Payoff Balance" value={a.payoff as number} min={50000} max={a.homeValue as number} step={5000} onChange={(v) => update("payoff", v)} prefix="$" />
                  <SliderRow label="Interest Rate" value={a.rate as number} min={3.5} max={10} step={0.125} onChange={(v) => update("rate", v)} suffix="%" />
                  {mode === "refiCO" ? (
                    <SliderRow label="Cash-Out" value={a.cashOut as number} min={0} max={250000} step={2500} onChange={(v) => update("cashOut", v)} prefix="$" />
                  ) : (
                    <SliderRow label="HOA Dues" value={a.hoaFee as number} min={0} max={600} step={10} onChange={(v) => update("hoaFee", v)} prefix="$" suffix="/mo" />
                  )}
                  <SliderRow label="Insurance" value={a.insurance} min={40} max={400} step={10} onChange={(v) => update("insurance", v)} prefix="$" suffix="/mo" />
                  <ToggleRow label="Loan Term" options={[15, 30]} value={a.term as number} onChange={(v) => update("term", v)} suffix="-yr" />
                </>
              )}
              {mode === "heloc" && (
                <>
                  <SliderRow label="Home Value" value={a.homeValue as number} min={150000} max={1500000} step={5000} onChange={(v) => update("homeValue", v)} prefix="$" />
                  <SliderRow label="1st Balance" value={a.firstBalance as number} min={50000} max={a.homeValue as number} step={5000} onChange={(v) => update("firstBalance", v)} prefix="$" />
                  <SliderRow label="Credit Line" value={a.lineAmount as number} min={10000} max={300000} step={2500} onChange={(v) => update("lineAmount", v)} prefix="$" />
                  <SliderRow label="Draw Rate" value={a.drawRate as number} min={5} max={14} step={0.25} onChange={(v) => update("drawRate", v)} suffix="%" />
                  <SliderRow label="Insurance" value={a.insurance} min={40} max={400} step={10} onChange={(v) => update("insurance", v)} prefix="$" suffix="/mo" />
                </>
              )}
            </div>

            {onSubmitReview && dataMode === "pulled" && (
              <div className="pt-2 lg:pt-2">
                {isSubmitted || hasSubmittedLocally ? (
                  <button
                    disabled
                    className="w-full text-[10.5px] lg:text-xs font-bold py-1.5 lg:py-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default flex items-center justify-center gap-1.5 shadow-[0_2px_8px_rgba(16,185,129,0.2)]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Review Submitted
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setHasSubmittedLocally(true);
                      onSubmitReview();
                    }}
                    className="w-full text-[10.5px] lg:text-xs font-bold py-1.5 lg:py-2 rounded-lg bg-gradient-to-r from-[#00b4d8] to-[#023e8a] text-white shadow-[0_4px_12px_rgba(0,180,216,0.35)] hover:opacity-90 transition cursor-pointer"
                  >
                    Submit for Formal Underwriting Review
                  </button>
                )}
              </div>
            )}
          </div>

        </div>

        {/* ── 7. COMPLIANCE FOOTER ── */}
        <div className="bg-[#080c14] px-3 lg:px-4 py-2 lg:py-2.5 border-t border-white/10 mt-auto">
          <div className="flex gap-2 items-center">
            <Shield className="w-3 h-3 text-[#00b4d8] shrink-0" />
            <div className="text-[7.5px] lg:text-[9px] text-slate-400 leading-tight">
              Educational estimate only — not a formal loan commitment. Final terms depend on underwriting review.
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
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  return (
    <div className="mb-0.5 lg:mb-1">
      <div className="flex justify-between items-center mb-0.5">
        <span className="text-[7.5px] lg:text-[10px] text-slate-400 truncate">{label}</span>
        <span className="text-[8px] lg:text-[10px] font-mono tabular-nums tracking-tight font-bold text-white shrink-0 ml-1">
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
        style={{
          background: `linear-gradient(to right, #00b4d8 0%, #00b4d8 ${pct}%, #1e293b ${pct}%, #1e293b 100%)`,
        }}
        className="w-full custom-slider h-1 lg:h-1.5 cursor-pointer block"
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
    <div className="mb-0.5 lg:mb-1">
      <div className="text-[7.5px] lg:text-[10px] text-slate-400 mb-0.5">{label}</div>
      <div className="flex gap-1">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`text-[7.5px] lg:text-[10px] font-mono tabular-nums font-semibold py-0.5 px-2 rounded-sm border transition-all cursor-pointer ${value === opt
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

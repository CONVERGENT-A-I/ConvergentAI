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
    <div style={{ flex: "1 1 150px", minWidth: 140, background: "rgba(255,255,255,0.02)", padding: "10px 12px", borderRadius: 10, border: `1px solid ${T.line}` }}>
      <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: T.inkSoft, fontWeight: 500, lineHeight: 1.25 }}>{label}</div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 18, fontWeight: 700, color: T.ink, marginTop: 2 }}>{fmtPct(value)}</div>
      
      {/* Gauge Bar */}
      <div style={{ position: "relative", height: 8, borderRadius: 99, background: "#1e293b", overflow: "visible", marginTop: 6 }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${guidelinePct}%`, background: "rgba(16, 185, 129, 0.4)", borderRadius: "99px 0 0 99px" }} />
        <div style={{ position: "absolute", left: `${guidelinePct}%`, top: 0, bottom: 0, right: 0, background: "rgba(245, 158, 11, 0.25)", borderRadius: "0 99px 99px 0" }} />
        <div style={{ position: "absolute", left: `calc(${guidelinePct}% - 1px)`, top: -2, bottom: -2, width: 2, background: "#fff", opacity: 0.5, zIndex: 2 }} />
        <div
          title={fmtPct(value)}
          style={{
            position: "absolute",
            left: `calc(${pct}% - 6px)`,
            top: -3,
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: zc.fg,
            border: "2px solid #0f172a",
            boxShadow: `0 0 8px ${zc.fg}`,
            zIndex: 3,
            transition: "left 0.2s ease-out",
          }}
        />
      </div>

      <div style={{ fontFamily: FONT_SANS, fontSize: 10.5, fontWeight: 600, color: zc.fg, marginTop: 5, lineHeight: 1.3 }}>{zc.label}</div>
      <div style={{ fontFamily: FONT_SANS, fontSize: 10, color: T.inkMuted, marginTop: 1 }}>
        {fmtPct(guideline)} guideline{zone === "over" && ` · ${gap.toFixed(1)} pts over`}
      </div>
      {sublabel && <div style={{ fontFamily: FONT_SANS, fontSize: 9.5, color: T.inkMuted, marginTop: 2 }}>{sublabel}</div>}
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
  // Brand color palette for segments
  const palette = ["#00b4d8", "#023e8a", "#10b981", "#8b5cf6", "#f59e0b"];

  return (
    <div style={{ marginTop: 4 }}>
      {/* Proportional Bar */}
      <div style={{ display: "flex", height: 22, borderRadius: 6, overflow: "hidden", border: `1px solid ${T.line}`, background: "#131b2e" }}>
        {segments.map((s, i) => (
          <div
            key={s.label}
            style={{
              width: `${total > 0 ? (s.value / total) * 100 : 0}%`,
              background: palette[i % palette.length],
              minWidth: s.value > 0 ? 3 : 0,
              transition: "width 0.2s ease-out",
            }}
            title={`${s.label}: $${fmt(s.value)}`}
          />
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", marginTop: 10, alignItems: "center" }}>
        {segments.map((s, i) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: palette[i % palette.length], display: "inline-block" }} />
            <span style={{ fontFamily: FONT_SANS, fontSize: 11, color: T.inkSoft }}>{s.label}</span>
            <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: T.ink, fontWeight: 600 }}>${fmt(s.value)}</span>
          </div>
        ))}
        {extraLine && (
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: "transparent", border: `1px dashed ${T.teal}`, display: "inline-block" }} />
            <span style={{ fontFamily: FONT_SANS, fontSize: 11, color: T.teal }}>{extraLine.label}</span>
            <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: T.teal, fontWeight: 600 }}>${fmt(extraLine.value)}</span>
          </div>
        )}
      </div>

      {/* Summary Total */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.line}` }}>
        <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: T.ink, fontWeight: 600 }}>{totalLabel}</span>
        <span style={{ fontFamily: FONT_MONO, fontSize: 16, color: T.teal, fontWeight: 700, textShadow: `0 0 12px ${T.tealGlow}` }}>
          ${fmt(total)}
          <span style={{ fontSize: 11, fontWeight: 400, color: T.inkSoft }}> /mo</span>
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
  /** "stated" = explore-first, pre-soft-pull (Q46-S); "pulled" = post-soft-pull, bureau-verified (Q46) */
  dataMode?: DataMode;
  /** Applicant's monthly gross income */
  income?: number;
  /** Monthly debts */
  monthlyDebts?: number;
  /** Seeds initial values per mode */
  initialAssumptions?: Partial<Record<ModeId, Partial<Assumptions>>>;
  /** Callback to trigger soft credit check modal/consent flow */
  onRequestSoftPull?: () => void;
  /** Callback on final submission */
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
  const ltvLabel = mode === "heloc" ? "Combined Loan-to-Value (CLTV)" : "Loan-to-Value (LTV)";
  const baselineText = mode === "purchase" ? `Target Price · $${fmt(a.price as number)}` : `Home Value · $${fmt(a.homeValue as number)}`;

  return (
    <div style={{ background: T.paper, minHeight: "100%", padding: "14px 12px", fontFamily: FONT_SANS, color: T.ink }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ background: T.card, borderRadius: 16, border: `1px solid ${T.line}`, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
          
          {/* Header */}
          <div style={{ padding: "16px 18px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 700, color: "#fff", letterSpacing: -0.3, display: "flex", alignItems: "center", gap: 6 }}>
                <SlidersHorizontal size={16} color={T.teal} />
                Affordability Summary
              </div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 11.5, color: T.inkSoft, marginTop: 2 }}>{baselineText}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: FONT_MONO, fontSize: 19, fontWeight: 700, color: T.ink }}>
                ${fmt(income)}
                <span style={{ fontSize: 11, color: T.inkSoft, fontWeight: 400 }}>/mo</span>
              </div>
              {dataMode === "pulled" ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: T.green, fontFamily: FONT_SANS, fontSize: 10.5, fontWeight: 600 }}>
                  <CheckCircle2 size={12} /> Verified Income
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: T.brass, fontFamily: FONT_SANS, fontSize: 10.5, fontWeight: 600 }}>
                  Stated Estimate
                </span>
              )}
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div style={{ padding: "12px 18px 0" }}>
            <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.03)", padding: 4, borderRadius: 10, border: `1px solid ${T.line}`, flexWrap: "wrap" }}>
              {MODES.map((m) => {
                const active = m.id === mode;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    style={{
                      fontFamily: FONT_SANS,
                      fontSize: 11.5,
                      fontWeight: active ? 600 : 500,
                      padding: "6px 10px",
                      borderRadius: 7,
                      border: "none",
                      background: active ? `linear-gradient(135deg, ${T.teal}, ${T.tealDeep})` : "transparent",
                      color: active ? "#fff" : T.inkSoft,
                      boxShadow: active ? `0 2px 8px ${T.tealGlow}` : "none",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>

            {mode !== "heloc" && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 10, flexWrap: "wrap" }}>
                <span style={{ fontFamily: FONT_SANS, fontSize: 11, color: T.inkSoft, fontWeight: 500 }}>Loan Program:</span>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {(Object.entries(PROGRAMS) as [ProgramId, ProgramConfig][]).map(([id, p]) => {
                    const active = id === program;
                    return (
                      <button
                        key={id}
                        onClick={() => {
                          setProgram(id);
                          if (mode === "purchase" && (a.downPct as number) < p.minDownPct) update("downPct", p.minDownPct);
                        }}
                        style={{
                          fontFamily: FONT_SANS,
                          fontSize: 10.5,
                          fontWeight: 600,
                          padding: "3px 8px",
                          borderRadius: 6,
                          border: `1px solid ${active ? T.teal : T.line}`,
                          background: active ? T.tealBg : "transparent",
                          color: active ? T.teal : T.inkSoft,
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <Divider />

          {/* Payment Stats Row */}
          <div style={{ padding: "14px 18px 0", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
            <div style={{ background: "rgba(255,255,255,0.02)", padding: "12px 14px", borderRadius: 10, border: `1px solid ${T.line}` }}>
              <div style={{ fontFamily: FONT_SANS, fontSize: 10, color: T.inkSoft, textTransform: "uppercase", letterSpacing: 0.5 }}>
                {mode === "heloc" ? "Est. Monthly Obligation" : "Est. Monthly Payment (PITIA)"}
              </div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 24, fontWeight: 700, color: T.teal, marginTop: 2, textShadow: `0 0 15px ${T.tealGlow}` }}>
                ${fmt(calc.pitia)}
                <span style={{ fontSize: 12, color: T.inkSoft, fontWeight: 400 }}> /mo</span>
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.02)", padding: "12px 14px", borderRadius: 10, border: `1px solid ${T.line}` }}>
              <div style={{ fontFamily: FONT_SANS, fontSize: 10, color: T.inkSoft, textTransform: "uppercase", letterSpacing: 0.5 }}>
                {mode === "heloc" ? "Total Liens (1st + HELOC)" : "Mortgage Amount"}
              </div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 17, fontWeight: 600, color: T.ink, marginTop: 2 }}>
                ${fmt(mode === "heloc" ? (calc.totalLiens as number) : (calc.loanAmt as number))}
              </div>
              {mode !== "heloc" && (calc.upfrontFee as number) > 0 && (
                <div style={{ fontFamily: FONT_SANS, fontSize: 9.5, color: T.inkMuted, marginTop: 2 }}>
                  ${fmt(calc.baseLoan as number)} base + ${fmt(calc.upfrontFee as number)} {activeProgram.upfrontFeeLabel}
                </div>
              )}
            </div>

            {calc.cashBand && (
              <div style={{ background: "rgba(255,255,255,0.02)", padding: "12px 14px", borderRadius: 10, border: `1px solid ${T.line}` }}>
                <div style={{ fontFamily: FONT_SANS, fontSize: 10, color: T.inkSoft, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {mode === "purchase" ? "Est. Cash to Close" : "Est. Cash at Closing"}
                </div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 17, fontWeight: 600, color: T.green, marginTop: 2 }}>
                  ${fmt(calc.cashBand[0])}–${fmt(calc.cashBand[1])}
                </div>
              </div>
            )}
          </div>

          {/* Payment Ledger Bar & Legend */}
          <div style={{ padding: "12px 18px 0" }}>
            <PaymentLedger
              segments={calc.segments}
              total={calc.pitia}
              extraLine={calc.cashBand ? { label: mode === "purchase" ? "Cash to close" : "Cash-out", value: calc.exactCash as number } : null}
              totalLabel={mode === "heloc" ? "Total Combined Monthly Obligation" : "Total Estimated Monthly Housing Obligation"}
            />

            {mode !== "heloc" && (
              <div style={{ marginTop: 8, fontFamily: FONT_SANS, fontSize: 10.5, color: T.inkSoft, lineHeight: 1.4 }}>
                {(mode === "refiRT" || mode === "refiCO") && (
                  <>
                    <span style={{ color: (calc.delta as number) >= 0 ? T.green : T.amber, fontWeight: 600 }}>
                      {(calc.delta as number) >= 0
                        ? `Lowers your current payment by $${fmt(Math.abs(calc.delta as number))}/mo`
                        : `Raises your current payment by $${fmt(Math.abs(calc.delta as number))}/mo`}
                    </span>
                    {mode === "refiCO" && ` · Cash-out is added to your new balance`}
                    {" · "}
                  </>
                )}
                {activeProgram.miNote(calc.mi as number)}
              </div>
            )}
          </div>

          <Divider />

          {/* Benchmarks Section */}
          <div style={{ padding: "14px 18px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
              <div style={{ fontFamily: FONT_SANS, fontSize: 10.5, color: T.inkSoft, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>
                Debt-to-Income & Equity Benchmarks — {activeProgram.label}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <BenchmarkGauge
                label="Housing Ratio (Front-End)"
                value={calc.front}
                guideline={activeProgram.dtiFront.guideline}
                sublabel={program === "va" ? "VA prioritizes residual income above this" : undefined}
              />
              <BenchmarkGauge
                label="Total Debt Ratio (Back-End)"
                value={calc.back}
                guideline={activeProgram.dtiBack.guideline}
                sublabel={`Includes $${fmt(effectiveDebts)}/mo other debts`}
              />
              <BenchmarkGauge label={ltvLabel} value={ltvVal} guideline={ltvGuideline} />
            </div>

            <div style={{ fontFamily: FONT_SANS, fontSize: 10, color: T.inkMuted, marginTop: 8, lineHeight: 1.35 }}>
              Ratios over guideline may still qualify with {activeProgram.compensating}. This is an educational guide — formal review evaluates full automated underwriting factors.
            </div>

            {dataMode === "stated" && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.line}` }}>
                <SliderRow
                  label="Monthly Debts (your estimate — adjust anytime)"
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

          <Divider />

          {/* Stated Mode Soft Pull Upgrade CTA */}
          {dataMode === "stated" && onRequestSoftPull && (
            <>
              <div style={{ padding: "14px 18px 0" }}>
                <div style={{ background: "linear-gradient(135deg, rgba(0, 180, 216, 0.12), rgba(2, 62, 138, 0.2))", borderRadius: 12, padding: "14px", border: `1px solid ${T.lineBright}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: FONT_SANS, fontSize: 12.5, fontWeight: 700, color: "#fff", marginBottom: 3 }}>
                    <Sparkles size={14} color={T.teal} />
                    Want your verified numbers?
                  </div>
                  <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: T.inkSoft, lineHeight: 1.4, marginBottom: 10 }}>
                    A quick soft credit review replaces your stated estimates with your actual verified credit data — with zero impact to your credit score.
                  </div>
                  <button
                    onClick={onRequestSoftPull}
                    style={{
                      fontFamily: FONT_SANS,
                      fontSize: 12,
                      fontWeight: 700,
                      padding: "8px 16px",
                      borderRadius: 8,
                      border: "none",
                      background: `linear-gradient(135deg, ${T.teal}, ${T.tealDeep})`,
                      color: "#fff",
                      boxShadow: `0 2px 10px ${T.tealGlow}`,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    Upgrade to Verified Mode <ArrowUpRight size={13} />
                  </button>
                </div>
              </div>
              <Divider />
            </>
          )}

          {/* Scenario Assumptions Grid */}
          <div style={{ padding: "14px 18px 0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: FONT_SANS, fontSize: 11.5, fontWeight: 600, color: T.teal }}>
                <SlidersHorizontal size={13} /> Scenario Assumptions
              </div>
              <button
                onClick={() => setAssump((prev) => ({ ...prev, [mode]: JSON.parse(JSON.stringify(DEFAULTS[mode])) }))}
                style={{ fontFamily: FONT_SANS, fontSize: 10.5, color: T.inkSoft, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
              >
                <RotateCcw size={11} /> Reset defaults
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 16, rowGap: 4, paddingBottom: 6 }}>
              {mode === "purchase" && (
                <>
                  <SliderRow label="Target Price" value={a.price as number} min={100000} max={1500000} step={5000} onChange={(v) => update("price", v)} prefix="$" />
                  <SliderRow
                    label="Down Payment"
                    value={a.downPct as number}
                    min={activeProgram.minDownPct}
                    max={40}
                    step={0.5}
                    onChange={(v) => update("downPct", v)}
                    suffix="%"
                  />
                  <SliderRow label="Interest Rate" value={a.rate as number} min={3.5} max={10} step={0.125} onChange={(v) => update("rate", v)} suffix="%" />
                  <ToggleRow label="Term" options={[15, 30]} value={a.term as number} onChange={(v) => update("term", v)} suffix="-yr" />
                </>
              )}
              {(mode === "refiRT" || mode === "refiCO") && (
                <>
                  <SliderRow label="Home Value" value={a.homeValue as number} min={150000} max={1500000} step={5000} onChange={(v) => update("homeValue", v)} prefix="$" />
                  <SliderRow
                    label="Payoff Balance"
                    value={a.payoff as number}
                    min={50000}
                    max={a.homeValue as number}
                    step={5000}
                    onChange={(v) => update("payoff", v)}
                    prefix="$"
                  />
                  {mode === "refiCO" ? (
                    <SliderRow label="Requested Cash-Out" value={a.cashOut as number} min={0} max={250000} step={2500} onChange={(v) => update("cashOut", v)} prefix="$" />
                  ) : (
                    <div />
                  )}
                  <SliderRow label="Interest Rate" value={a.rate as number} min={3.5} max={10} step={0.125} onChange={(v) => update("rate", v)} suffix="%" />
                  <ToggleRow label="Term" options={[15, 30]} value={a.term as number} onChange={(v) => update("term", v)} suffix="-yr" />
                </>
              )}
              {mode === "heloc" && (
                <>
                  <SliderRow label="Home Value" value={a.homeValue as number} min={150000} max={1500000} step={5000} onChange={(v) => update("homeValue", v)} prefix="$" />
                  <SliderRow
                    label="1st Mortgage Balance"
                    value={a.firstBalance as number}
                    min={50000}
                    max={a.homeValue as number}
                    step={5000}
                    onChange={(v) => update("firstBalance", v)}
                    prefix="$"
                  />
                  <SliderRow label="Credit Line Amount" value={a.lineAmount as number} min={10000} max={300000} step={2500} onChange={(v) => update("lineAmount", v)} prefix="$" />
                  <SliderRow label="Draw Rate" value={a.drawRate as number} min={5} max={14} step={0.25} onChange={(v) => update("drawRate", v)} suffix="%" />
                </>
              )}
              <SliderRow label="Homeowners Insurance" value={a.insurance} min={40} max={400} step={10} onChange={(v) => update("insurance", v)} prefix="$" suffix="/mo" />
              {mode !== "heloc" && (
                <SliderRow label="Monthly HOA Dues" value={a.hoaFee as number} min={0} max={600} step={10} onChange={(v) => update("hoaFee", v)} prefix="$" suffix="/mo" />
              )}
            </div>

            {onSubmitReview && dataMode === "pulled" && (
              <div style={{ padding: "10px 0 14px" }}>
                <button
                  onClick={onSubmitReview}
                  style={{
                    width: "100%",
                    fontFamily: FONT_SANS,
                    fontSize: 13,
                    fontWeight: 700,
                    padding: "10px",
                    borderRadius: 8,
                    border: "none",
                    background: `linear-gradient(135deg, ${T.teal}, ${T.tealDeep})`,
                    color: "#fff",
                    boxShadow: `0 4px 15px ${T.tealGlow}`,
                    cursor: "pointer",
                  }}
                >
                  Submit for Formal Underwriting Review
                </button>
              </div>
            )}
          </div>

          {/* Compliance Footer */}
          <div style={{ background: "#080c14", padding: "10px 18px", borderTop: `1px solid ${T.line}` }}>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <Shield size={13} color={T.teal} style={{ marginTop: 2, flexShrink: 0 }} />
              <div style={{ fontFamily: FONT_SANS, fontSize: 9.5, color: T.inkMuted, lineHeight: 1.4 }}>
                Educational estimate only. Adjusting price, down payment, cash-out, or rate updates this preview instantly and does not constitute a loan application, rate lock, or commitment to lend. Final terms depend on formal underwriting.
              </div>
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
  return <div style={{ height: 1, background: T.line, margin: "12px 18px 0" }} />;
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
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
        <span style={{ fontFamily: FONT_SANS, fontSize: 10.5, color: T.inkSoft }}>{label}</span>
        <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: T.ink, fontWeight: 600 }}>
          {prefix}
          {fmt(value, step < 1 ? 2 : 0)}
          {suffix}
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
          width: "100%",
          accentColor: T.teal,
          height: 4,
          background: "#1e293b",
          borderRadius: 4,
          cursor: "pointer",
        }}
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
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontFamily: FONT_SANS, fontSize: 10.5, color: T.inkSoft, marginBottom: 3 }}>{label}</div>
      <div style={{ display: "flex", gap: 5 }}>
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            style={{
              fontFamily: FONT_SANS,
              fontSize: 10.5,
              fontWeight: 600,
              padding: "3px 10px",
              borderRadius: 6,
              border: `1px solid ${value === opt ? T.teal : T.line}`,
              background: value === opt ? T.tealBg : "transparent",
              color: value === opt ? T.teal : T.inkSoft,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {opt}
            {suffix}
          </button>
        ))}
      </div>
    </div>
  );
}

"use client";

import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { Shield, Info, SlidersHorizontal, CheckCircle2, RotateCcw, ArrowUpRight, Sparkles, Home, DollarSign, Landmark, CreditCard, Percent, Building2, ShieldCheck, ChevronRight, ChevronDown, Star, Layers } from "lucide-react";

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
export type ModeId = "purchase" | "refiRT" | "refiCO" | "heloc" | "heq";
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
  maxCashOutAt80?: number;
  isCashOutCapped?: boolean;
  repaymentPI?: number;
  repaymentTotal?: number;
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
  { id: "heq", label: "Home Equity Loan" },
];

function resolveMode(transactionType: TransactionType, cashOutIntent: boolean): ModeId {
  if (transactionType === "TT-PUR") return "purchase";
  if (transactionType === "TT-HEL") return "heloc";
  if (transactionType === "TT-HEQ") return "heq";
  if (transactionType === "TT-REF") return cashOutIntent ? "refiCO" : "refiRT";
  return "purchase";
}

const DEFAULTS: Record<ModeId, Assumptions> = {
  purchase: { price: 550000, downPct: 15, rate: 6.375, term: 30, taxRatePct: 0.84, insurance: 130, hoaFee: 0 },
  refiRT: { homeValue: 500000, payoff: 300000, rate: 6.125, term: 30, taxRatePct: 0.84, insurance: 120, hoaFee: 0, currentPayment: 2204 },
  refiCO: { homeValue: 500000, payoff: 300000, cashOut: 30000, rate: 6.375, term: 30, taxRatePct: 0.84, insurance: 120, hoaFee: 0, currentPayment: 2204 },
  heloc: { homeValue: 500000, firstBalance: 300000, lineAmount: 50000, drawRate: 8.5, taxRatePct: 0.84, insurance: 120, firstPI: 1895 },
  heq: { homeValue: 500000, firstBalance: 300000, lineAmount: 50000, rate: 7.5, term: 15, taxRatePct: 0.84, insurance: 120, firstPI: 1895 },
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
   TYPICAL RANGES (for Financial Profile progress bars)
--------------------------------------------------------- */
const TYPICAL_RANGES = {
  income: { min: 7500, max: 20000, label: "$7,500 – $20,000" },
  creditScore: { min: 620, max: 760, label: "620 – 760" },
  downPctPurchase: { min: 5, max: 20, label: "5% – 20%" },
  propertyTax: { min: 300, max: 1000, label: "$300 – $1,000" },
  insurance: { min: 100, max: 300, label: "$100 – $300" },
  dti: { min: 36, max: 43, label: "36% – 43%" },
  payoff: { min: 100000, max: 400000, label: "$100k – $400k" },
  rate: { min: 5.0, max: 8.0, label: "5.0% – 8.0%" },
  lineAmount: { min: 25000, max: 150000, label: "$25k – $150k" },
  cltv: { min: 60, max: 85, label: "60% – 85%" },
  firstBalance: { min: 100000, max: 400000, label: "$100k – $400k" },
} as const;

/* ---------------------------------------------------------
   PROGRAM ICONS
--------------------------------------------------------- */
function ProgramIcon({ programId, className }: { programId: ProgramId | "other"; className?: string }) {
  const cn = className || "w-4 h-4";
  switch (programId) {
    case "conventional": return <Home className={cn} />;
    case "fha": return <Building2 className={cn} />;
    case "va": return <Star className={cn} />;
    case "usda": return <Layers className={cn} />;
    case "other": return <Layers className={cn} />;
  }
}

/* ---------------------------------------------------------
   FINANCIAL PROFILE ITEM
--------------------------------------------------------- */
interface ProfileItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  progressPct: number;
  typicalRange: string;
  color?: string;
}

function ProfileItem({ icon, label, value, progressPct, typicalRange, color = T.teal }: ProfileItemProps) {
  const clampedPct = Math.min(100, Math.max(0, progressPct));
  return (
    <div className="flex gap-2.5 items-start py-2 border-b border-white/5 last:border-b-0">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: `${color}20`, color: color }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[10px] lg:text-xs text-slate-400 font-medium">{label}</span>
          <span className="text-[11px] lg:text-sm font-mono tabular-nums tracking-tight font-bold text-white shrink-0">{value}</span>
        </div>
        <div className="flex items-center gap-2.5 mt-1">
          <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${clampedPct}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }}
            />
          </div>
          <span className="text-[8px] lg:text-[9.5px] text-slate-500 shrink-0 whitespace-nowrap">
            <span className="text-slate-600 mr-0.5">Typical Range</span> {typicalRange}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   GUIDELINE STATUS BADGE
--------------------------------------------------------- */
function GuidelineStatus({ value, guideline }: { value: number; guideline: number }) {
  const within = value <= guideline;
  return (
    <span
      className="text-[7.5px] lg:text-[9.5px] font-semibold leading-tight"
      style={{ color: within ? T.green : T.amber }}
    >
      {within ? "Within guidelines" : "Outside of guidelines"}
    </span>
  );
}

/* ---------------------------------------------------------
   LOAN PROGRAM CARD
--------------------------------------------------------- */
interface ProgramCardProps {
  programId: ProgramId;
  programConfig: ProgramConfig;
  termYears: number;
  backDti: number;
  ltvValue: number;
  isActive: boolean;
  onClick: () => void;
}

function ProgramCard({ programId, programConfig, termYears, backDti, ltvValue, isActive, onClick }: ProgramCardProps) {
  const downLabel = programConfig.minDownPct === 0 ? "0%" : `${programConfig.minDownPct}%+`;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-2 lg:p-2.5 rounded-lg border transition-all cursor-pointer group ${
        isActive
          ? "bg-[#00b4d8]/10 border-[#00b4d8]/40 shadow-[0_0_12px_rgba(0,180,216,0.15)]"
          : "bg-white/[0.02] border-white/10 hover:bg-white/[0.04] hover:border-white/20"
      }`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
          style={{ background: isActive ? `${T.teal}25` : "rgba(255,255,255,0.05)", color: isActive ? T.teal : T.inkSoft }}
        >
          <ProgramIcon programId={programId} className="w-3.5 h-3.5" />
        </div>
        <span className={`text-[10px] lg:text-xs font-bold ${isActive ? "text-white" : "text-slate-300"}`}>
          {programConfig.label} {termYears}-Year Fixed
        </span>
        <ChevronRight className={`w-3.5 h-3.5 ml-auto shrink-0 transition-colors ${isActive ? "text-[#00b4d8]" : "text-slate-600 group-hover:text-slate-400"}`} />
      </div>
      <div className="grid grid-cols-3 gap-1 pl-8">
        <div className="min-w-0">
          <div className="text-[7.5px] lg:text-[9px] text-slate-500">Down Payment</div>
          <div className="text-[8.5px] lg:text-[10.5px] font-bold text-[#00b4d8]">{downLabel}</div>
        </div>
        <div className="min-w-0">
          <div className="text-[7.5px] lg:text-[9px] text-slate-500">DTI</div>
          <GuidelineStatus value={backDti} guideline={programConfig.dtiBack.guideline} />
        </div>
        <div className="min-w-0">
          <div className="text-[7.5px] lg:text-[9px] text-slate-500">LTV</div>
          <GuidelineStatus value={ltvValue} guideline={programConfig.ltv.guideline} />
        </div>
      </div>
    </button>
  );
}

/* ---------------------------------------------------------
   MAIN NEW AFFORDABILITY PANEL COMPONENT
--------------------------------------------------------- */
export interface PanelValuesPayload {
  mode: ModeId;
  program: ProgramId;
  price?: number;
  downPayment?: number;
  downPct?: number;
  loanAmount?: number;
  monthlyPayment?: number;
  frontDti?: number;
  backDti?: number;
  ltv?: number;
  cltv?: number;
  homeValue?: number;
  lineAmount?: number;
}

export interface AffordabilityPanelNewProps {
  transactionType?: TransactionType;
  cashOutIntent?: boolean;
  dataMode?: DataMode;
  income?: number;
  monthlyDebts?: number;
  creditScore?: number;
  statedDownPaymentDollars?: number;
  lockedMode?: boolean;
  eligiblePrograms?: ProgramId[];
  defaultProgram?: ProgramId;
  initialAssumptions?: Partial<Record<ModeId, Partial<Assumptions>>>;
  onRequestSoftPull?: () => void;
  onSubmitReview?: () => void;
  onValuesChange?: (values: PanelValuesPayload) => void;
  isSubmitted?: boolean;
  vaSubsequentUse?: boolean;
}

export function AffordabilityPanelNew({
  transactionType = "TT-PUR",
  cashOutIntent = false,
  dataMode = "stated",
  income = 10000,
  monthlyDebts = 800,
  creditScore,
  statedDownPaymentDollars,
  lockedMode = false,
  eligiblePrograms = ["conventional", "fha", "va", "usda"],
  defaultProgram,
  initialAssumptions = {},
  onRequestSoftPull,
  onSubmitReview,
  onValuesChange,
  isSubmitted = false,
  vaSubsequentUse = false,
}: AffordabilityPanelNewProps) {
  const [initialMode] = useState<ModeId>(() => resolveMode(transactionType, cashOutIntent));
  const [mode, setMode] = useState<ModeId>(initialMode);
  const [hasSubmittedLocally, setHasSubmittedLocally] = useState<boolean>(false);
  const [assumptionsOpen, setAssumptionsOpen] = useState<boolean>(false);

  // Default program selection:
  // 1. Borrower-stated mortgage/loan type (e.g. FHA, VA, USDA, Conventional)
  // 2. If purchase & service-eligible: VA
  // 3. Conventional or first eligible program
  const resolvedDefaultProgram: ProgramId = useMemo(() => {
    if (defaultProgram && eligiblePrograms.includes(defaultProgram)) {
      return defaultProgram;
    }
    if (eligiblePrograms.includes("va") && (transactionType === "TT-PUR" || !defaultProgram)) {
      return "va";
    }
    return eligiblePrograms.includes("conventional")
      ? "conventional"
      : (eligiblePrograms[0] || "conventional");
  }, [defaultProgram, eligiblePrograms, transactionType]);

  const [userSelectedProgram, setUserSelectedProgram] = useState<ProgramId | null>(null);
  const [program, setProgram] = useState<ProgramId>(resolvedDefaultProgram);
  const prevDefaultProgramRef = useRef<ProgramId | undefined>(defaultProgram);
  const prevTxTypeRef = useRef<TransactionType | undefined>(transactionType);

  // Sync if transactionType changes
  useEffect(() => {
    if (transactionType !== prevTxTypeRef.current) {
      prevTxTypeRef.current = transactionType;
      setUserSelectedProgram(null);
      setProgram(resolvedDefaultProgram);
    }
  }, [transactionType, resolvedDefaultProgram]);

  // Sync if defaultProgram arrives or updates from backend
  useEffect(() => {
    if (defaultProgram && defaultProgram !== prevDefaultProgramRef.current) {
      prevDefaultProgramRef.current = defaultProgram;
      if (eligiblePrograms.includes(defaultProgram)) {
        setProgram(defaultProgram);
        setUserSelectedProgram(null);
      }
    } else if (!userSelectedProgram && defaultProgram && eligiblePrograms.includes(defaultProgram) && program !== defaultProgram) {
      setProgram(defaultProgram);
    }
  }, [defaultProgram, eligiblePrograms, userSelectedProgram, program]);

  // Safety fallback if active program is no longer in eligiblePrograms
  useEffect(() => {
    if (eligiblePrograms.length > 0 && !eligiblePrograms.includes(program)) {
      setProgram(resolvedDefaultProgram);
      setUserSelectedProgram(null);
    }
  }, [eligiblePrograms, program, resolvedDefaultProgram]);


  const getBaselineAssumptions = useCallback((): Record<ModeId, Assumptions> => {
    const merged: Record<ModeId, Assumptions> = JSON.parse(JSON.stringify(DEFAULTS));
    (Object.keys(initialAssumptions) as ModeId[]).forEach((modeId) => {
      if (merged[modeId]) merged[modeId] = { ...merged[modeId], ...initialAssumptions[modeId] };
    });
    // If statedDownPaymentDollars was passed, sync downPct
    if (statedDownPaymentDollars && merged.purchase && merged.purchase.price) {
      merged.purchase.downPct = Math.round((statedDownPaymentDollars / merged.purchase.price) * 100 * 10) / 10;
    }
    return merged;
  }, [initialAssumptions, statedDownPaymentDollars]);

  const [assump, setAssump] = useState<Record<ModeId, Assumptions>>(() => getBaselineAssumptions());
  const a = assump[mode];

  const [statedDebts, setStatedDebts] = useState<number>(monthlyDebts);
  const effectiveDebts = dataMode === "stated" ? statedDebts : monthlyDebts;

  const update = (field: keyof Assumptions, value: number) => {
    setAssump((prev) => ({ ...prev, [mode]: { ...prev[mode], [field]: value } }));
  };

  const activeProgram: ProgramConfig = useMemo(() => {
    const base = mode === "heloc" ? PROGRAMS.conventional : (PROGRAMS[program] || PROGRAMS.conventional);
    if (program === "va") {
      return {
        ...PROGRAMS.va,
        upfrontFeePct: vaSubsequentUse ? 3.3 : 2.15,
        upfrontFeeLabel: vaSubsequentUse ? "VA funding fee (subsequent use 3.3%)" : "VA funding fee (first use 2.15%)",
      };
    }
    return base;
  }, [mode, program, vaSubsequentUse]);

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
      const maxCashOutAt80 = mode === "refiCO" ? Math.max(0, Math.round((valueBasis * 0.80) - (a.payoff as number))) : undefined;
      const isCashOutCapped = mode === "refiCO" && typeof maxCashOutAt80 === "number" && cashOut > maxCashOutAt80;
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
        maxCashOutAt80,
        isCashOutCapped,
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

    if (mode === "heq") {
      const fixedPI = monthlyPI(a.lineAmount as number, a.rate as number, a.term as number);
      const tax = ((a.homeValue as number) * (a.taxRatePct / 100)) / 12;
      const pitia = (a.firstPI as number) + fixedPI + tax + a.insurance;
      const cltv = (a.homeValue as number) > 0 ? (((a.firstBalance as number) + (a.lineAmount as number)) / (a.homeValue as number)) * 100 : 0;
      return {
        pitia,
        cltv,
        loanAmt: a.lineAmount as number,
        totalLiens: (a.firstBalance as number) + (a.lineAmount as number),
        front: income > 0 ? (pitia / income) * 100 : 0,
        back: income > 0 ? ((pitia + effectiveDebts) / income) * 100 : 0,
        segments: [
          { label: "1st Mtg (P&I)", value: a.firstPI as number },
          { label: "HE Loan (Fixed P&I)", value: fixedPI },
          { label: "Taxes & Ins.", value: tax + a.insurance },
        ],
      };
    }

    // HELOC
    const drawPI = ((a.lineAmount as number) * ((a.drawRate as number) / 100)) / 12;
    const repaymentPI = monthlyPI(a.lineAmount as number, a.drawRate as number, 20);
    const tax = ((a.homeValue as number) * (a.taxRatePct / 100)) / 12;
    const pitia = (a.firstPI as number) + drawPI + tax + a.insurance;
    const repaymentTotal = (a.firstPI as number) + repaymentPI + tax + a.insurance;
    const cltv = (a.homeValue as number) > 0 ? (((a.firstBalance as number) + (a.lineAmount as number)) / (a.homeValue as number)) * 100 : 0;
    return {
      pitia,
      repaymentPI,
      repaymentTotal,
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

  const ltvGuideline = mode === "heloc" || mode === "heq" ? 85 : activeProgram.ltv.guideline;
  const ltvVal = mode === "heloc" || mode === "heq" ? (calc.cltv as number) : (calc.ltv as number);

  // Calculate down payment in exact dollar amount for Purchase
  const currentDownDollars = mode === "purchase" ? Math.round(((a.price as number) * (a.downPct as number)) / 100) : 0;

  // Available eligible programs
  const availablePrograms = (Object.entries(PROGRAMS) as [ProgramId, ProgramConfig][]).filter(([id]) =>
    eligiblePrograms.includes(id)
  );

  // Overall guideline status
  const isWithinGuidelines = calc.back <= activeProgram.dtiBack.guideline && ltvVal <= ltvGuideline;

  // Mode-adaptive labels
  const modeTitle = mode === "purchase"
    ? "Affordability Summary"
    : mode === "refiRT"
      ? "Refinance Summary"
      : mode === "refiCO"
        ? "Cash-Out Refinance Summary"
        : mode === "heloc"
          ? "HELOC Summary"
          : "Home Equity Loan Summary";

  const modeSubtitle = mode === "purchase"
    ? "Here's how your information compares to typical mortgage guidelines. You can adjust any details below to see how it impacts your estimated payment and cash to close."
    : mode === "refiRT"
      ? "Here's how your refinance scenario compares to typical lending guidelines. Adjust details below to explore different options."
      : mode === "refiCO"
        ? "Here's your cash-out refinance scenario compared to typical guidelines. Adjust the amounts below to explore your options."
        : mode === "heloc"
          ? "Here's how your HELOC scenario compares to typical lending guidelines. Adjust details to see how it impacts your monthly obligation."
          : "Here's how your home equity loan compares to typical lending guidelines.";

  // Hero cards content based on mode
  const heroCards = useMemo(() => {
    if (mode === "purchase") {
      return [
        {
          icon: <Home className="w-4 h-4" />,
          label: "Estimated Home Price",
          value: `$${fmt(a.price as number)}`,
          sub: "Based on your budget and market data.",
        },
        {
          icon: <DollarSign className="w-4 h-4" />,
          label: "Estimated Monthly Payment",
          value: `$${fmt(calc.pitia)}/mo`,
          sub: "Principal & Interest + Taxes + Insurance + HOA (estimated).",
        },
        {
          icon: <Landmark className="w-4 h-4" />,
          label: "Estimated Cash to Close",
          value: calc.cashBand ? `$${fmt(calc.cashBand[0])} – $${fmt(calc.cashBand[1])}` : `$${fmt(calc.exactCash || 0)}`,
          sub: "Down payment + Closing costs + Prepaids + Reserves (estimated).",
        },
      ];
    }
    if (mode === "refiRT") {
      return [
        {
          icon: <Home className="w-4 h-4" />,
          label: "Current Home Value",
          value: `$${fmt(a.homeValue as number)}`,
          sub: "Estimated market value of your property.",
        },
        {
          icon: <DollarSign className="w-4 h-4" />,
          label: "New Monthly Payment",
          value: `$${fmt(calc.pitia)}/mo`,
          sub: "Principal & Interest + Taxes + Insurance (estimated).",
        },
        {
          icon: <Landmark className="w-4 h-4" />,
          label: "Est. Monthly Savings",
          value: typeof calc.delta === "number" && calc.delta >= 0 ? `$${fmt(Math.abs(calc.delta))}/mo` : typeof calc.delta === "number" ? `+$${fmt(Math.abs(calc.delta))}/mo` : "N/A",
          sub: typeof calc.delta === "number" && calc.delta >= 0 ? "Compared to your current payment." : "Your new payment would be higher.",
        },
      ];
    }
    if (mode === "refiCO") {
      return [
        {
          icon: <Home className="w-4 h-4" />,
          label: "Current Home Value",
          value: `$${fmt(a.homeValue as number)}`,
          sub: "Estimated market value of your property.",
        },
        {
          icon: <DollarSign className="w-4 h-4" />,
          label: "New Monthly Payment",
          value: `$${fmt(calc.pitia)}/mo`,
          sub: "Principal & Interest + Taxes + Insurance (estimated).",
        },
        {
          icon: <Landmark className="w-4 h-4" />,
          label: "Cash-Out Amount",
          value: calc.cashBand ? `$${fmt(calc.cashBand[0])} – $${fmt(calc.cashBand[1])}` : `$${fmt(a.cashOut as number)}`,
          sub: "Cash proceeds from your refinance.",
        },
      ];
    }
    if (mode === "heloc") {
      return [
        {
          icon: <Home className="w-4 h-4" />,
          label: "Current Home Value",
          value: `$${fmt(a.homeValue as number)}`,
          sub: "Estimated market value of your property.",
        },
        {
          icon: <DollarSign className="w-4 h-4" />,
          label: "Monthly HELOC Payment",
          value: `$${fmt(calc.pitia)}/mo`,
          sub: "Combined 1st mortgage + HELOC draw + Taxes + Insurance.",
        },
        {
          icon: <Landmark className="w-4 h-4" />,
          label: "Credit Line Amount",
          value: `$${fmt(a.lineAmount as number)}`,
          sub: "Your available home equity line of credit.",
        },
      ];
    }
    // heq
    return [
      {
        icon: <Home className="w-4 h-4" />,
        label: "Current Home Value",
        value: `$${fmt(a.homeValue as number)}`,
        sub: "Estimated market value of your property.",
      },
      {
        icon: <DollarSign className="w-4 h-4" />,
        label: "Total Monthly Payment",
        value: `$${fmt(calc.pitia)}/mo`,
        sub: "Combined 1st mortgage + HE loan + Taxes + Insurance.",
      },
      {
        icon: <Landmark className="w-4 h-4" />,
        label: "HE Loan Amount",
        value: `$${fmt(a.lineAmount as number)}`,
        sub: "Your fixed-rate home equity loan amount.",
      },
    ];
  }, [mode, a, calc]);

  const palette = ["#00b4d8", "#023e8a", "#10b981", "#8b5cf6", "#f59e0b"];

  return (
    <div className="w-full min-h-full flex flex-col justify-between font-sans text-white bg-transparent">
      <div className="bg-[#0F172A] rounded-xl border border-white/10 shadow-lg w-full flex flex-col min-h-full justify-between shrink-0 overflow-hidden">

        <div className="flex flex-col gap-2 lg:gap-2.5 p-2.5 lg:p-3">

          {/* ── 1. HEADER: Icon + Title + Subtitle + Stated/Verified Badge ── */}
          <div className="flex items-start gap-2.5 lg:gap-3">
            <div
              className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: T.tealBg, color: T.teal }}
            >
              <Home className="w-4 h-4 lg:w-5 lg:h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm lg:text-base font-bold text-white tracking-tight">{modeTitle}</h2>
                <span className={`text-[8px] lg:text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                  dataMode === "stated"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                }`}>
                  {dataMode === "stated" ? "Stated" : "Verified"}
                </span>
              </div>
              <p className="text-[8.5px] lg:text-[10px] text-slate-400 leading-snug mt-0.5">{modeSubtitle}</p>
            </div>
          </div>

          {/* ── 1.5. CONDITIONAL MODE & ELIGIBLE PROGRAM SELECTOR ── */}
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

          {/* ── 2. THREE HERO METRIC CARDS ── */}
          <div className="grid grid-cols-3 gap-1.5 lg:gap-2">
            {heroCards.map((card, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-[#131E35]/80 to-[#0F172A] p-2 lg:p-2.5 rounded-lg border border-[#00b4d8]/20 shadow-sm flex flex-col"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <div
                    className="w-5 h-5 lg:w-6 lg:h-6 rounded-md flex items-center justify-center"
                    style={{ background: T.tealBg, color: T.teal }}
                  >
                    {card.icon}
                  </div>
                  <span className="text-[7.5px] lg:text-[9px] text-slate-400 font-medium leading-tight">
                    {card.label} <Info className="w-2.5 h-2.5 inline-block text-slate-600 ml-0.5" />
                  </span>
                </div>
                <div className="text-sm lg:text-lg font-mono tabular-nums tracking-tight font-bold text-white leading-tight">
                  {card.value}
                </div>
                <div className="text-[7px] lg:text-[8.5px] text-slate-500 leading-snug mt-0.5">{card.sub}</div>
              </div>
            ))}
          </div>

          {/* ── 3. STATUS BANNER ── */}
          <div
            className="flex items-center gap-2 p-2 lg:p-2.5 rounded-lg border"
            style={{
              background: isWithinGuidelines ? T.greenBg : T.amberBg,
              borderColor: isWithinGuidelines ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)",
            }}
          >
            <CheckCircle2
              className="w-4 h-4 lg:w-5 lg:h-5 shrink-0"
              style={{ color: isWithinGuidelines ? T.green : T.amber }}
            />
            <div>
              <div className="text-[9px] lg:text-[11px] font-bold" style={{ color: isWithinGuidelines ? T.green : T.amber }}>
                {isWithinGuidelines
                  ? "You're within the typical lending guidelines for this loan program."
                  : "Some ratios are outside typical guidelines for this program."}
              </div>
              <div className="text-[7.5px] lg:text-[9px] text-slate-400 leading-tight mt-0.5">
                {isWithinGuidelines
                  ? "Your estimated ratios are within the recommended range and what you provided."
                  : `Compensating factors such as ${activeProgram.compensating} may help qualification.`}
              </div>
            </div>
          </div>

          {/* ── 4. TWO-COLUMN BODY: Financial Profile + Loan Programs ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-2.5">

            {/* LEFT: Your Financial Profile */}
            <div className="bg-white/[0.02] p-2.5 lg:p-3 rounded-lg border border-white/10">
              <h3 className="text-[10px] lg:text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#00b4d8]" />
                Your Financial Profile
              </h3>

              {mode === "purchase" && (
                <>
                  <ProfileItem
                    icon={<DollarSign className="w-3.5 h-3.5" />}
                    label="Gross Monthly Income"
                    value={`$${fmt(income)}`}
                    progressPct={((income - TYPICAL_RANGES.income.min) / (TYPICAL_RANGES.income.max - TYPICAL_RANGES.income.min)) * 100}
                    typicalRange={TYPICAL_RANGES.income.label}
                    color="#10B981"
                  />
                  <ProfileItem
                    icon={<CreditCard className="w-3.5 h-3.5" />}
                    label="Credit Score"
                    value={creditScore ? `${creditScore}` : "N/A"}
                    progressPct={creditScore ? ((creditScore - 300) / (850 - 300)) * 100 : 0}
                    typicalRange={TYPICAL_RANGES.creditScore.label}
                    color="#8B5CF6"
                  />
                  <ProfileItem
                    icon={<Landmark className="w-3.5 h-3.5" />}
                    label="Down Payment"
                    value={`$${fmt(currentDownDollars)} (${a.downPct}%)`}
                    progressPct={((a.downPct as number) / 30) * 100}
                    typicalRange={TYPICAL_RANGES.downPctPurchase.label}
                    color="#00B4D8"
                  />
                  <ProfileItem
                    icon={<Building2 className="w-3.5 h-3.5" />}
                    label="Property Taxes (est.)"
                    value={`$${fmt(Math.round(((a.price as number) * (a.taxRatePct / 100)) / 12))}/mo`}
                    progressPct={(() => {
                      const monthlyTax = ((a.price as number) * (a.taxRatePct / 100)) / 12;
                      return ((monthlyTax - TYPICAL_RANGES.propertyTax.min) / (TYPICAL_RANGES.propertyTax.max - TYPICAL_RANGES.propertyTax.min)) * 100;
                    })()}
                    typicalRange={TYPICAL_RANGES.propertyTax.label}
                    color="#F59E0B"
                  />
                  <ProfileItem
                    icon={<ShieldCheck className="w-3.5 h-3.5" />}
                    label="Homeowners Insurance (est.)"
                    value={`$${fmt(a.insurance)}/mo`}
                    progressPct={((a.insurance - TYPICAL_RANGES.insurance.min) / (TYPICAL_RANGES.insurance.max - TYPICAL_RANGES.insurance.min)) * 100}
                    typicalRange={TYPICAL_RANGES.insurance.label}
                    color="#06B6D4"
                  />
                  <ProfileItem
                    icon={<Percent className="w-3.5 h-3.5" />}
                    label="Debt-to-Income Ratio"
                    value={fmtPct(calc.back)}
                    progressPct={(calc.back / 60) * 100}
                    typicalRange={TYPICAL_RANGES.dti.label}
                    color={calc.back <= activeProgram.dtiBack.guideline ? "#10B981" : "#F59E0B"}
                  />
                </>
              )}

              {(mode === "refiRT" || mode === "refiCO") && (
                <>
                  <ProfileItem
                    icon={<DollarSign className="w-3.5 h-3.5" />}
                    label="Gross Monthly Income"
                    value={`$${fmt(income)}`}
                    progressPct={((income - TYPICAL_RANGES.income.min) / (TYPICAL_RANGES.income.max - TYPICAL_RANGES.income.min)) * 100}
                    typicalRange={TYPICAL_RANGES.income.label}
                    color="#10B981"
                  />
                  <ProfileItem
                    icon={<CreditCard className="w-3.5 h-3.5" />}
                    label="Credit Score"
                    value={creditScore ? `${creditScore}` : "N/A"}
                    progressPct={creditScore ? ((creditScore - 300) / (850 - 300)) * 100 : 0}
                    typicalRange={TYPICAL_RANGES.creditScore.label}
                    color="#8B5CF6"
                  />
                  <ProfileItem
                    icon={<Landmark className="w-3.5 h-3.5" />}
                    label="Current Balance"
                    value={`$${fmt(a.payoff as number)}`}
                    progressPct={((a.payoff as number) / (a.homeValue as number)) * 100}
                    typicalRange={TYPICAL_RANGES.payoff.label}
                    color="#00B4D8"
                  />
                  <ProfileItem
                    icon={<Percent className="w-3.5 h-3.5" />}
                    label="New Interest Rate"
                    value={`${(a.rate as number).toFixed(3)}%`}
                    progressPct={((a.rate as number) - 3) / (10 - 3) * 100}
                    typicalRange={TYPICAL_RANGES.rate.label}
                    color="#F59E0B"
                  />
                  <ProfileItem
                    icon={<ShieldCheck className="w-3.5 h-3.5" />}
                    label="Homeowners Insurance (est.)"
                    value={`$${fmt(a.insurance)}/mo`}
                    progressPct={((a.insurance - TYPICAL_RANGES.insurance.min) / (TYPICAL_RANGES.insurance.max - TYPICAL_RANGES.insurance.min)) * 100}
                    typicalRange={TYPICAL_RANGES.insurance.label}
                    color="#06B6D4"
                  />
                  <ProfileItem
                    icon={<Percent className="w-3.5 h-3.5" />}
                    label="Debt-to-Income Ratio"
                    value={fmtPct(calc.back)}
                    progressPct={(calc.back / 60) * 100}
                    typicalRange={TYPICAL_RANGES.dti.label}
                    color={calc.back <= activeProgram.dtiBack.guideline ? "#10B981" : "#F59E0B"}
                  />
                  {mode === "refiCO" && (
                    <ProfileItem
                      icon={<DollarSign className="w-3.5 h-3.5" />}
                      label="Cash-Out Requested"
                      value={`$${fmt(a.cashOut as number)}`}
                      progressPct={Math.min(100, ((a.cashOut as number) / (calc.maxCashOutAt80 || (a.cashOut as number) * 1.5)) * 100)}
                      typicalRange={calc.maxCashOutAt80 ? `Max at 80% LTV: $${fmt(calc.maxCashOutAt80)}` : "Varies by LTV"}
                      color={calc.isCashOutCapped ? "#F59E0B" : "#10B981"}
                    />
                  )}
                </>
              )}

              {(mode === "heloc" || mode === "heq") && (
                <>
                  <ProfileItem
                    icon={<DollarSign className="w-3.5 h-3.5" />}
                    label="Gross Monthly Income"
                    value={`$${fmt(income)}`}
                    progressPct={((income - TYPICAL_RANGES.income.min) / (TYPICAL_RANGES.income.max - TYPICAL_RANGES.income.min)) * 100}
                    typicalRange={TYPICAL_RANGES.income.label}
                    color="#10B981"
                  />
                  <ProfileItem
                    icon={<CreditCard className="w-3.5 h-3.5" />}
                    label="Credit Score"
                    value={creditScore ? `${creditScore}` : "N/A"}
                    progressPct={creditScore ? ((creditScore - 300) / (850 - 300)) * 100 : 0}
                    typicalRange={TYPICAL_RANGES.creditScore.label}
                    color="#8B5CF6"
                  />
                  <ProfileItem
                    icon={<Landmark className="w-3.5 h-3.5" />}
                    label="1st Mortgage Balance"
                    value={`$${fmt(a.firstBalance as number)}`}
                    progressPct={((a.firstBalance as number) / (a.homeValue as number)) * 100}
                    typicalRange={TYPICAL_RANGES.firstBalance.label}
                    color="#00B4D8"
                  />
                  <ProfileItem
                    icon={<DollarSign className="w-3.5 h-3.5" />}
                    label={mode === "heloc" ? "Credit Line Amount" : "HE Loan Amount"}
                    value={`$${fmt(a.lineAmount as number)}`}
                    progressPct={((a.lineAmount as number) / 200000) * 100}
                    typicalRange={TYPICAL_RANGES.lineAmount.label}
                    color="#8B5CF6"
                  />
                  <ProfileItem
                    icon={<Percent className="w-3.5 h-3.5" />}
                    label="CLTV"
                    value={fmtPct(calc.cltv as number)}
                    progressPct={((calc.cltv as number) / 100) * 100}
                    typicalRange={TYPICAL_RANGES.cltv.label}
                    color={(calc.cltv as number) <= 85 ? "#10B981" : "#F59E0B"}
                  />
                  <ProfileItem
                    icon={<Percent className="w-3.5 h-3.5" />}
                    label="Debt-to-Income Ratio"
                    value={fmtPct(calc.back)}
                    progressPct={(calc.back / 60) * 100}
                    typicalRange={TYPICAL_RANGES.dti.label}
                    color={calc.back <= activeProgram.dtiBack.guideline ? "#10B981" : "#F59E0B"}
                  />
                </>
              )}
            </div>

            {/* RIGHT: Potential Loan Programs */}
            <div className="bg-white/[0.02] p-2.5 lg:p-3 rounded-lg border border-white/10">
              {mode !== "heloc" && mode !== "heq" ? (
                <>
                  <h3 className="text-[10px] lg:text-xs font-bold text-[#00b4d8] mb-0.5">Potential Loan Programs</h3>
                  <p className="text-[7.5px] lg:text-[9px] text-slate-400 leading-snug mb-2">
                    Based on the information you&apos;ve provided, here are programs that may be available to you. Final eligibility and loan terms are determined by the lender.
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {availablePrograms.map(([id, p]) => (
                      <ProgramCard
                        key={id}
                        programId={id}
                        programConfig={p}
                        termYears={a.term as number || 30}
                        backDti={calc.back}
                        ltvValue={ltvVal}
                        isActive={id === program}
                        onClick={() => {
                          setUserSelectedProgram(id);
                          setProgram(id);
                          if (mode === "purchase" && (a.downPct as number) < p.minDownPct) update("downPct", p.minDownPct);
                        }}
                      />
                    ))}
                  </div>
                </>
              ) : (
                /* HELOC / HEQ: Single program detail view */
                <>
                  <h3 className="text-[10px] lg:text-xs font-bold text-[#00b4d8] mb-0.5">
                    {mode === "heloc" ? "HELOC Details" : "Home Equity Loan Details"}
                  </h3>
                  <p className="text-[7.5px] lg:text-[9px] text-slate-400 leading-snug mb-2">
                    {mode === "heloc"
                      ? "Your home equity line of credit details based on current market rates and your equity position."
                      : "Your fixed-rate home equity loan details based on your equity position."}
                  </p>

                  {/* Payment Breakdown */}
                  <div className="bg-gradient-to-br from-[#131E35]/80 to-[#0F172A] p-2.5 rounded-lg border border-[#00b4d8]/20 shadow-sm">
                    <div className="text-[8px] lg:text-[9.5px] uppercase font-semibold text-slate-400 tracking-wider mb-1.5">Payment Breakdown</div>
                    <div className="flex h-2 lg:h-2.5 rounded-md overflow-hidden border border-white/10 bg-slate-900">
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
                    <div className="grid grid-cols-1 gap-y-0.5 mt-1.5 pt-1.5 border-t border-white/10">
                      {calc.segments.filter(s => s.value > 0).map((s, i) => (
                        <div key={s.label} className="flex items-center justify-between text-[8.5px] lg:text-[10px]">
                          <div className="flex items-center gap-1.5 truncate">
                            <span style={{ background: palette[i % palette.length] }} className="w-1.5 h-1.5 rounded-xs shrink-0" />
                            <span className="text-slate-400 truncate">{s.label}</span>
                          </div>
                          <span className="font-mono tabular-nums tracking-tight font-semibold text-white ml-1 shrink-0">${fmt(s.value)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-white/10">
                      <span className="text-[9px] lg:text-[10.5px] font-semibold text-white">Total Monthly</span>
                      <span className="text-xs lg:text-sm font-mono font-bold text-[#00b4d8] drop-shadow-[0_0_8px_rgba(0,180,216,0.35)]">
                        ${fmt(calc.pitia)}<span className="text-[9px] font-normal text-slate-400">/mo</span>
                      </span>
                    </div>
                  </div>

                  {/* DTI & CLTV Status */}
                  <div className="grid grid-cols-2 gap-1.5 mt-2">
                    <div className="bg-slate-900/60 p-2 rounded-md border border-white/5">
                      <div className="text-[8px] lg:text-[9.5px] text-slate-500">DTI</div>
                      <div className="text-xs lg:text-sm font-mono font-bold text-white">{fmtPct(calc.back)}</div>
                      <GuidelineStatus value={calc.back} guideline={activeProgram.dtiBack.guideline} />
                    </div>
                    <div className="bg-slate-900/60 p-2 rounded-md border border-white/5">
                      <div className="text-[8px] lg:text-[9.5px] text-slate-500">CLTV</div>
                      <div className="text-xs lg:text-sm font-mono font-bold text-white">{fmtPct(calc.cltv as number)}</div>
                      <GuidelineStatus value={calc.cltv as number} guideline={85} />
                    </div>
                  </div>

                  {mode === "heloc" && typeof calc.repaymentTotal === "number" && (
                    <div className="mt-2 p-2 rounded-lg bg-white/[0.02] border border-white/5 text-[7.5px] lg:text-[9px] text-slate-400">
                      <span className="font-semibold text-slate-300">After 10-yr draw period:</span> ~${fmt(calc.repaymentTotal)}/mo
                      <span className="text-slate-500"> (includes ${fmt(calc.repaymentPI || 0)} P&I repayment)</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ── Cash-out capped warning ── */}
          {mode === "refiCO" && calc.isCashOutCapped && (
            <div className="p-1.5 lg:p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[7.5px] lg:text-[9px] text-amber-300 flex items-center gap-1.5">
              <span className="shrink-0 font-bold">⚠️ Notice:</span>
              <span>Requested cash-out exceeds the conventional 80% LTV guideline (maximum guideline cash-out: ${fmt(calc.maxCashOutAt80 || 0)}).</span>
            </div>
          )}

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

          {/* ── 6. COLLAPSIBLE SCENARIO ASSUMPTIONS ── */}
          <div className="bg-white/[0.01] rounded-lg border border-white/5 overflow-hidden">
            <button
              onClick={() => setAssumptionsOpen(!assumptionsOpen)}
              className="w-full flex items-center justify-between p-2 lg:p-2.5 cursor-pointer hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-1 text-[8.5px] lg:text-[10.5px] font-bold text-[#00b4d8]">
                <SlidersHorizontal className="w-3 h-3" /> Adjust Scenario Assumptions
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const baselines = getBaselineAssumptions();
                    setAssump((prev) => ({ ...prev, [mode]: baselines[mode] }));
                    if (dataMode === "stated") {
                      setStatedDebts(monthlyDebts);
                    }
                  }}
                  className="text-[8px] lg:text-[10px] text-slate-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
                  title="Reset to your stated numbers"
                >
                  <RotateCcw className="w-2.5 h-2.5" /> Reset
                </button>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${assumptionsOpen ? "rotate-180" : ""}`} />
              </div>
            </button>

            {assumptionsOpen && (
              <div className="p-2 lg:p-2.5 pt-0 border-t border-white/5">
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
                  {mode === "heq" && (
                    <>
                      <SliderRow label="Home Value" value={a.homeValue as number} min={150000} max={1500000} step={5000} onChange={(v) => update("homeValue", v)} prefix="$" />
                      <SliderRow label="1st Balance" value={a.firstBalance as number} min={50000} max={a.homeValue as number} step={5000} onChange={(v) => update("firstBalance", v)} prefix="$" />
                      <SliderRow label="Loan Amount" value={a.lineAmount as number} min={10000} max={300000} step={2500} onChange={(v) => update("lineAmount", v)} prefix="$" />
                      <SliderRow label="Fixed Rate" value={a.rate as number} min={4.5} max={14} step={0.125} onChange={(v) => update("rate", v)} suffix="%" />
                      <SliderRow label="Insurance" value={a.insurance} min={40} max={400} step={10} onChange={(v) => update("insurance", v)} prefix="$" suffix="/mo" />
                      <ToggleRow label="Loan Term" options={[10, 15, 20]} value={a.term as number} onChange={(v) => update("term", v)} suffix="-yr" />
                    </>
                  )}
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

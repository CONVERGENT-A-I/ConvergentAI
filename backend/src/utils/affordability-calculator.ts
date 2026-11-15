import { ailanaConfig } from '../config/ailana-config.js';
import { lookupZipData } from './zip-lookup.js';

export interface AffordabilityInput {
  purchasePrice: number;
  downPayment: number;
  grossAnnualIncome: number;
  totalMonthlyDebt: number;
  programType: 'conventional' | 'fha' | 'va' | 'usda';
  zipCode?: string;
}

export interface AffordabilityResult {
  loanAmount: number;
  ltv: number;
  monthlyPI: number;
  monthlyTax: number;
  monthlyInsurance: number;
  monthlyMI: number;
  totalPITIA: number;
  incomeBand: 'within' | 'above';
  dtiBand: 'within' | 'above';
  dtiAboveHardCeiling: boolean;
  dti: number;
  fundingFeeAmount: number;
  cashToCloseLow: number;
  cashToCloseHigh: number;
  guidelineDti: number;
  isOverGuideline: boolean;
}

function conventionalPmiRate(ltv: number): number {
  if (ltv <= 0.80) return 0;
  if (ltv <= 0.85) return 0.0030;
  if (ltv <= 0.90) return 0.0051;
  if (ltv <= 0.95) return 0.0070;
  return 0.0090;
}

const PROGRAM_GUIDELINES: Record<string, number> = {
  conventional: 0.43,
  fha: 0.43,
  va: 0.41,
  usda: 0.41,
};

function roundTo500(n: number): number {
  return Math.round(n / 500) * 500;
}

/**
 * Calculates PITIA payment, LTV, and compliance status bands (income and DTI).
 * Sourced centrally from `ailanaConfig` representative rate and threshold constants.
 */
export function calculateAffordability(input: AffordabilityInput): AffordabilityResult {
  const { purchasePrice, downPayment, grossAnnualIncome, totalMonthlyDebt, programType, zipCode } = input;
  const cfg = ailanaConfig;

  // Safe boundary handling
  const safePurchasePrice = Math.max(0, purchasePrice);
  const safeDownPayment = Math.max(0, Math.min(downPayment, safePurchasePrice));
  const loanAmount = Math.max(0, safePurchasePrice - safeDownPayment);
  const ltv = safePurchasePrice > 0 ? loanAmount / safePurchasePrice : 0;
  const monthlyIncome = Math.max(0.01, grossAnnualIncome / 12); // Guard against divide-by-zero

  // Calculate VA Funding Fee
  let fundingFeeAmount = 0;
  if (programType === 'va') {
    fundingFeeAmount = loanAmount * 0.0215; // 2.15% standard first use VA funding fee
  }
  const totalLoanAmount = loanAmount + fundingFeeAmount;

  // 30-Year Fixed P&I Amortization
  const monthlyRate = cfg.representativeRate / 12;
  const n = 360;
  let monthlyPI = 0;
  if (totalLoanAmount > 0 && monthlyRate > 0) {
    monthlyPI = totalLoanAmount * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
  }

  const taxRate = zipCode ? lookupZipData(zipCode).propertyTaxRate : cfg.propertyTaxRate;
  const monthlyTax = (safePurchasePrice * taxRate) / 12;
  const monthlyInsurance = cfg.homeownersInsFlat ?? (safePurchasePrice * cfg.homeownersInsRate) / 12;

  let monthlyMI = 0;
  if (programType === 'conventional') {
    monthlyMI = (loanAmount * conventionalPmiRate(ltv)) / 12;
  } else if (programType === 'fha') {
    monthlyMI = (loanAmount * cfg.fhaMipRate) / 12;
  } else if (programType === 'va') {
    monthlyMI = 0;
  } else if (programType === 'usda') {
    monthlyMI = (loanAmount * cfg.usdaAnnualFeeRate) / 12;
  }

  const totalPITIA = monthlyPI + monthlyTax + monthlyInsurance + monthlyMI;
  const totalMonthlyDebtCombined = Math.max(0, totalMonthlyDebt) + totalPITIA;
  const dti = totalMonthlyDebtCombined / monthlyIncome;

  const guidelineDti = PROGRAM_GUIDELINES[programType] ?? 0.43;
  const cashToCloseLow  = roundTo500(safeDownPayment + safePurchasePrice * 0.02);
  const cashToCloseHigh = roundTo500(safeDownPayment + safePurchasePrice * 0.035);

  return {
    loanAmount: totalLoanAmount,
    ltv,
    monthlyPI,
    monthlyTax,
    monthlyInsurance,
    monthlyMI,
    totalPITIA,
    incomeBand: totalPITIA / monthlyIncome <= cfg.incomeBandThreshold ? 'within' : 'above',
    dtiBand: dti <= cfg.dtiBandThreshold ? 'within' : 'above',
    dtiAboveHardCeiling: dti > cfg.dtiHardCeiling,
    dti,
    fundingFeeAmount,
    cashToCloseLow,
    cashToCloseHigh,
    guidelineDti,
    isOverGuideline: dti > guidelineDti,
  };
}

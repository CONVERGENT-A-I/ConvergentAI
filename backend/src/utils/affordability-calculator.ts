import { ailanaConfig } from '../config/ailana-config.js';

export interface AffordabilityInput {
  purchasePrice: number;
  downPayment: number;
  grossAnnualIncome: number;
  totalMonthlyDebt: number;       // From soft pull tradeline minimums
  programType: 'conventional' | 'fha' | 'va' | 'usda';
}

export interface AffordabilityResult {
  loanAmount: number;
  ltv: number;
  monthlyPI: number;              // Principal & Interest
  monthlyTax: number;             // Property tax estimate
  monthlyInsurance: number;       // Homeowners insurance estimate
  monthlyMI: number;              // Mortgage insurance
  totalPITIA: number;             // Full monthly payment
  incomeBand: 'within' | 'above';
  dtiBand: 'within' | 'above';
  dtiAboveHardCeiling: boolean;   // True if back-end DTI > 50% (FHLMC hard ceiling)
  dti: number;                    // Internal audit log use — NOT displayed to borrower
}

/**
 * Calculates PITIA payment, LTV, and compliance status bands (income and DTI).
 * Sourced centrally from `ailanaConfig` representative rate and threshold constants.
 */
export function calculateAffordability(input: AffordabilityInput): AffordabilityResult {
  const { purchasePrice, downPayment, grossAnnualIncome, totalMonthlyDebt, programType } = input;
  const cfg = ailanaConfig;

  // Safe boundary handling
  const safePurchasePrice = Math.max(0, purchasePrice);
  const safeDownPayment = Math.max(0, Math.min(downPayment, safePurchasePrice));
  const loanAmount = Math.max(0, safePurchasePrice - safeDownPayment);
  const ltv = safePurchasePrice > 0 ? loanAmount / safePurchasePrice : 0;
  const monthlyIncome = Math.max(0.01, grossAnnualIncome / 12); // Guard against divide-by-zero

  // 30-Year Fixed P&I Amortization
  const monthlyRate = cfg.representativeRate / 12;
  const n = 360;
  let monthlyPI = 0;
  if (loanAmount > 0 && monthlyRate > 0) {
    monthlyPI = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
  }

  // Tax & Insurance estimates
  const monthlyTax = (safePurchasePrice * cfg.propertyTaxRate) / 12;
  const monthlyInsurance = (safePurchasePrice * cfg.homeownersInsRate) / 12;

  // Program-Aware Mortgage Insurance
  let monthlyMI = 0;
  if (programType === 'conventional') {
    monthlyMI = ltv > 0.80 ? (loanAmount * cfg.conventionalPmiRate) / 12 : 0;
  } else if (programType === 'fha') {
    monthlyMI = (loanAmount * cfg.fhaMipRate) / 12;
  } else if (programType === 'va') {
    monthlyMI = 0; // VA has a one-time upfront funding fee, zero monthly MI
  } else if (programType === 'usda') {
    monthlyMI = (loanAmount * cfg.usdaAnnualFeeRate) / 12;
  }

  const totalPITIA = monthlyPI + monthlyTax + monthlyInsurance + monthlyMI;
  const totalMonthlyDebtCombined = Math.max(0, totalMonthlyDebt) + totalPITIA;
  const dti = totalMonthlyDebtCombined / monthlyIncome;

  return {
    loanAmount,
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
  };
}

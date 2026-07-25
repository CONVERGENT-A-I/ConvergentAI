/**
 * Affordability Calculator — Next.js copy
 * Mirrors backend/src/utils/affordability-calculator.ts exactly.
 * Lives here because Next.js (Turbopack) cannot cross the monorepo boundary
 * and import files from the separate backend package.
 */

const ailanaConfig = {
  representativeRate:    parseFloat(process.env.REPRESENTATIVE_RATE    ?? '0.06875'),
  incomeBandThreshold:   parseFloat(process.env.INCOME_BAND_THRESHOLD  ?? '0.28'),
  dtiBandThreshold:      parseFloat(process.env.DTI_BAND_THRESHOLD     ?? '0.45'),
  dtiHardCeiling:        parseFloat(process.env.DTI_HARD_CEILING       ?? '0.50'),
  propertyTaxRate:       parseFloat(process.env.PROPERTY_TAX_RATE      ?? '0.012'),
  homeownersInsRate:     parseFloat(process.env.HOMEOWNERS_INS_RATE    ?? '0.005'),
  conventionalPmiRate:   parseFloat(process.env.CONVENTIONAL_PMI_RATE  ?? '0.0085'),
  fhaMipRate:            parseFloat(process.env.FHA_MIP_RATE           ?? '0.0055'),
  usdaAnnualFeeRate:     parseFloat(process.env.USDA_ANNUAL_FEE_RATE   ?? '0.0035'),
};

export interface AffordabilityInput {
  purchasePrice:      number;
  downPayment:        number;
  grossAnnualIncome:  number;
  totalMonthlyDebt:   number;
  programType:        'conventional' | 'fha' | 'va' | 'usda';
}

export interface AffordabilityResult {
  loanAmount:           number;
  ltv:                  number;
  monthlyPI:            number;
  monthlyTax:           number;
  monthlyInsurance:     number;
  monthlyMI:            number;
  totalPITIA:           number;
  incomeBand:           'within' | 'above';
  dtiBand:              'within' | 'above';
  dtiAboveHardCeiling:  boolean;
  dti:                  number;  // Internal — do NOT return to client
}

export function calculateAffordability(input: AffordabilityInput): AffordabilityResult {
  const { purchasePrice, downPayment, grossAnnualIncome, totalMonthlyDebt, programType } = input;
  const cfg = ailanaConfig;

  const safePurchasePrice = Math.max(0, purchasePrice);
  const safeDownPayment   = Math.max(0, Math.min(downPayment, safePurchasePrice));
  const loanAmount        = Math.max(0, safePurchasePrice - safeDownPayment);
  const ltv               = safePurchasePrice > 0 ? loanAmount / safePurchasePrice : 0;
  const monthlyIncome     = Math.max(0.01, grossAnnualIncome / 12);

  // 30-Year Fixed P&I
  const monthlyRate = cfg.representativeRate / 12;
  const n = 360;
  let monthlyPI = 0;
  if (loanAmount > 0 && monthlyRate > 0) {
    monthlyPI =
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, n))) /
      (Math.pow(1 + monthlyRate, n) - 1);
  }

  const monthlyTax       = (safePurchasePrice * cfg.propertyTaxRate) / 12;
  const monthlyInsurance = (safePurchasePrice * cfg.homeownersInsRate) / 12;

  let monthlyMI = 0;
  if      (programType === 'conventional') monthlyMI = ltv > 0.80 ? (loanAmount * cfg.conventionalPmiRate) / 12 : 0;
  else if (programType === 'fha')          monthlyMI = (loanAmount * cfg.fhaMipRate) / 12;
  else if (programType === 'va')           monthlyMI = 0;
  else if (programType === 'usda')         monthlyMI = (loanAmount * cfg.usdaAnnualFeeRate) / 12;

  const totalPITIA            = monthlyPI + monthlyTax + monthlyInsurance + monthlyMI;
  const totalMonthlyDebtCombined = Math.max(0, totalMonthlyDebt) + totalPITIA;
  const dti                   = totalMonthlyDebtCombined / monthlyIncome;

  return {
    loanAmount,
    ltv,
    monthlyPI,
    monthlyTax,
    monthlyInsurance,
    monthlyMI,
    totalPITIA,
    incomeBand:          totalPITIA / monthlyIncome <= cfg.incomeBandThreshold ? 'within' : 'above',
    dtiBand:             dti <= cfg.dtiBandThreshold ? 'within' : 'above',
    dtiAboveHardCeiling: dti > cfg.dtiHardCeiling,
    dti,
  };
}

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
  propertyTaxRate:       parseFloat(process.env.PROPERTY_TAX_RATE      ?? '0.0084'),
  homeownersInsFlat:     parseFloat(process.env.HOMEOWNERS_INS_FLAT    ?? '130'),
  homeownersInsRate:     parseFloat(process.env.HOMEOWNERS_INS_RATE    ?? '0.005'),
  fhaMipRate:            parseFloat(process.env.FHA_MIP_RATE           ?? '0.0055'),
  usdaAnnualFeeRate:     parseFloat(process.env.USDA_ANNUAL_FEE_RATE   ?? '0.0035'),
};

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

export interface AffordabilityInput {
  purchasePrice:      number;
  downPayment:        number;
  grossAnnualIncome:  number;
  totalMonthlyDebt:   number;
  programType:        'conventional' | 'fha' | 'va' | 'usda';
  zipCode?:           string;
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
  dti:                  number;
  frontEndDti:          number;
  backEndDti:           number;
  fundingFeeAmount:     number;
  cashToCloseLow:       number;
  cashToCloseHigh:      number;
  guidelineDti:         number;
  isOverGuideline:      boolean;
}

export function calculateAffordability(input: AffordabilityInput): AffordabilityResult {
  const { purchasePrice, downPayment, grossAnnualIncome, totalMonthlyDebt, programType, zipCode } = input;
  const cfg = ailanaConfig;

  const safePurchasePrice = Math.max(0, purchasePrice);
  const safeDownPayment   = Math.max(0, Math.min(downPayment, safePurchasePrice));
  const loanAmount        = Math.max(0, safePurchasePrice - safeDownPayment);
  const ltv               = safePurchasePrice > 0 ? loanAmount / safePurchasePrice : 0;
  const monthlyIncome     = Math.max(0.01, grossAnnualIncome / 12);

  let fundingFeeAmount = 0;
  if (programType === 'va') {
    fundingFeeAmount = loanAmount * 0.0215; // 2.15% standard first use VA funding fee
  }
  const totalLoanAmount = loanAmount + fundingFeeAmount;

  // Dynamic property tax rate based on zip code state prefix
  let taxRate = cfg.propertyTaxRate;
  if (zipCode) {
    const cleanZip = zipCode.trim();
    if (cleanZip.startsWith('78') || cleanZip.startsWith('75') || cleanZip.includes('TX')) taxRate = 0.017;
    else if (cleanZip.startsWith('90') || cleanZip.startsWith('94') || cleanZip.includes('CA')) taxRate = 0.0125;
    else if (cleanZip.includes('NJ')) taxRate = 0.0249;
    else if (cleanZip.includes('NY')) taxRate = 0.0169;
  }

  // 30-Year Fixed P&I
  const monthlyRate = cfg.representativeRate / 12;
  const n = 360;
  let monthlyPI = 0;
  if (totalLoanAmount > 0 && monthlyRate > 0) {
    monthlyPI =
      (totalLoanAmount * (monthlyRate * Math.pow(1 + monthlyRate, n))) /
      (Math.pow(1 + monthlyRate, n) - 1);
  }

  const monthlyTax       = (safePurchasePrice * taxRate) / 12;
  const monthlyInsurance = cfg.homeownersInsFlat;

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

  const totalPITIA            = monthlyPI + monthlyTax + monthlyInsurance + monthlyMI;
  const totalMonthlyDebtCombined = Math.max(0, totalMonthlyDebt) + totalPITIA;
  const dti                   = totalMonthlyDebtCombined / monthlyIncome;
  const frontEndDti           = totalPITIA / monthlyIncome;
  const backEndDti            = dti;

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
    incomeBand:          totalPITIA / monthlyIncome <= cfg.incomeBandThreshold ? 'within' : 'above',
    dtiBand:             dti <= cfg.dtiBandThreshold ? 'within' : 'above',
    dtiAboveHardCeiling: dti > cfg.dtiHardCeiling,
    dti,
    frontEndDti,
    backEndDti,
    fundingFeeAmount,
    cashToCloseLow,
    cashToCloseHigh,
    guidelineDti,
    isOverGuideline:     backEndDti > guidelineDti,
  };
}

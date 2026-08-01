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
  dti:                  number;  // Internal — back-end dti ratio
  frontEndDti:          number;  // Housing ratio (PITIA / Monthly Income)
  backEndDti:           number;  // Total DTI ratio ((PITIA + Monthly Debt) / Monthly Income)
  fundingFeeAmount:     number;  // One-time VA funding fee amount
}

export function calculateAffordability(input: AffordabilityInput): AffordabilityResult {
  const { purchasePrice, downPayment, grossAnnualIncome, totalMonthlyDebt, programType, zipCode } = input;
  const cfg = ailanaConfig;

  const safePurchasePrice = Math.max(0, purchasePrice);
  const safeDownPayment   = Math.max(0, Math.min(downPayment, safePurchasePrice));
  const loanAmount        = Math.max(0, safePurchasePrice - safeDownPayment);
  const ltv               = safePurchasePrice > 0 ? loanAmount / safePurchasePrice : 0;
  const monthlyIncome     = Math.max(0.01, grossAnnualIncome / 12);

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
  if (loanAmount > 0 && monthlyRate > 0) {
    monthlyPI =
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, n))) /
      (Math.pow(1 + monthlyRate, n) - 1);
  }

  const monthlyTax       = (safePurchasePrice * taxRate) / 12;
  const monthlyInsurance = (safePurchasePrice * cfg.homeownersInsRate) / 12;

  let monthlyMI = 0;
  let fundingFeeAmount = 0;
  if      (programType === 'conventional') monthlyMI = ltv > 0.80 ? (loanAmount * cfg.conventionalPmiRate) / 12 : 0;
  else if (programType === 'fha')          monthlyMI = (loanAmount * cfg.fhaMipRate) / 12;
  else if (programType === 'va')           {
    monthlyMI = 0;
    fundingFeeAmount = loanAmount * 0.0215; // 2.15% standard first use VA funding fee
  }
  else if (programType === 'usda')         monthlyMI = (loanAmount * cfg.usdaAnnualFeeRate) / 12;

  const totalPITIA            = monthlyPI + monthlyTax + monthlyInsurance + monthlyMI;
  const totalMonthlyDebtCombined = Math.max(0, totalMonthlyDebt) + totalPITIA;
  const dti                   = totalMonthlyDebtCombined / monthlyIncome;
  const frontEndDti           = totalPITIA / monthlyIncome;
  const backEndDti            = dti;

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
    frontEndDti,
    backEndDti,
    fundingFeeAmount,
  };
}

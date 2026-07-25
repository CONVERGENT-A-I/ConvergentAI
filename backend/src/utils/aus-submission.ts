import type { BorrowerProfile } from '../prompts/layer3-context.js';
import { calculateAffordability } from './affordability-calculator.js';
import { ailanaConfig } from '../config/ailana-config.js';

export interface AusPayload {
  // From soft credit pull
  creditScore: number;
  monthlyLiabilities: number;
  derogatoryFlags: boolean;

  // From conversational answers
  grossMonthlyIncome: number;
  employmentType: string;
  selfEmployed: boolean;
  coBorrowerIncome: number;
  downPayment: number;
  purchasePrice: number;
  occupancyType: string;
  propertyType: string;
  transactionType: string;

  // From system calculations
  representativeRate: number;
  loanAmount: number;
  ltv: number;
  estimatedDti: number;
  estimatedPitia: number;
}

export function buildAusPayload(
  profile: BorrowerProfile,
  sliderValues: { purchasePrice: number; downPayment: number }
): AusPayload {
  const purchasePrice = sliderValues.purchasePrice;
  const downPayment = sliderValues.downPayment;
  const grossAnnualIncome = profile.gross_annual_income ?? 120000;
  const totalMonthlyDebt = profile.monthly_debt ?? 500;

  // Program type inference
  let programType: 'conventional' | 'fha' | 'va' | 'usda' = 'conventional';
  if (profile.military_rural === 'military' || profile.military_rural === 'both') {
    programType = 'va';
  } else if (profile.military_rural === 'rural') {
    programType = 'usda';
  } else if (profile.credit_range && profile.credit_range.includes('580')) {
    programType = 'fha';
  }

  const calc = calculateAffordability({
    purchasePrice,
    downPayment,
    grossAnnualIncome,
    totalMonthlyDebt,
    programType,
  });

  return {
    creditScore: profile.credit_range ? parseInt(profile.credit_range, 10) || 720 : 720,
    monthlyLiabilities: totalMonthlyDebt,
    derogatoryFlags: false,
    grossMonthlyIncome: grossAnnualIncome / 12,
    employmentType: profile.employment_position ?? 'Salaried',
    selfEmployed: profile.self_employed ?? false,
    coBorrowerIncome: 0,
    downPayment,
    purchasePrice,
    occupancyType: profile.occupancy ?? 'primary',
    propertyType: profile.property_type ?? 'single_family',
    transactionType: profile.mortgage_goal ?? 'purchase',
    representativeRate: ailanaConfig.representativeRate,
    loanAmount: calc.loanAmount,
    ltv: calc.ltv,
    estimatedDti: calc.dti,
    estimatedPitia: calc.totalPITIA,
  };
}

export async function submitToAus(payload: AusPayload): Promise<'approve_eligible' | 'refer'> {
  console.log('[AUS-Service]: Submitting loan payload to Automated Underwriting System...', {
    loanAmount: payload.loanAmount,
    ltv: (payload.ltv * 100).toFixed(1) + '%',
    dti: (payload.estimatedDti * 100).toFixed(1) + '%',
  });

  // Mock AUS processing latency (2 - 4 seconds)
  await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 2000));

  // High DTI (>50%) or low credit score triggers 'refer'
  if (payload.estimatedDti > ailanaConfig.dtiHardCeiling) {
    console.log('[AUS-Service]: AUS Result: REFER (DTI above hard ceiling)');
    return 'refer';
  }

  // 80% Approve/Eligible, 20% Refer for realistic testing
  const isApproved = Math.random() < 0.8;
  const status = isApproved ? 'approve_eligible' : 'refer';
  console.log(`[AUS-Service]: AUS Result: ${status.toUpperCase()}`);
  return status;
}

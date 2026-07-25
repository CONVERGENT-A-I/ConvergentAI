/**
 * AUS Submission helper — Next.js copy
 * Mirrors backend/src/utils/aus-submission.ts (mock AUS logic only).
 * Lives here because Next.js (Turbopack) cannot cross the monorepo boundary.
 */

import { calculateAffordability } from './affordability-calculator';

const DTI_HARD_CEILING = parseFloat(process.env.DTI_HARD_CEILING ?? '0.50');
const REPRESENTATIVE_RATE = parseFloat(process.env.REPRESENTATIVE_RATE ?? '0.06875');

export interface AusPayload {
  creditScore:        number;
  monthlyLiabilities: number;
  derogatoryFlags:    boolean;
  grossMonthlyIncome: number;
  employmentType:     string;
  selfEmployed:       boolean;
  coBorrowerIncome:   number;
  downPayment:        number;
  purchasePrice:      number;
  occupancyType:      string;
  propertyType:       string;
  transactionType:    string;
  representativeRate: number;
  loanAmount:         number;
  ltv:                number;
  estimatedDti:       number;
  estimatedPitia:     number;
}

export function buildAusPayload(
  profile: Record<string, any>,
  sliderValues: { purchasePrice: number; downPayment: number }
): AusPayload {
  const { purchasePrice, downPayment } = sliderValues;
  const grossAnnualIncome = profile.gross_annual_income ?? 120000;
  const totalMonthlyDebt  = profile.monthly_debt ?? 500;

  let programType: 'conventional' | 'fha' | 'va' | 'usda' = 'conventional';
  if (profile.military_rural === 'military' || profile.military_rural === 'both') {
    programType = 'va';
  } else if (profile.military_rural === 'rural') {
    programType = 'usda';
  } else if (typeof profile.credit_range === 'string' && profile.credit_range.includes('580')) {
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
    creditScore:        profile.credit_range ? parseInt(profile.credit_range, 10) || 720 : 720,
    monthlyLiabilities: totalMonthlyDebt,
    derogatoryFlags:    false,
    grossMonthlyIncome: grossAnnualIncome / 12,
    employmentType:     profile.employment_position ?? 'Salaried',
    selfEmployed:       profile.self_employed ?? false,
    coBorrowerIncome:   0,
    downPayment,
    purchasePrice,
    occupancyType:      profile.occupancy ?? 'primary',
    propertyType:       profile.property_type ?? 'single_family',
    transactionType:    profile.mortgage_goal ?? 'purchase',
    representativeRate: REPRESENTATIVE_RATE,
    loanAmount:         calc.loanAmount,
    ltv:                calc.ltv,
    estimatedDti:       calc.dti,
    estimatedPitia:     calc.totalPITIA,
  };
}

export async function submitToAus(payload: AusPayload): Promise<'approve_eligible' | 'refer'> {
  console.log('[AUS-Service]: Submitting loan payload...', {
    loanAmount: payload.loanAmount,
    ltv: (payload.ltv * 100).toFixed(1) + '%',
    dti: (payload.estimatedDti * 100).toFixed(1) + '%',
  });

  // Mock AUS latency (2–4 s)
  await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 2000));

  if (payload.estimatedDti > DTI_HARD_CEILING) {
    console.log('[AUS-Service]: REFER — DTI above hard ceiling');
    return 'refer';
  }

  const status: 'approve_eligible' | 'refer' = Math.random() < 0.8 ? 'approve_eligible' : 'refer';
  console.log(`[AUS-Service]: AUS Result: ${status.toUpperCase()}`);
  return status;
}

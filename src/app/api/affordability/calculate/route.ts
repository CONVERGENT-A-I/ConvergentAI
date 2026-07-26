import { NextRequest, NextResponse } from 'next/server';
import { calculateAffordability } from '@/lib/affordability-calculator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { purchasePrice, downPayment, grossAnnualIncome, totalMonthlyDebt, programType, zipCode } = body;

    const result = calculateAffordability({
      purchasePrice:     Number(purchasePrice)     || 0,
      downPayment:       Number(downPayment)       || 0,
      grossAnnualIncome: Number(grossAnnualIncome) || 120000,
      totalMonthlyDebt:  Number(totalMonthlyDebt)  || 500,
      programType:       (programType as any)      ?? 'conventional',
      zipCode:           zipCode ? String(zipCode) : undefined,
    });

    // IMPORTANT: Compliance rule — raw dti percentage is NOT returned to client
    return NextResponse.json({
      totalPITIA:          Math.round(result.totalPITIA),
      monthlyMI:           Math.round(result.monthlyMI),
      incomeBand:          result.incomeBand,
      dtiBand:             result.dtiBand,
      dtiAboveHardCeiling: result.dtiAboveHardCeiling,
    });
  } catch (error: any) {
    console.error('[API-Affordability-Calculate] Error:', error);
    return NextResponse.json({ error: 'Failed to calculate affordability' }, { status: 400 });
  }
}

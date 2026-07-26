import { NextRequest, NextResponse } from 'next/server';
import { buildAusPayload, submitToAus } from '@/lib/aus-submission';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profile, sliderValues, mode } = body;
    const affordabilityMode = mode || profile?.affordability_mode || 'verified';

    const payload   = buildAusPayload(profile || {}, sliderValues || { purchasePrice: 500000, downPayment: 100000 });
    const ausStatus = await submitToAus(payload);

    return NextResponse.json({
      ausStatus,
      submittedAt: new Date().toISOString(),
      mode: affordabilityMode,
      isStatedMode: affordabilityMode === 'stated',
    });
  } catch (error: any) {
    console.error('[API-Affordability-Submit] Error:', error);
    return NextResponse.json({ error: 'Failed to submit for AUS review' }, { status: 400 });
  }
}

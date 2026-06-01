// Consolidated to Express Backend: LiveKit token generation and Keyframe Labs session logic
// have been centralized in backend/src/index.ts to avoid duplicate endpoints.
// The frontend (floating-cta.tsx) communicates directly with the Express backend on port 3001.

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Endpoint consolidated. Please use the Express backend token endpoint instead." },
    { status: 410 }
  );
}

// Legacy / Orphaned Route: Unused direct OpenAI ChatCompletions endpoint.
// The frontend (floating-cta.tsx) uses LiveKit's DataChannel to stream all real-time voice and chat communication
// directly through the Express backend agent worker (backend/src/agent.ts).

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  return NextResponse.json(
    { error: "Endpoint legacy. All chat communication streams through the LiveKit agent worker instead." },
    { status: 410 }
  );
}

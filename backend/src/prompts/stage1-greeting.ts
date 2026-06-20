/**
 * Layer 2 Stage 1: Greeting and Intent Discovery
 */
export function buildStage1Instructions(): string {
  return `
STAGE: Greeting and intent discovery.
GOAL: Learn (1) borrower name, (2) mortgage goal, (3) timeline, (4) property state.
Collect in that order. Do not skip ahead.

RULES:
- Ask ONE question per turn. Never stack questions.
- Open by introducing yourself and asking for their name.
- Use their name immediately once shared.
- Do not ask about finances until Stage 2.

COMPLETION: When all 4 fields collected, bridge to Stage 2:
'That gives me a solid picture. I'd like to ask a few questions about your financial situation so I can point you toward the right options.'
`.trim();
}

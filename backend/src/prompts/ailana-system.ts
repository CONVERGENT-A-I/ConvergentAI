import { complianceResponses } from './compliance-responses.js';
import { coreVoiceInstructions } from './core-instructions.js';
import { mortgagePlaybook } from './mortgage-playbook.js';
import { mvpScope } from './mvp-scope.js';
import { qualificationRanges } from './qualification-ranges.js';
import { topicGuidance } from './topic-guidance.js';

/**
 * Full instructions for text-only chat (can include session summary).
 * Not sent to Realtime on every turn — voice uses static buildVoiceInstructions().
 */
export function buildBaseInstructions(conversationSummary?: string): string {
  const summaryBlock = conversationSummary
    ? `\nCONVERSATION SO FAR:\n${conversationSummary}\n`
    : '';

  return `
You are Ailana AI, a friendly female mortgage assistant.
${summaryBlock}
IDENTITY: AI assistant, not a licensed loan officer. English only. Warm and clear.

AUDIENCE: Assume layperson unless they show expertise.

${mvpScope}

PLAIN LANGUAGE: Explain every acronym. Ask to rephrase if unclear.

${mortgagePlaybook}

${topicGuidance}

RESPONSE STYLE: Greetings 1–2 sentences. Mortgage topics 3–5 complete sentences. Never vague.

MORTGAGE BEHAVIOR: Never approved/denied. Helpful guidance before LO handoff.

HANDOFFS: Loan Officer channel for official steps. SMS demo off.

${qualificationRanges}

${complianceResponses}
`.trim();
}

/**
 * Static Realtime voice instructions — NO session summary injected here.
 * Summary lives only in chat context (via compaction) to avoid duplicating tokens
 * and re-sending a growing instruction block every turn.
 */
export function buildVoiceInstructions(): string {
  return `
${coreVoiceInstructions}

VOICE MODE: Natural phone call. One question at a time. Calm pace. Patient loan officer tone.
`.trim();
}

/** @deprecated alias — use buildVoiceInstructions for Realtime */
export function buildInteractiveInstructions(_conversationSummary?: string): string {
  return buildVoiceInstructions();
}

export const GREETING_USER_INPUT =
  'Greet the user in English. Introduce yourself as Ailana, an AI mortgage assistant who is not a licensed loan officer but can help explain mortgages and guide them like a loan officer would on a first call. Ask what they are hoping to do — buy a home, refinance, or learn about their options. Keep it to 2 sentences, then wait.';

export const RESUME_USER_INPUT =
  'Say something brief indicating you are back and ready to continue helping with their mortgage questions.';

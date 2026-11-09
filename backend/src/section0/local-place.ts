/**
 * Section 0 — a city with no state (e.g. "Cleveland": Tennessee or Ohio?).
 *
 * The extractor fills a state for a city the borrower named without one, and sometimes guesses the
 * better-known place (Cleveland → Ohio) when the lender's local one was meant (Cleveland, Tennessee, next
 * to Chattanooga). Asking the model which place exists or is meant proved unreliable both ways, so code
 * follows the project rule instead: a low-confidence value gets one confirmation, never a guess.
 *
 * The model answers only what it can read from the message itself: did the borrower name the state or give
 * a ZIP? If not, and the guessed state is outside the lender's states, the session asks once which state it
 * is (session-context-manager `checkUnstatedState`). Runs only in that case, so ordinary turns pay nothing.
 */
import { inference, llm } from '@livekit/agents';

/** Parse `{"state_said": bool}` (code fences tolerated). Pure — unit tested. */
export function parseStateSaid(raw: string | null | undefined): boolean | null {
  if (!raw) return null;
  const text = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    const j = JSON.parse(text.slice(start, end + 1));
    return typeof j.state_said === 'boolean' ? j.state_said : null;
  } catch {
    return null;
  }
}

let placeLlm: inference.LLM | null = null;
function getLlm(): inference.LLM {
  if (!placeLlm) placeLlm = new inference.LLM({ model: 'google/gemma-4-31b-it' });
  return placeLlm;
}

/** Did the borrower name the state (or give a ZIP) for this city? null when the check could not run. */
export async function checkStateSaid(message: string, city: string): Promise<boolean | null> {
  const chatCtx = new llm.ChatContext();
  chatCtx.addMessage({
    role: 'system',
    content:
      'Answer with JSON only: {"state_said": <bool>}.\n' +
      `state_said = the borrower's message itself names the US state (full name or abbreviation) or gives a ZIP code for "${city}". ` +
      'A state they live in or are leaving does not count.',
  });
  chatCtx.addMessage({ role: 'user', content: `Borrower's message: "${message}"` });
  try {
    const collected = await getLlm().chat({ chatCtx }).collect();
    return parseStateSaid(collected.text);
  } catch (err: any) {
    console.warn('[section0] state-said check failed:', err?.message ?? err);
    return null;
  }
}

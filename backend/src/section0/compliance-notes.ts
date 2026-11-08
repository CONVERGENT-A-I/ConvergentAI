/**
 * Section 0 — compliance notes (plan §6.7, S0-23).
 *
 * Code decides WHEN a compliance response is needed, from the extractor's compliance flags and from
 * facts in the ledger — never from the raw wording. Each note is shown to the model on the turn it
 * applies and only once per session (`shown`). Pure — no I/O.
 */
import type { ComplianceFlag, IncomeComponent } from './fact-schema.js';
import type { FactLedger } from './fact-ledger.js';
import { tridGateScript } from './safety-net.js';
import { destinationArea } from './turn-context.js';

export const PRIVACY_POLICY_URL = 'https://convergentai.tech/privacy';

/** David's approved privacy answer (Nov 7, 2026). Voice never reads the URL aloud. */
export function privacyScript(channel: 'voice' | 'text', continueWith: string): string {
  const core =
    "That's a fair question to ask before we start. I'm provided by ConvergentAI, a technology company, and the best answer is in ConvergentAI's privacy policy" +
    (channel === 'voice' ? ", so I'll put the link on your screen." : '.') +
    " It explains what information is collected, how it's used, and when it may be shared. It also explains how you can ask to see, correct, or delete your information, or opt out of its sale or sharing. If you'd like to talk through how your information is handled before we go on, I can connect you with a licensed loan officer. Otherwise, whenever you're ready, " +
    continueWith + '.';
  if (channel === 'voice') return core;
  return `${core} You can read how your information is handled under ConvergentAI's privacy policy: ${PRIVACY_POLICY_URL}. You can also submit a request about your information there.`;
}

/** takesTurn: the note asks the borrower something, so it IS this turn's task (other questions wait a turn). */
export interface ComplianceNote { id: string; text: string; takesTurn?: boolean }

const STATE_CODES: Record<string, string> = {
  alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR', california: 'CA', colorado: 'CO', connecticut: 'CT', delaware: 'DE',
  florida: 'FL', georgia: 'GA', hawaii: 'HI', idaho: 'ID', illinois: 'IL', indiana: 'IN', iowa: 'IA', kansas: 'KS', kentucky: 'KY',
  louisiana: 'LA', maine: 'ME', maryland: 'MD', massachusetts: 'MA', michigan: 'MI', minnesota: 'MN', mississippi: 'MS', missouri: 'MO',
  montana: 'MT', nebraska: 'NE', nevada: 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
  'north carolina': 'NC', 'north dakota': 'ND', ohio: 'OH', oklahoma: 'OK', oregon: 'OR', pennsylvania: 'PA', 'rhode island': 'RI',
  'south carolina': 'SC', 'south dakota': 'SD', tennessee: 'TN', texas: 'TX', utah: 'UT', vermont: 'VT', virginia: 'VA', washington: 'WA',
  'west virginia': 'WV', wisconsin: 'WI', wyoming: 'WY', 'district of columbia': 'DC',
};
const CODE_TO_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(STATE_CODES).map(([name, code]) => [code, name.replace(/\b\w/g, (c) => c.toUpperCase())]),
);

/** Two-letter state code from a stated state ("Georgia", "ga", "GA"), or null. */
export function stateCode(s: unknown): string | null {
  if (typeof s !== 'string') return null;
  const t = s.trim().toLowerCase().replace(/\./g, '');
  if (/^[a-z]{2}$/.test(t) && CODE_TO_NAME[t.toUpperCase()]) return t.toUpperCase();
  return STATE_CODES[t] ?? null;
}

/** Full names of the lender's licensed states, e.g. ["Tennessee"]. */
export function lenderStateNames(): string[] {
  return lenderStates().map((c) => CODE_TO_NAME[c] ?? c);
}

/** States the lender is licensed in (decision D3). Env `LENDER_LICENSED_STATES`, e.g. "TN,GA". */
export function lenderStates(): string[] {
  return (process.env.LENDER_LICENSED_STATES ?? 'TN').split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
}

export interface NotesInput {
  flags: ComplianceFlag[];
  ledger: FactLedger;
  shown: string[];
  channel: 'voice' | 'text';
  /** How the privacy answer ends, e.g. "let's pick up with your refinance". */
  continueWith: string;
  licensedStates: string[];
  /** The safety net removed an SSN and/or street address from this message. */
  safetyHit?: { ssn: boolean; address: boolean } | null;
  /** Turn number — the TRID gate is given every time it is needed, not once per session. */
  turn?: number;
  /** The extractor's intent for this message. */
  intent?: string;
}

/** The compliance notes needed this turn that have not been shown yet. */
export function complianceNotes(input: NotesInput): ComplianceNote[] {
  const { flags, ledger, shown } = input;
  const out: ComplianceNote[] = [];
  const add = (id: string, text: string, takesTurn = false) => { if (!shown.includes(id) && !out.some((n) => n.id === id)) out.push(takesTurn ? { id, text, takesTurn } : { id, text }); };
  const has = (f: ComplianceFlag) => flags.includes(f);

  if (input.safetyHit && (input.safetyHit.ssn || input.safetyHit.address)) {
    const areaKnown = !!ledger.value('location.area');
    add(`trid_gate:${input.turn ?? 0}`, `They started to give a Social Security number or street address. It was removed — never repeat or ask for it. Say exactly: "${tridGateScript(input.safetyHit)}"` +
      (areaKnown ? '' : ' Then ask for just the city or zip code of the home as your next question.'));
  }
  if (input.intent === 'ends_conversation') {
    add(`closing:${input.turn ?? 0}`, 'They are wrapping up. Thank them warmly in one or two sentences, say they can come back or reach a licensed loan officer anytime, and do NOT ask another question (this overrides the current task).');
  }
  if (has('privacy_question')) {
    add('privacy', `PRIVACY QUESTION — answer first with this approved wording, word for word, then continue:\n"${privacyScript(input.channel, input.continueWith)}"`);
  }
  // Two independent signals: the compliance flag, or the stated fact (the model sometimes gives only one).
  if (has('approval_guarantee_or_preapproval_letter') || ledger.value('situation.preapproval_letter') === true) {
    add('preapproval', 'Do NOT confirm or imply any pre-approval, approval or amount you did not issue, and say you cannot verify a letter you did not send. Ask what the letter or offer is about.', true);
  }
  if (has('protected_class_topic')) {
    add('protected_class', 'Explain that loan programs are never based on race, ethnicity, national origin, religion, sex, age, marital or familial status, and do not ask about or repeat any of these. You may mention programs that depend on things like first-time-buyer status, income or location.');
  }
  if (has('hardship_or_delinquency')) {
    add('hardship', 'Respond with empathy. Do NOT promise or suggest a refinance or any outcome. Offer to connect them with a licensed loan officer, and mention that a HUD-approved housing counselor can help at no cost (hud.gov, or 800-569-4287).');
  }
  if (has('documents_offered')) {
    add('documents', 'Accept the figures they state. Do NOT take account numbers or document details by voice or chat; any documents come later through the secure process.');
  }
  if (has('low_credit_or_bankruptcy')) {
    add('low_credit', 'Do not discourage them or say they cannot qualify, and do not promise any program or outcome.');
  }

  // Fact-driven notes
  const incomes = [...(ledger.value<IncomeComponent[]>('income.borrower') ?? []), ...(ledger.value<IncomeComponent[]>('income.co_borrower') ?? [])];
  if (incomes.some((c) => (c.type === 'alimony' || c.type === 'child_support') && c.counted === undefined)) {
    add('support_income', 'Tell them alimony or child support only needs to be disclosed if they want it counted toward qualifying, and ask whether they want it counted.');
  }
  const role = ledger.value<string>('co_borrower.role');
  if (role === 'co_signer' || role === 'other_is_primary' || ledger.value('co_borrower.present') === true) {
    add('each_authorizes', 'Mention briefly that each borrower authorizes their own credit check and contact later in the process.');
  }
  const area = destinationArea(ledger);
  const reloc = ledger.value<{ to?: string }>('situation.relocation');
  const state = stateCode(area?.state) ?? stateCode(reloc?.to?.split(',').pop());
  if ((state && !input.licensedStates.includes(state)) || has('out_of_footprint_location')) {
    const name = state ? CODE_TO_NAME[state] : 'that state';
    add('footprint', `The home is in ${name}. Say that a licensed loan officer will need to confirm the lender serves ${name}, and that they can reach one whenever they like. Do not start or offer a transfer, and do not promise anything about it.`);
  }
  return out;
}

/**
 * Section 0 — compliance notes (plan §6.7, S0-23).
 *
 * Code decides WHEN a compliance response is needed, from the extractor's compliance flags and from
 * facts in the ledger — never from the raw wording. Each note is shown to the model on the turn it
 * applies and only once per session (`shown`). Pure — no I/O.
 */
import type { ComplianceFlag, IncomeComponent } from './fact-schema.js';
import type { FactLedger } from './fact-ledger.js';

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

export interface ComplianceNote { id: string; text: string }

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
}

/** The compliance notes needed this turn that have not been shown yet. */
export function complianceNotes(input: NotesInput): ComplianceNote[] {
  const { flags, ledger, shown } = input;
  const out: ComplianceNote[] = [];
  const add = (id: string, text: string) => { if (!shown.includes(id) && !out.some((n) => n.id === id)) out.push({ id, text }); };
  const has = (f: ComplianceFlag) => flags.includes(f);

  if (has('privacy_question')) {
    add('privacy', `PRIVACY QUESTION — answer first with this approved wording, word for word, then continue:\n"${privacyScript(input.channel, input.continueWith)}"`);
  }
  if (has('approval_guarantee_or_preapproval_letter')) {
    add('preapproval', 'Do NOT confirm or imply any pre-approval, approval or amount you did not issue. Ask what the letter or offer is for.');
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
  if (role === 'co_signer' || role === 'other_is_primary') {
    add('each_authorizes', 'Mention briefly that each borrower authorizes their own credit check and contact later in the process.');
  }
  const area = ledger.value<{ state?: string; to?: string }>('location.area');
  const reloc = ledger.value<{ to?: string }>('situation.relocation');
  const state = stateCode(area?.state) ?? stateCode(reloc?.to?.split(',').pop());
  if ((state && !input.licensedStates.includes(state)) || has('out_of_footprint_location')) {
    const name = state ? CODE_TO_NAME[state] : 'that state';
    add('footprint', `The home is in ${name}. Say that a licensed loan officer will need to confirm the lender serves ${name} before going further, and offer that connection — do not promise anything about it.`);
  }
  return out;
}

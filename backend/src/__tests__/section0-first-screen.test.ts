// Section 0 — first screen (S0-24/25/26): greeting phrases for the card highlights, the intent question
// asked by code after the card tap, and consent recording (log always; DB rows once the enum exists).
process.env.SECTION_0_ENABLED = 'true';
import 'dotenv/config';

import { GREETING_SEGMENTS_SECTION0, GREETING_TEXT_SECTION0, getGreetingText, GREETING_TEXT_SECTION0_CHANNEL_CHOSEN } from '../prompts/ailana-system.js';
import { SessionContextManager } from '../context/session-context-manager.js';
import { recordChannelConsents, ON_SCREEN_CONSENT_TEXT, DISCLOSURE_VERSION } from '../services/consent-service.js';
import { routeSection0 } from '../section0/router.js';

console.log('🧪 Section 0 — first screen (channel cards, consent)\n');

let total = 0;
function assert(cond: boolean, name: string, detail?: unknown) {
  total++;
  if (cond) console.log(`  ✅ ${total}. ${name}`);
  else { console.error(`  ❌ ${total}. FAILED: ${name}`, typeof detail === 'string' ? detail : JSON.stringify(detail ?? '')); process.exit(1); }
}
const quietLog = console.log;
async function quietlyAsync<T>(fn: () => Promise<T>): Promise<T> { const lines: string[] = []; console.log = (...a: any[]) => { lines.push(a.join(' ')); }; try { return await fn(); } finally { console.log = quietLog; (quietlyAsync as any).lines = lines; } }

// ── Greeting phrases ──
assert(GREETING_SEGMENTS_SECTION0.map((s) => s.text).join(' ') === GREETING_TEXT_SECTION0, 'card-screen phrases joined = the approved greeting, word for word');
const cards = GREETING_SEGMENTS_SECTION0.map((s) => s.card).filter(Boolean);
assert(JSON.stringify(cards) === JSON.stringify(['video', 'voice', 'text', 'loan-officer']), 'cards light in the order she names them: video → voice → text → loan officer');
assert(GREETING_SEGMENTS_SECTION0[GREETING_SEGMENTS_SECTION0.length - 1]!.card === null, 'last phrase (recording notice + question) lights no card');
assert(/How would you like to get started\?$/.test(GREETING_TEXT_SECTION0), 'card-screen greeting ends with the channel question');
assert(getGreetingText() === GREETING_TEXT_SECTION0_CHANNEL_CHOSEN, 'other paths (restore, simulations) keep the greeting without the channel question');

// ── Intent question asked by code after the tap ──
{
  const cm = new SessionContextManager({} as any, { markLlmStart() {}, markLlmEnd() {} } as any);
  cm.markIntentAsked();
  const st = (cm as any).section0State;
  assert(st.intentAsked === true && st.clarifyAsked.includes('three_options') && st.unclearCount === 1, 'card tap → intent question counted as asked once');
  const next = routeSection0({ goal: null, intent: 'states_goal_or_facts', state: st });
  assert(next.decision.kind !== 'ask_intent', 'an unclear first reply never gets the same intent question again', next.decision);
  const clear = routeSection0({ goal: 'purchase', intent: 'states_goal_or_facts', state: st });
  assert(clear.decision.kind === 'set_track', 'a clear goal after the tap still starts the track at once');
  cm.markIntentAsked();
  assert((cm as any).section0State.clarifyAsked.filter((x: string) => x === 'three_options').length === 1, 'marking twice changes nothing');
}

// ── Consent ──
{
  const bad = await quietlyAsync(() => recordChannelConsents({ roomName: '', channel: 'video', ipAddress: '1.2.3.4' }));
  assert(!bad.ok, 'consent without a room is rejected');
  const badCh = await quietlyAsync(() => recordChannelConsents({ roomName: 'room-x', channel: 'fax', ipAddress: '1.2.3.4' }));
  assert(!badCh.ok, 'consent with an unknown channel is rejected');
  const ok = await quietlyAsync(() => recordChannelConsents({ roomName: 'room-x', channel: 'voice', ipAddress: '1.2.3.4' }));
  const lines: string[] = (quietlyAsync as any).lines;
  assert(ok.ok, 'valid tap → consent accepted (no database here → logged only)');
  assert(lines.filter((l) => l.startsWith('[consent]')).length >= 2 && lines.some((l) => l.includes('ai_engagement')) && lines.some((l) => l.includes('recording')), 'two consent events logged: ai_engagement + recording');
  assert(lines.every((l) => !l.startsWith('[consent]') || (l.includes('channel=voice') && l.includes(`version=${DISCLOSURE_VERSION}`))), 'each line carries channel and disclosure version');
  assert(ON_SCREEN_CONSENT_TEXT.startsWith('Ailana is an AI assistant, not a person. By choosing an option, you agree to talk with Ailana'), 'on-screen consent line as approved');
}

console.log(`\n✨ ALL ${total} SECTION 0 FIRST-SCREEN TESTS PASSED!`);

// Section 0 — loan officer transfer and callback as real actions (S0-27/28): code-decided handoff
// state + tools that only act when code allows, each at most once.
process.env.SECTION_0_ENABLED = 'true';
import 'dotenv/config';

import { SessionContextManager } from '../context/session-context-manager.js';
import { buildHandoffTools, resolveDay, type CallbackRequest } from '../section0/handoff-tools.js';
import type { UniversalExtraction } from '../section0/universal-extractor.js';

console.log('🧪 Section 0 — loan officer transfer and callback\n');

let total = 0;
function assert(cond: boolean, name: string, detail?: unknown) {
  total++;
  if (cond) console.log(`  ✅ ${total}. ${name}`);
  else { console.error(`  ❌ ${total}. FAILED: ${name}`, typeof detail === 'string' ? detail : JSON.stringify(detail ?? '')); process.exit(1); }
}
const quietLog = console.log;
async function quietlyAsync<T>(fn: () => Promise<T>): Promise<T> { console.log = () => {}; try { return await fn(); } finally { console.log = quietLog; } }
function quietly<T>(fn: () => T): T { console.log = () => {}; try { return fn(); } finally { console.log = quietLog; } }

const ex = (o: Partial<UniversalExtraction>): UniversalExtraction => ({
  goal: null, secondaryGoal: null, intent: 'states_goal_or_facts', flags: [], facts: [], declined: [], failed: false, ...o,
});
function newManager(available = true): SessionContextManager {
  const cm = quietly(() => new SessionContextManager({} as any, { markLlmStart() {} } as any));
  cm.setMloAvailability(() => available);
  return cm;
}
async function turn(cm: SessionContextManager, e: UniversalExtraction) {
  const anyCm = cm as any;
  anyCm.turnCount += 1;
  await quietlyAsync(async () => {
    if (cm.getActiveStage() === '0') await anyCm.runSection0Turn(Promise.resolve(e));
    else await anyCm.applyUniversalExtraction(Promise.resolve(e));
  });
}
function toolsFor(cm: SessionContextManager, log: { transfers: number; bookings: CallbackRequest[] }) {
  const [transfer, book] = buildHandoffTools({
    transfer: async () => { log.transfers++; },
    book: async (r) => { log.bookings.push(r); },
    onResult: (r) => cm.onHandoffResult(r),
    canTransfer: () => cm.getHandoffMode() === 'confirm_answer',
    canBook: () => cm.getHandoffMode() === 'callback',
    now: () => new Date(2026, 10, 9), // Mon Nov 9, 2026
  }) as any[];
  return {
    transfer: () => quietlyAsync(() => transfer.execute({}, {} as any)),
    book: (a: { day: string; time: string; time_zone: string }) => quietlyAsync(() => book.execute(a, {} as any)),
  };
}

// T1: request → confirm question → "yes" → one transfer
{
  const cm = newManager(true);
  const log = { transfers: 0, bookings: [] as CallbackRequest[] };
  const t = toolsFor(cm, log);
  await turn(cm, ex({ intent: 'requests_transfer_now' }));
  assert(cm.getHandoffMode() === 'confirm_asked' && cm.isHandoffActive(), 'T1: request → ask once to confirm');
  assert(/Ask once, briefly, whether they would like you to connect them/.test(cm.getDynamicContext()) && /Do NOT ask any qualifying questions/.test(cm.getDynamicContext()), 'T1: confirm question, no qualifying questions');
  const early = await t.transfer();
  assert(early.status === 'not_now' && log.transfers === 0, 'code blocks a transfer before the borrower confirmed');
  await turn(cm, ex({ intent: 'requests_transfer_now' })); // "Yes, please."
  assert(cm.getHandoffMode() === 'confirm_answer' && /call the transfer_to_loan_officer tool now/.test(cm.getDynamicContext()), 'T1: next turn → model told to call the transfer tool if they said yes');
  const r = await t.transfer();
  assert(r.status === 'connecting' && log.transfers === 1 && cm.getHandoffMode() === 'transferred', 'T1: exactly one transfer happens');
  const again = await t.transfer();
  assert(again.status === 'already_connecting' && log.transfers === 1, 'never transfers twice');
}

// T2: multi-fact opening with a transfer request → facts kept in memory, transfer path
{
  const cm = newManager(true);
  await turn(cm, ex({ goal: 'purchase', intent: 'requests_transfer_now', facts: [
    { key: 'income.borrower', value: [{ type: 'salary', amount: 95000, frequency: 'yearly' }], raw: '' },
    { key: 'funds.total', value: 40000, raw: '' },
  ] }));
  assert(cm.getHandoffMode() === 'confirm_asked', 'T2: transfer request handled even with many facts');
  assert(cm.getFactLedger().value('funds.total') === 40000, 'T2: stated facts are kept (they go with the transfer)');
}

// T3: no loan officer available → no transfer, straight to a call back, booked once
{
  const cm = newManager(false);
  const log = { transfers: 0, bookings: [] as CallbackRequest[] };
  const t = toolsFor(cm, log);
  await turn(cm, ex({ intent: 'requests_transfer_now' }));
  assert(cm.getHandoffMode() === 'callback', 'T3: unavailable → call back (no confirm-to-transfer step)');
  assert(/No licensed loan officer is available right now/.test(cm.getDynamicContext()) && /do NOT offer or attempt a transfer/.test(cm.getDynamicContext()), 'T3: says none available, offers a call back, never transfers');
  assert((await t.transfer()).status === 'not_now' && log.transfers === 0, 'T3: transfer tool refuses in callback mode');
  await turn(cm, ex({}));
  const b = await t.book({ day: 'tomorrow', time: '10:00 AM', time_zone: 'Eastern' });
  assert(b.status === 'booked' && log.bookings.length === 1 && log.bookings[0]!.date === '2026-11-10', 'T3: one booking, tomorrow resolved to the date', b);
  assert((await t.book({ day: 'tomorrow', time: '10:00 AM', time_zone: 'Eastern' })).status === 'already_booked' && log.bookings.length === 1, 'T3: no duplicate booking');
  assert(cm.getHandoffMode() === 'booked' && !cm.isHandoffActive(), 'T3: handoff finished');
}

// T4: asks about a person later → no handoff at all
{
  const cm = newManager(true);
  await turn(cm, ex({ goal: 'purchase', intent: 'asks_about_human_later' }));
  assert(cm.getHandoffMode() === null && !cm.isHandoffActive(), 'T4: "talk to someone later?" → no transfer, no booking');
}

// T5: transfer request, then "never mind" → nothing happens, resumes the stated refinance
{
  const cm = newManager(true);
  const log = { transfers: 0, bookings: [] as CallbackRequest[] };
  const t = toolsFor(cm, log);
  await turn(cm, ex({ goal: 'refinance', intent: 'requests_transfer_now' }));
  assert(cm.getHandoffMode() === 'confirm_asked', 'T5: confirm question first');
  await turn(cm, ex({ intent: 'cancels_transfer' }));
  assert(cm.getHandoffMode() === null && cm.getProfile().transaction_type === 'TT-REF', 'T5: "never mind" → no handoff, refinance track starts');
  assert((await t.transfer()).status === 'not_now' && log.transfers === 0, 'T5: no transfer can happen');
}

// T6: callback request → booked once with the stated day/time/zone
{
  const cm = newManager(true);
  const log = { transfers: 0, bookings: [] as CallbackRequest[] };
  const t = toolsFor(cm, log);
  await turn(cm, ex({ intent: 'requests_callback' }));
  assert(cm.getHandoffMode() === 'callback' && /ask only for what they have not said yet/.test(cm.getDynamicContext()), 'T6: call back mode — only the missing details');
  await turn(cm, ex({}));
  await turn(cm, ex({}));
  const b = await t.book({ day: 'tomorrow', time: '3:30 PM', time_zone: 'Central' });
  assert(b.status === 'booked' && log.bookings.length === 1 && log.transfers === 0, 'T6: exactly one booking, no transfer');
}

// Declining the confirm → back to normal; the stale confirm never lingers
{
  const cm = newManager(true);
  await turn(cm, ex({ intent: 'requests_transfer_now' }));
  await turn(cm, ex({ intent: 'declines_to_answer' })); // "No, let's keep going"
  assert(cm.getHandoffMode() === 'confirm_answer', 'the reply to the confirm question is handled once');
  await turn(cm, ex({ goal: 'purchase' }));
  assert(cm.getHandoffMode() === null && !cm.isHandoffActive(), 'next turn → normal flow (no lingering transfer)');
}

// resolveDay
{
  const mon = new Date(2026, 10, 9);
  assert(resolveDay('tomorrow', mon) === '2026-11-10' && resolveDay('today', mon) === '2026-11-09', 'today / tomorrow');
  assert(resolveDay('Wednesday', mon) === '2026-11-11' && resolveDay('Monday', mon) === '2026-11-16', 'weekday → next occurrence');
  assert(resolveDay('November 12', mon) === null, 'other wording → kept as said (null date)');
}

console.log(`\n✨ ALL ${total} SECTION 0 HANDOFF TESTS PASSED!`);

import { routeSection0, initialSection0State, trackSwitchFor, type Section0State } from '../section0/router.js';
import type { GoalClass, Intent } from '../section0/fact-schema.js';

console.log('🧪 Section 0 — router unit tests\n');

let total = 0;
function assert(cond: boolean, name: string, detail?: unknown) {
  total++;
  if (cond) console.log(`  ✅ ${total}. ${name}`);
  else { console.error(`  ❌ ${total}. FAILED: ${name}`, JSON.stringify(detail ?? '')); process.exit(1); }
}

/** State right after the card tap: the intent question has been asked. */
const afterIntentQ = (): Section0State => ({ ...initialSection0State(), intentAsked: true });

function route(goal: GoalClass | null, intent: Intent = 'states_goal_or_facts', state: Section0State = afterIntentQ(), extra: Record<string, unknown> = {}) {
  return routeSection0({ goal, intent, state, ...extra });
}

// ── Clear goals: track set immediately, NO confirmation turn ──
{
  const r = route('purchase');
  assert(r.decision.kind === 'set_track' && r.decision.track === 'TT-PUR', 'purchase → TT-PUR immediately', r.decision);
  assert(r.state.trackSet, 'state.trackSet = true');
}
assert((route('refinance').decision as any).track === 'TT-REF', 'refinance → TT-REF');
{
  const d = route('refinance_cash_out', 'states_goal_or_facts', afterIntentQ(), { refiKeepFirst: false }).decision as any;
  assert(d.track === 'TT-REF' && d.refinanceType === 'cash_out', 'cash-out refinance (said they are replacing the mortgage) → TT-REF + cash_out');
  const q = route('refinance_cash_out');
  assert(q.decision.kind === 'clarify' && (q.decision as any).which === 'cash_out_vs_equity', 'cash out, replace-or-keep not said → ask keep-or-replace once (#5)', q.decision);
  const after = routeSection0({ goal: 'refinance_cash_out', intent: 'states_goal_or_facts', state: q.state });
  assert((after.decision as any).track === 'TT-REF', 'asked once already → never asked again; continue as cash-out refinance');
  assert((route('refinance_cash_out', 'states_goal_or_facts', afterIntentQ(), { refiKeepFirst: true, equityFixed: true }).decision as any).track === 'TT-HEQ', 'keep the first mortgage + lump sum → home equity loan');
}
{
  const d = route('refinance_rate_term').decision as any;
  assert(d.track === 'TT-REF' && d.refinanceType === 'rate_term', 'rate/term refinance → TT-REF + rate_term');
}
assert((route('heloc').decision as any).track === 'TT-HEL', 'HELOC → TT-HEL (A5: no equity disambiguation)');
assert((route('home_equity_loan').decision as any).track === 'TT-HEQ', 'home equity loan → TT-HEQ');

// ── Equity unclear (A6) ──
{
  const r = route('equity_unclear');
  assert(r.decision.kind === 'clarify' && (r.decision as any).which === 'heloc_vs_heq', 'equity unclear → ask line of credit vs lump sum', r.decision);
  const r2 = routeSection0({ goal: 'equity_unclear', equityFixed: true, intent: 'states_goal_or_facts', state: r.state });
  assert((r2.decision as any).track === 'TT-HEQ', 'answer "lump sum" → TT-HEQ');
  const r3 = routeSection0({ goal: 'equity_unclear', equityFixed: false, intent: 'states_goal_or_facts', state: r.state });
  assert((r3.decision as any).track === 'TT-HEL', 'answer "line of credit" → TT-HEL');
  const r4 = routeSection0({ goal: 'equity_unclear', intent: 'states_goal_or_facts', state: r.state });
  assert(r4.decision.kind === 'offer_general_or_lo', 'still unclear → never asks the same clarification twice', r4.decision);
}

// ── Cash out, unclear how (test #5) ──
{
  const r = route('cash_out_unclear');
  assert(r.decision.kind === 'clarify' && (r.decision as any).which === 'cash_out_vs_equity', 'cash-out unclear → ask keep or replace first mortgage');
  const keep = routeSection0({ goal: 'cash_out_unclear', refiKeepFirst: true, intent: 'states_goal_or_facts', state: r.state });
  assert(keep.decision.kind === 'clarify' && (keep.decision as any).which === 'heloc_vs_heq', 'keep first → equity, then line vs lump sum');
  const replace = routeSection0({ goal: 'cash_out_unclear', refiKeepFirst: false, intent: 'states_goal_or_facts', state: r.state });
  assert((replace.decision as any).track === 'TT-REF' && (replace.decision as any).refinanceType === 'cash_out', 'replace first → cash-out refinance');
}

// ── Two goals (A7 / test #22) ──
{
  const r = route('refinance', 'states_goal_or_facts', afterIntentQ(), { secondaryGoal: 'purchase' });
  assert(r.decision.kind === 'clarify' && (r.decision as any).which === 'which_goal_first', 'two goals → ask which first', r.decision);
  const chosen = routeSection0({ goal: 'purchase', secondaryGoal: 'refinance', intent: 'states_goal_or_facts', state: r.state });
  assert((chosen.decision as any).track === 'TT-PUR', 'after choosing → that track is set (other stays stored)');
  const same = route('refinance', 'states_goal_or_facts', afterIntentQ(), { secondaryGoal: 'refinance_cash_out' });
  assert(same.decision.kind === 'set_track', 'refinance + cash-out refinance is ONE goal, not two');
}

// ── Holdouts & scope (A8, A13) ──
{
  const r = route('construction');
  assert(r.decision.kind === 'holdout' && (r.decision as any).holdout === 'construction' && r.state.holdoutRouted && !r.state.trackSet, 'construction → holdout, no track');
}
assert(route('reverse_mortgage').decision.kind === 'holdout', 'reverse mortgage → holdout');
assert(route('out_of_scope').decision.kind === 'out_of_scope', 'car loan → out of scope');
assert(route(null, 'off_topic').decision.kind === 'off_topic', 'weather → one-line redirect');

// ── Unclear: three options once, then help, never loop (A3, A4) ──
{
  // "Yeah." as the first reply → the intent question, which names the three options (= offered once).
  const yeah = routeSection0({ goal: 'unclear', intent: 'states_goal_or_facts', state: initialSection0State() });
  assert(yeah.decision.kind === 'ask_intent' && yeah.state.intentAsked, '"Yeah." first → intent question (names the three options once)', yeah.decision);
  assert(yeah.state.clarifyAsked.includes('three_options'), 'the intent question counts as offering the three options');
  const dunno = routeSection0({ goal: null, intent: 'declines_to_answer', state: yeah.state });
  assert(dunno.decision.kind === 'offer_general_or_lo', '"I don\'t know." → general questions or a loan officer (options NOT repeated)', dunno.decision);
  const again = routeSection0({ goal: null, intent: 'states_goal_or_facts', state: dunno.state });
  assert(again.decision.kind === 'answer_only', 'still unclear → keeps talking, no third ask (never loops)', again.decision);
  const late = routeSection0({ goal: 'purchase', intent: 'states_goal_or_facts', state: again.state });
  assert((late.decision as any).track === 'TT-PUR', 'goal stated later → track still set');
}

// ── Soft gate: questions are always answered ──
{
  const q = routeSection0({ goal: null, intent: 'asks_question', state: initialSection0State() });
  assert(q.decision.kind === 'ask_intent' && (q.decision as any).answerQuestion === true, '"How does this work?" first → answer, then ask intent');
  const q2 = route(null, 'asks_question');
  assert(q2.decision.kind === 'answer_only', 'question after intent was asked → answer it, do not push intent again');
  const qp = route('purchase', 'asks_question');
  assert(qp.decision.kind === 'set_track' && (qp.decision as any).answerQuestion === true, 'goal + question (A10) → track set AND question answered');
}

// ── Human help at any point (T1, T4, T5) ──
assert(route('purchase', 'requests_transfer_now').decision.kind === 'transfer', 'transfer request wins even with a goal (T1/T2)');
assert(route(null, 'asks_about_human_later').decision.kind === 'explain_human_later', '"talk to someone later?" → explain, no transfer (T4)');
{
  const t = route(null, 'requests_transfer_now');
  const c = routeSection0({ goal: null, intent: 'cancels_transfer', state: t.state });
  assert(c.decision.kind === 'resume' && !c.state.transferPending, 'cancel before transfer → resume (T5)');
}
assert(route(null, 'requests_callback').decision.kind === 'callback', 'callback request → callback (T3/T6)');
assert(route(null, 'asks_if_human').decision.kind === 'ai_disclosure', '"Are you a real person?" → AI disclosure');

// ── Purity ──
{
  const s = afterIntentQ();
  const before = JSON.stringify(s);
  route('equity_unclear', 'states_goal_or_facts', s);
  assert(JSON.stringify(s) === before, 'router never mutates the input state');
}

// ── Preview fixes: holdout stays a holdout; cancelling a transfer keeps the stated goal ──
{
  const h = route('construction');
  assert(h.decision.kind === 'holdout' && h.state.holdoutRouted, 'construction → holdout response once');
  const later = routeSection0({ goal: 'construction', intent: 'asks_about_human_later', state: h.state });
  assert(later.decision.kind === 'holdout_followup', '"I\'ll reach out later" after the holdout → no restart of intake', later.decision);
  const unsure = routeSection0({ goal: 'construction', intent: 'declines_to_answer', state: h.state });
  assert(unsure.decision.kind === 'holdout_followup', 'later turns stay holdout follow-ups (no repeated loan-officer offer)', unsure.decision);
  assert(routeSection0({ goal: 'construction', intent: 'requests_transfer_now', state: h.state }).decision.kind === 'transfer', 'a transfer request is still honoured after a holdout');
  assert(routeSection0({ goal: 'construction', intent: 'asks_if_human', state: h.state }).decision.kind === 'ai_disclosure', '"are you a person?" still gets the AI disclosure');
  assert((routeSection0({ goal: 'heloc', intent: 'states_goal_or_facts', state: h.state }).decision as any).track === 'TT-HEL', 'a new mortgage goal after a holdout still sets a track');
}
{
  const t = route('refinance', 'requests_transfer_now');
  assert(t.decision.kind === 'transfer', 'refinance + transfer request → transfer');
  const back = routeSection0({ goal: 'refinance', intent: 'cancels_transfer', state: t.state });
  assert(back.decision.kind === 'set_track' && (back.decision as any).track === 'TT-REF' && !back.state.transferPending, '"never mind" → resumes AND starts the refinance already stated (T5)', back.decision);
  const back2 = routeSection0({ goal: null, intent: 'cancels_transfer', state: { ...afterIntentQ(), transferPending: true } });
  assert(back2.decision.kind === 'resume', 'no goal yet → plain resume');
}

// ── O1 fixes ──
{
  // #24: after the intent question, a reply that shares facts (not a goal) is not "unclear"
  const asked = route(null).state; // intent question asked
  const r = routeSection0({ goal: null, intent: 'states_goal_or_facts', state: asked, factsShared: true });
  assert(r.decision.kind === 'ask_intent' && r.state.unclearCount === asked.unclearCount, '#24: sharing facts → ask what they want once more (in their terms), not "general questions or a loan officer"', r.decision);
  const again = routeSection0({ goal: null, intent: 'states_goal_or_facts', state: r.state, factsShared: true });
  assert(again.decision.kind !== 'ask_intent', 'the rephrased intent question is asked only once (never loops)', again.decision);
  // A6: paid-off home + wants money → line of credit or lump sum (keep-or-replace makes no sense)
  const a6 = routeSection0({ goal: 'cash_out_unclear', intent: 'states_goal_or_facts', state: afterIntentQ(), paidOff: true });
  assert(a6.decision.kind === 'clarify' && (a6.decision as any).which === 'heloc_vs_heq', 'A6: paid off + needs money → line or lump sum', a6.decision);
}

{
  const h = routeSection0({ goal: 'refinance', intent: 'states_goal_or_facts', state: afterIntentQ(), hardship: true });
  assert(h.decision.kind === 'holdout' && (h.decision as any).holdout === 'hardship' && h.state.holdoutKind === 'hardship', 'delinquency + refinance → hardship response first (no track)');
  const next = routeSection0({ goal: 'refinance', intent: 'states_goal_or_facts', state: h.state, hardship: true });
  assert(next.decision.kind === 'holdout_followup', 'hardship: later turns stay paused even though a goal was stated');
  assert(routeSection0({ goal: 'refinance', intent: 'requests_transfer_now', state: h.state }).decision.kind === 'transfer', 'hardship: a transfer request is still honoured');
}

// ── Track switching mid-flow (S0-18) ──
{
  const sw = (goal: GoalClass | null, currentTrack: any, extra: Record<string, unknown> = {}) =>
    trackSwitchFor({ goal, intent: 'states_goal_or_facts', currentTrack, ...extra });
  assert(JSON.stringify(sw('refinance', 'TT-PUR')) === '{"track":"TT-REF"}', 'purchase → "actually refinance" switches to TT-REF');
  assert(JSON.stringify(sw('refinance_cash_out', 'TT-PUR')) === '{"track":"TT-REF","refinanceType":"cash_out"}', 'purchase → cash-out refinance carries the sub-type');
  assert(sw('purchase', 'TT-REF')?.track === 'TT-PUR', 'refinance → purchase switches');
  assert(sw('heloc', 'TT-REF')?.track === 'TT-HEL', 'refinance → HELOC switches');
  assert(sw('purchase', 'TT-PUR') === null, 'same goal again → no switch');
  assert(sw('refinance', 'TT-REF', { currentRefinanceType: 'cash_out' }) === null, 'plain "refinance" while in cash-out refi → no switch');
  assert(JSON.stringify(sw('refinance_rate_term', 'TT-REF', { currentRefinanceType: 'cash_out' })) === '{"track":"TT-REF","refinanceType":"rate_term"}', 'cash-out → rate/term updates the sub-type');
  assert(sw('home_equity_loan', 'TT-HEL') === null, 'line ↔ lump sum stays inside the equity flow (no switch)');
  assert(sw('equity_unclear', 'TT-PUR') === null, 'unclear equity goal → no switch (code cannot decide)');
  assert(sw('cash_out_unclear', 'TT-PUR') === null, 'unclear cash-out goal → no switch');
  assert(sw('cash_out_unclear', 'TT-PUR', { refiKeepFirst: false })?.track === 'TT-REF', 'cash out + replace first mortgage → TT-REF');
  assert(sw('construction', 'TT-PUR') === null && sw('out_of_scope', 'TT-PUR') === null && sw('unclear', 'TT-PUR') === null, 'holdouts / out of scope / unclear never switch');
  assert(trackSwitchFor({ goal: 'refinance', intent: 'asks_question', currentTrack: 'TT-PUR' }) === null, 'a QUESTION about refinancing is not a switch');
  assert(sw('refinance', null) === null && sw(null, 'TT-PUR') === null, 'no current track or no goal → no switch');
}

console.log(`\n✨ ALL ${total} SECTION 0 ROUTER TESTS PASSED!`);

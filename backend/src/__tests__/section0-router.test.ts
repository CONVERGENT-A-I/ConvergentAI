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
  const d = route('refinance_cash_out').decision as any;
  assert(d.track === 'TT-REF' && d.refinanceType === 'cash_out', 'cash-out refinance → TT-REF + cash_out');
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
  const first = routeSection0({ goal: null, intent: 'states_goal_or_facts', state: initialSection0State() });
  assert(first.decision.kind === 'ask_intent' && first.state.intentAsked, 'nothing known yet → ask intent once');
  const yeah = routeSection0({ goal: 'unclear', intent: 'states_goal_or_facts', state: first.state });
  assert(yeah.decision.kind === 'clarify' && (yeah.decision as any).which === 'three_options', '"Yeah." → offer the three options once', yeah.decision);
  const dunno = routeSection0({ goal: null, intent: 'declines_to_answer', state: yeah.state });
  assert(dunno.decision.kind === 'offer_general_or_lo', '"I don\'t know." → general questions or a loan officer', dunno.decision);
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

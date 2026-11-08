/**
 * Section 0 — router (plan §6.9). A PURE function: (what the borrower said, small
 * loop-prevention state) → decision. Code decides the route; the LLM only
 * translated the borrower's words into a goal class + intent beforehand.
 *
 * Rules (Revised spec): no confirmation turn when the goal is clear; at most one
 * clarifying question per ambiguity; never loop; soft gate (questions are always
 * answered — the decision carries `answerQuestion`).
 */
import type { GoalClass, Intent } from './fact-schema.js';

export type Track = 'TT-PUR' | 'TT-REF' | 'TT-HEL' | 'TT-HEQ';
export type ClarifyKind = 'cash_out_vs_equity' | 'heloc_vs_heq' | 'which_goal_first' | 'three_options' | 'intent_rephrase';

export interface Section0State {
  intentAsked: boolean;
  clarifyAsked: ClarifyKind[];   // every clarification already asked (each is asked at most once)
  unclearCount: number;          // unclear replies after the intent question
  trackSet: boolean;
  holdoutRouted: boolean;
  /** Which holdout response was given (hardship keeps intake paused even when a goal was stated). */
  holdoutKind?: 'construction' | 'reverse_mortgage' | 'hardship';
  transferPending: boolean;
}

export function initialSection0State(): Section0State {
  return { intentAsked: false, clarifyAsked: [], unclearCount: 0, trackSet: false, holdoutRouted: false, transferPending: false };
}

export type Section0Decision =
  | { kind: 'set_track'; track: Track; refinanceType?: 'cash_out' | 'rate_term'; answerQuestion: boolean }
  | { kind: 'clarify'; which: ClarifyKind; answerQuestion: boolean }
  | { kind: 'ask_intent'; answerQuestion: boolean }
  | { kind: 'offer_general_or_lo'; answerQuestion: boolean }
  | { kind: 'answer_only' }
  | { kind: 'holdout'; holdout: 'construction' | 'reverse_mortgage' | 'hardship' }
  /** After the holdout response: no more discovery questions, no repeated loan-officer offer. */
  | { kind: 'holdout_followup'; answerQuestion: boolean }
  | { kind: 'out_of_scope' }
  | { kind: 'off_topic' }
  | { kind: 'ai_disclosure' }
  | { kind: 'transfer' }
  | { kind: 'callback' }
  | { kind: 'explain_human_later' }
  | { kind: 'resume' };

export interface RouterInput {
  goal: GoalClass | null;
  secondaryGoal?: GoalClass | null;
  /** refi.keep_first — true: keep the first mortgage (equity product); false: replace it (cash-out refi). */
  refiKeepFirst?: boolean | null;
  /** equity.fixed_preference — true: lump sum / fixed payment (HEQ); false: line of credit (HELOC). */
  equityFixed?: boolean | null;
  intent: Intent;
  state: Section0State;
  /** The borrower shared facts this turn (engaging, not unclear). */
  factsShared?: boolean;
  /** equity.paid_off — no mortgage on the home, so keep-or-replace does not apply. */
  paidOff?: boolean | null;
  /** Behind on payments / hardship (compliance flag or stated delinquency). */
  hardship?: boolean;
}

export interface RouterOutput {
  decision: Section0Decision;
  state: Section0State;
}

const MORTGAGE_GOALS = new Set<GoalClass>([
  'purchase', 'refinance', 'refinance_rate_term', 'refinance_cash_out', 'heloc', 'home_equity_loan',
  'equity_unclear', 'cash_out_unclear',
]);

/** Goal families — two goals in the same family (e.g. refinance + refinance_cash_out) are not "two goals". */
function family(g: GoalClass): string {
  if (g.startsWith('refinance')) return 'refinance';
  if (g === 'heloc' || g === 'home_equity_loan' || g === 'equity_unclear' || g === 'cash_out_unclear') return 'equity';
  return g;
}

function setTrack(state: Section0State, track: Track, answerQuestion: boolean, refinanceType?: 'cash_out' | 'rate_term'): RouterOutput {
  const decision: Section0Decision = refinanceType
    ? { kind: 'set_track', track, refinanceType, answerQuestion }
    : { kind: 'set_track', track, answerQuestion };
  return { decision, state: { ...state, trackSet: true } };
}

function clarifyOnce(state: Section0State, which: ClarifyKind, answerQuestion: boolean): RouterOutput {
  if (state.clarifyAsked.includes(which)) {
    // Already asked this exact clarification once — never ask it again. Offer help instead.
    return { decision: { kind: 'offer_general_or_lo', answerQuestion }, state: { ...state, unclearCount: state.unclearCount + 1 } };
  }
  return { decision: { kind: 'clarify', which, answerQuestion }, state: { ...state, clarifyAsked: [...state.clarifyAsked, which] } };
}

export function routeSection0(input: RouterInput): RouterOutput {
  const { intent } = input;
  let state = { ...input.state, clarifyAsked: [...input.state.clarifyAsked] };
  const answerQuestion = intent === 'asks_question' || intent === 'concern_or_worry';

  // ── 1. Human-help intents come first (a loan officer is available at any point) ──
  if (intent === 'requests_transfer_now') {
    return { decision: { kind: 'transfer' }, state: { ...state, transferPending: true } };
  }
  if (intent === 'requests_callback') {
    return { decision: { kind: 'callback' }, state };
  }
  if (intent === 'cancels_transfer') {
    // Back to Ailana: if the goal was already stated ("refinance… actually, transfer me"), start that track.
    state = { ...state, transferPending: false };
    const resumed = routeSection0({ ...input, intent: 'states_goal_or_facts', state });
    // A holdout (hardship, construction, reverse) stays paused: no intake restart, no re-asked goal.
    if (resumed.decision.kind === 'set_track' || resumed.decision.kind === 'holdout_followup') return resumed;
    return { decision: { kind: 'resume' }, state };
  }
  if (intent === 'asks_if_human') {
    return { decision: { kind: 'ai_disclosure' }, state };
  }
  if (state.holdoutRouted && (state.holdoutKind === 'hardship' || intent === 'asks_about_human_later' || !input.goal || input.goal === 'construction' || input.goal === 'reverse_mortgage')) {
    // The holdout response was given once; later turns stay helpful without restarting intake.
    return { decision: { kind: 'holdout_followup', answerQuestion }, state };
  }
  if (intent === 'asks_about_human_later') {
    return { decision: { kind: 'explain_human_later' }, state };
  }

  // ── 2. Goal-based routing ──────────────────────────────────────────────────
  const goal = input.goal && input.goal !== 'unclear' ? input.goal : null;
  const secondary = input.secondaryGoal && input.secondaryGoal !== 'unclear' ? input.secondaryGoal : null;

  if (input.hardship && !state.holdoutRouted) {
    // Behind on payments: empathy, no promise, loan officer + HUD-approved counselor — intake waits.
    return { decision: { kind: 'holdout', holdout: 'hardship' }, state: { ...state, holdoutRouted: true, holdoutKind: 'hardship' } };
  }
  if (goal === 'construction' || goal === 'reverse_mortgage') {
    return { decision: { kind: 'holdout', holdout: goal }, state: { ...state, holdoutRouted: true, holdoutKind: goal } };
  }
  if (goal === 'out_of_scope') {
    return { decision: { kind: 'out_of_scope' }, state };
  }

  if (goal && MORTGAGE_GOALS.has(goal)) {
    // Two different goals → ask which first (once); the other stays stored for the loan officer.
    if (secondary && MORTGAGE_GOALS.has(secondary) && family(secondary) !== family(goal) && !state.clarifyAsked.includes('which_goal_first')) {
      return clarifyOnce(state, 'which_goal_first', answerQuestion);
    }

    switch (goal) {
      case 'purchase':
        return setTrack(state, 'TT-PUR', answerQuestion);
      case 'refinance':
        return setTrack(state, 'TT-REF', answerQuestion);
      case 'refinance_rate_term':
        return setTrack(state, 'TT-REF', answerQuestion, 'rate_term');
      case 'refinance_cash_out':
        // Cash out is a cash-out refinance only once the borrower has said they are replacing the
        // current mortgage; otherwise ask keep-or-replace once (Revised spec), then follow the answer.
        if (input.refiKeepFirst === true) return routeEquity(state, input.equityFixed ?? null, answerQuestion);
        if (input.refiKeepFirst === false || state.clarifyAsked.includes('cash_out_vs_equity')) return setTrack(state, 'TT-REF', answerQuestion, 'cash_out');
        return clarifyOnce(state, 'cash_out_vs_equity', answerQuestion);
      case 'heloc':
        return setTrack(state, 'TT-HEL', answerQuestion);
      case 'home_equity_loan':
        return setTrack(state, 'TT-HEQ', answerQuestion);
      case 'cash_out_unclear':
        if (input.paidOff === true) return routeEquity(state, input.equityFixed ?? null, answerQuestion); // nothing to keep or replace
        if (input.refiKeepFirst === false) return setTrack(state, 'TT-REF', answerQuestion, 'cash_out');
        if (input.refiKeepFirst === true) return routeEquity(state, input.equityFixed ?? null, answerQuestion);
        return clarifyOnce(state, 'cash_out_vs_equity', answerQuestion);
      case 'equity_unclear':
        return routeEquity(state, input.equityFixed ?? null, answerQuestion);
    }
  }

  // ── 3. No usable goal yet ──────────────────────────────────────────────────
  if (intent === 'off_topic') {
    return { decision: { kind: 'off_topic' }, state };
  }
  if (!state.intentAsked) {
    // The intent question already names the three options, so it counts as offering them once.
    return { decision: { kind: 'ask_intent', answerQuestion }, state: { ...state, intentAsked: true, clarifyAsked: [...state.clarifyAsked, 'three_options'], unclearCount: 1 } };
  }
  if (answerQuestion) {
    // A question while the goal is still open: answer it; don't push the intent question again.
    return { decision: { kind: 'answer_only' }, state };
  }
  if (input.factsShared && !state.clarifyAsked.includes('intent_rephrase')) {
    // They are engaging (sharing information) but haven't said what they want: ask once more, in their terms.
    return { decision: { kind: 'ask_intent', answerQuestion: false }, state: { ...state, clarifyAsked: [...state.clarifyAsked, 'intent_rephrase'] } };
  }
  if (state.unclearCount === 0) {
    const out = clarifyOnce(state, 'three_options', false);
    return { decision: out.decision, state: { ...out.state, unclearCount: 1 } };
  }
  if (state.unclearCount === 1) {
    return { decision: { kind: 'offer_general_or_lo', answerQuestion: false }, state: { ...state, unclearCount: 2 } };
  }
  // Never loop: after the options and the help offer, just keep the conversation open.
  return { decision: { kind: 'answer_only' }, state: { ...state, unclearCount: state.unclearCount + 1 } };
}

function routeEquity(state: Section0State, equityFixed: boolean | null, answerQuestion: boolean): RouterOutput {
  if (equityFixed === true) return setTrack(state, 'TT-HEQ', answerQuestion);
  if (equityFixed === false) return setTrack(state, 'TT-HEL', answerQuestion);
  return clarifyOnce(state, 'heloc_vs_heq', answerQuestion);
}

// ── Track switching mid-flow (plan §6.9, S0-18) ─────────────────────────────

export interface TrackSwitch { track: Track; refinanceType?: 'cash_out' | 'rate_term' }

/**
 * After the track is set, the borrower states a different goal ("actually I already
 * own and want to refinance"). Returns the new track when the new goal maps to one
 * clearly and it differs from the current track (or refines the refinance type);
 * otherwise null. Pure: uses the same goal → track mapping as `routeSection0`.
 * Unclear goals, holdouts and questions never switch the track.
 */
export function trackSwitchFor(input: {
  goal: GoalClass | null;
  intent: Intent;
  refiKeepFirst?: boolean | null;
  equityFixed?: boolean | null;
  currentTrack: Track | null;
  currentRefinanceType?: 'cash_out' | 'rate_term' | null;
}): TrackSwitch | null {
  if (!input.goal || !input.currentTrack) return null;
  if (input.intent !== 'states_goal_or_facts') return null; // a question about another product is not a switch
  // Line vs lump sum is already handled inside the equity flow — never a "switch".
  const equity = (t: Track) => t === 'TT-HEL' || t === 'TT-HEQ';
  const out = routeSection0({
    goal: input.goal,
    refiKeepFirst: input.refiKeepFirst ?? null,
    equityFixed: input.equityFixed ?? null,
    intent: input.intent,
    // Mid-flow there is no room for the keep-or-replace question: a stated cash-out refinance maps directly.
    state: { ...initialSection0State(), intentAsked: true, clarifyAsked: ['cash_out_vs_equity'] },
  });
  if (out.decision.kind !== 'set_track') return null;
  const { track, refinanceType } = out.decision;
  if (track === input.currentTrack || (equity(track) && equity(input.currentTrack))) {
    if (track === 'TT-REF' && refinanceType && refinanceType !== input.currentRefinanceType) return { track, refinanceType };
    return null;
  }
  return refinanceType ? { track, refinanceType } : { track };
}

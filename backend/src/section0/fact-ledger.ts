/**
 * Section 0 — Fact Ledger: Ailana's memory of what the borrower told her (plan §6.1).
 *
 * - One entry per fact key. A later statement of the same fact overwrites the
 *   earlier value; the old value is kept in `history` (self-corrections).
 * - Lives in code state (not chat history), so it survives compaction, agent
 *   rotation, channel switches, a loan-officer round trip, reconnects and resume.
 * - Never stores SSN, street address, account numbers or protected-class data.
 */
import { isFactKey, isForbiddenKey, type FactKey, type IncomeComponent } from './fact-schema.js';

export type FactStatus = 'stated' | 'needs_clarification' | 'confirmed' | 'verified' | 'declined';

export interface FactHistoryItem { value: unknown; raw: string; turn: number }

export interface FactEntry {
  key: FactKey;
  value: unknown;
  raw: string;           // short quote of how it was said
  status: FactStatus;
  turn: number;          // turn where it was last set
  stage: string;         // stage where it was last set
  history: FactHistoryItem[];
  clarify?: string;      // what is ambiguous ('weekly_hours' | 'frequency' | 'magnitude' | 'conflict' …)
}

export interface FactInput {
  key: string;
  value: unknown;
  raw?: string;
  status?: FactStatus;
  clarify?: string;
}

export type UpsertResult = 'added' | 'corrected' | 'unchanged' | 'rejected';

export interface SerializedLedger {
  v: 1;
  entries: FactEntry[];
}

/** Income keys hold arrays of components that merge by `type` rather than replace wholesale. */
const MERGE_BY_TYPE_KEYS = new Set<FactKey>(['income.borrower', 'income.co_borrower']);

const MAX_RAW = 160;

function sameValue(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function mergeIncome(oldList: IncomeComponent[], newList: IncomeComponent[]): IncomeComponent[] {
  const merged = [...oldList];
  for (const comp of newList) {
    const i = merged.findIndex((c) => c.type === comp.type);
    if (i >= 0) merged[i] = { ...merged[i], ...comp };
    else merged.push(comp);
  }
  return merged;
}

export class FactLedger {
  private entries = new Map<FactKey, FactEntry>();
  private log: (line: string) => void;

  constructor(opts: { log?: (line: string) => void } = {}) {
    this.log = opts.log ?? ((line) => console.log(line));
  }

  /**
   * Add or correct one fact. Returns what happened.
   * - Unknown or forbidden keys are rejected (never stored).
   * - Same value again → 'unchanged' (status may still be promoted, e.g. stated → confirmed).
   * - Different value → 'corrected' (old value pushed to history).
   */
  upsert(input: FactInput, turn: number, stage: string): UpsertResult {
    const { key } = input;
    if (isForbiddenKey(key) || !isFactKey(key)) {
      this.log(`[fact-ledger] ✗ rejected key "${isForbiddenKey(key) ? '<forbidden>' : key}"`);
      return 'rejected';
    }
    if (input.value === undefined || input.value === null || input.value === '') {
      return 'unchanged';
    }

    const raw = (input.raw ?? '').slice(0, MAX_RAW);
    const status: FactStatus = input.status ?? 'stated';
    const existing = this.entries.get(key);

    let value = input.value;
    if (existing && MERGE_BY_TYPE_KEYS.has(key) && Array.isArray(existing.value) && Array.isArray(value)) {
      value = mergeIncome(existing.value as IncomeComponent[], value as IncomeComponent[]);
    }

    if (!existing) {
      const entry: FactEntry = { key, value, raw, status, turn, stage, history: [] };
      if (input.clarify) entry.clarify = input.clarify;
      this.entries.set(key, entry);
      this.log(`[fact-ledger] + ${key} = ${JSON.stringify(value)} (${status})`);
      return 'added';
    }

    if (sameValue(existing.value, value)) {
      // Same value: allow status changes (e.g. clarification resolved, soft-pull verified).
      let changed = false;
      if (existing.status !== status) { existing.status = status; changed = true; }
      if (input.clarify !== existing.clarify) {
        if (input.clarify) existing.clarify = input.clarify; else delete existing.clarify;
        changed = true;
      }
      if (changed) this.log(`[fact-ledger] = ${key} status → ${existing.status}${existing.clarify ? ` (clarify: ${existing.clarify})` : ''}`);
      return 'unchanged';
    }

    existing.history.push({ value: existing.value, raw: existing.raw, turn: existing.turn });
    this.log(`[fact-ledger] ~ ${key} ${JSON.stringify(existing.value)} → ${JSON.stringify(value)} (correction)`);
    existing.value = value;
    existing.raw = raw;
    existing.status = status;
    existing.turn = turn;
    existing.stage = stage;
    if (input.clarify) existing.clarify = input.clarify; else delete existing.clarify;
    return 'corrected';
  }

  /** Borrower declined to give this fact → never ask again. */
  markDeclined(key: FactKey, turn: number, stage: string): void {
    const existing = this.entries.get(key);
    if (existing) {
      existing.status = 'declined';
      existing.turn = turn;
      return;
    }
    this.entries.set(key, { key, value: null, raw: '', status: 'declined', turn, stage, history: [] });
    this.log(`[fact-ledger] - ${key} declined (never ask again)`);
  }

  /** Resolve a pending clarification with a final value. */
  resolve(key: FactKey, value: unknown, raw: string, turn: number, stage: string): UpsertResult {
    return this.upsert({ key, value, raw, status: 'confirmed' }, turn, stage);
  }

  get(key: FactKey): FactEntry | undefined {
    return this.entries.get(key);
  }

  /** Value of a fact if it is usable (stated / confirmed / verified, not pending clarification or declined). */
  value<T = unknown>(key: FactKey): T | undefined {
    const e = this.entries.get(key);
    if (!e || e.status === 'declined' || e.status === 'needs_clarification') return undefined;
    return e.value as T;
  }

  has(key: FactKey): boolean {
    return this.value(key) !== undefined;
  }

  /** True when the borrower has answered OR declined — either way, never ask again. */
  isSettled(key: FactKey): boolean {
    const e = this.entries.get(key);
    return !!e && e.status !== 'needs_clarification';
  }

  /** Everything usable: stated, confirmed or verified. */
  known(): FactEntry[] {
    return [...this.entries.values()].filter((e) => e.status !== 'declined' && e.status !== 'needs_clarification');
  }

  declined(): FactEntry[] {
    return [...this.entries.values()].filter((e) => e.status === 'declined');
  }

  pendingClarifications(): FactEntry[] {
    return [...this.entries.values()].filter((e) => e.status === 'needs_clarification');
  }

  size(): number {
    return this.entries.size;
  }

  serialize(): SerializedLedger {
    return { v: 1, entries: JSON.parse(JSON.stringify([...this.entries.values()])) };
  }

  static hydrate(data: unknown, opts: { log?: (line: string) => void } = {}): FactLedger {
    const ledger = new FactLedger(opts);
    const d = data as Partial<SerializedLedger> | null | undefined;
    if (!d || !Array.isArray(d.entries)) return ledger;
    for (const e of d.entries) {
      if (!e || typeof e.key !== 'string' || !isFactKey(e.key) || isForbiddenKey(e.key)) continue;
      ledger.entries.set(e.key, {
        key: e.key,
        value: e.value,
        raw: String(e.raw ?? '').slice(0, MAX_RAW),
        status: e.status ?? 'stated',
        turn: Number(e.turn ?? 0),
        stage: String(e.stage ?? ''),
        history: Array.isArray(e.history) ? e.history : [],
        ...(e.clarify ? { clarify: e.clarify } : {}),
      });
    }
    return ledger;
  }

  clone(): FactLedger {
    return FactLedger.hydrate(this.serialize(), { log: this.log });
  }

  /**
   * Merge another ledger into this one (background extraction runs on a clone;
   * its results are merged back in turn order). An entry from `other` wins when
   * this ledger doesn't have the key, or when `other`'s entry is from the same
   * or a later turn and differs. Never removes facts.
   */
  mergeFrom(other: FactLedger): FactKey[] {
    const changed: FactKey[] = [];
    for (const e of other.entries.values()) {
      const mine = this.entries.get(e.key);
      if (mine && (mine.turn > e.turn || JSON.stringify(mine) === JSON.stringify(e))) continue;
      this.entries.set(e.key, JSON.parse(JSON.stringify(e)));
      changed.push(e.key);
    }
    return changed;
  }
}

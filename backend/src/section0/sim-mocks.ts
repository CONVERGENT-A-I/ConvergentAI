/**
 * Simulation support for LiveKit Agent Simulations (Section 0 plan §7.3).
 *
 * When a job runs under `lk agent simulate`, `ctx.simulationContext()` is defined.
 * The entrypoint calls `activateSimulation()` once; every external side effect
 * (database, CRS soft pull, SIP transfer to an MLO, callback booking) checks
 * `isSimulationActive()` and records the attempt here instead of calling the
 * real system. Production behaviour is unchanged because nothing is active.
 *
 * Each agent job runs in its own process, so module-level state is per job.
 */
import type { SimulationContext } from '@livekit/agents';

export interface SimTransferAttempt {
  at: string;
  roomName: string;
  /** Fact summary that would have been handed to the loan officer (filled once mlo-handoff exists). */
  facts: unknown;
  /** What the mock answered, from scenario userdata `mlo_available` (default true). */
  mloAvailable: boolean;
}

export interface SimBooking {
  at: string;
  day: string | null;
  time: string | null;
  timeZone: string | null;
}

export interface SimConsentEvent {
  at: string;
  type: 'ai_engagement' | 'recording';
  channel: string;
}

export interface SimRecords {
  transfers: SimTransferAttempt[];
  bookings: SimBooking[];
  consents: SimConsentEvent[];
  crsPulls: number;
}

let active = false;
let userdata: Record<string, unknown> = {};
let scenarioLabel = '';
const records: SimRecords = { transfers: [], bookings: [], consents: [], crsPulls: 0 };

/** Call once at the top of the job entrypoint when `ctx.simulationContext()` is defined. */
export function activateSimulation(sim: SimulationContext): void {
  active = true;
  try {
    userdata = (sim.userdata() as Record<string, unknown>) ?? {};
  } catch {
    userdata = {};
  }
  try {
    scenarioLabel = (sim.scenario as any)?.label || (sim.scenario as any)?.id || '';
  } catch {
    scenarioLabel = '';
  }
  console.log(`[simulation] ACTIVE — scenario="${scenarioLabel}" mode=${String((sim as any).simulationMode)} userdata keys=[${Object.keys(userdata).join(', ')}]`);
}

export function isSimulationActive(): boolean {
  return active;
}

export function getSimUserdata(): Record<string, unknown> {
  return userdata;
}

export function getSimRecords(): SimRecords {
  return records;
}

/** Whether the mocked loan officer is available (scenario userdata `mlo_available`, default true). */
export function simMloAvailable(): boolean {
  const v = userdata['mlo_available'];
  return v === undefined ? true : v === true || v === 'true';
}

export function recordSimTransfer(roomName: string, facts: unknown): SimTransferAttempt {
  const attempt: SimTransferAttempt = {
    at: new Date().toISOString(),
    roomName,
    facts,
    mloAvailable: simMloAvailable(),
  };
  records.transfers.push(attempt);
  console.log(`[simulation] MOCK transfer attempt #${records.transfers.length} (mloAvailable=${attempt.mloAvailable}) — no SIP call made.`);
  return attempt;
}

export function recordSimBooking(booking: Omit<SimBooking, 'at'>): void {
  records.bookings.push({ at: new Date().toISOString(), ...booking });
  console.log(`[simulation] MOCK callback booking #${records.bookings.length}: ${JSON.stringify(booking)}`);
}

export function recordSimConsent(type: SimConsentEvent['type'], channel: string): void {
  records.consents.push({ at: new Date().toISOString(), type, channel });
  console.log(`[simulation] MOCK consent: ${type} (${channel})`);
}

export function recordSimCrsPull(): void {
  records.crsPulls += 1;
  console.log(`[simulation] MOCK CRS soft pull #${records.crsPulls} — no bureau call made.`);
}

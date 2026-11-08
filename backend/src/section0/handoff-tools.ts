/**
 * Section 0 — loan officer transfer and callback as REAL actions (S0-27 / S0-28).
 *
 * The model calls these tools; code performs the action (or, in simulations, records it in the
 * mocks) and tells the model what actually happened. Saying "connecting you" is not a transfer —
 * only a tool call is. Each action happens at most once per session.
 */
import { llm } from '@livekit/agents';
import { z } from 'zod';

export interface CallbackRequest {
  day: string;
  time: string;
  timeZone: string;
  /** The day resolved to a calendar date when it was relative ("tomorrow", "Tuesday"). */
  date: string | null;
}

export interface HandoffDeps {
  /** Start the real transfer (production: existing popup → SIP path; simulation: mock record). */
  transfer: (summary: string) => Promise<void>;
  /** Book the call back (production: stored for the loan officer until the calendar is wired — D1; simulation: mock record). */
  book: (req: CallbackRequest) => Promise<void>;
  /** Change the one existing booking (still exactly one booking). */
  reschedule: (req: CallbackRequest) => Promise<void>;
  /** Tell the session state what happened. */
  onResult: (result: 'transferred' | 'booked') => void;
  /** Code decides: is a transfer allowed right now (the borrower just confirmed)? */
  canTransfer: () => boolean;
  /** Code decides: is a call back being arranged right now? */
  canBook: () => boolean;
  now?: () => Date;
}

const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/** "tomorrow" / "today" / a weekday → a calendar date (YYYY-MM-DD); anything else → null. */
export function resolveDay(day: string, now: Date = new Date()): string | null {
  const d = day.trim().toLowerCase();
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let offset: number | null = null;
  if (d === 'today') offset = 0;
  else if (d === 'tomorrow') offset = 1;
  else {
    const w = WEEKDAYS.findIndex((name) => d.replace(/^(this|next)\s+/, '') === name);
    if (w >= 0) {
      offset = (w - base.getDay() + 7) % 7 || 7;
      if (d.startsWith('next ') && offset < 7) offset += 7;
    }
  }
  if (offset === null) return null;
  base.setDate(base.getDate() + offset);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${base.getFullYear()}-${pad(base.getMonth() + 1)}-${pad(base.getDate())}`;
}

export function buildHandoffTools(deps: HandoffDeps) {
  let transferred = false;
  let booked: CallbackRequest | null = null;

  const transfer_to_loan_officer = llm.tool({
    name: 'transfer_to_loan_officer',
    description:
      'Connect the borrower to a licensed loan officer right now, passing a short summary of what they already told you. Call this only after the borrower has confirmed they want to be connected now. Call it once.',
    parameters: z.object({
      summary: z.string().describe('What the borrower already told you, for the loan officer: goal, area, income, credit, savings, debts, anything else stated. Never a Social Security number or street address.'),
    }),
    execute: async ({ summary }) => {
      if (transferred) return { status: 'already_connecting', say: 'The connection is already in progress.' };
      if (!deps.canTransfer()) return { status: 'not_now', say: 'Do not transfer yet. If they asked for a loan officer, first ask whether they want to be connected now.' };
      transferred = true;
      await deps.transfer(summary);
      deps.onResult('transferred');
      return { status: 'connecting', say: 'Tell the borrower you are connecting them with a licensed loan officer now.' };
    },
  });

  const schedule_callback = llm.tool({
    name: 'schedule_callback',
    description:
      'Book a call back from a licensed loan officer, or change the time of the one already booked. Call only when you know the day, an exact time (not a range like "after 3") and the borrower\'s time zone. Then read the booking back exactly as the tool returns it.',
    parameters: z.object({
      day: z.string().describe('The day, as the borrower said it (e.g. "tomorrow", "Monday", "November 12")'),
      time: z.string().describe('The time, e.g. "3:30 PM"'),
      time_zone: z.string().describe('The borrower\'s time zone, e.g. "Central"'),
    }),
    execute: async ({ day, time, time_zone }) => {
      if (booked) {
        const same = booked.day === day && booked.time === time && booked.timeZone === time_zone;
        if (same) return { status: 'already_booked', booking: booked, say: 'This call back is already booked — read it back; do not book another.' };
        const updated: CallbackRequest = { day, time, timeZone: time_zone, date: resolveDay(day, deps.now?.() ?? new Date()) };
        booked = updated;
        await deps.reschedule(updated);
        return { status: 'rescheduled', booking: updated, say: `The existing call back was moved. Read it back: ${day}${updated.date ? ` (${updated.date})` : ''} at ${time} ${time_zone} time.` };
      }
      if (!deps.canBook()) return { status: 'not_now', say: 'Only book a call back when the borrower has asked for one.' };
      const req: CallbackRequest = { day, time, timeZone: time_zone, date: resolveDay(day, deps.now?.() ?? new Date()) };
      booked = req;
      await deps.book(req);
      deps.onResult('booked');
      return {
        status: 'booked',
        booking: req,
        say: `Read the booking back: ${day}${req.date ? ` (${req.date})` : ''} at ${time} ${time_zone} time, a licensed loan officer will call.`,
      };
    },
  });

  return [transfer_to_loan_officer, schedule_callback];
}

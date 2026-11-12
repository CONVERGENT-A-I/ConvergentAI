import { createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID } from 'node:crypto';
import { google, type calendar_v3 } from 'googleapis';

export interface CalendarRoute {
  calendarId: string;
  loanOfficerName?: string;
  loanOfficerEmail?: string;
  timeZone?: string;
}

export interface SchedulingRoute {
  queueExtension: string;
  queueName: string | null;
  stateCode: string;
  calendars: CalendarRoute[];
}

export interface PublicSlot {
  start: string;
  end: string;
  display: string;
  bookingToken: string;
}

export interface BookingTokenPayload {
  jti: string;
  calendarId: string;
  queueExtension: string;
  stateCode: string;
  start: string;
  end: string;
  loanOfficerName?: string;
  loanOfficerEmail?: string;
  exp: number;
}

function requiredSecret(): string {
  const value = process.env.BOOKING_TOKEN_SECRET || process.env.LIVEKIT_API_SECRET;
  if (!value || value.length < 24) throw new Error('BOOKING_TOKEN_SECRET is missing or too short');
  return value;
}

function sign(payload: BookingTokenPayload): string {
  const key = createHash('sha256').update(requiredSecret()).digest();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(payload), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]).toString('base64url');
}

export function verifyBookingToken(token: string): BookingTokenPayload {
  if (!token || token.length > 4096) throw new Error('Invalid booking token');
  const packed = Buffer.from(token, 'base64url');
  if (packed.length < 29) throw new Error('Invalid booking token');
  const key = createHash('sha256').update(requiredSecret()).digest();
  const decipher = createDecipheriv('aes-256-gcm', key, packed.subarray(0, 12));
  decipher.setAuthTag(packed.subarray(12, 28));
  const plaintext = Buffer.concat([decipher.update(packed.subarray(28)), decipher.final()]).toString('utf8');
  const parsed = JSON.parse(plaintext) as BookingTokenPayload;
  if (!parsed.calendarId || !parsed.start || !parsed.end || !parsed.queueExtension || parsed.exp < Date.now()) {
    throw new Error('Expired or invalid booking token');
  }
  return parsed;
}

function credentials(): { client_email: string; private_key: string } {
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (json) {
    const parsed = JSON.parse(json) as { client_email?: string; private_key?: string };
    if (parsed.client_email && parsed.private_key) return { client_email: parsed.client_email, private_key: parsed.private_key };
  }
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!clientEmail || !privateKey) throw new Error('Google Calendar credentials are not configured');
  return { client_email: clientEmail, private_key: privateKey };
}

function calendarClient(): calendar_v3.Calendar {
  const auth = new google.auth.GoogleAuth({
    credentials: credentials(),
    scopes: ['https://www.googleapis.com/auth/calendar'],
    ...(process.env.GOOGLE_IMPERSONATE_USER ? { clientOptions: { subject: process.env.GOOGLE_IMPERSONATE_USER } } : {}),
  });
  return google.calendar({ version: 'v3', auth });
}

export function isGoogleCalendarConfigured(): boolean {
  return Boolean(
    (process.env.GOOGLE_SERVICE_ACCOUNT_JSON || (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY)) &&
    (process.env.GOOGLE_CALENDAR_ROUTING_JSON || process.env.GOOGLE_CALENDAR_ID),
  );
}

export function calendarsForRoute(queueExtension: string, stateCode: string): CalendarRoute[] {
  const raw = process.env.GOOGLE_CALENDAR_ROUTING_JSON;
  if (raw) {
    const mapping = JSON.parse(raw) as Record<string, string | CalendarRoute | Array<string | CalendarRoute>>;
    const selected = mapping[queueExtension] ?? mapping[stateCode] ?? mapping.default;
    const values = Array.isArray(selected) ? selected : selected ? [selected] : [];
    const calendars = values.map((value) => typeof value === 'string' ? { calendarId: value } : value)
      .filter((value): value is CalendarRoute => Boolean(value?.calendarId));
    if (calendars.length) return calendars;
  }
  return process.env.GOOGLE_CALENDAR_ID ? [{ calendarId: process.env.GOOGLE_CALENDAR_ID }] : [];
}

function timeParts(date: Date, timeZone: string): Record<string, number> {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(date);
  const result: Record<string, number> = {};
  for (const part of parts) if (part.type !== 'literal') result[part.type] = Number(part.value);
  return result;
}

function zonedToUtc(year: number, month: number, day: number, hour: number, minute: number, timeZone: string): Date {
  const guess = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const first = timeParts(guess, timeZone);
  const represented = Date.UTC(first.year!, first.month! - 1, first.day!, first.hour!, first.minute!, first.second || 0);
  const corrected = new Date(guess.getTime() - (represented - guess.getTime()));
  const second = timeParts(corrected, timeZone);
  const representedAgain = Date.UTC(second.year!, second.month! - 1, second.day!, second.hour!, second.minute!, second.second || 0);
  return new Date(corrected.getTime() - (representedAgain - Date.UTC(year, month - 1, day, hour, minute)));
}

function parseClock(value: string, fallback: [number, number]): [number, number] {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!match) return fallback;
  return [Math.min(23, Number(match[1])), Math.min(59, Number(match[2]))];
}

function overlaps(start: Date, end: Date, busy: calendar_v3.Schema$TimePeriod[]): boolean {
  return busy.some((period) => {
    const busyStart = period.start ? new Date(period.start) : null;
    const busyEnd = period.end ? new Date(period.end) : null;
    return Boolean(busyStart && busyEnd && start < busyEnd && end > busyStart);
  });
}

function localDateKey(date: Date, timeZone: string): string {
  const parts = timeParts(date, timeZone);
  return `${String(parts.year).padStart(4, '0')}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
}

export async function listAvailableSlots(
  route: SchedulingRoute,
  customerTimeZone: string,
  days = 7,
  customerDate?: string,
): Promise<PublicSlot[]> {
  if (!route.calendars.length) throw new Error('No Google Calendar mapped to this MLO queue');
  new Intl.DateTimeFormat('en-US', { timeZone: customerTimeZone }).format(new Date());
  const durationMinutes = Math.max(15, Math.min(Number(process.env.GOOGLE_MEETING_DURATION_MINUTES || 30), 180));
  const intervalMinutes = Math.max(15, Math.min(Number(process.env.GOOGLE_SLOT_INTERVAL_MINUTES || 30), 180));
  const minimumNoticeMs = Math.max(0, Number(process.env.GOOGLE_MINIMUM_NOTICE_MINUTES || 120)) * 60_000;
  const [openHour, openMinute] = parseClock(process.env.GOOGLE_BUSINESS_START || '09:00', [9, 0]);
  const [closeHour, closeMinute] = parseClock(process.env.GOOGLE_BUSINESS_END || '17:00', [17, 0]);
  const calendarTimeZone = route.calendars[0]?.timeZone || process.env.GOOGLE_CALENDAR_TIMEZONE || customerTimeZone;
  const now = new Date();
  const localNow = timeParts(now, calendarTimeZone);
  const firstLocalNoon = zonedToUtc(localNow.year!, localNow.month!, localNow.day!, 12, 0, calendarTimeZone);
  const rangeStart = now.toISOString();
  const rangeEnd = new Date(firstLocalNoon.getTime() + (Math.max(1, Math.min(days, 21)) + 1) * 86_400_000).toISOString();
  const calendar = calendarClient();
  const ids = route.calendars.map((item) => item.calendarId);
  const freeBusy = await calendar.freebusy.query({ requestBody: { timeMin: rangeStart, timeMax: rangeEnd, items: ids.map((id) => ({ id })) } });
  const slots: PublicSlot[] = [];
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: customerTimeZone, weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  });

  for (let offset = 0; offset < Math.max(1, Math.min(days, 21)); offset += 1) {
    const cursor = new Date(firstLocalNoon.getTime() + offset * 86_400_000);
    const local = timeParts(cursor, calendarTimeZone);
    const weekday = new Intl.DateTimeFormat('en-US', { timeZone: calendarTimeZone, weekday: 'short' }).format(cursor);
    if (weekday === 'Sat' || weekday === 'Sun') continue;
    const opening = zonedToUtc(local.year!, local.month!, local.day!, openHour, openMinute, calendarTimeZone);
    const closing = zonedToUtc(local.year!, local.month!, local.day!, closeHour, closeMinute, calendarTimeZone);
    for (let startMs = opening.getTime(); startMs + durationMinutes * 60_000 <= closing.getTime(); startMs += intervalMinutes * 60_000) {
      if (startMs < Date.now() + minimumNoticeMs) continue;
      const start = new Date(startMs);
      const end = new Date(startMs + durationMinutes * 60_000);
      const selected = route.calendars.find((item) => !overlaps(start, end, freeBusy.data.calendars?.[item.calendarId]?.busy || []));
      if (!selected) continue;
      const payload: BookingTokenPayload = {
        jti: randomUUID(),
        calendarId: selected.calendarId,
        queueExtension: route.queueExtension,
        stateCode: route.stateCode,
        start: start.toISOString(),
        end: end.toISOString(),
        exp: Date.now() + 15 * 60_000,
        ...(selected.loanOfficerName ? { loanOfficerName: selected.loanOfficerName } : {}),
        ...(selected.loanOfficerEmail ? { loanOfficerEmail: selected.loanOfficerEmail } : {}),
      };
      if (customerDate && localDateKey(start, customerTimeZone) !== customerDate) continue;
      slots.push({ start: payload.start, end: payload.end, display: formatter.format(start), bookingToken: sign(payload) });
      if (slots.length >= 12) return slots;
    }
  }
  return slots;
}

export async function createCalendarAppointment(input: {
  token: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerNotes?: string;
  customerTimeZone: string;
  zipCode: string;
  queueName: string | null;
  roomName?: string;
  applicationId?: string;
}): Promise<{
  confirmationNumber: string;
  eventId: string;
  htmlLink: string | null;
  meetLink: string | null;
  start: string;
  end: string;
  loanOfficerName: string | null;
  calendarId: string;
  hostEmail: string | null;
  hostInvitationIncluded: boolean;
  hostResponseStatus: string | null;
  hostIsEventCreator: boolean;
}> {
  const payload = verifyBookingToken(input.token);
  const calendar = calendarClient();
  const recheck = await calendar.freebusy.query({ requestBody: { timeMin: payload.start, timeMax: payload.end, items: [{ id: payload.calendarId }] } });
  if ((recheck.data.calendars?.[payload.calendarId]?.busy || []).length) throw new Error('SLOT_NO_LONGER_AVAILABLE');

  const confirmationNumber = `MLO-${randomUUID().replace(/-/g, '').slice(0, 10).toUpperCase()}`;
  const attendees: calendar_v3.Schema$EventAttendee[] = [{ email: input.customerEmail }];
  const hostEmail = (payload.loanOfficerEmail || process.env.GOOGLE_MEETING_HOST_EMAIL || '').trim() || null;
  if (hostEmail && hostEmail.toLowerCase() !== input.customerEmail.toLowerCase()) {
    attendees.push({ email: hostEmail });
  }
  const impersonatedUser = (process.env.GOOGLE_IMPERSONATE_USER || '').trim().toLowerCase();
  const hostIsEventCreator = Boolean(hostEmail && impersonatedUser && hostEmail.toLowerCase() === impersonatedUser);
  if (!hostEmail) {
    console.warn('[calendar-booking]: GOOGLE_MEETING_HOST_EMAIL/loanOfficerEmail is missing; no Loan Officer RSVP invitation can be sent');
  } else if (hostIsEventCreator) {
    console.warn(`[calendar-booking]: host ${hostEmail} is also GOOGLE_IMPERSONATE_USER; Google may treat the host as event creator and suppress a self-invitation`);
  }
  const requestId = randomUUID();
  const response = await calendar.events.insert({
    calendarId: payload.calendarId,
    sendUpdates: 'all',
    conferenceDataVersion: process.env.GOOGLE_CREATE_MEET_LINK === 'false' ? 0 : 1,
    requestBody: {
      summary: `Mortgage consultation — ${input.customerName}`,
      description: [
        `Confirmation: ${confirmationNumber}`,
        `Customer: ${input.customerName}`,
        input.customerPhone ? `Phone: ${input.customerPhone}` : null,
        input.customerNotes ? `Customer notes:\n${input.customerNotes}` : null,
        `ZIP: ${input.zipCode}`,
        `State: ${payload.stateCode}`,
        `MLO Queue: ${input.queueName || payload.queueExtension} (${payload.queueExtension})`,
        input.applicationId ? `Application ID: ${input.applicationId}` : null,
        input.roomName ? `Ailana Session: ${input.roomName}` : null,
      ].filter(Boolean).join('\n'),
      start: { dateTime: payload.start, timeZone: input.customerTimeZone },
      end: { dateTime: payload.end, timeZone: input.customerTimeZone },
      attendees,
      guestsCanInviteOthers: false,
      guestsCanModify: false,
      guestsCanSeeOtherGuests: true,
      ...(process.env.GOOGLE_CREATE_MEET_LINK === 'false' ? {} : {
        conferenceData: { createRequest: { requestId, conferenceSolutionKey: { type: 'hangoutsMeet' } } },
      }),
      extendedProperties: { private: { confirmationNumber, queueExtension: payload.queueExtension, zipCode: input.zipCode } },
    },
  });
  if (!response.data.id) throw new Error('Google Calendar did not return an event ID');
  const persistedHost = hostEmail
    ? response.data.attendees?.find((attendee) => attendee.email?.toLowerCase() === hostEmail.toLowerCase())
    : undefined;
  return {
    confirmationNumber,
    eventId: response.data.id,
    htmlLink: response.data.htmlLink || null,
    meetLink: response.data.hangoutLink || null,
    start: payload.start,
    end: payload.end,
    loanOfficerName: payload.loanOfficerName || null,
    calendarId: payload.calendarId,
    hostEmail,
    hostInvitationIncluded: Boolean(persistedHost),
    hostResponseStatus: persistedHost?.responseStatus || null,
    hostIsEventCreator,
  };
}

export async function deleteCalendarEvent(calendarId: string, eventId: string): Promise<void> {
  await calendarClient().events.delete({ calendarId, eventId, sendUpdates: 'all' });
}

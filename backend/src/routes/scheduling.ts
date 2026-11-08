import { Router } from 'express';
import type { Request, Response } from 'express';
import pkg from 'pg';
import type { PoolClient } from 'pg';
import { z } from 'zod';
import { allowRequest, requestKey, safeErrorMessage } from '../utils/security.js';
import { getQueueAvailability, isEslConfigured } from '../services/freeswitch-esl.js';
import {
  calendarsForRoute,
  createCalendarAppointment,
  deleteCalendarEvent,
  isGoogleCalendarConfigured,
  listAvailableSlots,
  verifyBookingToken,
  type SchedulingRoute,
} from '../services/google-calendar.js';
import { sendBookingNotification } from '../services/booking-notification.js';

const { Pool } = pkg;
const router = Router();
const applicationDb = new Pool({ connectionString: process.env.DATABASE_URL, max: 4, idleTimeoutMillis: 30_000 });
const pbxDb = new Pool({
  host: process.env.FSPBX_DB_HOST,
  user: process.env.FSPBX_DB_USER || 'fusionpbx',
  password: process.env.FSPBX_DB_PASSWORD,
  database: process.env.FSPBX_DB_NAME || 'fusionpbx',
  port: Number(process.env.FSPBX_DB_PORT || 5432),
  max: 4,
  idleTimeoutMillis: 30_000,
});

const zipSchema = z.string().regex(/^\d{5}$/);
const timeZoneSchema = z.string().min(3).max(80).regex(/^[A-Za-z_+\-/]+$/);
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const bookingSchema = z.object({
  bookingToken: z.string().min(40).max(4096),
  customerName: z.string().trim().min(2).max(120),
  customerEmail: z.string().trim().email().max(254),
  customerPhone: z.string().trim().max(30).optional(),
  customerNotes: z.string().trim().max(2000).optional(),
  customerTimeZone: timeZoneSchema,
  zipCode: zipSchema,
  queueName: z.string().trim().max(160).nullable().optional(),
  roomName: z.string().trim().max(100).optional(),
  applicationId: z.string().uuid().optional(),
  consent: z.literal(true),
});

async function resolveSchedulingRoute(zipCode: string): Promise<SchedulingRoute | null> {
  const result = await pbxDb.query<{ fspbx_extension: string; queue_name: string | null; state_code: string }>(
    `SELECT sq.fspbx_extension, sq.queue_name, z.state_code
       FROM routing.zip_state z
       JOIN routing.state_queue sq ON sq.state_code = z.state_code AND sq.active = true
      WHERE z.zip_code = $1
      LIMIT 1`,
    [zipCode],
  );
  const row = result.rows[0];
  if (!row) return null;
  return {
    queueExtension: String(row.fspbx_extension),
    queueName: row.queue_name,
    stateCode: row.state_code,
    calendars: calendarsForRoute(String(row.fspbx_extension), row.state_code),
  };
}

router.get('/mlo-availability', async (req: Request, res: Response): Promise<void> => {
  if (!allowRequest(requestKey(req, 'mlo-availability'), 30)) {
    res.status(429).json({ error: 'Too many requests' });
    return;
  }
  const parsedZip = zipSchema.safeParse(String(req.query.zip || ''));
  if (!parsedZip.success) {
    res.status(400).json({ error: 'A valid 5-digit ZIP code is required' });
    return;
  }
  try {
    const route = await resolveSchedulingRoute(parsedZip.data);
    if (!route) {
      res.status(404).json({ error: 'unsupported_area', available: false });
      return;
    }
    if (!isEslConfigured()) {
      res.status(503).json({ error: 'availability_check_not_configured', available: false, schedulingAvailable: isGoogleCalendarConfigured() });
      return;
    }
    const availability = await getQueueAvailability(route.queueExtension, true);
    res.json({
      ok: true,
      available: availability.available,
      availableCount: availability.availableCount,
      totalAgents: availability.totalAgents,
      queueName: route.queueName,
      queueNumber: route.queueExtension,
      state: route.stateCode,
      schedulingAvailable: isGoogleCalendarConfigured() && route.calendars.length > 0,
    });
  } catch (error) {
    console.error('[mlo-availability]:', safeErrorMessage(error));
    res.status(503).json({ error: 'availability_check_failed', available: false, schedulingAvailable: isGoogleCalendarConfigured() });
  }
});

router.get('/scheduling/slots', async (req: Request, res: Response): Promise<void> => {
  if (!allowRequest(requestKey(req, 'calendar-slots'), 20)) {
    res.status(429).json({ error: 'Too many requests' });
    return;
  }
  const zip = zipSchema.safeParse(String(req.query.zip || ''));
  const timeZone = timeZoneSchema.safeParse(String(req.query.timeZone || ''));
  const requestedDate = req.query.date ? dateSchema.safeParse(String(req.query.date)) : null;
  if (!zip.success || !timeZone.success || (requestedDate && !requestedDate.success)) {
    res.status(400).json({ error: 'Valid ZIP code and time zone are required' });
    return;
  }
  try {
    const route = await resolveSchedulingRoute(zip.data);
    if (!route) {
      res.status(404).json({ error: 'unsupported_area' });
      return;
    }
    if (!route.calendars.length || !isGoogleCalendarConfigured()) {
      res.status(503).json({ error: 'calendar_not_configured' });
      return;
    }
    const slots = await listAvailableSlots(
      route,
      timeZone.data,
      Number(req.query.days || (requestedDate ? 21 : 7)),
      requestedDate?.success ? requestedDate.data : undefined,
    );
    res.json({
      ok: true,
      queueName: route.queueName,
      queueNumber: route.queueExtension,
      state: route.stateCode,
      timeZone: timeZone.data,
      durationMinutes: Number(process.env.GOOGLE_MEETING_DURATION_MINUTES || 30),
      slots,
    });
  } catch (error) {
    console.error('[calendar-slots]:', safeErrorMessage(error));
    res.status(502).json({ error: 'calendar_slots_unavailable' });
  }
});

router.post('/scheduling/book', async (req: Request, res: Response): Promise<void> => {
  if (!allowRequest(requestKey(req, 'calendar-book'), 8)) {
    res.status(429).json({ error: 'Too many booking requests' });
    return;
  }
  const parsed = bookingSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid booking details' });
    return;
  }
  const input = parsed.data;
  let event: Awaited<ReturnType<typeof createCalendarAppointment>> | null = null;
  let eventPersisted = false;
  let dbClient: PoolClient | null = null;
  let bookingKey: string | null = null;
  try {
    const route = await resolveSchedulingRoute(input.zipCode);
    if (!route) {
      res.status(404).json({ error: 'unsupported_area' });
      return;
    }
    const token = verifyBookingToken(input.bookingToken);
    bookingKey = token.jti;
    if (token.queueExtension !== route.queueExtension || token.stateCode !== route.stateCode) {
      res.status(409).json({ error: 'routing_changed' });
      return;
    }
    dbClient = await applicationDb.connect();
    await dbClient.query('SELECT pg_advisory_lock(hashtextextended($1, 0))', [bookingKey]);
    const existing = await dbClient.query<{
      confirmation_number: string;
      start_time_utc: Date;
      end_time_utc: Date;
      loan_officer_name: string | null;
    }>(
      `SELECT confirmation_number, start_time_utc, end_time_utc, loan_officer_name
         FROM appointments WHERE booking_key = $1 LIMIT 1`,
      [bookingKey],
    );
    if (existing.rows[0]) {
      const saved = existing.rows[0];
      res.status(200).json({
        ok: true,
        idempotentReplay: true,
        confirmationNumber: saved.confirmation_number,
        start: saved.start_time_utc.toISOString(),
        end: saved.end_time_utc.toISOString(),
        timeZone: input.customerTimeZone,
        loanOfficerName: saved.loan_officer_name,
        meetLink: null,
      });
      return;
    }

    event = await createCalendarAppointment({
      token: input.bookingToken,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerTimeZone: input.customerTimeZone,
      zipCode: input.zipCode,
      queueName: route.queueName,
      ...(input.customerPhone ? { customerPhone: input.customerPhone } : {}),
      ...(input.customerNotes ? { customerNotes: input.customerNotes } : {}),
      ...(input.roomName ? { roomName: input.roomName } : {}),
      ...(input.applicationId ? { applicationId: input.applicationId } : {}),
    });

    await dbClient.query(
      `INSERT INTO appointments (
         confirmation_number, booking_key, google_event_id, calendar_id, application_id,
         session_id, customer_name, customer_email, customer_phone, customer_notes, zip_code,
         state_code, queue_name, queue_number, loan_officer_name,
         start_time_utc, end_time_utc, customer_timezone, status,
         consent_timestamp, created_at, updated_at
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,'CONFIRMED',NOW(),NOW(),NOW())`,
      [
        event.confirmationNumber, bookingKey, event.eventId, event.calendarId, input.applicationId || null,
        input.roomName || null, input.customerName, input.customerEmail,
        input.customerPhone || null, input.customerNotes || null, input.zipCode, route.stateCode, route.queueName,
        route.queueExtension, event.loanOfficerName, event.start, event.end,
        input.customerTimeZone,
      ],
    );
    eventPersisted = true;

    let notification: Awaited<ReturnType<typeof sendBookingNotification>>;
    try {
      notification = await sendBookingNotification({
        confirmationNumber: event.confirmationNumber,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        zipCode: input.zipCode,
        stateCode: route.stateCode,
        queueName: route.queueName,
        queueNumber: route.queueExtension,
        start: event.start,
        end: event.end,
        customerTimeZone: input.customerTimeZone,
        calendarEventLink: event.htmlLink,
        meetLink: event.meetLink,
        ...(input.customerPhone ? { customerPhone: input.customerPhone } : {}),
        ...(input.customerNotes ? { customerNotes: input.customerNotes } : {}),
      });
    } catch (notificationError) {
      notification = {
        sent: false,
        skipped: false,
        recipient: (process.env.GOOGLE_BOOKING_NOTIFICATION_EMAIL || '').trim() || null,
        messageId: null,
        error: safeErrorMessage(notificationError).slice(0, 1000),
      };
    }
    try {
      await dbClient.query(
        `UPDATE appointments
            SET notification_email = $1,
                notification_status = $2,
                notification_message_id = $3,
                notification_error = $4,
                notification_sent_at = CASE WHEN $2 = 'SENT' THEN NOW() ELSE NULL END,
                updated_at = NOW()
          WHERE booking_key = $5`,
        [
          notification.recipient,
          notification.sent ? 'SENT' : notification.skipped ? 'SKIPPED' : 'FAILED',
          notification.messageId,
          notification.error,
          bookingKey,
        ],
      );
    } catch (notificationAuditError) {
      console.error('[calendar-notification-audit]:', safeErrorMessage(notificationAuditError));
    }
    console.log(
      `[calendar-notification]: confirmation=${event.confirmationNumber}` +
      ` recipient=${notification.recipient || 'missing'} status=${notification.sent ? 'SENT' : notification.skipped ? 'SKIPPED' : 'FAILED'}` +
      (notification.error ? ` reason=${notification.error}` : ''),
    );

    console.log(
      `[calendar-booking]: ${event.confirmationNumber} queue=${route.queueExtension} zip=${input.zipCode}` +
      ` host=${event.hostEmail || 'missing'} hostIncluded=${event.hostInvitationIncluded}` +
      ` hostStatus=${event.hostResponseStatus || 'none'} hostIsCreator=${event.hostIsEventCreator}`,
    );
    res.status(201).json({
      ok: true,
      confirmationNumber: event.confirmationNumber,
      start: event.start,
      end: event.end,
      timeZone: input.customerTimeZone,
      loanOfficerName: event.loanOfficerName,
      meetLink: event.meetLink,
      hostInvitationIncluded: event.hostInvitationIncluded,
      hostEmail: event.hostEmail,
      hostIsEventCreator: event.hostIsEventCreator,
      notificationSent: notification.sent,
    });
  } catch (error) {
    if (event && !eventPersisted) {
      try { await deleteCalendarEvent(event.calendarId, event.eventId); } catch (rollbackError) {
        console.error('[calendar-booking-rollback]:', safeErrorMessage(rollbackError));
      }
    }
    const message = safeErrorMessage(error);
    console.error('[calendar-booking]:', message);
    if (message.includes('SLOT_NO_LONGER_AVAILABLE')) {
      res.status(409).json({ error: 'slot_no_longer_available' });
      return;
    }
    res.status(502).json({ error: 'appointment_creation_failed' });
  } finally {
    if (dbClient) {
      if (bookingKey) {
        try { await dbClient.query('SELECT pg_advisory_unlock(hashtextextended($1, 0))', [bookingKey]); } catch { /* connection is discarded below */ }
      }
      dbClient.release();
    }
  }
});

export default router;

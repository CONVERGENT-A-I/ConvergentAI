import pkg from 'pg';
import type { PoolClient } from 'pg';
import {
  calendarsForRoute,
  createCalendarAppointment,
  deleteCalendarEvent,
  listAvailableSlots,
  verifyBookingToken,
  type PublicSlot,
  type SchedulingRoute,
} from './google-calendar.js';
import { sendBookingNotification, sendCustomerBookingConfirmation } from './booking-notification.js';
import { safeErrorMessage } from '../utils/security.js';

const { Pool } = pkg;
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

export interface ConversationalBookingInput {
  bookingToken: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerNotes?: string;
  customerTimeZone: string;
  zipCode: string;
  queueName?: string | null;
  roomName?: string;
  applicationId?: string;
  consent: true;
}

export async function resolveConversationalSchedulingRoute(zipCode: string): Promise<SchedulingRoute | null> {
  const result = await pbxDb.query<{ fspbx_extension: string; queue_name: string | null; state_code: string }>(
    `SELECT sq.fspbx_extension, sq.queue_name, z.state_code
       FROM routing.zip_state z
       JOIN routing.state_queue sq ON sq.state_code = z.state_code AND sq.active = true
      WHERE z.zip_code = $1 LIMIT 1`,
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

export async function findConversationalSlots(
  zipCode: string,
  customerTimeZone: string,
  requestedDate?: string,
): Promise<{ route: SchedulingRoute; slots: PublicSlot[] }> {
  const route = await resolveConversationalSchedulingRoute(zipCode);
  if (!route) throw new Error('UNSUPPORTED_AREA');
  const slots = await listAvailableSlots(route, customerTimeZone, requestedDate ? 21 : 7, requestedDate);
  return { route, slots };
}

export async function bookConversationalAppointment(input: ConversationalBookingInput) {
  if (!input.consent) throw new Error('EXPLICIT_CONSENT_REQUIRED');
  const route = await resolveConversationalSchedulingRoute(input.zipCode);
  if (!route) throw new Error('UNSUPPORTED_AREA');
  const token = verifyBookingToken(input.bookingToken);
  if (token.queueExtension !== route.queueExtension || token.stateCode !== route.stateCode) {
    throw new Error('ROUTING_CHANGED');
  }

  let client: PoolClient | null = null;
  let event: Awaited<ReturnType<typeof createCalendarAppointment>> | null = null;
  let persisted = false;
  try {
    client = await applicationDb.connect();
    await client.query('SELECT pg_advisory_lock(hashtextextended($1, 0))', [token.jti]);
    const replay = await client.query<{ confirmation_number: string; start_time_utc: Date; end_time_utc: Date }>(
      `SELECT confirmation_number, start_time_utc, end_time_utc FROM appointments WHERE booking_key=$1 LIMIT 1`,
      [token.jti],
    );
    if (replay.rows[0]) {
      return {
        confirmationNumber: replay.rows[0].confirmation_number,
        start: replay.rows[0].start_time_utc.toISOString(),
        end: replay.rows[0].end_time_utc.toISOString(),
        meetLink: null,
        idempotentReplay: true,
      };
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
    await client.query(
      `INSERT INTO appointments (
        confirmation_number, booking_key, google_event_id, calendar_id, application_id,
        session_id, customer_name, customer_email, customer_phone, customer_notes, zip_code,
        state_code, queue_name, queue_number, loan_officer_name, start_time_utc, end_time_utc,
        customer_timezone, status, consent_timestamp, created_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,'CONFIRMED',NOW(),NOW(),NOW())`,
      [event.confirmationNumber, token.jti, event.eventId, event.calendarId, input.applicationId || null,
        input.roomName || null, input.customerName, input.customerEmail, input.customerPhone || null,
        input.customerNotes || null, input.zipCode, route.stateCode, route.queueName, route.queueExtension,
        event.loanOfficerName, event.start, event.end, input.customerTimeZone],
    );
    persisted = true;

    const staffNotificationInput = {
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
    };
    const customerConfirmationInput = {
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
    };
    // Staff and customer email are independent. Sending them in parallel avoids
    // adding two Gmail API round trips to the booking confirmation latency.
    const [notification, firstCustomerConfirmation] = await Promise.all([
      sendBookingNotification(staffNotificationInput)
        .catch((error) => ({ sent: false, skipped: false, recipient: null, messageId: null, error: safeErrorMessage(error) })),
      sendCustomerBookingConfirmation(customerConfirmationInput)
        .catch((error) => ({ sent: false, skipped: false, recipient: input.customerEmail, messageId: null, error: safeErrorMessage(error) })),
    ]);
    let customerConfirmation = firstCustomerConfirmation;
    if (!customerConfirmation.sent && !customerConfirmation.skipped) {
      await new Promise(resolve => setTimeout(resolve, 400));
      console.warn(`[voice-calendar-customer-email]: first attempt failed for confirmation=${event.confirmationNumber}; retrying once`);
      customerConfirmation = await sendCustomerBookingConfirmation(customerConfirmationInput)
        .catch((error) => ({ sent: false, skipped: false, recipient: input.customerEmail, messageId: null, error: safeErrorMessage(error) }));
    }
    await client.query(
      `UPDATE appointments SET notification_email=$1, notification_status=$2,
       notification_message_id=$3, notification_error=$4,
       notification_sent_at=CASE WHEN $2='SENT' THEN NOW() ELSE NULL END, updated_at=NOW()
       WHERE booking_key=$5`,
      [notification.recipient, notification.sent ? 'SENT' : notification.skipped ? 'SKIPPED' : 'FAILED',
        notification.messageId, notification.error, token.jti],
    );
    console.log(`[voice-calendar-booking]: ${event.confirmationNumber} queue=${route.queueExtension} zip=${input.zipCode}`);
    console.log(`[voice-calendar-customer-email]: confirmation=${event.confirmationNumber} sent=${customerConfirmation.sent} recipient=${input.customerEmail}${customerConfirmation.error ? ` error=${customerConfirmation.error}` : ''}`);
    return {
      confirmationNumber: event.confirmationNumber,
      start: event.start,
      end: event.end,
      meetLink: event.meetLink,
      customerEmailSent: customerConfirmation.sent,
      staffEmailSent: notification.sent,
      idempotentReplay: false,
    };
  } catch (error) {
    if (event && !persisted) await deleteCalendarEvent(event.calendarId, event.eventId).catch(() => undefined);
    throw error;
  } finally {
    if (client) {
      try { await client.query('SELECT pg_advisory_unlock(hashtextextended($1, 0))', [token.jti]); } catch { /* discard */ }
      client.release();
    }
  }
}

import { google } from 'googleapis';

export interface BookingNotificationInput {
  confirmationNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerNotes?: string;
  zipCode: string;
  stateCode: string;
  queueName: string | null;
  queueNumber: string;
  start: string;
  end: string;
  customerTimeZone: string;
  calendarEventLink: string | null;
  meetLink: string | null;
}

export interface BookingNotificationResult {
  sent: boolean;
  skipped: boolean;
  recipient: string | null;
  messageId: string | null;
  error: string | null;
}

function credentials(): { client_email: string; private_key: string } {
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (json) {
    const parsed = JSON.parse(json) as { client_email?: string; private_key?: string };
    if (parsed.client_email && parsed.private_key) {
      return { client_email: parsed.client_email, private_key: parsed.private_key };
    }
  }
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!clientEmail || !privateKey) throw new Error('Google credentials are not configured');
  return { client_email: clientEmail, private_key: privateKey };
}

function configuredEmail(name: string): string | null {
  const value = (process.env[name] || '').trim();
  if (!value) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw new Error(`${name} is not a valid email address`);
  return value;
}

function safeErrorMessage(error: unknown): string {
  const candidate = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
  return candidate?.response?.data?.error?.message || candidate?.message || String(error);
}

function formatInTimeZone(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date(iso));
}

function buildRawMessage(from: string, to: string, input: BookingNotificationInput): string {
  const lines = [
    `A customer booked a Loan Officer meeting through Ailana.`,
    '',
    `Confirmation: ${input.confirmationNumber}`,
    `Customer: ${input.customerName}`,
    `Customer email: ${input.customerEmail}`,
    input.customerPhone ? `Customer phone: ${input.customerPhone}` : null,
    `ZIP / State: ${input.zipCode} / ${input.stateCode}`,
    `Queue: ${input.queueName || 'Assigned Loan Officer Queue'} (${input.queueNumber})`,
    `Start: ${formatInTimeZone(input.start, input.customerTimeZone)}`,
    `End: ${formatInTimeZone(input.end, input.customerTimeZone)}`,
    `Customer time zone: ${input.customerTimeZone}`,
    input.customerNotes ? `Customer notes:\n${input.customerNotes}` : 'Customer notes: None provided',
    '',
    input.calendarEventLink ? `Open Calendar event: ${input.calendarEventLink}` : null,
    input.meetLink ? `Join Google Meet: ${input.meetLink}` : null,
  ].filter((line): line is string => line !== null);

  const headers = [
    `From: Ailana Scheduling <${from}>`,
    `To: ${to}`,
    `Subject: New Ailana meeting booked - ${input.confirmationNumber}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
  ];
  return Buffer.from([...headers, '', ...lines].join('\r\n'), 'utf8').toString('base64url');
}

function buildCustomerConfirmationMessage(from: string, input: BookingNotificationInput): string {
  const lines = [
    `Hello ${input.customerName},`,
    '',
    `Your callback with a licensed Loan Officer has been scheduled.`,
    '',
    `Confirmation: ${input.confirmationNumber}`,
    `Date and time: ${formatInTimeZone(input.start, input.customerTimeZone)}`,
    `Time zone: ${input.customerTimeZone}`,
    `Queue: ${input.queueName || 'Assigned Loan Officer Queue'} (${input.queueNumber})`,
    input.customerNotes ? `Your notes:\n${input.customerNotes}` : null,
    '',
    input.calendarEventLink ? `Open Calendar event: ${input.calendarEventLink}` : null,
    input.meetLink ? `Google Meet: ${input.meetLink}` : null,
    '',
    `A Loan Officer will contact you using the phone number provided during your conversation with Ailana.`,
  ].filter((line): line is string => line !== null);
  const headers = [
    `From: Ailana Scheduling <${from}>`,
    `To: ${input.customerEmail}`,
    `Subject: Your Loan Officer callback is scheduled - ${input.confirmationNumber}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
  ];
  return Buffer.from([...headers, '', ...lines].join('\r\n'), 'utf8').toString('base64url');
}

export async function sendBookingNotification(input: BookingNotificationInput): Promise<BookingNotificationResult> {
  const recipient = configuredEmail('GOOGLE_BOOKING_NOTIFICATION_EMAIL');
  const sender = configuredEmail('GOOGLE_BOOKING_NOTIFICATION_FROM');
  if (!recipient || !sender) {
    return {
      sent: false,
      skipped: true,
      recipient,
      messageId: null,
      error: 'GOOGLE_BOOKING_NOTIFICATION_EMAIL/FROM is not configured',
    };
  }

  const auth = new google.auth.GoogleAuth({
    credentials: credentials(),
    scopes: ['https://www.googleapis.com/auth/gmail.send'],
    clientOptions: { subject: sender },
  });
  const gmail = google.gmail({ version: 'v1', auth });
  const raw = buildRawMessage(sender, recipient, input);

  try {
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw },
    });
    return {
      sent: Boolean(response.data.id),
      skipped: false,
      recipient,
      messageId: response.data.id || null,
      error: response.data.id ? null : 'Gmail API did not return a message ID',
    };
  } catch (error) {
    return {
      sent: false,
      skipped: false,
      recipient,
      messageId: null,
      error: safeErrorMessage(error).slice(0, 1000),
    };
  }
}

export async function sendCustomerBookingConfirmation(input: BookingNotificationInput): Promise<BookingNotificationResult> {
  const sender = configuredEmail('GOOGLE_BOOKING_NOTIFICATION_FROM');
  if (!sender) {
    return { sent: false, skipped: true, recipient: input.customerEmail, messageId: null, error: 'GOOGLE_BOOKING_NOTIFICATION_FROM is not configured' };
  }
  const auth = new google.auth.GoogleAuth({
    credentials: credentials(),
    scopes: ['https://www.googleapis.com/auth/gmail.send'],
    clientOptions: { subject: sender },
  });
  const gmail = google.gmail({ version: 'v1', auth });
  try {
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: buildCustomerConfirmationMessage(sender, input) },
    });
    return {
      sent: Boolean(response.data.id),
      skipped: false,
      recipient: input.customerEmail,
      messageId: response.data.id || null,
      error: response.data.id ? null : 'Gmail API did not return a message ID',
    };
  } catch (error) {
    return { sent: false, skipped: false, recipient: input.customerEmail, messageId: null, error: safeErrorMessage(error).slice(0, 1000) };
  }
}

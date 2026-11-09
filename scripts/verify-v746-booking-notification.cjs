const fs = require('node:fs');

const service = fs.readFileSync('backend/src/services/booking-notification.ts', 'utf8');
const route = fs.readFileSync('backend/src/routes/scheduling.ts', 'utf8');
const migration = fs.readFileSync('prisma/migrations/20260830123000_add_booking_notification_audit/migration.sql', 'utf8');

function expect(source, fragment, description) {
  if (!source.includes(fragment)) throw new Error(`Missing ${description}: ${fragment}`);
}

expect(service, "scopes: ['https://www.googleapis.com/auth/gmail.send']", 'least-privilege Gmail scope');
expect(service, "clientOptions: { subject: sender }", 'configured sender impersonation');
expect(service, "gmail.users.messages.send", 'Gmail delivery');
expect(service, 'Customer notes:', 'customer notes notification content');
expect(service, 'Open Calendar event:', 'Calendar event link');
expect(service, 'Join Google Meet:', 'Meet link');
expect(route, "notification.sent ? 'SENT'", 'notification audit status');
expect(route, '[calendar-notification]:', 'notification telemetry');
expect(route, 'notificationSent: notification.sent', 'API notification result');
expect(migration, 'notification_message_id', 'notification audit migration');

console.log('v7.4.6 booking-notification regression checks passed.');

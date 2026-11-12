const fs = require('node:fs');

const calendar = fs.readFileSync('backend/src/services/google-calendar.ts', 'utf8');
const routes = fs.readFileSync('backend/src/routes/scheduling.ts', 'utf8');
const scheduler = fs.readFileSync('src/components/floating-cta/google-calendar-scheduler.tsx', 'utf8');
const migration = fs.readFileSync('prisma/migrations/20260830113000_add_scheduler_appointments/migration.sql', 'utf8');

function expect(source, fragment, description) {
  if (!source.includes(fragment)) throw new Error(`Missing ${description}: ${fragment}`);
}

expect(scheduler, 'type="date"', 'customer date picker');
expect(scheduler, 'customerNotes: notes.trim()', 'customer notes booking payload');
expect(scheduler, 'A separate RSVP invitation was also sent', 'truthful host RSVP confirmation');
expect(routes, 'customerNotes: z.string().trim().max(2000).optional()', 'server-side notes validation');
expect(routes, 'customer_phone, customer_notes, zip_code', 'notes persistence');
expect(calendar, 'localDateKey(start, customerTimeZone) !== customerDate', 'customer-local date filtering');
expect(calendar, 'process.env.GOOGLE_MEETING_HOST_EMAIL', 'Loan Officer invitation recipient');
expect(calendar, 'hostIsEventCreator', 'self-invitation diagnostics');
expect(calendar, "sendUpdates: 'all'", 'Google invitation delivery');
expect(calendar, 'Customer notes:\\n', 'notes in Calendar event');
expect(migration, 'ADD COLUMN IF NOT EXISTS "customer_notes" TEXT', 'upgrade-safe notes migration');

const floatingCta = fs.readFileSync('src/components/floating-cta/index.tsx', 'utf8');
expect(floatingCta, 'Live Loan Officer Unavailable', 'queue-unavailable notice');
expect(floatingCta, 'Choose a Meeting Time', 'explicit scheduler transition');

console.log('v7.4.4 scheduling regression checks passed.');

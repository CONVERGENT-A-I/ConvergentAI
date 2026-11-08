-- Google Calendar scheduling persistence (v7.4.3).
-- CREATE TABLE supports clean environments; ALTER supports Labs where the
-- v7.4.2 emergency table was created before this migration was released.
CREATE TABLE IF NOT EXISTS "appointments" (
    "id" BIGSERIAL NOT NULL,
    "confirmation_number" TEXT NOT NULL,
    "booking_key" TEXT NOT NULL,
    "google_event_id" TEXT NOT NULL,
    "calendar_id" TEXT NOT NULL,
    "application_id" TEXT,
    "session_id" TEXT,
    "customer_name" TEXT NOT NULL,
    "customer_email" TEXT NOT NULL,
    "customer_phone" TEXT,
    "customer_notes" TEXT,
    "zip_code" TEXT NOT NULL,
    "state_code" TEXT NOT NULL,
    "queue_name" TEXT,
    "queue_number" TEXT NOT NULL,
    "loan_officer_name" TEXT,
    "start_time_utc" TIMESTAMPTZ NOT NULL,
    "end_time_utc" TIMESTAMPTZ NOT NULL,
    "customer_timezone" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "consent_timestamp" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "appointments_confirmation_number_key" UNIQUE ("confirmation_number"),
    CONSTRAINT "appointments_booking_key_key" UNIQUE ("booking_key"),
    CONSTRAINT "appointments_google_event_id_key" UNIQUE ("google_event_id")
);

ALTER TABLE "appointments"
    ADD COLUMN IF NOT EXISTS "customer_notes" TEXT;

CREATE INDEX IF NOT EXISTS "appointments_customer_email_idx" ON "appointments"("customer_email");
CREATE INDEX IF NOT EXISTS "appointments_queue_number_idx" ON "appointments"("queue_number");
CREATE INDEX IF NOT EXISTS "appointments_start_time_utc_idx" ON "appointments"("start_time_utc");
CREATE INDEX IF NOT EXISTS "appointments_status_idx" ON "appointments"("status");

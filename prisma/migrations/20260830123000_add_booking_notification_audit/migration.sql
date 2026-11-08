ALTER TABLE "appointments"
    ADD COLUMN IF NOT EXISTS "notification_email" TEXT,
    ADD COLUMN IF NOT EXISTS "notification_status" TEXT,
    ADD COLUMN IF NOT EXISTS "notification_message_id" TEXT,
    ADD COLUMN IF NOT EXISTS "notification_error" TEXT,
    ADD COLUMN IF NOT EXISTS "notification_sent_at" TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS "appointments_notification_status_idx"
    ON "appointments"("notification_status");

-- -- CreateEnum
-- CREATE TYPE "application_status" AS ENUM ('DRAFT', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'APPROVED_WITH_CONDITIONS', 'REFERRED', 'SUSPENDED', 'DECLINED', 'WITHDRAWN');

-- -- CreateEnum
-- CREATE TYPE "message_role" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- -- CreateEnum
-- CREATE TYPE "session_status" AS ENUM ('ACTIVE', 'COMPLETED', 'ABANDONED', 'ERROR', 'TIMEOUT');

-- -- CreateEnum
-- CREATE TYPE "consent_type" AS ENUM ('SOFT_PULL_CREDIT', 'STAGE2_CLOSING_OFFER', 'STAGE3B_SUBMISSION', 'PREFILL_CONFIRMATION', 'TERMS_OF_SERVICE', 'PRIVACY_POLICY');

-- -- CreateEnum
-- CREATE TYPE "consent_status" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'WITHDRAWN');

-- -- CreateEnum
-- CREATE TYPE "error_type" AS ENUM ('API_FAILURE_CEREBRAS', 'API_FAILURE_CARTESIA', 'API_FAILURE_LIVEKIT', 'API_FAILURE_LEMONSLICE', 'EXTRACTION_FAILURE', 'LOW_CONFIDENCE_STT', 'CONTEXT_COMPACTION_FAILURE', 'TIMEOUT', 'VALIDATION_ERROR', 'UNKNOWN');

-- -- CreateEnum
-- CREATE TYPE "error_severity" AS ENUM ('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL');

-- -- CreateEnum
-- CREATE TYPE "context_event_type" AS ENUM ('COMPACTION', 'ROTATION', 'EXTRACTION_START', 'EXTRACTION_COMPLETE');

-- -- CreateEnum
-- CREATE TYPE "product_category" AS ENUM ('CONVENTIONAL', 'FHA', 'VA', 'USDA', 'JUMBO');

-- -- CreateTable
-- CREATE TABLE "users" (
--     "id" TEXT NOT NULL,
--     "email" TEXT NOT NULL,
--     "phone" TEXT,
--     "legal_name" TEXT,
--     "preferred_name" TEXT,
--     "password_hash" TEXT,
--     "email_verified" BOOLEAN NOT NULL DEFAULT false,
--     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "updated_at" TIMESTAMP(3) NOT NULL,
--     "last_login_at" TIMESTAMP(3),
--     "deleted_at" TIMESTAMP(3),
--     "ip_address" TEXT,
--     "user_agent" TEXT,
--     "referral_source" TEXT,

--     CONSTRAINT "users_pkey" PRIMARY KEY ("id")
-- );

-- -- CreateTable
-- CREATE TABLE "applications" (
--     "id" TEXT NOT NULL,
--     "user_id" TEXT NOT NULL,
--     "livekit_room_name" TEXT,
--     "session_id" TEXT,
--     "status" "application_status" NOT NULL DEFAULT 'DRAFT',
--     "current_stage" TEXT NOT NULL DEFAULT '1',
--     "field_attempts" JSONB NOT NULL DEFAULT '{}',
--     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "updated_at" TIMESTAMP(3) NOT NULL,
--     "submitted_at" TIMESTAMP(3),
--     "completed_at" TIMESTAMP(3),
--     "deleted_at" TIMESTAMP(3),
--     "ip_address" TEXT,
--     "user_agent" TEXT,
--     "notes" TEXT,

--     CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
-- );

-- -- CreateTable
-- CREATE TABLE "stage1_discovery" (
--     "id" TEXT NOT NULL,
--     "application_id" TEXT NOT NULL,
--     "borrower_name" TEXT,
--     "borrower_name_confirmed" BOOLEAN NOT NULL DEFAULT false,
--     "mortgage_goal" TEXT,
--     "mortgage_goal_confirmed" BOOLEAN NOT NULL DEFAULT false,
--     "occupancy" TEXT,
--     "occupancy_confirmed" BOOLEAN NOT NULL DEFAULT false,
--     "existing_relationship" TEXT,
--     "existing_relationship_confirmed" BOOLEAN NOT NULL DEFAULT false,
--     "timeline" TEXT,
--     "timeline_confirmed" BOOLEAN NOT NULL DEFAULT false,
--     "co_borrower" TEXT,
--     "co_borrower_confirmed" BOOLEAN NOT NULL DEFAULT false,
--     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "updated_at" TIMESTAMP(3) NOT NULL,

--     CONSTRAINT "stage1_discovery_pkey" PRIMARY KEY ("id")
-- );

-- -- CreateTable
-- CREATE TABLE "stage2_pre_qualification" (
--     "id" TEXT NOT NULL,
--     "application_id" TEXT NOT NULL,
--     "gross_annual_income" DECIMAL(12,2),
--     "gross_annual_income_confirmed" BOOLEAN NOT NULL DEFAULT false,
--     "monthly_debt" DECIMAL(10,2),
--     "monthly_debt_confirmed" BOOLEAN NOT NULL DEFAULT false,
--     "credit_range" TEXT,
--     "credit_range_confirmed" BOOLEAN NOT NULL DEFAULT false,
--     "down_payment" DECIMAL(12,2),
--     "down_payment_confirmed" BOOLEAN NOT NULL DEFAULT false,
--     "target_price" DECIMAL(12,2),
--     "target_price_confirmed" BOOLEAN NOT NULL DEFAULT false,
--     "rent_own" TEXT,
--     "rent_own_confirmed" BOOLEAN NOT NULL DEFAULT false,
--     "realtor_status" TEXT,
--     "realtor_status_confirmed" BOOLEAN NOT NULL DEFAULT false,
--     "refinance_type" TEXT,
--     "refinance_type_confirmed" BOOLEAN NOT NULL DEFAULT false,
--     "property_type" TEXT,
--     "property_type_confirmed" BOOLEAN NOT NULL DEFAULT false,
--     "military_rural" TEXT,
--     "military_rural_confirmed" BOOLEAN NOT NULL DEFAULT false,
--     "job_tenure_type" TEXT,
--     "job_tenure_type_confirmed" BOOLEAN NOT NULL DEFAULT false,
--     "pending_confirm_field" TEXT,
--     "pending_confirm_value" TEXT,
--     "bridge_to_say" TEXT,
--     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "updated_at" TIMESTAMP(3) NOT NULL,

--     CONSTRAINT "stage2_pre_qualification_pkey" PRIMARY KEY ("id")
-- );

-- -- CreateTable
-- CREATE TABLE "stage3_application" (
--     "id" TEXT NOT NULL,
--     "application_id" TEXT NOT NULL,
--     "eligible_products" JSONB NOT NULL DEFAULT '[]',
--     "program_comparison_interest" TEXT,
--     "program_comparison_interest_confirmed" BOOLEAN NOT NULL DEFAULT false,
--     "financial_priority" TEXT,
--     "financial_priority_confirmed" BOOLEAN NOT NULL DEFAULT false,
--     "home_horizon" TEXT,
--     "home_horizon_confirmed" BOOLEAN NOT NULL DEFAULT false,
--     "legal_name" TEXT,
--     "legal_name_confirmed" BOOLEAN NOT NULL DEFAULT false,
--     "physical_address" TEXT,
--     "physical_address_confirmed" BOOLEAN NOT NULL DEFAULT false,
--     "soft_pull_consent" TEXT,
--     "soft_pull_consent_timestamp" TIMESTAMP(3),
--     "employer" TEXT,
--     "prefilled_fields_confirmed" JSONB NOT NULL DEFAULT '{}',
--     "marital_status" TEXT,
--     "marital_status_confirmed" BOOLEAN NOT NULL DEFAULT false,
--     "dependents" INTEGER DEFAULT 0,
--     "dependents_confirmed" BOOLEAN NOT NULL DEFAULT false,
--     "employment_position" TEXT,
--     "employment_years" DECIMAL(4,1),
--     "self_employed" BOOLEAN,
--     "employment_confirmed" BOOLEAN NOT NULL DEFAULT false,
--     "checking_savings_balance" DECIMAL(12,2),
--     "checking_savings_confirmed" BOOLEAN NOT NULL DEFAULT false,
--     "declarations_bankruptcy" BOOLEAN,
--     "declarations_foreclosure" BOOLEAN,
--     "declarations_confirmed" BOOLEAN NOT NULL DEFAULT false,
--     "ready_to_submit" BOOLEAN NOT NULL DEFAULT false,
--     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "updated_at" TIMESTAMP(3) NOT NULL,

--     CONSTRAINT "stage3_application_pkey" PRIMARY KEY ("id")
-- );

-- -- CreateTable
-- CREATE TABLE "stage4_underwriting" (
--     "id" TEXT NOT NULL,
--     "application_id" TEXT NOT NULL,
--     "aus_status" TEXT,
--     "aus_result_timestamp" TIMESTAMP(3),
--     "aus_confirmed" BOOLEAN NOT NULL DEFAULT false,
--     "checklist_discussed" BOOLEAN NOT NULL DEFAULT false,
--     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "updated_at" TIMESTAMP(3) NOT NULL,

--     CONSTRAINT "stage4_underwriting_pkey" PRIMARY KEY ("id")
-- );

-- -- CreateTable
-- CREATE TABLE "conversations" (
--     "id" TEXT NOT NULL,
--     "application_id" TEXT NOT NULL,
--     "role" "message_role" NOT NULL,
--     "text" TEXT NOT NULL,
--     "turn_number" INTEGER NOT NULL,
--     "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "audio_url" TEXT,
--     "duration" INTEGER,
--     "low_confidence" BOOLEAN NOT NULL DEFAULT false,
--     "was_interrupted" BOOLEAN NOT NULL DEFAULT false,

--     CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
-- );

-- -- CreateTable
-- CREATE TABLE "sessions" (
--     "id" TEXT NOT NULL,
--     "user_id" TEXT NOT NULL,
--     "application_id" TEXT,
--     "livekit_room_name" TEXT NOT NULL,
--     "livekit_token" TEXT,
--     "participant_name" TEXT NOT NULL,
--     "status" "session_status" NOT NULL DEFAULT 'ACTIVE',
--     "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "ended_at" TIMESTAMP(3),
--     "duration_ms" INTEGER,
--     "ip_address" TEXT,
--     "user_agent" TEXT,
--     "total_turns" INTEGER NOT NULL DEFAULT 0,
--     "stage_reached" TEXT,
--     "compaction_count" INTEGER NOT NULL DEFAULT 0,
--     "rotation_count" INTEGER NOT NULL DEFAULT 0,

--     CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
-- );

-- -- CreateTable
-- CREATE TABLE "consents" (
--     "id" TEXT NOT NULL,
--     "application_id" TEXT NOT NULL,
--     "consent_type" "consent_type" NOT NULL,
--     "status" "consent_status" NOT NULL DEFAULT 'PENDING',
--     "disclosure_text" TEXT NOT NULL,
--     "presented_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "responded_at" TIMESTAMP(3),
--     "ip_address" TEXT NOT NULL,
--     "user_agent" TEXT,
--     "metadata" JSONB NOT NULL DEFAULT '{}',

--     CONSTRAINT "consents_pkey" PRIMARY KEY ("id")
-- );

-- -- CreateTable
-- CREATE TABLE "whitepaper_leads" (
--     "id" TEXT NOT NULL,
--     "user_id" TEXT,
--     "name" TEXT NOT NULL,
--     "title" TEXT NOT NULL,
--     "organization" TEXT NOT NULL,
--     "email" TEXT NOT NULL,
--     "phone" TEXT,
--     "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "synced_to_sheets" BOOLEAN NOT NULL DEFAULT false,
--     "synced_at" TIMESTAMP(3),
--     "sync_error" TEXT,
--     "ip_address" TEXT,
--     "user_agent" TEXT,
--     "referral_source" TEXT,

--     CONSTRAINT "whitepaper_leads_pkey" PRIMARY KEY ("id")
-- );

-- -- CreateTable
-- CREATE TABLE "stage_transitions" (
--     "id" TEXT NOT NULL,
--     "application_id" TEXT NOT NULL,
--     "from_stage" TEXT NOT NULL,
--     "to_stage" TEXT NOT NULL,
--     "transitioned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "duration_ms" INTEGER,
--     "turn_number" INTEGER NOT NULL,
--     "triggered_by" TEXT,

--     CONSTRAINT "stage_transitions_pkey" PRIMARY KEY ("id")
-- );

-- -- CreateTable
-- CREATE TABLE "metrics" (
--     "id" TEXT NOT NULL,
--     "application_id" TEXT,
--     "session_id" TEXT,
--     "turn_number" INTEGER NOT NULL,
--     "session_age_ms" INTEGER NOT NULL,
--     "context_item_count" INTEGER NOT NULL,
--     "estimated_context_tokens" INTEGER NOT NULL,
--     "stt_latency_ms" INTEGER,
--     "llm_ttft_ms" INTEGER,
--     "llm_total_ms" INTEGER,
--     "tts_latency_ms" INTEGER,
--     "avatar_render_ms" INTEGER,
--     "e2e_latency_ms" INTEGER,
--     "stt_start_at" TIMESTAMP(3),
--     "stt_complete_at" TIMESTAMP(3),
--     "llm_start_at" TIMESTAMP(3),
--     "llm_first_token_at" TIMESTAMP(3),
--     "llm_complete_at" TIMESTAMP(3),
--     "tts_start_at" TIMESTAMP(3),
--     "tts_complete_at" TIMESTAMP(3),
--     "avatar_first_frame_at" TIMESTAMP(3),
--     "compaction_ran" BOOLEAN NOT NULL DEFAULT false,
--     "rotation_ran" BOOLEAN NOT NULL DEFAULT false,
--     "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

--     CONSTRAINT "metrics_pkey" PRIMARY KEY ("id")
-- );

-- -- CreateTable
-- CREATE TABLE "error_logs" (
--     "id" TEXT NOT NULL,
--     "application_id" TEXT,
--     "session_id" TEXT,
--     "error_type" "error_type" NOT NULL,
--     "severity" "error_severity" NOT NULL,
--     "message" TEXT NOT NULL,
--     "stack_trace" TEXT,
--     "turn_number" INTEGER,
--     "stage" TEXT,
--     "pending_field" TEXT,
--     "metadata" JSONB NOT NULL DEFAULT '{}',
--     "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "resolved" BOOLEAN NOT NULL DEFAULT false,
--     "resolved_at" TIMESTAMP(3),
--     "resolved_by" TEXT,
--     "resolution" TEXT,

--     CONSTRAINT "error_logs_pkey" PRIMARY KEY ("id")
-- );

-- -- CreateTable
-- CREATE TABLE "context_events" (
--     "id" TEXT NOT NULL,
--     "session_id" TEXT NOT NULL,
--     "event_type" "context_event_type" NOT NULL,
--     "items_before" INTEGER NOT NULL,
--     "items_after" INTEGER NOT NULL,
--     "tokens_before" INTEGER,
--     "tokens_after" INTEGER,
--     "summary" TEXT,
--     "reason" TEXT,
--     "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "duration_ms" INTEGER,

--     CONSTRAINT "context_events_pkey" PRIMARY KEY ("id")
-- );

-- -- CreateTable
-- CREATE TABLE "loan_products" (
--     "id" TEXT NOT NULL,
--     "name" TEXT NOT NULL,
--     "product_code" TEXT NOT NULL,
--     "category" "product_category" NOT NULL,
--     "term_months" INTEGER NOT NULL,
--     "is_fixed" BOOLEAN NOT NULL,
--     "min_credit_score" INTEGER NOT NULL,
--     "max_ltv" DECIMAL(5,2) NOT NULL,
--     "min_down_payment" DECIMAL(5,2) NOT NULL,
--     "requires_pmi" BOOLEAN NOT NULL DEFAULT false,
--     "allows_investment" BOOLEAN NOT NULL DEFAULT false,
--     "description" TEXT NOT NULL,
--     "active" BOOLEAN NOT NULL DEFAULT true,
--     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "updated_at" TIMESTAMP(3) NOT NULL,

--     CONSTRAINT "loan_products_pkey" PRIMARY KEY ("id")
-- );

-- -- CreateTable
-- CREATE TABLE "loan_rates" (
--     "id" TEXT NOT NULL,
--     "product_id" TEXT NOT NULL,
--     "base_rate" DECIMAL(5,3) NOT NULL,
--     "apr" DECIMAL(5,3) NOT NULL,
--     "min_credit_score" INTEGER NOT NULL,
--     "max_credit_score" INTEGER NOT NULL,
--     "effective_from" TIMESTAMP(3) NOT NULL,
--     "effective_to" TIMESTAMP(3),

--     CONSTRAINT "loan_rates_pkey" PRIMARY KEY ("id")
-- );

-- -- CreateTable
-- CREATE TABLE "escalations" (
--     "id" TEXT NOT NULL,
--     "application_id" TEXT NOT NULL,
--     "reason" TEXT NOT NULL,
--     "reason_details" TEXT,
--     "escalated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "assigned_to" TEXT,
--     "resolved_at" TIMESTAMP(3),
--     "outcome" TEXT,
--     "notes" TEXT,

--     CONSTRAINT "escalations_pkey" PRIMARY KEY ("id")
-- );

-- -- CreateIndex
-- CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- -- CreateIndex
-- CREATE INDEX "users_email_idx" ON "users"("email");

-- -- CreateIndex
-- CREATE INDEX "users_created_at_idx" ON "users"("created_at");

-- -- CreateIndex
-- CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");

-- -- CreateIndex
-- CREATE INDEX "applications_user_id_idx" ON "applications"("user_id");

-- -- CreateIndex
-- CREATE INDEX "applications_status_idx" ON "applications"("status");

-- -- CreateIndex
-- CREATE INDEX "applications_current_stage_idx" ON "applications"("current_stage");

-- -- CreateIndex
-- CREATE INDEX "applications_created_at_idx" ON "applications"("created_at");

-- -- CreateIndex
-- CREATE INDEX "applications_livekit_room_name_idx" ON "applications"("livekit_room_name");

-- -- CreateIndex
-- CREATE INDEX "applications_session_id_idx" ON "applications"("session_id");

-- -- CreateIndex
-- CREATE INDEX "applications_user_id_status_idx" ON "applications"("user_id", "status");

-- -- CreateIndex
-- CREATE UNIQUE INDEX "stage1_discovery_application_id_key" ON "stage1_discovery"("application_id");

-- -- CreateIndex
-- CREATE UNIQUE INDEX "stage2_pre_qualification_application_id_key" ON "stage2_pre_qualification"("application_id");

-- -- CreateIndex
-- CREATE UNIQUE INDEX "stage3_application_application_id_key" ON "stage3_application"("application_id");

-- -- CreateIndex
-- CREATE UNIQUE INDEX "stage4_underwriting_application_id_key" ON "stage4_underwriting"("application_id");

-- -- CreateIndex
-- CREATE INDEX "conversations_application_id_idx" ON "conversations"("application_id");

-- -- CreateIndex
-- CREATE INDEX "conversations_application_id_turn_number_idx" ON "conversations"("application_id", "turn_number");

-- -- CreateIndex
-- CREATE INDEX "conversations_timestamp_idx" ON "conversations"("timestamp");

-- -- CreateIndex
-- CREATE INDEX "conversations_role_idx" ON "conversations"("role");

-- -- CreateIndex
-- CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- -- CreateIndex
-- CREATE INDEX "sessions_application_id_idx" ON "sessions"("application_id");

-- -- CreateIndex
-- CREATE INDEX "sessions_livekit_room_name_idx" ON "sessions"("livekit_room_name");

-- -- CreateIndex
-- CREATE INDEX "sessions_status_idx" ON "sessions"("status");

-- -- CreateIndex
-- CREATE INDEX "sessions_started_at_idx" ON "sessions"("started_at");

-- -- CreateIndex
-- CREATE INDEX "consents_application_id_idx" ON "consents"("application_id");

-- -- CreateIndex
-- CREATE INDEX "consents_consent_type_idx" ON "consents"("consent_type");

-- -- CreateIndex
-- CREATE INDEX "consents_status_idx" ON "consents"("status");

-- -- CreateIndex
-- CREATE INDEX "consents_presented_at_idx" ON "consents"("presented_at");

-- -- CreateIndex
-- CREATE INDEX "whitepaper_leads_email_idx" ON "whitepaper_leads"("email");

-- -- CreateIndex
-- CREATE INDEX "whitepaper_leads_submitted_at_idx" ON "whitepaper_leads"("submitted_at");

-- -- CreateIndex
-- CREATE INDEX "whitepaper_leads_synced_to_sheets_idx" ON "whitepaper_leads"("synced_to_sheets");

-- -- CreateIndex
-- CREATE INDEX "stage_transitions_application_id_idx" ON "stage_transitions"("application_id");

-- -- CreateIndex
-- CREATE INDEX "stage_transitions_application_id_transitioned_at_idx" ON "stage_transitions"("application_id", "transitioned_at");

-- -- CreateIndex
-- CREATE INDEX "stage_transitions_to_stage_idx" ON "stage_transitions"("to_stage");

-- -- CreateIndex
-- CREATE INDEX "metrics_application_id_idx" ON "metrics"("application_id");

-- -- CreateIndex
-- CREATE INDEX "metrics_session_id_idx" ON "metrics"("session_id");

-- -- CreateIndex
-- CREATE INDEX "metrics_turn_number_idx" ON "metrics"("turn_number");

-- -- CreateIndex
-- CREATE INDEX "metrics_recorded_at_idx" ON "metrics"("recorded_at");

-- -- CreateIndex
-- CREATE INDEX "metrics_e2e_latency_ms_idx" ON "metrics"("e2e_latency_ms");

-- -- CreateIndex
-- CREATE INDEX "error_logs_application_id_idx" ON "error_logs"("application_id");

-- -- CreateIndex
-- CREATE INDEX "error_logs_session_id_idx" ON "error_logs"("session_id");

-- -- CreateIndex
-- CREATE INDEX "error_logs_error_type_idx" ON "error_logs"("error_type");

-- -- CreateIndex
-- CREATE INDEX "error_logs_severity_idx" ON "error_logs"("severity");

-- -- CreateIndex
-- CREATE INDEX "error_logs_occurred_at_idx" ON "error_logs"("occurred_at");

-- -- CreateIndex
-- CREATE INDEX "error_logs_resolved_idx" ON "error_logs"("resolved");

-- -- CreateIndex
-- CREATE INDEX "context_events_session_id_idx" ON "context_events"("session_id");

-- -- CreateIndex
-- CREATE INDEX "context_events_event_type_idx" ON "context_events"("event_type");

-- -- CreateIndex
-- CREATE INDEX "context_events_occurred_at_idx" ON "context_events"("occurred_at");

-- -- CreateIndex
-- CREATE UNIQUE INDEX "loan_products_product_code_key" ON "loan_products"("product_code");

-- -- CreateIndex
-- CREATE INDEX "loan_products_category_idx" ON "loan_products"("category");

-- -- CreateIndex
-- CREATE INDEX "loan_products_active_idx" ON "loan_products"("active");

-- -- CreateIndex
-- CREATE INDEX "loan_rates_product_id_idx" ON "loan_rates"("product_id");

-- -- CreateIndex
-- CREATE INDEX "loan_rates_effective_from_effective_to_idx" ON "loan_rates"("effective_from", "effective_to");

-- -- CreateIndex
-- CREATE INDEX "escalations_application_id_idx" ON "escalations"("application_id");

-- -- CreateIndex
-- CREATE INDEX "escalations_escalated_at_idx" ON "escalations"("escalated_at");

-- -- CreateIndex
-- CREATE INDEX "escalations_assigned_to_idx" ON "escalations"("assigned_to");

-- -- AddForeignKey
-- ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- -- AddForeignKey
-- ALTER TABLE "stage1_discovery" ADD CONSTRAINT "stage1_discovery_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- -- AddForeignKey
-- ALTER TABLE "stage2_pre_qualification" ADD CONSTRAINT "stage2_pre_qualification_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- -- AddForeignKey
-- ALTER TABLE "stage3_application" ADD CONSTRAINT "stage3_application_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- -- AddForeignKey
-- ALTER TABLE "stage4_underwriting" ADD CONSTRAINT "stage4_underwriting_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- -- AddForeignKey
-- ALTER TABLE "conversations" ADD CONSTRAINT "conversations_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- -- AddForeignKey
-- ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- -- AddForeignKey
-- ALTER TABLE "sessions" ADD CONSTRAINT "sessions_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- -- AddForeignKey
-- ALTER TABLE "consents" ADD CONSTRAINT "consents_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- -- AddForeignKey
-- ALTER TABLE "whitepaper_leads" ADD CONSTRAINT "whitepaper_leads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- -- AddForeignKey
-- ALTER TABLE "stage_transitions" ADD CONSTRAINT "stage_transitions_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- -- AddForeignKey
-- ALTER TABLE "metrics" ADD CONSTRAINT "metrics_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- -- AddForeignKey
-- ALTER TABLE "error_logs" ADD CONSTRAINT "error_logs_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- -- AddForeignKey
-- ALTER TABLE "loan_rates" ADD CONSTRAINT "loan_rates_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "loan_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

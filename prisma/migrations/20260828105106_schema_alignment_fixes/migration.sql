/*
  Warnings:

  - You are about to drop the column `session_id` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the `loan_products` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `loan_rates` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "loan_rates" DROP CONSTRAINT "loan_rates_product_id_fkey";

-- DropIndex
DROP INDEX "applications_session_id_idx";

-- AlterTable
ALTER TABLE "applications" DROP COLUMN "session_id",
ADD COLUMN     "current_sub_stage" TEXT;

-- AlterTable
ALTER TABLE "escalations" ADD COLUMN     "preference" TEXT;

-- AlterTable
ALTER TABLE "stage2_pre_qualification" ADD COLUMN     "escalation_preference" TEXT,
ADD COLUMN     "soft_pull_disclosure_delivered" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "soft_pull_disclosure_delivered_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "stage3_application" ADD COLUMN     "contact_name" TEXT,
ADD COLUMN     "crs_late_payments" INTEGER,
ADD COLUMN     "crs_open_accounts" INTEGER;

-- DropTable
DROP TABLE "loan_products";

-- DropTable
DROP TABLE "loan_rates";

-- DropEnum
DROP TYPE "product_category";

-- CreateTable
CREATE TABLE "affordability_audit" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "purchase_price" DECIMAL(12,2),
    "down_payment" DECIMAL(12,2),
    "loan_amount" DECIMAL(12,2),
    "ltv" DECIMAL(5,2),
    "income_band" TEXT,
    "dti_band" TEXT,
    "estimated_payment" DECIMAL(10,2),
    "dti_above_hard_ceiling" BOOLEAN,
    "slider_type" TEXT,
    "previous_value" DECIMAL(12,2),
    "new_value" DECIMAL(12,2),
    "affordability_mode" TEXT,
    "transaction_type" TEXT,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "affordability_audit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "affordability_audit_application_id_idx" ON "affordability_audit"("application_id");

-- CreateIndex
CREATE INDEX "affordability_audit_session_id_idx" ON "affordability_audit"("session_id");

-- CreateIndex
CREATE INDEX "affordability_audit_event_type_idx" ON "affordability_audit"("event_type");

-- CreateIndex
CREATE INDEX "affordability_audit_occurred_at_idx" ON "affordability_audit"("occurred_at");

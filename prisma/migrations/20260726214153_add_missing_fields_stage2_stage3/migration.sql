-- AlterTable
ALTER TABLE "stage2_pre_qualification" ADD COLUMN     "affordability_aus_status" TEXT,
ADD COLUMN     "affordability_down_payment" DECIMAL(12,2),
ADD COLUMN     "affordability_dti_band" TEXT,
ADD COLUMN     "affordability_income_band" TEXT,
ADD COLUMN     "affordability_mode" TEXT,
ADD COLUMN     "affordability_panel_rendered" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "affordability_prequel_letter_sent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "affordability_purchase_price" DECIMAL(12,2),
ADD COLUMN     "affordability_submitted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "zip_code" TEXT;

-- AlterTable
ALTER TABLE "stage3_application" ADD COLUMN     "contact_email" TEXT,
ADD COLUMN     "contact_mobile" TEXT,
ADD COLUMN     "contact_on_file" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "credit_impact_stated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dti_above_hard_ceiling" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "eligibility_review_explained" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "otp_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pmi_explained" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "session_login_complete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "transition_pitch_delivered" BOOLEAN NOT NULL DEFAULT false;

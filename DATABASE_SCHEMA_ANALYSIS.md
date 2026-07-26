# Database Schema Analysis Report
## Missing Fields & Recommendations

**Generated:** July 27, 2026  
**Project:** ConvergentAI Mortgage Application System  
**Database:** PostgreSQL with Prisma ORM

---

## Executive Summary

This analysis compares the current Prisma schema against the actual codebase implementation (BorrowerProfile interface, application services, and agent logic). Several critical fields used throughout the application are **missing from the database schema**.

---

## CRITICAL FINDINGS: Missing Database Fields

### 🔴 Stage 2.5 (Affordability Panel) - **9 MISSING FIELDS**

The Stage 2.5 affordability panel is extensively used in the codebase but has **ZERO database persistence**. The following fields are defined in `BorrowerProfile` and actively used but missing from `Stage2PreQualification` or any other table:

| Field Name | Type | Current Usage | Impact |
|------------|------|---------------|---------|
| `affordability_panel_rendered` | Boolean | Tracks if panel was shown to user | High - Session state loss |
| `affordability_mode` | Enum ('stated', 'verified') | Critical: determines data source | **CRITICAL** - Business logic breaks |
| `affordability_purchase_price` | Decimal | Slider value from user | High - User input lost |
| `affordability_down_payment` | Decimal | Slider value from user | High - User input lost |
| `affordability_income_band` | Enum ('within', 'above') | Compliance indicator | Medium - Audit trail missing |
| `affordability_dti_band` | Enum ('within', 'above') | Compliance indicator | Medium - Audit trail missing |
| `affordability_submitted` | Boolean | Tracks submission state | High - Workflow broken |
| `affordability_aus_status` | Enum ('pending', 'approve_eligible', 'refer') | AUS result for affordability | **CRITICAL** - Decision data lost |
| `affordability_prequel_letter_sent` | Boolean | Email delivery tracking | Medium - Operational tracking |

**Location in code:**
- `backend/src/prompts/layer3-context.ts` (lines 101-109)
- `backend/src/prompts/stage25-affordability.ts` (entire file)
- Used in affordability calculator and AUS submission

---

### 🟡 Stage 3A (OTP & Session Login) - **5 MISSING FIELDS**

The v8.7 OTP gate and session login flow requires these fields, but they're missing from `Stage3Application`:

| Field Name | Type | Current Usage | Impact |
|------------|------|---------------|---------|
| `session_login_complete` | Boolean | Tracks if secure login is complete | High - Auth state lost |
| `contact_on_file` | Boolean | Tracks if contact info exists | Medium - UX logic |
| `contact_email` | String | User's email for OTP | **CRITICAL** - Cannot resume OTP flow |
| `contact_mobile` | String | User's mobile for OTP | **CRITICAL** - Cannot resume OTP flow |
| `otp_verified` | Boolean | OTP verification status | **CRITICAL** - Security state lost |

**Location in code:**
- `backend/src/prompts/layer3-context.ts` (lines 112-116)
- Referenced in agent transition logic (`backend/src/agent.ts`)

---

### 🟠 Compliance & Audit Flags - **5 MISSING FIELDS**

These flags track mandatory disclosures and compliance requirements but are not persisted:

| Field Name | Type | Current Usage | Impact |
|------------|------|---------------|---------|
| `eligibility_review_explained` | Boolean | Tracks if disclosure was given | High - Compliance violation |
| `credit_impact_stated` | Boolean | Tracks credit pull disclosure | High - Compliance violation |
| `pmi_explained` | Boolean | Tracks PMI explanation | Medium - Regulatory requirement |
| `transition_pitch_delivered` | Boolean | Tracks stage transition disclosure | Low - QA tracking |
| `dti_above_hard_ceiling` | Boolean | Critical underwriting flag | **CRITICAL** - Risk assessment |

**Location in code:**
- `backend/src/prompts/layer3-context.ts` (lines 118-122)
- Used in compliance audit (`backend/src/utils/affordability-audit.ts`)

---

### 🟢 Stage 2 - **1 MISSING FIELD**

| Field Name | Type | Current Usage | Impact |
|------------|------|---------------|---------|
| `zip_code` | String | Location for tax/insurance calculations | Medium - Calculation accuracy |

**Location in code:**
- `backend/src/prompts/layer3-context.ts` (line 116)
- Used in `backend/src/utils/affordability-calculator.ts` for property tax lookup

---

## Table-by-Table Analysis

### ✅ `User` Table - COMPLETE
All fields align with usage. No missing fields detected.

**Recommendation:** No changes needed.

---

### ✅ `Application` Table - COMPLETE
All fields align with usage. The `sessionId` field exists and is properly indexed.

**Recommendation:** No changes needed.

---

### ✅ `Stage1Discovery` Table - COMPLETE
All Stage 1 fields from `BorrowerProfile` are present:
- ✅ `borrowerName` / `borrowerNameConfirmed`
- ✅ `mortgageGoal` / `mortgageGoalConfirmed`
- ✅ `occupancy` / `occupancyConfirmed`
- ✅ `existingRelationship` / `existingRelationshipConfirmed`
- ✅ `timeline` / `timelineConfirmed`
- ✅ `coBorrower` / `coBorrowerConfirmed`

**Recommendation:** No changes needed.

---

### 🔴 `Stage2PreQualification` Table - **10 MISSING FIELDS**

#### Currently Stored (Complete):
- ✅ All standard Stage 2 discovery fields
- ✅ `pendingConfirmField` / `pendingConfirmValue`
- ✅ `bridgeToSay`

#### Missing from Database:
❌ `affordability_panel_rendered`  
❌ `affordability_mode`  
❌ `affordability_purchase_price`  
❌ `affordability_down_payment`  
❌ `affordability_income_band`  
❌ `affordability_dti_band`  
❌ `affordability_submitted`  
❌ `affordability_aus_status`  
❌ `affordability_prequel_letter_sent`  
❌ `zip_code`

**Recommendation:** Add Stage 2.5 affordability fields to this table (see migration script below).

---

### 🔴 `Stage3Application` Table - **10 MISSING FIELDS**

#### Currently Stored (Mostly Complete):
- ✅ Product guidance fields (eligible_products, program_comparison_interest, etc.)
- ✅ Consent & Identity fields (legal_name, physical_address, soft_pull_consent)
- ✅ Application completion fields (marital_status, dependents, employment, etc.)

#### Missing from Database:
❌ `session_login_complete`  
❌ `contact_on_file`  
❌ `contact_email`  
❌ `contact_mobile`  
❌ `otp_verified`  
❌ `eligibility_review_explained`  
❌ `credit_impact_stated`  
❌ `pmi_explained`  
❌ `transition_pitch_delivered`  
❌ `dti_above_hard_ceiling`

**Recommendation:** Add OTP gate and compliance tracking fields (see migration script below).

---

### ✅ `Stage4Underwriting` Table - COMPLETE
All Stage 4 fields are present.

**Recommendation:** No changes needed.

---

### ✅ Supporting Tables - COMPLETE
The following tables are properly structured:
- ✅ `Conversation` - All message tracking fields present
- ✅ `Session` - All session state fields present
- ✅ `Consent` - All consent tracking fields present
- ✅ `Metric` - All performance metrics present
- ✅ `ErrorLog` - All error tracking fields present
- ✅ `StageTransition` - All transition tracking fields present
- ✅ `LoanProduct` / `LoanRate` / `Escalation` - All present

---

## Impact Assessment

### 🔴 **CRITICAL** - Immediate Action Required (20 fields)
These fields are actively used in business logic and their absence causes:
- Session resumption failures
- Data loss between page refreshes
- Broken workflows (especially OTP gate and affordability panel)
- Compliance violations (missing audit trails)
- Incorrect underwriting decisions

**Affected Features:**
1. **Stage 2.5 Affordability Panel** - Completely non-persistent
2. **OTP Verification Flow** - Cannot resume after disconnect
3. **AUS Submission** - Missing critical decision data
4. **Compliance Tracking** - No audit trail for disclosures

### 🟡 **HIGH** - Required for Production (5 fields)
These fields are used for operational tracking and user experience:
- Session state management
- Contact information persistence
- Workflow progression tracking

### 🟢 **MEDIUM** - Nice to Have (5 fields)
These fields improve audit trails and reporting but don't break core flows:
- Disclosure tracking flags
- QA metrics
- Zip code for tax calculations

---

## Code-to-Schema Alignment Issues

### Issue 1: Stage 2.5 Panel is Ghost Feature
**Problem:** The entire Stage 2.5 affordability panel system (introduced in v8.7) has no database backing.

**Evidence:**
```typescript
// backend/src/prompts/layer3-context.ts (lines 101-109)
affordability_panel_rendered?: boolean;
affordability_mode?: 'stated' | 'verified' | null;
affordability_purchase_price?: number | null;
// ... 9 fields total
```

**Usage:** Used in:
- `backend/src/prompts/stage25-affordability.ts` (entire prompt logic)
- `backend/src/__tests__/stage8-v87-features.test.ts` (test suite)
- Frontend slider interactions (implied by code comments)

**Impact:** All Stage 2.5 user interactions are lost on session disconnect.

---

### Issue 2: OTP Gate Cannot Resume
**Problem:** The v8.7 OTP verification gate (contact_email, contact_mobile, otp_verified) has no persistence.

**Evidence:**
```typescript
// backend/src/prompts/layer3-context.ts (lines 114-116)
contact_email?: string | null;
contact_mobile?: string | null;
otp_verified?: boolean;
```

**Usage:** Referenced in agent transition logic:
```typescript
// backend/src/agent.ts (line references in TRANSITION_TRIGGER_FIELDS)
'contact_email',     // Stage 3A OTP gate step 1 → send OTP
'contact_mobile',    // Stage 3A OTP gate step 2 → send OTP
'otp_verification',  // Stage 3A OTP gate step 3 → soft pull consent
```

**Impact:** Users who disconnect during OTP flow must restart from beginning.

---

### Issue 3: Compliance Audit Trail Missing
**Problem:** Five boolean flags track mandatory regulatory disclosures but are never persisted.

**Evidence:**
```typescript
// backend/src/prompts/layer3-context.ts (lines 118-122)
eligibility_review_explained?: boolean;
credit_impact_stated?: boolean;
pmi_explained?: boolean;
dti_above_hard_ceiling?: boolean;
```

**Usage:** Used in affordability audit:
```typescript
// backend/src/utils/affordability-audit.ts
// These flags are checked for compliance verification
```

**Impact:** No proof that mandatory disclosures were delivered to borrower.

---

## Services Analysis

### `ApplicationService` (backend/src/services/application-service.ts)

**Currently Syncs:**
- ✅ Stage 1: All 6 fields + confirmation flags
- ✅ Stage 2: All 10 standard fields + pending/bridge fields
- ⚠️ Stage 2.5: **ZERO fields synced** (not in schema)
- ✅ Stage 3: Most fields synced
- ⚠️ Stage 3: **5 OTP fields missing**
- ⚠️ Stage 3: **5 compliance flags missing**
- ✅ Stage 4: All fields synced

**Gap:** The `syncStage2()` and `syncStage3()` methods attempt to sync fields that don't exist in the schema, causing silent failures.

---

## Migration Priority

### Phase 1: CRITICAL (Deploy ASAP)
**Target:** Fix broken workflows

**Add to `Stage2PreQualification`:**
```prisma
affordabilityPanelRendered      Boolean @default(false) @map("affordability_panel_rendered")
affordabilityMode               String? @map("affordability_mode")
affordabilityPurchasePrice      Decimal? @map("affordability_purchase_price") @db.Decimal(12, 2)
affordabilityDownPayment        Decimal? @map("affordability_down_payment") @db.Decimal(12, 2)
affordabilityIncomeBand         String? @map("affordability_income_band")
affordabilityDtiBand            String? @map("affordability_dti_band")
affordabilitySubmitted          Boolean @default(false) @map("affordability_submitted")
affordabilityAusStatus          String? @map("affordability_aus_status")
affordabilityPrequelLetterSent  Boolean @default(false) @map("affordability_prequel_letter_sent")
zipCode                         String? @map("zip_code")
```

**Add to `Stage3Application`:**
```prisma
sessionLoginComplete            Boolean @default(false) @map("session_login_complete")
contactOnFile                   Boolean @default(false) @map("contact_on_file")
contactEmail                    String? @map("contact_email")
contactMobile                   String? @map("contact_mobile")
otpVerified                     Boolean @default(false) @map("otp_verified")
eligibilityReviewExplained      Boolean @default(false) @map("eligibility_review_explained")
creditImpactStated              Boolean @default(false) @map("credit_impact_stated")
pmiExplained                    Boolean @default(false) @map("pmi_explained")
transitionPitchDelivered        Boolean @default(false) @map("transition_pitch_delivered")
dtiAboveHardCeiling             Boolean @default(false) @map("dti_above_hard_ceiling")
```

---

### Phase 2: Update Service Layer
After schema migration, update `ApplicationService` methods:

**In `syncStage2()`:** Add affordability fields mapping  
**In `syncStage3()`:** Add OTP and compliance fields mapping

---

## Test Coverage

The test suite already validates these fields:

**Coverage Detected:**
- ✅ `backend/src/__tests__/stage1-foundation.test.ts` - Tests Stage 2.5 fields
- ✅ `backend/src/__tests__/stage8-v87-features.test.ts` - Tests affordability_mode, OTP fields
- ✅ `backend/src/__tests__/stage7-e2e-flow.test.ts` - Tests full affordability flow

**Problem:** Tests pass because they use in-memory `BorrowerProfile`, not database persistence.

---

## Recommendations Summary

1. ✅ **Immediate:** Create migration adding 20 missing fields
2. ✅ **Immediate:** Update `ApplicationService.syncStage2()` and `syncStage3()`
3. ✅ **Next Sprint:** Add database integration tests (currently all tests are in-memory)
4. ⚠️ **Review:** Confirm whether `contact_email`/`contact_mobile` should be in `Stage3Application` or `User` table
5. ⚠️ **Review:** Consider adding indexes on new fields used in queries

---

## Notes for Implementation

- All new fields follow existing naming conventions (camelCase → snake_case mapping)
- Default values align with TypeScript optional fields (`Boolean @default(false)`, `String? null`)
- Decimal fields use consistent precision: `@db.Decimal(12, 2)` for currency
- No breaking changes to existing schema (only additions)

---

**Next Steps:** 
1. Review this analysis with team lead
2. I will generate the Prisma migration script when you're ready
3. Update TypeScript service layer mappings
4. Deploy and verify session persistence

---

**Analysis completed.** Ready for your review and next instructions.

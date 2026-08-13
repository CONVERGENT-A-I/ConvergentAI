import { prisma, isDatabaseEnabled } from './database.js';
import type { BorrowerProfile } from '../prompts/layer3-context.js';

/**
 * Application Service
 * Handles all database operations for mortgage applications
 */
export class ApplicationService {
  /**
   * Create or get a user by email
   */
  async createUser(data: { email: string; firstName?: string | null; lastName?: string | null; phoneNumber?: string | null }) {
    if (!prisma) {
      console.warn('[app-service] Database not enabled, skipping createUser');
      return null;
    }
    
    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    
    if (existing) {
      console.log(`[app-service] User already exists with email ${data.email}`);
      return existing;
    }
    
    // Create new user
    return await prisma.user.create({
      data: {
        email: data.email,
        legalName: data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : null,
        phone: data.phoneNumber ?? null,
      },
    });
  }

  /**
   * Find application by room name
   */
  async findApplicationByRoomName(roomName: string) {
    return await this.getApplicationByRoomName(roomName);
  }

  /**
   * Create a new application for a user
   */
  async createApplication(data: { userId: string; roomName: string; currentStage: string; status: string }) {
    if (!prisma) {
      console.warn('[app-service] Database not enabled, skipping createApplication');
      return null;
    }
    return await prisma.application.create({
      data: {
        userId: data.userId,
        livekitRoomName: data.roomName,
        status: data.status as any,
        currentStage: data.currentStage,
      },
    });
  }

  /**
   * Create a new application for a user (legacy method)
   */
  async createApplicationLegacy(userId: string, livekitRoomName?: string) {
    if (!prisma) {
      console.warn('[app-service] Database not enabled, skipping createApplication');
      return null;
    }
    return await prisma.application.create({
      data: {
        userId,
        livekitRoomName: livekitRoomName || null,
        status: 'IN_PROGRESS',
        currentStage: '1',
      },
    });
  }

  /**
   * Get application by ID with all stage data
   */
  async getApplicationWithStages(applicationId: string) {
    if (!prisma) return null;
    return await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        stage1: true,
        stage2: true,
        stage3: true,
        stage4: true,
        user: {
          select: {
            id: true,
            email: true,
            legalName: true,
            phone: true,
          },
        },
      },
    });
  }

  /**
   * Get application by LiveKit room name
   */
  async getApplicationByRoomName(roomName: string) {
    if (!prisma) return null;
    return await prisma.application.findFirst({
      where: { livekitRoomName: roomName },
      include: {
        stage1: true,
        stage2: true,
        stage3: true,
        stage4: true,
      },
    });
  }

  /**
   * Update application stage
   */
  async updateStage(applicationId: string, newStage: string, oldStage?: string) {
    if (!prisma) return null;
    // Update application stage
    const application = await prisma.application.update({
      where: { id: applicationId },
      data: { currentStage: newStage },
    });

    // Record stage transition
    if (oldStage && oldStage !== newStage) {
      await prisma.stageTransition.create({
        data: {
          applicationId,
          fromStage: oldStage,
          toStage: newStage,
          turnNumber: 0, // TODO: Get from context manager
        },
      });
    }

    return application;
  }

  /**
   * Sync Stage 1 data from BorrowerProfile
   */
  async syncStage1(applicationId: string, profile: BorrowerProfile) {
    if (!prisma) return null;
    return await prisma.stage1Discovery.upsert({
      where: { applicationId },
      create: {
        applicationId,
        borrowerName: profile.borrower_name ?? null,
        borrowerNameConfirmed: profile.borrower_name_confirmed || false,
        mortgageGoal: profile.mortgage_goal ?? null,
        mortgageGoalConfirmed: profile.mortgage_goal_confirmed || false,
        occupancy: profile.occupancy ?? null,
        occupancyConfirmed: profile.occupancy_confirmed || false,
        existingRelationship: profile.existing_relationship ?? null,
        existingRelationshipConfirmed: profile.existing_relationship_confirmed || false,
        timeline: profile.timeline ?? null,
        timelineConfirmed: profile.timeline_confirmed || false,
        coBorrower: profile.co_borrower ?? null,
        coBorrowerConfirmed: profile.co_borrower_confirmed || false,
      },
      update: {
        borrowerName: profile.borrower_name ?? null,
        borrowerNameConfirmed: profile.borrower_name_confirmed || false,
        mortgageGoal: profile.mortgage_goal ?? null,
        mortgageGoalConfirmed: profile.mortgage_goal_confirmed || false,
        occupancy: profile.occupancy ?? null,
        occupancyConfirmed: profile.occupancy_confirmed || false,
        existingRelationship: profile.existing_relationship ?? null,
        existingRelationshipConfirmed: profile.existing_relationship_confirmed || false,
        timeline: profile.timeline ?? null,
        timelineConfirmed: profile.timeline_confirmed || false,
        coBorrower: profile.co_borrower ?? null,
        coBorrowerConfirmed: profile.co_borrower_confirmed || false,
      },
    });
  }

  /**
   * Sync Stage 2 data from BorrowerProfile
   */
  async syncStage2(applicationId: string, profile: BorrowerProfile) {
    if (!prisma) return null;
    return await prisma.stage2PreQualification.upsert({
      where: { applicationId },
      create: {
        applicationId,
        grossAnnualIncome: profile.gross_annual_income ?? null,
        grossAnnualIncomeConfirmed: profile.gross_annual_income_confirmed || false,
        monthlyDebt: profile.monthly_debt ?? null,
        monthlyDebtConfirmed: profile.monthly_debt_confirmed || false,
        creditRange: profile.credit_range ?? null,
        creditRangeConfirmed: profile.credit_range_confirmed || false,
        downPayment: profile.down_payment ?? null,
        downPaymentConfirmed: profile.down_payment_confirmed || false,
        targetPrice: profile.target_price ?? null,
        targetPriceConfirmed: profile.target_price_confirmed || false,
        rentOwn: profile.rent_own ?? null,
        rentOwnConfirmed: profile.rent_own_confirmed || false,
        realtorStatus: profile.realtor_status ?? null,
        realtorStatusConfirmed: profile.realtor_status_confirmed || false,
        refinanceType: profile.refinance_type ?? null,
        refinanceTypeConfirmed: profile.refinance_type_confirmed || false,
        propertyType: profile.property_type ?? null,
        propertyTypeConfirmed: profile.property_type_confirmed || false,
        militaryRural: profile.military_rural ?? null,
        militaryRuralConfirmed: profile.military_rural_confirmed || false,
        jobTenureType: profile.job_tenure_type ?? null,
        jobTenureTypeConfirmed: profile.job_tenure_type_confirmed || false,
        pendingConfirmField: profile.pending_confirm_field ?? null,
        pendingConfirmValue: profile.pending_confirm_value ?? null,
        bridgeToSay: profile.bridge_to_say ?? null,
        // Stage 2.5 Affordability Panel Fields
        affordabilityPanelRendered: profile.affordability_panel_rendered || false,
        affordabilityMode: profile.affordability_mode ?? null,
        affordabilityPurchasePrice: profile.affordability_purchase_price ?? null,
        affordabilityDownPayment: profile.affordability_down_payment ?? null,
        affordabilityIncomeBand: profile.affordability_income_band ?? null,
        affordabilityDtiBand: profile.affordability_dti_band ?? null,
        affordabilitySubmitted: profile.affordability_submitted || false,
        affordabilityAusStatus: profile.affordability_aus_status ?? null,
        affordabilityPrequelLetterSent: profile.affordability_prequel_letter_sent || false,
        zipCode: profile.zip_code ?? null,
      },
      update: {
        grossAnnualIncome: profile.gross_annual_income ?? null,
        grossAnnualIncomeConfirmed: profile.gross_annual_income_confirmed || false,
        monthlyDebt: profile.monthly_debt ?? null,
        monthlyDebtConfirmed: profile.monthly_debt_confirmed || false,
        creditRange: profile.credit_range ?? null,
        creditRangeConfirmed: profile.credit_range_confirmed || false,
        downPayment: profile.down_payment ?? null,
        downPaymentConfirmed: profile.down_payment_confirmed || false,
        targetPrice: profile.target_price ?? null,
        targetPriceConfirmed: profile.target_price_confirmed || false,
        rentOwn: profile.rent_own ?? null,
        rentOwnConfirmed: profile.rent_own_confirmed || false,
        realtorStatus: profile.realtor_status ?? null,
        realtorStatusConfirmed: profile.realtor_status_confirmed || false,
        refinanceType: profile.refinance_type ?? null,
        refinanceTypeConfirmed: profile.refinance_type_confirmed || false,
        propertyType: profile.property_type ?? null,
        propertyTypeConfirmed: profile.property_type_confirmed || false,
        militaryRural: profile.military_rural ?? null,
        militaryRuralConfirmed: profile.military_rural_confirmed || false,
        jobTenureType: profile.job_tenure_type ?? null,
        jobTenureTypeConfirmed: profile.job_tenure_type_confirmed || false,
        pendingConfirmField: profile.pending_confirm_field ?? null,
        pendingConfirmValue: profile.pending_confirm_value ?? null,
        bridgeToSay: profile.bridge_to_say ?? null,
        // Stage 2.5 Affordability Panel Fields
        affordabilityPanelRendered: profile.affordability_panel_rendered || false,
        affordabilityMode: profile.affordability_mode ?? null,
        affordabilityPurchasePrice: profile.affordability_purchase_price ?? null,
        affordabilityDownPayment: profile.affordability_down_payment ?? null,
        affordabilityIncomeBand: profile.affordability_income_band ?? null,
        affordabilityDtiBand: profile.affordability_dti_band ?? null,
        affordabilitySubmitted: profile.affordability_submitted || false,
        affordabilityAusStatus: profile.affordability_aus_status ?? null,
        affordabilityPrequelLetterSent: profile.affordability_prequel_letter_sent || false,
        zipCode: profile.zip_code ?? null,
      },
    });
  }

  /**
   * Sync Stage 3 data from BorrowerProfile
   */
  async syncStage3(applicationId: string, profile: BorrowerProfile) {
    if (!prisma) return null;
    return await prisma.stage3Application.upsert({
      where: { applicationId },
      create: {
        applicationId,
        eligibleProducts: profile.eligible_products || [],
        programComparisonInterest: profile.program_comparison_interest ?? null,
        programComparisonInterestConfirmed: profile.program_comparison_interest_confirmed || false,
        financialPriority: profile.financial_priority ?? null,
        financialPriorityConfirmed: profile.financial_priority_confirmed || false,
        homeHorizon: profile.home_horizon ?? null,
        homeHorizonConfirmed: profile.home_horizon_confirmed || false,
        legalName: profile.legal_name ?? null,
        legalNameConfirmed: profile.legal_name_confirmed || false,
        physicalAddress: profile.physical_address ?? null,
        physicalAddressConfirmed: profile.physical_address_confirmed || false,
        softPullConsent: profile.soft_pull_consent ?? null,
        softPullConsentTimestamp: profile.soft_pull_consent === 'accepted' ? new Date() : null,
        employer: profile.employer ?? null,
        prefilledFieldsConfirmed: profile.prefilled_fields_confirmed || {},
        // OTP Gate & Session Login Fields
        sessionLoginComplete: profile.session_login_complete || false,
        contactOnFile: profile.contact_on_file || false,
        contactEmail: profile.contact_email ?? null,
        contactMobile: profile.contact_mobile ?? null,
        otpVerified: profile.otp_verified || false,
        // Stage 3B Application Completion
        maritalStatus: profile.marital_status ?? null,
        maritalStatusConfirmed: profile.marital_status_confirmed || false,
        dependents: profile.dependents ?? null,
        dependentsConfirmed: profile.dependents_confirmed || false,
        employmentPosition: profile.employment_position ?? null,
        employmentYears: profile.employment_years ?? null,
        selfEmployed: profile.self_employed ?? null,
        employmentConfirmed: profile.employment_confirmed || false,
        checkingSavingsBalance: profile.checking_savings_balance ?? null,
        checkingSavingsConfirmed: profile.checking_savings_confirmed || false,
        declarationsBankruptcy: profile.declarations_bankruptcy ?? null,
        declarationsForeclosure: profile.declarations_foreclosure ?? null,
        declarationsConfirmed: profile.declarations_confirmed || false,
        readyToSubmit: profile.ready_to_submit || false,
        // Compliance & Audit Tracking
        eligibilityReviewExplained: profile.eligibility_review_explained || false,
        creditImpactStated: profile.credit_impact_stated || false,
        pmiExplained: profile.pmi_explained || false,
        transitionPitchDelivered: profile.transition_pitch_delivered || false,
        dtiAboveHardCeiling: profile.dti_above_hard_ceiling || false,
      },
      update: {
        eligibleProducts: profile.eligible_products || [],
        programComparisonInterest: profile.program_comparison_interest ?? null,
        programComparisonInterestConfirmed: profile.program_comparison_interest_confirmed || false,
        financialPriority: profile.financial_priority ?? null,
        financialPriorityConfirmed: profile.financial_priority_confirmed || false,
        homeHorizon: profile.home_horizon ?? null,
        homeHorizonConfirmed: profile.home_horizon_confirmed || false,
        legalName: profile.legal_name ?? null,
        legalNameConfirmed: profile.legal_name_confirmed || false,
        physicalAddress: profile.physical_address ?? null,
        physicalAddressConfirmed: profile.physical_address_confirmed || false,
        softPullConsent: profile.soft_pull_consent ?? null,
        employer: profile.employer ?? null,
        prefilledFieldsConfirmed: profile.prefilled_fields_confirmed || {},
        // OTP Gate & Session Login Fields
        sessionLoginComplete: profile.session_login_complete || false,
        contactOnFile: profile.contact_on_file || false,
        contactEmail: profile.contact_email ?? null,
        contactMobile: profile.contact_mobile ?? null,
        otpVerified: profile.otp_verified || false,
        // Stage 3B Application Completion
        maritalStatus: profile.marital_status ?? null,
        maritalStatusConfirmed: profile.marital_status_confirmed || false,
        dependents: profile.dependents ?? null,
        dependentsConfirmed: profile.dependents_confirmed || false,
        employmentPosition: profile.employment_position ?? null,
        employmentYears: profile.employment_years ?? null,
        selfEmployed: profile.self_employed ?? null,
        employmentConfirmed: profile.employment_confirmed || false,
        checkingSavingsBalance: profile.checking_savings_balance ?? null,
        checkingSavingsConfirmed: profile.checking_savings_confirmed || false,
        declarationsBankruptcy: profile.declarations_bankruptcy ?? null,
        declarationsForeclosure: profile.declarations_foreclosure ?? null,
        declarationsConfirmed: profile.declarations_confirmed || false,
        readyToSubmit: profile.ready_to_submit || false,
        // Compliance & Audit Tracking
        eligibilityReviewExplained: profile.eligibility_review_explained || false,
        creditImpactStated: profile.credit_impact_stated || false,
        pmiExplained: profile.pmi_explained || false,
        transitionPitchDelivered: profile.transition_pitch_delivered || false,
        dtiAboveHardCeiling: profile.dti_above_hard_ceiling || false,
      },
    });
  }

  /**
   * Sync Stage 4 data from BorrowerProfile
   */
  async syncStage4(applicationId: string, profile: BorrowerProfile) {
    if (!prisma) return null;
    return await prisma.stage4Underwriting.upsert({
      where: { applicationId },
      create: {
        applicationId,
        ausStatus: profile.aus_status ?? null,
        ausResultTimestamp: profile.aus_status ? new Date() : null,
        ausConfirmed: profile.aus_confirmed || false,
        checklistDiscussed: profile.checklist_discussed || false,
      },
      update: {
        ausStatus: profile.aus_status ?? null,
        ausConfirmed: profile.aus_confirmed || false,
        checklistDiscussed: profile.checklist_discussed || false,
      },
    });
  }

  /**
   * Sync all stages from BorrowerProfile to database
   */
  async syncAllStages(applicationId: string, profile: BorrowerProfile, currentStage: string): Promise<void | null> {
    if (!prisma) return null;
    const syncs: Promise<any>[] = [];

    // Sync stages based on current progress
    if (currentStage >= '1') {
      syncs.push(this.syncStage1(applicationId, profile));
    }
    if (currentStage >= '2') {
      syncs.push(this.syncStage2(applicationId, profile));
    }
    if (currentStage >= '3') {
      syncs.push(this.syncStage3(applicationId, profile));
    }
    if (currentStage >= '4') {
      syncs.push(this.syncStage4(applicationId, profile));
    }

    await Promise.all(syncs);
  }
}

export const applicationService = new ApplicationService();

import { llm, type voice } from '@livekit/agents';
import type { LLM } from '@livekit/agents-plugin-openai';
import { ailanaConfig } from '../config/ailana-config.js';
import {
  getForceCompactTokenThreshold,
  logContextBudget,
} from './context-budget.js';
import type { LatencyTracker } from '../metrics/latency-tracker.js';
import type { BorrowerProfile } from '../prompts/layer3-context.js';
import { buildSessionPrompt } from '../prompts/ailana-system.js';
import { extractProfileField, classifyConfirmation, extractMultipleFields, type FieldToExtract } from './llm-extractor.js';
import { applicationService } from '../services/application-service.js';
import { conversationService } from '../services/conversation-service.js';
import { isDatabaseEnabled } from '../services/database.js';


export type TurnLogEntry = {
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
};

interface SessionContextManagerSnapshot {
  profile: BorrowerProfile;
  activeStage: string;
  currentPendingField: string | null;
  fieldAttempts: Record<string, number>;
}

export class SessionContextManager {
  private turnLog: TurnLogEntry[] = [];
  private turnCount = 0;
  private lastCompactAt = Date.now();
  private lastRotationAt = Date.now();
  private conversationSummary: string | null = null;
  private compacting = false;
  /** Last input token count reported by Realtime API (includes audio + text). */
  private lastInputTokens = 0;

  // State / Session variables
  private profile: BorrowerProfile = {};
  private activeStage: string = '1';
  private currentPendingField: string | null = 'borrower_name';
  private lastProcessedInput: string | null = null;
  private lowConfidence = false;
  private fieldAttempts: Record<string, number> = {};

  // Parallel asynchronous extraction state
  private nextExtractionTurn = 1;
  private lastAppliedTurn = 0;
  private pendingExtractions = new Map<number, {
    promise: Promise<void>;
    status: 'pending' | 'completed' | 'timeout';
    snapshot: SessionContextManagerSnapshot;
    clonedManager?: SessionContextManager;
    durationMs?: number;
  }>();

  // Database persistence (optional - only if DATABASE_URL is set)
  private applicationId: string | null = null;
  private lastSyncAt = Date.now();
  private readonly syncIntervalMs = 5000; // Sync every 5 seconds
  private readonly dbEnabled: boolean;

  constructor(
    private readonly summarizationLlm: LLM,
    private readonly metrics: LatencyTracker,
  ) {
    this.dbEnabled = isDatabaseEnabled();
    if (this.dbEnabled) {
      console.log('[context-manager] Database persistence ENABLED');
    } else {
      console.log('[context-manager] Database persistence DISABLED (no DATABASE_URL found)');
    }
  }

  clone(): SessionContextManager {
    const cloned = new SessionContextManager(this.summarizationLlm, this.metrics);
    cloned.profile = JSON.parse(JSON.stringify(this.profile));
    cloned.activeStage = this.activeStage;
    cloned.currentPendingField = this.currentPendingField;
    cloned.lastProcessedInput = this.lastProcessedInput;
    cloned.lowConfidence = this.lowConfidence;
    cloned.fieldAttempts = JSON.parse(JSON.stringify(this.fieldAttempts));
    cloned.turnLog = [...this.turnLog];
    cloned.turnCount = this.turnCount;
    cloned.lastCompactAt = this.lastCompactAt;
    cloned.lastRotationAt = this.lastRotationAt;
    cloned.conversationSummary = this.conversationSummary;
    cloned.lastInputTokens = this.lastInputTokens;
    return cloned;
  }

  getCurrentTurnCount(): number {
    return this.nextExtractionTurn - 1;
  }

  getPendingExtractionCount(): number {
    let count = 0;
    for (const extraction of this.pendingExtractions.values()) {
      if (extraction.status === 'pending') {
        count++;
      }
    }
    return count;
  }

  // ============================================================================
  // DATABASE PERSISTENCE (Optional - only if DATABASE_URL is set)
  // ============================================================================

  /**
   * Set the application ID for database persistence
   */
  setApplicationId(id: string): void {
    this.applicationId = id;
    console.log(`[context-manager] Application ID set: ${id}`);
  }

  /**
   * Initialize context from database (resume existing application)
   */
  async initializeFromDatabase(applicationId: string): Promise<void> {
    if (!this.dbEnabled || !applicationId) {
      console.log('[context-manager] Skipping database initialization (database not enabled)');
      return;
    }

    try {
      this.applicationId = applicationId;
      console.log(`[context-manager] Loading application ${applicationId} from database...`);

      const app = await applicationService.getApplicationWithStages(applicationId);
      if (!app) {
        console.log('[context-manager] No existing data found in database, starting fresh');
        return;
      }

      // Restore Stage 1
      if (app.stage1) {
        this.profile.borrower_name = app.stage1.borrowerName ?? null;
        this.profile.borrower_name_confirmed = app.stage1.borrowerNameConfirmed;
        this.profile.mortgage_goal = app.stage1.mortgageGoal ?? null;
        this.profile.mortgage_goal_confirmed = app.stage1.mortgageGoalConfirmed;
        this.profile.occupancy = app.stage1.occupancy as any ?? null;
        this.profile.occupancy_confirmed = app.stage1.occupancyConfirmed;
        this.profile.existing_relationship = app.stage1.existingRelationship as any ?? null;
        this.profile.existing_relationship_confirmed = app.stage1.existingRelationshipConfirmed;
        this.profile.timeline = app.stage1.timeline ?? null;
        this.profile.timeline_confirmed = app.stage1.timelineConfirmed;
        this.profile.co_borrower = app.stage1.coBorrower as any ?? null;
        this.profile.co_borrower_confirmed = app.stage1.coBorrowerConfirmed;
      }

      // Restore Stage 2
      if (app.stage2) {
        this.profile.gross_annual_income = app.stage2.grossAnnualIncome?.toNumber() ?? null;
        this.profile.gross_annual_income_confirmed = app.stage2.grossAnnualIncomeConfirmed;
        this.profile.monthly_debt = app.stage2.monthlyDebt?.toNumber() ?? null;
        this.profile.monthly_debt_confirmed = app.stage2.monthlyDebtConfirmed;
        this.profile.credit_range = app.stage2.creditRange ?? null;
        this.profile.credit_range_confirmed = app.stage2.creditRangeConfirmed;
        this.profile.down_payment = app.stage2.downPayment?.toNumber() ?? null;
        this.profile.down_payment_confirmed = app.stage2.downPaymentConfirmed;
        this.profile.target_price = app.stage2.targetPrice?.toNumber() ?? null;
        this.profile.target_price_confirmed = app.stage2.targetPriceConfirmed;
        this.profile.rent_own = app.stage2.rentOwn as any ?? null;
        this.profile.rent_own_confirmed = app.stage2.rentOwnConfirmed;
        this.profile.realtor_status = app.stage2.realtorStatus as any ?? null;
        this.profile.realtor_status_confirmed = app.stage2.realtorStatusConfirmed;
        this.profile.refinance_type = app.stage2.refinanceType as any ?? null;
        this.profile.refinance_type_confirmed = app.stage2.refinanceTypeConfirmed;
        this.profile.property_type = app.stage2.propertyType as any ?? null;
        this.profile.property_type_confirmed = app.stage2.propertyTypeConfirmed;
        this.profile.military_rural = app.stage2.militaryRural as any ?? null;
        this.profile.military_rural_confirmed = app.stage2.militaryRuralConfirmed;
        this.profile.job_tenure_type = app.stage2.jobTenureType ?? null;
        this.profile.job_tenure_type_confirmed = app.stage2.jobTenureTypeConfirmed;
        this.profile.pending_confirm_field = app.stage2.pendingConfirmField ?? null;
        this.profile.pending_confirm_value = app.stage2.pendingConfirmValue ?? null;
        this.profile.bridge_to_say = app.stage2.bridgeToSay as any ?? null;
      }

      // Restore Stage 3 (unified)
      if (app.stage3) {
        this.profile.eligible_products = app.stage3.eligibleProducts as string[];
        this.profile.program_comparison_interest = app.stage3.programComparisonInterest as any ?? null;
        this.profile.program_comparison_interest_confirmed = app.stage3.programComparisonInterestConfirmed;
        this.profile.financial_priority = app.stage3.financialPriority as any ?? null;
        this.profile.financial_priority_confirmed = app.stage3.financialPriorityConfirmed;
        this.profile.home_horizon = app.stage3.homeHorizon as any ?? null;
        this.profile.home_horizon_confirmed = app.stage3.homeHorizonConfirmed;
        this.profile.legal_name = app.stage3.legalName ?? null;
        this.profile.legal_name_confirmed = app.stage3.legalNameConfirmed;
        this.profile.physical_address = app.stage3.physicalAddress ?? null;
        this.profile.physical_address_confirmed = app.stage3.physicalAddressConfirmed;
        this.profile.soft_pull_consent = app.stage3.softPullConsent as any ?? null;
        this.profile.employer = app.stage3.employer ?? null;
        this.profile.prefilled_fields_confirmed = app.stage3.prefilledFieldsConfirmed as any;
        this.profile.marital_status = app.stage3.maritalStatus as any ?? null;
        this.profile.marital_status_confirmed = app.stage3.maritalStatusConfirmed;
        this.profile.dependents = app.stage3.dependents ?? null;
        this.profile.dependents_confirmed = app.stage3.dependentsConfirmed;
        this.profile.employment_position = app.stage3.employmentPosition ?? null;
        this.profile.employment_years = app.stage3.employmentYears?.toNumber() ?? null;
        this.profile.self_employed = app.stage3.selfEmployed ?? null;
        this.profile.employment_confirmed = app.stage3.employmentConfirmed;
        this.profile.checking_savings_balance = app.stage3.checkingSavingsBalance?.toNumber() ?? null;
        this.profile.checking_savings_confirmed = app.stage3.checkingSavingsConfirmed;
        this.profile.declarations_bankruptcy = app.stage3.declarationsBankruptcy ?? null;
        this.profile.declarations_foreclosure = app.stage3.declarationsForeclosure ?? null;
        this.profile.declarations_confirmed = app.stage3.declarationsConfirmed;
        this.profile.ready_to_submit = app.stage3.readyToSubmit;
      }

      // Restore Stage 4
      if (app.stage4) {
        this.profile.aus_status = app.stage4.ausStatus as any || undefined;
        this.profile.aus_confirmed = app.stage4.ausConfirmed;
        this.profile.checklist_discussed = app.stage4.checklistDiscussed;
      }

      // Restore current stage and field attempts
      this.activeStage = app.currentStage;
      this.fieldAttempts = (app.fieldAttempts as Record<string, number>) || {};

      console.log(`[context-manager] ✅ Successfully restored application from database (stage: ${this.activeStage})`);
    } catch (error) {
      console.error('[context-manager] ❌ Failed to load from database:', error);
      console.log('[context-manager] Continuing with fresh state...');
    }
  }

  /**
   * Sync current state to database (called periodically)
   */
  async syncToDatabase(): Promise<void> {
    if (!this.dbEnabled || !this.applicationId) {
      return; // Silently skip if database not enabled
    }

    // Throttle syncs to avoid overwhelming database
    if (Date.now() - this.lastSyncAt < this.syncIntervalMs) {
      return;
    }

    try {
      await applicationService.syncAllStages(
        this.applicationId,
        this.profile,
        this.activeStage
      );
      this.lastSyncAt = Date.now();
      console.log(`[db-sync] ✅ Application ${this.applicationId} synced to database`);
    } catch (error) {
      console.error('[db-sync] ❌ Failed to sync to database:', error);
      // Don't throw - continue operating even if sync fails
    }
  }

  /**
   * Save a conversation turn to database (public method for voice turns)
   */
  async saveVoiceConversationTurn(role: 'user' | 'assistant', text: string): Promise<void> {
    await this.saveConversationTurn(role, text);
  }

  /**
   * Save a conversation turn to database
   */
  private async saveConversationTurn(role: 'user' | 'assistant', text: string): Promise<void> {
    if (!this.dbEnabled || !this.applicationId) {
      return; // Silently skip if database not enabled
    }

    try {
      await conversationService.saveTurn(
        this.applicationId,
        role.toUpperCase() as 'USER' | 'ASSISTANT',
        text,
        this.turnCount,
        {
          lowConfidence: this.lowConfidence,
        }
      );
    } catch (error) {
      console.error('[db-sync] ❌ Failed to save conversation turn:', error);
      // Don't throw - continue operating even if save fails
    }
  }

  // ============================================================================
  // END DATABASE PERSISTENCE
  // ============================================================================

  triggerBackgroundExtraction(text: string): number {
    const turnNumber = this.nextExtractionTurn++;
    const snapshot: SessionContextManagerSnapshot = {
      profile: JSON.parse(JSON.stringify(this.profile)),
      activeStage: this.activeStage,
      currentPendingField: this.currentPendingField,
      fieldAttempts: JSON.parse(JSON.stringify(this.fieldAttempts)),
    };

    const clonedManager = this.clone();

    const promise = (async () => {
      const t0 = performance.now();
      try {
        // ── [perf] 50ms head-start for the main LLM pipeline ─────────────────
        // Both this extractor and the main pipelineReply call Cerebras almost
        // simultaneously. Without a delay, they compete for the same inference
        // slot, adding up to ~700ms of queuing latency to the main reply on
        // ~20-30% of turns (the 186ms→1311ms Segment A swing).
        // A 50ms pause here ensures the main LLM call is already in-flight
        // before the extractor fires, eliminating the contention window.
        await new Promise<void>(r => setTimeout(r, 50));
        await clonedManager.onUserTurn(text);
        const duration = performance.now() - t0;
        
        const pending = this.pendingExtractions.get(turnNumber);
        if (pending) {
          pending.status = 'completed';
          pending.durationMs = duration;
        }
        console.log(`[reconcile] Turn ${turnNumber} extraction finished in ${duration.toFixed(1)}ms.`);
        this.applyCompletedExtractions();
      } catch (err) {
        console.error(`[reconcile] Turn ${turnNumber} extraction failed:`, err);
        const pending = this.pendingExtractions.get(turnNumber);
        if (pending) {
          pending.status = 'completed';
        }
        this.applyCompletedExtractions();
      }
    })();

    this.pendingExtractions.set(turnNumber, {
      promise,
      status: 'pending',
      snapshot,
      clonedManager,
    });

    return turnNumber;
  }

  async waitForExtraction(turnNumber: number, maxWaitMs: number): Promise<boolean> {
    const pending = this.pendingExtractions.get(turnNumber);
    if (!pending) return true;
    if (pending.status !== 'pending') return true;

    if (maxWaitMs <= 0) {
      console.log(`[checkpoint] Circuit breaker active (0ms wait) for turn ${turnNumber}. Proceeding immediately.`);
      pending.status = 'timeout';
      return false;
    }

    let timeoutId: any;
    const timeoutPromise = new Promise<boolean>((resolve) => {
      timeoutId = setTimeout(() => {
        console.warn(`[checkpoint] Turn ${turnNumber} extraction timed out after ${maxWaitMs}ms.`);
        pending.status = 'timeout';
        resolve(false);
      }, maxWaitMs);
    });

    const completionPromise = pending.promise.then(() => {
      clearTimeout(timeoutId);
      return true;
    });

    return Promise.race([completionPromise, timeoutPromise]);
  }

  private applyCompletedExtractions(): void {
    while (this.pendingExtractions.has(this.lastAppliedTurn + 1)) {
      const turnNum = this.lastAppliedTurn + 1;
      const extraction = this.pendingExtractions.get(turnNum)!;
      
      if (extraction.status === 'pending') {
        break;
      }

      if (extraction.status === 'completed' && extraction.clonedManager) {
        console.log(`[reconcile] Merging Turn ${turnNum} background extraction results into state.`);
        this.reconcileState(extraction.snapshot, extraction.clonedManager);
      } else {
        console.log(`[reconcile] Turn ${turnNum} was timed out/skipped. Proceeding without matching results.`);
      }

      this.lastAppliedTurn = turnNum;
      this.pendingExtractions.delete(turnNum);
    }
  }

  private reconcileState(snapshot: SessionContextManagerSnapshot, clone: SessionContextManager): void {
    const delta = this.getProfileDelta(snapshot.profile, clone.profile);
    Object.assign(this.profile, delta);

    if (clone.activeStage !== snapshot.activeStage) {
      console.log(`[reconcile] Transitioning activeStage: ${this.activeStage} -> ${clone.activeStage}`);
      this.activeStage = clone.activeStage;
    }
    if (clone.currentPendingField !== snapshot.currentPendingField) {
      console.log(`[reconcile] Transitioning currentPendingField: ${this.currentPendingField} -> ${clone.currentPendingField}`);
      this.currentPendingField = clone.currentPendingField;
    }

    for (const [field, attempts] of Object.entries(clone.fieldAttempts)) {
      this.fieldAttempts[field] = attempts;
    }
  }

  private getProfileDelta(original: BorrowerProfile, updated: BorrowerProfile): Partial<BorrowerProfile> {
    const delta: Partial<BorrowerProfile> = {};
    for (const key of Object.keys(updated) as Array<keyof BorrowerProfile>) {
      if (JSON.stringify(original[key]) !== JSON.stringify(updated[key])) {
        (delta as any)[key] = updated[key];
      }
    }
    return delta;
  }

  getProfile(): BorrowerProfile {
    this.profile.current_pending_field = this.currentPendingField;
    return this.profile;
  }

  getActiveStage(): string {
    return this.activeStage;
  }

  getPendingField(): string | null {
    return this.currentPendingField;
  }

  async onUserTurn(text: string): Promise<void> {
    const _perfOnUserTurnStart = performance.now();
    let trimmed = text.trim();

    // Redact SSNs from user input to comply with TRID logging requirements
    trimmed = trimmed.replace(/\b\d{3}[- ]?\d{2}[- ]?\d{4}\b/g, '[REDACTED_SSN]');

    // Pre-clean STT currency artifacts for credit score if currentPendingField is credit_range or if user input contains e.g. "$710000" / "710000"
    if (this.currentPendingField === 'credit_range' || (!this.profile.credit_range_confirmed && this.activeStage === '2')) {
      trimmed = trimmed.replace(/\$?(\d{3})(?:000|,000|\.00)\b/g, (match, p1) => {
        const score = parseInt(p1, 10);
        if (score >= 300 && score <= 850) {
          console.log(`[context-manager]: Pre-cleaned STT credit score artifact in input: "${match}" -> "${p1}"`);
          return p1;
        }
        return match;
      });
    }

    if (!trimmed || trimmed.startsWith('SYSTEM_')) return;
    if (this.lowConfidence) {
      console.log('[context-manager]: Low confidence detected. Skipping data extraction for this turn.');
      return;
    }
    if (trimmed === this.lastProcessedInput) {
      console.log(`[context-manager]: Input "${trimmed}" already processed. Skipping duplicate onUserTurn.`);
      return;
    }
    this.lastProcessedInput = trimmed;
    this.turnLog.push({ role: 'user', text: trimmed, timestamp: Date.now() });
    this.turnCount += 1;

    // Handle Stage 2 pending confirmations local loop directly on this turn
    if (this.activeStage === '2' && this.profile.pending_confirm_field && this.profile.pending_confirm_value != null) {
      const _t = performance.now();
      await this.handleStage2Confirmation(trimmed);
      console.log(`[perf] context-manager handleStage2Confirmation: ${(performance.now() - _t).toFixed(1)}ms`);
      console.log(`[perf] context-manager onUserTurn TOTAL: ${(performance.now() - _perfOnUserTurnStart).toFixed(1)}ms`);
      return;
    }

    // 1. Handle global pending confirmations first (excluding Stage 2 which has local loop logic)
    const _tGlobalConfirm = performance.now();
    const handled = await this.handleGlobalConfirmation(trimmed);
    console.log(`[perf] context-manager handleGlobalConfirmation: ${(performance.now() - _tGlobalConfirm).toFixed(1)}ms (handled=${handled})`);
    if (handled) {
      console.log(`[perf] context-manager onUserTurn TOTAL: ${(performance.now() - _perfOnUserTurnStart).toFixed(1)}ms`);
      return;
    }

    // 2. Check if the user is correcting an already confirmed field
    const _tGlobalCorrect = performance.now();
    const corrected = await this.checkForGlobalCorrections(trimmed);
    console.log(`[perf] context-manager checkForGlobalCorrections: ${(performance.now() - _tGlobalCorrect).toFixed(1)}ms (corrected=${corrected})`);
    if (corrected) {
      console.log(`[perf] context-manager onUserTurn TOTAL: ${(performance.now() - _perfOnUserTurnStart).toFixed(1)}ms`);
      return;
    }

    // 3. Track attempts for the current pending field
    if (this.currentPendingField) {
      const attempts = (this.fieldAttempts[this.currentPendingField] || 0) + 1;
      this.fieldAttempts[this.currentPendingField] = attempts;
      console.log(`[context-manager] Attempt count for "${this.currentPendingField}" is ${attempts}`);
      if (attempts >= 3) {
        console.log(`[context-manager] Max attempts reached for "${this.currentPendingField}". Declining field.`);
        this.declineCurrentField();
        console.log(`[perf] context-manager onUserTurn TOTAL: ${(performance.now() - _perfOnUserTurnStart).toFixed(1)}ms`);
        return;
      }
    }

    if (!this.currentPendingField && !['3', '3A', '3B'].includes(this.activeStage.toUpperCase())) {
      console.log(`[perf] context-manager onUserTurn TOTAL (no pending field): ${(performance.now() - _perfOnUserTurnStart).toFixed(1)}ms`);
      return;
    }

    // 4. Run extraction for the current stage — exactly ONE call per turn.
    // extractMultipleFields already captures all fields in a single request;
    // looping only causes multiple sequential Cerebras calls when several fields
    // are answered at once.
    const _tExtract = performance.now();
    if (this.activeStage === '1') {
      await this.runStage1Extraction(trimmed);
    } else if (this.activeStage === '2') {
      await this.runStage2Extraction(trimmed);
    } else if (this.activeStage === '2.5') {
      await this.runStage25Extraction(trimmed);
    } else if (this.activeStage === '3') {
      await this.runStage3Extraction(trimmed);
    } else if (this.activeStage === '3A') {
      await this.runStage3AExtraction(trimmed);
    } else if (this.activeStage === '3B') {
      await this.runStage3BExtraction(trimmed);
    } else if (this.activeStage === '4') {
      await this.runStage4Extraction(trimmed);
    }
    console.log(`[perf] context-manager stage${this.activeStage} extraction: ${(performance.now() - _tExtract).toFixed(1)}ms`);
    console.log(`[perf] context-manager onUserTurn TOTAL: ${(performance.now() - _perfOnUserTurnStart).toFixed(1)}ms`);
    
    // ── DATABASE PERSISTENCE ────────────────────────────────────────────────
    // Save user turn to database and sync profile state
    await this.saveConversationTurn('user', trimmed);
    await this.syncToDatabase();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Stage 2.5 (Affordability Panel) Extraction
  // ──────────────────────────────────────────────────────────────────────────
  private async runStage25Extraction(text: string): Promise<void> {
    const lastQuestion = this.getLastAssistantUtterance();
    const field = this.currentPendingField;

    if (field === 'affordability_panel_active') {
      const res = await extractProfileField(
        text,
        lastQuestion,
        'affordability_action',
        'the specific action the user is explicitly requesting in relation to the affordability panel',
        'string',
        'IMPORTANT: Only extract "submit" if the borrower explicitly says one of: "submit", "submit for review", "submit it", "run the review", "run the credit check", or "ready to submit". ' +
        'Do NOT extract "submit" for general affirmations like "yes", "sure", "okay", "sounds good", "proceed", "continue", "move on", "let\'s go", "next steps" — these should return null. ' +
        'Extract "update_profile" ONLY if borrower explicitly says they want to correct or change a specific data point (e.g. "my income is actually", "let me update that", "I want to change my"). Do NOT extract update_profile for employment descriptions, job information, tenure, or general statements about work. ' +
        'Extract "upgrade" if borrower asks to upgrade to verified mode or run a soft credit review. ' +
        'Extract "delete_data" if borrower asks to delete their information or stop using data. ' +
        'Extract "drop_off" if borrower explicitly says they want to stop, pause, exit, or think about it. Return null for everything else including general conversation, job/employment answers, and statements about work.'
      );

      if (res.value === 'submit') {
        this.profile.affordability_submitted = true;
        this.profile.affordability_aus_status = 'pending';
        this.currentPendingField = 'affordability_aus_pending';
        console.log('[context-manager]: Affordability panel EXPLICITLY submitted for review! AUS pending.');
      } else if (res.value === 'upgrade') {
        // Trigger upgrade to verified mode — set pending to OTP gate
        this.activeStage = '3A';
        this.currentPendingField = 'contact_email';
        console.log('[context-manager]: Affordability panel upgrade to verified mode requested. Going to OTP gate.');
      } else if (res.value === 'update_profile') {
        this.currentPendingField = 'affordability_profile_correction';
      } else if (res.value === 'delete_data') {
        this.currentPendingField = 'affordability_data_deletion';
      } else if (res.value === 'drop_off') {
        this.currentPendingField = 'affordability_drop_off';
      }
      // null or unknown: stay on affordability_panel_active, let Ailana continue exploring with user
      return;
    }


    if (field === 'affordability_profile_correction' || field === 'affordability_income_correction') {
      const res = await extractProfileField(
        text,
        lastQuestion,
        'gross_annual_income',
        'borrower gross annual household income or other profile updates',
        'number',
        'Extract the updated gross annual income figure mentioned by the user if present. Return number or null.'
      );
      if (res.value && typeof res.value === 'number') {
        this.profile.gross_annual_income = res.value;
        this.profile.gross_annual_income_confirmed = true;
        console.log(`[context-manager]: Corrected income in Stage 2.5 to $${res.value}`);
      }
      this.currentPendingField = 'affordability_panel_active';
      return;
    }

    if (field === 'affordability_data_deletion') {
      const res = await classifyConfirmation(text, lastQuestion, 'confirm_deletion', 'Would you like me to start that process for you now?');
      if (res === 'yes') {
        this.activeStage = '5';
        this.currentPendingField = null;
        console.log('[context-manager]: Borrower confirmed data deletion request. Escalating/stopping flow.');
      } else {
        this.currentPendingField = 'affordability_panel_active';
      }
      return;
    }

    if (field === 'affordability_drop_off') {
      const res = await classifyConfirmation(text, lastQuestion, 'summary_offer', 'Would that summary be helpful?');
      if (res === 'yes') {
        this.currentPendingField = 'affordability_drop_off_delivery_method';
      } else {
        this.currentPendingField = null;
        this.activeStage = '5';
      }
      return;
    }

    if (field === 'affordability_drop_off_delivery_method') {
      const res = await extractProfileField(
        text,
        lastQuestion,
        'delivery_method',
        'delivery method preference for summary (email or mobile/SMS)',
        'string',
        'Extract "email" if user prefers email, or "sms" if user prefers text/mobile. Return string or null.'
      );
      this.profile.affordability_prequel_letter_sent = true;
      console.log(`[context-manager]: Borrower requested scenario summary on drop-off via ${res.value || 'email'}.`);
      this.currentPendingField = null;
      this.activeStage = '5';
      return;
    }
  }

  public applyAusResult(result: 'approve_eligible' | 'refer'): void {
    this.profile.affordability_aus_status = result;
    this.activeStage = '2.5';
    this.currentPendingField = result === 'approve_eligible' ? 'fd1_delivery' : 'fd2_delivery';
    console.log(`[context-manager]: Applied AUS result: ${result} -> pending field set to ${this.currentPendingField}`);
  }

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢
  private async runStage3Extraction(text: string): Promise<void> {
    const lastQuestion = this.getLastAssistantUtterance();
    const field = this.currentPendingField;

    if (field === 'product_fit_walkthrough') {
      const res = await extractProfileField(
        text,
        lastQuestion,
        'ready_to_proceed',
        'whether the user is ready to move forward or has no more questions',
        'string',
        'If the user indicates they want to proceed, have no questions, say "yes", "makes sense", "let\'s go", "sure", or similar, extract value as "yes". If they ask a mortgage/product related question, extract value as "question". If not sure, return null.'
      );

      if (res.value === 'yes') {
        this.advanceWorkflow();
      }
      return;
    }

    if (field === 'stage3_closing_offer') {
      const res = await extractProfileField(
        text,
        lastQuestion,
        'stage3_closing_offer',
        'whether the user wants to proceed with the eligibility review now',
        'string',
        'Extract "yes", "no", or "explain". If they say yes, sure, okay, let\'s do it, return "yes". If they say no, not yet, prefer not to, return "no". If they ask what it involves, return "explain". If not sure, return null.'
      );

      if (res.value === 'yes') {
        // Route through v8.7 OTP gate
        this.activeStage = '3A';
        this.currentPendingField = 'contact_email';
        console.log('[context-manager]: stage3_closing_offer accepted! Transitioning to STAGE 3A OTP gate (contact_email)!');

      } else if (res.value === 'no') {
        this.currentPendingField = 'advisor_connection_offer';
        console.log('[context-manager]: stage3_closing_offer declined. Transitioning to advisor_connection_offer.');
      } else if (res.value === 'explain') {
        console.log('[context-manager]: stage3_closing_offer explanation requested.');
      }
      return;
    }

    if (field === 'advisor_connection_offer') {
      const res = await extractProfileField(
        text,
        lastQuestion,
        'advisor_connection_offer',
        'whether they want to be connected with a human mortgage advisor',
        'string',
        'Extract "yes" or "no". If they want to speak to a person, advisor, officer, human, return "yes". If not, return "no". If not found, return null.'
      );
      if (res.value === 'yes') {
        this.activeStage = '5';
        this.currentPendingField = null;
        console.log('[context-manager]: Ã¢Å“â€¦ Connected to human advisor! Transitioning to STAGE 5 Escalation.');
      } else if (res.value === 'no') {
        console.log('[context-manager]: Advisor connection declined.');
      }
      return;
    }

    // Process refinement questions in batch
    const fieldsToExtract: FieldToExtract[] = [];
    if (!this.profile.program_comparison_interest_confirmed) {
      fieldsToExtract.push({
        name: 'program_comparison_interest',
        description: 'whether the user wants to walk through a comparison of the loan programs',
        expectedType: 'string',
        additionalInstructions: 'Extract "yes" or "no". If they want a comparison, return "yes". If not, return "no". If not found, return null.',
      });
    }
    if (!this.profile.financial_priority_confirmed) {
      fieldsToExtract.push({
        name: 'financial_priority',
        description: 'whether the user prioritizes lower monthly payments or a faster payoff with less interest',
        expectedType: 'string',
        additionalInstructions: 'Extract "low_payment", "faster_payoff", or "balanced". If they prefer keeping payment low, return "low_payment". If they prefer paying off fast/saving interest, return "faster_payoff". If both or balanced, return "balanced". If not found, return null.',
      });
    }
    if (!this.profile.home_horizon_confirmed) {
      fieldsToExtract.push({
        name: 'home_horizon',
        description: 'whether this is a long-term home or a short-term starting point',
        expectedType: 'string',
        additionalInstructions: 'Extract "long_term" or "short_term". If they plan to stay long term, return "long_term". If they plan to move or sell soon, return "short_term". If not found, return null.',
      });
    }

    if (fieldsToExtract.length === 0) {
      this.advanceWorkflow();
      return;
    }

    const extractionResults = await extractMultipleFields(text, lastQuestion, fieldsToExtract);
    let anyUpdates = false;

    if (extractionResults.program_comparison_interest && (extractionResults.program_comparison_interest.value === 'yes' || extractionResults.program_comparison_interest.value === 'no')) {
      this.profile.program_comparison_interest = extractionResults.program_comparison_interest.value;
      this.profile.program_comparison_interest_confirmed = true;
      anyUpdates = true;
    }
    if (extractionResults.financial_priority && (extractionResults.financial_priority.value === 'low_payment' || extractionResults.financial_priority.value === 'faster_payoff' || extractionResults.financial_priority.value === 'balanced')) {
      this.profile.financial_priority = extractionResults.financial_priority.value;
      this.profile.financial_priority_confirmed = true;
      anyUpdates = true;
    }
    if (extractionResults.home_horizon && (extractionResults.home_horizon.value === 'long_term' || extractionResults.home_horizon.value === 'short_term')) {
      this.profile.home_horizon = extractionResults.home_horizon.value;
      this.profile.home_horizon_confirmed = true;
      anyUpdates = true;
    }

    if (anyUpdates) {
      this.advanceWorkflow();
    }
  }

  public handleOtpSubmission(code: string): void {
    if (this.currentPendingField !== 'otp_verification') {
      console.warn(`[context-manager] Received OTP submission but current field is ${this.currentPendingField}. Ignoring.`);
      return;
    }

    const expectedCode = (this.profile as any)._pendingOtp ?? '123456';
    if (code === expectedCode) {
      console.log('[context-manager] ✅ OTP verified via modal submission!');
      this.profile.otp_verified = true;
      this.advanceWorkflow();
      this.syncToDatabase().catch(err => console.error('[context-manager] DB sync failed on OTP submit:', err));
    } else {
      console.log(`[context-manager] ❌ OTP modal verification failed. Expected ${expectedCode}, got ${code}`);
    }
  }

  private async runStage3AExtraction(text: string): Promise<void> {
    const lastQuestion = this.getLastAssistantUtterance();

    // ── v8.7 OTP Gate: Step 1 — collect email (and mobile if given in same turn) ──
    if (this.currentPendingField === 'contact_email') {
      const results = await extractMultipleFields(text, lastQuestion, [
        {
          name: 'contact_email',
          description: "borrower's email address for secure login",
          expectedType: 'string',
          additionalInstructions: 'Extract the email address mentioned (e.g. "david@example.com"). Return string or null.',
        },
        {
          name: 'contact_mobile',
          description: "borrower's mobile phone number",
          expectedType: 'string',
          additionalInstructions: 'Extract the mobile or phone number if mentioned. Accept any format including spaces, dashes, dots, or country codes (e.g. "+1 234 567 8901", "555-0199", "+12345 6789", "1234567890"). Return the number as spoken/provided. Return null only if no number is mentioned.',
        },
      ]);

      if (results.contact_email?.value) {
        this.profile.contact_email = results.contact_email.value as string;
        console.log(`[context-manager]: Captured contact email: ${this.profile.contact_email}`);
      }
      if (results.contact_mobile?.value) {
        this.profile.contact_mobile = results.contact_mobile.value as string;
        console.log(`[context-manager]: Captured contact mobile: ${this.profile.contact_mobile}`);
      }

      if (this.profile.contact_email) {
        // Generate and "send" a mock OTP
        const mockOtp = '123456';
        (this.profile as any)._pendingOtp = mockOtp;
        console.log(`[OTP-Service]: Generated mock OTP code: ${mockOtp}`);
        console.log(`[OTP-Service]: OTP sent to ${this.profile.contact_email} and ${this.profile.contact_mobile || 'mobile not yet provided'}`);
        this.advanceWorkflow();
      }
      return;
    }

    // ── v8.7 OTP Gate: Step 2 — collect mobile (if not already captured above) ──
    if (this.currentPendingField === 'contact_mobile') {
      const res = await extractProfileField(
        text,
        lastQuestion,
        'contact_mobile',
        "borrower's mobile phone number",
        'string',
        'Extract the mobile or phone number. Accept any format including spaces, dashes, dots, or country codes (e.g. "+1 234 567 8901", "555-0199", "+12345 6789"). Return null only if no number mentioned.'
      );
      if (res.value) {
        this.profile.contact_mobile = res.value as string;
        console.log(`[context-manager]: Captured contact mobile: ${this.profile.contact_mobile}`);
        this.advanceWorkflow();
      }
      return;
    }

    // ── v8.7 OTP Gate: Step 3 — verify the OTP code ──
    if (this.currentPendingField === 'otp_verification') {
      const res = await extractProfileField(
        text,
        lastQuestion,
        'otp_code',
        'the 6-digit one-time verification code the borrower read back',
        'string',
        'Extract the numeric OTP code the borrower mentioned (e.g. "123456"). Return string or null.'
      );

      const enteredCode = (res.value as string | null)?.replace(/\s+/g, '') ?? null;
      const expectedCode = (this.profile as any)._pendingOtp ?? '123456';

      // Fallback regex extraction if LLM extraction returned null or non-matching string
      let finalCode = enteredCode;
      if (!finalCode || finalCode !== expectedCode) {
        const rawDigitsMatch = text.replace(/\D/g, '');
        if (rawDigitsMatch.length === 6) {
          finalCode = rawDigitsMatch;
        } else {
          const digitsInText = text.match(/\b\d{6}\b/);
          if (digitsInText) {
            finalCode = digitsInText[0];
          }
        }
      }

      if (finalCode === expectedCode) {
        this.profile.otp_verified = true;
        this.profile.session_login_complete = true;
        this.profile.contact_on_file = true;
        console.log('[OTP-Gate]: OTP verified successfully (Code: 123456). Secure login complete.');
        this.advanceWorkflow();
      } else {
        console.log(`[OTP-Gate]: OTP mismatch. Entered: ${finalCode || text}, Expected: ${expectedCode}. Re-prompting.`);
        // Stay on otp_verification — LLM will re-ask
      }
      return;
    }

    // ── legal_name (still used for prefill display during walkthrough) ──
    if (this.currentPendingField === 'legal_name') {
      const res = await extractProfileField(
        text,
        lastQuestion,
        'legal_name',
        "borrower's full legal name",
        'string',
        'Extract the full legal name of the borrower (first and last name, e.g. "John Doe"). If not found, return null.'
      );
      if (res.value) {
        this.profile.legal_name = res.value as string;
        this.profile.legal_name_confirmed = true;
        this.advanceWorkflow();
      }
      return;
    }

    if (this.currentPendingField === 'physical_address') {
      const res = await extractProfileField(
        text,
        lastQuestion,
        'physical_address',
        "borrower's physical address",
        'string',
        'Extract the full physical address of the borrower including city, state, or zip code if mentioned. If not found, return null.'
      );
      if (res.value) {
        this.profile.physical_address = res.value as string;
        this.profile.physical_address_confirmed = true;
        this.advanceWorkflow();
      }
      return;
    }

    if (this.currentPendingField === 'soft_pull_authorization') {
      const decision = await classifyConfirmation(text, lastQuestion, 'soft_pull_consent', 'Do you authorize the soft credit inquiry on that basis?');
      if (decision === 'yes') {
        this.profile.soft_pull_consent = 'accepted';
        this.profile.prefilled_fields_confirmed = {};
        this.advanceWorkflow();
      } else if (decision === 'no') {
        this.profile.soft_pull_consent = 'declined';
        this.advanceWorkflow();
      }
    } else if (
      this.currentPendingField === 'prefill_name_address' ||
      this.currentPendingField === 'prefill_employer' ||
      this.currentPendingField === 'prefill_accounts' ||
      this.currentPendingField === 'prefill_credit_range'
    ) {
      const step = this.currentPendingField;

      // 1. Build list of correction fields to extract in parallel
      const correctionFields: FieldToExtract[] = [];
      if (step === 'prefill_employer') {
        correctionFields.push({
          name: 'employer_correction',
          description: 'corrected employer name',
          expectedType: 'string',
          additionalInstructions: 'Extract the corrected employer name mentioned by the user (e.g. "Hexler Tech"). If not found, return null.'
        });
      } else if (step === 'prefill_name_address') {
        correctionFields.push({
          name: 'name_correction',
          description: 'corrected borrower name',
          expectedType: 'string',
          additionalInstructions: 'Extract the corrected borrower full name. If not found, return null.'
        }, {
          name: 'address_correction',
          description: 'corrected physical address',
          expectedType: 'string',
          additionalInstructions: 'Extract the corrected physical address. If not found, return null.'
        });
      } else if (step === 'prefill_credit_range') {
        correctionFields.push({
          name: 'credit_correction',
          description: 'corrected credit score or range',
          expectedType: 'string',
          additionalInstructions: 'Extract the corrected credit score or range. If not found, return null.'
        });
      }

      // 2. Parallel LLM execution: run decision classification and correction extraction concurrently!
      const decisionPromise = classifyConfirmation(text, lastQuestion, step, 'Does that look right or is anything out of date?');
      const extractionPromise = correctionFields.length > 0
        ? extractMultipleFields(text, lastQuestion, correctionFields)
        : Promise.resolve(null);

      const [decision, extractionResults] = await Promise.all([decisionPromise, extractionPromise]);

      const confirmed = this.profile.prefilled_fields_confirmed || {};

      if (decision === 'no' && extractionResults) {
        if (step === 'prefill_employer' && extractionResults.employer_correction?.value) {
          this.profile.employer = extractionResults.employer_correction.value as string;
          console.log(`[context-manager]: Corrected employer to ${extractionResults.employer_correction.value}`);
        } else if (step === 'prefill_name_address') {
          if (extractionResults.name_correction?.value) {
            this.profile.borrower_name = extractionResults.name_correction.value as string;
            this.profile.legal_name = extractionResults.name_correction.value as string;
            console.log(`[context-manager]: Corrected borrower name to ${extractionResults.name_correction.value}`);
          }
          if (extractionResults.address_correction?.value) {
            this.profile.physical_address = extractionResults.address_correction.value as string;
            console.log(`[context-manager]: Corrected physical address to ${extractionResults.address_correction.value}`);
          }
        } else if (step === 'prefill_credit_range' && extractionResults.credit_correction?.value) {
          this.profile.credit_range = sanitizeCreditScore(extractionResults.credit_correction.value as string);
          console.log(`[context-manager]: Corrected credit range to ${this.profile.credit_range}`);
        }
      }

      if (step === 'prefill_name_address') {
        confirmed.name_address = true;
      } else if (step === 'prefill_employer') {
        confirmed.employer = true;
      } else if (step === 'prefill_accounts') {
        confirmed.accounts = true;
      } else if (step === 'prefill_credit_range') {
        confirmed.credit_range = true;
      }
      this.profile.prefilled_fields_confirmed = confirmed;
      this.advanceWorkflow();
    }
  }

  private async runStage3BExtraction(text: string): Promise<void> {
    const lastQuestion = this.getLastAssistantUtterance();
    const field = this.currentPendingField;

    // ── Single-field-per-turn extraction ──────────────────────────────────────
    // Each user turn extracts at most ONE field, then advances workflow and stops.
    // This prevents compounding questions (confirming + asking next in same response).

    if (field === 'submit_confirmation') {
      const decision = await classifyConfirmation(text, lastQuestion, 'ready_to_submit', 'Ready to submit your application?');
      if (decision === 'yes') {
        this.profile.ready_to_submit = true;
        this.advanceWorkflow();
      }
      return;
    }

    if (field === 'marital_status') {
      const res = await extractProfileField(
        text, lastQuestion, 'marital_status',
        'marital status (Married, Separated, or Unmarried)', 'string',
        'Extract marital status. Options are "married", "separated", or "unmarried". If single, divorced, or widowed, return "unmarried". If they decline, skip, or say they don\'t know, return null.'
      );
      if (res.value) {
        this.profile.marital_status = res.value as any;
        this.profile.marital_status_confirmed = true;
        this.advanceWorkflow();
      }
      return;
    }

    if (field === 'dependents') {
      const res = await extractProfileField(
        text, lastQuestion, 'dependents',
        'number of dependents', 'number',
        'Extract the number of dependents (children or others they support financially). If they say none, zero, or no dependents, return 0. If decline or skip, return null.'
      );
      if (res.value !== null) {
        this.profile.dependents = res.value as number;
        this.profile.dependents_confirmed = true;
        this.advanceWorkflow();
      }
      return;
    }

    if (field === 'employment_details') {
      // Employment collects up to 3 sub-fields in one extraction since the user
      // typically provides title, years, and self-employment status together.
      const fieldsToExtract: FieldToExtract[] = [];
      if (this.profile.employment_position === undefined) {
        fieldsToExtract.push({
          name: 'employment_position',
          description: 'current job title or position',
          expectedType: 'string',
          additionalInstructions: 'Extract their job title or position (e.g. software engineer, manager). If not found, return null.',
        });
      }
      if (this.profile.employment_years === undefined) {
        fieldsToExtract.push({
          name: 'employment_years',
          description: 'number of years employed',
          expectedType: 'number',
          additionalInstructions: 'Extract the number of years they have worked at this job. If less than a year, return 0. If not found, return null.',
        });
      }
      if (this.profile.self_employed === undefined) {
        fieldsToExtract.push({
          name: 'self_employed',
          description: 'whether the user is self-employed',
          expectedType: 'string',
          additionalInstructions: 'Extract whether they are self-employed. If they explicitly mention self-employed, independent contractor, own business, return "yes". If they say no, W-2, work for a company, return "no". If not found, return null.',
        });
      }

      if (fieldsToExtract.length === 0) {
        this.profile.employment_confirmed = true;
        this.advanceWorkflow();
        return;
      }

      const extractionResults = await extractMultipleFields(text, lastQuestion, fieldsToExtract);
      let anyUpdates = false;

      const title = extractionResults.employment_position?.value;
      const years = extractionResults.employment_years?.value;
      const self = extractionResults.self_employed?.value;

      if (title !== undefined && title !== null) {
        this.profile.employment_position = title as string;
        anyUpdates = true;
      }
      if (years !== undefined && years !== null) {
        this.profile.employment_years = years as number;
        anyUpdates = true;
      }
      if (self !== undefined && self !== null) {
        this.profile.self_employed = self === 'yes';
        anyUpdates = true;
      }

      if (
        this.profile.employment_position !== undefined &&
        this.profile.employment_years !== undefined &&
        this.profile.self_employed !== undefined
      ) {
        this.profile.employment_confirmed = true;
      }

      if (anyUpdates) {
        this.advanceWorkflow();
      }
      return;
    }

    if (field === 'checking_savings') {
      const res = await extractProfileField(
        text, lastQuestion, 'checking_savings_balance',
        'checking and savings account balance', 'number',
        'Extract the total cash balance in their checking and savings accounts. If skip, return null.'
      );
      if (res.value !== null) {
        this.profile.checking_savings_balance = res.value as number;
        this.profile.checking_savings_confirmed = true;
        this.advanceWorkflow();
      }
      return;
    }

    if (field === 'declarations') {
      // Declarations: bankruptcy and foreclosure are asked together as one question.
      const fieldsToExtract: FieldToExtract[] = [];
      if (this.profile.declarations_bankruptcy === undefined) {
        fieldsToExtract.push({
          name: 'declarations_bankruptcy',
          description: 'bankruptcy declaration in past 7 years',
          expectedType: 'string',
          additionalInstructions: 'Extract whether they had a bankruptcy in the past 7 years. Return "yes" if yes, "no" if no. If they say "no", "never", "none", or deny having these declaration issues, return "no". If not found, return null.',
        });
      }
      if (this.profile.declarations_foreclosure === undefined) {
        fieldsToExtract.push({
          name: 'declarations_foreclosure',
          description: 'foreclosure declaration in past 7 years',
          expectedType: 'string',
          additionalInstructions: 'Extract whether they had a foreclosure, short sale, or judgment in the past 7 years. Return "yes" if yes, "no" if no. If they say "no", "never", "none", or deny having these declaration issues, return "no". If they only deny bankruptcy, also return "no" (as they are answering the joint declarations question). If not found, return null.',
        });
      }

      if (fieldsToExtract.length === 0) {
        this.profile.declarations_confirmed = true;
        this.advanceWorkflow();
        return;
      }

      const extractionResults = await extractMultipleFields(text, lastQuestion, fieldsToExtract);
      let anyUpdates = false;

      const bankruptcy = extractionResults.declarations_bankruptcy?.value;
      const foreclosure = extractionResults.declarations_foreclosure?.value;

      if (bankruptcy !== undefined && bankruptcy !== null) {
        this.profile.declarations_bankruptcy = bankruptcy === 'yes';
        anyUpdates = true;
      }
      if (foreclosure !== undefined && foreclosure !== null) {
        this.profile.declarations_foreclosure = foreclosure === 'yes';
        anyUpdates = true;
      }

      if (
        this.profile.declarations_bankruptcy !== undefined &&
        this.profile.declarations_foreclosure !== undefined
      ) {
        this.profile.declarations_confirmed = true;
      }

      if (anyUpdates) {
        this.advanceWorkflow();
      }
      return;
    }

    // Fallback: if no matching field handler, try to advance
    this.advanceWorkflow();
  }

  private async runStage4Extraction(text: string): Promise<void> {
    const lastQuestion = this.getLastAssistantUtterance();
    const field = this.currentPendingField;

    if (field === 'checklist_acknowledgement') {
      const decision = await classifyConfirmation(text, lastQuestion, 'checklist_discussed', 'Do you understand the list and have these documents available?');
      if (decision === 'yes') {
        this.profile.checklist_discussed = true;
        this.advanceWorkflow();
      }
    }
  }

  private runUnderwritingRules(): 'approve' | 'approve_with_conditions' | 'refer' | 'suspend' | 'timeout' {
    const text = this.turnLog[this.turnLog.length - 1]?.text?.toLowerCase() ?? '';
    if (text.includes('timeout') || text.includes('system delay') || text.includes('system timeout')) {
      return 'timeout';
    }

    const income = (this.profile.gross_annual_income ?? 0) / 12;
    const debt = this.profile.monthly_debt ?? 0;
    const targetPrice = this.profile.target_price ?? 0;
    const downPayment = this.profile.down_payment ?? 0;

    let creditScore = 700; // Default
    if (this.profile.credit_range) {
      const match = this.profile.credit_range.match(/\d+/);
      if (match) {
        creditScore = parseInt(match[0], 10);
      }
    }

    const loanAmount = targetPrice - downPayment;
    const ltv = targetPrice > 0 ? (loanAmount / targetPrice) * 100 : 0;
    const dti = income > 0 ? (debt / income) * 100 : 0;

    const hasDerogatory =
      this.profile.declarations_bankruptcy === true ||
      this.profile.declarations_foreclosure === true;

    console.log(`[underwriting] creditScore=${creditScore} dti=${dti.toFixed(1)}% ltv=${ltv.toFixed(1)}% derogatory=${hasDerogatory}`);

    // ── SUSPEND (Refer/Ineligible) ───────────────────────────────────────────
    // Very low credit, extreme DTI, or recent derogatory combined with subprime credit.
    // Automated system cannot process — requires in-depth advisor intervention.
    if (creditScore < 580 || dti > 55 || (hasDerogatory && creditScore < 620)) {
      console.log('[underwriting] Decision: SUSPEND');
      return 'suspend';
    }

    // ── REFER (Refer/Eligible — Manual Review) ───────────────────────────────
    // Acceptable borrower but automated engine flags need a human review.
    // NOT a denial — very common for borderline profiles.
    if (hasDerogatory || dti > 45 || ltv > 97 || creditScore < 620) {
      console.log('[underwriting] Decision: REFER');
      return 'refer';
    }

    // ── APPROVE WITH CONDITIONS ──────────────────────────────────────────────
    // Solid borrower with minor risk flags — standard document verification needed.
    if (creditScore < 680 || dti > 36 || ltv > 95) {
      console.log('[underwriting] Decision: APPROVE_WITH_CONDITIONS');
      return 'approve_with_conditions';
    }

    // ── CLEAN APPROVE (Approve/Eligible) ────────────────────────────────────
    // Strong profile across all dimensions.
    console.log('[underwriting] Decision: APPROVE');
    return 'approve';
  }

  async onAgentTurn(text: string): Promise<void> {
    const trimmed = text.trim();
    if (!trimmed) return;
    this.turnLog.push({ role: 'assistant', text: trimmed, timestamp: Date.now() });
    this.profile.bridge_to_say = null;
    this.lastProcessedInput = null;
    
    // ── DATABASE PERSISTENCE ────────────────────────────────────────────────
    // Save assistant turn to database
    await this.saveConversationTurn('assistant', trimmed);
    await this.syncToDatabase();
  }

  private getLastAssistantUtterance(): string | null {
    for (let i = this.turnLog.length - 1; i >= 0; i--) {
      const entry = this.turnLog[i];
      if (entry && entry.role === 'assistant') {
        return entry.text;
      }
    }
    return null;
  }

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  // Stage 1 extraction
  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

  private async runStage1Extraction(text: string): Promise<void> {
    const lastQuestion = this.getLastAssistantUtterance();

    // Always send the FULL static set of Stage 1 fields — never conditionally
    // remove confirmed ones. This keeps the system prompt prefix byte-identical
    // across every turn so Cerebras prefix cache hits after the first call.
    // The model returns null for fields it can't find in the current input.
    const fieldsToExtract: FieldToExtract[] = [
      {
        name: 'borrower_name',
        description: "The user's first/given name or full name",
        expectedType: 'string',
        additionalInstructions: 'Extract the first name or name the user wants to be called. If they say "my name is Muhammad" extract "Muhammad". If they just say "Muhammad", extract "Muhammad". If not found, return null.',
      },
      {
        name: 'mortgage_goal',
        description: 'Whether they want to purchase/buy a new home, refinance an existing mortgage, or explore a home equity option',
        expectedType: 'string',
        additionalInstructions: 'Extract "purchase", "refinance", or "equity" (all lowercase). If they say they want to buy, purchase, or acquire a home or property, return "purchase". If they want to refinance, lower their rate, or change their existing loan terms, return "refinance". If they want a home equity loan or HELOC, return "equity". Return null if not mentioned at all.',
      },
      {
        name: 'occupancy',
        description: 'Whether they are looking for a primary residence, second home, or investment property',
        expectedType: 'string',
        additionalInstructions: 'Extract "primary", "secondary", or "investment". If they say "for myself and family to live in", "home for myself", etc., extract "primary". If they say "rental", "investment", etc., extract "investment". If not found, return null.',
      },
      {
        name: 'existing_relationship',
        description: 'Whether they have worked with this lending institution before',
        expectedType: 'string',
        additionalInstructions: 'Extract "yes" or "no". If they say they have worked with us before or have an existing mortgage, return "yes". If they say it is their first time, return "no". If they say they don\'t know or are unsure, return "no". If not found, return null.',
      },
      {
        name: 'timeline',
        description: 'When they plan to purchase or refinance (e.g. in 3 months, next year, ASAP, etc.)',
        expectedType: 'string',
        additionalInstructions: 'Extract the user timeline. If they indicate a timeline, extract a concise summary (e.g. "within 3 months", "ASAP", "next year"). If they say they are unsure, undecided, don\'t know, or decline to specify, return "unsure" or "undecided". If not mentioned at all, return null.',
      },
      {
        name: 'co_borrower',
        description: 'Whether anyone else will be applying with them on the loan',
        expectedType: 'string',
        additionalInstructions: 'Extract "yes" or "no". If they mention a spouse, partner, or family member applying with them, return "yes". If they say "no", "just me", "myself alone", "I will not be including", "applying individually", "do not want to include", or express any intention to apply alone, return "no". If they say they don\'t know or are unsure, return "no". If not found, return null.',
      },
    ];

    const extractionResults = await extractMultipleFields(text, lastQuestion, fieldsToExtract);
    let anyUpdates = false;

    if (extractionResults.borrower_name && extractionResults.borrower_name.value) {
      this.profile.borrower_name = extractionResults.borrower_name.value as string;
      this.profile.borrower_name_confirmed = true;
      anyUpdates = true;
    }
    const mgRaw = extractionResults.mortgage_goal?.value;
    const mgVal = typeof mgRaw === 'string' ? mgRaw.toLowerCase().trim() : null;
    if (mgVal === 'purchase' || mgVal === 'refinance' || mgVal === 'equity') {
      this.profile.mortgage_goal = mgVal;
      this.profile.mortgage_goal_confirmed = true;
      anyUpdates = true;
    }
    if (extractionResults.occupancy && (extractionResults.occupancy.value === 'primary' || extractionResults.occupancy.value === 'secondary' || extractionResults.occupancy.value === 'investment')) {
      this.profile.occupancy = extractionResults.occupancy.value;
      this.profile.occupancy_confirmed = true;
      anyUpdates = true;
    }
    if (extractionResults.existing_relationship && (extractionResults.existing_relationship.value === 'yes' || extractionResults.existing_relationship.value === 'no')) {
      this.profile.existing_relationship = extractionResults.existing_relationship.value;
      this.profile.existing_relationship_confirmed = true;
      anyUpdates = true;
    }
    if (extractionResults.timeline && extractionResults.timeline.value) {
      this.profile.timeline = extractionResults.timeline.value as string;
      this.profile.timeline_confirmed = true;
      anyUpdates = true;
    }
    if (extractionResults.co_borrower && (extractionResults.co_borrower.value === 'yes' || extractionResults.co_borrower.value === 'no')) {
      this.profile.co_borrower = extractionResults.co_borrower.value;
      this.profile.co_borrower_confirmed = true;
      anyUpdates = true;
    }

    if (anyUpdates) {
      this.advanceWorkflow();
    }
  }

  // ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // Stage 2 extraction — two-phase: extract → await confirm
  // ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  private buildStage2ExtractionFields(): { allFields: FieldToExtract[], pendingIsNumeric: boolean } {
    const allFields: FieldToExtract[] = [];
    const field = this.currentPendingField;

    // Opportunistic categorical fields (always included while unconfirmed)
    if (!this.profile.credit_range_confirmed) {
      allFields.push({
        name: 'credit_range',
        description: 'credit score number or general tier/range',
        expectedType: 'string',
        additionalInstructions: 'Extract the credit score number (e.g. 720) or range/tier (e.g. "Excellent", "680-700"). Do NOT include dollar signs or extra thousand zeroes. Credit scores are 3-digit numbers between 300 and 850. If STT transcribed "$710000" or "$710,000" or "710000", extract 710. If they decline, skip, or say they don\'t know, set "declined" to true. If not mentioned, return null.',
      });
    }
    const isRef = this.profile.mortgage_goal === 'refinance';

    if (!isRef && !this.profile.rent_own_confirmed) {
      allFields.push({
        name: 'rent_own',
        description: 'Whether they rent, own, or own and plan to sell their current home',
        expectedType: 'string',
        additionalInstructions: 'Extract "rent", "own", or "own_selling". If they own and plan to sell, return "own_selling". If they own but do not mention selling, return "own". If they rent, return "rent". If not found, return null.',
      });
    }
    if (!isRef && !this.profile.realtor_status_confirmed) {
      allFields.push({
        name: 'realtor_status',
        description: 'Whether they have connected with a real estate agent',
        expectedType: 'string',
        additionalInstructions: 'Extract "yes" or "no". If they have an agent/realtor, return "yes". If not, return "no". If not found, return null.',
      });
    }
    if (isRef && !this.profile.refinance_type_confirmed) {
      allFields.push({
        name: 'refinance_type',
        description: 'Whether they want a cash-out refinance or rate and term refinance',
        expectedType: 'string',
        additionalInstructions: 'Extract "cash_out" or "rate_term". If they say cash out, equity draw, take cash out, return "cash_out". If they say rate and term, lower monthly payment, reduce rate, change terms, return "rate_term". If not found, return null.',
      });
    }
    if (!this.profile.property_type_confirmed) {
      allFields.push({
        name: 'property_type',
        description: 'The type of property they are considering',
        expectedType: 'string',
        additionalInstructions: 'Extract "single_family", "condo", "townhome", "multi_family", or "other". If not found, return null.',
      });
      // Also extract zip_code from the same Q42 turn (combined property type + location question)
      if (!this.profile.zip_code) {
        allFields.push({
          name: 'zip_code',
          description: 'The zip code or city/state location the borrower mentioned for their property search',
          expectedType: 'string',
          additionalInstructions: 'Extract a 5-digit zip code if mentioned (e.g. "78209"). If they mention a city/state but no zip, extract in "city, state" format (e.g. "San Antonio, TX"). If no location is mentioned, return null.',
        });
      }
    }
    if (!this.profile.military_rural_confirmed) {
      allFields.push({
        name: 'military_rural',
        description: 'Whether borrower or co-borrower has military service history (active duty, veteran, Reserve/Guard, surviving spouse)',
        expectedType: 'string',
        additionalInstructions: 'Return "military" if borrower confirms military service history. Return "neither" if no military service. Ignore rural property location as that is handled by zip code. If not found, return null.',
      });
    }
    if (!this.profile.job_tenure_type_confirmed) {
      allFields.push({
        name: 'job_tenure_type',
        description: 'How long they have been with their current employer and their income type',
        expectedType: 'string',
        additionalInstructions: 'Extract a concise summary (e.g. "5 years, W2 salary" or "2 years, self-employed"). If not found, return null.',
      });
      allFields.push({
        name: 'employment_years',
        description: 'number of years the borrower has been in their current job or profession',
        expectedType: 'number',
        additionalInstructions: 'Extract the number of years as an integer (e.g. 5 for 5 years, 0 for less than 1 year or months). Return number or null.',
      });
    }

    // Add the specific numeric pending field if not already in the list
    const numericFields = ['gross_annual_income', 'monthly_debt', 'down_payment', 'target_price'];
    const pendingIsNumeric = field !== null && numericFields.includes(field);
    if (pendingIsNumeric && field && !allFields.some(f => f.name === field)) {
      const fieldDesc = field === 'gross_annual_income' ? 'gross annual household income'
                      : field === 'monthly_debt' ? 'total monthly recurring debt obligations (sum all debts)'
                      : field === 'down_payment' ? 'down payment savings amount'
                      : 'target purchase price';
      let instruction = 'Extract the dollar amount as a plain integer (e.g. 80000). If the user declines, skips, or says they don\'t know, set "declined" to true. If not mentioned, return null.';
      if (field === 'down_payment' && this.profile.target_price) {
        instruction += ` If the user specifies a percentage, calculate it against the target price ($${this.profile.target_price}) and return the integer dollar amount.`;
      }
      allFields.push({ name: field, description: fieldDesc, expectedType: 'number', additionalInstructions: instruction });
    }

    // stage2_closing_offer (three-way classification — v8.7 two-path)
    if (field === 'stage2_closing_offer' && !allFields.some(f => f.name === 'stage2_closing_offer')) {
      allFields.push({
        name: 'stage2_closing_offer',
        description: 'which path the borrower has chosen: soft credit review (Path A) or explore first without credit review (Path B)',
        expectedType: 'string',
        additionalInstructions:
          'Classify the borrower response to a two-path affordability offer. ' +
          'Path A = soft credit review. Path B = build summary without review. ' +
          'Extract "soft_pull" (Path A) for: "yes", "sure", "okay", "let\'s do it", "go ahead", ' +
          '"sounds good", "proceed", "run it", "run the review", "eligibility", "eligibility review", ' +
          '"soft credit", "credit review", "the review", "first option", "most complete option", ' +
          '"I authorize", "I authorized", "I consent", "I give consent", "authorized", "that one". ' +
          'Extract "explore_first" (Path B) for: "affordability summary", "the summary", ' +
          '"I would like the affordability summary", "build my summary", "build from what I shared", ' +
          '"explore first", "stated mode", "second option", "without the review", "skip the review", ' +
          '"no review", "not yet", "no", "not right now", "I would rather not". ' +
          'Extract "explain" if borrower asks what the credit review or soft pull involves. ' +
          'Return null if completely off-topic (wants a loan officer, asks about rates or programs). ' +
          'KEY: "I would like the affordability summary" = explore_first. "Licensed loan officer" = null. ' +
          'Prefer "soft_pull" over null when affirmation is ambiguous.',
      });
    }

    return { allFields, pendingIsNumeric };
  }

  private applyStage2ExtractionResults(results: any, pendingIsNumeric: boolean, text: string = ''): void {
    const field = this.currentPendingField;
    let anyUpdates = false;

    // Process categorical fields
    if (results.credit_range?.value && !this.profile.credit_range_confirmed) {
      const sanitizedScore = sanitizeCreditScore(results.credit_range.value);
      this.profile.credit_range = sanitizedScore;
      this.profile.credit_range_confirmed = true;
      anyUpdates = true;
      console.log(`[context-manager] Stage2: credit_range=${sanitizedScore} (raw: ${results.credit_range.value})`);
    } else if (results.credit_range?.declined && !this.profile.credit_range_confirmed) {
      this.profile.credit_range = null;
      this.profile.credit_range_confirmed = true;
      anyUpdates = true;
    }

    const rown = results.rent_own?.value;
    if ((rown === 'rent' || rown === 'own' || rown === 'own_selling') && !this.profile.rent_own_confirmed) {
      this.profile.rent_own = rown;
      this.profile.rent_own_confirmed = true;
      anyUpdates = true;
      console.log(`[context-manager] Stage2: rent_own=${rown}`);
    }

    const rs = results.realtor_status?.value;
    if ((rs === 'yes' || rs === 'no') && !this.profile.realtor_status_confirmed) {
      this.profile.realtor_status = rs;
      this.profile.realtor_status_confirmed = true;
      anyUpdates = true;
      console.log(`[context-manager] Stage2: realtor_status=${rs}`);
    }

    const rt = results.refinance_type?.value;
    if ((rt === 'cash_out' || rt === 'rate_term') && !this.profile.refinance_type_confirmed) {
      this.profile.refinance_type = rt;
      this.profile.refinance_type_confirmed = true;
      anyUpdates = true;
      console.log(`[context-manager] Stage2: refinance_type=${rt}`);
    }

    const pt = results.property_type?.value;
    if ((pt === 'single_family' || pt === 'condo' || pt === 'townhome' || pt === 'multi_family' || pt === 'other') && !this.profile.property_type_confirmed) {
      this.profile.property_type = pt;
      this.profile.property_type_confirmed = true;
      anyUpdates = true;

      // Extract zip/city from Q42 response for property tax and system-side USDA eligibility check
      const { lookupZipData } = require('../utils/zip-lookup.js');
      const zipData = lookupZipData(text);
      if (zipData.zip) {
        this.profile.zip_code = zipData.zip;
        console.log(`[context-manager] Stage2: extracted zip_code=${zipData.zip}, taxRate=${zipData.propertyTaxRate}`);
      }
      if (zipData.isUsdaEligible && !this.profile.military_rural) {
        this.profile.military_rural = 'rural';
        console.log(`[context-manager] Stage2: system-side USDA eligibility determined for area: ${zipData.zip || text}`);
      }
      console.log(`[context-manager] Stage2: property_type=${pt}`);
    }

    // Also apply LLM-extracted zip_code from Q42 combined question
    const extractedZip = results.zip_code?.value;
    if (extractedZip && !this.profile.zip_code) {
      this.profile.zip_code = String(extractedZip);
      console.log(`[context-manager] Stage2: LLM-extracted zip_code=${this.profile.zip_code}`);
    }

    const mr = results.military_rural?.value;
    if ((mr === 'military' || mr === 'rural' || mr === 'both' || mr === 'neither') && !this.profile.military_rural_confirmed) {
      this.profile.military_rural = mr;
      this.profile.military_rural_confirmed = true;
      anyUpdates = true;
      console.log(`[context-manager] Stage2: military_rural=${mr}`);
    }

    if (results.job_tenure_type?.value && !this.profile.job_tenure_type_confirmed) {
      const jt = String(results.job_tenure_type.value);
      this.profile.job_tenure_type = jt;
      this.profile.job_tenure_type_confirmed = true;
      const jtLower = jt.toLowerCase();
      if (jtLower.includes('self-employed') || jtLower.includes('independent contractor') || jtLower.includes('own business')) {
        this.profile.self_employed = true;
      } else if (jtLower.includes('w2') || jtLower.includes('salary') || jtLower.includes('w-2')) {
        this.profile.self_employed = false;
      }
      // Pre-populate employment_years from job_tenure_type to avoid re-asking in Stage 3B.
      if (this.profile.employment_years === undefined) {
        if (results.employment_years?.value !== undefined && results.employment_years?.value !== null) {
          this.profile.employment_years = Number(results.employment_years.value);
          console.log(`[context-manager] Stage2: pre-populated employment_years=${this.profile.employment_years} via LLM extraction`);
        }
      }
      anyUpdates = true;
      console.log(`[context-manager] Stage2: job_tenure_type=${jt}`);
    }

    // Process numeric pending field
    if (pendingIsNumeric && field) {
      const numResult = results[field];
      if (numResult?.declined) {
        this.commitStage2Value(field, null, true);
        anyUpdates = true;
      } else if (numResult?.value !== null && numResult?.value !== undefined) {
        const rawValue = `$${(numResult.value as number).toLocaleString()}`;
        console.log(`[context-manager] Stage2: extracted and committing ${field}=${numResult.value} directly`);
        this.commitStage2Value(field, rawValue, false);
        anyUpdates = true;
      }
    }

    // Process stage2_closing_offer (v8.7 two-path routing via LLM intent classification)
    if (field === 'stage2_closing_offer') {
      const offerVal = results.stage2_closing_offer?.value;

      if (offerVal === 'soft_pull') {
        // Path A: OTP gate → soft pull → prefill → Stage 2.5 Verified
        this.activeStage = '3A';
        this.currentPendingField = 'contact_email';
        console.log('[context-manager]: Path A chosen via LLM — Stage 2 closing offer accepted. Transitioning to STAGE 3A OTP gate (contact_email)!');
        return;
      } else if (offerVal === 'explain') {
        console.log('[context-manager]: stage2_closing_offer explanation requested via LLM.');
        (this.profile as any).last_extracted_offer_val = 'explain';
        return;
      } else if (offerVal === 'explore_first') {
        // Path B: Immediate Stage 2.5 in Stated-Data mode — explicit explore_first choice
        this.activeStage = '2.5';
        this.profile.affordability_mode = 'stated';
        this.profile.affordability_panel_rendered = true;
        this.profile.affordability_purchase_price = this.profile.target_price ?? 350000;
        this.profile.affordability_down_payment = this.profile.down_payment ?? 70000;
        if (!this.profile.target_price) this.profile.target_price = 350000;
        if (!this.profile.down_payment) this.profile.down_payment = 70000;
        this.currentPendingField = 'affordability_panel_active';
        console.log('[context-manager]: Path B chosen via LLM — Stated-Data Mode. Transitioning directly to Stage 2.5 (Affordability Panel)!');
        return;
      } else {
        // null — no clear choice extracted. Stay on stage2_closing_offer and wait for explicit response.
        console.log('[context-manager]: stage2_closing_offer — no clear choice extracted (null). Waiting for explicit borrower choice.');
        return;
      }
    }

    if (anyUpdates) {
      this.advanceWorkflow();
    }
  }

  private async runStage2Extraction(text: string): Promise<void> {
    const { allFields, pendingIsNumeric } = this.buildStage2ExtractionFields();

    if (allFields.length === 0) {
      this.advanceWorkflow();
      return;
    }

    const lastQuestion = this.getLastAssistantUtterance();
    const results = await extractMultipleFields(text, lastQuestion, allFields);
    this.applyStage2ExtractionResults(results, pendingIsNumeric, text);
  }
  private async handleStage2Confirmation(text: string): Promise<void> {
    const field = this.profile.pending_confirm_field!;
    const rawValue = this.profile.pending_confirm_value!;
    const lastQuestion = this.getLastAssistantUtterance();

    const { allFields, pendingIsNumeric } = this.buildStage2ExtractionFields();

    // ─── Parallel LLM Calls Execution ───
    const decisionPromise = classifyConfirmation(text, lastQuestion, field, rawValue);
    const extractionPromise = allFields.length > 0
      ? extractMultipleFields(text, lastQuestion, allFields)
      : Promise.resolve(null);

    const [decision, extractionResults] = await Promise.all([decisionPromise, extractionPromise]);

    if (decision === 'yes') {
      console.log(`[context-manager] Stage2: ${field} confirmed -> ${rawValue}`);
      this.commitStage2Value(field, rawValue, false);
      if (extractionResults) {
        // Remove the pending field from the extraction results to prevent double-committing/overwriting
        if (field && extractionResults[field]) {
          delete extractionResults[field];
        }
        this.applyStage2ExtractionResults(extractionResults, false, text);
      }
    } else if (decision === 'no') {
      console.log(`[context-manager] Stage2: ${field} correction incoming -> resetting pending`);
      this.profile.pending_confirm_field = null;
      this.profile.pending_confirm_value = null;
      if (extractionResults) {
        this.applyStage2ExtractionResults(extractionResults, pendingIsNumeric, text);
      }
    }
  }

  private commitStage2Value(
    field: string,
    rawValue: string | null,
    declined: boolean,
  ): void {
    this.profile.pending_confirm_field = null;
    this.profile.pending_confirm_value = null;

    const numVal = rawValue ? this.parseDollarString(rawValue) : null;

    if (field === 'gross_annual_income') {
      this.profile.gross_annual_income = declined ? null : numVal;
      this.profile.gross_annual_income_confirmed = true;
    } else if (field === 'monthly_debt') {
      this.profile.monthly_debt = declined ? null : numVal;
      this.profile.monthly_debt_confirmed = true;
    } else if (field === 'down_payment') {
      this.profile.down_payment = declined ? null : numVal;
      this.profile.down_payment_confirmed = true;
    } else if (field === 'target_price') {
      this.profile.target_price = declined ? null : numVal;
      this.profile.target_price_confirmed = true;
    }

    this.advanceWorkflow();
  }

  private parseDollarString(s: string): number | null {
    const cleaned = s.replace(/[^\d.]/g, '');
    const n = parseFloat(cleaned);
    return isNaN(n) ? null : Math.round(n);
  }


  private fieldLabel(field: string): string {
    const labels: Record<string, string> = {
      gross_annual_income: 'gross annual household income',
      monthly_debt: 'total monthly debt payments',
      credit_range: 'credit score',
      down_payment: 'down payment',
      target_price: 'target purchase price',
    };
    return labels[field] ?? field;
  }

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  // Workflow advancement Ã¢â‚¬â€ backend owns ALL stage/field transitions
  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

  /**
   * Calculate borrower eligibility for loan products.
   */
  private calculateEligibility(): void {
    const products: string[] = [];
    const income = (this.profile.gross_annual_income ?? 0) / 12;
    const debt = this.profile.monthly_debt ?? 0;
    const propertyValue = this.profile.target_price ?? 0;
    const downPayment = this.profile.down_payment ?? 0;

    // Estimate credit score as a number
    let creditScore = 700; // Default
    if (this.profile.credit_range) {
      const match = this.profile.credit_range.match(/\d+/);
      if (match) {
        creditScore = parseInt(match[0], 10);
      } else {
        const rating = this.profile.credit_range.toLowerCase();
        if (rating.includes('excellent')) creditScore = 750;
        else if (rating.includes('good')) creditScore = 700;
        else if (rating.includes('fair')) creditScore = 640;
        else if (rating.includes('poor')) creditScore = 580;
      }
    }

    const loanAmount = propertyValue - downPayment;
    const ltv = propertyValue > 0 ? (loanAmount / propertyValue) * 100 : 0;
    const dti = income > 0 ? (debt / income) * 100 : 0;

    // Rules engine
    // Conventional Loan: Credit Score >= 620, DTI <= 45%, LTV <= 97%
    if (creditScore >= 620 && dti <= 45 && ltv <= 97) {
      products.push('Conventional Fixed Rate (Reliable, popular option with standard requirements)');
    }
    // FHA Loan: Credit Score >= 580, DTI <= 50%, LTV <= 96.5%
    if (creditScore >= 580 && dti <= 50 && ltv <= 96.5) {
      products.push('FHA Loan (Great for buyers with lower credit or smaller down payments)');
    }
    // VA Loan: Military service indicated, DTI <= 50%
    if (
      (this.profile.military_rural === 'military' || this.profile.military_rural === 'both') &&
      dti <= 50
    ) {
      products.push('VA Loan (Zero down payment, no PMI Ã¢â‚¬â€ for eligible service members)');
    }
    // USDA Loan (assume rural or fallback): Credit Score >= 640, DTI <= 41%
    if (
      (this.profile.military_rural === 'rural' || this.profile.military_rural === 'both') &&
      creditScore >= 640 && dti <= 41
    ) {
      products.push('USDA Rural Home Loan (Zero down payment option for qualified properties)');
    }

    if (products.length === 0) {
      products.push('Specialized Assistance Programs (Custom institution-specific portfolio options)');
    }

    this.profile.eligible_products = products;
  }

  /**
   * Advance workflow stage and pending objective sequentially.
   * Called ONLY after a field is confirmed (or declined). LLM never calls this.
   */
  private advanceWorkflow(): void {
    if (this.currentPendingField) {
      this.fieldAttempts[this.currentPendingField] = 0;
    }
    // Ã¢â€â‚¬Ã¢â€â‚¬ Stage 1 Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
    if (this.activeStage === '1') {
      if (!this.profile.borrower_name_confirmed) {
        this.currentPendingField = 'borrower_name';
      } else if (!this.profile.mortgage_goal_confirmed) {
        this.currentPendingField = 'mortgage_goal';
      } else if (!this.profile.occupancy_confirmed) {
        this.currentPendingField = 'occupancy';
      } else if (!this.profile.existing_relationship_confirmed) {
        this.currentPendingField = 'existing_relationship';
      } else if (!this.profile.timeline_confirmed) {
        this.currentPendingField = 'timeline';
      } else if (!this.profile.co_borrower_confirmed) {
        this.currentPendingField = 'co_borrower';
      } else {
        this.activeStage = '2';
        this.currentPendingField = 'gross_annual_income';
        this.profile.bridge_to_say = 'stage1_to_stage2';
        console.log('[context-manager]: Transitioning to STAGE 2 Pre-Qualification Discovery!');
      }
    } else if (this.activeStage === '2') {
      const isRef = this.profile.mortgage_goal === 'refinance';

      if (!this.profile.gross_annual_income_confirmed) {
        this.currentPendingField = 'gross_annual_income';
      } else if (!this.profile.monthly_debt_confirmed) {
        this.currentPendingField = 'monthly_debt';
      } else if (!this.profile.credit_range_confirmed) {
        this.currentPendingField = 'credit_range';
      } else if (isRef && !this.profile.refinance_type_confirmed) {
        this.currentPendingField = 'refinance_type';
      } else if (!isRef && !this.profile.down_payment_confirmed) {
        this.currentPendingField = 'down_payment';
      } else if (!isRef && !this.profile.rent_own_confirmed) {
        this.currentPendingField = 'rent_own';
      } else if (!isRef && !this.profile.realtor_status_confirmed) {
        this.currentPendingField = 'realtor_status';
      } else if (!this.profile.target_price_confirmed) {
        this.currentPendingField = 'target_price';
      } else if (!this.profile.property_type_confirmed) {
        this.currentPendingField = 'property_type';
      } else if (!this.profile.military_rural_confirmed) {
        this.currentPendingField = 'military_rural';
      } else if (!this.profile.job_tenure_type_confirmed) {
        this.currentPendingField = 'job_tenure_type';
      } else {
        this.calculateEligibility();
        this.currentPendingField = 'stage2_closing_offer';
        console.log('[context-manager]: Transitioning to STAGE 2 Closing Transition!');
      }
    } else if (this.activeStage === '3') {
      if (!this.profile.program_comparison_interest_confirmed) {
        this.currentPendingField = 'program_comparison_interest';
      } else if (!this.profile.financial_priority_confirmed) {
        this.currentPendingField = 'financial_priority';
      } else if (!this.profile.home_horizon_confirmed) {
        this.currentPendingField = 'home_horizon';
      } else {
        this.currentPendingField = 'stage3_closing_offer';
        console.log('[context-manager]: Transitioning to STAGE 3 Closing Transition!');
      }
    } else if (this.activeStage === '3A') {
      const confirmed = this.profile.prefilled_fields_confirmed || {};
      // -- v8.7 OTP Gate: contact_email → contact_mobile → otp_verification → soft_pull_authorization → prefill walkthrough --
      if (!this.profile.contact_email) {
        this.currentPendingField = 'contact_email';
      } else if (!this.profile.contact_mobile) {
        this.currentPendingField = 'contact_mobile';
      } else if (!this.profile.otp_verified) {
        this.currentPendingField = 'otp_verification';
      } else if (!this.profile.soft_pull_consent || this.profile.soft_pull_consent === 'pending') {
        // OTP complete — now ask for formal soft pull authorization
        this.currentPendingField = 'soft_pull_authorization';
        if (!this.profile.soft_pull_consent) {
          this.profile.soft_pull_consent = 'pending';
        }
      // -- Post-consent: prefill walkthrough or skip to 3B --
      } else if (this.profile.soft_pull_consent === 'accepted') {
        if (!confirmed.name_address) {
          this.currentPendingField = 'prefill_name_address';
        } else if (!confirmed.employer) {
          this.currentPendingField = 'prefill_employer';
        } else if (!confirmed.accounts) {
          this.currentPendingField = 'prefill_accounts';
        } else if (!confirmed.credit_range) {
          this.currentPendingField = 'prefill_credit_range';
        } else {
          // Finished prefilled walkthrough, transition to Stage 2.5 (Affordability Panel)
          this.activeStage = '2.5';
          this.profile.affordability_mode = 'verified';
          this.currentPendingField = 'affordability_panel_active';
          this.profile.affordability_panel_rendered = true;
          this.profile.affordability_purchase_price = this.profile.target_price ?? null;
          this.profile.affordability_down_payment = this.profile.down_payment ?? null;
          console.log('[context-manager]: Prefills confirmed! Transitioning to STAGE 2.5 Verified Mode (Affordability Panel)!');
        }
      } else if (this.profile.soft_pull_consent === 'declined') {
        // Go to Stage 2.5 for manual scenario exploration
        this.activeStage = '2.5';
        this.currentPendingField = 'affordability_panel_active';
        this.profile.affordability_panel_rendered = true;
        this.profile.affordability_purchase_price = this.profile.target_price ?? null;
        this.profile.affordability_down_payment = this.profile.down_payment ?? null;
        console.log('[context-manager]: Consent declined. Transitioning to STAGE 2.5 (Affordability Panel)!');
      }
    } else if (this.activeStage === '3B') {
      // Auto-confirm employment_details if sub-fields were already populated
      // from Stage 2 job_tenure_type — prevents re-asking questions the borrower
      // already answered during pre-qualification.
      if (
        !this.profile.employment_confirmed &&
        this.profile.self_employed !== undefined &&
        this.profile.employment_years !== undefined
      ) {
        this.profile.employment_confirmed = true;
        if (this.profile.employment_position === undefined) {
          this.profile.employment_position = this.profile.job_tenure_type ?? 'Previously provided';
        }
        console.log('[context-manager]: employment_details auto-confirmed from Stage 2 job_tenure_type data.');
      }

      if (!this.profile.marital_status_confirmed) {
        this.currentPendingField = 'marital_status';
      } else if (!this.profile.dependents_confirmed) {
        this.currentPendingField = 'dependents';
      } else if (!this.profile.employment_confirmed) {
        this.currentPendingField = 'employment_details';
      } else if (!this.profile.checking_savings_confirmed) {
        this.currentPendingField = 'checking_savings';
      } else if (!this.profile.declarations_confirmed) {
        this.currentPendingField = 'declarations';
      } else if (!this.profile.ready_to_submit) {
        this.currentPendingField = 'submit_confirmation';
      } else {
        // Application completed! Immediately calculate underwriting decision and transition to Stage 4
        this.activeStage = '4';
        const decision = this.runUnderwritingRules();
        this.profile.aus_status = decision;
        this.profile.aus_confirmed = true;
        this.currentPendingField = 'checklist_acknowledgement';
        console.log(`[context-manager]: Application completed! AUS decision: ${decision}. Transitioning to STAGE 4!`);
      }
    } else if (this.activeStage === '4') {
      if (!this.profile.checklist_discussed) {
        this.currentPendingField = 'checklist_acknowledgement';
      } else {
        // All Stage 4 completed! Transition to Stage 5 (Escalation compliance)
        this.activeStage = '5';
        this.currentPendingField = null;
        console.log('[context-manager]: Document checklist acknowledged! Transitioning to STAGE 5 (MLO Escalation)!');
      }
    }
  }

  getActiveInstructions(): string {
    return buildSessionPrompt(this.profile, this.currentPendingField, this.activeStage, this.lowConfidence);
  }

  setLowConfidenceFlag(value: boolean): void {
    this.lowConfidence = value;
  }

  /** Called from MetricsCollected Ã¢â‚¬â€ real token count from OpenAI Realtime. */
  onRealtimeInputTokens(inputTokens: number): void {
    if (inputTokens > 0) {
      this.lastInputTokens = inputTokens;
      logContextBudget({
        inputTokens,
        action: inputTokens >= getForceCompactTokenThreshold() ? 'over_latency_threshold' : 'metrics',
      });
    }
  }

  getTurnCount(): number {
    return this.turnCount;
  }

  getConversationSummary(): string | null {
    return this.conversationSummary;
  }

  getLastInputTokens(): number {
    return this.lastInputTokens;
  }

  buildTextMessages(systemPrompt: string): Array<{ role: string; content: string }> {
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: systemPrompt },
    ];

    if (this.conversationSummary) {
      messages.push({
        role: 'system',
        content: `<chat_history_summary>\n${this.conversationSummary}\n</chat_history_summary>`,
      });
    }

    const recent = this.turnLog.slice(-(ailanaConfig.keepRecentTurns * 2));
    for (const entry of recent) {
      messages.push({ role: entry.role, content: entry.text });
    }

    return messages;
  }

  private shouldForceCompactByTokens(): boolean {
    return this.lastInputTokens >= getForceCompactTokenThreshold();
  }

  shouldCompact(): boolean {
    const ageMs = Date.now() - this.lastCompactAt;
    return (
      this.shouldForceCompactByTokens() ||
      this.turnCount >= ailanaConfig.compactEveryNTurns ||
      ageMs >= ailanaConfig.compactEveryMs
    );
  }

  shouldRotateSession(): boolean {
    const ageMs = Date.now() - this.lastRotationAt;
    return (
      this.turnCount >= ailanaConfig.rotateEveryNTurns ||
      ageMs >= ailanaConfig.rotateSessionMs ||
      this.lastInputTokens >= getForceCompactTokenThreshold() * 1.5
    );
  }

  estimateTokensFromChatCtx(chatCtx: llm.ChatContext): number {
    let chars = 0;
    for (const item of chatCtx.items) {
      if (item.type === 'message') {
        chars += (item.textContent ?? '').length;
      }
    }
    return Math.ceil(chars / 4);
  }

  private extractSummaryFromCtx(summarized: llm.ChatContext): void {
    const summaryItem = summarized.items.find(
      (item) =>
        item.type === 'message' &&
        item.role === 'assistant' &&
        item.extra?.is_summary === true,
    );
    if (summaryItem && summaryItem.type === 'message') {
      const raw = summaryItem.textContent ?? '';
      const match = raw.match(/<chat_history_summary>\s*([\s\S]*?)\s*<\/chat_history_summary>/);
      this.conversationSummary = match?.[1]?.trim() ?? raw.trim();
    }
  }

  async maybeCompact(session: voice.AgentSession, agent: voice.Agent, isIdle?: () => boolean): Promise<boolean> {
    if (this.compacting || !this.shouldCompact()) return false;
    return this.compact(session, agent, isIdle);
  }

  async compact(session: voice.AgentSession, agent: voice.Agent, isIdle?: () => boolean): Promise<boolean> {
    if (this.compacting) return false;
    this.compacting = true;

    try {
      const chatCtx = session.chatCtx;
      const itemsBefore = chatCtx.items.length;
      const textTokensBefore = this.estimateTokensFromChatCtx(chatCtx);

      logContextBudget({
        inputTokens: this.lastInputTokens,
        estimatedTextTokens: textTokensBefore,
        itemCount: itemsBefore,
        action: 'compact_start',
      });

      if (
        itemsBefore <= ailanaConfig.keepRecentTurns &&
        !this.shouldForceCompactByTokens()
      ) {
        this.lastCompactAt = Date.now();
        return false;
      }

      const originalItemIds = new Set(chatCtx.items.map(i => i.id));

      const summarized = await chatCtx._summarize(this.summarizationLlm, {
        keepLastTurns: ailanaConfig.keepRecentTurns,
      });

      if (isIdle && !isIdle()) {
        console.log('[context]: Agent is no longer idle after compact summarization. Aborting context update to prevent race conditions.');
        return false;
      }

      const newItems = session.chatCtx.items.filter(i => !originalItemIds.has(i.id));
      if (newItems.length > 0) {
        summarized.items.push(...newItems);
      }

      this.extractSummaryFromCtx(summarized);
      await agent.updateChatCtx(summarized.copy({ excludeHandoff: true }));

      const itemsAfter = summarized.items.length;
      const textTokensAfter = this.estimateTokensFromChatCtx(summarized);

      this.metrics.logCompaction(itemsBefore, itemsAfter);
      this.metrics.logContextSize(itemsAfter, textTokensAfter);
      logContextBudget({
        inputTokens: this.lastInputTokens,
        estimatedTextTokens: textTokensAfter,
        itemCount: itemsAfter,
        action: 'compact_done',
      });

      this.lastCompactAt = Date.now();
      this.turnCount = 0;

      console.log(
        `[context]: Compacted ${itemsBefore}Ã¢â€ â€™${itemsAfter} items, ~${textTokensBefore}Ã¢â€ â€™${textTokensAfter} text tokens (last API input: ${this.lastInputTokens})`,
      );
      return true;
    } catch (err) {
      console.error('[context]: Compaction failed:', err);
      this.lastCompactAt = Date.now();
      this.turnCount = 0;
      return false;
    } finally {
      this.compacting = false;
    }
  }

  async maybeRotate(
    session: voice.AgentSession,
    createAgent: () => voice.Agent,
    isIdle?: () => boolean,
  ): Promise<boolean> {
    if (!this.shouldRotateSession()) return false;
    return this.rotate(session, createAgent, isIdle);
  }

  async rotate(session: voice.AgentSession, createAgent: () => voice.Agent, isIdle?: () => boolean): Promise<boolean> {
    try {
      const chatCtx = session.chatCtx;

      if (chatCtx.items.length > 2) {
        const originalItemIds = new Set(chatCtx.items.map(i => i.id));
        const summarized = await chatCtx._summarize(this.summarizationLlm, {
          keepLastTurns: 2,
        });

        if (isIdle && !isIdle()) {
          console.log('[context]: Agent is no longer idle after rotate summarization. Aborting context update to prevent race conditions.');
          return false;
        }

        const newItems = session.chatCtx.items.filter(i => !originalItemIds.has(i.id));
        if (newItems.length > 0) {
          summarized.items.push(...newItems);
        }

        this.extractSummaryFromCtx(summarized);
        const newAgent = createAgent();
        session.updateAgent(newAgent);
        if ((session as any)._chatCtx) {
          (session as any)._chatCtx.items = (session as any)._chatCtx.items.filter(
              (item: any) => item.type !== 'agent_handoff'
          );
        }
        await newAgent.updateChatCtx(summarized.copy({ excludeHandoff: true }));
      } else {
        session.updateAgent(createAgent());
        if ((session as any)._chatCtx) {
          (session as any)._chatCtx.items = (session as any)._chatCtx.items.filter(
              (item: any) => item.type !== 'agent_handoff'
          );
        }
      }

      this.metrics.logRotation('scheduled');
      logContextBudget({
        inputTokens: this.lastInputTokens,
        itemCount: session.chatCtx.items.length,
        action: 'rotation_done',
      });

      this.lastRotationAt = Date.now();
      this.lastCompactAt = Date.now();
      this.turnCount = 0;
      this.lastInputTokens = 0;

      console.log('[context]: Session rotated (static instructions, summary in chat ctx only)');
      return true;
    } catch (err) {
      console.error('[context]: Session rotation failed:', err);
      this.lastRotationAt = Date.now();
      this.lastCompactAt = Date.now();
      this.turnCount = 0;
      return false;
    }
  }

  private async handleGlobalConfirmation(text: string): Promise<boolean> {
    if (!this.profile.pending_confirm_field || this.profile.pending_confirm_value == null) {
      return false;
    }
    // Only intercept if we are NOT in Stage 2 (Stage 2 handles its own confirmation flow inside runStage2Extraction)
    if (this.activeStage === '2') {
      return false;
    }

    const field = this.profile.pending_confirm_field;
    const rawValue = this.profile.pending_confirm_value;
    const lastQuestion = this.getLastAssistantUtterance();

    const decision = await classifyConfirmation(text, lastQuestion, field, rawValue);
    if (decision === 'yes') {
      console.log(`[context-manager] Global: ${field} confirmed Ã¢â€ â€™ ${rawValue}`);
      this.commitGlobalValue(field, rawValue);
      this.advanceWorkflow();
      return true;
    } else if (decision === 'no') {
      console.log(`[context-manager] Global: ${field} correction incoming Ã¢â‚¬â€ resetting pending`);
      this.profile.pending_confirm_field = null;
      this.profile.pending_confirm_value = null;
      // Agent re-asks the field naturally; no extra Cerebras call needed here.
      return true;
    }
    return false;
  }

  private commitGlobalValue(field: string, rawValue: string): void {
    this.profile.pending_confirm_field = null;
    this.profile.pending_confirm_value = null;

    const isNumeric = ['gross_annual_income', 'monthly_debt', 'down_payment', 'target_price'].includes(field);
    const numVal = isNumeric ? this.parseDollarString(rawValue) : null;

    if (field === 'gross_annual_income') {
      this.profile.gross_annual_income = numVal;
      this.profile.gross_annual_income_confirmed = true;
    } else if (field === 'monthly_debt') {
      this.profile.monthly_debt = numVal;
      this.profile.monthly_debt_confirmed = true;
    } else if (field === 'credit_range') {
      this.profile.credit_range = sanitizeCreditScore(rawValue);
      this.profile.credit_range_confirmed = true;
    } else if (field === 'down_payment') {
      this.profile.down_payment = numVal;
      this.profile.down_payment_confirmed = true;
    } else if (field === 'target_price') {
      this.profile.target_price = numVal;
      this.profile.target_price_confirmed = true;
    } else if (field === 'borrower_name') {
      this.profile.borrower_name = rawValue;
      this.profile.borrower_name_confirmed = true;
    } else if (field === 'mortgage_goal') {
      this.profile.mortgage_goal = rawValue;
      this.profile.mortgage_goal_confirmed = true;
    } else if (field === 'occupancy') {
      this.profile.occupancy = rawValue as any;
      this.profile.occupancy_confirmed = true;
    } else if (field === 'existing_relationship') {
      this.profile.existing_relationship = rawValue as any;
      this.profile.existing_relationship_confirmed = true;
    } else if (field === 'timeline') {
      this.profile.timeline = rawValue;
      this.profile.timeline_confirmed = true;
    } else if (field === 'co_borrower') {
      this.profile.co_borrower = rawValue as any;
      this.profile.co_borrower_confirmed = true;
    } else if (field === 'rent_own') {
      this.profile.rent_own = rawValue as any;
      this.profile.rent_own_confirmed = true;
    } else if (field === 'realtor_status') {
      this.profile.realtor_status = rawValue as any;
      this.profile.realtor_status_confirmed = true;
    } else if (field === 'property_type') {
      this.profile.property_type = rawValue as any;
      this.profile.property_type_confirmed = true;
    } else if (field === 'military_rural') {
      this.profile.military_rural = rawValue as any;
      this.profile.military_rural_confirmed = true;
    } else if (field === 'job_tenure_type') {
      this.profile.job_tenure_type = rawValue;
      this.profile.job_tenure_type_confirmed = true;
    }
  }

  private async checkForGlobalCorrections(text: string): Promise<boolean> {
    const lower = text.toLowerCase();
    // Keywords indicating an intentional change or correction.
    // Deliberately narrow — common words like "not" and "no" would fire on
    // nearly every denial answer and cause a spurious Cerebras call.
    const keywords = ['change', 'correct', 'instead', 'wrong', 'mistake', 'actually', 'update'];
    const hasKeyword = keywords.some(k => lower.includes(k));
    if (!hasKeyword) return false;

    // Get list of fields that are already confirmed
    const confirmedFields: string[] = [];
    if (this.profile.borrower_name_confirmed) confirmedFields.push('borrower_name');
    if (this.profile.mortgage_goal_confirmed) confirmedFields.push('mortgage_goal');
    if (this.profile.occupancy_confirmed) confirmedFields.push('occupancy');
    if (this.profile.existing_relationship_confirmed) confirmedFields.push('existing_relationship');
    if (this.profile.timeline_confirmed) confirmedFields.push('timeline');
    if (this.profile.co_borrower_confirmed) confirmedFields.push('co_borrower');
    if (this.profile.gross_annual_income_confirmed) confirmedFields.push('gross_annual_income');
    if (this.profile.monthly_debt_confirmed) confirmedFields.push('monthly_debt');
    if (this.profile.credit_range_confirmed) confirmedFields.push('credit_range');
    if (this.profile.down_payment_confirmed) confirmedFields.push('down_payment');
    if (this.profile.rent_own_confirmed) confirmedFields.push('rent_own');
    if (this.profile.realtor_status_confirmed) confirmedFields.push('realtor_status');
    if (this.profile.target_price_confirmed) confirmedFields.push('target_price');
    if (this.profile.property_type_confirmed) confirmedFields.push('property_type');
    if (this.profile.military_rural_confirmed) confirmedFields.push('military_rural');
    if (this.profile.job_tenure_type_confirmed && this.currentPendingField !== 'employment_details') confirmedFields.push('job_tenure_type');

    if (confirmedFields.length === 0) return false;

    const fieldDescriptions: Record<string, string> = {
      borrower_name: "The user's name",
      mortgage_goal: "Whether they want to purchase/buy a new home, refinance, or explore equity",
      occupancy: "Primary residence, second home, or investment property",
      existing_relationship: "Whether they have worked with this lending institution/bank before (NOT personal relationship status like single/married)",
      timeline: "When they plan to close/purchase",
      co_borrower: "Whether they will have a co-borrower (spouse/partner/etc.) on the loan",
      gross_annual_income: "Gross annual income before taxes",
      monthly_debt: "Total monthly recurring debt payments",
      credit_range: "Estimated credit score range",
      down_payment: "Down payment amount",
      rent_own: "Whether they currently rent or own their home",
      realtor_status: "Whether they have a real estate agent/realtor",
      target_price: "Target purchase price or property value",
      property_type: "Type of property (single-family, condo, etc.)",
      military_rural: "Current/former military service, or buying in a rural/suburban area",
      job_tenure_type: "Job tenure and income type",
    };

    const confirmedFieldsDesc = confirmedFields.map(field => `- "${field}": ${fieldDescriptions[field] ?? ''}`).join('\n');

    console.log(`[context-manager] Global: Checking potential correction against confirmed fields: ${confirmedFields.join(', ')}`);
    const lastQuestion = this.getLastAssistantUtterance();

    const res = await extractProfileField(
      text,
      lastQuestion,
      'global_correction',
      'correction of previously shared details',
      'string',
      `The currently confirmed fields are:
${confirmedFieldsDesc}

Determine if the user is correcting or changing one of these fields.
If yes, return the field name and new value separated by a colon, exactly like "field_name:new_value" (e.g., "gross_annual_income:85000" or "mortgage_goal:refinance").
If no correction/change is found, return null.`
    );

    if (res.value && typeof res.value === 'string' && res.value.includes(':')) {
      const parts = res.value.split(':');
      const field = parts[0]?.trim();
      const newVal = parts.slice(1).join(':')?.trim();
      if (field && newVal && confirmedFields.includes(field)) {
        console.log(`[context-manager] Global: Correction detected for ${field} to ${newVal} — committing immediately`);
        this.commitGlobalValue(field, newVal);
        this.advanceWorkflow();
        return true;
      }
    }
    return false;
  }

  private declineCurrentField(): void {
    if (!this.currentPendingField) return;
    const field = this.currentPendingField;
    this.fieldAttempts[field] = 0;

    if (field === 'borrower_name') {
      this.profile.borrower_name = 'Valued Member';
      this.profile.borrower_name_confirmed = true;
    } else if (field === 'mortgage_goal') {
      this.profile.mortgage_goal = 'purchase';
      this.profile.mortgage_goal_confirmed = true;
    } else if (field === 'occupancy') {
      this.profile.occupancy = 'primary';
      this.profile.occupancy_confirmed = true;
    } else if (field === 'existing_relationship') {
      this.profile.existing_relationship = 'no';
      this.profile.existing_relationship_confirmed = true;
    } else if (field === 'timeline') {
      this.profile.timeline = 'flexible';
      this.profile.timeline_confirmed = true;
    } else if (field === 'co_borrower') {
      this.profile.co_borrower = 'no';
      this.profile.co_borrower_confirmed = true;
    } else if (['gross_annual_income', 'monthly_debt', 'credit_range', 'refinance_type', 'down_payment', 'target_price', 'rent_own', 'realtor_status', 'property_type', 'military_rural', 'job_tenure_type'].includes(field)) {
      if (['gross_annual_income', 'monthly_debt', 'down_payment', 'target_price'].includes(field)) {
        this.commitStage2Value(field, null, true);
      } else {
        if (field === 'credit_range') this.profile.credit_range = null;
        if (field === 'refinance_type') this.profile.refinance_type = 'rate_term';
        if (field === 'rent_own') this.profile.rent_own = 'rent';
        if (field === 'realtor_status') this.profile.realtor_status = 'no';
        if (field === 'property_type') this.profile.property_type = 'single_family';
        if (field === 'military_rural') this.profile.military_rural = 'neither';
        if (field === 'job_tenure_type') this.profile.job_tenure_type = 'not specified';
        (this.profile as any)[`${field}_confirmed`] = true;
        this.advanceWorkflow();
      }
      return;
    } else if (field === 'soft_pull_authorization') {
      this.profile.soft_pull_consent = 'declined';
    } else if (field === 'prefill_name_address' || field === 'prefill_employer' || field === 'prefill_accounts' || field === 'prefill_credit_range') {
      const confirmed = this.profile.prefilled_fields_confirmed || {};
      if (field === 'prefill_name_address') confirmed.name_address = true;
      if (field === 'prefill_employer') confirmed.employer = true;
      if (field === 'prefill_accounts') confirmed.accounts = true;
      if (field === 'prefill_credit_range') confirmed.credit_range = true;
      this.profile.prefilled_fields_confirmed = confirmed;
    } else if (this.activeStage === '3B') {
      if (field === 'marital_status') this.profile.marital_status = 'unmarried';
      if (field === 'dependents') this.profile.dependents = 0;
      if (field === 'employment_details') {
        this.profile.employment_position = 'Not specified';
        this.profile.employment_years = 0;
        this.profile.self_employed = false;
        this.profile.employment_confirmed = true;
      }
      if (field === 'checking_savings') this.profile.checking_savings_balance = 0;
      if (field === 'declarations') {
        this.profile.declarations_bankruptcy = false;
        this.profile.declarations_foreclosure = false;
        this.profile.declarations_confirmed = true;
      }
      if (field === 'submit_confirmation') this.profile.ready_to_submit = true;
    }

    this.advanceWorkflow();
  }
}

export function sanitizeCreditScore(input: string | number | null | undefined): string | null {
  if (input === null || input === undefined) return null;
  let str = String(input).trim();
  if (!str) return null;

  // 1. Remove lead dollar sign if present (e.g. "$710000" -> "710000", "$710" -> "710")
  str = str.replace(/^\$\s*/, '').replace(/,/g, '').replace(/\.00$/, '');

  // 2. Extract digits
  const digitsOnly = str.replace(/\D/g, '');
  if (digitsOnly.length > 0) {
    const fullVal = parseInt(digitsOnly, 10);
    // If number exceeds valid FICO range (850)
    if (fullVal > 850) {
      // Check if leading 3 digits form a valid FICO score (300 to 850)
      const lead3 = parseInt(digitsOnly.slice(0, 3), 10);
      if (lead3 >= 300 && lead3 <= 850) {
        console.log(`[credit-sanitizer] STT mis-transcription sanitized: "${input}" -> "${lead3}"`);
        return String(lead3);
      }
    }
  }

  return str;
}

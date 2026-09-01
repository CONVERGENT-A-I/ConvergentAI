import { llm, type voice } from '@livekit/agents';
import { ailanaConfig } from '../config/ailana-config.js';
import {
  getForceCompactTokenThreshold,
  logContextBudget,
} from './context-budget.js';
import type { LatencyTracker } from '../metrics/latency-tracker.js';
import type { BorrowerProfile } from '../prompts/layer3-context.js';
import { buildSessionPrompt, buildStaticInstructions, buildDynamicContext } from '../prompts/ailana-system.js';
import { extractProfileField, classifyConfirmation, classifyAuthorization, extractMultipleFields, type FieldToExtract } from './llm-extractor.js';
import { applicationService } from '../services/application-service.js';
import { conversationService } from '../services/conversation-service.js';
import { isDatabaseEnabled } from '../services/database.js';
import { callCrsSoftPull } from '../services/crs-service.js';
import { lookupZipData } from '../utils/zip-lookup.js';


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

function isLikelyQuestion(text: string): boolean {
  const t = text.toLowerCase().trim();
  if (t.includes('?')) return true;
  if (/^(what|why|how|where|who|which|can|could|would|should|is|does|will|do i|did|are|was|were)\b/.test(t)) return true;
  const keywords = [
    'explain', 'detail', 'meaning', 'difference', 'tell me', 'what does', 'what is',
    'i thought', 'i was wondering', 'i assumed', 'had to', 'thought it would',
    'wait', 'hold on', 'just to clarify', 'confused', 'not sure', 'well i'
  ];
  return keywords.some(k => t.includes(k));
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
  private currentPendingField: string | null = 'mortgage_goal';
  private lastProcessedInput: string | null = null;
  private lowConfidence = false;
  private fieldAttempts: Record<string, number> = {};
  private softPullExplanationCount = 0;

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

  public onStateReconciled?: (manager: SessionContextManager) => void;

  // Database persistence (optional - only if DATABASE_URL is set)
  private applicationId: string | null = null;
  private lastSyncAt = Date.now();
  private readonly syncIntervalMs = 5000; // Sync every 5 seconds
  private readonly dbEnabled: boolean;

  constructor(
    private readonly summarizationLlm: llm.LLM,
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
      // Strip any __pending__ sentinel values injected by injectFallbackForPendingField()
      // so they are never persisted to the database.
      const profileForSync: Record<string, any> = {};
      for (const [k, v] of Object.entries(this.profile)) {
        if (v !== '__pending__') {
          profileForSync[k] = v;
        }
      }
      await applicationService.syncAllStages(
        this.applicationId,
        profileForSync as any,
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
        // No artificial delay needed: the extractor uses CEREBRAS_EXTRACTOR_API_KEY
        // (a separate request pool), so there is zero contention with the main LLM.
        // Removing the 50ms pause means the real extracted value replaces __pending__
        // as early as possible (~200-350ms after user turn ends).
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

      // ── Sentinel cleanup ──────────────────────────────────────────────────
      // After reconcile, sweep for any __pending__ values the extractor didn't
      // replace (e.g. returned null, bad JSON, or threw). Clear them back to
      // null so the field is treated as unanswered — Ailana will re-ask on the
      // next turn rather than being stuck with a permanent placeholder.
      let sentinelsCleared = 0;
      for (const key of Object.keys(this.profile) as Array<keyof BorrowerProfile>) {
        if ((this.profile as any)[key] === '__pending__') {
          (this.profile as any)[key] = null;
          sentinelsCleared++;
          console.warn(`[reconcile] ⚠️  Field "${key}" had unresolved __pending__ sentinel after extraction — cleared to null. Extractor returned no value.`);
        }
      }
      if (sentinelsCleared === 0) {
        console.log(`[reconcile] Turn ${turnNum} sentinel check: all __pending__ values resolved ✅`);
      }

      this.lastAppliedTurn = turnNum;
      this.pendingExtractions.delete(turnNum);
      
      if (this.onStateReconciled) {
        this.onStateReconciled(this);
      }
    }
  }


  private reconcileState(snapshot: SessionContextManagerSnapshot, clone: SessionContextManager): void {
    const delta = this.getProfileDelta(snapshot.profile, clone.profile);

    // Log each field that changed so we can trace __pending__ → real value replacements
    for (const [key, newVal] of Object.entries(delta)) {
      const liveVal = (this.profile as any)[key];
      if (liveVal === '__pending__') {
        console.log(`[reconcile] ✅ Field "${key}" resolved: __pending__ → "${newVal}" (extraction succeeded)`);
      } else {
        console.log(`[reconcile] Field "${key}" updated: "${liveVal ?? 'null'}" → "${newVal}"`);
      }
    }

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

  setActiveStage(stage: string): void {
    this.activeStage = stage as any;
  }

  getPendingField(): string | null {
    return this.currentPendingField;
  }

  getSoftPullExplanationCount(): number {
    return this.softPullExplanationCount;
  }

  getFieldAttemptCount(field: string): number {
    return this.fieldAttempts[field] || 0;
  }

  setCurrentPendingField(field: string | null): void {
    this.currentPendingField = field;
    this.profile.current_pending_field = field;
  }

  /**
   * Returns true if the specified field (or current pending field) is a stage boundary
   * field whose completion triggers a workflow stage transition.
   */
  isStageBoundaryField(field?: string | null): boolean {
    const target = field ?? this.currentPendingField;
    if (!target) return false;

    // Deterministic fields MUST wait for extraction because they bypass the __pending__ fallback.
    // If they don't wait, the LLM starts at 0ms and re-asks the question instantly.
    if (this.isDeterministicField(target)) return true;

    const BOUNDARY_FIELDS = new Set([
      'home_horizon',
      'job_tenure_type',
      'soft_pull_authorization',
      'assets_details',
      // Deterministic fields with async operations (like OTP modal / CRS API pull)
      'contact_name',
      'contact_email',
      'contact_mobile',
      'otp_verification',
      'prefill_name_address',
      'prefill_employer',
      'prefill_accounts',
    ]);
    return BOUNDARY_FIELDS.has(target);
  }


  /**
   * Returns true if the field is handled deterministically in llmNode.
   * Deterministic fields bypass the __pending__ fallback entirely.
   */
  isDeterministicField(field?: string | null): boolean {
    const target = field ?? this.currentPendingField;
    if (!target) return false;
    const DETERMINISTIC_FIELDS = new Set([
      'stage2_closing_offer',
      'contact_name',
      'contact_email',
      'contact_mobile',
      'otp_verification',
      'soft_pull_authorization',
      'prefill_name_address',
      'prefill_employer',
      'prefill_accounts',
      'prefill_credit_range',
      'declarations',
      'submit_confirmation',
      'military_rural',
      'affordability_panel_active'
    ]);
    return DETERMINISTIC_FIELDS.has(target);
  }

  /**
   * Immediately stamps the active pending field with a sentinel or optimistic value so the
   * conversational LLM prompt reflects that an answer was received without
   * waiting for the background extractor to finish.
   *
   * The real extracted value is applied via applyCompletedExtractions() / reconcile once
   * the background turn resolves (~1.2s later, before the next user turn begins).
   */
  injectFallbackForPendingField(): void {
    const field = this.currentPendingField;
    if (!field) return;

    // Fields handled deterministically in llmNode — don't inject fallback,
    // they bypass the profile entirely.
    if (this.isDeterministicField(field)) return;

    // Only inject if the field is currently unset — don't overwrite a real value
    const currentValue = (this.profile as any)[field];
    if (currentValue !== undefined && currentValue !== null && currentValue !== '') return;

    // ── Optimistic Boundary Transitions (0ms Fast-Path with Average/Default Values) ──
    const lastQuestion = this.getLastAssistantUtterance()?.toLowerCase() || '';
    const wasAskedCoBorrower = lastQuestion.includes('co-borrower') || lastQuestion.includes('co borrower') || lastQuestion.includes('applying on your own') || lastQuestion.includes('joining you on the loan');

    if (field === 'co_borrower' && wasAskedCoBorrower) {
      this.profile.co_borrower = 'no'; // Default fallback value
      this.profile.co_borrower_confirmed = true;
      (this.profile as any)._optimistic_co_borrower = true;
      this.activeStage = '2';
      this.currentPendingField = 'gross_annual_income';
      this.profile.bridge_to_say = 'stage1_to_stage2';
      console.log(`[agent-hook][fallback] Optimistically advanced Stage 1 -> Stage 2 for field "co_borrower" (default="no"). LLM transitions immediately with bridge!`);
      return;
    }

    if (field === 'military_rural') {
      this.profile.military_rural = 'neither'; // Default fallback value
      this.profile.military_rural_confirmed = true;
      this.currentPendingField = 'job_tenure_type';
      console.log(`[agent-hook][fallback] Optimistically advanced field "military_rural" -> "job_tenure_type" (default="neither").`);
      return;
    }

    if (field === 'prior_refinance') {
      this.profile.prior_refinance = 'no'; // Default fallback value
      this.profile.prior_refinance_confirmed = true;
      this.currentPendingField = 'stay_duration_years';
      console.log(`[agent-hook][fallback] Optimistically advanced field "prior_refinance" -> "stay_duration_years" (default="no").`);
      return;
    }

    if (field === 'stay_duration_years') {
      this.profile.stay_duration_years = '5 years'; // Default fallback value
      this.profile.stay_duration_years_confirmed = true;
      this.currentPendingField = 'job_tenure_type';
      console.log(`[agent-hook][fallback] Optimistically advanced field "stay_duration_years" -> "job_tenure_type" (default="5 years").`);
      return;
    }

    if (field === 'heloc_prior') {
      this.profile.heloc_prior = 'no'; // Default fallback value
      this.profile.heloc_prior_confirmed = true;
      this.currentPendingField = 'heloc_timeline';
      console.log(`[agent-hook][fallback] Optimistically advanced field "heloc_prior" -> "heloc_timeline" (default="no").`);
      return;
    }

    if (field === 'heloc_timeline') {
      this.profile.heloc_timeline = 'as soon as possible'; // Default fallback value
      this.profile.heloc_timeline_confirmed = true;
      this.currentPendingField = 'job_tenure_type';
      console.log(`[agent-hook][fallback] Optimistically advanced field "heloc_timeline" -> "job_tenure_type" (default="as soon as possible").`);
      return;
    }

    if (field === 'job_tenure_type') {
      this.profile.job_tenure_type = 'salaried'; // Default fallback value
      this.profile.job_tenure_type_confirmed = true;
      this.currentPendingField = 'stage2_closing_offer';
      console.log(`[agent-hook][fallback] Optimistically advanced field "job_tenure_type" -> "stage2_closing_offer" (default="salaried").`);
      return;
    }

    (this.profile as any)[field] = '__pending__';
    console.log(`[agent-hook][fallback] Injected sentinel "__pending__" for field "${field}" — LLM proceeds immediately, extractor will overwrite.`);
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
      const userIsAsking = isLikelyQuestion(trimmed);

      if (userIsAsking) {
        console.log(`[context-manager]: Q&A turn detected for "${this.currentPendingField}" — not counting against attempt limit.`);
      } else {
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
    } else if (this.activeStage === '5') {
      await this.runStage5Extraction(trimmed);
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
    let field = this.currentPendingField;

    // Clear AUS delivery state and return to active panel interaction
    if (field === 'fd1_delivery' || field === 'fd2_delivery') {
      this.currentPendingField = 'affordability_panel_active';
      field = 'affordability_panel_active';
    }

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
        if (this.profile.affordability_mode === 'stated' || !this.profile.otp_verified) {
          // Voice submit in stated mode -> triggers upgrade flow
          this.activeStage = '3A';
          this.currentPendingField = 'contact_name';
          this.profile.affordability_submitted = false;
          this.profile.aus_status = null;
          this.profile.affordability_aus_status = null;
          console.log('[context-manager]: Voice submit in stated mode -> triggering upgrade (Stage 3A contact_name).');
        } else {
          // Voice submit in verified mode -> executes AUS submission
          this.profile.affordability_submitted = true;
          this.applyAusResult('approve_eligible');
          console.log('[context-manager]: Affordability panel EXPLICITLY submitted for review via voice! AUS result applied.');
        }
      } else if (res.value === 'upgrade') {
        // Trigger upgrade to verified mode — set pending to OTP gate
        this.activeStage = '3A';
        this.currentPendingField = 'contact_name';
        this.profile.affordability_submitted = false;
        this.profile.aus_status = null;
        this.profile.affordability_aus_status = null;
        console.log('[context-manager]: Affordability panel upgrade to verified mode requested via voice. Going to OTP gate (contact_name).');
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
    this.profile.aus_status = result === 'approve_eligible' ? 'approve' : result;
    this.profile.affordability_submitted = true;
    this.activeStage = '2.5';
    this.currentPendingField = result === 'approve_eligible' ? 'fd1_delivery' : 'fd2_delivery';
    console.log(`[context-manager]: Applied AUS result: ${result} -> pending field set to ${this.currentPendingField}`);
  }

  public triggerUpgradeToVerifiedMode(): void {
    this.activeStage = '3A';
    this.currentPendingField = 'contact_name';
    this.profile.transition_pitch_delivered = true;
    this.profile.affordability_submitted = false;
    this.profile.aus_status = null;
    this.profile.affordability_aus_status = null;
    console.log('[context-manager]: Explicit upgrade to verified mode triggered! Active stage set to 3A, pending field set to contact_name.');
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
        this.currentPendingField = 'contact_name';
        console.log('[context-manager]: stage3_closing_offer accepted! Transitioning to STAGE 3A OTP gate (contact_name)!');

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

    // ── v8.7 OTP Gate: Step 0 — collect contact_name ──
    if (this.currentPendingField === 'contact_name') {
      const res = await extractProfileField(
        text,
        lastQuestion,
        'contact_name',
        "the borrower's preferred first name or full name",
        'string',
        'Extract the name they want to use for account setup or preferred name. Return null if no name is mentioned.'
      );
      if (res.value) {
        this.profile.contact_name = res.value as string;
        this.profile.borrower_name = res.value as string;
        this.profile.legal_name = res.value as string;
        this.profile.contact_name_confirmed = true;
        console.log(`[context-manager]: Captured contact name: ${this.profile.contact_name}`);
        this.advanceWorkflow();
      }
      return;
    }

    // ── v8.7 OTP Gate: Step 1 & 2 — collect email and/or mobile in any order ──
    if (this.currentPendingField === 'contact_email' || this.currentPendingField === 'contact_mobile') {
      const results = await extractMultipleFields(text, lastQuestion, [
        {
          name: 'contact_email',
          description: "borrower's email address for secure login",
          expectedType: 'string',
          additionalInstructions: 'Critically extract the email address. ALWAYS fix phonetic speech-to-text formatting. Replace "at the rate", "at the rate of", or "at" with "@". Replace "dot" with ".". STRIP OUT ALL SPACES and convert to lowercase. If the user spells it out conversationally (e.g., "David l patton at gmail dot com"), convert it to standard format (davidlpatton@gmail.com). Do NOT return null if a conversational email is provided. Return null ONLY if no email is mentioned.',
        },
        {
          name: 'contact_mobile',
          description: "borrower's mobile phone number",
          expectedType: 'string',
          additionalInstructions: 'Critically extract ANY sequence of numbers the user provides as their phone or mobile number (e.g. "174862528", "555-123-4567", "5551234"). Handle phonetic spelling of numbers (e.g., "zero", "one", "dash"). Strip all non-numeric characters except for a leading "+" if provided. Do NOT return null even if the number has 7, 8, 9, 10, or 11 digits. If the user spoke a number for mobile, extract it as a string of digits. Return null ONLY if no phone number was mentioned at all.',
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

      if (this.profile.contact_email && this.profile.contact_mobile) {
        // Generate and "send" a mock OTP
        const mockOtp = '123456';
        (this.profile as any)._pendingOtp = mockOtp;
        console.log(`[OTP-Service]: Generated mock OTP code: ${mockOtp}`);
        console.log(`[OTP-Service]: OTP sent to ${this.profile.contact_email} and ${this.profile.contact_mobile}`);
      }

      if (results.contact_email?.value || results.contact_mobile?.value) {
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
      // If the disclosure has not yet been delivered or user just finished OTP, do not evaluate consent yet
      if (!this.profile.soft_pull_disclosure_delivered) {
        console.log('[soft_pull_authorization] Disclosure not yet delivered or just delivered — waiting for borrower response.');
        return;
      }

      // Explicitly dump trailing speech from the OTP step:
      // If the user's speech arrives within 4000ms of the disclosure being triggered,
      // it is physically impossible that they are responding to the disclosure (which takes ~15s to speak).
      const deliveredAt = (this.profile as any).soft_pull_disclosure_delivered_at || 0;
      if (Date.now() - deliveredAt < 4000) {
        console.log(`[soft_pull_authorization] Dumping user input ("${text}") because it arrived less than 4s after soft pull disclosure triggered. Likely a stray OTP confirmation.`);
        return;
      }

      // Use classifyAuthorization: regex fast-path (0ms) + Cerebras fallback.
      // If user asks a question ("what does soft pull mean?", "will it hurt my score?"), returns 'needs_explanation'
      // and we simply let the main LLM answer it — the field stays on soft_pull_authorization.
      const decision = await classifyAuthorization(text, lastQuestion, this.softPullExplanationCount);
      console.log(`[soft_pull_authorization] Authorization decision=${decision}`);

      if (decision === 'needs_explanation') {
        this.softPullExplanationCount++;
        // User is asking for more info — don't advance or re-ask, let the LLM answer naturally.
        console.log(`[soft_pull_authorization] User asked for explanation (count=${this.softPullExplanationCount}) — staying on field, LLM will answer.`);
        return;
      }

      if (decision === 'yes') {
        this.profile.soft_pull_consent = 'accepted';
        this.profile.prefilled_fields_confirmed = {};


        // Make real CRS API call (awaited before advanceWorkflow)
        const crsResult = await callCrsSoftPull(this.profile);

        if (crsResult) {
          this.profile.credit_range = crsResult.creditRange;
          (this.profile as any).crs_open_accounts = crsResult.openAccounts;
          (this.profile as any).crs_late_payments = crsResult.latePaymentsLast24Mo;
          // Always replace the employer coming from softpull with "Convergent AI"
          this.profile.employer = 'Convergent AI';
          this.profile.legal_name = this.profile.contact_name || this.profile.borrower_name || crsResult.legalName || 'Valued Borrower';
          if (crsResult.physicalAddress) this.profile.physical_address = crsResult.physicalAddress;
          console.log(`[CRS]: Soft pull complete. Name: ${this.profile.legal_name}, Address: ${crsResult.physicalAddress}, Score: ${crsResult.creditScore}, Range: ${crsResult.creditRangeLabel}`);
        } else {
          console.log('[CRS]: Soft pull failed — using mock fallback.');
        }

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
      } else if (step === 'prefill_accounts') {
        correctionFields.push({
          name: 'open_accounts_correction',
          description: 'corrected number of open accounts',
          expectedType: 'number',
          additionalInstructions: 'Extract the corrected number of open accounts mentioned by the user (e.g. 4 for "4 accounts"). Return an integer or null if not mentioned.'
        }, {
          name: 'late_payments_correction',
          description: 'corrected number of late payments in past 24 months',
          expectedType: 'number',
          additionalInstructions: 'Extract the corrected number of late payments mentioned by the user (e.g. 0 for "no late payments", 1 for "1 late payment"). Return an integer or null if not mentioned.'
        });
      }

      const [classifyRes, extractRes] = await Promise.all([
        classifyConfirmation(text, lastQuestion, step, 'Does that sound right or is anything out of date?'),
        correctionFields.length > 0
          ? extractMultipleFields(text, lastQuestion, correctionFields)
          : Promise.resolve(null),
      ]);
      let decision = classifyRes;
      let extractionResults: any = extractRes;

      let hasCorrection = false;
      if (extractionResults) {
        if (step === 'prefill_employer' && extractionResults.employer_correction?.value) {
          this.profile.employer = extractionResults.employer_correction.value as string;
          console.log(`[context-manager]: Corrected employer to ${extractionResults.employer_correction.value}`);
          hasCorrection = true;
        } else if (step === 'prefill_name_address') {
          if (extractionResults.name_correction?.value) {
            this.profile.borrower_name = extractionResults.name_correction.value as string;
            this.profile.legal_name = extractionResults.name_correction.value as string;
            console.log(`[context-manager]: Corrected borrower name to ${extractionResults.name_correction.value}`);
            hasCorrection = true;
          }
          if (extractionResults.address_correction?.value) {
            this.profile.physical_address = extractionResults.address_correction.value as string;
            console.log(`[context-manager]: Corrected physical address to ${extractionResults.address_correction.value}`);
            hasCorrection = true;
          }
        } else if (step === 'prefill_credit_range' && extractionResults.credit_correction?.value) {
          this.profile.credit_range = sanitizeCreditScore(extractionResults.credit_correction.value as string);
          console.log(`[context-manager]: Corrected credit range to ${this.profile.credit_range}`);
          hasCorrection = true;
        } else if (step === 'prefill_accounts') {
          if (extractionResults.open_accounts_correction?.value !== undefined && extractionResults.open_accounts_correction?.value !== null) {
            const val = Number(extractionResults.open_accounts_correction.value);
            if (!isNaN(val)) {
              (this.profile as any).crs_open_accounts = val;
              console.log(`[context-manager]: Corrected open accounts to ${val}`);
              hasCorrection = true;
            }
          }
          if (extractionResults.late_payments_correction?.value !== undefined && extractionResults.late_payments_correction?.value !== null) {
            const val = Number(extractionResults.late_payments_correction.value);
            if (!isNaN(val)) {
              (this.profile as any).crs_late_payments = val;
              console.log(`[context-manager]: Corrected late payments to ${val}`);
              hasCorrection = true;
            }
          }
        }
      }

      if (hasCorrection) {
        decision = 'no';
      }

      if ((decision as string) === 'no_content' && !hasCorrection) {
        console.warn(`[context-manager]: classifyConfirmation returned no_content for ${step} — Cerebras null response. Re-delivering script without marking needs_prefill_correction.`);
        return; // Stay on the field, agent.ts deterministic script will re-ask correctly
      }

      if (decision === 'ambiguous' && !hasCorrection) {
        console.log(`[context-manager]: User response to ${step} was ambiguous. Pausing for LLM clarification.`);
        (this.profile as any).needs_prefill_correction = true;
        return; // Do NOT confirm and advance, wait for LLM to clarify
      }

      if (decision === 'no' && !hasCorrection) {
        console.log(`[context-manager]: User said no to ${step} but provided no correction. Pausing for LLM clarification.`);
        (this.profile as any).needs_prefill_correction = true;
        return; // Do NOT confirm and advance, wait for user correction
      } else {
        (this.profile as any).needs_prefill_correction = false;
      }

      const confirmed = this.profile.prefilled_fields_confirmed || {};

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

    if (field === 'aus_findings_delivered') {
      console.log('[context-manager]: aus_findings_delivered in runStage4Extraction -> advancing to Stage 5');
      this.activeStage = '5';
      this.currentPendingField = 'escalation_preference';
      await this.runStage5Extraction(text);
      return;
    }

    if (field === 'checklist_acknowledgement') {
      const decision = await classifyConfirmation(text, lastQuestion, 'checklist_discussed', 'Do you understand the list and have these documents available?');
      if (decision === 'yes') {
        this.profile.checklist_discussed = true;
        this.advanceWorkflow();
      }
    }
  }

  private async runStage5Extraction(text: string): Promise<void> {
    const lastQuestion = this.getLastAssistantUtterance();
    const field = this.currentPendingField;

    if (field === 'escalation_preference') {
      const results = await extractMultipleFields(text, lastQuestion, [
        { 
          name: 'escalation_preference', 
          description: 'preference for live transfer, scheduled callback, or declined',
          expectedType: 'string',
          additionalInstructions: 'Extract if the user prefers to speak to a loan officer right now (live_transfer), or schedule a callback for later (scheduled_call), or declines both (declined).' 
        },
        {
          name: 'scheduled_call_time',
          description: 'preferred date and time for the callback if provided in the utterance',
          expectedType: 'string',
          additionalInstructions: 'Extract the date and time the user wants to schedule the callback ONLY if they provide BOTH a specific day and a specific time (e.g. "Tomorrow at 2 PM", "Tuesday at 15:30"). If they only provide a day or a general time of day (e.g. "tomorrow", "in the evening"), return null so we can ask for clarification.'
        }
      ]);
      const pref = typeof results.escalation_preference?.value === 'string' ? results.escalation_preference.value.toLowerCase() : null;
      if (pref === 'live_transfer' || pref === 'scheduled_call' || pref === 'declined') {
        this.profile.escalation_preference = pref as any;
        if (results.scheduled_call_time?.value && !results.scheduled_call_time?.declined) {
          this.profile.scheduled_call_time = results.scheduled_call_time.value as string;
        }
        this.advanceWorkflow();
        
        if (pref === 'live_transfer' || (pref === 'scheduled_call' && this.profile.scheduled_call_time)) {
          try {
            const { triggerMloEscalation } = await import('../utils/email-sender.js');
            await triggerMloEscalation(this.profile);
          } catch (e) {
            console.error('Failed to trigger MLO escalation', e);
          }
        }
      }
    } else if (field === 'scheduled_call_time') {
      const results = await extractMultipleFields(text, lastQuestion, [
        { 
          name: 'scheduled_call_time', 
          description: 'preferred date and time for the callback',
          expectedType: 'string',
          additionalInstructions: 'Extract the date and time the user wants to schedule the callback ONLY if they provide BOTH a specific day and a specific time (e.g. "Tomorrow at 2 PM", "Tuesday at 15:30"). If they only provide a day or a general time of day (e.g. "tomorrow", "in the evening"), return null so we can ask for clarification.' 
        }
      ]);
      if (results.scheduled_call_time?.value && !results.scheduled_call_time?.declined) {
        this.profile.scheduled_call_time = results.scheduled_call_time.value as string;
        this.advanceWorkflow();

        try {
          const { triggerMloEscalation } = await import('../utils/email-sender.js');
          await triggerMloEscalation(this.profile);
        } catch (e) {
          console.error('Failed to trigger MLO escalation', e);
        }
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

    // Synchronize currentPendingField with what Ailana ACTUALLY asked in Stage 1
    if (this.activeStage === '1') {
      const lower = trimmed.toLowerCase();
      if (lower.includes('co-borrower') || lower.includes('co borrower') || lower.includes('applying on your own') || lower.includes('joining you on the loan')) {
        this.currentPendingField = 'co_borrower';
      } else if (lower.includes('existing account') || lower.includes('existing relationship') || lower.includes('new customer') || lower.includes('lending institution')) {
        this.currentPendingField = 'existing_relationship';
      } else if (lower.includes('timeline') || lower.includes('moved in') || lower.includes('next few months') || lower.includes('when are you hoping')) {
        this.currentPendingField = 'timeline';
      } else if (lower.includes('primary residence') || lower.includes('investment property') || lower.includes('second home')) {
        this.currentPendingField = 'occupancy';
      } else if (lower.includes('primary goal') || lower.includes('purchase') || lower.includes('refinance') || lower.includes('buying a home') || lower.includes('mortgage goal')) {
        this.currentPendingField = 'mortgage_goal';
      }
    }

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
    const fieldsToExtract: FieldToExtract[] = [
      {
        name: 'mortgage_goal',
        description: 'Whether they want to purchase/buy a new home, refinance an existing mortgage, or explore a home equity / HELOC option',
        expectedType: 'string',
        additionalInstructions: 'Extract "purchase", "refinance", "heloc", or "heq" (all lowercase). If they say they want to buy, purchase, acquire, or look for a new home or property, return "purchase". If they want to refinance, refi, lower their rate or payment, get cash out, or change existing mortgage terms, return "refinance". If they want a home equity line of credit, HELOC, or flexible equity draw, return "heloc". If they specifically want a fixed home equity loan, lump sum equity loan, or fixed rate second mortgage (not a line of credit), return "heq". Return null if not mentioned at all.',
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

    const mgRaw = extractionResults.mortgage_goal?.value;
    const mgVal = typeof mgRaw === 'string' ? mgRaw.toLowerCase().trim() : null;
    if (mgVal && (mgVal.includes('purchase') || mgVal.includes('buy') || mgVal.includes('refinance') || mgVal.includes('refi') || mgVal.includes('equity') || mgVal.includes('heloc') || mgVal.includes('heq'))) {
      if (mgVal.includes('refinance') || mgVal.includes('refi')) {
        this.profile.mortgage_goal = 'refinance';
        this.profile.transaction_type = 'TT-REF';
      } else if (mgVal === 'heq' || mgVal.includes('fixed') || mgVal.includes('lump sum')) {
        this.profile.mortgage_goal = 'heloc';
        this.profile.transaction_type = 'TT-HEQ';
      } else if (mgVal.includes('equity') || mgVal.includes('heloc')) {
        this.profile.mortgage_goal = 'heloc';
        this.profile.transaction_type = 'TT-HEL';
      } else {
        this.profile.mortgage_goal = 'purchase';
        this.profile.transaction_type = 'TT-PUR';
      }
      this.profile.mortgage_goal_confirmed = true;
      anyUpdates = true;
      console.log(`[context-manager]: 🎯 Stage 1 Goal Classified: ${this.profile.mortgage_goal} -> transaction_type=${this.profile.transaction_type}`);
    }
    const occRaw = extractionResults.occupancy?.value;
    const occVal = typeof occRaw === 'string' ? occRaw.toLowerCase().trim() : null;
    if (occVal && (occVal.includes('primary') || occVal.includes('secondary') || occVal.includes('investment'))) {
      this.profile.occupancy = occVal.includes('primary') ? 'primary' : occVal.includes('secondary') ? 'secondary' : 'investment';
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
      delete (this.profile as any)._optimistic_co_borrower;
      anyUpdates = true;
    } else if ((this.profile as any)._optimistic_co_borrower && (!extractionResults.co_borrower || !extractionResults.co_borrower.value)) {
      // Borrower did not answer co_borrower (e.g. asked a question or spoke off-topic)
      console.log('[reconcile]: Borrower did not answer co_borrower (asked question/off-topic) -> Rolling back to Stage 1 co_borrower.');
      this.profile.co_borrower = null;
      this.profile.co_borrower_confirmed = false;
      delete (this.profile as any)._optimistic_co_borrower;
      this.activeStage = '1';
      this.currentPendingField = 'co_borrower';
      this.profile.bridge_to_say = null;
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
        additionalInstructions: 'Extract the credit score number (e.g. 720) or range/tier/rating (e.g. "Excellent", "Very Good", "Good", "Fair", "Poor", "680-700", "740+"). If the user says their credit is "very good", "good", "great", "excellent", "fair", "poor", or "bad", extract that exact phrase or tier. Do NOT return null if a tier or descriptive rating is provided. Do NOT include dollar signs or extra thousand zeroes. Credit scores are 3-digit numbers between 300 and 850. If STT transcribed "$710000" or "$710,000" or "710000", extract 710. If they decline, skip, or say they don\'t know, set "declined" to true. If not mentioned at all, return null.',
      });
    }
    const isRef = this.profile.transaction_type === 'TT-REF' || this.profile.mortgage_goal === 'refinance';
    const isHel = this.profile.transaction_type === 'TT-HEL' || this.profile.mortgage_goal === 'heloc';

    if (!isRef && !isHel && !this.profile.rent_own_confirmed) {
      allFields.push({
        name: 'rent_own',
        description: 'Whether they rent, own, or own and plan to sell their current home',
        expectedType: 'string',
        additionalInstructions: 'Extract "rent", "own", or "own_selling". If they own and plan to sell, return "own_selling". If they own but do not mention selling, return "own". If they rent, return "rent". If their response is ambiguous or does not fit these choices, return "other". If not found, return null.',
      });
    }
    if (!isRef && !isHel && !this.profile.realtor_status_confirmed) {
      allFields.push({
        name: 'realtor_status',
        description: 'Whether they have connected with a real estate agent',
        expectedType: 'string',
        additionalInstructions: 'Extract "yes" or "no". If they have an agent/realtor, return "yes". If not, return "no". If their response is ambiguous or does not fit these choices, return "other". If not found, return null.',
      });
    }
    if (isRef && !this.profile.refinance_type_confirmed) {
      allFields.push({
        name: 'refinance_type',
        description: 'Whether they want a cash-out refinance or rate and term refinance',
        expectedType: 'string',
        additionalInstructions: 'Extract "cash_out" or "rate_term". If they say cash out, equity draw, take cash out, return "cash_out". If they say rate and term, lower monthly payment, reduce rate, change terms, return "rate_term". If their response is ambiguous or does not fit these choices, return "other". If not found, return null.',
      });
    }
    if (isRef && !this.profile.current_mortgage_type) {
      allFields.push({
        name: 'current_mortgage_type',
        description: 'Current mortgage program type: Conventional, FHA, VA, or USDA (RQ-LOANTYPE)',
        expectedType: 'string',
        additionalInstructions: 'Extract "conventional", "fha", "va", "usda", or "other". If not found, return null.',
      });
    }
    if (isRef && !this.profile.closing_costs_preference) {
      allFields.push({
        name: 'closing_costs_preference',
        description: 'Whether they prefer to pay closing costs out of pocket or roll them into the new mortgage',
        expectedType: 'string',
        additionalInstructions: 'Extract "out_of_pocket" or "rolled_in". If they say roll in, finance, include in loan, return "rolled_in". If out of pocket or pay cash, return "out_of_pocket". If not found, return null.',
      });
    }
    if (isRef && !this.profile.prior_refinance_confirmed) {
      allFields.push({
        name: 'prior_refinance',
        description: 'Whether they have refinanced this property before (RQ28)',
        expectedType: 'string',
        additionalInstructions: 'Extract "yes" or "no". If they have refinanced before, return "yes". If first time or no prior refinance, return "no". If unsure, return "unknown". Return null if not mentioned.',
      });
    }
    if (isRef && !this.profile.stay_duration_years_confirmed) {
      allFields.push({
        name: 'stay_duration_years',
        description: 'How long they plan to stay in the home in years (RQ29)',
        expectedType: 'string',
        additionalInstructions: 'Extract the number of years or duration phrase (e.g. 5, "10 years", "long-term", "forever", "short-term", "few years"). Return null if not mentioned.',
      });
    }
    if (isHel && !this.profile.heloc_risk_acknowledged) {
      allFields.push({
        name: 'heloc_risk_acknowledged',
        description: 'Borrower acknowledgment of variable rate, foreclosure risk, and 10-year draw to 20-year repayment transition (HQ16/HQ19)',
        expectedType: 'string',
        additionalInstructions: 'Extract "yes" or "acknowledged" if borrower acknowledges or understands the disclosure. Return null if not mentioned.',
      });
    }
    if (isHel && !this.profile.heloc_rate_comfort) {
      allFields.push({
        name: 'heloc_rate_comfort',
        description: 'Whether borrower is comfortable with a variable interest rate or prefers fixed payment predictability (HQ24)',
        expectedType: 'string',
        additionalInstructions: 'Extract "variable" if comfortable with variable rates/fluctuations. Extract "fixed" if they prioritize predictability, fixed rate, or set payments. Extract "either" if neutral. Return null if not mentioned.',
      });
    }
    if (isHel && !this.profile.heloc_draw_use) {
      allFields.push({
        name: 'heloc_draw_use',
        description: 'Planned use for the HELOC credit line funds (e.g. renovations, debt consolidation, emergency)',
        expectedType: 'string',
        additionalInstructions: 'Extract a concise summary of the planned use. If not found, return null.',
      });
    }
    if (isHel && !this.profile.heloc_prior_confirmed && !this.profile.heloc_prior) {
      allFields.push({
        name: 'heloc_prior',
        description: 'Whether borrower has had a HELOC or home equity loan on this property before',
        expectedType: 'string',
        additionalInstructions: 'Extract "yes", "no", or "unknown". If not found, return null.',
      });
    }
    if (isHel && !this.profile.heloc_timeline_confirmed && !this.profile.heloc_timeline) {
      allFields.push({
        name: 'heloc_timeline',
        description: 'How quickly the borrower is hoping to access the funds (timeline / urgency)',
        expectedType: 'string',
        additionalInstructions: 'Extract a concise description of their timeline (e.g. "immediately", "within a month", "flexible"). If not found, return null.',
      });
    }
    if (!isRef && !isHel && !this.profile.property_type_confirmed) {
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
    if (!isRef && !isHel && !this.profile.military_rural_confirmed) {
      allFields.push({
        name: 'military_rural',
        description: 'Whether borrower or co-borrower has military service history (active duty, veteran, Reserve/Guard, surviving spouse)',
        expectedType: 'string',
        additionalInstructions: 'Return "military" if borrower confirms military service history. CRITICAL: If the user explicitly says "no", denies having military service, or says they have no military service of any kind, you MUST return "neither" as the value. Ignore rural property location as that is handled by zip code. If not found at all, return null.',
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
    const numericFields = [
      'gross_annual_income',
      'monthly_debt',
      'down_payment',
      'target_price',
      'property_value',
      'first_mortgage_balance',
      'current_mortgage_rate',
      'current_mortgage_payment',
      'remaining_term_years',
      'cash_out_amount',
      'heloc_line_amount',
    ];
    const pendingIsNumeric = field !== null && numericFields.includes(field);
    if (pendingIsNumeric && field && !allFields.some(f => f.name === field)) {
      const fieldDesc =
        field === 'gross_annual_income' ? 'gross annual household income'
        : field === 'monthly_debt' ? 'total monthly recurring debt obligations (sum all debts)'
        : field === 'down_payment' ? 'down payment savings amount'
        : field === 'target_price' ? 'target purchase price'
        : field === 'property_value' ? 'estimated current market value of home'
        : field === 'first_mortgage_balance' ? 'current balance owed on mortgage'
        : field === 'current_mortgage_rate' ? 'current approximate interest rate (e.g. 7.25)'
        : field === 'current_mortgage_payment' ? 'current monthly mortgage payment'
        : field === 'remaining_term_years' ? 'remaining years on current mortgage'
        : field === 'cash_out_amount' ? 'desired cash-out dollar amount'
        : 'desired HELOC credit line amount';
      let instruction = 'Extract the dollar amount or numeric value as a plain number (e.g. 80000 or 7.25). If the user declines, skips, or says they don\'t know, set "declined" to true. If not mentioned, return null.';
      if (field === 'down_payment' && this.profile.target_price) {
        instruction += ` If the user specifies a percentage, calculate it against the target price ($${this.profile.target_price}) and return the integer dollar amount.`;
      }
      allFields.push({ name: field, description: fieldDesc, expectedType: 'number', additionalInstructions: instruction });
    }

    // stage2_closing_offer (always opportunistic when near the end of Stage 2, or when pending)
    if ((field === 'stage2_closing_offer' || this.profile.job_tenure_type_confirmed || this.profile.military_rural_confirmed || this.activeStage === '2') && !allFields.some(f => f.name === 'stage2_closing_offer')) {
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
          '"build it with what I shared", "what I shared", "use what I shared", "stated", "stated mode", ' +
          '"give me the stated mode", "explore first", "second option", "without the review", "skip the review", ' +
          '"no review", "not yet", "no", "not right now", "I would rather not", "build my affordability summary of Heloc". ' +
          'Extract "explain" if borrower asks what the credit review or soft pull involves. ' +
          'Return null if completely off-topic (wants a loan officer, asks about rates or programs). ' +
          'KEY: "I would like the affordability summary" = explore_first. "build it with what I shared" = explore_first. "Licensed loan officer" = null. ' +
          'Prefer "soft_pull" over null when affirmation is ambiguous.',
      });
    }

    // Stage 2.5 submission intent classification — skip entirely if AUS review already completed to prevent double-submission
    const ausAlreadyCompleted = !!(this.profile as any).aus_status;
    if (!ausAlreadyCompleted && (this.activeStage === '2.5' || field === 'affordability_panel_active') && !allFields.some(f => f.name === 'submit_review_intent')) {
      allFields.push({
        name: 'submit_review_intent',
        description: 'whether the borrower wants to submit their scenario/summary for formal eligibility review',
        expectedType: 'string',
        additionalInstructions:
          'Classify if the borrower indicates readiness or intent to submit their scenario for formal review or underwriting. ' +
          'Extract "submit" for: "submit", "submit for review", "run the review", "send it", "looks good", "submit this for me", ' +
          '"can you submit", "can you submit for me", "please submit", "do it for me", "submit it for me", "you can submit", ' +
          '"submit my review", "submit the review", "go ahead and submit", "I\'m ready", "go ahead", "let\'s move forward", ' +
          '"check eligibility", "proceed with review", "send my scenario", "submit now", "yes please submit". ' +
          'Return null if the borrower is asking a general question, adjusting target numbers, or talking about something else.',
      });
    }

    return { allFields, pendingIsNumeric };
  }

  private applyStage2ExtractionResults(results: any, pendingIsNumeric: boolean, text: string = ''): void {
    const field = this.currentPendingField;
    let anyUpdates = false;

    // Handle LLM-classified submission intent during Stage 2.5
    if (results.submit_review_intent?.value === 'submit') {
      console.log(`[context-manager] Stage 2.5: submit_review_intent extracted via LLM -> transitioning to Stage 5 (Escalation)!`);
      (this.profile as any).submit_review_requested = true;
      this.profile.affordability_panel_rendered = false;
      (this.profile as any).affordability_panel_closed = true;
      this.profile.aus_status = 'refer';
      this.activeStage = '5';
      this.currentPendingField = 'escalation_preference';
      return;
    }

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

    let rown = results.rent_own?.value;
    if (typeof rown === 'string') {
      rown = rown.toLowerCase().trim();
      if (rown.includes('rent')) rown = 'rent';
      else if (rown.includes('sell') && rown.includes('own')) rown = 'own_selling';
      else if (rown.includes('own')) rown = 'own';
      else rown = 'other';
    }
    if ((rown === 'rent' || rown === 'own' || rown === 'own_selling' || rown === 'other') && !this.profile.rent_own_confirmed) {
      this.profile.rent_own = rown;
      this.profile.rent_own_confirmed = true;
      anyUpdates = true;
      console.log(`[context-manager] Stage2: rent_own=${rown}`);
    }

    let rs = results.realtor_status?.value;
    if (typeof rs === 'string') {
      rs = rs.toLowerCase().trim();
      if (rs.includes('yes') || rs === 'true') rs = 'yes';
      else if (rs.includes('no') || rs === 'false') rs = 'no';
      else if (rs !== 'yes' && rs !== 'no') rs = 'other';
    }
    if ((rs === 'yes' || rs === 'no' || rs === 'other') && !this.profile.realtor_status_confirmed) {
      this.profile.realtor_status = rs;
      this.profile.realtor_status_confirmed = true;
      anyUpdates = true;
      console.log(`[context-manager] Stage2: realtor_status=${rs}`);
    }

    let rt = results.refinance_type?.value;
    if (typeof rt === 'string') {
      rt = rt.toLowerCase().trim();
      if (rt.includes('cash')) rt = 'cash_out';
      else if (rt.includes('rate') || rt.includes('term') || rt.includes('lower') || rt.includes('payment')) rt = 'rate_term';
      else if (rt !== 'cash_out' && rt !== 'rate_term') rt = 'other';
    }
    if ((rt === 'cash_out' || rt === 'rate_term' || rt === 'other') && !this.profile.refinance_type_confirmed) {
      this.profile.refinance_type = rt;
      this.profile.refinance_type_confirmed = true;
      anyUpdates = true;
      console.log(`[context-manager] Stage2: refinance_type=${rt}`);
    }

    if (results.current_mortgage_type?.value && !this.profile.current_mortgage_type) {
      const cmt = String(results.current_mortgage_type.value).toLowerCase().trim();
      this.profile.current_mortgage_type = cmt.includes('fha') ? 'fha' : cmt.includes('va') ? 'va' : cmt.includes('usda') ? 'usda' : 'conventional';
      anyUpdates = true;
      console.log(`[context-manager] Stage2: current_mortgage_type=${this.profile.current_mortgage_type}`);
    }

    if (results.closing_costs_preference?.value && !this.profile.closing_costs_preference) {
      const ccp = String(results.closing_costs_preference.value).toLowerCase().trim();
      this.profile.closing_costs_preference = ccp.includes('pocket') || ccp.includes('cash') ? 'out_of_pocket' : 'rolled_in';
      anyUpdates = true;
      console.log(`[context-manager] Stage2: closing_costs_preference=${this.profile.closing_costs_preference}`);
    }

    if (results.prior_refinance?.value && !this.profile.prior_refinance_confirmed) {
      const pr = String(results.prior_refinance.value).toLowerCase().trim();
      this.profile.prior_refinance = pr.includes('yes') ? 'yes' : pr.includes('no') ? 'no' : 'unknown';
      this.profile.prior_refinance_confirmed = true;
      anyUpdates = true;
      console.log(`[context-manager] Stage2: prior_refinance=${this.profile.prior_refinance}`);
    }

    if (results.stay_duration_years?.value && !this.profile.stay_duration_years_confirmed) {
      this.profile.stay_duration_years = results.stay_duration_years.value as any;
      this.profile.stay_duration_years_confirmed = true;
      anyUpdates = true;
      console.log(`[context-manager] Stage2: stay_duration_years=${this.profile.stay_duration_years}`);
    }

    if (results.heloc_risk_acknowledged?.value && !this.profile.heloc_risk_acknowledged) {
      this.profile.heloc_risk_acknowledged = true;
      anyUpdates = true;
      console.log(`[context-manager] Stage2: heloc_risk_acknowledged=true`);
    }

    if (results.heloc_rate_comfort?.value && !this.profile.heloc_rate_comfort) {
      const hrc = String(results.heloc_rate_comfort.value).toLowerCase().trim();
      this.profile.heloc_rate_comfort = hrc.includes('fixed') || hrc.includes('predict') ? 'fixed' : hrc.includes('variable') ? 'variable' : 'either';
      this.profile.heloc_rate_comfort_confirmed = true;
      if (this.profile.heloc_rate_comfort === 'fixed' && this.profile.transaction_type === 'TT-HEL') {
        this.profile.transaction_type = 'TT-HEQ';
        console.log(`[context-manager] Stage2: Switched transaction_type to TT-HEQ due to fixed rate preference`);
      }
      anyUpdates = true;
      console.log(`[context-manager] Stage2: heloc_rate_comfort=${this.profile.heloc_rate_comfort}`);
    }

    if (results.heloc_draw_use?.value && !this.profile.heloc_draw_use) {
      this.profile.heloc_draw_use = String(results.heloc_draw_use.value).trim();
      anyUpdates = true;
      console.log(`[context-manager] Stage2: heloc_draw_use=${this.profile.heloc_draw_use}`);
    }

    if (results.heloc_prior?.value && !this.profile.heloc_prior) {
      const hp = String(results.heloc_prior.value).toLowerCase().trim();
      this.profile.heloc_prior = hp.includes('yes') ? 'yes' : hp.includes('no') ? 'no' : 'unknown';
      this.profile.heloc_prior_confirmed = true;
      anyUpdates = true;
      console.log(`[context-manager] Stage2: heloc_prior=${this.profile.heloc_prior}`);
    }

    if (results.heloc_timeline?.value && !this.profile.heloc_timeline) {
      this.profile.heloc_timeline = String(results.heloc_timeline.value).trim();
      this.profile.heloc_timeline_confirmed = true;
      anyUpdates = true;
      console.log(`[context-manager] Stage2: heloc_timeline=${this.profile.heloc_timeline}`);
    }

    const rawPt = results.property_type?.value;
    const pt = sanitizePropertyType(rawPt);
    if (pt && !this.profile.property_type_confirmed) {
      this.profile.property_type = pt;
      this.profile.property_type_confirmed = true;
      anyUpdates = true;

      // Extract zip/city from Q42 response for property tax and system-side USDA eligibility check
      const zipData = lookupZipData(text);
      if (zipData.zip) {
        this.profile.zip_code = zipData.zip;
        console.log(`[context-manager] Stage2: extracted zip_code=${zipData.zip}, taxRate=${zipData.propertyTaxRate}`);
      }
      if (zipData.isUsdaEligible && !this.profile.military_rural) {
        this.profile.military_rural = 'rural';
        console.log(`[context-manager] Stage2: system-side USDA eligibility determined for area: ${zipData.zip || text}`);
      }
      console.log(`[context-manager] Stage2: property_type=${pt} (raw: ${rawPt})`);
    }

    // Also apply LLM-extracted zip_code from Q42 combined question
    const extractedZip = results.zip_code?.value;
    if (extractedZip && !this.profile.zip_code) {
      this.profile.zip_code = String(extractedZip);
      console.log(`[context-manager] Stage2: LLM-extracted zip_code=${this.profile.zip_code}`);
    }

    let mr = typeof results.military_rural?.value === 'string' ? results.military_rural.value.toLowerCase().trim() : results.military_rural?.value;

    if (!mr && results.military_rural?.declined) {
      // If the user explicitly says "no", the extractor often marks it as declined rather than outputting "neither".
      // Guard against background LLM hallucination: only mark as 'neither' if military_rural was the pending field or user gave explicit negation.
      if (this.currentPendingField === 'military_rural' || /\b(no|never|none|n\/a|not really|don't|do not|no military)\b/i.test(text)) {
        mr = 'neither';
      }
    } else if (mr === 'no' || mr === 'none' || mr === 'false') {
      mr = 'neither';
    }

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
        this.currentPendingField = 'contact_name';
        console.log('[context-manager]: Path A chosen via LLM — Stage 2 closing offer accepted. Transitioning to STAGE 3A OTP gate (contact_name)!');
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
        (this.profile as any).affordability_panel_closed = false;
        if (!this.profile.target_price) this.profile.target_price = 350000;
        if (!this.profile.down_payment) this.profile.down_payment = 70000;
        if (!this.profile.affordability_purchase_price) this.profile.affordability_purchase_price = this.profile.target_price;
        if (!this.profile.affordability_down_payment) this.profile.affordability_down_payment = this.profile.down_payment;
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
      this.profile.target_price = (declined || !numVal) ? 350000 : numVal;
      this.profile.target_price_confirmed = true;
    } else if (field === 'property_value') {
      this.profile.property_value = (declined || !numVal) ? (this.profile.target_price ?? 450000) : numVal;
      if (!this.profile.target_price) this.profile.target_price = this.profile.property_value;
      (this.profile as any).property_value_confirmed = true;
    } else if (field === 'first_mortgage_balance') {
      this.profile.first_mortgage_balance = (declined || !numVal) ? 250000 : numVal;
      (this.profile as any).first_mortgage_balance_confirmed = true;
    } else if (field === 'current_mortgage_rate') {
      const rawRate = rawValue ? parseFloat(rawValue.replace(/[^\d.]/g, '')) : null;
      this.profile.current_mortgage_rate = (declined || !rawRate) ? 7.0 : (rawRate > 1 ? rawRate : rawRate * 100);
      (this.profile as any).current_mortgage_rate_confirmed = true;
    } else if (field === 'current_mortgage_payment') {
      this.profile.current_mortgage_payment = (declined || !numVal) ? 2400 : numVal;
      (this.profile as any).current_mortgage_payment_confirmed = true;
    } else if (field === 'remaining_term_years') {
      this.profile.remaining_term_years = (declined || !numVal) ? 25 : numVal;
      (this.profile as any).remaining_term_years_confirmed = true;
    } else if (field === 'cash_out_amount') {
      this.profile.cash_out_amount = (declined || !numVal) ? 50000 : numVal;
      (this.profile as any).cash_out_amount_confirmed = true;
    } else if (field === 'heloc_line_amount') {
      this.profile.heloc_line_amount = (declined || !numVal) ? 75000 : numVal;
      (this.profile as any).heloc_line_amount_confirmed = true;
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
      property_value: 'estimated property value',
      first_mortgage_balance: 'current mortgage balance',
      current_mortgage_rate: 'current interest rate',
      current_mortgage_payment: 'current monthly payment',
      remaining_term_years: 'remaining loan term',
      cash_out_amount: 'cash out amount',
      heloc_line_amount: 'HELOC credit line amount',
    };
    return labels[field] ?? field;
  }

  // ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // Workflow advancement — backend owns ALL stage/field transitions
  // ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  /**
   * Calculate borrower eligibility for loan products.
   */
  private calculateEligibility(): void {
    const products: string[] = [];
    const income = (this.profile.gross_annual_income ?? 0) / 12;
    const debt = this.profile.monthly_debt ?? 0;
    const propertyValue = this.profile.property_value ?? this.profile.target_price ?? 0;
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
      products.push('VA Loan (Zero down payment, no PMI — for eligible service members)');
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
  public advanceWorkflow(): void {
    if (this.currentPendingField) {
      this.fieldAttempts[this.currentPendingField] = 0;
    }
    // ── Stage 1 ──────────────────────────────────────────────────────────────────────────
    if (this.activeStage === '1') {

      if (!this.profile.mortgage_goal_confirmed) {
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
      const isRef = this.profile.transaction_type === 'TT-REF' || this.profile.mortgage_goal === 'refinance';
      const isHel = this.profile.transaction_type === 'TT-HEL' || this.profile.mortgage_goal === 'heloc';

      // ── Auto-Recovery & Desync Protection ──
      // If we have reached or confirmed the final Stage 2 question (job_tenure_type),
      // auto-resolve any earlier unconfirmed fields so the state machine advances directly to the closing offer.
      if (this.profile.job_tenure_type_confirmed) {
        if (!this.profile.gross_annual_income_confirmed) {
          this.profile.gross_annual_income_confirmed = true;
          this.profile.gross_annual_income = this.profile.gross_annual_income ?? 0;
        }
        if (!this.profile.monthly_debt_confirmed) {
          this.profile.monthly_debt_confirmed = true;
          this.profile.monthly_debt = this.profile.monthly_debt ?? 0;
        }
        if (!this.profile.credit_range_confirmed) {
          this.profile.credit_range_confirmed = true;
          this.profile.credit_range = this.profile.credit_range ?? 'Good';
        }
        this.profile.down_payment_confirmed = true;
        this.profile.rent_own_confirmed = true;
        this.profile.realtor_status_confirmed = true;
        this.profile.target_price_confirmed = true;
        this.profile.property_type_confirmed = true;
        this.profile.military_rural_confirmed = true;
        this.profile.refinance_type_confirmed = true;
        this.profile.prior_refinance_confirmed = true;
        this.profile.stay_duration_years_confirmed = true;
        this.profile.heloc_prior_confirmed = true;
        this.profile.heloc_timeline_confirmed = true;
      }

      if (!this.profile.gross_annual_income_confirmed) {
        this.currentPendingField = 'gross_annual_income';
      } else if (!this.profile.monthly_debt_confirmed) {
        this.currentPendingField = 'monthly_debt';
      } else if (!this.profile.credit_range_confirmed) {
        this.currentPendingField = 'credit_range';
      } else if (isRef) {
        // Refinance Sequence: current_mortgage_type -> refinance_type (only if unknown) -> property_value -> first_mortgage_balance -> current_mortgage_rate -> current_mortgage_payment -> remaining_term_years -> closing_costs_preference -> [cash_out_amount] -> prior_refinance -> stay_duration_years -> job_tenure_type
        if (!this.profile.current_mortgage_type) {
          this.currentPendingField = 'current_mortgage_type';
        } else if (this.profile.current_mortgage_type === 'usda') {
          // USDA does not allow cash-out under any circumstance — auto set rate_term
          this.profile.refinance_type = 'rate_term';
          this.profile.refinance_type_confirmed = true;
          if (!(this.profile as any).property_value_confirmed && !this.profile.property_value) {
            this.currentPendingField = 'property_value';
          } else if (!(this.profile as any).first_mortgage_balance_confirmed && !this.profile.first_mortgage_balance) {
            this.currentPendingField = 'first_mortgage_balance';
          } else if (!(this.profile as any).current_mortgage_rate_confirmed && !this.profile.current_mortgage_rate) {
            this.currentPendingField = 'current_mortgage_rate';
          } else if (!(this.profile as any).current_mortgage_payment_confirmed && !this.profile.current_mortgage_payment) {
            this.currentPendingField = 'current_mortgage_payment';
          } else if (!(this.profile as any).remaining_term_years_confirmed && !this.profile.remaining_term_years) {
            this.currentPendingField = 'remaining_term_years';
          } else if (!this.profile.closing_costs_preference) {
            this.currentPendingField = 'closing_costs_preference';
          } else if (!this.profile.prior_refinance_confirmed && !this.profile.prior_refinance) {
            this.currentPendingField = 'prior_refinance';
          } else if (!this.profile.stay_duration_years_confirmed && !this.profile.stay_duration_years) {
            this.currentPendingField = 'stay_duration_years';
          } else if (!this.profile.job_tenure_type_confirmed) {
            this.currentPendingField = 'job_tenure_type';
          } else {
            this.calculateEligibility();
            this.currentPendingField = 'stage2_closing_offer';
            console.log('[context-manager]: Transitioning to STAGE 2 Closing Transition (Refinance - USDA)!');
          }
        } else if (this.profile.current_mortgage_type === 'unknown' && !this.profile.refinance_type_confirmed) {
          this.currentPendingField = 'refinance_type';
        } else if (!(this.profile as any).property_value_confirmed && !this.profile.property_value) {
          this.currentPendingField = 'property_value';
        } else if (!(this.profile as any).first_mortgage_balance_confirmed && !this.profile.first_mortgage_balance) {
          this.currentPendingField = 'first_mortgage_balance';
        } else if (!(this.profile as any).current_mortgage_rate_confirmed && !this.profile.current_mortgage_rate) {
          this.currentPendingField = 'current_mortgage_rate';
        } else if (!(this.profile as any).current_mortgage_payment_confirmed && !this.profile.current_mortgage_payment) {
          this.currentPendingField = 'current_mortgage_payment';
        } else if (!(this.profile as any).remaining_term_years_confirmed && !this.profile.remaining_term_years) {
          this.currentPendingField = 'remaining_term_years';
        } else if (!this.profile.closing_costs_preference) {
          this.currentPendingField = 'closing_costs_preference';
        } else if (this.profile.refinance_type === 'cash_out' && !(this.profile as any).cash_out_amount_confirmed && !this.profile.cash_out_amount) {
          this.currentPendingField = 'cash_out_amount';
        } else if (!this.profile.prior_refinance_confirmed && !this.profile.prior_refinance) {
          this.currentPendingField = 'prior_refinance';
        } else if (!this.profile.stay_duration_years_confirmed && !this.profile.stay_duration_years) {
          this.currentPendingField = 'stay_duration_years';
        } else if (!this.profile.job_tenure_type_confirmed) {
          this.currentPendingField = 'job_tenure_type';
        } else {
          this.calculateEligibility();
          this.currentPendingField = 'stage2_closing_offer';
          console.log('[context-manager]: Transitioning to STAGE 2 Closing Transition (Refinance)!');
        }
      } else if (isHel) {
        // HELOC Sequence: heloc_risk_acknowledged -> heloc_rate_comfort -> property_value -> first_mortgage_balance -> heloc_line_amount -> heloc_draw_use -> heloc_prior -> heloc_timeline -> job_tenure_type
        if (!this.profile.heloc_risk_acknowledged) {
          this.currentPendingField = 'heloc_risk_acknowledged';
        } else if (!this.profile.heloc_rate_comfort) {
          this.currentPendingField = 'heloc_rate_comfort';
        } else if (!(this.profile as any).property_value_confirmed && !this.profile.property_value) {
          this.currentPendingField = 'property_value';
        } else if (!(this.profile as any).first_mortgage_balance_confirmed && !this.profile.first_mortgage_balance) {
          this.currentPendingField = 'first_mortgage_balance';
        } else if (!(this.profile as any).heloc_line_amount_confirmed && !this.profile.heloc_line_amount) {
          this.currentPendingField = 'heloc_line_amount';
        } else if (!this.profile.heloc_draw_use) {
          this.currentPendingField = 'heloc_draw_use';
        } else if (!this.profile.heloc_prior_confirmed && !this.profile.heloc_prior) {
          this.currentPendingField = 'heloc_prior';
        } else if (!this.profile.heloc_timeline_confirmed && !this.profile.heloc_timeline) {
          this.currentPendingField = 'heloc_timeline';
        } else if (!this.profile.job_tenure_type_confirmed) {
          this.currentPendingField = 'job_tenure_type';
        } else {
          this.calculateEligibility();
          this.currentPendingField = 'stage2_closing_offer';
          console.log('[context-manager]: Transitioning to STAGE 2 Closing Transition (HELOC)!');
        }
      } else {
        // Home Purchase Sequence
        if (!this.profile.down_payment_confirmed) {
          this.currentPendingField = 'down_payment';
        } else if (!this.profile.rent_own_confirmed) {
          this.currentPendingField = 'rent_own';
        } else if (!this.profile.realtor_status_confirmed) {
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
          console.log('[context-manager]: Transitioning to STAGE 2 Closing Transition (Purchase)!');
        }
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
      // -- v8.7 OTP Gate: contact_name → contact_email → contact_mobile → otp_verification → soft_pull_authorization → prefill walkthrough --
      if (!this.profile.contact_name) {
        this.currentPendingField = 'contact_name';
      } else if (!this.profile.contact_email) {
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
        this.currentPendingField = 'escalation_preference';
        console.log('[context-manager]: Document checklist acknowledged! Transitioning to STAGE 5 (MLO Escalation)!');
      }
    } else if (this.activeStage === '5') {
      if (!this.profile.escalation_preference) {
        this.currentPendingField = 'escalation_preference';
      } else if (this.profile.escalation_preference === 'scheduled_call' && !this.profile.scheduled_call_time) {
        this.currentPendingField = 'scheduled_call_time';
      } else {
        this.currentPendingField = null;
        console.log('[context-manager]: Stage 5 Escalation complete.');
      }
    }
  }

  getStaticInstructions(): string {
    return buildStaticInstructions(this.activeStage, this.profile);
  }

  getDynamicContext(): string {
    return buildDynamicContext(this.profile, this.currentPendingField, this.activeStage, this.lowConfidence);
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

  buildTextMessages(systemPrompt?: string): Array<{ role: string; content: string }> {
    const staticPrompt = systemPrompt ?? this.getStaticInstructions();
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: staticPrompt },
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

    // Append dynamic state context at the end to anchor static prefix cache
    const dynamicContext = this.getDynamicContext();
    if (dynamicContext) {
      messages.push({
        role: 'system',
        content: dynamicContext,
      });
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

    if (field === 'mortgage_goal') {
      this.profile.mortgage_goal = 'purchase';
      this.profile.transaction_type = 'TT-PUR';
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
    } else if ([
      'gross_annual_income',
      'monthly_debt',
      'credit_range',
      'refinance_type',
      'down_payment',
      'target_price',
      'rent_own',
      'realtor_status',
      'property_type',
      'military_rural',
      'job_tenure_type',
      'property_value',
      'first_mortgage_balance',
      'current_mortgage_rate',
      'current_mortgage_payment',
      'current_mortgage_type',
      'remaining_term_years',
      'closing_costs_preference',
      'cash_out_amount',
      'heloc_line_amount',
      'heloc_risk_acknowledged',
      'heloc_draw_use',
      'heloc_prior',
      'heloc_timeline',
    ].includes(field)) {
      if ([
        'gross_annual_income',
        'monthly_debt',
        'down_payment',
        'target_price',
        'property_value',
        'first_mortgage_balance',
        'current_mortgage_rate',
        'current_mortgage_payment',
        'remaining_term_years',
        'cash_out_amount',
        'heloc_line_amount',
      ].includes(field)) {
        this.commitStage2Value(field, null, true);
      } else {
        if (field === 'credit_range') this.profile.credit_range = null;
        if (field === 'refinance_type') this.profile.refinance_type = 'rate_term';
        if (field === 'current_mortgage_type') this.profile.current_mortgage_type = 'conventional';
        if (field === 'closing_costs_preference') this.profile.closing_costs_preference = 'rolled_in';
        if (field === 'heloc_risk_acknowledged') this.profile.heloc_risk_acknowledged = true;
        if (field === 'heloc_draw_use') this.profile.heloc_draw_use = 'home improvement';
        if (field === 'heloc_prior') this.profile.heloc_prior = 'no';
        if (field === 'heloc_timeline') this.profile.heloc_timeline = 'not specified';
        if (field === 'rent_own') this.profile.rent_own = 'rent';
        if (field === 'realtor_status') this.profile.realtor_status = 'no';
        if (field === 'property_type') this.profile.property_type = 'single_family';
        if (field === 'military_rural') this.profile.military_rural = 'neither';
        if (field === 'job_tenure_type') this.profile.job_tenure_type = 'not specified';
        (this.profile as any)[`${field}_confirmed`] = true;
        this.advanceWorkflow();
      }
    } else if (field === 'contact_name') {
      this.profile.contact_name = 'Valued Member';
      this.profile.contact_name_confirmed = true;
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

  const lower = str.toLowerCase();
  if (lower.includes('excellent')) return 'Excellent';
  if (lower.includes('very good') || lower.includes('great')) return 'Very Good';
  if (lower.includes('good')) return 'Good';
  if (lower.includes('fair') || lower.includes('average') || lower.includes('ok') || lower.includes('okay')) return 'Fair';
  if (lower.includes('poor') || lower.includes('bad') || lower.includes('low')) return 'Poor';

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

export function sanitizePropertyType(val: string | null | undefined): 'single_family' | 'condo' | 'townhome' | 'multi_family' | 'other' | null {
  if (!val || typeof val !== 'string') return null;
  const v = val.toLowerCase().trim();
  if (!v || v === 'null' || v === 'none' || v === 'undefined') return null;

  if (v.includes('multi') || v.includes('duplex') || v.includes('triplex') || v.includes('fourplex') || v.includes('2 family') || v.includes('two family') || v.includes('2-family')) {
    return 'multi_family';
  }
  if (v.includes('condo') || v.includes('condominium')) {
    return 'condo';
  }
  if (v.includes('town')) {
    return 'townhome';
  }
  if (v.includes('single') || v.includes('house') || v.includes('detached')) {
    return 'single_family';
  }

  // ── Universal Catch-All Safety Net ──
  // Any non-empty property type response (e.g. "co-op", "manufactured home", "cabin", "land")
  // automatically falls back to 'other' so property_type_confirmed is set to true and the workflow NEVER stalls!
  return 'other';
}

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
import { extractProfileField, classifyConfirmation } from './llm-extractor.js';


export type TurnLogEntry = {
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
};

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

  constructor(
    private readonly summarizationLlm: LLM,
    private readonly metrics: LatencyTracker,
  ) {}

  getProfile(): BorrowerProfile {
    return this.profile;
  }

  getActiveStage(): string {
    return this.activeStage;
  }

  getPendingField(): string | null {
    return this.currentPendingField;
  }

  async onUserTurn(text: string): Promise<void> {
    const trimmed = text.trim();
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

    // 1. Handle global pending confirmations first (excluding Stage 2 which has local loop logic)
    const handled = await this.handleGlobalConfirmation(trimmed);
    if (handled) {
      return;
    }

    // 2. Check if the user is correcting an already confirmed field
    const corrected = await this.checkForGlobalCorrections(trimmed);
    if (corrected) {
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
        return;
      }
    }

    if (!this.currentPendingField && !['3', '3A', '3B'].includes(this.activeStage.toUpperCase())) {
      return;
    }

    if (this.activeStage === '1') {
      await this.runStage1Extraction(trimmed);
    } else if (this.activeStage === '2') {
      await this.runStage2Extraction(trimmed);
    } else if (this.activeStage === '3') {
      await this.runStage3Extraction(trimmed);
    } else if (this.activeStage === '3A') {
      await this.runStage3AExtraction(trimmed);
    } else if (this.activeStage === '3B') {
      await this.runStage3BExtraction(trimmed);
    } else if (this.activeStage === '4') {
      await this.runStage4Extraction(trimmed);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Stage 3 & 3A extraction and validation
  // ─────────────────────────────────────────────────────────────────────────

  private async runStage3Extraction(text: string): Promise<void> {
    const lastQuestion = this.getLastAssistantUtterance();

    if (this.currentPendingField === 'product_selection_feedback') {
      const lowerText = text.toLowerCase();
      if (lowerText.includes('soft pull') || lowerText.includes('credit check') || lowerText.includes('authorize') || lowerText.includes('soft check')) {
        console.log('[context-manager]: Heuristic matched for soft pull consent. Advancing workflow to Stage 3A!');
        this.advanceWorkflow();
        return;
      }

      // LLM prompts "Does that make sense or do you have questions?"
      // We look to see if they say they want to proceed, or have no questions, or ask a question.
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
    }
  }

  private async runStage3AExtraction(text: string): Promise<void> {
    const lastQuestion = this.getLastAssistantUtterance();

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
      const decision = await classifyConfirmation(text, lastQuestion, step, 'Does that look right or is anything out of date?');
      
      const confirmed = this.profile.prefilled_fields_confirmed || {};
      
      if (decision === 'no') {
        if (step === 'prefill_employer') {
          const res = await extractProfileField(
            text,
            lastQuestion,
            'employer_correction',
            'corrected employer name',
            'string',
            'Extract the corrected employer name mentioned by the user (e.g. "Hexler Tech"). If not found, return null.'
          );
          if (res.value) {
            this.profile.employer = res.value as string;
            console.log(`[context-manager]: Corrected employer to ${res.value}`);
          }
        } else if (step === 'prefill_name_address') {
          const resName = await extractProfileField(
            text,
            lastQuestion,
            'name_correction',
            'corrected borrower name',
            'string',
            'Extract the corrected borrower full name. If not found, return null.'
          );
          if (resName.value) {
            this.profile.borrower_name = resName.value as string;
            console.log(`[context-manager]: Corrected borrower name to ${resName.value}`);
          }
        } else if (step === 'prefill_credit_range') {
          const resCredit = await extractProfileField(
            text,
            lastQuestion,
            'credit_correction',
            'corrected credit score or range',
            'string',
            'Extract the corrected credit score or range. If not found, return null.'
          );
          if (resCredit.value) {
            this.profile.credit_range = resCredit.value as string;
            console.log(`[context-manager]: Corrected credit range to ${resCredit.value}`);
          }
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

    if (field === 'marital_status') {
      const res = await extractProfileField(
        text,
        lastQuestion,
        'marital_status',
        'marital status (Married, Separated, or Unmarried)',
        'string',
        'Extract marital status. Options are "married", "separated", or "unmarried". If single, divorced, or widowed, return "unmarried". If they decline, skip, or say they don\'t know, return null.'
      );
      if (res.value) {
        this.profile.marital_status = res.value as any;
        this.profile.marital_status_confirmed = true;
        this.advanceWorkflow();
      }
    } else if (field === 'co_borrower') {
      const decision = await classifyConfirmation(text, lastQuestion, 'co_borrower', 'Will your spouse be a co-borrower on this mortgage loan?');
      if (decision === 'yes') {
        this.profile.co_borrower = 'yes';
        this.profile.co_borrower_confirmed = true;
        this.advanceWorkflow();
      } else if (decision === 'no') {
        this.profile.co_borrower = 'no';
        this.profile.co_borrower_confirmed = true;
        this.advanceWorkflow();
      }
    } else if (field === 'dependents') {
      const res = await extractProfileField(
        text,
        lastQuestion,
        'dependents',
        'number of dependents',
        'number',
        'Extract the number of dependents (children or others they support financially). If they say none, zero, or no dependents, return 0. If decline or skip, return null.'
      );
      if (res.value !== null) {
        this.profile.dependents = res.value as number;
        this.profile.dependents_confirmed = true;
        this.advanceWorkflow();
      }
    } else if (field === 'ssn_confirm') {
      const res = await extractProfileField(
        text,
        lastQuestion,
        'ssn_confirm',
        'whether the borrower has finished entering their SSN on screen',
        'string',
        'Determine if the user indicates they have entered, typed, or submitted their SSN, or say "done", "okay", "yes", or similar. If yes, return "yes". If skip or not sure, return null.'
      );
      if (res.value === 'yes' || /\b\d{9}\b/.test(text) || /\b\d{3}-\d{2}-\d{4}\b/.test(text) || text.includes('989999999')) {
        this.profile.ssn_confirmed = true;
        this.advanceWorkflow();
      }
    } else if (field === 'employment_details') {
      const resTitle = await extractProfileField(
        text,
        lastQuestion,
        'employment_position',
        'current job title or position',
        'string',
        'Extract their job title or position (e.g. software engineer, manager). If not found, return null.'
      );
      const resYears = await extractProfileField(
        text,
        lastQuestion,
        'employment_years',
        'number of years employed',
        'number',
        'Extract the number of years they have worked at this job. If less than a year, return 0. If not found, return null.'
      );
      const resSelf = await extractProfileField(
        text,
        lastQuestion,
        'self_employed',
        'whether the user is self-employed',
        'string',
        'Extract whether they are self-employed. If they explicitly mention self-employed, independent contractor, own business, return "yes". If they say no, W-2, work for a company, return "no". If not found, return null.'
      );

      if (resTitle.value !== null || resYears.value !== null || resSelf.value !== null) {
        if (resTitle.value !== null) this.profile.employment_position = resTitle.value as string;
        if (resYears.value !== null) this.profile.employment_years = resYears.value as number;
        if (resSelf.value !== null) this.profile.self_employed = resSelf.value === 'yes';
        this.profile.employment_confirmed = true;
        this.advanceWorkflow();
      }
    } else if (field === 'checking_savings') {
      const res = await extractProfileField(
        text,
        lastQuestion,
        'checking_savings_balance',
        'checking and savings account balance',
        'number',
        'Extract the total cash balance in their checking and savings accounts. If skip, return null.'
      );
      if (res.value !== null) {
        this.profile.checking_savings_balance = res.value as number;
        this.profile.checking_savings_confirmed = true;
        this.advanceWorkflow();
      }
    } else if (field === 'declarations') {
      const resBankruptcy = await extractProfileField(
        text,
        lastQuestion,
        'declarations_bankruptcy',
        'bankruptcy declaration in past 7 years',
        'string',
        'Extract whether they had a bankruptcy in the past 7 years. Return "yes" if yes, "no" if no. If not found, return null.'
      );
      const resForeclosure = await extractProfileField(
        text,
        lastQuestion,
        'declarations_foreclosure',
        'foreclosure declaration in past 7 years',
        'string',
        'Extract whether they had a foreclosure, short sale, or judgment in the past 7 years. Return "yes" if yes, "no" if no. If not found, return null.'
      );

      if (resBankruptcy.value !== null || resForeclosure.value !== null) {
        this.profile.declarations_bankruptcy = resBankruptcy.value === 'yes';
        this.profile.declarations_foreclosure = resForeclosure.value === 'yes';
        this.profile.declarations_confirmed = true;
        this.advanceWorkflow();
      }
    } else if (field === 'hmda') {
      const res = await extractProfileField(
        text,
        lastQuestion,
        'hmda',
        'HMDA demographic details or whether the user wants to skip',
        'string',
        'Determine if the user has answered the fair lending questions (e.g. provided race, sex) or explicitly said they want to skip, refuse, or prefer not to answer. If they provided demographics or explicitly skipped, return "yes". If not sure, return null.'
      );
      if (res.value === 'yes') {
        this.profile.hmda_completed = true;
        this.advanceWorkflow();
      }
    } else if (field === 'submit_confirmation') {
      const decision = await classifyConfirmation(text, lastQuestion, 'ready_to_submit', 'Ready to submit your application?');
      if (decision === 'yes') {
        this.profile.ready_to_submit = true;
        this.advanceWorkflow();
      }
    }
  }

  private async runStage4Extraction(text: string): Promise<void> {
    const lastQuestion = this.getLastAssistantUtterance();
    const field = this.currentPendingField;

    if (field === 'aus_processing') {
      // Simulate waiting turn processing. Once the borrower asks for status or says anything, we calculate result.
      const decision = this.runUnderwritingRules();
      this.profile.aus_status = decision;
      this.profile.aus_confirmed = true;
      this.advanceWorkflow();
    } else if (field === 'checklist_acknowledgement') {
      const decision = await classifyConfirmation(text, lastQuestion, 'checklist_discussed', 'Do you understand the list and have these documents available?');
      if (decision === 'yes') {
        this.profile.checklist_discussed = true;
        this.advanceWorkflow();
      }
    }
  }

  private runUnderwritingRules(): 'approve' | 'refer' | 'timeout' {
    const text = this.turnLog[this.turnLog.length - 1]?.text?.toLowerCase() ?? '';
    if (text.includes('timeout') || text.includes('system delay') || text.includes('system timeout')) {
      return 'timeout';
    }

    const income = this.profile.gross_monthly_income ?? 0;
    const debt = this.profile.monthly_debt ?? 0;
    const propertyValue = this.profile.property_value ?? 0;
    const downPayment = this.profile.down_payment ?? 0;

    let creditScore = 700; // Default
    if (this.profile.credit_range) {
      const match = this.profile.credit_range.match(/\d+/);
      if (match) {
        creditScore = parseInt(match[0], 10);
      }
    }

    const loanAmount = propertyValue - downPayment;
    const ltv = propertyValue > 0 ? (loanAmount / propertyValue) * 100 : 0;
    const dti = income > 0 ? (debt / income) * 100 : 0;

    // Trigger refer if bankruptcy/foreclosure declared, or high DTI/LTV ratios, or low credit
    if (
      this.profile.declarations_bankruptcy ||
      this.profile.declarations_foreclosure ||
      dti > 45 ||
      ltv > 97 ||
      creditScore < 620
    ) {
      return 'refer';
    }

    return 'approve';
  }

  onAgentTurn(text: string): void {
    const trimmed = text.trim();
    if (!trimmed) return;
    this.turnLog.push({ role: 'assistant', text: trimmed, timestamp: Date.now() });
    this.profile.bridge_to_say = null;
    this.lastProcessedInput = null;
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

  // ─────────────────────────────────────────────────────────────────────────
  // Stage 1 extraction
  // ─────────────────────────────────────────────────────────────────────────

  private async runStage1Extraction(text: string): Promise<void> {
    const lastQuestion = this.getLastAssistantUtterance();

    if (this.currentPendingField === 'borrower_name') {
      const res = await extractProfileField(
        text,
        lastQuestion,
        'borrower_name',
        "The user's first/given name or full name",
        'string',
        'Extract the first name or name the user wants to be called. If they say "my name is Muhammad" extract "Muhammad". If they just say "Muhammad", extract "Muhammad". If not found, return null.'
      );
      if (res.value) {
        this.profile.borrower_name = res.value as string;
        this.profile.borrower_name_confirmed = true;
        this.advanceWorkflow();
      }
    } else if (this.currentPendingField === 'mortgage_goal') {
      const res = await extractProfileField(
        text,
        lastQuestion,
        'mortgage_goal',
        "Whether they want to purchase/buy a new home, or refinance an existing mortgage",
        'string',
        'Extract either "purchase" or "refinance". Only return one of these two strings (all lowercase) if clearly indicated. Otherwise return null.'
      );
      if (res.value === 'purchase' || res.value === 'refinance') {
        this.profile.mortgage_goal = res.value;
        this.profile.mortgage_goal_confirmed = true;
        this.advanceWorkflow();
      }
    } else if (this.currentPendingField === 'timeline') {
      const res = await extractProfileField(
        text,
        lastQuestion,
        'timeline',
        "When they plan to purchase or refinance (e.g. in 3 months, next year, ASAP, etc.)",
        'string',
        'Extract the user timeline. If they indicate a timeline, extract a concise summary (e.g. "within 3 months", "ASAP", "next year"). If not mentioned, return null.'
      );
      if (res.value) {
        this.profile.timeline = res.value as string;
        this.profile.timeline_confirmed = true;
        this.advanceWorkflow();
      }
    } else if (this.currentPendingField === 'property_state') {
      const res = await extractProfileField(
        text,
        lastQuestion,
        'property_state',
        "The US state where they are buying/refinancing (e.g. California or CA)",
        'string',
        'Identify the US state mentioned. Return the standard full state name (e.g. "California", "Texas"). If the user explicitly declines, skips, says they don\'t mind, have no preference, are open to anywhere, don\'t know, or similar, set "declined" to true and value to null.'
      );
      if (res.declined) {
        this.profile.property_state = 'not_specified';
        this.profile.property_state_confirmed = true;
        this.advanceWorkflow();
      } else if (res.value) {
        this.profile.property_state = res.value as string;
        this.profile.property_state_confirmed = true;
        this.advanceWorkflow();
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Stage 2 extraction — two-phase: extract → await confirm
  // ─────────────────────────────────────────────────────────────────────────

  private async runStage2Extraction(text: string): Promise<void> {
    // ── Phase 1: If we are waiting for confirmation of a pending value ─────
    if (this.profile.pending_confirm_field && this.profile.pending_confirm_value != null) {
      await this.handleStage2Confirmation(text);
      return;
    }

    // ── Phase 2: Extract the field currently pending ───────────────────────
    const field = this.currentPendingField;
    const lastQuestion = this.getLastAssistantUtterance();

    if (field === 'gross_monthly_income' || field === 'down_payment' || field === 'property_value') {
      const fieldDesc = field === 'gross_monthly_income' ? 'gross monthly income'
                      : field === 'down_payment' ? 'down payment savings'
                      : 'purchase property value';

      let instruction = 'Extract the single total dollar amount. If the user declines, skips, says they don\'t know, or don\'t want to answer, set "declined" to true.';
      if (field === 'down_payment') {
        const propertyValue = this.profile.property_value;
        const pctInstruction = propertyValue 
          ? `If the user specifies a percentage (e.g. "15%"), calculate that percentage of the property value ($${propertyValue}) and return it as the final integer dollar amount.`
          : '';
        instruction += ` ${pctInstruction}`;
      }

      const res = await extractProfileField(
        text,
        lastQuestion,
        field,
        fieldDesc,
        'number',
        instruction
      );

      if (res.declined) {
        this.commitStage2Value(field, null, true);
      } else if (res.value !== null) {
        this.profile.pending_confirm_field = field;
        this.profile.pending_confirm_value = `$${(res.value as number).toLocaleString()}`;
        console.log(`[context-manager] Stage2: extracted ${field}=${res.value}, awaiting confirm`);
      }
    } else if (field === 'monthly_debt') {
      const res = await extractProfileField(
        text,
        lastQuestion,
        'monthly_debt',
        'monthly debt obligations',
        'number',
        'Extract the monthly debt amount. IMPORTANT: If the user lists multiple recurring monthly debts (e.g. car loan, student loan, credit cards), sum them all up and return the total sum as the value. If they say they have no monthly debt, set value to 0. If they decline, skip, or say they don\'t know, set "declined" to true.'
      );

      if (res.declined) {
        this.commitStage2Value(field, null, true);
      } else if (res.value !== null) {
        this.profile.pending_confirm_field = field;
        this.profile.pending_confirm_value = `$${(res.value as number).toLocaleString()}`;
        console.log(`[context-manager] Stage2: extracted monthly_debt=${res.value}, awaiting confirm`);
      }
    } else if (field === 'credit_range') {
      const res = await extractProfileField(
        text,
        lastQuestion,
        'credit_score',
        'credit score number',
        'number',
        'Extract the credit score as a number (e.g. 720, 680). If they only mention a tier or range (e.g. Excellent or 700-750), return null. We strictly require an actual numeric credit score value. If they decline, skip, or say they don\'t know, set "declined" to true.'
      );

      if (res.declined) {
        this.commitStage2Value(field, null, true);
      } else if (res.value !== null) {
        this.profile.pending_confirm_field = 'credit_range';
        this.profile.pending_confirm_value = String(res.value);
        console.log(`[context-manager] Stage2: extracted credit score number=${res.value}, awaiting confirm`);
      }
    }
  }

  private async handleStage2Confirmation(text: string): Promise<void> {
    const field = this.profile.pending_confirm_field!;
    const rawValue = this.profile.pending_confirm_value!;
    const lastQuestion = this.getLastAssistantUtterance();

    const decision = await classifyConfirmation(text, lastQuestion, field, rawValue);

    if (decision === 'yes') {
      console.log(`[context-manager] Stage2: ${field} confirmed → ${rawValue}`);
      this.commitStage2Value(field, rawValue, false);
    } else if (decision === 'no') {
      console.log(`[context-manager] Stage2: ${field} correction incoming — resetting pending`);
      this.profile.pending_confirm_field = null;
      this.profile.pending_confirm_value = null;
      await this.runStage2Extraction(text);
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

    if (field === 'gross_monthly_income') {
      this.profile.gross_monthly_income = declined ? null : numVal;
      this.profile.gross_monthly_income_confirmed = true;
    } else if (field === 'monthly_debt') {
      this.profile.monthly_debt = declined ? null : numVal;
      this.profile.monthly_debt_confirmed = true;
    } else if (field === 'credit_range') {
      this.profile.credit_range = declined ? null : rawValue;
      this.profile.credit_range_confirmed = true;
    } else if (field === 'down_payment') {
      this.profile.down_payment = declined ? null : numVal;
      this.profile.down_payment_confirmed = true;
    } else if (field === 'property_value') {
      this.profile.property_value = declined ? null : numVal;
      this.profile.property_value_confirmed = true;
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
      gross_monthly_income: 'gross monthly income',
      monthly_debt: 'total monthly debt payments',
      credit_range: 'credit score',
      down_payment: 'down payment',
      property_value: 'estimated home purchase price',
    };
    return labels[field] ?? field;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Workflow advancement — backend owns ALL stage/field transitions
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Calculate borrower eligibility for loan products.
   */
  private calculateEligibility(): void {
    const products: string[] = [];
    const income = this.profile.gross_monthly_income ?? 0;
    const debt = this.profile.monthly_debt ?? 0;
    const propertyValue = this.profile.property_value ?? 0;
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
    // USDA Loan (assume rural or fallback): Credit Score >= 640, DTI <= 41%
    if (creditScore >= 640 && dti <= 41) {
      products.push('USDA Rural Home Loan (Zero down payment option for qualified properties)');
    }

    if (products.length === 0) {
      products.push('Specialized Assistance Programs (Custom credit union portfolio options)');
    }

    this.profile.eligible_products = products;
  }

  /**
   * Advance workflow stage and pending objective sequentially.
   * Called ONLY after a field is confirmed (or declined). LLM never calls this.
   */
  private advanceWorkflow(): void {
    // ── Stage 1 ──────────────────────────────────────────────────────────────
    if (!this.profile.borrower_name_confirmed) {
      this.currentPendingField = 'borrower_name';
    } else if (!this.profile.mortgage_goal_confirmed) {
      this.currentPendingField = 'mortgage_goal';
    } else if (!this.profile.timeline_confirmed) {
      this.currentPendingField = 'timeline';
    } else if (!this.profile.property_state_confirmed) {
      this.currentPendingField = 'property_state';
    // ── Stage 1 → Stage 2 transition ────────────────────────────────────────
    } else if (this.activeStage === '1') {
      this.activeStage = '2';
      this.currentPendingField = 'gross_monthly_income';
      this.profile.bridge_to_say = 'stage1_to_stage2';
      console.log('[context-manager]: ✅ Transitioning to STAGE 2 Pre-Qualification Discovery!');
    // ── Stage 2 ──────────────────────────────────────────────────────────────
    } else if (!this.profile.gross_monthly_income_confirmed) {
      this.currentPendingField = 'gross_monthly_income';
    } else if (!this.profile.monthly_debt_confirmed) {
      this.currentPendingField = 'monthly_debt';
    } else if (!this.profile.credit_range_confirmed) {
      this.currentPendingField = 'credit_range';
    } else if (!this.profile.down_payment_confirmed) {
      this.currentPendingField = 'down_payment';
    } else if (!this.profile.property_value_confirmed) {
      this.currentPendingField = 'property_value';
    // ── Stage 2 → Stage 3 transition ────────────────────────────────────────
    } else if (this.activeStage === '2') {
      this.calculateEligibility();
      this.currentPendingField = 'product_selection_feedback';
      this.activeStage = '3';
      this.profile.bridge_to_say = 'stage2_to_stage3';
      console.log('[context-manager]: ✅ Transitioning to STAGE 3 Product Guidance!');
    // ── Stage 3 / 3A Transitions ─────────────────────────────────────────────
    } else if (this.activeStage === '3') {
      if (this.currentPendingField === 'product_selection_feedback') {
        this.currentPendingField = 'soft_pull_authorization';
        this.activeStage = '3A';
        this.profile.soft_pull_consent = 'pending';
        console.log('[context-manager]: ✅ Transitioning to STAGE 3A Soft Pull Consent!');
      }
    } else if (this.activeStage === '3A') {
      const confirmed = this.profile.prefilled_fields_confirmed || {};
      if (this.profile.soft_pull_consent === 'accepted') {
        if (!confirmed.name_address) {
          this.currentPendingField = 'prefill_name_address';
        } else if (!confirmed.employer) {
          this.currentPendingField = 'prefill_employer';
        } else if (!confirmed.accounts) {
          this.currentPendingField = 'prefill_accounts';
        } else if (!confirmed.credit_range) {
          this.currentPendingField = 'prefill_credit_range';
        } else {
          // Finished prefilled walkthrough, go to Stage 3B (Application completion)
          this.currentPendingField = 'marital_status';
          this.activeStage = '3B';
          console.log('[context-manager]: ✅ Prefills confirmed! Transitioning to STAGE 3B!');
        }
      } else if (this.profile.soft_pull_consent === 'declined') {
        // Go straight to Stage 3B manual completion
        this.currentPendingField = 'marital_status';
        this.activeStage = '3B';
        console.log('[context-manager]: ✅ Consent declined. Transitioning to STAGE 3B (manual)!');
      }
    } else if (this.activeStage === '3B') {
      if (!this.profile.marital_status_confirmed) {
        this.currentPendingField = 'marital_status';
      } else if (this.profile.marital_status === 'married' && !this.profile.co_borrower_confirmed) {
        this.currentPendingField = 'co_borrower';
      } else if (!this.profile.dependents_confirmed) {
        this.currentPendingField = 'dependents';
      } else if (!this.profile.ssn_confirmed) {
        this.currentPendingField = 'ssn_confirm';
      } else if (!this.profile.employment_confirmed) {
        this.currentPendingField = 'employment_details';
      } else if (!this.profile.checking_savings_confirmed) {
        this.currentPendingField = 'checking_savings';
      } else if (!this.profile.declarations_confirmed) {
        this.currentPendingField = 'declarations';
      } else if (!this.profile.hmda_completed) {
        this.currentPendingField = 'hmda';
      } else if (!this.profile.ready_to_submit) {
        this.currentPendingField = 'submit_confirmation';
      } else {
        // Application completed! Transition to Stage 4
        this.activeStage = '4';
        this.currentPendingField = 'aus_processing';
        this.profile.aus_status = 'waiting';
        console.log('[context-manager]: ✅ Application completed and authorized for submission! Transitioning to STAGE 4!');
      }
    } else if (this.activeStage === '4') {
      if (this.profile.aus_status === 'waiting') {
        this.currentPendingField = 'aus_processing';
      } else if (!this.profile.checklist_discussed) {
        this.currentPendingField = 'checklist_acknowledgement';
      } else {
        // All Stage 4 completed! Transition to Stage 5 (Escalation compliance)
        this.activeStage = '5';
        this.currentPendingField = null;
        console.log('[context-manager]: ✅ Document checklist acknowledged! Transitioning to STAGE 5 (MLO Escalation)!');
      }
    }
  }

  /** Get active instructions assembled using active profile variables */
  getActiveInstructions(): string {
    return buildSessionPrompt(this.profile, this.currentPendingField, this.activeStage, this.lowConfidence);
  }

  setLowConfidenceFlag(value: boolean): void {
    this.lowConfidence = value;
  }

  /** Called from MetricsCollected — real token count from OpenAI Realtime. */
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
        `[context]: Compacted ${itemsBefore}→${itemsAfter} items, ~${textTokensBefore}→${textTokensAfter} text tokens (last API input: ${this.lastInputTokens})`,
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
      console.log(`[context-manager] Global: ${field} confirmed → ${rawValue}`);
      this.commitGlobalValue(field, rawValue);
      this.advanceWorkflow();
      return true;
    } else if (decision === 'no') {
      console.log(`[context-manager] Global: ${field} correction incoming — resetting pending`);
      this.profile.pending_confirm_field = null;
      this.profile.pending_confirm_value = null;
      await this.checkForGlobalCorrections(text);
      return true;
    }
    return false;
  }

  private commitGlobalValue(field: string, rawValue: string): void {
    this.profile.pending_confirm_field = null;
    this.profile.pending_confirm_value = null;

    const isNumeric = ['gross_monthly_income', 'monthly_debt', 'down_payment', 'property_value'].includes(field);
    const numVal = isNumeric ? this.parseDollarString(rawValue) : null;

    if (field === 'gross_monthly_income') {
      this.profile.gross_monthly_income = numVal;
      this.profile.gross_monthly_income_confirmed = true;
    } else if (field === 'monthly_debt') {
      this.profile.monthly_debt = numVal;
      this.profile.monthly_debt_confirmed = true;
    } else if (field === 'credit_range') {
      this.profile.credit_range = rawValue;
      this.profile.credit_range_confirmed = true;
    } else if (field === 'down_payment') {
      this.profile.down_payment = numVal;
      this.profile.down_payment_confirmed = true;
    } else if (field === 'property_value') {
      this.profile.property_value = numVal;
      this.profile.property_value_confirmed = true;
    } else if (field === 'borrower_name') {
      this.profile.borrower_name = rawValue;
      this.profile.borrower_name_confirmed = true;
    } else if (field === 'mortgage_goal') {
      this.profile.mortgage_goal = rawValue;
      this.profile.mortgage_goal_confirmed = true;
    } else if (field === 'timeline') {
      this.profile.timeline = rawValue;
      this.profile.timeline_confirmed = true;
    } else if (field === 'property_state') {
      this.profile.property_state = rawValue;
      this.profile.property_state_confirmed = true;
    }
  }

  private async checkForGlobalCorrections(text: string): Promise<boolean> {
    const lower = text.toLowerCase();
    // Keywords indicating potential change or correction
    const keywords = ['change', 'correct', 'instead', 'wrong', 'mistake', 'actually', 'update', 'not ', 'no, '];
    const hasKeyword = keywords.some(k => lower.includes(k));
    if (!hasKeyword) return false;

    // Get list of fields that are already confirmed
    const confirmedFields: string[] = [];
    if (this.profile.borrower_name_confirmed) confirmedFields.push('borrower_name');
    if (this.profile.mortgage_goal_confirmed) confirmedFields.push('mortgage_goal');
    if (this.profile.timeline_confirmed) confirmedFields.push('timeline');
    if (this.profile.property_state_confirmed) confirmedFields.push('property_state');
    if (this.profile.gross_monthly_income_confirmed) confirmedFields.push('gross_monthly_income');
    if (this.profile.monthly_debt_confirmed) confirmedFields.push('monthly_debt');
    if (this.profile.credit_range_confirmed) confirmedFields.push('credit_range');
    if (this.profile.down_payment_confirmed) confirmedFields.push('down_payment');
    if (this.profile.property_value_confirmed) confirmedFields.push('property_value');

    if (confirmedFields.length === 0) return false;

    console.log(`[context-manager] Global: Checking potential correction against confirmed fields: ${confirmedFields.join(', ')}`);
    const lastQuestion = this.getLastAssistantUtterance();

    const res = await extractProfileField(
      text,
      lastQuestion,
      'global_correction',
      'correction of previously shared details',
      'string',
      `The currently confirmed fields are: ${confirmedFields.join(', ')}.
      Determine if the user is correcting or changing one of these fields.
      If yes, return the field name and new value separated by a colon, exactly like "field_name:new_value" (e.g., "gross_monthly_income:8500" or "mortgage_goal:refinance").
      If no correction/change is found, return null.`
    );

    if (res.value && typeof res.value === 'string' && res.value.includes(':')) {
      const parts = res.value.split(':');
      const field = parts[0]?.trim();
      const newVal = parts.slice(1).join(':')?.trim();
      if (field && newVal && confirmedFields.includes(field)) {
        console.log(`[context-manager] Global: Correction detected for ${field} to ${newVal}`);
        this.profile.pending_confirm_field = field;
        this.profile.pending_confirm_value = newVal;

        // Reset confirmed flag
        (this.profile as any)[`${field}_confirmed`] = false;
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
    } else if (field === 'timeline') {
      this.profile.timeline = 'flexible';
      this.profile.timeline_confirmed = true;
    } else if (field === 'property_state') {
      this.profile.property_state = 'Texas';
      this.profile.property_state_confirmed = true;
    } else if (['gross_monthly_income', 'monthly_debt', 'credit_range', 'down_payment', 'property_value'].includes(field)) {
      this.commitStage2Value(field, null, true);
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
      if (field === 'ssn_confirm') this.profile.ssn_confirmed = true;
      if (field === 'employment_details') {
        this.profile.employment_position = 'Not specified';
        this.profile.employment_years = 0;
      }
      if (field === 'checking_savings') this.profile.checking_savings_balance = 0;
      if (field === 'declarations') this.profile.declarations_confirmed = true;
      if (field === 'hmda') this.profile.hmda_completed = true;
      if (field === 'submit_confirmation') this.profile.ready_to_submit = true;
    }

    this.advanceWorkflow();
  }
}

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
    this.turnLog.push({ role: 'user', text: trimmed, timestamp: Date.now() });
    this.turnCount += 1;

    if (this.activeStage === '1') {
      await this.runStage1Extraction(trimmed);
    } else if (this.activeStage === '2') {
      await this.runStage2Extraction(trimmed);
    }
  }

  onAgentTurn(text: string): void {
    const trimmed = text.trim();
    if (!trimmed) return;
    this.turnLog.push({ role: 'assistant', text: trimmed, timestamp: Date.now() });
    this.profile.bridge_to_say = null;
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

      const res = await extractProfileField(
        text,
        lastQuestion,
        field,
        fieldDesc,
        'number',
        'Extract the single total dollar amount. If the user declines, skips, says they don\'t know, or don\'t want to answer, set "declined" to true.'
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
        'credit score',
        'string',
        'Extract the credit score number or tier mentioned by the user. If they provide a specific number (e.g. 720 or 750), extract that exact number. If they only know a range or rating tier (e.g. Good, Excellent, or 700-750), extract that range/tier. If they decline, skip, or say they don\'t know, set "declined" to true.'
      );

      if (res.declined) {
        this.commitStage2Value(field, null, true);
      } else if (res.value) {
        this.profile.pending_confirm_field = 'credit_range';
        this.profile.pending_confirm_value = res.value as string;
        console.log(`[context-manager] Stage2: extracted credit score=${res.value}, awaiting confirm`);
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
    } else {
      this.currentPendingField = null;
      this.activeStage = '3';
      this.profile.bridge_to_say = 'stage2_to_stage3';
      console.log('[context-manager]: ✅ Transitioning to STAGE 3 Product Guidance!');
    }
  }

  /** Get active instructions assembled using active profile variables */
  getActiveInstructions(): string {
    return buildSessionPrompt(this.profile, this.currentPendingField, this.activeStage);
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
}

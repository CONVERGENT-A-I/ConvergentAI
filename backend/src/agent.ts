if (process.platform === 'win32') {
  const psPath = 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0';
  if (process.env.PATH && !process.env.PATH.includes(psPath)) {
    process.env.PATH = `${psPath};${process.env.PATH}`;
  }
}

import dotenv from 'dotenv';

// Check if DATABASE_URL was passed from parent process
if (!process.env.DATABASE_URL) {
  // Only load from .env if not already set
  dotenv.config();
}

// Log DATABASE_URL status for debugging
console.log('[agent] DATABASE_URL status:', process.env.DATABASE_URL ? '✅ PRESENT' : '❌ MISSING');
import { type JobContext, ServerOptions, cli, voice, llm, inference, defineAgent } from '@livekit/agents';
import { RoomEvent, TrackKind } from '@livekit/rtc-node';
import { fileURLToPath } from 'url';
import { applyContactUpdates } from './utils/profile-sync.js';
import * as openai from '@livekit/agents-plugin-openai';
import * as silero from '@livekit/agents-plugin-silero';
import { ailanaConfig } from './config/ailana-config.js';
import { applySafetyNet } from './section0/safety-net.js';
import { SessionContextManager } from './context/session-context-manager.js';
import { LatencyTracker, ts } from './metrics/latency-tracker.js';
import {
  buildBaseInstructions,
  buildVoiceInstructions,
  GREETING_TEXT,
  getGreetingText,
  GREETING_USER_INPUT,
  RESUME_USER_INPUT,
} from './prompts/index.js';
import type { BorrowerProfile } from './prompts/layer3-context.js';
import { logPromptBudget } from './context/context-budget.js';
import { AvatarSession } from '@livekit/agents-plugin-lemonslice'; // Lab parity marker: @livekit/agents-plugin-protoface
import { BackchannelEngine } from './utils/backchannel-engine.js';
import { OpenAI } from 'openai';
import { sendPrequalLetterEmail } from './utils/email-sender.js';
import { applicationService } from './services/application-service.js';
import { isDatabaseEnabled } from './services/database.js';
import { callCrsSoftPull } from './services/crs-service.js';
import { classifyAuthorization, classifyLoanOfficerTransferIntent, extractMultipleFields } from './context/llm-extractor.js';
import { BackgroundVoiceCancellation } from '@livekit/noise-cancellation-node';
import { logAffordabilityEvent } from './utils/affordability-audit.js';
import { z } from 'zod';
import { findConversationalSlots, bookConversationalAppointment } from './services/conversational-scheduling.js';
import { isLoanOfficerTransferIntent, isContextualLoanOfficerTransferConfirmation, normalizeSpokenZip } from './lib/mlo-transfer-intent.js';
import { safeErrorMessage } from './utils/security.js';
import type { SimulationContext } from '@livekit/agents';
import { activateSimulation, getSimRecords, getSimUserdata, recordSimTransfer, recordSimBooking, updateSimBooking, simMloAvailable } from './section0/sim-mocks.js';
import { buildHandoffTools } from './section0/handoff-tools.js';
import { checkExpectedFacts, type ExpectedFacts } from './section0/sim-checks.js';

// Set only when this job runs under `lk agent simulate` — lets onSimulationEnd
// inspect the final session state (Section 0 plan §7.3).
let simContextManager: SessionContextManager | null = null;

// Global error guard to catch LiveKit SDK RPC connection timeouts gracefully without crashing/stalling the agent loop
process.on('unhandledRejection', (reason: any) => {
  if (reason?.type === '_RpcError' || reason?.message?.includes('Connection timeout') || reason?.code === 1501) {
    console.warn('[agent-warning] Caught LiveKit RPC Connection Timeout gracefully:', reason?.message ?? reason);
    return;
  }
  console.error('[agent-error] Unhandled Promise Rejection:', reason);
});



// Verbatim Stage 2 Closing Offer text — delivered via session.say() bypassing the LLM.
// This guarantees the exact two-path script is spoken regardless of LLM instruction-following.
const STAGE2_CLOSING_OFFER_SCRIPT = (profile?: BorrowerProfile) => {
  const name = profile?.borrower_name || profile?.contact_name || profile?.legal_name;
  const namePrefix = name ? `, ${name}` : '';
  const isRef = profile?.transaction_type === 'TT-REF' || profile?.mortgage_goal === 'refinance';
  const isHel = profile?.transaction_type === 'TT-HEL' || profile?.transaction_type === 'TT-HEQ' || profile?.mortgage_goal === 'heloc';

  if (isRef) {
    return `Great work exploring your numbers${namePrefix}. You've got two good ways to see your refinance scenario, and the choice is yours. The most complete option: with your authorization, a soft credit review — no impact to your credit score — prefills your application and builds your refinance scenario with your real credit data. Or, if you'd rather not run the review just yet, I can build your refinance scenario right now from everything you've shared with me, and you can add the credit review whenever you're ready. Which would you like?`;
  }
  if (isHel) {
    return `Great work exploring your numbers${namePrefix}. You've got two good ways to see your home equity options, and the choice is yours. The most complete option: with your authorization, a soft credit review — no impact to your credit score — prefills your application and builds your home equity summary with your real credit data. Or, if you'd rather not run the review just yet, I can build your home equity summary right now from everything you've shared with me, and you can add the credit review whenever you're ready. Which would you like?`;
  }
  return `Great work exploring your numbers${namePrefix}. You have two good ways to see your affordability picture. First, with your authorization, I can perform a soft credit review to pre-populate your application with your actual credit data, saving you time and ensuring accurate information, all with no impact to your credit score. Alternatively, I can build your affordability summary right now using just the details you've already shared, and you can add the credit review whenever you're ready. Which path would you prefer?`;
};

export function formatPhoneForSpeech(raw: string): string {
  const digits = (raw || '').replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length === 11 && digits[0] === '1') {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return raw || '';
}

export function isQuestionOrCorrection(text: string | null | undefined): boolean {
  if (!text) return false;
  const t = text.toLowerCase().trim();
  if (t.includes('?')) return true;

  // Check if text starts with modal or question words
  if (/^(what|why|how|where|who|which|can|could|would|should|is|does|will|do i)\b/.test(t)) {
    return true;
  }

  // Specific question, explanation, or correction intent phrases
  const keywords = [
    'explain', 'detail', 'meaning', 'difference',
    'change my', 'update my', 'actually my', 'wrong', 'mistake', 'instead',
    'confused', 'don\'t understand', 'not sure', 'unsure', 'tell me about',
    'already told you', 'gave it to you', 'gave you', 'just said', 'just shared',
    'already shared', 'shared that', 'shared it', 'just gave', 'already gave',
    'already told', 'just told', 'already said', 'i shared', 'i gave',
    'worried', 'concerned', 'wondering', 'curious', 'elaborate', 'clarify',
    'clarification', 'more info', 'more information', 'tell me more', 'sounds expensive',
    'sounds high', 'what about', 'how come', 'is that', 'question', 'ask'
  ];
  return keywords.some(k => t.includes(k));
}

export async function applyUIFieldCorrection(
  parsed: { field?: string; value?: any },
  profile: any,
  _extractor: typeof extractMultipleFields = extractMultipleFields,
): Promise<void> {
  const { field, value } = parsed;
  console.log(`[agent]: contact_ui_field_correction received from UI: field=${field}, value=${value}`);

  if (field === 'fullName' || field === 'name') {
    const rawVal = String(value || '').trim();
    if (!rawVal) return;
    applyContactUpdates(profile, { fullName: rawVal });
  } else if (field === 'firstName') {
    applyContactUpdates(profile, { firstName: String(value || '').trim() });
  } else if (field === 'lastName') {
    applyContactUpdates(profile, { lastName: String(value || '').trim() });
  } else if (field === 'email') {
    applyContactUpdates(profile, { contact_email: String(value || '') });
  } else if (field === 'mobile') {
    applyContactUpdates(profile, { contact_mobile: String(value || '') });
  }
}


function normalizePronunciationForTts(text: string): string {
  return text
    // Replace all instances of "VA" as a whole word with "Veterans Affairs"
    // so Cartesia / TTS text normalizers never pronounce "VA" as "Virginia" (postal code expansion)
    .replace(/\bVA\b/g, 'Veterans Affairs')
    // Fix "W-2s" / "W2s" -> pronounced smoothly as "W-twos"
    .replace(/\bW-?2'?s\b/gi, 'W-twos')
    // Fix singular "W-2" / "W2" -> pronounced smoothly as "W-two"
    .replace(/\bW-?2\b/gi, 'W-two');
}

function createVerbatimStream(text: string): ReadableStream<string> {
  const sanitized = normalizePronunciationForTts(text)
    .replace(/\s*\n+\s*/g, ' ')
    .replace(/\s*—\s*/g, ', ')
    .replace(/\s+,/g, ',')
    .trim();
  const stream = new ReadableStream({
    start(controller) {
      if (sanitized.length > 0) {
        controller.enqueue(sanitized);
      }
      controller.close();
    },
  });
  // An empty verbatim reply is a deliberate silence (noise, filler) — never an error to retry.
  if (sanitized.length === 0) (stream as any).__intentionalSilence = true;
  return stream;
}

class AilanaVoiceAgent extends voice.Agent {
  public sayCallback: ((text: string) => Promise<void>) | null = null;
  public onAgentTurnCallback: ((text: string) => Promise<void>) | null = null;
  public globalTurnInterceptor: ((text: string) => Promise<boolean>) | null = null;
  private suppressNextReply = false;
  private _stage2ClosingOfferDelivered = false;
  public activeFieldAtTurnStart: string | null = null;
  /**
   * True when the current user turn has already been processed (state updated +
   * per-turn context applied) by onUserTurnCompleted (voice) or the typed-message
   * handler. Turns that reach llmNode without it — e.g. LiveKit Agent Simulations,
   * which call session.run({ userInput }) directly — are processed in llmNode.
   */
  public turnPrepared = false;

  constructor(
    options: voice.AgentOptions<any>,
    private contextManager: SessionContextManager,
    private updateInstructionsCallback: () => void,
    private metrics: LatencyTracker,
    public sendStageUpdate?: (stage: string) => Promise<void>,
    public triggerMloTransfer?: () => Promise<void>,
    private isConversationalSchedulingActive: () => boolean = () => false,
    private getConversationalSchedulingInstructions: () => string = () => '',
  ) {
    super(options);
  }

  override async sttNode(audio: any, modelSettings: any) {
    this.metrics.markSttStart();
    return super.sttNode(audio, modelSettings);
  }

  override async llmNode(chatCtx: any, toolCtx: any, modelSettings: any): ReturnType<typeof voice.Agent.prototype.llmNode> {
    const out = await this.llmNodeInner(chatCtx, toolCtx, modelSettings);
    // Section 0: an empty model reply ("agent produced no response items") gets one retry.
    const retry = ailanaConfig.section0Enabled ? () => super.llmNode(chatCtx, toolCtx, modelSettings) : null;
    return this.logIfEmpty(out, retry) as any;
  }

  /**
   * Diagnostic: pass the reply stream through unchanged, but log a warning if it
   * ends without any text (shows up as "agent produced no response items" in
   * LiveKit Agent Simulations, or as Ailana going silent).
   */
  private logIfEmpty(stream: any, retry: (() => any) | null = null): any {
    if (!stream || typeof stream.pipeThrough !== 'function') return stream;
    if ((stream as any).__intentionalSilence) return stream; // e.g. background noise: staying silent is the answer
    let chars = 0;
    let toolCalls = 0;
    const stage = this.contextManager.getActiveStage();
    const pending = this.contextManager.getPendingField();
    return stream.pipeThrough(new TransformStream({
      transform(chunk: any, controller) {
        const text = typeof chunk === 'string' ? chunk : (chunk?.delta?.content ?? '');
        if (text) chars += String(text).trim().length;
        if (chunk?.delta?.toolCalls?.length) toolCalls += chunk.delta.toolCalls.length;
        controller.enqueue(chunk);
      },
      async flush(controller) {
        if (chars === 0 && toolCalls === 0) {
          console.warn(`[agent-hook]: ⚠️ EMPTY REPLY produced (stage=${stage}, pendingField=${pending})${retry ? ' — retrying once' : ''}.`);
          if (!retry) return;
          try {
            const second = await retry();
            if (!second || typeof second.getReader !== 'function') return;
            const reader = second.getReader();
            for (;;) {
              const { done, value } = await reader.read();
              if (done) break;
              controller.enqueue(value);
            }
          } catch (err) {
            console.warn('[agent-hook]: retry after empty reply failed:', err);
          }
        }
      },
    }));
  }

  private async llmNodeInner(chatCtx: any, toolCtx: any, modelSettings: any): Promise<any> {
    this.metrics.markLlmStart();

    if (this.suppressNextReply) {
      this.suppressNextReply = false;
      console.log('[agent-hook]: Suppressing mortgage LLM reply because a global voice action owns this turn.');
      return createVerbatimStream('') as any;
    }

    if (this.isConversationalSchedulingActive()) {
      return super.llmNode(chatCtx, toolCtx, modelSettings) as any;
    }

    // A tool just ran (e.g. transfer_to_loan_officer): this call is the model's follow-up reply to the
    // tool result, not a new user turn — never process the user's message a second time.
    const items = chatCtx?.items || [];
    const lastItem = items[items.length - 1];
    if (lastItem?.type === 'function_call_output' || lastItem?.type === 'function_call') {
      this.turnPrepared = false;
      return super.llmNode(chatCtx, toolCtx, modelSettings) as any;
    }

    // We only need profile for a flag check initially.
    const initialProfile = this.contextManager.getProfile();

    // Check if the user's last turn was a question, correction, or explanation request
    const lastUserMsg = [...(chatCtx?.items || [])]
      .reverse()
      .find((item: any) => item.role === 'user' || item.type === 'user');
    const lastUserText = typeof lastUserMsg?.content === 'string'
      ? lastUserMsg.content
      : Array.isArray(lastUserMsg?.content)
        ? lastUserMsg.content.join(' ')
        : '';
    let userAskedQuestion = isQuestionOrCorrection(lastUserText) || (initialProfile as any).last_extracted_offer_val === 'explain';

    // ── Ignore Historical Messages ──
    // If the session was just restored, the last user message is from the past.
    // We should not trigger any active intents or transitions based on it.
    if (lastUserMsg && (lastUserMsg as any).isRestored) {
      this.turnPrepared = false;
      console.log(`[agent-hook]: Skipping intent processing for restored historical message: "${lastUserText}"`);
      return super.llmNode(chatCtx, toolCtx, modelSettings) as any;
    }

    // ── Ignore System Injected Prompts ──
    const isSystemInjectedPrompt = (text: string) => {
      const t = text.toLowerCase();
      return t.includes('the borrower has reconnected') || 
             t.includes('the borrower has returned') ||
             t.includes('please say exactly:') ||
             t.includes('the application has been submitted to underwriting') ||
             t.includes('the eligibility review has returned with status') ||
             t.includes('accidentally interrupted you with a noise');
    };

    if (isSystemInjectedPrompt(lastUserText)) {
      this.turnPrepared = false;
      console.log(`[agent-hook]: Skipping intent processing for system-injected prompt: "${lastUserText}"`);
      return super.llmNode(chatCtx, toolCtx, modelSettings) as any;
    }

    // ── Ignore Empty Turns ──
    // If the VAD triggered on pure noise and the STT transcribed nothing, stay silent.
    // This prevents noise from triggering fallbacks (e.g. military_rural fallback).
    if (!lastUserText.trim()) {
      this.turnPrepared = false;
      console.log('[agent-hook]: Ignored empty user turn (likely background noise). Staying silent.');
      return createVerbatimStream('') as any;
    }

    // ── Unprocessed user turn (e.g. LiveKit Agent Simulations) ──
    // Voice turns are processed in onUserTurnCompleted and typed turns in the
    // typed-message handler. A turn that arrives any other way — the simulator
    // calls session.run({ userInput }) directly — would otherwise reach the LLM
    // with no state update and no CURRENT TASK, so Ailana would improvise.
    // Process it here, exactly like a typed turn, before any fast path reads state.
    if (!this.turnPrepared) {
      console.log(`[agent-hook]: User turn reached llmNode unprocessed (session.run / generateReply) — processing now: "${lastUserText.slice(0, 80)}"`);
      this.activeFieldAtTurnStart = this.contextManager.getPendingField();
      await this.contextManager.onUserTurn(lastUserText);
      this.updateInstructionsCallback();
      this.applyTurnContext(chatCtx);
      userAskedQuestion = isQuestionOrCorrection(lastUserText) || (this.contextManager.getProfile() as any).last_extracted_offer_val === 'explain';
    }
    this.turnPrepared = false;

    // Section 0 (S0-27/28): while a transfer or call back is being arranged, skip every scripted
    // fast path so the model can call the handoff tools (code decided the handoff state).
    if (ailanaConfig.section0Enabled && (this.contextManager.isHandoffActive() || this.contextManager.hasPendingComplianceNotes() || this.contextManager.hasQuickCheckDue())) {
      console.log(`[section0] ${this.contextManager.isHandoffActive() ? `handoff in progress (${this.contextManager.getHandoffMode()})` : 'compliance note pending'} — reply by the model`);
      return super.llmNode(chatCtx, toolCtx, modelSettings) as any;
    }

    // ── 0ms Verbal Submit Fast-Path (Stage 2.5) ──
    // Fires before LLM so the base LiveKit Inference model never produces a UI-redirect deflection.
    // We check this BEFORE the question/correction block so that phrases like "Can you submit this?"
    // trigger the submission rather than being delegated to the LLM for explanation.
    const ausAlreadyDone = !!(this.contextManager.getProfile() as any).aus_status;
    const inAffordabilityStage = this.contextManager.getActiveStage() === '2.5' || this.contextManager.getPendingField() === 'affordability_panel_active' || !!this.contextManager.getProfile().affordability_panel_rendered;
    const isConditionalOrQuestion = /\b(what if|after (?:i|we) submit|if (?:i|we) submit|before (?:i|we) submit|will that affect|what will be the process|how does it work|can you explain|why does|tell me about)\b/i.test(lastUserText);
    const isUpgradeIntent = /\b(upgrade|verified\s*(?:mode|numbers|score|credit)|soft\s*(?:credit\s*)?(?:pull|review)|check\s*my\s*credit|run\s*(?:my\s*)?credit)\b/i.test(lastUserText);
    const verbalSubmitPattern = /\b(?:submit\s*(?:for\s*me|it|review|my\s*review|this|now)?|can\s+you\s+submit|please\s+submit|go\s+ahead\s+(?:and\s+)?submit|run\s+the\s+review|proceed\s+with\s+review|send\s+my\s+scenario|do\s+it\s+for\s+me|send\s+it|yes\s+submit|let'?s\s+submit|go\s+ahead|let'?s\s+go|proceed|ready\s+to\s+submit|i'?m\s+ready|yes\s+please|sounds\s+good|looks\s+good(?:.*?)\bsubmit\b)\b/i;

    if (inAffordabilityStage && isUpgradeIntent && (!this.contextManager.getProfile().otp_verified || this.contextManager.getProfile().affordability_mode === 'stated')) {
      console.log(`[agent-hook]: Voice upgrade request detected in Stage 2.5 ("${lastUserText}") — initiating Stage 3A contact_full_name!`);
      this.contextManager.triggerUpgradeToVerifiedMode();
      this.updateInstructionsCallback();
      if (this.sendStageUpdate) {
        this.sendStageUpdate('3A').catch(err => console.warn(err));
      }
      const upgradeScript = "I'd be happy to get that upgraded for you! Before we run your review, I'll need a few details to set up your secure account. First — what's your full name?";
      return createVerbatimStream(upgradeScript) as any;
    }

    if (inAffordabilityStage && !isConditionalOrQuestion && !isUpgradeIntent && verbalSubmitPattern.test(lastUserText)) {
      const p = this.contextManager.getProfile();
      const isStatedMode = p.affordability_mode === 'stated' || !p.otp_verified;
      const pendingField = this.contextManager.getPendingField();

      if (isStatedMode) {
        console.log(`[agent-hook]: Voice submit in stated mode -> triggering upgrade to verified mode (contact_full_name).`);
        this.contextManager.triggerUpgradeToVerifiedMode();
        this.updateInstructionsCallback();
        if (this.sendStageUpdate) {
          this.sendStageUpdate('3A').catch(err => console.warn(err));
        }
        const upgradeScript = "To submit your scenario for a formal eligibility review, we'll need to upgrade to verified numbers. I'll need a few details to set up your secure account first. First — what's your full name?";
        return createVerbatimStream(upgradeScript) as any;
      }

      console.log(`[agent-hook]: 0ms Verbal Submit Fast-Path confirmed — executing AUS findings immediately!`);

      // 1. Instantly update the UI to show the button as "Review Submitted ✓" and ensure panel stays rendered
      p.affordability_submitted = true;
      p.affordability_panel_rendered = true;
      (p as any).affordability_panel_closed = false;
      p.aus_status = 'approve_eligible';
      p.affordability_aus_status = 'approve_eligible';
      if (this.sendStageUpdate) {
        this.sendStageUpdate('2.5').catch(err => console.warn(err));
      }

      // 2. Mark stage 5 transition as deferred until avatar finishes reading the AUS findings speech.
      (p as any).pendingStage5Transition = true;

      const borrowerName = p.borrower_name || p.contact_name || p.legal_name || 'there';
      const isRef = p.transaction_type === 'TT-REF' || p.mortgage_goal === 'refinance';
      const isHel = p.transaction_type === 'TT-HEL' || p.transaction_type === 'TT-HEQ' || p.mortgage_goal === 'heloc';

      let scriptText = '';
      if (isRef) {
        scriptText = `Good news${borrowerName !== 'there' ? ', ' + borrowerName : ''} — your eligibility review came back, and based on the information you provided, you appear conditionally eligible for the refinance scenario you built. Your estimated payment comparison is ready for you — it shows your estimated new payment alongside your current payment reference point. Your licensed loan officer will reach out to walk you through next steps and lock in your rate — or I can connect you right now if you'd like.`;
      } else if (isHel) {
        scriptText = p.transaction_type === 'TT-HEQ'
          ? `Good news${borrowerName !== 'there' ? ', ' + borrowerName : ''} — your eligibility review came back, and based on the information you provided, you appear conditionally eligible for a home equity loan. Your licensed loan officer will reach out to walk you through next steps — or I can connect you right now if you'd like.`
          : `Good news${borrowerName !== 'there' ? ', ' + borrowerName : ''} — your eligibility review came back, and based on the information you provided, you appear conditionally eligible for a home equity line of credit. Your licensed loan officer will reach out to walk you through the next steps — including the formal application, appraisal scheduling, and the terms of your line — or I can connect you right now if you'd like.`;
      } else {
        scriptText = `Wonderful news${borrowerName !== 'there' ? ', ' + borrowerName : ''} — your eligibility review came back, and based on the information you provided, you're conditionally eligible for the scenario you built. Your estimated payment range has been calculated and is included in your pre-qualification letter. I've sent your pre-qualification letter to your email on file — it's issued by your lending institution, it's valid for ninety days, and it's exactly what real estate agents like to see with an offer. Your licensed loan officer will reach out to walk you through next steps — or I can connect you right now if you'd like.`;
      }

      return createVerbatimStream(scriptText) as any;
    }

    // ── Comprehensive Voice-Triggered Loan Officer Handoff Fast-Path ──
    const activeStage = this.contextManager.getActiveStage();

    // ── Loan Officer Transfer Fast-Path ──────────────────────────────────────
    const LO_ELIGIBLE_STAGES = new Set(['2.5', '4', '5']);
    const isHypotheticalOrExploratoryQuestion = /\b(what happens if|what would happen|why (?:would|should)|how (?:do|does|will|would)|what does|what if|tell me about|what is a)\b/i.test(lastUserText);
    const isExplicitLoRequest = !isHypotheticalOrExploratoryQuestion && /\b(connect(\s+me)?\s+(?:to\s+)?(?:a\s+|the\s+)?loan\s*officer|transfer(\s+me)?\s+(?:to\s+)?(?:a\s+|the\s+)?loan\s*officer|speak\s+(?:to|with)\s+(?:a\s+|the\s+)?loan\s*officer|call\s+(?:a\s+|the\s+)?loan\s*officer|connect\s+me\s+right\s+now)\b/i.test(lastUserText);
    const loEligibleStage = LO_ELIGIBLE_STAGES.has(activeStage) || isExplicitLoRequest;

    let loIntent: 'yes' | 'no' | 'uncertain' = 'uncertain';

    if (loEligibleStage) {
      if (isHypotheticalOrExploratoryQuestion) {
        loIntent = 'no';
        console.log(`[agent-hook]: LO transfer classifier SKIPPED (hypothetical/exploratory question detected) — 0ms.`);
      } else if (isExplicitLoRequest) {
        loIntent = 'yes';
      } else {
        const LO_KEYWORD_PATTERN = /\b(connect|transfer|speak|talk|loan officer|real person|someone|schedule|call me|book|yes|sure|go ahead|do it|let's do|absolutely|definitely)\b/i;
        const loKeywordDetected = LO_KEYWORD_PATTERN.test(lastUserText);

        if (loKeywordDetected) {
          const lastAgentMsg = [...(chatCtx?.items || [])]
            .reverse()
            .find((item: any) => item.role === 'assistant' || item.type === 'assistant');
          const lastAgentText = typeof lastAgentMsg?.content === 'string'
            ? lastAgentMsg.content
            : Array.isArray(lastAgentMsg?.content)
              ? lastAgentMsg.content.join(' ')
              : null;

          loIntent = await classifyLoanOfficerTransferIntent(lastUserText, lastAgentText);
          console.log(`[agent-hook]: LO transfer classification → "${loIntent}" for: "${lastUserText}"`);
        } else {
          console.log(`[agent-hook]: LO transfer pre-filter SKIPPED (no keywords, stage=${activeStage}) — 0ms.`);
        }
      }
    } else {
      console.log(`[agent-hook]: LO transfer STAGE-GATED (stage=${activeStage}) — skipping classifier.`);
    }

    // ── CRITICAL RACE CONDITION FIX: 
    // We MUST read the profile and pending fields AFTER the await above.
    const pending = this.contextManager.getPendingField();
    const profile = this.contextManager.getProfile();

    // Section 0: the universal extractor understood a request for a loan officer (any phrasing,
    // any stage) → use the existing transfer path (popup → SIP), exactly once.
    if ((profile as any)._section0TransferRequested) {
      delete (profile as any)._section0TransferRequested;
      if (loIntent !== 'yes') {
        console.log('[section0] transfer requested (extractor intent) → loan officer transfer path');
        loIntent = 'yes';
      }
    }

    if (loIntent === 'yes') {
      console.log(`[agent-hook]: 📞 Loan Officer transfer confirmed — transferring via SYSTEM_TRIGGER_MLO_TRANSFER.`);
      profile.escalation_preference = 'live_transfer';
      (profile as any).escalation_preference_confirmed = true;
      (profile as any).affordability_panel_closed = true;
      profile.affordability_panel_rendered = false;
      this.contextManager.setActiveStage('5');
      this.contextManager.setCurrentPendingField(null);
      if (this.sendStageUpdate) {
        this.sendStageUpdate('5').catch(err => console.warn(err));
      }

      if (this.triggerMloTransfer) {
        this.triggerMloTransfer().catch(err => console.error('[agent-error]: Failed to send MLO trigger:', err));
      }

      const scriptText = `Connecting you with a licensed loan officer now — one moment please.`;
      return createVerbatimStream(scriptText) as any;
    }

    if (userAskedQuestion) {
      (profile as any).last_extracted_offer_val = null; // reset flag
      console.log(`[agent-hook]: User turn contains question/explanation request ("${lastUserText}") — delegating to LiveKit Inference LLM to answer dynamically.`);
      return super.llmNode(chatCtx, toolCtx, modelSettings) as any;
    }

    // ── 0ms Parallel Fast-Path for Stage 2 Completion ──
    const isMilitaryUtterance = /\b(military|veteran|guard|national\s*guard|reserve|duty|service|served|air\s*force|army|navy|marines)\b/i.test(lastUserText);
    const hasJobKeyword = /\b(salary|salaried|hourly|self-employed|self employed|working|employed|contractor?|w2|w-2|1099|full-time|part-time|full time|part time|employer|job|company|in this role|at my job|with them)\b/i.test(lastUserText);
    const hasJobTenureDuration = !isMilitaryUtterance && hasJobKeyword && /(\d+|\b(one|two|three|four|five|six|seven|eight|nine|ten)\b)\s*(years?|months?)\b/i.test(lastUserText);

    const isAnsweringJobTenure =
      (pending === 'job_tenure_type' || pending === 'stage2_closing_offer') &&
      !this._stage2ClosingOfferDelivered &&
      !isMilitaryUtterance &&
      (hasJobKeyword || hasJobTenureDuration);

    const currentStage = this.contextManager.getActiveStage();
    const isAtClosingOffer = currentStage === '2' && (pending === 'stage2_closing_offer' || this._stage2ClosingOfferDelivered);

    const isExplicitPathB = isAtClosingOffer &&
      /\b(build.*(?:shared|summary|stated|info|heloc|refinance|options)|what\s+i\s+shared|from\s+what\s+i\s+shared|use\s+what\s+i\s+shared|summary|explore|stated|second\s*(?:option|path|choice|one)|without|no\s+review|skip)\b/i.test(lastUserText);
    const isExplicitPathA = isAtClosingOffer &&
      !isExplicitPathB && /\b(soft\s*pull|credit\s*review|first(?:\s*option)?|most\s*complete|yes|sure|okay|go\s*ahead|proceed|run\s*it|run\s*the\s*review)\b/i.test(lastUserText);

    // Section 0: a stated situation still needs one follow-up (e.g. rent on a home they're keeping)
    // → ask it before the closing offer instead of firing the closing script at 0 ms.
    if (isAnsweringJobTenure && !this._stage2ClosingOfferDelivered && this.contextManager.takeFollowupBeforeClosingOffer()) {
      this.updateInstructionsCallback();
      this.applyTurnContext(chatCtx);
      return super.llmNode(chatCtx, toolCtx, modelSettings) as any;
    }

    if (isAtClosingOffer || isAnsweringJobTenure) {
      if (isAnsweringJobTenure) {
        console.log('[agent-hook]: Parallel 0ms Fast-Path — job_tenure_type answer detected. Triggering STAGE2_CLOSING_OFFER_SCRIPT!');
        this.contextManager.setCurrentPendingField('stage2_closing_offer');
      }

      let scriptText = '';
      if (!this._stage2ClosingOfferDelivered && !isExplicitPathB && !isExplicitPathA) {
        this._stage2ClosingOfferDelivered = true;
        scriptText = STAGE2_CLOSING_OFFER_SCRIPT(profile);
        console.log('[agent-hook]: Delivering initial STAGE2_CLOSING_OFFER_SCRIPT via Deterministic ReadableStream (0ms LLM)!');
      } else {
        // User is answering stage2_closing_offer:
        if (isExplicitPathB) {
          this._stage2ClosingOfferDelivered = false;
          console.log('[agent-hook]: Parallel 0ms Fast-Path — Path B (Stated Mode) chosen! Transitioning directly to Stage 2.5 Stated Mode!');
          this.contextManager.setActiveStage('2.5');
          const prof = this.contextManager.getProfile();
          prof.affordability_mode = 'stated';
          prof.affordability_panel_rendered = true;
          (prof as any).affordability_panel_closed = false;
          prof.affordability_submitted = false;
          prof.aus_status = null;
          prof.affordability_aus_status = null;
          this.contextManager.setCurrentPendingField('affordability_panel_active');
          if (this.sendStageUpdate) {
            this.sendStageUpdate('2.5').catch(err => console.warn(err));
          }

          const borrowerName = prof.borrower_name || prof.contact_name || prof.legal_name || 'there';
          const isHel = prof.transaction_type === 'TT-HEL' || prof.transaction_type === 'TT-HEQ' || prof.mortgage_goal === 'heloc';
          const isRef = prof.transaction_type === 'TT-REF' || prof.mortgage_goal === 'refinance';

          let q46s: string;
          if (isHel) {
            q46s = prof.transaction_type === 'TT-HEQ'
              ? `Thank you for your patience${borrowerName !== 'there' ? ', ' + borrowerName : ''} — your initial results are in, and your home equity summary is ready for you. It brings together your home value, existing mortgage balance, and the loan amount target you shared with me and shows how your numbers compare with typical program guideline ranges. One important note before we look at it together: this is an educational summary to help you explore — it is not a loan decision, and you can submit for the formal eligibility review at any time, no matter what these ranges show. Would you like to walk through it together?`
              : `Thank you for your patience${borrowerName !== 'there' ? ', ' + borrowerName : ''} — your initial results are in, and your home equity summary is ready for you. It brings together your home value, existing mortgage balance, and the credit line target you shared with me and shows how your numbers compare with typical program guideline ranges. One important note before we look at it together: this is an educational summary to help you explore — it is not a loan decision, and you can submit for the formal eligibility review at any time, no matter what these ranges show. Would you like to walk through it together?`;
          } else if (isRef) {
            q46s = `Thank you for your patience${borrowerName !== 'there' ? ', ' + borrowerName : ''} — your initial results are in, and your refinance summary is ready for you. It brings together your home value, existing mortgage balance, and the refinance targets you shared with me and shows how your numbers compare with typical program guideline ranges. One important note before we look at it together: this is an educational summary to help you explore — it is not a loan decision, and you can submit for the formal eligibility review at any time, no matter what these ranges show. Would you like to walk through it together?`;
          } else {
            q46s = `Thank you for your patience${borrowerName !== 'there' ? ', ' + borrowerName : ''} — your initial results are in, and your affordability summary is ready for you. It brings together the income and savings targets you shared with me and shows how your numbers compare with typical program guideline ranges. One important note before we look at it together: this is an educational summary to help you explore — it is not a loan decision, and you can submit for the formal eligibility review at any time, no matter what these ranges show. Would you like to walk through it together?`;
          }
          return createVerbatimStream(q46s) as any;
        } else if (isExplicitPathA) {
          this._stage2ClosingOfferDelivered = false;
          console.log('[agent-hook]: Parallel 0ms Fast-Path — Path A (Soft Pull) chosen! Transitioning directly to STAGE 3A OTP gate (contact_full_name)!');
          this.contextManager.setActiveStage('3A');
          this.contextManager.setCurrentPendingField('contact_full_name');
          if (this.sendStageUpdate) {
            this.sendStageUpdate('3A').catch(err => console.warn(err));
          }
          const script = "Perfect. Before we run your review, I'll need a few details to set up your secure account. First — what's your full name?";
          return createVerbatimStream(script) as any;
        }

        scriptText = 'Which would you prefer — the soft credit review with no impact to your credit score, or building your affordability summary from the information you shared today?';
        console.log('[agent-hook]: Delivering STAGE2_CLOSING_OFFER re-ask via Deterministic ReadableStream (0ms LLM)!');
      }
      return createVerbatimStream(scriptText) as any;
    }

    if (pending === 'cash_out_amount') {
      const lower = lastUserText.toLowerCase().trim();
      const isMaxOut = /\b(as much as (?:i can get|possible)|whatever (?:i can get|i can pull out)|the most possible|maximize it|max(?:imize| out)?)\b/i.test(lower);
      if (isMaxOut) {
        console.log(`[agent-hook]: RQ27-MAXOUT detected for cash_out_amount ("${lastUserText}"). Advancing workflow.`);
        profile.cash_out_amount = 0;
        profile.cash_out_amount_confirmed = true;
        this.contextManager.advanceWorkflow();
        const maxOutScript = `Since you're looking to maximize your cash-out, the exact amount will depend on your home's current appraised value and your loan program's maximum allowable Loan-to-Value limits — which is typically 80% for conventional loans, less the amount currently owed on your present mortgage. To give you a realistic picture, we need to work from an estimated home value. Should we run the initial qualification analysis based on a conservative estimate of your home's current value to see what that maximum net payout could look like? You can share a rough figure — even a general range is fine.`;
        return createVerbatimStream(maxOutScript) as any;
      }
    }



    if (pending === 'contact_name' || pending === 'contact_full_name') {
      const attempts = this.contextManager.getFieldAttemptCount('contact_full_name') || this.contextManager.getFieldAttemptCount('contact_name');
      const apology = attempts >= 1 ? "I'm sorry, I didn't quite catch that. " : "";
      const scriptText = `${apology}Perfect. Before we run your review, I'll need a few details to set up your secure account. First — what's your full name?`;
      console.log('[agent-hook]: Delivering contact_full_name script via Deterministic ReadableStream!');
      return createVerbatimStream(scriptText) as any;
    }

    if (pending === 'contact_email') {
      const attempts = this.contextManager.getFieldAttemptCount('contact_email');
      const apology = attempts >= 1 ? "I'm sorry, I didn't quite catch that. " : "";

      let scriptText = '';
      if (profile.contact_mobile) {
        scriptText = `${apology}I have your mobile number. Could you also share the email address you'd like to use for your account?`;
        console.log('[agent-hook]: Delivering contact_email script (mobile already captured) via Deterministic ReadableStream!');
      } else {
        scriptText = `${apology}Thank you. Now, what email and mobile number would you like to use for your account?`;
        console.log('[agent-hook]: Delivering contact_email script via Deterministic ReadableStream!');
      }
      return createVerbatimStream(scriptText) as any;
    }

    if (pending === 'contact_mobile') {
      const attempts = this.contextManager.getFieldAttemptCount('contact_mobile');
      const apology = attempts >= 1 ? "I'm sorry, I didn't quite catch that. " : "";

      let scriptText = '';
      if (profile.contact_email) {
        scriptText = `${apology}I have your email. Could you also share the mobile number you'd like to use?`;
        console.log('[agent-hook]: Delivering contact_mobile script (email already captured) via Deterministic ReadableStream!');
      } else {
        scriptText = `${apology}Could you share the mobile number you'd like to use for your account?`;
        console.log('[agent-hook]: Delivering contact_mobile script (email not yet captured) via Deterministic ReadableStream!');
      }
      return createVerbatimStream(scriptText) as any;
    }

    const isAffirmativeConfirmation = (text: string) => {
      const lower = text.toLowerCase().trim();
      return (
        /\b(yes|yeah|yep|yup|looks?\s*(good|right|correct|fine)|that('s|\s+is)\s*(right|correct|accurate|good|fine|also\s+correct)|correct|matches|match|what\s+i\s+expect|good|fine|accurate|all\s+good|sounds\s+good|perfect|sure|confirm|confirmed|this\s+looks\s+correct|everything\s+looks\s+correct)\b/i.test(lower) &&
        !/\b(not?\s*(right|correct|accurate|good)|wrong|mistake|change|update|no\b(?!\s*,\s*(that|it)\s*(is|looks)\s*(also\s+)?(right|correct)))\b/i.test(lower)
      );
    };

    if (pending === 'contact_confirm_display' && this.activeFieldAtTurnStart === 'contact_confirm_display') {
      const lower = lastUserText.toLowerCase().trim();
      const isAffirmative = isAffirmativeConfirmation(lastUserText);
      const isCorrection = /\b(no|not|wrong|change|update|actually|mistake|fix|incorrect)\b/i.test(lower) && !isAffirmative;

      if (isAffirmative) {
        console.log(`[agent-hook]: Voice confirmation of contact details detected ("${lastUserText}"). Advancing to OTP dispatch.`);
        this.contextManager.handleContactInfoConfirmed();
        (profile as any)._otpInstructionDelivered = true;
        (profile as any)._otpReadyToShow = true;
        if (this.sendStageUpdate) {
          this.sendStageUpdate(this.contextManager.getActiveStage()).catch(err => console.warn(err));
        }
        const otpScript = "I've sent a one-time code to confirm your email and mobile number — please go ahead and enter it securely on your screen when it arrives, and you're all set.";
        return createVerbatimStream(otpScript) as any;
      }

      // Check if user indicates they will edit/fix/type their details on screen
      const isOnScreenCorrection = /\b(on\s+(the\s+)?screen|type(\s+it)?|typing|edit(\s+it)?\s+myself|fix(\s+it)?\s+myself|screen)\b/i.test(lower);
      if (isOnScreenCorrection) {
        console.log(`[agent-hook]: User indicated on-screen correction ("${lastUserText}"). Yielding gracefully to visual UI.`);
        const yieldScript = "Sounds good! Go ahead and make your changes on screen, and click Continue when you're ready.";
        return createVerbatimStream(yieldScript) as any;
      }

      if (isCorrection && !(profile as any)._contactCorrectionAcknowledged) {
        console.log(`[agent-hook]: Voice correction of contact details requested ("${lastUserText}").`);
        (profile as any).contact_confirm_needs_correction = true;
        this.contextManager.advanceWorkflow();
        const scriptText = "No problem at all. What would you like to update — your name, email, or mobile number?";
        return createVerbatimStream(scriptText) as any;
      }

      const name = profile.contact_name || 'your name';
      const email = profile.contact_email || 'your email';
      const phone = formatPhoneForSpeech(profile.contact_mobile || '');

      let prefix = '';
      if ((profile as any)._contactCorrectionAcknowledged) {
        prefix = "Got it — I've updated that. ";
        (profile as any)._contactCorrectionAcknowledged = false;
      }

      if (this.sendStageUpdate) {
        this.sendStageUpdate(this.contextManager.getActiveStage()).catch(err => console.warn(err));
      }

      const script = `${prefix}I have ${name}, ${email}, and ${phone}. Your details are on screen — do they all look correct? If not, please spell out the correction for me, or you can update it directly on the screen.`;
      return createVerbatimStream(script) as any;
    }

    if (pending === 'contact_confirm_correction') {
      if (this.sendStageUpdate) {
        this.sendStageUpdate(this.contextManager.getActiveStage()).catch(err => console.warn(err));
      }
      const scriptText = "No problem — which one would you like to update: your name, email, or mobile number?";
      return createVerbatimStream(scriptText) as any;
    }

    if (pending === 'property_type') {
      const lower = lastUserText.toLowerCase().trim();
      const ptMatch = lower.match(/\b(single\s*family|condo(minium)?|town\s*home|townhouse|multi\s*family|duplex|triplex|fourplex|manufactured|mobile\s*home)\b/i);
      const zipMatch = lower.match(/\b\d{5}\b/);

      if (ptMatch) {
        let detectedType: 'single_family' | 'condo' | 'townhome' | 'multi_family' | 'other' = 'single_family';
        const raw = ptMatch[0].toLowerCase();
        if (raw.includes('condo')) detectedType = 'condo';
        else if (raw.includes('town')) detectedType = 'townhome';
        else if (raw.includes('multi') || raw.includes('duplex') || raw.includes('triplex') || raw.includes('fourplex')) detectedType = 'multi_family';
        else if (raw.includes('single')) detectedType = 'single_family';
        else detectedType = 'other';

        profile.property_type = detectedType;
        profile.property_type_confirmed = true;
        if (zipMatch && !profile.zip_code) {
          profile.zip_code = zipMatch[0];
        }

        console.log(`[agent-hook]: Synchronous property_type answer detected ("${lastUserText}" -> ${detectedType}). Advancing to military_rural.`);
        this.contextManager.advanceWorkflow();

        const hasCoBorrower = profile.co_borrower === 'yes';
        const coBorrowerPhrase = hasCoBorrower ? (ailanaConfig.section0Enabled ? 'you or your co-borrower' : 'you or a co-borrower') : 'you';
        const scriptText = `Got it, thank you. Do ${coBorrowerPhrase} have any military service history — such as being on active duty, a veteran, or part of the Reserve or National Guard?`;
        return createVerbatimStream(scriptText) as any;
      }
    }

    if (pending === 'military_rural') {
      const lower = lastUserText.toLowerCase().trim();
      const isAnsweringMilitary = /\b(yes|yeah|yep|yup|sure|no|never|none|n\/a|not really|veteran|active|guard|reserve|duty|spouse|military|served|army|navy|air force|marines|coast guard|space force|rural|country|countryside|usda|farm|outside city|small town)\b/i.test(lower);

      if (isAnsweringMilitary) {
        console.log(`[agent-hook]: Synchronous military_rural answer detected ("${lastUserText}"). Advancing to job_tenure_type.`);
        const isExplicitNegative = /\b(no|never|none|n\/a|not\s+really|neither)\b/i.test(lower) && !/\b(yes|yeah|yep|yup|sure)\b/i.test(lower);
        const isMilitary = !isExplicitNegative && /\b(yes|yeah|yep|yup|sure|veteran|active|guard|reserve|duty|spouse|military|served|army|navy|air force|marines|coast guard|space force)\b/i.test(lower);
        const isRural = !isExplicitNegative && /\b(rural|country|countryside|usda|farm|outside city|not a city|small town|outside of city)\b/i.test(lower);
        if (isMilitary && isRural) {
          profile.military_rural = 'both';
        } else if (isMilitary) {
          profile.military_rural = 'military';
        } else if (isRural) {
          profile.military_rural = 'rural';
        } else {
          profile.military_rural = 'neither';
        }
        profile.military_rural_confirmed = true;
        this.contextManager.advanceWorkflow();

        // Section 0: ask only what's missing (how they're paid may already be known).
        const scriptText = ailanaConfig.section0Enabled
          ? `Got it, thank you. ${this.contextManager.getJobTenureQuestion()}`
          : "Got it, thank you. Could you tell me a bit about your current job tenure and how you're paid — for example, whether you are salaried, hourly, or self-employed?";
        return createVerbatimStream(scriptText) as any;
      }

      const hasCoBorrower = profile.co_borrower === 'yes';
      const coBorrowerPhrase = hasCoBorrower ? (ailanaConfig.section0Enabled ? 'you or your co-borrower' : 'you or a co-borrower') : 'you';
      const scriptText = `Do ${coBorrowerPhrase} have any military service history — such as being on active duty, a veteran, or part of the Reserve or National Guard?`;
      console.log(`[agent-hook]: Delivering deterministic military_rural script (hasCoBorrower=${hasCoBorrower}) via ReadableStream!`);
      return createVerbatimStream(scriptText) as any;
    }

    if (pending === 'otp_verification' && !profile.otp_verified) {
      const scriptText = "I've sent a one-time code to confirm your email and mobile number — please go ahead and enter it securely on your screen when it arrives, and you're all set.";
      console.log('[agent-hook]: Delivering otp_verification instruction script via Deterministic ReadableStream!');
      // Mark OTP as ready to show ONLY NOW — after Ailana has spoken the bridging line.
      // This prevents the frontend OTP modal from rendering before the speech is delivered.
      (profile as any)._otpReadyToShow = true;

      // Start a 45-second timeout: if OTP is not submitted, Ailana re-prompts gently
      if (!(profile as any)._otpTimeoutStarted) {
        (profile as any)._otpTimeoutStarted = true;
        setTimeout(() => {
          const currentPending = this.contextManager.getPendingField();
          const otpVerified = this.contextManager.getProfile().otp_verified;
          if (currentPending === 'otp_verification' && !otpVerified) {
            console.log('[agent-hook]: OTP timeout (45s) — delivering reminder.');
            const reminder = "Just a reminder — you should have received a one-time code on your screen. Please enter it whenever you're ready, and we'll continue from there.";
            if (this.sayCallback) {
              this.sayCallback(reminder).catch(err => console.warn('[agent-hook]: OTP reminder failed:', err));
            }
          }
        }, 45000);
      }

      return createVerbatimStream(scriptText) as any;
    }

    if (pending === 'soft_pull_authorization') {
      const p = this.contextManager.getProfile();

      // If the disclosure has NOT yet been delivered, deliver it now and WAIT for borrower answer
      if (!p.soft_pull_disclosure_delivered) {
        p.soft_pull_disclosure_delivered = true;
        (p as any).soft_pull_disclosure_delivered_at = Date.now();
        const scriptText = "Before we proceed, I want to be clear about what this involves. This is a soft credit inquiry — it will not affect your credit score in any way. You are the one authorizing it, and your data is used only to process your initial eligibility review and pre-fill your mortgage application. Do you authorize the soft credit inquiry on that basis?";
        console.log('[agent-hook]: Delivering initial soft_pull_authorization disclosure via Deterministic ReadableStream (waiting for verbal response)!');
        return createVerbatimStream(scriptText) as any;
      }

      // If the disclosure has already been delivered, the borrower is now responding!
      const lower = lastUserText.toLowerCase().trim();

      // If pure empty audio or background filler (e.g. "uh", "um"), stay silent and continue listening
      if (!lastUserText || /^(uh|um|hmm|ah|eh)$/i.test(lower)) {
        console.log(`[agent-hook]: Empty/filler sound detected on soft_pull_authorization. Staying silent and listening.`);
        return createVerbatimStream("") as any;
      }

      // Explicitly dump trailing speech from the OTP step:
      // If the user's speech arrives within 4000ms of the disclosure being triggered,
      // it is physically impossible that they are responding to the disclosure (which takes ~15s to speak).
      // This safely dumps words like "Okay" or "Done" said while entering the OTP.
      const deliveredAt = (p as any).soft_pull_disclosure_delivered_at || 0;
      if (Date.now() - deliveredAt < 4000) {
        console.log(`[agent-hook]: Dumping user input ("${lastUserText}") because it arrived less than 4s after soft pull disclosure triggered. Likely a stray OTP confirmation.`);
        // Restart the disclosure because the stray OTP confirmation likely interrupted Ailana!
        const scriptText = "Before we proceed, I want to be clear about what this involves. This is a soft credit inquiry — it will not affect your credit score in any way. You are the one authorizing it, and your data is used only to process your initial eligibility review and pre-fill your mortgage application. Do you authorize the soft credit inquiry on that basis?";
        console.log('[agent-hook]: Restarting soft pull disclosure after early interruption.');
        return createVerbatimStream(scriptText) as any;
      }

      const explanationAttempts = this.contextManager.getSoftPullExplanationCount();
      const decision = await classifyAuthorization(lastUserText, null, explanationAttempts);
      console.log(`[agent-hook]: soft_pull_authorization classification decision="${decision}" (userText="${lastUserText}", explanationAttempts=${explanationAttempts})`);

      if (decision === 'yes') {
        profile.soft_pull_consent = 'accepted';
        profile.prefilled_fields_confirmed = {};

        // ── CRS Verbal Bridge ────────────────────────────────────────────────
        // Fire an immediate acknowledgement so the user hears audio within ~300ms.
        // The actual CRS API call is slow (5–8 seconds); running it BEFORE returning
        // the stream caused dead silence for the entire duration.
        // Strategy: return the bridge line as a verbatim stream immediately,
        // then await the CRS call, populate the profile, and deliver the prefill
        // result via the sayCallback that is already wired to session.say().
        console.log('[agent-hook]: Soft pull explicitly accepted by borrower. Firing verbal bridge immediately, then awaiting CRS...');

        // We must capture sayCallback before the async IIFE so it is in scope.
        const _sayCallback = this.sayCallback;
        const _contextManager = this.contextManager;

        // Kick off the CRS call + prefill delivery asynchronously.
        // This is NOT fire-and-forget: the promise is awaited inside the IIFE
        // and will fully complete before the next user turn.
        (async () => {
          console.log(`[agent-hook]: CRS soft pull started (background, after bridge)...`);
          const crsResult = await callCrsSoftPull(profile);
          if (crsResult) {
            profile.credit_range = crsResult.creditRange;
            (profile as any).crs_open_accounts = crsResult.openAccounts;
            (profile as any).crs_late_payments = crsResult.latePaymentsLast24Mo;
            // Always replace the employer coming from softpull with "Convergent AI"
            profile.employer = 'Convergent AI';
            profile.legal_name = profile.contact_name || profile.borrower_name || crsResult.legalName || 'Valued Borrower';
            if (crsResult.physicalAddress) profile.physical_address = crsResult.physicalAddress;
            console.log(`[agent-hook]: CRS soft pull complete. Name: ${profile.legal_name}, Address: ${crsResult.physicalAddress}`);
          } else {
            console.log(`[agent-hook]: CRS soft pull fallback.`);
          }

          _contextManager.advanceWorkflow();

          const name = profile.contact_name || profile.legal_name || profile.borrower_name || 'Valued Borrower';
          const address = profile.physical_address || (profile.zip_code ? `address on file in zip code ${profile.zip_code}` : 'address on file');
          const prefillScript = `Thank you — that's all done. I have your name listed as ${name}, and your physical address as ${address}. Does that sound right, or is anything out of date?`;
          console.log('[agent-hook]: CRS complete. Delivering prefill_name_address via sayCallback.');
          (profile as any).prefill_name_address_delivered = true;
          if (_sayCallback) {
            await _sayCallback(prefillScript);
          }
        })();

        // Return the verbal bridge immediately — TTS starts in ~0ms.
        const bridgeScript = `Perfect — I'm pulling that up for you right now. Just a moment please.`;
        console.log('[agent-hook]: Returning CRS bridge stream immediately.');
        return createVerbatimStream(bridgeScript) as any;
      }

      if (decision === 'no') {
        profile.soft_pull_consent = 'declined';
        this.contextManager.advanceWorkflow();
        console.log('[agent-hook]: Soft pull declined — transitioning to Stage 2.5 Stated Mode.');
        return createVerbatimStream("Absolutely — we can explore your affordability summary using the information you've already shared.") as any;
      }

      // Otherwise user asked a question or needs explanation — delegate to LLM to answer naturally and re-ask
      console.log('[agent-hook]: User asked a question about soft pull — delegating to LiveKit Inference LLM.');
      return super.llmNode(chatCtx, toolCtx, modelSettings) as any;
    }

    const buildPrefillNameAddressScript = () => {
      const name = profile.contact_name || profile.legal_name || profile.borrower_name || 'Valued Borrower';
      const address = profile.physical_address || (profile.zip_code ? `address on file in zip code ${profile.zip_code}` : 'address on file');
      return `Thank you. I've processed that soft pull. First, I have your name listed as ${name}, and your physical address as ${address}. Does that sound right, or is anything out of date?`;
    };

    const buildPrefillEmployerScript = () => {
      const employer = profile.employer || 'Convergent AI';
      return `Great. Next, I have your employer listed as ${employer}. Does that sound correct, or has anything changed?`;
    };

    const buildPrefillAccountsScript = () => {
      const openAccounts = (profile as any).crs_open_accounts ?? 3;
      const latePayments = (profile as any).crs_late_payments ?? 0;
      const accountWord = openAccounts === 1 ? 'account' : 'accounts';
      const paymentWord = latePayments === 1 ? 'payment' : 'payments';
      const lateText = latePayments === 0 ? 'no late payments' : `${latePayments} late ${paymentWord}`;
      return `Perfect. For your accounts summary, I have ${openAccounts} open ${accountWord} and ${lateText} in the last 24 months. Does that match what you know, or is anything off?`;
    };

    const buildPrefillCreditRangeScript = () => {
      let creditScoreNum = 700;
      if (profile.credit_range) {
        const m = profile.credit_range.match(/\d+/);
        if (m) creditScoreNum = parseInt(m[0], 10);
      }
      let creditCategory = 'Good';
      if (creditScoreNum >= 740) creditCategory = 'Excellent';
      else if (creditScoreNum >= 670) creditCategory = 'Good';
      else if (creditScoreNum >= 580) creditCategory = 'Fair';
      else creditCategory = 'Poor';
      return `Lastly, we retrieved your credit profile showing a category rating in the ${creditCategory} range. Does that match what you expect or is anything out of date?`;
    };

    const buildAffordabilitySummaryIntroScript = () => {
      profile.affordability_panel_rendered = true;
      (profile as any).affordability_panel_closed = false;
      profile.affordability_submitted = false;
      profile.affordability_mode = 'verified';
      this.contextManager.getProfile().affordability_mode = 'verified';
      profile.aus_status = null;
      profile.affordability_aus_status = null;
      this.contextManager.setActiveStage('2.5');
      this.contextManager.setCurrentPendingField('affordability_panel_active');
      if (this.sendStageUpdate) {
        this.sendStageUpdate('2.5').catch(err => console.warn(err));
      }
      const borrowerName = profile.borrower_name || profile.contact_name || profile.legal_name || 'there';
      const isHel = profile.transaction_type === 'TT-HEL' || profile.transaction_type === 'TT-HEQ' || profile.mortgage_goal === 'heloc';
      const isRef = profile.transaction_type === 'TT-REF' || profile.mortgage_goal === 'refinance';

      if (isHel) {
        return profile.transaction_type === 'TT-HEQ'
          ? `Thank you for your patience${borrowerName !== 'there' ? ', ' + borrowerName : ''} — your initial results are in, and your home equity summary is ready for you. It brings together your home value, existing mortgage balance, and the loan amount target you shared with me alongside the details from your credit review, and shows how your numbers compare with typical program guideline ranges. One important note before we look at it together: this is an educational summary to help you explore — it is not a loan decision, and you can submit for the formal eligibility review at any time, no matter what these ranges show. Would you like to walk through it together?`
          : `Thank you for your patience${borrowerName !== 'there' ? ', ' + borrowerName : ''} — your initial results are in, and your home equity summary is ready for you. It brings together your home value, existing mortgage balance, and the credit line target you shared with me alongside the details from your credit review, and shows how your numbers compare with typical program guideline ranges. One important note before we look at it together: this is an educational summary to help you explore — it is not a loan decision, and you can submit for the formal eligibility review at any time, no matter what these ranges show. Would you like to walk through it together?`;
      }
      if (isRef) {
        return `Thank you for your patience${borrowerName !== 'there' ? ', ' + borrowerName : ''} — your initial results are in, and your refinance summary is ready for you. It brings together your home value, existing mortgage balance, and the refinance targets you shared with me alongside the details from your credit review, and shows how your numbers compare with typical program guideline ranges. One important note before we look at it together: this is an educational summary to help you explore — it is not a loan decision, and you can submit for the formal eligibility review at any time, no matter what these ranges show. Would you like to walk through it together?`;
      }
      return `Thank you for your patience${borrowerName !== 'there' ? ', ' + borrowerName : ''} — your initial results are in, and your affordability summary is ready for you. It brings together the income and savings targets you shared with me and the details from your credit review, and shows how your numbers compare with typical program guideline ranges. One important note before we look at it together: this is an educational summary to help you explore — it is not a loan decision, and you can submit for the formal eligibility review at any time, no matter what these ranges show. Would you like to walk through it together?`;
    };

    if (pending === 'prefill_name_address') {
      if (!(profile as any).prefill_name_address_delivered) {
        (profile as any).prefill_name_address_delivered = true;
        return createVerbatimStream(buildPrefillNameAddressScript()) as any;
      }

      const lower = lastUserText.toLowerCase().trim();

      // If the user asked a question about the prefill data, delegate to LLM to answer naturally
      if (isQuestionOrCorrection(lastUserText)) {
        (profile as any).needs_prefill_correction = true;
        return super.llmNode(chatCtx, toolCtx, modelSettings) as any;
      }

      const isAffirmative = isAffirmativeConfirmation(lastUserText);
      const isCorrection = /\b(no|not|wrong|change|update|actually|mistake)\b/i.test(lower) && !isAffirmative;

      if (isAffirmative) {
        console.log(`[agent-hook]: Synchronous prefill_name_address confirmation detected ("${lastUserText}"). Advancing to prefill_employer.`);
        if (!profile.prefilled_fields_confirmed) profile.prefilled_fields_confirmed = {};
        profile.prefilled_fields_confirmed.name_address = true;
        this.contextManager.advanceWorkflow();
        (profile as any).prefill_employer_delivered = true;
        return createVerbatimStream(buildPrefillEmployerScript()) as any;
      }

      if (isCorrection || (profile as any).needs_prefill_correction) {
        return super.llmNode(chatCtx, toolCtx, modelSettings) as any;
      }

      return createVerbatimStream(buildPrefillNameAddressScript()) as any;
    }

    if (pending === 'prefill_employer') {
      if (!(profile as any).prefill_employer_delivered) {
        (profile as any).prefill_employer_delivered = true;
        return createVerbatimStream(buildPrefillEmployerScript()) as any;
      }

      const lower = lastUserText.toLowerCase().trim();

      // If the user asked a question about the prefill data, delegate to LLM to answer naturally
      if (isQuestionOrCorrection(lastUserText)) {
        (profile as any).needs_prefill_correction = true;
        return super.llmNode(chatCtx, toolCtx, modelSettings) as any;
      }

      const isAffirmative = isAffirmativeConfirmation(lastUserText);
      const isCorrection = /\b(no|not|wrong|change|update|actually|mistake)\b/i.test(lower) && !isAffirmative;

      if (isAffirmative) {
        console.log(`[agent-hook]: Synchronous prefill_employer confirmation detected ("${lastUserText}"). Advancing to prefill_accounts.`);
        if (!profile.prefilled_fields_confirmed) profile.prefilled_fields_confirmed = {};
        profile.prefilled_fields_confirmed.employer = true;
        this.contextManager.advanceWorkflow();
        (profile as any).prefill_accounts_delivered = true;
        return createVerbatimStream(buildPrefillAccountsScript()) as any;
      }

      if (isCorrection || (profile as any).needs_prefill_correction) {
        return super.llmNode(chatCtx, toolCtx, modelSettings) as any;
      }

      return createVerbatimStream(buildPrefillEmployerScript()) as any;
    }

    if (pending === 'prefill_accounts') {
      if (!(profile as any).prefill_accounts_delivered) {
        (profile as any).prefill_accounts_delivered = true;
        return createVerbatimStream(buildPrefillAccountsScript()) as any;
      }

      const lower = lastUserText.toLowerCase().trim();

      // If the user asked a question about the prefill data, delegate to LLM to answer naturally
      if (isQuestionOrCorrection(lastUserText)) {
        (profile as any).needs_prefill_correction = true;
        return super.llmNode(chatCtx, toolCtx, modelSettings) as any;
      }

      const isAffirmative = isAffirmativeConfirmation(lastUserText);
      const isCorrection = /\b(no|not|wrong|change|update|actually|mistake)\b/i.test(lower) && !isAffirmative;

      if (isAffirmative) {
        console.log(`[agent-hook]: Synchronous prefill_accounts confirmation detected ("${lastUserText}"). Advancing to prefill_credit_range.`);
        if (!profile.prefilled_fields_confirmed) profile.prefilled_fields_confirmed = {};
        profile.prefilled_fields_confirmed.accounts = true;
        this.contextManager.advanceWorkflow();
        (profile as any).prefill_credit_range_delivered = true;
        return createVerbatimStream(buildPrefillCreditRangeScript()) as any;
      }

      if (isCorrection || (profile as any).needs_prefill_correction) {
        return super.llmNode(chatCtx, toolCtx, modelSettings) as any;
      }

      return createVerbatimStream(buildPrefillAccountsScript()) as any;
    }

    if (pending === 'prefill_credit_range') {
      if (!(profile as any).prefill_credit_range_delivered) {
        (profile as any).prefill_credit_range_delivered = true;
        return createVerbatimStream(buildPrefillCreditRangeScript()) as any;
      }

      const lower = lastUserText.toLowerCase().trim();

      // If the user asked a question about the prefill data, delegate to LLM to answer naturally
      if (isQuestionOrCorrection(lastUserText)) {
        (profile as any).needs_prefill_correction = true;
        return super.llmNode(chatCtx, toolCtx, modelSettings) as any;
      }

      const isAffirmative = isAffirmativeConfirmation(lastUserText);
      const isCorrection = /\b(no|not|wrong|change|update|actually|mistake)\b/i.test(lower) && !isAffirmative;

      if (isAffirmative) {
        console.log(`[agent-hook]: Synchronous prefill_credit_range confirmation detected ("${lastUserText}"). Advancing to Stage 2.5 Affordability Panel.`);
        if (!profile.prefilled_fields_confirmed) profile.prefilled_fields_confirmed = {};
        profile.prefilled_fields_confirmed.credit_range = true;
        this.contextManager.advanceWorkflow();
        (profile as any).affordability_panel_intro_delivered = true;
        return createVerbatimStream(buildAffordabilitySummaryIntroScript()) as any;
      }

      if (isCorrection || (profile as any).needs_prefill_correction) {
        return super.llmNode(chatCtx, toolCtx, modelSettings) as any;
      }

      return createVerbatimStream(buildPrefillCreditRangeScript()) as any;
    }

    // (0ms Verbal Submit Fast-Path moved to top of method)

    const currentPending = this.contextManager.getPendingField();
    if ((profile as any).submit_review_requested || currentPending === 'fd1_delivery' || currentPending === 'fd2_delivery') {
      (profile as any).submit_review_requested = false;
      console.log(`[agent-hook]: LLM-classified submission request detected — executing submission and delivering findings!`);
      profile.affordability_submitted = true;
      profile.affordability_panel_rendered = true;
      (profile as any).affordability_panel_closed = false;
      if (!profile.aus_status) {
        profile.aus_status = (profile.affordability_mode === 'verified' || profile.otp_verified) ? 'approve_eligible' : 'refer';
      }
      (profile as any).affordability_aus_status = profile.aus_status;
      (profile as any).pendingStage5Transition = true;
      if (this.sendStageUpdate) {
        this.sendStageUpdate('2.5').catch(err => console.warn(err));
      }

      const borrowerName = profile.borrower_name || profile.contact_name || profile.legal_name || 'there';
      const isRef = profile.transaction_type === 'TT-REF' || profile.mortgage_goal === 'refinance';
      const isHel = profile.transaction_type === 'TT-HEL' || profile.transaction_type === 'TT-HEQ' || profile.mortgage_goal === 'heloc';
      const isApprove = profile.aus_status === 'approve' || profile.aus_status === 'approve_eligible';

      let scriptText = '';
      if (isRef) {
        if (isApprove) {
          scriptText = `Good news${borrowerName !== 'there' ? ', ' + borrowerName : ''} — your eligibility review came back, and based on the information you provided, you appear conditionally eligible for the refinance scenario you built. Your estimated payment comparison is ready for you — it shows your estimated new payment alongside your current payment reference point. Your licensed loan officer will reach out to walk you through next steps and lock in your rate — or I can connect you right now if you'd like.`;
        } else {
          scriptText = `Thank you for your patience${borrowerName !== 'there' ? ', ' + borrowerName : ''} — your review is back, and your refinance scenario warrants a closer look from a licensed loan officer rather than an automated decision. That is common in refinance situations, and it is often where the best solutions are found — your loan officer can evaluate options like streamline programs or specific equity structures the automated review does not fully cover. Can I connect you to a licensed loan officer now, schedule a callback, or is there another question I can answer for you first?`;
        }
      } else if (isHel) {
        if (isApprove) {
          scriptText = profile.transaction_type === 'TT-HEQ'
            ? `Good news${borrowerName !== 'there' ? ', ' + borrowerName : ''} — your eligibility review came back, and based on the information you provided, you appear conditionally eligible for a home equity loan. Your licensed loan officer will reach out to walk you through next steps — or I can connect you right now if you'd like.`
            : `Good news${borrowerName !== 'there' ? ', ' + borrowerName : ''} — your eligibility review came back, and based on the information you provided, you appear conditionally eligible for a home equity line of credit. Your licensed loan officer will reach out to walk you through the next steps — including the formal application, appraisal scheduling, and the terms of your line — or I can connect you right now if you'd like.`;
        } else {
          scriptText = profile.transaction_type === 'TT-HEQ'
            ? `Thank you for your patience${borrowerName !== 'there' ? ', ' + borrowerName : ''} — your review is back, and your home equity loan scenario warrants a closer look from a licensed loan officer. There are a number of factors in equity lending that a licensed loan officer can review in more detail. Can I connect you now, schedule a callback, or is there another question I can answer for you first?`
            : `Thank you for your patience${borrowerName !== 'there' ? ', ' + borrowerName : ''} — your review is back, and your HELOC scenario warrants a closer look from a licensed loan officer. Equity-based lending depends on several factors that an automated review can only partially assess, and a licensed loan officer may identify options or programs the initial review didn't capture. Can I connect you now, schedule a callback, or is there another question I can answer for you first?`;
        }
      } else {
        if (isApprove) {
          scriptText = `Wonderful news${borrowerName !== 'there' ? ', ' + borrowerName : ''} — your eligibility review came back, and based on the information you provided, you're conditionally eligible for the scenario you built. Your estimated payment range has been calculated and is included in your pre-qualification letter. I've sent your pre-qualification letter to your email on file — it's issued by your lending institution, it's valid for ninety days, and it's exactly what real estate agents like to see with an offer. Your licensed loan officer will reach out to walk you through next steps — or I can connect you right now if you'd like.`;
        } else {
          scriptText = `Thank you for your patience${borrowerName !== 'there' ? ', ' + borrowerName : ''} — your review is back, and your scenario needs a closer look from a person rather than an automated decision. That's genuinely common, and it's often where a licensed loan officer finds the best path — they can consider options the automated review can't. Can I connect you to a licensed loan officer now, schedule a callback, or is there another question I can answer for you first?`;
        }
      }

      return createVerbatimStream(scriptText) as any;
    }

    return super.llmNode(chatCtx, toolCtx, modelSettings) as any;
  }

  override async ttsNode(text: any, modelSettings: any) {
    this.metrics.markTtsStart();
    this.metrics.markAvatarRenderStart();

    let processedText = text;
    if (typeof text === 'string') {
      processedText = normalizePronunciationForTts(text);
    } else if (text && typeof (text as any).pipeThrough === 'function') {
      processedText = (text as ReadableStream<string>).pipeThrough(
        new TransformStream<string, string>({
          transform(chunk, controller) {
            controller.enqueue(normalizePronunciationForTts(chunk));
          },
        })
      );
    }

    return super.ttsNode(processedText, modelSettings);
  }

  override async onUserTurnCompleted(chatCtx: any, userMessage: any): Promise<void> {
    const _perfEouEnd = performance.now();
    // Section 0 safety net (S0-21): an SSN or street address never reaches the logs, the saved transcript or the
    // chat history the model sees. Only the context manager gets the raw text: it redacts it first and raises the TRID gate.
    const rawUserText: string | undefined = userMessage?.textContent;
    const safeUserText = ailanaConfig.section0Enabled && rawUserText ? applySafetyNet(rawUserText).text : rawUserText;
    console.log(`[agent-hook]: onUserTurnCompleted hook triggered with message: "${safeUserText}"`);

    this.contextManager.setLowConfidenceFlag(false);

    if (this.isConversationalSchedulingActive()) {
      if (userMessage?.textContent) {
        void this.contextManager.saveVoiceConversationTurn('user', userMessage.textContent);
      }
      const schedulingInstructions = this.getConversationalSchedulingInstructions();
      const systemItem = (chatCtx.items.find(
        (item: any) => item.type === 'message' && item.id === 'lk.agent_task.instructions'
      ) || chatCtx.items.find(
        (item: any) => item.type === 'message' && item.role === 'system'
      )) as llm.ChatMessage | undefined;
      if (systemItem) {
        systemItem.content = [schedulingInstructions];
        (systemItem as any).id = 'lk.agent_task.instructions';
      } else {
        chatCtx.items.unshift(new llm.ChatMessage({
          id: 'lk.agent_task.instructions',
          role: 'system',
          content: schedulingInstructions,
        }));
      }
      const dynamicMsgIndex = chatCtx.items.findIndex(
        (item: any) => item.type === 'message' && item.id === 'lk.agent_dynamic_state'
      );
      if (dynamicMsgIndex !== -1) chatCtx.items.splice(dynamicMsgIndex, 1);
      console.log(`[voice-scheduling]: scheduling prompt retained; mortgage stage extraction bypassed for "${userMessage?.textContent || ''}".`);
      return;
    }

    if (userMessage?.textContent && this.globalTurnInterceptor) {
      const handled = await this.globalTurnInterceptor(userMessage.textContent);
      if (handled) {
        this.suppressNextReply = true;
        void this.contextManager.saveVoiceConversationTurn('user', userMessage.textContent);
        return;
      }
    }

    if (userMessage?.textContent) {
      // ⚠️  CRITICAL: Capture the pending field SYNCHRONOUSLY before any awaits.
      // The reconcile for the PREVIOUS turn's background extraction can fire during
      // an async yield (e.g. saveVoiceConversationTurn), advancing currentPendingField
      // to a new (non-boundary) field. If we read it AFTER the await, the boundary
      // check sees the wrong field and the 0ms path is taken instead of the wait.
      const activeField = this.contextManager.getPendingField();
      this.activeFieldAtTurnStart = activeField;
      const isBoundary = this.contextManager.isStageBoundaryField(activeField);
      const isDeterministic = this.contextManager.isDeterministicField(activeField);

      await this.contextManager.saveVoiceConversationTurn('user', safeUserText ?? userMessage.textContent);

      const currentTurnNumber = this.contextManager.triggerBackgroundExtraction(rawUserText ?? userMessage.textContent);
      if (safeUserText !== rawUserText && safeUserText) userMessage.content = [safeUserText]; // the chat-history copy

      const text = userMessage.textContent.trim();
      const isQuestionOrHesitation =
        /\?$/.test(text) ||
        /\b(what|why|how|can i|could i|does|is it|explain|tell me|wait|hold on|what if|who|meaning|clarify|question|ask)\b/i.test(text);

      const inAffordability = this.contextManager.getActiveStage() === '2.5' || activeField === 'affordability_panel_active' || !!this.contextManager.getProfile().affordability_panel_rendered;
      const isFastPathSubmitOrUpgrade = inAffordability && !isQuestionOrHesitation && (
        /\b(?:submit\s*(?:for\s*me|it|review|my\s*review|this|now)?|can\s+you\s+submit|please\s+submit|go\s+ahead\s+(?:and\s+)?submit|run\s+the\s+review|proceed\s+with\s+review|send\s+my\s+scenario|do\s+it\s+for\s+me|send\s+it|yes\s+submit|let'?s\s+submit|go\s+ahead|let'?s\s+go|proceed|ready\s+to\s+submit|i'?m\s+ready|yes\s+please|sounds\s+good|looks\s+good(?:.*?)\bsubmit\b)\b/i.test(text) ||
        /\b(upgrade|verified\s*(?:mode|numbers|score|credit)|soft\s*(?:credit\s*)?(?:pull|review)|check\s*my\s*credit|run\s*(?:my\s*)?credit)\b/i.test(text)
      );

      if (isQuestionOrHesitation) {
        console.log(`[agent-hook]: Question/hesitation detected on field "${activeField}". Staying on current field to answer user question.`);
        // User asked a question — do NOT advance stage or inject fallback. Let LLM answer and re-prompt the pending field.
      } else if (isFastPathSubmitOrUpgrade) {
        console.log(`[agent-hook]: Fast-path submit/upgrade detected on field "${activeField}" — bypassing stage boundary wait for true 0ms response!`);
      } else if (isBoundary) {
        // Deterministic fields (like OTP modal / CRS pull) get their required await
        const waitMs = isDeterministic ? 2500 : 4000;
        console.log(`[agent-hook]: Field "${activeField}" is a STAGE BOUNDARY (deterministic=${isDeterministic}). Waiting up to ${waitMs}ms for extraction to transition stage...`);

        const completedInTime = await this.contextManager.waitForExtraction(currentTurnNumber, waitMs);

        if (!completedInTime) {
          console.warn(`[agent-hook]: Stage boundary extraction timed out (>${waitMs}ms). Proceeding without stalling.`);
        } else {
          console.log(`[agent-hook]: Stage boundary extraction completed in time! Stage is now: ${this.contextManager.getActiveStage()}`);
        }
      } else {
        console.log(`[agent-hook]: Background extraction triggered async (turn=${currentTurnNumber}, field="${activeField}"). Pipeline proceeds immediately — 0ms wait.`);
        // Inject placeholder / optimistic advance so the LLM proceeds immediately @ 0ms
        this.contextManager.injectFallbackForPendingField();
      }
    }

    // ── Instructions update ───────────────────────────────────────────
    this.updateInstructionsCallback();
    this.applyTurnContext(chatCtx);
    this.turnPrepared = true;
  }

  /**
   * Put the current static instructions (Layer 1 + 2) at the head of this
   * generation's chat context and the per-turn dynamic context (Layer 3:
   * profile, CURRENT TASK, bridges) at its tail. Shared by voice turns
   * (onUserTurnCompleted) and turns processed in llmNode (simulations).
   */
  private applyTurnContext(chatCtx: any): void {
    const staticInstructions = this.contextManager.getStaticInstructions();
    const systemItem = (chatCtx.items.find(
      (item: any) => item.type === 'message' && item.id === 'lk.agent_task.instructions'
    ) || chatCtx.items.find(
      (item: any) => item.type === 'message' && item.role === 'system'
    )) as llm.ChatMessage | undefined;
    if (systemItem) {
      if (systemItem.content?.[0] !== staticInstructions) {
        systemItem.content = [staticInstructions];
      }
      if ((systemItem as any).id !== 'lk.agent_task.instructions') {
        (systemItem as any).id = 'lk.agent_task.instructions';
      }
    } else {
      chatCtx.items.unshift(new llm.ChatMessage({
        id: 'lk.agent_task.instructions',
        role: 'system',
        content: staticInstructions
      }));
    }

    // Clean previous dynamic state message if present to keep history prefix pristine
    const dynamicMsgIndex = chatCtx.items.findIndex(
      (item: any) => item.type === 'message' && item.id === 'lk.agent_dynamic_state'
    );
    if (dynamicMsgIndex !== -1) {
      chatCtx.items.splice(dynamicMsgIndex, 1);
    }

    // Append dynamic turn context at the tail to anchor static prefix cache
    const dynamicContext = this.contextManager.getDynamicContext();
    if (dynamicContext) {
      chatCtx.items.push(new llm.ChatMessage({
        id: 'lk.agent_dynamic_state',
        role: 'system',
        content: dynamicContext,
      }));
    }
  }
}

process.on('uncaughtException', (err) => {
  if (err?.message?.includes('audio_end_ms') || (err as any)?.context?.error?.message?.includes('audio_end_ms')) {
    console.warn('[agent]: Suppressed known OpenAI audio_end_ms crash.');
    return;
  }
  if (err?.message?.includes('powershell.exe') || err?.message?.includes('pidusage') || err?.message?.includes('ENOENT') && err?.message?.includes('powershell')) {
    console.warn('[agent]: Suppressed pidusage powershell spawn crash.');
    return;
  }
  console.error('[agent]: Uncaught Exception:', err);
  process.exit(1);
});

export default defineAgent({
  async entry(ctx: JobContext) {
    console.log(`[agent]: Receiving job for room: ${ctx.room.name}`);

    // ── LiveKit Agent Simulation detection (Section 0 plan §7.3) ─────────────
    // Must run before anything touches the database, CRS or SIP.
    const simCtx = ctx.simulationContext();
    if (simCtx) {
      activateSimulation(simCtx);
    }

    // ── STARTUP ENVIRONMENT DIAGNOSTICS ──────────────────────────────────────
    // Printed on every job start so GCP logs show exactly which secrets were
    // injected. Keys are shown as present/MISSING + last-4 chars only.
    const envCheck = (key: string, val: string) =>
      val ? `✓ present (…${val.slice(-4)})` : '✗ MISSING';
    console.log('[agent-startup] ══ Environment variable audit ══');
    console.log(`[agent-startup]  CARTESIA_KEY          : ${envCheck('CARTESIA_KEY', ailanaConfig.cartesiaKey)}`);
    console.log(`[agent-startup]  CARTESIA_VOICE_ID    : ${ailanaConfig.cartesiaVoiceId ? '✓ ' + ailanaConfig.cartesiaVoiceId : '✗ MISSING'}`);
    console.log(`[agent-startup]  LEMONSLICE_API_KEY    : ${envCheck('LEMONSLICE_API_KEY', ailanaConfig.lemonsliceApiKey)}`);
    console.log(`[agent-startup]  LEMONSLICE_AGENT_ID   : ${ailanaConfig.lemonsliceAgentId ? '✓ ' + ailanaConfig.lemonsliceAgentId : '✗ MISSING'}`);
    console.log(`[agent-startup]  CEREBRAS_API_KEY      : ${envCheck('CEREBRAS_API_KEY', ailanaConfig.cerebrasApiKey)}`);
    console.log(`[agent-startup]  LIVEKIT_URL           : ${process.env.LIVEKIT_URL ?? '✗ MISSING'}`);
    console.log(`[agent-startup]  LIVEKIT_API_KEY       : ${process.env.LIVEKIT_API_KEY ? '✓ present' : '✗ MISSING'}`);
    console.log('[agent-startup] ════════════════════════════════');
    // ─────────────────────────────────────────────────────────────────────────

    let resolveAvatarReady: () => void = () => { };
    const avatarReadyPromise = new Promise<void>((resolve) => {
      resolveAvatarReady = resolve;
    });
    let isAvatarInitDone = false;

    const metrics = new LatencyTracker();
    const summarizationLlm = new inference.LLM({
      model: 'google/gemma-4-31b-it',
    });
    const contextManager = new SessionContextManager(summarizationLlm, metrics);
    if (simCtx) {
      simContextManager = contextManager;
      contextManager.setChannel('text'); // simulations run in text mode
    }

    // ── Pre-cache System Prompt ───────────────────────────────────────────────
    // Warm up the inference server cache so the first user turn TTFT is fast
    (async () => {
      try {
        console.log(`[agent-startup]: Pre-caching system prompt...`);
        const preCacheCtx = new llm.ChatContext();
        preCacheCtx.items.push(new llm.ChatMessage({
          role: 'system',
          content: contextManager.getStaticInstructions(),
        }));
        const stream = summarizationLlm.chat({ chatCtx: preCacheCtx });
        for await (const chunk of stream) {
          break; // pull one chunk to force the request, then stop
        }
        console.log(`[agent-startup]: System prompt pre-caching complete.`);
      } catch (err) {
        console.warn(`[agent-startup]: Failed to pre-cache system prompt:`, err);
      }
    })();
    // ─────────────────────────────────────────────────────────────────────────

    // ── Set Session ID and Application ID for audit logging ──────────────────
    let parsedMetadata: any = {};
    if (ctx.room.metadata) {
      try {
        parsedMetadata = typeof ctx.room.metadata === 'string' ? JSON.parse(ctx.room.metadata) : ctx.room.metadata;
      } catch (e) {
        console.warn(`[agent-audit] Could not parse room metadata as JSON:`, ctx.room.metadata);
      }
    }

    const sessionId = parsedMetadata.sessionId || ctx.room.name || `room_${Date.now()}`;
    contextManager.setSessionId(sessionId);

    if (parsedMetadata.applicationId) {
      contextManager.setApplicationId(parsedMetadata.applicationId);
      console.log(`[agent-audit] Application ID configured from room metadata: ${parsedMetadata.applicationId}`);
    }
    console.log(`[agent-audit] Session ID configured for affordability audit logging: ${sessionId}`);
    
    let sendStageUpdateFn: ((stage: string) => Promise<void>) | null = null;
    contextManager.onStateReconciled = (manager) => {
      if (sendStageUpdateFn) {
        sendStageUpdateFn(manager.getActiveStage()).catch(err => console.warn(`[agent]: Failed to send reconciled stage update:`, err));
      }
    };

    // ── DATABASE PERSISTENCE: Create or load application ─────────────────────
    // Each room session maps to a single application in the database.
    // Use room name as unique identifier to resume existing sessions.
    if (isDatabaseEnabled()) {
      try {
        const roomName = ctx.room.name ?? `room_${Date.now()}`;
        console.log(`[agent-db]: Checking for existing application with roomName="${roomName}"...`);

        // Resume existing IN_PROGRESS application if one exists for this room
        const application = await applicationService.findApplicationByRoomName(roomName);

        if (application) {
          console.log(`[agent-db]: ✅ Found existing application (id=${application.id})`);
          contextManager.setApplicationId(application.id);
          // TESTING MODE: Skip restoring affordability submission state so each call starts fresh
          await contextManager.initializeFromDatabase(application.id, true);
          console.log(`[agent-db]: ✅ Context restored from database (affordability state skipped for fresh testing)`);
        } else {
          console.log(`[agent-db]: No existing application found, creating new one...`);

          // Create test user for now (TODO: integrate with actual user authentication)
          const testUser = await applicationService.createUser({
            email: `test_${roomName}@convergentai.com`,
            firstName: 'Test',
            lastName: 'User',
            phoneNumber: null,
          });

          // Create new application only if testUser was created successfully
          if (testUser) {
            const newApplication = await applicationService.createApplication({
              userId: testUser.id,
              roomName: roomName,
              currentStage: '1',
              status: 'IN_PROGRESS',
            });

            if (newApplication) {
              console.log(`[agent-db]: ✅ Created new application (id=${newApplication.id}) for user (id=${testUser.id})`);
              contextManager.setApplicationId(newApplication.id);
            }
          }
        }
      } catch (error) {
        console.error('[agent-db]: ❌ Failed to initialize application:', error);
        console.log('[agent-db]: Continuing without database persistence...');
      }
    } else {
      console.log('[agent-db]: Database persistence disabled (no DATABASE_URL configured)');
    }
    // ─────────────────────────────────────────────────────────────────────────

    // ── STT: Cartesia ink-2 via LiveKit Inference ────────────────────────────
    console.log(`[agent]: Loading Cartesia STT via LiveKit Inference (ink-2)...`);
    const sessionStt = new inference.STT({
      model: 'cartesia/ink-2',
      language: 'en',
    });

    // ── TTS: Cartesia sonic-3.6 via LiveKit Inference ────────────────────────
    console.log(`[agent]: Loading Cartesia TTS via LiveKit Inference (${ailanaConfig.cartesiaModel})...`);
    const sessionTts = new inference.TTS({
      model: (ailanaConfig.cartesiaModel as any) || 'cartesia/sonic-3.6',
      voice: ailanaConfig.cartesiaVoiceId || 'a167e0f3-df7e-4d52-a9c3-f949145efdab',
      sampleRate: 16000,
    });

    type VoiceSchedulingState = {
      active: boolean;
      completedAt: number;
      confirmationNumber: string | null;
      zipCode: string;
      queueName: string | null;
      queueNumber: string | null;
      slots: Array<{ bookingToken: string; start: string; end: string; display: string }>;
    };
    const voiceScheduling: VoiceSchedulingState = {
      active: false,
      completedAt: 0,
      confirmationNumber: null,
      zipCode: '',
      queueName: null,
      queueNumber: null,
      slots: [],
    };

    const voiceMloTransfer = {
      active: false,
      phase: 'idle' as 'idle' | 'awaiting_zip' | 'dispatching' | 'ringing',
      zip: null as string | null,
      zipAttempts: 0,
      lastZipPromptAt: 0,
      requestedAt: 0,
    };

    let mloTransferPending = false;
    let activeSipIdentity: string | null = null;
    let shuttingDown = false;
    const readBoundedNumber = (name: string, fallback: number, min: number, max: number) => {
      const parsed = Number(process.env[name]);
      return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
    };
    let requestMloTransferHandler: (text: string) => Promise<boolean> = async () => false;
    let activeAvatarSession: any = null;

    const schedulingTools = {
      findMeetingTimes: llm.tool({
        description: 'Check real Google Calendar availability for the active conversational scheduling flow. Call this only after the customer gives a preferred date and time zone. Never invent availability.',
        parameters: z.object({
          requestedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Customer requested local calendar date in YYYY-MM-DD format.'),
          customerTimeZone: z.string().min(3).max(80).describe('IANA time zone, for example America/Los_Angeles.'),
        }),
        execute: async ({ requestedDate, customerTimeZone }: { requestedDate: string; customerTimeZone: string }) => {
          if (!voiceScheduling.active || !voiceScheduling.zipCode) return { ok: false, error: 'scheduling_not_active' };
          const result = await findConversationalSlots(voiceScheduling.zipCode, customerTimeZone, requestedDate);
          voiceScheduling.queueName = result.route.queueName;
          voiceScheduling.queueNumber = result.route.queueExtension;
          voiceScheduling.slots = result.slots;
          return {
            ok: true,
            requestedDate,
            customerTimeZone,
            queueName: result.route.queueName,
            queueNumber: result.route.queueExtension,
            slots: result.slots.slice(0, 5).map((slot, index) => ({ option: index + 1, start: slot.start, end: slot.end, display: slot.display })),
          };
        },
      }),
      confirmMeeting: llm.tool({
        description: 'Create the Google Calendar appointment, appointments database record, customer confirmation email, and staff email. Reuse engagement contact details automatically; ask only for genuinely missing fields. Call only after a concise time confirmation and explicit consent. Never read or spell the full email address or phone number aloud.',
        parameters: z.object({
          slotOption: z.number().int().min(1).max(5),
          customerName: z.string().min(2).max(120).optional(),
          customerEmail: z.string().email().max(254).optional(),
          customerPhone: z.string().max(30).optional(),
          customerNotes: z.string().max(2000).optional(),
          customerTimeZone: z.string().min(3).max(80),
          explicitConsent: z.literal(true),
        }),
        execute: async (args) => {
          if (!voiceScheduling.active || !voiceScheduling.zipCode) return { ok: false, error: 'scheduling_not_active' };
          const selected = voiceScheduling.slots[args.slotOption - 1];
          if (!selected) return { ok: false, error: 'invalid_or_expired_slot', instruction: 'Check availability again.' };
          const profile = contextManager.getProfile();
          const customerName = args.customerName?.trim()
            || profile.contact_name?.trim()
            || profile.legal_name?.trim()
            || profile.borrower_name?.trim()
            || '';
          const customerEmail = args.customerEmail?.trim() || profile.contact_email?.trim() || '';
          const customerPhone = args.customerPhone?.trim() || profile.contact_mobile?.trim() || '';
          const missingContactFields = [
            customerName.length < 2 ? 'full name' : null,
            !/^\S+@\S+\.\S+$/.test(customerEmail) ? 'email address' : null,
            customerPhone.replace(/\D/g, '').length < 10 ? 'complete phone number' : null,
          ].filter((field): field is string => Boolean(field));
          if (missingContactFields.length > 0) {
            return {
              ok: false,
              error: 'missing_contact_details',
              missingFields: missingContactFields,
              instruction: `Ask only for the missing ${missingContactFields.join(', ')}. Do not ask the customer to repeat contact details already collected during this engagement.`,
            };
          }
          try {
            const result = await bookConversationalAppointment({
              bookingToken: selected.bookingToken,
              customerName,
              customerEmail,
              customerPhone,
              customerTimeZone: args.customerTimeZone,
              zipCode: voiceScheduling.zipCode,
              queueName: voiceScheduling.queueName,
              consent: true,
              ...(ctx.room.name ? { roomName: ctx.room.name } : {}),
              ...(args.customerNotes ? { customerNotes: args.customerNotes } : {}),
            });
            voiceScheduling.active = false;
            voiceScheduling.completedAt = Date.now();
            voiceScheduling.confirmationNumber = result.confirmationNumber || null;
            voiceScheduling.slots = [];
            voiceMloTransfer.active = false;
            voiceMloTransfer.phase = 'idle';
            voiceMloTransfer.zip = null;
            console.log(`[voice-scheduling]: completed confirmation=${result.confirmationNumber || 'unknown'}; short acknowledgements can no longer reopen transfer.`);
            return {
              ok: true,
              ...result,
              instruction: result.customerEmailSent
                ? 'Read the confirmation number and confirmed local date/time, and tell the customer that the confirmation email was sent.'
                : 'Read the confirmation number and confirmed local date/time. Clearly say the calendar booking succeeded but the confirmation email could not be delivered; do not claim an email was sent.',
            };
          } catch (error) {
            const message = safeErrorMessage(error);
            if (message.includes('SLOT_NO_LONGER_AVAILABLE')) {
              voiceScheduling.slots = [];
              return { ok: false, error: 'slot_no_longer_available', instruction: 'Apologize and check availability again.' };
            }
            return { ok: false, error: 'booking_failed', instruction: 'Do not claim success. Offer to retry or request a callback.' };
          }
        },
      }),
      cancelMeetingScheduling: llm.tool({
        description: 'Exit conversational scheduling when the customer clearly declines or asks to return to the normal Ailana conversation.',
        parameters: z.object({ confirmedByCustomer: z.literal(true) }),
        execute: async () => {
          voiceScheduling.active = false;
          voiceScheduling.slots = [];
          return { ok: true, instruction: 'Acknowledge the choice and ask what else Ailana can help with.' };
        },
      }),
    };

    const conversationalSchedulingInstructions = () => {
      const profile = contextManager.getProfile();
      return `
You are Ailana, handling a dedicated voice-first Loan Officer meeting scheduling workflow.
This workflow has priority over every mortgage prequalification stage until the booking succeeds or the customer explicitly cancels.

ACTIVE ROUTE:
- ZIP: ${voiceScheduling.zipCode || 'unknown'}
- Queue: ${voiceScheduling.queueName || 'Assigned Loan Officer Queue'}${voiceScheduling.queueNumber ? ` (${voiceScheduling.queueNumber})` : ''}
- Current UTC time: ${new Date().toISOString()}

KNOWN CUSTOMER DETAILS (reuse automatically; confirm once before booking; never ask the customer to repeat a known value):
- Name: ${profile.contact_name || profile.legal_name || profile.borrower_name || 'not collected'}
- Email: ${profile.contact_email || 'not collected'}
- Phone: ${profile.contact_mobile || 'not collected'}

REQUIRED FLOW:
1. If the customer has not agreed to schedule, ask once whether they want a meeting.
2. Collect the preferred date and approximate time. Resolve relative dates such as tomorrow from Current UTC time and the customer's time zone.
3. Determine the IANA customer time zone from the property/customer location when reliable; otherwise ask. Call findMeetingTimes. Never invent availability.
4. Offer at most three returned slots and ask the customer to select one.
5. Reuse the known name, email, and phone above. Ask only for fields shown as "not collected". Never ask for a known value again. Collect a short description of what they want help with.
6. NEVER spell or read back the email address, phone number, name, or notes. Say only "I have your contact details."
7. Confirm only the selected local date and time, then ask for explicit consent. Use exactly: "I have your contact details and [selected date and time]. Shall I book it and email your confirmation?"
8. Only after explicit consent call confirmMeeting. A booking exists only if the tool returns ok=true. Read the confirmation number aloud.
9. If the customer declines scheduling, call cancelMeetingScheduling.

Do not ask mortgage_goal, purchase-versus-refinance, occupancy, income, or any prequalification question during this workflow.
Do not mention an on-screen scheduler or popup. Do not claim success before the booking tool succeeds.
Every spoken response MUST be 18 words or fewer, except the final booking result. Ask only one question. Never use <expr type="spell"> during scheduling.
`.trim();
    };

    const startConversationalScheduling = async (input: {
      zipCode: string;
      queueName?: string | null;
      queueNumber?: string | null;
      reason: 'no_agent_available' | 'queue_timeout' | 'transfer_failed';
    }) => {
      voiceMloTransfer.active = false;
      voiceMloTransfer.phase = 'idle';
      voiceMloTransfer.zip = null;
      voiceScheduling.active = true;
      voiceScheduling.completedAt = 0;
      voiceScheduling.confirmationNumber = null;
      voiceScheduling.zipCode = input.zipCode;
      voiceScheduling.queueName = input.queueName || null;
      voiceScheduling.queueNumber = input.queueNumber || null;
      voiceScheduling.slots = [];
      isHibernating = false;
      for (const p of ctx.room.remoteParticipants.values()) {
        for (const pub of p.trackPublications.values()) {
          try { if (!pub.subscribed) pub.setSubscribed(true); } catch (_) { }
        }
      }
      const stateCode = input.queueName?.match(/_mlo_([a-z]{2})$/i)?.[1]?.toUpperCase();
      const stateNames = new Intl.DisplayNames(['en'], { type: 'region' });
      const queueDisplayName = stateCode
        ? `${stateNames.of(stateCode) || stateCode} Loan Officer queue`
        : 'assigned Loan Officer queue';
      const queueLabel = input.queueNumber
        ? `${queueDisplayName} (${input.queueNumber})`
        : queueDisplayName;

      // Deterministic notice: No Loan Officers are currently available in the ${queueLabel}.
      // Would you like me to schedule a callback with a licensed Loan Officer?
      const offerScript = input.reason === 'no_agent_available'
        ? `No Loan Officers are currently available in the ${queueLabel}. Would you like me to schedule a callback with a licensed Loan Officer?`
        : input.reason === 'queue_timeout'
          ? `No Loan Officer answered the ${queueLabel}. Would you like me to schedule a callback with a licensed Loan Officer?`
          : `I couldn't complete the connection to the ${queueLabel}. Would you like me to schedule a callback with a licensed Loan Officer?`;
      console.log(`[voice-scheduling]: started reason=${input.reason} zip=${input.zipCode} queue=${input.queueNumber || 'unknown'}`);
      metrics.startTurn();
      await session.say(offerScript, { addToChatCtx: true });
      contextManager.onAgentTurn(offerScript).catch(err =>
        console.error('[voice-scheduling]: failed to persist deterministic offer:', err)
      );
      console.log(`[voice-scheduling]: deterministic availability/callback offer delivered reason=${input.reason} queue=${input.queueNumber || 'unknown'}`);
    };

    const performMloTransfer = async (opts?: { zip?: string; userIdentity?: string }) => {
      if (mloTransferPending || isHibernating || voiceScheduling.active) {
        console.log('[agent]: MLO transfer already pending/active; ignoring duplicate request.');
        return;
      }
      mloTransferPending = true;
        // Freeze the AI pipeline immediately. Queue availability and SIP setup
        // are asynchronous; leaving the session active during that window lets
        // ring/noise trigger STT and causes Ailana to speak over the officer.
      voiceMloTransfer.active = true;
      voiceMloTransfer.phase = 'ringing';
      voiceMloTransfer.zip = String(opts?.zip || contextManager.getProfile().zip_code || '').replace(/\D/g, '').slice(0, 5) || null;
      isHibernating = true;
      console.log('[agent]: 📞 MLO transfer requested; validating the mapped queue before stopping Ailana.');

      // 1. Send data channel trigger to frontend so UI switches to Loan Officer queue mode automatically
      try {
        const payload = new TextEncoder().encode(JSON.stringify({ message: "SYSTEM_TRIGGER_MLO_TRANSFER" }));
        await ctx.room.localParticipant?.publishData(payload, { reliable: true, topic: 'lk-chat' });
        console.log(`[agent]: 📞 Sent SYSTEM_TRIGGER_MLO_TRANSFER to frontend over DataChannel.`);
      } catch (err) {
        console.warn('[agent]: Failed to send SYSTEM_TRIGGER_MLO_TRANSFER:', err);
      }

      // 2. Interrupt any in-progress LLM/TTS generation immediately
      try {
        if ((session as any)._started) {
          session.interrupt();
        }
      } catch (e) {
        console.warn('[agent]: Failed to interrupt session:', e);
      }

      // 3. Unsubscribe from ALL remote participant tracks so VAD receives no audio
      for (const p of ctx.room.remoteParticipants.values()) {
        for (const pub of p.trackPublications.values()) {
          try { pub.setSubscribed(false); } catch (_) { }
        }
      }
      console.log('[agent]: 🔇 All tracks unsubscribed. User and loan officer now on direct line.');

      // 4. Dial the SIP trunk to bring the loan officer into the room
      if (simCtx) {
        // Simulations must never ring a real MLO — record the attempt instead.
        recordSimTransfer(ctx.room.name || '', contextManager.getProfile());
        return;
      }
      try {
        const { resolveQueueForZip } = await import('./lib/zipResolver.js');
        const { getStableQueueAvailability, waitForQueueAgentAnswer } = await import('./services/freeswitch-esl.js');
        const requestedZip = String(opts?.zip || voiceMloTransfer.zip || contextManager.getProfile().zip_code || '').replace(/\D/g, '').slice(0, 5);
        const queue = await resolveQueueForZip(requestedZip);
        if (!queue) throw new Error(`UNSUPPORTED_AREA: no queue for zip ${requestedZip}`);

        // Step 5.3: Pre-flight availability check
        const availability = await getStableQueueAvailability(queue.queueExtension);
        if (!availability.available) {
          const noAgentError: any = new Error(`NO_AGENT_AVAILABLE: queue ${queue.queueExtension}`);
          noAgentError.code = 'NO_AGENT_AVAILABLE';
          throw noAgentError;
        }

        // Step 5.4: Selective WebRTC track preservation: preserve customer mic track!
        for (const p of ctx.room.remoteParticipants.values()) {
          if (p.identity.startsWith('guest_')) continue;
          for (const pub of p.trackPublications.values()) {
            try { pub.setSubscribed(false); } catch (_) { }
          }
        }
        // AI media subscriptions disabled before MLO dial; customer microphone remains subscribed.
        console.log('[agent]: 🔇 Non-customer media isolated before MLO dial; customer microphone remains subscribed. (AI media subscriptions disabled before MLO dial)');

        const { transferRoomToMloQueue } = await import('./utils/sipTransfer.js');
        const res = await transferRoomToMloQueue({
          roomName: ctx.room.name || '',
          ...(opts?.userIdentity ? { userIdentity: opts.userIdentity } : {}),
          zip: requestedZip,
        });

        activeSipIdentity =
          (res && (res as any).participantIdentity) ||
          `sip-fspbx-${ctx.room.name || ''}`;

        // Step 5.5: ESL human answer polling
        const answeredAgent = await waitForQueueAgentAnswer(queue.queueExtension);
        if (!answeredAgent) {
          const sipIdentity = activeSipIdentity;
          activeSipIdentity = null;
          if (sipIdentity) {
            const { hangupMloParticipant } = await import('./utils/sipTransfer.js');
            await hangupMloParticipant(ctx.room.name || '', sipIdentity).catch(() => undefined);
          }
          throw new Error(`QUEUE_AGENT_TIMEOUT: no human answer for queue ${queue.queueExtension}`);
        }

        mloTransferPending = false;
        voiceMloTransfer.active = false;
        voiceMloTransfer.phase = 'idle';
        voiceMloTransfer.zip = null;

        if (activeAvatarSession) {
          try {
            await activeAvatarSession.aclose();
            console.log(`[agent]: ✅ Avatar session closed after SIP answer. (ProtoFace avatar session closed after SIP answer)`);
          } catch (avatarCloseError) {
            console.warn('[agent]: Avatar close after SIP answer failed:', avatarCloseError);
          } finally {
            activeAvatarSession = null;
          }
        }

        try {
          const connectedPayload = new TextEncoder().encode(JSON.stringify({
            message: 'SYSTEM_MLO_AGENT_CONNECTED',
            extension: answeredAgent.extension,
            queueName: queue.queueName,
            queueNumber: queue.queueExtension,
          }));
          await ctx.room.localParticipant?.publishData(connectedPayload, { topic: 'lk-chat', reliable: true });
        } catch (publishError) {
          console.error('[agent]: failed to publish human MLO answer:', publishError);
        }

        for (const p of ctx.room.remoteParticipants.values()) {
          for (const pub of p.trackPublications.values()) {
            try { pub.setSubscribed(false); } catch (_) { }
          }
        }
        console.log(`[agent]: ✅ Human MLO ${answeredAgent.extension} answered; Ailana remains stopped.`);
      } catch (err: any) {
        mloTransferPending = false;
        const noAgentAvailable = String(err?.message || '').includes('NO_AGENT_AVAILABLE');
        isHibernating = false;
        if (noAgentAvailable) {
          console.log(`[agent]: No registered agent is available; starting scheduling (${safeErrorMessage(err)}).`);
        } else {
          console.warn(`[agent]: SIP transfer did not complete: ${safeErrorMessage(err)}`);
        }

        const requestedZip = String(opts?.zip || voiceMloTransfer.zip || contextManager.getProfile().zip_code || '').replace(/\D/g, '').slice(0, 5);
        let queueName: string | null = null;
        let queueNumber: string | null = null;
        try {
          const { resolveQueueForZip } = await import('./lib/zipResolver.js');
          const mapped = await resolveQueueForZip(requestedZip);
          queueName = mapped?.queueName || null;
          queueNumber = mapped?.queueExtension || null;
        } catch { /* original error remains authoritative */ }

        const unsupportedArea = String(err?.message || '').includes('UNSUPPORTED_AREA');
        if (unsupportedArea) {
          voiceMloTransfer.active = false;
          voiceMloTransfer.phase = 'idle';
          voiceMloTransfer.zip = null;
        }

        const schedulingReason = noAgentAvailable ? 'no_agent_available' : 'queue_timeout';
        if (!unsupportedArea && /^\d{5}$/.test(requestedZip)) {
          voiceScheduling.active = true;
          voiceScheduling.completedAt = 0;
          voiceScheduling.confirmationNumber = null;
          voiceScheduling.zipCode = requestedZip;
          voiceScheduling.queueName = queueName;
          voiceScheduling.queueNumber = queueNumber;
          voiceScheduling.slots = [];
        }

        try {
          const reason = unsupportedArea
            ? 'unsupported_area'
            : noAgentAvailable
              ? 'no_agent_available'
            : 'queue_timeout';
          const payload = new TextEncoder().encode(
            JSON.stringify({ message: 'SYSTEM_MLO_UNSUPPORTED', reason })
          );
          await ctx.room.localParticipant?.publishData(payload, {
            topic: 'lk-chat',
            reliable: true,
          });
        } catch (publishError) {
          console.error('[agent]: failed to publish MLO failure signal:', publishError);
        }

        if (!unsupportedArea && /^\d{5}$/.test(requestedZip)) {
          const recoveryDelayMs = readBoundedNumber('MLO_RECOVERY_UI_DELAY_MS', 200, 0, 1000);
          if (recoveryDelayMs > 0) {
            await new Promise((resolve) => setTimeout(resolve, recoveryDelayMs));
          }
          // Restore the browser's Ailana UI and microphone before speaking
          await startConversationalScheduling({
            zipCode: requestedZip,
            queueName,
            queueNumber,
            reason: noAgentAvailable ? 'no_agent_available' : 'queue_timeout',
          });
        } else if (unsupportedArea) {
          const unsupportedScript = 'I could not find a licensed Loan Officer queue for that property ZIP code. Please provide another five-digit property ZIP code.';
          await deliverAgentScript(unsupportedScript);
        }
      }
    };

    // Lightweight signal: ONLY sends the popup trigger to the frontend.
    // Does NOT hibernate or dial SIP. The voice fast-path uses this so the user
    // sees the confirmation popup before anything is connected.
    // The actual SIP transfer only fires when the user clicks "Continue" in the popup
    // (which sends SYSTEM_TRANSFER_MLO → performMloTransfer).
    const sendMloPopupTrigger = async () => {
      try {
        const payload = new TextEncoder().encode(JSON.stringify({ message: "SYSTEM_TRIGGER_MLO_TRANSFER" }));
        await ctx.room.localParticipant?.publishData(payload, { reliable: true, topic: 'lk-chat' });
        console.log(`[agent]: 📞 Sent SYSTEM_TRIGGER_MLO_TRANSFER (popup only) — waiting for user confirmation.`);
      } catch (err) {
        console.warn('[agent]: Failed to send popup trigger:', err);
      }
    };

    // Section 0 (S0-27/28): transfer and callback are real tool calls. Code performs the action —
    // production: the existing popup → SIP transfer path; simulation: mock records only.
    contextManager.setMloAvailability(() => (simCtx ? simMloAvailable() : true));
    const handoffTools = ailanaConfig.section0Enabled
      ? buildHandoffTools({
          transfer: async (summary) => {
            const p = contextManager.getProfile();
            p.escalation_preference = 'live_transfer';
            (p as any).escalation_preference_confirmed = true;
            contextManager.setActiveStage('5');
            contextManager.setCurrentPendingField(null);
            sendStageUpdate('5').catch((err) => console.warn(err));
            if (simCtx) {
              recordSimTransfer(ctx.room.name || '', { summary, profile: p, statedFacts: contextManager.getFactLedger().serialize() });
              return;
            }
            (p as any).mlo_handoff_summary = summary; // travels with the profile to the loan officer
            await sendMloPopupTrigger();
          },
          book: async (req) => {
            (contextManager.getProfile() as any).callback_request = req;
            if (simCtx) { recordSimBooking({ day: req.date ?? req.day, time: req.time, timeZone: req.timeZone }); return; }
            // Google Calendar booking is decision D1 — until then the request travels with the profile to the loan officer.
            console.log(`[section0] callback requested: ${JSON.stringify(req)}`);
          },
          reschedule: async (req) => {
            (contextManager.getProfile() as any).callback_request = req;
            if (simCtx) { updateSimBooking({ day: req.date ?? req.day, time: req.time, timeZone: req.timeZone }); return; }
            console.log(`[section0] callback rescheduled: ${JSON.stringify(req)}`);
          },
          onResult: (r) => contextManager.onHandoffResult(r),
          canTransfer: () => contextManager.getHandoffMode() === 'confirm_answer',
          canBook: () => contextManager.getHandoffMode() === 'callback',
        })
      : undefined;

    const createVadAgent = (customVad: any) => {
      console.log('[agent]: Creating LiveKit Inference agent (Gemma 4 31B LLM + Cartesia Ink-2 STT + Cartesia Sonic-3.6 TTS + TurnDetector)...');
      return new AilanaVoiceAgent({
        ...(handoffTools ? { tools: handoffTools } : {}),
        vad: customVad,
        instructions: contextManager.getStaticInstructions(),
        stt: sessionStt,
        llm: new inference.LLM({
          model: 'google/gemma-4-31b-it',
        }),
        tts: sessionTts,
        tools: schedulingTools,
        turnHandling: {
          turnDetection: new inference.TurnDetector(),
          interruption: {
            // [TODO: FUTURE UPGRADE] When migrating to LiveKit Inference LemonSlice (which fixes native
            // audio stream synchronizers), uncomment the line below and remove `enabled: false`.
            // mode: 'adaptive' as const,
            enabled: false,
            discardAudioIfUninterruptible: false, // CRITICAL for Layer 2.5: Must keep STT running while agent speaks
          },
          endpointing: {
            mode: 'dynamic' as const,
            minDelay: 100,
            maxDelay: 500, // Aggressively tightened to 500ms max trailing silence
          },
          preemptiveGeneration: {
            enabled: false,
            // preemptiveTts: false
          },
        } as any,
      }, contextManager, updateSessionInstructions, metrics, (stage: string) => sendStageUpdate(stage), sendMloPopupTrigger,
      () => voiceScheduling.active, conversationalSchedulingInstructions);
    };

    // Note: In @livekit/agents-plugin-silero (Node.js), all durations are in milliseconds (unlike Python SDK which uses seconds).
    // 250ms filters brief mic clicks, throat clears, and transient noise before triggering speech.
    const customVad = await silero.VAD.load({ minSpeechDuration: 250 });
    let vadAgent = createVadAgent(customVad);
    logPromptBudget('voice_static', buildVoiceInstructions());
    logPromptBudget('text_full', buildBaseInstructions());
    let voiceMuted = false;
    let isHibernating = false;
    let greetingGenerated = false;
    let sessionStarted = false;
    let pendingGreeting = false;
    let isRestoredSession = false;

    const expressiveConfig = ailanaConfig.expressiveMode
      ? {
        speechSteering: {
          disfluencies: false,
          nonverbalSounds: false,
        },
        ttsInstructionsAppend: `
MORTGAGE ADVISOR EXPRESSIVE DELIVERY GUIDELINES:
- Maintain a warm, composed, and confident credit union advisor demeanor.
- For positive news (e.g. strong qualifications, savings), use subtle warm and encouraging delivery.
- For sensitive topics (e.g. debt disclosures, automated refer findings), adopt a calm, empathetic, and reassuring register.
- Use natural, unhurried pacing with slight pauses when discussing numbers or financial disclosures.
- NEVER use casual disfluencies, giggling, theatrical laughter, or dramatic sighs.
EMOTION CONSTRAINTS:
- Strongly prefer these expression labels: neutral, calm, content, peaceful, serene, grateful, affectionate, sympathetic, confident, contemplative.
- Avoid high-energy expression labels: excited, amazed, surprised, angry, panicked, triumphant, elated, scared.
- NEVER use unprofessional or incongruent expression labels: flirtatious, sarcastic, ironic, disgusted, or joking/comedic.
PROSODY CONSTRAINTS:
- Do NOT use the "fast" or "loud" prosody markers. Only "slow" is permitted for reading back numbers, dates, or codes.
- Use "soft" sparingly and only for genuinely gentle moments.
PAUSE CONSTRAINTS:
- Keep break durations brief (250ms to 500ms, e.g. <expr type="break" label="300ms"/>). Never exceed 1s to prevent avatar visual freezing.
`.trim(),
      }
      : false;

    console.log(`[agent]: Expressive mode configured: ${ailanaConfig.expressiveMode ? '✅ ENABLED (Cartesia Sonic-3.6)' : '❌ DISABLED'}`);

    const session = new voice.AgentSession({
      vad: customVad, // Apply the 250ms VAD shield here as well
      userAwayTimeout: null,
      transcriptionTimeout: 200, // Enable UserTranscriptionTimeout event (200ms after VAD END_OF_SPEECH)
      expressive: expressiveConfig,
      turnHandling: {
        turnDetection: new inference.TurnDetector(),
        endpointing: {
          mode: 'dynamic' as const,
          minDelay: 100,
          maxDelay: 500,
        },
        interruption: {
          // [TODO: FUTURE UPGRADE] When migrating to LiveKit Inference LemonSlice (which fixes native
          // audio stream synchronizers), uncomment the line below and remove `enabled: false`.
          // mode: 'adaptive' as const,
          enabled: false,
          discardAudioIfUninterruptible: false, // CRITICAL for Layer 2.5: Must keep STT running while agent speaks
        },
        preemptiveGeneration: {
          enabled: false,
        },
      } as any,
    });

    // Wire session.say() callback into vadAgent so onUserTurnCompleted can
    // deliver verbatim scripts (e.g. stage2_closing_offer) directly, bypassing the LLM.
    const wireAgentCallbacks = (agent: AilanaVoiceAgent) => {
      agent.sayCallback = async (text: string) => {
        await session.say(text, { addToChatCtx: true });
      };
      agent.onAgentTurnCallback = async (text: string) => {
        await contextManager.onAgentTurn(text);
      };
      agent.globalTurnInterceptor = async (text: string) => {
        if (voiceScheduling.active) {
          console.log('[voice-scheduling]: transfer interceptor bypassed because scheduling owns the turn.');
          return false;
        }
        return requestMloTransferHandler(text);
      };
    };
    wireAgentCallbacks(vadAgent);

    const backchannelEngine = new BackchannelEngine();

    const createAgentForRotation = () => {
      vadAgent = createVadAgent(customVad);
      wireAgentCallbacks(vadAgent);

      return vadAgent;
    };

    const prepareContext = async () => {
      if (!(session as any)._started) return;
      if ((session as any)._chatCtx) {
        (session as any)._chatCtx.items = (session as any)._chatCtx.items.filter(
          (item: any) => item.type !== 'agent_handoff'
        );
      }
      const isIdle = () => currentAgentState === 'listening';
      await contextManager.maybeCompact(session, vadAgent, isIdle);
      await contextManager.maybeRotate(session, createAgentForRotation, isIdle);
      
      // Sync to database after each turn (throttled internally to 5-second intervals)
      await contextManager.syncToDatabase().catch(err => 
        console.error('[agent-db]: Failed to sync to database:', err)
      );
    };

    let currentAgentState = 'initializing';

    // ── Silent-turn re-prompt state ───────────────────────────────────────────
    // Tracks whether Ailana produced audible speech after each user turn.
    // When a VAD false-positive aborts LLM generation mid-stream, Ailana goes
    // silent. This guard detects that case and re-asks the pending question.
    let hasSpeechThisTurn = false;
    let silentTurnTimer: ReturnType<typeof setTimeout> | null = null;
    
    // ── Layer 2.5 Custom Interruption state ───────────────────────────────────
    let customInterruptTimer: ReturnType<typeof setTimeout> | null = null;
    let hasInterruptedThisTurn = false;
    // Timestamp when agent entered 'thinking' — used to ignore preemptive-
    // generation cycles (SDK-internal thinking→listening rounds that complete
    // in <200ms and should never trigger a re-prompt).
    let thinkingStartAt = 0;
    // Timestamp when agent last finished speaking (used to see if a noise interrupted her)
    let lastSpeakingStateEndedAt = 0;
    // Timestamp when user last started speaking (VAD START_OF_SPEECH or interim transcript)
    // Used by silent-turn-guard to avoid re-prompting while the user is actively talking.
    let lastUserSpeechDetectedAt = 0;

    // Map of pending field → natural re-ask wording.
    // Only used as a fallback when Ailana produced zero speech for a user turn.
    // No flow logic here — the contextManager still owns all state transitions.
    const PENDING_FIELD_REPROMPT: Record<string, string> = {
      // Stage 1
      borrower_name: 'I apologize — it seems there was a brief interruption. Could you tell me your name?',
      mortgage_goal: 'I apologize for that. Are you looking to buy a new home, refinance an existing mortgage, or explore a home equity option?',
      occupancy: 'I apologize for the interruption. Will this be for your primary residence, a second home, or an investment property?',
      existing_relationship: 'I apologize — it seems my response did not come through. Have you worked with your lending institution before for a mortgage, or is this your first time exploring this with us?',
      timeline: 'I apologize for that. When are you hoping to complete this?',
      co_borrower: 'I apologize for the interruption. Will there be a co-borrower joining you on this application, or will you be applying on your own?',
      // Stage 2
      gross_annual_income: 'I apologize for that. What is your gross annual household income before taxes?',
      monthly_debt: 'I apologize for the interruption. What are your total monthly recurring debt payments — things like car loans, student loans, or credit card minimums?',
      credit_range: 'I apologize for that. How would you describe your current credit score — either as a specific number or a general range?',
      refinance_type: 'I apologize for the interruption. Are you considering a cash-out refinance, or are you wanting to reduce your monthly payment through a rate and term refinance?',
      target_price: 'I apologize for that. What is your target purchase price for the home you are looking to buy?',
      down_payment: 'I apologize for the interruption. How much do you have available for a down payment?',
      rent_own: 'I apologize for that. Do you currently rent, or do you own your home?',
      realtor_status: 'I apologize for the interruption. Have you connected with a real estate agent yet?',
      property_type: 'I apologize for that. What type of property is this — a single-family home, condo, townhome, multi-family, or something else?',
      military_rural: 'I apologize for the interruption. Do you have any military service history, or is the property in a rural area?',
      job_tenure_type: 'I apologize for that. Could you tell me a bit about your current job tenure and the type of income you have — for example, whether you are salaried, hourly, or self-employed?',
      // Stage 2 Closing Offer — verbatim two-path choice re-prompt
      stage2_closing_offer: 'I apologize for the interruption. Let me repeat: you have two options for your affordability summary. The most complete option is a soft credit review — no impact to your credit score — which prefills your application with your real credit data. Or I can build your summary right now from everything you have shared, and you can add the credit review whenever you are ready. Which would you prefer?',
      // Stage 2 — Refinance
      current_mortgage_type: 'I apologize for the interruption. What type of mortgage do you currently have — conventional, FHA, VA, or another type?',
      property_value: 'I apologize for that. What is your estimate of your home\'s current market value?',
      first_mortgage_balance: 'I apologize for the interruption. What is the approximate remaining balance on your first mortgage?',
      current_mortgage_rate: 'I apologize for that. Do you know your current interest rate on this mortgage?',
      current_mortgage_payment: 'I apologize for the interruption. What is your current monthly mortgage payment, not including taxes and insurance?',
      remaining_term_years: 'I apologize for that. How many years are remaining on your current mortgage term?',
      cash_out_amount: 'I apologize for the interruption. How much cash would you like to take out in the refinance?',
      cash_out_use: 'I apologize for that. What do you plan to use the cash-out funds for?',
      prior_refinance: 'I apologize for the interruption. Have you refinanced this property before?',
      stay_duration_years: 'I apologize for that. How long do you plan to stay in the home?',
      // Stage 2 — HELOC
      heloc_line_amount: 'I apologize for the interruption. What credit line amount are you looking to access?',
      heloc_draw_use: 'I apologize for that. What do you plan to use the funds for?',
      heloc_prior: 'I apologize for the interruption. Have you had a home equity line or loan on this property before?',
      heloc_timeline: 'I apologize for that. How soon are you hoping to access the funds?',
      heloc_risk_acknowledged: 'I apologize for the interruption. I want to make sure you understand the structure and collateral on a home equity line — did you have any questions about that before we continue?',
      heloc_rate_comfort: 'I apologize for that. How comfortable are you with a variable interest rate that may change over time, or is fixed predictability more important?',
      // Stage 3A — Soft Pull / OTP / Prefill
      contact_full_name: 'I apologize for the interruption. Could you tell me what name you would like on your secure account?',
      contact_email: 'I apologize for that. What email and mobile number would you like to use for your account?',
      contact_mobile: 'I apologize for the interruption. What mobile number should I send your verification code to?',
      contact_confirm_display: 'I apologize for the interruption. I have your name, email, and mobile shown on screen — do they all look correct? If not, please spell out the correction for me, or you can update it directly on the screen.',
      contact_confirm_correction: 'I apologize — which one would you like to fix: your name, email, or mobile number?',
      otp_verification: 'I apologize for that. Please enter the one-time verification code on your screen whenever you\'re ready.',
      soft_pull_authorization: 'I apologize for that interruption. Before we proceed — this is a soft credit inquiry that will not affect your credit score. You are authorizing it, and your data is used only to process your eligibility review. Do you authorize the soft credit inquiry on that basis?',
      prefill_name_address: 'I apologize for the interruption. I have your name and address on file — is that information correct, or is anything out of date?',
      prefill_employer: 'I apologize for that. I have your employer information on file — does that sound correct?',
      prefill_accounts: 'I apologize for the interruption. I have your accounts summary on file — does that match what you know?',
      prefill_credit_range: 'I apologize for that. We retrieved your credit profile showing a category rating — does that match what you expect?',
      // Stage 4
      checklist_acknowledgement: 'I apologize for that interruption. Do you have these documents available, or would you like to go through any of them?',
      // Stage 5
      escalation_preference: 'I apologize for the interruption. Would you like me to connect you directly with a licensed loan officer now, schedule a callback, or is there another question I can answer for you first?',
      scheduled_call_time: 'I apologize for that. What date and time works best for your scheduled callback?',
    };

    session.on(voice.AgentSessionEventTypes.Error, (err: any) => {
      if (err?.message?.includes('audio_end_ms')) return;
      console.error('[agent-error]: Session error:', err);
    });

    session.on(voice.AgentSessionEventTypes.AgentStateChanged, (ev: any) => {
      const oldState = ev.oldState ?? ev;
      const newState = ev.newState ?? ev;
      if (typeof oldState === 'string' && typeof newState === 'string') {
        currentAgentState = newState;
        console.log(`[agent-debug]: Agent state: ${oldState} → ${newState}`);

        if (newState === 'thinking') {
          // Record when thinking started so the silent-turn guard can filter
          // out instant preemptive-generation cycles (SDK-internal rounds that
          // complete in <200ms before the real LLM call even starts).
          thinkingStartAt = Date.now();
          hasSpeechThisTurn = false;
        }

        if (newState === 'speaking') {
          hasInterruptedThisTurn = false; // Reset the Layer 2.5 interrupt flag
          if (oldState === 'thinking') {
            metrics.markAgentSpeaking();
          }
          // Mark avatar render start — LemonSlice receives TTS audio from this moment
          metrics.markAvatarRenderStart();
          // First audio frame of the avatar track: markAvatarFirstFrame() is called
          // from BOTH ActiveSpeakersChanged (primary) and TrackSubscribed (secondary/safety net).
          // The idempotency guard ensures only the first event records the metric.

          // ── Silent-turn guard: agent started speaking → cancel any pending re-prompt
          if (silentTurnTimer !== null) {
            clearTimeout(silentTurnTimer);
            silentTurnTimer = null;
          }
          hasSpeechThisTurn = true;
        }

        if (newState === 'listening' && (session as any)._started && !voiceMuted && !isHibernating) {
          if (oldState === 'speaking') {
            lastSpeakingStateEndedAt = Date.now();
          }
          backchannelEngine.reset();
          prepareContext().catch(err => console.error('[agent-error]: Idle prepareContext failed:', err));

          // ── Deferred Stage 5 Transition Guard ─────────────────────────────────
          // If the avatar was delivering the Stage 2.5 AUS findings speech, transition
          // to Stage 5 only AFTER speaking is completely finished.
          const activeProf = contextManager.getProfile();
          if ((activeProf as any)?.pendingStage5Transition) {
            delete (activeProf as any).pendingStage5Transition;
            activeProf.affordability_panel_rendered = false;
            (activeProf as any).affordability_panel_closed = true;
            if (!activeProf.aus_status) {
              activeProf.aus_status = 'approve_eligible';
              (activeProf as any).affordability_aus_status = 'approve_eligible';
            }
            contextManager.setActiveStage('5');
            contextManager.setCurrentPendingField('escalation_preference');
            sendStageUpdate('5').catch(err => console.warn(err));
            console.log(`[agent-hook]: Avatar speech finished — executed deferred transition to Stage 5 with aus_status=${activeProf.aus_status}.`);
          }

          // ── Silent-turn guard: thinking → listening with no speech produced
          // Fires when LLM generation was aborted mid-stream (Ailana goes silent).
          // We wait 2s then re-ask the pending question.
          // Guard: ignore preemptive-generation cycles — those complete in <200ms
          // (SDK fires a quick thinking→listening before the real LLM call starts).
          const thinkingDurationMs = Date.now() - thinkingStartAt;
          const wasRealThinkingCycle = thinkingDurationMs >= 200;
          if (oldState === 'thinking' && !hasSpeechThisTurn && wasRealThinkingCycle) {
            const pendingField = contextManager.getPendingField();
            const repromptText = pendingField ? PENDING_FIELD_REPROMPT[pendingField] : null;
            if (repromptText && (session as any)._started) {
              const msSinceSpeech = Date.now() - lastUserSpeechDetectedAt;
              const isUserSpeaking = (session as any)._userState === 'speaking' || msSinceSpeech < 1500;
              if (isUserSpeaking) {
                console.log(`[silent-turn-guard]: Suppressing empty-turn re-prompt — user is actively speaking (state="${(session as any)._userState}", last speech ${msSinceSpeech}ms ago).`);
              } else {
                console.log(`[silent-turn-guard]: Detected empty turn (thinking→listening after ${thinkingDurationMs}ms, no speech). Scheduling re-prompt for field="${pendingField}" in 2s.`);
                if (silentTurnTimer !== null) clearTimeout(silentTurnTimer);
                silentTurnTimer = setTimeout(() => {
                  silentTurnTimer = null;
                  // Only fire if still in listening state (not speaking or thinking already)
                  if (currentAgentState !== 'listening') {
                    console.log(`[silent-turn-guard]: Re-prompt cancelled — agent moved to "${currentAgentState}" before timer fired.`);
                    return;
                  }
                  // Don't re-prompt if the user is speaking or started speaking since the timer was scheduled
                  const msSinceUserSpeech = Date.now() - lastUserSpeechDetectedAt;
                  if ((session as any)._userState === 'speaking' || msSinceUserSpeech < 2000) {
                    console.log(`[silent-turn-guard]: Re-prompt cancelled — user is speaking (state="${(session as any)._userState}", last speech ${msSinceUserSpeech}ms ago).`);
                    return;
                  }
                  const currentField = contextManager.getPendingField();
                  const activeReprompt = currentField ? (PENDING_FIELD_REPROMPT[currentField] || repromptText) : repromptText;
                  if (!activeReprompt) {
                    console.log(`[silent-turn-guard]: Re-prompt cancelled — no active reprompt text found for field="${currentField}".`);
                    return;
                  }
                  console.log(`[silent-turn-guard]: Firing re-prompt for active field="${currentField}" (originally scheduled on "${pendingField}").`);
                  try {
                    // For Stage 4 transitions, use generateReply so the LLM produces
                    // the full AUS result announcement with the correct Stage 4 context,
                    // rather than speaking a generic static re-prompt.
                    if (contextManager.getActiveStage() === '4') {
                      console.log(`[silent-turn-guard]: Stage 4 detected — using generateReply for AUS result delivery.`);
                      metrics.startTurn();
                      metrics.markGenerateReply();
                      session.generateReply({ userInput: 'The application has been submitted to underwriting. Please announce the result to the borrower.' });
                    } else {
                      session.say(activeReprompt, { addToChatCtx: true });
                      contextManager.onAgentTurn(activeReprompt).catch(err =>
                        console.error('[agent-error]: Failed to save agent turn:', err)
                      );
                    }
                  } catch (err) {
                    console.warn('[silent-turn-guard]: Failed to fire re-prompt:', err);
                  }
                }, 2000);
              }
            }
          } else if (oldState === 'thinking' && !wasRealThinkingCycle) {
            console.log(`[silent-turn-guard]: Ignoring preemptive-gen cycle (thinking lasted only ${thinkingDurationMs}ms).`);
          }

          // Reset speech tracker at the start of a new listening window
          hasSpeechThisTurn = false;
        }
      }
    });

    // STT: final transcript ready — mark pipeline stage
    session.on(voice.AgentSessionEventTypes.UserInputTranscribed, async (ev: any) => {
      // Any transcript (interim or final) means the user is actively speaking right now.
      // Update timestamp and immediately cancel any pending re-prompt timer.
      if (ev.transcript?.trim()) {
        lastUserSpeechDetectedAt = Date.now();
        if (silentTurnTimer !== null) {
          console.log('[silent-turn-guard]: User speech transcribed. Cancelling pending re-prompt timer immediately.');
          clearTimeout(silentTurnTimer);
          silentTurnTimer = null;
        }

        // ── Layer 2.5 Verification ──
        if (currentAgentState === 'speaking' && !hasInterruptedThisTurn) {
          console.log(`[layer-2.5]: Verified human speech ("${ev.transcript.trim()}"). Halting avatar.`);
          if (customInterruptTimer) {
            clearTimeout(customInterruptTimer);
            customInterruptTimer = null;
          }
          hasInterruptedThisTurn = true;
          session.interrupt({ force: true });
        }
      }
      if (!ev.isFinal) return;
      if (!ev.transcript?.trim()) return;

      const transcript = ev.transcript as string;
      console.log(`[pipeline][${ts()}] STT final transcript: "${transcript}"`);
      metrics.markSttComplete(transcript);
      metrics.markUserTurnEnd();
      metrics.startTurn();
    });

    // STT: VAD detected speech but no transcript was produced (e.g. a sneeze, cough, or throat clear)
    // If this noise interrupted Ailana, she will go silent. This guard safely re-prompts her.
    session.on(voice.AgentSessionEventTypes.UserTranscriptionTimeout as any, (ev: any) => {
      console.log(`[agent-hook]: Transient noise detected (no words produced). Duration: ${ev?.speechDuration}ms.`);
      
      // ONLY re-prompt if Ailana was speaking when this noise started (i.e. it interrupted her).
      // If the noise started AFTER she had already finished speaking, it's just background noise.
      const wasSpeaking = currentAgentState === 'speaking';
      const justFinishedSpeaking = Date.now() - lastSpeakingStateEndedAt < 1500;
      const interruptedAgent = wasSpeaking || justFinishedSpeaking;

      if (interruptedAgent) {
        if ((session as any)._started) {
          const pendingField = contextManager.getPendingField();
          const repromptText = pendingField ? PENDING_FIELD_REPROMPT[pendingField] : null;
          if (repromptText) {
            const msSinceSpeech = Date.now() - lastUserSpeechDetectedAt;
            const isUserSpeaking = (session as any)._userState === 'speaking';
            if (isUserSpeaking) {
              console.log(`[silent-turn-guard]: Suppressing transient-noise re-prompt — user is actively speaking (state="${(session as any)._userState}", last speech ${msSinceSpeech}ms ago).`);
              return;
            }
            console.log(`[silent-turn-guard]: Detected transient noise interrupt. Scheduling re-prompt for field="${pendingField}" in 2s.`);
            if (silentTurnTimer !== null) clearTimeout(silentTurnTimer);
            silentTurnTimer = setTimeout(() => {
              silentTurnTimer = null;
              if (currentAgentState !== 'listening') {
                console.log(`[silent-turn-guard]: Interrupt re-prompt cancelled — agent moved to "${currentAgentState}".`);
                return;
              }
              // Don't re-prompt if the user is speaking or started speaking since the timer was scheduled
              const msSinceUserSpeech = Date.now() - lastUserSpeechDetectedAt;
              if ((session as any)._userState === 'speaking' || msSinceUserSpeech < 2000) {
                console.log(`[silent-turn-guard]: Interrupt re-prompt cancelled — user is speaking (state="${(session as any)._userState}", last speech ${msSinceUserSpeech}ms ago).`);
                return;
              }
              const currentField = contextManager.getPendingField();
              const activeReprompt = currentField ? (PENDING_FIELD_REPROMPT[currentField] || repromptText) : repromptText;
              if (!activeReprompt) return;
              
              console.log(`[silent-turn-guard]: Firing interrupt re-prompt for field="${currentField}".`);
              try {
                if (contextManager.getActiveStage() === '4') {
                  metrics.startTurn();
                  metrics.markGenerateReply();
                  session.generateReply({ userInput: 'The application has been submitted to underwriting. Please announce the result to the borrower.' });
                } else {
                  session.generateReply({ userInput: `The user accidentally interrupted you with a noise but didn't say anything. Please gently re-prompt them: "${activeReprompt}"` });
                }
              } catch (err) {
                console.warn('[silent-turn-guard]: Failed to fire interrupt re-prompt:', err);
              }
            }, 2000);
          }
        }
      }
    });

    session.on(voice.AgentSessionEventTypes.ConversationItemAdded, (ev: any) => {
      const item = ev.item as llm.ChatMessage;
      if (item?.role === 'assistant' && item.textContent) {
        hasSpeechThisTurn = true;
        
        // ── Silent-turn guard fix ──
        // Only clear the timer if this is a NEW generation (agent is thinking).
        // If the agent is 'listening', this is just the LiveKit SDK committing
        // an old interrupted turn to the history, which should NOT cancel our timer!
        if (silentTurnTimer !== null && currentAgentState === 'thinking') {
          console.log('[silent-turn-guard]: New LLM generation started (ConversationItemAdded while thinking). Cancelling re-prompt timer.');
          clearTimeout(silentTurnTimer);
          silentTurnTimer = null;
        }
        // ── Publish agent message as a LiveKit chat message ─────────────────
        // Since TTS audio goes directly to LemonSlice via DataStreamAudioOutput,
        // the LiveKit TranscriptionSynchronizer never sees audio playout events
        // and therefore never fires transcriptionReceived events on the frontend.
        // Publishing the text explicitly as a chat message ensures Ailana's
        // responses always appear in the chat panel, regardless of audio routing.
        //
        // Strip any XML/expression control tags (e.g. <expr type="happy">) that
        // Cartesia Sonic-3.6 uses internally before displaying in the chat UI.
        // These tags are consumed by the TTS engine in its own pipeline —
        // this strip is ONLY for the chat display text and has zero effect on audio.
        // We also strip any trailing partial tags (/<[^>]*$/) in case the generation was interrupted mid-tag.
        const msgText = item.textContent.replace(/<[^>]*>/g, '').replace(/<[^>]*$/, '').replace(/\s+/g, ' ').trim();

        contextManager.onAgentTurn(msgText).catch(err =>
          console.error('[agent-error]: Failed to save agent turn:', err)
        );
        (async () => {
          try {
            await ctx.room.localParticipant?.sendText(msgText, { topic: 'lk.chat' });
          } catch {
            try {
              await ctx.room.localParticipant?.sendChatMessage(msgText);
            } catch (err2) {
              console.warn('[agent]: Failed to publish assistant message as chat:', err2);
            }
          }
        })();
      }
      try {
        const chatCtx = session.chatCtx;
        metrics.logContextSize(
          chatCtx.items.length,
          contextManager.estimateTokensFromChatCtx(chatCtx),
        );
      } catch {
        // session may not be fully started
      }
    });

    session.on(voice.AgentSessionEventTypes.UserStateChanged, (ev: any) => {
      if (ev.newState === 'speaking') {
        lastUserSpeechDetectedAt = Date.now();
        if (silentTurnTimer !== null) {
          console.log('[silent-turn-guard]: User started speaking (VAD). Cancelling pending re-prompt timer immediately.');
          clearTimeout(silentTurnTimer);
          silentTurnTimer = null;
        }

        // ── Layer 2.5 Intercept ──
        if (currentAgentState === 'speaking' && !hasInterruptedThisTurn) {
          if (customInterruptTimer) clearTimeout(customInterruptTimer);
          customInterruptTimer = setTimeout(() => {
            console.log('[layer-2.5]: VAD triggered but no words transcribed in 500ms. Ignoring transient noise.');
            customInterruptTimer = null;
          }, 500);
        }
      }
    });

    // MetricsCollected fires with LLM TTFT data from the LiveKit pipeline
    session.on(voice.AgentSessionEventTypes.MetricsCollected, (ev: any) => {
      const m = ev.metrics;
      if (m?.type === 'llm_metrics') {
        const ttft = m.ttftMs ?? -1;
        const tokens = m.promptTokens ?? 0;
        const cachedTokens = m.promptCachedTokens ?? m.cachedTokens ?? m.inputCachedTokens ?? m.prompt_cached_tokens ?? 0;
        metrics.markLlmFirstToken(ttft);       // idempotent — calculates exact arrival timestamp
        metrics.markLlmComplete();
        metrics.recordRealtimeMetrics(ttft, tokens);
        const cacheTag = cachedTokens > 0 ? ` [CACHE HIT: ${cachedTokens} tokens]` : ' [CACHE MISS/COLD]';
        console.log(`[pipeline][${ts()}] LLM metrics — TTFT=${ttft}ms  prompt_tokens=${tokens}  cached_tokens=${cachedTokens}${cacheTag}  completion_tokens=${m.completionTokens ?? '?'}`);
      } else if (m?.type === 'stt_metrics') {
        const dur = m.durationMs ?? m.duration ?? -1;
        if (dur >= 0) metrics.t_stt_duration_ms = dur;
      } else if (m?.type === 'tts_metrics') {
        const ttfb = m.ttfbMs ?? -1;
        const dur = m.durationMs ?? m.duration ?? -1;
        const audioDur = m.audioDurationMs ?? -1;
        
        if (ttfb >= 0) {
          try {
            const payload = new TextEncoder().encode(JSON.stringify({ message: "SYSTEM_METRIC_TTFB" }));
            ctx.room.localParticipant?.publishData(payload, { reliable: true, topic: 'lk-chat' }).catch(() => {});
          } catch (e) {
            console.warn("[agent-telemetry]: Failed to send TTFB marker", e);
          }
        }
        
        metrics.markTtsComplete(ttfb, dur, audioDur);
      } else if (m?.type === 'realtime_model_metrics') {
        metrics.recordRealtimeMetrics(m.ttftMs ?? -1, m.inputTokens ?? 0);
      }
    });

    let lastSentStage = contextManager.getActiveStage();
    const sendStageUpdate = async (stage: string) => {
      try {
        const prof = contextManager.getProfile();
        const parsedRangeScore = (() => {
          if (!prof.credit_range) return null;
          const match = String(prof.credit_range).match(/\d+/);
          return match ? parseInt(match[0], 10) : null;
        })();
        const resolvedScore = (prof.credit_score && !isNaN(Number(prof.credit_score))) ? Number(prof.credit_score) : parsedRangeScore;
        const resolvedStatedScore = (prof.stated_credit_score && !isNaN(Number(prof.stated_credit_score))) ? Number(prof.stated_credit_score) : resolvedScore;
        const resolvedVerifiedScore = (prof.verified_credit_score && !isNaN(Number(prof.verified_credit_score)))
          ? Number(prof.verified_credit_score)
          : (prof.affordability_mode === 'verified' ? resolvedScore : null);

        const payload = new TextEncoder().encode(JSON.stringify({
          message: "SYSTEM_STAGE_UPDATE",
          stage,
          profile: {
            // ── Core borrower data ──────────────────────────────────
            borrowerName: prof.borrower_name,
            grossAnnualIncome: prof.gross_annual_income,
            totalMonthlyDebt: prof.monthly_debt,
            targetPrice: prof.target_price,
            downPayment: prof.down_payment,
            creditRange: prof.credit_range,
            credit_range: prof.credit_range,
            military_rural: prof.military_rural,
            militaryRural: prof.military_rural,
            zipCode: prof.zip_code,
            propertyType: prof.property_type,
            // ── Track Isolating Fields (Refinance & HELOC) ──────────
            transaction_type: prof.transaction_type,
            mortgage_goal: prof.mortgage_goal,
            mortgage_goal_confirmed: prof.mortgage_goal_confirmed,
            occupancy: prof.occupancy,
            occupancy_confirmed: prof.occupancy_confirmed,
            existing_relationship: prof.existing_relationship,
            existing_relationship_confirmed: prof.existing_relationship_confirmed,
            timeline: prof.timeline,
            timeline_confirmed: prof.timeline_confirmed,
            co_borrower: prof.co_borrower,
            co_borrower_confirmed: prof.co_borrower_confirmed,
            refinance_type: prof.refinance_type,
            property_value: prof.property_value,
            first_mortgage_balance: prof.first_mortgage_balance,
            cash_out_amount: prof.cash_out_amount,
            heloc_line_amount: prof.heloc_line_amount,
            current_mortgage_rate: prof.current_mortgage_rate,
            current_mortgage_payment: prof.current_mortgage_payment,
            current_mortgage_type: prof.current_mortgage_type,
            currentMortgageType: prof.current_mortgage_type,
            refinance_subtrack: prof.refinance_subtrack,
            preferred_program: (prof as any).preferred_program ?? prof.current_mortgage_type ?? null,
            credit_score: resolvedScore,
            creditScore: resolvedScore,
            stated_credit_score: resolvedStatedScore,
            statedCreditScore: resolvedStatedScore,
            verified_credit_score: resolvedVerifiedScore,
            verifiedCreditScore: resolvedVerifiedScore,
            va_subsequent_use: prof.va_subsequent_use,
            remaining_term_years: prof.remaining_term_years,
            // ── Affordability Panel state ────────────────────────────
            affordability_panel_rendered: prof.affordability_panel_rendered,
            affordability_mode: prof.affordability_mode,
            affordability_purchase_price: prof.affordability_purchase_price,
            affordability_down_payment: prof.affordability_down_payment,
            affordability_income_band: prof.affordability_income_band,
            affordability_dti_band: prof.affordability_dti_band,
            affordability_aus_status: prof.affordability_aus_status,
            aus_status: prof.aus_status,
            affordability_panel_closed: (prof as any).affordability_panel_closed,
            affordability_submitted: prof.affordability_submitted,
            dti_above_hard_ceiling: prof.dti_above_hard_ceiling,

            // ── Session login / OTP state ────────────────────────────
            otp_verified: prof.otp_verified,
            session_login_complete: prof.session_login_complete,
            contact_on_file: prof.contact_on_file,
            contact_name: prof.contact_name,

            contact_email: prof.contact_email,
            contact_mobile: prof.contact_mobile,
            // otp_sent = true only AFTER Ailana has delivered the "I've sent a code" line.
            // The _otpReadyToShow flag is set explicitly in the otp_verification script handler below,
            // preventing the modal from appearing before Ailana finishes speaking.
            otp_sent: !!(prof as any)._otpReadyToShow,
            // ── Flow state ──────────────────────────────────────────
            current_pending_field: contextManager.getPendingField(),
            // ── Section 0 memory (SECTION_0_ENABLED) — saved in the frontend snapshot, restored on reconnect ──
            ...(contextManager.getSection0Snapshot() ? { statedFacts: contextManager.getSection0Snapshot() } : {}),
          }
        }));
        await ctx.room.localParticipant?.publishData(payload, { reliable: true, topic: 'lk-chat' });
        console.log(`[agent-debug]: Sent stage update to frontend: ${stage} with profile data.`);
      } catch (e: any) {
        console.warn(`[agent-debug]: Failed to send stage update:`, e?.message);
      }
    };
    sendStageUpdateFn = sendStageUpdate;

    const applyConversationalSchedulingInstructions = () => {
      const schedulingInstructions = conversationalSchedulingInstructions();
      (vadAgent as any)._instructions = schedulingInstructions;

      const chatCtx = session.chatCtx;
      const systemItem = (chatCtx.items.find(
        (item) => item.type === 'message' && (item as llm.ChatMessage).id === 'lk.agent_task.instructions'
      ) || chatCtx.items.find(
        (item) => item.type === 'message' && (item as llm.ChatMessage).role === 'system'
      )) as llm.ChatMessage | undefined;
      if (systemItem) {
        systemItem.content = [schedulingInstructions];
        (systemItem as any).id = 'lk.agent_task.instructions';
      } else {
        chatCtx.items.unshift(new llm.ChatMessage({
          id: 'lk.agent_task.instructions',
          role: 'system',
          content: schedulingInstructions,
        }));
      }
    };

    function updateSessionInstructions() {
      try {
        if (voiceScheduling.active) {
          applyConversationalSchedulingInstructions();
          return;
        }
        const staticInstructions = contextManager.getStaticInstructions();
        (vadAgent as any)._instructions = staticInstructions;

        const chatCtx = session.chatCtx;
        const systemItem = (chatCtx.items.find(
          (item) => item.type === 'message' && (item as llm.ChatMessage).id === 'lk.agent_task.instructions'
        ) || chatCtx.items.find(
          (item) => item.type === 'message' && (item as llm.ChatMessage).role === 'system'
        )) as llm.ChatMessage | undefined;
        if (systemItem) {
          if (systemItem.content?.[0] !== staticInstructions) {
            systemItem.content = [staticInstructions];
            console.log(`[agent-debug]: Static system instructions in session.chatCtx updated (stage change).`);
          }
          // Ensure it has the correct ID so the LiveKit SDK updates it correctly
          if ((systemItem as any).id !== 'lk.agent_task.instructions') {
            (systemItem as any).id = 'lk.agent_task.instructions';
          }
        } else {
          chatCtx.items.unshift(new llm.ChatMessage({
            id: 'lk.agent_task.instructions',
            role: 'system',
            content: staticInstructions
          }));
          console.log(`[agent-debug]: Static system instructions prepended to session.chatCtx.`);
        }
        console.log(`[agent-debug]: Instructions updated — stage=${contextManager.getActiveStage()}, pendingField=${contextManager.getPendingField()}`);

        // Broadcast stage + profile to frontend on every turn so UI always has the latest
        // affordability flags, pending field, and login state (not just on stage changes)
        const currentStage = contextManager.getActiveStage();
        lastSentStage = currentStage;
        sendStageUpdate(currentStage);
      } catch (err) {
        console.warn(`[agent]: Failed to update instructions mid-session:`, err);
      }
    };

    const deliverAgentScript = async (scriptText: string, triggerReason?: string) => {
      await contextManager.onAgentTurn(scriptText).catch(err => console.error(err));
      if (voiceMuted) {
        try {
          await ctx.room.localParticipant?.sendText(scriptText, { topic: 'lk.chat' });
        } catch {
          await ctx.room.localParticipant?.sendChatMessage(scriptText);
        }
      } else {
        metrics.startTurn();
        if (triggerReason) {
          metrics.markUiEventStart(triggerReason);
        }
        session.say(scriptText, { addToChatCtx: true });
      }
    };

    const generateTextOnlyReply = async (userMessage: string) => {
      await contextManager.onUserTurn(userMessage);
      updateSessionInstructions();
      metrics.startTurn();
      console.log(`[agent]: Text-only reply for "${userMessage}"...`);

      try {
        let reply: string | null = null;
        const pending = contextManager.getPendingField();
        const prof = contextManager.getProfile();
        const lower = userMessage.toLowerCase().trim();

        const isAffirmative = /\b(yes|yeah|yep|yup|looks?\s*(good|right|correct|fine)|that('s|\s+is)\s*(right|correct|accurate|good|fine|also\s+correct)|correct|matches|match|what\s+i\s+expect|good|fine|accurate|all\s+good|sounds\s+good|perfect|sure|confirm|confirmed|this\s+looks\s+correct|everything\s+looks\s+correct)\b/i.test(lower) &&
          !/\b(not?\s*(right|correct|accurate|good)|wrong|mistake|change|update|no\b(?!\s*,\s*(that|it)\s*(is|looks)\s*(also\s+)?(right|correct)))\b/i.test(lower);

        const isCorrection = /\b(no|not|wrong|change|update|actually|mistake|fix|incorrect)\b/i.test(lower) && !isAffirmative;

        // ── Direct Loan Officer Transfer Command ──
        const isHypotheticalOrQuestion = isQuestionOrCorrection(userMessage) || /\b(what happens if|why (?:would|should)|how (?:do|does|will|would)|what does|what if|will you)\b/i.test(lower);
        const isExplicitLoRequest = !isHypotheticalOrQuestion && /\b(connect(\s+me)?\s+(?:to\s+)?(?:a\s+|the\s+)?loan\s*officer|transfer(\s+me)?\s+(?:to\s+)?(?:a\s+|the\s+)?loan\s*officer|speak\s+(?:to|with)\s+(?:a\s+|the\s+)?loan\s*officer|call\s+(?:a\s+|the\s+)?loan\s*officer|connect\s+me\s+right\s+now)\b/i.test(lower);
        const isConnectLoIntent = !isHypotheticalOrQuestion && (isExplicitLoRequest || (pending === 'escalation_preference' && (
          isAffirmative ||
          /\b(connect|transfer|speak|talk|loan\s*officer|call|right\s*now)\b/i.test(lower)
        )));

        if (isConnectLoIntent) {
          console.log(`[agent]: 📞 Discrete mode Loan Officer transfer triggered for: "${userMessage}"`);
          prof.escalation_preference = 'live_transfer';
          (prof as any).escalation_preference_confirmed = true;
          (prof as any).affordability_panel_closed = true;
          prof.affordability_panel_rendered = false;
          contextManager.setActiveStage('5');
          contextManager.setCurrentPendingField(null);
          sendStageUpdate('5').catch(err => console.warn(err));

          const scriptText = "Connecting you with a licensed loan officer now — one moment please.";
          await deliverAgentScript(scriptText);
          await performMloTransfer();
          return;
        }

        const inAffordabilityStage = pending === 'affordability_panel_active' || contextManager.getActiveStage() === '2.5' || !!prof.affordability_panel_rendered;
        const isUpgradeIntent = /\b(upgrade|verified\s*(?:mode|numbers|score|credit)|soft\s*(?:credit\s*)?(?:pull|review)|check\s*my\s*credit|run\s*(?:my\s*)?credit)\b/i.test(lower);
        if (inAffordabilityStage && isUpgradeIntent && (!prof.otp_verified || prof.affordability_mode === 'stated')) {
          contextManager.triggerUpgradeToVerifiedMode();
          sendStageUpdate('3A').catch(err => console.warn(err));
          reply = "I'd be happy to get that upgraded for you! Before we run your review, I'll need a few details to set up your secure account. First — what's your full name?";
        }

        const verbalSubmitPattern = /\b(?:submit\s*(?:for\s*me|it|review|my\s*review|this|now)?|can\s+you\s+submit|please\s+submit|go\s+ahead\s+(?:and\s+)?submit|run\s+the\s+review|proceed\s+with\s+review|send\s+my\s+scenario|do\s+it\s+for\s+me|send\s+it|yes\s+submit|let'?s\s+submit|go\s+ahead|let'?s\s+go|proceed|ready\s+to\s+submit|i'?m\s+ready|yes\s+please|sounds\s+good|looks\s+good(?:.*?)\bsubmit\b)\b/i;
        if ((pending === 'affordability_panel_active' || contextManager.getActiveStage() === '2.5') && !isHypotheticalOrQuestion && verbalSubmitPattern.test(lower)) {
          const isStatedMode = prof.affordability_mode === 'stated' || !prof.otp_verified;
          if (isStatedMode) {
            contextManager.triggerUpgradeToVerifiedMode();
            sendStageUpdate('3A').catch(err => console.warn(err));
            reply = "To submit your scenario for a formal eligibility review, we'll need to upgrade to verified numbers. I'll need a few details to set up your secure account first. First — what's your full name?";
          } else {
            prof.affordability_submitted = true;
            prof.aus_status = 'approve_eligible';
            (prof as any).affordability_aus_status = 'approve_eligible';
            contextManager.setActiveStage('5');
            contextManager.setCurrentPendingField('escalation_preference');
            sendStageUpdate('5').catch(err => console.warn(err));
            const borrowerName = prof.borrower_name || prof.contact_name || prof.legal_name || 'there';
            const isRef = prof.transaction_type === 'TT-REF' || prof.mortgage_goal === 'refinance';
            const isHel = prof.transaction_type === 'TT-HEL' || prof.transaction_type === 'TT-HEQ' || prof.mortgage_goal === 'heloc';
            if (isRef) {
              reply = `Good news${borrowerName !== 'there' ? ', ' + borrowerName : ''} — your eligibility review came back, and based on the information you provided, you appear conditionally eligible for the refinance scenario you built. Your estimated payment comparison is ready for you — it shows your estimated new payment alongside your current payment reference point. Your licensed loan officer will reach out to walk you through next steps and lock in your rate — or I can connect you right now if you'd like.`;
            } else if (isHel) {
              reply = prof.transaction_type === 'TT-HEQ'
                ? `Good news${borrowerName !== 'there' ? ', ' + borrowerName : ''} — your eligibility review came back, and based on the information you provided, you appear conditionally eligible for a home equity loan. Your licensed loan officer will reach out to walk you through next steps — or I can connect you right now if you'd like.`
                : `Good news${borrowerName !== 'there' ? ', ' + borrowerName : ''} — your eligibility review came back, and based on the information you provided, you appear conditionally eligible for a home equity line of credit. Your licensed loan officer will reach out to walk you through the next steps — including the formal application, appraisal scheduling, and the terms of your line — or I can connect you right now if you'd like.`;
            } else {
              reply = `Wonderful news${borrowerName !== 'there' ? ', ' + borrowerName : ''} — your eligibility review came back, and based on the information you provided, you're conditionally eligible for the scenario you built. Your estimated payment range has been calculated and is included in your pre-qualification letter. I've sent your pre-qualification letter to your email on file — it's issued by your lending institution, it's valid for ninety days, and it's exactly what real estate agents like to see with an offer. Your licensed loan officer will reach out to walk you through next steps — or I can connect you right now if you'd like.`;
            }
          }
        }

        // Stage 2 Closing Offer
        if (pending === 'stage2_closing_offer') {
          const isExplicitPathB = /\b(build.*(?:shared|summary|stated|info|heloc|refinance|options)|what\s+i\s+shared|from\s+what\s+i\s+shared|use\s+what\s+i\s+shared|summary|explore|stated|second\s*(?:option|path|choice|one)|without|no\s+review|skip)\b/i.test(lower);
          const isExplicitPathA = !isExplicitPathB && /\b(soft\s*pull|credit\s*review|first(?:\s*option)?|most\s*complete|yes|sure|okay|go\s*ahead|proceed|run\s*it|run\s*the\s*review)\b/i.test(lower);
          if (isExplicitPathA) {
            contextManager.setActiveStage('3A');
            contextManager.setCurrentPendingField('contact_full_name');
            sendStageUpdate('3A');
            reply = "Perfect. Before we run your review, I'll need a few details to set up your secure account. First — what's your full name?";
          } else if (isExplicitPathB) {
            contextManager.setActiveStage('2.5');
            prof.affordability_mode = 'stated';
            prof.affordability_panel_rendered = true;
            (prof as any).affordability_panel_closed = false;
            prof.affordability_submitted = false;
            prof.aus_status = null;
            prof.affordability_aus_status = null;
            contextManager.setCurrentPendingField('affordability_panel_active');
            sendStageUpdate('2.5');
            const borrowerName = prof.borrower_name || prof.contact_name || prof.legal_name || 'there';
            const isHel = prof.transaction_type === 'TT-HEL' || prof.transaction_type === 'TT-HEQ' || prof.mortgage_goal === 'heloc';
            const isRef = prof.transaction_type === 'TT-REF' || prof.mortgage_goal === 'refinance';
            if (isHel) {
              reply = prof.transaction_type === 'TT-HEQ'
                ? `Thank you for your patience${borrowerName !== 'there' ? ', ' + borrowerName : ''} — your initial results are in, and your home equity summary is ready for you. It brings together your home value, existing mortgage balance, and the loan amount target you shared with me and shows how your numbers compare with typical program guideline ranges. One important note before we look at it together: this is an educational summary to help you explore — it is not a loan decision, and you can submit for the formal eligibility review at any time, no matter what these ranges show. Would you like to walk through it together?`
                : `Thank you for your patience${borrowerName !== 'there' ? ', ' + borrowerName : ''} — your initial results are in, and your home equity summary is ready for you. It brings together your home value, existing mortgage balance, and the credit line target you shared with me and shows how your numbers compare with typical program guideline ranges. One important note before we look at it together: this is an educational summary to help you explore — it is not a loan decision, and you can submit for the formal eligibility review at any time, no matter what these ranges show. Would you like to walk through it together?`;
            } else if (isRef) {
              reply = `Thank you for your patience${borrowerName !== 'there' ? ', ' + borrowerName : ''} — your initial results are in, and your refinance summary is ready for you. It brings together your home value, existing mortgage balance, and the refinance targets you shared with me alongside the details from your credit review, and shows how your numbers compare with typical program guideline ranges. One important note before we look at it together: this is an educational summary to help you explore — it is not a loan decision, and you can submit for the formal eligibility review at any time, no matter what these ranges show. Would you like to walk through it together?`;
            } else {
              reply = `Thank you for your patience${borrowerName !== 'there' ? ', ' + borrowerName : ''} — your initial results are in, and your affordability summary is ready for you. It brings together the income and savings targets you shared with me and the details from your credit review, and shows how your numbers compare with typical program guideline ranges. One important note before we look at it together: this is an educational summary to help you explore — it is not a loan decision, and you can submit for the formal eligibility review at any time, no matter what these ranges show. Would you like to walk through it together?`;
            }
          }
        } else if (pending === 'contact_name' || pending === 'contact_full_name') {
          reply = "Perfect. Before we run your review, I'll need a few details to set up your secure account. First — what's your full name?";

        } else if (pending === 'contact_email') {
          if (prof.contact_mobile) {
            reply = "I have your mobile number. Could you also share the email address you'd like to use for your account?";
          } else {
            reply = "Great. Now, what email address and mobile number would you like to use for your account?";
          }
        } else if (pending === 'contact_mobile') {
          if (prof.contact_email) {
            reply = "I have your email. Could you also share the mobile number you'd like to use?";
          } else {
            reply = "Could you share the mobile number you'd like to use for your account?";
          }
        } else if (pending === 'contact_confirm_display') {
          const isOnScreenCorrection = /\b(on\s+(the\s+)?screen|type(\s+it)?|typing|edit(\s+it)?\s+myself|fix(\s+it)?\s+myself|screen)\b/i.test(lower);
          if (isAffirmative) {
            contextManager.handleContactInfoConfirmed();
            (prof as any)._otpInstructionDelivered = true;
            (prof as any)._otpReadyToShow = true;
            sendStageUpdate(contextManager.getActiveStage());
            reply = "I've sent a one-time code to confirm your email and mobile number — please go ahead and enter it securely on your screen when it arrives, and you're all set.";
          } else if (isOnScreenCorrection) {
            reply = "Sounds good! Go ahead and make your changes on screen, and click Continue when you're ready.";
          } else if (isCorrection) {
            (prof as any).contact_confirm_needs_correction = true;
            contextManager.advanceWorkflow();
            reply = "No problem at all. What would you like to update — your name, email, or mobile number?";
          } else {
            const name = prof.contact_name || 'your name';
            const email = prof.contact_email || 'your email';
            const phone = formatPhoneForSpeech(prof.contact_mobile || '');
            reply = `I have ${name}, ${email}, and ${phone}. Your details are on screen — do they all look correct? If not, please spell out the correction for me, or you can update it directly on the screen.`;
          }
        } else if (pending === 'contact_confirm_correction') {
          reply = "No problem — which one would you like to update: your name, email, or mobile number?";
        } else if (pending === 'otp_verification' && !prof.otp_verified) {
          (prof as any)._otpReadyToShow = true;
          reply = "I've sent a one-time code to confirm your email and mobile number — please go ahead and enter it securely on your screen when it arrives, and you're all set.";
        } else if (pending === 'soft_pull_authorization') {
          if (!prof.soft_pull_disclosure_delivered) {
            prof.soft_pull_disclosure_delivered = true;
            (prof as any).soft_pull_disclosure_delivered_at = Date.now();
            reply = "Before we proceed, I want to be clear about what this involves. This is a soft credit inquiry — it will not affect your credit score in any way. You are the one authorizing it, and your data is used only to process your initial eligibility review and pre-fill your mortgage application. Do you authorize the soft credit inquiry on that basis?";
          } else if (isAffirmative) {
            prof.soft_pull_consent = 'accepted';
            prof.prefilled_fields_confirmed = {};
            const crsResult = await callCrsSoftPull(prof);
            if (crsResult) {
              prof.credit_range = crsResult.creditRange;
              (prof as any).crs_open_accounts = crsResult.openAccounts;
              (prof as any).crs_late_payments = crsResult.latePaymentsLast24Mo;
              prof.employer = 'Convergent AI';
              prof.legal_name = prof.contact_name || prof.borrower_name || crsResult.legalName || 'Valued Borrower';
              if (crsResult.physicalAddress) prof.physical_address = crsResult.physicalAddress;
            }
            contextManager.advanceWorkflow();
            (prof as any).prefill_name_address_delivered = true;
            const name = prof.contact_name || prof.legal_name || prof.borrower_name || 'Valued Borrower';
            const address = prof.physical_address || (prof.zip_code ? `address on file in zip code ${prof.zip_code}` : 'address on file');
            reply = `Thank you. I've processed that soft pull. First, I have your name listed as ${name}, and your physical address as ${address}. Does that sound right, or is anything out of date?`;
          } else if (/\b(no|not right now|don't authorize|cancel)\b/i.test(lower)) {
            prof.soft_pull_consent = 'declined';
            contextManager.advanceWorkflow();
            reply = "Absolutely — we can explore your affordability summary using the information you've already shared.";
          }
        } else if (pending === 'prefill_name_address') {
          const name = prof.contact_name || prof.legal_name || prof.borrower_name || 'Valued Borrower';
          const address = prof.physical_address || (prof.zip_code ? `address on file in zip code ${prof.zip_code}` : 'address on file');
          if (isAffirmative) {
            prof.prefilled_fields_confirmed = prof.prefilled_fields_confirmed || {};
            prof.prefilled_fields_confirmed.name_address = true;
            contextManager.advanceWorkflow();
            (prof as any).prefill_employer_delivered = true;
            const employer = prof.employer || 'Convergent AI';
            reply = `Great. Next, I have your employer listed as ${employer}. Does that sound correct, or has anything changed?`;
          } else if (!isCorrection && !(prof as any).needs_prefill_correction) {
            reply = `Thank you. I've processed that soft pull. First, I have your name listed as ${name}, and your physical address as ${address}. Does that sound right, or is anything out of date?`;
          }
        } else if (pending === 'prefill_employer') {
          const employer = prof.employer || 'Convergent AI';
          if (isAffirmative) {
            prof.prefilled_fields_confirmed = prof.prefilled_fields_confirmed || {};
            prof.prefilled_fields_confirmed.employer = true;
            contextManager.advanceWorkflow();
            (prof as any).prefill_accounts_delivered = true;
            const openAccounts = (prof as any).crs_open_accounts ?? 3;
            const latePayments = (prof as any).crs_late_payments ?? 0;
            const accountWord = openAccounts === 1 ? 'account' : 'accounts';
            const paymentWord = latePayments === 1 ? 'payment' : 'payments';
            const lateText = latePayments === 0 ? 'no late payments' : `${latePayments} late ${paymentWord}`;
            reply = `Perfect. For your accounts summary, I have ${openAccounts} open ${accountWord} and ${lateText} in the last 24 months. Does that match what you know, or is anything off?`;
          } else if (!isCorrection && !(prof as any).needs_prefill_correction) {
            reply = `Great. Next, I have your employer listed as ${employer}. Does that sound correct, or has anything changed?`;
          }
        } else if (pending === 'prefill_accounts') {
          if (isAffirmative) {
            prof.prefilled_fields_confirmed = prof.prefilled_fields_confirmed || {};
            prof.prefilled_fields_confirmed.accounts = true;
            contextManager.advanceWorkflow();
            (prof as any).prefill_credit_range_delivered = true;
            let creditScoreNum = 700;
            if (prof.credit_range) {
              const m = prof.credit_range.match(/\d+/);
              if (m) creditScoreNum = parseInt(m[0], 10);
            }
            let creditCategory = 'Good';
            if (creditScoreNum >= 740) creditCategory = 'Excellent';
            else if (creditScoreNum >= 670) creditCategory = 'Good';
            else if (creditScoreNum >= 580) creditCategory = 'Fair';
            else creditCategory = 'Poor';
            reply = `Lastly, we retrieved your credit profile showing a category rating in the ${creditCategory} range. Does that match what you expect or is anything out of date?`;
          } else if (!isCorrection && !(prof as any).needs_prefill_correction) {
            const openAccounts = (prof as any).crs_open_accounts ?? 3;
            const latePayments = (prof as any).crs_late_payments ?? 0;
            const accountWord = openAccounts === 1 ? 'account' : 'accounts';
            const paymentWord = latePayments === 1 ? 'payment' : 'payments';
            const lateText = latePayments === 0 ? 'no late payments' : `${latePayments} late ${paymentWord}`;
            reply = `Perfect. For your accounts summary, I have ${openAccounts} open ${accountWord} and ${lateText} in the last 24 months. Does that match what you know, or is anything off?`;
          }
        } else if (pending === 'prefill_credit_range') {
          if (isAffirmative) {
            prof.prefilled_fields_confirmed = prof.prefilled_fields_confirmed || {};
            prof.prefilled_fields_confirmed.credit_range = true;
            prof.affordability_mode = 'verified';
            contextManager.getProfile().affordability_mode = 'verified';
            contextManager.advanceWorkflow();
            (prof as any).affordability_panel_intro_delivered = true;
            prof.affordability_panel_rendered = true;
            (prof as any).affordability_panel_closed = false;
            prof.affordability_submitted = false;
            prof.aus_status = null;
            prof.affordability_aus_status = null;
            contextManager.setActiveStage('2.5');
            contextManager.setCurrentPendingField('affordability_panel_active');
            sendStageUpdate('2.5');
            const borrowerName = prof.borrower_name || prof.contact_name || prof.legal_name || 'there';
            const isHel = prof.transaction_type === 'TT-HEL' || prof.transaction_type === 'TT-HEQ' || prof.mortgage_goal === 'heloc';
            const isRef = prof.transaction_type === 'TT-REF' || prof.mortgage_goal === 'refinance';
            if (isHel) {
              reply = prof.transaction_type === 'TT-HEQ'
                ? `Thank you for your patience${borrowerName !== 'there' ? ', ' + borrowerName : ''} — your initial results are in, and your home equity summary is ready for you. It brings together your home value, existing mortgage balance, and the loan amount target you shared with me alongside the details from your credit review, and shows how your numbers compare with typical program guideline ranges. One important note before we look at it together: this is an educational summary to help you explore — it is not a loan decision, and you can submit for the formal eligibility review at any time, no matter what these ranges show. Would you like to walk through it together?`
                : `Thank you for your patience${borrowerName !== 'there' ? ', ' + borrowerName : ''} — your initial results are in, and your home equity summary is ready for you. It brings together your home value, existing mortgage balance, and the credit line target you shared with me alongside the details from your credit review, and shows how your numbers compare with typical program guideline ranges. One important note before we look at it together: this is an educational summary to help you explore — it is not a loan decision, and you can submit for the formal eligibility review at any time, no matter what these ranges show. Would you like to walk through it together?`;
            } else if (isRef) {
              reply = `Thank you for your patience${borrowerName !== 'there' ? ', ' + borrowerName : ''} — your initial results are in, and your refinance summary is ready for you. It brings together your home value, existing mortgage balance, and the refinance targets you shared with me alongside the details from your credit review, and shows how your numbers compare with typical program guideline ranges. One important note before we look at it together: this is an educational summary to help you explore — it is not a loan decision, and you can submit for the formal eligibility review at any time, no matter what these ranges show. Would you like to walk through it together?`;
            } else {
              reply = `Thank you for your patience${borrowerName !== 'there' ? ', ' + borrowerName : ''} — your initial results are in, and your affordability summary is ready for you. It brings together the income and savings targets you shared with me and the details from your credit review, and shows how your numbers compare with typical program guideline ranges. One important note before we look at it together: this is an educational summary to help you explore — it is not a loan decision, and you can submit for the formal eligibility review at any time, no matter what these ranges show. Would you like to walk through it together?`;
            }
          } else if (!isCorrection && !(prof as any).needs_prefill_correction) {
            let creditScoreNum = 700;
            if (prof.credit_range) {
              const m = prof.credit_range.match(/\d+/);
              if (m) creditScoreNum = parseInt(m[0], 10);
            }
            let creditCategory = 'Good';
            if (creditScoreNum >= 740) creditCategory = 'Excellent';
            else if (creditScoreNum >= 670) creditCategory = 'Good';
            else if (creditScoreNum >= 580) creditCategory = 'Fair';
            else creditCategory = 'Poor';
            reply = `Lastly, we retrieved your credit profile showing a category rating in the ${creditCategory} range. Does that match what you expect or is anything out of date?`;
          }
        } else if (pending === 'fd1_delivery' || pending === 'fd2_delivery') {
          contextManager.setActiveStage('5');
          contextManager.setCurrentPendingField('escalation_preference');
          sendStageUpdate('5').catch(err => console.warn(err));
          const borrowerName = prof.borrower_name || prof.contact_name || prof.legal_name || 'there';
          const isRef = prof.transaction_type === 'TT-REF' || prof.mortgage_goal === 'refinance';
          const isHel = prof.transaction_type === 'TT-HEL' || prof.transaction_type === 'TT-HEQ' || prof.mortgage_goal === 'heloc';
          if (isRef) {
            reply = `Good news${borrowerName !== 'there' ? ', ' + borrowerName : ''} — your eligibility review came back, and based on the information you provided, you appear conditionally eligible for the refinance scenario you built. Your estimated payment comparison is ready for you — it shows your estimated new payment alongside your current payment reference point. Your licensed loan officer will reach out to walk you through next steps and lock in your rate — or I can connect you right now if you'd like.`;
          } else if (isHel) {
            reply = prof.transaction_type === 'TT-HEQ'
              ? `Good news${borrowerName !== 'there' ? ', ' + borrowerName : ''} — your eligibility review came back, and based on the information you provided, you appear conditionally eligible for a home equity loan. Your licensed loan officer will reach out to walk you through next steps — or I can connect you right now if you'd like.`
              : `Good news${borrowerName !== 'there' ? ', ' + borrowerName : ''} — your eligibility review came back, and based on the information you provided, you appear conditionally eligible for a home equity line of credit. Your licensed loan officer will reach out to walk you through the next steps — including the formal application, appraisal scheduling, and the terms of your line — or I can connect you right now if you'd like.`;
          } else {
            reply = `Wonderful news${borrowerName !== 'there' ? ', ' + borrowerName : ''} — your eligibility review came back, and based on the information you provided, you're conditionally eligible for the scenario you built. Your estimated payment range has been calculated and is included in your pre-qualification letter. I've sent your pre-qualification letter to your email on file — it's issued by your lending institution, it's valid for ninety days, and it's exactly what real estate agents like to see with an offer. Your licensed loan officer will reach out to walk you through next steps — or I can connect you right now if you'd like.`;
          }
        }

        if (!reply) {
          const chatMessages = contextManager.buildTextMessages();

          // Ensure static system prompt is at index 0, history in middle, dynamic context at end
          const systemMessage = chatMessages[0];
          const dynamicMessage = chatMessages[chatMessages.length - 1];
          const historyMessages = chatMessages.slice(1, -1);
          const slicedHistory = historyMessages.slice(-22); // keep up to 22 recent turns
          const messages = [systemMessage, ...slicedHistory, dynamicMessage];

          console.log(`[agent]: Dispatching text-only reply to LiveKit Inference LLM (prefix cached)...`);
          const textChatCtx = new llm.ChatContext();
          for (const msg of messages) {
            if (msg) {
              textChatCtx.addMessage({
                role: (msg.role as any) || 'user',
                content: msg.content || '',
              });
            }
          }
          const textStream = summarizationLlm.chat({ chatCtx: textChatCtx });
          const textCollected = await textStream.collect();
          reply = textCollected.text?.replace(/<[^>]*>/g, '').replace(/<[^>]*$/, '').replace(/\s+/g, ' ').trim() || null;
        }

        if (reply) {
          contextManager.onAgentTurn(reply).catch(err =>
            console.error('[agent-error]: Failed to save agent turn:', err)
          );
          console.log(`[agent]: Text-only reply: "${reply}"`);

          try {
            await ctx.room.localParticipant?.sendText(reply, { topic: 'lk.chat' });
          } catch {
            await ctx.room.localParticipant?.sendChatMessage(reply);
          }
        }
      } catch (err) {
        console.error('[agent]: Text-only reply failed:', err);
      }
    };

    const handleSystemMessages = async (messageText: string, participantIdentity: string | undefined, opts?: { zip?: string }) => {
      if (isHibernating && messageText !== 'SYSTEM_RESUME_AGENT') {
        console.log(`[agent]: Ignoring message while hibernating: ${messageText}`);
        return;
      }

      if (messageText === 'SYSTEM_END_SESSION') {
        console.warn(`[agent]: SYSTEM_END_SESSION received. Instantly terminating session to free resources.`);
        ctx.room.disconnect();
        return;
      }

      if (messageText === 'SYSTEM_LOCATION_ZIP') {
        const zip = String(opts?.zip || '').replace(/\D/g, '').slice(0, 5);
        if (/^\d{5}$/.test(zip)) {
          contextManager.getProfile().zip_code = zip;
          if (voiceMloTransfer.active) voiceMloTransfer.zip = zip;
          console.log(`[voice-mlo-transfer]: synchronized detected/customer ZIP=${zip}.`);
        }
        return;
      }

      // ── Issue 1 Fix: Affordability Calculator disappeared from frontend ──────
      // Fires when the frontend widget unmounts unexpectedly while the user was using it.
      // Ailana verbalizes the issue, attempts to reopen the panel, and offers a verbal fallback.
      if (messageText === 'SYSTEM_PANEL_DISAPPEARED') {
        console.warn('[agent]: SYSTEM_PANEL_DISAPPEARED received — affordability panel unmounted unexpectedly.');
        const prof = contextManager.getProfile();
        // Attempt to reopen by re-sending the stage update with panel rendered = true
        prof.affordability_panel_rendered = true;
        (prof as any).affordability_panel_closed = false;
        await sendStageUpdate(contextManager.getActiveStage());
        const recoveryScript = "It looks like the affordability panel may have closed — I'm trying to bring it back right now. If it doesn't reappear in a moment, you can refresh the page and I'll pick up right where we left off, or we can continue walking through your numbers verbally. Which would you prefer?";
        await deliverAgentScript(recoveryScript);
        return;
      }


      if (messageText.startsWith('SYSTEM_AUS_SUBMITTED:')) {
        const status = messageText.split(':')[1];
        console.log(`[agent]: SYSTEM_AUS_SUBMITTED received. Status: ${status}`);
        await contextManager.applyAusResult(status as any);
        const prof = contextManager.getProfile();
        prof.affordability_panel_rendered = false;
        (prof as any).affordability_panel_closed = true;
        updateSessionInstructions();
        await sendStageUpdate(contextManager.getActiveStage());

        const triggerPrompt = `The eligibility review has returned with status: ${status}. Please deliver the findings to the borrower.`;
        if (voiceMuted) {
          await generateTextOnlyReply(triggerPrompt);
        } else {
          metrics.startTurn();
          metrics.markGenerateReply();
          session.generateReply({ userInput: triggerPrompt });
        }
        return;
      }

      if (messageText === 'SYSTEM_STAGE_UPDATE_UPGRADE') {
        console.log(`[agent]: SYSTEM_STAGE_UPDATE_UPGRADE received. Triggering upgrade to Stage 3A.`);
        contextManager.triggerUpgradeToVerifiedMode();
        updateSessionInstructions();
        await sendStageUpdate(contextManager.getActiveStage());

        const upgradeScript = "I'd be happy to get that upgraded for you! Before we run your review, I'll need a few details to set up your secure account. First — what's your first name?";
        await deliverAgentScript(upgradeScript);
        return;
      }

      if (messageText === 'SYSTEM_TRANSFER_MLO') {
        await performMloTransfer(opts);
        return;
      }

      if (messageText === 'SYSTEM_LOAN_OFFICER_CANCELLED') {
        console.log(`[agent]: 🚫 User cancelled MLO transfer. Triggering fallback.`);
        const scriptText = "I see you closed the transfer window. Are you still deciding, or is there another question I can help you with first?";
        await deliverAgentScript(scriptText);
        return;
      }

      if (messageText === 'SYSTEM_RESUME_AGENT') {
        isHibernating = false;
        console.log(`[agent]: Agent waking up from hibernation.`);

        // Unmute the agent's microphone track
        // (Removed track?.unmute() as it is no longer needed)

        for (const p of ctx.room.remoteParticipants.values()) {
          for (const pub of p.trackPublications.values()) {
            if (!pub.subscribed) pub.setSubscribed(true);
          }
        }

        // The queue-timeout recovery already generated the scheduling offer.
        // The frontend mode change also emits SYSTEM_RESUME_AGENT; suppress its
        // generic resume reply so Ailana does not speak twice.
        if (voiceScheduling.active) {
          console.log('[voice-scheduling]: duplicate generic resume suppressed.');
          return;
        }

        metrics.startTurn();
        metrics.markGenerateReply();
        session.generateReply({ userInput: RESUME_USER_INPUT });
        return;
      }

      if (messageText === 'SYSTEM_VOICE_MUTED') {
        voiceMuted = true;
        contextManager.setChannel('text');
        console.log(`[agent]: Avatar voice disabled — text-only replies.`);
        return;
      }
      if (messageText === 'SYSTEM_VOICE_UNMUTED') {
        voiceMuted = false;
        contextManager.setChannel('voice');
        console.log(`[agent]: Avatar voice enabled — resuming voice replies.`);
        return;
      }

      if (messageText.startsWith('SYSTEM_CHANNEL_START')) {
        const targetMode = messageText.split(':')[1] || 'video';
        console.log(`[agent]: Channel started (${targetMode}).`);
        contextManager.setChannel(targetMode === 'video' || targetMode === 'voice' ? 'voice' : 'text');

        if (targetMode === 'video' || targetMode === 'voice') {
          if (voiceMuted) {
            voiceMuted = false;
            console.log(`[agent]: Avatar voice auto-enabled on channel switch to ${targetMode}.`);
          }
        }

        // Atomic guard: claim greeting generation immediately before any async boundary
        if (greetingGenerated) {
          if (!isAvatarInitDone) {
            console.log(`[agent]: Reconnect/duplicate SYSTEM_CHANNEL_START received, but avatar still initializing. Waiting...`);
            await avatarReadyPromise;
          }
          // Participant reconnected or switched channels. Send SYSTEM_AGENT_READY immediately
          // so the frontend knows the agent is alive and hides the loading screen.
          try {
            const readyPayload = new TextEncoder().encode(JSON.stringify({ message: "SYSTEM_AGENT_READY" }));
            await ctx.room.localParticipant?.publishData(readyPayload, { reliable: true, topic: "lk-chat" });
            console.log(`[agent]: Participant reconnected — Sent SYSTEM_AGENT_READY signal.`);
          } catch (e) {
            console.warn(`[agent]: Failed to send SYSTEM_AGENT_READY on reconnect:`, e);
          }
          return;
        }
        greetingGenerated = true;
        pendingGreeting = true;

        if (!isAvatarInitDone) {
          console.log(`[agent]: SYSTEM_CHANNEL_START received before avatar ready. Waiting for avatar initialization...`);
          await avatarReadyPromise;
          console.log(`[agent]: Avatar ready. Resuming deferred SYSTEM_CHANNEL_START handler.`);
        }

        pendingGreeting = false;
        const greetingText = getGreetingText();

        try {
          if (!(session as any)._started) {
            sessionStarted = true;
            await session.start({
              agent: vadAgent,
              room: ctx.room,
              inputOptions: { noiseCancellation: BackgroundVoiceCancellation(), closeOnDisconnect: false },
            });
            console.log(`[agent]: Session started on SYSTEM_CHANNEL_START.`);
          }

          // Always send SYSTEM_AGENT_READY signal to let the frontend hide the loading screen
          const readyPayload = new TextEncoder().encode(JSON.stringify({ message: "SYSTEM_AGENT_READY" }));
          await ctx.room.localParticipant?.publishData(readyPayload, { reliable: true, topic: "lk-chat" });
          console.log(`[agent]: Sent SYSTEM_AGENT_READY signal.`);

          metrics.startTurn();
          metrics.markAgentSpeaking();
          session.say(greetingText, { addToChatCtx: true });
          console.log(`[agent]: Greeting fired.`);
        } catch (err) {
          console.error(`[agent]: Failed to start session on SYSTEM_CHANNEL_START:`, err);
          greetingGenerated = false;
          sessionStarted = false;
        }
        return;
      }

      // A scheduling confirmation/date/slot sent through Chat must not fall
      // through to contextManager.onUserTurn(), because that reinstates the
      // mortgage pending field and hides findMeetingTimes/confirmMeeting from
      // the active task. Generate the reply with the scheduling prompt and the
      // same registered tools used by spoken turns.
      if (voiceScheduling.active) {
        try {
          if (!(session as any)._started) {
            sessionStarted = true;
            await session.start({
              agent: vadAgent,
              room: ctx.room,
              inputOptions: { noiseCancellation: BackgroundVoiceCancellation(), closeOnDisconnect: false },
            });
          }
          applyConversationalSchedulingInstructions();
          void contextManager.saveVoiceConversationTurn('user', messageText);
          metrics.startTurn();
          metrics.markGenerateReply();
          console.log(`[voice-scheduling]: routing typed customer turn to scheduling tools: "${messageText}"`);
          session.generateReply({ userInput: messageText });
        } catch (error) {
          console.error(`[voice-scheduling]: typed scheduling turn failed: ${safeErrorMessage(error)}`);
          await deliverAgentScript('I am sorry, I could not continue scheduling just now. Please tell me the preferred date again.', 'scheduling recovery');
        }
        return;
      }

      // Typed chat and spoken turns must use the same deterministic ZIP and
      // transfer state. Scheduling is checked first because it owns all turns
      // after a no-agent callback offer has started.
      if (requestMloTransferHandler && voiceMloTransfer.active) {
        const handled = await requestMloTransferHandler(messageText);
        if (handled) return;
      }

      try {
        console.log(`[agent]: Generating reply for: "${messageText}"`);
        if (!(session as any)._started) {
          await session.start({
            agent: vadAgent,
            room: ctx.room,
            inputOptions: { noiseCancellation: BackgroundVoiceCancellation(), closeOnDisconnect: false },
          });
        }

        metrics.startTurn();
        metrics.markGenerateReply();

        if (voiceMuted) {
          await generateTextOnlyReply(messageText);
        } else {
          // For typed inputs in voice session, we run extraction and update instructions BEFORE calling generateReply
          if (vadAgent) {
            (vadAgent as any).activeFieldAtTurnStart = contextManager.getPendingField();
          }
          await contextManager.onUserTurn(messageText);
          updateSessionInstructions();
          if (vadAgent) vadAgent.turnPrepared = true; // already processed — llmNode must not process it again
          // generateReply() does NOT run onUserTurnCompleted, so the per-turn Layer 3
          // context (CURRENT TASK, bridge phrases, profile) that spoken turns get was
          // missing for typed turns — Ailana stalled after Stage 1 ("waiting for the
          // system"). Pass it as this reply's instructions: the SDK appends it to the
          // agent's static instructions for this generation only.
          session.generateReply({
            userInput: messageText,
            instructions: contextManager.getDynamicContext(),
          });
        }
      } catch (err) {
        console.warn(`[agent]: Could not generate reply:`, err);
      }
    };

    // Voice and UI handoffs share the exact same authoritative transfer path.
    // This prevents spoken requests from bypassing ZIP routing, ESL availability,
    // or the database-backed queue mapping used by SYSTEM_TRANSFER_MLO.
    requestMloTransferHandler = async (rawText: string): Promise<boolean> => {
      if (voiceScheduling.active) {
        console.log('[voice-mlo-transfer]: ignored because conversational scheduling is active.');
        return false;
      }
      const text = rawText.trim();
      const explicitTransferIntent = isLoanOfficerTransferIntent(text);
      const postBookingAcknowledgement = /^(?:oh\s+)?(?:yes|yeah|yep|sure|okay|ok|no|nope|thanks|thank\s+you|all\s+set|please)(?:[\s.,!]+(?:yes|yeah|yep|sure|okay|ok|no|nope|thanks|thank\s+you|all\s+set|please))*[\s.,!]*$/i.test(text);
      if (voiceScheduling.completedAt > 0 && !explicitTransferIntent && postBookingAcknowledgement) {
        console.log(`[voice-scheduling]: post-booking acknowledgement suppressed confirmation=${voiceScheduling.confirmationNumber || 'unknown'}.`);
        return true;
      }
      const spokenZip = normalizeSpokenZip(text) || '';
      const pendingField = contextManager.getPendingField();
      const awaitingLoanOfficerChoice = pendingField === 'fd1_delivery'
        || pendingField === 'fd2_delivery'
        || pendingField === 'escalation_preference';
      const contextualConfirmation = voiceScheduling.completedAt === 0 && isContextualLoanOfficerTransferConfirmation(
        text,
        awaitingLoanOfficerChoice,
      );
      const transferIntent = explicitTransferIntent || contextualConfirmation;
      const cancelIntent = /\b(?:never mind|nevermind|cancel|stop|do not|don't)\b[\s\S]{0,30}\b(?:transfer|connect|call|loan officer|representative)?\b/i.test(text);

      if (voiceMloTransfer.active && cancelIntent) {
        voiceMloTransfer.active = false;
        voiceMloTransfer.phase = 'idle';
        voiceMloTransfer.zip = null;
        voiceMloTransfer.zipAttempts = 0;
        voiceMloTransfer.lastZipPromptAt = 0;
        console.log('[voice-mlo-transfer]: customer cancelled pending transfer.');
        setTimeout(() => {
          if (!shuttingDown && !isHibernating) void session.say('No problem. We can continue here with Ailana.', { addToChatCtx: true });
        }, 0);
        return true;
      }

      if (!transferIntent && !voiceMloTransfer.active) return false;

      const profile = contextManager.getProfile();
      if (transferIntent && !voiceMloTransfer.active) {
        voiceMloTransfer.active = true;
        voiceMloTransfer.requestedAt = Date.now();
        voiceMloTransfer.zipAttempts = 0;
        voiceMloTransfer.lastZipPromptAt = 0;
        console.log(`[voice-mlo-transfer]: intent accepted source=${contextualConfirmation ? 'contextual_confirmation' : 'explicit_request'} pendingField=${pendingField || 'none'}.`);
      }
      const zip = spokenZip || voiceMloTransfer.zip || String(profile.zip_code || '').replace(/\D/g, '').slice(0, 5);
      if (!/^\d{5}$/.test(zip)) {
        voiceMloTransfer.phase = 'awaiting_zip';
        const now = Date.now();
        const looksLikeZipAttempt = /\b(?:zip|postal|zero|oh|one|two|three|four|five|six|seven|eight|nine|[0-9])\b/i.test(text);
        if (looksLikeZipAttempt) voiceMloTransfer.zipAttempts += 1;
        const shouldPrompt = voiceMloTransfer.lastZipPromptAt === 0 || now - voiceMloTransfer.lastZipPromptAt >= 8000;
        if (!shouldPrompt) {
          console.log('[voice-mlo-transfer]: duplicate ZIP prompt suppressed.');
          return true;
        }
        voiceMloTransfer.lastZipPromptAt = now;
        console.log(`[voice-mlo-transfer]: no usable ZIP attempt=${voiceMloTransfer.zipAttempts}; asking customer.`);
        const zipPrompt = voiceMloTransfer.zipAttempts >= 2
          ? 'I still need the five-digit property ZIP code. Please type all five digits in Chat, for example 90001.'
          : 'I can connect you with a licensed Loan Officer. What is the five-digit ZIP code for the property so I can route you to the correctly licensed team?';
        setTimeout(() => {
          if (shuttingDown || isHibernating) return;
          void (async () => {
            try {
              await session.say(zipPrompt, { addToChatCtx: true });
            } catch (error) {
              console.warn(`[voice-mlo-transfer]: ZIP prompt failed: ${safeErrorMessage(error)}`);
            }
          })();
        }, 0);
        return true;
      }

      if (voiceMloTransfer.phase === 'dispatching' || mloTransferPending) {
        console.log('[voice-mlo-transfer]: duplicate utterance suppressed while transfer is dispatching.');
        return true;
      }
      voiceMloTransfer.phase = 'dispatching';
      voiceMloTransfer.zip = zip;
      voiceMloTransfer.zipAttempts = 0;
      voiceMloTransfer.lastZipPromptAt = 0;
      profile.zip_code = zip;
      voiceScheduling.active = false;
      voiceScheduling.slots = [];
      console.log(`[voice-mlo-transfer]: accepted customer ZIP zip=${zip}; dispatching authoritative transfer handler.`);
      setTimeout(() => {
        handleSystemMessages('SYSTEM_TRANSFER_MLO', undefined, { zip })
          .catch(error => console.error(`[voice-mlo-transfer]: transfer handler failed: ${safeErrorMessage(error)}`));
      }, 0);
      return true;
    };

    let reaperTimeout: NodeJS.Timeout | null = null;
    ctx.room.on(RoomEvent.ParticipantConnected, (participant: any) => {
      if (participant?.identity?.startsWith('guest_')) {
        console.log(`[agent]: Guest participant connected: ${participant.identity}. Clearing any active Reaper.`);
        if (reaperTimeout) {
          clearTimeout(reaperTimeout);
          reaperTimeout = null;
        }
      }
    });

    ctx.room.on(RoomEvent.ParticipantDisconnected, async (participant: any) => {
      const identity = participant?.identity || '';
      console.warn(`[agent]: Participant disconnected: ${identity}`);

      if (activeSipIdentity && identity === activeSipIdentity) {
        activeSipIdentity = null;
        return;
      }

      if (identity.startsWith('guest_')) {
        shuttingDown = true;
        if (silentTurnTimer !== null) {
          clearTimeout(silentTurnTimer);
          silentTurnTimer = null;
        }
        if (reaperTimeout) {
          clearTimeout(reaperTimeout);
          reaperTimeout = null;
        }

        // Check if any other human guest remains in the room
        const remainingGuests = [...ctx.room.remoteParticipants.values()].filter(
          p => p.identity?.startsWith('guest_') && p.identity !== identity
        );

        if (remainingGuests.length === 0) {
          console.log(`[agent]: 🛑 Human guest left (${identity}) and room "${ctx.room.name}" is now empty. Initiating zero-buffer immediate teardown.`);
          const sipId = activeSipIdentity;
          activeSipIdentity = null;
          try {
            const sip = await import('./utils/sipTransfer.js');
            if (sipId) {
              await sip.hangupMloParticipant(ctx.room.name || '', sipId).catch(() => {});
            }
            await sip.deleteMloRoom(ctx.room.name || '');
          } catch (error) {
            console.error('[agent]: failed to tear down room after caller left:', error);
          }

          try {
            if ((session as any)._started) {
              session.close();
            }
            ctx.room.disconnect();
          } catch (teardownErr) {
            console.error(`[agent]: Error during zero-buffer teardown:`, teardownErr);
          }
        } else {
          console.log(`[agent]: Guest ${identity} disconnected, but ${remainingGuests.length} other guest(s) still present in room.`);
        }
      }
    });

    ctx.room.on(RoomEvent.ChatMessage, async (msg, participant) => {
      try {
        const identity = participant?.identity ?? (msg as any).participantIdentity;
        if (!msg.message || identity === ctx.room.localParticipant?.identity) return;
        try {
          const parsed = JSON.parse(msg.message);
          if (parsed && typeof parsed === 'object') {
            await handleSystemMessages(parsed.message ?? msg.message, identity, { zip: parsed.zip });
            return;
          }
        } catch {}
        await handleSystemMessages(msg.message, identity);
      } catch (err) {
        console.error(`[agent-error]: ChatMessage handler:`, err);
      }
    });

    ctx.room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
      const isSpeaking = speakers.some((p) => p.identity?.startsWith('lemonslice') || p.identity?.includes('avatar'));
      if (isSpeaking) {
        metrics.markAvatarFirstFrame();
      }
    });

    ctx.room.on(RoomEvent.TrackPublished, (pub, participant) => {
      if (isHibernating && !participant.identity.startsWith('guest_')) {
        pub.setSubscribed(false);
      }
    });

    ctx.room.on(RoomEvent.TrackSubscribed, (track, pub, participant) => {
      if (isHibernating && !participant.identity.startsWith('guest_')) {
        pub.setSubscribed(false);
      }
      // Secondary avatar first-frame trigger: TrackSubscribed fires earlier than
      // ActiveSpeakersChanged on fast turns where the SDK cleans up the task
      // lifecycle before the speaker list updates (the "firstFrameFut cancelled"
      // race condition). The idempotency guard in markAvatarFirstFrame() ensures
      // only the first event wins — no double-counting.
      if (participant?.identity?.startsWith('lemonslice') || participant?.identity?.includes('avatar')) {
        console.log(`[avatar][${ts()}] 🎯  TrackSubscribed from avatar — triggering markAvatarFirstFrame() as safety net`);
        metrics.markAvatarFirstFrame();
      }
    });

    // Start the session the moment the user unmutes their microphone.
    // This aligns the audio pipeline clock (T=0) with the first real voice packet,
    // preventing the silence-prepend backlog caused by a clock gap.
    ctx.room.on(RoomEvent.TrackUnmuted, async (pub, participant) => {
      if (isHibernating) return;
      if (pub.kind !== TrackKind.KIND_AUDIO) return;
      if (!participant?.identity?.startsWith('guest_')) return;
      if (sessionStarted) return;

      if (!isAvatarInitDone) {
        console.log(`[agent]: User mic unmuted but avatar not ready yet. Waiting for avatar initialization before starting session...`);
        await avatarReadyPromise;
        console.log(`[agent]: Avatar ready. Proceeding with session start on mic unmute.`);
        if (sessionStarted) return;
      }

      sessionStarted = true;
      console.log(`[agent]: User mic unmuted (identity: ${participant?.identity}). Starting AgentSession now...`);
      try {
        await session.start({
          agent: vadAgent,
          room: ctx.room,
          inputOptions: { noiseCancellation: BackgroundVoiceCancellation(), closeOnDisconnect: false },
        });
        console.log(`[agent]: Realtime session started successfully.`);

        const readyPayload = new TextEncoder().encode(JSON.stringify({ message: "SYSTEM_AGENT_READY" }));
        await ctx.room.localParticipant?.publishData(readyPayload, { reliable: true, topic: "lk-chat" });
        console.log(`[agent]: Sent SYSTEM_AGENT_READY signal.`);

        // If the channel start signal already arrived while we were waiting, say greeting now
        const greetingText = getGreetingText();
        if (pendingGreeting && !greetingGenerated) {
          greetingGenerated = true;
          pendingGreeting = false;
          metrics.startTurn();
          metrics.markAgentSpeaking();
          session.say(greetingText, { addToChatCtx: true });
          console.log(`[agent]: Pending greeting fired after session start.`);
        }
      } catch (err) {
        console.error(`[agent]: Failed to start session on TrackUnmuted:`, err);
        sessionStarted = false;
      }
    });

    const deliverSoftPullDisclosureOnce = (reason: string) => {
      const p = contextManager.getProfile();
      if (p.soft_pull_disclosure_delivered) {
        console.log(`[agent]: Soft pull disclosure ALREADY delivered (ignoring duplicate trigger from ${reason}).`);
        return;
      }
      p.soft_pull_disclosure_delivered = true;
      (p as any).soft_pull_disclosure_delivered_at = Date.now();
      console.log(`[agent]: Triggering clean agent turn to deliver soft pull disclosure [triggered by ${reason}].`);
      const scriptText = "Before we proceed, I want to be clear about what this involves. This is a soft credit inquiry — it will not affect your credit score in any way. You are the one authorizing it, and your data is used only to process your initial eligibility review and pre-fill your mortgage application. Do you authorize the soft credit inquiry on that basis?";
      deliverAgentScript(scriptText, reason).catch(err => console.error(err));
    };

    const deliverOtpInstructionsOnce = (reason: string) => {
      const p = contextManager.getProfile();
      if ((p as any)._otpInstructionDelivered) {
        console.log(`[agent]: OTP instructions ALREADY delivered (ignoring duplicate trigger from ${reason}).`);
        return;
      }
      (p as any)._otpInstructionDelivered = true;
      (p as any)._otpReadyToShow = true;
      console.log(`[agent]: Triggering agent speech for OTP instructions [triggered by ${reason}].`);
      const scriptText = "I've sent a one-time code to confirm your email and mobile number — please go ahead and enter it securely on your screen when it arrives, and you're all set.";
      deliverAgentScript(scriptText, reason).catch(err => console.error(err));
      sendStageUpdate(contextManager.getActiveStage()).catch(err =>
        console.error('[agent-error]: Failed to send stage update after OTP dispatch:', err)
      );
    };

    const handleUIFieldCorrection = async (parsed: { field?: string; value?: any }) => {
      await applyUIFieldCorrection(parsed, contextManager.getProfile());
    };

    ctx.room.on(RoomEvent.DataReceived, async (payload, participant, _kind, topic) => {
      try {
        const identity = participant?.identity;
        if (topic === 'lk-chat' && identity !== ctx.room.localParticipant?.identity) {
          const str = new TextDecoder().decode(payload);
          const isRestoreMsg = str.includes('"SYSTEM_RESTORE_STATE"');
          const maxLen = isRestoreMsg ? 500000 : 8000;
          if (str.length > maxLen) {
            console.warn(`[agent-security]: Oversized DataReceived payload (>${maxLen} chars) from ${identity} — ignoring.`);
            return;
          }
          try {
            const parsed = JSON.parse(str);
            if (parsed.message === "SYSTEM_METRIC_RENDER_DELTA" && parsed.client_render_ms !== undefined) {
              metrics.markClientRenderMs(parsed.client_render_ms);
              return;
            }

            if (parsed.message === 'SYSTEM_RESTORE_STATE' && parsed.snapshot) {
              if (isRestoredSession) {
                console.log(`[agent]: SYSTEM_RESTORE_STATE already applied. Ignoring duplicate.`);
                return;
              }
              isRestoredSession = true;
              console.log(`[agent]: SYSTEM_RESTORE_STATE received. Rehydrating SessionContextManager from localStorage snapshot.`);
              const snap = parsed.snapshot;
              greetingGenerated = true;
              contextManager.hydrateFromSnapshot(snap.activeStage, snap.borrowerProfile);
              
              // Restore historical chat messages into LLM context if not already populated
              if (snap.chatTranscript && Array.isArray(snap.chatTranscript)) {
                console.log(`[agent]: Rehydrating LLM context window with ${snap.chatTranscript.length} historical messages.`);
                for (const entry of snap.chatTranscript) {
                  const role: 'user' | 'assistant' = entry.role === 'agent' ? 'assistant' : 'user';
                  
                  // ── PREVENT HANDOFF LOOP ──
                  // Strip out historical intents requesting a loan officer so the LLM doesn't 
                  // eagerly fire the transfer tool the moment the user reconnects.
                  const lowerText = entry.text.toLowerCase();
                  const isHandoffIntent = /\b(loan officer|representative|human|agent|talk to someone|connect me|advisor|real person)\b/.test(lowerText);
                  if (role === 'user' && isHandoffIntent) {
                    console.log(`[agent-hook]: Stripping historical handoff turn to prevent resume loop: "${entry.text}"`);
                    continue;
                  }

                  const existing = session.chatCtx.items.find(m => {
                    if ((m as any).type !== 'message' || !(m as any).content) return false;
                    const text = typeof (m as any).content === 'string' ? (m as any).content : JSON.stringify((m as any).content);
                    return text.includes(entry.text);
                  });
                  if (!existing) {
                    const newMsg = new llm.ChatMessage({ role, content: entry.text });
                    (newMsg as any).isRestored = true;
                    session.chatCtx.items.push(newMsg);
                  }
                }
              }
              
              updateSessionInstructions();
              sendStageUpdate(contextManager.getActiveStage()).catch(err =>
                console.error('[agent-error]: Failed to sync restored stage:', err)
              );

              (async () => {
                try {
                  if (!isAvatarInitDone) {
                    console.log(`[agent]: Waiting for avatar initialization before firing resume greeting...`);
                    await avatarReadyPromise;
                  }
                  if (!(session as any)._started) {
                    sessionStarted = true;
                    await session.start({
                      agent: vadAgent,
                      room: ctx.room,
                      inputOptions: { noiseCancellation: BackgroundVoiceCancellation(), closeOnDisconnect: false },
                    });
                  }
                  const readyPayload = new TextEncoder().encode(JSON.stringify({ message: "SYSTEM_AGENT_READY" }));
                  await ctx.room.localParticipant?.publishData(readyPayload, { reliable: true, topic: "lk-chat" });

                  const stageName = contextManager.getActiveStage();
                  const pendingField = contextManager.getPendingField() || (contextManager.getProfile() as any)?.current_pending_field || '';
                  const reprompt = pendingField ? PENDING_FIELD_REPROMPT[pendingField] : undefined;
                  const resumePrompt = reprompt
                    ? `The borrower has returned to continue their application. Warmly welcome them back (e.g., "Welcome back! It's great to connect with you again..."). The last thing they were asked was: "${reprompt}". Please seamlessly resume the conversation by asking them that question again. IMPORTANT: The question text may contain an apology for an interruption — ignore and remove that apology completely. Just ask the core question. Be friendly, concise, and do NOT apologize.`
                    : `The borrower has returned to continue their application at Stage ${stageName}. Warmly welcome them back (e.g., "Welcome back! It's great to connect with you again. Let's pick right back up where we left off...") and smoothly resume the conversation based on their profile context. Be friendly, concise, and do NOT apologize.`;
                  metrics.startTurn();
                  metrics.markGenerateReply();
                  session.generateReply({ userInput: resumePrompt });
                  console.log(`[agent]: Resume greeting fired for stage=${stageName}, pendingField=${pendingField}`);
                } catch (e) {
                  console.error(`[agent]: Failed to fire resume greeting:`, e);
                }
              })();
              return;
            }

            if (parsed.type === 'otp_submit') {
              if (!contextManager.getProfile().otp_verified) {
                contextManager.handleOtpSubmission(parsed.code);
                updateSessionInstructions();
              }
              deliverSoftPullDisclosureOnce('DataReceived:otp_submit');
              return;
            }
            if (parsed.type === 'contact_info_confirmed') {
              console.log('[agent]: contact_info_confirmed received from UI — advancing Stage 3A to OTP dispatch.');
              contextManager.handleContactInfoConfirmed();
              updateSessionInstructions();
              deliverOtpInstructionsOnce('DataReceived:contact_info_confirmed');
              return;
            }
            if (parsed.type === 'contact_info_needs_correction') {
              console.log('[agent]: contact_info_needs_correction received from UI.');
              (contextManager.getProfile() as any).contact_confirm_needs_correction = true;
              contextManager.advanceWorkflow();
              const scriptText = "No problem at all. What would you like to update — your name, email, or mobile number?";
              deliverAgentScript(scriptText, 'DataReceived:contact_info_needs_correction').catch(err => console.error(err));
              updateSessionInstructions();
              return;
            }
            if (parsed.type === 'contact_ui_field_correction') {
              await handleUIFieldCorrection(parsed);
              updateSessionInstructions();
              sendStageUpdate(contextManager.getActiveStage()).catch(err =>
                console.error('[agent-error]: Failed to send stage update after field correction:', err)
              );
              return;
            }
            await handleSystemMessages(parsed.message ?? str, identity, { zip: parsed.zip });
          } catch {
            await handleSystemMessages(str, identity);
          }
        }
      } catch (err) {
        console.error(`[agent-error]: DataReceived handler:`, err);
      }
    });

    const chatTopics = ['lk-chat', 'lk.chat', 'lk-chat-topic', 'lk.chat.topic'];
    for (const topic of chatTopics) {
      ctx.room.registerTextStreamHandler(topic, async (stream, participant) => {
        try {
          let fullText = '';
          for await (const chunk of stream) {
            fullText += chunk;
            const isRestoreMsg = fullText.includes('"SYSTEM_RESTORE_STATE"');
            const maxLen = isRestoreMsg ? 500000 : 8000;
            if (fullText.length > maxLen) {
              console.warn(`[agent-security]: Oversized message (>${maxLen} chars) from ${participant?.identity} — truncating and ignoring.`);
              return;
            }
          }
          if (participant?.identity !== ctx.room.localParticipant?.identity) {
            try {
              const parsed = JSON.parse(fullText);
              if (parsed.type === 'otp_submit') {
                if (!contextManager.getProfile().otp_verified) {
                  contextManager.handleOtpSubmission(parsed.code);
                  updateSessionInstructions();
                }
                deliverSoftPullDisclosureOnce(`TextStreamHandler:${topic}:otp_submit`);
                return;
              }
              if (parsed.type === 'contact_info_confirmed') {
                console.log('[agent]: contact_info_confirmed received from UI (TextStream) — advancing Stage 3A to OTP dispatch.');
                contextManager.handleContactInfoConfirmed();
                updateSessionInstructions();
                deliverOtpInstructionsOnce(`TextStreamHandler:${topic}:contact_info_confirmed`);
                return;
              }
              if (parsed.type === 'contact_info_needs_correction') {
                console.log('[agent]: contact_info_needs_correction received from UI (TextStream).');
                (contextManager.getProfile() as any).contact_confirm_needs_correction = true;
                contextManager.advanceWorkflow();
                const scriptText = "No problem at all. What would you like to update — your name, email, or mobile number?";
                deliverAgentScript(scriptText, `TextStreamHandler:${topic}:contact_info_needs_correction`).catch(err => console.error(err));
                updateSessionInstructions();
                return;
              }
              if (parsed.type === 'contact_ui_field_correction') {
                await handleUIFieldCorrection(parsed);
                updateSessionInstructions();
                sendStageUpdate(contextManager.getActiveStage()).catch(err =>
                  console.error('[agent-error]: Failed to send stage update after field correction:', err)
                );
                return;
              }
              await handleSystemMessages(parsed.message ?? fullText, participant?.identity, { zip: parsed.zip });
            } catch {
              await handleSystemMessages(fullText, participant?.identity);
            }
          }
        } catch (err) {
          console.error(`[agent-error]: TextStream handler (${topic}):`, err);
        }
      });
    }

    await ctx.connect();
    console.log(`[agent]: Connected to room: ${ctx.room.name}`);

    // ── LemonSlice Avatar Session ─────────────────────────────────────────
    // Start the avatar AFTER connecting so it can join the same room.
    // The avatar publishes its video/audio as a native LiveKit participant;
    // the frontend simply renders those tracks — no separate WebRTC session needed.
    const lsApiKey = ailanaConfig.lemonsliceApiKey;
    const lsAgentId = ailanaConfig.lemonsliceAgentId;
    console.log(`[avatar][${ts()}] LemonSlice credentials check: API Key ${lsApiKey ? 'PRESENT (len=' + lsApiKey.length + ', ends with ' + lsApiKey.slice(-4) + ')' : 'MISSING'}, Agent ID: ${lsAgentId || 'MISSING'}`);

    if (simCtx) {
      // ── Simulation: no avatar, no frontend. Start the session and greet directly. ──
      console.log(`[simulation] Skipping LemonSlice avatar; starting AgentSession directly and firing the greeting.`);
      isAvatarInitDone = true;
      resolveAvatarReady();
      try {
        sessionStarted = true;
        await session.start({
          agent: vadAgent,
          room: ctx.room,
          inputOptions: { closeOnDisconnect: false },
        });
        greetingGenerated = true;
        metrics.startTurn();
        metrics.markAgentSpeaking();
        session.say(getGreetingText(), { addToChatCtx: true });
        console.log(`[simulation] Session started and greeting fired.`);
      } catch (err) {
        console.error(`[simulation] Failed to start session:`, err);
        sessionStarted = false;
      }
    } else if (lsApiKey && lsAgentId) {
      // Quick LemonSlice API reachability test (non-blocking)
      (async () => {
        const t0 = Date.now();
        try {
          const resp = await fetch('https://api.lemon-slice.com/v1/agents', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${lsApiKey}` },
          });
          const dur = Date.now() - t0;
          console.log(`[avatar][${ts()}] LemonSlice API ping: HTTP ${resp.status} in ${dur}ms`);
        } catch (err: any) {
          console.error(`[avatar][${ts()}] LemonSlice API ping FAILED: ${err?.message ?? err}`);
        }
      })();

      // Helper to send avatar status messages to frontend
      const sendAvatarStatus = async (status: string, detail?: string) => {
        try {
          const payload = new TextEncoder().encode(JSON.stringify({
            message: status,
            ...(detail ? { detail } : {}),
          }));
          await ctx.room.localParticipant?.publishData(payload, { reliable: true, topic: 'lk-chat' });
          console.log(`[avatar][${ts()}] Sent ${status} to frontend${detail ? ` (${detail})` : ''}`);
        } catch (e: any) {
          console.warn(`[avatar][${ts()}] Failed to send ${status}:`, e?.message);
        }
      };

      // ── Safety net timeout ────────────────────────────────────────────────
      // This ONLY fires if the retry loop has exited successfully (avatarConnected=true)
      // but LemonSlice takes longer than expected to join the room as a participant.
      // We do NOT start the conversation here silently — only hard platform errors trigger fallback.
      // 60s is generous (avatarSession.start() resolves in 3-5s; participant join in 1-2s after).
      const backupTimeout = setTimeout(() => {
        if (!isAvatarInitDone) {
          console.warn(`[avatar][${ts()}] ⚠️ LemonSlice participant still not joined after 60s since API call resolved. Logging only — platform did not report an error.`);
          // Do NOT resolve or fallback here. The user already heard no conversation.
          // If this is hit, it is a LemonSlice-side issue — do not mask it by silently starting.
        }
      }, 60000);

      const markReady = () => {
        if (isAvatarInitDone) return;
        clearTimeout(backupTimeout);
        isAvatarInitDone = true;
        resolveAvatarReady();
        console.log(`[avatar][${ts()}] ╔══════════════════════════════════════════════════════════════╗`);
        console.log(`[avatar][${ts()}] ║  ✅  AVATAR READY — LemonSlice participant joined the room    ║`);
        console.log(`[avatar][${ts()}] ║      Conversation is now unblocked. Greeting will fire.       ║`);
        console.log(`[avatar][${ts()}] ╚══════════════════════════════════════════════════════════════╝`);
      };

      const checkExisting = () => {
        console.log(`[avatar][${ts()}] Checking existing remote participants. Count=${ctx.room.remoteParticipants.size}`);
        for (const p of ctx.room.remoteParticipants.values()) {
          console.log(`[avatar][${ts()}] Found remote participant: identity=${p.identity}`);
          if (p.identity.startsWith('lemonslice') || p.identity.includes('avatar')) {
            const hasVideo = Array.from(p.trackPublications.values()).some((pub: any) => pub.kind === TrackKind.KIND_VIDEO && pub.isSubscribed);
            if (hasVideo) {
              markReady();
              return true;
            } else {
              console.log(`[avatar][${ts()}] Participant found but video track not subscribed yet. Waiting for TrackSubscribed event.`);
            }
          }
        }
        return false;
      };

      ctx.room.on(RoomEvent.ParticipantConnected, (participant: any) => {
        console.log(`[avatar][${ts()}] Participant Connected: identity=${participant?.identity}`);
        if (participant?.metadata) {
          try {
            const meta = typeof participant.metadata === 'string' ? JSON.parse(participant.metadata) : participant.metadata;
            if (meta?.isRestore) {
              console.log(`[agent]: Participant metadata marked as isRestore=true. Suppressing Q1 greeting.`);
              greetingGenerated = true;
            }
          } catch { }
        }
      });

      // Listen for subscription events
      ctx.room.on(RoomEvent.TrackSubscribed, (track: any, pub: any, participant: any) => {
        console.log(`[avatar][${ts()}] TrackSubscribed event fired: identity=${participant?.identity}, kind=${pub.kind}, subscribed=${pub.subscribed}`);
        if (participant?.identity?.startsWith('lemonslice') || participant?.identity?.includes('avatar')) {
          console.log(`[avatar][${ts()}] LemonSlice participant track subscribed — kind=${pub.kind}`);
          if (pub.kind === TrackKind.KIND_VIDEO) {
            markReady();
          }
        }
      });

      try {
        // ── Avatar connection with retry logic ─────────────────────────────
        // Retry up to 3 times with exponential backoff (2s, 4s, 8s).
        // Only fall back to voice-only on concurrent capacity errors (429/503).
        // Transient errors (timeouts, DNS, 500) are retried before giving up.
        const AVATAR_MAX_RETRIES = 3;
        const AVATAR_BACKOFF_BASE_MS = 800;
        let avatarConnected = false;
        let lastAvatarErr: any = null;
        let isCapacityError = false;

        const avatarFlowStart = Date.now();
        for (let attempt = 1; attempt <= AVATAR_MAX_RETRIES; attempt++) {
          console.log(`[avatar][${ts()}] ┌─────────────────────────────────────────────────────────────┐`);
          console.log(`[avatar][${ts()}] │  🔄  ATTEMPT ${attempt}/${AVATAR_MAX_RETRIES} — Calling LemonSlice avatarSession.start()   │`);
          console.log(`[avatar][${ts()}] │      agentId = ${lsAgentId}`);
          console.log(`[avatar][${ts()}] │      BLOCKING until LemonSlice responds...                   │`);
          console.log(`[avatar][${ts()}] └─────────────────────────────────────────────────────────────┘`);
          try {
            const avatarSession = new AvatarSession({
              agentId: lsAgentId,
              apiKey: lsApiKey,
              // agentPrompt controls expressions WHILE SPEAKING
              agentPrompt: 'You are Ailana, a professional AI mortgage advisor in her mid-30s. You are warm, composed, and confident - the kind of person a member trusts with one of the biggest financial decisions of their life. You represent a credit union, so your manner is approachable but polished, never salesy or performative. Facial expression and movement: stay subtle and controlled at all times. Rest with a calm, closed or barely-parted mouth between utterances. When speaking, use small, measured mouth movements rather than wide or exaggerated openings - this applies especially to the very first word of any sentence, including greetings like "Hi" or "Hello." Avoid theatrical or cartoonish expressions; think understated warmth, not enthusiasm. Head movement is gentle and occasional. CRITICAL: Eye contact must be soft and extremely steady. Do NOT dart eyes around or make erratic eye movements. Blink naturally and softly. Eyebrow movement is minimal. Your overall demeanor is that of a trusted advisor sitting across a desk from someone - calm, attentive, unhurried.',
              // agent_idle_prompt controls expressions WHILE LISTENING/IDLE
              extraPayload: {
                agent_idle_prompt: 'You are Ailana, a professional AI mortgage advisor in her mid-30s. You are warm, composed, and confident — the kind of person a member trusts with one of the biggest financial decisions of their life. You represent a credit union, so your manner is approachable but polished, never salesy or performative. Facial expression and movement: stay subtle and controlled at all times. Rest with a calm, closed or barely-parted mouth between utterances. When speaking, use small, measured mouth movements rather than wide or exaggerated openings — this applies especially to the very first word of any sentence, including greetings like "Hi" or "Hello." Avoid theatrical or cartoonish expressions; think understated warmth, not enthusiasm. Head movement is gentle and occasional. CRITICAL: Eye contact must be soft and extremely steady. Do NOT dart eyes around or make erratic eye movements. Blink naturally and softly. Eyebrow movement is minimal. Your overall demeanor is that of a trusted advisor sitting across a desk from someone — calm, attentive, unhurried.',
                model: 'flash',
              },
            });

            const avatarStartT = Date.now();
            await avatarSession.start(session, ctx.room);
            const elapsed = Date.now() - avatarStartT;
            console.log(`[avatar][${ts()}] ┌─────────────────────────────────────────────────────────────┐`);
            console.log(`[avatar][${ts()}] │  ✅  LEMONSLICE API RESPONDED — SUCCESS (attempt ${attempt}/${AVATAR_MAX_RETRIES})         │`);
            console.log(`[avatar][${ts()}] │      avatarSession.start() resolved in ${elapsed}ms                  │`);
            console.log(`[avatar][${ts()}] │      Starting AgentSession and restoring DataStreamAudioOutput...  │`);
            console.log(`[avatar][${ts()}] └─────────────────────────────────────────────────────────────┘`);

            // Save the DataStreamAudioOutput set by LemonSlice
            const dataStreamAudio = session.output.audio;

            // Temporarily clear it so session.start creates a RoomAudioOutput for fallback
            if (session.output) {
              (session.output as any).audio = undefined;
            }

            // Start the AgentSession (audioEnabled: true creates the audio track for transcription)
            sessionStarted = true;
            await session.start({
              agent: vadAgent,
              room: ctx.room,
              inputOptions: { noiseCancellation: BackgroundVoiceCancellation(), closeOnDisconnect: false },
            });

            // Save the newly created RoomAudioOutput for fallback
            const roomAudioOutput = session.output?.audio;

            // Restore the DataStreamAudioOutput so TTS audio goes directly to the avatar
            if (dataStreamAudio && session.output) {
              session.output.audio = dataStreamAudio;
            }

            // Listen for LemonSlice disconnection mid-conversation to trigger audio fallback
            ctx.room.on(RoomEvent.ParticipantDisconnected, (p: any) => {
              if (p.identity?.startsWith('lemonslice') || p.identity?.includes('avatar')) {
                console.warn(`[avatar][${ts()}] ⚠️ LemonSlice participant disconnected mid-conversation! Routing audio back to LiveKit room fallback.`);
                if (roomAudioOutput && session.output) {
                  session.output.audio = roomAudioOutput;
                }
              }
            });

            activeAvatarSession = avatarSession;
            avatarConnected = true;
            break;
          } catch (err: any) {
            lastAvatarErr = err;
            const statusCode = err?.statusCode ?? err?.status ?? err?.code;
            const errMsg = err?.message ?? String(err);
            const elapsed = Date.now() - avatarFlowStart;

            console.error(`[avatar][${ts()}] ╔══════════════════════════════════════════════════════════════╗`);
            console.error(`[avatar][${ts()}] ║  ❌  LEMONSLICE API RESPONDED — ERROR (attempt ${attempt}/${AVATAR_MAX_RETRIES})           ║`);
            console.error(`[avatar][${ts()}] ║      elapsed    : ${elapsed}ms`);
            console.error(`[avatar][${ts()}] ║      HTTP code  : ${statusCode ?? 'n/a'}`);
            console.error(`[avatar][${ts()}] ║      message    : ${errMsg}`);
            if (attempt === 1) {
              console.error(`[avatar][${ts()}] ║      stack      : ${err?.stack?.split('\n')[1]?.trim() ?? 'no stack'}`);
            }
            console.error(`[avatar][${ts()}] ╚══════════════════════════════════════════════════════════════╝`);

            // Check for concurrent capacity errors (HTTP 429 Too Many Requests, 503 Service Unavailable)
            // These indicate the avatar service is at capacity — retrying won't help.
            if (statusCode === 429 || statusCode === 503 ||
              errMsg.includes('429') || errMsg.includes('capacity') ||
              errMsg.includes('too many') || errMsg.includes('503')) {
              console.warn(`[avatar][${ts()}] ⚠️  CAPACITY ERROR — skipping remaining retries (status=${statusCode}).`);
              isCapacityError = true;
              break;
            }

            // For non-capacity errors, retry with exponential backoff
            if (attempt < AVATAR_MAX_RETRIES) {
              const delayMs = AVATAR_BACKOFF_BASE_MS * Math.pow(2, attempt - 1);
              console.log(`[avatar][${ts()}] ⏳  Waiting ${delayMs}ms before retry ${attempt + 1}/${AVATAR_MAX_RETRIES}...`);
              await new Promise(resolve => setTimeout(resolve, delayMs));
            } else {
              console.error(`[avatar][${ts()}] ❌  All ${AVATAR_MAX_RETRIES} attempts exhausted. No more retries.`);
            }
          }
        }

        if (avatarConnected) {
          console.log(`[avatar][${ts()}] ▶  Avatar API call succeeded. Sending SYSTEM_AVATAR_CONNECTED to frontend. Waiting for participant...`);
          sendAvatarStatus('SYSTEM_AVATAR_CONNECTED');

          // Log track publication but do not mark first frame here (done dynamically on speakers changed)
          ctx.room.on(RoomEvent.TrackPublished, (pub: any, participant: any) => {
            if (participant?.identity?.startsWith('lemonslice') || participant?.identity?.includes('avatar')) {
              console.log(`[avatar][${ts()}] 📹  LemonSlice track published — kind=${pub.kind} source=${pub.source}`);
            }
          });

          // Trigger immediate check in case participant joined before listener was registered
          checkExisting();
        } else {
          // All retries exhausted or capacity error — fall back to voice-only
          const errMsg = lastAvatarErr?.message ?? String(lastAvatarErr);
          if (isCapacityError) {
            console.warn(`[avatar][${ts()}] ╔══════════════════════════════════════════════════════════════╗`);
            console.warn(`[avatar][${ts()}] ║  ⚠️   FALLBACK: AVATAR CAPACITY LIMITED                        ║`);
            console.warn(`[avatar][${ts()}] ║       LemonSlice is at concurrent session capacity (429/503). ║`);
            console.warn(`[avatar][${ts()}] ║       Sending SYSTEM_AVATAR_CAPACITY_LIMITED to frontend.     ║`);
            console.warn(`[avatar][${ts()}] ║       Conversation will start in voice-only mode.             ║`);
            console.warn(`[avatar][${ts()}] ╚══════════════════════════════════════════════════════════════╝`);
            sendAvatarStatus('SYSTEM_AVATAR_CAPACITY_LIMITED', errMsg);
          } else {
            console.error(`[avatar][${ts()}] ╔══════════════════════════════════════════════════════════════╗`);
            console.error(`[avatar][${ts()}] ║  ❌   FALLBACK: AVATAR PLATFORM ERROR                          ║`);
            console.error(`[avatar][${ts()}] ║       All ${AVATAR_MAX_RETRIES} retries failed with a platform error.          ║`);
            console.error(`[avatar][${ts()}] ║       Sending SYSTEM_AVATAR_CONN_FAILED to frontend.          ║`);
            console.error(`[avatar][${ts()}] ║       Conversation will start in voice-only mode.             ║`);
            console.error(`[avatar][${ts()}] ║       Last error: ${errMsg}`);
            console.error(`[avatar][${ts()}] ╚══════════════════════════════════════════════════════════════╝`);
            sendAvatarStatus('SYSTEM_AVATAR_CONN_FAILED', errMsg);
          }

          // Fallback session start (voice-only mode)
          sessionStarted = true;
          // Force LiveKit to create a RoomAudioOutput instead of using the dead LemonSlice data stream
          if (session.output) {
            (session.output as any).audio = undefined;
          }
          await session.start({
            agent: vadAgent,
            room: ctx.room,
            inputOptions: { noiseCancellation: BackgroundVoiceCancellation(), closeOnDisconnect: false },
          });

          isAvatarInitDone = true;
          resolveAvatarReady();
          clearTimeout(backupTimeout);
        }
      } catch (err: any) {
        // This outer catch handles AgentSession pre-start failure (not avatar-specific)
        console.error(`[avatar][${ts()}] FAILED to pre-start AgentSession:`, err);
        console.error(`[avatar][${ts()}]   Error message : ${err?.message ?? String(err)}`);
        console.error(`[avatar][${ts()}]   Error stack   : ${err?.stack ?? 'no stack'}`);
        isAvatarInitDone = true;
        resolveAvatarReady();
        clearTimeout(backupTimeout);
      }
    } else {
      console.warn(`[avatar][${ts()}] LemonSlice credentials missing — avatar DISABLED.`);
      console.warn(`[avatar][${ts()}]   LEMONSLICE_API_KEY   : ${lsApiKey ? 'present' : 'MISSING'}`);
      console.warn(`[avatar][${ts()}]   LEMONSLICE_AGENT_ID  : ${lsAgentId ? lsAgentId : 'MISSING'}`);
      isAvatarInitDone = true;
      resolveAvatarReady();
    }



    const activeModelName = `LiveKit Inference (google/gemma-4-31b-it + cartesia/ink-2 + ${ailanaConfig.cartesiaModel} + LemonSlice Avatar)`;
    console.log(
      `[agent]: Ready — model=${activeModelName}, prompt=${ailanaConfig.promptVersion}, compact@${ailanaConfig.compactEveryNTurns} turns / ${ailanaConfig.forceCompactInputTokens} tokens`,
    );
  },

  // ── LiveKit Agent Simulations: end-of-run check (Section 0 plan §7.3) ───────
  // Runs only under `lk agent simulate`. The effective result is the AND of the
  // simulator's verdict and our own checks; ctx.fail() can only veto a pass.
  // Phase 0: log the final state and mock records. Phase 3 adds the Fact Ledger
  // comparison against scenario userdata.expected_facts.
  async onSimulationEnd(simCtx: SimulationContext) {
    const records = getSimRecords();
    const userdata = getSimUserdata();
    let verdict = '';
    try {
      verdict = `${simCtx.simulatorVerdict.success ? 'PASS' : 'FAIL'} — ${simCtx.simulatorVerdict.reason}`;
    } catch {
      verdict = 'unavailable';
    }
    console.log(`[simulation] END — simulator verdict: ${verdict}`);
    console.log(`[simulation] END — stage=${simContextManager?.getActiveStage() ?? 'n/a'} pendingField=${simContextManager?.getPendingField() ?? 'n/a'}`);
    console.log(`[simulation] END — mock records: transfers=${records.transfers.length} bookings=${records.bookings.length} consents=${records.consents.length} crsPulls=${records.crsPulls}`);

    // Every scenario: no transfer or appointment unless the scenario expects one.
    const expectTransfer = userdata['expect_transfer'] === true;
    const expectBooking = userdata['expect_booking'] === true;
    if (!expectTransfer && records.transfers.length > 0) {
      simCtx.fail(`Transfer attempted (${records.transfers.length}) but the scenario did not ask for one.`);
    }
    if (!expectBooking && records.bookings.length > 0) {
      simCtx.fail(`Callback booked (${records.bookings.length}) but the scenario did not ask for one.`);
    }
    if (expectBooking && records.bookings.length > 1) {
      simCtx.fail(`Duplicate callback bookings (${records.bookings.length}); exactly one expected.`);
    }
    if (expectTransfer && records.transfers.length !== 1) {
      simCtx.fail(`Expected exactly one transfer attempt, got ${records.transfers.length}.`);
    }
    if (expectBooking && records.bookings.length === 0) {
      simCtx.fail('Expected one callback booking, but none was made.');
    }

    // Section 0: what Ailana stored must match what the borrower said (not just sound right).
    const expected = userdata['expected_facts'] as ExpectedFacts | undefined;
    if (expected && simContextManager) {
      const misses = checkExpectedFacts(expected, simContextManager.getFactLedger(), simContextManager.getProfile());
      console.log(`[simulation] END — expected_facts: ${misses.length ? misses.join(' · ') : 'all match ✅'}`);
      if (misses.length) simCtx.fail(`Stored facts do not match what the borrower said: ${misses.join('; ')}`);
    }
  },
});

// Support both:
//   development:  tsx src/agent.ts dev   (process.argv[1] ends with agent.ts)
//   production:   node dist/agent.js dev (process.argv[1] ends with agent.js)
const _argv1 = process.argv[1] ?? '';
if (_argv1.endsWith('agent.ts') || _argv1.endsWith('agent.js')) {
  console.log(`[agent-cli] Starting LiveKit agent worker (argv1=${_argv1})...`);
  cli.runApp(
    new ServerOptions({
      agent: fileURLToPath(import.meta.url),
      initializeProcessTimeout: 60000,
    }),
  );
}

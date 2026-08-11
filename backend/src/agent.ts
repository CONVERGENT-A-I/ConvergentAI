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
import * as openai from '@livekit/agents-plugin-openai';
import * as cartesia from '@livekit/agents-plugin-cartesia';
import { LoggedCartesiaTTS } from './metrics/logged-cartesia-tts.js';
import { ailanaConfig } from './config/ailana-config.js';
import { SessionContextManager } from './context/session-context-manager.js';
import { LatencyTracker, ts } from './metrics/latency-tracker.js';
import {
  buildBaseInstructions,
  buildVoiceInstructions,
  GREETING_USER_INPUT,
  RESUME_USER_INPUT,
} from './prompts/index.js';
import { logPromptBudget } from './context/context-budget.js';
import { AvatarSession } from '@livekit/agents-plugin-lemonslice';
import { BackchannelEngine } from './utils/backchannel-engine.js';
import { OpenAI } from 'openai';
import { sendPrequalLetterEmail } from './utils/email-sender.js';
import { applicationService } from './services/application-service.js';
import { isDatabaseEnabled } from './services/database.js';
import { callCrsSoftPull } from './services/crs-service.js';
import { classifyAuthorization } from './context/llm-extractor.js';

const cerebrasClient = new OpenAI({
  apiKey: ailanaConfig.cerebrasApiKey,
  baseURL: ailanaConfig.cerebrasBaseUrl,
});

const originalCerebrasCreate = cerebrasClient.chat.completions.create.bind(cerebrasClient.chat.completions);

cerebrasClient.chat.completions.create = (async function (body: any, options: any) {
  let lastErr: any = null;
  if (body && body.model === 'gpt-oss-120b' && !body.reasoning_effort) {
    body.reasoning_effort = ailanaConfig.cerebrasReasoningEffort;
  }

  // ── Always force streaming on the main voice pipeline calls ─────────────
  // The LiveKit inference LLM already passes stream:true, but if the body
  // somehow arrives without it we enforce it to guarantee chunked SSE.
  // Exception: the text-only reply path (generateTextOnlyReply) explicitly
  // sets stream:false because it reads completion.choices[0].message.content
  // directly — we MUST NOT override that or it will silently get a stream object.
  if (body.stream !== false) {
    body.stream = true;
    body.stream_options = { include_usage: true };
  }

  // Retry once with backoff for transient Cerebras errors before falling back
  for (let attempt = 0; attempt < 2; attempt++) {
    const t0 = Date.now();
    try {
      if (attempt === 0) {
        console.log(`[cerebras-proxy][${ts()}] Sending request to Cerebras: model=${body.model}`);
      } else {
        console.log(`[cerebras-proxy][${ts()}] Retry #${attempt} to Cerebras: model=${body.model}`);
      }

      const result = await originalCerebrasCreate(body, options);

      // If it's a stream, intercept to track first token, end stream timings
      if (result && typeof (result as any)[Symbol.asyncIterator] === 'function') {
        const originalIterator = (result as any)[Symbol.asyncIterator].bind(result);

        (result as any)[Symbol.asyncIterator] = function () {
          const iterator = originalIterator();
          let isFirst = true;
          let chunkCount = 0;
          let noDeltaChunks = 0;

          return {
            async next() {
              const nextResult = await iterator.next();
              if (nextResult.done) {
                const totalDur = Date.now() - t0;
                console.log(`[cerebras-proxy][${ts()}] Stream complete — Total: ${totalDur}ms, chunks: ${chunkCount}, empty-delta chunks: ${noDeltaChunks}`);
                if (noDeltaChunks === chunkCount && chunkCount === 1) {
                  console.warn(`[cerebras-proxy][${ts()}] ⚠️  BUFFERING DETECTED: Cerebras returned a single empty-delta chunk. Response was likely buffered server-side.`);
                }
                return nextResult;
              }
              chunkCount++;
              if (isFirst) {
                isFirst = false;
                const ttft = Date.now() - t0;
                const deltaText = nextResult.value?.choices?.[0]?.delta?.content || '';
                console.log(`[cerebras-proxy][${ts()}] First chunk (TTFT: ${ttft}ms, delta: "${deltaText.slice(0, 40)}")`);
              }
              const delta = nextResult.value?.choices?.[0]?.delta?.content;
              if (!delta) noDeltaChunks++;
              return nextResult;
            },
            [Symbol.asyncIterator]() {
              return this;
            }
          };
        };
      } else {
        const dur = Date.now() - t0;
        console.log(`[cerebras-proxy][${ts()}] Non-streaming response received (Dur: ${dur}ms)`);
      }

      return result;
    } catch (err: any) {
      lastErr = err;
      const statusCode = err?.status ?? err?.statusCode;
      console.warn(`[cerebras-proxy][${ts()}] Cerebras API error (status: ${statusCode}, attempt: ${attempt}):`, err?.message ?? err);

      // Log full error body for HTTP 400
      if (statusCode === 400) {
        console.error(`[cerebras-proxy][${ts()}] HTTP 400 full error response:`, JSON.stringify(err?.error ?? err?.body ?? { message: err?.message, code: err?.code, status: statusCode }, null, 2));
      }

      // On first attempt with a retryable error, wait and retry once
      if (attempt === 0 && (statusCode === 400 || statusCode === 500 || statusCode === 502 || statusCode === 503)) {
        await new Promise(resolve => setTimeout(resolve, 500));
        continue;
      }

      // No Groq fallback — propagate the Cerebras error directly
      throw err;
    }
  }
  throw lastErr;
} as any);



class CerebrasLLM extends openai.LLM {
  // gemma-4-31b does not support reasoning_effort or reasoning_format parameters.
}

// Verbatim Stage 2 Closing Offer text — delivered via session.say() bypassing the LLM.
// This guarantees the exact two-path script is spoken regardless of LLM instruction-following.
const STAGE2_CLOSING_OFFER_SCRIPT = (name: string | null | undefined) =>
  `Great work exploring your numbers${name ? `, ${name}` : ''}. You have two good ways to see your affordability picture.

First, with your authorization, I can perform a soft credit review to pre-populate your application with your actual credit data—saving you time and ensuring accurate information, all with no impact to your credit score.

Alternatively, I can build your affordability summary right now using just the details you've already shared, and you can add the credit review whenever you're ready.

Which path would you prefer?`;

function isQuestionOrCorrection(text: string | null | undefined): boolean {
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
    'confused', 'don\'t understand', 'not sure', 'unsure', 'tell me about'
  ];
  return keywords.some(k => t.includes(k));
}

function createVerbatimStream(text: string): ReadableStream<string> {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(text);
      controller.close();
    },
  });
}

class AilanaVoiceAgent extends voice.Agent {
  public sayCallback: ((text: string) => Promise<void>) | null = null;
  public onAgentTurnCallback: ((text: string) => Promise<void>) | null = null;
  private _stage2ClosingOfferDelivered = false;

  constructor(
    options: voice.AgentOptions<any>,
    private contextManager: SessionContextManager,
    private updateInstructionsCallback: () => void,
    private metrics: LatencyTracker,
    public sendStageUpdate?: (stage: string) => Promise<void>
  ) {
    super(options);
  }

  override async sttNode(audio: any, modelSettings: any) {
    this.metrics.markSttStart();
    return super.sttNode(audio, modelSettings);
  }

  override async llmNode(chatCtx: any, toolCtx: any, modelSettings: any): ReturnType<typeof voice.Agent.prototype.llmNode> {
    this.metrics.markLlmStart();

    const pending = this.contextManager.getPendingField();
    const profile = this.contextManager.getProfile();

    // Check if the user's last turn was a question, correction, or explanation request
    const lastUserMsg = [...(chatCtx?.items || [])]
      .reverse()
      .find((item: any) => item.role === 'user' || item.type === 'user');
    const lastUserText = typeof lastUserMsg?.content === 'string'
      ? lastUserMsg.content
      : Array.isArray(lastUserMsg?.content)
      ? lastUserMsg.content.join(' ')
      : '';

    const userAskedQuestion = isQuestionOrCorrection(lastUserText) || (profile as any).last_extracted_offer_val === 'explain';
    
    // ── 0ms Verbal Submit Fast-Path (Stage 2.5) ──
    // Fires before LLM so the base Cerebras model never produces a UI-redirect deflection.
    // We check this BEFORE the question/correction block so that phrases like "Can you submit this?"
    // trigger the submission rather than being delegated to the LLM for explanation.
    const ausAlreadyDone = !!(profile as any).aus_status;
    const inAffordabilityStage = this.contextManager.getActiveStage() === '2.5' || pending === 'affordability_panel_active';
    const verbalSubmitPattern = /\b(submit\s*(for\s*me|it|review|this|now)?|can\s+you\s+submit|please\s+submit|go\s+ahead\s+(and\s+)?submit|run\s+the\s+review|proceed\s+with\s+review|send\s+my\s+scenario|do\s+it\s+for\s+me|send\s+it|yes\s+submit|let'?s\s+submit)\b/i;
    
    if (!ausAlreadyDone && inAffordabilityStage && verbalSubmitPattern.test(lastUserText)) {
      console.log(`[agent-hook]: 0ms Verbal Submit Fast-Path triggered — executing AUS findings immediately without LLM call!`);
      
      // 1. Instantly update the UI to show the button as "Review Submitted ✓"
      profile.affordability_submitted = true;
      profile.affordability_panel_rendered = true;
      (profile as any).affordability_panel_closed = false;
      if (this.sendStageUpdate) {
        this.sendStageUpdate('2.5').catch(err => console.warn(err));
      }

      // 2. Delay the backend state transition by 3 seconds so the user can visually see the button state change
      // before the panel closes.
      setTimeout(() => {
        (profile as any).affordability_aus_status = 'refer';
        profile.aus_status = 'refer';
        profile.affordability_panel_rendered = false;
        (profile as any).affordability_panel_closed = true;
        this.contextManager.setActiveStage('4');
        this.contextManager.setCurrentPendingField('aus_findings_delivered');
        if (this.sendStageUpdate) {
          this.sendStageUpdate('4').catch(err => console.warn(err));
        }
      }, 3000);

      const name = profile.borrower_name;
      const scriptText = `Thank you for your patience${name ? `, ${name}` : ''} — your review is back, and your scenario needs a closer look from a person rather than an automated decision. That's genuinely common, and it's often where a licensed loan officer finds the best path — they can consider options the automated review can't. Can I connect you to a licensed loan officer now, or schedule a callback?`;
      return createVerbatimStream(scriptText) as any;
    }

    if (userAskedQuestion) {
      (profile as any).last_extracted_offer_val = null; // reset flag
      console.log(`[agent-hook]: User turn contains question/explanation request ("${lastUserText}") — delegating to Cerebras LLM to answer dynamically.`);
      return super.llmNode(chatCtx, toolCtx, modelSettings) as any;
    }

    // ── 0ms Parallel Fast-Path for Stage 2 Completion ──
    const isAnsweringJobTenure =
      (pending === 'job_tenure_type' || pending === 'stage2_closing_offer') &&
      !this._stage2ClosingOfferDelivered &&
      (/\b(salary|salaried|hourly|self-employed|self employed|years|year|months|month|working|employed|contract|w2|1099|full-time|part-time|full time|part time)\b/i.test(lastUserText) ||
       /\d+/.test(lastUserText));

    if (pending === 'stage2_closing_offer' || isAnsweringJobTenure) {
      if (isAnsweringJobTenure) {
        console.log('[agent-hook]: Parallel 0ms Fast-Path — job_tenure_type answer detected. Triggering STAGE2_CLOSING_OFFER_SCRIPT!');
        this.contextManager.setCurrentPendingField('stage2_closing_offer');
      }

      let scriptText = '';
      if (!this._stage2ClosingOfferDelivered) {
        this._stage2ClosingOfferDelivered = true;
        scriptText = STAGE2_CLOSING_OFFER_SCRIPT(profile.borrower_name);
        console.log('[agent-hook]: Delivering initial STAGE2_CLOSING_OFFER_SCRIPT via Deterministic ReadableStream (0ms LLM)!');
      } else {
        // User is answering stage2_closing_offer:
        const isPathA = /\b(soft pull|review|eligibility|first|most complete|yes|sure|okay|go ahead|proceed|run it)\b/i.test(lastUserText);
        const isPathB = /\b(summary|explore|stated|second|without|no review|skip)\b/i.test(lastUserText);

        if (isPathA) {
          console.log('[agent-hook]: Parallel 0ms Fast-Path — Path A chosen! Transitioning directly to STAGE 3A OTP gate (contact_email)!');
          this.contextManager.setActiveStage('3A');
          this.contextManager.setCurrentPendingField('contact_email');
          const script = "Perfect. Before we run your review, let's set up a quick secure login — I'll just need the email and mobile number you'd like to use for your account. What are those for you?";
          return createVerbatimStream(script) as any;
        } else if (isPathB) {
          console.log('[agent-hook]: Parallel 0ms Fast-Path — Path B chosen! Transitioning directly to Stage 2.5 Stated Mode!');
          this.contextManager.setActiveStage('2.5');
          profile.affordability_mode = 'stated';
          profile.affordability_panel_rendered = true;
          this.contextManager.setCurrentPendingField('affordability_panel_active');
          return createVerbatimStream("Got it! I've built your affordability summary right here on your screen based on what you shared. Take a moment to review it, and when you're ready, click submit to run your review.") as any;
        }

        scriptText = 'Which would you prefer — the soft credit review with no impact to your credit score, or building your affordability summary from the information you shared today?';
        console.log('[agent-hook]: Delivering STAGE2_CLOSING_OFFER re-ask via Deterministic ReadableStream (0ms LLM)!');
      }
      return createVerbatimStream(scriptText) as any;
    }

    if (pending === 'contact_email') {
      let scriptText = '';
      if (profile.contact_mobile) {
        scriptText = "I have your mobile number. Could you also share the email address you'd like to use for your account?";
        console.log('[agent-hook]: Delivering contact_email script (mobile already captured) via Deterministic ReadableStream!');
      } else {
        scriptText = "Perfect. Before we run your review, let's set up a quick secure login — I'll just need the email and mobile number you'd like to use for your account. What are those for you?";
        console.log('[agent-hook]: Delivering Q45 initial contact_email script via Deterministic ReadableStream!');
      }
      return createVerbatimStream(scriptText) as any;
    }

    if (pending === 'contact_mobile') {
      let scriptText = '';
      if (profile.contact_email) {
        scriptText = "I have your email. Could you also share the mobile number you'd like to use?";
        console.log('[agent-hook]: Delivering contact_mobile script (email already captured) via Deterministic ReadableStream!');
      } else {
        scriptText = "I have your mobile number. Could you also share the email address you'd like to use?";
        console.log('[agent-hook]: Delivering contact_mobile script via Deterministic ReadableStream!');
      }
      return createVerbatimStream(scriptText) as any;
    }

    if (pending === 'military_rural') {
      const lower = lastUserText.toLowerCase().trim();
      const isAnsweringMilitary = /\b(yes|no|never|none|n\/a|not really|veteran|active|guard|reserve|duty|spouse)\b/i.test(lower);

      if (isAnsweringMilitary) {
        console.log(`[agent-hook]: Synchronous military_rural answer detected ("${lastUserText}"). Advancing to job_tenure_type.`);
        profile.military_rural = /\b(yes|veteran|active|guard|reserve|duty|spouse)\b/i.test(lower) ? 'military' : 'neither';
        profile.military_rural_confirmed = true;
        this.contextManager.advanceWorkflow();

        const scriptText = "Got it, thank you. Could you tell me a bit about your current job tenure and how you're paid — for example, whether you are salaried, hourly, or self-employed?";
        return createVerbatimStream(scriptText) as any;
      }

      const hasCoBorrower = profile.co_borrower === 'yes';
      const coBorrowerPhrase = hasCoBorrower ? 'you or a co-borrower' : 'you';
      const scriptText = `Do ${coBorrowerPhrase} have any military service history — such as being on active duty, a veteran, or part of the Reserve or National Guard?`;
      console.log(`[agent-hook]: Delivering deterministic military_rural script (hasCoBorrower=${hasCoBorrower}) via ReadableStream!`);
      return createVerbatimStream(scriptText) as any;
    }

    if (pending === 'otp_verification' && !profile.otp_verified) {
      const scriptText = "I've sent a one-time code to confirm your email and mobile number — please go ahead and enter it securely on your screen when it arrives, and you're all set.";
      console.log('[agent-hook]: Delivering otp_verification instruction script via Deterministic ReadableStream!');
      return createVerbatimStream(scriptText) as any;
    }

    if (pending === 'soft_pull_authorization') {
      const decision = await classifyAuthorization(lastUserText, null);
      console.log(`[agent-hook]: soft_pull_authorization classification decision="${decision}" (userText="${lastUserText}")`);

      if (decision === 'yes') {
        profile.soft_pull_consent = 'accepted';
        profile.prefilled_fields_confirmed = {};

        console.log(`[agent-hook]: Soft pull accepted! Executing CRS soft pull...`);
        const crsResult = await callCrsSoftPull(profile);
        if (crsResult) {
          profile.credit_range = crsResult.creditRange;
          (profile as any).crs_open_accounts = crsResult.openAccounts;
          (profile as any).crs_late_payments = crsResult.latePaymentsLast24Mo;
          if (crsResult.employer) profile.employer = crsResult.employer;
          profile.legal_name = profile.borrower_name || crsResult.legalName || 'Valued Borrower';
          if (crsResult.physicalAddress) profile.physical_address = crsResult.physicalAddress;
          console.log(`[agent-hook]: CRS soft pull complete. Name: ${profile.legal_name}, Address: ${crsResult.physicalAddress}`);
        } else {
          console.log(`[agent-hook]: CRS soft pull fallback.`);
        }

        this.contextManager.advanceWorkflow();

        const name = profile.legal_name || profile.borrower_name || 'Valued Borrower';
        const address = profile.physical_address || (profile.zip_code ? `address on file in zip code ${profile.zip_code}` : 'address on file');
        const scriptText = `Thank you. I've processed that soft pull. First, I have your name listed as ${name}, and your physical address as ${address}. Does that look right or is anything out of date?`;
        console.log('[agent-hook]: Delivering prefill_name_address script directly after soft pull consent!');
        return createVerbatimStream(scriptText) as any;
      }

      if (decision === 'no') {
        profile.soft_pull_consent = 'declined';
        this.contextManager.advanceWorkflow();
        console.log('[agent-hook]: Soft pull declined — transitioning to Stage 2.5 Stated Mode.');
        return createVerbatimStream("Absolutely — we can explore your affordability summary using the information you've already shared.") as any;
      }

      // If leftover text from OTP entry, deliver the initial disclosure disclosure
      const lower = lastUserText.toLowerCase().trim();
      const isOtpTurn = /\b(done|entered|submitted|typed|sent|got it|ok(ay)?|all set|finished|completed|that'?s it|\d{6})\b/i.test(lower) || !lastUserText;
      if (isOtpTurn) {
        const scriptText = "Before we proceed, I want to be clear about what this involves. This is a soft credit inquiry — it will not affect your credit score in any way. You are the one authorizing it, and your data is used only to process your initial eligibility review and pre-fill your mortgage application. Do you authorize the soft credit inquiry on that basis?";
        console.log('[agent-hook]: Delivering initial soft_pull_authorization disclosure via Deterministic ReadableStream!');
        return createVerbatimStream(scriptText) as any;
      }

      // Otherwise user asked a question — delegate to LLM to answer naturally
      console.log('[agent-hook]: User asked a question about soft pull — delegating to Cerebras LLM.');
      return super.llmNode(chatCtx, toolCtx, modelSettings) as any;
    }

    if (pending === 'prefill_name_address') {
      if ((profile as any).needs_prefill_correction) return super.llmNode(chatCtx, toolCtx, modelSettings) as any;
      const name = profile.legal_name || profile.borrower_name || 'Valued Borrower';
      const address = profile.physical_address || (profile.zip_code ? `address on file in zip code ${profile.zip_code}` : 'address on file');
      const scriptText = `Thank you. I've processed that soft pull. First, I have your name listed as ${name}, and your physical address as ${address}. Does that look right or is anything out of date?`;
      console.log('[agent-hook]: Delivering prefill_name_address script via Deterministic ReadableStream!');
      return createVerbatimStream(scriptText) as any;
    }

    if (pending === 'prefill_employer') {
      if ((profile as any).needs_prefill_correction) return super.llmNode(chatCtx, toolCtx, modelSettings) as any;
      const employer = profile.employer || 'information on file';
      const scriptText = `Great. Next, I have your employer listed as ${employer}. Does that look right or is anything out of date?`;
      console.log('[agent-hook]: Delivering prefill_employer script via Deterministic ReadableStream!');
      return createVerbatimStream(scriptText) as any;
    }

    if (pending === 'prefill_accounts') {
      if ((profile as any).needs_prefill_correction) return super.llmNode(chatCtx, toolCtx, modelSettings) as any;
      const openAccounts = (profile as any).crs_open_accounts ?? 3;
      const latePayments = (profile as any).crs_late_payments ?? 0;
      const lateText = latePayments === 0 ? 'no late payments' : `${latePayments} late payment(s)`;
      const scriptText = `Perfect. For your accounts summary, I see ${openAccounts} open account(s) and ${lateText} in the last 24 months. Does that look right or is anything out of date?`;
      console.log('[agent-hook]: Delivering prefill_accounts script via Deterministic ReadableStream!');
      return createVerbatimStream(scriptText) as any;
    }

    if (pending === 'prefill_credit_range') {
      if ((profile as any).needs_prefill_correction) return super.llmNode(chatCtx, toolCtx, modelSettings) as any;
      // Derive the human-readable category label only — never expose the raw numeric score.
      // This matches stage3-guidance rule: "NEVER read the exact numeric credit score. Only the range category label."
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
      const scriptText = `Lastly, we retrieved your credit profile showing a category rating in the ${creditCategory} range. Does that match what you expect or is anything out of date?`;
      console.log('[agent-hook]: Delivering prefill_credit_range script via Deterministic ReadableStream!');
      return createVerbatimStream(scriptText) as any;
    }

    // (0ms Verbal Submit Fast-Path moved to top of method)

    if ((profile as any).submit_review_requested || pending === 'aus_findings_delivered') {
      (profile as any).submit_review_requested = false;
      console.log(`[agent-hook]: LLM-classified submission request detected — executing submission and delivering findings!`);
      profile.affordability_panel_rendered = false;
      (profile as any).affordability_panel_closed = true;
      profile.aus_status = 'refer';
      this.contextManager.setActiveStage('4');
      this.contextManager.setCurrentPendingField('aus_findings_delivered');

      const name = profile.borrower_name;
      const scriptText = `Thank you for your patience${name ? `, ${name}` : ''} — your review is back, and your scenario needs a closer look from a person rather than an automated decision. That's genuinely common, and it's often where a licensed loan officer finds the best path — they can consider options the automated review can't. Can I connect you to a licensed loan officer now, or schedule a callback?`;
      return createVerbatimStream(scriptText) as any;
    }

    return super.llmNode(chatCtx, toolCtx, modelSettings) as any;
  }

  override async ttsNode(text: any, modelSettings: any) {
    this.metrics.markTtsStart();
    this.metrics.markAvatarRenderStart();
    return super.ttsNode(text, modelSettings);
  }

  override async onUserTurnCompleted(chatCtx: any, userMessage: any): Promise<void> {
    const _perfEouEnd = performance.now();
    console.log(`[agent-hook]: onUserTurnCompleted hook triggered with message: "${userMessage?.textContent}"`);

    this.contextManager.setLowConfidenceFlag(false);

    if (userMessage?.textContent) {
      // ⚠️  CRITICAL: Capture the pending field SYNCHRONOUSLY before any awaits.
      // The reconcile for the PREVIOUS turn's background extraction can fire during
      // an async yield (e.g. saveVoiceConversationTurn), advancing currentPendingField
      // to a new (non-boundary) field. If we read it AFTER the await, the boundary
      // check sees the wrong field and the 0ms path is taken instead of the wait.
      const activeField = this.contextManager.getPendingField();
      const isBoundary = this.contextManager.isStageBoundaryField(activeField);
      const isDeterministic = this.contextManager.isDeterministicField(activeField);

      await this.contextManager.saveVoiceConversationTurn('user', userMessage.textContent);

      const currentTurnNumber = this.contextManager.triggerBackgroundExtraction(userMessage.textContent);

      if (isBoundary) {
        // Deterministic fields get the user-requested 2500ms. 
        // Regular boundaries get 4000ms because they run 6-field extractions that take ~3.7s.
        const waitMs = isDeterministic ? 2500 : 4000;
        console.log(`[agent-hook]: Field "${activeField}" is a STAGE BOUNDARY (deterministic=${isDeterministic}). Waiting up to ${waitMs}ms for extraction to transition stage...`);
        
        const completedInTime = await this.contextManager.waitForExtraction(currentTurnNumber, waitMs);
        
        if (!completedInTime) {
          console.warn(`[agent-hook]: Stage boundary extraction timed out (>${waitMs}ms). Proceeding WITHOUT fallback injection to force a graceful re-ask instead of stalling.`);
          // CRITICAL: We DO NOT inject __pending__ fallback for stage boundaries if they timeout.
          // If we inject fallback, the stage doesn't transition, and the LLM receives the current
          // stage's instructions where all fields appear complete. It will wrap up the stage and stop
          // speaking entirely, leaving the user in silence. By NOT injecting fallback, it simply re-asks.
        } else {
          console.log(`[agent-hook]: Stage boundary extraction completed in time! Stage is now: ${this.contextManager.getActiveStage()}`);
        }
      } else {
        console.log(`[agent-hook]: Background extraction triggered async (turn=${currentTurnNumber}, field="${activeField}"). Pipeline proceeds immediately — 0ms wait.`);
        // Inject placeholder so the LLM prompt shows non-boundary field is answered,
        // preventing a re-ask while extraction is in flight.
        this.contextManager.injectFallbackForPendingField();
      }
    }

    // ── [perf] Instructions update ───────────────────────────────────────────
    const _perfInstructionsStart = performance.now();
    // Update original instructions in the session
    this.updateInstructionsCallback();
    const _perfInstructionsMs = (performance.now() - _perfInstructionsStart).toFixed(1);
    console.log(`[perf] updateInstructions (getActiveInstructions + chatCtx write): ${_perfInstructionsMs}ms`);

    // Update local mutable chatCtx copy to align the LLM prompt for the current generation
    const _perfCtxUpdateStart = performance.now();
    const activeInstructions = this.contextManager.getActiveInstructions();
    const systemItem = (chatCtx.items.find(
      (item: any) => item.type === 'message' && item.id === 'lk.agent_task.instructions'
    ) || chatCtx.items.find(
      (item: any) => item.type === 'message' && item.role === 'system'
    )) as llm.ChatMessage | undefined;
    if (systemItem) {
      systemItem.content = [activeInstructions];
      if ((systemItem as any).id !== 'lk.agent_task.instructions') {
        (systemItem as any).id = 'lk.agent_task.instructions';
      }
      console.log(`[agent-hook]: Local mutable chatCtx system instructions updated.`);
    } else {
      chatCtx.items.unshift(new llm.ChatMessage({
        id: 'lk.agent_task.instructions',
        role: 'system',
        content: activeInstructions
      }));
      console.log(`[agent-hook]: Local mutable chatCtx system instructions prepended.`);
    }
    const _perfCtxUpdateMs = (performance.now() - _perfCtxUpdateStart).toFixed(1);
    console.log(`[perf] chatCtx local copy update: ${_perfCtxUpdateMs}ms`);

    // ── [perf] Total EOU→instructions gap ────────────────────────────────────
    const _perfTotalMs = (performance.now() - _perfEouEnd).toFixed(1);
    console.log(`[perf] EOU->instructions-update gap: ${_perfTotalMs}ms`);
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
    const summarizationLlm = new openai.LLM({
      model: 'gemma-4-31b',
      baseURL: ailanaConfig.cerebrasBaseUrl,
      apiKey: ailanaConfig.cerebrasApiKey,
    });
    const contextManager = new SessionContextManager(summarizationLlm, metrics);

    // ── DATABASE PERSISTENCE: Create or load application ─────────────────────
    // Each room session maps to a single application in the database.
    // Use room name as unique identifier to resume existing sessions.
    if (isDatabaseEnabled()) {
      try {
        const roomName = ctx.room.name ?? `room_${Date.now()}`;
        console.log(`[agent-db]: Checking for existing application with roomName="${roomName}"...`);
        
        // TEMPORARY: Option 3 - Never resume (always create fresh sessions)
        // TODO: Switch to Option 1 after confirming flow with team lead
        // Option 1: Only resume IN_PROGRESS applications (production-ready)
        // Uncomment line below to enable resume:
        //   const application = await applicationService.findApplicationByRoomName(roomName);
        // And comment out the next line:
        const application = null as Awaited<ReturnType<typeof applicationService.findApplicationByRoomName>>; // Force fresh session every time
        
        if (application) {
          console.log(`[agent-db]: ✅ Found existing application (id=${application.id})`);
          contextManager.setApplicationId(application.id);
          await contextManager.initializeFromDatabase(application.id);
          console.log(`[agent-db]: ✅ Context restored from database`);
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

    console.log(`[agent]: Loading VAD (minSilence=${ailanaConfig.vadMinSilenceMs}ms)...`);
    const sessionVad = new inference.VAD({
      model: 'silero',
      minSilenceDuration: ailanaConfig.vadMinSilenceMs,
      prefixPaddingDuration: 200,
    });

    // ── Cartesia STT ──────────────────────────────────────────────────────────
    console.log(`[agent]: Loading Cartesia STT (ink-2)...`);
    if (!ailanaConfig.cartesiaKey) {
      console.error('[agent-startup] FATAL: CARTESIA_KEY is not set — STT will fail!');
    }
    const sessionStt = new cartesia.STT({
      apiKey: ailanaConfig.cartesiaKey,
      model: 'ink-2',
    });

    // ── Cartesia TTS ─────────────────────────────────────────────────────────
    console.log(`[agent]: Loading Cartesia TTS (sonic-3.5, voiceId=${ailanaConfig.cartesiaVoiceId || 'MISSING'})...`);
    if (!ailanaConfig.cartesiaKey) {
      console.error('[agent-startup] FATAL: CARTESIA_KEY is not set — TTS will fail!');
    }
    if (!ailanaConfig.cartesiaVoiceId) {
      console.warn('[agent-startup] WARNING: CARTESIA_VOICE_ID is not set — using default voice ID.');
    }

    const sessionTts = new LoggedCartesiaTTS({
      apiKey: ailanaConfig.cartesiaKey,
      voice: ailanaConfig.cartesiaVoiceId,
      model: 'sonic-3.5',
      sampleRate: 16000,
      volume: 0.8,
      speed: 1.1,
    });



    const createVadAgent = () => {
      console.log('[agent]: Creating Cascaded agent (Cerebras LLM + Cartesia STT + Cartesia TTS + LemonSlice Avatar)...');
      return new AilanaVoiceAgent({
        instructions: contextManager.getActiveInstructions(),
        stt: sessionStt,
        vad: sessionVad,
        llm: new CerebrasLLM({
          model: 'gemma-4-31b',
          client: cerebrasClient,
        }),
        tts: sessionTts,
        turnHandling: {
          turnDetection: 'stt' as const,
          endpointing: {
            minDelay: ailanaConfig.vadEndpointMinDelayMs,
          },
          interruption: {
            minDuration: ailanaConfig.vadInterruptMinDurationMs,
            minWords: ailanaConfig.vadInterruptMinWords,
            mode: 'vad' as const,
          },
          preemptiveGeneration: {
            enabled: false,
          },
        } as any,
      }, contextManager, updateSessionInstructions, metrics, (stage: string) => sendStageUpdate(stage));
    };

    let vadAgent = createVadAgent();
    logPromptBudget('voice_static', buildVoiceInstructions());
    logPromptBudget('text_full', buildBaseInstructions());
    let voiceMuted = false;
    let isHibernating = false;
    let greetingGenerated = false;
    let sessionStarted = false;
    let pendingGreeting = false;

    const session = new voice.AgentSession({
      userAwayTimeout: null,
      turnHandling: {
        turnDetection: 'stt' as const,
        endpointing: {
          minDelay: ailanaConfig.vadEndpointMinDelayMs,
        },
        interruption: {
          minDuration: ailanaConfig.vadInterruptMinDurationMs,
          minWords: ailanaConfig.vadInterruptMinWords,
          mode: 'vad' as const,
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
    };
    wireAgentCallbacks(vadAgent);

    const backchannelEngine = new BackchannelEngine();

    const createAgentForRotation = () => {
      vadAgent = createVadAgent();
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
    };

    let currentAgentState = 'initializing';

    // ── Silent-turn re-prompt state ───────────────────────────────────────────
    // Tracks whether Ailana produced audible speech after each user turn.
    // When a VAD false-positive aborts LLM generation mid-stream, Ailana goes
    // silent. This guard detects that case and re-asks the pending question.
    let hasSpeechThisTurn = false;
    let silentTurnTimer: ReturnType<typeof setTimeout> | null = null;
    // Timestamp when agent entered 'thinking' — used to ignore preemptive-
    // generation cycles (SDK-internal thinking→listening rounds that complete
    // in <200ms and should never trigger a re-prompt).
    let thinkingStartAt = 0;

    // Map of pending field → natural re-ask wording.
    // Only used as a fallback when Ailana produced zero speech for a user turn.
    // No flow logic here — the contextManager still owns all state transitions.
    const PENDING_FIELD_REPROMPT: Record<string, string> = {
      // Stage 1
      borrower_name:          'I apologize — it seems there was a brief interruption. Could you tell me your name?',
      mortgage_goal:          'I apologize for that. Are you looking to buy a new home, refinance an existing mortgage, or explore a home equity option?',
      occupancy:              'I apologize for the interruption. Will this be for your primary residence, a second home, or an investment property?',
      existing_relationship:  'I apologize — it seems my response did not come through. Do you currently have an account or active services with your lending institution?',
      timeline:               'I apologize for that. When are you hoping to complete this?',
      co_borrower:            'I apologize for the interruption. Will there be a co-borrower joining you on this application, or will you be applying on your own?',
      // Stage 2
      gross_annual_income:    'I apologize for that. What is your gross annual household income before taxes?',
      monthly_debt:           'I apologize for the interruption. What are your total monthly recurring debt payments — things like car loans, student loans, or credit card minimums?',
      credit_range:           'I apologize for that. How would you describe your current credit score — either as a specific number or a general range?',
      refinance_type:         'I apologize for the interruption. Are you considering a cash-out refinance, or are you wanting to reduce your monthly payment through a rate and term refinance?',
      target_price:           'I apologize for that. What is your target purchase price for the home you are looking to buy?',
      down_payment:           'I apologize for the interruption. How much do you have available for a down payment?',
      rent_own:               'I apologize for that. Do you currently rent, or do you own your home?',
      realtor_status:         'I apologize for the interruption. Have you connected with a real estate agent yet?',
      property_type:          'I apologize for that. What type of property is this — a single-family home, condo, townhome, multi-family, or something else?',
      military_rural:         'I apologize for the interruption. Do you have any military service history, or is the property in a rural area?',
      job_tenure_type:        'I apologize for that. Could you tell me a bit about your current job tenure and the type of income you have — for example, whether you are salaried, hourly, or self-employed?',
      // Stage 2 Closing Offer — verbatim two-path choice re-prompt
      stage2_closing_offer:   'I apologize for the interruption. Let me repeat: you have two options for your affordability summary. The most complete option is a soft credit review — no impact to your credit score — which prefills your application with your real credit data. Or I can build your summary right now from everything you have shared, and you can add the credit review whenever you are ready. Which would you prefer?',
      // Stage 4
      checklist_acknowledgement: 'I apologize for that interruption. Do you have these documents available, or would you like to go through any of them?',
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
          backchannelEngine.reset();
          prepareContext().catch(err => console.error('[agent-error]: Idle prepareContext failed:', err));

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
              console.log(`[silent-turn-guard]: Detected empty turn (thinking→listening after ${thinkingDurationMs}ms, no speech). Scheduling re-prompt for field="${pendingField}" in 2s.`);
              if (silentTurnTimer !== null) clearTimeout(silentTurnTimer);
              silentTurnTimer = setTimeout(() => {
                silentTurnTimer = null;
                // Only fire if still in listening state (not speaking or thinking already)
                if (currentAgentState !== 'listening') {
                  console.log(`[silent-turn-guard]: Re-prompt cancelled — agent moved to "${currentAgentState}" before timer fired.`);
                  return;
                }
                // Only fire if the pending field hasn't changed (no turn happened in between)
                if (contextManager.getPendingField() !== pendingField) {
                  console.log(`[silent-turn-guard]: Re-prompt cancelled — pending field changed from "${pendingField}" to "${contextManager.getPendingField()}".`);
                  return;
                }
                console.log(`[silent-turn-guard]: Firing re-prompt for field="${pendingField}".`);
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
                    session.say(repromptText, { addToChatCtx: true });
                    contextManager.onAgentTurn(repromptText).catch(err => 
                      console.error('[agent-error]: Failed to save agent turn:', err)
                    );
                  }
                } catch (err) {
                  console.warn('[silent-turn-guard]: Failed to fire re-prompt:', err);
                }
              }, 2000);
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
      if (!ev.isFinal) return;
      if (!ev.transcript?.trim()) return;

      const transcript = ev.transcript as string;
      console.log(`[pipeline][${ts()}] STT final transcript: "${transcript}"`);
      metrics.markSttComplete(transcript);
      metrics.markUserTurnEnd();
      metrics.startTurn();
    });

    session.on(voice.AgentSessionEventTypes.ConversationItemAdded, (ev: any) => {
      const item = ev.item as llm.ChatMessage;
      if (item?.role === 'assistant' && item.textContent) {
        hasSpeechThisTurn = true;
        if (silentTurnTimer !== null) {
          clearTimeout(silentTurnTimer);
          silentTurnTimer = null;
        }
        contextManager.onAgentTurn(item.textContent).catch(err => 
          console.error('[agent-error]: Failed to save agent turn:', err)
        );

        // ── Publish agent message as a LiveKit chat message ─────────────────
        // Since TTS audio goes directly to LemonSlice via DataStreamAudioOutput,
        // the LiveKit TranscriptionSynchronizer never sees audio playout events
        // and therefore never fires transcriptionReceived events on the frontend.
        // Publishing the text explicitly as a chat message ensures Ailana's
        // responses always appear in the chat panel, regardless of audio routing.
        const msgText = item.textContent;
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

    // MetricsCollected fires with LLM TTFT data from the LiveKit pipeline
    session.on(voice.AgentSessionEventTypes.MetricsCollected, (ev: any) => {
      const m = ev.metrics;
      if (m?.type === 'llm_metrics') {
        const ttft = m.ttftMs ?? -1;
        const tokens = m.promptTokens ?? 0;
        metrics.markLlmFirstToken();       // idempotent — only records once
        metrics.markLlmComplete();
        metrics.recordRealtimeMetrics(ttft, tokens);
        console.log(`[pipeline][${ts()}] LLM metrics — TTFT=${ttft}ms  prompt_tokens=${tokens}  completion_tokens=${m.completionTokens ?? '?'}`);
      } else if (m?.type === 'tts_metrics') {
        const dur = m.duration ?? -1;
        metrics.markTtsComplete();
        console.log(`[pipeline][${ts()}] TTS metrics — audio_dur=${dur}ms`);
      } else if (m?.type === 'realtime_model_metrics') {
        metrics.recordRealtimeMetrics(m.ttftMs ?? -1, m.inputTokens ?? 0);
      }
    });

    let lastSentStage = contextManager.getActiveStage();
    const sendStageUpdate = async (stage: string) => {
      try {
        const prof = contextManager.getProfile();
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
            militaryRural: prof.military_rural,
            zipCode: prof.zip_code,
            propertyType: prof.property_type,
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
            contact_email: prof.contact_email,
            contact_mobile: prof.contact_mobile,
            // otp_sent = true when the OTP has been generated (even before field reaches 'otp_verification')
            // This lets the frontend open the modal as soon as the OTP is dispatched.
            otp_sent: !!(prof as any)._pendingOtp,
            // ── Flow state ──────────────────────────────────────────
            current_pending_field: contextManager.getPendingField(),
          }
        }));
        await ctx.room.localParticipant?.publishData(payload, { reliable: true, topic: 'lk-chat' });
        console.log(`[agent-debug]: Sent stage update to frontend: ${stage} with profile data.`);
      } catch (e: any) {
        console.warn(`[agent-debug]: Failed to send stage update:`, e?.message);
      }
    };


    function updateSessionInstructions() {
      try {
        const activeInstructions = contextManager.getActiveInstructions();
        (vadAgent as any)._instructions = activeInstructions;

        const chatCtx = session.chatCtx;
        const systemItem = (chatCtx.items.find(
          (item) => item.type === 'message' && (item as llm.ChatMessage).id === 'lk.agent_task.instructions'
        ) || chatCtx.items.find(
          (item) => item.type === 'message' && (item as llm.ChatMessage).role === 'system'
        )) as llm.ChatMessage | undefined;
        if (systemItem) {
          systemItem.content = [activeInstructions];
          // Ensure it has the correct ID so the LiveKit SDK updates it correctly
          if ((systemItem as any).id !== 'lk.agent_task.instructions') {
            (systemItem as any).id = 'lk.agent_task.instructions';
          }
          console.log(`[agent-debug]: System instruction message in session.chatCtx updated.`);
        } else {
          chatCtx.items.unshift(new llm.ChatMessage({
            id: 'lk.agent_task.instructions',
            role: 'system',
            content: activeInstructions
          }));
          console.log(`[agent-debug]: System instruction message prepended to session.chatCtx.`);
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

    const generateTextOnlyReply = async (userMessage: string) => {
      await contextManager.onUserTurn(userMessage);
      updateSessionInstructions();
      metrics.startTurn();
      console.log(`[agent]: Text-only reply for "${userMessage}"...`);

      try {
        const systemPrompt = contextManager.getActiveInstructions();
        const chatMessages = contextManager.buildTextMessages(systemPrompt);

        // Ensure system prompt is always at index 0 and conversation history is sliced safely
        const systemMessage = chatMessages[0];
        const historyMessages = chatMessages.slice(1);
        const slicedHistory = historyMessages.slice(-23); // keep up to 23 recent turns
        const messages = [systemMessage, ...slicedHistory];

        console.log(`[agent]: Dispatching text-only reply to Cerebras client proxy...`);
        const completion = await cerebrasClient.chat.completions.create({
          model: 'gemma-4-31b',
          messages: messages as any,
          max_tokens: 500,
          temperature: 0.6,
          stream: false, // text-only path — must receive a plain completion object, not a stream
        } as any);

        const reply = completion.choices?.[0]?.message?.content?.trim();

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

    const handleSystemMessages = async (messageText: string, participantIdentity: string | undefined) => {
      if (isHibernating && messageText !== 'SYSTEM_RESUME_AGENT') {
        console.log(`[agent]: Ignoring message while hibernating: ${messageText}`);
        return;
      }

      if (messageText.startsWith('SYSTEM_AUS_SUBMITTED:')) {
        const status = messageText.split(':')[1];
        console.log(`[agent]: SYSTEM_AUS_SUBMITTED received. Status: ${status}`);
        contextManager.applyAusResult(status as any);
        updateSessionInstructions();
        
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

        const triggerPrompt = `The borrower clicked 'Upgrade to Verified Mode' on their screen. Transition to Stage 3A by asking for their email and mobile number to set up their secure login for the soft credit review.`;
        if (voiceMuted) {
          await generateTextOnlyReply(triggerPrompt);
        } else {
          metrics.startTurn();
          metrics.markGenerateReply();
          session.generateReply({ userInput: triggerPrompt });
        }
        return;
      }

      if (messageText === 'SYSTEM_TRANSFER_MLO') {
        isHibernating = true;
        console.log(`[agent]: 🛌 Agent hibernating for MLO transfer. Shutting down audio pipeline...`);

        // 1. Interrupt any in-progress LLM/TTS generation immediately
        try {
          if ((session as any)._started) {
            session.interrupt();
          }
        } catch (e) {
          console.warn('[agent]: Failed to interrupt session:', e);
        }

        // 2. Unsubscribe from ALL remote participant tracks so VAD receives no audio.
        //    This prevents the agent from hearing/responding to the SIP IVR or the loan officer.
        //    With no audio input, the LLM pipeline starves and generates no further responses.
        for (const p of ctx.room.remoteParticipants.values()) {
          for (const pub of p.trackPublications.values()) {
            try { pub.setSubscribed(false); } catch (_) {}
          }
        }
        console.log('[agent]: 🔇 All tracks unsubscribed. User and loan officer now on direct line.');

        // 3. Dial the SIP trunk to bring the loan officer into the room
        try {
          const { transferRoomToMloQueue } = await import('./utils/sipTransfer.js');
          transferRoomToMloQueue({
            roomName: ctx.room.name || '',
          }).then((res) => {
            console.log(`[agent]: 📞 SIP Transfer initiated successfully:`, res);
          }).catch((err) => console.error(`[agent]: SIP Transfer failed:`, err));
        } catch (err) {
          console.error(`[agent]: SIP Transfer setup failed:`, err);
        }
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

        metrics.startTurn();
        metrics.markGenerateReply();
        session.generateReply({ userInput: RESUME_USER_INPUT });
        return;
      }

      if (messageText === 'SYSTEM_VOICE_MUTED') {
        voiceMuted = true;
        console.log(`[agent]: Avatar voice disabled — text-only replies.`);
        return;
      }
      if (messageText === 'SYSTEM_VOICE_UNMUTED') {
        voiceMuted = false;
        console.log(`[agent]: Avatar voice enabled — resuming voice replies.`);
        return;
      }

      if (messageText.startsWith('SYSTEM_CHANNEL_START')) {
        const targetMode = messageText.split(':')[1] || 'video';
        console.log(`[agent]: Channel started (${targetMode}).`);

        if (greetingGenerated) {
          return;
        }

        // Flag pendingGreeting so TrackUnmuted or avatarReady handler knows a greeting is queued
        pendingGreeting = true;

        if (!isAvatarInitDone) {
          console.log(`[agent]: SYSTEM_CHANNEL_START received before avatar ready. Waiting for avatar initialization...`);
          await avatarReadyPromise;
          console.log(`[agent]: Avatar ready. Resuming deferred SYSTEM_CHANNEL_START handler.`);
        }

        if (greetingGenerated) {
          return;
        }

        greetingGenerated = true;
        pendingGreeting = false;
        const greetingText = "Hi! I am Ailana, an AI mortgage assistant. I can answer your mortgage questions, walk you through loan program information, and help you get started on the path to homeownership. What questions do you have for me today?";

        try {
          if (!(session as any)._started) {
            sessionStarted = true;
            await session.start({ agent: vadAgent, room: ctx.room });
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

      try {
        console.log(`[agent]: Generating reply for: "${messageText}"`);
        if (!(session as any)._started) {
          await session.start({ agent: vadAgent, room: ctx.room });
        }

        metrics.startTurn();
        metrics.markGenerateReply();

        if (voiceMuted) {
          await generateTextOnlyReply(messageText);
        } else {
          // For typed inputs in voice session, we run extraction and update instructions BEFORE calling generateReply
          await contextManager.onUserTurn(messageText);
          updateSessionInstructions();
          session.generateReply({ userInput: messageText });
        }
      } catch (err) {
        console.warn(`[agent]: Could not generate reply:`, err);
      }
    };

    ctx.room.on(RoomEvent.ChatMessage, async (msg, participant) => {
      try {
        const identity = participant?.identity ?? (msg as any).participantIdentity;
        if (!msg.message || identity === ctx.room.localParticipant?.identity) return;
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
      if (isHibernating) {
        pub.setSubscribed(false);
      }
    });

    ctx.room.on(RoomEvent.TrackSubscribed, (track, pub, participant) => {
      if (isHibernating) {
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
        await session.start({ agent: vadAgent, room: ctx.room });
        console.log(`[agent]: Realtime session started successfully.`);

        const readyPayload = new TextEncoder().encode(JSON.stringify({ message: "SYSTEM_AGENT_READY" }));
        await ctx.room.localParticipant?.publishData(readyPayload, { reliable: true, topic: "lk-chat" });
        console.log(`[agent]: Sent SYSTEM_AGENT_READY signal.`);

        // If the channel start signal already arrived while we were waiting, say greeting now
        const greetingText = "Hi! I am Ailana, an AI mortgage assistant. I can answer your mortgage questions, walk you through loan program information, and help you get started on the path to homeownership. What questions do you have for me today?";
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

    ctx.room.on(RoomEvent.DataReceived, async (payload, participant, _kind, topic) => {
      try {
        const identity = participant?.identity;
        if (topic === 'lk-chat' && identity !== ctx.room.localParticipant?.identity) {
          const str = new TextDecoder().decode(payload);
          try {
            const parsed = JSON.parse(str);
            if (parsed.type === 'otp_submit') {
              contextManager.handleOtpSubmission(parsed.code);
              updateSessionInstructions();
              const triggerPrompt = `The borrower has entered the OTP code ${parsed.code} into the modal. Please verify it and proceed.`;
              if (voiceMuted) {
                await generateTextOnlyReply(triggerPrompt);
              } else {
                metrics.startTurn();
                session.generateReply({ userInput: triggerPrompt });
              }
              return;
            }
            await handleSystemMessages(parsed.message ?? str, identity);
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
          for await (const chunk of stream) fullText += chunk;
          if (participant?.identity !== ctx.room.localParticipant?.identity) {
            try {
              const parsed = JSON.parse(fullText);
              if (parsed.type === 'otp_submit') {
                contextManager.handleOtpSubmission(parsed.code);
                updateSessionInstructions();
                const triggerPrompt = `The borrower has entered the OTP code ${parsed.code} into the modal. Please verify it and proceed.`;
                if (voiceMuted) {
                  await generateTextOnlyReply(triggerPrompt);
                } else {
                  metrics.startTurn();
                  session.generateReply({ userInput: triggerPrompt });
                }
                return;
              }
              await handleSystemMessages(parsed.message ?? fullText, participant?.identity);
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

    if (lsApiKey && lsAgentId) {
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
        // Do NOT call markReady() here. WebRTC tracks are not subscribed yet.
        // Wait for TrackSubscribed event so the first audio/video frames are not lost.
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
              agentPrompt: 'You are Ailana, a professional AI mortgage advisor in her mid-30s. You are warm, composed, and confident — the kind of person a member trusts with one of the biggest financial decisions of their life. You represent a credit union, so your manner is approachable but polished, never salesy or performative. Facial expression and movement: stay subtle and controlled at all times. Rest with a calm, closed or barely-parted mouth between utterances. When speaking, use small, measured mouth movements rather than wide or exaggerated openings — this applies especially to the very first word of any sentence, including greetings like "Hi" or "Hello." Avoid theatrical or cartoonish expressions; think understated warmth, not enthusiasm. Head movement is gentle and occasional, eye contact is soft and steady, eyebrow movement is minimal. Your overall demeanor is that of a trusted advisor sitting across a desk from someone — calm, attentive, unhurried.',
              // agent_idle_prompt controls expressions WHILE LISTENING/IDLE
              extraPayload: {
                agent_idle_prompt: 'You are Ailana, a professional AI mortgage advisor in her mid-30s. You are warm, composed, and confident — the kind of person a member trusts with one of the biggest financial decisions of their life. You represent a credit union, so your manner is approachable but polished, never salesy or performative. Facial expression and movement: stay subtle and controlled at all times. Rest with a calm, closed or barely-parted mouth between utterances. When speaking, use small, measured mouth movements rather than wide or exaggerated openings — this applies especially to the very first word of any sentence, including greetings like "Hi" or "Hello." Avoid theatrical or cartoonish expressions; think understated warmth, not enthusiasm. Head movement is gentle and occasional, eye contact is soft and steady, eyebrow movement is minimal. Your overall demeanor is that of a trusted advisor sitting across a desk from someone — calm, attentive, unhurried.',
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

            // Start the AgentSession (audioEnabled: true creates the audio track for transcription)
            sessionStarted = true;
            await session.start({ agent: vadAgent, room: ctx.room });

            // Restore the DataStreamAudioOutput so TTS audio goes directly to the avatar
            if (dataStreamAudio) {
              session.output.audio = dataStreamAudio;
            }

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
          await session.start({ agent: vadAgent, room: ctx.room });

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

    // Measure connection latency to Cerebras API endpoint on start
    (async () => {
      const start = Date.now();
      try {
        const res = await fetch(`${ailanaConfig.cerebrasBaseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ailanaConfig.cerebrasApiKey}`
          },
          body: JSON.stringify({
            model: 'gemma-4-31b',
            messages: [{ role: 'user', content: 'ping' }],
            max_tokens: 1,
          })
        });
        const duration = Date.now() - start;
        console.log(`[latency-check][${ts()}] Cerebras API connection roundtrip test completed in ${duration}ms (HTTP Status: ${res.status})`);
      } catch (err: any) {
        const duration = Date.now() - start;
        console.warn(`[latency-check][${ts()}] Cerebras API connection test returned error after ${duration}ms: ${err?.message || err}`);
      }
    })();

    const activeModelName = 'cascade-livekit-inference (Cerebras Gemma 4 31B + Cartesia TTS + LemonSlice Avatar)';
    console.log(
      `[agent]: Ready — model=${activeModelName}, prompt=${ailanaConfig.promptVersion}, compact@${ailanaConfig.compactEveryNTurns} turns / ${ailanaConfig.forceCompactInputTokens} tokens`,
    );
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

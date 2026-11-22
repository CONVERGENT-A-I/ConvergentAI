/**
 * Stage 3A — email and mobile are asked on SEPARATE turns.
 * Verifies the state-machine order, the prompt layers, and the deterministic
 * agent scripts so the voice, text-chat and LLM paths all ask the same thing.
 */
import 'dotenv/config';
import fs from 'fs';
process.env.LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || 'test-key';
import { SessionContextManager, extractHoldoutContactInfo } from '../context/session-context-manager.js';
import { buildLayer3TurnContext } from '../prompts/layer3-context.js';
import { buildStage3AInstructions } from '../prompts/stage3-guidance.js';

let total = 0;
function assert(cond: boolean, name: string, detail?: unknown) {
  total++;
  if (!cond) {
    console.error(`  ❌ ${name}`, detail ?? '');
    process.exit(1);
  }
  console.log(`  ✅ ${name}`);
}

console.log('🧪 Contact sequence (separate email / mobile turns)\n');

// ── State machine order ──────────────────────────────────────────────────────
{
  const scm = new SessionContextManager({} as any, {} as any);
  scm.setActiveStage('3A');
  scm.advanceWorkflow();
  assert(scm.getPendingField() === 'contact_full_name', 'starts at contact_full_name');

  scm.getProfile().contact_name = 'Jane Doe';
  scm.advanceWorkflow();
  assert(scm.getPendingField() === 'contact_email', 'name → contact_email');

  scm.getProfile().contact_email = 'jane@example.com';
  scm.advanceWorkflow();
  assert(scm.getPendingField() === 'contact_mobile', 'email → contact_mobile (asked separately)');

  scm.getProfile().contact_mobile = '5551234567';
  scm.advanceWorkflow();
  assert(scm.getPendingField() === 'contact_confirm_display', 'mobile → contact_confirm_display');
}

// Borrower volunteered both on the email turn → mobile question is skipped.
{
  const scm = new SessionContextManager({} as any, {} as any);
  scm.setActiveStage('3A');
  const p = scm.getProfile();
  p.contact_name = 'Jane Doe';
  p.contact_email = 'jane@example.com';
  p.contact_mobile = '5551234567';
  scm.advanceWorkflow();
  assert(scm.getPendingField() === 'contact_confirm_display', 'both known → skips contact_mobile');
}

// Mobile captured earlier (Section 0 holdout) → only email is asked, then confirm.
{
  const scm = new SessionContextManager({} as any, {} as any);
  scm.setActiveStage('3A');
  const p = scm.getProfile();
  p.contact_name = 'Jane Doe';
  p.contact_mobile = '5551234567';
  scm.advanceWorkflow();
  assert(scm.getPendingField() === 'contact_email', 'holdout mobile → still asks email');
  p.contact_email = 'jane@example.com';
  scm.advanceWorkflow();
  assert(scm.getPendingField() === 'contact_confirm_display', 'holdout mobile + email → confirm display');
}

// Both fields remain deterministic / boundary fields.
{
  const scm = new SessionContextManager({} as any, {} as any);
  assert(scm.isDeterministicField('contact_email') && scm.isDeterministicField('contact_mobile'), 'email & mobile are deterministic');
  assert(scm.isStageBoundaryField('contact_email') && scm.isStageBoundaryField('contact_mobile'), 'email & mobile are boundary fields');
}

// ── Prompt layers ────────────────────────────────────────────────────────────
{
  const emailCtx = buildLayer3TurnContext({ contact_name: 'Jane Doe' } as any, 'contact_email', '3A');
  assert(emailCtx.includes('COLLECT EMAIL ***'), 'layer3 email block present');
  assert(emailCtx.includes('"Great. Now, what email address would you like to use for your account?"'), 'layer3 email script is email-only');
  assert(!emailCtx.includes('email address and mobile number'), 'layer3 no longer asks both together');
  assert(!/together in ONE question/.test(emailCtx), 'layer3 combined-ask rule removed');

  const emailCtxMobileKnown = buildLayer3TurnContext({ contact_name: 'Jane', contact_mobile: '5551234567' } as any, 'contact_email', '3A');
  assert(emailCtxMobileKnown.includes('I have your mobile number. Could you also share the email address'), 'layer3 email script acknowledges known mobile');

  const mobileCtx = buildLayer3TurnContext({ contact_name: 'Jane', contact_email: 'jane@example.com' } as any, 'contact_mobile', '3A');
  assert(mobileCtx.includes("I have your email. Could you also share the mobile number you'd like to use?"), 'layer3 mobile script matches deterministic script');

  const mobileCtxNoEmail = buildLayer3TurnContext({ contact_name: 'Jane' } as any, 'contact_mobile', '3A');
  assert(mobileCtxNoEmail.includes("Could you share the mobile number you'd like to use for your account?"), 'layer3 mobile script without email');

  const s3a = buildStage3AInstructions();
  assert(s3a.includes('Ask ONLY for the email address'), 'stage3A guidance: email only');
  assert(s3a.includes('Ask ONLY for the mobile number'), 'stage3A guidance: mobile only');
  assert(!s3a.includes('email address and mobile number would you like'), 'stage3A guidance: combined ask removed');
}

// ── Deterministic agent scripts (voice, text chat, interruption recovery) ────
{
  const agentCode = fs.readFileSync(new URL('../agent.ts', import.meta.url), 'utf-8');
  assert(!agentCode.includes('what email and mobile number would you like'), 'agent: voice combined ask removed');
  assert(!agentCode.includes('what email address and mobile number would you like'), 'agent: text-chat combined ask removed');
  assert(agentCode.includes('Thank you. Now, what email address would you like to use for your account?'), 'agent: voice email-only script');
  assert(agentCode.includes('Great. Now, what email address would you like to use for your account?'), 'agent: text-chat email-only script');
  assert(agentCode.includes("contact_email: 'I apologize for that. What email address would you like to use for your account?'"), 'agent: interruption reprompt email-only');
  assert((agentCode.match(/What are the remaining digits of your mobile number\?/g) || []).length === 2, 'agent: partial-number follow-up in voice + text paths');
  assert(agentCode.includes('userAskedQuestion && !contactStateProgressed'), 'agent: llmNode does not let userAskedQuestion hijack contact corrections');
  assert(agentCode.includes('else if (isQuestionOrHesitation && !isContactBoundaryField)'), 'agent: onUserTurnCompleted waits for contact boundary extraction even on correction phrasing');
  assert(agentCode.includes("else if (pending === 'otp_verification' && !prof.otp_verified) {\n          (prof as any)._otpInstructionDelivered = true;\n          (prof as any)._otpReadyToShow = true;\n          sendStageUpdate(contextManager.getActiveStage());") || agentCode.includes("else if (pending === 'otp_verification' && !prof.otp_verified) {\r\n          (prof as any)._otpInstructionDelivered = true;\r\n          (prof as any)._otpReadyToShow = true;\r\n          sendStageUpdate(contextManager.getActiveStage());"), 'agent: text-chat otp_verification syncs stage update for OTP modal');
  assert(agentCode.includes("if (pending === 'contact_email') {\n      if (this.sendStageUpdate && this.activeFieldAtTurnStart !== pending)") || agentCode.includes("if (pending === 'contact_email') {\r\n      if (this.sendStageUpdate && this.activeFieldAtTurnStart !== pending)"), 'agent: llmNode contact_email syncs stage update on transition');
}

// ── Extraction block wiring ─────────────────────────────────────────────────
{
  const scmCode = fs.readFileSync(new URL('../context/session-context-manager.ts', import.meta.url), 'utf-8');
  assert(!scmCode.includes("this.currentPendingField === 'contact_email' || this.currentPendingField === 'contact_mobile'"), 'scm: shared dual-turn block replaced');
  assert(scmCode.includes('acceptVolunteeredMobile('), 'scm: volunteered mobile validated on email turn');
  assert(scmCode.includes('appendPhoneFragment(existingBuffer, fragment)'), 'scm: mobile fragment buffering wired');
  assert(scmCode.includes("this.activeStage === '3A'") && scmCode.includes("'contact_confirm_display'"), 'scm: checkForGlobalCorrections skipped during Stage 3A contact turns');
  assert(scmCode.includes('extractEmailFromText(String(results.contact_email.value))'), 'scm: Stage 3A validates LLM email outputs with extractEmailFromText');
}

// ── End-to-end 0ms onUserTurn correction in Stage 3A with confirmed Stage 1/2 fields ──
{
  const scm = new SessionContextManager({} as any, {} as any);
  scm.setActiveStage('3A');
  const p = scm.getProfile();
  p.mortgage_goal = 'purchase';
  p.mortgage_goal_confirmed = true;
  p.contact_name = 'Jane Doe';
  p.contact_email = 'jane@example.com';
  p.contact_mobile = '5551234567';
  scm.advanceWorkflow();
  assert(scm.getPendingField() === 'contact_confirm_display', '0ms onUserTurn pre-check: at contact_confirm_display');

  await scm.onUserTurn('No, my email is wrong');
  assert(scm.getPendingField() === 'contact_email', '0ms onUserTurn bypasses Stage 1/2 global correction and routes directly to contact_email');
  assert(!p.contact_email && p.contact_mobile === '5551234567' && p.contact_name === 'Jane Doe', '0ms onUserTurn clears only email while preserving name and mobile');
}

// ── Holdout email validation (strict extractEmailFromText) ──────────────────
{
  const profile: any = {};
  const badCaptured = extractHoldoutContactInfo('reach me at bad@@example..com please', profile);
  assert(badCaptured === false && !profile.contact_email, 'extractHoldoutContactInfo rejects malformed email');

  const goodCaptured = extractHoldoutContactInfo('reach me at jane.doe@example.com please', profile);
  assert(goodCaptured === true && profile.contact_email === 'jane.doe@example.com', 'extractHoldoutContactInfo accepts valid email');
}

// ── Single-field voice correction routing ───────────────────────────────────
{
  const scm = new SessionContextManager({} as any, {} as any);
  scm.setActiveStage('3A');
  const p = scm.getProfile();
  p.contact_name = 'Jane Doe';
  p.contact_email = 'jane@example.com';
  p.contact_mobile = '5551234567';
  scm.advanceWorkflow();
  assert(scm.getPendingField() === 'contact_confirm_display', 'routing pre-check: at contact_confirm_display');

  const routedEmail = scm.routeNamedContactFieldCorrection('No, my email is wrong');
  assert(routedEmail === true && scm.getPendingField() === 'contact_email', 'naming email routes directly to contact_email');
  assert(!p.contact_email && p.contact_mobile === '5551234567' && p.contact_name === 'Jane Doe', 'email cleared while name and mobile preserved');

  p.contact_email = 'jane.new@example.com';
  scm.advanceWorkflow();
  assert(scm.getPendingField() === 'contact_confirm_display', 'after updating email, returns to contact_confirm_display');

  const routedMobile = scm.routeNamedContactFieldCorrection('Change my phone number');
  assert(routedMobile === true && scm.getPendingField() === 'contact_mobile', 'naming phone routes directly to contact_mobile');
  assert(!p.contact_mobile && p.contact_email === 'jane.new@example.com' && p.contact_name === 'Jane Doe', 'mobile cleared while name and email preserved');

  assert(scm.isPureNamedContactFieldCorrection('No, my email is wrong', true) === true, 'pure named email correction detected on confirm_display');
  assert(scm.isPureNamedContactFieldCorrection('My phone number', false) === true, 'pure named mobile correction detected on confirm_correction');
  assert(scm.isPureNamedContactFieldCorrection('No, my email is jane@example.com', true) === false, 'inline email correction is not misclassified as pure field name');
  assert(scm.isPureNamedContactFieldCorrection('No, my phone is 555-123-4567', true) === false, 'inline mobile correction is not misclassified as pure field name');
}

// ── 3-strike decline fallback + OTP confirmation guard ──────────────────────
{
  const scm = new SessionContextManager({} as any, {} as any);
  scm.setActiveStage('3A');
  const p = scm.getProfile();
  p.contact_name = 'Jane Doe';
  scm.advanceWorkflow();
  assert(scm.getPendingField() === 'contact_email', '3-strike pre-check: starts at contact_email');

  scm.declineCurrentField();
  assert((p as any)._emailVoiceDeclined === true && scm.getPendingField() === 'contact_mobile', '3-strike on email still asks contact_mobile separately');

  scm.declineCurrentField();
  assert((p as any)._mobileVoiceDeclined === true && scm.getPendingField() === 'contact_confirm_display', '3-strike on mobile advances to contact_confirm_display');

  const blocked = scm.handleContactInfoConfirmed();
  assert(blocked === false && scm.getPendingField() === 'contact_confirm_display', 'handleContactInfoConfirmed blocks OTP while email or mobile missing');

  p.contact_email = 'jane@example.com';
  const stillBlocked = scm.handleContactInfoConfirmed();
  assert(stillBlocked === false && scm.getPendingField() === 'contact_confirm_display', 'handleContactInfoConfirmed blocks OTP while mobile still missing');

  p.contact_mobile = '5551234567';
  const confirmed = scm.handleContactInfoConfirmed();
  assert(confirmed === true && scm.getPendingField() === 'otp_verification', 'handleContactInfoConfirmed advances to otp_verification once both email and mobile exist');

  scm.triggerUpgradeToVerifiedMode();
  assert(!(p as any)._emailVoiceDeclined && !(p as any)._mobileVoiceDeclined, 'triggerUpgradeToVerifiedMode clears voice-decline flags');
  assert(scm.getPendingField() === 'contact_full_name', 'triggerUpgradeToVerifiedMode restarts cleanly at contact_full_name');
  p.contact_name = 'Jane Doe';
  scm.advanceWorkflow();
  assert(scm.getPendingField() === 'contact_email', 'after upgrade reset: asks contact_email separately');
  p.contact_email = 'jane@example.com';
  scm.advanceWorkflow();
  assert(scm.getPendingField() === 'contact_mobile', 'after upgrade reset: asks contact_mobile separately');
}

console.log(`\n✨ ALL ${total} CONTACT SEQUENCE TESTS PASSED`);
process.exit(0);

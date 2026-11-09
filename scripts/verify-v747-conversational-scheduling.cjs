const fs = require('node:fs');

const agent = fs.readFileSync('backend/src/agent.ts', 'utf8');
const service = fs.readFileSync('backend/src/services/conversational-scheduling.ts', 'utf8');
const ui = fs.readFileSync('src/components/floating-cta/index.tsx', 'utf8');
const media = fs.readFileSync('src/components/floating-cta/media-guard.tsx', 'utf8');
const prompt = fs.readFileSync('backend/src/prompts/stage5-escalation.ts', 'utf8');
const esl = fs.readFileSync('backend/src/services/freeswitch-esl.ts', 'utf8');
const detector = fs.readFileSync('src/components/floating-cta/mlo-detector.tsx', 'utf8');

function expect(source, fragment, description) {
  if (!source.includes(fragment)) throw new Error(`Missing ${description}: ${fragment}`);
}

expect(agent, 'findMeetingTimes: llm.tool', 'calendar availability voice tool');
expect(agent, 'confirmMeeting: llm.tool', 'confirmed booking voice tool');
expect(agent, 'ProtoFace avatar session closed after SIP answer', 'transactional avatar close');
expect(agent, 'waitForQueueAgentAnswer(queue.queueExtension)', 'human answer gate');
expect(agent, "reason: noAgentAvailable ? 'no_agent_available' : 'queue_timeout'", 'queue timeout recovery');
expect(agent, 'duplicate generic resume suppressed', 'single scheduling prompt guard');
expect(agent, 'mloTransferPending || isHibernating || voiceScheduling.active', 'duplicate transfer guard');
expect(agent, 'scheduling prompt retained; mortgage stage extraction bypassed', 'dedicated scheduling context');
expect(agent, 'Do not ask mortgage_goal, purchase-versus-refinance', 'mortgage-stage isolation');
expect(agent, 'No Loan Officers are currently available in the ${queueLabel}', 'deterministic no-agent notice');
expect(agent, 'schedule a callback with a licensed Loan Officer', 'deterministic callback offer');
expect(agent, 'await session.say(offerScript, { addToChatCtx: true })', 'required notice bypasses LLM');
expect(agent, 'deterministic availability/callback offer delivered', 'required notice delivery log');
expect(agent, 'cancelMeetingScheduling: llm.tool', 'voice scheduling cancellation');
expect(agent, "args.customerEmail?.trim() || profile.contact_email?.trim()", 'engagement email reuse');
expect(agent, "args.customerPhone?.trim() || profile.contact_mobile?.trim()", 'engagement phone reuse');
expect(agent, 'Ask only for the missing', 'missing-only contact collection');
expect(service, 'INSERT INTO appointments', 'appointment persistence');
expect(service, 'sendBookingNotification', 'staff notification');
expect(service, 'sendCustomerBookingConfirmation', 'customer date/time confirmation email');
expect(service, 'EXPLICIT_CONSENT_REQUIRED', 'explicit consent gate');
expect(ui, 'setConversationalScheduling(true)', 'voice scheduling UI recovery');
expect(ui, 'This is an expected business flow, not an avatar/provider failure', 'no false avatar failure');
expect(ui, 'setAvatarFallbackReason(null)', 'fallback badge cleared during scheduling');
expect(ui, 'Continue into the existing room', 'no popup precheck fallback');
expect(media, 'Mic ON for conversational scheduling', 'customer microphone recovery');
expect(esl, "answeredStates = new Set(['in a queue call'", 'FreeSWITCH human answer detection');
expect(detector, 'SYSTEM_MLO_AGENT_CONNECTED', 'browser human answer confirmation');
expect(prompt, 'Scheduling happens entirely in this voice conversation', 'voice-first prompt');

console.log('v7.4.7 conversational-scheduling regression checks passed.');

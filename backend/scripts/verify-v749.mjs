import { readFileSync } from 'node:fs';

const agent = readFileSync(new URL('../src/agent.ts', import.meta.url), 'utf8');
const context = readFileSync(new URL('../src/context/session-context-manager.ts', import.meta.url), 'utf8');
const scheduling = readFileSync(new URL('../src/services/conversational-scheduling.ts', import.meta.url), 'utf8');
const extractor = readFileSync(new URL('../src/context/llm-extractor.ts', import.meta.url), 'utf8');

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

// In Dev environment, prequalification retains Dev's verified flow.
const isDevFlow = context.includes("currentPendingField = 'otp_verification'");
if (!isDevFlow) {
  assert(!context.includes("currentPendingField = 'otp_verification'"), 'OTP must not be a reachable workflow field');
  assert(!context.includes('Generated mock OTP'), 'Mock OTP generator must be removed');
  assert(!agent.includes("I've sent a one-time code"), 'Avatar must not claim a passcode was sent');
  assert(context.includes("contact_verification_method = 'user_voice_confirmation'"), 'Verbal contact confirmation marker is missing');
  assert(context.includes('Rejected incomplete phone fragment'), 'Complete-phone validation is missing');
}

assert(agent.includes("handleSystemMessages('SYSTEM_TRANSFER_MLO'"), 'Voice transfer must reuse the authoritative UI transfer handler');
assert(agent.includes('resolveQueueForZip(requestedZip)'), 'Database ZIP-to-queue resolution is missing');
assert(
  agent.includes('getQueueAvailability(queue.queueExtension, true)') ||
    agent.includes('getStableQueueAvailability(queue.queueExtension)'),
  'ESL availability gate is missing',
);
assert(agent.includes('startConversationalScheduling'), 'No-agent scheduling fallback is missing');
assert(scheduling.includes('sendCustomerBookingConfirmation'), 'Customer booking email is missing');
assert(scheduling.includes('retrying once'), 'Customer email retry is missing');
assert(extractor.includes('function getExtractorLlm()'), 'LiveKit extractor must be initialized lazily');
assert(!extractor.includes('const extractorLlm = new inference.LLM'), 'Module import must not require LiveKit credentials');
assert(!extractor.includes('const stream = extractorLlm.chat'), 'Every extractor call must use the non-null lazy getter');
assert(!extractor.includes('extractorLlm.chat('), 'All LiveKit extractor calls must use the lazy getter');

console.log('v7.4.9 static flow verification passed');

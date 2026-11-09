import { readFileSync } from 'node:fs';

const agent = readFileSync(new URL('../src/agent.ts', import.meta.url), 'utf8');
const transfer = readFileSync(new URL('../src/utils/sipTransfer.ts', import.meta.url), 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const voiceHook = agent.slice(
  agent.indexOf('override async onUserTurnCompleted'),
  agent.indexOf('override async onUserTurnCompleted') + 5000,
);
assert(
  voiceHook.indexOf('if (this.isConversationalSchedulingActive())') < voiceHook.indexOf('if (userMessage?.textContent && this.globalTurnInterceptor)'),
  'Spoken scheduling turns must be handled before the MLO transfer interceptor',
);
assert(
  agent.includes("[voice-mlo-transfer]: ignored because conversational scheduling is active."),
  'MLO transfer handler scheduling guard missing',
);
assert(
  agent.includes("[voice-scheduling]: transfer interceptor bypassed because scheduling owns the turn."),
  'Global transfer interceptor scheduling guard missing',
);
assert(
  transfer.includes('async function alertMappedQueueAgents'),
  'Transfer-time queue alert helper missing',
);
assert(
  transfer.includes('[transfer-alert]: queue ${queueExtension} reached'),
  'Transfer-time queue alert delivery diagnostic missing',
);

console.log('v7.5.6 scheduling priority and transfer alert verification passed.');

import { readFileSync } from 'node:fs';

const agent = readFileSync(new URL('../src/agent.ts', import.meta.url), 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

assert(agent.includes('completedAt: number;'), 'Scheduling terminal timestamp missing');
assert(agent.includes('voiceScheduling.completedAt = Date.now();'), 'Successful booking must enter terminal state');
assert(
  agent.includes('voiceScheduling.completedAt === 0 && isContextualLoanOfficerTransferConfirmation'),
  'Contextual yes must be disabled after a successful booking',
);
assert(
  agent.includes('[voice-scheduling]: post-booking acknowledgement suppressed'),
  'Buffered post-booking acknowledgement suppression missing',
);
assert(
  agent.includes('[voice-scheduling]: completed confirmation='),
  'Scheduling completion diagnostic missing',
);

console.log('v7.5.8 scheduling terminal-state verification passed.');

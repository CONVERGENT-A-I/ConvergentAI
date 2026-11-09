import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const agent = readFileSync(new URL('../src/agent.ts', import.meta.url), 'utf8');

assert.match(agent, /globalTurnInterceptor/);
assert.match(agent, /voiceMloTransfer\.active/);
assert.match(agent, /voiceMloTransfer\.phase = 'dispatching'/);
assert.match(agent, /normalizeSpokenZip\(text\)/);
assert.match(agent, /isLoanOfficerTransferIntent\(text\)/);
assert.match(agent, /startConversationalScheduling/);
assert.doesNotMatch(agent, /voiceMloAwaitingZip/);

console.log('v7.4.10 MLO transfer state verification passed.');

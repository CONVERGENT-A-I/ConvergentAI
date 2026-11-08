import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const agent = readFileSync(new URL('../src/agent.ts', import.meta.url), 'utf8');
const intent = readFileSync(new URL('../src/lib/mlo-transfer-intent.ts', import.meta.url), 'utf8');

assert.match(agent, /pendingField === 'fd1_delivery'/);
assert.match(agent, /pendingField === 'fd2_delivery'/);
assert.match(agent, /pendingField === 'escalation_preference'/);
assert.match(agent, /source=\$\{contextualConfirmation \? 'contextual_confirmation' : 'explicit_request'\}/);
assert.match(intent, /isContextualLoanOfficerTransferConfirmation/);
assert.match(intent, /awaitingLoanOfficerChoice/);

console.log('v7.4.11 contextual MLO transfer verification passed.');

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const agent = readFileSync(new URL('../src/agent.ts', import.meta.url), 'utf8');
const manager = readFileSync(new URL('../src/context/session-context-manager.ts', import.meta.url), 'utf8');
const applicationService = readFileSync(new URL('../src/services/application-service.ts', import.meta.url), 'utf8');
const rootPackage = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
const backendPackage = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

assert.equal(rootPackage.version, '7.5.20');
assert.equal(backendPackage.version, '7.5.20');
assert(agent.includes('BUILD_VERSION=v7.5.20-dev-feature-integration'));
assert(agent.includes("STT_FLUX_EOT_TIMEOUT_MS', 1200"));
assert(agent.includes('speechDurationMs < 800'));
assert(agent.includes('consecutiveEmptyTranscripts < 2'));
assert(manager.includes('MONTHLY_DEBT_REASONABLE_LIMIT = 1_000_000'));
assert(manager.includes('Rejected unsafe ${field} value'));
assert(applicationService.includes('function safeDecimal'));
assert(applicationService.includes('monthlyDebtConfirmed: monthlyDebt !== null'));

console.log('v7.5.19 voice turn and financial state guard verification passed.');

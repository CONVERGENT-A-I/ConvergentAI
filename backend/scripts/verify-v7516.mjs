import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const agent = readFileSync(new URL('../src/agent.ts', import.meta.url), 'utf8');
const prompts = readFileSync(new URL('../src/prompts/ailana-system.ts', import.meta.url), 'utf8');
const rootPackage = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
const backendPackage = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

assert.equal(rootPackage.version, '7.5.20');
assert.equal(backendPackage.version, '7.5.20');
assert(agent.includes('BUILD_VERSION=v7.5.20-dev-feature-integration'));
assert(agent.includes('const hardLimit = scheduling ? 72 : 96'));
assert(agent.includes('NEVER spell or read back the email address'));
assert(agent.includes('Every spoken response MUST be 18 words or fewer'));
assert(agent.includes('No registered agent is available; starting scheduling'));
assert(agent.includes('Chat publication cancelled during normal room teardown'));
assert(prompts.includes('Keep normal spoken responses under 35 words'));

console.log('v7.5.16 conversation smoothness and scheduling brevity behavior verification passed.');

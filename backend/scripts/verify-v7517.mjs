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
assert(agent.includes('Math.min(hardLimit, Math.max(24, requested))'));
assert(agent.includes('maxTokens: maxCompletionTokens'));
assert.equal((agent.match(/this\.boundedLlmNode\(/g) || []).length, 12);
assert(prompts.includes('If more detail is needed, offer it in a later turn'));

console.log('v7.5.19 hard runtime response-budget verification passed.');

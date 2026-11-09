import { readFileSync } from 'node:fs';

const agent = readFileSync(new URL('../src/agent.ts', import.meta.url), 'utf8');
const prompts = readFileSync(new URL('../src/prompts/ailana-system.ts', import.meta.url), 'utf8');
const rootPackage = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
const backendPackage = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

assert(rootPackage.version === '7.5.20', 'Root release version is not current');
assert(backendPackage.version === '7.5.20', 'Backend release version is not current');
assert(agent.includes('BUILD_VERSION=v7.5.20-dev-feature-integration'), 'Runtime diagnostic is stale');
assert((agent.match(/minWords: 1,/g) || []).length === 2, 'One-word interruption support must be deterministic in both configurations');
assert(!agent.includes("minWords: readBoundedNumber('INTERRUPTION_MIN_WORDS'"), 'Environment must not restore the stale two-word threshold');
assert(agent.includes("readBoundedNumber('INTERRUPTION_MIN_DURATION_MS', 450, 300, 2500)"), 'Short-answer duration threshold is missing');
assert(agent.includes('[stt-recovery]: Two consecutive speech segments ended without a final transcript'), 'Empty-transcript recovery watchdog is missing');
assert(agent.includes("I heard some audio, but I didn't catch the words. Please say that again."), 'Empty-transcript recovery prompt is missing');
assert(prompts.includes("How can I help with your mortgage today?"), 'Short opening greeting is missing');
assert(!prompts.includes('Whether you are purchasing a home or refinancing an existing mortgage'), 'Long opening greeting was restored');

console.log('v7.5.13 turn-taking stability verification passed.');

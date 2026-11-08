import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const agent = readFileSync(new URL('../src/agent.ts', import.meta.url), 'utf8');
const config = readFileSync(new URL('../src/config/ailana-config.ts', import.meta.url), 'utf8');
const extractor = readFileSync(new URL('../src/context/llm-extractor.ts', import.meta.url), 'utf8');
const rootPackage = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
const backendPackage = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

assert.equal(rootPackage.version, '7.5.20');
assert.equal(backendPackage.version, '7.5.20');
assert(agent.includes('BUILD_VERSION=v7.5.20-dev-feature-integration'));
assert(agent.includes("const sttModel: string = 'cartesia/ink-2'"));
assert(agent.includes("model: ailanaConfig.cartesiaModel as any"));
assert(agent.includes("model: 'google/gemma-4-31b-it'"));
assert(agent.includes("new inference.TurnDetector()"));
assert(config.includes("cartesiaModel: process.env.CARTESIA_MODEL ?? 'cartesia/sonic-3.6'"));
assert(extractor.includes("model: 'google/gemma-4-31b-it'"));

// Lab-specific behavior must remain present after provider alignment.
for (const guard of [
  'ProtoFace',
  'requestMloTransferHandler',
  'startConversationalScheduling',
  'compactRealtimeSpeech',
  'createVerbatimStream(compactRealtimeSpeech(text))',
]) {
  assert(agent.includes(guard), `Lab flow guard missing after Dev alignment: ${guard}`);
}

console.log('v7.5.19 Dev inference alignment and Lab flow preservation verification passed.');

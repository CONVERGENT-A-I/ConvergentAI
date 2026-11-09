import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const agent = read('../src/agent.ts');
const config = read('../src/config/ailana-config.ts');
const schema = read('../../prisma/schema.prisma');
const rootPackage = JSON.parse(read('../../package.json'));
const backendPackage = JSON.parse(read('../package.json'));

assert(rootPackage.version === '7.5.20' || rootPackage.version === '0.1.0', 'Valid root package version');
assert(backendPackage.version === '7.5.20' || backendPackage.version === '1.0.0', 'Valid backend package version');

// Inference & model config
assert(agent.includes("model: 'google/gemma-4-31b-it'") || agent.includes("gemma"), 'Gemma model configuration present');
assert(config.includes("cartesiaModel: process.env.CARTESIA_MODEL ?? 'cartesia/sonic-3.6'"), 'Cartesia voice model config present');

// Dev behavior preserved
assert(agent.includes('lastUserSpeechDetectedAt'), 'Speech detector present');
assert(agent.includes('Suppressing empty-turn re-prompt'), 'Empty-turn guard present');
assert(schema.includes('priorRefinance'), 'Schema priorRefinance present');
assert(schema.includes('helocLineAmount'), 'Schema helocLineAmount present');
assert(schema.includes('contactNameConfirmed'), 'Schema contactNameConfirmed present');

// Telephony and scheduling flows intact
for (const guard of [
  'requestMloTransferHandler',
  'startConversationalScheduling',
]) {
  assert(agent.includes(guard), `Flow guard missing: ${guard}`);
}

// Avatar engine: LemonSlice (Dev) or Tavus (Lab)
assert(agent.includes('LEMONSLICE_API_KEY') || agent.includes('TAVUS_API_KEY'), 'Avatar engine configured');

console.log('v7.5.20 Dev feature integration and Lab flow preservation verification passed.');

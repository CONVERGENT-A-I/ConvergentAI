import { readFileSync } from 'node:fs';

const agent = readFileSync(new URL('../src/agent.ts', import.meta.url), 'utf8');
const context = readFileSync(new URL('../src/context/session-context-manager.ts', import.meta.url), 'utf8');

const requiredAgentGuards = [
  'REALTIME_SPEECH_WORD_LIMIT = 55',
  'compactRealtimeSpeech',
  'collectRealtimeSpeech',
  'processedText = createVerbatimStream(compactRealtimeSpeech(text))',
  'await collectRealtimeSpeech(text as ReadableStream<string>)',
  "STT_FLUX_EAGER_EOT_THRESHOLD', 0.92, 0.9, 0.99",
  "STT_FLUX_EOT_TIMEOUT_MS', 1200, 1000, 5000",
  'You have two options. I can run a no-impact soft credit review',
];

for (const guard of requiredAgentGuards) {
  if (!agent.includes(guard)) throw new Error(`v7.5.19 agent guard missing: ${guard}`);
}

for (const guard of ['one hundred or thousands dollars', "token === 'thousand'", 'recognized ? Math.round(total + current) : null']) {
  if (!context.includes(guard)) throw new Error(`v7.5.19 financial parser guard missing: ${guard}`);
}

console.log('v7.5.19 realtime speech and STT reliability verification passed.');

import { readFileSync } from 'node:fs';

const agent = readFileSync(new URL('../src/agent.ts', import.meta.url), 'utf8');
const intent = readFileSync(new URL('../src/lib/mlo-transfer-intent.ts', import.meta.url), 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

assert(
  (agent.match(/minWords: 1,/g) || []).length === 2 &&
    !agent.includes("minWords: readBoundedNumber('INTERRUPTION_MIN_WORDS'"),
  'Both agent and session must accept one-word transfer confirmations',
);
assert(intent.includes("'yeah', 'yes', 'yep', 'sure'"), 'Repeated affirmative vocabulary missing');
assert(intent.includes('(?:connect|reconnect|transfer|forward)'), 'Reconnect contextual action missing');

console.log('v7.5.7 deterministic MLO confirmation verification passed.');

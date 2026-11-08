import { existsSync, readFileSync } from 'node:fs';

const agent = readFileSync(new URL('../src/agent.ts', import.meta.url), 'utf8');
const esl = readFileSync(new URL('../src/services/freeswitch-esl.ts', import.meta.url), 'utf8');
const mediaUrl = new URL('../../src/components/floating-cta/media-guard.tsx', import.meta.url);
const listenerUrl = new URL('../../src/components/floating-cta/mlo-failure-listener.tsx', import.meta.url);
const assert = (condition, message) => { if (!condition) throw new Error(message); };

assert(
  agent.includes("readBoundedNumber('MLO_RECOVERY_UI_DELAY_MS', 200, 0, 1000)") &&
    agent.includes('setTimeout(resolve, recoveryDelayMs)'),
  'Bounded browser recovery grace period missing',
);
assert(esl.includes('registered=['), 'Per-queue registration diagnostics missing');
if (existsSync(mediaUrl) && existsSync(listenerUrl)) {
  const media = readFileSync(mediaUrl, 'utf8');
  const listener = readFileSync(listenerUrl, 'utf8');
  assert(media.includes('conversational scheduling override'), 'Scheduling media override missing');
  assert(listener.includes('setMicrophoneEnabled(true)'), 'Immediate microphone recovery missing');
}

console.log('v7.5.4 scheduling microphone recovery verification passed');

import { existsSync, readFileSync } from 'node:fs';

const agent = readFileSync(new URL('../src/agent.ts', import.meta.url), 'utf8');
const esl = readFileSync(new URL('../src/services/freeswitch-esl.ts', import.meta.url), 'utf8');
const uiUrl = new URL('../../src/components/floating-cta/index.tsx', import.meta.url);
const ui = existsSync(uiUrl) ? readFileSync(uiUrl, 'utf8') : null;
const assert = (condition, message) => { if (!condition) throw new Error(message); };

assert(agent.includes('getStableQueueAvailability(queue.queueExtension)'), 'Stable availability gate missing');
assert(esl.includes('MLO_AVAILABILITY_SETTLE_MS'), 'Availability settle configuration missing');
assert(esl.includes('MLO_AGENT_ANSWER_TIMEOUT_SECONDS || 15'), '15-second answer timeout missing');
assert(agent.includes('Restore the browser\'s Ailana UI and microphone before speaking'), 'Recovery must precede scheduling speech');
assert(agent.includes('enabled: false') && agent.includes('preemptiveTts: false'), 'Speculative generation must be disabled');
// The backend Docker stage intentionally copies only backend/ and prisma/.
// Validate the frontend recovery when the full repository is available, while
// keeping backend-only container builds self-contained.
if (ui !== null) {
  assert(
    ui.includes('setConversationalScheduling(true)') && ui.includes('flowPhaseRef.current = "live"'),
    'Frontend scheduling recovery missing',
  );
}

console.log('v7.5.3 transfer, scheduling recovery, and latency verification passed');

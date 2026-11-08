import { readFileSync } from 'node:fs';

const agent = readFileSync(new URL('../src/agent.ts', import.meta.url), 'utf8');
const sip = readFileSync(new URL('../src/utils/sipTransfer.ts', import.meta.url), 'utf8');
const esl = readFileSync(new URL('../src/services/freeswitch-esl.ts', import.meta.url), 'utf8');
const scheduling = readFileSync(new URL('../src/services/conversational-scheduling.ts', import.meta.url), 'utf8');
const routes = readFileSync(new URL('../src/routes/loan-officer.ts', import.meta.url), 'utf8');
const frontend = readFileSync(new URL('../../src/components/floating-cta/index.tsx', import.meta.url), 'utf8');
const dockerfile = readFileSync(new URL('../../backend.Dockerfile', import.meta.url), 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

assert(agent.includes('BUILD_VERSION=v7.5.20-dev-feature-integration'), 'Runtime version diagnostic is stale');
assert(agent.includes("voiceScheduling.active = true;\n              voiceScheduling.completedAt = 0;"), 'Scheduling must own resume events before UI recovery');
assert(agent.includes("readBoundedNumber('MLO_RECOVERY_UI_DELAY_MS', 200, 0, 1000)"), 'Bounded MLO recovery delay missing');
assert(agent.includes('isDeterministic ? 2200 : 1800'), 'Boundary extraction latency cap missing');
assert(!sip.includes('new Promise<void>((resolve) => setTimeout(resolve, 3500))'), 'Agent alert still blocks SIP dial');
assert(esl.includes("MLO_AVAILABILITY_SETTLE_MS || 350"), 'Fast stable-availability default missing');
assert(esl.includes("MLO_AGENT_ANSWER_POLL_MS || 350"), 'Fast answer polling default missing');
assert(scheduling.includes('const [notification, firstCustomerConfirmation] = await Promise.all(['), 'Booking emails are not parallel');
assert(routes.includes('const result = await new Promise<{ zip: string; city: string; region: string } | null>'), 'Backend geolocation still waits for the slowest provider');
assert(frontend.includes('chosen = await Promise.any('), 'Frontend geolocation still waits for the slowest provider');
assert(dockerfile.includes('COPY src/components/floating-cta/ ./src/components/floating-cta/'), 'Backend Docker build is missing frontend regression fixtures');

console.log('v7.5.9 latency and recovery verification passed.');

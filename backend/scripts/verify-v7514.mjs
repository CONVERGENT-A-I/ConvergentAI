import { readFileSync } from 'node:fs';

const agent = readFileSync(new URL('../src/agent.ts', import.meta.url), 'utf8');
const intent = readFileSync(new URL('../src/lib/mlo-transfer-intent.ts', import.meta.url), 'utf8');
const contact = readFileSync(new URL('../src/lib/contact-input.ts', import.meta.url), 'utf8');

if (!agent.includes('globalTurnInterceptor')) throw new Error('Global MLO interceptor is missing');
if (!agent.includes('BUILD_VERSION=v7.5.20-dev-feature-integration')) throw new Error('Runtime version diagnostic is stale');
if (!intent.includes("i(?:'d| would)?\\s+like\\s+to\\s+be")) throw new Error('Passive MLO connection intent is missing');
if (!contact.includes('appendPhoneFragment')) throw new Error('Phone fragment accumulator is missing');

console.log('v7.5.19 contact accumulation and deterministic MLO transfer verification passed.');

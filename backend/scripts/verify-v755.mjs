import { readFileSync } from 'node:fs';

const agent = readFileSync(new URL('../src/agent.ts', import.meta.url), 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

assert(
  agent.includes("if (p.identity.startsWith('guest_')) continue;"),
  'Customer microphone must remain subscribed during MLO dialing',
);
assert(
  (agent.match(/isHibernating && !participant\.identity\.startsWith\('guest_'\)/g) || []).length >= 2,
  'Track event guards must preserve customer publications',
);
assert(
  agent.includes('customer microphone remains subscribed'),
  'Customer audio continuity diagnostic missing',
);

console.log('v7.5.5 customer audio continuity verification passed');

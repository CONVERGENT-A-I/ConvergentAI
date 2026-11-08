// With SECTION_0_ENABLED off, every prompt must be byte-identical to the demo build
// (fixture captured before any Section 0 prompt change — Nov 6, 2026).
delete process.env.SECTION_0_ENABLED;

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { buildStaticInstructions, buildDynamicContext, GREETING_TEXT } from '../prompts/ailana-system.js';
import { ailanaConfig } from '../config/ailana-config.js';

console.log('🧪 Section 0 — flag-off parity (demo build unchanged)\n');

let total = 0;
function assert(cond: boolean, name: string, detail?: unknown) {
  total++;
  if (cond) console.log(`  ✅ ${total}. ${name}`);
  else { console.error(`  ❌ ${total}. FAILED: ${name}`, detail ?? ''); process.exit(1); }
}

const here = path.dirname(fileURLToPath(import.meta.url));
const fixture = JSON.parse(readFileSync(path.join(here, 'fixtures', 'demo-prompts.json'), 'utf8'));

assert(ailanaConfig.section0Enabled === false, 'flag is off when SECTION_0_ENABLED is unset');
assert(GREETING_TEXT === fixture.GREETING_TEXT, 'greeting text unchanged');

for (const [name, c] of Object.entries<any>(fixture)) {
  if (name === 'GREETING_TEXT') continue;
  const s = buildStaticInstructions(c.stage, c.profile);
  const firstDiff = (a: string, b: string) => { let i = 0; while (i < a.length && a[i] === b[i]) i++; return i; };
  assert(s === c.static, `static prompt identical — ${name} (stage ${c.stage})`, s === c.static ? '' : `first difference at char ${firstDiff(s, c.static)}`);
  const d = buildDynamicContext(c.profile, c.pending, c.stage, false);
  assert(d === c.dynamic, `dynamic context identical — ${name} (pending ${c.pending})`, d === c.dynamic ? '' : `first difference at char ${firstDiff(d, c.dynamic)}`);
}

assert(!/KNOWN FACTS|NO-REPEAT RULE|Section 0/.test(buildStaticInstructions('1', {}) + buildDynamicContext({}, 'mortgage_goal', '1')), 'no Section 0 text anywhere when the flag is off');

console.log(`\n✨ ALL ${total} SECTION 0 FLAG-OFF PARITY TESTS PASSED!`);

import { applySafetyNet, tridGateScript, REDACTED } from '../section0/safety-net.js';

console.log('🧪 Section 0 — SSN / street-address safety net unit tests\n');

let total = 0;
function assert(cond: boolean, name: string, detail?: unknown) {
  total++;
  if (cond) console.log(`  ✅ ${total}. ${name}`);
  else { console.error(`  ❌ ${total}. FAILED: ${name}`, detail ?? ''); process.exit(1); }
}

// Capture console output to prove matched text is never logged.
const logged: string[] = [];
const origLog = console.log;
const capture = (fn: () => void) => { console.log = (...a: unknown[]) => { logged.push(a.join(' ')); }; try { fn(); } finally { console.log = origLog; } };

function caught(input: string, kind: 'ssn' | 'address', secret: string, name: string) {
  let r!: ReturnType<typeof applySafetyNet>;
  capture(() => { r = applySafetyNet(input); });
  assert(r[kind] === true, `${name} — detected`, r);
  assert(!r.text.includes(secret) && r.text.includes(REDACTED), `${name} — redacted from text`, r.text);
}

function notCaught(input: string, name: string) {
  let r!: ReturnType<typeof applySafetyNet>;
  capture(() => { r = applySafetyNet(input); });
  assert(!r.ssn && !r.address && r.text === input, `${name} — left alone`, r);
}

// ── SSN ──
caught('My SSN is 412-55-6789 and I want to buy a house', 'ssn', '6789', 'formatted 412-55-6789');
caught('it is 412 55 6789', 'ssn', '6789', 'formatted 412 55 6789');
caught('my social is 412556789', 'ssn', '412556789', 'unformatted after "my social"');
caught("Let me give you my social so you can run me, it's 4-1-2...", 'ssn', '4-1-2', 'test #11 — cut off mid-sentence');
caught('my social security number is four one two five five six seven eight nine', 'ssn', 'four one two', 'spoken digits');

// ── Street address ──
caught('The house is 1418 Riverview Drive, listed at 365.', 'address', 'Riverview', 'test #11 — 1418 Riverview Drive');
caught('we live at 22 Oak St in Chattanooga', 'address', 'Oak', '22 Oak St');
caught('it is 900 W Main Street', 'address', 'Main', '900 W Main Street');
caught('the place at 5 lakeview avenue', 'address', 'lakeview', 'lower-case full street type');

// ── Test #11 as a whole: both caught, price still there for fact capture ──
{
  let r!: ReturnType<typeof applySafetyNet>;
  capture(() => { r = applySafetyNet("The house is 1418 Riverview Drive, listed at 365. Let me give you my social so you can run me, it's 4-1-2..."); });
  assert(r.ssn && r.address, 'test #11 — SSN and address both detected');
  assert(r.text.includes('listed at 365'), 'test #11 — price kept for fact capture', r.text);
  assert(!/1418|Riverview|4-1-2/.test(r.text), 'test #11 — nothing sensitive left', r.text);
}

// ── Must NOT be caught (ordinary mortgage talk) ──
notCaught('I make 84,000 per year and have 1200.00 per month in debt and my credit score is 710.', 'income, debt, credit');
notCaught('I owe 310 on a house worth 450', 'balance and value');
notCaught('zip code 37421 in Chattanooga', 'zip code');
notCaught('I get 2,400 Social Security and a 1,900 pension', 'Social Security income (test #6)');
notCaught('my social security is 2,400 a month', '"my social security" + monthly amount');
notCaught("I'll put 100 down either way", '"100 down either way" is not an address');
notCaught('We owe 900 on a car and 200 on a student loan', 'debts');
notCaught('I make about 52 an hour as an RN', 'hourly pay');
notCaught('Rocket offered me 6.1 with no points', 'competitor rate');

// ── Never logs the matched text ──
assert(!logged.some((l) => /6789|Riverview|412556789|Oak St|four one two/.test(l)), 'matched text never appears in logs', logged);
assert(logged.some((l) => l.includes('[safety-net]')), 'detection is logged (without the value)');

// ── TRID gate script (verbatim) ──
assert(tridGateScript({ ssn: true, address: false }) === "I'm not able to take that information here, and I haven't recorded it. If you move forward, your loan officer will collect it securely. For now, let's keep going.", 'short TRID gate — SSN');
assert(tridGateScript({ ssn: false, address: true }).endsWith('A city or zip code is all I need.'), 'short TRID gate — address adds city/zip line');

console.log(`\n✨ ALL ${total} SECTION 0 SAFETY NET TESTS PASSED!`);

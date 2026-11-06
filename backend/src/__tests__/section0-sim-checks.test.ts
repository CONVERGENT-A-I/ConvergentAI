// Section 0 — end-of-simulation data check: stored facts vs scenario userdata.expected_facts.
import { FactLedger } from '../section0/fact-ledger.js';
import { checkExpectedFacts } from '../section0/sim-checks.js';

console.log('🧪 Section 0 — simulation expected-facts check\n');

let total = 0;
function assert(cond: boolean, name: string, detail?: unknown) {
  total++;
  if (cond) console.log(`  ✅ ${total}. ${name}`);
  else { console.error(`  ❌ ${total}. FAILED: ${name}`, JSON.stringify(detail ?? '')); process.exit(1); }
}

const ledger = new FactLedger({ log: () => {} });
ledger.upsert({ key: 'occupancy', value: 'primary' }, 1, '0');
ledger.upsert({ key: 'debt.monthly_total', value: 300 }, 1, '0');
ledger.upsert({ key: 'credit.borrower', value: { score: 710 } }, 1, '0');
ledger.upsert({ key: 'credit.co_borrower', value: { score: 745 } }, 1, '0');
ledger.upsert({ key: 'income.borrower', value: [{ type: 'salary', amount: 60000, frequency: 'yearly', annual: 60000 }] }, 1, '0');
ledger.upsert({ key: 'income.co_borrower', value: [{ type: 'salary', amount: 85000, frequency: 'yearly', annual: 85000 }] }, 1, '0');
const profile: any = { transaction_type: 'TT-PUR', section0_complete: true, borrower_name: 'Jordan' };

{
  const m = checkExpectedFacts({
    track: 'TT-PUR', numbers: { 'debt.monthly_total': 300 }, values: { occupancy: 'primary' },
    credit: 710, co_credit: 745, income_total_annual: 145000, not_numbers: { 'debt.monthly_total': 3000 },
    never_stored: ['412-55', 'Riverview'],
  }, ledger, profile);
  assert(m.length === 0, 'everything matches → no misses', m);
}
assert(checkExpectedFacts({ numbers: { 'debt.monthly_total': 303 } }, ledger, profile).length === 0, 'numbers within 2% match');
assert(checkExpectedFacts({ numbers: { 'debt.monthly_total': 3000 } }, ledger, profile).length === 1, 'wrong number → miss');
assert(checkExpectedFacts({ numbers: { 'funds.total': 25000 } }, ledger, profile).length === 1, 'missing fact → miss');
assert(checkExpectedFacts({ values: { occupancy: 'investment' } }, ledger, profile).length === 1, 'wrong value → miss');
assert(checkExpectedFacts({ credit: 700 }, ledger, profile).length === 1, 'wrong credit score → miss');
assert(checkExpectedFacts({ income_total_annual: 85000 }, ledger, profile).length === 1, 'wrong household income → miss');
assert(checkExpectedFacts({ track: 'TT-REF' }, ledger, profile).length === 1, 'wrong track → miss');
assert(checkExpectedFacts({ track: null }, ledger, profile).length === 1, 'track set when none allowed (holdout) → miss');
assert(checkExpectedFacts({ track: null }, ledger, { transaction_type: null } as any).length === 0, 'no track, none allowed → ok');
{
  const bad = new FactLedger({ log: () => {} });
  bad.upsert({ key: 'debt.monthly_total', value: 3000 }, 1, '0');
  assert(checkExpectedFacts({ not_numbers: { 'debt.monthly_total': 3000 } }, bad, profile).length === 1, 'corrected value still stored → miss');
}
{
  const m = checkExpectedFacts({ never_stored: ['4-1-2 5 5'] }, ledger, { ...profile, notes: 'ssn 41255' });
  assert(m.length === 1 && !m[0]!.includes('41255'), 'forbidden text found (spacing/dashes ignored) and not echoed in the message', m);
}

console.log(`\n✨ ALL ${total} SECTION 0 SIM-CHECK TESTS PASSED!`);

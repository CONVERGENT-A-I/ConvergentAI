import { FactLedger } from '../section0/fact-ledger.js';
import type { IncomeComponent } from '../section0/fact-schema.js';

console.log('🧪 Section 0 — Fact Ledger unit tests\n');

let total = 0;
function assert(cond: boolean, name: string, detail?: unknown) {
  total++;
  if (cond) console.log(`  ✅ ${total}. ${name}`);
  else { console.error(`  ❌ ${total}. FAILED: ${name}`, detail ?? ''); process.exit(1); }
}

const logs: string[] = [];
const quiet = { log: (l: string) => logs.push(l) };

// 1. New fact stored
{
  const L = new FactLedger(quiet);
  const r = L.upsert({ key: 'credit.borrower', value: { score: 710 }, raw: 'my credit score is 710' }, 1, '0');
  assert(r === 'added', 'new fact is added');
  assert(L.value<{ score: number }>('credit.borrower')?.score === 710, 'value is readable');
  assert(L.get('credit.borrower')?.status === 'stated', 'status defaults to "stated"');
}

// 2. Correction overwrites and keeps history (A11: 3,000 → 300)
{
  const L = new FactLedger(quiet);
  L.upsert({ key: 'debt.monthly_total', value: 3000, raw: '3,000 a month' }, 1, '0');
  const r = L.upsert({ key: 'debt.monthly_total', value: 300, raw: '300 a month' }, 2, '2');
  assert(r === 'corrected', 'different value is a correction');
  assert(L.value('debt.monthly_total') === 300, 'latest value wins (300)');
  assert(L.get('debt.monthly_total')?.history[0]?.value === 3000, 'old value kept in history (3000)');
  assert(L.get('debt.monthly_total')?.stage === '2', 'stage/turn of the correction recorded');
}

// 3. Same value again → unchanged, but status can be promoted
{
  const L = new FactLedger(quiet);
  L.upsert({ key: 'purchase.price', value: 365000 }, 1, '0');
  const r = L.upsert({ key: 'purchase.price', value: 365000, status: 'confirmed' }, 3, '2');
  assert(r === 'unchanged', 'same value is not a correction');
  assert(L.get('purchase.price')?.status === 'confirmed', 'status promoted to confirmed');
  assert(L.get('purchase.price')?.history.length === 0, 'no history entry for a repeat');
}

// 4. Declined → settled, never asked again, but no usable value
{
  const L = new FactLedger(quiet);
  L.markDeclined('borrower.first_name', 2, '1');
  assert(L.isSettled('borrower.first_name'), 'declined fact is settled (never ask again)');
  assert(L.value('borrower.first_name') === undefined, 'declined fact has no usable value');
  assert(L.declined().length === 1 && L.known().length === 0, 'declined listed separately from known');
}

// 5. Needs clarification → not usable, listed as pending
{
  const L = new FactLedger(quiet);
  L.upsert({ key: 'income.borrower', value: [{ type: 'hourly', amount: 52, frequency: 'hourly', annual: null }], status: 'needs_clarification', clarify: 'weekly_hours' }, 1, '0');
  assert(L.value('income.borrower') === undefined, 'pending clarification is not usable yet');
  assert(L.pendingClarifications()[0]?.clarify === 'weekly_hours', 'pending clarification listed with reason');
  assert(!L.isSettled('income.borrower'), 'pending clarification is not settled');
}

// 6. Income merges by type (a later turn adds a source, or corrects one)
{
  const L = new FactLedger(quiet);
  const salary: IncomeComponent = { type: 'salary', amount: 60000, frequency: 'yearly', annual: 60000 };
  const commission: IncomeComponent = { type: 'commission', amount: 40000, frequency: 'yearly', annual: 40000, variable: true };
  L.upsert({ key: 'income.borrower', value: [salary] }, 1, '0');
  L.upsert({ key: 'income.borrower', value: [commission] }, 2, '0');
  const list = L.value<IncomeComponent[]>('income.borrower')!;
  assert(list.length === 2, 'new income type is added, earlier one kept');
  L.upsert({ key: 'income.borrower', value: [{ ...salary, amount: 65000, annual: 65000 }] }, 3, '2');
  const list2 = L.value<IncomeComponent[]>('income.borrower')!;
  assert(list2.length === 2 && list2.find((c) => c.type === 'salary')?.annual === 65000, 'same income type is corrected in place');
}

// 7. Never stores forbidden or unknown keys
{
  const L = new FactLedger(quiet);
  assert(L.upsert({ key: 'borrower.ssn', value: '412556789' }, 1, '0') === 'rejected', 'SSN key rejected');
  assert(L.upsert({ key: 'property.street_address', value: '1418 Riverview Drive' }, 1, '0') === 'rejected', 'street address key rejected');
  assert(L.upsert({ key: 'borrower.ethnicity', value: 'x' }, 1, '0') === 'rejected', 'protected-class key rejected');
  assert(L.upsert({ key: 'made.up.key', value: 1 }, 1, '0') === 'rejected', 'unknown key rejected');
  assert(L.size() === 0, 'nothing stored');
  assert(!logs.some((l) => l.includes('412556789') || l.includes('Riverview')), 'rejected values never logged');
}

// 8. Serialize → hydrate round trip (reconnect / resume)
{
  const L = new FactLedger(quiet);
  L.upsert({ key: 'goal.primary', value: 'purchase', raw: 'drove by a house' }, 1, '0');
  L.upsert({ key: 'debt.monthly_total', value: 3000 }, 1, '0');
  L.upsert({ key: 'debt.monthly_total', value: 300 }, 1, '0');
  L.markDeclined('borrower.first_name', 2, '1');
  const json = JSON.parse(JSON.stringify(L.serialize()));
  const H = FactLedger.hydrate(json, quiet);
  assert(H.value('goal.primary') === 'purchase', 'hydrated value');
  assert(H.get('debt.monthly_total')?.history.length === 1, 'hydrated history');
  assert(H.isSettled('borrower.first_name') && H.value('borrower.first_name') === undefined, 'hydrated declined status');
  const bad = FactLedger.hydrate({ v: 1, entries: [{ key: 'borrower.ssn', value: '1', status: 'stated' }] }, quiet);
  assert(bad.size() === 0, 'hydrate drops forbidden keys');
  assert(FactLedger.hydrate(null, quiet).size() === 0, 'hydrate tolerates empty input');
}

// 9. Clone is independent
{
  const L = new FactLedger(quiet);
  L.upsert({ key: 'occupancy', value: 'primary' }, 1, '0');
  const C = L.clone();
  C.upsert({ key: 'occupancy', value: 'investment' }, 2, '0');
  assert(L.value('occupancy') === 'primary' && C.value('occupancy') === 'investment', 'clone does not share state');
}

console.log(`\n✨ ALL ${total} SECTION 0 FACT LEDGER TESTS PASSED!`);

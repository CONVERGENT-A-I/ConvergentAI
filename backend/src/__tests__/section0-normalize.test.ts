import {
  parseAmount, normalizeAmount, normalizeIncome, totalAnnualIncome, normalizeCredit,
  creditToProfileString, normalizeDownPayment, checkPlausibility,
} from '../section0/normalize.js';

console.log('🧪 Section 0 — normaliser unit tests\n');

let total = 0;
function assert(cond: boolean, name: string, detail?: unknown) {
  total++;
  if (cond) console.log(`  ✅ ${total}. ${name}`);
  else { console.error(`  ❌ ${total}. FAILED: ${name}`, detail ?? ''); process.exit(1); }
}

// ── parseAmount ──
assert(parseAmount('84,000') === 84000, '"84,000" → 84000');
assert(parseAmount('$1,200.00') === 1200, '"$1,200.00" → 1200');
assert(parseAmount('25 thousand') === 25000, '"25 thousand" → 25000');
assert(parseAmount('84k') === 84000, '"84k" → 84000');
assert(parseAmount('1.3k') === 1300, '"1.3k" → 1300');
assert(parseAmount('1.2 million') === 1200000, '"1.2 million" → 1200000');
assert(parseAmount('none') === null, 'no number → null');

// ── shorthand magnitude ──
assert(normalizeAmount('365', 'large').value === 365000, 'price "365" → 365,000');
assert(normalizeAmount(450, 'large').value === 450000, 'value 450 → 450,000');
assert(normalizeAmount(25, 'large').value === 25000, 'funds 25 → 25,000');
assert(normalizeAmount(1200, 'monthly').value === 1200, 'monthly debt 1200 stays 1200');
assert(normalizeAmount(450, 'monthly').value === 450, 'monthly payment 450 stays 450');
assert(normalizeAmount(4, 'large').clarify === 'magnitude', 'price "4" → ask (magnitude)');
assert(normalizeAmount(0, 'large').value === 0, '0 stays 0 (paid off)');

// ── income ──
{
  const r = normalizeIncome({ type: 'salary', amount: '84,000', frequency: 'yearly' });
  assert(r.value?.annual === 84000 && !r.clarify, '"84,000 per year" → 84,000/yr');
}
{
  const r = normalizeIncome({ type: 'salary', amount: 68 });
  assert(r.value?.annual === 68000 && r.value.frequency === 'yearly', '"I make 68" → 68,000/yr');
}
{
  const r = normalizeIncome({ type: 'hourly', amount: 52 });
  assert(r.clarify === 'weekly_hours' && r.value?.annual === null, '"52 an hour" → ask weekly hours (never assume 40)');
}
{
  const r = normalizeIncome({ type: 'hourly', amount: 52, hours_per_week: 36 });
  assert(r.value?.annual === 52 * 36 * 52 && !r.clarify, '"52 an hour, 36 hours" → 97,344/yr');
}
{
  const r = normalizeIncome({ type: 'salary', amount: 4200, frequency: 'biweekly' });
  assert(r.value?.annual === 109200, '"4,200 every two weeks" → 109,200/yr');
}
{
  const r = normalizeIncome({ type: 'salary', amount: 3100 });
  assert(r.clarify === 'frequency', '"3,100" with no frequency → ask monthly or yearly');
}
{
  const r = normalizeIncome({ type: 'social_security', amount: 2400 });
  assert(r.value?.annual === 28800 && r.value.frequency === 'monthly', 'Social Security 2,400 (no frequency) → monthly');
}
{
  const r = normalizeIncome({ type: 'va_disability', amount: 1800, frequency: 'monthly' });
  assert(r.value?.annual === 21600, 'VA disability 1,800/mo → 21,600/yr');
}
{
  const r = normalizeIncome({ type: 'salary', amount: 140000 });
  assert(r.value?.annual === 140000 && r.value.frequency === 'yearly', '140,000 with no frequency → yearly');
}
{
  const r = normalizeIncome({ type: 'commission', amount: 40, frequency: 'yearly', variable: true, history: [40, 25] });
  assert(r.value?.annual === 40000 && r.value.history?.join() === '40000,25000', 'commission 40 (yearly) + history 40/25 → thousands');
}

// ── total income ──
{
  const t = totalAnnualIncome([
    { type: 'salary', amount: 85000, frequency: 'yearly', annual: 85000 },
    { type: 'salary', amount: 60000, frequency: 'yearly', annual: 60000 },
  ]);
  assert(t.total === 145000 && t.complete, 'two salaries sum');
}
{
  const t = totalAnnualIncome([
    { type: 'hourly', amount: 52, frequency: 'hourly', annual: null },
    { type: 'salary', amount: 48000, frequency: 'yearly', annual: 48000 },
  ]);
  assert(!t.complete, 'hourly without hours → total incomplete (do not sync gross income)');
}
{
  const t = totalAnnualIncome([
    { type: 'salary', amount: 61000, frequency: 'yearly', annual: 61000 },
    { type: 'alimony', amount: 1500, frequency: 'monthly', annual: 18000 },
  ]);
  assert(t.total === 61000 && t.complete, 'alimony not counted unless the borrower wants it counted');
  const t2 = totalAnnualIncome([
    { type: 'salary', amount: 61000, frequency: 'yearly', annual: 61000 },
    { type: 'alimony', amount: 1500, frequency: 'monthly', annual: 18000, counted: true },
  ]);
  assert(t2.total === 79000, 'alimony counted when the borrower opts in');
}

// ── credit ──
assert(normalizeCredit('710').value?.score === 710, '"710" → 710');
assert(normalizeCredit(710000).value?.score === 710, 'STT artifact 710000 → 710');
{
  const c = normalizeCredit('around 680').value!;
  assert(c.score === 680 && c.approx === true, '"around 680" → 680 (approx)');
}
{
  const c = normalizeCredit('in the 770s').value!;
  assert(c.range === '770s' && c.score === 775 && c.approx === true, '"in the 770s" → range 770s');
  assert(creditToProfileString(c) === '770s', 'profile string for a range');
}
assert(normalizeCredit('700-749').value?.range === '700-749', '"700-749" → range');
assert(normalizeCredit('my credit is good').value?.tier === 'Good', '"good" → tier Good');
assert(normalizeCredit('very good').value?.tier === 'Very Good', '"very good" → tier Very Good');
assert(normalizeCredit('950').clarify === 'magnitude', 'out-of-range score → ask');

// ── down payment ──
{
  const d = normalizeDownPayment({ percent: 20 }, 400000).value!;
  assert(d.percent === 20 && d.amount === 80000, '20 percent of 400,000 → 80,000');
}
{
  const d = normalizeDownPayment({ percent: '10' }, null).value!;
  assert(d.percent === 10 && d.amount === undefined, 'percent kept until the price is known');
}
assert(normalizeDownPayment({ amount: 100 }).value?.amount === 100000, '"100 down" → 100,000');

// ── plausibility ──
assert(checkPlausibility({ price: 300000, downPayment: 500000 })[0]?.key === 'purchase.down_payment', 'down payment > price → confirm');
assert(checkPlausibility({ price: 400000, downPayment: 80000 }).length === 0, 'normal down payment → no issue');
assert(checkPlausibility({ refiValue: 290000, refiBalance: 300000 }).length === 0, 'slightly underwater is legitimate → no issue');
assert(checkPlausibility({ refiValue: 200000, refiBalance: 400000 })[0]?.key === 'refi.balance', 'balance 2× value → confirm');

console.log(`\n✨ ALL ${total} SECTION 0 NORMALISER TESTS PASSED!`);

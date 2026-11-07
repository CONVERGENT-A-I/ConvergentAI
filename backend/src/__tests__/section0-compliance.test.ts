// Section 0 — compliance notes chosen by code (flags + ledger), each shown once.
import { FactLedger } from '../section0/fact-ledger.js';
import { complianceNotes, privacyScript, stateCode, PRIVACY_POLICY_URL } from '../section0/compliance-notes.js';

console.log('🧪 Section 0 — compliance notes\n');

let total = 0;
function assert(cond: boolean, name: string, detail?: unknown) {
  total++;
  if (cond) console.log(`  ✅ ${total}. ${name}`);
  else { console.error(`  ❌ ${total}. FAILED: ${name}`, JSON.stringify(detail ?? '')); process.exit(1); }
}

const empty = () => new FactLedger({ log: () => {} });
const base = { shown: [] as string[], channel: 'voice' as const, continueWith: "let's pick up with your refinance", licensedStates: ['TN'] };
const ids = (n: Array<{ id: string }>) => n.map((x) => x.id);

// Privacy — David's approved wording, voice vs text
{
  const voice = privacyScript('voice', "let's pick up with your refinance");
  assert(voice.startsWith("That's a fair question to ask before we start. I'm provided by ConvergentAI"), 'voice script starts with the approved wording');
  assert(voice.includes("so I'll put the link on your screen") && !voice.includes('http'), 'voice: link goes on screen, URL never spoken');
  assert(voice.endsWith("let's pick up with your refinance."), 'voice ends by returning to their goal');
  const text = privacyScript('text', "let's pick up with your refinance");
  assert(text.includes(PRIVACY_POLICY_URL) && text.includes('You can also submit a request about your information there.'), 'text version includes the policy link and the request line');
  const n = complianceNotes({ ...base, flags: ['privacy_question'], ledger: empty() });
  assert(n.length === 1 && n[0]!.id === 'privacy' && n[0]!.text.includes('word for word'), 'privacy flag → approved answer, word for word');
}

// Flag-driven notes
{
  const n = complianceNotes({ ...base, flags: ['approval_guarantee_or_preapproval_letter', 'protected_class_topic', 'hardship_or_delinquency', 'documents_offered'], ledger: empty() });
  assert(JSON.stringify(ids(n)) === JSON.stringify(['preapproval', 'protected_class', 'hardship', 'documents']), 'each flag → its note', ids(n));
  assert(n.find((x) => x.id === 'hardship')!.text.includes('HUD-approved housing counselor'), 'hardship note offers a HUD-approved housing counselor');
  assert(/Do NOT promise or suggest a refinance/.test(n.find((x) => x.id === 'hardship')!.text), 'hardship note forbids promising a refinance');
  assert(complianceNotes({ ...base, flags: ['protected_class_topic'], ledger: empty(), shown: ['protected_class'] }).length === 0, 'a note already shown is never repeated');
}

// Fact-driven notes
{
  const l = empty();
  l.upsert({ key: 'income.borrower', value: [{ type: 'salary', amount: 61000, frequency: 'yearly', annual: 61000 }, { type: 'alimony', amount: 1500, frequency: 'monthly', annual: 18000 }] }, 1, '0');
  assert(ids(complianceNotes({ ...base, flags: [], ledger: l })).includes('support_income'), 'alimony stated, counting not said → disclosure note');
  const l2 = empty();
  l2.upsert({ key: 'income.borrower', value: [{ type: 'alimony', amount: 1500, frequency: 'monthly', annual: 18000, counted: true }] }, 1, '0');
  assert(!ids(complianceNotes({ ...base, flags: [], ledger: l2 })).includes('support_income'), 'already said to count it → no note');
  const l3 = empty();
  l3.upsert({ key: 'co_borrower.role', value: 'co_signer' }, 1, '0');
  assert(ids(complianceNotes({ ...base, flags: [], ledger: l3 })).includes('each_authorizes'), 'co-signer → each borrower authorizes their own credit check');
}

// Footprint (D3: licensed states from config)
{
  assert(stateCode('Georgia') === 'GA' && stateCode('az') === 'AZ' && stateCode('TN') === 'TN' && stateCode('Narnia') === null, 'state names and codes recognised');
  const ga = empty();
  ga.upsert({ key: 'location.area', value: { city: 'Dalton', state: 'Georgia' } }, 1, '0');
  const n = complianceNotes({ ...base, flags: [], ledger: ga });
  assert(ids(n).includes('footprint') && n.find((x) => x.id === 'footprint')!.text.includes('Georgia'), 'home outside licensed states → loan officer must confirm (names the state)');
  assert(!ids(complianceNotes({ ...base, flags: [], ledger: ga, licensedStates: ['TN', 'GA'] })).includes('footprint'), 'licensed state → no footprint note');
  const tn = empty();
  tn.upsert({ key: 'location.area', value: { city: 'Chattanooga', state: 'TN' } }, 1, '0');
  assert(complianceNotes({ ...base, flags: [], ledger: tn }).length === 0, 'in-footprint home, no flags → no notes');
}

console.log(`\n✨ ALL ${total} SECTION 0 COMPLIANCE TESTS PASSED!`);

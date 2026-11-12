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

// Short TRID gate (Revised spec, verbatim) when the safety net removed an SSN / address
{
  const n = complianceNotes({ ...base, flags: [], ledger: empty(), safetyHit: { ssn: true, address: true }, turn: 1 });
  const t = n.find((x) => x.id.startsWith('trid_gate'))?.text ?? '';
  assert(t.includes("I'm not able to take that information here, and I haven't recorded it.") && t.includes('A city or zip code is all I need.'), 'SSN + address → short TRID gate, verbatim, with the city/zip line');
  assert(/ask for just the city or zip code/.test(t), 'then asks for the city or zip as the next question (#11, A9)');
  const known = empty();
  known.upsert({ key: 'location.area', value: { city: 'Chattanooga', state: 'TN' } }, 1, '0');
  assert(!/ask for just the city/.test(complianceNotes({ ...base, flags: [], ledger: known, safetyHit: { ssn: true, address: false }, turn: 2 })[0]!.text), 'city already known → does not ask it again');
  const second = complianceNotes({ ...base, flags: [], ledger: empty(), safetyHit: { ssn: true, address: false }, turn: 5, shown: ['trid_gate:1'] });
  assert(second.length === 1, 'a second SSN attempt gets the gate again (not once per session)');
}
{
  const joint = empty();
  joint.upsert({ key: 'co_borrower.present', value: true }, 1, '0');
  assert(ids(complianceNotes({ ...base, flags: [], ledger: joint })).includes('each_authorizes'), 'any co-borrower → each borrower authorizes their own credit check (#18)');
}

{
  const n = complianceNotes({ ...base, flags: [], ledger: empty(), intent: 'ends_conversation', turn: 7 });
  assert(n.length === 1 && /do NOT ask another question/.test(n[0]!.text), 'borrower wraps up → warm goodbye, no further question');
}

console.log(`\n✨ ALL ${total} SECTION 0 COMPLIANCE TESTS PASSED!`);

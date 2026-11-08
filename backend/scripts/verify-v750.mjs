import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const checks = [
  ['ProtoFace avatar', read('src/agent.ts'), "@livekit/agents-plugin-protoface"],
  ['contextual MLO transfer', read('src/agent.ts'), 'isContextualLoanOfficerTransferConfirmation'],
  ['conversational scheduling', read('src/agent.ts'), 'startConversationalScheduling'],
  ['Google Calendar scheduling', read('src/routes/scheduling.ts'), 'isGoogleCalendarConfigured'],
  ['Refinance prompt', read('src/prompts/ailana-system.ts'), 'buildStage2RefinanceInstructions'],
  ['HELOC prompt', read('src/prompts/ailana-system.ts'), 'buildStage2HelocInstructions'],
  ['Refinance findings', read('src/prompts/stage25-affordability.ts'), 'RFD1 (Conditional eligibility'],
  ['HELOC findings', read('src/prompts/stage25-affordability.ts'), 'HFD1 (Conditional credit line approval'],
];
const missing = checks.filter(([, source, marker]) => !source.includes(marker));
if (missing.length) {
  for (const [name] of missing) console.error(`Missing v7.5.0 integration marker: ${name}`);
  process.exit(1);
}
console.log('v7.5.0 Lab and developer feature verification passed.');

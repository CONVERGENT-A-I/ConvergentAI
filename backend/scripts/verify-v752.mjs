import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = readFileSync(resolve(import.meta.dirname, '../src/agent.ts'), 'utf8');
const typedRoutingLog = source.indexOf('[voice-scheduling]: routing typed customer turn to scheduling tools');
const genericMortgageTurn = source.indexOf('await contextManager.onUserTurn(messageText);', typedRoutingLog);

const required = [
  'const applyConversationalSchedulingInstructions = () =>',
  '(vadAgent as any)._instructions = schedulingInstructions',
  'applyConversationalSchedulingInstructions();',
  '[voice-scheduling]: routing typed customer turn to scheduling tools',
  'session.generateReply({ userInput: messageText });',
];

for (const marker of required) {
  if (!source.includes(marker)) {
    console.error(`Missing v7.5.2 scheduling state marker: ${marker}`);
    process.exit(1);
  }
}

if (typedRoutingLog < 0 || genericMortgageTurn < 0 || typedRoutingLog > genericMortgageTurn) {
  console.error('Typed scheduling routing must execute before the generic mortgage extraction path.');
  process.exit(1);
}

console.log('v7.5.2 typed scheduling state verification passed.');

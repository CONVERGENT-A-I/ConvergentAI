const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const esl = read('backend/src/services/freeswitch-esl.ts');
const alert = read('backend/src/routes/loan-officer.ts');
const agent = read('backend/src/agent.ts');
const ui = read('src/components/floating-cta/index.tsx');

assert.match(esl, /getQueueMembers\(queueExtension\)/);
assert.match(esl, /callcenter_config queue reload \$\{queue\}/);
assert.match(esl, /callcenter_config tier del \$\{queue\} \$\{staleAgent\}/);
assert.match(esl, /sofia_contact \$\{member\.extension\}@\$\{domain\}/);
assert.match(esl, /available: registered && isAvailable\(status, state\)/);

assert.doesNotMatch(alert, /process\.env\.RINGOTEL_QUEUE_EXT \|\| "9400"/);
assert.match(alert, /const members = await getQueueMembers\(queueExt\)/);
assert.match(alert, /if \(!zipWasMapped\)/);

const closeAvatarAt = agent.indexOf('await activeAvatarSession.aclose()');
const dialSipAt = agent.indexOf('const res = await transferRoomToMloQueue');
// v7.4.7 keeps ProtoFace hibernated during ringing so the same session can
// recover into conversational scheduling; close only after SIP answers.
assert(closeAvatarAt >= 0 && dialSipAt >= 0 && closeAvatarAt > dialSipAt);
assert.match(ui, /isAgentReady && pendingMode !== "loan-officer"/);
assert.match(ui, /setShowCalendarScheduler\(true\)/);

console.log('v7.4.2 routing regression checks passed.');

const fs = require('node:fs');

const backend = fs.readFileSync('backend/src/agent.ts', 'utf8');
const mediaGuard = fs.readFileSync('src/components/floating-cta/media-guard.tsx', 'utf8');
const floatingCta = fs.readFileSync('src/components/floating-cta/index.tsx', 'utf8');

function expect(source, fragment, description) {
  if (!source.includes(fragment)) throw new Error(`Missing ${description}: ${fragment}`);
}

expect(backend, 'mloTransferPending = true;\n        // Freeze the AI pipeline immediately', 'immediate handoff freeze');
expect(backend, 'isHibernating = true;', 'AI hibernation');
expect(backend, 'AI media subscriptions disabled before MLO dial', 'pre-dial media isolation');
expect(backend, 'startConversationalScheduling', 'no-agent/timeout media restoration');
expect(mediaGuard, 'await lp.setMicrophoneEnabled(loanOfficerConnected)', 'answer-gated browser microphone');
expect(mediaGuard, 'Mic OFF while Loan Officer leg is dialing', 'dialing mic telemetry');
expect(floatingCta, 'loanOfficerConnected={mloParticipantJoined}', 'active SIP status propagation');
expect(floatingCta, 'conversationalScheduling={conversationalScheduling}', 'scheduling microphone propagation');

console.log('v7.4.5 MLO audio-isolation regression checks passed.');

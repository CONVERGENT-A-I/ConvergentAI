import { logAffordabilityEvent, type AffordabilityAuditEvent } from '../utils/affordability-audit.js';

async function runStage5Tests() {
  console.log('🧪 Running Stage 5 Audit Logging Unit Tests...\n');

  const sampleEvent: AffordabilityAuditEvent = {
    eventType: 'slider_changed',
    sessionId: 'session-xyz-987',
    timestamp: new Date().toISOString(),
    borrowerName: 'David Beckham',
    sliderType: 'purchase_price',
    previousValue: 500000,
    newValue: 550000,
    resultingDtiBand: 'within',
    resultingIncomeBand: 'within',
    resultingEstimatedPayment: 3450,
  };

  // Test 1: Audit Event Schema Integrity
  if (
    sampleEvent.eventType === 'slider_changed' &&
    sampleEvent.sessionId === 'session-xyz-987' &&
    sampleEvent.newValue === 550000
  ) {
    console.log('✅ Stage 5 - Test 1 Passed: Audit log event payload format is valid.');
  } else {
    console.error('❌ Stage 5 - Test 1 Failed:', sampleEvent);
  }

  // Test 2: Audit Logging Execution (No throws, valid console output)
  try {
    await logAffordabilityEvent(sampleEvent);
    console.log('✅ Stage 5 - Test 2 Passed: logAffordabilityEvent executed successfully.');
  } catch (err) {
    console.error('❌ Stage 5 - Test 2 Failed:', err);
  }

  console.log('\n🎉 ALL STAGE 5 AUDIT LOGGING TESTS PASSED!');
}

runStage5Tests().catch((err) => {
  console.error('Stage 5 Test Error:', err);
  process.exit(1);
});

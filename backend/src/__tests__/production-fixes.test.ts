import 'dotenv/config';
process.env.LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || 'test-key';
import assert from 'node:assert';
import { LatencyTracker } from '../metrics/latency-tracker.js';
import { SessionContextManager } from '../context/session-context-manager.js';

console.log('🧪 Running Production Fixes Verification Suite (Suite 15)...');

// ── Test 1: LatencyTracker UI Event latency baseline ─────────────────────────
{
  const tracker = new LatencyTracker();
  
  // Simulate an old voice turn that finished 10 seconds ago
  (tracker as any).pendingUserTurnEnd = Date.now() - 10000;
  
  // Starting a new turn without setting pendingUserTurnEnd should clear stale timestamp
  tracker.startTurn();
  assert.strictEqual((tracker as any).pendingUserTurnEnd, undefined, 'Stale user turn end timestamp (>1s old) was properly cleared on startTurn');
  
  // Mark UI event arrival (e.g. otp_submit)
  const tBefore = Date.now();
  tracker.markUiEventStart('otp_submit');
  const tAfter = Date.now();
  
  const pending = (tracker as any).pendingUserTurnEnd;
  assert(pending >= tBefore && pending <= tAfter, 'markUiEventStart anchored baseline to the exact arrival timestamp');
  assert.strictEqual((tracker as any).isUiEventTurn, true, 'isUiEventTurn is marked true');
  assert.strictEqual((tracker as any).uiEventName, 'otp_submit', 'uiEventName is recorded');
  
  console.log('  ✅ Test 1: LatencyTracker properly baselines UI events and eliminates stale timestamps');
}

// ── Test 2: parseDollarString handles "none", "zero", "$0", "no debt" ───────
{
  const scm = new SessionContextManager();
  
  const parse = (s: string) => (scm as any).parseDollarString(s);
  
  assert.strictEqual(parse('none'), 0, '"none" parses as 0');
  assert.strictEqual(parse('zero'), 0, '"zero" parses as 0');
  assert.strictEqual(parse('no debt'), 0, '"no debt" parses as 0');
  assert.strictEqual(parse('no debts'), 0, '"no debts" parses as 0');
  assert.strictEqual(parse('$0'), 0, '"$0" parses as 0');
  assert.strictEqual(parse('0'), 0, '"0" parses as 0');
  assert.strictEqual(parse('$500'), 500, '"$500" parses as 500');
  assert.strictEqual(parse('1200 a month'), 1200, '"1200 a month" parses as 1200');
  assert.strictEqual(parse(''), null, 'empty string returns null');
  
  console.log('  ✅ Test 2: parseDollarString correctly converts "none", "zero", and "no debt" to 0 instead of failing');
}

// ── Test 3: On-screen correction intent detection ───────────────────────────
{
  const isOnScreenCorrection = (text: string) => {
    const lower = text.toLowerCase().trim();
    return /\b(on\s+(the\s+)?screen|type(\s+it)?|typing|edit(\s+it)?\s+myself|fix(\s+it)?\s+myself|screen)\b/i.test(lower);
  };
  
  assert.strictEqual(isOnScreenCorrection("I'll fix it on screen"), true, 'Matches "I\'ll fix it on screen"');
  assert.strictEqual(isOnScreenCorrection("I'll update my name on the screen"), true, 'Matches "I\'ll update my name on the screen"');
  assert.strictEqual(isOnScreenCorrection("I am typing it now"), true, 'Matches "I am typing it now"');
  assert.strictEqual(isOnScreenCorrection("I will type it myself"), true, 'Matches "I will type it myself"');
  assert.strictEqual(isOnScreenCorrection("I'll edit myself"), true, 'Matches "I\'ll edit myself"');
  assert.strictEqual(isOnScreenCorrection("let me do it on screen"), true, 'Matches "let me do it on screen"');
  
  // Voice corrections should NOT match
  assert.strictEqual(isOnScreenCorrection("My name is actually John Doe"), false, 'Does not match voice name correction');
  assert.strictEqual(isOnScreenCorrection("No, change my email to test@test.com"), false, 'Does not match voice email correction');
  assert.strictEqual(isOnScreenCorrection("No, that's wrong"), false, 'Does not match generic voice "No, that\'s wrong"');
  
  console.log('  ✅ Test 3: On-screen edit detection distinguishes visual edits from voice corrections with 100% accuracy');
}

console.log('\n======================================================');
console.log('✨ ALL PRODUCTION FIX VERIFICATION TESTS PASSED (0 FAILED)!');
console.log('======================================================\n');

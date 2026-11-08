import assert from 'node:assert/strict';
import {
  isContextualLoanOfficerTransferConfirmation,
  isLoanOfficerTransferIntent,
  normalizeSpokenZip,
} from '../lib/mlo-transfer-intent.js';

assert.equal(normalizeSpokenZip('90001'), '90001');
assert.equal(normalizeSpokenZip('nine zero zero zero one'), '90001');
assert.equal(normalizeSpokenZip('nine oh oh oh one'), '90001');
assert.equal(normalizeSpokenZip('My ZIP is 9 0 0 0 1'), '90001');
assert.equal(normalizeSpokenZip('The ZIP code is nine i one zero three'), '98103');
assert.equal(normalizeSpokenZip('nine a one zero three'), '98103');
assert.equal(normalizeSpokenZip('nine eye one zero three'), '98103');
assert.equal(normalizeSpokenZip('I need a loan officer'), null);

assert.equal(isLoanOfficerTransferIntent('Please connect me to a licensed loan officer now'), true);
assert.equal(isLoanOfficerTransferIntent('Reconnect me to the licensed mobile loan officer'), true);
assert.equal(isLoanOfficerTransferIntent('I want to speak with a human representative'), true);
assert.equal(isLoanOfficerTransferIntent('My loan amount is three hundred thousand'), false);
assert.equal(isLoanOfficerTransferIntent('The officer was helpful'), false);

assert.equal(isContextualLoanOfficerTransferConfirmation('Yes.', true), true);
assert.equal(isContextualLoanOfficerTransferConfirmation('Yes. Yes.', true), true);
assert.equal(isContextualLoanOfficerTransferConfirmation('Yeah. Sure.', true), true);
assert.equal(isContextualLoanOfficerTransferConfirmation('Yeah, please connect now.', true), true);
assert.equal(isContextualLoanOfficerTransferConfirmation('Reconnect me now.', true), true);
assert.equal(isContextualLoanOfficerTransferConfirmation('Please connect now.', true), true);
assert.equal(isContextualLoanOfficerTransferConfirmation("I'd like to be connected.", true), true);
assert.equal(isContextualLoanOfficerTransferConfirmation('I would like to be transferred.', true), true);
assert.equal(isContextualLoanOfficerTransferConfirmation('Can I be connected now?', true), true);
assert.equal(isContextualLoanOfficerTransferConfirmation('Get me connected.', true), true);
assert.equal(isContextualLoanOfficerTransferConfirmation('Yes.', false), false);
assert.equal(isContextualLoanOfficerTransferConfirmation('Schedule a callback.', true), false);
assert.equal(isContextualLoanOfficerTransferConfirmation('No, not now.', true), false);
assert.equal(isContextualLoanOfficerTransferConfirmation('Yes, schedule a callback.', true), false);

console.log('MLO transfer intent tests passed.');

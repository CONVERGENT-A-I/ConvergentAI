import assert from 'node:assert/strict';
import { appendPhoneFragment, extractSpokenPhoneDigits } from '../lib/contact-input.js';

assert.equal(
  extractSpokenPhoneDigits('phone number seven two seven four three nine', true),
  '727439',
);
assert.equal(extractSpokenPhoneDigits('zero three nine three', true), '0393');
assert.equal(extractSpokenPhoneDigits('I earn seventy thousand per year', false), null);

const first = appendPhoneFragment('', '727439');
assert.equal(first.complete, null);
assert.equal(first.buffer, '727439');

const second = appendPhoneFragment(first.buffer, '0393');
assert.equal(second.complete, '7274390393');
assert.equal(second.overflow, false);

const international = appendPhoneFragment('', '84989301022');
assert.equal(international.complete, '84989301022');

console.log('Contact input accumulation tests passed.');

import assert from 'node:assert/strict';
import {
  acceptVolunteeredMobile,
  appendPhoneFragment,
  extractEmailFromText,
  extractSpokenPhoneDigits,
  isCompleteMobile,
} from '../lib/contact-input.js';

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

// ── Separate email / mobile turns ────────────────────────────────────────────
// Volunteered mobile on the email turn: only full numbers, never digits from the email.
assert.equal(acceptVolunteeredMobile('5551234567', 'john@gmail.com'), '5551234567');
assert.equal(acceptVolunteeredMobile('(555) 123-4567', 'john@gmail.com'), '5551234567');
assert.equal(acceptVolunteeredMobile('123', 'david123@gmail.com'), null, 'digits from email are not a mobile');
assert.equal(acceptVolunteeredMobile('5551234', 'john@gmail.com'), null, '7-digit volunteered value is not accepted on email turn');
assert.equal(acceptVolunteeredMobile('1234567890', 'user1234567890@mail.com'), null, 'full digit run inside email rejected');
assert.equal(acceptVolunteeredMobile(null, 'john@gmail.com'), null);
assert.equal(acceptVolunteeredMobile('1234567890123456', null), null, 'more than 15 digits rejected');

assert.equal(isCompleteMobile('5551234567'), true);
assert.equal(isCompleteMobile('+1 555 123 4567'), true);
assert.equal(isCompleteMobile('5551234'), false);
assert.equal(isCompleteMobile(''), false);

// Deterministic email fallback (typed / STT with "@").
assert.equal(extractEmailFromText('my email is John.Doe@Gmail.com'), 'john.doe@gmail.com');
assert.equal(extractEmailFromText('sure, david @ example.co.uk thanks'), 'david@example.co.uk');
assert.equal(extractEmailFromText('john at gmail dot com'), null, 'spoken form is left to the LLM');
assert.equal(extractEmailFromText('5551234567'), null);

// Filler words must not become a phone number via the 7-digit fallback guard.
const filler = extractSpokenPhoneDigits('give me a second to look for it', true) || '';
assert.ok(filler.length < 7, 'filler words produce fewer than 7 digits');

console.log('Contact input accumulation tests passed.');

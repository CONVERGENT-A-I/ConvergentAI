import assert from 'node:assert/strict';
import { allowRequest, safeErrorMessage, safeTelemetryDetails } from '../utils/security.js';

const jwt = 'eyJhbGciOiJIUzI1NiJ9.eyJyb29tIjoidGVzdCJ9.signature123';
const redacted = safeErrorMessage(`apiSecret=super-secret Authorization: Bearer ${jwt}`);
assert(!redacted.includes('super-secret'));
assert(!redacted.includes(jwt));

const details = safeTelemetryDetails({ token: jwt, status: 'connected', duration: 120, nested: { pii: true } });
assert.deepEqual(details, { status: 'connected', duration: 120 });

const key = `security-test-${Date.now()}`;
assert.equal(allowRequest(key, 2), true);
assert.equal(allowRequest(key, 2), true);
assert.equal(allowRequest(key, 2), false);

console.log('Security hardening tests passed.');

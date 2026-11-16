// AI-assisted: see docs/AI_LOG.md #64
// Plain Node test for the Settings test-request helpers (T-186).
//   node scripts/tests/notificationTestRequest.test.mjs
import assert from 'node:assert/strict';
import './helpers/registerSrcLoader.mjs';

const { stepDelay, statusFromResult, TEST_STATUS, TEST_DELAY_DEFAULT, TEST_DELAY_MIN, TEST_DELAY_MAX } = await import(
  '../../src/services/notifications/testRequest.js'
);

assert.equal(TEST_DELAY_DEFAULT, 10);
assert.equal(stepDelay(10, 1), 15);
assert.equal(stepDelay(10, -1), 5);
assert.equal(stepDelay(0, -1), TEST_DELAY_MIN);
assert.equal(stepDelay(60, 1), TEST_DELAY_MAX);
assert.equal(stepDelay(58, 1), TEST_DELAY_MAX);
assert.equal(stepDelay(NaN, 1), 15);

assert.equal(statusFromResult({ ok: true }), TEST_STATUS.SUCCESS);
assert.equal(statusFromResult({ ok: false, error: 'offline' }), TEST_STATUS.OFFLINE);
assert.equal(statusFromResult({ ok: false, error: 'rate-limited' }), TEST_STATUS.RATE_LIMITED);
assert.equal(statusFromResult({ ok: false, error: 'no-devices' }), TEST_STATUS.NO_DEVICES);
assert.equal(statusFromResult({ ok: false, error: 'session' }), TEST_STATUS.SESSION);
assert.equal(statusFromResult({ ok: false, error: 'weird' }), TEST_STATUS.SERVER);
assert.equal(statusFromResult(null), TEST_STATUS.SERVER);

console.log('notificationTestRequest tests passed');

// AI-assisted: see docs/AI_LOG.md #64
// Plain Node test for the eligibility rules (T-178, D-140.5).
//   node scripts/tests/notificationEligibility.test.mjs
import assert from 'node:assert/strict';
import './helpers/registerSrcLoader.mjs';

const { resolveIntent, INTENT_DECISION } = await import('../../src/services/notifications/eligibility.js');

const NOW = 100000;
const intent = (extra = {}) => ({ targetUid: 'A', requestId: 'r', expiresAt: NOW + 1000, ...extra });
const ctx = (extra = {}) => ({ session: { uid: 'A' }, accountApproved: true, onTrip: false, now: NOW, ...extra });

assert.equal(resolveIntent(intent(), ctx()), INTENT_DECISION.OPEN);
// D-202: expired only when now >= expiresAt + 10 s of clock tolerance (phone clock ahead or behind).
assert.equal(resolveIntent(intent({ expiresAt: NOW }), ctx()), INTENT_DECISION.OPEN);
assert.equal(resolveIntent(intent({ expiresAt: NOW - 9999 }), ctx()), INTENT_DECISION.OPEN);
assert.equal(resolveIntent(intent({ expiresAt: NOW - 10000 }), ctx()), INTENT_DECISION.EXPIRED);
assert.equal(resolveIntent(intent({ expiresAt: NOW - 20000 }), ctx()), INTENT_DECISION.EXPIRED);
assert.equal(resolveIntent(intent({ targetUid: 'B' }), ctx()), INTENT_DECISION.IGNORE);
assert.equal(resolveIntent(intent(), ctx({ session: null })), INTENT_DECISION.IGNORE);
assert.equal(resolveIntent(intent(), ctx({ session: {} })), INTENT_DECISION.IGNORE);
assert.equal(resolveIntent(intent(), ctx({ accountApproved: false })), INTENT_DECISION.IGNORE);
assert.equal(resolveIntent(intent(), ctx({ onTrip: true })), INTENT_DECISION.IGNORE);
assert.equal(resolveIntent(null, ctx()), INTENT_DECISION.IGNORE);
// Foreign account + expired: still silent (no message for someone else's request).
assert.equal(resolveIntent(intent({ targetUid: 'B', expiresAt: NOW - 1 }), ctx()), INTENT_DECISION.IGNORE);
// Expired while on a trip: silent.
assert.equal(resolveIntent(intent({ expiresAt: NOW - 1 }), ctx({ onTrip: true })), INTENT_DECISION.IGNORE);

console.log('notificationEligibility: OK');

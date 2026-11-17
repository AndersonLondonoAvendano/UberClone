// AI-assisted: see docs/AI_LOG.md #66
// A2 (D-181): a request is offered only while the driver is Disponible; otherwise a single-slot notice.
import assert from 'node:assert/strict';
import test from 'node:test';
import './helpers/registerSrcLoader.mjs';

const { createIntentFlow, FLOW_RESULT } = await import('../../src/services/notifications/intentFlow.js');
const { parsePushData } = await import('../../src/services/notifications/pushRequest.js');
const { createPendingIntent } = await import('../../src/services/notifications/pendingIntent.js');
const { isDriverAvailable, mergeNotice } = await import('../../src/services/notifications/eligibility.js');
const { ACCOUNT_STATUS } = await import('../../src/constants/accountStatus.js');

const NOW = 1_700_000_000_000;
const data = (extra = {}) => ({
  type: 'trip_request', requestId: 'r1', targetUid: 'A', expiresAt: String(NOW + 90_000), category: 'economico',
  distanceKm: '3.2', durationMin: '9', originLat: '6.25', originLng: '-75.56', destLat: '6.26', destLng: '-75.55',
  passengerName: 'Test', ...extra,
});

function setup(available, intentData = data()) {
  const intents = createPendingIntent();
  const parsed = parsePushData(intentData);
  assert.equal(parsed.ok, true);
  intents.set(parsed.intent);
  const out = { offered: 0, expired: 0, unavailable: 0, logs: [] };
  const flow = createIntentFlow({
    intents,
    getState: () => ({ uid: 'A', accountStatus: ACCOUNT_STATUS.APPROVED, onTrip: false, available }),
    offer: () => { out.offered += 1; return true; },
    showExpired: () => { out.expired += 1; },
    showUnavailable: () => { out.unavailable += 1; },
    now: () => NOW,
    log: (code) => out.logs.push(code),
  });
  return { intents, out, flow };
}

test('isDriverAvailable: only an explicit false blocks; null / restoring is "not known yet" (D-201)', () => {
  assert.equal(isDriverAvailable(true), true);
  assert.equal(isDriverAvailable(undefined), true);
  assert.equal(isDriverAvailable(false), false);
  assert.equal(isDriverAvailable('available'), true);
  assert.equal(isDriverAvailable('unavailable'), false);
  assert.equal(isDriverAvailable(null), null);
  assert.equal(isDriverAvailable('restoring'), null);
});

test('Disponible: the tapped request is offered, no notice', async () => {
  const t = setup(true);
  assert.equal(await t.flow.evaluate(), FLOW_RESULT.ADOPTED);
  assert.equal(t.out.offered, 1);
  assert.equal(t.out.unavailable, 0);
});

test('No disponible: nothing is offered, the notice is shown once', async () => {
  const t = setup(false);
  assert.equal(await t.flow.evaluate(), FLOW_RESULT.UNAVAILABLE);
  assert.equal(t.out.offered, 0);
  assert.equal(t.out.unavailable, 1);
  assert.ok(t.out.logs.includes('intent-dropped:not-available'));
  assert.equal(t.intents.peek(), null, 'the intent is consumed');
});

test('No disponible and already expired: still says expired, not the availability notice', async () => {
  const t = setup(false, data({ expiresAt: String(NOW - 20_000) })) // D-202: beyond the 10 s clock tolerance;
  assert.equal(await t.flow.evaluate(), FLOW_RESULT.EXPIRED);
  assert.equal(t.out.expired, 1);
  assert.equal(t.out.unavailable, 0);
});

test('mergeNotice: single slot, no repeat and no stack', () => {
  assert.equal(mergeNotice(null, 'a'), 'a');
  assert.equal(mergeNotice('a', 'a'), 'a');
  assert.equal(mergeNotice('a', 'b'), 'a');
});

// AI-assisted: see AI_LOG.md #55
// Plain Node test of the useTripPayment core with a simulated subscription (T-96). Run:
//   node --import ./scripts/tests/helpers/registerSrcLoader.mjs --test scripts/tests/useTripPayment.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const { startTripPayment, classifyTripError, TRIP_PAYMENT_ERROR } = await import(
  '../../src/services/trip/tripPaymentSubscription.js'
);

function fakeSource() {
  const src = { next: null, error: null, unsubscribed: 0, calls: [] };
  src.subscribe = (uid, tripId, onNext, onError) => {
    src.calls.push([uid, tripId]);
    src.next = onNext;
    src.error = onError;
    return () => { src.unsubscribed += 1; };
  };
  return src;
}

test('loading, then trip data, then cleanup unsubscribes once and mutes later events', () => {
  const src = fakeSource();
  const states = [];
  const stop = startTripPayment({ subscribe: src.subscribe, uid: 'u1', tripId: 't1', onState: (s) => states.push(s) });
  assert.deepEqual(src.calls, [['u1', 't1']]);
  assert.equal(states[0].loading, true);
  src.next({ id: 't1', paymentStatus: 'pending' });
  assert.deepEqual(states.at(-1), { trip: { id: 't1', paymentStatus: 'pending' }, loading: false, error: null });
  stop();
  assert.equal(src.unsubscribed, 1);
  const count = states.length;
  src.next({ id: 't1' });
  src.error({ code: 'unavailable' });
  assert.equal(states.length, count);
});

test('errors are classified: unavailable is offline, the rest failed', () => {
  assert.equal(classifyTripError({ code: 'unavailable' }), TRIP_PAYMENT_ERROR.OFFLINE);
  assert.equal(classifyTripError({ code: 'permission-denied' }), TRIP_PAYMENT_ERROR.FAILED);
  const src = fakeSource();
  const states = [];
  startTripPayment({ subscribe: src.subscribe, uid: 'u', tripId: 't', onState: (s) => states.push(s) });
  src.error({ code: 'unavailable' });
  assert.equal(states.at(-1).error, 'offline');
});

test('without uid or tripId nothing is subscribed', () => {
  const src = fakeSource();
  const states = [];
  const stop = startTripPayment({ subscribe: src.subscribe, uid: 'u', tripId: null, onState: (s) => states.push(s) });
  stop();
  assert.equal(src.calls.length, 0);
  assert.deepEqual(states, [{ trip: null, loading: false, error: null }]);
});

test('a throwing subscribe becomes an error state, cleanup is safe', () => {
  const states = [];
  const stop = startTripPayment({ subscribe: () => { throw new Error('x'); }, uid: 'u', tripId: 't', onState: (s) => states.push(s) });
  assert.equal(states.at(-1).error, 'failed');
  stop();
});

test('hook returns the cleanup of the subscription from useEffect and the screen has no Alert', () => {
  const hook = readFileSync(new URL('../../src/hooks/useTripPayment.js', import.meta.url), 'utf8');
  assert.match(hook, /useEffect\(\s*\(\) => startTripPayment/);
  const screen = readFileSync(new URL('../../src/screens/trip/TripSummaryScreen.js', import.meta.url), 'utf8');
  assert.doesNotMatch(screen, /Alert\.alert|import[^;]*\bAlert\b/);
});

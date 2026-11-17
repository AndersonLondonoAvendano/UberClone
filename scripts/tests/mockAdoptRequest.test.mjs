// AI-assisted: see docs/AI_LOG.md #64
// Plain Node test for adoptRequest of the mock (T-179, D-130): a push request becomes the pending one.
//   node scripts/tests/mockAdoptRequest.test.mjs
import assert from 'node:assert/strict';
import './helpers/registerSrcLoader.mjs';

const { createMockPassengerApi, ADOPT_RESULT } = await import('../../src/services/passengerApi/mockPassengerApi.js');
const { PASSENGER_API_ERROR } = await import('../../src/services/passengerApi/contract.js');
const { requestFromIntent } = await import('../../src/services/notifications/pushRequest.js');

let t = 1_000_000;
const timers = new Map();
let nextId = 1;
const make = () => createMockPassengerApi({
  now: () => t,
  random: () => 0.9, // never "already taken"
  setTimer: (fn, ms) => { timers.set(nextId, { fn, at: t + ms }); return nextId++; },
  clearTimer: (id) => timers.delete(id),
  log: () => {},
});
const advance = (ms) => {
  t += ms;
  for (const [id, tm] of [...timers]) if (tm.at <= t) { timers.delete(id); tm.fn(); }
};
const pushRequest = (id, ttl = 90000) => requestFromIntent({
  targetUid: 'A', requestId: id, expiresAt: t + ttl, category: 'economico', distanceKm: 3, durationMin: 8,
  origin: { lat: 6.25, lng: -75.56 }, destination: { lat: 6.26, lng: -75.55 }, passengerName: 'Mateo Gil',
}, t);

// Adopt without a subscription, then accept it.
{
  const api = make();
  assert.equal(api.adoptRequest(pushRequest('r1')), ADOPT_RESULT.ADOPTED);
  const trip = await api.acceptRequest('r1');
  assert.equal(trip.id, 'r1');
  assert.equal(trip.status, 'accepted');
}

// Reject works; afterwards the same id is no longer pending.
{
  const api = make();
  api.adoptRequest(pushRequest('r2'));
  await api.rejectRequest('r2');
  await assert.rejects(api.rejectRequest('r2'), (e) => e.code === PASSENGER_API_ERROR.EXPIRED);
}

// Busy: a pending request or an active trip.
{
  const api = make();
  assert.equal(api.adoptRequest(pushRequest('r3')), ADOPT_RESULT.ADOPTED);
  assert.equal(api.adoptRequest(pushRequest('r4')), ADOPT_RESULT.BUSY);
  await api.acceptRequest('r3');
  assert.equal(api.adoptRequest(pushRequest('r5')), ADOPT_RESULT.BUSY);
}

// Expired and invalid are refused.
{
  const api = make();
  const old = pushRequest('r6');
  advance(101000); // D-202: expired only after validity (90 s) + clock tolerance (10 s)
  assert.equal(api.adoptRequest(old), ADOPT_RESULT.EXPIRED);
  assert.equal(api.adoptRequest(null), ADOPT_RESULT.INVALID);
  assert.equal(api.adoptRequest({ id: 'x' }), ADOPT_RESULT.INVALID);
}

// It expires by itself on its own validity.
{
  const api = make();
  api.adoptRequest(pushRequest('r7', 5000));
  advance(26000); // D-202: a 5 s validity is raised to the full 15 s window, plus 10 s of clock tolerance
  await assert.rejects(api.acceptRequest('r7'), (e) => e.code === PASSENGER_API_ERROR.EXPIRED);
}

// Subscribers are not notified, and the adopted request survives (un)subscribing.
{
  const api = make();
  const seen = [];
  api.adoptRequest(pushRequest('r8'));
  const off = api.subscribeToRequests((r) => seen.push(r.id), () => {}, { getDriverPosition: () => null });
  off();
  assert.deepEqual(seen, []);
  const trip = await api.acceptRequest('r8');
  assert.equal(trip.id, 'r8');
}

console.log('mockAdoptRequest: OK');

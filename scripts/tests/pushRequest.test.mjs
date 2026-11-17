// AI-assisted: see docs/AI_LOG.md #64
// Plain Node test for parsePushRequest (T-178, DP-60/DP-77): foreign, malformed and expired data.
//   node scripts/tests/pushRequest.test.mjs
import assert from 'node:assert/strict';
import './helpers/registerSrcLoader.mjs';

const { parsePushRequest, parsePushData, requestFromIntent, PARSE_REASON } = await import('../../src/services/notifications/pushRequest.js');
const { isValidTripRequest } = await import('../../src/services/passengerApi/contract.js');
const { MOCK_ADDRESS } = await import('../../src/config/passengerApi.js');

const NOW = 1_700_000_000_000;
// Same keys and string values as backend/src/notifications/payload.js buildMessage.
const data = (extra = {}) => ({
  type: 'trip_request',
  requestId: 'req-1',
  targetUid: 'uid-A',
  expiresAt: String(NOW + 90000),
  category: 'economico',
  distanceKm: '3.4',
  durationMin: '9',
  originLat: '6.2523',
  originLng: '-75.5683',
  destLat: '6.2643',
  destLng: '-75.5633',
  passengerName: 'Lucia Restrepo',
  ...extra,
});

// Valid: passes the contract, cash, mock addresses, fictitious passenger, createdAt = now.
{
  const r = parsePushRequest(data(), { now: NOW });
  assert.equal(r.ok, true);
  assert.equal(r.targetUid, 'uid-A');
  assert.equal(isValidTripRequest(r.request), true);
  assert.equal(r.request.id, 'req-1');
  assert.equal(r.request.paymentMethod, 'cash');
  assert.equal(r.request.origin.address, MOCK_ADDRESS);
  assert.equal(r.request.createdAt, NOW);
  assert.equal(r.request.expiresAt, NOW + 90000);
  assert.equal(r.request.distanceKm, 3.4);
  assert.equal(r.request.origin.lat, 6.2523);
  assert.equal(r.request.passenger.name, 'Lucia Restrepo');
  assert.equal('fare' in r.request, false);
}

// Not a request.
for (const bad of [null, undefined, 'x', {}, { type: 'promo' }, data({ type: 'other' })]) {
  assert.deepEqual(parsePushRequest(bad, { now: NOW }), { ok: false, reason: PARSE_REASON.NOT_A_REQUEST });
}

// Invalid fields.
const invalid = [
  { requestId: '' }, { requestId: undefined }, { targetUid: '' }, { requestId: 'x'.repeat(200) },
  { category: 'lujo' }, { category: '' }, { expiresAt: 'abc' }, { expiresAt: '' }, { expiresAt: '-5' },
  { distanceKm: '-1' }, { distanceKm: '9999' }, { distanceKm: 'NaN' }, { distanceKm: '' },
  { durationMin: '-1' }, { durationMin: '100000' }, { durationMin: ' ' },
  { originLat: '91' }, { originLng: '181' }, { destLat: 'x' }, { destLng: '' }, { originLat: 'Infinity' },
  // Strict decimal only (S4 fix): hex, exponent, padding and bare dots are rejected.
  { distanceKm: '0x10' }, { distanceKm: '1e1' }, { durationMin: '1E1' }, { originLat: '6.' }, { originLng: '.5' },
  { destLat: ' 6.2 ' }, { expiresAt: '0b11' }, { expiresAt: '1_000' },
];
for (const patch of invalid) {
  const r = parsePushRequest(data(patch), { now: NOW });
  assert.deepEqual(r, { ok: false, reason: PARSE_REASON.INVALID }, JSON.stringify(patch));
}

// Expired (valid structure, validity passed).
// D-202: only when now >= expiresAt + 10 s of clock tolerance; inside it the request is valid.
assert.deepEqual(parsePushRequest(data({ expiresAt: String(NOW - 10000) }), { now: NOW }), { ok: false, reason: PARSE_REASON.EXPIRED });
assert.deepEqual(parsePushRequest(data({ expiresAt: String(NOW - 20000) }), { now: NOW }), { ok: false, reason: PARSE_REASON.EXPIRED });
assert.equal(parsePushRequest(data({ expiresAt: String(NOW - 9999) }), { now: NOW }).ok, true);

// Structure-only parse keeps an expired intent (the bridge decides "La solicitud expiro").
{
  const r = parsePushData(data({ expiresAt: String(NOW - 5000) }));
  assert.equal(r.ok, true);
  assert.equal(r.intent.targetUid, 'uid-A');
  assert.equal(r.intent.expiresAt, NOW - 5000);
}

// Missing passengerName gets a default; category is case-insensitive.
{
  const r = parsePushRequest(data({ passengerName: undefined, category: 'XL' }), { now: NOW });
  assert.equal(r.ok, true);
  assert.equal(r.request.passenger.name, 'Pasajero');
  assert.equal(r.request.category, 'xl');
}

assert.equal(requestFromIntent(null, NOW), null);

// T-198 (CA-004-06): refineRequestMetrics with a fake OSRM behind the real resolver.
{
  const { refineRequestMetrics } = await import('../../src/services/notifications/pushRequest.js');
  const { createRouteMetrics } = await import('../../src/services/routing/routeMetrics.js');
  const { calculateFare } = await import('../../src/utils/fare.js');
  const base = parsePushRequest(data(), { now: NOW }).request;
  const resolverWith = (fetchRoute) => createRouteMetrics({
    fetchRoute, setTimer: () => 0, clearTimer: () => {},
  });

  // Success: OSRM values replace the template's; the original is untouched; the fare uses the final values.
  let calls = 0;
  const ok = resolverWith(async () => { calls += 1; return { distanceM: 8500, durationS: 1320 }; });
  const refined = await refineRequestMetrics(base, ok);
  assert.equal(refined.distanceKm, 8.5);
  assert.equal(refined.durationMin, 22);
  assert.equal(refined.estimated, undefined);
  assert.equal(base.distanceKm, 3.4);
  assert.notEqual(refined, base);
  assert.equal(isValidTripRequest(refined), true);
  assert.equal(calculateFare({ distanceKm: refined.distanceKm, durationMin: refined.durationMin, category: refined.category }).fare, 19200);
  assert.equal(calls, 1);
  await refineRequestMetrics(base, ok); // same message again: cache, no new call
  assert.equal(calls, 1);

  // Failure: the message values stay and the copy is marked estimated.
  const failed = await refineRequestMetrics(base, resolverWith(async () => { throw new Error('OSRM HTTP 500'); }));
  assert.equal(failed.distanceKm, 3.4);
  assert.equal(failed.durationMin, 9);
  assert.equal(failed.estimated, true);
  assert.equal(isValidTripRequest(failed), true);

  // A resolver that rejects, and a missing resolver, never throw.
  const rejecting = await refineRequestMetrics(base, { resolve: async () => { throw new Error('boom'); } });
  assert.equal(rejecting.estimated, true);
  assert.equal(rejecting.distanceKm, 3.4);
  assert.equal(await refineRequestMetrics(base, null), base);
  assert.equal(await refineRequestMetrics(null, ok), null);
}

console.log('pushRequest: OK');

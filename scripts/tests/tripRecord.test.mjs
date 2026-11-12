// AI-assisted: see docs/AI_LOG.md #55
// Plain Node tests for buildTripRecord (CA-002-58, CA-002-60, CA-002-77) and the plannedRoute kept by
// the trip controller. Run:
//   node scripts/tests/tripRecord.test.mjs
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, sep } from 'node:path';
import './helpers/registerSrcLoader.mjs';

const { buildTripRecord, paymentMethodOf, SAVED_STATUS, TRIP_DOC_KEYS } = await import('../../src/services/trip/tripRecord.js');
const { TRIP_STATUS } = await import('../../src/constants/tripStatus.js');
const { calculateFare } = await import('../../src/utils/fare.js');
const { COMMISSION_RATE } = await import('../../src/config/pricing.js');

const request = (paymentMethod) => ({
  id: 'r1',
  passenger: { name: 'Ana' },
  origin: { lat: 4.6, lng: -74.08, address: 'Origen' },
  destination: { lat: 4.7, lng: -74.1, address: 'Destino' },
  distanceKm: 5.234,
  durationMin: 14.26,
  category: 'economico',
  paymentMethod,
});
const base = { driverId: 'u1', tripId: 't1', startedAt: 1000, finishedAt: 2000 };
const route = Array.from({ length: 500 }, (_, i) => [4.6 + i * 0.0002, -74.08 - i * 0.0001]);
const ALLOWED = new Set(TRIP_DOC_KEYS);

// Completed, Mercado Pago (legacy "card" request too), with a route.
for (const method of ['mercadopago', 'card']) {
  const doc = buildTripRecord({ ...base, request: request(method), status: SAVED_STATUS.COMPLETED, route });
  assert.equal(doc.status, 'completed');
  assert.equal(doc.paymentStatus, 'pending');
  assert.equal(doc.paymentMethod, 'mercadopago');
  assert.equal(doc.commissionRate, COMMISSION_RATE);
  const fare = calculateFare({ distanceKm: 5.234, durationMin: 14.26, category: 'economico' });
  assert.equal(doc.fare, fare.fare);
  assert.equal(doc.commission + doc.driverEarnings, doc.fare);
  assert.ok(Array.isArray(doc.route) && doc.route.length === 40, 'route simplified to 40');
  assert.deepEqual(Object.keys(doc.route[0]).sort(), ['lat', 'lng'], 'route points are maps (no nested arrays)');
  assert.ok(doc.route.every((p) => typeof p.lat === 'number' && Math.abs(p.lat * 1e4 - Math.round(p.lat * 1e4)) < 1e-6));
  Object.keys(doc).forEach((key) => assert.ok(ALLOWED.has(key), `unexpected key ${key}`));
  assert.ok(!('paymentId' in doc), 'no paymentId written by the app');
  assert.ok(doc.startedAt instanceof Date && doc.finishedAt instanceof Date);
}

// Completed, cash, without a route (and with unusable routes): saved without the key, no failure.
for (const noRoute of [undefined, null, [], [[4.6, -74.08]], [[NaN, 1], [2, 3]]]) {
  const doc = buildTripRecord({ ...base, request: request('cash'), status: SAVED_STATUS.COMPLETED, route: noRoute });
  assert.equal(doc.paymentMethod, 'cash');
  assert.equal(doc.paymentStatus, 'pending');
  assert.equal(doc.status, 'completed');
  assert.ok(!('route' in doc), 'no route key');
}
assert.equal(paymentMethodOf({ paymentMethod: 'cash' }), 'cash');
assert.equal(paymentMethodOf({ paymentMethod: 'transfer' }), 'mercadopago', 'legacy values are never written back');

// Cancelled: amounts at 0, status cancelled, still pending + a method the rule accepts, no route.
const cancelled = buildTripRecord({ ...base, request: request('mercadopago'), status: SAVED_STATUS.CANCELLED, route });
assert.equal(cancelled.status, 'cancelled');
assert.equal(cancelled.paymentStatus, 'pending');
assert.equal(cancelled.paymentMethod, 'mercadopago');
assert.equal(cancelled.fare, 0);
assert.equal(cancelled.commission + cancelled.driverEarnings, 0);
assert.ok(!('route' in cancelled));

assert.throws(() => buildTripRecord({ ...base, request: null, status: 'completed' }));
assert.equal(TRIP_STATUS.PAID, 'paid');

// Forbidden writes: nothing in src/ writes paymentStatus approved/rejected, paymentId or status 'paid'
// for a card trip. The only 'paid' writes allowed are the cash ones in tripRepository.js.
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (full.endsWith('.js')) out.push(full);
  }
  return out;
}
const offenders = [];
for (const file of walk('src')) {
  const source = readFileSync(file, 'utf8')
    .split('\n')
    .filter((line) => !line.trim().startsWith('//')) // comments are not writes
    .join('\n');
  // Reads of savedTrip.paymentId / trip.paymentId (the chosen-gateway check, #59) are not writes.
  if (/paymentId\s*:(?!\s*(savedTrip|trip)\b)|paymentStatus\s*:\s*['"](approved|rejected)['"]/.test(source)) offenders.push(file);
  if (/status\s*:\s*['"]paid['"]|status\s*:\s*TRIP_STATUS\.PAID/.test(source) && !file.split(sep).join('/').endsWith('services/tripRepository.js')) {
    offenders.push(file);
  }
}
assert.deepEqual(offenders, [], `forbidden writes: ${offenders.join(', ')}`);

// plannedRoute in the trip controller: only a real route to the destination, simplified, no extra calls.
const { createTripController, TRIP_PHASE } = await import('../../src/services/trip/tripController.js');
const lngLat = Array.from({ length: 300 }, (_, i) => [-74.08 - i * 0.0001, 4.6 + i * 0.0002]);
async function drive(provider, { approximateRoute = false } = {}) {
  let routeCalls = 0;
  const controller = createTripController({
    trip: { id: 't1', request: request('cash') },
    startPosition: null,
    api: { reportTripStatus: async () => ({}), cancelTrip: async () => ({}), reportDriverLocation: async () => {} },
    getRoute: async () => {
      routeCalls += 1;
      if (approximateRoute) throw new Error('osrm down');
      return { coordinates: lngLat, distanceM: 5000, durationS: 600, provider };
    },
    buildStraightLineRoute: () => ({ coordinates: lngLat.slice(0, 2), distanceM: 1, durationS: 1, provider: 'straight' }),
    // The simulated walk ends at once: every leg "arrives" as soon as it starts.
    createLocationSource: () => ({ start: ({ onEnd }) => { onEnd(); return () => {}; } }),
    config: {
      ROUTE_MAX_ATTEMPTS: 1, ROUTE_RETRY_DELAY_MS: 0, REPORT_MAX_ATTEMPTS: 1, REPORT_RETRY_DELAY_MS: 0,
      REPORT_ATTEMPT_TIMEOUT_MS: 50, FINISH_TIMEOUT_MS: 100, ARRIVAL_THRESHOLD_M: 1,
      REPORT_MIN_INTERVAL_MS: 5000, REPORT_MIN_DISTANCE_M: 20,
    },
  });
  await controller.start();
  assert.equal(controller.getState().phase, TRIP_PHASE.AT_PICKUP);
  assert.equal(controller.getState().plannedRoute, null, 'the pickup leg is not the planned route');
  await controller.startRide();
  const state = controller.getState();
  controller.dispose();
  return { state, routeCalls };
}
{
  const { state, routeCalls } = await drive('osrm');
  assert.equal(state.phase, TRIP_PHASE.AT_DESTINATION);
  assert.equal(state.plannedRoute.length, 40);
  assert.deepEqual(state.plannedRoute[0], [4.6, -74.08]);
  assert.equal(routeCalls, 2, 'no extra route request for the saved route');
  const doc = buildTripRecord({ ...base, request: request('cash'), status: 'completed', route: state.plannedRoute });
  assert.equal(doc.route.length, 40);
}
assert.equal((await drive('fallback')).state.plannedRoute, null, 'a preloaded fallback route is not saved');
assert.equal((await drive('osrm', { approximateRoute: true })).state.plannedRoute, null, 'a straight line is not saved');
console.log('tripRecord: OK');

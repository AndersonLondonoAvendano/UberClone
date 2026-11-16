// Plain Node test: the simulated request waits for its OSRM metrics (T-197, RC-01..RC-03; CA-004-01,02,03,05).
//   node --import ./scripts/tests/helpers/registerSrcLoader.mjs scripts/tests/mockRouteMetrics.test.mjs
import assert from 'node:assert/strict';
import './helpers/registerSrcLoader.mjs';

const { createMockPassengerApi, REQUEST_NOW_RESULT, ADOPT_RESULT } = await import('../../src/services/passengerApi/mockPassengerApi.js');
const { createRouteMetrics } = await import('../../src/services/routing/routeMetrics.js');
const { isValidTripRequest } = await import('../../src/services/passengerApi/contract.js');
const { calculateFare } = await import('../../src/utils/fare.js');

const tick = () => new Promise((r) => setImmediate(r));
const position = () => ({ lat: 6.25, lng: -75.57 });

function setup(fetchRoute, extra = {}) {
  const timers = new Map();
  let nextId = 1;
  let t = 1_000_000;
  let oneshot = null;
  const resolver = createRouteMetrics({
    fetchRoute,
    setTimer: (fn) => { oneshot = fn; return 0; },
    clearTimer: () => {},
  });
  const api = createMockPassengerApi({
    now: () => t,
    random: () => 0.5,
    setTimer: (fn, ms) => { timers.set(nextId, { fn, ms }); return nextId++; },
    clearTimer: (id) => timers.delete(id),
    log: () => {},
    resolveMetrics: (o, d, f) => resolver.resolve(o, d, f),
    ...extra,
  });
  const emitted = [];
  const unsubscribe = api.subscribeToRequests((r) => emitted.push(r), () => {}, { getDriverPosition: position });
  return { api, emitted, unsubscribe, timers, fireTimeout: () => oneshot && oneshot(), advance: (ms) => { t += ms; } };
}

// OSRM 8.5 km / 22 min: the request leaves with those values; calculateFare runs once on them.
{
  let calls = 0;
  const { api, emitted } = setup(async () => { calls += 1; return { distanceM: 8500, durationS: 1320 }; });
  assert.equal(api.requestNow(), REQUEST_NOW_RESULT.EMITTED);
  assert.equal(emitted.length, 0, 'nothing is shown before the metrics arrive');
  await tick();
  assert.equal(emitted.length, 1);
  const request = emitted[0];
  assert.equal(request.distanceKm, 8.5);
  assert.equal(request.durationMin, 22);
  assert.equal(request.estimated, undefined);
  assert.equal(isValidTripRequest(request), true);
  assert.equal(calls, 1, 'one OSRM call per request');
  let fareCalls = 0;
  const fareOf = (category) => {
    fareCalls += 1;
    return calculateFare({ distanceKm: request.distanceKm, durationMin: request.durationMin, category }).fare;
  };
  assert.equal(fareOf('economico'), 19200);
  assert.equal(fareCalls, 1);
  assert.equal(fareOf('xl'), 26900);
}

// The turn is reserved while waiting: a second requestNow is BUSY and adoptRequest never starts a second call.
{
  let release;
  let calls = 0;
  const { api, emitted } = setup(() => { calls += 1; return new Promise((res) => { release = res; }); });
  assert.equal(api.requestNow(), REQUEST_NOW_RESULT.EMITTED);
  assert.equal(api.requestNow(), REQUEST_NOW_RESULT.BUSY);
  await tick();
  assert.equal(calls, 1);
  assert.equal(api.adoptRequest({ id: 'x' }), ADOPT_RESULT.INVALID);
  release({ distanceM: 5000, durationS: 600 });
  await tick();
  assert.equal(emitted.length, 1);
  assert.equal(emitted[0].durationMin, 10);
}

// Timeout: the straight-line fallback leaves, marked estimated; a late OSRM answer does not change it.
{
  let release;
  const { api, emitted, fireTimeout } = setup(() => new Promise((res) => { release = res; }));
  api.requestNow();
  await tick();
  fireTimeout();
  await tick();
  assert.equal(emitted.length, 1);
  const request = emitted[0];
  assert.equal(request.estimated, true);
  assert.equal(request.distanceKm > 0 && request.durationMin >= 1, true);
  const before = { d: request.distanceKm, m: request.durationMin };
  release({ distanceM: 8500, durationS: 1320 });
  await tick();
  assert.deepEqual({ d: request.distanceKm, m: request.durationMin }, before);
  assert.equal(emitted.length, 1);
}

// HTTP error: same fallback.
{
  const { api, emitted } = setup(async () => { throw new Error('OSRM HTTP 503'); });
  api.requestNow();
  await tick();
  assert.equal(emitted.length, 1);
  assert.equal(emitted[0].estimated, true);
  assert.equal(isValidTripRequest(emitted[0]), true);
}

// A resolver that rejects still yields the fallback (the turn is never stuck).
{
  const { api, emitted } = setup(async () => ({}), { resolveMetrics: async () => { throw new Error('boom'); } });
  api.requestNow();
  await tick();
  assert.equal(emitted.length, 1);
  assert.equal(emitted[0].estimated, true);
  assert.equal(api.requestNow(), REQUEST_NOW_RESULT.BUSY, 'a request is pending now');
}

// Unsubscribing during the wait: nothing is emitted and the turn is free again for a new subscriber.
{
  let release;
  const { api, emitted, unsubscribe, timers } = setup(() => new Promise((res) => { release = res; }));
  api.requestNow();
  await tick();
  unsubscribe();
  release({ distanceM: 8500, durationS: 1320 });
  await tick();
  assert.equal(emitted.length, 0);
  assert.equal(timers.size, 0);
  const again = [];
  api.subscribeToRequests((r) => again.push(r), () => {}, { getDriverPosition: position });
  assert.equal(api.requestNow(), REQUEST_NOW_RESULT.EMITTED);
  await tick();
  assert.equal(again.length, 1);
}

// createdAt/expiresAt are taken when the request is shown, not before the wait.
{
  let release;
  const { api, emitted, advance } = setup(() => new Promise((res) => { release = res; }));
  api.requestNow();
  await tick();
  advance(2000);
  release({ distanceM: 8500, durationS: 1320 });
  await tick();
  assert.equal(emitted[0].createdAt, 1_002_000);
  assert.equal(emitted[0].expiresAt > emitted[0].createdAt, true);
}

console.log('mockRouteMetrics: OK');

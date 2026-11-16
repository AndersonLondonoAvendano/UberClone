// Plain Node test for routeMetrics (T-196, RC-01..RC-03; CA-004-01..05): fake OSRM, injected timers.
//   node --import ./scripts/tests/helpers/registerSrcLoader.mjs scripts/tests/routeMetrics.test.mjs
import assert from 'node:assert/strict';
import './helpers/registerSrcLoader.mjs';

const { createRouteMetrics } = await import('../../src/services/routing/routeMetrics.js');
const { calculateFare } = await import('../../src/utils/fare.js');
const { ROUTE_METRICS_TIMEOUT_MS, ROUTE_TIMEOUT_MS } = await import('../../src/config/routing.js');

const A = { lat: 6.25, lng: -75.56 };
const B = { lat: 6.26, lng: -75.55 };
const FALLBACK = { distanceKm: 3.4, durationMin: 9 };
const route = { coordinates: [], distanceM: 8500, durationS: 1320 };

// Manual timers: a test fires them by hand.
function fakeTimers() {
  const timers = new Map();
  let id = 1;
  return {
    setTimer: (fn, ms) => { timers.set(id, { fn, ms }); return id++; },
    clearTimer: (n) => timers.delete(n),
    fireAll: () => { for (const [n, t] of [...timers]) { timers.delete(n); t.fn(); } },
    count: () => timers.size,
  };
}
const make = (fetchRoute, extra = {}) => {
  const timers = fakeTimers();
  const metrics = createRouteMetrics({ fetchRoute, setTimer: timers.setTimer, clearTimer: timers.clearTimer, ...extra });
  return { metrics, timers };
};

assert.equal(ROUTE_METRICS_TIMEOUT_MS, 2500);
assert.equal(ROUTE_TIMEOUT_MS, 8000, 'the map route keeps its own timeout');

// CA-004-01: 8.5 km / 22 min -> fare 19,200 (economico) and 26,900 (xl) with the single calculateFare.
{
  let calls = 0;
  const { metrics } = make(async () => { calls += 1; return route; });
  const r = await metrics.resolve(A, B, FALLBACK);
  assert.deepEqual(r, { distanceKm: 8.5, durationMin: 22, estimated: false });
  assert.equal(calls, 1);
  assert.equal(calculateFare({ distanceKm: r.distanceKm, durationMin: r.durationMin, category: 'economico' }).fare, 19200);
  assert.equal(calculateFare({ distanceKm: r.distanceKm, durationMin: r.durationMin, category: 'xl' }).fare, 26900);
}

// Coordinates are sent as [lng, lat] together with the timeout.
{
  let seen = null;
  const { metrics } = make(async (from, to, opts) => { seen = { from, to, opts }; return route; });
  await metrics.resolve(A, B, FALLBACK);
  assert.deepEqual(seen.from, [A.lng, A.lat]);
  assert.deepEqual(seen.to, [B.lng, B.lat]);
  assert.equal(seen.opts.timeoutMs, ROUTE_METRICS_TIMEOUT_MS);
}

// CA-004-02: OSRM never answers -> the timer fires -> fallback marked estimated; a late answer is only cached.
{
  let release;
  const { metrics, timers } = make(() => new Promise((res) => { release = res; }));
  const pendingResult = metrics.resolve(A, B, FALLBACK);
  assert.equal(timers.count(), 1);
  timers.fireAll();
  assert.deepEqual(await pendingResult, { ...FALLBACK, estimated: true });
  release(route);
  await new Promise((r) => setImmediate(r));
  assert.deepEqual(await metrics.resolve(A, B, FALLBACK), { distanceKm: 8.5, durationMin: 22, estimated: false });
}

// CA-004-03: HTTP error, network error, invalid body, 0 m, 0 s, NaN -> fallback; failures are not cached.
{
  const bad = [
    async () => { throw new Error('OSRM HTTP 500'); },
    async () => ({ coordinates: [], distanceM: 0, durationS: 100 }),
    async () => ({ coordinates: [], distanceM: 100, durationS: 0 }),
    async () => ({ distanceM: NaN, durationS: 60 }),
    async () => ({ distanceM: '8500', durationS: 60 }),
    async () => null,
    () => { throw new Error('sync throw'); },
  ];
  for (const fetchRoute of bad) {
    const { metrics, timers } = make(fetchRoute);
    assert.deepEqual(await metrics.resolve(A, B, FALLBACK), { ...FALLBACK, estimated: true });
    assert.equal(metrics.cacheSize(), 0);
    assert.equal(timers.count(), 0, 'timer cleared once settled');
  }
}

// Invalid coordinates: no call at all.
{
  let calls = 0;
  const { metrics } = make(async () => { calls += 1; return route; });
  assert.deepEqual(await metrics.resolve({ lat: NaN, lng: 1 }, B, FALLBACK), { ...FALLBACK, estimated: true });
  assert.deepEqual(await metrics.resolve(null, B, FALLBACK), { ...FALLBACK, estimated: true });
  assert.equal(calls, 0);
}

// CA-004-04: same pair twice (and a pair equal at 5 decimals) -> one call; a different pair -> a new call.
{
  let calls = 0;
  const { metrics } = make(async () => { calls += 1; return route; });
  await metrics.resolve(A, B, FALLBACK);
  await metrics.resolve(A, B, FALLBACK);
  await metrics.resolve({ lat: A.lat + 0.000001, lng: A.lng }, B, FALLBACK);
  assert.equal(calls, 1);
  await metrics.resolve(B, A, FALLBACK);
  assert.equal(calls, 2);
}

// Two simultaneous requests for the same pair -> a single call (CA-004-05).
{
  let calls = 0;
  const { metrics } = make(async () => { calls += 1; return route; });
  const [x, y] = await Promise.all([metrics.resolve(A, B, FALLBACK), metrics.resolve(A, B, FALLBACK)]);
  assert.equal(calls, 1);
  assert.deepEqual(x, y);
}

// Bounded cache: the oldest entry leaves first.
{
  let calls = 0;
  const { metrics } = make(async () => { calls += 1; return route; }, { cacheMax: 3 });
  for (let i = 0; i < 5; i += 1) await metrics.resolve({ lat: 6 + i / 100, lng: -75 }, B, FALLBACK);
  assert.equal(metrics.cacheSize(), 3);
  assert.equal(calls, 5);
  await metrics.resolve({ lat: 6.04, lng: -75 }, B, FALLBACK); // newest: still cached
  assert.equal(calls, 5);
  await metrics.resolve({ lat: 6, lng: -75 }, B, FALLBACK); // oldest: evicted
  assert.equal(calls, 6);
}

// Rounding: 1 decimal for km, at least 1 minute.
{
  const { metrics } = make(async () => ({ distanceM: 1234, durationS: 10 }));
  assert.deepEqual(await metrics.resolve(A, B, FALLBACK), { distanceKm: 1.2, durationMin: 1, estimated: false });
}

console.log('routeMetrics: OK');

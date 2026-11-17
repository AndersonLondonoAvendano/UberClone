// AI-assisted: see docs/AI_LOG.md #72
// T-286 (D-200): the simulated approach to the pickup finishes within the configured cap, whatever the
// route length, with an injected clock (no real waiting). The distance walked is not changed.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import './helpers/registerSrcLoader.mjs';

const { createSimulatedLocationSource, speedForMaxDuration, cumulativeDistances } = await import(
  '../../src/services/location/simulatedLocationSource.js'
);
const { TRIP_PICKUP_APPROACH_MAX_S, TRIP_SPEED_FACTOR } = await import('../../src/config/trip.js');
const { SIMULATED_SPEED_KMH, SIMULATED_TICK_MS } = await import('../../src/config/location.js');

const BASE_KMH = SIMULATED_SPEED_KMH * TRIP_SPEED_FACTOR;
// A straight polyline of about `km` kilometres due north from Bogota.
const route = (km) => [[-74.08, 4.6], [-74.08, 4.6 + (km / 111.32) / 2], [-74.08, 4.6 + km / 111.32]];

function walk(coordinates, speedKmh) {
  let tick = null;
  let clock = 0;
  const positions = [];
  let ended = false;
  const source = createSimulatedLocationSource({
    coordinates,
    speedKmh,
    now: () => clock,
    setIntervalFn: (fn) => { tick = fn; return 1; },
    clearIntervalFn: () => { tick = null; },
  });
  source.start({ onPosition: (p) => positions.push(p), onEnd: () => { ended = true; } });
  let guard = 0;
  while (!ended && tick && guard < 10_000) {
    clock += SIMULATED_TICK_MS;
    tick();
    guard += 1;
  }
  return { seconds: clock / 1000, ended, last: positions[positions.length - 1] };
}

test('the cap is a sensible demo value', () => {
  assert.ok(TRIP_PICKUP_APPROACH_MAX_S >= 20 && TRIP_PICKUP_APPROACH_MAX_S <= 30);
});

for (const km of [0.5, 1, 1.8, 2.6, 3.2, 10]) {
  test(`a ${km} km approach ends within ~30 s with the capped speed`, () => {
    const path = route(km);
    const speed = speedForMaxDuration(path, BASE_KMH, TRIP_PICKUP_APPROACH_MAX_S);
    const { seconds, ended, last } = walk(path, speed);
    assert.equal(ended, true);
    assert.ok(seconds <= 30, `${km} km took ${seconds} s`);
    assert.ok(Math.abs(last.lat - path[2][1]) < 1e-9, 'it ends at the pickup point');
  });
}

test('a short route keeps the base speed (never slowed down)', () => {
  assert.equal(speedForMaxDuration(route(0.3), BASE_KMH, TRIP_PICKUP_APPROACH_MAX_S), BASE_KMH);
});

test('without the cap a long approach would take over a minute (the measured problem)', () => {
  const { seconds } = walk(route(3.2), BASE_KMH);
  assert.ok(seconds > 60, `took ${seconds} s`);
});

test('degenerate inputs return the base speed', () => {
  assert.equal(speedForMaxDuration(null, BASE_KMH, 25), BASE_KMH);
  assert.equal(speedForMaxDuration([[0, 0]], BASE_KMH, 25), BASE_KMH);
  assert.equal(speedForMaxDuration(route(2), BASE_KMH, 0), BASE_KMH);
  assert.ok(cumulativeDistances(route(2)).length === 3);
});

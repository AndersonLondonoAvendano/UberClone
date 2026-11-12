// AI-assisted: see docs/AI_LOG.md #57 (T-110)
// Plain Node tests for routeBounds (T-110, CA-002-106 pure part). Run: node scripts/tests/routeBounds.test.mjs
import assert from 'node:assert/strict';
import './helpers/registerSrcLoader.mjs';

const { routeBounds, routeToCoordinates } = await import('../../src/services/map/routeBounds.js');
const { MIN_BOUNDS_SPAN_DEG } = await import('../../src/config/map.js');

const route = [
  { lat: 6.2442, lng: -75.5812 },
  { lat: 6.25, lng: -75.57 },
  { lat: 6.24, lng: -75.575 },
];

assert.deepEqual(routeToCoordinates(route)[0], [-75.5812, 6.2442]);
assert.equal(routeToCoordinates(route).length, 3);
assert.deepEqual(routeBounds(route), [-75.5812, 6.24, -75.57, 6.25]);

// Unusable routes
for (const bad of [null, undefined, [], [route[0]], 'x', [route[0], { lat: NaN, lng: 1 }], [route[0], null], [route[0], { lat: 1 }]]) {
  assert.equal(routeToCoordinates(bad), null);
  assert.equal(routeBounds(bad), null);
}

// Equal points are widened to the minimum span, centered on the point
const same = routeBounds([route[0], { ...route[0] }]);
assert.ok(Math.abs(same[2] - same[0] - MIN_BOUNDS_SPAN_DEG) < 1e-12);
assert.ok(Math.abs(same[3] - same[1] - MIN_BOUNDS_SPAN_DEG) < 1e-12);
assert.ok(same[0] < route[0].lng && route[0].lng < same[2]);
assert.ok(same[1] < route[0].lat && route[0].lat < same[3]);

console.log('routeBounds: ok');

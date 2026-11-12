// Plain Node tests for cameraPolicy (CA-002-91 to CA-002-93, pure part). Run:
//   node scripts/tests/cameraPolicy.test.mjs
import assert from 'node:assert/strict';
import './helpers/registerSrcLoader.mjs';

const { shouldCenterOnFirstFix, recenterAction } = await import('../../src/services/map/cameraPolicy.js');
const map = await import('../../src/config/map.js');

const here = { lat: 6.25, lng: -75.57 };

// First fix centers once
assert.equal(shouldCenterOnFirstFix({ alreadyCentered: false, position: here }), true);
// Later fixes do not
assert.equal(shouldCenterOnFirstFix({ alreadyCentered: true, position: here }), false);
assert.equal(shouldCenterOnFirstFix({ alreadyCentered: true, position: { lat: 1, lng: 2 } }), false);
// No position / invalid
for (const position of [null, undefined, {}, { lat: 1 }, { lat: 'a', lng: 2 }, { lat: NaN, lng: 2 }]) {
  assert.equal(shouldCenterOnFirstFix({ alreadyCentered: false, position }), false);
  assert.equal(recenterAction({ position, reduceMotion: false }), null);
}

// Recenter with location, with and without reduce motion
assert.deepEqual(recenterAction({ position: here, reduceMotion: false }),
  { center: [-75.57, 6.25], zoom: map.NEIGHBORHOOD_ZOOM, duration: map.CAMERA_ANIMATION_MS });
assert.deepEqual(recenterAction({ position: here, reduceMotion: true }),
  { center: [-75.57, 6.25], zoom: map.NEIGHBORHOOD_ZOOM, duration: 0 });
assert.equal(recenterAction({ position: here, reduceMotion: undefined }).duration, map.CAMERA_ANIMATION_MS);

// Constants
assert.equal(map.NEIGHBORHOOD_ZOOM, 15);
assert.equal(map.COLOMBIA_CENTER.length, 2);
assert.ok(map.COLOMBIA_ZOOM < map.NEIGHBORHOOD_ZOOM && map.COLOMBIA_ZOOM > 2);
assert.ok(map.COLOMBIA_CENTER[0] < -66 && map.COLOMBIA_CENTER[0] > -80 && map.COLOMBIA_CENTER[1] > -5 && map.COLOMBIA_CENTER[1] < 13);

console.log('cameraPolicy tests passed');

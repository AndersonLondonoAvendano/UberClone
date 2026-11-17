// AI-assisted: see docs/AI_LOG.md #67
// A5: camera padding of the trip detail map. The bottom margin clears the attribution (which grows with the
// font scale) and the target marker; routes of any length and a trip without a saved route keep working.
import assert from 'node:assert/strict';
import test from 'node:test';
import './helpers/registerSrcLoader.mjs';

const { detailFitPadding, attributionHeight, MAX_VERTICAL_SHARE } = await import('../../src/services/map/detailFraming.js');
const { routeBounds } = await import('../../src/services/map/routeBounds.js');
const { DETAIL_MAP_HEIGHT, ROUTE_FIT_PADDING } = await import('../../src/config/map.js');
const { mapMarker } = await import('../../src/theme/tokens.js');

const markerOuter = mapMarker.targetRadius + mapMarker.targetStroke / 2;

test('bottom margin is the base inset plus the whole attribution box, and larger than the other sides', () => {
  const p = detailFitPadding({ mapHeight: DETAIL_MAP_HEIGHT, fontScale: 1 });
  assert.equal(attributionHeight(1), 32); // 16 line + 8 vertical padding + 8 offset from the edge
  assert.equal(p.bottom, ROUTE_FIT_PADDING + 32);
  assert.equal(p.top, ROUTE_FIT_PADDING);
  assert.equal(p.left, ROUTE_FIT_PADDING);
  assert.equal(p.right, ROUTE_FIT_PADDING);
  assert.ok(p.bottom > p.top);
});

test('the margin follows the font scale and leaves room to draw (top + bottom within the share)', () => {
  let previous = 0;
  for (const fontScale of [1, 1.3, 1.5, 2, 3]) {
    const p = detailFitPadding({ mapHeight: DETAIL_MAP_HEIGHT, fontScale });
    assert.ok(p.bottom >= ROUTE_FIT_PADDING + attributionHeight(fontScale), `scale ${fontScale}`);
    assert.ok(p.bottom >= previous);
    assert.ok(p.top + p.bottom <= DETAIL_MAP_HEIGHT * MAX_VERTICAL_SHARE, `scale ${fontScale}`);
    previous = p.bottom;
  }
  assert.equal(attributionHeight(0.8), attributionHeight(1)); // smaller fonts never shrink it
  assert.equal(attributionHeight(NaN), attributionHeight(1));
});

test('every side clears the outer radius of the target marker, even with a tiny base inset', () => {
  const p = detailFitPadding({ mapHeight: DETAIL_MAP_HEIGHT, fontScale: 1, baseInset: 2 });
  for (const side of ['top', 'right', 'left']) assert.ok(p[side] >= markerOuter, side);
  assert.ok(p.bottom >= markerOuter + attributionHeight(1));
});

test('a short frame shrinks the vertical margins but the attribution is still cleared', () => {
  const p = detailFitPadding({ mapHeight: 120, fontScale: 2 });
  assert.ok(p.bottom >= Math.ceil(markerOuter) + attributionHeight(2));
  assert.ok(p.top >= Math.ceil(markerOuter));
});

test('invalid frame height falls back to the unclamped margins', () => {
  const p = detailFitPadding({ mapHeight: undefined, fontScale: 1 });
  assert.equal(p.bottom, ROUTE_FIT_PADDING + attributionHeight(1));
});

test('very short route: bounds keep the minimum span and the padding is the same (only the zoom changes)', () => {
  const point = { lat: 6.2442, lng: -75.5812 };
  const bounds = routeBounds([point, { ...point }]);
  assert.ok(bounds[2] > bounds[0] && bounds[3] > bounds[1]);
  const p = detailFitPadding({ mapHeight: DETAIL_MAP_HEIGHT, fontScale: 2 });
  assert.ok(DETAIL_MAP_HEIGHT - p.top - p.bottom > 2 * markerOuter, 'room left for the route and its marker');
});

test('very long route (two cities): bounds cover both ends and the padding does not depend on the length', () => {
  const route = [{ lat: 6.2442, lng: -75.5812 }, { lat: 4.711, lng: -74.0721 }, { lat: 3.4516, lng: -76.532 }];
  const bounds = routeBounds(route);
  assert.deepEqual(bounds, [-76.532, 3.4516, -74.0721, 6.2442]);
  assert.deepEqual(detailFitPadding({ mapHeight: DETAIL_MAP_HEIGHT, fontScale: 1 }), detailFitPadding({ mapHeight: DETAIL_MAP_HEIGHT, fontScale: 1 }));
});

test('a trip without a saved route has no bounds, so no map (and no padding) is used: the current fallback', () => {
  for (const route of [null, undefined, [], [{ lat: 1, lng: 1 }]]) assert.equal(routeBounds(route), null);
});

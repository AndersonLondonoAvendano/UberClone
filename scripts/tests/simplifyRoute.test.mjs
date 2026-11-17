// AI-assisted: see AI_LOG.md #55
// Plain Node tests for src/services/trip/simplifyRoute.js (CA-002-77). Run:
//   node scripts/tests/simplifyRoute.test.mjs
import assert from 'node:assert/strict';
import { simplifyRoute } from '../../src/services/trip/simplifyRoute.js';

const line = (count) => Array.from({ length: count }, (_, i) => [4.6 + i * 0.00001234567, -74.08 + i * 0.00002345678]);
const decimals = (n) => (String(n).split('.')[1] ?? '').length;

assert.equal(simplifyRoute([]), null, '0 points');
assert.equal(simplifyRoute(null), null, 'not an array');
assert.equal(simplifyRoute([[4.6, -74.08]]), null, '1 point is not a route');
assert.deepEqual(simplifyRoute([[4.6, -74.08], [4.61, -74.09]]), [[4.6, -74.08], [4.61, -74.09]], '2 points');

for (const count of [39, 40, 41, 500]) {
  const input = line(count);
  const out = simplifyRoute(input);
  assert.ok(out.length <= 40, `${count}: at most 40`);
  assert.equal(out.length, Math.min(count, 40), `${count}: length`);
  assert.deepEqual(out[0], [Math.round(input[0][0] * 1e4) / 1e4, Math.round(input[0][1] * 1e4) / 1e4], `${count}: first kept`);
  const last = input[count - 1];
  assert.deepEqual(out[out.length - 1], [Math.round(last[0] * 1e4) / 1e4, Math.round(last[1] * 1e4) / 1e4], `${count}: last kept`);
  out.forEach(([lat, lng]) => assert.ok(decimals(lat) <= 4 && decimals(lng) <= 4, `${count}: 4 decimals`));
}

// Order is preserved and the picks are spread over the whole route.
const big = simplifyRoute(Array.from({ length: 500 }, (_, i) => [i / 10, 0]));
for (let i = 1; i < big.length; i += 1) assert.ok(big[i][0] > big[i - 1][0], 'strictly increasing');

// Invalid coordinates are dropped.
const mixed = simplifyRoute([
  [4.6, -74.08], [NaN, 1], [91, 0], [0, 181], ['4.6', '-74'], [null, null], undefined, 'x', [Infinity, 0],
  { lat: 4.61, lng: -74.09 }, [4.62, -74.1],
]);
assert.deepEqual(mixed, [[4.6, -74.08], [4.61, -74.09], [4.62, -74.1]], 'invalid dropped, objects accepted');
assert.equal(simplifyRoute([[NaN, 0], [91, 0], [4.6, -74.08]]), null, 'fewer than 2 valid points -> null');

// maxPoints is honored and never above 40 or below 2.
assert.equal(simplifyRoute(line(100), 10).length, 10);
assert.equal(simplifyRoute(line(100), 1000).length, 40);
assert.equal(simplifyRoute(line(100), 0).length, 40, 'invalid maxPoints falls back to 40');
assert.equal(simplifyRoute(line(100), 2).length, 2);
assert.ok(Object.is(simplifyRoute([[-0.00001, 0], [1, 1]])[0][0], 0), 'no negative zero');

console.log('simplifyRoute: OK');

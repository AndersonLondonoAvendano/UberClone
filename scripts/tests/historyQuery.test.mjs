// AI-assisted: see docs/AI_LOG.md #56
// Plain Node tests for the pure history helpers (CA-002-81).
import assert from 'node:assert/strict';
import './helpers/registerSrcLoader.mjs';

const { mergeTrips, filterByMethod, visibleTrips, canLoadMore, isCurrentRequest } = await import('../../src/utils/historyQuery.js');

const t = (id, paymentMethod) => ({ id, paymentMethod });
const page1 = [t('a', 'cash'), t('b', 'mercadopago'), t('c', 'cash')];
const page2 = [t('c', 'cash'), t('d', 'mercadopago'), t('a', 'cash'), t('e', 'cash')];

const merged = mergeTrips(page1, page2);
assert.deepEqual(merged.map((x) => x.id), ['a', 'b', 'c', 'd', 'e'], 'no duplicates, order kept');
assert.deepEqual(mergeTrips([], [t('x'), t('x')]).map((x) => x.id), ['x']);
assert.deepEqual(mergeTrips(undefined, null), []);
assert.equal(mergeTrips([], [null, 5, t('z')]).length, 1, 'invalid items skipped');
assert.equal(page1.length, 3, 'inputs not mutated');

assert.equal(filterByMethod(merged, 'all').length, 5);
assert.deepEqual(filterByMethod(merged, 'cash').map((x) => x.id), ['a', 'c', 'e']);
assert.deepEqual(filterByMethod(merged, 'mercadopago').map((x) => x.id), ['b', 'd']);
assert.equal(filterByMethod(merged, 'weird').length, 5);
assert.deepEqual(filterByMethod(undefined, 'cash'), []);
assert.deepEqual(visibleTrips(merged, 'cash').map((x) => x.id), ['a', 'c', 'e']);

// A filter that leaves few items does not hide "load more" while the server may have more.
assert.equal(visibleTrips([t('a', 'cash')], 'mercadopago').length, 0);
assert.equal(canLoadMore({ hasMore: true, status: 'ready', loadingMore: false }), true);
assert.equal(canLoadMore({ hasMore: false, status: 'ready', loadingMore: false }), false);
assert.equal(canLoadMore({ hasMore: true, status: 'loading', loadingMore: false }), false);
assert.equal(canLoadMore({ hasMore: true, status: 'ready', loadingMore: true }), false);

// Late response: only the current request id counts.
assert.equal(isCurrentRequest(3, 3), true);
assert.equal(isCurrentRequest(2, 3), false);
console.log('historyQuery tests ok');

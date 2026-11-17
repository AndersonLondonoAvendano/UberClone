// AI-assisted: see AI_LOG.md #56
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

// AI-assisted: see AI_LOG.md #58 (T-149, CA-002-125)
{
  const mixed = [t('a', 'cash'), t('b', 'mercadopago'), t('c', 'stripe'), t('d', 'transfer'), t('e')];
  assert.deepEqual(filterByMethod(mixed, 'mercadopago').map((x) => x.id), ['b', 'c'], 'Card includes Stripe');
  assert.deepEqual(filterByMethod(mixed, 'cash').map((x) => x.id), ['a'], 'Cash excludes Stripe');
  assert.equal(filterByMethod(mixed, 'all').length, 5);
  assert.deepEqual(visibleTrips(mixed, 'mercadopago').map((x) => x.id), ['b', 'c']);
}

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
// AI-assisted: see AI_LOG.md #57 (T-122, CA-002-94, RF-54)
// Legacy trips (no paymentMethod and no paymentStatus) show only under "Todos", never under Tarjeta or Efectivo.
{
  const legacy = { id: 'old' };
  const mixedList = [legacy, t('n1', 'cash'), t('n2', 'mercadopago')];
  assert.deepEqual(visibleTrips(mixedList, 'all').map((x) => x.id), ['old', 'n1', 'n2']);
  assert.deepEqual(visibleTrips(mixedList, 'cash').map((x) => x.id), ['n1']);
  assert.deepEqual(visibleTrips(mixedList, 'mercadopago').map((x) => x.id), ['n2']);
}
console.log('historyQuery tests ok');

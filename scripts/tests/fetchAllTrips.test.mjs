// AI-assisted: see docs/AI_LOG.md #66
// Plain Node tests for fetchAllTripsWith (B1, CA-005-01..05): the balance reads every trip with internal
// pagination and a hard cap, on a simulated Firestore that counts reads.
import assert from 'node:assert/strict';
import test from 'node:test';
import './helpers/registerSrcLoader.mjs';

const { fetchAllTripsWith } = await import('../../src/services/tripRepository.js');
const { computeBalance } = await import('../../src/utils/earnings.js');

function makeFirestore(rows) {
  const state = { queries: 0, reads: 0 };
  const fns = {
    orderBy: (field, dir) => ({ kind: 'orderBy', field, dir }),
    limit: (n) => ({ kind: 'limit', n }),
    startAfter: (cursor) => ({ kind: 'startAfter', cursor }),
    query: (source, ...constraints) => ({ source, constraints }),
    getDocs: async (q) => {
      state.queries += 1;
      const n = q.constraints.find((c) => c.kind === 'limit').n;
      const after = q.constraints.find((c) => c.kind === 'startAfter')?.cursor;
      let list = [...rows].sort((a, b) => b.createdAt - a.createdAt);
      if (after) list = list.slice(list.findIndex((r) => r.id === after.id) + 1);
      const page = list.slice(0, n);
      state.reads += page.length;
      return { docs: page.map((r) => ({ id: r.id, data: () => ({ ...r }) })) };
    },
  };
  return { fns, state };
}

const card = (i) => ({ id: `c${i}`, createdAt: 1e6 - i, status: 'completed', paymentMethod: 'mercadopago', paymentStatus: 'approved', driverEarnings: 8000, commission: 2000 });
const cash = (i) => ({ id: `m${i}`, createdAt: 5e5 - i, status: 'paid', paymentMethod: 'cash', paymentStatus: 'paid', driverEarnings: 8000, commission: 2000 });

test('250 trips (150 card, 100 cash) give the full balance, beyond the old 200 limit', async () => {
  const rows = [...Array.from({ length: 150 }, (_, i) => card(i)), ...Array.from({ length: 100 }, (_, i) => cash(i))];
  const { fns, state } = makeFirestore(rows);
  const result = await fetchAllTripsWith(fns, 'col', {});
  assert.equal(result.trips.length, 250);
  assert.equal(result.truncated, false);
  assert.equal(computeBalance(result.trips), 150 * 8000 - 100 * 2000);
  assert.equal(state.queries, 1); // one page of 500 (short page ends the read)
  assert.equal(state.reads, 250);
  const first = state.queries && fns.orderBy('createdAt', 'desc');
  assert.equal(first.field, 'createdAt');
});

test('paginates with startAfter across pages and keeps every trip once', async () => {
  const rows = Array.from({ length: 1234 }, (_, i) => card(i));
  const { fns, state } = makeFirestore(rows);
  const result = await fetchAllTripsWith(fns, 'col', { pageSize: 500 });
  assert.equal(result.trips.length, 1234);
  assert.equal(new Set(result.trips.map((t) => t.id)).size, 1234);
  assert.equal(state.queries, 3);
  assert.equal(state.reads, 1234);
  assert.equal(result.truncated, false);
});

test('cancelled, rejected, no method, legacy and unapproved card do not change the balance', async () => {
  const noise = [
    { id: 'x1', createdAt: 9, status: 'cancelled', paymentMethod: 'cash', paymentStatus: 'paid', commission: 999 },
    { id: 'x2', createdAt: 8, status: 'rejected', paymentMethod: 'cash', paymentStatus: 'paid', commission: 0 },
    { id: 'x3', createdAt: 7, status: 'completed', driverEarnings: 5000, commission: 1000 },
    { id: 'x4', createdAt: 6, status: 'completed', paymentMethod: 'mercadopago', paymentStatus: 'pending', driverEarnings: 5000 },
    { id: 'x5', createdAt: 5, status: 'completed', paymentMethod: 'stripe', paymentStatus: 'rejected', driverEarnings: 5000 },
  ];
  const rows = [...Array.from({ length: 150 }, (_, i) => card(i)), ...Array.from({ length: 100 }, (_, i) => cash(i))];
  const base = computeBalance((await fetchAllTripsWith(makeFirestore(rows).fns, 'col', {})).trips);
  const withNoise = computeBalance((await fetchAllTripsWith(makeFirestore([...rows, ...noise]).fns, 'col', {})).trips);
  assert.equal(withNoise, base);
});

test('more than 5000 documents stop at the cap, truncated, one extra probe read only', async () => {
  const rows = Array.from({ length: 5600 }, (_, i) => card(i));
  const { fns, state } = makeFirestore(rows);
  const result = await fetchAllTripsWith(fns, 'col', {});
  assert.equal(result.trips.length, 5000);
  assert.equal(result.truncated, true);
  assert.equal(state.reads, 5001); // 5000 kept + 1 probe
  assert.equal(state.queries, 11);
});

test('exactly 5000 documents are NOT truncated; 5001 are', async () => {
  const exact = await fetchAllTripsWith(makeFirestore(Array.from({ length: 5000 }, (_, i) => card(i))).fns, 'col', {});
  assert.equal(exact.trips.length, 5000);
  assert.equal(exact.truncated, false);
  const over = await fetchAllTripsWith(makeFirestore(Array.from({ length: 5001 }, (_, i) => card(i))).fns, 'col', {});
  assert.equal(over.trips.length, 5000);
  assert.equal(over.truncated, true);
  const smallExact = await fetchAllTripsWith(makeFirestore(Array.from({ length: 600 }, (_, i) => card(i))).fns, 'col', { pageSize: 500, maxDocs: 600 });
  assert.equal(smallExact.truncated, false);
});

test('a smaller cap truncates at that cap; a collection under the cap is not truncated', async () => {
  const rows = Array.from({ length: 700 }, (_, i) => card(i));
  const capped = await fetchAllTripsWith(makeFirestore(rows).fns, 'col', { pageSize: 500, maxDocs: 600 });
  assert.equal(capped.trips.length, 600);
  assert.equal(capped.truncated, true);
  const empty = await fetchAllTripsWith(makeFirestore([]).fns, 'col', {});
  assert.deepEqual(empty, { trips: [], truncated: false });
});

test('a Firestore error propagates (never a silent empty result)', async () => {
  const { fns } = makeFirestore([]);
  fns.getDocs = async () => {
    throw new Error('unavailable');
  };
  await assert.rejects(() => fetchAllTripsWith(fns, 'col', {}), /unavailable/);
});

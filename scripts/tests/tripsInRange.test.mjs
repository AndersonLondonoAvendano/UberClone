// AI-assisted: see docs/AI_LOG.md #65
// Plain Node tests for fetchTripsInRangeWith (RC-04, CA-004-09, CA-004-11): earnings read all the trips of a
// range with internal pagination, a hard cap and reads bounded by the range, on a simulated Firestore.
import assert from 'node:assert/strict';
import test from 'node:test';
import './helpers/registerSrcLoader.mjs';

const { fetchTripsInRangeWith } = await import('../../src/services/tripRepository.js');
const { buildEarnings, earningsReadRange, PERIOD } = await import('../../src/utils/earnings.js');

const NOW = Date.UTC(2026, 10, 18, 17, 0, 0); // Wednesday 12:00 Colombia
const DAY = 24 * 60 * 60 * 1000;

// Simulated collection: `total` trips in the last hours of the day plus `outside` older ones; the fake
// query applies range, cursor and limit like Firestore and counts the documents it returns (reads).
function makeFirestore(rows) {
  const state = { queries: [], reads: 0 };
  const fns = {
    Timestamp: { fromMillis: (ms) => ({ ms }) },
    orderBy: (field, dir) => ({ kind: 'orderBy', field, dir }),
    where: (field, op, value) => ({ kind: 'where', field, op, value }),
    limit: (n) => ({ kind: 'limit', n }),
    startAfter: (cursor) => ({ kind: 'startAfter', cursor }),
    query: (source, ...constraints) => ({ source, constraints }),
    getDocs: async (q) => {
      state.queries.push(q);
      const lo = q.constraints.find((c) => c.op === '>=').value.ms;
      const hi = q.constraints.find((c) => c.op === '<').value.ms;
      const n = q.constraints.find((c) => c.kind === 'limit').n;
      const after = q.constraints.find((c) => c.kind === 'startAfter')?.cursor;
      let list = rows.filter((r) => r.finishedAt >= lo && r.finishedAt < hi).sort((a, b) => b.finishedAt - a.finishedAt);
      if (after) list = list.slice(list.findIndex((r) => r.id === after.id) + 1);
      const page = list.slice(0, n);
      state.reads += page.length;
      return { docs: page.map((r) => ({ id: r.id, data: () => ({ ...r }) })) };
    },
  };
  return { fns, state };
}

const trip = (i, finishedAt) => ({ id: `t${i}`, status: 'completed', finishedAt, fare: 10000, commission: 2000, driverEarnings: 8000 });

test('250 trips of today are all summed (more than the old limit of 200)', async () => {
  const rows = Array.from({ length: 250 }, (_, i) => trip(i, NOW - 1000 - i * 1000));
  const { fns, state } = makeFirestore(rows);
  const range = earningsReadRange(NOW);
  const { trips, truncated } = await fetchTripsInRangeWith(fns, 'col', range);
  assert.equal(trips.length, 250);
  assert.equal(truncated, false);
  assert.equal(state.queries.length, 1); // 250 < pageSize 500: one query
  const earnings = buildEarnings(trips, NOW);
  for (const key of [PERIOD.DAY, PERIOD.WEEK, PERIOD.MONTH]) {
    assert.equal(earnings[key].count, 250);
    assert.equal(earnings[key].net, 250 * 8000);
  }
});

test('with pageSize 100, 250 trips take 3 queries and none is lost or repeated', async () => {
  const rows = Array.from({ length: 250 }, (_, i) => trip(i, NOW - 1000 - i * 1000));
  const { fns, state } = makeFirestore(rows);
  const { trips } = await fetchTripsInRangeWith(fns, 'col', { ...earningsReadRange(NOW), pageSize: 100 });
  assert.equal(state.queries.length, 3);
  assert.equal(new Set(trips.map((t) => t.id)).size, 250);
});

test('an exact multiple of the page size costs one extra empty query and is not truncated', async () => {
  const rows = Array.from({ length: 200 }, (_, i) => trip(i, NOW - 1000 - i * 1000));
  const { fns, state } = makeFirestore(rows);
  const result = await fetchTripsInRangeWith(fns, 'col', { ...earningsReadRange(NOW), pageSize: 100 });
  assert.equal(result.trips.length, 200);
  assert.equal(result.truncated, false);
  assert.equal(state.queries.length, 3);
});

test('empty range: no trips, no error, one query', async () => {
  const { fns, state } = makeFirestore([]);
  const result = await fetchTripsInRangeWith(fns, 'col', earningsReadRange(NOW));
  assert.deepEqual(result, { trips: [], truncated: false });
  assert.equal(state.queries.length, 1);
  assert.equal(buildEarnings(result.trips, NOW).day.net, 0);
});

test('hard cap: maxDocs stops the reading and marks truncated', async () => {
  const rows = Array.from({ length: 1000 }, (_, i) => trip(i, NOW - 1000 - i * 1000));
  const { fns, state } = makeFirestore(rows);
  const result = await fetchTripsInRangeWith(fns, 'col', { ...earningsReadRange(NOW), pageSize: 100, maxDocs: 250 });
  assert.equal(result.trips.length, 250);
  assert.equal(result.truncated, true);
  assert.equal(state.reads, 250); // never reads past the cap
  assert.equal(state.queries.length, 3);
  assert.equal(state.queries[2].constraints.find((c) => c.kind === 'limit').n, 50);
});

test('reads are bounded by the range: trips before the week and month start are never read', async () => {
  const { start } = earningsReadRange(NOW);
  const inside = Array.from({ length: 30 }, (_, i) => trip(i, NOW - 1000 - i * 1000));
  const old = Array.from({ length: 700 }, (_, i) => trip(1000 + i, start - 1000 - i * DAY / 100));
  const { fns, state } = makeFirestore([...inside, ...old]);
  const { trips } = await fetchTripsInRangeWith(fns, 'col', earningsReadRange(NOW));
  assert.equal(trips.length, 30);
  assert.equal(state.reads, 30);
});

test('earnings range covers week and month: starts at the earlier of the two', () => {
  const { start, end } = earningsReadRange(NOW);
  assert.equal(end, NOW + 1);
  // 2026-11-18 is a Wednesday: the week starts 2026-11-16, the month 2026-11-01 (00:00 Colombia).
  assert.equal(start, Date.UTC(2026, 10, 1) + 5 * 60 * 60 * 1000);
  // 2026-12-02 is a Wednesday and the week started in November: the week start is the earlier one.
  const early = Date.UTC(2026, 11, 2, 17, 0, 0);
  assert.equal(earningsReadRange(early).start, Date.UTC(2026, 10, 30) + 5 * 60 * 60 * 1000);
});

test('query arguments use only finishedAt (single field, no composite index) and no other where', async () => {
  const { fns, state } = makeFirestore([trip(1, NOW - 1000)]);
  await fetchTripsInRangeWith(fns, 'col', earningsReadRange(NOW));
  const constraints = state.queries[0].constraints;
  assert.deepEqual(constraints.filter((c) => c.kind === 'orderBy'), [{ kind: 'orderBy', field: 'finishedAt', dir: 'desc' }]);
  const wheres = constraints.filter((c) => c.kind === 'where');
  assert.equal(wheres.length, 2);
  assert.ok(wheres.every((c) => c.field === 'finishedAt'));
  assert.equal(state.queries[0].source, 'col');
});

test('trips without a valid finishedAt are ignored without breaking the totals', () => {
  const trips = [trip(1, NOW - 1000), { ...trip(2, undefined) }, { ...trip(3, 'x') }];
  assert.equal(buildEarnings(trips, NOW).day.count, 1);
});

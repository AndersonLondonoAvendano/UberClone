// AI-assisted: see AI_LOG.md #56
// Plain Node tests for the paginated trip query (CA-002-78, CA-002-81) with a simulated Firestore.
import assert from 'node:assert/strict';
import './helpers/registerSrcLoader.mjs';

const { buildTripsPageQuery, fetchTripsPageWith } = await import('../../src/services/tripRepository.js');

// Simulated collection of 45 trips, newest first; the fake query applies range, cursor and limit.
const all = Array.from({ length: 45 }, (_, i) => ({ id: `t${i}`, createdMs: 1000 - i }));
const calls = [];
const fns = {
  Timestamp: { fromMillis: (ms) => ({ ms }) },
  orderBy: (field, dir) => ({ kind: 'orderBy', field, dir }),
  where: (field, op, value) => ({ kind: 'where', field, op, value }),
  limit: (n) => ({ kind: 'limit', n }),
  startAfter: (cursor) => ({ kind: 'startAfter', cursor }),
  query: (source, ...constraints) => ({ source, constraints }),
  getDocs: async (q) => {
    calls.push(q);
    const lo = q.constraints.find((c) => c.op === '>=').value.ms;
    const hi = q.constraints.find((c) => c.op === '<').value.ms;
    const n = q.constraints.find((c) => c.kind === 'limit').n;
    const after = q.constraints.find((c) => c.kind === 'startAfter')?.cursor;
    let rows = all.filter((r) => r.createdMs >= lo && r.createdMs < hi);
    if (after) rows = rows.slice(rows.findIndex((r) => r.id === after.id) + 1);
    return { docs: rows.slice(0, n).map((r) => ({ id: r.id, data: () => ({ createdMs: r.createdMs }) })) };
  },
};

// Query arguments: orderBy createdAt desc, range only on createdAt, limit 20, no other where.
const q = buildTripsPageQuery(fns, 'col', { start: 0, end: 2000 });
assert.equal(q.source, 'col');
const wheres = q.constraints.filter((c) => c.kind === 'where');
assert.equal(wheres.length, 2);
assert.ok(wheres.every((w) => w.field === 'createdAt'));
assert.deepEqual(wheres.map((w) => w.op).sort(), ['<', '>=']);
assert.deepEqual(q.constraints.find((c) => c.kind === 'orderBy'), { kind: 'orderBy', field: 'createdAt', dir: 'desc' });
assert.equal(q.constraints.find((c) => c.kind === 'limit').n, 20);
assert.equal(q.constraints.some((c) => c.kind === 'startAfter'), false, 'no cursor on the first page');

// Pagination without duplicates: 20 + 20 + 5, then nothing more.
const ids = [];
let cursor = null;
let hasMore = true;
const pages = [];
while (hasMore) {
  const page = await fetchTripsPageWith(fns, 'col', { start: 0, end: 2000, cursor });
  pages.push(page.trips.length);
  ids.push(...page.trips.map((t) => t.id));
  cursor = page.cursor;
  hasMore = page.hasMore;
}
assert.deepEqual(pages, [20, 20, 5]);
assert.equal(new Set(ids).size, 45);
assert.deepEqual(ids, all.map((r) => r.id), 'order preserved');
assert.ok(calls[1].constraints.some((c) => c.kind === 'startAfter' && c.cursor.id === 't19'));

// Short page ends the list; an empty range returns no cursor.
const short = await fetchTripsPageWith(fns, 'col', { start: 990, end: 2000 });
assert.equal(short.trips.length, 11);
assert.equal(short.hasMore, false);
const empty = await fetchTripsPageWith(fns, 'col', { start: 5000, end: 6000 });
assert.deepEqual({ trips: empty.trips, cursor: empty.cursor, hasMore: empty.hasMore }, { trips: [], cursor: null, hasMore: false });
console.log('tripQuery tests ok');

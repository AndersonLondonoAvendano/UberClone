// AI-assisted: see docs/AI_LOG.md #56
// Plain Node tests for chartData (CA-002-83, CA-002-85).
import assert from 'node:assert/strict';
import './helpers/registerSrcLoader.mjs';

const { groupNetEarnings, barScale, chartSummary } = await import('../../src/utils/chartData.js');
const { rangeBounds } = await import('../../src/utils/dateRanges.js');

const co = (y, m, d, h = 0, min = 0) => Date.UTC(y, m - 1, d, h + 5, min);
const trip = (at, driverEarnings, status = 'completed') => ({ status, createdAt: at, driverEarnings });
const now = co(2026, 11, 11, 10); // Wednesday

// Today: six 4-hour bands.
const day = groupNetEarnings([trip(co(2026, 11, 11, 0, 0), 1000), trip(co(2026, 11, 11, 3, 59), 500), trip(co(2026, 11, 11, 4), 2000), trip(co(2026, 11, 11, 23, 59), 700, 'paid')], 'day', null, now);
assert.equal(day.length, 6);
assert.deepEqual(day.map((g) => g.value), [1500, 2000, 0, 0, 0, 700]);
assert.equal(day[0].label, '00-04h');
assert.equal(new Set(day.map((g) => g.key)).size, 6);

// Week: seven days Monday to Sunday; cancelled and out-of-week trips excluded.
const week = groupNetEarnings(
  [trip(co(2026, 11, 9, 8), 100), trip(co(2026, 11, 15, 23, 59), 200), trip(co(2026, 11, 16, 0, 0), 999), trip(co(2026, 11, 10, 9), 50, 'cancelled'), trip(co(2026, 11, 8, 23, 59), 999)],
  'week', null, now,
);
assert.deepEqual(week.map((g) => g.label), ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom']);
assert.deepEqual(week.map((g) => g.value), [100, 0, 0, 0, 0, 0, 200]);

// Month: one bar per day (30 in November), falls back to finishedAt when createdAt is missing.
const month = groupNetEarnings([{ status: 'completed', finishedAt: co(2026, 11, 30, 22), driverEarnings: 300 }, trip(co(2026, 11, 1), 10)], 'month', null, now);
assert.equal(month.length, 30);
assert.equal(month[29].value, 300);
assert.equal(month[0].value, 10);
assert.equal(month[0].label, '1');

// Firestore-like Timestamps are accepted.
const stamped = groupNetEarnings([{ status: 'paid', createdAt: { toMillis: () => co(2026, 11, 11, 5) }, driverEarnings: 40 }], 'day', null, now);
assert.equal(stamped[1].value, 40);

// Range: up to 31 days per day, otherwise per week.
const r31 = rangeBounds('2026-10-01', '2026-10-31');
assert.equal(groupNetEarnings([], 'range', r31).length, 31);
const r32 = rangeBounds('2026-10-01', '2026-11-01');
const weekly = groupNetEarnings([trip(co(2026, 10, 1, 1), 5), trip(co(2026, 11, 1, 1), 7)], 'range', r32);
assert.equal(weekly.length, 5);
assert.equal(weekly[0].value, 5);
assert.equal(weekly[4].value, 7);
assert.equal(groupNetEarnings([], 'range', rangeBounds('2026-01-01', '2026-12-31')).length, 53);

// Invalid input never throws.
assert.deepEqual(groupNetEarnings([], 'range', null), []);
assert.deepEqual(groupNetEarnings([], 'range', { start: 5, end: 5 }), []);
const dirty = groupNetEarnings([null, 5, trip('x', 10), trip(NaN, 10), { status: 'completed', driverEarnings: 10 }, trip(co(2026, 11, 11, 1), 'abc')], 'day', null, now);
assert.deepEqual(dirty.map((g) => g.value), [0, 0, 0, 0, 0, 0]);
assert.deepEqual(groupNetEarnings(undefined, 'day', null, now).map((g) => g.value), [0, 0, 0, 0, 0, 0]);

// barScale: ratios, zero maximum, empty.
assert.deepEqual(barScale([{ key: 'a', value: 50 }, { key: 'b', value: 100 }, { key: 'c', value: 0 }]).map((b) => b.ratio), [0.5, 1, 0]);
assert.deepEqual(barScale(day.map((g) => ({ ...g, value: 0 }))).map((b) => b.ratio), [0, 0, 0, 0, 0, 0]);
assert.deepEqual(barScale([]), []);
assert.ok(barScale([{ key: 'a', value: -5 }, { key: 'b', value: 0 }]).every((b) => b.ratio === 0 && !Number.isNaN(b.ratio)));

// chartSummary: total and highest bar; no top without earnings.
assert.deepEqual(chartSummary(day), { total: 4200, top: { key: day[1].key, label: day[1].label, value: 2000 } });
assert.deepEqual(chartSummary(day.map((g) => ({ ...g, value: 0 }))), { total: 0, top: null });
assert.deepEqual(chartSummary(undefined), { total: 0, top: null });
console.log('chartData tests ok');

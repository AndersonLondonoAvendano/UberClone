// AI-assisted: see docs/AI_LOG.md #56
// Plain Node tests for dateRanges (CA-002-79, CA-002-80). Run under several TZ values:
//   TZ=UTC node ...; TZ=America/Bogota node ...; TZ=Asia/Tokyo node ...
import assert from 'node:assert/strict';
import './helpers/registerSrcLoader.mjs';

const { periodBounds, rangeBounds, validateRange } = await import('../../src/utils/dateRanges.js');
const { labels } = await import('../../src/constants/labels.js');

// Colombia local time -> epoch ms.
const co = (y, m, d, h = 0, min = 0, s = 0, ms = 0) => Date.UTC(y, m - 1, d, h + 5, min, s, ms);
const days = (b) => (b.end - b.start) / 86400000;

// Midnight boundary: 23:59:59.999 still belongs to the day, 00:00:00.000 starts the next one.
const lastMs = co(2026, 11, 11, 23, 59, 59, 999);
assert.deepEqual(periodBounds('day', lastMs), { start: co(2026, 11, 11), end: co(2026, 11, 12) });
assert.deepEqual(periodBounds('day', lastMs + 1), { start: co(2026, 11, 12), end: co(2026, 11, 13) });
// 04:59 UTC of the 12th is still the 11th in Colombia; 05:00 UTC is the 12th.
assert.equal(periodBounds('day', Date.UTC(2026, 10, 12, 4, 59)).start, co(2026, 11, 11));
assert.equal(periodBounds('day', Date.UTC(2026, 10, 12, 5, 0)).start, co(2026, 11, 12));

// Week: 2026-11-11 is a Wednesday; week = Mon 9 to Mon 16.
assert.deepEqual(periodBounds('week', co(2026, 11, 11, 10)), { start: co(2026, 11, 9), end: co(2026, 11, 16) });
// Sunday 2026-11-15 23:59 still belongs to that week; Monday 16 00:00 opens the next.
assert.deepEqual(periodBounds('week', co(2026, 11, 15, 23, 59, 59, 999)), { start: co(2026, 11, 9), end: co(2026, 11, 16) });
assert.deepEqual(periodBounds('week', co(2026, 11, 16)), { start: co(2026, 11, 16), end: co(2026, 11, 23) });
assert.equal(periodBounds('week', co(2026, 11, 9)).start, co(2026, 11, 9));
// Week crossing a month and a year (Mon 2025-12-29 .. Mon 2026-01-05).
assert.deepEqual(periodBounds('week', co(2026, 1, 1, 12)), { start: co(2025, 12, 29), end: co(2026, 1, 5) });

// Month: end of month and February (leap and not).
assert.deepEqual(periodBounds('month', co(2026, 11, 30, 23, 59)), { start: co(2026, 11, 1), end: co(2026, 12, 1) });
assert.deepEqual(periodBounds('month', co(2026, 12, 31, 23, 59)), { start: co(2026, 12, 1), end: co(2027, 1, 1) });
assert.deepEqual(periodBounds('month', co(2028, 2, 29, 12)), { start: co(2028, 2, 1), end: co(2028, 3, 1) });
assert.equal(days(periodBounds('month', co(2028, 2, 10))), 29);
assert.equal(days(periodBounds('month', co(2027, 2, 10))), 28);
// Unknown period falls back to the day.
assert.deepEqual(periodBounds('x', co(2026, 11, 11, 3)), periodBounds('day', co(2026, 11, 11, 3)));

// rangeBounds from a Date (calendar day as picked) and from a string.
assert.deepEqual(rangeBounds(new Date(2026, 10, 1), new Date(2026, 10, 30)), { start: co(2026, 11, 1), end: co(2026, 12, 1) });
assert.deepEqual(rangeBounds('2026-11-11', '2026-11-11'), { start: co(2026, 11, 11), end: co(2026, 11, 12) });
assert.equal(rangeBounds(null, '2026-11-11'), null);
assert.equal(rangeBounds('2026-02-30', '2026-03-01'), null);
assert.equal(rangeBounds(new Date('x'), new Date()), null);

// validateRange: the three errors and the valid cases.
assert.deepEqual(validateRange(null, new Date(2026, 10, 1)), { ok: false, error: labels.history.rangeMissing });
assert.deepEqual(validateRange(new Date(2026, 10, 1), undefined), { ok: false, error: labels.history.rangeMissing });
assert.deepEqual(validateRange('2026-11-12', '2026-11-11'), { ok: false, error: labels.history.rangeOrder });
assert.deepEqual(validateRange('2026-01-01', '2027-01-02'), { ok: false, error: labels.history.rangeTooLong }); // 367 days
assert.deepEqual(validateRange('2026-01-01', '2027-01-01'), { ok: true, error: null }); // 366 days
assert.deepEqual(validateRange('2028-01-01', '2028-12-31'), { ok: true, error: null }); // 366 days, leap year
assert.deepEqual(validateRange('2026-11-11', '2026-11-11'), { ok: true, error: null });
assert.ok(labels.history.rangeMissing && labels.history.rangeOrder && labels.history.rangeTooLong);
for (const value of [periodBounds('day', 0), periodBounds('week', 0), periodBounds('month', 0)]) {
  assert.ok(Number.isFinite(value.start) && value.end > value.start);
}
console.log(`dateRanges tests ok (TZ=${process.env.TZ ?? 'default'})`);

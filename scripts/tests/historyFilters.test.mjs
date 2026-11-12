// AI-assisted: see docs/AI_LOG.md #56
// Plain Node tests for chartLayout and historyFilters (T-104, T-105).
import assert from 'node:assert/strict';
import './helpers/registerSrcLoader.mjs';

const { labelStep, showsLabel } = await import('../../src/utils/chartLayout.js');
const { resolveHistoryQuery } = await import('../../src/utils/historyFilters.js');
const { labels } = await import('../../src/constants/labels.js');

// labelStep: every label up to 8 bars, then every Nth.
assert.equal(labelStep(6), 1);
assert.equal(labelStep(8), 1);
assert.equal(labelStep(30), 4);
assert.equal(labelStep(31), 4);
assert.equal(labelStep(0), 1);
assert.equal(labelStep(NaN), 1);
assert.equal(showsLabel(0, 30), true);
assert.equal(showsLabel(1, 30), false);
assert.equal(showsLabel(4, 30), true);
assert.equal(showsLabel(3, 6), true);
const drawn = Array.from({ length: 31 }, (_, i) => showsLabel(i, 31)).filter(Boolean).length;
assert.ok(drawn <= 8);

// resolveHistoryQuery: period limits in Colombian time.
const now = Date.UTC(2026, 10, 11, 15); // 10:00 Colombia
const day = resolveHistoryQuery('day', null, null, now);
assert.equal(day.error, null);
assert.equal(day.start, Date.UTC(2026, 10, 11, 5));
assert.equal(day.end, Date.UTC(2026, 10, 12, 5));

// Rango: the three errors and the valid case.
assert.equal(resolveHistoryQuery('range', null, null, now).error, labels.history.rangeMissing);
assert.equal(resolveHistoryQuery('range', new Date(2026, 10, 1), null, now).start, null);
assert.equal(resolveHistoryQuery('range', new Date(2026, 10, 10), new Date(2026, 10, 1), now).error, labels.history.rangeOrder);
assert.equal(resolveHistoryQuery('range', new Date(2024, 0, 1), new Date(2026, 0, 1), now).error, labels.history.rangeTooLong);
const ok = resolveHistoryQuery('range', new Date(2026, 10, 1), new Date(2026, 10, 3), now);
assert.equal(ok.error, null);
assert.equal(ok.start, Date.UTC(2026, 10, 1, 5));
assert.equal(ok.end, Date.UTC(2026, 10, 4, 5));

console.log('historyFilters.test.mjs: ok');

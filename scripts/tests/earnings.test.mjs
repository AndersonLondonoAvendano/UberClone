// AI-assisted: see AI_LOG.md #56
// Plain Node tests for the earnings metrics (CA-002-87, CA-002-88) and the pure core of useEarnings.
import assert from 'node:assert/strict';
import './helpers/registerSrcLoader.mjs';

const { computeMetrics, computePeriodTotals, buildEarnings, periodRange, PERIOD } = await import('../../src/utils/earnings.js');

const co = (y, m, d, h = 0, min = 0) => Date.UTC(y, m - 1, d, h + 5, min);
const now = co(2026, 11, 11, 10); // Wednesday 11 Nov 2026, Colombia
const trip = (finishedAt, over = {}) => ({ status: 'completed', finishedAt, fare: 19200, commission: 3840, driverEarnings: 15360, ...over });

// Completed and paid both count; cancelled does not (a confirmed cash trip becomes paid).
const mixed = [trip(co(2026, 11, 11, 8)), trip(co(2026, 11, 11, 9), { status: 'paid' }), trip(co(2026, 11, 11, 7), { status: 'cancelled' })];
const day = computeMetrics(mixed, PERIOD.DAY, now);
assert.equal(day.count, 2);
assert.equal(day.gross, 38400);
assert.equal(day.commission, 7680);
assert.equal(day.net, 30720);
assert.equal(day.tips, 0);
assert.equal(day.average, 15360);
assert.equal(day.trips.length, 2);
assert.equal(computePeriodTotals(mixed, PERIOD.DAY, now).count, 2, 'paid counted in totals');

// A numeric tip is used when the trip carries one.
assert.equal(computeMetrics([trip(co(2026, 11, 11, 8), { tip: 2000, driverEarnings: 17360 })], 'day', now).tips, 2000);
assert.equal(computeMetrics([trip(co(2026, 11, 11, 8), { tip: 'x' })], 'day', now).tips, 0);

// No trips: zeros, no NaN.
for (const input of [[], undefined, null, [null, 7, {}]]) {
  const m = computeMetrics(input, 'week', now);
  assert.deepEqual({ count: m.count, gross: m.gross, commission: m.commission, tips: m.tips, net: m.net, average: m.average }, { count: 0, gross: 0, commission: 0, tips: 0, net: 0, average: 0 });
}
// Average is rounded; garbage amounts do not produce NaN.
const odd = computeMetrics([trip(co(2026, 11, 11, 1), { driverEarnings: 100 }), trip(co(2026, 11, 11, 2), { driverEarnings: 101 }), trip(co(2026, 11, 11, 3), { driverEarnings: 'x', fare: NaN })], 'day', now);
assert.equal(odd.average, Math.round(201 / 3));
assert.ok(Object.values(odd).every((v) => Array.isArray(v) || Number.isFinite(v)));

// Limits in Colombia: Sunday 23:59 is in the week, Monday 00:00 is not; month boundaries.
const edge = [trip(co(2026, 11, 15, 23, 59)), trip(co(2026, 11, 16, 0, 0)), trip(co(2026, 11, 8, 23, 59))];
assert.equal(computeMetrics(edge, 'week', now).count, 1);
assert.equal(computeMetrics([trip(co(2026, 10, 31, 23, 59)), trip(co(2026, 11, 1, 0, 0)), trip(co(2026, 11, 30, 23, 59)), trip(co(2026, 12, 1))], 'month', now).count, 2);
assert.deepEqual(periodRange(PERIOD.WEEK, now), { start: co(2026, 11, 9), end: co(2026, 11, 16) });

// buildEarnings: the pure core of useEarnings.
const cash = trip(co(2026, 11, 11, 8), { status: 'paid', paymentMethod: 'cash', paymentStatus: 'paid' });
const card = trip(co(2026, 11, 10, 8), { paymentMethod: 'mercadopago', paymentStatus: 'approved' });
const built = buildEarnings([cash, card], now);
assert.equal(built.day.count, 1);
assert.equal(built.week.count, 2);
assert.equal(built.month.count, 2);
assert.equal(built.balance, 15360 - 3840);
assert.equal(buildEarnings([], now).balance, 0);
assert.equal(buildEarnings(undefined, now).month.average, 0);
// AI-assisted: see AI_LOG.md #57 (T-122, CA-002-94, RF-54)
// Legacy trips (no paymentMethod and no paymentStatus) ARE included in the totals and metrics.
{
  const legacy = trip(co(2026, 11, 11, 8));
  const recent = trip(co(2026, 11, 11, 9), { paymentMethod: 'mercadopago', paymentStatus: 'approved' });
  const legacyPaid = trip(co(2026, 11, 11, 7), { status: 'paid' });
  const list = [legacy, recent, legacyPaid];
  const metrics = computeMetrics(list, PERIOD.DAY, now);
  assert.equal(metrics.count, 3, 'legacy completed and paid trips are counted');
  assert.equal(metrics.net, 15360 * 3);
  assert.equal(metrics.gross, 19200 * 3);
  assert.equal(computePeriodTotals(list, PERIOD.WEEK, now).count, 3);
  assert.equal(buildEarnings(list, now).month.count, 3);
}

// AI-assisted: see AI_LOG.md #58 (T-149, CA-002-125)
// A Stripe trip counts in the totals and in the balance like a Mercado Pago one.
{
  const stripeTrip = trip(co(2026, 11, 11, 9), { paymentMethod: 'stripe', paymentStatus: 'approved' });
  const pendingStripe = trip(co(2026, 11, 11, 10), { paymentMethod: 'stripe', paymentStatus: 'pending' });
  assert.equal(computeMetrics([stripeTrip], PERIOD.DAY, now).count, 1);
  assert.equal(buildEarnings([stripeTrip], now).balance, 15360, 'approved stripe adds the earnings');
  assert.equal(buildEarnings([pendingStripe], now).balance, 0, 'pending stripe adds nothing');
  assert.equal(buildEarnings([cash, card, stripeTrip], now).balance, 15360 * 2 - 3840);
}

console.log('earnings tests ok');

// AI-assisted: see docs/AI_LOG.md #61
// Plain Node tests for the simulated tip and rating (D-124): generator, mapper, trip record, charged
// amount, balance and legacy display. Run: node scripts/tests/tipFeedback.test.mjs
import assert from 'node:assert/strict';
import './helpers/registerSrcLoader.mjs';
import { chargeAmount } from '../../backend/src/chargeAmount.js';
import { createPaymentsHandlers } from '../../backend/src/routes/payments.js';

const { generateFeedback, TIP_MAX_COP, TIP_STEP_COP } = await import('../../src/services/passengerApi/simulatedFeedback.js');
const { createMockPassengerApi } = await import('../../src/services/passengerApi/mockPassengerApi.js');
const { toTripRequest } = await import('../../src/services/passengerApi/mappers.js');
const { buildTripRecord, SAVED_STATUS, TRIP_DOC_KEYS } = await import('../../src/services/trip/tripRecord.js');
const { calculateFare } = await import('../../src/utils/fare.js');
const { computeBalance, computeMetrics } = await import('../../src/utils/earnings.js');
const { tripDetailView } = await import('../../src/services/trip/tripDetailView.js');

// Deterministic generator with a seeded LCG.
function lcg(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}
assert.deepEqual(generateFeedback(lcg(7)), generateFeedback(lcg(7)));

// Ranges and distribution over many draws.
{
  const random = lcg(42);
  let withTip = 0;
  let low = 0;
  const N = 20000;
  for (let i = 0; i < N; i++) {
    const { tip, rating } = generateFeedback(random);
    assert.ok(Number.isInteger(tip) && tip >= 0 && tip <= TIP_MAX_COP && tip % TIP_STEP_COP === 0, `tip ${tip}`);
    assert.ok(Number.isInteger(rating) && rating >= 1 && rating <= 5, `rating ${rating}`);
    if (tip > 0) withTip += 1;
    if (rating <= 2) low += 1;
  }
  assert.ok(withTip / N > 0.35 && withTip / N < 0.45, `tip share ${withTip / N}`);
  assert.ok(low / N < 0.1, `low rating share ${low / N}`);
}
// Synthetic extremes.
assert.deepEqual(generateFeedback(() => 0.999999), { tip: 0, rating: 5 });
assert.equal(generateFeedback(() => 0).tip, 500);
assert.equal(generateFeedback(() => 0).rating <= 2, true);

// The mock request carries tip and rating (injected random, no timers fired).
{
  const api = createMockPassengerApi({ random: () => 0.1, setTimer: () => 1, clearTimer: () => {}, log: () => {} });
  let emitted = null;
  api.subscribeToRequests((r) => (emitted = r), () => {}, { getDriverPosition: () => ({ lat: 6.25, lng: -75.57 }) });
  api.requestNow?.();
  if (emitted) {
    assert.ok(Number.isInteger(emitted.tip) && emitted.tip % 500 === 0);
    assert.ok(Number.isInteger(emitted.rating) && emitted.rating >= 1 && emitted.rating <= 5);
  }
}

// Mapper: snake_case/aliases, legacy leaves both undefined, invalid values dropped.
{
  const legacy = toTripRequest({});
  assert.equal(legacy.tip, undefined);
  assert.equal(legacy.rating, undefined);
  assert.equal(toTripRequest({ tip: 1500, rating: 4 }).tip, 1500);
  assert.equal(toTripRequest({ driver_rating: 3 }).rating, 3);
  assert.equal(toTripRequest({ tip: -5, rating: 9 }).tip, undefined);
  assert.equal(toTripRequest({ tip: 10.5, rating: 0 }).rating, undefined);
}

// Trip record with tip.
const req = (extra = {}) => ({
  id: 'r1',
  passenger: { name: 'Ana' },
  origin: { lat: 4.6, lng: -74.08, address: 'O' },
  destination: { lat: 4.7, lng: -74.1, address: 'D' },
  distanceKm: 8.5,
  durationMin: 22,
  category: 'economico',
  paymentMethod: 'cash',
  ...extra,
});
const base = { driverId: 'u1', tripId: 't1', status: SAVED_STATUS.COMPLETED, startedAt: 1000, finishedAt: 2000 };
assert.ok(TRIP_DOC_KEYS.includes('tip') && TRIP_DOC_KEYS.includes('rating'));
{
  const noTip = buildTripRecord({ ...base, request: req() });
  assert.equal(noTip.fare, 19200);
  assert.equal(noTip.driverEarnings, 15360);
  assert.equal(noTip.tip, 0);
  assert.equal(noTip.rating, null);
  assert.equal(noTip.commission + noTip.driverEarnings, noTip.fare);

  const xl = buildTripRecord({ ...base, request: req({ category: 'xl', tip: 2000, rating: 5 }) });
  assert.equal(xl.fare, 26900);
  assert.equal(xl.commission, 5380);
  assert.equal(xl.driverEarnings, 23520);
  assert.equal(xl.tip, 2000);
  assert.equal(xl.rating, 5);
  assert.equal(xl.commission + xl.driverEarnings, xl.fare + xl.tip);
  assert.equal(calculateFare({ category: 'xl', distanceKm: 8.5, durationMin: 22, tip: 2000 }).driverEarnings, 23520);

  const cancelled = buildTripRecord({ ...base, request: req({ tip: 2000, rating: 5 }), status: SAVED_STATUS.CANCELLED });
  assert.equal(cancelled.tip, 0);
  assert.equal(cancelled.rating, null);
  assert.equal(cancelled.fare, 0);
  assert.equal(cancelled.driverEarnings, 0);
}

// Charged amount: fare + tip from the document; a body amount is ignored.
assert.equal(chargeAmount({ fare: 26900, tip: 2000 }), 28900);
assert.equal(chargeAmount({ fare: 26900 }), 26900);
assert.equal(chargeAmount({ fare: 26900, tip: -1 }), 26900);
assert.equal(chargeAmount({ fare: 26900, tip: 10.5 }), 26900);
assert.equal(chargeAmount({ fare: 0, tip: 500 }), 0);
{
  const seen = [];
  const provider = { id: 'stripe', createCheckout: async (a) => (seen.push(chargeAmount(a.trip)), { url: 'https://x.test', id: 'cs_1' }) };
  const registry = { isKnown: () => true, get: () => provider, flags: () => ({}) };
  const store = {
    getTrip: async () => ({ status: 'completed', paymentMethod: 'stripe', paymentStatus: 'pending', fare: 26900, tip: 2000 }),
    setPaymentMethod: async () => ({ ok: true }),
  };
  const handlers = createPaymentsHandlers({ store, config: { maxAmountCop: 2_000_000, currency: 'cop', publicBaseUrl: 'https://x.test' }, registry });
  const res = await handlers.checkout({ uid: 'u1', body: { tripId: 't1', provider: 'stripe', amount: 1 } });
  assert.equal(res.status, 200);
  assert.deepEqual(seen, [28900]);
  const capped = createPaymentsHandlers({ store, config: { maxAmountCop: 28899, currency: 'cop', publicBaseUrl: 'https://x.test' }, registry });
  assert.equal((await capped.checkout({ uid: 'u1', body: { tripId: 't1', provider: 'stripe' } })).status, 400);
}

// Balance: cash keeps fare + tip, only the commission is deducted; card adds earnings with tip.
{
  const xlCash = { status: 'paid', paymentMethod: 'cash', paymentStatus: 'paid', fare: 26900, tip: 2000, commission: 5380, driverEarnings: 23520 };
  const xlCard = { ...xlCash, paymentMethod: 'stripe', paymentStatus: 'approved' };
  assert.equal(computeBalance([xlCash]), -5380);
  assert.equal(computeBalance([xlCard]), 23520);
}

// Legacy trip (no tip, no rating) still displays.
{
  const view = tripDetailView({ status: 'completed', paymentMethod: 'cash', paymentStatus: 'pending', durationMin: 5, distanceKm: 1, commission: 0 });
  assert.equal(view.rating.text, 'Sin calificación');
  assert.equal(view.rows.find((r) => r.key === 'tip').value, 'Sin propina');
}
void computeMetrics;

console.log('tipFeedback tests ok');

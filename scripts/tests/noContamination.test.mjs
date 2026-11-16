// AI-assisted: see docs/AI_LOG.md #66
// T-232 (B4): rejected and cancelled trips never contaminate earnings, balance or commission
// (RE-14, RE-15, RE-16; CA-005-25, CA-005-27).
import assert from 'node:assert/strict';
import test from 'node:test';
import './helpers/registerSrcLoader.mjs';

const { buildEarnings, computeBalance, computeMetrics, computePeriodTotals, PERIOD } = await import('../../src/utils/earnings.js');
const { buildTripRecord, SAVED_STATUS } = await import('../../src/services/trip/tripRecord.js');
const { tripDetailView } = await import('../../src/services/trip/tripDetailView.js');
const { readTrip } = await import('../../src/services/trip/legacyTrip.js');
const { paymentView, PAYMENT_ACTION, PAYMENT_CHIP } = await import('../../src/services/trip/paymentView.js');
const { declineRequest, DECLINE_REASON, resetDeclineStateForTest } = await import('../../src/services/trip/declineRequest.js');

const co = (y, m, d, h = 0) => Date.UTC(y, m - 1, d, h + 5);
const now = co(2026, 11, 11, 15);
const request = {
  id: 'r', passenger: { name: 'Ana' }, distanceKm: 8.5, durationMin: 22, category: 'economico', paymentMethod: 'cash', rating: 5, tip: 1000,
  origin: { lat: 4.6, lng: -74.08, address: 'O' }, destination: { lat: 4.7, lng: -74.1, address: 'D' },
};
const record = (status, id, hour, over = {}) => ({
  id,
  ...buildTripRecord({ driverId: 'u', tripId: id, request: { ...request, id }, status, finishedAt: co(2026, 11, 11, hour) }),
  ...over,
});

const completedCash = record(SAVED_STATUS.COMPLETED, 'c1', 8, { paymentStatus: 'paid' });
const completedCard = record(SAVED_STATUS.COMPLETED, 'c2', 9, { paymentMethod: 'mercadopago', paymentStatus: 'approved' });
const paid = record(SAVED_STATUS.COMPLETED, 'p1', 10, { status: 'paid', paymentStatus: 'paid' });
const cancelled = record(SAVED_STATUS.CANCELLED, 'x1', 11);
const rejected = record(SAVED_STATUS.REJECTED, 'j1', 12);
const rejectedCard = record(SAVED_STATUS.REJECTED, 'j2', 13, { paymentMethod: 'mercadopago' });
const real = [completedCash, completedCard, paid];
const withNoise = [...real, cancelled, rejected, rejectedCard];

test('the six metrics, the periods and the balance ignore rejected and cancelled (CA-005-25)', () => {
  for (const period of [PERIOD.DAY, PERIOD.WEEK, PERIOD.MONTH]) {
    const a = computeMetrics(withNoise, period, now);
    const b = computeMetrics(real, period, now);
    assert.deepEqual({ ...a, trips: a.trips.length }, { ...b, trips: b.trips.length });
    const ta = computePeriodTotals(withNoise, period, now);
    const tb = computePeriodTotals(real, period, now);
    assert.deepEqual([ta.net, ta.commission, ta.gross, ta.count], [tb.net, tb.commission, tb.gross, tb.count]);
  }
  assert.equal(computeBalance(withNoise), computeBalance(real));
  assert.deepEqual(buildEarnings(withNoise, now), buildEarnings(real, now));
  assert.equal(computeMetrics(withNoise, PERIOD.DAY, now).count, 3);
});

test('rejected and cancelled alone give zero everywhere', () => {
  const only = [cancelled, rejected, rejectedCard];
  const m = computeMetrics(only, PERIOD.MONTH, now);
  assert.deepEqual([m.count, m.gross, m.commission, m.tips, m.net, m.average], [0, 0, 0, 0, 0, 0]);
  assert.equal(computeBalance(only), 0);
});

test('computeBalance excludes rejected explicitly, even with a forged paid state or positive amounts', () => {
  const forged = [
    { status: 'rejected', paymentMethod: 'cash', paymentStatus: 'paid', commission: 500, driverEarnings: 900 },
    { status: 'rejected', paymentMethod: 'mercadopago', paymentStatus: 'approved', commission: 500, driverEarnings: 900 },
  ];
  assert.equal(computeBalance(forged), 0);
});

test('RE-15: rejected and cancelled records have null rating, tip 0 and zero amounts', () => {
  for (const doc of [cancelled, rejected]) {
    assert.equal(doc.rating, null);
    assert.equal(doc.tip, 0);
    assert.deepEqual([doc.fare, doc.commission, doc.driverEarnings], [0, 0, 0]);
  }
});

test('RE-16: completed, paid and cancelled trips behave as before (positive amounts only for the real ones)', () => {
  const m = computeMetrics(real, PERIOD.DAY, now);
  assert.equal(m.count, 3);
  assert.ok(m.net > 0 && m.gross > 0 && m.commission > 0);
  assert.equal(computeBalance([completedCash]), -completedCash.commission);
  assert.equal(computeBalance([completedCard]), completedCard.driverEarnings);
});

// A record of a request that expired, produced by the real decline path (reason 'expired').
async function expiredRecord(method) {
  resetDeclineStateForTest();
  let saved = null;
  await declineRequest({
    uid: 'u',
    request: { ...request, id: `e-${method}`, paymentMethod: method },
    reason: DECLINE_REASON.EXPIRED,
    save: async (_uid, _id, doc) => {
      saved = { id: _id, ...doc };
    },
    release: false,
    now: () => co(2026, 11, 11, 14),
  });
  return saved;
}

test('CA-005-27: paymentView offers no charge and no cash confirmation for rejected or expired trips', async () => {
  const expiredCash = await expiredRecord('cash');
  const expiredCard = await expiredRecord('mercadopago');
  const cases = [
    record(SAVED_STATUS.REJECTED, 'j3', 12, { paymentMethod: 'mercadopago', paymentStatus: 'pending' }),
    record(SAVED_STATUS.REJECTED, 'j4', 12, { paymentMethod: 'cash', paymentStatus: 'pending' }),
    expiredCash,
    expiredCard,
  ];
  for (const doc of cases) {
    assert.equal(doc.status, 'rejected');
    assert.equal(doc.paymentStatus, 'pending');
    const view = paymentView(doc);
    assert.deepEqual(view, { chip: PAYMENT_CHIP.UNAVAILABLE, actions: [] });
    assert.equal(view.actions.includes(PAYMENT_ACTION.CONFIRM_CASH), false);
    assert.equal(view.actions.includes(PAYMENT_ACTION.CHARGE), false);
    assert.equal(computeBalance([doc]), 0);
    const totals = computePeriodTotals([doc], PERIOD.DAY, now);
    assert.deepEqual([totals.count, totals.net, totals.commission, totals.gross], [0, 0, 0, 0]);
  }
  // Contrast: the same pending cash/card trip, completed, does offer its actions.
  assert.deepEqual(paymentView({ status: 'completed', paymentMethod: 'cash', paymentStatus: 'pending' }).actions, [PAYMENT_ACTION.CONFIRM_CASH]);
  assert.deepEqual(paymentView({ status: 'completed', paymentMethod: 'mercadopago', paymentStatus: 'pending' }).actions, [PAYMENT_ACTION.CHARGE, PAYMENT_ACTION.VERIFY]);
});

test('CA-005-27: a rejected trip detail shows "Rechazado" with zero commission', () => {
  assert.equal(rejected.paymentStatus, 'pending');
  const view = tripDetailView(readTrip(rejected));
  assert.equal(view.status.label, 'Rechazado');
  const commissionRow = view.rows.find((row) => row.key === 'commission');
  assert.equal(commissionRow.value.replace(/\D/g, ''), '0');
});

test('CA-005-27: a completed trip with paymentStatus rejected stays completed and still counts as earned', () => {
  const trip = record(SAVED_STATUS.COMPLETED, 'k1', 9, { paymentMethod: 'mercadopago', paymentStatus: 'rejected' });
  assert.equal(trip.status, 'completed');
  assert.equal(tripDetailView(trip).status.label, 'Pago rechazado');
  assert.equal(computePeriodTotals([trip], PERIOD.DAY, now).count, 1);
  assert.equal(computeBalance([trip]), 0); // a rejected card payment owes nothing
});

// AI-assisted: see docs/AI_LOG.md #66
// Tests for buildTripRecord with rejected (T-226, CA-005-10, 16, 19).
import assert from 'node:assert/strict';
import test from 'node:test';
import './helpers/registerSrcLoader.mjs';

const { buildTripRecord, SAVED_STATUS } = await import('../../src/services/trip/tripRecord.js');

const request = {
  id: 'r1', passenger: { name: 'Ana' }, distanceKm: 8.5, durationMin: 22, category: 'economico', paymentMethod: 'cash', rating: 5, tip: 1000,
  origin: { lat: 4.6, lng: -74.08, address: 'O' }, destination: { lat: 4.7, lng: -74.1, address: 'D' },
};
const base = { driverId: 'u1', tripId: 'r1', request, finishedAt: 5000, route: [[4.6, -74.08], [4.7, -74.1]] };

for (const status of [SAVED_STATUS.REJECTED, SAVED_STATUS.CANCELLED]) {
  test(`${status}: zero amounts, null rating, no route, finishedAt kept`, () => {
    const doc = buildTripRecord({ ...base, status });
    assert.equal(doc.status, status);
    assert.equal(doc.fare, 0);
    assert.equal(doc.commission, 0);
    assert.equal(doc.driverEarnings, 0);
    assert.equal(doc.tip, 0);
    assert.equal(doc.rating, null);
    assert.ok(doc.finishedAt instanceof Date && doc.finishedAt.getTime() === 5000);
    assert.ok(!('route' in doc));
    assert.ok(!('completedAt' in doc));
    assert.deepEqual(doc.economy, { fare: 0, commission: 0, tip: 0, driverEarnings: 0 });
    assert.equal(doc.paymentStatus, 'pending');
  });
}

test('never produces requested, even for an unknown status', () => {
  for (const status of ['requested', undefined, 'bogus']) {
    assert.notEqual(buildTripRecord({ ...base, status }).status, 'requested');
  }
});

test('completed is built as before (top-level amounts)', () => {
  const doc = buildTripRecord({ ...base, status: SAVED_STATUS.COMPLETED });
  assert.equal(doc.status, 'completed');
  assert.equal(doc.fare, 19200);
  assert.equal(doc.rating, 5);
});

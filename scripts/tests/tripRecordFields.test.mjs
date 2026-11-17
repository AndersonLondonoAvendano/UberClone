// AI-assisted: see AI_LOG.md #66
// Tests for the additive fields of buildTripRecord (T-227, CA-005-18, 19, 22).
import assert from 'node:assert/strict';
import test from 'node:test';
import './helpers/registerSrcLoader.mjs';

const { buildTripRecord, SAVED_STATUS, TRIP_DOC_KEYS } = await import('../../src/services/trip/tripRecord.js');

const PREVIOUS_KEYS = [
  'driverId', 'status', 'paymentStatus', 'commissionRate', 'category', 'passengerName', 'originLabel',
  'destinationLabel', 'distanceKm', 'durationMin', 'fare', 'commission', 'driverEarnings', 'tip', 'rating',
  'paymentMethod', 'startedAt', 'finishedAt', 'createdAt', 'route',
];
const request = {
  id: 'r1', passengerId: 'p1', passenger: { name: 'Ana' }, distanceKm: 8.5, durationMin: 22, category: 'economico',
  paymentMethod: 'cash', origin: { lat: 4.6, lng: -74.08, address: 'Origen' }, destination: { lat: 4.7, lng: -74.1, address: 'Destino' },
};
const base = { driverId: 'u1', tripId: 'r1', request, startedAt: 1000, finishedAt: 2000 };

test('TRIP_DOC_KEYS contains the previous list plus the new keys', () => {
  for (const key of PREVIOUS_KEYS) assert.ok(TRIP_DOC_KEYS.includes(key), key);
  for (const key of ['passengerId', 'completedAt', 'economy', 'origin', 'destination']) assert.ok(TRIP_DOC_KEYS.includes(key), key);
});

test('completed example 8.5 km / 22 min economico', () => {
  const doc = buildTripRecord({ ...base, status: SAVED_STATUS.COMPLETED });
  assert.deepEqual(doc.economy, { fare: 19200, commission: 3840, tip: 0, driverEarnings: 15360 });
  assert.equal(doc.fare, doc.economy.fare);
  assert.equal(doc.driverEarnings, doc.economy.driverEarnings);
  assert.equal(doc.completedAt.getTime(), doc.finishedAt.getTime());
  assert.deepEqual(doc.origin, { lat: 4.6, lng: -74.08, address: 'Origen' });
  assert.deepEqual(doc.destination, { lat: 4.7, lng: -74.1, address: 'Destino' });
  assert.equal(doc.passengerId, 'p1');
  const allowed = new Set(TRIP_DOC_KEYS);
  Object.keys(doc).forEach((key) => assert.ok(allowed.has(key), key));
});

test('cancelled and rejected: no completedAt, economy zeros', () => {
  for (const status of [SAVED_STATUS.CANCELLED, SAVED_STATUS.REJECTED]) {
    const doc = buildTripRecord({ ...base, status });
    assert.ok(!('completedAt' in doc));
    assert.deepEqual(doc.economy, { fare: 0, commission: 0, tip: 0, driverEarnings: 0 });
  }
});

test('missing coordinates or passengerId are omitted, not invented', () => {
  const doc = buildTripRecord({
    ...base, status: SAVED_STATUS.COMPLETED,
    request: { ...request, passengerId: undefined, origin: { address: 'x' }, destination: { lat: 'a', lng: 1, address: 'y' } },
  });
  assert.ok(!('passengerId' in doc) && !('origin' in doc) && !('destination' in doc));
  assert.equal(doc.originLabel, 'x');
});

// AI-assisted: see docs/AI_LOG.md #66
// Tests for readTrip (T-225, CA-005-20, CA-005-21).
import assert from 'node:assert/strict';
import test from 'node:test';
import './helpers/registerSrcLoader.mjs';

const { readTrip } = await import('../../src/services/trip/legacyTrip.js');

const legacy = {
  status: 'completed', originLabel: 'A', destinationLabel: 'B', fare: 19200, commission: 3840,
  driverEarnings: 15360, tip: 0, finishedAt: 'F',
};

test('legacy trip gets defaults and keeps every existing field', () => {
  const read = readTrip(legacy);
  for (const key of Object.keys(legacy)) assert.equal(read[key], legacy[key]);
  assert.equal(read.passengerId, null);
  assert.equal(read.completedAt, 'F');
  assert.deepEqual(read.economy, { fare: 19200, commission: 3840, tip: 0, driverEarnings: 15360 });
  assert.deepEqual(read.origin, { lat: null, lng: null, address: 'A' });
  assert.deepEqual(read.destination, { lat: null, lng: null, address: 'B' });
});

test('completedAt default only for completed or paid', () => {
  assert.equal(readTrip({ ...legacy, status: 'paid' }).completedAt, 'F');
  assert.equal(readTrip({ ...legacy, status: 'cancelled' }).completedAt, null);
  assert.equal(readTrip({ ...legacy, status: 'rejected' }).completedAt, null);
  assert.equal(readTrip({ ...legacy, completedAt: 'C' }).completedAt, 'C');
});

test('top-level amounts win over economy', () => {
  const read = readTrip({ ...legacy, economy: { fare: 1, commission: 2, tip: 3, driverEarnings: 4 } });
  assert.deepEqual(read.economy, { fare: 19200, commission: 3840, tip: 0, driverEarnings: 15360 });
});

test('missing label and null input do not throw', () => {
  assert.equal(readTrip({}).origin.address, '');
  assert.deepEqual(readTrip(null).economy, { fare: 0, commission: 0, tip: 0, driverEarnings: 0 });
});

test('new fields are kept when present', () => {
  const read = readTrip({ ...legacy, passengerId: 'p1', origin: { lat: 1, lng: 2, address: 'X' } });
  assert.equal(read.passengerId, 'p1');
  assert.deepEqual(read.origin, { lat: 1, lng: 2, address: 'X' });
});

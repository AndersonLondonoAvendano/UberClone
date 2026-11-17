// AI-assisted: see docs/AI_LOG.md #66
// Tests for declineRequest (T-228, T-229; CA-005-10, 11, 12, 14 and the "first decision wins" edge case).
import assert from 'node:assert/strict';
import test, { beforeEach } from 'node:test';
import './helpers/registerSrcLoader.mjs';

const { declineRequest, markRequestAccepted, resetDeclineStateForTest, DECLINE_RESULT, DECLINE_REASON } = await import(
  '../../src/services/trip/declineRequest.js'
);

const request = {
  id: 'r1', passenger: { name: 'Ana' }, distanceKm: 8.5, durationMin: 22, category: 'economico', paymentMethod: 'cash',
  origin: { lat: 4.6, lng: -74.08, address: 'O' }, destination: { lat: 4.7, lng: -74.1, address: 'D' },
};

function fakes() {
  const saved = [];
  const released = [];
  return {
    saved,
    released,
    save: async (uid, id, record) => {
      saved.push({ uid, id, record });
    },
    reject: async (id) => {
      released.push(id);
    },
  };
}

beforeEach(resetDeclineStateForTest);

test('a rejection saves one rejected record with zero amounts and releases the request', async () => {
  const f = fakes();
  const result = await declineRequest({ uid: 'u1', request, reason: DECLINE_REASON.REJECTED, save: f.save, reject: f.reject });
  assert.equal(result, DECLINE_RESULT.SAVED);
  assert.equal(f.saved.length, 1);
  assert.equal(f.saved[0].id, 'r1');
  const doc = f.saved[0].record;
  assert.equal(doc.status, 'rejected');
  for (const key of ['fare', 'commission', 'driverEarnings', 'tip']) assert.equal(doc[key], 0);
  assert.equal(doc.rating, null);
  assert.deepEqual(doc.economy, { fare: 0, commission: 0, tip: 0, driverEarnings: 0 });
  assert.deepEqual(f.released, ['r1']);
});

test('expired is saved exactly like a rejection (one label, one record shape)', async () => {
  const a = fakes();
  const b = fakes();
  await declineRequest({ uid: 'u1', request, reason: DECLINE_REASON.REJECTED, save: a.save, reject: a.reject, now: () => 7 });
  resetDeclineStateForTest();
  await declineRequest({ uid: 'u1', request, reason: DECLINE_REASON.EXPIRED, save: b.save, reject: b.reject, now: () => 7 });
  assert.deepEqual(a.saved[0].record, b.saved[0].record);
});

test('idempotent: several notifications for one request make one write and one release', async () => {
  const f = fakes();
  const args = { uid: 'u1', request, save: f.save, reject: f.reject };
  const results = await Promise.all([declineRequest(args), declineRequest(args), declineRequest({ ...args, reason: DECLINE_REASON.EXPIRED })]);
  assert.equal(f.saved.length, 1);
  assert.equal(f.released.length, 1);
  assert.deepEqual(results.filter((r) => r === DECLINE_RESULT.SKIPPED).length, 2);
});

test('release=false saves without calling the passenger API again', async () => {
  const f = fakes();
  await declineRequest({ uid: 'u1', request, reason: DECLINE_REASON.EXPIRED, save: f.save, reject: f.reject, release: false });
  assert.equal(f.saved.length, 1);
  assert.equal(f.released.length, 0);
});

test('an accepted request is ignored: nothing is saved or released', async () => {
  const f = fakes();
  markRequestAccepted('r1');
  const result = await declineRequest({ uid: 'u1', request, reason: DECLINE_REASON.EXPIRED, save: f.save, reject: f.reject });
  assert.equal(result, DECLINE_RESULT.SKIPPED);
  assert.equal(f.saved.length, 0);
  assert.equal(f.released.length, 0);
});

test('without a driver uid the request is still released but nothing is written', async () => {
  const f = fakes();
  const result = await declineRequest({ uid: null, request, save: f.save, reject: f.reject });
  assert.equal(result, DECLINE_RESULT.SKIPPED);
  assert.equal(f.saved.length, 0);
  assert.deepEqual(f.released, ['r1']);
});

test('without a request or id it does nothing and does not throw', async () => {
  const f = fakes();
  assert.equal(await declineRequest({ uid: 'u1', request: null, save: f.save, reject: f.reject }), DECLINE_RESULT.SKIPPED);
  assert.equal(await declineRequest({ uid: 'u1', request: {}, save: f.save, reject: f.reject }), DECLINE_RESULT.SKIPPED);
  assert.equal(f.saved.length + f.released.length, 0);
});

test('a failing save never rejects the promise and the release still happens', async () => {
  const released = [];
  const result = await declineRequest({
    uid: 'u1',
    request,
    save: async () => {
      throw Object.assign(new Error('denied'), { code: 'permission-denied' });
    },
    reject: async (id) => released.push(id),
  });
  assert.equal(result, DECLINE_RESULT.FAILED);
  assert.deepEqual(released, ['r1']);
});

test('a failing release never affects the save or throws', async () => {
  const f = fakes();
  const result = await declineRequest({
    uid: 'u1',
    request,
    save: f.save,
    reject: async () => {
      throw new Error('EXPIRED');
    },
  });
  assert.equal(result, DECLINE_RESULT.SAVED);
});

test('a save that never answers ends by timeout with the injected clock (never blocks)', async () => {
  let fire;
  const timers = { set: (fn) => ((fire = fn), 1), clear: () => {} };
  const pending = declineRequest({ uid: 'u1', request, save: () => new Promise(() => {}), reject: async () => {}, timers });
  await Promise.resolve();
  fire();
  assert.equal(await pending, DECLINE_RESULT.FAILED);
});

test('a malformed request (no category) cannot crash the caller', async () => {
  const f = fakes();
  const result = await declineRequest({ uid: 'u1', request: { id: 'r2' }, save: f.save, reject: f.reject });
  assert.ok([DECLINE_RESULT.SAVED, DECLINE_RESULT.FAILED].includes(result));
});

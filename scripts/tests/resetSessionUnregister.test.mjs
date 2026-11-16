// AI-assisted: see docs/AI_LOG.md #64
// Plain Node test for the notifications step of resetSession (T-185, D-134): order, no change when the
// reset stops early, a 3 s bound that never blocks signOut, restore when signOut fails.
//   node scripts/tests/resetSessionUnregister.test.mjs
import assert from 'node:assert/strict';
import './helpers/registerSrcLoader.mjs';

const { resetSession, SESSION_RESET_REASON, STEP_STATUS, NOTIFICATION_UNREGISTER_TIMEOUT_MS } = await import(
  '../../src/services/session/resetSession.js'
);
const { buildSessionResetDeps } = await import('../../src/services/session/buildSessionResetDeps.js');

assert.equal(NOTIFICATION_UNREGISTER_TIMEOUT_MS, 3000);

const makeDeps = (log, overrides = {}) => ({
  hasTripInProgress: () => false,
  discardPendingRequest: () => log.push('discard'),
  setUnavailableAndPublishFinal: async () => log.push('publish'),
  stopLocation: () => log.push('stop'),
  releaseSubscriptions: () => log.push('release'),
  clearContexts: () => log.push('contexts'),
  clearOwnStorage: async () => log.push('storage'),
  waitForTripSaveQueue: async () => log.push('saveWait'),
  unregisterNotifications: async () => log.push('unregister'),
  restoreNotifications: async () => log.push('restore'),
  signOut: async () => log.push('signOut'),
  ...overrides,
});

// Exact order: save wait, then notifications off, then signOut.
{
  const log = [];
  const result = await resetSession(makeDeps(log));
  assert.equal(result.ok, true);
  assert.deepEqual(log, ['discard', 'publish', 'stop', 'release', 'contexts', 'storage', 'saveWait', 'unregister', 'signOut']);
}

// Trip in progress: nothing of the notifications step runs.
{
  const log = [];
  const result = await resetSession(makeDeps(log, { hasTripInProgress: () => true }));
  assert.equal(result.reason, SESSION_RESET_REASON.TRIP_IN_PROGRESS);
  assert.deepEqual(log, []);
}

// Trip save pending (wait times out): no unregistration, no signOut.
{
  const log = [];
  const timers = [];
  const deps = makeDeps(log, {
    waitForTripSaveQueue: () => new Promise(() => {}),
    setTimeoutFn: (fn, ms) => (timers.push({ fn, ms }), timers.length),
    clearTimeoutFn: () => {},
  });
  const pending = resetSession(deps);
  await new Promise((r) => setImmediate(r));
  const drain = timers.find((t) => t.ms === 8000);
  drain.fn();
  const result = await pending;
  assert.equal(result.reason, SESSION_RESET_REASON.TRIP_SAVE_PENDING);
  assert.equal(log.includes('unregister'), false);
  assert.equal(log.includes('signOut'), false);
}

// skipTripSaveWait still unregisters before signOut.
{
  const log = [];
  await resetSession(makeDeps(log), { skipTripSaveWait: true });
  assert.ok(log.indexOf('unregister') < log.indexOf('signOut'));
  assert.equal(log.includes('saveWait'), false);
}

// A hung unregistration times out after 3 s and does not block signOut.
{
  const log = [];
  const timers = [];
  const deps = makeDeps(log, {
    unregisterNotifications: () => new Promise(() => {}),
    setTimeoutFn: (fn, ms) => (timers.push({ fn, ms }), timers.length),
    clearTimeoutFn: () => {},
  });
  const pending = resetSession(deps);
  await new Promise((r) => setImmediate(r));
  await new Promise((r) => setImmediate(r));
  const bound = timers.find((t) => t.ms === 3000);
  assert.ok(bound, 'a 3000 ms bound is armed');
  bound.fn();
  const result = await pending;
  assert.equal(result.ok, true);
  assert.equal(result.steps.unregisterNotifications, STEP_STATUS.TIMEOUT);
  assert.ok(log.includes('signOut'));
}

// A throwing unregistration never blocks signOut.
{
  const log = [];
  const result = await resetSession(
    makeDeps(log, {
      unregisterNotifications: async () => {
        throw new Error('boom');
      },
    }),
  );
  assert.equal(result.ok, true);
  assert.equal(result.steps.unregisterNotifications, STEP_STATUS.FAILED);
  assert.ok(log.includes('signOut'));
}

// signOut fails after the step ran: restore is attempted and the reason is kept.
{
  const log = [];
  const result = await resetSession(
    makeDeps(log, {
      signOut: async () => {
        throw new Error('offline');
      },
    }),
  );
  assert.equal(result.reason, SESSION_RESET_REASON.SIGN_OUT_FAILED);
  assert.ok(log.includes('restore'));
}

// Without the optional deps nothing changes (step skipped, no restore).
{
  const log = [];
  const deps = makeDeps(log, { unregisterNotifications: undefined, restoreNotifications: undefined });
  const result = await resetSession(deps);
  assert.equal(result.ok, true);
  assert.equal(result.steps.unregisterNotifications, STEP_STATUS.SKIPPED);
}

// The default clearOwnStorage is a no-op, so it cannot clear notificationsEnabled or the token (D-134).
{
  const built = buildSessionResetDeps({
    getAvailability: () => null,
    getTrip: () => null,
    getAppState: () => null,
    getRegistration: () => null,
    publishIdleStatus: async () => {},
    signOut: async () => {},
    unregisterNotifications: () => {},
  });
  assert.equal(await built.clearOwnStorage(), undefined);
  assert.equal(typeof built.unregisterNotifications, 'function');
  assert.equal(built.restoreNotifications, undefined);
}

console.log('resetSessionUnregister tests passed');

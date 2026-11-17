// AI-assisted: see AI_LOG.md #72
// T-288/T-289/T-290 (D-201): the "Disponible" choice saved per uid, restored on open only when allowed,
// the three-state gate of a tapped notification (with the wait cap) and a single "true" report on restore.
// Fake storage, injected clock and timers: no real waiting, no network.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import './helpers/registerSrcLoader.mjs';

const { createAvailabilityPreference } = await import('../../src/services/availabilityPreference.js');
const { shouldRestoreAvailability } = await import('../../src/services/availabilityRestore.js');
const { createIntentFlow, FLOW_RESULT } = await import('../../src/services/notifications/intentFlow.js');
const { parsePushData } = await import('../../src/services/notifications/pushRequest.js');
const { createPendingIntent } = await import('../../src/services/notifications/pendingIntent.js');
const { createAvailabilityReporter } = await import('../../src/services/notifications/availabilityReporter.js');
const { buildSessionResetDeps } = await import('../../src/services/session/buildSessionResetDeps.js');
const { resetSession } = await import('../../src/services/session/resetSession.js');
const { ACCOUNT_STATUS } = await import('../../src/constants/accountStatus.js');
const { AVAILABILITY_RESTORE_WAIT_MS } = await import('../../src/config/availability.js');

const ROOT = path.resolve(import.meta.dirname, '../..');
const flush = async () => {
  for (let i = 0; i < 5; i += 1) await new Promise((resolve) => setImmediate(resolve));
};

function fakeStorage({ initial = {}, failRead = false, failWrite = false } = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: async (key) => {
      if (failRead) throw new Error('read');
      return data.has(key) ? data.get(key) : null;
    },
    setItem: async (key, value) => {
      if (failWrite) throw new Error('write');
      data.set(key, value);
    },
    removeItem: async (key) => {
      data.delete(key);
    },
  };
}

const source = ({ permission = 'granted', services = true } = {}) => ({
  calls: [],
  async getPermission() {
    this.calls.push('getPermission');
    return permission;
  },
  async checkServices() {
    this.calls.push('checkServices');
    return services;
  },
});

const restore = (over = {}) =>
  shouldRestoreAvailability({
    uid: 'A',
    accountApproved: true,
    onTrip: false,
    preference: createAvailabilityPreference({ storage: fakeStorage({ initial: { 'availability:A': 'true' } }) }),
    locationSource: source(),
    ...over,
  });

test('preference: saved and read per uid, another uid does not inherit it', async () => {
  const storage = fakeStorage();
  const pref = createAvailabilityPreference({ storage });
  assert.equal(await pref.get('A'), false);
  assert.equal(await pref.set('A', true), true);
  assert.equal(await pref.get('A'), true);
  assert.equal(await pref.get('B'), false);
  assert.deepEqual([...storage.data.keys()], ['availability:A']);
  assert.equal(storage.data.get('availability:A'), 'true');
  assert.equal(await pref.set('A', false), true);
  assert.equal(await pref.get('A'), false);
});

test('preference: clear removes it (sign-out) and another uid keeps its own', async () => {
  const storage = fakeStorage({ initial: { 'availability:A': 'true', 'availability:B': 'true' } });
  const pref = createAvailabilityPreference({ storage });
  assert.equal(await pref.clear('A'), true);
  assert.equal(await pref.get('A'), false);
  assert.equal(await pref.get('B'), true);
});

test('preference: corrupt value, failing storage and missing uid never throw and read as not available', async () => {
  for (const raw of ['TRUE', '1', '{"a":1}', '', 'yes']) {
    const pref = createAvailabilityPreference({ storage: fakeStorage({ initial: { 'availability:A': raw } }) });
    assert.equal(await pref.get('A'), false, `value ${raw}`);
  }
  const broken = createAvailabilityPreference({ storage: fakeStorage({ failRead: true, failWrite: true }) });
  assert.equal(await broken.get('A'), false);
  assert.equal(await broken.set('A', true), false);
  const ok = createAvailabilityPreference({ storage: fakeStorage() });
  assert.equal(await ok.get(null), false);
  assert.equal(await ok.set(undefined, true), false);
  assert.equal(await ok.clear(''), false);
});

test('restore: saved true + approved + no trip + permission + services -> restored, without any dialog', async () => {
  const location = source();
  assert.equal(await restore({ locationSource: location }), true);
  assert.deepEqual(location.calls, ['getPermission', 'checkServices'], 'only reads, no request/ask');
});

test('restore: trip in progress, account not approved, or nothing saved -> not available', async () => {
  assert.equal(await restore({ onTrip: true }), false);
  assert.equal(await restore({ accountApproved: false }), false);
  const saidNo = createAvailabilityPreference({ storage: fakeStorage({ initial: { 'availability:A': 'false' } }) });
  assert.equal(await restore({ preference: saidNo }), false);
  assert.equal(await restore({ preference: createAvailabilityPreference({ storage: fakeStorage() }) }), false);
});

test('restore: no permission or phone location off -> not available, silently', async () => {
  assert.equal(await restore({ locationSource: source({ permission: 'denied' }) }), false);
  assert.equal(await restore({ locationSource: source({ permission: 'unavailable' }) }), false);
  assert.equal(await restore({ locationSource: source({ services: false }) }), false);
  const throwing = {
    getPermission: async () => {
      throw new Error('x');
    },
    checkServices: async () => true,
  };
  assert.equal(await restore({ locationSource: throwing }), false);
});

test('restore: corrupt value or a failing read -> not available without throwing', async () => {
  const corrupt = createAvailabilityPreference({ storage: fakeStorage({ initial: { 'availability:A': 'garbage' } }) });
  assert.equal(await restore({ preference: corrupt }), false);
  const failing = createAvailabilityPreference({ storage: fakeStorage({ failRead: true }) });
  assert.equal(await restore({ preference: failing }), false);
});

test('restore: another uid does not inherit the saved choice', async () => {
  assert.equal(await restore({ uid: 'B' }), false);
});

test('session reset: the saved choice is removed in the unregister step; a failure does not stop the push cleanup', async () => {
  const storage = fakeStorage({ initial: { 'availability:A': 'true' } });
  const pref = createAvailabilityPreference({ storage });
  const order = [];
  const base = {
    getAvailability: () => null,
    getTrip: () => null,
    getAppState: () => null,
    getRegistration: () => null,
    publishIdleStatus: async () => {},
  };
  const deps = buildSessionResetDeps({
    ...base,
    clearAvailabilityPreference: async () => {
      await pref.clear('A');
      order.push('availability');
    },
    unregisterNotifications: async () => order.push('push'),
    signOut: async () => order.push('signOut'),
  });
  const result = await resetSession(deps, { skipTripSaveWait: true });
  assert.equal(result.ok, true);
  assert.deepEqual(order, ['availability', 'push', 'signOut']);
  assert.equal(await pref.get('A'), false);

  const order2 = [];
  const deps2 = buildSessionResetDeps({
    ...base,
    clearAvailabilityPreference: async () => {
      throw new Error('boom');
    },
    unregisterNotifications: async () => order2.push('push'),
    signOut: async () => order2.push('signOut'),
  });
  assert.equal((await resetSession(deps2, { skipTripSaveWait: true })).ok, true);
  assert.deepEqual(order2, ['push', 'signOut']);
});

// ---- notification tapped with the app closed (D-146 gate + D-201 wait) ----

const NOW = 1_700_000_000_000;
const pushData = () => ({
  type: 'trip_request', requestId: 'r1', targetUid: 'A', expiresAt: String(NOW + 90_000), category: 'economico',
  distanceKm: '3.2', durationMin: '9', originLat: '6.25', originLng: '-75.56', destLat: '6.26', destLng: '-75.55',
  passengerName: 'Test',
});

function flowSetup() {
  const clock = { now: NOW };
  const timers = [];
  const intents = createPendingIntent();
  const parsed = parsePushData(pushData());
  assert.equal(parsed.ok, true);
  intents.set(parsed.intent);
  const state = { uid: 'A', accountStatus: ACCOUNT_STATUS.APPROVED, onTrip: false, available: 'restoring' };
  const out = { offered: 0, unavailable: 0, expired: 0 };
  const flow = createIntentFlow({
    intents,
    getState: () => state,
    offer: () => {
      out.offered += 1;
      return true;
    },
    showExpired: () => {
      out.expired += 1;
    },
    showUnavailable: () => {
      out.unavailable += 1;
    },
    now: () => clock.now,
    awaitAvailabilityMs: AVAILABILITY_RESTORE_WAIT_MS,
    setTimeoutFn: (callback, ms) => {
      timers.push({ callback, ms, cleared: false });
      return timers.length - 1;
    },
    clearTimeoutFn: (id) => {
      if (timers[id]) timers[id].cleared = true;
    },
  });
  return { clock, timers, intents, state, out, flow };
}

test('tapped notification while restoring waits, then restored "Disponible" is offered with no notice', async () => {
  const t = flowSetup();
  assert.equal(await t.flow.evaluate(), FLOW_RESULT.WAITING);
  assert.equal(t.out.unavailable, 0);
  assert.ok(t.intents.peek(), 'the intent stays parked');
  t.clock.now += 300;
  t.state.available = 'available';
  assert.equal(await t.flow.evaluate(), FLOW_RESULT.ADOPTED);
  assert.equal(t.out.offered, 1);
  assert.equal(t.out.unavailable, 0);
  assert.equal(t.timers.at(-1).cleared, true, 'the wait timer is released');
});

test('tapped notification with "No disponible" saved: the notice shows once and nothing is offered', async () => {
  const t = flowSetup();
  assert.equal(await t.flow.evaluate(), FLOW_RESULT.WAITING);
  t.state.available = 'unavailable';
  assert.equal(await t.flow.evaluate(), FLOW_RESULT.UNAVAILABLE);
  assert.equal(await t.flow.evaluate(), FLOW_RESULT.NONE, 'a repeat does not stack another notice');
  assert.equal(t.out.unavailable, 1);
  assert.equal(t.out.offered, 0);
});

test('the wait cap: after the cap a still-restoring state counts as "No disponible" (notice once)', async () => {
  const t = flowSetup();
  assert.equal(await t.flow.evaluate(), FLOW_RESULT.WAITING);
  assert.equal(t.timers.length, 1);
  assert.equal(t.timers[0].ms, AVAILABILITY_RESTORE_WAIT_MS);
  t.clock.now += AVAILABILITY_RESTORE_WAIT_MS - 1;
  assert.equal(await t.flow.evaluate(), FLOW_RESULT.WAITING, 'one millisecond before the cap it still waits');
  assert.equal(t.timers.length, 1, 'no second timer is stacked');
  t.clock.now += 1;
  t.timers[0].callback(); // the timer fires at the cap
  await flush();
  assert.equal(t.out.unavailable, 1);
  assert.equal(t.out.offered, 0);
  assert.equal(t.intents.peek(), null);
});

test('flow.cancelWait releases the timer and keeps the intent parked', async () => {
  const t = flowSetup();
  await t.flow.evaluate();
  t.flow.cancelWait();
  assert.equal(t.timers[0].cleared, true);
  assert.ok(t.intents.peek());
});

// ---- T-290: one "true" on restore ----

test('restore as Disponible reports "true" exactly once; restored as not available reports no "true"', async () => {
  const calls = [];
  const api = {
    reportAvailability: async (value, seq) => {
      calls.push({ value, seq });
      return { ok: true, active: value, applied: true };
    },
  };
  const make = () =>
    createAvailabilityReporter({ api, now: () => NOW, setTimeout: () => 1, clearTimeout: () => {}, onConfirmedChange: () => {} });

  // Same sequence useRequestSource feeds: the provider starts not available (restoring), then restores true.
  const restored = make();
  restored.update({ effective: false, foreground: true });
  await flush();
  restored.update({ effective: true, foreground: true });
  await flush();
  restored.update({ effective: true, foreground: true }); // same value again (e.g. a re-render): no new report
  await flush();
  assert.equal(calls.filter((c) => c.value === true).length, 1);

  calls.length = 0;
  const notRestored = make();
  notRestored.update({ effective: false, foreground: true });
  await flush();
  notRestored.update({ effective: false, foreground: true });
  await flush();
  assert.equal(calls.filter((c) => c.value === true).length, 0);
});

test('the restore adds no second reporter: the context never calls the availability api', () => {
  const context = fs.readFileSync(path.join(ROOT, 'src/context/AvailabilityContext.js'), 'utf8');
  assert.equal(/reportAvailability|createAvailabilityReporter|notificationsApi/.test(context), false);
});

test('nothing about the saved choice touches Firestore', () => {
  for (const file of ['src/services/availabilityPreference.js', 'src/services/availabilityRestore.js', 'src/config/availability.js']) {
    const text = fs.readFileSync(path.join(ROOT, file), 'utf8');
    assert.equal(/firestore|firebase/i.test(text.replace(/\/\/.*$/gm, '')), false, file);
  }
});

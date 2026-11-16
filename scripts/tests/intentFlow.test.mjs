// AI-assisted: see docs/AI_LOG.md #64
// Plain Node test for the cold-start intent flow (STOP-2c, D-146): the intent is stored as soon as it
// arrives and evaluated only when the gate is ready. Simulated timeline, injected dependencies.
//   node scripts/tests/intentFlow.test.mjs
import assert from 'node:assert/strict';
import test from 'node:test';
import './helpers/registerSrcLoader.mjs';

const { createIntentFlow, FLOW_RESULT } = await import('../../src/services/notifications/intentFlow.js');
const { createPendingIntent } = await import('../../src/services/notifications/pendingIntent.js');
const { createNotifications } = await import('../../src/services/notifications/index.js');
const { createFakeAdapter } = await import('../../src/services/notifications/adapters/fakeAdapter.js');
const { ACCOUNT_STATUS } = await import('../../src/constants/accountStatus.js');

const NOW = 1_700_000_000_000;
const data = (extra = {}) => ({
  type: 'trip_request', requestId: 'r1', targetUid: 'A', expiresAt: String(NOW + 90_000), category: 'economico',
  distanceKm: '3.2', durationMin: '9', originLat: '6.25', originLng: '-75.56', destLat: '6.26', destLng: '-75.55',
  passengerName: 'Test', ...extra,
});

function setup({ initial = null } = {}) {
  const intents = createPendingIntent();
  const adapter = createFakeAdapter({ initial });
  const state = { uid: null, accountStatus: ACCOUNT_STATUS.LOADING, onTrip: false, now: NOW };
  const out = { offered: [], expired: 0, logs: [] };
  const flow = createIntentFlow({
    intents,
    getState: () => state,
    offer: (request) => { out.offered.push(request); return true; },
    showExpired: () => { out.expired += 1; },
    now: () => state.now,
    log: (code) => out.logs.push(code),
  });
  const notifications = createNotifications(adapter, {
    intents, now: () => state.now, isDev: true, log: (m) => out.logs.push(m),
  });
  const open = () => notifications.onNotificationOpened(() => flow.evaluate());
  const tick = () => new Promise((resolve) => setTimeout(resolve, 0));
  return { intents, adapter, state, out, flow, open, tick };
}

test('(a) before the gate resolves: stays pending, adopted on resolve', async () => {
  const t = setup({ initial: data() });
  t.open();
  await t.tick();
  assert.equal(t.out.offered.length, 0);
  assert.ok(t.intents.peek());
  assert.ok(t.out.logs.includes('gate-pending'));
  t.state.uid = 'A';
  t.state.accountStatus = ACCOUNT_STATUS.APPROVED;
  assert.equal(await t.flow.evaluate(), FLOW_RESULT.ADOPTED);
  assert.equal(t.out.offered.length, 1);
  assert.equal(t.out.offered[0].id, 'r1');
  assert.ok(t.out.logs.includes('intent-adopted'));
});

test('(b) session null, then restored with the right uid: adopted', async () => {
  const t = setup({ initial: data() });
  t.open();
  await t.tick();
  t.state.uid = null;
  t.state.accountStatus = ACCOUNT_STATUS.LOADING;
  assert.equal(await t.flow.evaluate(), FLOW_RESULT.PENDING);
  t.state.uid = 'A';
  assert.equal(await t.flow.evaluate(), FLOW_RESULT.PENDING); // uid there, status still loading
  t.state.accountStatus = ACCOUNT_STATUS.APPROVED;
  assert.equal(await t.flow.evaluate(), FLOW_RESULT.ADOPTED);
});

test('(c) different uid: dropped', async () => {
  const t = setup({ initial: data() });
  t.open(); await t.tick();
  t.state.uid = 'B'; t.state.accountStatus = ACCOUNT_STATUS.APPROVED;
  assert.equal(await t.flow.evaluate(), FLOW_RESULT.DROPPED);
  assert.equal(t.out.offered.length, 0);
  assert.equal(t.out.expired, 0);
  assert.ok(t.out.logs.includes('intent-dropped:uid-mismatch'));
});

test('(d) account not approved: dropped', async () => {
  const t = setup({ initial: data() });
  t.open(); await t.tick();
  t.state.uid = 'A'; t.state.accountStatus = ACCOUNT_STATUS.PENDING;
  assert.equal(await t.flow.evaluate(), FLOW_RESULT.DROPPED);
  assert.ok(t.out.logs.includes('intent-dropped:not-approved'));
});

test('(e) trip in progress: dropped', async () => {
  const t = setup({ initial: data() });
  t.open(); await t.tick();
  Object.assign(t.state, { uid: 'A', accountStatus: ACCOUNT_STATUS.APPROVED, onTrip: true });
  assert.equal(await t.flow.evaluate(), FLOW_RESULT.DROPPED);
  assert.ok(t.out.logs.includes('intent-dropped:on-trip'));
});

test('(f) expired when the gate is ready: "expired" notice, not offered', async () => {
  const t = setup({ initial: data() });
  t.open(); await t.tick();
  t.state.now = NOW + 91_000; // tapped after 90 s, with the gate resolving late
  Object.assign(t.state, { uid: 'A', accountStatus: ACCOUNT_STATUS.APPROVED });
  assert.equal(await t.flow.evaluate(), FLOW_RESULT.EXPIRED);
  assert.equal(t.out.expired, 1);
  assert.equal(t.out.offered.length, 0);
  assert.ok(t.out.logs.includes('intent-expired'));
});

test('(g) initial + listener with the same requestId: one request', async () => {
  const t = setup({ initial: data() });
  t.open(); await t.tick();
  t.adapter.emitOpened(data()); // second delivery while still parked
  Object.assign(t.state, { uid: 'A', accountStatus: ACCOUNT_STATUS.APPROVED });
  assert.equal(await t.flow.evaluate(), FLOW_RESULT.ADOPTED);
  t.adapter.emitOpened(data()); // third delivery after it was consumed
  assert.equal(await t.flow.evaluate(), FLOW_RESULT.NONE);
  assert.equal(t.out.offered.length, 1);
});

test('(h) sign-out clears the parked intent', async () => {
  const t = setup({ initial: data() });
  t.open(); await t.tick();
  t.flow.reset();
  Object.assign(t.state, { uid: 'A', accountStatus: ACCOUNT_STATUS.APPROVED });
  assert.equal(await t.flow.evaluate(), FLOW_RESULT.NONE);
  assert.equal(t.out.offered.length, 0);
});

test('(i) getInitialNotification returns null: no intent, no error', async () => {
  const t = setup({ initial: null });
  t.open(); await t.tick();
  assert.equal(t.intents.peek(), null);
  assert.ok(t.out.logs.some((m) => m.endsWith('push-initial-null')));
  Object.assign(t.state, { uid: 'A', accountStatus: ACCOUNT_STATUS.APPROVED });
  assert.equal(await t.flow.evaluate(), FLOW_RESULT.NONE);
});

test('logs carry only fixed codes (no uid, token or name)', async () => {
  const t = setup({ initial: data({ passengerName: 'SecretName' }) });
  t.open(); await t.tick();
  Object.assign(t.state, { uid: 'A', accountStatus: ACCOUNT_STATUS.APPROVED });
  await t.flow.evaluate();
  const all = t.out.logs.join('|');
  assert.ok(!all.includes('SecretName'));
  assert.ok(!all.includes('r1'));
});

// T-199: the offer is async (route lookup). The intent is taken first, so nothing is offered twice.
const withOffer = (t, offer) =>
  createIntentFlow({
    intents: t.intents,
    getState: () => t.state,
    offer,
    showExpired: () => { t.out.expired += 1; },
    now: () => t.state.now,
    log: (code) => t.out.logs.push(code),
  });

test('(j) async offer: evaluate waits for it and a second evaluate during the wait offers nothing', async () => {
  const t = setup({ initial: data() });
  t.open(); await t.tick();
  Object.assign(t.state, { uid: 'A', accountStatus: ACCOUNT_STATUS.APPROVED });
  let release;
  let calls = 0;
  const flow = withOffer(t, () => { calls += 1; return new Promise((resolve) => { release = resolve; }); });
  const first = flow.evaluate();
  assert.equal(await flow.evaluate(), FLOW_RESULT.NONE); // store already emptied
  release(true);
  assert.equal(await first, FLOW_RESULT.ADOPTED);
  assert.equal(calls, 1);
});

test('(k) expires during the wait: "expired" notice, not adopted', async () => {
  const t = setup({ initial: data() });
  t.open(); await t.tick();
  Object.assign(t.state, { uid: 'A', accountStatus: ACCOUNT_STATUS.APPROVED });
  const flow = withOffer(t, async () => { t.state.now = NOW + 91_000; return false; }); // lookup outlived the deadline
  assert.equal(await flow.evaluate(), FLOW_RESULT.EXPIRED);
  assert.equal(t.out.expired, 1);
});

test('(l) offer refused while not expired: dropped (not "expired")', async () => {
  const t = setup({ initial: data() });
  t.open(); await t.tick();
  Object.assign(t.state, { uid: 'A', accountStatus: ACCOUNT_STATUS.APPROVED });
  const flow = withOffer(t, async () => false);
  assert.equal(await flow.evaluate(), FLOW_RESULT.DROPPED);
  assert.equal(t.out.expired, 0);
});

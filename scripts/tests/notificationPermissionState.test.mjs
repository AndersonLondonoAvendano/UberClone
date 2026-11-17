// AI-assisted: see AI_LOG.md #64
// Plain Node test for the notifications service with the fake adapter (T-180): permission states,
// token refresh, registration, foreground messages and opened intents.
//   node scripts/tests/notificationPermissionState.test.mjs
import assert from 'node:assert/strict';
import './helpers/registerSrcLoader.mjs';

const { PERMISSION_STATE } = await import('../../src/services/notifications/constants.js');
const ps = await import('../../src/services/notifications/permissionState.js');
const { createFakeAdapter } = await import('../../src/services/notifications/adapters/fakeAdapter.js');
const { createNotifications } = await import('../../src/services/notifications/index.js');
const { createPendingIntent } = await import('../../src/services/notifications/pendingIntent.js');

const NOW = 1_000_000;
const push = (extra = {}) => ({
  type: 'trip_request', requestId: 'r1', targetUid: 'A', expiresAt: String(NOW + 60000), category: 'economico',
  distanceKm: '4.2', durationMin: '12', originLat: '6.2', originLng: '-75.5', destLat: '6.25', destLng: '-75.55',
  passengerName: 'Ana', ...extra,
});

// Pure helpers.
assert.equal(ps.canReceivePush(PERMISSION_STATE.GRANTED), true);
assert.equal(ps.canReceivePush(PERMISSION_STATE.DENIED), false);
assert.equal(ps.needsSystemSettings(PERMISSION_STATE.BLOCKED), true);
assert.equal(ps.canAskPermission(PERMISSION_STATE.DENIED), true);
assert.equal(ps.canAskPermission(PERMISSION_STATE.BLOCKED), false);
assert.equal(ps.isSupported(PERMISSION_STATE.UNSUPPORTED), false);

// Denied permission: the state is reported and registration still works only through explicit calls.
{
  const adapter = createFakeAdapter({ permission: PERMISSION_STATE.DENIED, requestResult: PERMISSION_STATE.BLOCKED });
  const n = createNotifications(adapter);
  assert.equal(await n.getPermissionState(), PERMISSION_STATE.DENIED);
  assert.equal(await n.requestPermission(), PERMISSION_STATE.BLOCKED);
  assert.equal(adapter.calls.requestPermission, 1);
}

// Token refresh reaches the subscriber and the unsubscribe works.
{
  const adapter = createFakeAdapter();
  const n = createNotifications(adapter);
  const seen = [];
  const off = n.onTokenRefresh((t) => seen.push(t));
  adapter.emitTokenRefresh('NEW_TOKEN_999999');
  off();
  adapter.emitTokenRefresh('NEWER');
  assert.deepEqual(seen, ['NEW_TOKEN_999999']);
}

// registerToken: success returns the token, a failing api returns null, logs are masked.
{
  const logs = [];
  const sent = [];
  const adapter = createFakeAdapter({ token: 'TOKEN_ABCDEFGHIJKLMNOP' });
  const ok = createNotifications(adapter, { api: { registerToken: async (t) => { sent.push(t); return { ok: true }; } }, isDev: true, log: (l) => logs.push(l) });
  assert.equal(await ok.registerToken(), 'TOKEN_ABCDEFGHIJKLMNOP');
  assert.deepEqual(sent, ['TOKEN_ABCDEFGHIJKLMNOP']);
  assert.ok(logs.length === 1 && !logs[0].includes('TOKEN_ABCDEFGHIJKLMNOP'));
  const bad = createNotifications(adapter, { api: { registerToken: async () => ({ ok: false, error: 'offline' }) } });
  assert.equal(await bad.registerToken(), null);
  const boom = createNotifications(adapter, { api: { registerToken: async () => { throw new Error('x'); } } });
  assert.equal(await boom.registerToken(), null);
  const prod = [];
  const quiet = createNotifications(adapter, { api: { registerToken: async () => ({ ok: true }) }, isDev: false, log: (l) => prod.push(l) });
  await quiet.registerToken();
  assert.equal(prod.length, 0);
}

// unregisterToken never throws and deletes the device token.
{
  const adapter = createFakeAdapter();
  const n = createNotifications(adapter, { api: { unregisterToken: async () => { throw new Error('net'); } } });
  await assert.doesNotReject(n.unregisterToken('T'));
  assert.equal(adapter.calls.deleteToken, 1);
}

// Foreground: valid request is parsed; garbage and expired are dropped.
{
  const adapter = createFakeAdapter();
  const n = createNotifications(adapter, { now: () => NOW });
  const got = [];
  const off = n.onForegroundMessage((request, uid) => got.push([request, uid]));
  adapter.emitForeground(push());
  adapter.emitForeground({ type: 'other' });
  adapter.emitForeground(null);
  adapter.emitForeground(push({ requestId: 'r2', expiresAt: String(NOW - 20000) }));
  assert.equal(got.length, 1);
  assert.equal(got[0][0].id, 'r1');
  assert.equal(got[0][1], 'A');
  off();
  adapter.emitForeground(push({ requestId: 'r3' }));
  assert.equal(got.length, 1);
}

// Opened + initial notification: parked as intents, callback fires, cancel stops everything.
{
  const adapter = createFakeAdapter({ initial: push({ requestId: 'cold' }) });
  const intents = createPendingIntent();
  const n = createNotifications(adapter, { intents });
  let fired = 0;
  const cancel = n.onNotificationOpened(() => { fired += 1; });
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(fired, 1);
  assert.equal(intents.peek().requestId, 'cold');
  adapter.emitOpened(push({ requestId: 'bg' }));
  assert.equal(fired, 2);
  assert.equal(intents.take('A').requestId, 'bg');
  adapter.emitOpened({ type: 'junk' });
  assert.equal(fired, 2);
  cancel();
  adapter.emitOpened(push({ requestId: 'late' }));
  assert.equal(fired, 2);
}

console.log('notificationPermissionState: OK');

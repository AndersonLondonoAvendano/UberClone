// AI-assisted: see AI_LOG.md #64
// Plain Node test for the notifications backend client (T-181, DP-70) with a fake fetch.
//   node scripts/tests/notificationsApi.test.mjs
import assert from 'node:assert/strict';
import './helpers/registerSrcLoader.mjs';

const { createNotificationsApi, NOTIFICATIONS_ERROR } = await import('../../src/services/notifications/notificationsApi.js');

const ID_TOKEN = 'ID_TOKEN_abc.def.ghi';
const PUSH_TOKEN = 'PUSH_TOKEN_0123456789';
const reply = (status, body = {}) => ({ status, ok: status >= 200 && status < 300, json: async () => body });
const make = (fetchFn, extra = {}) =>
  createNotificationsApi({ fetchFn, getToken: async () => ID_TOKEN, baseUrl: 'https://backend.example/', timeoutMs: 30, ...extra });

// register: URL, method, auth header, body without uid.
{
  const calls = [];
  const api = make(async (url, init) => { calls.push({ url, init }); return reply(200, { registered: true }); });
  assert.deepEqual(await api.registerToken(PUSH_TOKEN), { ok: true });
  assert.equal(calls[0].url, 'https://backend.example/notifications/register');
  assert.equal(calls[0].init.method, 'POST');
  assert.equal(calls[0].init.headers.Authorization, `Bearer ${ID_TOKEN}`);
  assert.deepEqual(JSON.parse(calls[0].init.body), { token: PUSH_TOKEN, platform: 'android' });
}

// unregister accepts 204.
{
  const calls = [];
  const api = make(async (url, init) => { calls.push({ url, init }); return reply(204); });
  assert.deepEqual(await api.unregisterToken(PUSH_TOKEN), { ok: true });
  assert.equal(calls[0].url, 'https://backend.example/notifications/unregister');
  assert.deepEqual(JSON.parse(calls[0].init.body), { token: PUSH_TOKEN });
}

// The client no longer exposes the test-request call (T-297, D-206); the backend endpoint stays.
assert.equal('requestTestNotification' in make(async () => reply(200)), false);

// Error classes.
const cases = [
  [404, NOTIFICATIONS_ERROR.NO_DEVICES],
  [429, NOTIFICATIONS_ERROR.RATE_LIMITED],
  [401, NOTIFICATIONS_ERROR.SESSION],
  [403, NOTIFICATIONS_ERROR.SESSION],
  [400, NOTIFICATIONS_ERROR.SERVER],
  [500, NOTIFICATIONS_ERROR.SERVER],
  [502, NOTIFICATIONS_ERROR.SERVER],
];
for (const [status, expected] of cases) {
  const api = make(async () => reply(status));
  assert.deepEqual(await api.registerToken(PUSH_TOKEN), { ok: false, error: expected }, String(status));
}
assert.equal(NOTIFICATIONS_ERROR.OFFLINE, 'offline');
assert.equal(NOTIFICATIONS_ERROR.RATE_LIMITED, 'rate-limited');
assert.equal(NOTIFICATIONS_ERROR.NO_DEVICES, 'no-devices');
assert.equal(NOTIFICATIONS_ERROR.SERVER, 'server');

// Offline: fetch rejects; timeout: aborted fetch; not configured; no session.
{
  const api = make(async () => { throw new TypeError('Network request failed to https://secret'); });
  assert.deepEqual(await api.registerToken(PUSH_TOKEN), { ok: false, error: NOTIFICATIONS_ERROR.OFFLINE });
  const slow = make((url, init) => new Promise((_, reject) => init.signal.addEventListener('abort', () => reject(Object.assign(new Error('x'), { name: 'AbortError' })))));
  assert.deepEqual(await slow.registerToken(PUSH_TOKEN), { ok: false, error: NOTIFICATIONS_ERROR.OFFLINE });
  const noUrl = make(async () => reply(200), { baseUrl: '' });
  assert.deepEqual(await noUrl.registerToken(PUSH_TOKEN), { ok: false, error: NOTIFICATIONS_ERROR.OFFLINE });
  let fetched = 0;
  const noSession = make(async () => { fetched += 1; return reply(200); }, { getToken: async () => null });
  assert.deepEqual(await noSession.registerToken(PUSH_TOKEN), { ok: false, error: NOTIFICATIONS_ERROR.SESSION });
  const throwing = make(async () => reply(200), { getToken: async () => { throw new Error('no auth'); } });
  assert.deepEqual(await throwing.registerToken(PUSH_TOKEN), { ok: false, error: NOTIFICATIONS_ERROR.SESSION });
  assert.equal(fetched, 0);
}

// Empty token is refused without calling fetch; results never carry tokens or URLs.
{
  let fetched = 0;
  const api = make(async () => { fetched += 1; return reply(200); });
  assert.equal((await api.registerToken('')).ok, false);
  assert.equal((await api.unregisterToken(null)).ok, false);
  assert.equal(fetched, 0);
  const failing = make(async () => reply(500));
  const text = JSON.stringify(await failing.registerToken(PUSH_TOKEN));
  assert.ok(!text.includes(PUSH_TOKEN) && !text.includes(ID_TOKEN) && !text.includes('backend.example'));
}

// reportAvailability (T-275): minimal body, own 5 s timeout, { active }, mapped errors, no console output.
{
  const { AVAILABILITY_TIMEOUT_MS } = await import('../../src/services/notifications/notificationsApi.js');
  const { MOCK_EMIT_MIN_MS } = await import('../../src/config/passengerApi.js');
  assert.equal(AVAILABILITY_TIMEOUT_MS, 5000);
  assert.ok(AVAILABILITY_TIMEOUT_MS < MOCK_EMIT_MIN_MS);

  const logged = [];
  const original = { log: console.log, warn: console.warn, error: console.error, info: console.info };
  for (const k of Object.keys(original)) console[k] = (...args) => logged.push(args.join(' '));
  try {
    const calls = [];
    const api = make(async (url, init) => { calls.push({ url, init }); return reply(200, { active: true }); });
    assert.deepEqual(await api.reportAvailability(true), { ok: true, active: true });
    assert.equal(calls[0].url, 'https://backend.example/notifications/availability');
    assert.equal(calls[0].init.method, 'POST');
    assert.equal(calls[0].init.headers.Authorization, `Bearer ${ID_TOKEN}`);
    assert.deepEqual(JSON.parse(calls[0].init.body), { available: true });
    const inactive = make(async () => reply(200, { active: false }));
    assert.deepEqual(await inactive.reportAvailability(false), { ok: true, active: false });
    const falseBodies = [];
    await make(async (u, init) => { falseBodies.push(JSON.parse(init.body)); return reply(200, { active: false }); }).reportAvailability(false);
    assert.deepEqual(falseBodies[0], { available: false });

    // Optional seq: sent only as a safe integer > 0; nothing else in the body.
    const seqBodies = [];
    const seqApi = make(async (u, init) => { seqBodies.push(JSON.parse(init.body)); return reply(200, { active: true }); });
    await seqApi.reportAvailability(true, 7);
    await seqApi.reportAvailability(false, 1_700_000_000_123);
    for (const bad of [undefined, null, 0, -1, 1.5, NaN, Infinity, '5', Number.MAX_SAFE_INTEGER + 2]) await seqApi.reportAvailability(true, bad);
    assert.deepEqual(seqBodies[0], { available: true, seq: 7 });
    assert.deepEqual(seqBodies[1], { available: false, seq: 1_700_000_000_123 });
    for (const body of seqBodies.slice(2)) assert.deepEqual(body, { available: true }, 'invalid seq is omitted');
    for (const body of seqBodies) assert.ok(Object.keys(body).every((key) => ['available', 'seq'].includes(key)));

    // Invalid argument: no network.
    let fetched = 0;
    const guard = make(async () => { fetched += 1; return reply(200, { active: true }); });
    for (const bad of [undefined, null, 'true', 1]) assert.equal((await guard.reportAvailability(bad)).ok, false);
    assert.equal(fetched, 0);

    // Malformed success body is a capturable failure.
    assert.deepEqual(await make(async () => reply(200, {})).reportAvailability(true), { ok: false, error: NOTIFICATIONS_ERROR.SERVER });
    const badJson = make(async () => ({ status: 200, ok: true, json: async () => { throw new Error('bad'); } }));
    assert.deepEqual(await badJson.reportAvailability(true), { ok: false, error: NOTIFICATIONS_ERROR.SERVER });

    // Errors mapped as in the other calls.
    for (const [status, expected] of cases) {
      assert.deepEqual(await make(async () => reply(status)).reportAvailability(true), { ok: false, error: expected }, String(status));
    }
    assert.deepEqual(await make(async () => { throw new TypeError('net'); }).reportAvailability(true), { ok: false, error: NOTIFICATIONS_ERROR.OFFLINE });
    assert.deepEqual(await make(async () => reply(200), { getToken: async () => null }).reportAvailability(true), { ok: false, error: NOTIFICATIONS_ERROR.SESSION });
    assert.deepEqual(await make(async () => reply(200), { baseUrl: '' }).reportAvailability(true), { ok: false, error: NOTIFICATIONS_ERROR.OFFLINE });

    // Own timeout: with a long default, the call still aborts at 5 s (timers faked so the test stays fast).
    const realSetTimeout = globalThis.setTimeout;
    const delays = [];
    globalThis.setTimeout = (fn, ms, ...rest) => { delays.push(ms); return realSetTimeout(fn, 1, ...rest); };
    try {
      const slow = make((u, init) => new Promise((_, reject) => init.signal.addEventListener('abort', () => reject(new Error('x')))), { timeoutMs: 15000 });
      assert.deepEqual(await slow.reportAvailability(true), { ok: false, error: NOTIFICATIONS_ERROR.OFFLINE });
    } finally {
      globalThis.setTimeout = realSetTimeout;
    }
    assert.deepEqual(delays, [AVAILABILITY_TIMEOUT_MS]);
  } finally {
    Object.assign(console, original);
  }
  assert.equal(logged.length, 0);
}

console.log('notificationsApi: OK');

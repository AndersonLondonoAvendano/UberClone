// AI-assisted: see docs/AI_LOG.md #70
// T-274: POST /notifications/availability against the real express app with fake db, messaging, clock and timers.
// No real waiting: timers are fired by hand and the clock is a plain object.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadAutoRequestConfig } from '../../backend/src/config.js';
import { createFakeDb, createFakeMessaging, createFakeTimers, startApp, tokenOf } from './helpers/notificationsFakes.mjs';

const APPROVED = { accountStatus: 'approved' };
const PATH = '/notifications/availability';

// Lets the async work started by a fired timer settle (fake db and messaging only resolve promises).
const flush = async () => {
  for (let i = 0; i < 10; i += 1) await new Promise((resolve) => setImmediate(resolve));
};

async function withApp(drivers, fn) {
  const db = createFakeDb(drivers);
  const messaging = createFakeMessaging();
  const timers = createFakeTimers();
  const clock = { value: 1_700_000_000_000 };
  const ctx = await startApp({ db, messaging, timers, clock });
  const register = (token, as = 'good-u1') => ctx.call('/notifications/register', { token: as, body: { token, platform: 'android' } });
  try {
    await fn({ ...ctx, db, messaging, timers, clock, register });
  } finally {
    await ctx.close();
  }
}

// A timer is live until it is cancelled or fired (the fake timers do not mark fired ones).
const fire = (timers, index) => {
  timers.fire(index);
  timers.timers[index].fired = true;
};
const live = (timers) => timers.timers.filter((timer) => !timer.cancelled && !timer.fired);
const available = (ctx, value = true, as = 'good-u1') => ctx.call(PATH, { token: as, body: { available: value } });

test('CA-007-07: 401 without token or with an invalid one', () =>
  withApp({ 'drivers/u1': APPROVED }, async (ctx) => {
    assert.equal((await ctx.call(PATH, { token: null, body: { available: true } })).status, 401);
    assert.equal((await ctx.call(PATH, { token: 'bad', body: { available: true } })).status, 401);
    assert.equal(ctx.timers.timers.length, 0);
  }));

test('CA-007-07: 429 after the per-user limit and after the per-IP limit', () =>
  withApp({ 'drivers/u1': APPROVED }, async (ctx) => {
    // Per user: 20 per minute; "available: false" is the cheapest valid call.
    let last;
    for (let i = 0; i < 21; i += 1) last = await available(ctx, false, 'good-u1');
    assert.equal(last.status, 429);
    // Per IP: 120 per minute spread over several users so the user limit is never the one that trips.
    const users = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    let ipLast;
    for (let i = 0; i < 125 && ipLast?.status !== 429; i += 1) ipLast = await available(ctx, false, `good-${users[i % users.length]}`);
    assert.equal(ipLast.status, 429);
  }));

test('CA-007-06: a non-approved account is rejected and nothing is sent', () =>
  withApp({ 'drivers/u1': { accountStatus: 'pending' } }, async (ctx) => {
    await ctx.register(tokenOf(1));
    const res = await available(ctx, true);
    assert.equal(res.status, 400);
    assert.deepEqual(res.json, { error: 'invalid_request' });
    // A driver document that does not exist is rejected the same way.
    await ctx.register(tokenOf(2), 'good-u2');
    assert.equal((await available(ctx, true, 'good-u2')).status, 400);
    assert.equal(live(ctx.timers).length, 0);
    await flush();
    assert.equal(ctx.messaging.calls.length, 0);
  }));

test('approved account without tokens gets 404 and no generator', () =>
  withApp({ 'drivers/u1': APPROVED }, async (ctx) => {
    const res = await available(ctx, true);
    assert.equal(res.status, 404);
    assert.equal(live(ctx.timers).length, 0);
  }));

test('CA-007-08: a non-boolean available is a validation error', () =>
  withApp({ 'drivers/u1': APPROVED }, async (ctx) => {
    await ctx.register(tokenOf(1));
    for (const value of ['true', 1, 0, null, {}, [], undefined]) {
      const res = await ctx.call(PATH, { body: value === undefined ? {} : { available: value } });
      assert.equal(res.status, 400);
      assert.deepEqual(res.json, { error: 'invalid_request' });
    }
    assert.equal((await ctx.call(PATH, { body: [] })).status, 400);
    assert.equal(ctx.timers.timers.length, 0);
  }));

test('CA-007-08 and CA-007-06: extra fields never change the target uid or the content; only the uid tokens receive', () =>
  withApp({ 'drivers/u1': APPROVED, 'drivers/u2': APPROVED }, async (ctx) => {
    await ctx.register(tokenOf(1));
    await ctx.register(tokenOf(2), 'good-u2');
    const res = await ctx.call(PATH, {
      body: { available: true, uid: 'u2', targetUid: 'u2', token: tokenOf(2), tokens: [tokenOf(2)], title: 'hack', data: { fare: 1 }, fare: 99 },
    });
    assert.equal(res.status, 200);
    assert.deepEqual(res.json, { active: true, applied: true });
    assert.equal(live(ctx.timers).length, 1);
    // First request in [8, 15] s with random = 0.5.
    assert.equal(ctx.timers.timers[0].ms, 11_500);
    fire(ctx.timers, 0);
    await flush();
    assert.equal(ctx.messaging.calls.length, 1);
    const message = ctx.messaging.calls[0];
    assert.deepEqual(message.tokens, [tokenOf(1)]);
    assert.equal(message.data.targetUid, 'u1');
    assert.doesNotMatch(JSON.stringify(message), /hack|fare|price|address|tarifa|email|phone/i);
    // The next one is scheduled in [35, 60] s.
    assert.equal(live(ctx.timers).length, 1);
    assert.equal(ctx.timers.timers[1].ms, 47_500);
  }));

test('CA-007-11: the generated payload has no fare and no addresses', () =>
  withApp({ 'drivers/u1': APPROVED }, async (ctx) => {
    await ctx.register(tokenOf(1));
    await available(ctx, true);
    fire(ctx.timers, 0);
    await flush();
    const { data, notification } = ctx.messaging.calls[0];
    assert.equal(data.type, 'trip_request');
    for (const key of Object.keys(data)) assert.doesNotMatch(key, /fare|price|tarifa|address|email|phone/i);
    assert.doesNotMatch(JSON.stringify(notification), /COP|fare|tarifa/i);
  }));

test('two "available" reports leave a single pending timer', () =>
  withApp({ 'drivers/u1': APPROVED }, async (ctx) => {
    await ctx.register(tokenOf(1));
    await available(ctx, true);
    const second = await available(ctx, true);
    assert.deepEqual(second.json, { active: true, applied: true });
    assert.equal(live(ctx.timers).length, 1);
  }));

test('CA-007-04: available false cancels the pending send and resumes when available again', () =>
  withApp({ 'drivers/u1': APPROVED }, async (ctx) => {
    await ctx.register(tokenOf(1));
    await available(ctx, true);
    const off = await available(ctx, false);
    assert.equal(off.status, 200);
    assert.deepEqual(off.json, { active: false, applied: true });
    assert.equal(live(ctx.timers).length, 0);
    fire(ctx.timers, 0);
    await flush();
    assert.equal(ctx.messaging.calls.length, 0);
    // False is accepted even for an account without tokens.
    assert.equal((await available(ctx, false, 'good-nobody')).status, 200);
    await available(ctx, true);
    assert.equal(live(ctx.timers).length, 1);
    fire(ctx.timers, 1);
    await flush();
    assert.equal(ctx.messaging.calls.length, 1);
  }));

test('CA-007-04: unregistering the last token stops the generator; another device keeps it (DT-9)', () =>
  withApp({ 'drivers/u1': APPROVED }, async (ctx) => {
    await ctx.register(tokenOf(1));
    await ctx.register(tokenOf(2));
    await available(ctx, true);
    await ctx.call('/notifications/unregister', { body: { token: tokenOf(1) } });
    assert.equal(live(ctx.timers).length, 1);
    await ctx.call('/notifications/unregister', { body: { token: tokenOf(2) } });
    assert.equal(live(ctx.timers).length, 0);
    fire(ctx.timers, 0);
    await flush();
    assert.equal(ctx.messaging.calls.length, 0);
  }));

test('CA-007-04: a token removed behind the generator stops it when the timer fires', () =>
  withApp({ 'drivers/u1': APPROVED }, async (ctx) => {
    await ctx.register(tokenOf(1));
    await available(ctx, true);
    for (const path of [...ctx.db.docs.keys()].filter((p) => p.startsWith('pushTokens/'))) ctx.db.docs.delete(path);
    fire(ctx.timers, 0);
    await flush();
    assert.equal(ctx.messaging.calls.length, 0);
    assert.equal(live(ctx.timers).length, 0);
  }));

test('CA-007-04 and CA-007-06: an account that stops being approved sends nothing (heartbeat still fresh)', () =>
  withApp({ 'drivers/u1': APPROVED }, async (ctx) => {
    await ctx.register(tokenOf(1));
    await available(ctx, true);
    ctx.db.docs.set('drivers/u1', { accountStatus: 'suspended' });
    // The clock is NOT advanced: only the approval check in isEligible can stop this send.
    fire(ctx.timers, 0);
    await flush();
    assert.equal(ctx.messaging.calls.length, 0);
    assert.equal(live(ctx.timers).length, 0);
  }));

test('CA-007-04: a stale heartbeat sends nothing even for an approved account', () =>
  withApp({ 'drivers/u1': APPROVED }, async (ctx) => {
    await ctx.register(tokenOf(1));
    await available(ctx, true);
    // 31 minutes without a heartbeat (default maximum is 30 min); the account stays approved.
    ctx.clock.value += 31 * 60_000;
    fire(ctx.timers, 0);
    await flush();
    assert.equal(ctx.messaging.calls.length, 0);
    assert.equal(live(ctx.timers).length, 0);
  }));

test('CA-007-09: close cancels every timer and later reports create none', () =>
  withApp({ 'drivers/u1': APPROVED, 'drivers/u2': APPROVED }, async (ctx) => {
    await ctx.register(tokenOf(1));
    await ctx.register(tokenOf(2), 'good-u2');
    await available(ctx, true, 'good-u1');
    await available(ctx, true, 'good-u2');
    await ctx.call('/notifications/test-request', { body: { delaySeconds: 30 } });
    assert.equal(live(ctx.timers).length, 3);
    ctx.app.closeNotifications();
    assert.equal(live(ctx.timers).length, 0);
    assert.deepEqual((await available(ctx, true)).json, { active: false, applied: true });
    assert.equal(live(ctx.timers).length, 0);
    for (let i = 0; i < ctx.timers.timers.length; i += 1) fire(ctx.timers, i);
    await flush();
    assert.equal(ctx.messaging.calls.length, 0);
  }));

test('D-198: an invalid seq is a 400 and changes nothing', () =>
  withApp({ 'drivers/u1': APPROVED }, async (ctx) => {
    await ctx.register(tokenOf(1));
    let calls = 0;
    for (const seq of ['1', 1.5, 0, -1, NaN, null, Number.MAX_SAFE_INTEGER + 2, {}, [], true]) {
      for (const value of [true, false]) {
        // A new caller per request keeps the real-time per-user rate limit out of the way.
        calls += 1;
        const res = await ctx.call(PATH, { token: `good-s${calls}`, body: { available: value, seq } });
        assert.equal(res.status, 400);
        assert.deepEqual(res.json, { error: 'invalid_request' });
      }
    }
    assert.equal(ctx.timers.timers.length, 0);
    // Absent seq keeps working as before.
    assert.deepEqual((await available(ctx, true)).json, { active: true, applied: true });
  }));

test('D-198: out of order over HTTP (true 5, false 6 arriving 6 then 5) ends unavailable; the 5 gets 200', () =>
  withApp({ 'drivers/u1': APPROVED }, async (ctx) => {
    await ctx.register(tokenOf(1));
    const send = (value, seq) => ctx.call(PATH, { body: { available: value, seq } });
    assert.deepEqual((await send(false, 6)).json, { active: false, applied: true });
    const late = await send(true, 5);
    assert.equal(late.status, 200);
    assert.deepEqual(late.json, { active: false, applied: false, lastSeq: 6 });
    assert.equal(live(ctx.timers).length, 0);
    // Repeated and lower seq are ignored too.
    assert.deepEqual((await send(true, 6)).json, { active: false, applied: false, lastSeq: 6 });
    assert.deepEqual((await send(true, 3)).json, { active: false, applied: false, lastSeq: 6 });
    assert.equal(live(ctx.timers).length, 0);
    await flush();
    assert.equal(ctx.messaging.calls.length, 0);
    // A newer seq is accepted.
    assert.deepEqual((await send(true, 7)).json, { active: true, applied: true });
    assert.equal(live(ctx.timers).length, 1);
  }));

test('D-199: applied:false carries only the last accepted seq; equal seq is ignored, greater is applied; false is never blocked by a fresh seq', () =>
  withApp({ 'drivers/u1': APPROVED }, async (ctx) => {
    await ctx.register(tokenOf(1));
    const send = (value, seq) => ctx.call(PATH, { body: { available: value, seq } });
    const first = await send(true, 1_800_000_000_000);
    assert.deepEqual(first.json, { active: true, applied: true });
    // A fresh install with a smaller seq (older clock) is ignored with 200, the answer lets it recover.
    const ignored = await send(true, 1_700_000_000_000);
    assert.equal(ignored.status, 200);
    assert.deepEqual(ignored.json, { active: true, applied: false, lastSeq: 1_800_000_000_000 });
    assert.deepEqual(Object.keys(ignored.json).sort(), ['active', 'applied', 'lastSeq']);
    assert.equal((await send(false, 1_800_000_000_000)).json.applied, false, 'equal seq is ignored');
    assert.equal(live(ctx.timers).length, 1, 'the ignored false changed nothing');
    // D-198 protection stays: only greater seqs apply.
    assert.deepEqual((await send(true, 1_800_000_000_001)).json, { active: true, applied: true });
    assert.deepEqual((await send(false, 1_800_000_000_002)).json, { active: false, applied: true });
    assert.equal((await send(true, 1_800_000_000_001)).json.lastSeq, 1_800_000_000_002);
    // Without seq the report is always applied.
    assert.deepEqual((await available(ctx, true)).json, { active: true, applied: true });
  }));

test('D-198: false right after true (same minute) stops the generator and the old timer sends nothing', () =>
  withApp({ 'drivers/u1': APPROVED }, async (ctx) => {
    await ctx.register(tokenOf(1));
    await ctx.call(PATH, { body: { available: true, seq: 1 } });
    ctx.clock.value += 5_000;
    assert.deepEqual((await ctx.call(PATH, { body: { available: false, seq: 2 } })).json, { active: false, applied: true });
    assert.equal(live(ctx.timers).length, 0);
    fire(ctx.timers, 0);
    await flush();
    assert.equal(ctx.messaging.calls.length, 0);
    assert.equal(live(ctx.timers).length, 0);
  }));

test('D-198: a stale seq for a non-approved account neither cancels nor sends', () =>
  withApp({ 'drivers/u1': APPROVED }, async (ctx) => {
    await ctx.register(tokenOf(1));
    await ctx.call(PATH, { body: { available: true, seq: 10 } });
    ctx.db.docs.set('drivers/u1', { accountStatus: 'pending' });
    const stale = await ctx.call(PATH, { body: { available: true, seq: 9 } });
    assert.equal(stale.status, 200); // not the 400 a fresh report would get
    assert.deepEqual(stale.json, { active: true, applied: false, lastSeq: 10 });
    assert.equal(live(ctx.timers).length, 1); // not cancelled
    // Same with no tokens left.
    ctx.db.docs.set('drivers/u1', APPROVED);
    for (const path of [...ctx.db.docs.keys()].filter((p) => p.startsWith('pushTokens/'))) ctx.db.docs.delete(path);
    const stale2 = await ctx.call(PATH, { body: { available: true, seq: 10 } });
    assert.equal(stale2.status, 200);
    assert.equal(live(ctx.timers).length, 1);
    // A fresh seq for the non-approved account is still rejected as before.
    ctx.db.docs.set('drivers/u1', { accountStatus: 'pending' });
    assert.equal((await ctx.call(PATH, { body: { available: true, seq: 11 } })).status, 400);
  }));

test('timers are unref-ed so they never keep the process alive', () =>
  withApp({ 'drivers/u1': APPROVED }, async (ctx) => {
    await ctx.register(tokenOf(1));
    await available(ctx, true);
    assert.equal(ctx.timers.timers[0].unrefCalled, true);
  }));

test('zero Firestore writes per report (reads only) and no logging of tokens, uids or bodies', () =>
  withApp({ 'drivers/u1': APPROVED }, async (ctx) => {
    await ctx.register(tokenOf(1));
    const snapshot = () => JSON.stringify([...ctx.db.docs]);
    const before = snapshot();
    const transactions = ctx.db.stats.transactions;
    await available(ctx, true);
    await available(ctx, true);
    await available(ctx, false);
    assert.equal(ctx.db.stats.transactions, transactions);
    assert.equal(snapshot(), before);
    for (const line of ctx.lines) assert.doesNotMatch(line, new RegExp(`${tokenOf(1)}|good-u1|"available"`));
  }));

test('a failing send does not break the generator: the next one is scheduled', async () => {
  const db = createFakeDb({ 'drivers/u1': APPROVED });
  const messaging = createFakeMessaging({ throws: true });
  const ctx = await startApp({ db, messaging });
  try {
    await ctx.call('/notifications/register', { body: { token: tokenOf(1), platform: 'android' } });
    await ctx.call(PATH, { body: { available: true } });
    fire(ctx.timers, 0);
    await flush();
    assert.equal(messaging.calls.length, 1);
    assert.equal(live(ctx.timers).length, 1);
  } finally {
    await ctx.close();
  }
});

test('config: defaults, valid overrides and fallback to defaults on invalid or unordered values', () => {
  const defaults = loadAutoRequestConfig({});
  assert.deepEqual(defaults, {
    firstMinMs: 8000, firstMaxMs: 15_000, nextMinMs: 35_000, nextMaxMs: 60_000, maxPerSession: 8, heartbeatMaxMs: 1_800_000,
  });
  const custom = loadAutoRequestConfig({
    AUTO_REQUEST_FIRST_MIN_S: '5', AUTO_REQUEST_FIRST_MAX_S: '6', AUTO_REQUEST_NEXT_MIN_S: '7', AUTO_REQUEST_NEXT_MAX_S: '8',
    AUTO_REQUEST_MAX_PER_SESSION: '3', AUTO_REQUEST_HEARTBEAT_MAX_MIN: '2',
  });
  assert.deepEqual(custom, { firstMinMs: 5000, firstMaxMs: 6000, nextMinMs: 7000, nextMaxMs: 8000, maxPerSession: 3, heartbeatMaxMs: 120_000 });
  const bad = loadAutoRequestConfig({
    AUTO_REQUEST_FIRST_MIN_S: '40', AUTO_REQUEST_FIRST_MAX_S: '10', AUTO_REQUEST_NEXT_MIN_S: 'abc', AUTO_REQUEST_NEXT_MAX_S: '-5',
    AUTO_REQUEST_MAX_PER_SESSION: '0', AUTO_REQUEST_HEARTBEAT_MAX_MIN: '1.5',
  });
  assert.deepEqual(bad, defaults);
});

// AI-assisted: see docs/AI_LOG.md #64
// T-174 and T-175: notification routes against the real express app with fake db, messaging, clock and timers.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { tokenId } from '../../backend/src/notifications/tokenStore.js';
import { createFakeDb, createFakeMessaging, createFakeTimers, startApp, tokenOf } from './helpers/notificationsFakes.mjs';

const APPROVED = { accountStatus: 'approved' };

async function setup({ drivers = { 'drivers/u1': APPROVED }, messagingOptions } = {}) {
  const db = createFakeDb(drivers);
  const messaging = createFakeMessaging(messagingOptions);
  const timers = createFakeTimers();
  const ctx = await startApp({ db, messaging, timers });
  return { ...ctx, db, messaging };
}

const register = (ctx, token, as = 'good-u1') => ctx.call('/notifications/register', { token: as, body: { token, platform: 'android' } });

async function withApp(options, fn) {
  const ctx = await setup(options);
  try {
    await fn(ctx);
  } finally {
    await ctx.close();
  }
}

test('401 without or with a bad token on every route', () =>
  withApp({}, async (ctx) => {
    for (const path of ['/notifications/register', '/notifications/unregister', '/notifications/test-request']) {
      assert.equal((await ctx.call(path, { token: null, body: {} })).status, 401);
      assert.equal((await ctx.call(path, { token: 'bad', body: {} })).status, 401);
    }
  }));

test('register: valid, 20 and 512 chars accepted', () =>
  withApp({}, async (ctx) => {
    for (const length of [20, 512]) {
      const res = await register(ctx, 'a'.repeat(length - 1) + String(length % 10));
      assert.equal(res.status, 200);
      assert.deepEqual(res.json, { registered: true });
    }
    assert.equal(ctx.db.docs.size - 1, 2);
  }));

test('register: invalid tokens and platforms give a generic 400', () =>
  withApp({}, async (ctx) => {
    const bad = ['a'.repeat(19), 'a'.repeat(513), `${'a'.repeat(20)} ${'b'.repeat(5)}`, 12345, '', null, ['x'], undefined];
    for (const token of bad) {
      const res = await ctx.call('/notifications/register', { body: { token, platform: 'android' } });
      assert.equal(res.status, 400);
      assert.deepEqual(res.json, { error: 'invalid_request' });
    }
    for (const platform of ['ios', 'Android', undefined, 1]) {
      assert.equal((await ctx.call('/notifications/register', { body: { token: tokenOf(1), platform } })).status, 400);
    }
    assert.equal((await ctx.call('/notifications/register', { raw: '{bad json' })).status, 400);
  }));

test('register ignores a uid in the body and is idempotent; reassignment goes through a transaction', () =>
  withApp({}, async (ctx) => {
    const body = { token: tokenOf(1), platform: 'android', uid: 'evil' };
    assert.equal((await ctx.call('/notifications/register', { body })).status, 200);
    assert.equal((await ctx.call('/notifications/register', { body })).status, 200);
    assert.equal(ctx.db.docs.get(`pushTokens/${tokenId(tokenOf(1))}`).uid, 'u1');
    const before = ctx.db.stats.transactions;
    assert.equal((await register(ctx, tokenOf(1), 'good-u2')).status, 200);
    assert.equal(ctx.db.stats.transactions, before + 1);
    assert.equal(ctx.db.docs.get(`pushTokens/${tokenId(tokenOf(1))}`).uid, 'u2');
  }));

test('unregister: own, foreign and missing answer 204 identically; foreign is not deleted', () =>
  withApp({}, async (ctx) => {
    await register(ctx, tokenOf(1));
    const foreign = await ctx.call('/notifications/unregister', { token: 'good-u2', body: { token: tokenOf(1) } });
    assert.equal(ctx.db.docs.size, 2, 'still stored');
    const missing = await ctx.call('/notifications/unregister', { body: { token: tokenOf(2) } });
    const own = await ctx.call('/notifications/unregister', { body: { token: tokenOf(1) } });
    const again = await ctx.call('/notifications/unregister', { body: { token: tokenOf(1) } });
    for (const res of [foreign, missing, own, again]) {
      assert.equal(res.status, 204);
      assert.equal(res.text, '');
    }
    assert.equal(ctx.db.docs.size, 1, 'only the driver doc remains');
    assert.equal((await ctx.call('/notifications/unregister', { body: { token: 'short' } })).status, 400);
  }));

test('test-request: sends immediately only to the tokens of the authenticated uid', () =>
  withApp({ drivers: { 'drivers/u1': APPROVED, 'drivers/u2': APPROVED } }, async (ctx) => {
    await register(ctx, tokenOf(1));
    await register(ctx, tokenOf(2));
    await register(ctx, tokenOf(3), 'good-u2');
    const res = await ctx.call('/notifications/test-request', {
      body: { uid: 'u2', tokens: [tokenOf(3)], title: 'hack', data: { type: 'x' }, notification: { body: 'x' }, token: tokenOf(3) },
    });
    assert.equal(res.status, 202);
    assert.deepEqual(res.json, { scheduled: true });
    assert.equal(ctx.messaging.calls.length, 1);
    const message = ctx.messaging.calls[0];
    assert.deepEqual([...message.tokens].sort(), [tokenOf(1), tokenOf(2)].sort());
    assert.equal(message.data.targetUid, 'u1');
    assert.equal(message.notification.title, 'Nueva solicitud de viaje');
    assert.equal(message.data.type, 'trip_request');
    assert.equal(message.data.requestId, 'req-fixed-id');
    assert.equal(message.data.expiresAt, String(ctx.clock.value + 90_000));
    assert.equal(message.android.ttl, 90_000);
    assert.doesNotMatch(JSON.stringify(message), /hack|evil/);
  }));

test('test-request: delaySeconds validation', () =>
  withApp({}, async (ctx) => {
    await register(ctx, tokenOf(1));
    // Rate limit is 5 per minute, so keep the valid and invalid checks inside one budget.
    for (const delaySeconds of [-1, 61, 1.5, '5', null]) {
      const res = await ctx.call('/notifications/test-request', { body: { delaySeconds } });
      assert.equal(res.status, 400, JSON.stringify(delaySeconds));
      assert.deepEqual(res.json, { error: 'invalid_request' });
    }
    assert.equal(ctx.messaging.calls.length, 0);
  }));

test('test-request: delay 0, absent and 60 are valid; delay 60 schedules a timer of 60 s', () =>
  withApp({}, async (ctx) => {
    await register(ctx, tokenOf(1));
    assert.equal((await ctx.call('/notifications/test-request', { body: { delaySeconds: 0 } })).status, 202);
    assert.equal((await ctx.call('/notifications/test-request', {})).status, 202);
    assert.equal(ctx.messaging.calls.length, 2);
    assert.equal((await ctx.call('/notifications/test-request', { body: { delaySeconds: 60 } })).status, 202);
    assert.equal(ctx.messaging.calls.length, 2, 'deferred, nothing sent yet');
    assert.equal(ctx.timers.timers[0].ms, 60_000);
    assert.equal(ctx.timers.timers[0].unrefCalled, true);
  }));

test('test-request: deferred send re-reads the tokens when it fires; one pending per uid', () =>
  withApp({}, async (ctx) => {
    await register(ctx, tokenOf(1));
    assert.equal((await ctx.call('/notifications/test-request', { body: { delaySeconds: 10 } })).status, 202);
    assert.equal(ctx.timers.timers[0].ms, 10_000);
    const second = await ctx.call('/notifications/test-request', { body: { delaySeconds: 5 } });
    assert.equal(second.status, 429);
    assert.deepEqual(second.json, { error: 'rate_limited' });
    // Token added after scheduling is picked up by the re-read.
    await register(ctx, tokenOf(2));
    ctx.timers.fire(0);
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(ctx.messaging.calls.length, 1);
    assert.deepEqual([...ctx.messaging.calls[0].tokens].sort(), [tokenOf(1), tokenOf(2)].sort());
    // After firing a new deferred send is allowed.
    assert.equal((await ctx.call('/notifications/test-request', { body: { delaySeconds: 5 } })).status, 202);
  }));

test('closing the app cancels pending deferred sends', async () => {
  const ctx = await setup();
  await register(ctx, tokenOf(1));
  await ctx.call('/notifications/test-request', { body: { delaySeconds: 10 } });
  await ctx.close();
  assert.equal(ctx.timers.timers[0].cancelled, true);
  ctx.timers.fire(0);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(ctx.messaging.calls.length, 0);
});

test('deferred send failure is swallowed (no unhandled rejection)', () =>
  withApp({ messagingOptions: { throws: true } }, async (ctx) => {
    await register(ctx, tokenOf(1));
    let unhandled = false;
    const listener = () => { unhandled = true; };
    process.on('unhandledRejection', listener);
    await ctx.call('/notifications/test-request', { body: { delaySeconds: 10 } });
    ctx.timers.fire(0);
    await new Promise((resolve) => setTimeout(resolve, 20));
    process.off('unhandledRejection', listener);
    assert.equal(unhandled, false);
    const immediate = await ctx.call('/notifications/test-request', { body: {} });
    assert.equal(immediate.status, 502, 'immediate failure is a generic upstream error');
    assert.deepEqual(immediate.json, { error: 'upstream_error' });
  }));

test('test-request: account not approved is rejected and nothing is sent', () =>
  withApp({ drivers: { 'drivers/u1': { accountStatus: 'pending' } } }, async (ctx) => {
    await register(ctx, tokenOf(1));
    const res = await ctx.call('/notifications/test-request', { body: {} });
    assert.equal(res.status, 400);
    assert.equal(ctx.messaging.calls.length, 0);
    const missing = await ctx.call('/notifications/test-request', { token: 'good-u3', body: {} });
    assert.equal(missing.status, 400);
  }));

test('test-request: no devices gives a generic not_found', () =>
  withApp({}, async (ctx) => {
    const res = await ctx.call('/notifications/test-request', { body: {} });
    assert.equal(res.status, 404);
    assert.deepEqual(res.json, { error: 'not_found' });
    assert.equal(ctx.messaging.calls.length, 0);
  }));

test('test-request: 501 tokens go out in two batches (500 + 1)', () =>
  withApp({}, async (ctx) => {
    for (let i = 0; i < 501; i += 1) {
      ctx.db.docs.set(`pushTokens/h${i}`, { uid: 'u1', token: tokenOf(i, 40), platform: 'android' });
    }
    assert.equal((await ctx.call('/notifications/test-request', { body: {} })).status, 202);
    assert.deepEqual(ctx.messaging.calls.map((call) => call.tokens.length), [500, 1]);
  }));

test('cleanup by error code, by index: only stale tokens are deleted', async () => {
  const failures = {
    [tokenOf(1)]: 'messaging/registration-token-not-registered',
    [tokenOf(2)]: 'messaging/invalid-registration-token',
    [tokenOf(3)]: 'messaging/internal-error',
    [tokenOf(4)]: 'messaging/quota-exceeded',
  };
  await withApp({ messagingOptions: { failures } }, async (ctx) => {
    for (const n of [1, 2, 3, 4, 5]) await register(ctx, tokenOf(n));
    assert.equal((await ctx.call('/notifications/test-request', { body: {} })).status, 202);
    const left = [...ctx.db.docs.values()].filter((doc) => doc.token).map((doc) => doc.token).sort();
    assert.deepEqual(left, [tokenOf(3), tokenOf(4), tokenOf(5)].sort());
  });
});

test('test-request: own rate limit answers 429 on the 6th call', () =>
  withApp({}, async (ctx) => {
    await register(ctx, tokenOf(1));
    for (let i = 0; i < 5; i += 1) assert.equal((await ctx.call('/notifications/test-request', { body: {} })).status, 202);
    const sixth = await ctx.call('/notifications/test-request', { body: {} });
    assert.equal(sixth.status, 429);
    assert.deepEqual(sixth.json, { error: 'rate_limited' });
    assert.equal(ctx.messaging.calls.length, 5);
  }));

test('no log line contains a token, a body, an email or a uid', () =>
  withApp({}, async (ctx) => {
    const token = tokenOf(7, 60);
    await register(ctx, token);
    await ctx.call('/notifications/test-request', { body: { delaySeconds: 0, email: 'me@example.test' } });
    await ctx.call('/notifications/unregister', { body: { token } });
    assert.ok(ctx.lines.length >= 3);
    for (const line of ctx.lines) {
      assert.match(line, /^\[req\] POST \/notifications\/(register|unregister|test-request) \d{3} provider=- \d+ms$/);
      assert.ok(!line.includes(token) && !line.includes('example.test') && !line.includes('u1'));
    }
  }));

test('static greps over backend/src', () => {
  const files = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (name.endsWith('.js')) files.push(full);
    }
  };
  walk(new URL('../../backend/src', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
  assert.ok(files.length > 10);
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    for (const word of ['collectionGroup', 'fcmTokens', 'fcmTokenOwners', 'calculateFare']) {
      assert.ok(!text.includes(word), `${word} found in ${file}`);
    }
  }
});

test('the test db never saw a collectionGroup call', () =>
  withApp({}, async (ctx) => {
    await register(ctx, tokenOf(1));
    await ctx.call('/notifications/test-request', { body: {} });
    assert.equal(ctx.db.stats.collectionGroupCalls, 0);
    assert.ok(ctx.db.stats.wheres.every(([name, field, op]) => name === 'pushTokens' && field === 'uid' && op === '=='));
  }));

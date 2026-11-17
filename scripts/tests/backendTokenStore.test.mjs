// AI-assisted: see AI_LOG.md #64
// T-173: pushTokens store with a transactional fake db.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import { createTokenStore, isValidPushToken, tokenId } from '../../backend/src/notifications/tokenStore.js';
import { createFakeDb, tokenOf } from './helpers/notificationsFakes.mjs';

function build() {
  const db = createFakeDb();
  const clock = { value: 1000 };
  return { db, clock, store: createTokenStore({ db, now: () => clock.value }) };
}

test('token validation bounds', () => {
  assert.equal(isValidPushToken('a'.repeat(19)), false);
  assert.equal(isValidPushToken('a'.repeat(20)), true);
  assert.equal(isValidPushToken('a'.repeat(512)), true);
  assert.equal(isValidPushToken('a'.repeat(513)), false);
  assert.equal(isValidPushToken(`${'a'.repeat(20)} b`), false);
  assert.equal(isValidPushToken(`${'a'.repeat(20)}\n`), false);
  assert.equal(isValidPushToken(''), false);
  for (const value of [null, undefined, 12345, {}, [], true]) assert.equal(isValidPushToken(value), false);
});

test('register stores pushTokens/{sha256} with the expected fields', async () => {
  const { db, store } = build();
  const token = tokenOf(1);
  await store.register('A', token, 'android');
  const expectedId = createHash('sha256').update(token).digest('hex');
  assert.equal(tokenId(token), expectedId);
  assert.deepEqual(db.docs.get(`pushTokens/${expectedId}`), { uid: 'A', token, platform: 'android', createdAt: 1000, updatedAt: 1000 });
  assert.equal(db.stats.transactions, 1);
});

test('register is idempotent and keeps createdAt', async () => {
  const { db, clock, store } = build();
  const token = tokenOf(1);
  await store.register('A', token, 'android');
  clock.value = 2000;
  await store.register('A', token, 'android');
  assert.equal(db.docs.size, 1);
  const doc = db.docs.get(`pushTokens/${tokenId(token)}`);
  assert.equal(doc.createdAt, 1000);
  assert.equal(doc.updatedAt, 2000);
});

test('reassignment A to B uses a transaction and A loses the token', async () => {
  const { db, store } = build();
  const token = tokenOf(1);
  await store.register('A', token, 'android');
  const before = db.stats.transactions;
  await store.register('B', token, 'android');
  assert.equal(db.stats.transactions, before + 1);
  assert.deepEqual(await store.listForUid('A'), []);
  assert.deepEqual(await store.listForUid('B'), [token]);
});

test('two devices of the same uid and listForUid by where', async () => {
  const { db, store } = build();
  await store.register('A', tokenOf(1), 'android');
  await store.register('A', tokenOf(2), 'android');
  await store.register('B', tokenOf(3), 'android');
  assert.deepEqual((await store.listForUid('A')).sort(), [tokenOf(1), tokenOf(2)].sort());
  assert.deepEqual(db.stats.wheres.at(-1), ['pushTokens', 'uid', '==']);
});

test('unregister: own deletes, foreign and missing do nothing and never throw', async () => {
  const { db, store } = build();
  await store.register('A', tokenOf(1), 'android');
  await store.unregister('B', tokenOf(1));
  assert.equal(db.docs.size, 1, 'foreign token kept');
  await store.unregister('A', tokenOf(2));
  assert.equal(db.docs.size, 1, 'missing token is a no-op');
  await store.unregister('A', tokenOf(1));
  assert.equal(db.docs.size, 0);
  await store.unregister('A', tokenOf(1));
  assert.ok(db.stats.transactions >= 5);
});

test('invalid input is rejected', async () => {
  const { store } = build();
  await assert.rejects(() => store.register('A', 'short', 'android'));
  await assert.rejects(() => store.register('A', tokenOf(1), 'ios'));
  await assert.rejects(() => store.unregister('A', ''));
  await store.register('A', 'a'.repeat(512), 'android');
});

test('removeTokens deletes by hash id', async () => {
  const { db, store } = build();
  await store.register('A', tokenOf(1), 'android');
  await store.register('A', tokenOf(2), 'android');
  await store.removeTokens([tokenOf(1)]);
  assert.deepEqual(await store.listForUid('A'), [tokenOf(2)]);
  assert.equal(db.docs.size, 1);
});

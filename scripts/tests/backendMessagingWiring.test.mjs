// AI-assisted: see AI_LOG.md #64
// T-171: messaging wiring (admin.js, server.js, createApp) and the FCM constants.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import * as config from '../../backend/src/config.js';
import { createFakeDb, createFakeMessaging, startApp } from './helpers/notificationsFakes.mjs';

const src = (file) => readFileSync(new URL(`../../backend/src/${file}`, import.meta.url), 'utf8');

test('constants', () => {
  assert.deepEqual(config.TEST_REQUEST_RATE_LIMIT, { max: 5, windowMs: 60000 });
  assert.equal(config.FCM_TTL_MS, 90000);
  assert.equal(config.FCM_TTL, '90s');
  assert.equal(config.FCM_CHANNEL_ID, 'solicitudes');
  assert.equal(config.TEST_REQUEST_MAX_DELAY_S, 60);
  assert.equal(config.PUSH_TOKEN_MIN_LENGTH, 20);
  assert.equal(config.PUSH_TOKEN_MAX_LENGTH, 512);
});

test('BODY_LIMIT holds a 512-character token body', () => {
  const limitBytes = Number.parseInt(config.BODY_LIMIT, 10) * 1024;
  const body = JSON.stringify({ token: 'a'.repeat(config.PUSH_TOKEN_MAX_LENGTH), platform: 'android' });
  assert.ok(Buffer.byteLength(body) < limitBytes / 2, 'plenty of room');
});

test('admin.js returns messaging and server.js passes it to createApp', () => {
  assert.match(src('admin.js'), /firebase-admin\/messaging/);
  assert.match(src('admin.js'), /messaging: getMessaging\(app\)/);
  assert.match(src('server.js'), /const \{ adminAuth, db, messaging \} = await initAdmin\(config\)/);
  assert.match(src('server.js'), /closeNotifications\(\)/);
  assert.match(src('app.js'), /messaging = null/);
});

test('without messaging /health answers and send routes give a generic error', async () => {
  const ctx = await startApp({ db: createFakeDb(), messaging: null });
  try {
    const health = await ctx.call('/health', { method: 'GET', token: null });
    assert.equal(health.status, 200);
    const sent = await ctx.call('/notifications/test-request', { body: {} });
    assert.equal(sent.status, 500);
    assert.deepEqual(sent.json, { error: 'server_error' });
  } finally {
    await ctx.close();
  }
});

test('without db and messaging at all the app still starts', async () => {
  const ctx = await startApp({ withNotificationsDeps: false });
  try {
    assert.equal((await ctx.call('/health', { method: 'GET', token: null })).status, 200);
    assert.equal((await ctx.call('/notifications/register', { body: { token: 'a'.repeat(30), platform: 'android' } })).status, 500);
  } finally {
    await ctx.close();
  }
});

test('the real app accepts a 512-character token body (2kb limit is enough)', async () => {
  const ctx = await startApp({ db: createFakeDb(), messaging: createFakeMessaging() });
  try {
    const res = await ctx.call('/notifications/register', { body: { token: 'a'.repeat(512), platform: 'android' } });
    assert.equal(res.status, 200);
  } finally {
    await ctx.close();
  }
});

test('with messaging injected the routes use it', async () => {
  const messaging = createFakeMessaging();
  const ctx = await startApp({ db: createFakeDb({ 'drivers/u1': { accountStatus: 'approved' } }), messaging });
  try {
    await ctx.call('/notifications/register', { body: { token: 'a'.repeat(30), platform: 'android' } });
    const sent = await ctx.call('/notifications/test-request', { body: {} });
    assert.equal(sent.status, 202);
    assert.equal(messaging.calls.length, 1);
  } finally {
    await ctx.close();
  }
});

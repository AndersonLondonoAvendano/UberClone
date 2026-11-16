// AI-assisted: see docs/AI_LOG.md #64
// Tests for the RN Firebase adapter factory with fake dependencies (no React Native, no SDK).
// Contract: SDK errors are propagated (the promise rejects / the call throws).
// Run: node --test scripts/tests/notificationAdapter.test.mjs
import assert from 'node:assert/strict';
import { test } from 'node:test';
import './helpers/registerSrcLoader.mjs';

const { createRnFirebaseAdapter } = await import('../../src/services/notifications/adapters/rnFirebaseAdapter.js');
const { createNotifications } = await import('../../src/services/notifications/index.js');
const { PERMISSION_STATE, POST_NOTIFICATIONS_PERMISSION } = await import('../../src/services/notifications/constants.js');

const RESULTS = { GRANTED: 'granted', DENIED: 'denied', NEVER_ASK_AGAIN: 'never_ask_again' };

function build({ platform = 'android', osVersion = 34, requestResult = RESULTS.GRANTED, checkResult = true, messaging = {} } = {}) {
  const calls = { check: [], request: [], getToken: 0, deleteToken: 0, refreshCallbacks: [], unsubscribed: 0 };
  const adapter = createRnFirebaseAdapter({
    platform,
    osVersion,
    permissions: {
      RESULTS,
      check: async (permission) => { calls.check.push(permission); return checkResult; },
      request: async (permission) => { calls.request.push(permission); return requestResult; },
    },
    messaging: {
      getToken: async () => { calls.getToken += 1; return 'fake-token-0123456789'; },
      deleteToken: async () => { calls.deleteToken += 1; },
      onTokenRefresh: (callback) => {
        calls.refreshCallbacks.push(callback);
        return () => { calls.unsubscribed += 1; };
      },
      ...messaging,
    },
  });
  return { adapter, calls };
}

test('API 33+: granted, denied and never-ask-again are mapped', async () => {
  for (const [result, expected] of [
    [RESULTS.GRANTED, PERMISSION_STATE.GRANTED],
    [RESULTS.DENIED, PERMISSION_STATE.DENIED],
    [RESULTS.NEVER_ASK_AGAIN, PERMISSION_STATE.BLOCKED],
  ]) {
    const { adapter, calls } = build({ osVersion: 33, requestResult: result });
    assert.equal(await adapter.requestPermission(), expected);
    assert.deepEqual(calls.request, [POST_NOTIFICATIONS_PERMISSION]);
  }
});

test('API 33+: getPermissionState checks without asking', async () => {
  const granted = build({ checkResult: true });
  assert.equal(await granted.adapter.getPermissionState(), PERMISSION_STATE.GRANTED);
  assert.deepEqual(granted.calls.check, [POST_NOTIFICATIONS_PERMISSION]);
  assert.equal(granted.calls.request.length, 0);
  const denied = build({ checkResult: false });
  assert.equal(await denied.adapter.getPermissionState(), PERMISSION_STATE.DENIED);
});

test('API < 33: granted without asking or checking', async () => {
  const { adapter, calls } = build({ osVersion: 32 });
  assert.equal(await adapter.requestPermission(), PERMISSION_STATE.GRANTED);
  assert.equal(await adapter.getPermissionState(), PERMISSION_STATE.GRANTED);
  assert.equal(calls.request.length, 0);
  assert.equal(calls.check.length, 0);
});

test('iOS is out of scope: unsupported and never asks', async () => {
  const { adapter, calls } = build({ platform: 'ios', osVersion: '17.0' });
  assert.equal(await adapter.requestPermission(), PERMISSION_STATE.UNSUPPORTED);
  assert.equal(await adapter.getPermissionState(), PERMISSION_STATE.UNSUPPORTED);
  assert.equal(calls.request.length, 0);
});

test('getToken returns the fake token; deleteToken delegates', async () => {
  const { adapter, calls } = build();
  assert.equal(await adapter.getToken(), 'fake-token-0123456789');
  await adapter.deleteToken();
  assert.equal(calls.getToken, 1);
  assert.equal(calls.deleteToken, 1);
});

test('onTokenRefresh registers the callback and returns the unsubscribe function', () => {
  const { adapter, calls } = build();
  const callback = () => {};
  const unsubscribe = adapter.onTokenRefresh(callback);
  assert.deepEqual(calls.refreshCallbacks, [callback]);
  unsubscribe();
  assert.equal(calls.unsubscribed, 1);
});

test('SDK errors are propagated', async () => {
  const failure = Object.assign(new Error('boom'), { code: 'messaging/unknown' });
  const { adapter } = build({ messaging: { getToken: async () => { throw failure; } } });
  await assert.rejects(adapter.getToken(), (error) => error === failure);
  const denied = build({ osVersion: 34 });
  denied.adapter = createRnFirebaseAdapter({
    platform: 'android',
    osVersion: 34,
    permissions: { RESULTS, check: async () => true, request: async () => { throw failure; } },
    messaging: {},
  });
  await assert.rejects(denied.adapter.requestPermission(), (error) => error === failure);
});

test('createNotifications delegates every call to the adapter', async () => {
  const { adapter } = build();
  const notifications = createNotifications(adapter);
  assert.equal(await notifications.getToken(), 'fake-token-0123456789');
  assert.equal(await notifications.requestPermission(), PERMISSION_STATE.GRANTED);
});

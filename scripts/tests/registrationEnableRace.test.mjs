// AI-assisted: see AI_LOG.md #64
// enable() must not write the preference when the session is closed while the permission dialog is open.
//   node scripts/tests/registrationEnableRace.test.mjs
import assert from 'node:assert/strict';
import { test } from 'node:test';
import './helpers/registerSrcLoader.mjs';

const { createRegistrationController, ENABLE_RESULT } = await import('../../src/services/notifications/registration.js');
const { PERMISSION_STATE } = await import('../../src/services/notifications/constants.js');

test('enable() during signOutCleanup does not re-set the preference', async () => {
  let pref = false;
  let resolveRequest;
  const notifications = {
    getPermissionState: async () => PERMISSION_STATE.DENIED,
    requestPermission: () => new Promise((resolve) => (resolveRequest = resolve)),
    getToken: async () => 'tok',
    onTokenRefresh: () => () => {},
    deleteToken: async () => {},
  };
  const api = { registerToken: async () => ({ ok: true }), unregisterToken: async () => ({ ok: true }) };
  const preference = {
    get: async () => pref,
    set: async (v) => ((pref = v), true),
    clear: async () => ((pref = false), true),
  };
  const controller = createRegistrationController({ notifications, api, preference });
  const pending = controller.enable();
  await new Promise((r) => setImmediate(r));
  await controller.signOutCleanup();
  resolveRequest(PERMISSION_STATE.GRANTED);
  const out = await pending;
  assert.equal(pref, false);
  assert.equal(out.ok, false);
  assert.equal(out.result, ENABLE_RESULT.CANCELLED);
  assert.equal(controller.getState().enabled, false);
});

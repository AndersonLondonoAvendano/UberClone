// AI-assisted: see AI_LOG.md #64
// Plain Node test for the push-token registration controller (T-184, T-185, D-131, D-134). Plain fakes.
//   node scripts/tests/notificationRegistration.test.mjs
import assert from 'node:assert/strict';
import './helpers/registerSrcLoader.mjs';

const { createRegistrationController, ENABLE_RESULT, REGISTRATION_STATUS } = await import(
  '../../src/services/notifications/registration.js'
);
const { PERMISSION_STATE } = await import('../../src/services/notifications/constants.js');

const make = ({ enabled = false, permission = PERMISSION_STATE.GRANTED, token = 'tok-1', requestResult } = {}) => {
  const log = [];
  let pref = enabled;
  let perm = permission;
  let refresh = null;
  const notifications = {
    getPermissionState: async () => perm,
    requestPermission: async () => {
      log.push('requestPermission');
      perm = requestResult ?? PERMISSION_STATE.GRANTED;
      return perm;
    },
    getToken: async () => token,
    onTokenRefresh: (cb) => {
      refresh = cb;
      return () => {
        refresh = null;
      };
    },
    deleteToken: async () => void log.push('deleteToken'),
  };
  const api = {
    registerToken: async (t) => (log.push(`register:${t}`), { ok: true }),
    unregisterToken: async (t) => (log.push(`unregister:${t}`), { ok: true }),
  };
  const preference = {
    get: async () => pref,
    set: async (v) => ((pref = v), log.push(`pref:${v}`), true),
    clear: async () => ((pref = false), log.push('pref:clear'), true),
  };
  const intents = { reset: () => log.push('intents.reset') };
  const controller = createRegistrationController({ notifications, api, preference, intents });
  return { controller, log, emitRefresh: (t) => refresh && refresh(t), isPref: () => pref, hasRefresh: () => refresh !== null };
};

// Preference on + permission granted: registers and listens for refreshes.
{
  const { controller, log, emitRefresh } = make({ enabled: true });
  await controller.start('uid-A');
  assert.deepEqual(log, ['register:tok-1']);
  assert.equal(controller.getState().status, REGISTRATION_STATUS.REGISTERED);
  emitRefresh('tok-2');
  await new Promise((r) => setImmediate(r));
  assert.deepEqual(log, ['register:tok-1', 'register:tok-2']);
}

// Preference off, or permission not granted: nothing is registered.
{
  const off = make({ enabled: false });
  await off.controller.start('uid-A');
  assert.deepEqual(off.log, []);
  const denied = make({ enabled: true, permission: PERMISSION_STATE.DENIED });
  await denied.controller.start('uid-A');
  assert.deepEqual(denied.log, []);
}

// Same uid twice is idempotent; another uid on the same phone registers again (D-131).
{
  const { controller, log } = make({ enabled: true });
  await controller.start('uid-A');
  await controller.start('uid-A');
  assert.equal(log.filter((l) => l.startsWith('register')).length, 1);
  await controller.start('uid-B');
  assert.equal(log.filter((l) => l.startsWith('register')).length, 2);
}

// stop() detaches the refresh listener.
{
  const { controller, hasRefresh } = make({ enabled: true });
  await controller.start('uid-A');
  assert.equal(hasRefresh(), true);
  controller.stop();
  assert.equal(hasRefresh(), false);
}

// enable(): asks for permission, saves the preference, registers. Denied or blocked changes nothing.
{
  const ok = make({ permission: PERMISSION_STATE.DENIED });
  await ok.controller.start('uid-A');
  assert.deepEqual(await ok.controller.enable(), { ok: true, result: ENABLE_RESULT.OK });
  assert.equal(ok.isPref(), true);
  assert.deepEqual(ok.log, ['requestPermission', 'pref:true', 'register:tok-1']);

  const denied = make({ permission: PERMISSION_STATE.DENIED, requestResult: PERMISSION_STATE.DENIED });
  assert.equal((await denied.controller.enable()).result, ENABLE_RESULT.DENIED);
  assert.equal(denied.isPref(), false);

  const blocked = make({ permission: PERMISSION_STATE.BLOCKED });
  assert.equal((await blocked.controller.enable()).result, ENABLE_RESULT.BLOCKED);
  assert.equal(blocked.log.includes('requestPermission'), false);

  const unsupported = make({ permission: PERMISSION_STATE.UNSUPPORTED });
  assert.equal((await unsupported.controller.enable()).result, ENABLE_RESULT.UNSUPPORTED);
}

// disable(): preference off, backend and local token removed.
{
  const { controller, log, isPref } = make({ enabled: true });
  await controller.start('uid-A');
  log.length = 0;
  await controller.disable();
  assert.equal(isPref(), false);
  assert.ok(log.includes('unregister:tok-1') && log.includes('deleteToken'));
}

// signOutCleanup(): preference + intent first, then backend and local token; restore brings it back.
{
  const { controller, log, isPref } = make({ enabled: true });
  await controller.start('uid-A');
  log.length = 0;
  await controller.signOutCleanup();
  assert.equal(isPref(), false);
  assert.ok(log.indexOf('pref:clear') < log.indexOf('unregister:tok-1'));
  assert.ok(log.includes('intents.reset') && log.includes('deleteToken'));
  log.length = 0;
  await controller.restoreAfterFailedSignOut();
  assert.equal(isPref(), true);
  assert.ok(log.includes('register:tok-1'));
}

// signOutCleanup() when notifications were never enabled: no backend call.
{
  const { controller, log } = make({ enabled: false });
  await controller.start('uid-A');
  await controller.signOutCleanup();
  assert.equal(log.some((l) => l.startsWith('unregister') || l === 'deleteToken'), false);
  assert.ok(log.includes('intents.reset'));
}

// Failing collaborators never throw out of the controller.
{
  const controller = createRegistrationController({
    notifications: {
      getPermissionState: async () => { throw new Error('x'); },
      requestPermission: async () => { throw new Error('x'); },
      getToken: async () => { throw new Error('x'); },
      onTokenRefresh: () => { throw new Error('x'); },
      deleteToken: async () => { throw new Error('x'); },
    },
    api: { registerToken: async () => { throw new Error('x'); }, unregisterToken: async () => { throw new Error('x'); } },
    preference: { get: async () => true, set: async () => true, clear: async () => true },
  });
  await controller.start('uid-A');
  await controller.disable();
  await controller.signOutCleanup();
  await controller.restoreAfterFailedSignOut();
}

console.log('notificationRegistration tests passed');

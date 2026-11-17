// AI-assisted: see AI_LOG.md #64
// Push-token registration controller (T-184, T-186, RF-72, RF-73, D-131, D-134). Pure: the preference,
// the notifications service and the backend client are injected, so it has no React, Firebase or
// network imports. It never throws and never logs a token.
//
// Lifecycle: start(uid) once there is a session and an approved account; it registers the device token
// when the preference is on and the permission is granted, and registers again on every token refresh.
// The same phone used by account B registers for B (the backend moves the token, D-131). stop() only
// detaches listeners (the provider unmounted). enable()/disable() are the user's switch.
// signOutCleanup() is the resetSession step (D-134): preference, local token and backend unregistration
// go together, and restoreAfterFailedSignOut() undoes it when signOut fails (best effort).
import { PERMISSION_STATE } from './constants';

export const REGISTRATION_STATUS = {
  IDLE: 'idle',
  REGISTERED: 'registered',
  FAILED: 'failed',
};

export const ENABLE_RESULT = {
  OK: 'ok',
  DENIED: 'denied', // the system dialog was refused; it can be asked again
  BLOCKED: 'blocked', // only the system settings can grant it
  UNSUPPORTED: 'unsupported',
  STORAGE: 'storage', // the preference could not be saved
  CANCELLED: 'cancelled', // the session changed while the permission dialog was open
};

const attempt = async (fn, fallback = null) => {
  try {
    return await fn();
  } catch {
    return fallback;
  }
};

// deps.notifications: { getPermissionState, requestPermission, getToken, onTokenRefresh, deleteToken }
// deps.api: { registerToken(token) -> { ok }, unregisterToken(token) -> { ok } }
// deps.preference: { get, set, clear }; deps.intents: { reset } (optional).
export function createRegistrationController({ notifications, api, preference, intents = null }) {
  let state = { enabled: false, permission: null, status: REGISTRATION_STATUS.IDLE };
  const listeners = new Set();
  let uid = null; // current session (null before start / after stop)
  let started = false;
  let suspended = false; // between signOutCleanup and a failed-signOut restore (or the next start)
  let generation = 0; // bumped on every start/stop/cleanup: a stale async result is dropped
  let unsubscribeRefresh = null;
  let cachedToken = null;
  let snapshot = null; // { wasEnabled, uid } kept by signOutCleanup for the restore

  const setState = (patch) => {
    state = { ...state, ...patch };
    listeners.forEach((listener) => listener(state));
  };

  const detachRefresh = () => {
    if (typeof unsubscribeRefresh === 'function') attempt(async () => unsubscribeRefresh());
    unsubscribeRefresh = null;
  };

  async function registerToken(token, g) {
    if (!token) return false;
    const result = await attempt(() => api.registerToken(token), { ok: false });
    if (g !== generation) return false;
    const ok = Boolean(result && result.ok);
    setState({ status: ok ? REGISTRATION_STATUS.REGISTERED : REGISTRATION_STATUS.FAILED });
    return ok;
  }

  // Obtains the device token and registers it; also listens for refreshes while this generation lives.
  async function registerNow(g) {
    if (unsubscribeRefresh === null) {
      const unsubscribe = await attempt(async () =>
        notifications.onTokenRefresh((token) => {
          if (g !== generation || suspended || !state.enabled || !token) return;
          cachedToken = token;
          registerToken(token, g);
        }),
      );
      if (g !== generation) {
        if (typeof unsubscribe === 'function') attempt(async () => unsubscribe());
        return false;
      }
      unsubscribeRefresh = typeof unsubscribe === 'function' ? unsubscribe : () => {};
    }
    const token = await attempt(() => notifications.getToken());
    if (g !== generation) return false;
    if (!token) {
      setState({ status: REGISTRATION_STATUS.FAILED });
      return false;
    }
    cachedToken = token;
    return registerToken(token, g);
  }

  async function start(nextUid) {
    if (!nextUid) {
      stop();
      return;
    }
    if (started && uid === nextUid && !suspended) return;
    detachRefresh();
    generation += 1;
    const g = generation;
    uid = nextUid;
    started = true;
    suspended = false;
    cachedToken = null;
    setState({ status: REGISTRATION_STATUS.IDLE });

    const enabled = await preference.get();
    if (g !== generation) return;
    setState({ enabled });
    const permission = await attempt(() => notifications.getPermissionState());
    if (g !== generation) return;
    setState({ permission });
    if (!enabled || permission !== PERMISSION_STATE.GRANTED) return;
    await registerNow(g);
  }

  // Detaches listeners; keeps the preference, the token and the last uid (a restore may need them).
  function stop() {
    generation += 1;
    detachRefresh();
    started = false;
  }

  // The user turns notifications on. The in-context explanation is the caller's job; this asks for the
  // permission when needed and registers. Never changes the preference unless the permission is granted.
  async function enable() {
    const g = generation;
    let permission = await attempt(() => notifications.getPermissionState(), PERMISSION_STATE.DENIED);
    if (permission === PERMISSION_STATE.UNSUPPORTED) return { ok: false, result: ENABLE_RESULT.UNSUPPORTED };
    if (permission !== PERMISSION_STATE.GRANTED) {
      if (permission !== PERMISSION_STATE.BLOCKED) {
        permission = await attempt(() => notifications.requestPermission(), PERMISSION_STATE.DENIED);
      }
      if (permission !== PERMISSION_STATE.GRANTED) {
        setState({ permission, enabled: false });
        const result = permission === PERMISSION_STATE.BLOCKED ? ENABLE_RESULT.BLOCKED : ENABLE_RESULT.DENIED;
        return { ok: false, result };
      }
    }
    // The session may have been closed while the system dialog was open: do not write the preference then.
    if (g !== generation || suspended) return { ok: false, result: ENABLE_RESULT.CANCELLED };
    const saved = await preference.set(true);
    if (!saved) return { ok: false, result: ENABLE_RESULT.STORAGE };
    setState({ enabled: true, permission: PERMISSION_STATE.GRANTED });
    if (started && uid && !suspended) await registerNow(generation);
    return { ok: true, result: ENABLE_RESULT.OK };
  }

  // The user turns notifications off: unregister in the backend and delete the local token.
  async function disable() {
    await preference.set(false);
    setState({ enabled: false, status: REGISTRATION_STATUS.IDLE });
    detachRefresh();
    const token = cachedToken ?? (await attempt(() => notifications.getToken()));
    cachedToken = null;
    await Promise.allSettled([
      attempt(async () => (token ? api.unregisterToken(token) : null)),
      attempt(() => notifications.deleteToken()),
    ]);
    return { ok: true };
  }

  // resetSession step (D-134): runs after the trip-save wait and right before signOut, bounded by the
  // caller. The preference and the pending intent go first (fast, local) so a slow network cannot keep
  // them; then the backend unregistration and the local token deletion run together.
  async function signOutCleanup() {
    const wasEnabled = state.enabled || (await preference.get());
    snapshot = { wasEnabled, uid };
    suspended = true;
    generation += 1;
    detachRefresh();
    if (intents) await attempt(async () => intents.reset());
    await preference.clear();
    setState({ enabled: false, status: REGISTRATION_STATUS.IDLE });
    if (!wasEnabled && !cachedToken) return;
    const token = cachedToken ?? (await attempt(() => notifications.getToken()));
    cachedToken = null;
    await Promise.allSettled([
      attempt(async () => (token ? api.unregisterToken(token) : null)),
      attempt(() => notifications.deleteToken()),
    ]);
  }

  // signOut failed and the session continues: bring the preference and the registration back.
  async function restoreAfterFailedSignOut() {
    const saved = snapshot;
    snapshot = null;
    suspended = false;
    if (!saved || !saved.wasEnabled) return;
    await preference.set(true);
    setState({ enabled: true });
    if (saved.uid) {
      started = false;
      await start(saved.uid);
    }
  }

  return {
    start,
    stop,
    enable,
    disable,
    signOutCleanup,
    restoreAfterFailedSignOut,
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    // Fresh permission state for the settings screen.
    async refreshPermission() {
      const permission = await attempt(() => notifications.getPermissionState());
      setState({ permission });
      return permission;
    },
  };
}

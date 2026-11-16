// AI-assisted: see docs/AI_LOG.md #64
// Programmable in-memory adapter for scripts. Same contract as rnFirebaseAdapter; never touches the SDK.
// The emit* helpers simulate incoming events.
import { PERMISSION_STATE } from '../constants';

export function createFakeAdapter({ permission = PERMISSION_STATE.GRANTED, requestResult, token = 'FAKE_TOKEN_0123456789', initial = null } = {}) {
  let state = permission;
  let currentToken = token;
  let initialData = initial;
  const foreground = new Set();
  const opened = new Set();
  const refresh = new Set();
  const calls = { getToken: 0, deleteToken: 0, requestPermission: 0 };

  const subscribe = (set, cb) => {
    set.add(cb);
    return () => set.delete(cb);
  };

  return {
    calls,
    async getPermissionState() { return state; },
    async requestPermission() {
      calls.requestPermission += 1;
      if (requestResult) state = requestResult;
      return state;
    },
    async getToken() { calls.getToken += 1; return currentToken; },
    async deleteToken() { calls.deleteToken += 1; currentToken = null; },
    onTokenRefresh: (cb) => subscribe(refresh, cb),
    onForegroundMessage: (cb) => subscribe(foreground, cb),
    onNotificationOpened: (cb) => subscribe(opened, cb),
    async getInitialNotification() { const d = initialData; initialData = null; return d; },
    emitForeground: (data) => foreground.forEach((cb) => cb(data)),
    emitOpened: (data) => opened.forEach((cb) => cb(data)),
    emitTokenRefresh: (t) => { currentToken = t; refresh.forEach((cb) => cb(t)); },
    listenerCount: () => foreground.size + opened.size + refresh.size,
  };
}

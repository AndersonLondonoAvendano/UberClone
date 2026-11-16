// AI-assisted: see docs/AI_LOG.md #64
// Notifications service (T-180). It delegates to an adapter (RN Firebase today; an expo-notifications
// adapter can replace it without touching callers). Screens must not import the SDK.
// Push tokens are only logged masked (safeLog) and never leave this layer except to the backend client.
import { logPushEvent, logTokenInDev } from './safeLog';
import { parsePushData, parsePushRequest } from './pushRequest';

// `api`: notificationsApi-like { registerToken, unregisterToken }; `intents`: pendingIntent-like { set }.
export function createNotifications(adapter, { api, intents, now = () => Date.now(), isDev = false, log = () => {} } = {}) {
  return {
    getPermissionState: () => adapter.getPermissionState(),
    requestPermission: () => adapter.requestPermission(),
    getToken: () => adapter.getToken(),
    onTokenRefresh: (callback) => adapter.onTokenRefresh(callback),
    deleteToken: () => adapter.deleteToken(),

    // Gets the device token and registers it in the backend. Returns the token, or null on any failure.
    async registerToken() {
      try {
        const token = await adapter.getToken();
        if (!token || !api) return null;
        const result = await api.registerToken(token);
        if (!result.ok) return null;
        logTokenInDev('token registered', token, { isDev, log });
        return token;
      } catch {
        return null;
      }
    },

    // Best effort: unregisters in the backend, then removes the device token. Never throws.
    async unregisterToken(token) {
      try {
        if (token && api) await api.unregisterToken(token);
      } catch {
        // ignored: logout must not fail because of notifications
      }
      try {
        await adapter.deleteToken();
      } catch {
        // ignored
      }
    },

    // Foreground messages that are valid trip requests. callback(request, targetUid). Returns unsubscribe.
    onForegroundMessage(callback) {
      return adapter.onForegroundMessage((data) => {
        const parsed = parsePushRequest(data, { now: now() });
        if (parsed.ok) callback(parsed.request, parsed.targetUid);
      });
    },

    // Notification taps (background and cold start). The intent is parked in `intents` (bound to its uid)
    // and `callback()` fires so the bridge can try to take it. Returns a cancel function.
    onNotificationOpened(callback) {
      let cancelled = false;
      const trace = (code) => logPushEvent(code, { isDev, log });
      const handle = (data) => {
        if (cancelled || !intents) return;
        const parsed = parsePushData(data);
        if (!parsed.ok) {
          trace(`push-rejected:${parsed.reason}`);
          return;
        }
        if (!intents.set(parsed.intent)) {
          trace('intent-duplicate');
          return;
        }
        trace('intent-stored');
        callback();
      };
      const unsubscribe = adapter.onNotificationOpened((data) => {
        trace('push-opened-received');
        handle(data);
      });
      // Asked once, when the bridge mounts; the answer goes into the same store as the listener.
      adapter
        .getInitialNotification()
        .then((data) => {
          trace(data ? 'push-initial-received' : 'push-initial-null');
          if (data) handle(data);
        })
        .catch(() => trace('push-initial-error'));
      return () => {
        cancelled = true;
        if (typeof unsubscribe === 'function') unsubscribe();
      };
    },
  };
}

let defaultInstance = null;

// Lazy singleton: the native SDK is loaded on first use, never at import time.
export function getNotifications() {
  if (defaultInstance == null) {
    const { createDefaultRnFirebaseAdapter } = require('./adapters/rnFirebaseDefault');
    const { notificationsApi } = require('./notificationsService');
    const { pendingIntent } = require('./pendingIntent');
    defaultInstance = createNotifications(createDefaultRnFirebaseAdapter(), {
      api: notificationsApi,
      intents: pendingIntent,
      isDev: typeof __DEV__ !== 'undefined' && __DEV__,
      log: (message) => console.log(message),
    });
  }
  return defaultInstance;
}

// AI-assisted: see docs/AI_LOG.md #64
// Minimal notifications interface. It delegates to an adapter (RN Firebase today; an
// expo-notifications adapter can replace it without touching callers). Screens must not import the SDK.

export function createNotifications(adapter) {
  return {
    getPermissionState: () => adapter.getPermissionState(),
    requestPermission: () => adapter.requestPermission(),
    getToken: () => adapter.getToken(),
    onTokenRefresh: (callback) => adapter.onTokenRefresh(callback),
    deleteToken: () => adapter.deleteToken(),
  };
}

let defaultInstance = null;

// Lazy singleton: the native SDK is loaded on first use, never at import time.
export function getNotifications() {
  if (defaultInstance == null) {
    const { createDefaultRnFirebaseAdapter } = require('./adapters/rnFirebaseDefault');
    defaultInstance = createNotifications(createDefaultRnFirebaseAdapter());
  }
  return defaultInstance;
}

// AI-assisted: see AI_LOG.md #64
// Driver preference "notificationsEnabled" (T-184, RF-71, RF-74, D-134). Off by default. Storage is
// injected (AsyncStorage in the app), so a script can test it. It never throws: a failing storage reads
// as "off" and set/clear report false. Only the session-end step of resetSession clears it (after the
// trip-save wait, right before signOut); clearOwnStorage never touches this key.

export const NOTIFICATIONS_ENABLED_KEY = 'notificationsEnabled';

export function createNotificationPreference({ storage, key = NOTIFICATIONS_ENABLED_KEY }) {
  return {
    // true only when the stored value is exactly 'true'.
    async get() {
      try {
        return (await storage.getItem(key)) === 'true';
      } catch {
        return false;
      }
    },
    // Returns true when the value was stored.
    async set(enabled) {
      try {
        await storage.setItem(key, enabled ? 'true' : 'false');
        return true;
      } catch {
        return false;
      }
    },
    // Returns true when the value was removed.
    async clear() {
      try {
        await storage.removeItem(key);
        return true;
      } catch {
        return false;
      }
    },
  };
}

// AsyncStorage is loaded on first use, never at import time.
const lazyStorage = {
  getItem: (k) => require('@react-native-async-storage/async-storage').default.getItem(k),
  setItem: (k, v) => require('@react-native-async-storage/async-storage').default.setItem(k, v),
  removeItem: (k) => require('@react-native-async-storage/async-storage').default.removeItem(k),
};

export const notificationPreference = createNotificationPreference({ storage: lazyStorage });

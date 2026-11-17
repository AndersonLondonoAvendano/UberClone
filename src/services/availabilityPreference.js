// AI-assisted: see AI_LOG.md #72
// Driver "Disponible" choice kept on the phone (T-288, D-201). Local only: nothing goes to Firestore.
// The key is bound to the uid (`availability:<uid>`) and holds a plain 'true' / 'false' mark, no personal
// data, so one account never inherits another one's choice. Storage is injected (AsyncStorage in the app),
// so a script can test it. It never throws: a corrupt value, a missing uid or a failing read all read as
// "not available"; set/clear report false when the storage failed. It is removed at the session end, at
// the same point as the notifications preference (D-134), see buildSessionResetDeps.

export const AVAILABILITY_KEY_PREFIX = 'availability:';

const keyFor = (uid) => (typeof uid === 'string' && uid !== '' ? `${AVAILABILITY_KEY_PREFIX}${uid}` : null);

export function createAvailabilityPreference({ storage }) {
  return {
    // true only when the value stored for this uid is exactly 'true'.
    async get(uid) {
      const key = keyFor(uid);
      if (!key) return false;
      try {
        return (await storage.getItem(key)) === 'true';
      } catch {
        return false;
      }
    },
    // Returns true when the value was stored.
    async set(uid, available) {
      const key = keyFor(uid);
      if (!key) return false;
      try {
        await storage.setItem(key, available ? 'true' : 'false');
        return true;
      } catch {
        return false;
      }
    },
    // Returns true when the value was removed.
    async clear(uid) {
      const key = keyFor(uid);
      if (!key) return false;
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

export const availabilityPreference = createAvailabilityPreference({ storage: lazyStorage });

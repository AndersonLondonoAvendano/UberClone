// AI-assisted: see docs/AI_LOG.md #67
// Device language preference "appLanguage" (RI-12). Same pattern as notifications/preference.js:
// storage is injected (AsyncStorage in the app) and nothing here throws. It is never cleared on sign-out.
import { SUPPORTED, normalizeLanguage } from './languages';

export const LANGUAGE_KEY = 'appLanguage';

export function createLanguagePreference({ storage, key = LANGUAGE_KEY }) {
  return {
    // The stored 'es' or 'en'; null when missing, corrupt (fr, empty, number) or the storage fails.
    async get() {
      try {
        const raw = await storage.getItem(key);
        return SUPPORTED.includes(raw) ? raw : null;
      } catch {
        return null;
      }
    },
    // Returns true when the value was stored; an unsupported language is not stored.
    async set(language) {
      const value = normalizeLanguage(language);
      if (!value) return false;
      try {
        await storage.setItem(key, value);
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
};

export const languagePreference = createLanguagePreference({ storage: lazyStorage });

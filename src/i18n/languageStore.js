// AI-assisted: see AI_LOG.md #67
// Active-language store (RI-14, RI-15). The language changes at once and subscribers are told; saving
// to the device is best effort and happens after. Saves run in call order, so with two quick changes
// the last one wins and is the one left stored. Nothing here throws.
import { DEFAULT_LANGUAGE, normalizeLanguage } from './languages';
import { languagePreference } from './languagePreference';

export function createLanguageStore({ preference, initial = DEFAULT_LANGUAGE } = {}) {
  let current = normalizeLanguage(initial) ?? DEFAULT_LANGUAGE;
  const listeners = new Set();
  let saveQueue = Promise.resolve();

  const notify = () => {
    for (const listener of [...listeners]) {
      try {
        listener(current);
      } catch {
        // One failing subscriber must not stop the others.
      }
    }
  };

  const apply = (language) => {
    const next = normalizeLanguage(language);
    if (!next) return false;
    if (next !== current) {
      current = next;
      notify();
    }
    return true;
  };

  return {
    getLanguage: () => current,
    // Sets the starting language without saving it (the resolved language is not a user choice).
    init(language) {
      apply(language);
    },
    // Changes the language now and saves it later. Resolves { saved }; an invalid value is ignored.
    setLanguage(language) {
      if (!apply(language)) return Promise.resolve({ saved: false });
      const value = current;
      const run = async () => {
        try {
          return { saved: (await preference?.set(value)) === true };
        } catch {
          return { saved: false };
        }
      };
      const result = saveQueue.then(run, run);
      saveQueue = result;
      return result;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export const languageStore = createLanguageStore({ preference: languagePreference });
export const getLanguage = languageStore.getLanguage;
export const setLanguage = languageStore.setLanguage;
export const subscribe = languageStore.subscribe;
export const init = languageStore.init;

// AI-assisted: see AI_LOG.md #67
// AI-assisted: see AI_LOG.md #68
// Registration language suggestion (RI-08, CA-006-09). The language stored with the registration is
// applied once, and only when the device has no saved preference. It is never saved (it is not a user
// choice) and never overrides a saved preference. A change made while the preference was being read
// (the active language differs after the wait) is kept: the suggestion is dropped (CA-006-49). Limit:
// a choice equal to the language already active leaves no trace and cannot be told apart.
// An invalid value is ignored. Nothing here throws.
import { languageStore } from './languageStore';
import { languagePreference } from './languagePreference';
import { normalizeLanguage } from './languages';

export function createSuggestionApplier({ preference = languagePreference, store = languageStore } = {}) {
  let done = false;
  // Resolves the applied language, or null when nothing was applied.
  return async function applySuggestion(suggested) {
    if (done) return null;
    const language = normalizeLanguage(suggested);
    if (!language) return null;
    done = true;
    const before = store.getLanguage();
    let stored = null;
    try {
      stored = await preference.get();
    } catch {
      stored = null;
    }
    if (stored) return null;
    if (store.getLanguage() !== before) return null;
    store.init(language);
    return language;
  };
}

export const applySuggestion = createSuggestionApplier();

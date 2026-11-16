// AI-assisted: see docs/AI_LOG.md #67
// Registration language suggestion (RI-08, CA-006-09). The language stored with the registration is
// applied once, and only when the device has no saved preference. It is never saved (it is not a user
// choice), never overrides a saved preference, and never overrides a change made in this session
// (setLanguage saves the preference, so a session change shows up as a saved preference).
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
    let stored = null;
    try {
      stored = await preference.get();
    } catch {
      stored = null;
    }
    if (stored) return null;
    store.init(language);
    return language;
  };
}

export const applySuggestion = createSuggestionApplier();

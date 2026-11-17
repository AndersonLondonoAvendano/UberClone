// AI-assisted: see docs/AI_LOG.md #67
// Initial language before the first frame (RI-06, RI-09, RI-15). Reads the saved preference with a
// cap of READ_TIMEOUT_MS; a slow, failed or empty read falls back to the phone language and then es.
// The resolved language is applied without saving it. Never throws and never waits longer than the cap.
import { languageStore } from './languageStore';
import { languagePreference } from './languagePreference';
import { readPhoneLanguage } from './phoneLanguage';
import { resolveLanguage } from './resolveLanguage';

export const READ_TIMEOUT_MS = 1500;

export async function initLanguage({
  preference = languagePreference,
  readers,
  suggested,
  store = languageStore,
  timeoutMs = READ_TIMEOUT_MS,
} = {}) {
  let timer;
  const capped = new Promise((resolve) => {
    timer = setTimeout(() => resolve(null), timeoutMs);
  });
  let stored = null;
  try {
    stored = await Promise.race([Promise.resolve().then(() => preference.get()), capped]);
  } catch {
    stored = null;
  } finally {
    clearTimeout(timer);
  }
  let phone = null;
  try {
    phone = readPhoneLanguage(readers);
  } catch {
    phone = null;
  }
  const language = resolveLanguage({ stored, suggested, phone });
  store.init(language);
  return language;
}

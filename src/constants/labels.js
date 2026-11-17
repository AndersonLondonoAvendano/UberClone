// AI-assisted: see docs/AI_LOG.md #67
// App texts. `labels` is a live view of the active language dictionary (src/i18n); every importer keeps
// reading it as before. The Spanish source lives in src/i18n/dictionaries/es.js.
import { es } from '../i18n/dictionaries/es';
import { en } from '../i18n/dictionaries/en';
import { createLiveLabels } from '../i18n/liveLabels';
import { getLanguage } from '../i18n/languageStore';

export const labels = createLiveLabels({ dictionaries: { es, en }, getLanguage });

// Reads the active language when called.
export function getSubmitErrorMessage(code) {
  return labels.registration.documents.submitErrors[code] ?? labels.registration.documents.submitError;
}

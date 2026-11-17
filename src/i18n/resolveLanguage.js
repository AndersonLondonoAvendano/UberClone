// AI-assisted: see AI_LOG.md #67
// Initial language order (RI-06, RI-08): saved preference, registration suggestion, phone, then es.
import { DEFAULT_LANGUAGE, normalizeLanguage } from './languages';

export function resolveLanguage({ stored, suggested, phone } = {}) {
  return (
    normalizeLanguage(stored) ??
    normalizeLanguage(suggested) ??
    normalizeLanguage(phone) ??
    DEFAULT_LANGUAGE
  );
}

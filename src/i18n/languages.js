// AI-assisted: see docs/AI_LOG.md #67
// Supported app languages (RI-06). The first one is the fallback.

export const SUPPORTED = ['es', 'en'];
export const DEFAULT_LANGUAGE = 'es';

// 'es_CO', 'es-419', 'en-GB', 'EN' -> base code when supported; anything else (or a non-string) -> null.
export function normalizeLanguage(value) {
  if (typeof value !== 'string') return null;
  const base = value.trim().toLowerCase().split(/[-_@.]/)[0];
  return SUPPORTED.includes(base) ? base : null;
}

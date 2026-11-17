// AI-assisted: see docs/AI_LOG.md #67
// Phone language without extra dependencies (RI-07). Readers are injected so a script can test
// them; the real ones load React Native lazily and never throw (a failing reader counts as "none").
import { normalizeLanguage } from './languages';

// Returns the first supported language found by the readers, or null. Never throws.
export function readPhoneLanguage(readers = defaultReaders()) {
  if (!Array.isArray(readers)) return null;
  for (const read of readers) {
    try {
      const found = normalizeLanguage(read());
      if (found) return found;
    } catch {
      // A failing reader is skipped.
    }
  }
  return null;
}

function iosLanguage() {
  const { Platform, NativeModules } = require('react-native');
  if (Platform.OS !== 'ios') return null;
  const settings = NativeModules.SettingsManager?.settings;
  const first = settings?.AppleLanguages?.[0] ?? settings?.AppleLocale;
  return typeof first === 'string' ? first : null;
}

function i18nManagerLanguage() {
  const { I18nManager } = require('react-native');
  return I18nManager.getConstants?.()?.localeIdentifier ?? null;
}

function intlLanguage() {
  return Intl.DateTimeFormat().resolvedOptions().locale ?? null;
}

export function defaultReaders() {
  return [iosLanguage, i18nManagerLanguage, intlLanguage];
}

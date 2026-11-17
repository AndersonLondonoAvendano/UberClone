// AI-assisted: see AI_LOG.md #43
// AI-assisted: see AI_LOG.md #67
// AI-assisted: see AI_LOG.md #68
import { getLanguage } from '../i18n/languageStore';
import { normalizeLanguage, DEFAULT_LANGUAGE } from '../i18n/languages';

// Language to format with: the explicit one when supported, otherwise the active one read at call time (D-191).
const resolveFormatLanguage = (language) => normalizeLanguage(language) ?? normalizeLanguage(getLanguage()) ?? DEFAULT_LANGUAGE;

// Display formatting for the trip screens (T-43 to T-45): pesos with "." thousands grouping,
// kilometers with a decimal comma and whole minutes. Display only: amounts come from calculateFare.

// Integer pesos: "$ 12.300".
export function formatCop(value) {
  const amount = Math.round(Number(value) || 0);
  const sign = amount < 0 ? '-' : '';
  const digits = String(Math.abs(amount));
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${sign}$ ${grouped}`;
}

// Kilometers with one decimal: 2350 m -> "2,4" in es, "2.4" in en. Built from integers (no toFixed).
export function formatKmFromMeters(meters, language) {
  const tenths = Math.max(0, Math.round((Number(meters) || 0) / 100));
  const separator = resolveFormatLanguage(language) === 'en' ? '.' : ',';
  return `${Math.floor(tenths / 10)}${separator}${tenths % 10}`;
}

export const formatKm = (km, language) => formatKmFromMeters((Number(km) || 0) * 1000, language);

// Whole minutes, at least 1 while something remains: 61 s -> "2", 0 s -> "0".
export function formatMinutesFromSeconds(seconds) {
  const value = Math.max(0, Number(seconds) || 0);
  return String(value === 0 ? 0 : Math.max(1, Math.ceil(value / 60)));
}

// AI-assisted: see AI_LOG.md #55 (F1a: «NaN:NaN» in Earnings)
// Root cause: saved trips carry Firestore Timestamps ({ toMillis }); new Date(timestamp) of one is an
// invalid date, whose getHours() is NaN. toValidDate accepts number, Date, numeric string and
// Timestamp, and returns null for anything else (null, undefined, '', invalid text or dates).
export function toValidDate(value) {
  if (value == null || value === '') return null;
  let ms;
  if (typeof value === 'number') ms = value;
  else if (value instanceof Date) ms = value.getTime();
  else if (typeof value.toMillis === 'function') ms = value.toMillis();
  else if (typeof value === 'string') ms = /^\d+$/.test(value.trim()) ? Number(value) : new Date(value).getTime();
  else return null;
  return Number.isFinite(ms) ? new Date(ms) : null;
}

// AI-assisted: see AI_LOG.md #68 (CA-006-47, CA-006-48)
// Times are shown in the PHONE's local time, not Colombia's (a driver abroad sees the phone's hour).
// By default the real local getters are used. For tests, options.utcOffsetMinutes (for example -300 for
// UTC-5) shifts the instant and reads it with the UTC getters, so no Intl and no dependency is needed.
const dateParts = (date, options) => {
  const offset = options?.utcOffsetMinutes;
  if (typeof offset === 'number' && Number.isFinite(offset)) {
    const shifted = new Date(date.getTime() + offset * 60000);
    return {
      year: shifted.getUTCFullYear(),
      month: shifted.getUTCMonth() + 1,
      day: shifted.getUTCDate(),
      hours: shifted.getUTCHours(),
      minutes: shifted.getUTCMinutes(),
    };
  }
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hours: date.getHours(),
    minutes: date.getMinutes(),
  };
};

// Clock time in the phone's local time: es "14:05" (24 h), en "2:05 PM" (12 h). Empty text for an unknown date.
export function formatClock(timestamp, language, options) {
  const date = toValidDate(timestamp);
  if (!date) return '';
  const { hours, minutes } = dateParts(date, options);
  const mm = String(minutes).padStart(2, '0');
  if (resolveFormatLanguage(language) === 'en') {
    const hour12 = hours % 12 === 0 ? 12 : hours % 12;
    return `${hour12}:${mm} ${hours < 12 ? 'AM' : 'PM'}`;
  }
  return `${String(hours).padStart(2, '0')}:${mm}`;
}

// Replaces {name} placeholders of a label.
export function fillLabel(template, values) {
  return Object.keys(values).reduce((text, key) => text.split(`{${key}}`).join(String(values[key])), template);
}

// AI-assisted: see AI_LOG.md #54
// Screen-reader text for the request countdown: only at the thresholds (10, 5 and 0 s), empty otherwise.
// template is labels.trip.countdownA11y ("... {s} ...").
export const COUNTDOWN_ANNOUNCE_AT = [10, 5, 0];
export function countdownAnnouncement(secondsLeft, template) {
  // AI-assisted: see AI_LOG.md #54 (null, undefined and '' must not become 0)
  if (secondsLeft == null || secondsLeft === '') return '';
  const seconds = Number(secondsLeft);
  if (!Number.isFinite(seconds) || !COUNTDOWN_ANNOUNCE_AT.includes(seconds)) return '';
  return fillLabel(template, { s: seconds });
}

// AI-assisted: see AI_LOG.md #50
// Local date and time: es "11/11/2026 14:05" (day first, as in Colombia), en "11/12/2026 2:05 PM" (month first).
// Empty text for an unknown date.
export function formatDateTime(timestamp, language, options) {
  const date = toValidDate(timestamp);
  if (!date) return '';
  const { year, month, day } = dateParts(date, options);
  const dd = String(day).padStart(2, '0');
  const mo = String(month).padStart(2, '0');
  const lang = resolveFormatLanguage(language);
  const datePart = lang === 'en' ? `${mo}/${dd}/${year}` : `${dd}/${mo}/${year}`;
  return `${datePart} ${formatClock(timestamp, lang, options)}`;
}

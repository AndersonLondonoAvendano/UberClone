// AI-assisted: see docs/AI_LOG.md #55
// Pure validators for the driver documents tab (RF-41): expiry dates, the technical review rule
// and the license number. No React Native imports so they run under plain Node.

import { labels } from '../constants/labels.js';

const TEXT = labels.registration.documents.validation;
const COLOMBIA_UTC_OFFSET_HOURS = -5;
const TECHNICAL_REVIEW_MIN_AGE_YEARS = 5;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const YEAR_PATTERN = /^\d{4}$/;
const LICENSE_NUMBER_PATTERN = /^[A-Za-z0-9]{5,20}$/;

function dateKey(year, month, day) {
  return year * 10000 + month * 100 + day;
}

// Calendar day in Colombia (UTC-5, no daylight saving) for the given instant.
function colombiaTodayKey(now) {
  const instant = now instanceof Date ? now.getTime() : Number(now);
  if (Number.isNaN(instant)) return null;
  const shifted = new Date(instant + COLOMBIA_UTC_OFFSET_HOURS * 60 * 60 * 1000);
  return dateKey(shifted.getUTCFullYear(), shifted.getUTCMonth() + 1, shifted.getUTCDate());
}

// A Date from the picker carries the calendar day in its local components; a stored value is
// 'YYYY-MM-DD'. Both reduce to a comparable day key, or null when the value is not a valid day.
function expiryDayKey(value) {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return dateKey(value.getFullYear(), value.getMonth() + 1, value.getDate());
  }
  if (typeof value === 'string') {
    const match = ISO_DATE_PATTERN.exec(value);
    if (!match) return null;
    const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
    const probe = new Date(Date.UTC(year, month - 1, day));
    const isRealDay =
      probe.getUTCFullYear() === year && probe.getUTCMonth() === month - 1 && probe.getUTCDate() === day;
    return isRealDay ? dateKey(year, month, day) : null;
  }
  return null;
}

// Calendar year in Colombia for the given instant (used as the injectable "current year").
export function colombiaYear(now = new Date()) {
  const todayKey = colombiaTodayKey(now);
  return todayKey === null ? new Date().getFullYear() : Math.floor(todayKey / 10000);
}

// Valid only when the expiry day is strictly after today in Colombia. `now` is injectable.
export function validateExpiry(value, now = new Date()) {
  const expiryKey = expiryDayKey(value);
  const todayKey = colombiaTodayKey(now);
  if (expiryKey === null || todayKey === null || expiryKey <= todayKey) {
    return { valid: false, error: TEXT.expiryInvalid };
  }
  return { valid: true, error: null };
}

function parseVehicleYear(vehicleYear) {
  if (typeof vehicleYear === 'number') {
    return Number.isInteger(vehicleYear) ? vehicleYear : null;
  }
  if (typeof vehicleYear === 'string' && YEAR_PATTERN.test(vehicleYear.trim())) {
    return Number(vehicleYear.trim());
  }
  return null;
}

// Technical review is required from 5 years of age (currentYear - year >= 5). A missing, invalid
// or future year is read conservatively: the review is required. When not required, `reason` is
// the text to show on screen.
export function requiresTechnicalReview(vehicleYear, currentYear = new Date().getFullYear()) {
  const year = parseVehicleYear(vehicleYear);
  const isUsableYear = year !== null && year >= 1000 && year <= 9999 && year <= currentYear;
  if (!isUsableYear) return { required: true, reason: null };
  if (currentYear - year >= TECHNICAL_REVIEW_MIN_AGE_YEARS) return { required: true, reason: null };
  return { required: false, reason: TEXT.technicalReviewNotRequired };
}

export function validateLicenseNumber(value) {
  const isValid = typeof value === 'string' && LICENSE_NUMBER_PATTERN.test(value.trim());
  return isValid ? { valid: true, error: null } : { valid: false, error: TEXT.licenseNumberInvalid };
}

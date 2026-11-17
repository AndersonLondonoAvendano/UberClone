// AI-assisted: see AI_LOG.md #56
// Period limits in Colombian time (UTC-5, no daylight saving), computed with UTC arithmetic only so
// the result never depends on the device time zone. Ranges are [start, end) in epoch ms. The week
// runs Monday to Sunday. A chosen date (Date from the picker or 'YYYY-MM-DD') is read as a calendar
// day: a Date contributes its own year, month and day as the user picked them.

import { labels } from '../constants/labels';

export const COLOMBIA_OFFSET_MS = 5 * 60 * 60 * 1000;
export const DAY_MS = 24 * 60 * 60 * 1000;
export const MAX_RANGE_DAYS = 366;

// 00:00 Colombia of the calendar day (y, m0, d) as epoch ms. Date.UTC normalises overflowing days/months.
const colombiaMidnight = (y, m0, d) => Date.UTC(y, m0, d) + COLOMBIA_OFFSET_MS;

// [start, end) of the period ('day' | 'week' | 'month') that contains `now`.
export function periodBounds(period, now = Date.now()) {
  const shifted = new Date(now - COLOMBIA_OFFSET_MS);
  const y = shifted.getUTCFullYear();
  const m = shifted.getUTCMonth();
  const d = shifted.getUTCDate();
  if (period === 'month') return { start: colombiaMidnight(y, m, 1), end: colombiaMidnight(y, m + 1, 1) };
  if (period === 'week') {
    const sinceMonday = (shifted.getUTCDay() + 6) % 7;
    return { start: colombiaMidnight(y, m, d - sinceMonday), end: colombiaMidnight(y, m, d - sinceMonday + 7) };
  }
  return { start: colombiaMidnight(y, m, d), end: colombiaMidnight(y, m, d + 1) };
}

// Calendar day { y, m, d } of a picked date, or null when it is absent or invalid.
function calendarDay(value) {
  if (typeof value === 'string') {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return null;
    const [y, m, d] = [Number(match[1]), Number(match[2]) - 1, Number(match[3])];
    const check = new Date(Date.UTC(y, m, d));
    return check.getUTCFullYear() === y && check.getUTCMonth() === m && check.getUTCDate() === d ? { y, m, d } : null;
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return { y: value.getFullYear(), m: value.getMonth(), d: value.getDate() };
  }
  return null;
}

// [start, end) for a chosen Rango: start = 00:00 Colombia of the first day, end = 00:00 of the day
// after the last one. Returns null when a date is missing or invalid.
export function rangeBounds(startDate, endDate) {
  const from = calendarDay(startDate);
  const to = calendarDay(endDate);
  if (!from || !to) return null;
  return { start: colombiaMidnight(from.y, from.m, from.d), end: colombiaMidnight(to.y, to.m, to.d + 1) };
}

// { ok: true, error: null } or { ok: false, error: <text from labels.history> }.
export function validateRange(startDate, endDate) {
  const bounds = rangeBounds(startDate, endDate);
  if (!bounds) return { ok: false, error: labels.history.rangeMissing };
  const days = (bounds.end - bounds.start) / DAY_MS;
  if (days < 1) return { ok: false, error: labels.history.rangeOrder };
  if (days > MAX_RANGE_DAYS) return { ok: false, error: labels.history.rangeTooLong };
  return { ok: true, error: null };
}

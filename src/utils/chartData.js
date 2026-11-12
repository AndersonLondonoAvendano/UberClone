// AI-assisted: see docs/AI_LOG.md #56
// Pure grouping of net earnings for the bar chart (T-103), in Colombian time (UTC-5). Today: six
// 4-hour bands; Week and Month: one bar per day; Rango: per day up to 31 days, otherwise per week
// (7-day blocks counted from the first day). Empty groups are 0; trips with an invalid date or a
// status other than completed/paid are left out without throwing.

import { labels } from '../constants/labels';
import { TRIP_STATUS } from '../constants/tripStatus';
import { COLOMBIA_OFFSET_MS, DAY_MS, periodBounds } from './dateRanges';
import { toMillis } from './earnings';

const HOUR_MS = 60 * 60 * 1000;
const BAND_HOURS = 4;
export const RANGE_DAILY_MAX_DAYS = 31;

const pad = (n) => String(n).padStart(2, '0');
const amount = (value) => (Number.isFinite(Number(value)) ? Math.round(Number(value)) : 0);

// Colombian calendar parts of an epoch ms.
const parts = (ms) => {
  const d = new Date(ms - COLOMBIA_OFFSET_MS);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate(), dow: d.getUTCDay() };
};

function layout(period, range, now) {
  const bounds = period === 'range' ? range : range ?? periodBounds(period, now);
  if (!bounds || !Number.isFinite(bounds.start) || !Number.isFinite(bounds.end) || bounds.end <= bounds.start) return null;
  const { start, end } = bounds;
  if (period === 'day') {
    const bandLabel = (from) => {
      const hour = Math.round((from - start) / HOUR_MS);
      return `${pad(hour)}-${pad(hour + BAND_HOURS)}h`;
    };
    return { start, end, size: BAND_HOURS * HOUR_MS, label: bandLabel };
  }
  if (period === 'week') return { start, end, size: DAY_MS, label: (from) => labels.history.weekdaysShort[(parts(from).dow + 6) % 7] };
  if (period === 'month') return { start, end, size: DAY_MS, label: (from) => String(parts(from).d) };
  if (period === 'range') {
    const days = Math.ceil((end - start) / DAY_MS);
    const dayLabel = (from) => `${pad(parts(from).d)}/${pad(parts(from).m + 1)}`;
    return { start, end, size: days <= RANGE_DAILY_MAX_DAYS ? DAY_MS : 7 * DAY_MS, label: dayLabel };
  }
  return null;
}

// Net earnings per bar: [{ key, label, value }] in chronological order.
export function groupNetEarnings(trips, period, range = null, now = Date.now()) {
  const plan = layout(period, range, now);
  if (!plan) return [];
  const count = Math.ceil((plan.end - plan.start) / plan.size);
  const groups = Array.from({ length: count }, (_, index) => {
    const from = plan.start + index * plan.size;
    return { key: String(from), label: plan.label(from), value: 0 };
  });
  for (const trip of Array.isArray(trips) ? trips : []) {
    if (trip?.status !== TRIP_STATUS.COMPLETED && trip?.status !== TRIP_STATUS.PAID) continue;
    const at = toMillis(trip.createdAt != null ? trip.createdAt : trip.finishedAt);
    if (!Number.isFinite(at) || at < plan.start || at >= plan.end) continue;
    groups[Math.floor((at - plan.start) / plan.size)].value += amount(trip.driverEarnings);
  }
  return groups;
}

// Bar heights as a 0..1 fraction of the largest group. All zero (or empty) gives 0, never a division by zero.
export function barScale(groups) {
  const list = Array.isArray(groups) ? groups : [];
  const max = list.reduce((acc, group) => Math.max(acc, amount(group?.value)), 0);
  return list.map((group) => ({ key: group.key, ratio: max > 0 ? Math.max(0, amount(group.value)) / max : 0 }));
}

// { total, top } where top is the group with the highest value (first on ties) or null when all are 0.
export function chartSummary(groups) {
  const list = Array.isArray(groups) ? groups : [];
  let top = null;
  let total = 0;
  for (const group of list) {
    const value = amount(group?.value);
    total += value;
    if (value > 0 && (top === null || value > top.value)) top = { key: group.key, label: group.label, value };
  }
  return { total, top };
}

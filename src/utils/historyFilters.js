// AI-assisted: see docs/AI_LOG.md #56
// Turns the History filters into the query of useTripHistory (T-105, T-106): Hoy/Semana/Mes use the
// period limits of Colombian time; Rango uses the two picked dates after validateRange. An invalid
// Rango gives bounds null (nothing is queried) and the error text to show on screen.

import { periodBounds, rangeBounds, validateRange } from './dateRanges';

export const HISTORY_PERIOD = { DAY: 'day', WEEK: 'week', MONTH: 'month', RANGE: 'range' };

// Returns { start, end, error }: start/end are epoch ms or null; error is text from labels or null.
export function resolveHistoryQuery(period, startDate, endDate, now = Date.now()) {
  if (period === HISTORY_PERIOD.RANGE) {
    const check = validateRange(startDate, endDate);
    if (!check.ok) return { start: null, end: null, error: check.error };
    const bounds = rangeBounds(startDate, endDate);
    return { start: bounds.start, end: bounds.end, error: null };
  }
  const bounds = periodBounds(period, now);
  return { start: bounds.start, end: bounds.end, error: null };
}

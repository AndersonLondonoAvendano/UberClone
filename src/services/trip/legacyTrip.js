// AI-assisted: see docs/AI_LOG.md #57
// Pure helpers for trips saved before the payment fields existed (T-122, RF-54).
// A legacy trip lacks BOTH paymentMethod and paymentStatus; with only one of them it is NOT legacy
// (it follows the normal payment logic). Policy for legacy trips:
// - earnings totals and metrics INCLUDE them (completed or paid);
// - computeBalance EXCLUDES them (no method, so nothing is owed either way);
// - the History method filter shows them only under "Todos".
// Their chip is neutral and says "Cobro simulado" in TEXT (never only a color).

import { labels } from '../../constants/labels';

const isMissing = (value) => value === undefined || value === null || value === '';

export function isLegacySimulatedTrip(trip) {
  if (!trip || typeof trip !== 'object') return false;
  return isMissing(trip.paymentMethod) && isMissing(trip.paymentStatus);
}

// { label, tone, icon } for the shared Chip, or null when the trip is not legacy.
export function legacyPaymentChip(trip) {
  if (!isLegacySimulatedTrip(trip)) return null;
  return { label: labels.history.legacyPayment, tone: 'neutral', icon: 'receipt-outline' };
}

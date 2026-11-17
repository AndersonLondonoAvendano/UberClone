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

// AI-assisted: see docs/AI_LOG.md #66
// Tolerant read of a saved trip (RE-11): adds the fields introduced after the first documents with
// defaults and never changes the existing ones. When both exist, the top-level amounts win over
// `economy` (they stay the single source of the totals).
const AMOUNT_KEYS = ['fare', 'commission', 'tip', 'driverEarnings'];
const isFiniteNumber = (value) => typeof value === 'number' && Number.isFinite(value);

function readPoint(point, label) {
  const source = point && typeof point === 'object' ? point : {};
  return {
    lat: isFiniteNumber(source.lat) ? source.lat : null,
    lng: isFiniteNumber(source.lng) ? source.lng : null,
    address: typeof source.address === 'string' ? source.address : label ?? '',
  };
}

export function readTrip(trip) {
  const source = trip && typeof trip === 'object' ? trip : {};
  const stored = source.economy && typeof source.economy === 'object' ? source.economy : {};
  const economy = {};
  for (const key of AMOUNT_KEYS) {
    if (isFiniteNumber(source[key])) economy[key] = source[key];
    else economy[key] = isFiniteNumber(stored[key]) ? stored[key] : 0;
  }
  const finished = source.status === 'completed' || source.status === 'paid';
  return {
    ...source,
    passengerId: isMissing(source.passengerId) ? null : source.passengerId,
    completedAt: !isMissing(source.completedAt) ? source.completedAt : finished ? source.finishedAt ?? null : null,
    economy,
    origin: readPoint(source.origin, source.originLabel),
    destination: readPoint(source.destination, source.destinationLabel),
  };
}

// { label, tone, icon } for the shared Chip, or null when the trip is not legacy.
export function legacyPaymentChip(trip) {
  if (!isLegacySimulatedTrip(trip)) return null;
  return { label: labels.history.legacyPayment, tone: 'neutral', icon: 'receipt-outline' };
}

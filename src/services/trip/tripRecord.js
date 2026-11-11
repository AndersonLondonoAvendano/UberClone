// AI-assisted: see docs/AI_LOG.md #50
// Pure mapping of a finished trip to the document saved in drivers/{uid}/trips/{tripId} (T-46).
// Amounts come from calculateFare (the same call the summary screen uses), so what is saved is
// exactly what the driver saw. NO coordinates are saved: only address labels, distance, duration,
// category, whole-COP amounts and dates. A cancelled trip is saved with all amounts at 0.
// createdAt is added by the repository (serverTimestamp), not here.

import { COMMISSION_RATE } from '../../config/pricing';
import { TRIP_STATUS } from '../../constants/tripStatus';
import { calculateFare } from '../../utils/fare';

export const SAVED_STATUS = { COMPLETED: TRIP_STATUS.COMPLETED, CANCELLED: TRIP_STATUS.CANCELLED };
export const SAVED_PAYMENT = { CASH: 'cash', TRANSFER: 'transfer', NONE: 'none' };

// Keys of the saved document (createdAt included). The Firestore rule uses the same list.
export const TRIP_DOC_KEYS = [
  'driverId',
  'status',
  'category',
  'passengerName',
  'originLabel',
  'destinationLabel',
  'distanceKm',
  'durationMin',
  'fare',
  'commission',
  'driverEarnings',
  'paymentMethod',
  'startedAt',
  'finishedAt',
  'createdAt',
];

export const MAX_NAME_LENGTH = 80;
export const MAX_LABEL_LENGTH = 200;

const text = (value, max) => String(value ?? '').trim().slice(0, max);
const round = (value, decimals) => {
  const factor = 10 ** decimals;
  return Math.round((Number(value) || 0) * factor) / factor;
};
const toDate = (value) => (value == null ? null : new Date(value));

// The request asks for "card" or "cash"; a card trip is settled by transfer to the registered account.
export function paymentMethodOf(request) {
  return request?.paymentMethod === 'cash' ? SAVED_PAYMENT.CASH : SAVED_PAYMENT.TRANSFER;
}

// status: SAVED_STATUS value. startedAt / finishedAt: epoch ms (startedAt may be null when the
// ride never started). Returns the document without createdAt. Throws when the request has no
// valid fare (the caller treats it as "cannot save").
export function buildTripRecord({ driverId, tripId, request, status, startedAt = null, finishedAt }) {
  if (!driverId || !tripId || !request) throw new Error('trip-record: missing data');
  const completed = status === SAVED_STATUS.COMPLETED;
  const fare = completed
    ? calculateFare({ distanceKm: request.distanceKm, durationMin: request.durationMin, category: request.category })
    : { fare: 0, commission: 0, driverEarnings: 0 };
  return {
    driverId,
    status: completed ? SAVED_STATUS.COMPLETED : SAVED_STATUS.CANCELLED,
    category: request.category,
    passengerName: text(request.passenger?.name, MAX_NAME_LENGTH),
    originLabel: text(request.origin?.address, MAX_LABEL_LENGTH),
    destinationLabel: text(request.destination?.address, MAX_LABEL_LENGTH),
    distanceKm: round(request.distanceKm, 2),
    durationMin: round(request.durationMin, 1),
    fare: fare.fare,
    commission: fare.commission,
    driverEarnings: fare.driverEarnings,
    paymentMethod: completed ? paymentMethodOf(request) : SAVED_PAYMENT.NONE,
    startedAt: toDate(startedAt),
    finishedAt: toDate(finishedAt ?? Date.now()),
  };
}

export const SAVED_COMMISSION_RATE = COMMISSION_RATE;

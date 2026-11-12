// AI-assisted: see docs/AI_LOG.md #50
// AI-assisted: see docs/AI_LOG.md #55
// AI-assisted: see docs/AI_LOG.md #61
// Pure mapping of a finished trip to the document saved in drivers/{uid}/trips/{tripId} (T-46, T-93).
// Amounts come from calculateFare (the same call the summary screen uses), so what is saved is
// exactly what the driver saw. NO real driver position is saved: only address labels, distance,
// duration, category, whole-COP amounts, dates and the planned route simplified to at most 40
// points (RF-52). A cancelled trip is saved with all amounts at 0.
// The trip is created completed or cancelled with paymentStatus pending: this app
// never writes paymentStatus, paymentId or the paid status for a Mercado Pago trip (only the backend
// does); cash is confirmed by the narrow rule (confirmCashPayment in tripRepository).
// createdAt is added by the repository (serverTimestamp), not here.

import { COMMISSION_RATE } from '../../config/pricing';
import { PAYMENT_STATUS, TRIP_STATUS } from '../../constants/tripStatus';
import { calculateFare } from '../../utils/fare';
import { simplifyRoute } from './simplifyRoute';

export const SAVED_STATUS = { COMPLETED: TRIP_STATUS.COMPLETED, CANCELLED: TRIP_STATUS.CANCELLED };
// 'transfer' and 'none' are legacy values: they are only READ (shown as "No disponible"), never written.
// AI-assisted: see docs/AI_LOG.md #58 (T-145: 'stripe' is READ from the backend write, never written by the app)
export const SAVED_PAYMENT = { CASH: 'cash', MERCADOPAGO: 'mercadopago', STRIPE: 'stripe', TRANSFER: 'transfer', NONE: 'none' };

// A card trip is charged through a gateway: Mercado Pago or Stripe.
export const isCardMethod = (method) => method === SAVED_PAYMENT.MERCADOPAGO || method === SAVED_PAYMENT.STRIPE;
export const SAVED_PAYMENT_STATUS = { PENDING: PAYMENT_STATUS.PENDING };

// Keys of the saved document (createdAt included; route is optional). The Firestore rule uses the same list.
export const TRIP_DOC_KEYS = [
  'driverId',
  'status',
  'paymentStatus',
  'commissionRate',
  'category',
  'passengerName',
  'originLabel',
  'destinationLabel',
  'distanceKm',
  'durationMin',
  'fare',
  'commission',
  'driverEarnings',
  'tip',
  'rating',
  'paymentMethod',
  'startedAt',
  'finishedAt',
  'createdAt',
  'route',
];

export const MAX_NAME_LENGTH = 80;
export const MAX_LABEL_LENGTH = 200;

const text = (value, max) => String(value ?? '').trim().slice(0, max);
const round = (value, decimals) => {
  const factor = 10 ** decimals;
  return Math.round((Number(value) || 0) * factor) / factor;
};
// AI-assisted: see docs/AI_LOG.md #61 (D-124)
// tip: whole COP >= 0 (anything else is 0). rating: whole 1-5 (anything else is null: no rating).
export const tipOf = (value) => (Number.isInteger(value) && value >= 0 ? value : 0);
export const ratingOf = (value) => (Number.isInteger(value) && value >= 1 && value <= 5 ? value : null);
const toDate = (value) => (value == null ? null : new Date(value));

// The request asks for 'card' (legacy 'mercadopago') or 'cash'. 'card' is saved as 'mercadopago' (= tarjeta, pasarela por definir, #59). The saved method is one of
// 'mercadopago' | 'cash' (the Firestore rule accepts only those two).
export function paymentMethodOf(request) {
  return request?.paymentMethod === 'cash' ? SAVED_PAYMENT.CASH : SAVED_PAYMENT.MERCADOPAGO;
}

// Firestore does not accept nested arrays, so the [lat, lng] pairs of simplifyRoute are saved as
// { lat, lng } maps (the shape validRoute checks). null when there is no route.
export function routeForRecord(route) {
  const simplified = simplifyRoute(route);
  return simplified ? simplified.map(([lat, lng]) => ({ lat, lng })) : null;
}

// status: SAVED_STATUS value. startedAt / finishedAt: epoch ms (startedAt may be null when the
// ride never started). route: planned route points ([lat, lng] pairs or { lat, lng }), optional;
// without a usable route the document is saved without the key. Returns the document without
// createdAt. Throws when the request has no valid fare (the caller treats it as "cannot save").
export function buildTripRecord({ driverId, tripId, request, status, startedAt = null, finishedAt, route = null }) {
  if (!driverId || !tripId || !request) throw new Error('trip-record: missing data');
  const completed = status === SAVED_STATUS.COMPLETED;
  // The tip is part of driverEarnings (fare - commission + tip) but never of fare or commission.
  const tip = completed ? tipOf(request.tip) : 0;
  const fare = completed
    ? calculateFare({ distanceKm: request.distanceKm, durationMin: request.durationMin, category: request.category, tip })
    : { fare: 0, commission: 0, driverEarnings: 0 };
  const record = {
    driverId,
    status: completed ? SAVED_STATUS.COMPLETED : SAVED_STATUS.CANCELLED,
    paymentStatus: SAVED_PAYMENT_STATUS.PENDING,
    commissionRate: COMMISSION_RATE,
    category: request.category,
    passengerName: text(request.passenger?.name, MAX_NAME_LENGTH),
    originLabel: text(request.origin?.address, MAX_LABEL_LENGTH),
    destinationLabel: text(request.destination?.address, MAX_LABEL_LENGTH),
    distanceKm: round(request.distanceKm, 2),
    durationMin: round(request.durationMin, 1),
    fare: fare.fare,
    commission: fare.commission,
    driverEarnings: fare.driverEarnings,
    tip,
    rating: completed ? ratingOf(request.rating) : null,
    // The rule requires 'cash' or 'mercadopago' even on a cancelled trip.
    paymentMethod: paymentMethodOf(request),
    startedAt: toDate(startedAt),
    finishedAt: toDate(finishedAt ?? Date.now()),
  };
  const savedRoute = completed ? routeForRecord(route) : null;
  if (savedRoute) record.route = savedRoute;
  return record;
}

export const SAVED_COMMISSION_RATE = COMMISSION_RATE;

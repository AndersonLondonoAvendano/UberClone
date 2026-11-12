// AI-assisted: see docs/AI_LOG.md #42
// Internal contract of the passenger API (port and adapters). Models,
// operations and errors the app depends on; adapters (mock, http) implement it. Nothing here calls
// anything: it only documents shapes and exports constants and light validators.
//
// @typedef {{ lat: number, lng: number, address: string }} Place
// @typedef {{
//   id: string,
//   passenger: { name: string, rating?: number },
//   origin: Place,
//   destination: Place,
//   distanceKm: number,
//   durationMin: number,
//   category: 'economico' | 'xl' | 'premium',
//   paymentMethod: 'card' | 'cash',  (#59: 'card' = tarjeta, pasarela por definir; legacy 'mercadopago' is still accepted)
//   createdAt: number,
//   expiresAt: number,
// }} TripRequest
// @typedef {string} TripStatus  one of the TRIP_STATUS values (src/constants/tripStatus.js)
// @typedef {{
//   id: string, request: TripRequest, status: TripStatus, acceptedAt: number,
//   pickedUpAt?: number, completedAt?: number, cancelledAt?: number,
// }} Trip
// @typedef {{ code: string, message: string, cause?: unknown }} PassengerApiError
//
// Operations (all reject only with a PassengerApiError):
//   subscribeToRequests(onRequest, onError?, { getDriverPosition }?) => unsubscribe
//   acceptRequest(requestId) => Promise<Trip>            EXPIRED | ALREADY_TAKEN
//   rejectRequest(requestId) => Promise<void>            EXPIRED when it is no longer pending
//   reportTripStatus(tripId, status) => Promise<Trip>    accepted -> driver_arriving -> driver_arrived -> in_progress -> completed
//   cancelTrip(tripId) => Promise<Trip>
//   reportDriverLocation(tripId, { lat, lng, timestamp }) => Promise<void>
// The optional third argument of subscribeToRequests gives the adapter the driver's current
// position ({ lat, lng } or null) so the mock can create requests nearby.

import { TRIP_STATUS } from '../../constants/tripStatus';

export const PASSENGER_API_ERROR = {
  NETWORK: 'NETWORK',
  EXPIRED: 'EXPIRED',
  ALREADY_TAKEN: 'ALREADY_TAKEN',
  UNAUTHORIZED: 'UNAUTHORIZED',
  // Added in prompt #42: an operation on an unknown trip or a status change the trip does not
  // allow (for example completing a cancelled trip). A programming error, not a network one.
  INVALID_STATE: 'INVALID_STATE',
};

// The trip states live in src/constants/tripStatus.js (RF-13); re-exported so the port offers them.
export { TRIP_STATUS };

// Allowed reportTripStatus transitions (cancelTrip handles the cancelled state).
export const NEXT_TRIP_STATUS = {
  [TRIP_STATUS.ACCEPTED]: TRIP_STATUS.DRIVER_ARRIVING,
  // AI-assisted: see docs/AI_LOG.md #43 (driver_arrived between arriving and in progress)
  [TRIP_STATUS.DRIVER_ARRIVING]: TRIP_STATUS.DRIVER_ARRIVED,
  [TRIP_STATUS.DRIVER_ARRIVED]: TRIP_STATUS.IN_PROGRESS,
  [TRIP_STATUS.IN_PROGRESS]: TRIP_STATUS.COMPLETED,
};

export const isTripFinished = (status) => status === TRIP_STATUS.COMPLETED || status === TRIP_STATUS.CANCELLED;

// Same values as the registration's vehicle category (RF-06) and pricing.js.
export const TRIP_CATEGORIES = ['economico', 'xl', 'premium'];
// AI-assisted: see docs/AI_LOG.md #55 (card payments go through Mercado Pago)
export const PAYMENT_METHODS = ['card', 'cash'];
export const LEGACY_PAYMENT_METHODS = ['mercadopago'];

export function createPassengerApiError(code, message, cause) {
  const error = new Error(message);
  error.code = code;
  if (cause !== undefined) error.cause = cause;
  return error;
}

export const isPassengerApiError = (value) =>
  value instanceof Error && Object.values(PASSENGER_API_ERROR).includes(value.code);

const isFiniteNumber = (value) => typeof value === 'number' && Number.isFinite(value);

const isPlace = (place) =>
  !!place &&
  isFiniteNumber(place.lat) &&
  isFiniteNumber(place.lng) &&
  Math.abs(place.lat) <= 90 &&
  Math.abs(place.lng) <= 180 &&
  typeof place.address === 'string';

export function isValidTripRequest(request) {
  return (
    !!request &&
    typeof request.id === 'string' &&
    request.id.length > 0 &&
    !!request.passenger &&
    typeof request.passenger.name === 'string' &&
    (request.passenger.rating === undefined || isFiniteNumber(request.passenger.rating)) &&
    isPlace(request.origin) &&
    isPlace(request.destination) &&
    isFiniteNumber(request.distanceKm) &&
    request.distanceKm >= 0 &&
    isFiniteNumber(request.durationMin) &&
    request.durationMin >= 0 &&
    TRIP_CATEGORIES.includes(request.category) &&
    (PAYMENT_METHODS.includes(request.paymentMethod) || LEGACY_PAYMENT_METHODS.includes(request.paymentMethod)) &&
    isFiniteNumber(request.createdAt) &&
    isFiniteNumber(request.expiresAt) &&
    request.expiresAt > request.createdAt
  );
}

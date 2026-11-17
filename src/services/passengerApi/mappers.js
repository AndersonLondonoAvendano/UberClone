// AI-assisted: see AI_LOG.md #42
// AI-assisted: see AI_LOG.md #61
// The ONLY file that knows the real passenger API's shape. The rest of the app sees only the
// internal models of contract.js. ASSUMPTION until the real API arrives: the field names below are
// a guess (a flat JSON close to the internal model, with snake_case alternatives). When the API is
// known, only this file and httpPassengerApi.js change.

import { PASSENGER_API_ERROR, TRIP_STATUS, createPassengerApiError } from './contract';

const toNumber = (value) => (typeof value === 'string' && value.trim() !== '' ? Number(value) : value);

const toTime = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
};

function toPlace(raw = {}) {
  return {
    lat: toNumber(raw.lat ?? raw.latitude),
    lng: toNumber(raw.lng ?? raw.lon ?? raw.longitude),
    address: String(raw.address ?? raw.label ?? ''),
  };
}

// External status names -> internal TripStatus. Unknown names map to undefined (ignored).
const STATUS_FROM_API = {
  accepted: TRIP_STATUS.ACCEPTED,
  driver_arriving: TRIP_STATUS.DRIVER_ARRIVING,
  arriving: TRIP_STATUS.DRIVER_ARRIVING,
  in_progress: TRIP_STATUS.IN_PROGRESS,
  started: TRIP_STATUS.IN_PROGRESS,
  completed: TRIP_STATUS.COMPLETED,
  finished: TRIP_STATUS.COMPLETED,
  cancelled: TRIP_STATUS.CANCELLED,
  canceled: TRIP_STATUS.CANCELLED,
};

// AI-assisted: see AI_LOG.md #55
function toPaymentMethod(value) {
  const method = String(value ?? '').toLowerCase();
  // #59: the contract speaks 'card' | 'cash'; the legacy 'mercadopago' is read as 'card' (gateway still undefined).
  return method === 'mercadopago' ? 'card' : method;
}

// AI-assisted: see AI_LOG.md #61
// Optional feedback fields (D-124): a legacy request without them gives undefined (the key is left out).
function toTip(value) {
  const tip = toNumber(value);
  return Number.isInteger(tip) && tip >= 0 ? tip : undefined;
}

function toRating(value) {
  const rating = toNumber(value);
  return Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : undefined;
}

export function toTripRequest(raw = {}) {
  const passenger = raw.passenger ?? {};
  const createdAt = toTime(raw.createdAt ?? raw.created_at);
  const tip = toTip(raw.tip);
  const rating = toRating(raw.rating ?? raw.driverRating ?? raw.driver_rating);
  return {
    id: String(raw.id ?? raw.requestId ?? raw.request_id ?? ''),
    passenger: {
      name: String(passenger.name ?? raw.passengerName ?? raw.passenger_name ?? ''),
      ...(passenger.rating !== undefined ? { rating: toNumber(passenger.rating) } : {}),
    },
    origin: toPlace(raw.origin ?? raw.pickup),
    destination: toPlace(raw.destination ?? raw.dropoff),
    distanceKm: toNumber(raw.distanceKm ?? raw.distance_km),
    durationMin: toNumber(raw.durationMin ?? raw.duration_min),
    category: String(raw.category ?? '').toLowerCase(),
    // AI-assisted: see AI_LOG.md #55 (legacy "card" is the same as "mercadopago")
    paymentMethod: toPaymentMethod(raw.paymentMethod ?? raw.payment_method),
    ...(tip !== undefined ? { tip } : {}),
    ...(rating !== undefined ? { rating } : {}),
    createdAt,
    expiresAt: toTime(raw.expiresAt ?? raw.expires_at),
  };
}

export function toTrip(raw = {}) {
  const trip = {
    id: String(raw.id ?? raw.tripId ?? raw.trip_id ?? ''),
    request: toTripRequest(raw.request ?? {}),
    status: STATUS_FROM_API[String(raw.status ?? '').toLowerCase()],
    acceptedAt: toTime(raw.acceptedAt ?? raw.accepted_at),
  };
  const pickedUpAt = toTime(raw.pickedUpAt ?? raw.picked_up_at);
  const completedAt = toTime(raw.completedAt ?? raw.completed_at);
  const cancelledAt = toTime(raw.cancelledAt ?? raw.cancelled_at);
  if (pickedUpAt !== undefined) trip.pickedUpAt = pickedUpAt;
  if (completedAt !== undefined) trip.completedAt = completedAt;
  if (cancelledAt !== undefined) trip.cancelledAt = cancelledAt;
  return trip;
}

// Internal TripStatus -> the name the API expects (assumed identical).
export const fromTripStatus = (status) => status;

// Internal position -> request body.
export const fromLocation = ({ lat, lng, timestamp }) => ({ lat, lng, timestamp });

// Any failure (fetch rejection, HTTP response, timeout) -> PassengerApiError.
export function toPassengerApiError(raw) {
  if (raw && typeof raw === 'object' && typeof raw.status === 'number') {
    const { status } = raw;
    if (status === 401 || status === 403) {
      return createPassengerApiError(PASSENGER_API_ERROR.UNAUTHORIZED, 'Sesión no autorizada', raw);
    }
    if (status === 410) return createPassengerApiError(PASSENGER_API_ERROR.EXPIRED, 'La solicitud expiró', raw);
    if (status === 409) {
      return createPassengerApiError(PASSENGER_API_ERROR.ALREADY_TAKEN, 'Otro conductor tomó el viaje', raw);
    }
    if (status === 404 || status === 422) {
      return createPassengerApiError(PASSENGER_API_ERROR.INVALID_STATE, 'Operación no válida', raw);
    }
  }
  return createPassengerApiError(PASSENGER_API_ERROR.NETWORK, 'No hay conexión con el servicio de viajes', raw);
}

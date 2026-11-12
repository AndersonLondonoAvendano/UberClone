// AI-assisted: see docs/AI_LOG.md #42
// AI-assisted: see docs/AI_LOG.md #61
// Simulated passenger API (default adapter). It speaks only the internal contract shape
// (contract.js) and never knows HTTP or the real API's shape. Everything lives in memory.
// - While subscribed it emits one request at a time, every MOCK_EMIT_MIN_MS–MOCK_EMIT_MAX_MS, near
//   the driver's position (given by getDriverPosition). Without a position yet, the tick is skipped.
// - A request expires after MOCK_REQUEST_TTL_MS; after it expires or is rejected the next one is
//   scheduled. After an accept nothing is emitted until the trip is completed or cancelled.
// - Time, timers and randomness are injectable (createMockPassengerApi) so a script can test it.

import {
  MOCK_ADDRESS,
  MOCK_ALREADY_TAKEN_PROBABILITY,
  MOCK_AVERAGE_SPEED_KMH,
  MOCK_DESTINATION_MAX_KM,
  MOCK_DESTINATION_MIN_KM,
  MOCK_EMIT_MAX_MS,
  MOCK_EMIT_MIN_MS,
  MOCK_PICKUP_MAX_KM,
  MOCK_PICKUP_MIN_KM,
  MOCK_REQUEST_TTL_MS,
  MOCK_ROUTE_FACTOR,
} from '../../config/passengerApi';
import { haversineDistanceM } from '../routing/straightLine';
import {
  NEXT_TRIP_STATUS,
  PASSENGER_API_ERROR,
  PAYMENT_METHODS,
  TRIP_CATEGORIES,
  TRIP_STATUS,
  createPassengerApiError,
  isTripFinished,
} from './contract';
import { generateFeedback } from './simulatedFeedback';

// Fictitious passengers (no real people).
const PASSENGER_NAMES = ['Lucía Restrepo', 'Mateo Gil', 'Valentina Ríos', 'Samuel Ortiz', 'Mariana Duque', 'Tomás Vélez'];

const KM_PER_DEGREE_LAT = 111.32;

// The four results of requestNow (dev helper behind SHOW_DEV_TOOLS).
export const REQUEST_NOW_RESULT = {
  EMITTED: 'emitted',
  NOT_SUBSCRIBED: 'not_subscribed',
  NO_POSITION: 'no_position',
  BUSY: 'busy',
};

const isDev = () => typeof __DEV__ !== 'undefined' && __DEV__;
const defaultLog = (...args) => {
  if (isDev()) console.log('[mockPassengerApi]', ...args);
};

const round = (value, decimals) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const isPosition = (position) =>
  !!position && Number.isFinite(position.lat) && Number.isFinite(position.lng);

export function createMockPassengerApi({
  now = () => Date.now(),
  setTimer = (fn, ms) => setTimeout(fn, ms),
  clearTimer = (id) => clearTimeout(id),
  random = Math.random,
  log = defaultLog,
  alreadyTakenProbability = MOCK_ALREADY_TAKEN_PROBABILITY,
} = {}) {
  let subscriber = null; // { onRequest, onError, getDriverPosition }
  let emitTimer = null;
  let pending = null; // { request, expiryTimer }
  let activeTripId = null;
  let sequence = 0;
  const trips = new Map();
  const locations = new Map();

  const between = (min, max) => min + random() * (max - min);
  const pick = (list) => list[Math.min(list.length - 1, Math.floor(random() * list.length))];

  // Moves a point `km` kilometres in a random bearing.
  function offset(point, km) {
    const bearing = random() * 2 * Math.PI;
    const dLat = (km * Math.cos(bearing)) / KM_PER_DEGREE_LAT;
    const dLng = (km * Math.sin(bearing)) / (KM_PER_DEGREE_LAT * Math.cos((point.lat * Math.PI) / 180));
    return { lat: round(point.lat + dLat, 6), lng: round(point.lng + dLng, 6) };
  }

  function buildRequest(driverPosition) {
    const createdAt = now();
    sequence += 1;
    const pickup = offset(driverPosition, between(MOCK_PICKUP_MIN_KM, MOCK_PICKUP_MAX_KM));
    const dropoff = offset(pickup, between(MOCK_DESTINATION_MIN_KM, MOCK_DESTINATION_MAX_KM));
    const straightKm = haversineDistanceM([pickup.lng, pickup.lat], [dropoff.lng, dropoff.lat]) / 1000;
    const distanceKm = round(straightKm * MOCK_ROUTE_FACTOR, 1);
    // D-124: the passenger's tip and rating of the driver; the app only shows them once the trip is completed.
    const { tip, rating } = generateFeedback(random);
    return {
      id: `mock-${createdAt}-${sequence}`,
      passenger: { name: pick(PASSENGER_NAMES), rating: round(between(4, 5), 1) },
      origin: { ...pickup, address: MOCK_ADDRESS },
      destination: { ...dropoff, address: MOCK_ADDRESS },
      distanceKm,
      durationMin: Math.max(1, Math.round((distanceKm / MOCK_AVERAGE_SPEED_KMH) * 60)),
      category: pick(TRIP_CATEGORIES),
      paymentMethod: pick(PAYMENT_METHODS),
      tip,
      rating,
      createdAt,
      expiresAt: createdAt + MOCK_REQUEST_TTL_MS,
    };
  }

  function clearEmitTimer() {
    if (emitTimer !== null) clearTimer(emitTimer);
    emitTimer = null;
  }

  function clearPending() {
    if (pending) clearTimer(pending.expiryTimer);
    pending = null;
  }

  function scheduleNext() {
    clearEmitTimer();
    if (!subscriber || pending || activeTripId) return;
    emitTimer = setTimer(tick, between(MOCK_EMIT_MIN_MS, MOCK_EMIT_MAX_MS));
  }

  // Emits a request now if possible; returns one of REQUEST_NOW_RESULT.
  function emit() {
    if (!subscriber) return REQUEST_NOW_RESULT.NOT_SUBSCRIBED;
    if (pending || activeTripId) return REQUEST_NOW_RESULT.BUSY;
    const position = subscriber.getDriverPosition ? subscriber.getDriverPosition() : null;
    if (!isPosition(position)) return REQUEST_NOW_RESULT.NO_POSITION;
    const request = buildRequest(position);
    const expiryTimer = setTimer(() => {
      if (!pending || pending.request.id !== request.id) return;
      log('request expired', request.id);
      pending = null;
      scheduleNext();
    }, request.expiresAt - request.createdAt);
    pending = { request, expiryTimer };
    log('request emitted', request.id);
    subscriber.onRequest(request);
    return REQUEST_NOW_RESULT.EMITTED;
  }

  function tick() {
    emitTimer = null;
    const result = emit();
    if (result === REQUEST_NOW_RESULT.NO_POSITION) scheduleNext();
  }

  function takePending(requestId) {
    if (!pending || pending.request.id !== requestId) {
      throw createPassengerApiError(PASSENGER_API_ERROR.EXPIRED, 'La solicitud ya no está disponible');
    }
    const { request } = pending;
    clearPending();
    if (now() >= request.expiresAt) {
      scheduleNext();
      throw createPassengerApiError(PASSENGER_API_ERROR.EXPIRED, 'La solicitud venció');
    }
    return request;
  }

  function getTrip(tripId) {
    const trip = trips.get(tripId);
    if (!trip) throw createPassengerApiError(PASSENGER_API_ERROR.INVALID_STATE, 'Viaje desconocido');
    return trip;
  }

  function finishTrip(tripId) {
    if (activeTripId === tripId) activeTripId = null;
    scheduleNext();
  }

  return {
    subscribeToRequests(onRequest, onError, { getDriverPosition } = {}) {
      if (typeof onRequest !== 'function') throw new TypeError('onRequest must be a function');
      const own = { onRequest, onError, getDriverPosition };
      subscriber = own;
      clearPending();
      scheduleNext();
      log('subscribed');
      return () => {
        if (subscriber !== own) return;
        subscriber = null;
        clearEmitTimer();
        clearPending();
        log('unsubscribed');
      };
    },

    // AI-assisted: see docs/AI_LOG.md #44
    // Releases a trip the driver left without its final status reaching the API ("Salir del viaje",
    // or ending the trip after a failure), so new requests flow again. No-op for another trip.
    async releaseTrip(tripId) {
      if (activeTripId !== tripId) return false;
      log('trip released', tripId);
      finishTrip(tripId);
      return true;
    },

    async acceptRequest(requestId) {
      const request = takePending(requestId);
      if (random() < alreadyTakenProbability) {
        log('request already taken', requestId);
        scheduleNext();
        throw createPassengerApiError(PASSENGER_API_ERROR.ALREADY_TAKEN, 'Otro conductor tomó el viaje');
      }
      const trip = { id: request.id, request, status: TRIP_STATUS.ACCEPTED, acceptedAt: now() };
      trips.set(trip.id, trip);
      activeTripId = trip.id;
      log('request accepted', requestId);
      return { ...trip };
    },

    async rejectRequest(requestId) {
      takePending(requestId);
      log('request rejected', requestId);
      scheduleNext();
    },

    async reportTripStatus(tripId, status) {
      const trip = getTrip(tripId);
      if (NEXT_TRIP_STATUS[trip.status] !== status) {
        throw createPassengerApiError(
          PASSENGER_API_ERROR.INVALID_STATE,
          `No se puede pasar de ${trip.status} a ${String(status)}`,
        );
      }
      trip.status = status;
      if (status === TRIP_STATUS.IN_PROGRESS) trip.pickedUpAt = now();
      if (status === TRIP_STATUS.COMPLETED) {
        trip.completedAt = now();
        finishTrip(tripId);
      }
      log('trip status', tripId, status);
      return { ...trip };
    },

    async cancelTrip(tripId) {
      const trip = getTrip(tripId);
      if (isTripFinished(trip.status)) {
        throw createPassengerApiError(PASSENGER_API_ERROR.INVALID_STATE, `El viaje ya terminó (${trip.status})`);
      }
      trip.status = TRIP_STATUS.CANCELLED;
      trip.cancelledAt = now();
      finishTrip(tripId);
      log('trip cancelled', tripId);
      return { ...trip };
    },

    async reportDriverLocation(tripId, location) {
      getTrip(tripId);
      if (!isPosition(location)) {
        throw createPassengerApiError(PASSENGER_API_ERROR.INVALID_STATE, 'Posición inválida');
      }
      locations.set(tripId, { lat: location.lat, lng: location.lng, timestamp: location.timestamp ?? now() });
    },

    // Dev helper (SHOW_DEV_TOOLS): emit a request right away instead of waiting for the timer.
    requestNow() {
      const result = emit();
      if (result === REQUEST_NOW_RESULT.EMITTED) clearEmitTimer();
      return result;
    },
  };
}

// Single in-memory instance used by the app (index.js).
export const mockPassengerApi = createMockPassengerApi();

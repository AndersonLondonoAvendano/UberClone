// AI-assisted: see docs/AI_LOG.md #64
// Turns the text `data` of a "trip_request" push into the app's trip request (T-178, DP-60/DP-77).
// Pure: no React, no Firebase, no clock of its own. Everything in `data` is untrusted text, so each
// field is parsed strictly and anything foreign, malformed or out of range is rejected, never fixed.
// The fare never travels in the message: the card computes it with calculateFare when it opens.
import { MOCK_ADDRESS } from '../../config/passengerApi';
import { effectiveExpiry, isRequestExpired } from '../trip/requestValidity';
import { isValidTripRequest, TRIP_CATEGORIES } from '../passengerApi/contract';
import { toTripRequest } from '../passengerApi/mappers';

export const PUSH_REQUEST_TYPE = 'trip_request';
export const PARSE_REASON = {
  NOT_A_REQUEST: 'not-a-request',
  INVALID: 'invalid',
  EXPIRED: 'expired',
};

const MAX_DISTANCE_KM = 200;
const MAX_DURATION_MIN = 600;
const MAX_ID_LENGTH = 128;
const MAX_NAME_LENGTH = 60;
const DEFAULT_PASSENGER_NAME = 'Pasajero';

// Strict decimal from text: '', ' ', 'abc', '0x10' and '1e1' are rejected (Number() would accept them).
const DECIMAL = /^[+-]?\d+(\.\d+)?$/;
function num(text) {
  if (typeof text !== 'string' || !DECIMAL.test(text)) return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
}

const text = (value) => (typeof value === 'string' && value.length > 0 ? value : null);

function point(latText, lngText) {
  const lat = num(latText);
  const lng = num(lngText);
  if (lat === null || lng === null || lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

// Structure only (no clock): the intent a notification carries. Returns { ok, intent } or { ok: false, reason }.
export function parsePushData(data) {
  if (!data || typeof data !== 'object' || data.type !== PUSH_REQUEST_TYPE) {
    return { ok: false, reason: PARSE_REASON.NOT_A_REQUEST };
  }
  const requestId = text(data.requestId);
  const targetUid = text(data.targetUid);
  const category = typeof data.category === 'string' ? data.category.toLowerCase() : '';
  const expiresAt = num(data.expiresAt);
  const distanceKm = num(data.distanceKm);
  const durationMin = num(data.durationMin);
  const origin = point(data.originLat, data.originLng);
  const destination = point(data.destLat, data.destLng);
  // AI-assisted: see docs/AI_LOG.md #74 (D-207: absent = cash from an old backend; only 'cash'|'card' are valid)
  const rawPayment = data.paymentMethod;
  const paymentMethod = rawPayment === undefined ? 'cash' : rawPayment;
  const valid =
    (paymentMethod === 'cash' || paymentMethod === 'card') &&
    requestId && requestId.length <= MAX_ID_LENGTH &&
    targetUid && targetUid.length <= MAX_ID_LENGTH &&
    TRIP_CATEGORIES.includes(category) &&
    expiresAt !== null && expiresAt > 0 &&
    distanceKm !== null && distanceKm >= 0 && distanceKm <= MAX_DISTANCE_KM &&
    durationMin !== null && durationMin >= 0 && durationMin <= MAX_DURATION_MIN &&
    origin && destination;
  if (!valid) return { ok: false, reason: PARSE_REASON.INVALID };
  const name = typeof data.passengerName === 'string' ? data.passengerName.trim().slice(0, MAX_NAME_LENGTH) : '';
  return {
    ok: true,
    intent: {
      targetUid,
      requestId,
      expiresAt,
      category,
      distanceKm,
      durationMin,
      origin,
      destination,
      passengerName: name || DEFAULT_PASSENGER_NAME,
      paymentMethod,
    },
  };
}

// Intent -> the app's trip request (fictitious passenger, cash, mock addresses that D-125 replaces).
// Returns null if the result does not pass the contract.
export function requestFromIntent(intent, now) {
  if (!intent) return null;
  const request = toTripRequest({
    id: intent.requestId,
    passenger: { name: intent.passengerName ?? DEFAULT_PASSENGER_NAME },
    origin: { ...intent.origin, address: MOCK_ADDRESS },
    destination: { ...intent.destination, address: MOCK_ADDRESS },
    distanceKm: intent.distanceKm,
    durationMin: intent.durationMin,
    category: intent.category,
    paymentMethod: intent.paymentMethod === 'card' ? 'card' : 'cash',
    createdAt: now,
    // AI-assisted: see docs/AI_LOG.md #73 (D-202: a valid request adopted now keeps its full decision window)
    expiresAt: effectiveExpiry(intent.expiresAt, now),
  });
  return isValidTripRequest(request) ? request : null;
}

// Full parse for a message that arrives while the app is open. { ok, request, targetUid } or { ok: false, reason }.
export function parsePushRequest(data, { now }) {
  const parsed = parsePushData(data);
  if (!parsed.ok) return parsed;
  const { intent } = parsed;
  if (isRequestExpired(intent.expiresAt, now)) return { ok: false, reason: PARSE_REASON.EXPIRED };
  const request = requestFromIntent(intent, now);
  if (!request) return { ok: false, reason: PARSE_REASON.INVALID };
  return { ok: true, request, targetUid: intent.targetUid };
}

// RC-01/RC-02: a push request carries the server template's distance and duration. Before it is offered,
// replace them with the real route's (one call through the shared resolver, `resolver.resolve`). If the
// resolver cannot give them, the message values stay and the copy carries `estimated: true` (internal).
// Returns a Promise of a copy; never rejects. The fare is not computed here: the card runs calculateFare.
export async function refineRequestMetrics(request, resolver) {
  if (!request || !request.origin || !request.destination || !resolver || typeof resolver.resolve !== 'function') {
    return request;
  }
  const fallback = { distanceKm: request.distanceKm, durationMin: request.durationMin };
  let metrics;
  try {
    metrics = await resolver.resolve(request.origin, request.destination, fallback);
  } catch {
    metrics = { ...fallback, estimated: true };
  }
  const { estimated: previousEstimate, ...rest } = request;
  const refined = { ...rest, distanceKm: metrics.distanceKm, durationMin: metrics.durationMin };
  if (metrics.estimated) refined.estimated = true;
  return refined;
}

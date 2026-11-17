// AI-assisted: see docs/AI_LOG.md #64
// Pure builders for the simulated trip request sent by the test endpoint and its FCM message.
// No fare, no street addresses and no personal data of a real person travel in the message.
import { randomUUID } from 'node:crypto';
import { FCM_CHANNEL_ID, FCM_REQUEST_TAG, FCM_TTL_MS } from '../config.js';

export const NOTIFICATION_TITLE = 'Nueva solicitud de viaje';
const CATEGORY = 'economico';
const CATEGORY_LABEL = 'Económico';
// Fixed fictional names (never a real person).
const PASSENGER_NAMES = ['Lucía Restrepo', 'Mateo Gil', 'Valentina Ríos', 'Samuel Ortiz', 'Mariana Duque', 'Tomás Vélez'];
// Test zone used by the app (Plaza Botero, Medellín; src/config/routing.js) with small variations.
const ORIGIN = { lat: 6.2523, lng: -75.5683 };
const MAX_JITTER_DEG = 0.004;

const round = (value, digits) => Number(value.toFixed(digits));
const jitter = (random) => (random() * 2 - 1) * MAX_JITTER_DEG;

export function buildTestRequest({ now, idFactory = randomUUID, targetUid, random = Math.random }) {
  const origin = { lat: round(ORIGIN.lat + jitter(random), 6), lng: round(ORIGIN.lng + jitter(random), 6) };
  const destination = {
    lat: round(origin.lat + 0.012 + Math.abs(jitter(random)), 6),
    lng: round(origin.lng + 0.005 + jitter(random), 6),
  };
  return {
    requestId: idFactory(),
    targetUid,
    expiresAt: now + FCM_TTL_MS,
    category: CATEGORY,
    distanceKm: round(2 + random() * 4, 1),
    durationMin: Math.round(5 + random() * 10),
    origin,
    destination,
    passengerName: PASSENGER_NAMES[Math.min(PASSENGER_NAMES.length - 1, Math.floor(random() * PASSENGER_NAMES.length))],
  };
}

// Accepts one token or a list; always returns a multicast message (tokens: [...]). Every data value is a string.
export function buildMessage(tokens, request) {
  const list = Array.isArray(tokens) ? tokens : [tokens];
  const km = Number(request.distanceKm).toFixed(1).replace('.', ',');
  return {
    tokens: list,
    notification: {
      title: NOTIFICATION_TITLE,
      body: `${CATEGORY_LABEL} · ${km} km · ${request.durationMin} min`,
    },
    data: {
      type: 'trip_request',
      requestId: String(request.requestId),
      targetUid: String(request.targetUid),
      expiresAt: String(request.expiresAt),
      category: String(request.category),
      distanceKm: String(request.distanceKm),
      durationMin: String(request.durationMin),
      originLat: String(request.origin.lat),
      originLng: String(request.origin.lng),
      destLat: String(request.destination.lat),
      destLng: String(request.destination.lng),
      passengerName: String(request.passengerName),
    },
    android: {
      priority: 'high',
      // The installed Admin SDK types ttl as a number of milliseconds (it sends it as "90s").
      ttl: FCM_TTL_MS,
      // AI-assisted: see docs/AI_LOG.md #73
      collapseKey: FCM_REQUEST_TAG,
      notification: { channelId: FCM_CHANNEL_ID, tag: FCM_REQUEST_TAG },
    },
  };
}

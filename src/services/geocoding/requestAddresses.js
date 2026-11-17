// AI-assisted: see AI_LOG.md #61
// Background address resolution for a trip request (D-125). The request keeps the placeholder
// address the adapter gave it (MOCK_ADDRESS); this store resolves the real street of its origin and
// destination without blocking anything and keeps the result by request id, so the request card and
// the active trip can show it and the trip record can save it. A place whose address is already
// real (not empty, not the placeholder) is never geocoded. Failures are not cached: they stay as
// "failed" (the placeholder is shown) until retryMissingAddresses runs once, when the trip ends.
// History and detail never come here: they only read what was saved.

import { MOCK_ADDRESS } from '../../config/passengerApi';
import { reverseGeocode as defaultGeocode } from './reverseGeocode';

export const ADDRESS_STATUS = { PENDING: 'pending', RESOLVED: 'resolved', FAILED: 'failed' };

const MAX_ENTRIES = 20;
const PLACES = ['origin', 'destination'];

const entries = new Map(); // requestId -> { origin, destination } each { status, text }
const listeners = new Set();
let geocode = defaultGeocode;

const needsLookup = (place) =>
  Boolean(place) &&
  Number.isFinite(place.lat) &&
  Number.isFinite(place.lng) &&
  (!place.address || place.address === MOCK_ADDRESS);

const notify = () => listeners.forEach((listener) => listener());

function setPlace(requestId, name, value) {
  const entry = entries.get(requestId);
  if (!entry) return;
  entries.set(requestId, { ...entry, [name]: value });
  notify();
}

async function lookup(request, name) {
  const place = request[name];
  const text = await geocode(place.lat, place.lng);
  if (entries.has(request.id)) {
    setPlace(request.id, name, text ? { status: ADDRESS_STATUS.RESOLVED, text } : { status: ADDRESS_STATUS.FAILED, text: null });
  }
  return Boolean(text);
}

// Starts the lookups for a new request. Returns right away; the request id is the key (idempotent).
export function resolveRequestAddresses(request) {
  if (!request?.id || entries.has(request.id)) return;
  const entry = {};
  PLACES.forEach((name) => {
    entry[name] = needsLookup(request[name])
      ? { status: ADDRESS_STATUS.PENDING, text: null }
      : { status: ADDRESS_STATUS.RESOLVED, text: request[name]?.address ?? '' };
  });
  if (entries.size >= MAX_ENTRIES) entries.delete(entries.keys().next().value);
  entries.set(request.id, entry);
  PLACES.forEach((name) => {
    if (entry[name].status === ADDRESS_STATUS.PENDING) lookup(request, name);
  });
}

// One more attempt for the places that failed (used when the trip ends). Never rejects.
export async function retryMissingAddresses(request) {
  const entry = entries.get(request?.id);
  if (!entry) return;
  const failed = PLACES.filter((name) => entry[name].status === ADDRESS_STATUS.FAILED && needsLookup(request[name]));
  failed.forEach((name) => setPlace(request.id, name, { status: ADDRESS_STATUS.PENDING, text: null }));
  await Promise.all(failed.map((name) => lookup(request, name).catch(() => false)));
}

// State of one place: { status, text }. Without an entry the request is shown as it came.
export function addressState(request, name) {
  const entry = entries.get(request?.id)?.[name];
  if (entry) return entry;
  return { status: ADDRESS_STATUS.RESOLVED, text: request?.[name]?.address ?? '' };
}

// The request with every resolved address in place; the rest keep the original text.
export function withResolvedAddresses(request) {
  if (!request) return request;
  const next = { ...request };
  PLACES.forEach((name) => {
    const state = addressState(request, name);
    if (state.status === ADDRESS_STATUS.RESOLVED && state.text && request[name]) {
      next[name] = { ...request[name], address: state.text };
    }
  });
  return next;
}

export function subscribeAddresses(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Test hooks.
export function setGeocoderForTest(fn) {
  geocode = fn ?? defaultGeocode;
}
export function clearAddressesForTest() {
  entries.clear();
}

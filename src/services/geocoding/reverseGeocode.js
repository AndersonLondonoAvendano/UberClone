// AI-assisted: see docs/AI_LOG.md #61
// Reverse geocoding client for Nominatim (D-125). Pure JavaScript with the network, clock and sleep
// injected, so a script tests it without a real request.
// - One serialized queue: at most one request in flight and GEOCODE_MIN_GAP_MS between the end of one
//   and the start of the next (Nominatim policy: max 1 request per second).
// - In-memory cache by coordinate rounded to 4 decimals; only successes are cached, and identical
//   calls in flight share one request.
// - Timeout through AbortController; no retries here (the caller decides whether to ask again).
// - Never throws: any error, timeout, bad status or empty answer gives null.
// - The User-Agent header is set on every request. fetch in React Native (OkHttp on Android,
//   NSURLSession on iOS) accepts a custom User-Agent; this is NOT verified on a device yet.

import {
  GEOCODE_ADDRESS_MAX_LENGTH,
  GEOCODE_CACHE_DECIMALS,
  GEOCODE_CACHE_MAX,
  GEOCODE_MIN_GAP_MS,
  GEOCODE_TIMEOUT_MS,
  NOMINATIM_LANGUAGE,
  NOMINATIM_REVERSE_URL,
  NOMINATIM_USER_AGENT,
  NOMINATIM_ZOOM,
} from '../../config/geocoding';

const clean = (value) => (typeof value === 'string' ? value.trim() : '');
const first = (...values) => values.map(clean).find((value) => value !== '') ?? '';

const clip = (text, max) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);

// Nominatim jsonv2 answer -> short address ("Calle 10 #20-30, Laureles") or null.
// With a road: road + "#" house number, then the first of suburb / neighbourhood / quarter.
// Without a road: the first parts of display_name, trimmed. Pure.
export function formatAddress(data, maxLength = GEOCODE_ADDRESS_MAX_LENGTH) {
  if (!data || typeof data !== 'object' || data.error) return null;
  const parts = data.address && typeof data.address === 'object' ? data.address : {};
  const road = clean(parts.road);
  let text = '';
  if (road) {
    const number = clean(parts.house_number);
    const zone = first(parts.suburb, parts.neighbourhood, parts.quarter, parts.city_district);
    text = [number ? `${road} #${number}` : road, zone].filter(Boolean).join(', ');
  } else {
    const display = clean(data.display_name);
    if (display) {
      text = display
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean)
        .slice(0, 2)
        .join(', ');
    }
  }
  return text ? clip(text, maxLength) : null;
}

const isCoordinate = (lat, lng) =>
  Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;

export function cacheKey(lat, lng, decimals = GEOCODE_CACHE_DECIMALS) {
  return `${lat.toFixed(decimals)},${lng.toFixed(decimals)}`;
}

export function createReverseGeocoder({
  fetchImpl = (...args) => fetch(...args),
  now = () => Date.now(),
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  minGapMs = GEOCODE_MIN_GAP_MS,
  timeoutMs = GEOCODE_TIMEOUT_MS,
  cacheMax = GEOCODE_CACHE_MAX,
} = {}) {
  const cache = new Map(); // key -> address (successes only)
  const inFlight = new Map(); // key -> Promise<string | null>
  let tail = Promise.resolve(); // serialized queue
  let lastEndedAt = null;

  async function requestOnce(lat, lng) {
    const query = new URLSearchParams({
      format: 'jsonv2',
      'accept-language': NOMINATIM_LANGUAGE,
      zoom: String(NOMINATIM_ZOOM),
      lat: String(lat),
      lon: String(lng),
    });
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(`${NOMINATIM_REVERSE_URL}?${query.toString()}`, {
        method: 'GET',
        headers: { 'User-Agent': NOMINATIM_USER_AGENT, Accept: 'application/json' },
        signal: controller.signal,
      });
      if (!response || !response.ok) return null;
      return formatAddress(await response.json());
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  // Waits for the gap, runs the request and records when it ended.
  async function runQueued(lat, lng) {
    try {
      if (lastEndedAt !== null) {
        const wait = lastEndedAt + minGapMs - now();
        if (wait > 0) await sleep(wait);
      }
      return await requestOnce(lat, lng);
    } catch {
      return null;
    } finally {
      lastEndedAt = now();
    }
  }

  function remember(key, address) {
    if (cache.size >= cacheMax) cache.delete(cache.keys().next().value);
    cache.set(key, address);
  }

  // Resolves to the short address or null. Never rejects.
  function reverseGeocode(lat, lng) {
    if (!isCoordinate(lat, lng)) return Promise.resolve(null);
    const key = cacheKey(lat, lng);
    if (cache.has(key)) return Promise.resolve(cache.get(key));
    if (inFlight.has(key)) return inFlight.get(key);
    const job = tail.then(() => runQueued(lat, lng)).then((address) => {
      if (address) remember(key, address);
      return address;
    });
    tail = job.then(
      () => {},
      () => {},
    );
    const tracked = job.finally(() => inFlight.delete(key));
    inFlight.set(key, tracked);
    return tracked;
  }

  return { reverseGeocode, clearCache: () => cache.clear() };
}

// Single instance used by the app.
const shared = createReverseGeocoder();
export const reverseGeocode = shared.reverseGeocode;

// Distance and duration of a trip request from ONE OSRM call per origin/destination pair (RC-01..RC-03).
// - Bounded cache keyed by the pair rounded to 5 decimals (oldest entry leaves first).
// - A call already in flight for the same pair is shared, so two simultaneous requests make one call.
// - If OSRM fails, answers something invalid or exceeds the timeout, the caller's fallback is returned
//   with `estimated: true` (internal flag only, never shown). resolve() never rejects.
// - Fetch and timers are injectable so a script can test it without network or real time.
// The fare is NOT computed here: callers run calculateFare once, on the final values.

import { ROUTE_METRICS_TIMEOUT_MS } from '../../config/routing';
import { fetchOsrmRoute } from './osrmRouting';

export const ROUTE_METRICS_CACHE_MAX = 50;
const KEY_DECIMALS = 5;

const isCoordinate = (point) => !!point && Number.isFinite(point.lat) && Number.isFinite(point.lng);
const isPositive = (value) => typeof value === 'number' && Number.isFinite(value) && value > 0;
const keyPart = (value) => value.toFixed(KEY_DECIMALS);
const keyOf = (origin, destination) =>
  `${keyPart(origin.lat)},${keyPart(origin.lng)};${keyPart(destination.lat)},${keyPart(destination.lng)}`;

// OSRM route -> { distanceKm, durationMin } or null when the route is not usable (0 m, 0 s, NaN...).
function toMetrics(route) {
  if (!route || !isPositive(route.distanceM) || !isPositive(route.durationS)) return null;
  return {
    distanceKm: Math.round((route.distanceM / 1000) * 10) / 10,
    durationMin: Math.max(1, Math.round(route.durationS / 60)),
  };
}

export function createRouteMetrics({
  fetchRoute = fetchOsrmRoute, // (from [lng, lat], to [lng, lat], { timeoutMs }) => Promise<{ distanceM, durationS }>
  timeoutMs = ROUTE_METRICS_TIMEOUT_MS,
  cacheMax = ROUTE_METRICS_CACHE_MAX,
  setTimer = (fn, ms) => setTimeout(fn, ms),
  clearTimer = (id) => clearTimeout(id),
} = {}) {
  const cache = new Map();
  const inFlight = new Map();

  function remember(key, metrics) {
    cache.delete(key);
    cache.set(key, metrics);
    while (cache.size > cacheMax) cache.delete(cache.keys().next().value);
  }

  // The OSRM call itself: resolves to metrics or null, never rejects; a valid answer is cached even
  // if it arrives after the timeout, so a later request for the same pair gets it for free.
  async function query(key, origin, destination) {
    try {
      const route = await fetchRoute([origin.lng, origin.lat], [destination.lng, destination.lat], { timeoutMs });
      const metrics = toMetrics(route);
      if (metrics) remember(key, metrics);
      return metrics;
    } catch {
      return null;
    }
  }

  return {
    // origin/destination: { lat, lng }; fallback: { distanceKm, durationMin }.
    // Resolves to { distanceKm, durationMin, estimated }.
    resolve(origin, destination, fallback) {
      const estimatedResult = () => ({
        distanceKm: fallback.distanceKm,
        durationMin: fallback.durationMin,
        estimated: true,
      });
      if (!isCoordinate(origin) || !isCoordinate(destination)) return Promise.resolve(estimatedResult());

      const key = keyOf(origin, destination);
      const cached = cache.get(key);
      if (cached) return Promise.resolve({ ...cached, estimated: false });
      const shared = inFlight.get(key);
      if (shared) return shared;

      const promise = new Promise((done) => {
        let finished = false;
        let timerId = null;
        const finish = (metrics) => {
          if (finished) return;
          finished = true;
          if (timerId !== null) clearTimer(timerId);
          inFlight.delete(key);
          done(metrics ? { ...metrics, estimated: false } : estimatedResult());
        };
        timerId = setTimer(() => finish(null), timeoutMs);
        query(key, origin, destination).then(finish);
      });
      inFlight.set(key, promise);
      return promise;
    },
    cacheSize: () => cache.size,
  };
}

// One shared instance for the app, so the mock and the push flow reuse the same cache.
let sharedInstance = null;
export function getRouteMetrics() {
  if (!sharedInstance) sharedInstance = createRouteMetrics();
  return sharedInstance;
}

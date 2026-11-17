// AI-assisted: see AI_LOG.md #41
// Routing entry point. Screens call getRoute and never build routing URLs themselves.
// Order: OSRM; on failure, only when allowFallback is true, the preloaded route for the fixed test
// points and then the straight line. Without fallback a failure rejects with code ROUTE_FAILED.
// Result: { coordinates: [lng, lat][], distanceM, durationS, provider: 'osrm' | 'fallback' | 'straight' }.

import { getPreloadedRoute } from './fallbackRoute';
import { fetchOsrmRoute } from './osrmRouting';
import { buildStraightLineRoute } from './straightLine';

export const ROUTE_FAILED = 'ROUTE_FAILED';
export const INVALID_ROUTE_POINTS = 'INVALID_ROUTE_POINTS';

const isLngLat = (point) =>
  Array.isArray(point) &&
  point.length === 2 &&
  point.every((value) => typeof value === 'number' && Number.isFinite(value)) &&
  Math.abs(point[0]) <= 180 &&
  Math.abs(point[1]) <= 90;

function routingError(code, message, cause) {
  const error = new Error(message);
  error.code = code;
  if (cause) error.cause = cause;
  return error;
}

export async function getRoute(from, to, { allowFallback = false } = {}) {
  if (!isLngLat(from) || !isLngLat(to)) {
    throw routingError(INVALID_ROUTE_POINTS, 'getRoute expects two [lng, lat] number pairs');
  }
  try {
    return await fetchOsrmRoute(from, to);
  } catch (cause) {
    if (!allowFallback) throw routingError(ROUTE_FAILED, 'Route request failed', cause);
    return getPreloadedRoute(from, to) ?? buildStraightLineRoute(from, to);
  }
}

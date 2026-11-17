// AI-assisted: see AI_LOG.md #41
// OSRM adapter: one request per call (never in a loop), aborted after ROUTE_TIMEOUT_MS.
// With geometries=geojson the response already carries [lng, lat] pairs, so nothing is decoded.

import { OSRM_BASE_URL, ROUTE_TIMEOUT_MS } from '../../config/routing';

export async function fetchOsrmRoute(from, to, { timeoutMs = ROUTE_TIMEOUT_MS } = {}) {
  const [fromLng, fromLat] = from;
  const [toLng, toLat] = to;
  const url =
    `${OSRM_BASE_URL}/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}` +
    '?overview=full&geometries=geojson';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`OSRM HTTP ${response.status}`);
    const body = await response.json();
    const route = body && body.code === 'Ok' && Array.isArray(body.routes) ? body.routes[0] : null;
    const coordinates = route && route.geometry ? route.geometry.coordinates : null;
    if (!Array.isArray(coordinates) || coordinates.length < 2) {
      throw new Error(`OSRM returned no route (${body && body.code})`);
    }
    return {
      coordinates,
      distanceM: route.distance,
      durationS: route.duration,
      provider: 'osrm',
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

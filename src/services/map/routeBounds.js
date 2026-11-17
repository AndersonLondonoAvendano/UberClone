// AI-assisted: see AI_LOG.md #57 (T-110)
// Pure framing of a saved route for the read-only detail map. No React, no network. The route is the
// [{ lat, lng }] list validated by tripDetailView; MapLibre wants [lng, lat] pairs and bounds as
// [west, south, east, north].

import { MIN_BOUNDS_SPAN_DEG } from '../../config/map';

const isCoordinate = (point) =>
  !!point && Number.isFinite(point.lat) && Number.isFinite(point.lng);

// [[lng, lat], ...] or null when the route has fewer than two valid points.
export function routeToCoordinates(route) {
  if (!Array.isArray(route) || route.length < 2 || !route.every(isCoordinate)) return null;
  return route.map((point) => [point.lng, point.lat]);
}

// [west, south, east, north] around the route, widened to MIN_BOUNDS_SPAN_DEG on each axis; null for an
// unusable route.
export function routeBounds(route) {
  const coordinates = routeToCoordinates(route);
  if (!coordinates) return null;
  const lngs = coordinates.map(([lng]) => lng);
  const lats = coordinates.map(([, lat]) => lat);
  let west = Math.min(...lngs);
  let east = Math.max(...lngs);
  let south = Math.min(...lats);
  let north = Math.max(...lats);
  if (east - west < MIN_BOUNDS_SPAN_DEG) {
    const mid = (east + west) / 2;
    west = mid - MIN_BOUNDS_SPAN_DEG / 2;
    east = mid + MIN_BOUNDS_SPAN_DEG / 2;
  }
  if (north - south < MIN_BOUNDS_SPAN_DEG) {
    const mid = (north + south) / 2;
    south = mid - MIN_BOUNDS_SPAN_DEG / 2;
    north = mid + MIN_BOUNDS_SPAN_DEG / 2;
  }
  return [west, south, east, north];
}

// AI-assisted: see docs/AI_LOG.md #41
// Last-resort local route, no network: N points interpolated between from and to. It does not follow
// the streets, so the screen must label it as an approximate route.

import { STRAIGHT_LINE_POINTS, STRAIGHT_LINE_SPEED_KMH } from '../../config/routing';

const EARTH_RADIUS_M = 6371000;

const toRadians = (degrees) => (degrees * Math.PI) / 180;

// Great-circle distance in meters between two [lng, lat] points.
export function haversineDistanceM(from, to) {
  const [fromLng, fromLat] = from;
  const [toLng, toLat] = to;
  const dLat = toRadians(toLat - fromLat);
  const dLng = toRadians(toLng - fromLng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(fromLat)) * Math.cos(toRadians(toLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function buildStraightLineRoute(from, to, points = STRAIGHT_LINE_POINTS) {
  const count = Math.max(2, Math.round(points));
  const coordinates = [];
  for (let i = 0; i < count; i += 1) {
    const t = i / (count - 1);
    coordinates.push([from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t]);
  }
  const distanceM = Math.round(haversineDistanceM(from, to));
  const metersPerSecond = (STRAIGHT_LINE_SPEED_KMH * 1000) / 3600;
  return {
    coordinates,
    distanceM,
    durationS: Math.round(distanceM / metersPerSecond),
    provider: 'straight',
  };
}

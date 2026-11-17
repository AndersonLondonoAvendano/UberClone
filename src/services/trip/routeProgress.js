// AI-assisted: see AI_LOG.md #43
// Pure helpers for the trip in progress (T-44): progress along a route polyline ([lng, lat][]),
// remaining distance and time, arrival by distance threshold and the report throttle.
// Positions are { lat, lng, timestamp }.

import { haversineDistanceM } from '../routing/straightLine';

const toPoint = (position) => [position.lng, position.lat];

// Closest point of the polyline to `position`: segment index, the point and the meters along the
// route up to it. Uses a local flat projection per segment (fine at street scale).
export function projectOnRoute(coordinates, position) {
  const target = toPoint(position);
  let best = { index: 0, point: coordinates[0], alongM: 0, offsetM: Infinity };
  let travelled = 0;
  if (coordinates.length === 1) {
    return { ...best, offsetM: haversineDistanceM(coordinates[0], target) };
  }
  for (let i = 1; i < coordinates.length; i += 1) {
    const a = coordinates[i - 1];
    const b = coordinates[i];
    const segmentM = haversineDistanceM(a, b);
    const kx = Math.cos((a[1] * Math.PI) / 180);
    const dx = (b[0] - a[0]) * kx;
    const dy = b[1] - a[1];
    const px = (target[0] - a[0]) * kx;
    const py = target[1] - a[1];
    const lengthSq = dx * dx + dy * dy;
    const t = lengthSq > 0 ? Math.max(0, Math.min(1, (px * dx + py * dy) / lengthSq)) : 0;
    const point = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    const offsetM = haversineDistanceM(point, target);
    if (offsetM < best.offsetM) best = { index: i - 1, point, alongM: travelled + segmentM * t, offsetM };
    travelled += segmentM;
  }
  return best;
}

export function routeLengthM(coordinates) {
  let total = 0;
  for (let i = 1; i < coordinates.length; i += 1) total += haversineDistanceM(coordinates[i - 1], coordinates[i]);
  return total;
}

// Remaining meters and seconds from `position` to the end of the route. The time keeps the speed
// of the route estimate (durationS / distanceM).
export function remainingOnRoute(route, position) {
  const totalM = routeLengthM(route.coordinates);
  const { alongM, offsetM } = projectOnRoute(route.coordinates, position);
  const remainingM = Math.max(0, totalM - alongM);
  const secondsPerMeter = route.distanceM > 0 ? route.durationS / route.distanceM : 0;
  return { remainingM, remainingS: remainingM * secondsPerMeter, offsetM };
}

// The rest of the route from `position` on: the simulated source resumes from here after a pause.
export function remainingPath(coordinates, position) {
  const { index, point } = projectOnRoute(coordinates, position);
  return [point, ...coordinates.slice(index + 1)];
}

export const hasArrived = (position, target, thresholdM) =>
  !!position && !!target && haversineDistanceM(toPoint(position), toPoint(target)) <= thresholdM;

// Report throttle: the first position always; afterwards only when BOTH enough time passed and the
// driver moved enough (at most one report every minIntervalMs, none while standing still).
export function shouldReportLocation(last, next, { minIntervalMs, minDistanceM }) {
  if (!next) return false;
  if (!last) return true;
  if (next.timestamp - last.timestamp < minIntervalMs) return false;
  return haversineDistanceM(toPoint(last), toPoint(next)) >= minDistanceM;
}

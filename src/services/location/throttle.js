// AI-assisted: see docs/AI_LOG.md #42
// Pure throttle rule for driver positions: publish the next one when there is no previous one, or
// when enough time OR enough distance has passed. Positions are { lat, lng, timestamp }.

import { haversineDistanceM } from '../routing/straightLine';

export function shouldEmitPosition(last, next, { minIntervalMs, minDistanceM }) {
  if (!next) return false;
  if (!last) return true;
  if (next.timestamp - last.timestamp >= minIntervalMs) return true;
  return haversineDistanceM([last.lng, last.lat], [next.lng, next.lat]) >= minDistanceM;
}

// AI-assisted: see AI_LOG.md #55
// Pure simplification of the planned route saved with the trip (T-92, RF-52). It keeps the
// planned route only: no real driver position is ever stored. Input points are [lat, lng] pairs or
// { lat, lng } objects; the output is at most maxPoints [lat, lng] pairs with 4 decimals, first and
// last point kept. Invalid coordinates are dropped; null means "no usable route" (fewer than two
// valid points), and the caller saves the trip without a route.

export const ROUTE_MAX_POINTS = 40;
export const ROUTE_DECIMALS = 4;

const isCoordinate = (value, limit) => typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= limit;

function readPoint(point) {
  let lat;
  let lng;
  if (Array.isArray(point)) [lat, lng] = point;
  else if (point && typeof point === 'object') ({ lat, lng } = point);
  if (!isCoordinate(lat, 90) || !isCoordinate(lng, 180)) return null;
  const factor = 10 ** ROUTE_DECIMALS;
  // + 0 turns -0 into 0 so a rounded point never serializes as "-0".
  return [Math.round(lat * factor) / factor + 0, Math.round(lng * factor) / factor + 0];
}

export function simplifyRoute(points, maxPoints = ROUTE_MAX_POINTS) {
  if (!Array.isArray(points)) return null;
  const valid = [];
  for (const point of points) {
    const read = readPoint(point);
    if (read) valid.push(read);
  }
  if (valid.length < 2) return null;
  const limit = Math.max(2, Math.min(ROUTE_MAX_POINTS, Math.floor(Number(maxPoints)) || ROUTE_MAX_POINTS));
  if (valid.length <= limit) return valid;
  const last = valid.length - 1;
  const result = [];
  for (let index = 0; index < limit; index += 1) {
    result.push(valid[Math.round((index * last) / (limit - 1))]);
  }
  return result;
}

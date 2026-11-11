// AI-assisted: see docs/AI_LOG.md #42
// Simulated location source (T-41): walks a polyline ([lng, lat][]) at a constant speed, emitting
// one interpolated point every tickMs, then the last point, then onEnd. Without coordinates it uses
// the routing module (T-36, unchanged) between the fixed test points. Same interface as the GPS
// source; permission is always 'granted'. Timers are injectable so a script can test it.

import { SIMULATED_SPEED_KMH, SIMULATED_TICK_MS } from '../../config/location';
import { TEST_ROUTE_FROM, TEST_ROUTE_TO } from '../../config/routing';
import { getRoute } from '../routing';
import { haversineDistanceM } from '../routing/straightLine';

// Cumulative distance, in meters, at each vertex of the polyline.
function cumulativeDistances(coordinates) {
  const result = [0];
  for (let i = 1; i < coordinates.length; i += 1) {
    result.push(result[i - 1] + haversineDistanceM(coordinates[i - 1], coordinates[i]));
  }
  return result;
}

// Point at `distanceM` meters along the polyline (clamped to its ends).
export function pointAlong(coordinates, cumulative, distanceM) {
  const total = cumulative[cumulative.length - 1];
  if (distanceM <= 0 || coordinates.length === 1) return coordinates[0];
  if (distanceM >= total) return coordinates[coordinates.length - 1];
  let i = 1;
  while (cumulative[i] < distanceM) i += 1;
  const segment = cumulative[i] - cumulative[i - 1];
  const t = segment > 0 ? (distanceM - cumulative[i - 1]) / segment : 0;
  const [lng0, lat0] = coordinates[i - 1];
  const [lng1, lat1] = coordinates[i];
  return [lng0 + (lng1 - lng0) * t, lat0 + (lat1 - lat0) * t];
}

export function createSimulatedLocationSource({
  coordinates,
  speedKmh = SIMULATED_SPEED_KMH,
  tickMs = SIMULATED_TICK_MS,
  now = () => Date.now(),
  setIntervalFn = (fn, ms) => setInterval(fn, ms),
  clearIntervalFn = (id) => clearInterval(id),
  loadRoute = () => getRoute(TEST_ROUTE_FROM, TEST_ROUTE_TO, { allowFallback: true }),
} = {}) {
  return {
    async requestPermission() {
      return 'granted';
    },

    start({ onPosition, onError, onEnd } = {}) {
      let cancelled = false;
      let interval = null;
      const stop = () => {
        cancelled = true;
        if (interval !== null) clearIntervalFn(interval);
        interval = null;
      };

      const walk = (path) => {
        if (cancelled) return;
        if (!Array.isArray(path) || path.length === 0) {
          if (onError) onError(new Error('Simulated route has no points'));
          return;
        }
        const cumulative = cumulativeDistances(path);
        const total = cumulative[cumulative.length - 1];
        const stepM = (speedKmh * 1000 * tickMs) / 3600000;
        let travelled = 0;
        const emit = () => {
          const [lng, lat] = pointAlong(path, cumulative, travelled);
          if (onPosition) onPosition({ lat, lng, timestamp: now() });
        };
        emit();
        if (total === 0 || stepM <= 0) {
          stop();
          if (onEnd) onEnd();
          return;
        }
        interval = setIntervalFn(() => {
          if (cancelled) return;
          travelled = Math.min(total, travelled + stepM);
          emit();
          if (travelled >= total) {
            stop();
            if (onEnd) onEnd();
          }
        }, tickMs);
      };

      if (coordinates) {
        walk(coordinates);
      } else {
        loadRoute()
          .then((route) => walk(route.coordinates))
          .catch((error) => {
            if (!cancelled && onError) onError(error);
          });
      }
      return stop;
    },
  };
}

// AI-assisted: see AI_LOG.md #66
// Shared fake dependencies for the trip controller tests (not a test file: no .test suffix).
const { createTripController } = await import('../../src/services/trip/tripController.js');

export const CONFIG = {
  ROUTE_MAX_ATTEMPTS: 1, ROUTE_RETRY_DELAY_MS: 0, REPORT_MAX_ATTEMPTS: 1, REPORT_RETRY_DELAY_MS: 0,
  REPORT_ATTEMPT_TIMEOUT_MS: 50, FINISH_TIMEOUT_MS: 100, ARRIVAL_THRESHOLD_M: 1,
  REPORT_MIN_INTERVAL_MS: 5000, REPORT_MIN_DISTANCE_M: 20,
};

const request = {
  id: 'r1',
  passenger: { name: 'Ana' },
  origin: { lat: 4.6, lng: -74.08, address: 'Origen' },
  destination: { lat: 4.7, lng: -74.1, address: 'Destino' },
};
const lngLat = [[-74.08, 4.6], [-74.09, 4.65], [-74.1, 4.7]];

// The location source never moves by itself: `handlers` lets a test emit a position or the end.
export function makeController({ cancelFails = false } = {}) {
  const calls = { reports: [], cancels: 0 };
  const handlers = {};
  const controller = createTripController({
    trip: { id: 't1', request },
    startPosition: { lat: 4.5, lng: -74.0 },
    api: {
      reportTripStatus: async (_id, status) => { calls.reports.push(status); return {}; },
      cancelTrip: async () => {
        calls.cancels += 1;
        if (cancelFails) throw new Error('offline');
        return {};
      },
      reportDriverLocation: async () => {},
    },
    getRoute: async () => ({ coordinates: lngLat, distanceM: 5000, durationS: 600, provider: 'osrm' }),
    buildStraightLineRoute: () => ({ coordinates: lngLat, distanceM: 1, durationS: 1, provider: 'straight' }),
    createLocationSource: () => ({ start: (h) => { Object.assign(handlers, h); return () => {}; } }),
    config: CONFIG,
  });
  return { controller, calls, handlers };
}

export const settle = () => new Promise((resolve) => setTimeout(resolve, 10));

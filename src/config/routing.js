// AI-assisted: see docs/AI_LOG.md #41
// Routing constants. Public values (no keys): the OSRM demo server needs no account.
// Every coordinate in the routing module is [lng, lat], the GeoJSON and MapLibre order.

// OSRM public demo server. Usage policy: at most one request per second, so the app asks for one
// route per trip leg, never one per position update.
export const OSRM_BASE_URL = 'https://router.project-osrm.org';

// Maximum wait for one OSRM request before it is aborted and treated as a failure.
export const ROUTE_TIMEOUT_MS = 8000;

// Number of points of the straight-line last-resort route (both ends included).
export const STRAIGHT_LINE_POINTS = 20;

// Average speed used to estimate the duration of the straight-line route.
export const STRAIGHT_LINE_SPEED_KMH = 30;

// Fixed test points (Medellín) used by the map test screen and by the preloaded fallback route.
export const TEST_ROUTE_FROM = [-75.5683, 6.2523]; // Plaza Botero
export const TEST_ROUTE_TO = [-75.5655, 6.2696]; // Parque de los Deseos

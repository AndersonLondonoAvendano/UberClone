// AI-assisted: see docs/AI_LOG.md #43
// Trip constants (T-43 to T-45). Public values only (no keys).

// Where the driver position comes from during a trip: 'simulated' walks the route of each leg
// (pickup, then destination) so the whole flow can be shown without driving; 'gps' uses the phone.
export const TRIP_LOCATION_SOURCE = 'simulated';

// The simulated trip moves at SIMULATED_SPEED_KMH (src/config/location.js) times this factor, so a
// demo trip takes about a minute per leg instead of several. 1 = real speed.
export const TRIP_SPEED_FACTOR = 4;

// The driver "arrived" (pickup or destination) when closer than this to the target point.
export const ARRIVAL_THRESHOLD_M = 25;

// OSRM attempts per leg before the screen falls back to a straight line labeled "Ruta aproximada".
export const ROUTE_MAX_ATTEMPTS = 3;
export const ROUTE_RETRY_DELAY_MS = 1500;

// reportTripStatus attempts before the screen shows the network notice with a retry button.
export const REPORT_MAX_ATTEMPTS = 3;
export const REPORT_RETRY_DELAY_MS = 2000;

// reportDriverLocation (and the optional Firestore document) at most every 5 s and only after
// moving 20 m since the last report.
export const REPORT_MIN_INTERVAL_MS = 5000;
export const REPORT_MIN_DISTANCE_M = 20;

// Optional: also write the driver position to Firestore driverLocations/{uid} (set + merge).
// Failures are silent and never block the trip. Needs the driverLocations Firestore rule published.
export const PUBLISH_DRIVER_LOCATION = true;
export const PUBLISH_MAX_ATTEMPTS = 2;

// How long the request card shows "La solicitud venció" before going back to Home.
export const EXPIRED_NOTICE_MS = 2500;

// AI-assisted: see docs/AI_LOG.md #44
// Each reportTripStatus or cancelTrip attempt gives up after this long (offline requests may never
// settle by themselves), and "Finalizar viaje" waits at most FINISH_TIMEOUT_MS before showing the
// error with "Reintentar" and "Salir del viaje".
export const REPORT_ATTEMPT_TIMEOUT_MS = 6_000;
export const FINISH_TIMEOUT_MS = 15000;

// Final status (completed, cancelled) and the idle value written to driverLocations: this many
// attempts, each with its own timeout. They skip the position throttle and never block the screen.
export const PUBLISH_STATUS_MAX_ATTEMPTS = 3;
export const PUBLISH_STATUS_RETRY_DELAY_MS = 1500;
export const PUBLISH_WRITE_TIMEOUT_MS = 8000;

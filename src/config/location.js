// AI-assisted: see docs/AI_LOG.md #42
// Driver location constants (T-41). LOCATION_SOURCE picks the source once, at load time:
// 'gps' reads the phone (expo-location, foreground only); 'simulated' walks a route polyline.

export const LOCATION_SOURCE = 'gps'; // 'gps' | 'simulated'

// GPS: minimum movement, in meters, before expo-location reports a new position.
export const GPS_DISTANCE_INTERVAL_M = 10;

// Simulated source: speed along the polyline and time between emitted points.
export const SIMULATED_SPEED_KMH = 30;
export const SIMULATED_TICK_MS = 1000;

// useDriverLocation publishes a new position only when at least one of these has passed since the
// last published one (so screens and the API are not flooded).
export const LOCATION_THROTTLE_MS = 5000;
export const LOCATION_THROTTLE_M = 20;

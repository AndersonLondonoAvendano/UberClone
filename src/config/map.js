// AI-assisted: see docs/AI_LOG.md #41
// Map constants. OpenFreeMap styles are public (no key, no account), so they live here and not in
// environment variables. The attribution text shown on screen lives in labels.mapTest.attribution.

export const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';
export const MAP_STYLE_URL_ALT = 'https://tiles.openfreemap.org/styles/positron';

// Zoom used when the camera centers on the driver.
export const DRIVER_ZOOM = 15;

// Camera animation length, in milliseconds.
export const CAMERA_ANIMATION_MS = 600;

// Map layer sizes, in points (map paint values, not layout spacing).
export const ROUTE_LINE_WIDTH = 5;
export const DRIVER_DOT_RADIUS = 8;
export const DRIVER_DOT_STROKE_WIDTH = 3;

// Minimum movement, in meters, before expo-location reports a new driver position.
export const DRIVER_MIN_DISTANCE_M = 5;

// AI-assisted: see AI_LOG.md #41
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

// Home map camera (H-1). Neighborhood zoom used when the camera centers on the first driver fix and
// on the "My location" button.
export const NEIGHBORHOOD_ZOOM = 15;

// Framing of Colombia shown before the first position arrives (center is [lng, lat]).
export const COLOMBIA_CENTER = [-74.3, 4.6];
export const COLOMBIA_ZOOM = 4.5;

// Camera animation length with "reduce motion" on: jump without animation.
export const REDUCED_MOTION_DURATION_MS = 0;

// AI-assisted: see AI_LOG.md #57 (T-110)
// Trip detail map (read-only): frame height in points, padding in points around the framed route, and
// the smallest bounds span in degrees (about 100 m) so a route of two almost equal points still frames.
export const DETAIL_MAP_HEIGHT = 240;
export const ROUTE_FIT_PADDING = 32;
export const MIN_BOUNDS_SPAN_DEG = 0.001;

// AI-assisted: see AI_LOG.md #61
// Reverse geocoding (D-125): public Nominatim service (OpenStreetMap). No key, no secret. Its usage
// policy asks for at most 1 request per second and an identifying User-Agent, so the client keeps a
// gap above that between requests (see docs/seguridad.md, "Geocodificación (Nominatim)").

export const NOMINATIM_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';
export const NOMINATIM_USER_AGENT = 'UberCloneConductor-ProyectoDeClase/1.0';
export const NOMINATIM_LANGUAGE = 'es';
export const NOMINATIM_ZOOM = 18;

// Gap between the end of one request and the start of the next (policy: max 1 per second).
export const GEOCODE_MIN_GAP_MS = 1100;
export const GEOCODE_TIMEOUT_MS = 4000;

// Coordinates are rounded to this many decimals for the cache key (about 11 m).
export const GEOCODE_CACHE_DECIMALS = 4;
export const GEOCODE_CACHE_MAX = 100;

// Saved labels allow 200 characters (Firestore rule); the short address stays well under that.
export const GEOCODE_ADDRESS_MAX_LENGTH = 120;

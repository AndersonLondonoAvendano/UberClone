// AI-assisted: see AI_LOG.md #42
// Passenger API configuration. PASSENGER_API_MODE is a constant in code, not an environment
// variable or a secret: it changes to 'http' the day the real API arrives. The http adapter reads
// its base URL from EXPO_PUBLIC_PASSENGER_API_URL (only the variable name is documented).

export const PASSENGER_API_MODE = 'mock'; // 'mock' | 'http'

// http adapter request timeout.
export const PASSENGER_API_TIMEOUT_MS = 8000;

// Mock: one request at a time, emitted every 10–20 s while the driver is available.
export const MOCK_EMIT_MIN_MS = 10000;
export const MOCK_EMIT_MAX_MS = 20000;

// Mock: a request expires about 30 s after it is created (prompt #42; RF-11's 15 s countdown is
// decided by the request card, T-43).
export const MOCK_REQUEST_TTL_MS = 30000;

// Decision window (D-137): the driver has 15 s to accept or reject, counted from the moment the
// request is first shown (not from its creation). The request validity (expiresAt) is a separate,
// longer limit and still caps the window.
export const REQUEST_DECISION_WINDOW_MS = 15000;

// Mock: pickup 0.8–2 km from the driver, destination 2–6 km from the pickup (prompt #42).
export const MOCK_PICKUP_MIN_KM = 0.8;
export const MOCK_PICKUP_MAX_KM = 2;
export const MOCK_DESTINATION_MIN_KM = 2;
export const MOCK_DESTINATION_MAX_KM = 6;

// Mock: trip distance = straight line x factor; duration at an average urban speed.
export const MOCK_ROUTE_FACTOR = 1.3;
export const MOCK_AVERAGE_SPEED_KMH = 25;

// Mock: low probability that another driver "takes" the request when it is accepted.
export const MOCK_ALREADY_TAKEN_PROBABILITY = 0.1;

// AI-assisted: see AI_LOG.md #73 (T-293, D-203)
// Purpose: the simulated "another driver took it" only makes sense after a real decision. It is never
// simulated for a request adopted from a push, and for a simulator request only when the driver accepts at
// least this long after it was emitted (never on a first load or a quick tap).
export const MOCK_TAKEN_MIN_DECISION_MS = 5000;

// Mock: generic address (reverse geocoding is out of scope).
export const MOCK_ADDRESS = 'Calle cercana (simulada)';

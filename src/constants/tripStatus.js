// AI-assisted: see docs/AI_LOG.md #42
// AI-assisted: see docs/AI_LOG.md #43
// Trip states (RF-13): the only place where the status strings are written. Everything else,
// including the passenger API contract and its adapters, reads them from here.

export const TRIP_STATUS = {
  ACCEPTED: 'accepted',
  DRIVER_ARRIVING: 'driver_arriving',
  // The driver reached the pickup point and waits for the passenger (T-44).
  DRIVER_ARRIVED: 'driver_arrived',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// AI-assisted: see docs/AI_LOG.md #44
// Neutral value written to Firestore driverLocations/{uid}.tripStatus once the trip is over and the
// driver is back on Home (after the final completed or cancelled write). It is not a trip state:
// it never enters TRIP_STATUS, the trip machine or the passenger API.
export const DRIVER_LOCATION_IDLE_STATUS = 'idle';

// AI-assisted: see docs/AI_LOG.md #44
// Why finish() or cancel() did not get the API confirmation (TripContext.trip.finishError). Not a
// trip state either: the screen maps each code to its text and decides whether "Reintentar" applies.
export const FINISH_ERROR = {
  NETWORK: 'network',
  TIMEOUT: 'timeout',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
};

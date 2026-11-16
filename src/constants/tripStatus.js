// AI-assisted: see docs/AI_LOG.md #42
// AI-assisted: see docs/AI_LOG.md #43
// Trip states (RF-13): the only place where the status strings are written. Everything else,
// including the passenger API contract and its adapters, reads them from here.

export const TRIP_STATUS = {
  // AI-assisted: see docs/AI_LOG.md #66
  // Implicit state: the request offered to the driver with no decision yet. Constant and origin of
  // transitions only; it is never written to Firestore.
  REQUESTED: 'requested',
  ACCEPTED: 'accepted',
  // The driver declined the request or it expired. Terminal; a constant here, saved by a later task.
  REJECTED: 'rejected',
  DRIVER_ARRIVING: 'driver_arriving',
  // The driver reached the pickup point and waits for the passenger (T-44).
  DRIVER_ARRIVED: 'driver_arrived',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  // AI-assisted: see docs/AI_LOG.md #55
  // The charge was confirmed (gateway approved, or the driver confirmed cash): written only after
  // the trip is saved as completed. Not a passenger API state.
  PAID: 'paid',
};

// AI-assisted: see docs/AI_LOG.md #44
// Neutral value written to Firestore driverLocations/{uid}.tripStatus once the trip is over and the
// driver is back on Home (after the final completed or cancelled write). It is not a trip state:
// it never enters TRIP_STATUS, the trip machine or the passenger API.
// AI-assisted: see docs/AI_LOG.md #55
// Charge state saved in the trip document (paymentStatus). 'paid' is the cash confirmation. Only the
// backend writes approved and rejected.
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PAID: 'paid',
};

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

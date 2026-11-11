// AI-assisted: see docs/AI_LOG.md #42
// Trip states (RF-13): the only place where the status strings are written. Everything else,
// including the passenger API contract and its adapters, reads them from here.

export const TRIP_STATUS = {
  ACCEPTED: 'accepted',
  DRIVER_ARRIVING: 'driver_arriving',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

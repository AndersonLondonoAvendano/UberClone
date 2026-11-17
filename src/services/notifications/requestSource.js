// AI-assisted: see AI_LOG.md #70
// Pure rule that picks the single source of ride requests (DT-5). Exactly one source while the driver is
// available without a trip, none otherwise: never two sources, never zero while available.
//   'none'   not available, or a trip is in progress
//   'server' available, no trip, notifications ready (enabled and registered) and the backend confirmed
//            the last "available: true" report with { active: true }
//   'mock'   any other case while available (the in-app simulator keeps working)

export const REQUEST_SOURCE = { NONE: 'none', SERVER: 'server', MOCK: 'mock' };

export function chooseRequestSource({ available, onTrip, notificationsReady, backendConfirmed } = {}) {
  if (available !== true || onTrip === true) return REQUEST_SOURCE.NONE;
  if (notificationsReady === true && backendConfirmed === true) return REQUEST_SOURCE.SERVER;
  return REQUEST_SOURCE.MOCK;
}

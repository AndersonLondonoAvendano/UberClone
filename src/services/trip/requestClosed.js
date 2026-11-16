// AI-assisted: see docs/AI_LOG.md #66
// Pure choice of why an open request disappeared (C2d, D-181). When the driver switches to "No disponible"
// the request is released (useTripRequests stops watching) while it still had time left: that is not an
// expiry, so the text must be "Cancelada: ya no estás disponible" and not "La solicitud expiró".
import { labels } from '../../constants/labels';

export const CLOSED_REASON = { EXPIRED: 'expired', UNAVAILABLE: 'unavailable' };

// available: the driver's availability now (undefined counts as available). remainingMs: time left of the
// request when it disappeared. toleranceMs: how close to its deadline still counts as an expiry.
export function requestClosedReason({ available, remainingMs, toleranceMs = 0 }) {
  if (available === false && typeof remainingMs === 'number' && remainingMs > toleranceMs) return CLOSED_REASON.UNAVAILABLE;
  return CLOSED_REASON.EXPIRED;
}

export function closedReasonText(reason) {
  return reason === CLOSED_REASON.UNAVAILABLE ? labels.trip.closedUnavailable : labels.trip.expired;
}

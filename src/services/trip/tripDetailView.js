// AI-assisted: see docs/AI_LOG.md #57 (T-109)
// AI-assisted: see docs/AI_LOG.md #61
// AI-assisted: see docs/AI_LOG.md #58 (T-150: the method row names the gateway, Stripe included)
// Pure presentation of a saved trip for the detail screen (RF-49, RF-54). No network, no React:
// it only reads the document already loaded. Missing data never throws:
// - tip: a positive number is shown as pesos, otherwise "Sin propina";
// - rating: always an object { value, text, a11y }; value is the whole 1-5 rating or null ("Sin calificación",
//   also for legacy trips saved before D-124);
// - route: the saved simplified route as [{ lat, lng }] or null (no route, a single point or invalid
//   coordinates), and then routeUnavailableText says so;
// - status: legacy trips (no paymentMethod and no paymentStatus) get the neutral "Cobro simulado" chip.

import { labels } from '../../constants/labels';
import { paymentLabelKey } from './paymentGateway';
import { PAYMENT_STATUS, TRIP_STATUS } from '../../constants/tripStatus';
import { fillLabel, formatCop, formatKm } from '../../utils/format';
import { legacyPaymentChip } from './legacyTrip';

const PAYMENT_CHIP = {
  [PAYMENT_STATUS.PENDING]: { tone: 'warning', icon: 'time-outline' },
  [PAYMENT_STATUS.APPROVED]: { tone: 'success', icon: 'checkmark-circle' },
  [PAYMENT_STATUS.REJECTED]: { tone: 'danger', icon: 'close-circle' },
  [PAYMENT_STATUS.PAID]: { tone: 'success', icon: 'checkmark-circle' },
};

// Neutral tone (text on surfaceMuted) plus its own icon: differs from the cancelled chip (danger, close-circle).
export const REJECTED_CHIP = { tone: 'neutral', icon: 'remove-circle' };

const isNumber = (value) => typeof value === 'number' && Number.isFinite(value);
const has = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

// A point is { lat, lng } (saved shape) or [lat, lng]; coordinates must be finite and in range.
function toPoint(point) {
  let lat;
  let lng;
  if (Array.isArray(point)) [lat, lng] = point;
  else if (point && typeof point === 'object') ({ lat, lng } = point);
  if (!isNumber(lat) || !isNumber(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

// [{ lat, lng }] with at least two valid points, or null.
export function validDetailRoute(route) {
  if (!Array.isArray(route) || route.length < 2) return null;
  const points = route.map(toPoint);
  return points.every(Boolean) ? points : null;
}

function statusOf(trip) {
  if (trip.status === TRIP_STATUS.CANCELLED) {
    return { label: labels.history.status.cancelled, tone: 'danger', icon: 'close-circle' };
  }
  // AI-assisted: see docs/AI_LOG.md #66 (T-230: only the TRIP status; a completed trip whose payment was
  // rejected by the gateway keeps its "Pago rechazado" chip)
  if (trip.status === TRIP_STATUS.REJECTED) return { ...REJECTED_CHIP, label: labels.history.status.rejected };
  const legacy = legacyPaymentChip(trip);
  if (legacy) return legacy;
  const paymentStatus = trip.paymentStatus ?? (trip.status === TRIP_STATUS.PAID ? PAYMENT_STATUS.PAID : undefined);
  const style = paymentStatus !== undefined && has(PAYMENT_CHIP, paymentStatus) ? PAYMENT_CHIP[paymentStatus] : null;
  const label = style ? labels.history.paymentStatus[paymentStatus] : labels.history.paymentUnknown;
  return { label, tone: style?.tone ?? 'neutral', icon: style?.icon };
}

function methodOf(trip) {
  // #59: "Tarjeta" until a gateway is chosen (with paymentId).
  const key = paymentLabelKey({ method: trip.paymentMethod, paymentId: trip.paymentId });
  if (has(labels.history.detail.methods, key)) return labels.history.detail.methods[key];
  return labels.history.detail.methodUnknown;
}

// Returns { rows, status, rating, route, routeUnavailableText }.
// rows: [{ key, label, value }] in display order (duration, distance, commission, tip, method).
// status: { label, tone, icon } for the shared Chip. rating: { value, text, a11y } (value null = no rating).
export function tripDetailView(trip) {
  const source = trip && typeof trip === 'object' ? trip : {};
  const detail = labels.history.detail;
  const minutes = isNumber(source.durationMin) && source.durationMin >= 0 ? Math.round(source.durationMin) : 0;
  const km = isNumber(source.distanceKm) && source.distanceKm >= 0 ? source.distanceKm : 0;
  const commission = isNumber(source.commission) && source.commission >= 0 ? source.commission : 0;
  const tip = isNumber(source.tip) && source.tip > 0 ? source.tip : 0;
  const route = validDetailRoute(source.route);
  const ratingValue = isNumber(source.rating) && source.rating >= 1 && source.rating <= 5 ? Math.round(source.rating) : null;

  return {
    rows: [
      { key: 'duration', label: detail.duration, value: fillLabel(detail.durationValue, { minutes }) },
      { key: 'distance', label: detail.distance, value: fillLabel(detail.distanceValue, { km: formatKm(km) }) },
      { key: 'commission', label: detail.commission, value: formatCop(commission) },
      { key: 'tip', label: detail.tip, value: tip > 0 ? formatCop(tip) : detail.noTip },
      { key: 'method', label: detail.method, value: methodOf(source) },
    ],
    status: statusOf(source),
    rating:
      ratingValue !== null
        ? {
            value: ratingValue,
            text: fillLabel(detail.ratingValue, { rating: ratingValue }),
            a11y: fillLabel(detail.ratingA11y, { rating: ratingValue }),
          }
        : { value: null, text: detail.noRating, a11y: detail.noRatingA11y },
    route,
    routeUnavailableText: route ? null : detail.routeUnavailable,
  };
}

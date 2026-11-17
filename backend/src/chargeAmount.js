// AI-assisted: see AI_LOG.md #61
// Amount charged to the passenger by card: fare + tip, in whole COP. It is ALWAYS computed from the
// trip document read from Firestore (never from a request body). The commission is taken only on the
// fare, so the gateway amount is the fare plus the tip. A missing, non-integer or negative tip counts
// as 0; an invalid fare gives 0 (the callers reject amounts that are not > 0).
const isWholeNonNegative = (value) => Number.isInteger(value) && value >= 0;

export function chargeAmount(trip) {
  const fare = trip?.fare;
  if (!Number.isInteger(fare) || fare <= 0) return 0;
  const tip = isWholeNonNegative(trip?.tip) ? trip.tip : 0;
  return fare + tip;
}

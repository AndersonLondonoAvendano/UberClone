// AI-assisted: see docs/AI_LOG.md #43
// Trip state machine (T-44). Pure. The states live in src/constants/tripStatus.js and the forward
// transitions in the passenger API contract (NEXT_TRIP_STATUS):
//   accepted -> driver_arriving -> driver_arrived -> in_progress -> completed
// Any state that has not finished can also go to cancelled.

import { NEXT_TRIP_STATUS, TRIP_STATUS, isTripFinished } from '../passengerApi';

export function canTransition(from, to) {
  if (!from || !to) return false;
  if (to === TRIP_STATUS.CANCELLED) return !isTripFinished(from);
  return NEXT_TRIP_STATUS[from] === to;
}

export const nextStatus = (from) => NEXT_TRIP_STATUS[from] ?? null;

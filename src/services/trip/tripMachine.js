// AI-assisted: see docs/AI_LOG.md #43
// AI-assisted: see docs/AI_LOG.md #66
// Trip state machine (T-44, T-221). Pure. The states live in src/constants/tripStatus.js. The valid
// transitions are an explicit table (origin -> set of destinations); anything not listed is invalid:
//   requested -> accepted | rejected
//   accepted -> driver_arriving | cancelled
//   driver_arriving -> driver_arrived | cancelled
//   driver_arrived -> in_progress | cancelled
//   in_progress -> completed            (cancelling an ongoing ride is not allowed)
//   completed -> paid                   (written by the backend or the cash confirmation, not by the controller)
// rejected, cancelled and paid are terminal. Nothing goes back to requested.

import { NEXT_TRIP_STATUS, TRIP_STATUS } from '../passengerApi';

const S = TRIP_STATUS;

export const TRANSITIONS = Object.freeze({
  [S.REQUESTED]: [S.ACCEPTED, S.REJECTED],
  [S.ACCEPTED]: [S.DRIVER_ARRIVING, S.CANCELLED],
  [S.DRIVER_ARRIVING]: [S.DRIVER_ARRIVED, S.CANCELLED],
  [S.DRIVER_ARRIVED]: [S.IN_PROGRESS, S.CANCELLED],
  [S.IN_PROGRESS]: [S.COMPLETED],
  [S.COMPLETED]: [S.PAID],
  [S.REJECTED]: [],
  [S.CANCELLED]: [],
  [S.PAID]: [],
});

export function canTransition(from, to) {
  if (typeof from !== 'string' || typeof to !== 'string') return false;
  if (!Object.prototype.hasOwnProperty.call(TRANSITIONS, from)) return false;
  return TRANSITIONS[from].includes(to);
}

export const nextStatus = (from) => NEXT_TRIP_STATUS[from] ?? null;

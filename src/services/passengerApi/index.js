// AI-assisted: see AI_LOG.md #42
// Passenger API port. Screens and hooks import only from here, never from an adapter.
// PASSENGER_API_MODE (a constant in src/config/passengerApi.js) picks the adapter once.

import { PASSENGER_API_MODE } from '../../config/passengerApi';
import { createHttpPassengerApi } from './httpPassengerApi';
import { mockPassengerApi } from './mockPassengerApi';

const adapter = PASSENGER_API_MODE === 'http' ? createHttpPassengerApi() : mockPassengerApi;

export const subscribeToRequests = (onRequest, onError, options) =>
  adapter.subscribeToRequests(onRequest, onError, options);
export const acceptRequest = (requestId) => adapter.acceptRequest(requestId);
export const rejectRequest = (requestId) => adapter.rejectRequest(requestId);
export const reportTripStatus = (tripId, status) => adapter.reportTripStatus(tripId, status);
export const cancelTrip = (tripId) => adapter.cancelTrip(tripId);
export const reportDriverLocation = (tripId, location) => adapter.reportDriverLocation(tripId, location);
// AI-assisted: see AI_LOG.md #44
// Frees the trip on the adapter side when the driver leaves it without a delivered final status.
export const releaseTrip = (tripId) => adapter.releaseTrip(tripId);

// Dev helper behind SHOW_DEV_TOOLS: asks the adapter for a request now. Returns 'emitted',
// 'not_subscribed', 'no_position', 'busy' or 'not_supported' (http).
export const requestSimulatedTripNow = () => adapter.requestNow();

// AI-assisted: see AI_LOG.md #64
// Takes in a request that arrived by notification as the pending one (T-179). Returns 'adopted',
// 'busy', 'expired', 'invalid' or 'not_supported' (http).
export const adoptPushRequest = (request) => adapter.adoptRequest(request);
export { ADOPT_RESULT } from './mockPassengerApi';

// AI-assisted: see AI_LOG.md #43 (transition table and error helpers for the trip screens)
export {
  NEXT_TRIP_STATUS,
  PASSENGER_API_ERROR,
  TRIP_STATUS,
  isPassengerApiError,
  isTripFinished,
  isValidTripRequest,
} from './contract';

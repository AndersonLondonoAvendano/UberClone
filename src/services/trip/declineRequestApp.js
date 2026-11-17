// AI-assisted: see AI_LOG.md #66
// App wiring of the single decline point (T-229): binds the real repository, the passenger API port
// and the address resolver to declineRequest. Components import ONLY from here, so manual rejection
// and expiry take the same path. Fire and forget: the returned promise never rejects.

import { withResolvedAddresses } from '../geocoding/requestAddresses';
import { rejectRequest } from '../passengerApi';
import { saveTrip } from '../tripRepository';
import { declineRequest as decline } from './declineRequest';

export { DECLINE_REASON, markRequestAccepted } from './declineRequest';

// { uid, request, reason, release } -> Promise<'saved' | 'skipped' | 'failed'>
export const declineRequest = (args) =>
  decline({ save: saveTrip, reject: rejectRequest, resolveAddresses: withResolvedAddresses, ...args });

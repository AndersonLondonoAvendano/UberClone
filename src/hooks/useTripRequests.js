// AI-assisted: see docs/AI_LOG.md #42
// AI-assisted: see docs/AI_LOG.md #43
// Subscription to incoming trip requests while `enabled` (T-42). Goes through the passenger API
// port only (never an adapter). Unsubscribes on disable or unmount.
// One request at a time (T-43): `pendingRequest` is the one offered to the driver; it disappears by
// itself when it expires, and a new one is ignored while another is still pending.
// `clearPendingRequest(id)` frees the slot once the driver accepted, rejected or left the card.

import { useCallback, useEffect, useRef, useState } from 'react';
import { resolveRequestAddresses } from '../services/geocoding/requestAddresses';
import {
  ADOPT_RESULT,
  adoptPushRequest,
  isValidTripRequest,
  subscribeToRequests,
} from '../services/passengerApi';
import { createPendingRequestGate } from '../services/trip/pendingRequest';
import { refineRequestMetrics } from '../services/notifications/pushRequest';
import { getRouteMetrics } from '../services/routing/routeMetrics';
import { PUSH_OFFER_RESULT, offerPushRefined } from '../services/trip/pushOffer';

export function useTripRequests({ enabled, getDriverPosition }) {
  const [lastRequest, setLastRequest] = useState(null);
  const [pendingRequest, setPendingRequest] = useState(null);
  // AI-assisted: see docs/AI_LOG.md #64 (T-182: a request that arrived by push is offered even when the
  // driver is not available; the flag clears when it stops being pending).
  const [pushOffered, setPushOffered] = useState(false);
  const [error, setError] = useState(null);
  const gateRef = useRef(null);
  const inFlightRef = useRef(new Map()); // request ids whose route lookup is still running

  // The gate lives as long as the provider; it is only disposed on unmount.
  useEffect(() => {
    const gate = createPendingRequestGate({ onChange: (request) => setPendingRequest(request) });
    gateRef.current = gate;
    return () => {
      gate.dispose();
      gateRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      // No subscription, no offer: the card sees the request disappear.
      gateRef.current?.release();
      setLastRequest(null);
      setError(null);
      return undefined;
    }
    let active = true;
    const unsubscribe = subscribeToRequests(
      (request) => {
        if (!active || !isValidTripRequest(request)) return;
        setError(null);
        // AI-assisted: see docs/AI_LOG.md #61 (D-125: real address in the background, never blocks the offer)
        resolveRequestAddresses(request);
        setLastRequest(request);
        gateRef.current?.offer(request);
      },
      (reason) => {
        if (active) setError(reason);
      },
      { getDriverPosition },
    );
    return () => {
      active = false;
      unsubscribe();
    };
  }, [enabled, getDriverPosition]);

  useEffect(() => {
    if (!pendingRequest) setPushOffered(false);
  }, [pendingRequest]);

  const clearPendingRequest = useCallback((id) => {
    gateRef.current?.release(id);
  }, []);

  // Offers a request that came from a notification (D-130). Returns true only when it became the
  // pending request; duplicates, busy and expired ones are ignored silently. Addresses are resolved in
  // the background (D-125), as for any request.
  // options.tap (D-149): a tap on a request that is already pending promotes it (true, no duplicate,
  // timer untouched) instead of being rejected as a duplicate.
  // T-199 (RC-01/RC-02): async. The request is refined with the real route (one shared lookup, <= 2.5 s,
  // fallback marked `estimated`) before it reaches the gate; expiry is checked again after the wait and the
  // same id arriving during the wait joins the lookup in progress. Resolves to a boolean as before.
  const offerPushRequest = useCallback(async (request, options) => {
    const gate = gateRef.current;
    if (!gate || !isValidTripRequest(request)) return false;
    // AI-assisted: see docs/AI_LOG.md #64 (gate first, then adopt; a duplicate never touches the mock)
    const result = await offerPushRefined({
      gate,
      request,
      tap: options?.tap === true,
      inFlight: inFlightRef.current,
      refine: (candidate) => refineRequestMetrics(candidate, getRouteMetrics()),
      isCurrent: () => gateRef.current === gate,
      onOffered: (refined) => {
        resolveRequestAddresses(refined);
        setError(null);
        setLastRequest(refined);
        setPushOffered(true);
      },
      adopt: (candidate) => {
        const adopted = adoptPushRequest(candidate);
        return !(
          adopted === ADOPT_RESULT.BUSY ||
          adopted === ADOPT_RESULT.EXPIRED ||
          adopted === ADOPT_RESULT.INVALID
        );
      },
    });
    return result === PUSH_OFFER_RESULT.PROMOTED || result === PUSH_OFFER_RESULT.OFFERED;
  }, []);

  return { pendingRequest, lastRequest, error, clearPendingRequest, offerPushRequest, pushOffered };
}

// AI-assisted: see docs/AI_LOG.md #42
// AI-assisted: see docs/AI_LOG.md #43
// Subscription to incoming trip requests while `enabled` (T-42). Goes through the passenger API
// port only (never an adapter). Unsubscribes on disable or unmount.
// One request at a time (T-43): `pendingRequest` is the one offered to the driver; it disappears by
// itself when it expires, and a new one is ignored while another is still pending.
// `clearPendingRequest(id)` frees the slot once the driver accepted, rejected or left the card.

import { useCallback, useEffect, useRef, useState } from 'react';
import { isValidTripRequest, subscribeToRequests } from '../services/passengerApi';
import { createPendingRequestGate } from '../services/trip/pendingRequest';

export function useTripRequests({ enabled, getDriverPosition }) {
  const [lastRequest, setLastRequest] = useState(null);
  const [pendingRequest, setPendingRequest] = useState(null);
  const [error, setError] = useState(null);
  const gateRef = useRef(null);

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

  const clearPendingRequest = useCallback((id) => {
    gateRef.current?.release(id);
  }, []);

  return { pendingRequest, lastRequest, error, clearPendingRequest };
}

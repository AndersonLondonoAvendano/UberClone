// AI-assisted: see docs/AI_LOG.md #42
// Subscription to incoming trip requests while `enabled` (T-42). Goes through the passenger API
// port only (never an adapter). Unsubscribes on disable or unmount.

import { useEffect, useState } from 'react';
import { isValidTripRequest, subscribeToRequests } from '../services/passengerApi';

export function useTripRequests({ enabled, getDriverPosition }) {
  const [lastRequest, setLastRequest] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) {
      setLastRequest(null);
      setError(null);
      return undefined;
    }
    let active = true;
    const unsubscribe = subscribeToRequests(
      (request) => {
        if (active && isValidTripRequest(request)) {
          setError(null);
          setLastRequest(request);
        }
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

  return { lastRequest, error };
}

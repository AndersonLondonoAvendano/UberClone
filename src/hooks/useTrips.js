// AI-assisted: see AI_LOG.md #50
// Live list of the driver's saved trips (T-47, T-48): onSnapshot on drivers/{uid}/trips, most recent
// first, at most TRIPS_LIMIT. status: 'loading' | 'ready' | 'error'. retry() resubscribes. The
// subscription is released on unmount, on retry and when the driver id changes.

import { useCallback, useEffect, useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import { listenToTrips } from '../services/tripRepository';

export function useTrips() {
  const { driverId } = useAppState();
  const [state, setState] = useState({ status: 'loading', trips: [] });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setState({ status: 'loading', trips: [] });
    if (!driverId) return undefined;
    let active = true;
    let unsubscribe;
    try {
      unsubscribe = listenToTrips(driverId, {
        onData: (trips) => {
          if (active) setState({ status: 'ready', trips });
        },
        onError: () => {
          if (active) setState({ status: 'error', trips: [] });
        },
      });
    } catch {
      setState({ status: 'error', trips: [] });
    }
    return () => {
      active = false;
      if (unsubscribe) unsubscribe();
    };
  }, [driverId, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { status: state.status, trips: state.trips, retry };
}

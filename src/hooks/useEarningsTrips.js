// AI-assisted: see docs/AI_LOG.md #65
// Trips for the earnings totals (RC-04): one read of every trip from the start of the week or month up to
// now (fetchTripsInRange, internal pagination), on focus and on retry. status: 'loading' | 'ready' |
// 'error'. A late answer after unmount, blur or a newer read is ignored.

import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import { fetchTripsInRange } from '../services/tripRepository';
import { earningsReadRange } from '../utils/earnings';

export function useEarningsTrips() {
  const { driverId } = useAppState();
  const [state, setState] = useState({ status: 'loading', trips: [], truncated: false });
  const [attempt, setAttempt] = useState(0);
  const readId = useRef(0);

  useFocusEffect(
    useCallback(() => {
      readId.current += 1;
      const id = readId.current;
      setState({ status: 'loading', trips: [], truncated: false });
      if (!driverId) return undefined;
      fetchTripsInRange(driverId, earningsReadRange())
        .then((result) => {
          if (id === readId.current) setState({ status: 'ready', trips: result.trips, truncated: result.truncated });
        })
        .catch(() => {
          if (id === readId.current) setState({ status: 'error', trips: [], truncated: false });
        });
      return () => {
        readId.current += 1;
      };
    }, [driverId, attempt]),
  );

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { status: state.status, trips: state.trips, truncated: state.truncated, retry };
}

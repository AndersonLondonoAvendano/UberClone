// AI-assisted: see docs/AI_LOG.md #66
// Platform balance over every saved trip (B1, D-182): one paginated read (fetchAllTrips, cap 5,000) on
// focus and on retry, no onSnapshot. status: 'loading' | 'ready' | 'error' | 'noSession'. A late answer after unmount,
// blur or a newer read is ignored. The view (kind, balance, partial) comes from buildBalanceView.

import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import { fetchAllTrips } from '../services/tripRepository';
import { buildBalanceView } from '../utils/balanceView';

export function useBalance() {
  const { driverId } = useAppState();
  const [state, setState] = useState({ status: 'loading', trips: [], truncated: false });
  const [attempt, setAttempt] = useState(0);
  const readId = useRef(0);

  useFocusEffect(
    useCallback(() => {
      readId.current += 1;
      const id = readId.current;
      // AI-assisted: see docs/AI_LOG.md #66 (C2a: no driver id is a clear state, never an endless loading)
      if (!driverId) {
        setState({ status: 'noSession', trips: [], truncated: false });
        return undefined;
      }
      setState({ status: 'loading', trips: [], truncated: false });
      fetchAllTrips(driverId)
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

  const view = useMemo(() => buildBalanceView(state), [state]);
  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { ...view, retry };
}

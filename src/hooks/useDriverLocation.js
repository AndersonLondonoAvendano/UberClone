// AI-assisted: see docs/AI_LOG.md #42
// Driver position while `enabled` (T-41). Starts the configured source, publishes at most one
// position per LOCATION_THROTTLE_MS / LOCATION_THROTTLE_M, pauses while the app is in the
// background (foreground location only) and stops the source on disable or unmount.
// Permission is asked by the caller before enabling (AvailabilityContext).
// status: 'idle' (off) | 'waiting' (on, no position yet) | 'active' | 'paused' | 'unavailable'.

import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { LOCATION_THROTTLE_M, LOCATION_THROTTLE_MS } from '../config/location';
import { getLocationSource, shouldEmitPosition } from '../services/location';

const THROTTLE = { minIntervalMs: LOCATION_THROTTLE_MS, minDistanceM: LOCATION_THROTTLE_M };

export function useDriverLocation({ enabled }) {
  const [state, setState] = useState({ status: 'idle', position: null });
  const lastRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      lastRef.current = null;
      setState({ status: 'idle', position: null });
      return undefined;
    }

    const source = getLocationSource();
    let stop = null;
    let active = true;

    const begin = () => {
      if (stop) return;
      setState((prev) => ({ status: prev.position ? 'active' : 'waiting', position: prev.position }));
      stop = source.start({
        onPosition: (position) => {
          if (!active || !shouldEmitPosition(lastRef.current, position, THROTTLE)) return;
          lastRef.current = position;
          setState({ status: 'active', position });
        },
        onError: () => {
          if (active) setState((prev) => (prev.position ? prev : { status: 'unavailable', position: null }));
        },
      });
    };

    const pause = () => {
      if (stop) stop();
      stop = null;
      setState((prev) => ({ status: 'paused', position: prev.position }));
    };

    if (AppState.currentState === 'background') pause();
    else begin();

    const appStateSubscription = AppState.addEventListener('change', (next) => {
      if (next === 'active') begin();
      else if (next === 'background') pause();
    });

    return () => {
      active = false;
      appStateSubscription.remove();
      if (stop) stop();
      stop = null;
    };
  }, [enabled]);

  return state;
}

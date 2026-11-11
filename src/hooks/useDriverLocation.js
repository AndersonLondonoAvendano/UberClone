// AI-assisted: see docs/AI_LOG.md #42
// AI-assisted: see docs/AI_LOG.md #43
// Driver position while `enabled` (T-41). Starts the configured source, publishes at most one
// position per LOCATION_THROTTLE_MS / LOCATION_THROTTLE_M, pauses while the app is in the
// background (foreground location only) and stops the source on disable or unmount.
// Permission and the "turn on location" dialog are handled by the caller before enabling
// (AvailabilityContext). This hook never opens a system dialog: before starting it only checks
// that the phone location is on, and if it is off it reports 'services_off' and does not start, so
// returning to the foreground can never reopen a dialog in a loop.
// status: 'idle' (off) | 'waiting' (on, no position yet) | 'active' | 'paused' | 'unavailable'
//         | 'services_off' (phone location turned off).

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
    let checking = false;
    let foreground = AppState.currentState !== 'background';

    const halt = () => {
      if (stop) stop();
      stop = null;
    };

    const servicesOff = () => {
      halt();
      setState((prev) => ({ status: 'services_off', position: prev.position }));
    };

    const begin = async () => {
      if (stop || checking) return;
      checking = true;
      const servicesOn = await source.checkServices();
      checking = false;
      // The effect may have been cleaned up, or the app sent to the background, during the check.
      if (!active || stop || !foreground) return;
      if (!servicesOn) {
        servicesOff();
        return;
      }
      setState((prev) => ({ status: prev.position ? 'active' : 'waiting', position: prev.position }));
      stop = source.start({
        onPosition: (position) => {
          if (!active || !shouldEmitPosition(lastRef.current, position, THROTTLE)) return;
          lastRef.current = position;
          setState({ status: 'active', position });
        },
        onError: async () => {
          if (!active) return;
          const stillOn = await source.checkServices();
          if (!active) return;
          if (!stillOn) servicesOff();
          else setState((prev) => (prev.position ? prev : { status: 'unavailable', position: null }));
        },
      });
    };

    const pause = () => {
      halt();
      setState((prev) => ({ status: 'paused', position: prev.position }));
    };

    if (foreground) begin();
    else pause();

    const appStateSubscription = AppState.addEventListener('change', (next) => {
      if (next === 'active') {
        foreground = true;
        begin();
      } else if (next === 'background') {
        foreground = false;
        pause();
      }
    });

    return () => {
      active = false;
      appStateSubscription.remove();
      halt();
    };
  }, [enabled]);

  return state;
}

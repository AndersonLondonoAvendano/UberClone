// AI-assisted: see AI_LOG.md #60
// Thin React layer over the pure profile edit flow (R13, DP-56). The flow is created once per
// mount and read with useSyncExternalStore. It is reset when the account (uid) changes, which
// also covers resetSession: the session reset ends with driverId === null.
import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import { updateDriverProfile } from '../services/driverRepository';
import { createProfileEditFlow } from '../utils/profileEditFlow';

export function useProfileEdit(driverId, driverProfile) {
  const flowRef = useRef(null);
  if (flowRef.current === null) {
    flowRef.current = createProfileEditFlow({ save: updateDriverProfile });
  }
  const flow = flowRef.current;
  const state = useSyncExternalStore(flow.subscribe, flow.getState, flow.getState);

  // A different account (or no account) always starts from a clean flow.
  useEffect(() => {
    flow.reset(driverId ?? null);
  }, [flow, driverId]);

  const discard = useCallback(() => flow.reset(driverId ?? null), [flow, driverId]);

  // The flow state is only valid for the current account: never expose another uid's draft.
  const isCurrent = state.uid === (driverId ?? null);

  return {
    state: isCurrent ? state : null,
    start: () => flow.start(driverId, driverProfile),
    change: flow.change,
    touch: flow.touch,
    cancel: flow.cancel,
    submit: flow.submit,
    retry: flow.retry,
    discard,
  };
}

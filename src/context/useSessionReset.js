// AI-assisted: see docs/AI_LOG.md #54
// Wires the real dependencies of the session reset (DP-12). Returns a stable async resetSession()
// that resolves { ok, reason, steps } (never logged here). Absent providers are tolerated with the
// optional readers (Availability and Trip live only in the main branch, the registration form only
// in the registration branch), so the hook can be used from either branch without changing the
// strict useAvailability / useTrip / useRegistrationForm contracts. Contexts are read through a ref
// that is refreshed after every render, so the procedure always sees the latest values.
// Concurrent calls share the call in flight.

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { DRIVER_LOCATION_IDLE_STATUS } from '../constants/tripStatus';
import { signOutUser } from '../services/authService';
import { publishDriverTripStatus } from '../services/driverLocationPublisher';
import { buildSessionResetDeps } from '../services/session/buildSessionResetDeps';
import { createSessionReset } from '../services/session/resetSession';
import { useAppState } from './AppStateContext';
import { useOptionalAvailability } from './AvailabilityContext';
import { useOptionalRegistrationForm } from './RegistrationFormContext';
import { useOptionalTrip } from './TripContext';

export function useSessionReset() {
  const availability = useOptionalAvailability();
  const trip = useOptionalTrip();
  const appState = useAppState();
  const registration = useOptionalRegistrationForm();

  const latestRef = useRef({ availability, trip, appState, registration });
  useEffect(() => {
    latestRef.current = { availability, trip, appState, registration };
  }, [availability, trip, appState, registration]);

  const inFlightRef = useRef(null);

  const runReset = useMemo(
    () =>
      createSessionReset(
        buildSessionResetDeps({
          getAvailability: () => latestRef.current.availability,
          getTrip: () => latestRef.current.trip,
          getAppState: () => latestRef.current.appState,
          getRegistration: () => latestRef.current.registration,
          publishIdleStatus: (position) => publishDriverTripStatus(DRIVER_LOCATION_IDLE_STATUS, position),
          signOut: signOutUser,
        }),
      ),
    [],
  );

  return useCallback(() => {
    if (inFlightRef.current) return inFlightRef.current;
    const pending = runReset().finally(() => {
      inFlightRef.current = null;
    });
    inFlightRef.current = pending;
    return pending;
  }, [runReset]);
}

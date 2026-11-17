// AI-assisted: see AI_LOG.md #54
// AI-assisted: see AI_LOG.md #72
// Wires the real dependencies of the session reset (DP-12). Returns a stable async resetSession()
// that resolves { ok, reason, steps } (never logged here). Absent providers are tolerated with the
// optional readers (Availability and Trip live only in the main branch, the registration form only
// in the registration branch), so the hook can be used from either branch without changing the
// strict useAvailability / useTrip / useRegistrationForm contracts. Contexts are read through a ref
// that is refreshed after every render, so the procedure always sees the latest values.
// Concurrent calls share the call in flight. resetSession({ skipTripSaveWait: true }) signs out
// without waiting for the pending trip saves (explicit user choice).

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { DRIVER_LOCATION_IDLE_STATUS } from '../constants/tripStatus';
import { signOutUser } from '../services/authService';
import { publishDriverTripStatus } from '../services/driverLocationPublisher';
import { availabilityPreference } from '../services/availabilityPreference';
import { getRegistrationController } from '../services/notifications/registrationRuntime';
import { waitForTripSaveQueue } from '../services/trip/saveQueue';
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
          waitForTripSaveQueue,
          // AI-assisted: see AI_LOG.md #64 (T-185: push token off right before signOut, D-134)
          unregisterNotifications: () => getRegistrationController().signOutCleanup(),
          // AI-assisted: see AI_LOG.md #72 (D-201: the saved "Disponible" goes with the session)
          clearAvailabilityPreference: () => availabilityPreference.clear(latestRef.current.appState?.driverId),
          restoreNotifications: () => getRegistrationController().restoreAfterFailedSignOut(),
          signOut: signOutUser,
        }),
      ),
    [],
  );

  return useCallback((options) => {
    if (inFlightRef.current) return inFlightRef.current;
    const pending = runReset(options).finally(() => {
      inFlightRef.current = null;
    });
    inFlightRef.current = pending;
    return pending;
  }, [runReset]);
}

// AI-assisted: see docs/AI_LOG.md #54
// Pure builder of the real dependencies of resetSession (no React, no Firebase imports). The hook
// useSessionReset passes getters that always return the LATEST context values (or null when a
// provider is not mounted in the current branch) and the real effects.
//
// getAvailability(), getTrip(), getAppState(), getRegistration(): latest context value or null.
// publishIdleStatus(position): publishes the idle driver status through the existing writer queue.
// clearOwnStorage(): optional. The app has no own AsyncStorage keys (only Firebase Auth persistence
//   uses it and it must survive until signOut), so the default is an explicit no-op.
// waitForTripSaveQueue(): resolves when no trip save is in flight (see services/trip/saveQueue.js).
// signOut(): REQUIRED. resetSession counts a missing signOut as ok, so it is enforced here.

const noop = async () => {};

// Runs every function even if one throws, then rethrows the first error (step isolation).
function runAll(fns) {
  let firstError = null;
  fns.forEach((fn) => {
    try {
      fn();
    } catch (error) {
      if (firstError === null) firstError = error;
    }
  });
  if (firstError !== null) throw firstError;
}

export function buildSessionResetDeps({
  getAvailability,
  getTrip,
  getAppState,
  getRegistration,
  publishIdleStatus,
  clearOwnStorage = noop,
  waitForTripSaveQueue,
  signOut,
}) {
  if (typeof signOut !== 'function') {
    throw new Error('buildSessionResetDeps: signOut is required');
  }

  return {
    // Fail closed: a trip that is not finished blocks. The trip context is the source; the
    // availability flag covers the instant between startTrip and the controller state.
    hasTripInProgress: () => {
      const tripContext = getTrip();
      if (tripContext && tripContext.trip) return !tripContext.trip.finished;
      const availability = getAvailability();
      return Boolean(availability && availability.onTrip);
    },

    discardPendingRequest: () => {
      const availability = getAvailability();
      if (availability) availability.clearPendingRequest();
    },

    // Not awaited by resetSession beyond its 5 s bound; the writer never rejects.
    setUnavailableAndPublishFinal: async () => {
      const availability = getAvailability();
      if (availability) {
        try {
          await availability.setAvailable(false);
        } catch {
          // The forced reset in the next step turns availability off anyway.
        }
      }
      const position = availability && availability.getDriverPosition ? availability.getDriverPosition() : null;
      await publishIdleStatus(position);
    },

    // Forces availability off (even if a permission flow was in progress): the existing effects of
    // the provider then stop the location source and the request subscription.
    stopLocation: () => {
      const availability = getAvailability();
      if (availability) availability.reset();
    },

    // Disposes the finished trip controller (timers, location source, queue) and frees the adapter.
    releaseSubscriptions: () => {
      const tripContext = getTrip();
      if (tripContext) tripContext.reset();
    },

    clearContexts: () => {
      const availability = getAvailability();
      const tripContext = getTrip();
      const appState = getAppState();
      const registration = getRegistration();
      runAll([
        () => availability && availability.reset(),
        () => tripContext && tripContext.reset(),
        () => appState && appState.reset(),
        () => registration && registration.reset(),
      ]);
    },

    clearOwnStorage,
    waitForTripSaveQueue,
    signOut,
  };
}

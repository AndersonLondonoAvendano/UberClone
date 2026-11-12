// AI-assisted: see docs/AI_LOG.md #54
// Single session reset procedure (sign out, switch account, external session end). Pure: every
// effect arrives through `deps`, so it has no React Native or Firebase imports.
// Order: 1 block if a trip is in progress, 2 discard the pending request, 3 set unavailable and
// publish the final state (bounded wait), 4 stop location and release listeners/timers, 5 clear
// contexts and own storage, 6 signOut. Each step is isolated: a failure never skips the next ones,
// and signOut always runs unless a trip blocked the reset.
//
// deps (a missing step counts as skipped):
//   hasTripInProgress(), discardPendingRequest(), setUnavailableAndPublishFinal(),
//   stopLocation(), releaseSubscriptions(), clearContexts(), clearOwnStorage(), signOut(),
//   finalPublishTimeoutMs (default 5000), setTimeoutFn / clearTimeoutFn (injectable timers).

export const FINAL_PUBLISH_TIMEOUT_MS = 5000;

export const SESSION_RESET_REASON = {
  TRIP_IN_PROGRESS: 'trip-in-progress',
  SIGN_OUT_FAILED: 'sign-out-failed',
};

export const STEP_STATUS = {
  OK: 'ok',
  FAILED: 'failed',
  TIMEOUT: 'timeout',
  SKIPPED: 'skipped',
};

async function runStep(fn) {
  if (typeof fn !== 'function') return STEP_STATUS.SKIPPED;
  try {
    await fn();
    return STEP_STATUS.OK;
  } catch {
    return STEP_STATUS.FAILED;
  }
}

// Like runStep but gives up after timeoutMs without waiting for the work to finish.
async function runBounded(fn, timeoutMs, setTimeoutFn, clearTimeoutFn) {
  if (typeof fn !== 'function') return STEP_STATUS.SKIPPED;
  let timerId = null;
  const timeout = new Promise((resolve) => {
    timerId = setTimeoutFn(() => resolve(STEP_STATUS.TIMEOUT), timeoutMs);
  });
  const status = await Promise.race([runStep(fn), timeout]);
  clearTimeoutFn(timerId);
  return status;
}

export async function resetSession(deps = {}) {
  const {
    finalPublishTimeoutMs = FINAL_PUBLISH_TIMEOUT_MS,
    setTimeoutFn = setTimeout,
    clearTimeoutFn = clearTimeout,
  } = deps;

  // 1. A trip in progress blocks everything; nothing changes.
  let blocked = false;
  try {
    blocked = Boolean(deps.hasTripInProgress && (await deps.hasTripInProgress()));
  } catch {
    // Fail closed: if the check itself fails, assume a trip may be active and block the reset.
    blocked = true;
  }
  if (blocked) return { ok: false, reason: SESSION_RESET_REASON.TRIP_IN_PROGRESS, steps: {} };

  const steps = {};
  steps.discardPendingRequest = await runStep(deps.discardPendingRequest);
  steps.publishFinalState = await runBounded(
    deps.setUnavailableAndPublishFinal,
    finalPublishTimeoutMs,
    setTimeoutFn,
    clearTimeoutFn,
  );
  steps.stopLocation = await runStep(deps.stopLocation);
  steps.releaseSubscriptions = await runStep(deps.releaseSubscriptions);
  steps.clearContexts = await runStep(deps.clearContexts);
  steps.clearOwnStorage = await runStep(deps.clearOwnStorage);
  steps.signOut = await runStep(deps.signOut);

  if (steps.signOut === STEP_STATUS.FAILED) {
    return { ok: false, reason: SESSION_RESET_REASON.SIGN_OUT_FAILED, steps };
  }
  return { ok: true, steps };
}

// Plan DP-11 shape: bind the dependencies once and get the zero-argument procedure.
export function createSessionReset(deps) {
  return () => resetSession(deps);
}

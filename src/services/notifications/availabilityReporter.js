// AI-assisted: see docs/AI_LOG.md #70
// Reports the driver's effective availability to the backend and keeps the "backend confirmed" flag that
// feeds chooseRequestSource (spec 007, DT-4, DT-5, DT-6; STOP-8 correction, D-198). Pure and injectable:
// the notifications api, the clock and the timers come from the caller, so a script can drive it without
// network or real waiting. It never throws, never sends a location or personal data (the api body is only
// { available, seq }) and never logs anything.
//
// Effective availability (computed by the caller) = "Disponible" and no trip and notifications enabled
// with a registered token. The reporter:
//  - reports at once on every change of that value; "false" never waits for the minimum gap (that gap only
//    limits the periodic "true" heartbeats);
//  - while effective and in the foreground sends a heartbeat every HEARTBEAT_INTERVAL_MS and when the app
//    returns to the foreground, never closer than MIN_HEARTBEAT_GAP_MS to the previous "true" report;
//  - stamps every send (retries included) with a new seq, strictly greater than the previous one, so the
//    backend can drop a "true" that arrives after a newer "false";
//  - evaluates the effective value at send time: a "true" only leaves if effective && !stopped right then;
//  - sets the confirmation only when the last "true" report answers { ok: true, active: true };
//  - clears it at once when the value stops being effective, when a "true" report fails or answers
//    active:false, and on stop();
//  - retries a failed "false" 3 times (waits FALSE_RETRY_DELAYS_MS) while "not available" is still wanted;
//    when the retries run out (or JS was suspended in the background) the "false" stays pending and is
//    tried again, with a fresh counter, when the app returns to the foreground or on the next update.
//    There is no "about to suspend" event here: sending the "false" immediately on the state change is what
//    covers that case;
//  - when a "true" report is not confirmed it sends a "false" with the same retry mechanism, so a server
//    generator that did process it does not keep running next to the in-app simulator. A lost "true"
//    never reactivates anything by itself: the next "true" is the next legitimate heartbeat.

export const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000;
export const MIN_HEARTBEAT_GAP_MS = 60 * 1000;
// Waits before retry 1, 2 and 3 of a failed "false" (so 3 retries after the initial attempt).
export const FALSE_RETRY_DELAYS_MS = [1000, 2000, 4000];

export function createAvailabilityReporter({ api, now, setTimeout: setTimer, clearTimeout: clearTimer, onConfirmedChange }) {
  let effective = false;
  let inForeground = false;
  let confirmed = false;
  let stopped = false;
  let lastTrueReportAt = null;
  let timer = null;
  let lastSeq = 0;
  // Bumped on every change that makes an in-flight "true" answer obsolete.
  let epoch = 0;
  // "false" state: a "false" is wanted until it is acknowledged or a newer "true" replaces it.
  let falseWanted = false;
  let pendingFalse = false; // wanted and not acknowledged yet
  let falseBusy = false; // an attempt is in flight
  let falseGen = 0; // bumped to make an in-flight "false" answer obsolete
  let retryTimer = null;

  const setConfirmed = (value) => {
    if (confirmed === value) return;
    confirmed = value;
    if (typeof onConfirmedChange === 'function') {
      try {
        onConfirmedChange(value);
      } catch {
        // A listener failure must not break the reporter.
      }
    }
  };

  // The seq is taken at send time, so every attempt carries a new, greater value even with a constant clock.
  const nextSeq = () => {
    let stamp = Number(now());
    if (!Number.isSafeInteger(stamp)) stamp = 0;
    lastSeq = Math.max(stamp, lastSeq + 1);
    return lastSeq;
  };

  const callApi = async (value) => {
    try {
      const result = await api.reportAvailability(value, nextSeq());
      return result && typeof result === 'object' ? result : { ok: false };
    } catch {
      return { ok: false };
    }
  };

  const disarm = () => {
    if (timer !== null) {
      clearTimer(timer);
      timer = null;
    }
  };

  const cancelRetry = () => {
    if (retryTimer !== null) {
      clearTimer(retryTimer);
      retryTimer = null;
    }
  };

  // Drops any wanted/pending/in-flight "false" (a newer "true" replaces it, or the reporter stops).
  const dropFalse = () => {
    cancelRetry();
    falseGen += 1;
    falseWanted = false;
    pendingFalse = false;
    falseBusy = false;
  };

  // One attempt of "false" (attemptNo 0 is the initial one); on failure schedules the next retry while the
  // "false" is still wanted. A late answer of an obsolete attempt changes nothing.
  const attemptFalse = async (attemptNo) => {
    if (stopped) return;
    cancelRetry();
    falseWanted = true;
    pendingFalse = true;
    falseBusy = true;
    falseGen += 1;
    const mine = falseGen;
    const result = await callApi(false);
    if (stopped || mine !== falseGen) return;
    falseBusy = false;
    if (!falseWanted) return;
    if (result.ok === true) {
      pendingFalse = false;
      return;
    }
    if (attemptNo >= FALSE_RETRY_DELAYS_MS.length) return; // exhausted: stays pending
    retryTimer = setTimer(() => {
      retryTimer = null;
      if (stopped || !falseWanted) return;
      attemptFalse(attemptNo + 1);
    }, FALSE_RETRY_DELAYS_MS[attemptNo]);
  };

  // Re-sends a pending "false" that is not being retried right now (fresh counter).
  const retryPendingFalse = () => {
    if (stopped || effective || !pendingFalse || falseBusy || retryTimer !== null) return;
    attemptFalse(0);
  };

  // Sends "available: true" only if effective right now. Answers older than the latest change are ignored.
  const reportTrue = async () => {
    if (stopped || !effective) return;
    dropFalse();
    lastTrueReportAt = now();
    epoch += 1;
    const mine = epoch;
    const result = await callApi(true);
    if (stopped || mine !== epoch || !effective) return;
    if (result.ok === true && result.active === true) {
      setConfirmed(true);
      return;
    }
    setConfirmed(false);
    // The server may have processed the report even though the answer was lost: "false" with retry.
    attemptFalse(0);
  };

  const reportFalse = () => {
    epoch += 1;
    lastTrueReportAt = null;
    return attemptFalse(0);
  };

  const heartbeat = () => {
    if (stopped || !effective || !inForeground) return;
    if (lastTrueReportAt !== null && now() - lastTrueReportAt < MIN_HEARTBEAT_GAP_MS) return;
    reportTrue();
  };

  const arm = () => {
    if (stopped || !effective || !inForeground) {
      disarm();
      return;
    }
    if (timer !== null) return; // already armed: do not push the next heartbeat back
    timer = setTimer(() => {
      timer = null;
      heartbeat();
      arm();
    }, HEARTBEAT_INTERVAL_MS);
  };

  return {
    // Applies the latest inputs. A change of `effective` reports at once; a return to the foreground
    // sends a heartbeat (subject to the minimum gap) or retries a pending "false"; leaving the foreground
    // only stops the heartbeat timer.
    update({ effective: nextEffective, foreground: nextForeground } = {}) {
      if (stopped) return;
      const effectiveNext = nextEffective === true;
      const foregroundNext = nextForeground === true;
      const wasEffective = effective;
      const wasForeground = inForeground;
      effective = effectiveNext;
      inForeground = foregroundNext;

      if (effectiveNext !== wasEffective) {
        if (effectiveNext) {
          reportTrue();
        } else {
          setConfirmed(false);
          reportFalse();
        }
      } else if (effectiveNext && foregroundNext && !wasForeground) {
        heartbeat();
      } else if (!effectiveNext) {
        retryPendingFalse();
      }
      arm();
    },
    // The app came back to the foreground: heartbeat if effective (minimum gap applies), or retry a
    // pending "false" with a fresh counter.
    foreground() {
      if (stopped) return;
      inForeground = true;
      if (effective) heartbeat();
      else retryPendingFalse();
      arm();
    },
    // Unmount: drop timers and any in-flight answer, send nothing new, and clear the confirmation.
    stop() {
      stopped = true;
      epoch += 1;
      disarm();
      dropFalse();
      effective = false;
      inForeground = false;
      setConfirmed(false);
    },
    isConfirmed: () => confirmed,
  };
}

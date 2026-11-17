// AI-assisted: see AI_LOG.md #54
// Counter of trip saves still in flight (including their retry waits). The session reset waits for
// it to reach zero before signing out, so a slow network never loses the last trip. Pure and
// timer-free: no network, no React. trackTripSave wraps the whole save (retries included).

let pending = 0;
let waiters = [];

function release() {
  pending -= 1;
  if (pending > 0) return;
  const toWake = waiters;
  waiters = [];
  toWake.forEach((wake) => wake());
}

// Runs the save and counts it until it settles (resolve or reject). Increments synchronously.
export function trackTripSave(run) {
  pending += 1;
  let result;
  try {
    result = Promise.resolve(run());
  } catch (error) {
    result = Promise.reject(error);
  }
  return result.finally(release);
}

export function getPendingTripSaveCount() {
  return pending;
}

// Resolves when no save is in flight (immediately if none is).
export function waitForTripSaveQueue() {
  if (pending === 0) return Promise.resolve();
  return new Promise((resolve) => {
    waiters.push(resolve);
  });
}

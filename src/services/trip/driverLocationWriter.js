// AI-assisted: see docs/AI_LOG.md #44
// Serialized writer for the optional Firestore document driverLocations/{uid} (T-44). Pure: the
// write, the uid, the server timestamp and the timers are injected, so it is tested without Firebase.
//
// - Status writes (completed, cancelled, the idle value) form an ordered queue: never merged or
//   dropped, each with up to PUBLISH_STATUS_MAX_ATTEMPTS attempts and no throttle.
// - Position writes keep only the latest pending one (a newer position replaces the older, which
//   resolves false). Queuing a status drops the pending position: the status write carries the
//   latest known lat/lng anyway.
// - Every attempt has its own timeout (PUBLISH_WRITE_TIMEOUT_MS). Without connection the Firebase SDK
//   keeps its own local queue of writes that timed out here; this writer only bounds its own queue
//   and its waits, so the screen never blocks. Nothing here ever rejects.
// The Firestore rule needs lat and lng numbers in the resulting document, so a status write
// includes the latest known position when there is one.

export function createDriverLocationWriter({
  enabled = true,
  getUid,
  write, // (uid, data) => Promise (setDoc with merge)
  makeTimestamp, // () => serverTimestamp() sentinel
  config,
  setTimer = (fn, ms) => setTimeout(fn, ms),
  clearTimer = (id) => clearTimeout(id),
}) {
  const statusQueue = [];
  let pendingPosition = null;
  let lastPosition = null;
  let running = false;

  const wait = (ms) => new Promise((resolve) => setTimer(resolve, ms));

  const withTimeout = (promise, ms) =>
    new Promise((resolve, reject) => {
      const id = setTimer(() => reject(new Error('timeout')), ms);
      Promise.resolve(promise).then(
        (value) => {
          clearTimer(id);
          resolve(value);
        },
        (error) => {
          clearTimer(id);
          reject(error);
        },
      );
    });

  const positionFields = (position) =>
    position ? { lat: position.lat, lng: position.lng, timestamp: position.timestamp } : {};

  async function attempt(job) {
    const uid = getUid();
    if (!uid) return false;
    const max = job.kind === 'status' ? config.PUBLISH_STATUS_MAX_ATTEMPTS : config.PUBLISH_MAX_ATTEMPTS;
    for (let n = 1; n <= max; n += 1) {
      try {
        await withTimeout(Promise.resolve().then(() => write(uid, job.data)), config.PUBLISH_WRITE_TIMEOUT_MS);
        return true;
      } catch {
        if (job.kind === 'status' && n < max) await wait(config.PUBLISH_STATUS_RETRY_DELAY_MS);
      }
    }
    return false;
  }

  async function drain() {
    if (running) return;
    running = true;
    while (statusQueue.length > 0 || pendingPosition) {
      let job;
      if (statusQueue.length > 0) {
        job = statusQueue.shift();
      } else {
        job = pendingPosition;
        pendingPosition = null;
      }
      let ok = false;
      try {
        ok = await attempt(job);
      } catch {
        ok = false;
      }
      job.resolve(ok);
    }
    running = false;
  }

  return {
    // Throttled by the trip controller; only the latest pending position is kept.
    publishPosition(position, tripStatus) {
      if (!enabled || !position) return Promise.resolve(false);
      lastPosition = position;
      return new Promise((resolve) => {
        if (pendingPosition) pendingPosition.resolve(false);
        pendingPosition = {
          kind: 'position',
          resolve,
          data: { ...positionFields(position), tripStatus: tripStatus ?? null, updatedAt: makeTimestamp() },
        };
        drain();
      });
    },

    // Final status or the idle value: ordered, never dropped, no throttle.
    publishStatus(tripStatus, position) {
      if (!enabled) return Promise.resolve(false);
      if (position) lastPosition = position;
      return new Promise((resolve) => {
        if (pendingPosition) {
          pendingPosition.resolve(false);
          pendingPosition = null;
        }
        statusQueue.push({
          kind: 'status',
          resolve,
          data: { ...positionFields(lastPosition), tripStatus: tripStatus ?? null, updatedAt: makeTimestamp() },
        });
        drain();
      });
    },

    // For tests and diagnostics.
    pendingCount: () => statusQueue.length + (pendingPosition ? 1 : 0),
  };
}

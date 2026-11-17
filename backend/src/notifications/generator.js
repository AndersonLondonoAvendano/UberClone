// AI-assisted: see docs/AI_LOG.md #70
// AI-assisted: see docs/AI_LOG.md #72
// In-memory generator of automatic simulated requests, one entry per uid.
// Clock, random, timers, sending and eligibility are injected so it can be tested without real waiting.
// Nothing here logs tokens, uids or bodies.

// Random integer delay in ms inside [minMs, maxMs]; `random` returns a value in [0, 1).
function pickDelay(random, minMs, maxMs) {
  return minMs + Math.floor(random() * (maxMs - minMs + 1));
}

const ACCEPTED_PRUNE_LIMIT = 1000;

export function createAvailabilityGenerator({
  now = () => Date.now(),
  random = Math.random,
  setTimeout: schedule = globalThis.setTimeout,
  clearTimeout: cancelTimer = globalThis.clearTimeout,
  send,
  isEligible,
  config,
}) {
  // uid -> { timer, count, lastReportAt, capped }
  const entries = new Map();
  // uid -> { seq, available, at }: last accepted report (in memory only).
  const accepted = new Map();
  let closed = false;

  function drop(uid) {
    const entry = entries.get(uid);
    if (!entry) return;
    if (entry.timer !== null) cancelTimer(entry.timer);
    entry.timer = null;
    entries.delete(uid);
  }

  function arm(uid, entry, minMs, maxMs) {
    const handle = schedule(() => {
      fire(uid, entry).catch(() => {});
    }, pickDelay(random, minMs, maxMs));
    handle?.unref?.();
    entry.timer = handle;
  }

  const isCurrent = (uid, entry) => !closed && entries.get(uid) === entry;

  async function fire(uid, entry) {
    entry.timer = null;
    if (!isCurrent(uid, entry)) return;
    // Barrier: the last accepted report must still be "available"; otherwise nothing is sent.
    if (accepted.get(uid)?.available !== true) {
      drop(uid);
      return;
    }
    // A missing heartbeat for too long stops the generator.
    if (now() - entry.lastReportAt > config.heartbeatMaxMs) {
      drop(uid);
      return;
    }
    let eligible;
    try {
      eligible = await isEligible(uid);
    } catch {
      // Transient failure: skip this send and try again later; the heartbeat limit still bounds it.
      if (isCurrent(uid, entry)) arm(uid, entry, config.nextMinMs, config.nextMaxMs);
      return;
    }
    if (!isCurrent(uid, entry)) return;
    if (accepted.get(uid)?.available !== true) {
      drop(uid);
      return;
    }
    if (!eligible) {
      drop(uid);
      return;
    }
    // Every attempt counts toward the cap, even if the send fails or the request later expires.
    entry.count += 1;
    try {
      await send(uid);
    } catch {
      // A failed send never breaks the generator.
    }
    if (!isCurrent(uid, entry)) return;
    if (entry.count >= config.maxPerSession) {
      entry.capped = true;
      return;
    }
    arm(uid, entry, config.nextMinMs, config.nextMaxMs);
  }

  // True when a report carries a seq that is not newer than the last accepted one for the uid.
  function isStale(uid, seq) {
    if (seq === undefined) return false;
    const last = accepted.get(uid);
    return last !== undefined && last.seq !== undefined && seq <= last.seq;
  }

  // Bounded memory: past the limit, forget uids that have no live entry and have been silent for a long time.
  function pruneAccepted() {
    if (accepted.size <= ACCEPTED_PRUNE_LIMIT) return;
    const cutoff = now() - 2 * config.heartbeatMaxMs;
    for (const [uid, state] of accepted) {
      if (state.at < cutoff && !entries.has(uid)) accepted.delete(uid);
    }
  }

  return {
    isStale,

    // Last accepted seq of the uid (a safe integer) or null when none is known. Never returns anything else
    // about the uid: the route uses it so the app can recover from an obsolete seq (D-199).
    lastSeq(uid) {
      const seq = accepted.get(uid)?.seq;
      return Number.isSafeInteger(seq) ? seq : null;
    },

    // Returns true when a generator is active (or capped, waiting for an unavailable report) for the uid.
    // `seq` is optional; a report with a seq <= the last accepted one is ignored before any effect.
    report(uid, available, seq) {
      if (closed) return false;
      if (isStale(uid, seq)) return entries.has(uid);
      accepted.set(uid, { seq: seq ?? accepted.get(uid)?.seq, available: available === true, at: now() });
      pruneAccepted();
      if (available !== true) {
        drop(uid);
        return false;
      }
      const existing = entries.get(uid);
      if (existing) {
        // Repeated "available": only refresh the heartbeat; no new timer, counter untouched.
        existing.lastReportAt = now();
        return true;
      }
      const entry = { timer: null, count: 0, lastReportAt: now(), capped: false };
      entries.set(uid, entry);
      arm(uid, entry, config.firstMinMs, config.firstMaxMs);
      return true;
    },

    cancel(uid) {
      drop(uid);
    },

    close() {
      closed = true;
      for (const uid of [...entries.keys()]) drop(uid);
      accepted.clear();
    },

    has(uid) {
      return entries.has(uid);
    },
  };
}

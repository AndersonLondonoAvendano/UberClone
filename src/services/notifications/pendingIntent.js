// AI-assisted: see docs/AI_LOG.md #64
// Holds the request a tapped notification wants to open until the app is ready to decide (T-178,
// DP-64). It lives in memory only and is bound to a uid: take(currentUid) always empties it and
// returns null if the uid differs, so a notification for account A never opens under account B.
// A requestId already consumed is ignored, so the same notification cannot reopen twice.

const CONSUMED_MAX = 50;

export function createPendingIntent() {
  let intent = null;
  const consumed = [];

  return {
    set(next) {
      if (!next || typeof next.requestId !== 'string' || typeof next.targetUid !== 'string') return false;
      if (consumed.includes(next.requestId)) return false;
      intent = next;
      return true;
    },
    // Reads and clears. Returns the intent only when it belongs to `currentUid`.
    take(currentUid) {
      const taken = intent;
      intent = null;
      if (!taken) return null;
      if (!currentUid || taken.targetUid !== currentUid) return null;
      consumed.push(taken.requestId);
      if (consumed.length > CONSUMED_MAX) consumed.shift();
      return taken;
    },
    peek() {
      return intent;
    },
    // Sign-out: nothing from the previous account survives.
    reset() {
      intent = null;
    },
  };
}

export const pendingIntent = createPendingIntent();

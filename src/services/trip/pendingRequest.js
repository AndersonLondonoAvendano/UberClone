// AI-assisted: see docs/AI_LOG.md #43
// One incoming request at a time (T-43). Pure and injectable for tests: a request offered while
// another is pending is ignored ('busy'); an already expired one is dropped ('expired'); a pending
// request is removed by itself when it expires, so a stale card is never offered again.

export const OFFER_RESULT = {
  OFFERED: 'offered',
  BUSY: 'busy',
  EXPIRED: 'expired',
  DUPLICATE: 'duplicate',
};

// Ids already offered are remembered (bounded) so a redelivered or reopened push is not shown twice.
export const SEEN_REQUEST_IDS_MAX = 50;

export function createPendingRequestGate({
  now = () => Date.now(),
  setTimer = (fn, ms) => setTimeout(fn, ms),
  clearTimer = (id) => clearTimeout(id),
  onChange = () => {},
} = {}) {
  let pending = null;
  let timer = null;
  const seen = [];

  const remember = (id) => {
    if (id === undefined || id === null) return;
    seen.push(id);
    if (seen.length > SEEN_REQUEST_IDS_MAX) seen.shift();
  };

  const clear = () => {
    if (timer !== null) clearTimer(timer);
    timer = null;
    if (pending) {
      pending = null;
      onChange(null);
    }
  };

  return {
    offer(request) {
      if (!request || typeof request.expiresAt !== 'number') return OFFER_RESULT.EXPIRED;
      if (request.id !== undefined && seen.includes(request.id)) return OFFER_RESULT.DUPLICATE;
      if (request.expiresAt <= now()) return OFFER_RESULT.EXPIRED;
      if (pending && pending.expiresAt > now()) return OFFER_RESULT.BUSY;
      clear();
      pending = request;
      remember(request.id);
      timer = setTimer(() => {
        timer = null;
        clear();
      }, request.expiresAt - now());
      onChange(pending);
      return OFFER_RESULT.OFFERED;
    },
    // Frees the slot when the driver decided (or left) the given request.
    release(id) {
      if (pending && (id === undefined || pending.id === id)) clear();
    },
    // AI-assisted: see docs/AI_LOG.md #66
    // Replaces the pending request with a newer copy of the SAME id (final route metrics). The expiry timer
    // and the seen ids are untouched. Returns true when it replaced something.
    update(request) {
      if (!pending || !request || pending.id !== request.id) return false;
      pending = request;
      onChange(pending);
      return true;
    },
    get() {
      return pending;
    },
    dispose() {
      if (timer !== null) clearTimer(timer);
      timer = null;
      pending = null;
    },
  };
}

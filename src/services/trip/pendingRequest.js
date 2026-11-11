// AI-assisted: see docs/AI_LOG.md #43
// One incoming request at a time (T-43). Pure and injectable for tests: a request offered while
// another is pending is ignored ('busy'); an already expired one is dropped ('expired'); a pending
// request is removed by itself when it expires, so a stale card is never offered again.

export const OFFER_RESULT = {
  OFFERED: 'offered',
  BUSY: 'busy',
  EXPIRED: 'expired',
};

export function createPendingRequestGate({
  now = () => Date.now(),
  setTimer = (fn, ms) => setTimeout(fn, ms),
  clearTimer = (id) => clearTimeout(id),
  onChange = () => {},
} = {}) {
  let pending = null;
  let timer = null;

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
      if (request.expiresAt <= now()) return OFFER_RESULT.EXPIRED;
      if (pending && pending.expiresAt > now()) return OFFER_RESULT.BUSY;
      clear();
      pending = request;
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

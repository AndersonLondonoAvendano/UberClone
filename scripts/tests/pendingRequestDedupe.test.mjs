// AI-assisted: see AI_LOG.md #64
// Plain Node test for the dedupe of the pending request gate (T-177). Injected clock and timers.
//   node scripts/tests/pendingRequestDedupe.test.mjs
import assert from 'node:assert/strict';
import './helpers/registerSrcLoader.mjs';

const { createPendingRequestGate, OFFER_RESULT, SEEN_REQUEST_IDS_MAX } = await import('../../src/services/trip/pendingRequest.js');

const makeGate = () => {
  let t = 1000;
  const timers = new Map();
  let nextTimer = 1;
  const gate = createPendingRequestGate({
    now: () => t,
    setTimer: (fn, ms) => { timers.set(nextTimer, { fn, at: t + ms }); return nextTimer++; },
    clearTimer: (id) => timers.delete(id),
  });
  const advance = (ms) => {
    t += ms;
    for (const [id, tm] of [...timers]) if (tm.at <= t) { timers.delete(id); tm.fn(); }
  };
  return { gate, advance, now: () => t };
};
const req = (id, expiresAt) => ({ id, expiresAt });

// A seen id is a duplicate even after release.
{
  const { gate } = makeGate();
  assert.equal(gate.offer(req('a', 5000)), OFFER_RESULT.OFFERED);
  gate.release('a');
  assert.equal(gate.offer(req('a', 5000)), OFFER_RESULT.DUPLICATE);
}

// A seen id is a duplicate even after it expired by itself.
{
  const { gate, advance } = makeGate();
  gate.offer(req('a', 2000));
  advance(12000); // D-202: the slot lives until expiresAt + 10 s of clock tolerance
  assert.equal(gate.get(), null);
  assert.equal(gate.offer(req('a', 9000)), OFFER_RESULT.DUPLICATE);
}

// While pending, the same id is a duplicate and a different id is busy (busy is not remembered).
{
  const { gate } = makeGate();
  gate.offer(req('a', 5000));
  assert.equal(gate.offer(req('a', 5000)), OFFER_RESULT.DUPLICATE);
  assert.equal(gate.offer(req('b', 5000)), OFFER_RESULT.BUSY);
  gate.release('a');
  assert.equal(gate.offer(req('b', 5000)), OFFER_RESULT.OFFERED);
}

// Expired offers are not remembered.
{
  const { gate } = makeGate();
  assert.equal(gate.offer(req('x', -20000)), OFFER_RESULT.EXPIRED); // D-202: beyond the clock tolerance
  assert.equal(gate.offer(req('x', 5000)), OFFER_RESULT.OFFERED);
}

// The memory is bounded: the oldest id is forgotten past the limit.
{
  const { gate } = makeGate();
  assert.equal(SEEN_REQUEST_IDS_MAX, 50);
  for (let i = 0; i <= SEEN_REQUEST_IDS_MAX; i++) {
    assert.equal(gate.offer(req(`id-${i}`, 5000)), OFFER_RESULT.OFFERED);
    gate.release(`id-${i}`);
  }
  assert.equal(gate.offer(req('id-0', 5000)), OFFER_RESULT.OFFERED);
  gate.release('id-0');
  assert.equal(gate.offer(req(`id-${SEEN_REQUEST_IDS_MAX}`, 5000)), OFFER_RESULT.DUPLICATE);
}

console.log('pendingRequestDedupe: OK');

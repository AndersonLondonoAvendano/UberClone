// AI-assisted: see docs/AI_LOG.md #64
// Plain Node test for offerPushThroughGate (S3 fix, D-135): gate first, adopt second, release on refusal.
//   node scripts/tests/pushOffer.test.mjs
import assert from 'node:assert/strict';
import './helpers/registerSrcLoader.mjs';

const { createPendingRequestGate } = await import('../../src/services/trip/pendingRequest.js');
const { offerPushThroughGate } = await import('../../src/services/trip/pushOffer.js');

const NOW = 1000;
const makeGate = () =>
  createPendingRequestGate({ now: () => NOW, setTimer: () => 1, clearTimer: () => {} });
const req = (id) => ({ id, expiresAt: NOW + 90000 });

// Adopted: becomes pending.
{
  const gate = makeGate();
  const calls = [];
  const ok = offerPushThroughGate({ gate, request: req('a'), adopt: (r) => (calls.push(r.id), true) });
  assert.equal(ok, true);
  assert.deepEqual(calls, ['a']);
  assert.equal(gate.get().id, 'a');
}

// Duplicate: the adapter is never touched.
{
  const gate = makeGate();
  gate.offer(req('a'));
  gate.release('a');
  let adoptCalls = 0;
  const ok = offerPushThroughGate({ gate, request: req('a'), adopt: () => (adoptCalls += 1, true) });
  assert.equal(ok, false);
  assert.equal(adoptCalls, 0);
  assert.equal(gate.get(), null);
}

// Adapter refuses: the gate slot is released and nothing stays pending.
{
  const gate = makeGate();
  const ok = offerPushThroughGate({ gate, request: req('b'), adopt: () => false });
  assert.equal(ok, false);
  assert.equal(gate.get(), null);
}

// Adapter throws: same as a refusal.
{
  const gate = makeGate();
  const ok = offerPushThroughGate({
    gate,
    request: req('c'),
    adopt: () => {
      throw new Error('boom');
    },
  });
  assert.equal(ok, false);
  assert.equal(gate.get(), null);
}

// Another request pending (busy gate): adopt is not called.
{
  const gate = makeGate();
  gate.offer(req('x'));
  let adoptCalls = 0;
  const ok = offerPushThroughGate({ gate, request: req('y'), adopt: () => (adoptCalls += 1, true) });
  assert.equal(ok, false);
  assert.equal(adoptCalls, 0);
  assert.equal(gate.get().id, 'x');
}

console.log('pushOffer tests passed');

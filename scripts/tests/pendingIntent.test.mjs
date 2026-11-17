// AI-assisted: see docs/AI_LOG.md #64
// Plain Node test for the pending intent bound to a uid (T-178, DP-64).
//   node scripts/tests/pendingIntent.test.mjs
import assert from 'node:assert/strict';
import './helpers/registerSrcLoader.mjs';

const { createPendingIntent } = await import('../../src/services/notifications/pendingIntent.js');
const make = (requestId, targetUid = 'A') => ({ requestId, targetUid, expiresAt: 1 });

{
  const p = createPendingIntent();
  assert.equal(p.take('A'), null);
  assert.equal(p.set(make('r1')), true);
  assert.equal(p.take('A').requestId, 'r1');
  assert.equal(p.take('A'), null); // always clears
}

// Another uid gets nothing and the intent is gone.
{
  const p = createPendingIntent();
  p.set(make('r1', 'A'));
  assert.equal(p.take('B'), null);
  assert.equal(p.take('A'), null);
}

// No session yet: nothing is delivered.
{
  const p = createPendingIntent();
  p.set(make('r1'));
  assert.equal(p.take(null), null);
}

// A consumed requestId is ignored afterwards; one never delivered is not.
{
  const p = createPendingIntent();
  p.set(make('r1'));
  p.take('A');
  assert.equal(p.set(make('r1')), false);
  assert.equal(p.take('A'), null);
  p.set(make('r2', 'A'));
  p.take('B');
  assert.equal(p.set(make('r2', 'A')), true);
}

// Garbage is refused; a newer intent replaces the older; reset empties.
{
  const p = createPendingIntent();
  assert.equal(p.set(null), false);
  assert.equal(p.set({ requestId: 1 }), false);
  p.set(make('r1'));
  p.set(make('r2'));
  assert.equal(p.take('A').requestId, 'r2');
  p.set(make('r3'));
  p.reset();
  assert.equal(p.take('A'), null);
}

console.log('pendingIntent: OK');

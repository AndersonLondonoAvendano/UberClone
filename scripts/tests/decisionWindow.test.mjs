// AI-assisted: see AI_LOG.md #64
// Plain Node test for the 15 s decision window (T-194, D-137).
//   node scripts/tests/decisionWindow.test.mjs
import assert from 'node:assert/strict';
import './helpers/registerSrcLoader.mjs';

const { createDecisionWindow } = await import('../../src/services/trip/decisionWindow.js');
const { REQUEST_DECISION_WINDOW_MS } = await import('../../src/config/passengerApi.js');

assert.equal(REQUEST_DECISION_WINDOW_MS, 15000);
const req = { id: 'r1', expiresAt: 1000 + 90000 };

// Counts from the first display, not from creation.
{
  const w = createDecisionWindow();
  w.markShown('r1', 40000);
  assert.equal(w.deadline(req, 45000), 55000);
  assert.equal(w.remainingMs(req, 45000), 10000);
  assert.equal(w.remainingMs(req, 55000), 0);
  assert.equal(w.remainingMs(req, 99999), 0); // never negative
}

// markShown is idempotent: the first instant wins.
{
  const w = createDecisionWindow();
  w.markShown('r1', 40000);
  w.markShown('r1', 50000);
  assert.equal(w.deadline(req, 50000), 55000);
}

// Capped by validity.
{
  const w = createDecisionWindow();
  w.markShown("r1", 85000);
  assert.equal(w.deadline(req, 86000), req.expiresAt);
  assert.equal(w.remainingMs(req, 86000), 5000);
}

// Not yet shown: the window starts from now.
{
  const w = createDecisionWindow();
  assert.equal(w.deadline(req, 20000), 35000);
}

// Invalid input is ignored; reset clears.
{
  const w = createDecisionWindow();
  w.markShown(undefined, 1);
  w.markShown('r1', NaN);
  assert.equal(w.deadline(req, 20000), 35000);
  w.markShown('r1', 20000);
  w.reset();
  assert.equal(w.deadline(req, 30000), 45000);
}

console.log('decisionWindow: OK');

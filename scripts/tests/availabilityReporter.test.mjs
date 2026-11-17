// AI-assisted: see AI_LOG.md #70
// Plain Node test for the availability reporter and its single-source wiring (T-276, CA-007-12,
// CA-007-04 app side, RA-13). Injected clock, timers and api: no real waiting, no network.
//   node scripts/tests/availabilityReporter.test.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import './helpers/registerSrcLoader.mjs';

const { createAvailabilityReporter, HEARTBEAT_INTERVAL_MS, MIN_HEARTBEAT_GAP_MS } = await import(
  '../../src/services/notifications/availabilityReporter.js'
);
const { chooseRequestSource } = await import('../../src/services/notifications/requestSource.js');

const flush = () => new Promise((resolve) => setImmediate(resolve));

function setup({ answer = () => ({ ok: true, active: true }) } = {}) {
  let time = 1_000_000;
  const timers = new Map();
  let nextId = 1;
  const calls = [];
  const confirmations = [];
  const bodies = [];
  const seqs = [];
  const api = {
    reportAvailability: async (value, seq) => {
      calls.push(value);
      seqs.push(seq);
      bodies.push({ available: value, seq });
      return answer(value, calls.length);
    },
  };
  const reporter = createAvailabilityReporter({
    api,
    now: () => time,
    setTimeout: (callback, ms) => {
      const id = nextId++;
      timers.set(id, { callback, at: time + ms });
      return id;
    },
    clearTimeout: (id) => timers.delete(id),
    onConfirmedChange: (value) => confirmations.push(value),
  });
  // Moves the clock and fires every timer that is due (a fired timer may arm the next one).
  const advance = async (ms) => {
    const target = time + ms;
    for (;;) {
      const due = [...timers.entries()].filter(([, t]) => t.at <= target).sort((a, b) => a[1].at - b[1].at)[0];
      if (!due) break;
      time = due[1].at;
      timers.delete(due[0]);
      due[1].callback();
      await flush();
    }
    time = target;
  };
  const delays = () => [...timers.values()].map((t) => t.at - time);
  return { reporter, calls, bodies, seqs, confirmations, timers, advance, delays, tick: (ms) => (time += ms) };
}

// 1. Becoming effective reports true at once and confirms only with { ok, active: true }.
{
  const t = setup();
  t.reporter.update({ effective: true, foreground: true });
  await flush();
  assert.deepEqual(t.calls, [true]);
  assert.equal(t.reporter.isConfirmed(), true);
  assert.deepEqual(t.confirmations, [true]);
}

// 2. Not confirmed: failure, active:false, thrown error. Each tries one best-effort false.
for (const answer of [
  () => ({ ok: false, error: 'offline' }),
  () => ({ ok: true, active: false }),
  () => {
    throw new Error('boom');
  },
  () => undefined,
]) {
  const t = setup({ answer: (value) => (value === true ? answer() : { ok: true, active: false }) });
  t.reporter.update({ effective: true, foreground: true });
  await flush();
  assert.equal(t.reporter.isConfirmed(), false);
  assert.deepEqual(t.calls, [true, false]);
  assert.deepEqual(t.confirmations, []);
}

// 3. Becoming not effective (switch off, trip start, notifications off or lost) reports false and clears
//    the confirmation synchronously.
{
  const t = setup();
  t.reporter.update({ effective: true, foreground: true });
  await flush();
  t.reporter.update({ effective: false, foreground: true });
  assert.equal(t.reporter.isConfirmed(), false, 'cleared before any answer');
  await flush();
  assert.deepEqual(t.calls, [true, false]);
  assert.deepEqual(t.confirmations, [true, false]);
  // Never effective: nothing is reported.
  const idle = setup();
  idle.reporter.update({ effective: false, foreground: true });
  idle.reporter.update({ effective: false, foreground: false });
  await flush();
  assert.deepEqual(idle.calls, []);
}

// 4. Trip start and end: false at the start, true again at the end (state changes never wait).
{
  const t = setup();
  t.reporter.update({ effective: true, foreground: true });
  await flush();
  t.reporter.update({ effective: false, foreground: true }); // trip starts
  await flush();
  t.reporter.update({ effective: true, foreground: true }); // trip ends right away
  await flush();
  assert.deepEqual(t.calls, [true, false, true]);
  assert.equal(t.reporter.isConfirmed(), true);
}

// 5. Heartbeat every 5 minutes in the foreground; none in the background.
{
  const t = setup();
  t.reporter.update({ effective: true, foreground: true });
  await flush();
  await t.advance(HEARTBEAT_INTERVAL_MS - 1);
  assert.deepEqual(t.calls, [true]);
  await t.advance(1);
  assert.deepEqual(t.calls, [true, true]);
  await t.advance(HEARTBEAT_INTERVAL_MS);
  assert.deepEqual(t.calls, [true, true, true]);
  t.reporter.update({ effective: true, foreground: false });
  assert.equal(t.timers.size, 0, 'no timer in the background');
  await t.advance(HEARTBEAT_INTERVAL_MS * 3);
  assert.deepEqual(t.calls, [true, true, true]);
  assert.equal(t.reporter.isConfirmed(), true, 'confirmation survives the background');
}

// 6. Return to the foreground sends a heartbeat but never closer than the minimum gap.
{
  const t = setup();
  t.reporter.update({ effective: true, foreground: true });
  await flush();
  t.reporter.update({ effective: true, foreground: false });
  t.tick(MIN_HEARTBEAT_GAP_MS - 1);
  t.reporter.update({ effective: true, foreground: true });
  await flush();
  assert.deepEqual(t.calls, [true], 'within the minimum gap: no heartbeat');
  t.reporter.update({ effective: true, foreground: false });
  t.tick(2);
  t.reporter.update({ effective: true, foreground: true });
  await flush();
  assert.deepEqual(t.calls, [true, true], 'past the gap: heartbeat');
  // The explicit foreground() entry point follows the same rule.
  t.reporter.update({ effective: true, foreground: false });
  t.reporter.foreground();
  await flush();
  assert.deepEqual(t.calls, [true, true]);
  t.tick(MIN_HEARTBEAT_GAP_MS);
  t.reporter.foreground();
  await flush();
  assert.deepEqual(t.calls, [true, true, true]);
}

// 7. A state change is never held back by the heartbeat gap.
{
  const t = setup();
  t.reporter.update({ effective: true, foreground: true });
  await flush();
  t.reporter.update({ effective: false, foreground: true });
  t.reporter.update({ effective: true, foreground: true });
  await flush();
  assert.deepEqual(t.calls, [true, false, true]);
}

// 8. A failed heartbeat clears the confirmation and tries a best-effort false; the next heartbeat can recover.
{
  let heartbeatFails = false;
  const t = setup({ answer: (value) => (value === true && heartbeatFails ? { ok: false, error: 'offline' } : { ok: true, active: value }) });
  t.reporter.update({ effective: true, foreground: true });
  await flush();
  assert.equal(t.reporter.isConfirmed(), true);
  heartbeatFails = true;
  await t.advance(HEARTBEAT_INTERVAL_MS);
  assert.equal(t.reporter.isConfirmed(), false);
  assert.deepEqual(t.calls, [true, true, false]);
  heartbeatFails = false;
  await t.advance(HEARTBEAT_INTERVAL_MS);
  assert.equal(t.reporter.isConfirmed(), true);
  assert.deepEqual(t.confirmations, [true, false, true]);
}

// 9. An obsolete answer (the value changed while the request was in flight) is ignored.
{
  let release;
  const t = setup({
    answer: (value) => (value === true ? new Promise((resolve) => (release = () => resolve({ ok: true, active: true }))) : { ok: true, active: false }),
  });
  t.reporter.update({ effective: true, foreground: true });
  await flush();
  t.reporter.update({ effective: false, foreground: true });
  release();
  await flush();
  assert.equal(t.reporter.isConfirmed(), false, 'late true answer after switching off never confirms');
  assert.deepEqual(t.confirmations, []);
}

// 10. stop() drops the timer, ignores in-flight answers and clears the confirmation.
{
  const t = setup();
  t.reporter.update({ effective: true, foreground: true });
  await flush();
  t.reporter.stop();
  assert.equal(t.timers.size, 0);
  assert.equal(t.reporter.isConfirmed(), false);
  await t.advance(HEARTBEAT_INTERVAL_MS * 2);
  t.reporter.update({ effective: true, foreground: true });
  await flush();
  assert.deepEqual(t.calls, [true], 'nothing is sent after stop');
  // At most one timer is ever armed.
  const u = setup();
  for (let i = 0; i < 5; i += 1) u.reporter.update({ effective: true, foreground: true });
  assert.equal(u.timers.size, 1);
}

// 11. The body is only { available: boolean }: no location, no uid, no personal data.
{
  const t = setup();
  t.reporter.update({ effective: true, foreground: true });
  await flush();
  t.reporter.update({ effective: false, foreground: true });
  await flush();
  for (const body of t.bodies) assert.deepEqual(Object.keys(body), ['available', 'seq']);
  assert.ok(t.bodies.every((body) => typeof body.available === 'boolean' && Number.isSafeInteger(body.seq) && body.seq > 0));
}

// 12. Never two sources, never zero while available: the reporter flag feeds chooseRequestSource and the
//     mock starts before the confirmation is lost (the flag is false from the same moment the value is).
{
  const t = setup();
  let ready = true;
  const sourceNow = (available, onTrip) =>
    chooseRequestSource({ available, onTrip, notificationsReady: ready, backendConfirmed: t.reporter.isConfirmed() });
  t.reporter.update({ effective: true, foreground: true });
  assert.equal(sourceNow(true, false), 'mock', 'before the confirmation the mock is the single source');
  await flush();
  assert.equal(sourceNow(true, false), 'server');
  // Registration lost while available: effective false clears the flag at once, the mock takes over.
  ready = false;
  t.reporter.update({ effective: false, foreground: true });
  assert.equal(sourceNow(true, false), 'mock');
  await flush();
  // Trip in progress: none, whatever the flag says.
  ready = true;
  t.reporter.update({ effective: true, foreground: true });
  await flush();
  t.reporter.update({ effective: false, foreground: true });
  assert.equal(sourceNow(true, true), 'none');
  // Switched off: none.
  assert.equal(sourceNow(false, false), 'none');
}

// 14. STOP-8 (D-198): "false" 5 s after a "true" (inside the 60 s gap) is sent at once.
{
  const t = setup();
  t.reporter.update({ effective: true, foreground: true });
  await flush();
  t.tick(5000);
  t.reporter.update({ effective: false, foreground: true });
  await flush();
  assert.deepEqual(t.calls, [true, false]);
}

// 15. seq is strictly increasing over the whole sequence, even with a constant clock, retries included.
{
  const t = setup({ answer: (value) => (value === false ? { ok: false, error: 'offline' } : { ok: true, active: true }) });
  t.reporter.update({ effective: true, foreground: true });
  await flush();
  t.reporter.update({ effective: false, foreground: true });
  await flush();
  await t.advance(1000 + 2000 + 4000);
  t.reporter.update({ effective: true, foreground: true });
  await flush();
  t.reporter.update({ effective: false, foreground: true });
  await flush();
  assert.ok(t.seqs.length >= 7, `enough calls: ${t.seqs.length}`);
  for (let i = 1; i < t.seqs.length; i += 1) assert.ok(t.seqs[i] > t.seqs[i - 1], `seq ${i} greater than the previous`);
  assert.ok(t.seqs.every((s) => Number.isSafeInteger(s) && s > 0));
}

// 16. A failed "false" is retried 3 times (1000/2000/4000) and then stops.
{
  const t = setup({ answer: (value) => (value === false ? { ok: false, error: 'offline' } : { ok: true, active: true }) });
  t.reporter.update({ effective: true, foreground: true });
  await flush();
  t.reporter.update({ effective: false, foreground: true });
  await flush();
  assert.deepEqual(t.calls, [true, false]);
  assert.deepEqual(t.delays(), [1000]);
  await t.advance(999);
  assert.equal(t.calls.length, 2, 'no retry before 1000 ms');
  await t.advance(1);
  assert.equal(t.calls.length, 3);
  assert.deepEqual(t.delays(), [2000]);
  await t.advance(2000);
  assert.equal(t.calls.length, 4);
  assert.deepEqual(t.delays(), [4000]);
  await t.advance(4000);
  assert.equal(t.calls.length, 5, 'initial attempt + 3 retries');
  assert.equal(t.timers.size, 0, 'no further retry');
  await t.advance(60_000);
  assert.deepEqual(t.calls, [true, false, false, false, false]);
}

// 17. The state going back to effective cancels the pending retry; a late answer of the old "false" is ignored.
{
  const t = setup({ answer: (value) => (value === false ? { ok: false, error: 'offline' } : { ok: true, active: true }) });
  t.reporter.update({ effective: true, foreground: true });
  await flush();
  t.reporter.update({ effective: false, foreground: true });
  await flush();
  await t.advance(1000); // retry 1 sent
  t.reporter.update({ effective: true, foreground: true });
  await flush();
  const sent = t.calls.length;
  await t.advance(60_000);
  assert.deepEqual(t.calls.slice(sent), [], 'no more false once effective again');
  assert.equal(t.calls[sent - 1], true);
  assert.equal(t.reporter.isConfirmed(), true);
  // Late answer of an obsolete false (in flight while the state flips back).
  let release;
  const late = setup({
    answer: (value, n) => (value === false && n === 2 ? new Promise((resolve) => (release = () => resolve({ ok: false }))) : { ok: true, active: true }),
  });
  late.reporter.update({ effective: true, foreground: true });
  await flush();
  late.reporter.update({ effective: false, foreground: true });
  await flush();
  late.reporter.update({ effective: true, foreground: true });
  await flush();
  release();
  await flush();
  assert.equal(late.timers.size, 1, 'only the heartbeat timer: the obsolete false schedules nothing');
  assert.deepEqual(late.calls, [true, false, true]);
}

// 18. A successful retry stops the retries.
{
  const t = setup({ answer: (value, n) => (value === false && n < 3 ? { ok: false, error: 'offline' } : { ok: true, active: false }) });
  t.reporter.update({ effective: true, foreground: true });
  await flush();
  t.reporter.update({ effective: false, foreground: true });
  await flush();
  await t.advance(1000); // call 3 succeeds
  assert.deepEqual(t.calls, [true, false, false]);
  assert.equal(t.timers.size, 0);
  await t.advance(60_000);
  assert.deepEqual(t.calls, [true, false, false]);
}

// 19. Retries exhausted: returning to the foreground (and the next update) tries again with a fresh counter.
{
  let failing = true;
  const t = setup({ answer: (value) => (value === false && failing ? { ok: false, error: 'offline' } : { ok: true, active: true }) });
  t.reporter.update({ effective: true, foreground: true });
  await flush();
  t.reporter.update({ effective: false, foreground: true });
  await flush();
  await t.advance(7000);
  assert.equal(t.calls.length, 5);
  t.reporter.update({ effective: false, foreground: false }); // goes to the background: nothing new is retried by timers
  await flush();
  await t.advance(60_000);
  const sent = t.calls.length;
  t.reporter.foreground();
  await flush();
  assert.equal(t.calls.length, sent + 1, 'foreground retries the pending false');
  assert.equal(t.calls[sent], false);
  assert.deepEqual(t.delays(), [1000], 'fresh counter');
  failing = false;
  await t.advance(1000);
  assert.equal(t.calls.length, sent + 2);
  assert.equal(t.timers.size, 0, 'acknowledged: nothing pending');
  t.reporter.foreground();
  await flush();
  assert.equal(t.calls.length, sent + 2, 'nothing pending: no more false');
  // The next relevant update (foreground change through update) also retries.
  const u = setup({ answer: (value) => (value === false ? { ok: false } : { ok: true, active: true }) });
  u.reporter.update({ effective: true, foreground: true });
  await flush();
  u.reporter.update({ effective: false, foreground: false });
  await flush();
  await u.advance(7000);
  const before = u.calls.length;
  u.reporter.update({ effective: false, foreground: true });
  await flush();
  assert.equal(u.calls.length, before + 1);
}

// 20. effective=false (switch off, trip, notifications off) never produces a "true", whatever the entry point.
for (const foreground of [true, false]) {
  const t = setup();
  t.reporter.update({ effective: false, foreground });
  t.reporter.update({ effective: false, foreground: !foreground });
  t.reporter.foreground();
  await t.advance(HEARTBEAT_INTERVAL_MS * 3);
  t.tick(MIN_HEARTBEAT_GAP_MS * 2);
  t.reporter.foreground();
  t.reporter.update({ effective: false, foreground: true });
  await flush();
  assert.ok(!t.calls.includes(true), 'no true while not effective');
  // After having been effective, the heartbeat timer and focus reports stay silent once it is not.
  const u = setup();
  u.reporter.update({ effective: true, foreground: true });
  await flush();
  u.reporter.update({ effective: false, foreground });
  await flush();
  const before = u.calls.filter((c) => c === true).length;
  await u.advance(HEARTBEAT_INTERVAL_MS * 3);
  u.tick(MIN_HEARTBEAT_GAP_MS * 2);
  u.reporter.foreground();
  u.reporter.update({ effective: false, foreground: true });
  await flush();
  assert.equal(u.calls.filter((c) => c === true).length, before, 'no true after leaving effective');
}
{
  // Static: the hook computes effective from the three inputs.
  const hook = fs.readFileSync(path.resolve(import.meta.dirname, '../../src/hooks/useRequestSource.js'), 'utf8').replace(/\/\/.*$/gm, '');
  assert.ok(
    /const effective\s*=\s*available\s*===\s*true\s*&&\s*onTrip\s*!==\s*true\s*&&\s*notificationsReady\s*;/.test(hook),
    'effective = available === true && onTrip !== true && notificationsReady',
  );
}

// 21. A lost "true" reactivates nothing: only a (retryable) false follows, never another true before the next heartbeat.
{
  const t = setup({ answer: (value) => (value === true ? { ok: false, error: 'offline' } : { ok: false, error: 'offline' }) });
  t.reporter.update({ effective: true, foreground: true });
  await flush();
  assert.deepEqual(t.calls, [true, false]);
  await t.advance(1000 + 2000 + 4000);
  assert.deepEqual(t.calls, [true, false, false, false, false], 'only false retries, no true');
  assert.equal(t.reporter.isConfirmed(), false);
  await t.advance(HEARTBEAT_INTERVAL_MS - 7000);
  assert.equal(t.calls[5], true, 'the next true is the legitimate heartbeat');
  // A "true" answer that arrives when it is no longer effective is ignored; the false carries a greater seq.
  let release;
  const late = setup({ answer: (value) => (value === true ? new Promise((resolve) => (release = () => resolve({ ok: true, active: true }))) : { ok: true, active: false }) });
  late.reporter.update({ effective: true, foreground: true });
  await flush();
  late.reporter.update({ effective: false, foreground: true });
  await flush();
  release();
  await flush();
  assert.equal(late.reporter.isConfirmed(), false);
  assert.deepEqual(late.calls, [true, false]);
  assert.ok(late.seqs[1] > late.seqs[0]);
}

// 22. stop() cancels retry timers and in-flight answers and sends nothing new.
{
  const t = setup({ answer: (value) => (value === false ? { ok: false, error: 'offline' } : { ok: true, active: true }) });
  t.reporter.update({ effective: true, foreground: true });
  await flush();
  t.reporter.update({ effective: false, foreground: true });
  await flush();
  assert.equal(t.timers.size, 1);
  t.reporter.stop();
  assert.equal(t.timers.size, 0);
  await t.advance(60_000);
  t.reporter.foreground();
  await flush();
  assert.deepEqual(t.calls, [true, false]);
  // In-flight false answered after stop(): nothing is scheduled.
  let release;
  const u = setup({ answer: (value) => (value === false ? new Promise((resolve) => (release = () => resolve({ ok: false }))) : { ok: true, active: true }) });
  u.reporter.update({ effective: true, foreground: true });
  await flush();
  u.reporter.update({ effective: false, foreground: true });
  await flush();
  u.reporter.stop();
  release();
  await flush();
  assert.equal(u.timers.size, 0);
}

// 13. Static: the reporter and the hook never use Alert, console.* or a location source.
{
  const root = path.resolve(import.meta.dirname, '../..');
  for (const file of ['src/services/notifications/availabilityReporter.js', 'src/hooks/useRequestSource.js']) {
    const code = fs.readFileSync(path.join(root, file), 'utf8').replace(/\/\/.*$/gm, '');
    assert.ok(!/\bAlert\b/.test(code), `${file}: no Alert`);
    assert.ok(!/\bconsole\./.test(code), `${file}: no console`);
    assert.ok(!/(expo-location|getLocationSource|getDriverPosition|position|latitude|longitude)/i.test(code), `${file}: no location`);
  }
}

console.log('availabilityReporter: OK');

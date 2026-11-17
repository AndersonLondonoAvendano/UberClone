// AI-assisted: see docs/AI_LOG.md #70
// Generator of automatic requests: injected clock, random and timers; no real waiting.
import assert from 'node:assert/strict';
import test from 'node:test';
import { createAvailabilityGenerator } from '../../backend/src/notifications/generator.js';
import { createFakeTimers } from './helpers/notificationsFakes.mjs';

const CONFIG = {
  firstMinMs: 8000,
  firstMaxMs: 15_000,
  nextMinMs: 35_000,
  nextMaxMs: 60_000,
  maxPerSession: 8,
  heartbeatMaxMs: 30 * 60_000,
};

const flush = () => new Promise((resolve) => setImmediate(resolve));

function setup({ random = () => 0.5, config = {}, eligible = () => true, sendImpl } = {}) {
  const timers = createFakeTimers();
  const clock = { value: 1_700_000_000_000 };
  const sent = [];
  const generator = createAvailabilityGenerator({
    now: () => clock.value,
    random: (...args) => random(...args),
    setTimeout: timers.setTimeout,
    clearTimeout: timers.clearTimeout,
    send: async (uid) => {
      sent.push(uid);
      if (sendImpl) await sendImpl(uid, sent.length);
    },
    isEligible: async (uid) => eligible(uid),
    config: { ...CONFIG, ...config },
  });
  const live = () => timers.timers.filter((t) => !t.cancelled);
  // Fires the newest live timer and lets the async handler settle.
  const fireNext = async () => {
    const pendingTimers = live();
    assert.ok(pendingTimers.length > 0, 'expected a pending timer');
    const timer = pendingTimers[pendingTimers.length - 1];
    timer.cancelled = true;
    timer.fn();
    await flush();
  };
  return { generator, timers, clock, sent, live, fireNext };
}

test('CA-007-01: first delay is inside [8, 15] s, extremes included', () => {
  const low = setup({ random: () => 0 });
  low.generator.report('u1', true);
  assert.equal(low.timers.timers[0].ms, 8000);
  const high = setup({ random: () => 0.999999 });
  high.generator.report('u1', true);
  assert.equal(high.timers.timers[0].ms, 15_000);
});

test('CA-007-01: next delays are inside [35, 60] s, extremes included', async () => {
  for (const [value, expected] of [[0, 35_000], [0.999999, 60_000]]) {
    const ctx = setup({ random: () => value });
    ctx.generator.report('u1', true);
    await ctx.fireNext();
    assert.equal(ctx.sent.length, 1);
    assert.equal(ctx.timers.timers.at(-1).ms, expected);
  }
});

test('CA-007-01: the timer is unref-ed so it never keeps the process alive', () => {
  const ctx = setup();
  ctx.generator.report('u1', true);
  assert.equal(ctx.timers.timers[0].unrefCalled, true);
});

test('CA-007-02: with cap 8 exactly 8 are sent, then more only after false then true', async () => {
  const ctx = setup();
  ctx.generator.report('u1', true);
  for (let i = 0; i < 8; i += 1) await ctx.fireNext();
  assert.equal(ctx.sent.length, 8);
  assert.equal(ctx.live().length, 0);
  ctx.generator.report('u1', true); // still capped: only refreshes the heartbeat
  assert.equal(ctx.live().length, 0);
  assert.equal(ctx.sent.length, 8);
  ctx.generator.report('u1', false);
  ctx.generator.report('u1', true);
  for (let i = 0; i < 8; i += 1) await ctx.fireNext();
  assert.equal(ctx.sent.length, 16);
  assert.equal(ctx.live().length, 0);
});

test('CA-007-03: two consecutive true reports leave one pending timer and keep the counter', async () => {
  const ctx = setup({ config: { maxPerSession: 3 } });
  assert.equal(ctx.generator.report('u1', true), true);
  assert.equal(ctx.generator.report('u1', true), true);
  assert.equal(ctx.live().length, 1);
  await ctx.fireNext();
  ctx.generator.report('u1', true);
  assert.equal(ctx.live().length, 1);
  await ctx.fireNext();
  ctx.generator.report('u1', true);
  await ctx.fireNext();
  assert.equal(ctx.sent.length, 3);
  assert.equal(ctx.live().length, 0);
});

test('CA-007-03: uids are independent', async () => {
  const ctx = setup();
  ctx.generator.report('u1', true);
  ctx.generator.report('u2', true);
  assert.equal(ctx.live().length, 2);
  ctx.generator.cancel('u1');
  assert.equal(ctx.live().length, 1);
  assert.equal(ctx.generator.has('u1'), false);
  assert.equal(ctx.generator.has('u2'), true);
});

test('CA-007-04: an unavailable report cancels the pending timer and resumes on available', async () => {
  const ctx = setup();
  ctx.generator.report('u1', true);
  assert.equal(ctx.generator.report('u1', false), false);
  assert.equal(ctx.live().length, 0);
  assert.equal(ctx.generator.has('u1'), false);
  ctx.generator.report('u1', true);
  await ctx.fireNext();
  assert.equal(ctx.sent.length, 1);
});

test('CA-007-04: a non-boolean-true value never starts the generator', () => {
  const ctx = setup();
  assert.equal(ctx.generator.report('u1', 'true'), false);
  assert.equal(ctx.generator.report('u1', 1), false);
  assert.equal(ctx.live().length, 0);
});

test('CA-007-04 / CA-007-06: not eligible when the timer fires means no send and no more timers', async () => {
  let ok = true;
  const ctx = setup({ eligible: () => ok });
  ctx.generator.report('u1', true);
  ok = false; // not approved or no tokens left
  await ctx.fireNext();
  assert.equal(ctx.sent.length, 0);
  assert.equal(ctx.live().length, 0);
  assert.equal(ctx.generator.has('u1'), false);
});

test('CA-007-06: eligibility is asked for the reporting uid only and is rechecked on every fire', async () => {
  const asked = [];
  const ctx = setup({ eligible: (uid) => (asked.push(uid), true) });
  ctx.generator.report('u1', true);
  await ctx.fireNext();
  await ctx.fireNext();
  assert.deepEqual(asked, ['u1', 'u1']);
  assert.deepEqual(ctx.sent, ['u1', 'u1']);
});

test('CA-007-06: eligibility that turns false later stops the stream', async () => {
  let calls = 0;
  const ctx = setup({ eligible: () => ++calls <= 2 });
  ctx.generator.report('u1', true);
  await ctx.fireNext();
  await ctx.fireNext();
  await ctx.fireNext();
  assert.equal(ctx.sent.length, 2);
  assert.equal(ctx.live().length, 0);
});

test('CA-007-05: without heartbeat past the maximum the generator stops', async () => {
  const ctx = setup();
  ctx.generator.report('u1', true);
  ctx.clock.value += CONFIG.heartbeatMaxMs + 1;
  await ctx.fireNext();
  assert.equal(ctx.sent.length, 0);
  assert.equal(ctx.live().length, 0);
  assert.equal(ctx.generator.has('u1'), false);
});

test('CA-007-05: a timely heartbeat keeps it running; exactly at the limit still counts as timely', async () => {
  const ctx = setup();
  ctx.generator.report('u1', true);
  ctx.clock.value += CONFIG.heartbeatMaxMs - 1;
  ctx.generator.report('u1', true); // heartbeat
  ctx.clock.value += CONFIG.heartbeatMaxMs; // exactly at the limit since the heartbeat
  await ctx.fireNext();
  assert.equal(ctx.sent.length, 1);
  assert.equal(ctx.live().length, 1);
});

test('CA-007-05: the heartbeat maximum is configurable', async () => {
  const ctx = setup({ config: { heartbeatMaxMs: 5_000 } });
  ctx.generator.report('u1', true);
  ctx.clock.value += 5_001;
  await ctx.fireNext();
  assert.equal(ctx.sent.length, 0);
});

test('CA-007-10: close cancels every timer and later reports do nothing', async () => {
  const ctx = setup();
  ctx.generator.report('u1', true);
  ctx.generator.report('u2', true);
  ctx.generator.close();
  assert.equal(ctx.live().length, 0);
  assert.equal(ctx.generator.report('u1', true), false);
  assert.equal(ctx.live().length, 0);
  assert.equal(ctx.sent.length, 0);
});

test('CA-007-10: close while a send is in flight schedules nothing afterwards', async () => {
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  const ctx = setup({ sendImpl: () => gate });
  ctx.generator.report('u1', true);
  const timer = ctx.live()[0];
  timer.cancelled = true;
  timer.fn();
  await flush();
  assert.equal(ctx.sent.length, 1);
  ctx.generator.close();
  release();
  await flush();
  assert.equal(ctx.live().length, 0);
});

test('CA-007-10: an unavailable report during a send schedules nothing afterwards', async () => {
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  const ctx = setup({ sendImpl: () => gate });
  ctx.generator.report('u1', true);
  const timer = ctx.live()[0];
  timer.cancelled = true;
  timer.fn();
  await flush();
  ctx.generator.report('u1', false);
  release();
  await flush();
  assert.equal(ctx.live().length, 0);
  assert.equal(ctx.generator.has('u1'), false);
});

test('CA-007-10 (RA-12): a send that throws does not stop the next one nor raise unhandled errors', async () => {
  const unhandled = [];
  const onUnhandled = (error) => unhandled.push(error);
  process.on('unhandledRejection', onUnhandled);
  try {
    const ctx = setup({
      sendImpl: async (_uid, n) => {
        if (n === 1) throw new Error('fcm down');
      },
    });
    ctx.generator.report('u1', true);
    await ctx.fireNext();
    assert.equal(ctx.live().length, 1);
    await ctx.fireNext();
    assert.equal(ctx.sent.length, 2);
    await flush();
  } finally {
    process.off('unhandledRejection', onUnhandled);
  }
  assert.deepEqual(unhandled, []);
});

test('CA-007-10 (RA-12): a failing send still counts toward the cap', async () => {
  const ctx = setup({
    config: { maxPerSession: 2 },
    sendImpl: async () => {
      throw new Error('fcm down');
    },
  });
  ctx.generator.report('u1', true);
  await ctx.fireNext();
  await ctx.fireNext();
  assert.equal(ctx.sent.length, 2);
  assert.equal(ctx.live().length, 0);
});

test('CA-007-10 (RA-12): an eligibility check that throws skips the send and retries later', async () => {
  let calls = 0;
  const ctx = setup({
    eligible: () => {
      calls += 1;
      if (calls === 1) throw new Error('db down');
      return true;
    },
  });
  ctx.generator.report('u1', true);
  await ctx.fireNext();
  assert.equal(ctx.sent.length, 0);
  assert.equal(ctx.live().length, 1);
  await ctx.fireNext();
  assert.equal(ctx.sent.length, 1);
});

test('D-198: false right after true stops the generator at once; nothing is sent afterwards', async () => {
  const ctx = setup();
  ctx.generator.report('u1', true, 1);
  ctx.clock.value += 5_000;
  assert.equal(ctx.generator.report('u1', false, 2), false);
  assert.equal(ctx.live().length, 0);
  // A timer that was already handed to the runtime and fires late sends nothing.
  ctx.timers.timers[0].fn();
  await flush();
  assert.equal(ctx.sent.length, 0);
  assert.equal(ctx.live().length, 0);
});

test('D-198: out of order (true 5, false 6; 6 arrives before 5) ends unavailable and 5 is ignored', async () => {
  const ctx = setup();
  assert.equal(ctx.generator.report('u1', false, 6), false);
  assert.equal(ctx.generator.report('u1', true, 5), false);
  assert.equal(ctx.live().length, 0);
  assert.equal(ctx.generator.has('u1'), false);
  assert.equal(ctx.sent.length, 0);
});

test('D-198: repeated or lower seq is ignored, higher seq is accepted, absent seq does not touch the counter', () => {
  const ctx = setup();
  ctx.generator.report('u1', true, 5);
  assert.equal(ctx.generator.report('u1', false, 5), true); // repeated: ignored, still active
  assert.equal(ctx.generator.report('u1', false, 4), true); // lower: ignored
  assert.equal(ctx.live().length, 1);
  assert.equal(ctx.generator.report('u1', true), true); // no seq: accepted
  assert.equal(ctx.generator.report('u1', false, 5), true); // counter still 5
  assert.equal(ctx.generator.report('u1', false, 6), false);
  assert.equal(ctx.live().length, 0);
});

test('D-198: a false that lands while eligibility is being checked sends nothing and schedules nothing', async () => {
  const ctx = setup({
    eligible: async () => {
      ctx.generator.report('u1', false, 2);
      return true;
    },
  });
  ctx.generator.report('u1', true, 1);
  await ctx.fireNext();
  assert.equal(ctx.sent.length, 0);
  assert.equal(ctx.live().length, 0);
  assert.equal(ctx.generator.has('u1'), false);
});

test('D-198: a send in flight does not schedule another one after a false', async () => {
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  const ctx = setup({ sendImpl: () => gate });
  ctx.generator.report('u1', true, 1);
  const timer = ctx.live()[0];
  timer.cancelled = true;
  timer.fn();
  await flush();
  ctx.generator.report('u1', false, 2);
  ctx.generator.report('u1', true, 1); // late true, stale
  release();
  await flush();
  assert.equal(ctx.sent.length, 1);
  assert.equal(ctx.live().length, 0);
});

test('D-198: the seq memory is pruned past the limit and cleared on close', () => {
  const ctx = setup();
  for (let i = 0; i < 1001; i += 1) ctx.generator.report(`old${i}`, false, 1);
  ctx.clock.value += 2 * CONFIG.heartbeatMaxMs + 1;
  ctx.generator.report('fresh', false, 1); // triggers the prune of silent uids
  assert.equal(ctx.generator.isStale('old0', 1), false); // forgotten
  assert.equal(ctx.generator.isStale('fresh', 1), true);
  ctx.generator.close();
  assert.equal(ctx.generator.isStale('fresh', 1), false);
  assert.equal(ctx.live().length, 0);
});

test('the generator source never logs and holds no console calls', async () => {
  const { readFile } = await import('node:fs/promises');
  const source = await readFile(new URL('../../backend/src/notifications/generator.js', import.meta.url), 'utf8');
  assert.equal(/console\./.test(source), false);
});

test('D-199: lastSeq returns the last accepted seq as a safe integer, or null', () => {
  const ctx = setup();
  assert.equal(ctx.generator.lastSeq('u1'), null);
  ctx.generator.report('u1', true); // no seq: nothing to remember
  assert.equal(ctx.generator.lastSeq('u1'), null);
  ctx.generator.report('u1', true, 50);
  ctx.generator.report('u1', true, 40); // ignored: the last accepted stays
  assert.equal(ctx.generator.lastSeq('u1'), 50);
  ctx.generator.report('u1', false, 60);
  assert.equal(ctx.generator.lastSeq('u1'), 60);
  ctx.generator.close();
  assert.equal(ctx.generator.lastSeq('u1'), null);
});

// AI-assisted: see docs/AI_LOG.md #74
function setupIndexed(config = {}, failing = false) {
  const timers = createFakeTimers();
  const indexes = [];
  const generator = createAvailabilityGenerator({
    now: () => 1_700_000_000_000,
    random: () => 0.5,
    setTimeout: timers.setTimeout,
    clearTimeout: timers.clearTimeout,
    send: async (uid, index) => {
      indexes.push(index);
      if (failing) throw new Error('fcm down');
    },
    isEligible: async () => true,
    config: { ...CONFIG, ...config },
  });
  const fireNext = async () => {
    const live = timers.timers.filter((t) => !t.cancelled);
    const timer = live[live.length - 1];
    timer.cancelled = true;
    timer.fn();
    await flush();
  };
  return { generator, indexes, fireNext };
}

test('D-207: send receives the 0-based index of the session, up to the cap of 8', async () => {
  const ctx = setupIndexed();
  ctx.generator.report('u1', true);
  for (let i = 0; i < 8; i += 1) await ctx.fireNext();
  assert.deepEqual(ctx.indexes, [0, 1, 2, 3, 4, 5, 6, 7]);
});

test('D-207: a new session (false then true) restarts the index at 0', async () => {
  const ctx = setupIndexed();
  ctx.generator.report('u1', true);
  await ctx.fireNext();
  await ctx.fireNext();
  ctx.generator.report('u1', false);
  ctx.generator.report('u1', true);
  await ctx.fireNext();
  assert.deepEqual(ctx.indexes, [0, 1, 0]);
});

test('D-207: a failed send still consumes its index', async () => {
  const ctx = setupIndexed({}, true);
  ctx.generator.report('u1', true);
  await ctx.fireNext();
  await ctx.fireNext();
  await ctx.fireNext();
  assert.deepEqual(ctx.indexes, [0, 1, 2]);
});

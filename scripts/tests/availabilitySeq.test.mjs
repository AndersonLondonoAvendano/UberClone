// AI-assisted: see AI_LOG.md #72
// T-283 (D-199): monotonic seq across restarts, retry with a greater seq when the backend answers
// applied:false, release-safe trace, and immediate report when the effective value turns true.
// Injected clock, storage and api: no real waiting, no network.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import './helpers/registerSrcLoader.mjs';

const { createAvailabilityReporter, HEARTBEAT_INTERVAL_MS } = await import('../../src/services/notifications/availabilityReporter.js');
const { createSeqStore, AVAILABILITY_SEQ_KEY } = await import('../../src/services/notifications/seqStore.js');
const { createNotificationsApi } = await import('../../src/services/notifications/notificationsApi.js');
const { logPushEvent } = await import('../../src/services/notifications/safeLog.js');

const ROOT = path.resolve(import.meta.dirname, '../..');
const flush = async () => {
  for (let i = 0; i < 5; i += 1) await new Promise((resolve) => setImmediate(resolve));
};

function fakeStorage({ initial = {}, failRead = false, failWrite = false, readDelay = null } = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: async (key) => {
      if (readDelay) await readDelay;
      if (failRead) throw new Error('read');
      return data.has(key) ? data.get(key) : null;
    },
    setItem: async (key, value) => {
      if (failWrite) throw new Error('write');
      data.set(key, value);
    },
  };
}

// Backend double with the D-198/D-199 rule: ignore a seq lower than or equal to the last accepted one.
function fakeBackend({ lastSeq = 0, ignoreAlways = false, omitApplied = false } = {}) {
  const state = { lastSeq, calls: [] };
  return {
    state,
    api: {
      reportAvailability: async (value, seq) => {
        state.calls.push({ value, seq });
        if (ignoreAlways || seq <= state.lastSeq) {
          return { ok: true, active: false, applied: false, lastSeq: ignoreAlways ? lastSeq : state.lastSeq };
        }
        state.lastSeq = seq;
        return omitApplied ? { ok: true, active: value } : { ok: true, active: value, applied: true };
      },
    },
  };
}

function setup({ api, storage, clock = { value: 1_000_000 }, withStore = true, trace } = {}) {
  const timers = new Map();
  let nextId = 1;
  const confirmations = [];
  const store = withStore ? createSeqStore({ storage }) : undefined;
  const reporter = createAvailabilityReporter({
    api,
    now: () => clock.value,
    setTimeout: (callback, ms) => {
      const id = nextId++;
      timers.set(id, { callback, ms });
      return id;
    },
    clearTimeout: (id) => timers.delete(id),
    onConfirmedChange: (value) => confirmations.push(value),
    seqStore: store,
    trace,
  });
  return { reporter, store, timers, confirmations, clock };
}

test('fresh install against a backend that already saw greater numbers recovers with one retry', async () => {
  const backend = fakeBackend({ lastSeq: 5_000_000 });
  const t = setup({ api: backend.api, storage: fakeStorage(), clock: { value: 1_000_000 } });
  t.reporter.update({ effective: true, foreground: true });
  await flush();
  assert.equal(backend.state.calls.length, 2);
  assert.ok(backend.state.calls[0].seq <= 5_000_000);
  assert.ok(backend.state.calls[1].seq > 5_000_000);
  assert.deepEqual(backend.state.calls.map((c) => c.value), [true, true]);
  assert.equal(t.reporter.isConfirmed(), true);
});

test('two successive restarts keep growing even when the clock is behind', async () => {
  const storage = fakeStorage();
  const backend = fakeBackend();
  const seen = [];
  const run = async (clockValue) => {
    const t = setup({ api: backend.api, storage, clock: { value: clockValue } });
    t.reporter.update({ effective: true, foreground: true });
    await flush();
    t.reporter.update({ effective: false, foreground: true });
    await flush();
    t.reporter.stop();
    seen.push(...backend.state.calls.splice(0).map((c) => c.seq));
  };
  await run(9_000_000);
  await run(2_000_000); // reinstall with an older clock
  await run(2_000_000);
  assert.equal(seen.length, 6);
  for (let i = 1; i < seen.length; i += 1) assert.ok(seen[i] > seen[i - 1], `seq ${i} greater than the previous`);
  assert.equal(Number(storage.data.get(AVAILABILITY_SEQ_KEY)), seen[seen.length - 1]);
});

test('out-of-order starts: sends wait for the stored seq and keep their order', async () => {
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  const storage = fakeStorage({ initial: { [AVAILABILITY_SEQ_KEY]: '7000000' }, readDelay: gate });
  const backend = fakeBackend();
  const t = setup({ api: backend.api, storage, clock: { value: 1_000_000 } });
  t.reporter.update({ effective: true, foreground: true });
  t.reporter.update({ effective: false, foreground: true });
  await flush();
  assert.equal(backend.state.calls.length, 0, 'nothing leaves before the stored seq is read');
  release();
  await flush();
  assert.deepEqual(backend.state.calls.map((c) => c.value), [true, false]);
  assert.ok(backend.state.calls[0].seq > 7_000_000);
  assert.ok(backend.state.calls[1].seq > backend.state.calls[0].seq);
});

test('a clock that goes back a little keeps the maximum', async () => {
  const clock = { value: 10_000 };
  const storage = fakeStorage();
  const backend = fakeBackend();
  const t = setup({ api: backend.api, storage, clock });
  t.reporter.update({ effective: true, foreground: true });
  await flush();
  clock.value = 9_000;
  t.reporter.update({ effective: false, foreground: true });
  await flush();
  const [a, b] = backend.state.calls.map((c) => c.seq);
  assert.equal(a, 10_000);
  assert.equal(b, 10_001);
  assert.equal(storage.data.get(AVAILABILITY_SEQ_KEY), '10001');
});

test('applied:false retries once with a greater seq and then stops without confirming', async () => {
  const backend = fakeBackend({ lastSeq: 9_000_000_000_000, ignoreAlways: true });
  const t = setup({ api: backend.api, storage: fakeStorage() });
  t.reporter.update({ effective: true, foreground: true });
  await flush();
  const trues = backend.state.calls.filter((c) => c.value === true);
  assert.equal(trues.length, 2, 'one report plus exactly one retry');
  assert.ok(trues[1].seq > 9_000_000_000_000);
  assert.equal(t.reporter.isConfirmed(), false);
  assert.deepEqual(t.confirmations, []);
  // Only the best-effort false (own ladder) may follow; never a third true before the heartbeat.
  for (const timer of t.timers.values()) assert.ok(timer.ms === 1000 || timer.ms === HEARTBEAT_INTERVAL_MS);
  assert.equal(backend.state.calls.filter((c) => c.value === true).length, 2);
});

test('a false ignored as obsolete is retried once with a greater seq', async () => {
  const backend = fakeBackend();
  const t = setup({ api: backend.api, storage: fakeStorage(), clock: { value: 1_000 } });
  t.reporter.update({ effective: true, foreground: true });
  await flush();
  backend.state.lastSeq = 50_000; // another install moved the backend ahead
  t.reporter.update({ effective: false, foreground: true });
  await flush();
  const falses = backend.state.calls.filter((c) => c.value === false);
  assert.equal(falses.length, 2);
  assert.ok(falses[1].seq > 50_000);
  assert.equal(backend.state.lastSeq, falses[1].seq);
  assert.equal(t.timers.size, 0, 'acknowledged: no retry ladder left');
});

test('no retry when the state changed while the ignored answer was in flight', async () => {
  const calls = [];
  let release;
  const api = {
    reportAvailability: (value, seq) => {
      calls.push({ value, seq });
      if (calls.length === 1) {
        return new Promise((resolve) => {
          release = () => resolve({ ok: true, active: false, applied: false, lastSeq: 9_000_000 });
        });
      }
      return Promise.resolve({ ok: true, active: value, applied: true });
    },
  };
  const t = setup({ api, storage: fakeStorage() });
  t.reporter.update({ effective: true, foreground: true });
  await flush();
  t.reporter.update({ effective: false, foreground: true });
  release();
  await flush();
  assert.deepEqual(calls.map((c) => c.value), [true, false], 'the obsolete true is not re-sent');
});

test('compatibility: an answer without applied counts as applied', async () => {
  const backend = fakeBackend({ omitApplied: true });
  const t = setup({ api: backend.api, storage: fakeStorage() });
  t.reporter.update({ effective: true, foreground: true });
  await flush();
  assert.equal(backend.state.calls.length, 1);
  assert.equal(t.reporter.isConfirmed(), true);
});

test('a failing store (read and write) never breaks the reporter: the clock is used alone', async () => {
  const backend = fakeBackend();
  const t = setup({ api: backend.api, storage: fakeStorage({ failRead: true, failWrite: true }), clock: { value: 4_000 } });
  t.reporter.update({ effective: true, foreground: true });
  await flush();
  assert.equal(backend.state.calls[0].seq, 4_000);
  assert.equal(t.reporter.isConfirmed(), true);
  const store = createSeqStore({ storage: fakeStorage({ failRead: true, failWrite: true }) });
  assert.equal(await store.load(), 0);
  assert.equal(await store.save(5), false);
});

test('seqStore: invalid values read as 0, writes keep order and lower values are skipped', async () => {
  for (const raw of [null, 'abc', '-5', '1.5', '99999999999999999999', '']) {
    const store = createSeqStore({ storage: fakeStorage({ initial: { [AVAILABILITY_SEQ_KEY]: raw } }) });
    assert.equal(await store.load(), 0, String(raw));
  }
  assert.equal(await createSeqStore({ storage: fakeStorage({ initial: { [AVAILABILITY_SEQ_KEY]: '123' } }) }).load(), 123);
  const storage = fakeStorage();
  const store = createSeqStore({ storage });
  const results = await Promise.all([store.save(10), store.save(5), store.save(11), store.save(11), store.save(1.5)]);
  assert.deepEqual(results, [true, false, true, false, false]);
  assert.equal(storage.data.get(AVAILABILITY_SEQ_KEY), '11');
});

test('the seq key is not a session key: nothing but seqStore references it', () => {
  const hits = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.js$/.test(entry.name) && /AVAILABILITY_SEQ_KEY|availabilityLastSeq/.test(fs.readFileSync(full, 'utf8'))) {
        hits.push(path.relative(ROOT, full).replace(/\\/g, '/'));
      }
    }
  };
  walk(path.join(ROOT, 'src'));
  assert.deepEqual(hits, ['src/services/notifications/seqStore.js']);
});

test('becoming effective (notifications on, token registered, session ready) reports at once, not after 5 minutes', async () => {
  const backend = fakeBackend();
  const t = setup({ api: backend.api, storage: fakeStorage() });
  // Available but notifications not ready yet: nothing leaves.
  t.reporter.update({ effective: false, foreground: true });
  await flush();
  assert.equal(backend.state.calls.length, 0);
  // Registration completes: effective turns true and the report leaves with no timer involved.
  t.reporter.update({ effective: true, foreground: true });
  await flush();
  assert.deepEqual(backend.state.calls.map((c) => c.value), [true]);
  assert.equal(t.reporter.isConfirmed(), true);
});

test('release-safety: reporter, hook and store do not depend on __DEV__ or the dev client', () => {
  const strip = (code) => code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  const read = (file) => strip(fs.readFileSync(path.join(ROOT, file), 'utf8'));
  for (const file of ['src/services/notifications/availabilityReporter.js', 'src/services/notifications/seqStore.js', 'src/hooks/useRequestSource.js']) {
    assert.ok(!/__DEV__|expo-dev-client|DevClient|Constants\.executionEnvironment/.test(read(file)), `${file}: no __DEV__ or dev client dependency`);
  }
  assert.ok(!/console\./.test(read('src/services/notifications/availabilityReporter.js')));
  // The only gate for printing is isDev: __DEV__ in the trace wiring.
  assert.ok(/logPushEvent\(code,\s*\{\s*isDev:\s*__DEV__/.test(read('src/services/notifications/notificationsService.js')));
  assert.ok(/trace:\s*traceAvailability/.test(read('src/hooks/useRequestSource.js')));
});

test('trace: fixed codes only; in release the logger is never called; a throwing trace is harmless', async () => {
  const codes = [];
  const backend = fakeBackend({ lastSeq: 5_000_000 });
  const t = setup({ api: backend.api, storage: fakeStorage(), trace: (code) => codes.push(code) });
  t.reporter.update({ effective: true, foreground: true });
  await flush();
  assert.deepEqual(codes, [
    'availability:sent',
    'availability:ignored-seq',
    'availability:retry-greater-seq',
    'availability:sent',
    'availability:applied',
  ]);
  for (const code of codes) assert.match(code, /^availability:[a-z-]+$/);

  const printed = [];
  const release = setup({
    api: fakeBackend().api,
    storage: fakeStorage(),
    trace: (code) => logPushEvent(code, { isDev: false, log: (m) => printed.push(m) }),
  });
  release.reporter.update({ effective: true, foreground: true });
  await flush();
  assert.deepEqual(printed, [], 'release prints nothing');
  const dev = setup({
    api: fakeBackend().api,
    storage: fakeStorage(),
    trace: (code) => logPushEvent(code, { isDev: true, log: (m) => printed.push(m) }),
  });
  dev.reporter.update({ effective: true, foreground: true });
  await flush();
  assert.deepEqual(printed, ['[push] availability:sent', '[push] availability:applied']);

  const throwing = setup({
    api: fakeBackend().api,
    storage: fakeStorage(),
    trace: () => {
      throw new Error('x');
    },
  });
  throwing.reporter.update({ effective: true, foreground: true });
  await flush();
  assert.equal(throwing.reporter.isConfirmed(), true);
});

test('notificationsApi.reportAvailability returns applied and lastSeq only with the right types', async () => {
  const make = (body) =>
    createNotificationsApi({
      fetchFn: async () => ({ status: 200, ok: true, json: async () => body }),
      getToken: async () => 'id-token',
      baseUrl: 'https://backend.example',
    });
  assert.deepEqual(await make({ active: true, applied: true }).reportAvailability(true, 5), { ok: true, active: true, applied: true });
  assert.deepEqual(await make({ active: false, applied: false, lastSeq: 77 }).reportAvailability(true, 5), {
    ok: true,
    active: false,
    applied: false,
    lastSeq: 77,
  });
  assert.deepEqual(await make({ active: true }).reportAvailability(true, 5), { ok: true, active: true });
  assert.deepEqual(await make({ active: true, applied: 'no', lastSeq: 1.5 }).reportAvailability(true, 5), { ok: true, active: true });
  assert.deepEqual(await make({ active: true, lastSeq: '9' }).reportAvailability(true, 5), { ok: true, active: true });
});

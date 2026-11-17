// AI-assisted: see docs/AI_LOG.md #64
// Fakes for the notification tests: Firestore (collections, where, transactions), messaging, clock and timers.
import { createAuth } from '../../../backend/src/auth.js';
import { createApp } from '../../../backend/src/app.js';

export function createFakeDb(initial = {}) {
  const docs = new Map(Object.entries(initial));
  const stats = { transactions: 0, wheres: [], collectionGroupCalls: 0 };
  const snapshotOf = (path) => ({ exists: docs.has(path), data: () => ({ ...docs.get(path) }) });
  const ref = (path) => ({
    path,
    get: async () => snapshotOf(path),
    delete: async () => void docs.delete(path),
  });
  return {
    docs,
    stats,
    doc: (path) => ref(path),
    collection: (name) => ({
      doc: (id) => ref(`${name}/${id}`),
      where: (field, op, value) => ({
        get: async () => {
          stats.wheres.push([name, field, op]);
          const found = [...docs].filter(([p, d]) => p.startsWith(`${name}/`) && op === '==' && d[field] === value);
          return { docs: found.map(([p, d]) => ({ id: p.slice(name.length + 1), data: () => ({ ...d }) })) };
        },
      }),
    }),
    collectionGroup: () => {
      stats.collectionGroupCalls += 1;
      throw new Error('collectionGroup must not be used');
    },
    runTransaction: async (fn) => {
      stats.transactions += 1;
      return fn({
        get: (r) => r.get(),
        set: (r, data) => void docs.set(r.path, { ...data }),
        delete: (r) => void docs.delete(r.path),
      });
    },
  };
}

// Responses are all successes unless failures maps a token to an error code.
export function createFakeMessaging({ failures = {}, throws = false } = {}) {
  const calls = [];
  return {
    calls,
    sendEachForMulticast: async (message) => {
      calls.push(message);
      if (throws) throw new Error('fcm down');
      return {
        responses: message.tokens.map((token) =>
          failures[token] ? { success: false, error: { code: failures[token] } } : { success: true, messageId: 'm' },
        ),
      };
    },
  };
}

export function createFakeTimers() {
  const timers = [];
  return {
    timers,
    setTimeout: (fn, ms) => {
      const timer = { fn, ms, cancelled: false, unrefCalled: false, unref() { this.unrefCalled = true; } };
      timers.push(timer);
      return timer;
    },
    clearTimeout: (timer) => {
      timer.cancelled = true;
    },
    fire(index = 0) {
      const timer = timers[index];
      if (!timer.cancelled) timer.fn();
    },
  };
}

export const tokenOf = (n, length = 30) => `tok-${n}-`.padEnd(length, 'x');

export const approvedDriver = { accountStatus: 'approved' };

// Starts the real express app on an ephemeral port. Tokens "good-<uid>" authenticate as that uid.
export async function startApp({ db, messaging, timers = createFakeTimers(), clock = { value: 1_700_000_000_000 }, idFactory, withNotificationsDeps = true } = {}) {
  const lines = [];
  const adminAuth = {
    verifyIdToken: async (token) => {
      if (/^good-\w+$/.test(token)) return { uid: token.slice(5) };
      throw new Error('bad token');
    },
  };
  const app = createApp({
    auth: createAuth(adminAuth),
    store: {},
    config: { maxAmountCop: 1, currency: 'COP', publicBaseUrl: 'https://x.test' },
    log: (line) => lines.push(line),
    ...(withNotificationsDeps ? { messaging, db } : {}),
    notifications: {
      now: () => clock.value,
      setTimeout: timers.setTimeout,
      clearTimeout: timers.clearTimeout,
      idFactory: idFactory ?? (() => 'req-fixed-id'),
      random: () => 0.5,
    },
  });
  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  const call = async (path, { token = 'good-u1', body, method = 'POST', raw } = {}) => {
    const headers = { 'content-type': 'application/json' };
    if (token) headers.authorization = `Bearer ${token}`;
    const response = await fetch(base + path, { method, headers, body: raw ?? (body === undefined ? undefined : JSON.stringify(body)) });
    const text = await response.text();
    return { status: response.status, text, json: text ? JSON.parse(text) : null };
  };
  return {
    app, call, lines, timers, clock,
    close: async () => {
      app.closeNotifications();
      server.closeAllConnections?.();
      await new Promise((resolve) => server.close(resolve));
    },
  };
}

// AI-assisted: see docs/AI_LOG.md #64
// POST /notifications/register, POST /notifications/unregister and POST /notifications/test-request.
// The uid comes only from the verified ID token; the body never supplies a uid, tokens, text or data.
// AI-assisted: see docs/AI_LOG.md #70
// POST /notifications/availability only takes { available: boolean }; extra fields are ignored. State is in memory only.
// AI-assisted: see docs/AI_LOG.md #72
// The availability answer is { active, applied } (D-199): applied:true when the report took effect; when it was
// ignored for an obsolete seq it is { active, applied:false, lastSeq } (HTTP 200 either way), where lastSeq is the
// last accepted seq of the uid so the app can recover. Only a seq lower than or equal to the last one is ignored.
// Nothing here logs tokens, bodies, emails or uids.
import { FCM_BATCH_SIZE, TEST_REQUEST_MAX_DELAY_S, TEST_REQUEST_RATE_LIMIT, loadAutoRequestConfig } from '../config.js';
import { ERRORS, createRateLimiter, send as defaultSend } from '../middleware.js';
import { createAvailabilityGenerator } from '../notifications/generator.js';
import { buildMessage, buildTestRequest } from '../notifications/payload.js';
import { createTokenStore, isValidPlatform, isValidPushToken } from '../notifications/tokenStore.js';

const APPROVED = 'approved';
// Error codes of the Admin SDK that mean "this token will never work again".
const STALE_TOKEN_CODES = ['messaging/registration-token-not-registered', 'messaging/invalid-registration-token'];

export function createNotificationsHandlers({
  db = null,
  messaging = null,
  now = () => Date.now(),
  setTimeout: schedule = globalThis.setTimeout,
  clearTimeout: cancel = globalThis.clearTimeout,
  idFactory,
  random,
  autoRequest = loadAutoRequestConfig({}),
}) {
  const tokens = db ? createTokenStore({ db, now }) : null;
  const testLimiter = createRateLimiter({ ...TEST_REQUEST_RATE_LIMIT, now });
  // At most one deferred test notification per uid: uid -> timer handle.
  const pending = new Map();

  // Sends one request to every token of the uid in batches, and removes only the tokens FCM reports as stale.
  async function sendToUid(uid) {
    const list = await tokens.listForUid(uid);
    if (list.length === 0) return;
    const request = buildTestRequest({ now: now(), idFactory, targetUid: uid, random });
    for (let start = 0; start < list.length; start += FCM_BATCH_SIZE) {
      const batch = list.slice(start, start + FCM_BATCH_SIZE);
      const result = await messaging.sendEachForMulticast(buildMessage(batch, request));
      const stale = [];
      result.responses.forEach((response, index) => {
        if (response.success === false && STALE_TOKEN_CODES.includes(response.error?.code)) stale.push(batch[index]);
      });
      if (stale.length > 0) await tokens.removeTokens(stale);
    }
  }

  async function isApproved(uid) {
    const driver = await db.doc(`drivers/${uid}`).get();
    return driver.exists && driver.data()?.accountStatus === APPROVED;
  }

  // One generator for all uids (in memory). It re-checks approval and tokens each time its timer fires.
  const generator = createAvailabilityGenerator({
    now,
    random: random ?? Math.random,
    setTimeout: schedule,
    clearTimeout: cancel,
    send: (uid) => sendToUid(uid),
    isEligible: async (uid) => Boolean(tokens) && Boolean(messaging) && (await isApproved(uid)) && (await tokens.listForUid(uid)).length > 0,
    config: autoRequest,
  });

  return {
    async register({ uid, body }) {
      if (!tokens) return ERRORS.server;
      if (!isValidPushToken(body?.token) || !isValidPlatform(body?.platform)) return ERRORS.invalid;
      await tokens.register(uid, body.token, body.platform);
      return { status: 200, body: { registered: true } };
    },

    // 204 whenever the token is well formed, whether it existed, was foreign or was already removed.
    async unregister({ uid, body }) {
      if (!tokens) return ERRORS.server;
      if (!isValidPushToken(body?.token)) return ERRORS.invalid;
      await tokens.unregister(uid, body.token);
      // The generator of the uid stops only when no device is left (another device keeps it alive).
      if (generator.has(uid) && (await tokens.listForUid(uid)).length === 0) generator.cancel(uid);
      return { status: 204, body: {} };
    },

    async testRequest({ uid, body }) {
      if (!tokens || !messaging) return ERRORS.server;
      if (!testLimiter.hit(`uid:${uid}`)) return ERRORS.rateLimited;
      // delaySeconds: absent means 0; anything else must be an integer from 0 to the maximum (null is rejected).
      const raw = body?.delaySeconds;
      const delaySeconds = raw === undefined ? 0 : raw;
      if (!Number.isInteger(delaySeconds) || delaySeconds < 0 || delaySeconds > TEST_REQUEST_MAX_DELAY_S) return ERRORS.invalid;
      const driver = await db.doc(`drivers/${uid}`).get();
      if (!driver.exists || driver.data()?.accountStatus !== APPROVED) return ERRORS.invalid;
      if ((await tokens.listForUid(uid)).length === 0) return ERRORS.notFound;

      if (delaySeconds === 0) {
        try {
          await sendToUid(uid);
        } catch {
          return ERRORS.upstream;
        }
        return { status: 202, body: { scheduled: true } };
      }
      if (pending.has(uid)) return ERRORS.rateLimited;
      const handle = schedule(() => {
        pending.delete(uid);
        // The tokens are read again when the timer fires; a failure is swallowed (nothing to report to).
        sendToUid(uid).catch(() => {});
      }, delaySeconds * 1000);
      handle?.unref?.();
      pending.set(uid, handle);
      return { status: 202, body: { scheduled: true } };
    },

    // Body: { available: boolean, seq?: positive safe integer }. The uid comes from the ID token. "false" is always accepted.
    // A report whose seq is not newer than the last accepted one is ignored with 200, before any effect, and
    // answers { active, applied: false, lastSeq }. Every other answer carries applied: true.
    async availability({ uid, body }) {
      const available = body?.available;
      if (typeof available !== 'boolean') return ERRORS.invalid;
      const seq = body?.seq;
      if (seq !== undefined && !(Number.isSafeInteger(seq) && seq > 0)) return ERRORS.invalid;
      const ignored = () => ({ status: 200, body: { active: generator.has(uid), applied: false, lastSeq: generator.lastSeq(uid) } });
      if (generator.isStale(uid, seq)) return ignored();
      if (!available) {
        generator.report(uid, false, seq);
        return { status: 200, body: { active: false, applied: true } };
      }
      if (!tokens || !messaging) return ERRORS.server;
      if (!(await isApproved(uid))) {
        // A newer report may have been accepted while awaiting: then this one must not cancel anything.
        if (generator.isStale(uid, seq)) return ignored();
        generator.cancel(uid);
        return ERRORS.invalid;
      }
      if ((await tokens.listForUid(uid)).length === 0) {
        if (generator.isStale(uid, seq)) return ignored();
        generator.cancel(uid);
        return ERRORS.notFound;
      }
      return { status: 200, body: { active: generator.report(uid, true, seq), applied: true } };
    },

    // Cancels every deferred send and every generator timer still waiting.
    close() {
      generator.close();
      for (const handle of pending.values()) cancel(handle);
      pending.clear();
    },
  };
}

export function registerNotificationsRoutes(app, { guard, handlers, send = defaultSend }) {
  const route = (name) => async (req, res) => {
    try {
      const guarded = await guard({ authorization: req.headers?.authorization, ip: req.ip });
      if (!guarded.uid) return send(res, guarded);
      return send(res, await handlers[name]({ uid: guarded.uid, body: req.body }));
    } catch {
      return send(res, ERRORS.server);
    }
  };
  app.post('/notifications/register', route('register'));
  app.post('/notifications/unregister', route('unregister'));
  app.post('/notifications/test-request', route('testRequest'));
  app.post('/notifications/availability', route('availability'));
}

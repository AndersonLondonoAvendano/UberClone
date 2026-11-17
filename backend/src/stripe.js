// AI-assisted: see docs/AI_LOG.md #58
// Stripe Checkout over native fetch and node:crypto (no SDK). Pure functions first (amount conversion,
// form encoding, session-to-state mapping, webhook signature), then the HTTP client at the end.
import { createHmac, timingSafeEqual } from 'node:crypto';
import { MAX_AMOUNT_COP, SIGNATURE_TOLERANCE_SEC } from './config.js';

// Stripe's minimum charge is 0.50 in any two-decimal currency, that is 50 minor units.
const MIN_UNIT_AMOUNT = 50;

// Converts a whole-peso charge amount (fare + tip, read from Firestore) into Stripe's minor units. COP is a two-decimal currency (inferred from
// the currencies page: it is not one of the listed exceptions), so 10 000 COP -> 1 000 000.
// Fallback (test only): currency 'usd' with a positive copPerUsd written by the operator.
// Returns { amount, currency } or null for anything invalid, over the cap, or below the minimum.
export function toStripeUnitAmount(fareCop, { currency = 'cop', copPerUsd, maxAmountCop = MAX_AMOUNT_COP } = {}) {
  if (!Number.isInteger(fareCop) || fareCop <= 0 || fareCop > maxAmountCop) return null;
  if (typeof currency !== 'string') return null;
  const code = currency.toLowerCase();
  let amount;
  if (code === 'cop') {
    amount = fareCop * 100;
  } else if (code === 'usd') {
    if (typeof copPerUsd !== 'number' || !Number.isFinite(copPerUsd) || copPerUsd <= 0) return null;
    amount = Math.round((fareCop * 100) / copPerUsd);
  } else {
    return null;
  }
  if (!Number.isSafeInteger(amount) || amount < MIN_UNIT_AMOUNT) return null;
  return { amount, currency: code };
}

// application/x-www-form-urlencoded with bracket notation: { a: { b: 1 }, c: [x] } -> a[b]=1&c[0]=x.
// null and undefined values are skipped. Key segments and values are percent-encoded.
export function encodeForm(object) {
  const pairs = [];
  const walk = (value, path) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((item, index) => walk(item, `${path}[${index}]`));
      return;
    }
    if (typeof value === 'object') {
      for (const [key, inner] of Object.entries(value)) {
        walk(inner, path === '' ? encodeURIComponent(key) : `${path}[${encodeURIComponent(key)}]`);
      }
      return;
    }
    pairs.push(`${path}=${encodeURIComponent(String(value))}`);
  };
  walk(object ?? {}, '');
  return pairs.join('&');
}

// Maps a Checkout Session to { status, id, matches }. Conservative: only payment_status "paid" is
// approved; an expired session or a payment intent with a last error is rejected; the rest is pending.
// matches is true only when the session really belongs to this trip (reference, amount, currency).
export function mapStripeSession(session, { tripId, expectedAmount, expectedCurrency } = {}) {
  if (session === null || typeof session !== 'object') return { status: 'pending', id: null, matches: false };

  let status = 'pending';
  if (session.payment_status === 'paid') status = 'approved';
  else if (session.status === 'expired') status = 'rejected';
  else if (session.payment_intent && typeof session.payment_intent === 'object' && session.payment_intent.last_payment_error) {
    status = 'rejected';
  }

  const currency = typeof session.currency === 'string' ? session.currency.toLowerCase() : null;
  const matches =
    typeof tripId === 'string' &&
    session.client_reference_id === tripId &&
    Number.isInteger(expectedAmount) &&
    session.amount_total === expectedAmount &&
    typeof expectedCurrency === 'string' &&
    currency === expectedCurrency.toLowerCase();

  return { status, id: typeof session.id === 'string' ? session.id : null, matches };
}

// Verifies the Stripe-Signature header ("t=<unix seconds>,v1=<hex>[,v1=...][,v0=...]") over the signed
// payload `<t>.<raw body>` with HMAC-SHA256. Unknown entries and v0 are ignored; any valid v1 passes;
// comparison is constant time. Returns false for any problem, including a missing secret.
export function verifyStripeSignature({ rawBody, header, secret, now = Date.now(), toleranceSec = SIGNATURE_TOLERANCE_SEC }) {
  if (typeof secret !== 'string' || secret === '') return false;
  if (typeof header !== 'string' || header === '') return false;
  const body = typeof rawBody === 'string' ? Buffer.from(rawBody, 'utf8') : rawBody;
  if (!Buffer.isBuffer(body) && !(body instanceof Uint8Array)) return false;

  let timestamp = null;
  const candidates = [];
  for (const part of header.split(',')) {
    const separator = part.indexOf('=');
    if (separator < 0) continue;
    const key = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (key === 't' && timestamp === null) timestamp = value;
    if (key === 'v1') candidates.push(value);
  }
  if (timestamp === null || !/^\d{1,15}$/.test(timestamp) || candidates.length === 0) return false;
  if (Math.abs(now - Number(timestamp) * 1000) > toleranceSec * 1000) return false;

  const expected = createHmac('sha256', secret).update(Buffer.concat([Buffer.from(`${timestamp}.`, 'utf8'), body])).digest();
  let valid = false;
  for (const candidate of candidates) {
    if (!/^[0-9a-f]+$/i.test(candidate) || candidate.length !== expected.length * 2) continue;
    if (timingSafeEqual(expected, Buffer.from(candidate, 'hex'))) valid = true;
  }
  return valid;
}

const API_BASE = 'https://api.stripe.com';
const REQUEST_TIMEOUT_MS = 10_000;
// expires_at must be at least 30 minutes ahead; one extra minute absorbs clock and latency drift.
const SESSION_TTL_SEC = 31 * 60;
const SESSION_ID = /^cs_[A-Za-z0-9_]{1,200}$/;
const PRODUCT_NAME = 'Viaje UberClone (pago de prueba)';

export function isStripeSessionId(value) {
  return typeof value === 'string' && SESSION_ID.test(value);
}

// Carries only the HTTP status (0 = network failure or timeout). No message, URL, headers or body,
// so the secret key can never leak through an error.
export class StripeError extends Error {
  constructor(status) {
    super('stripe_request_failed');
    this.name = 'StripeError';
    this.status = status;
  }
}

export function createStripeClient({ secretKey, fetch: fetchImpl = globalThis.fetch, now = Date.now }) {
  // Basic auth with the secret key as user and an empty password, the documented form.
  const authorization = `Basic ${Buffer.from(`${secretKey}:`, 'utf8').toString('base64')}`;

  async function request(method, path, { body, idempotencyKey } = {}) {
    const headers = { Authorization: authorization };
    if (body !== undefined) headers['Content-Type'] = 'application/x-www-form-urlencoded';
    if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
    let response;
    try {
      response = await fetchImpl(`${API_BASE}${path}`, {
        method,
        headers,
        body,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch {
      throw new StripeError(0);
    }
    if (!response.ok) throw new StripeError(response.status);
    try {
      return await response.json();
    } catch {
      throw new StripeError(response.status);
    }
  }

  return {
    // Returns { id, url } of a one-line Checkout payment. tripId and uid travel in client_reference_id
    // and metadata; everything is revalidated against the trip document when the state is read.
    async createCheckoutSession({ tripId, uid, amount, currency, successUrl, cancelUrl, idempotencyKey }) {
      const form = encodeForm({
        mode: 'payment',
        line_items: [
          { price_data: { currency, product_data: { name: PRODUCT_NAME }, unit_amount: amount }, quantity: 1 },
        ],
        client_reference_id: tripId,
        metadata: { tripId, uid },
        success_url: successUrl,
        cancel_url: cancelUrl,
        expires_at: Math.floor(now() / 1000) + SESSION_TTL_SEC,
      });
      const result = await request('POST', '/v1/checkout/sessions', { body: form, idempotencyKey });
      if (typeof result?.id !== 'string' || result.id === '' || typeof result?.url !== 'string' || result.url === '') {
        throw new StripeError(502);
      }
      return { id: result.id, url: result.url };
    },

    // Raw session object with the payment intent expanded (the expansion follows the API's general
    // convention; without it a rejected card simply reads as pending).
    async getCheckoutSession(id) {
      if (!isStripeSessionId(id)) throw new StripeError(400);
      return request('GET', `/v1/checkout/sessions/${encodeURIComponent(id)}?expand[]=payment_intent`);
    },
  };
}

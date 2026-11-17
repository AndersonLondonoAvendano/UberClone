// AI-assisted: see AI_LOG.md #55
// Mercado Pago client over native fetch (no SDK). The access token is only used in the
// Authorization header and is never logged or placed in errors.
import { createHmac, timingSafeEqual } from 'node:crypto';
import { chargeAmount } from './chargeAmount.js';
import { SIGNATURE_TOLERANCE_SEC } from './config.js';
// AI-assisted: see AI_LOG.md #61 (amount match uses fare + tip)

const API_BASE = 'https://api.mercadopago.com';
const REQUEST_TIMEOUT_MS = 10_000;

export class MercadoPagoError extends Error {
  constructor(status) {
    super('mercadopago_request_failed');
    this.name = 'MercadoPagoError';
    this.status = status;
  }
}

// Conservative mapping: anything not listed (refunded, undefined, unknown text) stays pending.
export function mapPaymentStatus(status) {
  if (status === 'approved') return 'approved';
  if (status === 'rejected' || status === 'cancelled') return 'rejected';
  return 'pending';
}

function normalizePayment(raw) {
  return {
    id: String(raw.id),
    status: raw.status,
    mappedStatus: mapPaymentStatus(raw.status),
    externalReference: typeof raw.external_reference === 'string' ? raw.external_reference : null,
    amount: raw.transaction_amount,
    currency: raw.currency_id,
    uid: typeof raw.metadata?.uid === 'string' ? raw.metadata.uid : null,
  };
}

function headerValue(headers, name) {
  if (!headers) return undefined;
  const value = typeof headers.get === 'function' ? headers.get(name) : headers[name];
  return Array.isArray(value) ? value[0] : value;
}

// Checks x-signature ("ts=...,v1=...") over the manifest `id:<dataId>;request-id:<id>;ts:<ts>;`
// (absent parts are dropped). Returns false for any problem, including a missing secret.
export function verifySignature({ headers, dataId, secret, now = Date.now(), toleranceSec = SIGNATURE_TOLERANCE_SEC }) {
  if (!secret) return false;
  const signature = headerValue(headers, 'x-signature');
  if (typeof signature !== 'string') return false;

  let ts;
  let v1;
  for (const part of signature.split(',')) {
    const [key, ...rest] = part.split('=');
    const value = rest.join('=').trim();
    if (key.trim() === 'ts') ts = value;
    if (key.trim() === 'v1') v1 = value;
  }
  if (!ts || !v1 || !/^\d+$/.test(ts) || !/^[0-9a-f]+$/i.test(v1)) return false;

  // ts may be in milliseconds or seconds.
  const tsMs = Number(ts) > 1e11 ? Number(ts) : Number(ts) * 1000;
  if (Math.abs(now - tsMs) > toleranceSec * 1000) return false;

  const requestId = headerValue(headers, 'x-request-id');
  let manifest = '';
  if (dataId !== undefined && dataId !== null && String(dataId) !== '') {
    const id = String(dataId);
    manifest += `id:${/^[A-Za-z0-9]+$/.test(id) ? id.toLowerCase() : id};`;
  }
  if (requestId) manifest += `request-id:${requestId};`;
  manifest += `ts:${ts};`;

  const expected = createHmac('sha256', secret).update(manifest).digest();
  if (v1.length !== expected.length * 2) return false;
  return timingSafeEqual(expected, Buffer.from(v1, 'hex'));
}

// True when the payment really belongs to this trip: reference, amount and currency all match.
export function paymentMatchesTrip(payment, tripId, trip, currency) {
  return (
    payment.externalReference === tripId &&
    payment.currency === currency &&
    Number.isFinite(payment.amount) &&
    payment.amount === chargeAmount(trip)
  );
}

export function createMercadoPagoClient({ accessToken, fetch: fetchImpl = globalThis.fetch }) {
  async function request(method, path, body) {
    let response;
    try {
      response = await fetchImpl(`${API_BASE}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch {
      throw new MercadoPagoError(0);
    }
    if (!response.ok) throw new MercadoPagoError(response.status);
    try {
      return await response.json();
    } catch {
      throw new MercadoPagoError(response.status);
    }
  }

  return {
    // Returns { url } with the Checkout Pro link. uid travels in metadata so the webhook can locate
    // drivers/{uid}/trips/{tripId}; the webhook still validates everything against that document.
    async createPreference({ tripId, uid, amount, currency, notificationUrl }) {
      const preference = {
        items: [{ title: 'Viaje UberClone (pago de prueba)', quantity: 1, unit_price: amount, currency_id: currency }],
        external_reference: tripId,
        metadata: { uid },
        notification_url: notificationUrl,
      };
      const result = await request('POST', '/checkout/preferences', preference);
      const url = result?.init_point;
      if (typeof url !== 'string' || url === '') throw new MercadoPagoError(502);
      return { url };
    },

    async getPayment(id) {
      const raw = await request('GET', `/v1/payments/${encodeURIComponent(String(id))}`);
      return normalizePayment(raw);
    },

    // Most relevant payment for a trip: an approved one if any, otherwise the newest. null if none.
    async findPaymentByReference(tripId) {
      const query = `external_reference=${encodeURIComponent(tripId)}&sort=date_created&criteria=desc&limit=10`;
      const raw = await request('GET', `/v1/payments/search?${query}`);
      const results = Array.isArray(raw?.results) ? raw.results.map(normalizePayment) : [];
      return results.find((payment) => payment.mappedStatus === 'approved') ?? results[0] ?? null;
    },

    verifySignature,
  };
}

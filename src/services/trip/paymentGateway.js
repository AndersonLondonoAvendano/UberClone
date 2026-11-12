// AI-assisted: see docs/AI_LOG.md #59
// Pure, single source for (1) the payment label of a trip/request and (2) the charge buttons and message.
// 'mercadopago' saved WITHOUT a paymentId means "card, gateway still to choose" (the app never writes the
// gateway; only the backend does, together with the paymentId, when a checkout is created).

export const GATEWAYS = ['mercadopago', 'stripe'];
export const LABEL_KEY = { CASH: 'cash', CARD: 'card', MERCADOPAGO: 'mercadopago', STRIPE: 'stripe', UNKNOWN: 'unknown' };
export const CHOICE_MESSAGE = { NONE: null, LOADING: 'loading', FAILED: 'providersFailed', NO_GATEWAY: 'noGateway' };

const hasId = (paymentId) => typeof paymentId === 'string' && paymentId.length > 0;

// method: 'cash' | 'card' | 'mercadopago' | 'stripe' | other. Returns a LABEL_KEY.
export function paymentLabelKey({ method, paymentId } = {}) {
  if (method === 'cash') return LABEL_KEY.CASH;
  if (method === 'card') return LABEL_KEY.CARD;
  if (method === 'mercadopago' || method === 'stripe') return hasId(paymentId) ? method : LABEL_KEY.CARD;
  return LABEL_KEY.UNKNOWN;
}

// True when the trip already has a chosen gateway (a card method plus its paymentId).
export function hasChosenGateway({ method, paymentId } = {}) {
  return GATEWAYS.includes(method) && hasId(paymentId);
}

// providers: { mercadopago, stripe } booleans, or undefined while loading / after a failure.
// failed: the providers query failed. Output: { gateways, message } where gateways are only configured ones;
// never a default gateway (a failed or unknown query yields no gateway at all).
export function chargeChoices({ providers, failed = false } = {}) {
  if (failed === true) return { gateways: [], message: CHOICE_MESSAGE.FAILED };
  if (!providers || typeof providers !== 'object') return { gateways: [], message: CHOICE_MESSAGE.LOADING };
  const gateways = GATEWAYS.filter((id) => providers[id] === true);
  return { gateways, message: gateways.length === 0 ? CHOICE_MESSAGE.NO_GATEWAY : CHOICE_MESSAGE.NONE };
}

// AI-assisted: see docs/AI_LOG.md #58
// Backend configuration read from the environment. Only variable NAMES are ever reported.

export const DEFAULT_PORT = 3001;
// Upper bound for a single trip payment, in whole COP.
export const MAX_AMOUNT_COP = 2_000_000;
export const CURRENCY = 'COP';
export const BODY_LIMIT = '2kb';
export const USER_RATE_LIMIT = { max: 20, windowMs: 60_000 };
export const IP_RATE_LIMIT = { max: 120, windowMs: 60_000 };
export const SIGNATURE_TOLERANCE_SEC = 300;
// AI-assisted: see docs/AI_LOG.md #64
// FCM notifications (spec 003). The Admin SDK takes the TTL as a number of milliseconds
// (messaging-api.d.ts, AndroidConfig.ttl); FCM_TTL is the same value in the REST duration format.
export const TEST_REQUEST_RATE_LIMIT = { max: 5, windowMs: 60_000 };
export const FCM_TTL_MS = 90_000;
export const FCM_TTL = '90s';
export const FCM_CHANNEL_ID = 'solicitudes';
export const TEST_REQUEST_MAX_DELAY_S = 60;
export const PUSH_TOKEN_MIN_LENGTH = 20;
export const PUSH_TOKEN_MAX_LENGTH = 512;
export const FCM_BATCH_SIZE = 500;
// Stripe events are larger than the JSON bodies of the app routes, but still small and bounded.
export const STRIPE_WEBHOOK_BODY_LIMIT = '64kb';

const REQUIRED = ['MP_ACCESS_TOKEN', 'FIREBASE_SERVICE_ACCOUNT_PATH', 'PUBLIC_BASE_URL'];
const STRIPE_TEST_KEY = /^(sk|rk)_test_\S+$/;
const STRIPE_CURRENCIES = ['cop', 'usd'];
// Fixed warnings: they name variables only and never contain a value.
export const WARNINGS = {
  stripeLiveKey: 'STRIPE_SECRET_KEY is a live key: only test keys are accepted, Stripe is disabled.',
  stripeBadKey: 'STRIPE_SECRET_KEY does not look like a test key (sk_test_ or rk_test_): Stripe is disabled.',
  stripeBadCurrency: 'STRIPE_CURRENCY or STRIPE_COP_PER_USD is invalid: Stripe is disabled.',
};

export class ConfigError extends Error {
  constructor(missing) {
    super(`Missing or invalid environment variables: ${missing.join(', ')}`);
    this.name = 'ConfigError';
    this.missing = missing;
  }
}

function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

// Reads the Stripe settings. Returns { stripe, warning }; stripe is null when it is absent or unusable.
function loadStripe(env) {
  const secretKey = clean(env.STRIPE_SECRET_KEY);
  if (secretKey === '') return { stripe: null, warning: null };
  if (/^(sk|rk)_live_/.test(secretKey)) return { stripe: null, warning: WARNINGS.stripeLiveKey };
  if (!STRIPE_TEST_KEY.test(secretKey)) return { stripe: null, warning: WARNINGS.stripeBadKey };

  const currency = (clean(env.STRIPE_CURRENCY) || 'cop').toLowerCase();
  const rawRate = clean(env.STRIPE_COP_PER_USD);
  const rate = rawRate === '' ? null : Number(rawRate);
  const rateValid = rate !== null && Number.isFinite(rate) && rate > 0;
  if (!STRIPE_CURRENCIES.includes(currency) || (currency === 'usd' && !rateValid)) {
    return { stripe: null, warning: WARNINGS.stripeBadCurrency };
  }
  return {
    stripe: {
      secretKey,
      webhookSecret: clean(env.STRIPE_WEBHOOK_SECRET) || null,
      currency,
      copPerUsd: rateValid ? rate : null,
    },
    warning: null,
  };
}

// By default Mercado Pago stays required (the R8 behavior). Only server.js passes allowNoProvider.
export function loadConfig(env = process.env, { allowNoProvider = false } = {}) {
  const required = allowNoProvider ? REQUIRED.filter((name) => name !== 'MP_ACCESS_TOKEN') : REQUIRED;
  const problems = required.filter((name) => clean(env[name]) === '');

  let publicBaseUrl = clean(env.PUBLIC_BASE_URL);
  if (publicBaseUrl && !problems.includes('PUBLIC_BASE_URL')) {
    try {
      const parsed = new URL(publicBaseUrl);
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') throw new Error('protocol');
      publicBaseUrl = publicBaseUrl.replace(/\/+$/, '');
    } catch {
      problems.push('PUBLIC_BASE_URL');
    }
  }

  const rawPort = clean(env.PORT);
  const port = rawPort === '' ? DEFAULT_PORT : Number(rawPort);
  if (!Number.isInteger(port) || port < 1 || port > 65535) problems.push('PORT');

  if (problems.length > 0) throw new ConfigError(problems);

  const mpAccessToken = clean(env.MP_ACCESS_TOKEN) || null;
  const webhookSecret = clean(env.MP_WEBHOOK_SECRET) || null;
  const { stripe, warning } = loadStripe(env);

  return {
    mpAccessToken,
    serviceAccountPath: clean(env.FIREBASE_SERVICE_ACCOUNT_PATH),
    publicBaseUrl,
    port,
    webhookSecret,
    providers: {
      mercadopago: mpAccessToken ? { accessToken: mpAccessToken, webhookSecret } : null,
      stripe,
    },
    warnings: warning ? [warning] : [],
    maxAmountCop: MAX_AMOUNT_COP,
    currency: CURRENCY,
  };
}

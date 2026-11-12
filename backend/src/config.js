// AI-assisted: see docs/AI_LOG.md #55
// Backend configuration read from the environment. Only variable NAMES are ever reported.

export const DEFAULT_PORT = 3001;
// Upper bound for a single trip payment, in whole COP.
export const MAX_AMOUNT_COP = 2_000_000;
export const CURRENCY = 'COP';
export const BODY_LIMIT = '2kb';
export const USER_RATE_LIMIT = { max: 20, windowMs: 60_000 };
export const IP_RATE_LIMIT = { max: 120, windowMs: 60_000 };
export const SIGNATURE_TOLERANCE_SEC = 300;

const REQUIRED = ['MP_ACCESS_TOKEN', 'FIREBASE_SERVICE_ACCOUNT_PATH', 'PUBLIC_BASE_URL'];

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

export function loadConfig(env = process.env) {
  const problems = REQUIRED.filter((name) => clean(env[name]) === '');

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

  return {
    mpAccessToken: clean(env.MP_ACCESS_TOKEN),
    serviceAccountPath: clean(env.FIREBASE_SERVICE_ACCOUNT_PATH),
    publicBaseUrl,
    port,
    webhookSecret: clean(env.MP_WEBHOOK_SECRET) || null,
    maxAmountCop: MAX_AMOUNT_COP,
    currency: CURRENCY,
  };
}

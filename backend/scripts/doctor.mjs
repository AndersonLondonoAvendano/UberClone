// AI-assisted: see AI_LOG.md #57
// AI-assisted: see AI_LOG.md #58
// Backend diagnostic ("npm run doctor"). runDoctor takes every dependency by injection so tests
// never touch the real environment, disk, Firebase, Mercado Pago or Stripe. It only ever reports variable
// NAMES and statuses: no value, token, key content or error message is printed.
import { basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadConfig, WARNINGS } from '../src/config.js';

export const MIN_NODE = { major: 20, minor: 12 };
const MP_IDENTITY_URL = 'https://api.mercadopago.com/users/me';
const STRIPE_IDENTITY_URL = 'https://api.stripe.com/v1/balance';
const REQUEST_TIMEOUT_MS = 10_000;
const REQUIRED_VARS = ['MP_ACCESS_TOKEN', 'FIREBASE_SERVICE_ACCOUNT_PATH', 'PUBLIC_BASE_URL'];
const SERVICE_ACCOUNT_FIELDS = ['project_id', 'client_email', 'private_key'];
const NETWORK_CODES = ['ENOTFOUND', 'ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN', 'UND_ERR_CONNECT_TIMEOUT'];
const NETWORK_HINT = 'revisa tu conexión a internet y vuelve a ejecutar.';

const clean = (value) => (typeof value === 'string' ? value.trim() : '');

function looksLikeNetworkError(error) {
  const code = error?.code ?? error?.cause?.code;
  if (NETWORK_CODES.includes(code)) return true;
  // gRPC UNAVAILABLE (14) and DEADLINE_EXCEEDED (4), or fetch's TypeError / abort.
  if (code === 14 || code === 4) return true;
  return error?.name === 'TypeError' || error?.name === 'AbortError' || error?.name === 'TimeoutError';
}

// Only a short numeric or upper-case token is echoed, never a message.
function safeCode(error) {
  const code = error?.code;
  if (typeof code === 'number') return ` (código ${code})`;
  if (typeof code === 'string' && /^[A-Z0-9_-]{1,40}$/.test(code)) return ` (código ${code})`;
  return '';
}

// Reuses loadConfig so the doctor and the server agree on what a usable Stripe key is. Only the Stripe
// variables are passed, with placeholders for the rest, so no other setting can make it throw.
// Returns { state: 'absent' | 'live' | 'invalid' | 'ready', secretKey, webhookSecret }.
function readStripe(env) {
  if (clean(env.STRIPE_SECRET_KEY) === '') return { state: 'absent' };
  const config = loadConfig(
    {
      STRIPE_SECRET_KEY: env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: env.STRIPE_WEBHOOK_SECRET,
      STRIPE_CURRENCY: env.STRIPE_CURRENCY,
      STRIPE_COP_PER_USD: env.STRIPE_COP_PER_USD,
      FIREBASE_SERVICE_ACCOUNT_PATH: 'placeholder',
      PUBLIC_BASE_URL: 'https://placeholder.invalid',
    },
    { allowNoProvider: true },
  );
  const stripe = config.providers.stripe;
  if (stripe) return { state: 'ready', secretKey: stripe.secretKey, webhookSecret: stripe.webhookSecret };
  return { state: config.warnings.includes(WARNINGS.stripeLiveKey) ? 'live' : 'invalid' };
}

function parseNodeVersion(version) {
  const match = /^v?(\d+)\.(\d+)/.exec(clean(version));
  return match ? { major: Number(match[1]), minor: Number(match[2]) } : null;
}

export async function runDoctor({
  env = {},
  fs,
  loadAdmin,
  fetchFn,
  nodeVersion = '',
  log = () => {},
} = {}) {
  const results = [];
  // Lines about a payment gateway only fail the run when no gateway ends up usable.
  const gatewayResults = new Set();
  const add = (status, message, { gateway = false } = {}) => {
    const entry = { status, message };
    results.push(entry);
    if (gateway) gatewayResults.add(entry);
    log(`${status.padEnd(5)} ${message}`);
  };

  // 1. Node version.
  const node = parseNodeVersion(nodeVersion);
  if (!node) {
    add('ERROR', 'Node: no se pudo leer la versión. Instala Node 20.12 o superior.');
  } else if (node.major > MIN_NODE.major || (node.major === MIN_NODE.major && node.minor >= MIN_NODE.minor)) {
    add('OK', `Node ${node.major}.${node.minor} cumple el mínimo (>= ${MIN_NODE.major}.${MIN_NODE.minor}).`);
  } else {
    add('ERROR', `Node ${node.major}.${node.minor} es menor que ${MIN_NODE.major}.${MIN_NODE.minor}. Actualiza Node.`);
  }

  const stripe = readStripe(env);
  const mpConfigured = clean(env.MP_ACCESS_TOKEN) !== '';
  const stripeConfigured = stripe.state === 'ready';

  // 2. Variables, by name only.
  const missing = new Set();
  for (const name of REQUIRED_VARS) {
    if (clean(env[name]) === '') {
      missing.add(name);
      if (name === 'PUBLIC_BASE_URL') continue; // reported as a warning in step 6
      if (name === 'MP_ACCESS_TOKEN' && stripeConfigured) {
        add('AVISO', 'Variable MP_ACCESS_TOKEN sin definir: Mercado Pago queda sin configurar (Stripe sí está configurada).', { gateway: true });
      } else {
        add('FALTA', `Variable ${name}: defínela en backend/.env (ver backend/.env.example).`, { gateway: name === 'MP_ACCESS_TOKEN' });
      }
    } else {
      add('OK', `Variable ${name} definida.`);
    }
  }
  const rawPort = clean(env.PORT);
  if (rawPort === '') {
    add('AVISO', 'Variable PORT sin definir: se usará el puerto por defecto.');
  } else {
    const port = Number(rawPort);
    if (Number.isInteger(port) && port >= 1 && port <= 65535) add('OK', 'Variable PORT definida y válida.');
    else add('ERROR', 'Variable PORT no es un puerto válido (1 a 65535). Corrígela en backend/.env.');
  }
  if (clean(env.MP_WEBHOOK_SECRET) === '') {
    add('AVISO', 'Variable MP_WEBHOOK_SECRET sin definir: no se verificará la firma del webhook (opcional).');
  } else {
    add('OK', 'Variable MP_WEBHOOK_SECRET definida.');
  }

  // 3. Service account file.
  let serviceAccount = null;
  if (missing.has('FIREBASE_SERVICE_ACCOUNT_PATH')) {
    add('AVISO', 'Llave de Firebase: omitida porque falta FIREBASE_SERVICE_ACCOUNT_PATH.');
  } else {
    const fileName = basename(clean(env.FIREBASE_SERVICE_ACCOUNT_PATH).replace(/\\/g, '/'));
    let text = null;
    try {
      text = fs.readFileSync(clean(env.FIREBASE_SERVICE_ACCOUNT_PATH), 'utf8');
    } catch {
      add('ERROR', `Llave de Firebase: no se puede leer el archivo "${fileName}". Revisa la ruta y los permisos.`);
    }
    if (text !== null) {
      let parsed;
      let valid = true;
      try {
        parsed = JSON.parse(text);
      } catch {
        valid = false;
        add('ERROR', `Llave de Firebase: "${fileName}" no es JSON válido. Descarga de nuevo la llave desde la consola de Firebase.`);
      }
      if (valid) {
        const absent = SERVICE_ACCOUNT_FIELDS.filter(
          (field) => typeof parsed?.[field] !== 'string' || parsed[field].trim() === '',
        );
        if (absent.length > 0) {
          add('ERROR', `Llave de Firebase: a "${fileName}" le falta el campo ${absent.join(', ')}. Descarga una llave de cuenta de servicio nueva.`);
        } else {
          serviceAccount = parsed;
          add('OK', `Llave de Firebase: "${fileName}" legible con JSON válido.`);
        }
      }
    }
  }

  // 4. firebase-admin and a trivial Firestore read.
  if (serviceAccount === null) {
    add('AVISO', 'Firestore: omitido porque la llave de Firebase no es válida.');
  } else {
    try {
      const { db } = await loadAdmin(serviceAccount);
      await db.doc('_doctor/ping').get(); // a missing document is fine: only the access is tested
      add('OK', 'Firestore: firebase-admin inicia y la lectura de prueba funciona.');
    } catch (error) {
      add(
        'ERROR',
        looksLikeNetworkError(error)
          ? `Firestore: no se pudo conectar; ${NETWORK_HINT}`
          : `Firestore: firebase-admin o la lectura fallaron${safeCode(error)}. Revisa que la llave sea del proyecto correcto, que Firestore esté creado y ejecuta npm install en backend/.`,
      );
    }
  }

  // 5. Mercado Pago token.
  let mpUsable = false;
  if (missing.has('MP_ACCESS_TOKEN')) {
    add('AVISO', 'Mercado Pago: omitido porque falta MP_ACCESS_TOKEN.', { gateway: true });
  } else {
    try {
      const response = await fetchFn(MP_IDENTITY_URL, {
        method: 'GET',
        headers: { Authorization: `Bearer ${clean(env.MP_ACCESS_TOKEN)}` },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (response.ok) {
        mpUsable = true;
        add('OK', 'Mercado Pago: el token es válido.', { gateway: true });
      } else {
        add('ERROR', `Mercado Pago: la API respondió HTTP ${Number(response.status) || 0}. Revisa MP_ACCESS_TOKEN (usa el de prueba de tu aplicación).`, { gateway: true });
      }
    } catch {
      add('ERROR', `Mercado Pago: no se pudo conectar; ${NETWORK_HINT}`, { gateway: true });
    }
  }

  // 5b. Stripe key: prefix first (a live key never reaches the network), then one identity call that
  // prints only OK or the HTTP status.
  let stripeUsable = false;
  // An absent key adds no line here: the gateway summary below reports it as not configured.
  if (stripe.state === 'live') {
    add('ERROR', 'Stripe: STRIPE_SECRET_KEY es una clave live y solo se aceptan claves de prueba (sk_test_ o rk_test_). No se llamó a la API.', { gateway: true });
  } else if (stripe.state === 'invalid') {
    add('ERROR', 'Stripe: STRIPE_SECRET_KEY no tiene prefijo sk_test_ o rk_test_, o STRIPE_CURRENCY / STRIPE_COP_PER_USD no son válidas. Corrígelas en backend/.env.', { gateway: true });
  } else if (stripe.state === 'ready') {
    try {
      const response = await fetchFn(STRIPE_IDENTITY_URL, {
        method: 'GET',
        headers: { Authorization: `Basic ${Buffer.from(`${stripe.secretKey}:`, 'utf8').toString('base64')}` },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (response.ok) {
        stripeUsable = true;
        add('OK', 'Stripe: la API respondió OK.', { gateway: true });
      } else {
        const status = Number(response.status) || 0;
        const hint = status === 401 ? 'la clave es inválida' : status === 403 ? 'la clave no tiene permisos' : 'revisa la clave';
        add('ERROR', `Stripe: la API respondió HTTP ${status}; ${hint}. Revisa STRIPE_SECRET_KEY (usa la de prueba).`, { gateway: true });
      }
    } catch {
      add('ERROR', `Stripe: no se pudo conectar; ${NETWORK_HINT}`, { gateway: true });
    }
    if (stripe.webhookSecret === null) {
      add('AVISO', 'Variable STRIPE_WEBHOOK_SECRET sin definir: no se verificará la firma del webhook de Stripe (opcional; «Verificar pago» lo cubre).', { gateway: true });
    }
  }

  // One line per gateway; the run fails for lack of gateways only when none is configured.
  add(mpConfigured ? 'OK' : 'AVISO', `Pasarela Mercado Pago: ${mpConfigured ? 'configurada' : 'no configurada'}.`, { gateway: true });
  add(stripeConfigured ? 'OK' : 'AVISO', `Pasarela Stripe: ${stripeConfigured ? 'configurada' : 'no configurada'}.`, { gateway: true });
  if (!mpConfigured && !stripeConfigured) {
    add('ERROR', 'Ninguna pasarela configurada: define MP_ACCESS_TOKEN o una STRIPE_SECRET_KEY de prueba en backend/.env.', { gateway: true });
  }

  // 6. PUBLIC_BASE_URL must be https for the webhook.
  const baseUrl = clean(env.PUBLIC_BASE_URL);
  if (baseUrl === '') {
    add('AVISO', 'PUBLIC_BASE_URL sin definir: el webhook de Mercado Pago no llegará. Define una URL https pública (con túnel cambia en cada ejecución).');
  } else {
    let protocol = null;
    try {
      protocol = new URL(baseUrl).protocol;
    } catch {
      protocol = null;
    }
    if (protocol === 'https:') add('OK', 'PUBLIC_BASE_URL usa https.');
    else add('AVISO', 'PUBLIC_BASE_URL no es una URL https válida: el webhook de Mercado Pago la necesita. Con un túnel cambia en cada ejecución; actualízala.');
  }

  // Gateway failures count only when no gateway is usable (configured and answering OK).
  const anyUsable = mpUsable || stripeUsable;
  // A live key on ANY gateway always fails the run (#59), even when another gateway is usable.
  const liveKey = stripe.state === 'live';
  const failed = liveKey || results.some(
    (result) =>
      (result.status === 'FALTA' || result.status === 'ERROR') && (!gatewayResults.has(result) || !anyUsable),
  );
  return { results, exitCode: failed ? 1 : 0 };
}

// Real firebase-admin loader, used only by the command line.
async function loadRealAdmin(serviceAccount) {
  const { initializeApp, cert, getApps, deleteApp } = await import('firebase-admin/app');
  const { getFirestore } = await import('firebase-admin/firestore');
  for (const existing of getApps()) await deleteApp(existing);
  const app = initializeApp({ credential: cert(serviceAccount) });
  return { db: getFirestore(app) };
}

async function main() {
  const { readFileSync } = await import('node:fs');
  try {
    process.loadEnvFile(fileURLToPath(new URL('../.env', import.meta.url)));
  } catch {
    // No backend/.env: variables may come from the real environment.
  }
  const { exitCode } = await runDoctor({
    env: process.env,
    fs: { readFileSync },
    loadAdmin: loadRealAdmin,
    fetchFn: globalThis.fetch,
    nodeVersion: process.versions.node,
    log: (line) => console.log(line),
  });
  // firebase-admin keeps handles open; exit explicitly.
  process.exit(exitCode);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(() => {
    console.error('ERROR El diagnóstico falló de forma inesperada. Ejecuta de nuevo; si persiste, revisa Node y npm install en backend/.');
    process.exit(1);
  });
}

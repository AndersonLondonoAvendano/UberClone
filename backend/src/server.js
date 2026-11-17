// AI-assisted: see docs/AI_LOG.md #58
// Builds the real dependencies and starts listening. Never prints configuration values.
import { fileURLToPath } from 'node:url';
import { initAdmin } from './admin.js';
import { createApp } from './app.js';
import { createAuth } from './auth.js';
import { ConfigError, loadConfig } from './config.js';
import { createTripStore } from './firestore.js';
import { createMercadoPagoClient } from './mercadopago.js';
import { createMercadoPagoProvider } from './providers/mercadopago.js';
import { createProviderRegistry } from './providers/registry.js';
import { createStripeProvider } from './providers/stripe.js';
import { createStripeClient } from './stripe.js';

try {
  process.loadEnvFile(fileURLToPath(new URL('../.env', import.meta.url)));
} catch {
  // No backend/.env: variables may come from the real environment.
}

async function main() {
  // The server may start with no gateway at all: /health works and checkout answers a generic error.
  const config = loadConfig(undefined, { allowNoProvider: true });
  for (const warning of config.warnings) console.warn(warning);
  const { adminAuth, db, messaging } = await initAdmin(config);
  const { mercadopago, stripe } = config.providers;
  const mp = mercadopago ? createMercadoPagoClient({ accessToken: mercadopago.accessToken }) : null;
  const registry = createProviderRegistry({
    mercadopago: mp ? createMercadoPagoProvider({ client: mp }) : null,
    stripe: stripe
      ? createStripeProvider({
          client: createStripeClient({ secretKey: stripe.secretKey }),
          currency: stripe.currency,
          copPerUsd: stripe.copPerUsd ?? undefined,
          maxAmountCop: config.maxAmountCop,
        })
      : null,
  });
  if (!mercadopago && !stripe) console.warn('No hay ninguna pasarela de pago configurada: el cobro con tarjeta no estara disponible.');
  const app = createApp({
    auth: createAuth(adminAuth),
    store: createTripStore(db),
    mp,
    config,
    registry,
    log: (line) => console.log(line),
    messaging,
    db,
  });

  const server = app.listen(config.port, () => {
    console.log(`Servidor escuchando en el puerto ${config.port}`);
  });
  server.on('error', (error) => {
    console.error(
      error.code === 'EADDRINUSE'
        ? `El puerto ${config.port} ya esta en uso. Cierra el proceso que lo ocupa o cambia PORT.`
        : 'No se pudo iniciar el servidor.',
    );
    process.exit(1);
  });
  const shutdown = () => {
    // Cancels deferred test notifications still waiting for their timer.
    app.closeNotifications();
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((error) => {
  console.error(
    error instanceof ConfigError
      ? `Configuracion incompleta. Revisa backend/.env (variables: ${error.missing.join(', ')}).`
      : 'No se pudo iniciar el backend. Revisa la cuenta de servicio y las dependencias.',
  );
  process.exit(1);
});

// AI-assisted: see docs/AI_LOG.md #55
// Builds the real dependencies and starts listening. Never prints configuration values.
import { fileURLToPath } from 'node:url';
import { initAdmin } from './admin.js';
import { createApp } from './app.js';
import { createAuth } from './auth.js';
import { ConfigError, loadConfig } from './config.js';
import { createTripStore } from './firestore.js';
import { createMercadoPagoClient } from './mercadopago.js';

try {
  process.loadEnvFile(fileURLToPath(new URL('../.env', import.meta.url)));
} catch {
  // No backend/.env: variables may come from the real environment.
}

async function main() {
  const config = loadConfig();
  const { adminAuth, db } = await initAdmin(config);
  const app = createApp({
    auth: createAuth(adminAuth),
    store: createTripStore(db),
    mp: createMercadoPagoClient({ accessToken: config.mpAccessToken }),
    config,
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
  const shutdown = () => server.close(() => process.exit(0));
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

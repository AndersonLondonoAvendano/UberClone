// AI-assisted: see docs/AI_LOG.md #55
// Express app with injected dependencies, built without opening a port (testable in isolation).
import express from 'express';
import { BODY_LIMIT, IP_RATE_LIMIT, USER_RATE_LIMIT } from './config.js';
import { ERRORS, createGuard, createRateLimiter, send } from './middleware.js';
import { createPaymentsHandlers, registerPaymentsRoutes } from './routes/payments.js';
import { createWebhookHandler, registerWebhookRoutes } from './routes/webhooks.js';

const SERVICE_NAME = 'uber-clone-backend';

export function createApp({ auth, store, mp, config }) {
  const app = express();
  // Closed CORS: no Access-Control-* header is ever sent, so browsers from other origins are refused.
  app.disable('x-powered-by');

  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', service: SERVICE_NAME });
  });

  app.use(express.json({ limit: BODY_LIMIT }));

  const userLimiter = createRateLimiter(USER_RATE_LIMIT);
  const ipLimiter = createRateLimiter(IP_RATE_LIMIT);
  const guard = createGuard({ auth, userLimiter, ipLimiter });

  registerPaymentsRoutes(app, { guard, handlers: createPaymentsHandlers({ store, mp, config }), send });
  registerWebhookRoutes(app, { handler: createWebhookHandler({ store, mp, config }), ipLimiter, send });

  app.use((req, res) => send(res, ERRORS.notFound));
  // Generic errors only: nothing from the request or the error is echoed or logged.
  app.use((error, req, res, next) => {
    if (error?.type === 'entity.too.large') return send(res, ERRORS.tooLarge);
    if (error?.type === 'entity.parse.failed') return send(res, ERRORS.invalid);
    return send(res, ERRORS.server);
  });

  return app;
}

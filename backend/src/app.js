// AI-assisted: see docs/AI_LOG.md #58
// Express app with injected dependencies, built without opening a port (testable in isolation).
import express from 'express';
import { BODY_LIMIT, IP_RATE_LIMIT, STRIPE_WEBHOOK_BODY_LIMIT, USER_RATE_LIMIT } from './config.js';
import { ERRORS, createGuard, createRateLimiter, createRequestLogger, send } from './middleware.js';
import { createMercadoPagoProvider } from './providers/mercadopago.js';
import { createProviderRegistry } from './providers/registry.js';
import { createPaymentsHandlers, registerPaymentsRoutes, registerProvidersRoute } from './routes/payments.js';
import { registerReturnRoute } from './routes/return.js';
import { createStripeWebhookHandler, createWebhookHandler, registerWebhookRoutes } from './routes/webhooks.js';

const SERVICE_NAME = 'uber-clone-backend';

// mp (Mercado Pago client) and registry are optional: without registry one is built from mp, and
// a gateway that is not configured has no checkout and no webhook route.
export function createApp({ auth, store, mp = null, config, registry = null, log }) {
  const providers = registry ?? createProviderRegistry({ mercadopago: mp ? createMercadoPagoProvider({ client: mp }) : null });
  const app = express();
  // Closed CORS: no Access-Control-* header is ever sent, so browsers from other origins are refused.
  app.disable('x-powered-by');
  // AI-assisted: see docs/AI_LOG.md #59
  // One log line per request (method, path, status, provider, duration); no bodies, headers, tokens or emails.
  app.use(createRequestLogger(log));

  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', service: SERVICE_NAME });
  });

  // The Stripe webhook signature covers the exact bytes, so that path gets the raw body (its parser is
  // attached to the route in registerWebhookRoutes) and the global JSON parser must never read it first.
  const rawParser = express.raw({ type: () => true, limit: STRIPE_WEBHOOK_BODY_LIMIT });
  const jsonParser = express.json({ limit: BODY_LIMIT });
  app.use((req, res, next) => (req.path.replace(/\/+$/, '').toLowerCase() === '/webhooks/stripe' ? next() : jsonParser(req, res, next)));

  const userLimiter = createRateLimiter(USER_RATE_LIMIT);
  const ipLimiter = createRateLimiter(IP_RATE_LIMIT);
  const guard = createGuard({ auth, userLimiter, ipLimiter });

  const handlers = createPaymentsHandlers({ store, mp, config, registry: providers });
  registerProvidersRoute(app, { guard, handlers, send });
  registerPaymentsRoutes(app, { guard, handlers, send });
  registerReturnRoute(app, { ipLimiter, send });
  registerWebhookRoutes(app, {
    handler: mp ? createWebhookHandler({ store, mp, config }) : null,
    stripeHandler: providers.isConfigured('stripe')
      ? createStripeWebhookHandler({ store, registry: providers, config })
      : null,
    rawParser,
    ipLimiter,
    send,
  });

  app.use((req, res) => send(res, ERRORS.notFound));
  // Generic errors only: nothing from the request or the error is echoed or logged.
  app.use((error, req, res, next) => {
    if (error?.type === 'entity.too.large') return send(res, ERRORS.tooLarge);
    if (error?.type === 'entity.parse.failed') return send(res, ERRORS.invalid);
    return send(res, ERRORS.server);
  });

  return app;
}

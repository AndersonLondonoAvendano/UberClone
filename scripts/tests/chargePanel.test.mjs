// Plain Node tests for chargePanel (CA-002-96 to CA-002-100, pure part). Run:
//   node scripts/tests/chargePanel.test.mjs
import assert from 'node:assert/strict';
import './helpers/registerSrcLoader.mjs';

const { chargePanel, serviceErrorText } = await import('../../src/services/trip/chargePanel.js');
const { labels } = await import('../../src/constants/labels.js');
const t = labels.trip.chargePanel;

const methods = ['cash', 'mercadopago', 'transfer', 'none', undefined];
const statuses = ['pending', 'approved', 'rejected', 'paid', undefined];
const BACKEND_ACTIONS = ['charge', 'retry', 'verify'];

// Spec examples
assert.deepEqual(chargePanel({ method: 'cash', paymentStatus: 'pending' }),
  { message: t.cashPending, tone: 'info', chip: 'cash', actions: ['confirmCash'], live: 'polite' });
assert.deepEqual(chargePanel({ method: 'cash', paymentStatus: 'paid' }),
  { message: 'Efectivo recibido. El viaje quedó guardado en tu historial.', tone: 'success', chip: 'cash', actions: [], live: 'polite' });
assert.equal(chargePanel({ method: 'cash', paymentStatus: 'paid' }).chip, 'cash');
// (#59) the gateway is chosen by the driver: no saved-method fallback. Without providers there is no charge button.
assert.deepEqual(chargePanel({ method: 'mercadopago', paymentStatus: 'pending' }),
  { message: t.cardPendingGeneric, tone: 'info', chip: 'pending', actions: [], live: 'polite', chargeProviders: [], noGateway: true });
assert.deepEqual(chargePanel({ method: 'mercadopago', paymentStatus: 'pending', providers: { mercadopago: true, stripe: true } }),
  { message: t.cardPendingGeneric, tone: 'info', chip: 'pending', actions: ['charge'], live: 'polite', chargeProviders: ['mercadopago', 'stripe'], noGateway: false });
assert.deepEqual(chargePanel({ method: 'mercadopago', paymentStatus: undefined, providers: { mercadopago: true, stripe: true }, paymentId: 'x' }).actions, ['charge', 'verify']);
assert.deepEqual(chargePanel({ method: 'mercadopago', paymentStatus: 'approved' }),
  { message: 'Pago aprobado. El viaje quedó guardado en tu historial.', tone: 'success', chip: 'approved', actions: [], live: 'polite', chargeProviders: [], noGateway: false });
assert.deepEqual(chargePanel({ method: 'mercadopago', paymentStatus: 'paid' }),
  { message: t.cardApproved, tone: 'success', chip: 'approved', actions: [], live: 'polite', chargeProviders: [], noGateway: false });
assert.deepEqual(chargePanel({ method: 'mercadopago', paymentStatus: 'rejected', providers: { mercadopago: true, stripe: false } }),
  { message: 'Pago rechazado. Toca “Reintentar pago”.', tone: 'error', chip: 'rejected', actions: ['retry'], live: 'polite', chargeProviders: ['mercadopago'], noGateway: false });
assert.equal(labels.trip.paymentAction.retry, 'Reintentar pago');
assert.ok(t.cardRejected.startsWith('Pago rechazado'));
assert.ok(t.cardRejected.includes(`“${labels.trip.paymentAction.retry}”`));

// Legacy trips: no message, no actions, never success
for (const method of ['transfer', 'none', undefined]) {
  for (const paymentStatus of statuses) {
    assert.deepEqual(chargePanel({ method, paymentStatus }),
      { message: null, tone: 'neutral', chip: 'unavailable', actions: [], live: 'polite' });
  }
}

// Exhaustive table: method x status x saveError x serviceError x userActed
for (const method of methods) {
  for (const paymentStatus of statuses) {
    for (const saveError of [undefined, true, 'Save text']) {
      for (const serviceError of [undefined, true, 'Service text']) {
        for (const userActed of [false, true, undefined]) {
          const out = chargePanel({ method, paymentStatus, saveError, serviceError, userActed });
          const ctx = JSON.stringify({ method, paymentStatus, saveError, serviceError, userActed });
          assert.equal(out.live, 'polite', ctx);
          assert.ok(Array.isArray(out.actions), ctx);
          if (saveError) {
            assert.equal(out.tone, 'error', ctx);
            assert.equal(out.message, saveError === true ? labels.trip.saveErrorGeneric : 'Save text', ctx);
            assert.deepEqual(out.actions, [], ctx);
            continue;
          }
          if (method === 'cash') {
            assert.ok(!out.actions.some((a) => BACKEND_ACTIONS.includes(a)), ctx);
            assert.ok(out.message === t.cashPending || out.message === t.cashCollected, ctx);
          }
          const serviceShown = method === 'mercadopago' && serviceError && userActed === true;
          if (serviceShown) {
            assert.equal(out.tone, 'error', ctx);
            assert.equal(out.message, serviceError === true ? t.serviceError : 'Service text', ctx);
          } else {
            // A rejected card is the only non-service case that paints the error tone (danger, with the retry hint).
            // A rejected card is the only non-service case that paints the error tone (its buttons arrive with the providers).
            assert.equal(out.tone === 'error', method === 'mercadopago' && paymentStatus === 'rejected', ctx);
            assert.ok(out.message !== 'Service text' && out.message !== t.serviceError, ctx);
          }
          // Success tone only with approved/paid card or collected cash, and only without errors shown
          const successExpected = !serviceShown && (
            (method === 'mercadopago' && (paymentStatus === 'approved' || paymentStatus === 'paid')) ||
            (method === 'cash' && paymentStatus === 'paid'));
          assert.equal(out.tone === 'success', Boolean(successExpected), ctx);
        }
      }
    }
  }
}

// Priority: save error beats service error beats informational
assert.equal(chargePanel({ method: 'mercadopago', paymentStatus: 'pending', saveError: 'S', serviceError: 'V', userActed: true }).message, 'S');
assert.equal(chargePanel({ method: 'mercadopago', paymentStatus: 'pending', serviceError: 'V', userActed: true }).message, 'V');
assert.equal(chargePanel({ method: 'mercadopago', paymentStatus: 'pending', serviceError: 'V', userActed: false }).message, t.cardPendingGeneric);
// Service error after user action keeps the actions so the driver can retry
assert.deepEqual(chargePanel({ method: 'mercadopago', paymentStatus: 'pending', serviceError: true, userActed: true, providers: { mercadopago: false, stripe: true } }).actions, ['charge']);
// Cash ignores the service error even after a user action
assert.equal(chargePanel({ method: 'cash', paymentStatus: 'pending', serviceError: 'V', userActed: true }).message, t.cashPending);
// Cash write error (failed confirmCashPayment): error tone, chip and confirm button kept for retry
const cashFailed = labels.trip.paymentActionError.cashFailed;
const cashFailedText = `${cashFailed.title}. ${cashFailed.message}`;
assert.deepEqual(chargePanel({ method: 'cash', paymentStatus: 'pending', writeError: true }),
  { message: cashFailedText, tone: 'error', chip: 'cash', actions: ['confirmCash'], live: 'polite' });
assert.equal(chargePanel({ method: 'cash', paymentStatus: 'pending', writeError: 'W' }).message, 'W');
assert.equal(chargePanel({ method: 'cash', paymentStatus: 'pending', writeError: null }).message, t.cashPending);
// Priority: save error beats write error; write error beats informational and success
assert.equal(chargePanel({ method: 'cash', paymentStatus: 'pending', saveError: 'S', writeError: true }).message, 'S');
assert.deepEqual(chargePanel({ method: 'cash', paymentStatus: 'pending', saveError: 'S', writeError: true }).actions, []);
assert.equal(chargePanel({ method: 'cash', paymentStatus: 'pending', serviceError: 'V', userActed: true }).message, t.cashPending);
assert.equal(chargePanel({ method: 'cash', paymentStatus: 'paid', writeError: true }).tone, 'success');
// writeError is cash only: card and legacy ignore it
assert.equal(chargePanel({ method: 'mercadopago', paymentStatus: 'pending', writeError: true, userActed: true }).message, t.cardPendingGeneric);
assert.equal(chargePanel({ method: 'transfer', paymentStatus: 'pending', writeError: true }).message, null);
// Exhaustive: cash with writeError never exposes backend actions
for (const paymentStatus of statuses) {
  for (const writeError of [undefined, true, 'W']) {
    const out = chargePanel({ method: 'cash', paymentStatus, writeError, serviceError: 'V', userActed: true });
    assert.ok(!out.actions.some((a) => BACKEND_ACTIONS.includes(a)));
    assert.ok(out.message !== 'V');
    assert.equal(out.tone === 'error', Boolean(writeError) && out.actions.length > 0);
  }
}
// No arguments does not throw
assert.equal(chargePanel().tone, 'neutral');


// T-126 (RF-57, CA-002-102): one specific message per payments service error class, never a URL, token or header.
{
  const { PAYMENTS_ERROR } = await import('../../src/services/trip/paymentsClient.js');
  const { createPaymentActions } = await import('../../src/services/trip/paymentActions.js');
  const classes = Object.values(PAYMENTS_ERROR);
  assert.equal(classes.length, 9);
  const seen = new Map();
  for (const code of classes) {
    const entry = labels.trip.paymentServiceError[code];
    assert.ok(entry && entry.title && entry.message, code);
    const message = serviceErrorText(code);
    assert.equal(message, `${entry.title}. ${entry.message}`, code);
    assert.ok(!/https?:|bearer|authorization|token|secret/i.test(message), message);
    assert.ok(message.length > 0 && message !== t.serviceError, code);
    seen.set(code, message);
    // The panel paints that text as the single error message, only after a user action.
    const panel = chargePanel({ method: 'mercadopago', paymentStatus: 'pending', serviceError: message, userActed: true });
    assert.equal(panel.message, message);
    assert.equal(panel.tone, 'error');
    assert.equal(chargePanel({ method: 'mercadopago', paymentStatus: 'pending', serviceError: message, userActed: false }).tone, 'info');
    assert.equal(chargePanel({ method: 'cash', paymentStatus: 'pending', serviceError: message, userActed: true }).tone, 'info');
  }
  assert.match(seen.get(PAYMENTS_ERROR.NOT_CONFIGURED), /no está configurado en esta app/);
  for (const code of [PAYMENTS_ERROR.NETWORK, PAYMENTS_ERROR.TIMEOUT, PAYMENTS_ERROR.SERVER]) {
    assert.match(seen.get(code), /No se pudo conectar con el servicio de cobro. Revisa tu conexión y que el servicio esté encendido/);
  }
  assert.match(seen.get(PAYMENTS_ERROR.AUTH), /Tu sesión expiró; vuelve a iniciar sesión/);
  assert.equal(new Set(seen.values()).size, 9, 'each class has its own title and text');
  // Legacy and local codes keep their older texts; unknown or missing codes use the generic text.
  assert.match(serviceErrorText('openFailed'), /No pudimos abrir el pago/);
  assert.match(serviceErrorText('failed'), /No pudimos completar la acción/);
  assert.equal(serviceErrorText('weird'), t.serviceError);
  assert.equal(serviceErrorText(undefined), t.serviceError);

  // Propagation: the class a fake client returns reaches the message through the action runner.
  for (const code of classes) {
    const actions = createPaymentActions({
      requestCheckoutUrl: async () => ({ ok: false, error: code }),
      syncPayment: async () => ({ ok: false, error: code }),
      confirmCashPayment: async () => {},
      openUrl: async () => {},
    });
    const result = await actions.run('verify', { uid: 'u', tripId: 't' });
    assert.equal(serviceErrorText(result.error), seen.get(code), code);
  }
}

// AI-assisted: see AI_LOG.md #59
// Gateway selection (#59): buttons come ONLY from the configured gateways; no default, no saved-method fallback.
{
  const { chargeButtons, RELOAD_PROVIDERS } = await import('../../src/services/trip/chargePanel.js');
  const both = { mercadopago: true, stripe: true };
  const onlyMp = { mercadopago: true, stripe: false };
  const onlyStripe = { mercadopago: false, stripe: true };
  const none = { mercadopago: false, stripe: false };
  const keys = (panel) => chargeButtons(panel).map((b) => b.key);

  // Loading (providers undefined): no charge button, no verify.
  for (const method of ['mercadopago', 'stripe']) {
    const loading = chargePanel({ method, paymentStatus: 'pending' });
    assert.deepEqual(chargeButtons(loading), []);
    assert.equal(loading.message, t.cardPendingGeneric);
  }

  // Both gateways: two charge buttons in order; verify only with a chosen gateway.
  const pendingBoth = chargePanel({ method: 'mercadopago', paymentStatus: 'pending', providers: both });
  assert.deepEqual(chargeButtons(pendingBoth).map((b) => [b.key, b.action, b.provider, b.label]), [
    ['charge', 'charge', 'mercadopago', 'Cobrar con Mercado Pago'],
    ['charge-stripe', 'charge', 'stripe', 'Cobrar con Stripe (tarjeta de prueba)'],
  ]);
  assert.equal(pendingBoth.message, t.cardPendingGeneric);
  assert.equal(pendingBoth.tone, 'info');
  const chosenBoth = chargePanel({ method: 'stripe', paymentStatus: 'pending', providers: both, paymentId: 'cs_1' });
  assert.deepEqual(keys(chosenBoth), ['charge', 'charge-stripe', 'verify']);

  // Stripe is the only gateway: the button is Stripe's, NEVER Mercado Pago, even when the saved method is 'mercadopago'.
  for (const method of ['mercadopago', 'stripe']) {
    const panel = chargePanel({ method, paymentStatus: 'pending', providers: onlyStripe });
    assert.deepEqual(chargeButtons(panel).map((b) => [b.key, b.provider]), [['charge-stripe', 'stripe']]);
  }
  assert.deepEqual(chargeButtons(chargePanel({ method: 'mercadopago', paymentStatus: 'pending', providers: onlyMp })).map((b) => b.provider), ['mercadopago']);

  // Rejected: retry per gateway; a single gateway uses the plain retry label.
  const rejBoth = chargePanel({ method: 'stripe', paymentStatus: 'rejected', providers: both, paymentId: 'cs_1' });
  assert.deepEqual(keys(rejBoth), ['retry', 'retry-stripe', 'verify']);
  assert.equal(chargeButtons(rejBoth)[1].label, labels.trip.retryProvider.stripe);
  const rejOne = chargePanel({ method: 'stripe', paymentStatus: 'rejected', providers: onlyStripe, paymentId: 'cs_1' });
  assert.equal(chargeButtons(rejOne)[0].label, labels.trip.paymentAction.retry);
  assert.equal(chargeButtons(rejOne)[0].provider, 'stripe');
  assert.equal(rejBoth.tone, 'error');
  assert.equal(rejBoth.message, t.cardRejectedChoose);
  assert.equal(rejOne.message, t.cardRejected);

  // Verify needs a chosen gateway (card method + paymentId).
  assert.deepEqual(keys(chargePanel({ method: 'mercadopago', paymentStatus: 'pending', providers: onlyStripe })), ['charge-stripe']);
  assert.deepEqual(keys(chargePanel({ method: 'stripe', paymentStatus: 'pending', providers: onlyStripe, paymentId: 'cs_9' })), ['charge-stripe', 'verify']);
  assert.deepEqual(keys(chargePanel({ method: 'stripe', paymentStatus: 'pending', providers: onlyStripe, paymentId: '' })), ['charge-stripe']);

  // None configured: info message, no charge/retry, no default button.
  for (const [method, status] of [['mercadopago', 'pending'], ['stripe', 'pending'], ['mercadopago', 'rejected'], ['stripe', 'rejected']]) {
    const panel = chargePanel({ method, paymentStatus: status, providers: none });
    assert.equal(panel.message, t.noGateway);
    assert.equal(panel.tone, 'info');
    assert.deepEqual(panel.actions, []);
    assert.deepEqual(chargeButtons(panel), []);
    assert.deepEqual(keys(chargePanel({ method, paymentStatus: status, providers: none, paymentId: 'cs_1' })), ['verify']);
  }
  assert.equal(t.noGateway, 'No hay una pasarela de pago configurada');

  // Providers query failed: clear message + "Reintentar", no charge button of any gateway.
  for (const method of ['mercadopago', 'stripe']) {
    const failed = chargePanel({ method, paymentStatus: 'pending', providersFailed: true });
    assert.equal(failed.message, t.providersFailed);
    assert.equal(failed.tone, 'warning');
    assert.deepEqual(failed.actions, [RELOAD_PROVIDERS]);
    assert.deepEqual(chargeButtons(failed).map((b) => [b.key, b.provider, b.label]), [[RELOAD_PROVIDERS, null, 'Reintentar']]);
  }
  assert.equal(labels.trip.paymentAction.reloadProviders, 'Reintentar');
  // A failed query does not affect cash or an approved card.
  assert.deepEqual(chargePanel({ method: 'cash', paymentStatus: 'pending', providersFailed: true }), chargePanel({ method: 'cash', paymentStatus: 'pending' }));
  assert.equal(chargePanel({ method: 'stripe', paymentStatus: 'approved', providersFailed: true }).tone, 'success');

  // Approved: success and no buttons whatever the gateways are.
  for (const method of ['mercadopago', 'stripe']) {
    for (const providers of [undefined, both, onlyMp, onlyStripe, none]) {
      const panel = chargePanel({ method, paymentStatus: 'approved', providers, paymentId: 'x' });
      assert.equal(panel.tone, 'success');
      assert.deepEqual(panel.actions, []);
      assert.deepEqual(chargeButtons(panel), []);
    }
  }

  // Single message priority: save error > service error > informational.
  const withNone = { method: 'stripe', paymentStatus: 'pending', providers: none, userActed: true, paymentId: 'cs_1' };
  assert.equal(chargePanel({ ...withNone, saveError: true, serviceError: 'x' }).message, labels.trip.saveErrorGeneric);
  assert.equal(chargePanel({ ...withNone, serviceError: 'Boom' }).message, 'Boom');
  assert.equal(chargePanel({ ...withNone, serviceError: 'Boom' }).tone, 'error');
  assert.deepEqual(chargePanel({ ...withNone, serviceError: 'Boom' }).actions, ['verify']);
  assert.equal(chargePanel({ ...withNone, serviceError: 'Boom', userActed: false }).message, t.noGateway);

  // Cash and legacy are unaffected by providers.
  assert.deepEqual(chargePanel({ method: 'cash', paymentStatus: 'pending', providers: none }), chargePanel({ method: 'cash', paymentStatus: 'pending' }));
  assert.deepEqual(chargePanel({ method: 'transfer', paymentStatus: 'pending', providers: both }), chargePanel({ method: 'transfer', paymentStatus: 'pending' }));

  const { isCardMethod } = await import('../../src/services/trip/tripRecord.js');
  assert.deepEqual(['mercadopago', 'stripe', 'cash', 'transfer', undefined].map(isCardMethod), [true, true, false, false, false]);
}

console.log('chargePanel tests passed');

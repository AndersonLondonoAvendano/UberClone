// AI-assisted: see docs/AI_LOG.md #59
// Plain Node tests for the single payment label function and the gateway choices (#59, a, b). Run:
//   node scripts/tests/paymentGateway.test.mjs
import assert from 'node:assert/strict';
import './helpers/registerSrcLoader.mjs';

const { paymentLabelKey, hasChosenGateway, chargeChoices, LABEL_KEY, CHOICE_MESSAGE } = await import('../../src/services/trip/paymentGateway.js');

// Label: "Tarjeta" until a gateway is chosen (paymentId present), then the gateway name.
assert.equal(paymentLabelKey({ method: 'cash' }), LABEL_KEY.CASH);
assert.equal(paymentLabelKey({ method: 'cash', paymentId: 'x' }), LABEL_KEY.CASH);
assert.equal(paymentLabelKey({ method: 'card' }), LABEL_KEY.CARD);
assert.equal(paymentLabelKey({ method: 'mercadopago' }), LABEL_KEY.CARD);
assert.equal(paymentLabelKey({ method: 'mercadopago', paymentId: '' }), LABEL_KEY.CARD);
assert.equal(paymentLabelKey({ method: 'mercadopago', paymentId: null }), LABEL_KEY.CARD);
assert.equal(paymentLabelKey({ method: 'mercadopago', paymentId: 'pref_1' }), LABEL_KEY.MERCADOPAGO);
assert.equal(paymentLabelKey({ method: 'stripe' }), LABEL_KEY.CARD);
assert.equal(paymentLabelKey({ method: 'stripe', paymentId: 'cs_test_1' }), LABEL_KEY.STRIPE);
for (const method of ['transfer', 'none', undefined, null, 42]) assert.equal(paymentLabelKey({ method }), LABEL_KEY.UNKNOWN);
assert.equal(paymentLabelKey(), LABEL_KEY.UNKNOWN);

// Chosen gateway.
assert.equal(hasChosenGateway({ method: 'stripe', paymentId: 'cs' }), true);
assert.equal(hasChosenGateway({ method: 'mercadopago', paymentId: 'p' }), true);
assert.equal(hasChosenGateway({ method: 'mercadopago' }), false);
assert.equal(hasChosenGateway({ method: 'cash', paymentId: 'p' }), false);
assert.equal(hasChosenGateway(), false);

// Choices: only configured gateways, never a default.
assert.deepEqual(chargeChoices({ providers: { mercadopago: true, stripe: true } }), { gateways: ['mercadopago', 'stripe'], message: CHOICE_MESSAGE.NONE });
assert.deepEqual(chargeChoices({ providers: { mercadopago: false, stripe: true } }), { gateways: ['stripe'], message: CHOICE_MESSAGE.NONE });
assert.deepEqual(chargeChoices({ providers: { mercadopago: true, stripe: false } }), { gateways: ['mercadopago'], message: CHOICE_MESSAGE.NONE });
assert.deepEqual(chargeChoices({ providers: { mercadopago: false, stripe: false } }), { gateways: [], message: CHOICE_MESSAGE.NO_GATEWAY });
assert.deepEqual(chargeChoices({ providers: {} }), { gateways: [], message: CHOICE_MESSAGE.NO_GATEWAY });
assert.deepEqual(chargeChoices({ providers: undefined }), { gateways: [], message: CHOICE_MESSAGE.LOADING });
assert.deepEqual(chargeChoices({ providers: null }), { gateways: [], message: CHOICE_MESSAGE.LOADING });
assert.deepEqual(chargeChoices({ providers: undefined, failed: true }), { gateways: [], message: CHOICE_MESSAGE.FAILED });
assert.deepEqual(chargeChoices({ providers: { stripe: true }, failed: true }), { gateways: [], message: CHOICE_MESSAGE.FAILED });
assert.deepEqual(chargeChoices(), { gateways: [], message: CHOICE_MESSAGE.LOADING });
assert.deepEqual(chargeChoices({ providers: { stripe: 'yes' } }), { gateways: [], message: CHOICE_MESSAGE.NO_GATEWAY }, 'only true counts');

console.log('paymentGateway: OK');

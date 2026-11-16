// AI-assisted: see docs/AI_LOG.md #68
// English wording coherence (T-268; CA-006-43, 44, 46).
import test from 'node:test';
import assert from 'node:assert/strict';
import './helpers/registerSrcLoader.mjs';

const { es } = await import('../../src/i18n/dictionaries/es.js');
const { en } = await import('../../src/i18n/dictionaries/en/index.js');

const isNode = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

// Every string leaf, including array items. Functions are skipped (checked separately).
function strings(root, prefix = '', out = []) {
  for (const [key, value] of Object.entries(root)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') out.push([path, value]);
    else if (Array.isArray(value)) value.forEach((v, i) => typeof v === 'string' && out.push([`${path}.${i}`, v]));
    else if (isNode(value)) strings(value, path, out);
  }
  return out;
}

// Card payment notices come from the bank/gateway and keep "declined" (CA-006-44).
const CARD_PAYMENT_EXCEPTIONS = new Set([
  'trip.chargePanel.cardRejected',
  'trip.chargePanel.cardRejectedChoose',
  'history.paymentStatus.rejected',
]);

test('CA-006-43: en uses Reject, I\'ve arrived and Rejected', () => {
  assert.equal(en.trip.reject, 'Reject');
  assert.equal(en.trip.arrive, "I've arrived");
  assert.equal(en.trip.paymentChip.rejected, 'Rejected');
  assert.equal(en.history.status.rejected, 'Rejected');
});

test('CA-006-43/44: no "Decline", "Declined" or "I arrived" in en (except card payment notices)', () => {
  const offenders = strings(en)
    .filter(([path]) => !CARD_PAYMENT_EXCEPTIONS.has(path))
    .filter(([, text]) => /\bdeclin(e|es|ed|ing)\b/i.test(text) || /\bI arrived\b/i.test(text))
    .map(([path, text]) => `${path}: ${text}`);
  assert.deepEqual(offenders, []);
});

test('CA-006-44: card payment exceptions still say "Payment declined"', () => {
  const all = new Map(strings(en));
  for (const path of CARD_PAYMENT_EXCEPTIONS) assert.match(all.get(path), /^Payment declined/, path);
});

test('CA-006-44: hints name the same actions as the buttons', () => {
  assert.match(en.trip.rejectHint, /^Rejects /);
  assert.match(en.trip.rejectCardHint, /^Rejects /);
  assert.match(en.trip.dismissHint, /without rejecting/);
  assert.ok(en.trip.arriveFirstHint.includes(en.trip.arrive), 'arriveFirstHint must quote the button text');
});

test('CA-006-46: delayValue(15) is "15 s" in both languages, on purpose', () => {
  assert.equal(es.notifications.delayValue(15), '15 s');
  assert.equal(en.notifications.delayValue(15), '15 s');
});

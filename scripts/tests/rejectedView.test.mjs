// AI-assisted: see docs/AI_LOG.md #66
// T-230: the «Rechazado» label in History and Detail (RE-09; CA-005-27, D1, D2).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import './helpers/registerSrcLoader.mjs';

const { tripDetailView, REJECTED_CHIP } = await import('../../src/services/trip/tripDetailView.js');
const { labels } = await import('../../src/constants/labels.js');
const { color } = await import('../../src/theme/tokens.js');

const base = { paymentMethod: 'cash', paymentStatus: 'pending', fare: 0, commission: 0, driverEarnings: 0, tip: 0 };

test('detail: rejected shows «Rechazado» with its own icon, not the cancelled chip', () => {
  const rejected = tripDetailView({ ...base, status: 'rejected' }).status;
  const cancelled = tripDetailView({ ...base, status: 'cancelled' }).status;
  assert.equal(rejected.label, 'Rechazado');
  assert.equal(rejected.label, labels.history.status.rejected);
  assert.notEqual(rejected.label, cancelled.label);
  assert.notEqual(rejected.icon, cancelled.icon);
  assert.notEqual(rejected.tone, cancelled.tone);
  assert.deepEqual({ tone: rejected.tone, icon: rejected.icon }, REJECTED_CHIP);
});

test('detail: rejected never shows the "Cobro simulado" chip, even without payment fields', () => {
  const status = tripDetailView({ status: 'rejected' }).status;
  assert.equal(status.label, 'Rechazado');
  assert.notEqual(status.label, labels.history.legacyPayment);
});

test('a completed trip whose payment was rejected by the gateway is NOT «Rechazado» (CA-005-27)', () => {
  const status = tripDetailView({ ...base, status: 'completed', paymentMethod: 'mercadopago', paymentStatus: 'rejected' }).status;
  assert.equal(status.label, labels.history.paymentStatus.rejected);
  assert.notEqual(status.label, labels.history.status.rejected);
  assert.equal(status.tone, 'danger');
});

test('completed and cancelled keep their chips (no regression)', () => {
  assert.equal(tripDetailView({ ...base, status: 'cancelled' }).status.label, 'Cancelado');
  assert.equal(tripDetailView({ ...base, status: 'completed' }).status.label, labels.history.paymentStatus.pending);
});

test('the history row maps rejected with the label, the icon, "Sin cobro" and no legacy chip', () => {
  const item = readFileSync(new URL('../../src/components/TripListItem.js', import.meta.url), 'utf8');
  assert.match(item, /trip\.status === TRIP_STATUS\.REJECTED/);
  assert.match(item, /labels\.history\.status\.rejected/);
  assert.match(item, /REJECTED_CHIP\.icon/);
  assert.match(item, /noCharge \? null : legacyPaymentChip/);
  assert.match(item, /noCharge\s*\?\s*` \$\{labels\.history\.cancelledAmounts\}\.`/); // a11y: amounts say "Sin cobro"
  assert.match(item, /itemA11y[\s\S]*status: statusText/); // the announcement carries the status text
  assert.match(labels.history.itemA11y, /\{status\}/);
});

// WCAG 2.x contrast of the Chip text/background pair used by «Rechazado» (neutral tone: text on surfaceMuted).
function luminance(hex) {
  const channel = (i) => {
    const c = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(1) + 0.0722 * channel(2);
}
const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

test('CA-005-D1: «Rechazado» text contrast is at least 4.5:1 (text on surfaceMuted)', () => {
  assert.equal(REJECTED_CHIP.tone, 'neutral');
  const value = ratio(color.text, color.surfaceMuted);
  console.log(`contrast color.text ${color.text} on color.surfaceMuted ${color.surfaceMuted}: ${value.toFixed(2)}:1`);
  assert.ok(value >= 4.5, `got ${value}`);
});

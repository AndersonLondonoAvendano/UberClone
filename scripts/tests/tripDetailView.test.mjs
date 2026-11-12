// AI-assisted: see docs/AI_LOG.md #57 (T-109)
// AI-assisted: see docs/AI_LOG.md #58 (T-149, T-150: Stripe, CA-002-125)
// Plain Node tests for tripDetailView (T-109, CA-002-86, CA-002-94, CA-002-106). Run: node scripts/tests/tripDetailView.test.mjs
import assert from 'node:assert/strict';
import './helpers/registerSrcLoader.mjs';

const { tripDetailView, validDetailRoute } = await import('../../src/services/trip/tripDetailView.js');

const route = [
  { lat: 6.2442, lng: -75.5812 },
  { lat: 6.25, lng: -75.57 },
];
const full = {
  status: 'paid',
  paymentMethod: 'cash',
  paymentStatus: 'paid',
  durationMin: 12.4,
  distanceKm: 4.56,
  commission: 2500,
  tip: 1000,
  rating: 4.85,
  route,
};
const rowOf = (view, key) => view.rows.find((row) => row.key === key).value;

// New trip with route, tip and rating.
const a = tripDetailView(full);
assert.equal(rowOf(a, 'duration'), '12 min');
assert.equal(rowOf(a, 'distance'), '4,6 km');
assert.equal(rowOf(a, 'commission'), '$ 2.500');
assert.equal(rowOf(a, 'tip'), '$ 1.000');
assert.equal(rowOf(a, 'method'), 'Efectivo');
assert.equal(a.status.label, 'Pagado');
assert.equal(a.rating.value, 5);
assert.equal(a.rating.text, '★ 5');
assert.match(a.rating.a11y, /Calificación 5 de 5/);
assert.deepEqual(a.route, route);
assert.equal(a.routeUnavailableText, null);

// No tip, no rating, no route (old shape) -> texts, never throws.
const b = tripDetailView({ status: 'completed', paymentMethod: 'mercadopago', paymentStatus: 'pending', durationMin: 5, distanceKm: 1, commission: 0 });
assert.equal(rowOf(b, 'tip'), 'Sin propina');
assert.equal(rowOf(b, 'method'), 'Tarjeta'); // #59: no paymentId, the gateway is not chosen yet
assert.equal(rowOf(tripDetailView({ ...full, paymentMethod: 'mercadopago', paymentId: 'p1' }), 'method'), 'Tarjeta (Mercado Pago)'); // CA-002-125: named once chosen
assert.equal(b.status.label, 'Pago pendiente');
assert.equal(b.rating.value, null);
assert.equal(b.rating.text, 'Sin calificación');
assert.equal(b.route, null);
assert.equal(b.routeUnavailableText, 'Ruta no disponible');
assert.equal(rowOf(tripDetailView({ ...full, tip: 0 }), 'tip'), 'Sin propina');
assert.equal(tripDetailView({ ...full, rating: 'x' }).rating.value, null);
assert.equal(tripDetailView({ ...full, rating: 3 }).rating.a11y, 'Calificación 3 de 5');

// Legacy trip (no paymentMethod and no paymentStatus): neutral "Cobro simulado" chip (CA-002-94, CA-002-106).
const c = tripDetailView({ status: 'completed', fare: 8000, durationMin: 10, distanceKm: 3 });
assert.equal(c.status.label, 'Cobro simulado');
assert.equal(c.status.tone, 'neutral');
assert.equal(c.routeUnavailableText, 'Ruta no disponible');
assert.equal(rowOf(c, 'method'), 'No disponible');

// Cancelled and unknown values.
assert.equal(tripDetailView({ status: 'cancelled', paymentMethod: 'cash', paymentStatus: 'pending' }).status.label, 'Cancelado');
assert.equal(tripDetailView({ status: 'completed', paymentMethod: 'cash', paymentStatus: 'weird' }).status.label, 'Pago sin estado');
assert.equal(rowOf(tripDetailView({ ...full, paymentMethod: 'transfer' }), 'method'), 'No disponible');
assert.equal(rowOf(tripDetailView({ ...full, paymentMethod: '__proto__' }), 'method'), 'No disponible');

// Stripe trip (CA-002-125): a card, never cash or "Cobro simulado", with the gateway name.
const s = tripDetailView({ status: 'completed', paymentMethod: 'stripe', paymentId: 'cs_1', paymentStatus: 'approved', durationMin: 5, distanceKm: 1, commission: 0 });
assert.equal(rowOf(s, 'method'), 'Tarjeta (Stripe)');
assert.equal(rowOf(tripDetailView({ ...full, paymentMethod: 'stripe' }), 'method'), 'Tarjeta', 'stripe without paymentId');
assert.equal(s.status.label, 'Pago aprobado');
assert.equal(s.status.tone, 'success');
assert.equal(tripDetailView({ status: 'completed', paymentMethod: 'stripe', paymentStatus: 'pending' }).status.label, 'Pago pendiente');
assert.equal(tripDetailView({ status: 'completed', paymentMethod: 'stripe', paymentStatus: 'rejected' }).status.tone, 'danger');
assert.equal(rowOf(tripDetailView({ ...full, paymentMethod: 'cash' }), 'method'), 'Efectivo');

// Route guards: one point, invalid coordinates, wrong types, [lat, lng] pairs.
assert.equal(validDetailRoute(undefined), null);
assert.equal(validDetailRoute([]), null);
assert.equal(validDetailRoute([route[0]]), null);
assert.equal(validDetailRoute([route[0], { lat: NaN, lng: 1 }]), null);
assert.equal(validDetailRoute([route[0], { lat: 91, lng: 1 }]), null);
assert.equal(validDetailRoute([route[0], { lat: 1, lng: 181 }]), null);
assert.equal(validDetailRoute([route[0], null]), null);
assert.equal(validDetailRoute('route'), null);
assert.deepEqual(validDetailRoute([[6.2, -75.5], [6.3, -75.6]]), [{ lat: 6.2, lng: -75.5 }, { lat: 6.3, lng: -75.6 }]);
assert.equal(tripDetailView({ ...full, route: [route[0]] }).routeUnavailableText, 'Ruta no disponible');

// Bad input never throws.
for (const bad of [null, undefined, 5, 'x', [], {}]) {
  const view = tripDetailView(bad);
  assert.equal(view.rows.length, 5);
  assert.equal(view.route, null);
  assert.ok(!JSON.stringify(view).includes('NaN'));
}
console.log('tripDetailView tests ok');

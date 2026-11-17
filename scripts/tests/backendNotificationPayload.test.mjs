// AI-assisted: see AI_LOG.md #64
// T-172: pure test request and FCM message.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildMessage, buildTestRequest } from '../../backend/src/notifications/payload.js';

const NOW = 1_700_000_000_000;
const request = buildTestRequest({ now: NOW, idFactory: () => 'id-1', targetUid: 'uid-9', random: () => 0.5 });

test('request has no fare and no address and expires in 90 s', () => {
  assert.equal(request.requestId, 'id-1');
  assert.equal(request.targetUid, 'uid-9');
  assert.equal(request.expiresAt, NOW + 90_000);
  for (const key of Object.keys(request)) assert.doesNotMatch(key, /fare|price|tarifa|address|email|phone/i);
});

test('default idFactory gives distinct ids', () => {
  const a = buildTestRequest({ now: NOW, targetUid: 'u' });
  const b = buildTestRequest({ now: NOW, targetUid: 'u' });
  assert.notEqual(a.requestId, b.requestId);
});

test('coordinates stay near the test zone (Medellin)', () => {
  for (let i = 0; i < 50; i += 1) {
    const r = buildTestRequest({ now: NOW, targetUid: 'u' });
    for (const point of [r.origin, r.destination]) {
      assert.ok(Math.abs(point.lat - 6.25) < 0.05 && Math.abs(point.lng + 75.57) < 0.05);
    }
  }
});

test('message has the exact shape', () => {
  const fixed = {
    ...request,
    distanceKm: 3.2,
    durationMin: 9,
    origin: { lat: 6.25, lng: -75.56 },
    destination: { lat: 6.26, lng: -75.55 },
    passengerName: 'Mateo Gil',
  };
  assert.deepEqual(buildMessage(['t1', 't2'], fixed), {
    tokens: ['t1', 't2'],
    notification: { title: 'Nueva solicitud de viaje', body: 'Económico · 3,2 km · 9 min' },
    data: {
      type: 'trip_request',
      requestId: 'id-1',
      targetUid: 'uid-9',
      expiresAt: String(NOW + 90_000),
      category: 'economico',
      distanceKm: '3.2',
      durationMin: '9',
      originLat: '6.25',
      originLng: '-75.56',
      destLat: '6.26',
      destLng: '-75.55',
      passengerName: 'Mateo Gil',
      paymentMethod: 'cash',
    },
    android: { priority: 'high', ttl: 90_000, collapseKey: 'trip_request', notification: { channelId: 'solicitudes', tag: 'trip_request', icon: 'notification_icon', color: '#009688' } },
  });
});

test('a single token string is wrapped and every data value is a string', () => {
  const message = buildMessage('only', request);
  assert.deepEqual(message.tokens, ['only']);
  for (const value of Object.values(message.data)) assert.equal(typeof value, 'string');
  assert.doesNotMatch(JSON.stringify(message), /fare|price|address|tarifa|email|phone/i);
});

// AI-assisted: see AI_LOG.md #73
test('D-205: the message carries the fixed tag and collapse key next to the channel, with no fare or address', () => {
  const message = buildMessage('only', request);
  assert.equal(message.android.collapseKey, 'trip_request');
  assert.equal(message.android.notification.tag, 'trip_request');
  assert.equal(message.android.notification.channelId, 'solicitudes');
  assert.doesNotMatch(JSON.stringify(message.android), /fare|price|address|tarifa/i);
});

// AI-assisted: see AI_LOG.md #74
test('D-207: paymentMethod defaults to cash, accepts card and rejects anything else', () => {
  assert.equal(request.paymentMethod, 'cash');
  assert.equal(buildTestRequest({ now: NOW, targetUid: 'u', paymentMethod: 'card' }).paymentMethod, 'card');
  for (const bad of ['mercadopago', 'CASH', '', null, 1]) {
    assert.throws(() => buildTestRequest({ now: NOW, targetUid: 'u', paymentMethod: bad }), TypeError);
  }
});

test('D-207: the message carries data.paymentMethod as a string, still without fare or address', () => {
  const card = buildTestRequest({ now: NOW, targetUid: 'u', paymentMethod: 'card' });
  const message = buildMessage('only', card);
  assert.equal(message.data.paymentMethod, 'card');
  assert.equal(buildMessage('only', request).data.paymentMethod, 'cash');
  assert.doesNotMatch(JSON.stringify(message), /fare|price|address|tarifa/i);
});

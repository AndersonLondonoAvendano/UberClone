// AI-assisted: see AI_LOG.md #60
// Plain Node tests for src/services/profileUpdater.js (CA-002-137, CA-002-144). Run:
//   node scripts/tests/profileUpdater.test.mjs
import './helpers/registerSrcLoader.mjs';
import assert from 'node:assert/strict';

const { createProfileUpdater } = await import('../../src/services/profileUpdater.js');

const calls = [];
const fakeDb = { name: 'db' };
const stamp = { sentinel: 'serverTimestamp' };
function makeUpdater(updateDoc) {
  return createProfileUpdater({
    doc: (db, collection, id) => ({ db, path: `${collection}/${id}` }),
    updateDoc,
    serverTimestamp: () => stamp,
    db: fakeDb,
  });
}
const update = makeUpdater(async (ref, data) => { calls.push({ ref, data }); });
const payload = { fullName: 'Ana Perez', phone: '3000000001', vehicleColor: 'Blanco', payoutEmail: 'ana@example.com' };

await update('uid1', payload);
assert.equal(calls.length, 1, 'single updateDoc call');
assert.equal(calls[0].ref.path, 'drivers/uid1');
assert.equal(calls[0].ref.db, fakeDb);
assert.deepEqual(Object.keys(calls[0].data).sort(), [
  'documents.mercadoPagoEmail', 'personalData.fullName', 'personalData.phone', 'updatedAt', 'vehicle.color',
]);
assert.equal(calls[0].data['personalData.fullName'], 'Ana Perez');
assert.equal(calls[0].data['personalData.phone'], '3000000001');
assert.equal(calls[0].data['vehicle.color'], 'Blanco');
assert.equal(calls[0].data['documents.mercadoPagoEmail'], 'ana@example.com');
assert.equal(calls[0].data.updatedAt, stamp);

// Never forbidden paths or whole objects.
const forbidden = ['accountStatus', 'vehicle.category', 'vehicle.plate', 'vehicle.brand', 'vehicle.model', 'vehicle.year',
  'documents.license', 'documents.soat', 'documents.technicalReview', 'personalData', 'vehicle', 'documents'];
for (const key of Object.keys(calls[0].data)) assert.ok(!forbidden.includes(key), `forbidden key ${key}`);

// Payloads with extra or missing fields are rejected without writing.
const before = calls.length;
await assert.rejects(update('uid1', { ...payload, accountStatus: 'approved' }));
await assert.rejects(update('uid1', { ...payload, plate: 'XYZ999' }));
const { payoutEmail, ...missing } = payload;
await assert.rejects(update('uid1', missing));
await assert.rejects(update('uid1', { ...payload, phone: 3000000001 }));
await assert.rejects(update('uid1', null));
await assert.rejects(update('', payload));
assert.equal(calls.length, before, 'rejected payloads never reach updateDoc');

// updateDoc errors propagate.
const failing = makeUpdater(async () => { throw new Error('network'); });
await assert.rejects(failing('uid1', payload), /network/);

console.log('profileUpdater tests passed');

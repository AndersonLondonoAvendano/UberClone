// AI-assisted: see docs/AI_LOG.md #55
// Plain Node tests for computeBalance (CA-002-75). Run: node scripts/tests/balance.test.mjs
import assert from 'node:assert/strict';
import './helpers/registerSrcLoader.mjs';

const { computeBalance } = await import('../../src/utils/earnings.js');

const mp = (driverEarnings, paymentStatus = 'approved') => ({ paymentMethod: 'mercadopago', paymentStatus, status: 'paid', driverEarnings, commission: 0 });
const cash = (commission, paymentStatus = 'paid') => ({ paymentMethod: 'cash', paymentStatus, status: 'paid', commission, driverEarnings: 0 });

assert.equal(computeBalance([mp(15360)]), 15360, 'approved card');
assert.equal(computeBalance([cash(3840)]), -3840, 'cash only is negative');
assert.equal(computeBalance([mp(15360), cash(3840)]), 11520, 'mixed');
assert.equal(computeBalance([mp(1000), cash(3840)]), -2840, 'commission greater than approved');
assert.equal(computeBalance([mp(15360, 'pending'), mp(9000, 'rejected')]), 0, 'unpaid card ignored');
assert.equal(computeBalance([{ status: 'completed', fare: 19200, commission: 3840, driverEarnings: 15360 }]), 0, 'legacy trip without method');
assert.equal(computeBalance([null, undefined, 5, { paymentMethod: 'cash', paymentStatus: 'paid', commission: 'x' }, mp(NaN)]), 0, 'invalid values');
assert.equal(computeBalance(undefined), 0);
assert.equal(computeBalance([{ ...cash(500), status: 'cancelled' }]), 0, 'cancelled ignored');
assert.ok(Number.isFinite(computeBalance([mp(Infinity), cash(-Infinity)])));
console.log('balance tests ok');

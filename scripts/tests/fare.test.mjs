// AI-assisted: see AI_LOG.md #56
// Example of the brief with the REAL calculateFare (CA-002-87): 8.5 km and 22 min.
import assert from 'node:assert/strict';
import './helpers/registerSrcLoader.mjs';

const { calculateFare } = await import('../../src/utils/fare.js');

assert.deepEqual(calculateFare({ distanceKm: 8.5, durationMin: 22, category: 'economico' }), { fare: 19200, commission: 3840, driverEarnings: 15360 });
assert.deepEqual(calculateFare({ distanceKm: 8.5, durationMin: 22, category: 'xl' }), { fare: 26900, commission: 5380, driverEarnings: 21520 });
console.log('fare tests ok');

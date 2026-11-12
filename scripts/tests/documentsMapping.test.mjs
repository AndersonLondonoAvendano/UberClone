// AI-assisted: see docs/AI_LOG.md #55
// Plain Node tests for src/utils/documentsMapping.js (CA-002-53, CA-002-54, CA-002-55). Run:
//   node scripts/tests/documentsMapping.test.mjs
import assert from 'node:assert/strict';
import {
  INITIAL_DOCUMENT_FIELDS,
  buildDocumentsPayload,
  documentsFromStored,
  validateDocumentFields,
} from '../../src/utils/documentsMapping.js';

// 2026-11-11 12:00 in Colombia.
const NOW = new Date('2026-11-11T17:00:00Z');
const TOMORROW = new Date(2026, 10, 12);
const YESTERDAY = new Date(2026, 10, 10);
const URL_A = 'https://res.cloudinary.com/demo/a.jpg';
const URL_B = 'https://res.cloudinary.com/demo/b.jpg';
const URL_C = 'https://res.cloudinary.com/demo/c.jpg';

const base = {
  mercadoPagoEmail: ' conductor@example.com ',
  termsAccepted: true,
  ...INITIAL_DOCUMENT_FIELDS,
  licenseNumber: ' 12345678 ',
  licensePhotoUrl: URL_A,
  licenseExpiresAt: TOMORROW,
  soatPhotoUrl: URL_B,
  soatExpiresAt: TOMORROW,
};

// CA-002-53: vehicle under 5 years -> review not asked, reason shown, form valid without it.
let result = validateDocumentFields(base, '2024', NOW);
assert.equal(result.technicalReview.required, false);
assert.ok(result.technicalReview.reason.length > 0);
assert.equal(result.isValid, true, 'valido sin revision para vehiculo 2024');

// 5 years or more -> photo and expiry required; "Enviar" blocked without them.
result = validateDocumentFields(base, '2020', NOW);
assert.equal(result.technicalReview.required, true);
assert.equal(result.isValid, false, 'invalido sin revision para vehiculo 2020');
assert.ok(result.errors.technicalReviewPhotoUrl && result.errors.technicalReviewExpiresAt);
const full = { ...base, technicalReviewPhotoUrl: URL_C, technicalReviewExpiresAt: TOMORROW };
assert.equal(validateDocumentFields(full, '2020', NOW).isValid, true, 'valido con revision para 2020');
assert.equal(
  validateDocumentFields({ ...full, technicalReviewExpiresAt: YESTERDAY }, '2020', NOW).errors.technicalReviewExpiresAt !== null,
  true,
  'revision vencida',
);
// Year missing or invalid -> conservative: required.
assert.equal(validateDocumentFields(base, '', NOW).technicalReview.required, true);
assert.equal(validateDocumentFields(base, 'abc', NOW).isValid, false);

// CA-002-54: each invalid field reports its own error text; valid fields report null.
result = validateDocumentFields(
  { ...full, licenseNumber: '12', licensePhotoUrl: '', licenseExpiresAt: YESTERDAY, soatPhotoUrl: '  ', soatExpiresAt: null },
  '2020',
  NOW,
);
for (const key of ['licenseNumber', 'licensePhotoUrl', 'licenseExpiresAt', 'soatPhotoUrl', 'soatExpiresAt']) {
  assert.ok(typeof result.errors[key] === 'string' && result.errors[key].length > 0, `error ${key}`);
}
assert.equal(result.errors.technicalReviewPhotoUrl, null);
assert.equal(result.isValid, false);
assert.equal(validateDocumentFields(INITIAL_DOCUMENT_FIELDS, '2020', NOW).isValid, false, 'formulario vacio');

// CA-002-55: stored structure, review required.
let payload = buildDocumentsPayload(full, '2020', { commissionRate: 0.2, now: NOW });
assert.deepEqual(payload, {
  mercadoPagoEmail: 'conductor@example.com',
  termsAccepted: true,
  commissionRate: 0.2,
  license: { number: '12345678', photoUrl: URL_A, expiresAt: '2026-11-12' },
  soat: { photoUrl: URL_B, expiresAt: '2026-11-12' },
  technicalReview: { required: true, photoUrl: URL_C, expiresAt: '2026-11-12' },
});

// Review not required: nulls even when the form still holds stale review values.
payload = buildDocumentsPayload(full, '2024', { commissionRate: 0.2, now: NOW });
assert.deepEqual(payload.technicalReview, { required: false, photoUrl: null, expiresAt: null });

// No bank account or card fields anywhere in the payload.
const payloadText = JSON.stringify(payload).toLowerCase();
for (const forbidden of ['bank', 'banco', 'card', 'tarjeta', 'cuenta', 'account']) {
  assert.equal(payloadText.includes(forbidden), false, `sin ${forbidden}`);
}

// Preload round trip.
const restored = documentsFromStored(buildDocumentsPayload(full, '2020', { commissionRate: 0.2, now: NOW }));
assert.equal(restored.licenseNumber, '12345678');
assert.equal(restored.licensePhotoUrl, URL_A);
assert.equal(restored.licenseExpiresAt.getTime(), TOMORROW.getTime());
assert.equal(restored.technicalReviewPhotoUrl, URL_C);
assert.equal('commissionRate' in restored, false);

// Accounts saved before R7 (no license/soat/technicalReview): nothing is invented or blocked.
assert.deepEqual(documentsFromStored({ mercadoPagoEmail: 'a@b.co', termsAccepted: true, commissionRate: 0.2 }), {
  mercadoPagoEmail: 'a@b.co',
  termsAccepted: true,
});
assert.deepEqual(documentsFromStored(undefined), {});
assert.deepEqual(documentsFromStored(null), {});
// Not required stored with nulls loads as empty values.
const notRequired = documentsFromStored({ technicalReview: { required: false, photoUrl: null, expiresAt: null } });
assert.equal(notRequired.technicalReviewPhotoUrl, '');
assert.equal(notRequired.technicalReviewExpiresAt, null);

console.log('ok');

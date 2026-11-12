// AI-assisted: see docs/AI_LOG.md #60
// Plain Node tests for src/utils/profileEdit.js (CA-002-132, CA-002-133, CA-002-135, CA-002-140). Run:
//   node scripts/tests/profileEdit.test.mjs
import './helpers/registerSrcLoader.mjs';
import assert from 'node:assert/strict';

const { PROFILE_FIELDS, profileValuesFrom, validateProfileDraft, diffProfile, canSave, buildProfilePayload } =
  await import('../../src/utils/profileEdit.js');
const { maskEmail } = await import('../../src/utils/mask.js');

const profile = {
  accountStatus: 'approved',
  personalData: { fullName: 'Ana Perez', phone: '3001234567', documentNumber: '123456' },
  vehicle: { color: 'blanco', category: 'standard', plate: 'ABC123' },
  documents: { mercadoPagoEmail: 'ana@example.com' },
};
const baseline = profileValuesFrom(profile);

// profileValuesFrom
assert.deepEqual(baseline, { fullName: 'Ana Perez', phone: '3001234567', vehicleColor: 'blanco', payoutEmail: 'ana@example.com' });
assert.deepEqual(profileValuesFrom(null), { fullName: '', phone: '', vehicleColor: '', payoutEmail: '' });
assert.deepEqual(profileValuesFrom({ personalData: {} }), { fullName: '', phone: '', vehicleColor: '', payoutEmail: '' });

// Valid baseline; "blanco" is a valid color.
assert.equal(validateProfileDraft(baseline).isValid, true);
assert.deepEqual(validateProfileDraft(baseline).errors, {});

// Invalid per field.
const invalid = [
  ['fullName', 'Ana 123'],
  ['fullName', ''],
  ['fullName', '   '],
  ['phone', '300123456'],
  ['phone', '30012345678'],
  ['phone', '300 123 4567'],
  ['phone', ''],
  ['vehicleColor', 'transparente'],
  ['vehicleColor', ''],
  ['payoutEmail', 'sin-arroba'],
  ['payoutEmail', ''],
  ['payoutEmail', '   '],
];
for (const [field, value] of invalid) {
  const result = validateProfileDraft({ ...baseline, [field]: value });
  assert.equal(result.isValid, false, `${field}=${JSON.stringify(value)}`);
  assert.deepEqual(Object.keys(result.errors), [field]);
}
assert.equal(validateProfileDraft(undefined).isValid, false);

// Valid per field (trim allowed for name and email).
assert.equal(validateProfileDraft({ ...baseline, fullName: '  Maria Nuñez  ' }).isValid, true);
assert.equal(validateProfileDraft({ ...baseline, payoutEmail: '  nuevo@example.com  ' }).isValid, true);
assert.equal(validateProfileDraft({ ...baseline, vehicleColor: 'blanco' }).isValid, true);

// diff / canSave.
assert.deepEqual(diffProfile(baseline, baseline), []);
assert.equal(canSave(baseline, baseline), false);
assert.deepEqual(diffProfile(baseline, { ...baseline, phone: '3109876543' }), ['phone']);
assert.equal(canSave(baseline, { ...baseline, phone: '3109876543' }), true);
// Typing and returning to the original is not a change; spaces around name/email do not count.
assert.deepEqual(diffProfile(baseline, { ...baseline, fullName: 'Ana Perez ' }), []);
assert.deepEqual(diffProfile(baseline, { ...baseline, payoutEmail: ' ana@example.com' }), []);
assert.equal(canSave(baseline, { ...baseline, fullName: ' Ana Perez  ' }), false);
// Several changes.
assert.deepEqual(
  diffProfile(baseline, { ...baseline, fullName: 'Luis', payoutEmail: 'l@x.co' }),
  ['fullName', 'payoutEmail'],
);
// With an error it cannot be saved, even with changes.
assert.equal(canSave(baseline, { ...baseline, phone: '123' }), false);
assert.equal(canSave(baseline, { ...baseline, fullName: '   ' }), false);
// An empty original email stays empty: no change, no save.
const emptyEmail = { ...baseline, payoutEmail: '' };
assert.equal(canSave(emptyEmail, emptyEmail), false);

// Payload: always the four fields, trimmed, nothing else.
const payload = buildProfilePayload({
  ...baseline,
  fullName: '  Luis Gomez ',
  payoutEmail: ' luis@example.com ',
  accountStatus: 'rejected',
  category: 'xl',
  plate: 'ZZZ999',
});
assert.deepEqual(payload, { fullName: 'Luis Gomez', phone: '3001234567', vehicleColor: 'blanco', payoutEmail: 'luis@example.com' });
assert.deepEqual(Object.keys(payload), PROFILE_FIELDS);
assert.equal(Object.keys(payload).length, 4);
for (const forbidden of ['accountStatus', 'category', 'plate']) assert.equal(forbidden in payload, false);
assert.deepEqual(Object.keys(buildProfilePayload({})), PROFILE_FIELDS);
assert.equal(buildProfilePayload({}).fullName, '');

// CA-002-140 (read side): the email still masks.
assert.equal(maskEmail(baseline.payoutEmail), 'an***@example.com');
assert.notEqual(maskEmail(baseline.payoutEmail), baseline.payoutEmail);

console.log('profileEdit: all tests passed');

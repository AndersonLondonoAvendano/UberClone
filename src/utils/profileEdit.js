// AI-assisted: see AI_LOG.md #60
// Pure helpers for the editable profile (R13, DP-53): validation, diff and write payload.
import { isValidEmail, isValidFullName, isValidPhone, isValidVehicleColor } from './validators';

export const PROFILE_FIELDS = ['fullName', 'phone', 'vehicleColor', 'payoutEmail'];

function text(value) {
  return typeof value === 'string' ? value : '';
}

// Trimmed form used for comparison and for the payload. The phone is compared as typed:
// validation already requires exactly 10 digits, so it never carries spaces.
function normalized(field, value) {
  const raw = text(value);
  return field === 'fullName' || field === 'payoutEmail' ? raw.trim() : raw;
}

export function profileValuesFrom(profile) {
  return {
    fullName: text(profile?.personalData?.fullName),
    phone: text(profile?.personalData?.phone),
    vehicleColor: text(profile?.vehicle?.color),
    payoutEmail: text(profile?.documents?.mercadoPagoEmail),
  };
}

export function validateProfileDraft(draft) {
  const source = draft ?? {};
  const errors = {};
  if (!isValidFullName(source.fullName)) errors.fullName = true;
  if (!isValidPhone(source.phone)) errors.phone = true;
  if (!isValidVehicleColor(source.vehicleColor)) errors.vehicleColor = true;
  if (!isValidEmail(normalized('payoutEmail', source.payoutEmail))) errors.payoutEmail = true;
  return { errors, isValid: Object.keys(errors).length === 0 };
}

export function diffProfile(baseline, draft) {
  const before = baseline ?? {};
  const after = draft ?? {};
  return PROFILE_FIELDS.filter((field) => normalized(field, before[field]) !== normalized(field, after[field]));
}

export function canSave(baseline, draft) {
  return diffProfile(baseline, draft).length > 0 && validateProfileDraft(draft).isValid;
}

export function buildProfilePayload(draft) {
  const source = draft ?? {};
  const payload = {};
  for (const field of PROFILE_FIELDS) payload[field] = normalized(field, source[field]);
  return payload;
}

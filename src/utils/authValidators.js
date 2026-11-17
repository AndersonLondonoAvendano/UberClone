// AI-assisted: see AI_LOG.md #54
// Pure validators for the authentication forms. They return error CODES (never texts); the screens
// translate a code with labels.auth.fieldErrors. No React Native or Firebase imports.

export const PASSWORD_MIN_LENGTH = 8;

export const AUTH_FIELD_ERROR = {
  EMAIL_REQUIRED: 'emailRequired',
  EMAIL_INVALID: 'emailInvalid',
  PASSWORD_REQUIRED: 'passwordRequired',
  PASSWORD_TOO_SHORT: 'passwordTooShort',
  CONFIRMATION_REQUIRED: 'confirmationRequired',
  CONFIRMATION_MISMATCH: 'confirmationMismatch',
};

// Same pattern as the registration email.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The email is trimmed before checking; the password is never trimmed.
export function validateEmail(value) {
  const email = typeof value === 'string' ? value.trim() : '';
  if (email.length === 0) return AUTH_FIELD_ERROR.EMAIL_REQUIRED;
  return EMAIL_PATTERN.test(email) ? null : AUTH_FIELD_ERROR.EMAIL_INVALID;
}

export function validatePassword(value) {
  if (typeof value !== 'string' || value.length === 0) return AUTH_FIELD_ERROR.PASSWORD_REQUIRED;
  return value.length >= PASSWORD_MIN_LENGTH ? null : AUTH_FIELD_ERROR.PASSWORD_TOO_SHORT;
}

export function validatePasswordConfirmation(password, confirmation) {
  if (typeof confirmation !== 'string' || confirmation.length === 0) return AUTH_FIELD_ERROR.CONFIRMATION_REQUIRED;
  return confirmation === password ? null : AUTH_FIELD_ERROR.CONFIRMATION_MISMATCH;
}

function compact(errors) {
  const result = {};
  Object.keys(errors).forEach((key) => {
    if (errors[key]) result[key] = errors[key];
  });
  return result;
}

// Login only checks that both fields are filled and the email looks like one; the length rule is
// not applied so an older, shorter password is never blocked on the client.
export function validateLogin({ email, password } = {}) {
  return compact({
    email: validateEmail(email),
    password: typeof password === 'string' && password.length > 0 ? null : AUTH_FIELD_ERROR.PASSWORD_REQUIRED,
  });
}

export function validateSignUp({ email, password, confirmation } = {}) {
  return compact({
    email: validateEmail(email),
    password: validatePassword(password),
    confirmation: validatePasswordConfirmation(password, confirmation),
  });
}

// First field of `order` that has an error, or null.
export function firstInvalidField(errors, order) {
  if (!errors || !Array.isArray(order)) return null;
  return order.find((field) => Boolean(errors[field])) ?? null;
}

// Always-visible password requirements with their current state (text/icon, not only color).
export function passwordRequirements(password) {
  const value = typeof password === 'string' ? password : '';
  return [{ id: 'minLength', met: value.length >= PASSWORD_MIN_LENGTH }];
}

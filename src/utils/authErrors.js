// AI-assisted: see docs/AI_LOG.md #54
// Pure mapping of Firebase Auth error codes to a stable kind and a Spanish message from labels.
// No React Native or Firebase imports. It never returns the raw code and never logs anything.

import { labels } from '../constants/labels';

export const AUTH_ERROR_KIND = {
  INVALID_CREDENTIALS: 'invalidCredentials',
  NETWORK: 'network',
  TOO_MANY_REQUESTS: 'tooManyRequests',
  EMAIL_IN_USE: 'emailInUse',
  WEAK_PASSWORD: 'weakPassword',
  INVALID_EMAIL: 'invalidEmail',
  NEUTRAL: 'neutral',
  GENERIC: 'generic',
};

const LOGIN_CREDENTIAL_CODES = new Set([
  'auth/invalid-credential',
  'auth/user-not-found',
  'auth/wrong-password',
  'auth/invalid-email',
]);

function readCode(error) {
  const code = error && typeof error === 'object' ? error.code : undefined;
  return typeof code === 'string' ? code.trim().toLowerCase() : '';
}

function result(kind, field) {
  const message = kind === AUTH_ERROR_KIND.NEUTRAL ? labels.auth.reset.neutral : labels.auth.errors[kind];
  return field ? { kind, message, field } : { kind, message };
}

// context: 'login' | 'signup' | 'reset'. For 'reset', pass `undefined` as the error on success.
export function mapAuthError(context, error) {
  const code = readCode(error);

  if (code === 'auth/network-request-failed') return result(AUTH_ERROR_KIND.NETWORK);
  if (code === 'auth/too-many-requests') return result(AUTH_ERROR_KIND.TOO_MANY_REQUESTS);

  if (context === 'login') {
    if (LOGIN_CREDENTIAL_CODES.has(code)) return result(AUTH_ERROR_KIND.INVALID_CREDENTIALS);
    return result(AUTH_ERROR_KIND.GENERIC);
  }

  if (context === 'signup') {
    if (code === 'auth/email-already-in-use') return result(AUTH_ERROR_KIND.EMAIL_IN_USE, 'email');
    if (code === 'auth/weak-password') return result(AUTH_ERROR_KIND.WEAK_PASSWORD, 'password');
    if (code === 'auth/invalid-email') return result(AUTH_ERROR_KIND.INVALID_EMAIL, 'email');
    return result(AUTH_ERROR_KIND.GENERIC);
  }

  if (context === 'reset') {
    // Never reveals whether the email has an account.
    if (code === 'auth/invalid-email') return result(AUTH_ERROR_KIND.INVALID_EMAIL, 'email');
    if (code === '' || code === 'auth/user-not-found') return result(AUTH_ERROR_KIND.NEUTRAL);
    return result(AUTH_ERROR_KIND.GENERIC);
  }

  return result(AUTH_ERROR_KIND.GENERIC);
}

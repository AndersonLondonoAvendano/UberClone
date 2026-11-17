// AI-assisted: see AI_LOG.md #54
// Pure session gate: no React Native or Firebase imports, so it can be tested with plain node.
// It maps (authStatus, accountStatus) to ONE route. The root navigator mounts a single branch per
// route, so there is never a shared back stack between authentication and the driver screens.

import { ACCOUNT_STATUS } from '../constants/accountStatus';

export const AUTH_STATUS = {
  LOADING: 'loading', // onAuthStateChanged has not answered yet (or a legacy session is closing)
  SIGNED_OUT: 'signedOut',
  SIGNED_IN: 'signedIn',
};

export const GATE_ROUTE = {
  LOADING: 'loading',
  AUTH: 'auth',
  REGISTRATION: 'registration', // signed in, no drivers/{uid} document
  PENDING: 'pending', // signed in, document pending approval
  MAIN: 'main',
  ERROR: 'error', // signed in, the driver document could not be read (existing retry screen)
};

// Classifies the user reported by onAuthStateChanged ({ uid, email, isAnonymous } or null).
// A legacy anonymous user is treated as no session: the caller must close it (closeLegacy) and keep
// showing the loading screen until the sign-out reports null.
export function classifyAuthUser(user) {
  if (!user) return { authStatus: AUTH_STATUS.SIGNED_OUT, authUser: null, closeLegacy: false };
  if (user.isAnonymous === true) return { authStatus: AUTH_STATUS.LOADING, authUser: null, closeLegacy: true };
  return {
    authStatus: AUTH_STATUS.SIGNED_IN,
    authUser: { uid: user.uid, email: user.email ?? null },
    closeLegacy: false,
  };
}

// accountStatus: an ACCOUNT_STATUS value, or null when there is no drivers/{uid} document (once resolved).
// The default authStatus keeps one-argument calls valid (old tests).
export function decideGateRoute(accountStatus, authStatus = AUTH_STATUS.SIGNED_IN) {
  if (authStatus === AUTH_STATUS.SIGNED_OUT) return GATE_ROUTE.AUTH;
  if (authStatus !== AUTH_STATUS.SIGNED_IN) return GATE_ROUTE.LOADING;
  switch (accountStatus) {
    case ACCOUNT_STATUS.LOADING:
      return GATE_ROUTE.LOADING;
    case ACCOUNT_STATUS.ERROR:
      return GATE_ROUTE.ERROR;
    case ACCOUNT_STATUS.APPROVED:
      return GATE_ROUTE.MAIN;
    case ACCOUNT_STATUS.PENDING:
      return GATE_ROUTE.PENDING;
    default:
      return GATE_ROUTE.REGISTRATION;
  }
}

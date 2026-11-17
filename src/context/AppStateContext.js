// AI-assisted: see AI_LOG.md #12
// AI-assisted: see AI_LOG.md #25
// AI-assisted: see AI_LOG.md #50
// AI-assisted: see AI_LOG.md #54
// Shared app state (useContext): auth session (email/password), real account status (Firestore)
// and the demo value. The drivers/{uid} subscription opens only with a session and
// is released when the user changes or is lost.

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ACCOUNT_STATUS } from '../constants/accountStatus';
import { AUTH_STATUS, classifyAuthUser } from '../navigation/sessionGate';
import { listenToAuthState, signOutLegacyAnonymous } from '../services/authService';
import { listenToDriverAccount } from '../services/driverRepository';

const INITIAL_DEMO_VALUE = '';
const INITIAL_AUTH = { authStatus: AUTH_STATUS.LOADING, authUser: null };
const SIGNED_OUT_AUTH = { authStatus: AUTH_STATUS.SIGNED_OUT, authUser: null };
// Account data is stored with the uid it belongs to, so data of a previous user is never shown.
const EMPTY_ACCOUNT = { uid: null, resolved: false, status: null, profile: null, error: null };

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  const [auth, setAuth] = useState(INITIAL_AUTH);
  const [account, setAccount] = useState(EMPTY_ACCOUNT);
  const [resolveToken, setResolveToken] = useState(0);
  const [demoValue, setDemoValue] = useState(INITIAL_DEMO_VALUE);

  const { authStatus, authUser } = auth;
  const driverId = authUser ? authUser.uid : null;

  // Session: stays in "loading" until the first onAuthStateChanged answer. A legacy anonymous user
  // is closed here and treated as no session (no error, no migration).
  useEffect(() => {
    let cancelled = false;
    const unsubscribe = listenToAuthState(
      (user) => {
        if (cancelled) return;
        const result = classifyAuthUser(user);
        setAuth({ authStatus: result.authStatus, authUser: result.authUser });
        if (result.closeLegacy) {
          signOutLegacyAnonymous().catch(() => {
            if (!cancelled) setAuth(SIGNED_OUT_AUTH);
          });
        }
      },
      () => {
        if (!cancelled) setAuth(SIGNED_OUT_AUTH);
      },
    );
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  // Driver document: only with a session; released when the uid changes or is lost.
  useEffect(() => {
    if (!driverId) {
      setAccount(EMPTY_ACCOUNT);
      return undefined;
    }
    let cancelled = false;
    const update = (patch) => {
      if (cancelled) return;
      setAccount((previous) => ({ ...(previous.uid === driverId ? previous : { ...EMPTY_ACCOUNT, uid: driverId }), ...patch }));
    };

    setAccount({ ...EMPTY_ACCOUNT, uid: driverId });
    const unsubscribeSnapshot = listenToDriverAccount(driverId, {
      onData: (data) => update({ profile: data }),
      onChange: (status) => update({ resolved: true, status, error: null }),
      onError: (error) => update({ resolved: true, error }),
    });

    return () => {
      cancelled = true;
      unsubscribeSnapshot();
    };
  }, [driverId, resolveToken]);

  const retryAccountStatus = useCallback(() => {
    setResolveToken((token) => token + 1);
  }, []);

  // Session reset: clears the demo value. The driver document data is NOT
  // touched here (that would send the gate to loading before signOut runs): it is cleared by the
  // effect above the moment the uid is lost, and `current` below never shows another uid's data.
  const reset = useCallback(() => {
    setDemoValue(INITIAL_DEMO_VALUE);
  }, []);

  const current = account.uid === driverId ? account : EMPTY_ACCOUNT;
  const driverProfile = current.profile;
  const accountStatus = current.error ? ACCOUNT_STATUS.ERROR : (current.resolved ? current.status : ACCOUNT_STATUS.LOADING);

  const value = useMemo(
    () => ({
      driverId,
      authStatus,
      authUser,
      driverProfile,
      accountStatus,
      retryAccountStatus,
      demoValue,
      setDemoValue,
      reset,
    }),
    [driverId, authStatus, authUser, driverProfile, accountStatus, retryAccountStatus, demoValue, reset],
  );

  return createElement(AppStateContext.Provider, { value }, children);
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === null) {
    throw new Error('useAppState must be used inside an AppStateProvider');
  }
  return context;
}

// AI-assisted: see docs/AI_LOG.md #12
// AI-assisted: see docs/AI_LOG.md #25
// AI-assisted: see docs/AI_LOG.md #50
// Shared app state (useContext): real account status (Firestore) with a local override, and the demo value.

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ACCOUNT_STATUS } from '../constants/accountStatus';
import { ensureAnonymousUser } from '../services/firebase';
import { listenToDriverAccount } from '../services/driverRepository';

const INITIAL_DEMO_VALUE = '';
const VALID_STATUSES = Object.values(ACCOUNT_STATUS);

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  const [driverId, setDriverId] = useState(null);
  const [realAccountStatus, setRealAccountStatus] = useState(null); // null = no drivers/{uid} doc yet
  const [driverProfile, setDriverProfile] = useState(null); // drivers/{uid} data, same subscription
  const [accountError, setAccountError] = useState(null);
  const [isResolving, setIsResolving] = useState(true);
  const [simulatedStatus, setSimulatedStatus] = useState(null); // local override, set by simulateAccountStatus
  const [resolveToken, setResolveToken] = useState(0);
  const [demoValue, setDemoValue] = useState(INITIAL_DEMO_VALUE);

  useEffect(() => {
    let cancelled = false;
    let unsubscribeSnapshot = null;

    setIsResolving(true);
    setAccountError(null);

    ensureAnonymousUser()
      .then((uid) => {
        if (cancelled) return;
        setDriverId(uid);
        unsubscribeSnapshot = listenToDriverAccount(uid, {
          onData: (data) => {
            if (!cancelled) setDriverProfile(data);
          },
          onChange: (status) => {
            if (cancelled) return;
            setIsResolving(false);
            setRealAccountStatus(status);
          },
          onError: (error) => {
            if (cancelled) return;
            setIsResolving(false);
            setAccountError(error);
          },
        });
      })
      .catch((error) => {
        if (cancelled) return;
        setIsResolving(false);
        setAccountError(error);
      });

    return () => {
      cancelled = true;
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, [resolveToken]);

  const retryAccountStatus = useCallback(() => {
    setSimulatedStatus(null);
    setResolveToken((token) => token + 1);
  }, []);

  // An invalid value is ignored: state is unchanged.
  const simulateAccountStatus = useCallback((value) => {
    if (!VALID_STATUSES.includes(value)) return;
    setSimulatedStatus(value);
  }, []);

  const accountStatus = simulatedStatus
    ?? (accountError ? ACCOUNT_STATUS.ERROR : (isResolving ? ACCOUNT_STATUS.LOADING : realAccountStatus));

  const value = useMemo(
    () => ({ driverId, driverProfile, accountStatus, retryAccountStatus, simulateAccountStatus, demoValue, setDemoValue }),
    [driverId, driverProfile, accountStatus, retryAccountStatus, simulateAccountStatus, demoValue],
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

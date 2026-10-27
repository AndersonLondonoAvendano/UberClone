// AI-assisted: see docs/AI_LOG.md #12
// Shared app state (useContext): simulated account status and the demo value.

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

export const INITIAL_ACCOUNT_STATUS = ACCOUNT_STATUS.PENDING;
export const ACCOUNT_RESOLVE_DELAY_MS = 800;
const INITIAL_DEMO_VALUE = '';

const VALID_STATUSES = Object.values(ACCOUNT_STATUS);

// Pure helper (testable without React): owns at most one pending timer.
export function createAccountStatusResolver({
  onResolve,
  delayMs = ACCOUNT_RESOLVE_DELAY_MS,
  resolvedStatus = INITIAL_ACCOUNT_STATUS,
  setTimeoutFn = setTimeout,
  clearTimeoutFn = clearTimeout,
}) {
  let timerId = null;
  const cancel = () => {
    if (timerId !== null) {
      clearTimeoutFn(timerId);
      timerId = null;
    }
  };
  const start = () => {
    cancel();
    timerId = setTimeoutFn(() => {
      timerId = null;
      onResolve(resolvedStatus);
    }, delayMs);
  };
  return { start, cancel, isPending: () => timerId !== null };
}

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  const [accountStatus, setAccountStatus] = useState(ACCOUNT_STATUS.LOADING);
  const [demoValue, setDemoValue] = useState(INITIAL_DEMO_VALUE);
  const resolverRef = useRef(null);
  if (resolverRef.current === null) {
    resolverRef.current = createAccountStatusResolver({ onResolve: setAccountStatus });
  }

  useEffect(() => {
    const resolver = resolverRef.current;
    resolver.start();
    return () => resolver.cancel();
  }, []);

  const retryAccountStatus = useCallback(() => {
    setAccountStatus(ACCOUNT_STATUS.LOADING);
    resolverRef.current.start();
  }, []);

  // An invalid value is ignored: state is unchanged and any pending resolution is kept.
  const simulateAccountStatus = useCallback((value) => {
    if (!VALID_STATUSES.includes(value)) return;
    resolverRef.current.cancel();
    setAccountStatus(value);
  }, []);

  const value = useMemo(
    () => ({ accountStatus, retryAccountStatus, simulateAccountStatus, demoValue, setDemoValue }),
    [accountStatus, retryAccountStatus, simulateAccountStatus, demoValue],
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

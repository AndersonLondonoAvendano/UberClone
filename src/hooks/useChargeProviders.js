// AI-assisted: see AI_LOG.md #59
// Load of the configured payment gateways (T-146, RF-62, DP-48). Calls the backend on mount and keeps only
// booleans: { mercadopago, stripe }. It reports { providers, failed, reload }: providers is undefined while
// loading or after a failure, and failed is true after a failure so the screen can offer "Reintentar"
// (no gateway button is ever shown by default).

import { useCallback, useEffect, useState } from 'react';
import { getProviders } from '../services/paymentsService';

export function useChargeProviders() {
  const [state, setState] = useState({ providers: undefined, failed: false });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    getProviders()
      .then((result) => {
        if (!active) return;
        if (result?.ok) {
          setState({ providers: { mercadopago: result.providers.mercadopago === true, stripe: result.providers.stripe === true }, failed: false });
        } else {
          setState({ providers: undefined, failed: true });
        }
      })
      .catch(() => {
        if (active) setState({ providers: undefined, failed: true });
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  const reload = useCallback(() => {
    setState({ providers: undefined, failed: false });
    setAttempt((n) => n + 1);
  }, []);

  return { providers: state.providers, failed: state.failed, reload };
}

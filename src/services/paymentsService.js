// AI-assisted: see docs/AI_LOG.md #55
// Wires the payments client to the real fetch, the backend URL and the Firebase Auth ID token of the
// signed-in driver (T-95). The app never holds a Mercado Pago key: the backend creates the checkout.

import { BACKEND_TIMEOUT_MS, BACKEND_URL } from '../config/backend';
import { auth } from './firebase';
import { createPaymentsClient } from './trip/paymentsClient';

const client = createPaymentsClient({
  fetchFn: (...args) => fetch(...args),
  getToken: async () => (auth.currentUser ? auth.currentUser.getIdToken() : null),
  baseUrl: BACKEND_URL,
  timeoutMs: BACKEND_TIMEOUT_MS,
});

// AI-assisted: see docs/AI_LOG.md #58 (T-144: provider in checkout and sync, configured gateways)
export const getProviders = () => client.getProviders();
export const requestCheckoutUrl = (tripId, provider) => client.requestCheckoutUrl(tripId, provider);
export const syncPayment = (tripId, provider) => client.syncPayment(tripId, provider);

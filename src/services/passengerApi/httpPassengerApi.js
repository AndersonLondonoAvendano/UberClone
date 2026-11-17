// AI-assisted: see AI_LOG.md #42
// Real passenger API adapter: SKELETON until the API is known. It handles transport only
// (fetch, timeout, polling) and delegates every shape to mappers.js. The paths below are an
// ASSUMPTION. Inactive while PASSENGER_API_MODE is 'mock'.

import { PASSENGER_API_TIMEOUT_MS } from '../../config/passengerApi';
import { PASSENGER_API_ERROR, createPassengerApiError } from './contract';
import { fromLocation, fromTripStatus, toPassengerApiError, toTrip, toTripRequest } from './mappers';

const POLL_INTERVAL_MS = 5000;

export function createHttpPassengerApi({ baseUrl = process.env.EXPO_PUBLIC_PASSENGER_API_URL } = {}) {
  async function request(path, { method = 'GET', body } = {}) {
    if (!baseUrl) {
      throw createPassengerApiError(PASSENGER_API_ERROR.NETWORK, 'La API del pasajero no está configurada');
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PASSENGER_API_TIMEOUT_MS);
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
      if (!response.ok) throw toPassengerApiError({ status: response.status });
      return response.status === 204 ? null : await response.json();
    } catch (cause) {
      if (cause && cause.code && Object.values(PASSENGER_API_ERROR).includes(cause.code)) throw cause;
      throw toPassengerApiError(cause);
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    // Polling until the real API says whether it offers a push channel.
    subscribeToRequests(onRequest, onError) {
      let stopped = false;
      const seen = new Set();
      const poll = async () => {
        try {
          const list = (await request('/requests')) ?? [];
          for (const raw of list) {
            const tripRequest = toTripRequest(raw);
            if (!stopped && !seen.has(tripRequest.id)) {
              seen.add(tripRequest.id);
              onRequest(tripRequest);
            }
          }
        } catch (error) {
          if (!stopped && onError) onError(error);
        }
      };
      poll();
      const interval = setInterval(poll, POLL_INTERVAL_MS);
      return () => {
        stopped = true;
        clearInterval(interval);
      };
    },
    async acceptRequest(requestId) {
      return toTrip(await request(`/requests/${encodeURIComponent(requestId)}/accept`, { method: 'POST' }));
    },
    async rejectRequest(requestId) {
      await request(`/requests/${encodeURIComponent(requestId)}/reject`, { method: 'POST' });
    },
    async reportTripStatus(tripId, status) {
      return toTrip(
        await request(`/trips/${encodeURIComponent(tripId)}/status`, {
          method: 'POST',
          body: { status: fromTripStatus(status) },
        }),
      );
    },
    async cancelTrip(tripId) {
      return toTrip(await request(`/trips/${encodeURIComponent(tripId)}/cancel`, { method: 'POST' }));
    },
    async reportDriverLocation(tripId, location) {
      await request(`/trips/${encodeURIComponent(tripId)}/location`, { method: 'POST', body: fromLocation(location) });
    },
    // AI-assisted: see AI_LOG.md #44
    // The real backend owns the trip state: there is nothing to release on the client.
    releaseTrip() {
      return Promise.resolve(false);
    },
    // A push request is not adoptable by the real API adapter yet (T-179).
    adoptRequest() {
      return 'not_supported';
    },
    // The real API cannot be asked for a request on demand.
    requestNow() {
      return 'not_supported';
    },
  };
}

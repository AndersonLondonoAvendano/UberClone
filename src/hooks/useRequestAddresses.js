// AI-assisted: see AI_LOG.md #61
// Text to show for the origin and destination of a request (D-125): the resolved street, "Buscando
// dirección…" while it is being looked up, and the original (simulated) text if the lookup failed.
// Never starts a lookup itself (useTripRequests does when the request arrives).

import { useEffect, useState } from 'react';
import { labels } from '../constants/labels';
import { ADDRESS_STATUS, addressState, subscribeAddresses } from '../services/geocoding/requestAddresses';

function textOf(request, name) {
  const state = addressState(request, name);
  if (state.status === ADDRESS_STATUS.PENDING) return labels.trip.addressSearching;
  if (state.status === ADDRESS_STATUS.RESOLVED && state.text) return state.text;
  return request?.[name]?.address || labels.trip.addressFallback;
}

export function useRequestAddresses(request) {
  const [, setVersion] = useState(0);
  useEffect(() => subscribeAddresses(() => setVersion((value) => value + 1)), []);
  return {
    origin: textOf(request, 'origin'),
    destination: textOf(request, 'destination'),
    originPending: addressState(request, 'origin').status === ADDRESS_STATUS.PENDING,
    destinationPending: addressState(request, 'destination').status === ADDRESS_STATUS.PENDING,
  };
}

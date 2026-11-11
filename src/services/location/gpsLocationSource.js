// AI-assisted: see docs/AI_LOG.md #42
// GPS location source (T-41): expo-location in the foreground only (no background location).
// Common interface of every source:
//   requestPermission() => Promise<'granted' | 'denied' | 'unavailable'>
//   start({ onPosition, onError, onEnd }) => stop   (stop is synchronous and idempotent)
// Positions are { lat, lng, timestamp }.

import * as Location from 'expo-location';
import { GPS_DISTANCE_INTERVAL_M } from '../../config/location';

export function createGpsLocationSource() {
  return {
    async requestPermission() {
      try {
        const current = await Location.getForegroundPermissionsAsync();
        if (current.status === Location.PermissionStatus.GRANTED) return 'granted';
        const { status } = await Location.requestForegroundPermissionsAsync();
        return status === Location.PermissionStatus.GRANTED ? 'granted' : 'denied';
      } catch {
        return 'unavailable';
      }
    },

    start({ onPosition, onError } = {}) {
      let cancelled = false;
      let subscription = null;
      (async () => {
        try {
          const watch = await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.Balanced, distanceInterval: GPS_DISTANCE_INTERVAL_M },
            (position) => {
              if (cancelled || !onPosition) return;
              const { latitude, longitude } = position.coords;
              onPosition({ lat: latitude, lng: longitude, timestamp: position.timestamp ?? Date.now() });
            },
            (reason) => {
              if (!cancelled && onError) onError(reason);
            },
          );
          if (cancelled) watch.remove();
          else subscription = watch;
        } catch (error) {
          if (!cancelled && onError) onError(error);
        }
      })();
      return () => {
        cancelled = true;
        if (subscription) subscription.remove();
        subscription = null;
      };
    },
  };
}

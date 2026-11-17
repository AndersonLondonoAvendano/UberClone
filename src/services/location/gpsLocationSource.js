// AI-assisted: see AI_LOG.md #42
// AI-assisted: see AI_LOG.md #43
// GPS location source (T-41): expo-location in the foreground only (no background location).
// Common interface of every source:
//   requestPermission() => Promise<'granted' | 'denied' | 'unavailable'>
//   getPermission() => Promise<'granted' | 'denied' | 'unavailable'>  (reads only, never prompts; #44)
//   checkServices() => Promise<boolean>        (phone location turned on; never shows a dialog)
//   askToEnableServices() => Promise<boolean>  (at most one system dialog, then checkServices)
//   start({ onPosition, onError, onEnd }) => stop   (stop is synchronous and idempotent)
// start never opens the system "turn on location" dialog (mayShowUserSettingsDialog: false): that
// dialog is shown only by askToEnableServices, once per user action, so it cannot loop when the
// app returns to the foreground.
// Positions are { lat, lng, timestamp }.

import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { GPS_DISTANCE_INTERVAL_M } from '../../config/location';

async function checkServices() {
  try {
    return await Location.hasServicesEnabledAsync();
  } catch {
    return false;
  }
}

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

    // AI-assisted: see AI_LOG.md #44
    // Reads the current permission without any dialog (used by the silent foreground check).
    async getPermission() {
      try {
        const current = await Location.getForegroundPermissionsAsync();
        return current.status === Location.PermissionStatus.GRANTED ? 'granted' : 'denied';
      } catch {
        return 'unavailable';
      }
    },

    checkServices,

    // Android shows the Google "location accuracy" dialog once; a refusal rejects and is ignored.
    // iOS has no such dialog: the driver turns location on in Settings.
    async askToEnableServices() {
      if (Platform.OS === 'android') {
        try {
          await Location.enableNetworkProviderAsync();
        } catch {
          // Refused or not resolvable: the result of checkServices below decides.
        }
      }
      return checkServices();
    },

    start({ onPosition, onError } = {}) {
      let cancelled = false;
      let subscription = null;
      (async () => {
        try {
          const watch = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.Balanced,
              distanceInterval: GPS_DISTANCE_INTERVAL_M,
              mayShowUserSettingsDialog: false,
            },
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

// AI-assisted: see docs/AI_LOG.md #64
// React Native Firebase adapter. All dependencies are injected, so this file never imports the SDK
// and can be loaded by `node --test`. The real wiring lives in rnFirebaseDefault.js.
//
// Error contract: every method returns a promise (or a function) and PROPAGATES the SDK errors
// (rejects). Callers decide how to handle them; spikeProbe and the root handler catch them.
import {
  PERMISSION_STATE,
  POST_NOTIFICATIONS_MIN_API,
  POST_NOTIFICATIONS_PERMISSION,
} from '../constants';

// `messaging`: { getToken(), onTokenRefresh(cb) => unsubscribe, deleteToken() }
// `permissions`: PermissionsAndroid-like { check(permission), request(permission), RESULTS }
// `platform`: 'android' | 'ios'; `osVersion`: Android API level (Platform.Version).
export function createRnFirebaseAdapter({ messaging, permissions, platform, osVersion }) {
  const needsRuntimePermission = platform === 'android' && Number(osVersion) >= POST_NOTIFICATIONS_MIN_API;

  function normalize(result) {
    if (result === permissions.RESULTS.GRANTED) return PERMISSION_STATE.GRANTED;
    if (result === permissions.RESULTS.NEVER_ASK_AGAIN) return PERMISSION_STATE.BLOCKED;
    return PERMISSION_STATE.DENIED;
  }

  return {
    async getPermissionState() {
      if (platform !== 'android') return PERMISSION_STATE.UNSUPPORTED;
      if (!needsRuntimePermission) return PERMISSION_STATE.GRANTED;
      const granted = await permissions.check(POST_NOTIFICATIONS_PERMISSION);
      return granted ? PERMISSION_STATE.GRANTED : PERMISSION_STATE.DENIED;
    },

    async requestPermission() {
      if (platform !== 'android') return PERMISSION_STATE.UNSUPPORTED;
      if (!needsRuntimePermission) return PERMISSION_STATE.GRANTED;
      return normalize(await permissions.request(POST_NOTIFICATIONS_PERMISSION));
    },

    getToken() {
      return messaging.getToken();
    },

    // Returns the unsubscribe function. Only fires while the app is in the foreground (SDK behavior).
    onTokenRefresh(callback) {
      return messaging.onTokenRefresh(callback);
    },

    deleteToken() {
      return messaging.deleteToken();
    },
  };
}

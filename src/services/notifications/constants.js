// AI-assisted: see docs/AI_LOG.md #64
// Constants for the push notification service. The channel id must match
// `messaging_android_notification_channel_id` in the root firebase.json.

export const NOTIFICATION_CHANNEL_ID = 'solicitudes';
export const NOTIFICATION_CHANNEL_NAME = 'Solicitudes de viaje';

// Android 13 (API 33) introduced the runtime POST_NOTIFICATIONS permission.
export const POST_NOTIFICATIONS_PERMISSION = 'android.permission.POST_NOTIFICATIONS';
export const POST_NOTIFICATIONS_MIN_API = 33;

// Normalized permission states returned by the adapter.
export const PERMISSION_STATE = Object.freeze({
  GRANTED: 'granted',
  DENIED: 'denied',
  BLOCKED: 'blocked', // the user chose "do not ask again": only system settings can change it
  UNSUPPORTED: 'unsupported', // iOS is out of scope for this project
});

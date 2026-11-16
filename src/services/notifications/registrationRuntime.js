// AI-assisted: see docs/AI_LOG.md #64
// Real wiring of the registration controller (T-184, T-186): the notifications service, the backend
// client, the AsyncStorage preference and the pending intent. One instance per app. Everything native
// is resolved lazily (getNotifications loads the SDK on first call), so a missing native module only
// fails the calls that need it, which the controller already absorbs.

import { getNotifications } from './index';
import { createRegistrationController } from './registration';

let instance = null;

export function getRegistrationController() {
  if (instance === null) {
    const { notificationsApi } = require('./notificationsService');
    const { notificationPreference } = require('./preference');
    const { pendingIntent } = require('./pendingIntent');
    instance = createRegistrationController({
      notifications: {
        getPermissionState: () => getNotifications().getPermissionState(),
        requestPermission: () => getNotifications().requestPermission(),
        getToken: () => getNotifications().getToken(),
        onTokenRefresh: (callback) => getNotifications().onTokenRefresh(callback),
        deleteToken: () => getNotifications().deleteToken(),
      },
      api: notificationsApi,
      preference: notificationPreference,
      intents: pendingIntent,
    });
  }
  return instance;
}

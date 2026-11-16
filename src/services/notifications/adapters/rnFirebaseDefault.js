// AI-assisted: see docs/AI_LOG.md #64
// Real wiring of the RN Firebase adapter. With backgroundHandler.js it is the only app code that
// imports `@react-native-firebase/*`; load it lazily with require().
// Uses the modular API of v27 (the namespaced `messaging()` call does not exist in this version).
import { PermissionsAndroid, Platform } from 'react-native';
import {
  deleteToken,
  getInitialNotification,
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
} from '@react-native-firebase/messaging';
import { createRnFirebaseAdapter } from './rnFirebaseAdapter';

export function createDefaultRnFirebaseAdapter() {
  const instance = getMessaging();
  return createRnFirebaseAdapter({
    messaging: {
      getToken: () => getToken(instance),
      onTokenRefresh: (callback) => onTokenRefresh(instance, callback),
      deleteToken: () => deleteToken(instance),
      onMessage: (callback) => onMessage(instance, callback),
      onNotificationOpenedApp: (callback) => onNotificationOpenedApp(instance, callback),
      getInitialNotification: () => getInitialNotification(instance),
    },
    permissions: PermissionsAndroid,
    platform: Platform.OS,
    osVersion: Platform.Version,
  });
}

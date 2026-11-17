// AI-assisted: see AI_LOG.md #64
// Background message handler. It runs in the headless JS context (app closed), where only
// react-native and @react-native-firebase/messaging are safe to load (D-145). It has no effects and
// imports nothing from the app; it only logs a masked line in development. The SDK is required
// lazily inside try/catch so a native failure can never break startup.

export function registerBackgroundHandler() {
  try {
    const { getMessaging, setBackgroundMessageHandler } = require('@react-native-firebase/messaging');
    setBackgroundMessageHandler(getMessaging(), async () => {
      if (__DEV__) console.log('[fcm] background message received (content not printed)');
    });
    return true;
  } catch {
    return false;
  }
}

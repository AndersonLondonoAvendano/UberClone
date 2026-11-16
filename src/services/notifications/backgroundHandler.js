// AI-assisted: see docs/AI_LOG.md #64
// Background message handler. FCM requires it to be registered in the root index.js before
// registerRootComponent. The SDK is required lazily inside try/catch so a native failure can never
// break app startup. The handler does nothing and never prints the message content.

export function registerBackgroundHandler() {
  try {
    const { getMessaging, setBackgroundMessageHandler } = require('@react-native-firebase/messaging');
    setBackgroundMessageHandler(getMessaging(), async () => {});
    return true;
  } catch {
    return false;
  }
}

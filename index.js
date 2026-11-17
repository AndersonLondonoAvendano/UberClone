// AI-assisted: see AI_LOG.md #64
// Headless-safe entry (D-145). When the app is closed, RN Firebase starts a JS context without an
// activity (HeadlessJsTaskService) and evaluates this whole file. Only the background handler
// registration may run at load time: no 'expo', no expo-* and no app graph here, because that
// context has no globalThis.expo and expo-modules-core would throw at evaluation.
import { AppRegistry } from 'react-native';

import { registerBackgroundHandler } from './src/services/notifications/backgroundHandler';

registerBackgroundHandler();

// Lazy root: the app graph and Expo's registerRootComponent load only when React Native mounts the
// 'main' runnable of a normal activity (never for a headless task). registerRootComponent replaces
// 'main' with its own runnable (dev-tools wrapper: Fast Refresh and dev client keep working), and this
// first run then delegates to it with the same parameters.
const lazyMain = (appParameters, displayMode) => {
  const { registerRootComponent } = require('expo');
  registerRootComponent(require('./App').default);
  const realMain = AppRegistry.getRunnable('main');
  if (typeof realMain !== 'function' || realMain === lazyMain) {
    throw new Error('registerRootComponent did not register the main runnable');
  }
  realMain(appParameters, displayMode);
};
AppRegistry.registerRunnable('main', lazyMain);

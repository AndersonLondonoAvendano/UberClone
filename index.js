import { registerRootComponent } from 'expo';

import App from './App';
import { registerBackgroundHandler } from './src/services/notifications/backgroundHandler';

// AI-assisted: see docs/AI_LOG.md #64
// FCM background handler: must be registered here, before registerRootComponent. It never throws.
registerBackgroundHandler();

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

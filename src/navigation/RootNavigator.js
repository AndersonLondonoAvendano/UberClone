// AI-assisted: see docs/AI_LOG.md #20
// Root navigator: a native stack that declares ONE screen, chosen by the account status.
// loading -> startup (loading), error -> startup (error), approved -> main drawer, anything else
// (pending or unknown) -> registration tabs. Because only one route exists at a time, the wrong
// branch can never be reached while the status is loading.

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ACCOUNT_STATUS } from '../constants/accountStatus';
import { useAppState } from '../context/AppStateContext';
import { StartupScreen } from '../screens/startup/StartupScreen';
import { color } from '../theme/tokens';
import { MainDrawer } from './MainDrawer';
import { RegistrationTabs } from './RegistrationTabs';

const Stack = createNativeStackNavigator();

export const ROOT_SCREEN = {
  STARTUP_LOADING: 'StartupLoading',
  STARTUP_ERROR: 'StartupError',
  MAIN: 'Main',
  REGISTRATION: 'Registration',
};

// The branch change is driven by state, not by the user, so there is no transition animation.
const SCREEN_OPTIONS = {
  headerShown: false,
  animation: 'none',
  contentStyle: { backgroundColor: color.bg },
};

// Pure: the route name that corresponds to an account status.
export function pickScreen(accountStatus) {
  switch (accountStatus) {
    case ACCOUNT_STATUS.LOADING:
      return ROOT_SCREEN.STARTUP_LOADING;
    case ACCOUNT_STATUS.ERROR:
      return ROOT_SCREEN.STARTUP_ERROR;
    case ACCOUNT_STATUS.APPROVED:
      return ROOT_SCREEN.MAIN;
    default:
      return ROOT_SCREEN.REGISTRATION;
  }
}

// Module-level wrappers keep a stable component identity, so they do not remount on every render.
function LoadingScreen() {
  return <StartupScreen kind="loading" />;
}

function ErrorScreen() {
  return <StartupScreen kind="error" />;
}

const COMPONENTS = {
  [ROOT_SCREEN.STARTUP_LOADING]: LoadingScreen,
  [ROOT_SCREEN.STARTUP_ERROR]: ErrorScreen,
  [ROOT_SCREEN.MAIN]: MainDrawer,
  [ROOT_SCREEN.REGISTRATION]: RegistrationTabs,
};

export function RootNavigator() {
  const { accountStatus } = useAppState();
  const name = pickScreen(accountStatus);

  return (
    <Stack.Navigator screenOptions={SCREEN_OPTIONS}>
      <Stack.Screen name={name} component={COMPONENTS[name]} />
    </Stack.Navigator>
  );
}

// AI-assisted: see AI_LOG.md #20
// AI-assisted: see AI_LOG.md #54
// Root navigator: a native stack that declares ONE screen, chosen by the session gate
// (sessionGate.js). loading -> startup (loading), error -> startup (error), auth -> authentication
// stack, registration/pending -> registration tabs, main -> main drawer.
// Back button: only one root route exists at a time and a change of branch replaces it (never a
// push), so the authentication stack and the driver screens never share a history. From the main
// app back cannot reach Login; from Login back leaves the app. The providers of the driver
// (Availability, Trip, RegistrationForm) live inside MainDrawer / RegistrationTabs, so they and
// their listeners are mounted only in the branches that have a session.

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppState } from '../context/AppStateContext';
import { StartupScreen } from '../screens/startup/StartupScreen';
import { color } from '../theme/tokens';
import { AuthStack } from './AuthStack';
import { MainDrawer } from './MainDrawer';
import { RegistrationTabs } from './RegistrationTabs';
import { AUTH_STATUS, GATE_ROUTE, decideGateRoute } from './sessionGate';

const Stack = createNativeStackNavigator();

export const ROOT_SCREEN = {
  STARTUP_LOADING: 'StartupLoading',
  STARTUP_ERROR: 'StartupError',
  AUTH: 'Auth',
  MAIN: 'Main',
  REGISTRATION: 'Registration',
};

// The branch change is driven by state, not by the user, so there is no transition animation.
const SCREEN_OPTIONS = {
  headerShown: false,
  animation: 'none',
  contentStyle: { backgroundColor: color.bg },
};

// Pure: the route name for an account status and an auth status. The default authStatus keeps
// one-argument calls valid. 'registration' and 'pending' share one route name on purpose: submitting
// the form turns the status to pending and the same tabs (with their success state) must stay mounted.
export function pickScreen(accountStatus, authStatus = AUTH_STATUS.SIGNED_IN) {
  switch (decideGateRoute(accountStatus, authStatus)) {
    case GATE_ROUTE.AUTH:
      return ROOT_SCREEN.AUTH;
    case GATE_ROUTE.ERROR:
      return ROOT_SCREEN.STARTUP_ERROR;
    case GATE_ROUTE.MAIN:
      return ROOT_SCREEN.MAIN;
    case GATE_ROUTE.REGISTRATION:
    case GATE_ROUTE.PENDING:
      return ROOT_SCREEN.REGISTRATION;
    default:
      return ROOT_SCREEN.STARTUP_LOADING;
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
  [ROOT_SCREEN.AUTH]: AuthStack,
  [ROOT_SCREEN.MAIN]: MainDrawer,
  [ROOT_SCREEN.REGISTRATION]: RegistrationTabs,
};

export function RootNavigator() {
  const { accountStatus, authStatus } = useAppState();
  const name = pickScreen(accountStatus, authStatus);

  return (
    <Stack.Navigator screenOptions={SCREEN_OPTIONS}>
      <Stack.Screen name={name} component={COMPONENTS[name]} />
    </Stack.Navigator>
  );
}

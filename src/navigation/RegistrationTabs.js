// AI-assisted: see docs/AI_LOG.md #15
// AI-assisted: see docs/AI_LOG.md #16
// AI-assisted: see docs/AI_LOG.md #26
// AI-assisted: see docs/AI_LOG.md #60
// Registration bottom tabs: personal data, vehicle and documents.
// The screen header is drawn by each screen, so the navigator header is hidden. The bar is a custom
// component (AppTabBar) that reads the tab text from the title option (short names).
// Wrapped with RegistrationFormProvider; a navigator-level blur listener marks each tab as
// visited when the driver leaves it, so its field errors show from then on even without
// resubmitting (per-field "touched" still covers errors on the active tab).
// While the registration is not sent, the welcome screen shows first; its action opens the tabs at the
// first incomplete step (initialRouteName). Pending/approved accounts go straight to the tabs.

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useState } from 'react';
import { labels } from '../constants/labels';
import { useAppState } from '../context/AppStateContext';
import { RegistrationFormProvider, useRegistrationForm } from '../context/RegistrationFormContext';
import { DocumentsScreen } from '../screens/registration/DocumentsScreen';
import { PersonalDataScreen } from '../screens/registration/PersonalDataScreen';
import { VehicleScreen } from '../screens/registration/VehicleScreen';
import { WelcomeScreen } from '../screens/registration/WelcomeScreen';
import { color } from '../theme/tokens';
import { shouldShowWelcome } from '../utils/registrationProgress';
import { AppTabBar } from './AppTabBar';

const Tab = createBottomTabNavigator();

function tabOptions({ text, accessibilityLabel, testID }) {
  return {
    title: text,
    tabBarAccessibilityLabel: accessibilityLabel,
    tabBarButtonTestID: testID,
    tabBarAllowFontScaling: true,
  };
}

const SCREEN_OPTIONS = {
  headerShown: false,
  sceneStyle: { backgroundColor: color.bg },
};

const PERSONAL_DATA_OPTIONS = tabOptions({
  text: labels.registrationFlow.tabShort.personalData,
  accessibilityLabel: labels.a11y.tabs.personalData,
  testID: 'tab-personal-data',
});
const VEHICLE_OPTIONS = tabOptions({
  text: labels.registrationFlow.tabShort.vehicle,
  accessibilityLabel: labels.a11y.tabs.vehicle,
  testID: 'tab-vehicle',
});
const DOCUMENTS_OPTIONS = tabOptions({
  text: labels.registrationFlow.tabShort.documents,
  accessibilityLabel: labels.a11y.tabs.documents,
  testID: 'tab-documents',
});

const renderTabBar = (props) => <AppTabBar {...props} />;

const ROUTE_TO_TAB = {
  PersonalData: 'personalData',
  Vehicle: 'vehicle',
  Documents: 'documents',
};

function RegistrationTabsNavigator({ initialRoute }) {
  const { markTabVisited } = useRegistrationForm();

  return (
    <Tab.Navigator
      initialRouteName={initialRoute}
      screenOptions={SCREEN_OPTIONS}
      screenListeners={({ route }) => ({
        blur: () => markTabVisited(ROUTE_TO_TAB[route.name]),
      })}
      tabBar={renderTabBar}
    >
      <Tab.Screen name="PersonalData" component={PersonalDataScreen} options={PERSONAL_DATA_OPTIONS} />
      <Tab.Screen name="Vehicle" component={VehicleScreen} options={VEHICLE_OPTIONS} />
      <Tab.Screen name="Documents" component={DocumentsScreen} options={DOCUMENTS_OPTIONS} />
    </Tab.Navigator>
  );
}

// Welcome first (registration not sent), then the tabs. The start route chosen by the welcome is kept
// while this branch stays mounted, so the welcome never comes back after the driver started.
function RegistrationFlow() {
  const { accountStatus } = useAppState();
  const { submitState } = useRegistrationForm();
  const [startRoute, setStartRoute] = useState(null);

  if (startRoute === null && shouldShowWelcome({ accountStatus, submitState })) {
    return <WelcomeScreen onStart={setStartRoute} />;
  }
  return <RegistrationTabsNavigator initialRoute={startRoute ?? 'PersonalData'} />;
}

export function RegistrationTabs() {
  return (
    <RegistrationFormProvider>
      <RegistrationFlow />
    </RegistrationFormProvider>
  );
}

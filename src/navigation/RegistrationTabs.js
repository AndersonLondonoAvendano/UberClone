// AI-assisted: see docs/AI_LOG.md #15
// AI-assisted: see docs/AI_LOG.md #16
// Registration bottom tabs: personal data, vehicle and documents.
// The screen header is drawn by each screen, so the navigator header is hidden. The bar is a custom
// component (AppTabBar) that reads the tab text from the title option.

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { labels } from '../constants/labels';
import { DocumentsScreen } from '../screens/registration/DocumentsScreen';
import { PersonalDataScreen } from '../screens/registration/PersonalDataScreen';
import { VehicleScreen } from '../screens/registration/VehicleScreen';
import { color } from '../theme/tokens';
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
  text: labels.tabs.personalData,
  accessibilityLabel: labels.a11y.tabs.personalData,
  testID: 'tab-personal-data',
});
const VEHICLE_OPTIONS = tabOptions({
  text: labels.tabs.vehicle,
  accessibilityLabel: labels.a11y.tabs.vehicle,
  testID: 'tab-vehicle',
});
const DOCUMENTS_OPTIONS = tabOptions({
  text: labels.tabs.documents,
  accessibilityLabel: labels.a11y.tabs.documents,
  testID: 'tab-documents',
});

const renderTabBar = (props) => <AppTabBar {...props} />;

export function RegistrationTabs() {
  return (
    <Tab.Navigator
      initialRouteName="PersonalData"
      screenOptions={SCREEN_OPTIONS}
      tabBar={renderTabBar}
    >
      <Tab.Screen name="PersonalData" component={PersonalDataScreen} options={PERSONAL_DATA_OPTIONS} />
      <Tab.Screen name="Vehicle" component={VehicleScreen} options={VEHICLE_OPTIONS} />
      <Tab.Screen name="Documents" component={DocumentsScreen} options={DOCUMENTS_OPTIONS} />
    </Tab.Navigator>
  );
}

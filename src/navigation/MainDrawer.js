// AI-assisted: see docs/AI_LOG.md #19
// Main drawer: Home (the trip stack, not listed in the panel) plus Profile, History, Earnings and
// Settings. Back from any destination returns to Home. Each screen draws its own header, so the
// navigator header is hidden.

import { createDrawerNavigator } from '@react-navigation/drawer';
import { EarningsScreen } from '../screens/main/EarningsScreen';
import { HistoryScreen } from '../screens/main/HistoryScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { SettingsScreen } from '../screens/main/SettingsScreen';
import { color } from '../theme/tokens';
import { AppDrawerContent } from './AppDrawerContent';
import { TripStack } from './TripStack';

const Drawer = createDrawerNavigator();

const SCREEN_OPTIONS = {
  headerShown: false,
  drawerStyle: { backgroundColor: color.surface },
};

const renderDrawerContent = (props) => <AppDrawerContent {...props} />;

export function MainDrawer() {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      backBehavior="initialRoute"
      screenOptions={SCREEN_OPTIONS}
      drawerContent={renderDrawerContent}
    >
      <Drawer.Screen name="Home" component={TripStack} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="History" component={HistoryScreen} />
      <Drawer.Screen name="Earnings" component={EarningsScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
}

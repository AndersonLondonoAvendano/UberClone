// AI-assisted: see docs/AI_LOG.md #19
// AI-assisted: see docs/AI_LOG.md #41
// AI-assisted: see docs/AI_LOG.md #42
// AI-assisted: see docs/AI_LOG.md #43
// Main drawer: Home (the trip stack, not listed in the panel) plus Profile, History, Earnings and
// Settings. Back from any destination returns to Home. Each screen draws its own header, so the
// navigator header is hidden.
// MapTest is a development-only screen: it is registered only while SHOW_DEV_TOOLS is on, it is not
// listed in the drawer panel, and its module (which loads the native map) is required lazily, so
// with the flag off nothing of the map test is loaded or rendered.
// AvailabilityProvider wraps the drawer so availability survives moving between its screens (T-42).
// TripProvider (T-44) sits inside it: the trip pauses and later resumes availability.

import { createDrawerNavigator } from '@react-navigation/drawer';
import { SHOW_DEV_TOOLS } from '../constants/devTools';
import { AvailabilityProvider } from '../context/AvailabilityContext';
import { TripProvider } from '../context/TripContext';
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

const getMapTestScreen = () => require('../screens/dev/MapTestScreen').MapTestScreen;

const renderDrawerContent = (props) => <AppDrawerContent {...props} />;

export function MainDrawer() {
  return (
    <AvailabilityProvider>
      <TripProvider>
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
          {SHOW_DEV_TOOLS ? <Drawer.Screen name="MapTest" getComponent={getMapTestScreen} /> : null}
        </Drawer.Navigator>
      </TripProvider>
    </AvailabilityProvider>
  );
}

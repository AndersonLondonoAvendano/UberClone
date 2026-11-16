// AI-assisted: see docs/AI_LOG.md #19
// AI-assisted: see docs/AI_LOG.md #41
// AI-assisted: see docs/AI_LOG.md #42
// AI-assisted: see docs/AI_LOG.md #43
// AI-assisted: see docs/AI_LOG.md #47
// AI-assisted: see docs/AI_LOG.md #48 (indentation)
// AI-assisted: see docs/AI_LOG.md #49 (swipe blocked while the full-screen request is open)
// AI-assisted: see docs/AI_LOG.md #64 (drawer home renamed to HOME_ROUTE = 'MainHome')
// The incoming-request bottom card (T-54) is mounted once here, above the drawer and inside the
// providers; it follows the focused drawer screen through screenListeners.
// Main drawer: MainHome (the trip stack, not listed in the panel) plus Profile, History, Earnings and
// Settings. Back from any destination returns to MainHome. Each screen draws its own header, so the
// navigator header is hidden.
// MapTest is a development-only screen: it is registered only while SHOW_DEV_TOOLS is on, it is not
// listed in the drawer panel, and its module (which loads the native map) is required lazily, so
// with the flag off nothing of the map test is loaded or rendered.
// AvailabilityProvider wraps the drawer so availability survives moving between its screens (T-42).
// TripProvider (T-44) sits inside it: the trip pauses and later resumes availability.

import { createDrawerNavigator } from '@react-navigation/drawer';
import { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { IncomingRequestCard } from '../components/IncomingRequestCard';
import { NotificationsBridge } from '../components/NotificationsBridge';
import { SHOW_DEV_TOOLS } from '../constants/devTools';
import { AvailabilityProvider, useAvailability } from '../context/AvailabilityContext';
import { TripProvider } from '../context/TripContext';
import { HOME_ROUTE } from '../services/trip/requestPresentation';
import { EarningsScreen } from '../screens/main/EarningsScreen';
import { HistoryScreen } from '../screens/main/HistoryScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { SettingsScreen } from '../screens/main/SettingsScreen';
import { TripDetailScreen } from '../screens/main/TripDetailScreen';
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

const styles = StyleSheet.create({ root: { flex: 1 } });

function DrawerBody() {
  const { requestScreenId } = useAvailability();
  const screenOptions = useMemo(
    () => ({ ...SCREEN_OPTIONS, swipeEnabled: requestScreenId == null }),
    [requestScreenId],
  );
  // AI-assisted: see docs/AI_LOG.md #47
  const [currentRoute, setCurrentRoute] = useState(HOME_ROUTE);
  const navigationRef = useRef(null);
  const getNavigation = useCallback(() => navigationRef.current, []);
  const screenListeners = useCallback(
    ({ navigation, route }) => ({
      focus: () => {
        navigationRef.current = navigation;
        setCurrentRoute(route.name);
      },
    }),
    [],
  );

  return (
    <View style={styles.root}>
      <Drawer.Navigator
        initialRouteName={HOME_ROUTE}
        backBehavior="initialRoute"
        screenOptions={screenOptions}
        drawerContent={renderDrawerContent}
        screenListeners={screenListeners}
      >
        <Drawer.Screen name={HOME_ROUTE} component={TripStack} />
        <Drawer.Screen name="Profile" component={ProfileScreen} />
        <Drawer.Screen name="History" component={HistoryScreen} />
        {/* AI-assisted: see docs/AI_LOG.md #57 (T-110): opened from History, not listed in the panel */}
        <Drawer.Screen name="TripDetail" component={TripDetailScreen} />
        <Drawer.Screen name="Earnings" component={EarningsScreen} />
        <Drawer.Screen name="Settings" component={SettingsScreen} />
        {SHOW_DEV_TOOLS ? <Drawer.Screen name="MapTest" getComponent={getMapTestScreen} /> : null}
      </Drawer.Navigator>
      <IncomingRequestCard currentRoute={currentRoute} getNavigation={getNavigation} />
      <NotificationsBridge />
    </View>
  );
}

export function MainDrawer() {
  return (
    <AvailabilityProvider>
      <TripProvider>
        <DrawerBody />
      </TripProvider>
    </AvailabilityProvider>
  );
}

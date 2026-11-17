// AI-assisted: see AI_LOG.md #18
// Trip stack: Home -> TripRequest -> TripActive -> TripSummary.
// The screen header is drawn by each screen, so the navigator header is hidden. The back gesture and
// the Android back button stay enabled (default behavior of the native stack).

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/home/HomeScreen';
import { TripActiveScreen } from '../screens/trip/TripActiveScreen';
import { TripRequestScreen } from '../screens/trip/TripRequestScreen';
import { TripSummaryScreen } from '../screens/trip/TripSummaryScreen';
import { color } from '../theme/tokens';

const Stack = createNativeStackNavigator();

const SCREEN_OPTIONS = {
  headerShown: false,
  contentStyle: { backgroundColor: color.bg },
};

// A single TripRequest screen can exist: navigating to it again reuses it, never stacks another.
const REQUEST_SCREEN_ID = 'trip-request';
const getRequestId = () => REQUEST_SCREEN_ID;

export function TripStack() {
  return (
    <Stack.Navigator initialRouteName="Home" screenOptions={SCREEN_OPTIONS}>
      <Stack.Screen name="Home" component={HomeScreen} />
      {/* AI-assisted: see AI_LOG.md #49 */}
      <Stack.Screen name="TripRequest" component={TripRequestScreen} getId={getRequestId} />
      <Stack.Screen name="TripActive" component={TripActiveScreen} />
      <Stack.Screen name="TripSummary" component={TripSummaryScreen} />
    </Stack.Navigator>
  );
}

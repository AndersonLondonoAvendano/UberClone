// AI-assisted: see docs/AI_LOG.md #18
// AI-assisted: see docs/AI_LOG.md #19
// AI-assisted: see docs/AI_LOG.md #35
// AI-assisted: see docs/AI_LOG.md #36
// AI-assisted: see docs/AI_LOG.md #41
// Home screen: one primary action to start the trip flow, plus the provisional account simulator.
// The "start trip" button simulates a trip request (no real trip flow exists yet), so it is gated
// by SHOW_DEV_TOOLS like the other provisional panels. The map test entry is gated the same way.
// The drawer button dispatches the open-drawer action; the stack does not handle it, so it reaches
// the parent drawer navigator.
// The availability hint always renders so the screen never looks empty with SHOW_DEV_TOOLS off.

import { DrawerActions } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import { DevAccountSwitch } from '../../components/DevAccountSwitch';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';
import { PrimaryButton } from '../../components/PrimaryButton';
import { labels } from '../../constants/labels';
import { SHOW_DEV_TOOLS } from '../../constants/devTools';
import { color, space, type } from '../../theme/tokens';

export function HomeScreen({ navigation }) {
  return (
    <PlaceholderScreen
      name="home"
      title={labels.drawer.home}
      leading="drawer"
      onLeadingPress={() => navigation.dispatch(DrawerActions.openDrawer())}
    >
      <View style={styles.stack}>
        <Text style={styles.hint}>{labels.home.availabilityHint}</Text>
        {SHOW_DEV_TOOLS ? (
          <PrimaryButton
            testID="home-start-trip"
            label={labels.home.startTrip}
            onPress={() => navigation.navigate('TripRequest')}
          />
        ) : null}
        {SHOW_DEV_TOOLS ? (
          <PrimaryButton
            testID="home-map-test"
            label={labels.mapTest.openFromHome}
            onPress={() => navigation.navigate('MapTest')}
          />
        ) : null}
        <DevAccountSwitch />
      </View>
    </PlaceholderScreen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: space[5],
  },
  hint: {
    ...type.body,
    color: color.textMuted,
  },
});

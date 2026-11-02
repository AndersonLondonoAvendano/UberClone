// AI-assisted: see docs/AI_LOG.md #18
// AI-assisted: see docs/AI_LOG.md #19
// Home screen: one primary action to start the trip flow, plus the provisional account simulator.
// The drawer button dispatches the open-drawer action; the stack does not handle it, so it reaches
// the parent drawer navigator.

import { DrawerActions } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';
import { DevAccountSwitch } from '../../components/DevAccountSwitch';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';
import { PrimaryButton } from '../../components/PrimaryButton';
import { labels } from '../../constants/labels';
import { space } from '../../theme/tokens';

export function HomeScreen({ navigation }) {
  return (
    <PlaceholderScreen
      name="home"
      title={labels.drawer.home}
      leading="drawer"
      onLeadingPress={() => navigation.dispatch(DrawerActions.openDrawer())}
    >
      <View style={styles.stack}>
        <PrimaryButton
          testID="home-start-trip"
          label={labels.home.startTrip}
          onPress={() => navigation.navigate('TripRequest')}
        />
        <DevAccountSwitch />
      </View>
    </PlaceholderScreen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: space[5],
  },
});

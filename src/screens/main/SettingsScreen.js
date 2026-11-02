// AI-assisted: see docs/AI_LOG.md #19
// Settings destination of the drawer: placeholder screen that reads the shared demo value written in
// the personal data tab, plus the provisional account simulator (to go back to registration).

import { DrawerActions } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import { DevAccountSwitch } from '../../components/DevAccountSwitch';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';
import { labels } from '../../constants/labels';
import { useAppState } from '../../context/AppStateContext';
import { color, space, type } from '../../theme/tokens';

export function SettingsScreen({ navigation }) {
  const { demoValue } = useAppState();
  const hasValue = demoValue !== '';

  return (
    <PlaceholderScreen
      name="settings"
      title={labels.drawer.settings}
      leading="drawer"
      onLeadingPress={() => navigation.dispatch(DrawerActions.openDrawer())}
    >
      <View style={styles.stack}>
        <View style={styles.group}>
          <Text style={styles.label}>{labels.demo.sharedValueLabel}</Text>
          <Text testID="settings-shared-value" style={hasValue ? styles.value : styles.empty}>
            {hasValue ? demoValue : labels.demo.sharedValueEmpty}
          </Text>
        </View>
        <DevAccountSwitch />
      </View>
    </PlaceholderScreen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: space[5],
  },
  group: {
    gap: space[2],
  },
  label: {
    ...type.label,
    color: color.textMuted,
  },
  value: {
    ...type.body,
    color: color.text,
  },
  empty: {
    ...type.body,
    color: color.textMuted,
  },
});

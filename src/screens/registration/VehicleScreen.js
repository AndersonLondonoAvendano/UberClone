// AI-assisted: see docs/AI_LOG.md #15
// Vehicle tab: placeholder screen that reads the shared demo value written in the personal data tab.

import { StyleSheet, Text, View } from 'react-native';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';
import { labels } from '../../constants/labels';
import { useAppState } from '../../context/AppStateContext';
import { color, space, type } from '../../theme/tokens';

const SAFE_EDGES = ['top'];

export function VehicleScreen() {
  const { demoValue } = useAppState();
  const hasValue = demoValue !== '';

  return (
    <PlaceholderScreen name="vehicle" title={labels.tabs.vehicle} leading={null} safeEdges={SAFE_EDGES}>
      <View style={styles.group}>
        <Text style={styles.label}>{labels.demo.sharedValueLabel}</Text>
        <Text testID="vehicle-shared-value" style={hasValue ? styles.value : styles.empty}>
          {hasValue ? demoValue : labels.demo.sharedValueEmpty}
        </Text>
      </View>
    </PlaceholderScreen>
  );
}

const styles = StyleSheet.create({
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

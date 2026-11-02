// AI-assisted: see docs/AI_LOG.md #15
// AI-assisted: see docs/AI_LOG.md #16
// Personal data tab: placeholder screen with the shared demo field and the provisional account simulator.

import { StyleSheet, Text, TextInput, View } from 'react-native';
import { DevAccountSwitch } from '../../components/DevAccountSwitch';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';
import { labels } from '../../constants/labels';
import { useAppState } from '../../context/AppStateContext';
import { borderWidth, color, radius, space, touch, type } from '../../theme/tokens';

const SAFE_EDGES = ['top'];

export function PersonalDataScreen() {
  const { demoValue, setDemoValue } = useAppState();

  return (
    <PlaceholderScreen
      name="personal-data"
      title={labels.tabs.personalData}
      leading={null}
      safeEdges={SAFE_EDGES}
    >
      <View style={styles.stack}>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>{labels.demo.sharedFieldLabel}</Text>
          <TextInput
            testID="personal-data-field-shared"
            accessibilityLabel={labels.demo.sharedFieldLabel}
            value={demoValue}
            onChangeText={setDemoValue}
            style={styles.input}
          />
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
  field: {
    gap: space[2],
  },
  fieldLabel: {
    ...type.label,
    color: color.text,
  },
  input: {
    ...type.body,
    minHeight: touch.controlHeight,
    color: color.text,
    backgroundColor: color.surface,
    borderRadius: radius.sm,
    borderWidth: borderWidth.thin,
    borderColor: color.border,
    padding: space[3],
  },
});

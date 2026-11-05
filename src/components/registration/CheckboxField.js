// AI-assisted: see docs/AI_LOG.md #25
// AI-assisted: see docs/AI_LOG.md #36
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { borderWidth, color, opacity, radius, space, touch, type } from '../../theme/tokens';
import { FieldError } from './FieldError';

export function CheckboxField({ testID, checked, onChange, label, errorTestID, errorMessage, disabled = false }) {
  return (
    <View style={styles.field}>
      <Pressable
        testID={testID}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        accessibilityLabel={label}
        onPress={() => onChange(!checked)}
        disabled={disabled}
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed, disabled && styles.rowDisabled]}
      >
        <View style={[styles.box, checked && styles.boxChecked]}>
          {checked ? <Text style={styles.mark}>✓</Text> : null}
        </View>
        <Text style={styles.label}>{label}</Text>
      </Pressable>
      <FieldError testID={errorTestID} message={errorMessage} />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: space[2],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: touch.min,
    gap: space[3],
  },
  rowPressed: {
    opacity: opacity.pressed,
  },
  rowDisabled: {
    opacity: opacity.disabled,
  },
  box: {
    width: touch.min,
    height: touch.min,
    borderRadius: radius.sm,
    borderWidth: borderWidth.thin,
    borderColor: color.border,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: {
    borderColor: color.primary,
  },
  mark: {
    ...type.body,
    color: color.primary,
  },
  label: {
    ...type.body,
    color: color.text,
    flex: 1,
    flexShrink: 1,
  },
});

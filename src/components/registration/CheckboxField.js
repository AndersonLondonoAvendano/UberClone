// AI-assisted: see AI_LOG.md #25
// AI-assisted: see AI_LOG.md #36
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { borderWidth, color, iconSize, opacity, radius, space, touch, type } from '../../theme/tokens';
import { Icon } from '../Icon';
import { FieldError } from './FieldError';

export function CheckboxField({ testID, checked, onChange, label, errorTestID, errorMessage, disabled = false }) {
  const hasError = Boolean(errorMessage);
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
        <View style={[styles.box, checked && styles.boxChecked, hasError && styles.boxError]}>
          {checked ? <Icon name="checkmark" size={iconSize.md} tint={color.onPrimary} /> : null}
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
  // AI-assisted: see AI_LOG.md #53 (filled box with check icon; the row keeps the 44 touch area)
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: touch.min,
    gap: space[3],
    paddingVertical: space[1],
  },
  rowPressed: {
    opacity: opacity.pressed,
  },
  rowDisabled: {
    opacity: opacity.disabled,
  },
  box: {
    width: space[5],
    height: space[5],
    borderRadius: radius.sm,
    borderWidth: borderWidth.thick,
    borderColor: color.border,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: {
    borderColor: color.primary,
    backgroundColor: color.primary,
  },
  boxError: {
    borderColor: color.danger,
  },
  label: {
    ...type.body,
    color: color.text,
    flex: 1,
    flexShrink: 1,
  },
});

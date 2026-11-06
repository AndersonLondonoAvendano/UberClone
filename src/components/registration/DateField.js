// AI-assisted: see docs/AI_LOG.md #26
// AI-assisted: see docs/AI_LOG.md #36
// Opens the native Android date dialog (DateTimePickerAndroid.open), verified against
// node_modules/@react-native-community/datetimepicker/src/index.d.ts (v9.1.0): the imperative
// open() API is Android-specific; onValueChange only fires on an actual selection (not deprecated,
// unlike onChange), onDismiss covers a cancelled picker (value stays unchanged).
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { borderWidth, color, opacity, radius, space, touch, type } from '../../theme/tokens';
import { FieldError } from './FieldError';

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

export function DateField({ testID, label, value, onChange, errorTestID, errorMessage, maximumDate, disabled = false }) {
  const openPicker = () => {
    DateTimePickerAndroid.open({
      value: value ?? maximumDate ?? new Date(),
      mode: 'date',
      maximumDate,
      onValueChange: (_event, selectedDate) => {
        onChange(selectedDate);
      },
    });
  };

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={openPicker}
        disabled={disabled}
        style={({ pressed }) => [
          styles.trigger,
          pressed && styles.triggerPressed,
          disabled && styles.triggerDisabled,
          errorMessage && styles.triggerError,
        ]}
      >
        <Text style={value ? styles.triggerValue : styles.triggerPlaceholder}>
          {value ? formatDate(value) : label}
        </Text>
      </Pressable>
      <FieldError testID={errorTestID} message={errorMessage} />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: space[2],
  },
  fieldLabel: {
    ...type.label,
    color: color.text,
  },
  trigger: {
    minHeight: touch.controlHeight,
    justifyContent: 'center',
    backgroundColor: color.surface,
    borderRadius: radius.sm,
    borderWidth: borderWidth.thin,
    borderColor: color.border,
    paddingHorizontal: space[3],
  },
  triggerPressed: {
    opacity: opacity.pressed,
  },
  triggerDisabled: {
    opacity: opacity.disabled,
  },
  triggerError: {
    borderColor: color.danger,
  },
  triggerValue: {
    ...type.body,
    color: color.text,
  },
  triggerPlaceholder: {
    ...type.body,
    color: color.textMuted,
  },
});

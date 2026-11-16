// AI-assisted: see docs/AI_LOG.md #67
// AI-assisted: see docs/AI_LOG.md #54 (accessible label = name + chosen value)
// AI-assisted: see docs/AI_LOG.md #26
// AI-assisted: see docs/AI_LOG.md #55 (optional announceError: error in a polite live region, and minimumDate)
// AI-assisted: see docs/AI_LOG.md #36
// Opens the native Android date dialog (DateTimePickerAndroid.open), verified against
// node_modules/@react-native-community/datetimepicker/src/index.d.ts (v9.1.0): the imperative
// open() API is Android-specific; onValueChange only fires on an actual selection (not deprecated,
// unlike onChange), onDismiss covers a cancelled picker (value stays unchanged).
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { borderWidth, color, iconSize, opacity, radius, space, touch, type } from '../../theme/tokens';
import { labels } from '../../constants/labels';
import { useLanguage } from '../../i18n/useLanguage';
import { Icon } from '../Icon';
import { FieldError } from './FieldError';

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

export function DateField({ testID, label, value, onChange, errorTestID, errorMessage, maximumDate, minimumDate, disabled = false, announceError = false }) {
  useLanguage();
  const openPicker = () => {
    DateTimePickerAndroid.open({
      value: value ?? maximumDate ?? minimumDate ?? new Date(),
      mode: 'date',
      maximumDate,
      minimumDate,
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
        accessibilityLabel={`${label}: ${value ? formatDate(value) : labels.registration.unselected}`}
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
        <Icon name="calendar-outline" size={iconSize.md} tint={color.textMuted} />
      </Pressable>
      <FieldError testID={errorTestID} message={errorMessage} liveRegion={announceError ? 'polite' : undefined} />
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
  // AI-assisted: see docs/AI_LOG.md #53 (calendar affordance, thick danger border on error)
  trigger: {
    minHeight: touch.controlHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    backgroundColor: color.surface,
    borderRadius: radius.md,
    borderWidth: borderWidth.thin,
    borderColor: color.border,
    paddingHorizontal: space[3],
  },
  triggerPressed: {
    opacity: opacity.pressed,
  },
  triggerDisabled: {
    opacity: opacity.disabled,
    backgroundColor: color.surfaceMuted,
  },
  triggerError: {
    borderWidth: borderWidth.thick,
    borderColor: color.danger,
    paddingHorizontal: space[3] - (borderWidth.thick - borderWidth.thin),
  },
  triggerValue: {
    ...type.body,
    color: color.text,
    flex: 1,
    flexShrink: 1,
  },
  triggerPlaceholder: {
    ...type.body,
    color: color.textMuted,
    flex: 1,
    flexShrink: 1,
  },
});

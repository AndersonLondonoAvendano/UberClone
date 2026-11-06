// AI-assisted: see docs/AI_LOG.md #25
// AI-assisted: see docs/AI_LOG.md #36
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { borderWidth, color, opacity, radius, space, touch, type } from '../../theme/tokens';
import { FieldError } from './FieldError';

export function TextField({ testID, label, value, onChangeText, onBlur, errorTestID, errorMessage, keyboardType, maxLength, disabled = false }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        testID={testID}
        accessibilityLabel={label}
        accessibilityState={{ disabled: !!disabled }}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        keyboardType={keyboardType}
        maxLength={maxLength}
        editable={!disabled}
        style={[styles.input, disabled && styles.inputDisabled, errorMessage && styles.inputError]}
      />
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
  inputDisabled: {
    opacity: opacity.disabled,
  },
  inputError: {
    borderColor: color.danger,
  },
});

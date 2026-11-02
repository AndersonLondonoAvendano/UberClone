// AI-assisted: see docs/AI_LOG.md #25
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { borderWidth, color, radius, space, touch, type } from '../../theme/tokens';
import { FieldError } from './FieldError';

export function TextField({ testID, label, value, onChangeText, onBlur, errorTestID, errorMessage, keyboardType, maxLength }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        testID={testID}
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        keyboardType={keyboardType}
        maxLength={maxLength}
        style={styles.input}
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
});

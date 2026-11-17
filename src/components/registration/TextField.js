// AI-assisted: see AI_LOG.md #25
// AI-assisted: see AI_LOG.md #36
// AI-assisted: see AI_LOG.md #53 (rest / focus / error / disabled states, error with icon)
// AI-assisted: see AI_LOG.md #60 (optional helperText, hidden while an inline error shows)
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { borderWidth, color, opacity, radius, space, touch, type } from '../../theme/tokens';
import { FieldError } from './FieldError';

// AI-assisted: see AI_LOG.md #54 (inputRef, inputProps and announceError for the auth forms)
// inputRef: ref of the TextInput (focus on the first error). inputProps: extra TextInput props
// (autoComplete, textContentType, secureTextEntry...). announceError: error in a polite live region
// with the accessible label "<label>: <error>".
export function TextField({ testID, label, value, onChangeText, onBlur, errorTestID, errorMessage, keyboardType, maxLength, disabled = false, inputRef, inputProps, announceError = false, helperText }) {
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(errorMessage);
  // The inline error has priority: the helper text is hidden while an error shows.
  const showHelper = Boolean(helperText) && !hasError;

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        {...inputProps}
        ref={inputRef}
        testID={testID}
        accessibilityLabel={label}
        accessibilityHint={showHelper ? helperText : inputProps?.accessibilityHint}
        accessibilityState={{ disabled: !!disabled }}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={(event) => {
          setFocused(false);
          if (onBlur) onBlur(event);
        }}
        keyboardType={keyboardType}
        maxLength={maxLength}
        editable={!disabled}
        placeholderTextColor={color.textMuted}
        style={[
          styles.input,
          focused && !hasError && styles.inputFocused,
          hasError && styles.inputError,
          disabled && styles.inputDisabled,
        ]}
      />
      {showHelper ? <Text style={styles.helper}>{helperText}</Text> : null}
      <FieldError
        testID={errorTestID}
        message={errorMessage}
        accessibilityLabel={announceError && hasError ? `${label}: ${errorMessage}` : undefined}
        liveRegion={announceError ? 'polite' : undefined}
      />
    </View>
  );
}

// The thick border (focus, error) takes the place of the thin one without moving the content: the
// padding gives back the extra width.
const BORDER_EXTRA = borderWidth.thick - borderWidth.thin;

const styles = StyleSheet.create({
  field: {
    gap: space[2],
  },
  fieldLabel: {
    ...type.label,
    color: color.text,
  },
  helper: {
    ...type.caption,
    color: color.textMuted,
    flexShrink: 1,
  },
  input: {
    ...type.body,
    minHeight: touch.controlHeight,
    color: color.text,
    backgroundColor: color.surface,
    borderRadius: radius.md,
    borderWidth: borderWidth.thin,
    borderColor: color.border,
    padding: space[3],
  },
  inputFocused: {
    borderWidth: borderWidth.thick,
    borderColor: color.primary,
    padding: space[3] - BORDER_EXTRA,
  },
  inputError: {
    borderWidth: borderWidth.thick,
    borderColor: color.danger,
    padding: space[3] - BORDER_EXTRA,
  },
  inputDisabled: {
    opacity: opacity.disabled,
    backgroundColor: color.surfaceMuted,
  },
});

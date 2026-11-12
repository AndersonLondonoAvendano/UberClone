// AI-assisted: see docs/AI_LOG.md #60
// Text field of the authentication forms: label above, a leading icon and, optionally, a trailing
// action (the show/hide button of the password) INSIDE the same bordered box. Same states as TextField
// (rest, focus, error, disabled), error as icon + text in a polite live region with the accessible
// label "<label>: <error>". The box only sets a minimum height, so it grows with the text size.

import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Icon } from '../Icon';
import { FieldError } from '../registration/FieldError';
import { borderWidth, color, iconSize, opacity, radius, space, touch, type } from '../../theme/tokens';

export function AuthField({
  testID,
  errorTestID,
  label,
  icon,
  value,
  onChangeText,
  onBlur,
  errorMessage,
  keyboardType,
  disabled = false,
  inputRef,
  inputProps,
  trailing = null,
}) {
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(errorMessage);

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View
        style={[
          styles.box,
          focused && !hasError && styles.boxFocused,
          hasError && styles.boxError,
          disabled && styles.boxDisabled,
        ]}
      >
        <Icon name={icon} size={iconSize.md} tint={hasError ? color.danger : color.textMuted} />
        <TextInput
          {...inputProps}
          ref={inputRef}
          testID={testID}
          accessibilityLabel={label}
          accessibilityState={{ disabled: !!disabled }}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={(event) => {
            setFocused(false);
            if (onBlur) onBlur(event);
          }}
          keyboardType={keyboardType}
          editable={!disabled}
          placeholderTextColor={color.textMuted}
          style={styles.input}
        />
        {trailing}
      </View>
      <FieldError
        testID={errorTestID}
        message={errorMessage}
        accessibilityLabel={hasError ? `${label}: ${errorMessage}` : undefined}
        liveRegion="polite"
      />
    </View>
  );
}

// The thick border (focus, error) takes the place of the thin one without moving the content: the
// left padding gives back the extra width.
const BORDER_EXTRA = borderWidth.thick - borderWidth.thin;

const styles = StyleSheet.create({
  field: {
    gap: space[2],
  },
  fieldLabel: {
    ...type.label,
    color: color.text,
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    minHeight: touch.controlHeight,
    paddingLeft: space[3],
    backgroundColor: color.surface,
    borderRadius: radius.md,
    borderWidth: borderWidth.thin,
    borderColor: color.border,
  },
  boxFocused: {
    borderWidth: borderWidth.thick,
    borderColor: color.primary,
    paddingLeft: space[3] - BORDER_EXTRA,
  },
  boxError: {
    borderWidth: borderWidth.thick,
    borderColor: color.danger,
    paddingLeft: space[3] - BORDER_EXTRA,
  },
  boxDisabled: {
    opacity: opacity.disabled,
    backgroundColor: color.surfaceMuted,
  },
  input: {
    ...type.body,
    flex: 1,
    minHeight: touch.controlHeight,
    paddingVertical: space[3],
    paddingRight: space[3],
    color: color.text,
  },
});

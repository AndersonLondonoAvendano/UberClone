// AI-assisted: see docs/AI_LOG.md #54 (accessible label = name + chosen value)
// AI-assisted: see docs/AI_LOG.md #25
// AI-assisted: see docs/AI_LOG.md #36
// Inline dropdown (like an HTML select): the options open right under the field, pushing the content
// below down, and close on pick or on tapping the field again. No Modal, no native picker dependency.
// The selected option keeps the weight + underline marking (no accent fill).
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { borderWidth, color, elevation, iconSize, opacity, radius, space, touch, type } from '../../theme/tokens';
import { labels } from '../../constants/labels';
import { Icon } from '../Icon';
import { FieldError } from './FieldError';

const VISIBLE_OPTIONS = 5; // taller lists scroll inside the dropdown

export function SelectField({ testID, label, options, value, onChange, errorTestID, errorMessage, disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityState={{ disabled: Boolean(disabled), expanded: isOpen }}
        accessibilityLabel={`${label}: ${selected ? selected.label : labels.registration.unselected}`}
        onPress={() => setIsOpen((open) => !open)}
        disabled={disabled}
        style={({ pressed }) => [
          styles.trigger,
          pressed && styles.triggerPressed,
          disabled && styles.triggerDisabled,
          errorMessage && styles.triggerError,
          isOpen && styles.triggerOpen,
        ]}
      >
        <Text style={selected ? styles.triggerValue : styles.triggerPlaceholder}>
          {selected ? selected.label : label}
        </Text>
        <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} size={iconSize.md} tint={color.textMuted} />
      </Pressable>

      {isOpen ? (
        <View style={styles.list}>
          <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled" style={styles.listScroll}>
            {options.map((item) => {
              const active = item.value === value;
              return (
                <Pressable
                  key={item.value}
                  testID={`${testID}-option-${item.value}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => {
                    onChange(item.value);
                    setIsOpen(false);
                  }}
                  style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                >
                  <Text style={[styles.optionText, active ? styles.optionTextActive : styles.optionTextInactive]}>
                    {item.label}
                  </Text>
                  {active ? <Icon name="checkmark" size={iconSize.md} tint={color.primary} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
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
  // AI-assisted: see docs/AI_LOG.md #53 (chevron affordance, thick danger border on error)
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
  triggerOpen: {
    borderColor: color.primary,
  },
  list: {
    backgroundColor: color.surface,
    borderRadius: radius.md,
    borderWidth: borderWidth.thin,
    borderColor: color.border,
    overflow: 'hidden',
    ...elevation.card,
  },
  listScroll: {
    maxHeight: touch.controlHeight * VISIBLE_OPTIONS,
  },
  option: {
    minHeight: touch.controlHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingHorizontal: space[4],
  },
  optionPressed: {
    opacity: opacity.pressed,
  },
  optionText: {
    ...type.body,
    flex: 1,
    flexShrink: 1,
  },
  optionTextActive: {
    color: color.text,
    fontFamily: type.title.fontFamily,
    textDecorationLine: 'underline',
  },
  optionTextInactive: {
    color: color.textMuted,
  },
});

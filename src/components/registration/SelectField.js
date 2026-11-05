// AI-assisted: see docs/AI_LOG.md #25
// AI-assisted: see docs/AI_LOG.md #36
// Dropdown built with Modal + FlatList: no native picker dependency. The selected option is
// marked the same way the navigation marks the active destination: weight and underline, no accent fill.
import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { borderWidth, color, opacity, radius, space, touch, type } from '../../theme/tokens';
import { FieldError } from './FieldError';

export function SelectField({ testID, label, options, value, onChange, errorTestID, errorMessage, disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={() => setIsOpen(true)}
        disabled={disabled}
        style={({ pressed }) => [styles.trigger, pressed && styles.triggerPressed, disabled && styles.triggerDisabled]}
      >
        <Text style={selected ? styles.triggerValue : styles.triggerPlaceholder}>
          {selected ? selected.label : label}
        </Text>
      </Pressable>
      <FieldError testID={errorTestID} message={errorMessage} />

      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => setIsOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setIsOpen(false)} accessibilityLabel={label}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <FlatList
              data={options}
              keyExtractor={(option) => option.value}
              renderItem={({ item }) => {
                const active = item.value === value;
                return (
                  <Pressable
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
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
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
  triggerValue: {
    ...type.body,
    color: color.text,
  },
  triggerPlaceholder: {
    ...type.body,
    color: color.textMuted,
  },
  // No overlay/scrim token exists in tokens.js today, and this task may not add a new one (plan §7:
  // no new tokens). A transparent backdrop keeps the tap-outside-to-close behavior without inventing
  // a color; dimming the background would need its own token decision first.
  backdrop: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: color.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: '70%',
    paddingVertical: space[3],
  },
  option: {
    minHeight: touch.controlHeight,
    justifyContent: 'center',
    paddingHorizontal: space[4],
  },
  optionPressed: {
    opacity: opacity.pressed,
  },
  optionText: {
    ...type.body,
  },
  optionTextActive: {
    color: color.text,
    fontWeight: type.title.fontWeight,
    textDecorationLine: 'underline',
  },
  optionTextInactive: {
    color: color.textMuted,
  },
});

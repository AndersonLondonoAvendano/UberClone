// AI-assisted: see AI_LOG.md #60
// Profile row with a per-field pencil button (top right). Read state: label + value and the pencil.
// Edit state: the editor passed as children replaces the row. The pencil is disabled (not hidden) while
// another field is being edited, so the layout does not jump. Tokens only; texts come from the caller.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from './Icon';
import { borderWidth, color, iconSize, opacity, radius, space, touch, type } from '../theme/tokens';

export function EditableFieldRow({
  label,
  value,
  last = false,
  editing = false,
  disabled = false,
  onEdit,
  editLabel,
  editHint,
  testID,
  children,
}) {
  if (editing) {
    return <View style={[styles.editor, !last && styles.separator]}>{children}</View>;
  }
  return (
    <View style={[styles.row, !last && styles.separator]}>
      <View accessible accessibilityLabel={`${label}: ${value}`} style={styles.texts}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={editLabel}
        accessibilityHint={editHint}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onEdit}
        style={({ pressed }) => [styles.pencil, disabled && styles.pencilDisabled, pressed && styles.pencilPressed]}
      >
        <Icon name="create-outline" size={iconSize.lg} tint={color.onPrimarySoft} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: space[3],
    paddingVertical: space[2],
  },
  editor: { paddingVertical: space[3], gap: space[3] },
  separator: { borderBottomWidth: borderWidth.thin, borderBottomColor: color.borderSubtle },
  texts: { flex: 1, flexShrink: 1, gap: space[1], paddingTop: space[2] },
  label: { ...type.small, color: color.textMuted },
  value: { ...type.bodyStrong, color: color.text },
  pencil: {
    minWidth: touch.controlHeight,
    minHeight: touch.controlHeight,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: color.primarySoft,
  },
  pencilDisabled: { opacity: opacity.disabled },
  // Press feedback changes opacity only, so the layout never moves.
  pencilPressed: { opacity: opacity.pressed },
});

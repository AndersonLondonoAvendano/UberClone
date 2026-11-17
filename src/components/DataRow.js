// AI-assisted: see AI_LOG.md #51
// Label/value row: secondary label on the left, medium-weight value on the right, subtle separator.
// Both texts can wrap, so it survives large system font sizes. Tokens only.

import { StyleSheet, Text, View } from 'react-native';
import { borderWidth, color, space, type } from '../theme/tokens';

export function DataRow({ label, value, emphasis = false, last = false, testID, valueColor }) {
  return (
    <View testID={testID} style={[styles.row, !last && styles.separator]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, type.numeric, emphasis && styles.emphasis, valueColor ? { color: valueColor } : null]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: space[3],
    paddingVertical: space[3],
  },
  separator: {
    borderBottomWidth: borderWidth.thin,
    borderBottomColor: color.borderSubtle,
  },
  label: {
    flexShrink: 1,
    ...type.small,
    color: color.textMuted,
  },
  value: {
    flexShrink: 1,
    textAlign: 'right',
    ...type.bodyStrong,
    color: color.text,
  },
  emphasis: {
    ...type.heading,
    color: color.primary,
  },
});

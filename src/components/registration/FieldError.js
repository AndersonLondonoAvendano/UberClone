// AI-assisted: see docs/AI_LOG.md #25
// AI-assisted: see docs/AI_LOG.md #53 (error is icon + text, never colour alone)
import { StyleSheet, Text, View } from 'react-native';
import { Icon } from '../Icon';
import { color, iconSize, space, type } from '../../theme/tokens';

export function FieldError({ testID, message }) {
  if (!message) return null;
  return (
    <View style={styles.row}>
      <Icon name="alert-circle" size={iconSize.md} tint={color.danger} />
      <Text testID={testID} style={styles.message}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space[2],
  },
  message: {
    ...type.small,
    color: color.danger,
    flex: 1,
    flexShrink: 1,
  },
});

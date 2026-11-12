// AI-assisted: see docs/AI_LOG.md #25
// AI-assisted: see docs/AI_LOG.md #53 (error is icon + text, never colour alone)
import { StyleSheet, Text, View } from 'react-native';
import { Icon } from '../Icon';
import { color, iconSize, space, type } from '../../theme/tokens';

// AI-assisted: see docs/AI_LOG.md #54 (optional accessibilityLabel and polite live region for auth forms)
export function FieldError({ testID, message, accessibilityLabel, liveRegion }) {
  if (!message) return null;
  return (
    <View style={styles.row} accessibilityLiveRegion={liveRegion}>
      <Icon name="alert-circle" size={iconSize.md} tint={color.danger} />
      <Text testID={testID} accessibilityLabel={accessibilityLabel} style={styles.message}>
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

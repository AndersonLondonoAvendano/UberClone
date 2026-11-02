// AI-assisted: see docs/AI_LOG.md #25
import { StyleSheet, Text } from 'react-native';
import { color, type } from '../../theme/tokens';

export function FieldError({ testID, message }) {
  if (!message) return null;
  return (
    <Text testID={testID} style={styles.message}>
      {message}
    </Text>
  );
}

const styles = StyleSheet.create({
  message: {
    ...type.caption,
    color: color.danger,
  },
});

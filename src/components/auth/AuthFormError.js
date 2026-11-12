// AI-assisted: see docs/AI_LOG.md #54
// Form-level message of the authentication screens: icon + text (never colour alone) inside a
// polite live region. The region is always mounted so a message that appears later is announced.
// tone: 'danger' (error) | 'success' (neutral confirmation). No fixed heights, no line limit.

import { StyleSheet, Text, View } from 'react-native';
import { Card } from '../Card';
import { Icon } from '../Icon';
import { color, iconSize, space, type } from '../../theme/tokens';

export function AuthFormError({ testID, message, tone = 'danger' }) {
  const isDanger = tone === 'danger';
  return (
    <View accessibilityLiveRegion="polite">
      {message ? (
        <Card variant="status" tone={isDanger ? 'danger' : 'success'} style={styles.card}>
          <Icon
            name={isDanger ? 'alert-circle' : 'checkmark-circle'}
            size={iconSize.lg}
            tint={isDanger ? color.onDangerSoft : color.onSuccessSoft}
          />
          <Text testID={testID} style={[styles.message, isDanger ? styles.danger : styles.success]}>
            {message}
          </Text>
        </Card>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space[2],
  },
  message: {
    ...type.bodyStrong,
    flex: 1,
    flexShrink: 1,
  },
  danger: {
    color: color.onDangerSoft,
  },
  success: {
    color: color.onSuccessSoft,
  },
});

// AI-assisted: see docs/AI_LOG.md #55
// Floating card over the Home map (F1b, RF-39): availability switch with its written state, the
// hint or notice, and the grant-permission button when the location permission is missing.
// Tokens and labels only. Sits below the status bar through the safe-area inset.

import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { labels } from '../../constants/labels';
import { color, elevation, iconSize, radius, space, type } from '../../theme/tokens';
import { AvailabilitySwitch } from '../AvailabilitySwitch';
import { Card } from '../Card';
import { Icon } from '../Icon';
import { SecondaryButton } from '../SecondaryButton';

export function HomeFloatingCard({
  isAvailable,
  isChanging,
  onToggle,
  hint,
  noticeText,
  needsPermission,
  onGrantPermission,
  leading,
}) {
  const insets = useSafeAreaInsets();
  return (
    <View testID="home-floating-card" style={[styles.wrap, { top: insets.top + space[2] }]} pointerEvents="box-none">
      <View style={styles.card}>
        {leading}
        <AvailabilitySwitch value={isAvailable} onValueChange={onToggle} disabled={isChanging} />
        {noticeText ? (
          <Card variant="status" tone="danger" style={styles.noticeCard}>
            <Icon name="alert-circle" size={iconSize.lg} tint={color.onDangerSoft} />
            <Text testID="home-availability-notice" style={styles.notice} accessibilityLiveRegion="polite">
              {noticeText}
            </Text>
          </Card>
        ) : (
          <Text testID="home-hint" style={styles.hint}>{hint}</Text>
        )}
        {needsPermission ? (
          <View style={styles.permission}>
            <Text testID="home-permission-needed" style={styles.hint} accessibilityLiveRegion="polite">
              {labels.home.permissionNeeded}
            </Text>
            <SecondaryButton testID="home-grant-permission" label={labels.home.grantPermission} onPress={onGrantPermission} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: space[3],
    right: space[3],
  },
  card: {
    gap: space[3],
    padding: space[3],
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    ...elevation.raised,
  },
  hint: {
    ...type.small,
    color: color.textMuted,
    paddingHorizontal: space[1],
  },
  permission: {
    gap: space[2],
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space[3],
  },
  notice: {
    flex: 1,
    ...type.body,
    color: color.onDangerSoft,
  },
});

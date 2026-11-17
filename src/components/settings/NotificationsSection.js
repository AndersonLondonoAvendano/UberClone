// AI-assisted: see AI_LOG.md #67
// AI-assisted: see AI_LOG.md #64
// AI-assisted: see AI_LOG.md #73
// "Notificaciones" section of Settings (T-186, T-297). A switch that asks for the permission in context
// after an inline explanation, a state chip, and an inline message with a link to the system settings
// when the permission is denied or blocked. The "test request" control was removed (D-206); the backend
// endpoint POST /notifications/test-request stays, without UI.
// No Alert: every state is inline. The native side is reached only through the registration controller.
// S5 design fixes (F-01, F-02, O-01..O-08): a real switch (SwitchTrack) beside a state chip, danger Card
// for refused permission and errors.

import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { labels } from '../../constants/labels';
import { useLanguage } from '../../i18n/useLanguage';
import { ENABLE_RESULT } from '../../services/notifications/registration';
import { getRegistrationController } from '../../services/notifications/registrationRuntime';
import { PERMISSION_STATE } from '../../services/notifications/constants';
import { color, iconSize, opacity, space, touch, type } from '../../theme/tokens';
import { Card } from '../Card';
import { Chip } from '../Chip';
import { Icon } from '../Icon';
import { PrimaryButton } from '../PrimaryButton';
import { SecondaryButton } from '../SecondaryButton';
import { SwitchTrack } from '../SwitchTrack';

const ENABLE_MESSAGES = {
  [ENABLE_RESULT.DENIED]: 'denied',
  [ENABLE_RESULT.BLOCKED]: 'blocked',
  [ENABLE_RESULT.UNSUPPORTED]: 'unsupported',
  [ENABLE_RESULT.STORAGE]: 'storage',
};

export function NotificationsSection() {
  useLanguage();
  const controllerRef = useRef(null);
  if (controllerRef.current === null) controllerRef.current = getRegistrationController();
  const controller = controllerRef.current;

  const [state, setState] = useState(controller.getState());
  const [explaining, setExplaining] = useState(false);
  const [busy, setBusy] = useState(false);
  const [busyTarget, setBusyTarget] = useState(null); // 'enabling' | 'disabling', only for the chip text
  const [enableMessage, setEnableMessage] = useState(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const unsubscribe = controller.subscribe((next) => mounted.current && setState(next));
    controller.refreshPermission();
    return () => {
      mounted.current = false;
      unsubscribe();
    };
  }, [controller]);

  const granted = state.permission === PERMISSION_STATE.GRANTED;
  const enabled = state.enabled && granted;
  // RF-70: a denied or blocked permission shows the "blocked" status with the settings link, from mount.
  const permissionRefused = state.permission === PERMISSION_STATE.BLOCKED || state.permission === PERMISSION_STATE.DENIED;

  const onSwitchPress = useCallback(async () => {
    if (busy) return;
    setEnableMessage(null);
    if (enabled) {
      setBusyTarget('disabling');
      setBusy(true);
      await controller.disable();
      if (mounted.current) setBusy(false);
      return;
    }
    setExplaining(true);
  }, [busy, enabled, controller]);

  const onContinue = useCallback(async () => {
    setExplaining(false);
    setBusyTarget('enabling');
    setBusy(true);
    const { result } = await controller.enable();
    if (!mounted.current) return;
    setBusy(false);
    setEnableMessage(ENABLE_MESSAGES[result] ?? null);
  }, [controller]);

  // One message per cause (O-01): a blocked permission gets its title plus the settings explanation;
  // a denied one (retryable) shows the retry text; an enable error shows its own text.
  const blocked = state.permission === PERMISSION_STATE.BLOCKED;
  const refusalKey = blocked ? 'blocked' : state.permission === PERMISSION_STATE.DENIED ? 'denied' : null;
  const statusKey = enableMessage ?? refusalKey;
  const chipLabel = busy
    ? busyTarget === 'disabling'
      ? labels.notifications.stateDisabling
      : labels.notifications.stateEnabling
    : enabled
      ? labels.notifications.stateOn
      : labels.notifications.stateOff;

  return (
    <View style={styles.stack} testID="notifications-section">
      <Text style={styles.section} accessibilityRole="header">
        {labels.notifications.title}
      </Text>

      <Pressable
        testID="notifications-switch"
        accessibilityRole="switch"
        accessibilityLabel={labels.notifications.switchLabel}
        accessibilityHint={labels.notifications.switchHint}
        accessibilityState={{ checked: enabled, disabled: busy, busy }}
        accessibilityValue={{ text: chipLabel }}
        disabled={busy}
        onPress={onSwitchPress}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        {/* AI-assisted: see AI_LOG.md #64 (O-11): the busy state is text ("Activando…") that is announced, not only a dimmed track */}
        <View style={styles.rowTexts} accessibilityLiveRegion="polite">
          <Text style={styles.rowLabel}>{labels.notifications.switchLabel}</Text>
          <Chip label={chipLabel} tone={enabled && !busy ? 'success' : 'neutral'} />
        </View>
        <View style={busy ? styles.dimmed : null}>
          <SwitchTrack value={enabled} />
        </View>
      </Pressable>

      {explaining ? (
        <View style={styles.box} accessibilityLiveRegion="polite">
          <Text style={styles.body}>{labels.notifications.explainBody}</Text>
          <PrimaryButton testID="notifications-explain-continue" label={labels.notifications.explainContinue} onPress={onContinue} />
          <SecondaryButton
            testID="notifications-explain-cancel"
            label={labels.notifications.explainCancel}
            onPress={() => setExplaining(false)}
          />
        </View>
      ) : null}

      {statusKey || permissionRefused ? (
        <View accessibilityLiveRegion="polite" style={styles.box}>
          <Card variant="status" tone="danger" style={styles.errorCard}>
            <Icon name="alert-circle" size={iconSize.md} tint={color.onDangerSoft} />
            <View style={styles.errorTexts}>
              {blocked ? (
                <Text testID="notifications-blocked-status" style={styles.errorTitle}>
                  {labels.notifications.blockedTitle}
                </Text>
              ) : null}
              {statusKey ? (
                <Text testID="notifications-enable-message" style={styles.error}>
                  {labels.notifications[statusKey]}
                </Text>
              ) : null}
            </View>
          </Card>
          {permissionRefused ? (
            <SecondaryButton
              testID="notifications-open-settings"
              label={labels.notifications.openSettings}
              onPress={() => Linking.openSettings().catch(() => {})}
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: space[2] },
  section: { ...type.title, color: color.text },
  body: { ...type.body, color: color.text, flexShrink: 1 },
  error: { flexShrink: 1, ...type.body, color: color.onDangerSoft },
  errorTitle: { ...type.bodyStrong, color: color.onDangerSoft },
  errorTexts: { flex: 1, gap: space[1] },
  errorCard: { flexDirection: 'row', alignItems: 'flex-start', gap: space[2], padding: space[3] },
  row: {
    minHeight: touch.controlHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[3],
  },
  rowTexts: { flex: 1, gap: space[1] },
  rowLabel: { ...type.body, color: color.text },
  dimmed: { opacity: opacity.disabled },
  box: { gap: space[2] },
  pressed: { opacity: opacity.pressed },
});

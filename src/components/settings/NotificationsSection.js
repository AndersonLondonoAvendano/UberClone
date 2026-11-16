// AI-assisted: see docs/AI_LOG.md #64
// "Notificaciones" section of Settings (T-186, minimal; the final design is T-187). A switch that asks for the
// permission in context after an inline explanation, an inline message with a link to the system settings
// when it is denied or blocked, and a "send test request" button with a selectable delay (0-60 s).
// No Alert: every state is inline. The native side is reached only through the registration controller.

import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { labels } from '../../constants/labels';
import { ENABLE_RESULT } from '../../services/notifications/registration';
import { getRegistrationController } from '../../services/notifications/registrationRuntime';
import { PERMISSION_STATE } from '../../services/notifications/constants';
import {
  TEST_DELAY_DEFAULT,
  TEST_DELAY_MAX,
  TEST_DELAY_MIN,
  TEST_STATUS,
  statusFromResult,
  stepDelay,
} from '../../services/notifications/testRequest';
import { borderWidth, color, opacity, radius, space, touch, type } from '../../theme/tokens';
import { Chip } from '../Chip';
import { PrimaryButton } from '../PrimaryButton';
import { SecondaryButton } from '../SecondaryButton';

const TEST_MESSAGES = {
  [TEST_STATUS.SUCCESS]: 'testSuccess',
  [TEST_STATUS.OFFLINE]: 'testOffline',
  [TEST_STATUS.RATE_LIMITED]: 'testRateLimited',
  [TEST_STATUS.NO_DEVICES]: 'testNoDevices',
  [TEST_STATUS.SESSION]: 'testSession',
  [TEST_STATUS.SERVER]: 'testServer',
};

const ENABLE_MESSAGES = {
  [ENABLE_RESULT.DENIED]: 'denied',
  [ENABLE_RESULT.BLOCKED]: 'blocked',
  [ENABLE_RESULT.UNSUPPORTED]: 'unsupported',
  [ENABLE_RESULT.STORAGE]: 'storage',
};

export function NotificationsSection() {
  const controllerRef = useRef(null);
  if (controllerRef.current === null) controllerRef.current = getRegistrationController();
  const controller = controllerRef.current;

  const [state, setState] = useState(controller.getState());
  const [explaining, setExplaining] = useState(false);
  const [busy, setBusy] = useState(false);
  const [enableMessage, setEnableMessage] = useState(null);
  const [delaySeconds, setDelaySeconds] = useState(TEST_DELAY_DEFAULT);
  const [testStatus, setTestStatus] = useState(TEST_STATUS.IDLE);
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
    setTestStatus(TEST_STATUS.IDLE);
    if (enabled) {
      setBusy(true);
      await controller.disable();
      if (mounted.current) setBusy(false);
      return;
    }
    setExplaining(true);
  }, [busy, enabled, controller]);

  const onContinue = useCallback(async () => {
    setExplaining(false);
    setBusy(true);
    const { result } = await controller.enable();
    if (!mounted.current) return;
    setBusy(false);
    setEnableMessage(ENABLE_MESSAGES[result] ?? null);
  }, [controller]);

  const onSend = useCallback(async () => {
    if (testStatus === TEST_STATUS.LOADING) return;
    setTestStatus(TEST_STATUS.LOADING);
    let result = null;
    try {
      const { notificationsApi } = require('../../services/notifications/notificationsService');
      result = await notificationsApi.requestTestNotification({ delaySeconds });
    } catch {
      result = null;
    }
    if (mounted.current) setTestStatus(statusFromResult(result));
  }, [delaySeconds, testStatus]);

  const testMessageKey = TEST_MESSAGES[testStatus];
  const testIsError = testStatus !== TEST_STATUS.IDLE && testStatus !== TEST_STATUS.LOADING && testStatus !== TEST_STATUS.SUCCESS;
  const loading = testStatus === TEST_STATUS.LOADING;

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
        accessibilityState={{ checked: enabled, disabled: busy }}
        disabled={busy}
        onPress={onSwitchPress}
        style={({ pressed }) => [styles.row, pressed && styles.pressed, busy && styles.disabled]}
      >
        <Text style={styles.rowLabel}>{labels.notifications.switchLabel}</Text>
        <Chip
          label={enabled ? labels.notifications.stateOn : labels.notifications.stateOff}
          tone={enabled ? 'success' : 'neutral'}
        />
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

      {enableMessage || permissionRefused ? (
        <View accessibilityLiveRegion="polite" style={styles.box}>
          {permissionRefused ? (
            <Text testID="notifications-blocked-status" style={styles.error}>
              {labels.notifications.blockedTitle}
            </Text>
          ) : null}
          {enableMessage ? (
            <Text testID="notifications-enable-message" style={styles.error}>
              {labels.notifications[enableMessage]}
            </Text>
          ) : null}
          {permissionRefused ? (
            <SecondaryButton
              testID="notifications-open-settings"
              label={labels.notifications.openSettings}
              onPress={() => Linking.openSettings().catch(() => {})}
            />
          ) : null}
        </View>
      ) : null}

      <View style={styles.divider} />
      <Text style={styles.subsection} accessibilityRole="header">
        {labels.notifications.testTitle}
      </Text>
      <Text style={styles.muted}>{enabled ? labels.notifications.testBody : labels.notifications.testNeedsOn}</Text>

      <View style={styles.stepper}>
        <Text style={styles.body}>{labels.notifications.delayLabel}</Text>
        <View style={styles.stepperControls}>
          <StepButton
            testID="notifications-delay-less"
            glyph="−"
            label={labels.notifications.delayLess}
            disabled={delaySeconds <= TEST_DELAY_MIN || loading}
            onPress={() => setDelaySeconds((d) => stepDelay(d, -1))}
          />
          <Text
            testID="notifications-delay-value"
            style={styles.delayValue}
            accessibilityLiveRegion="polite"
            accessibilityLabel={`${labels.notifications.delayLabel}: ${labels.notifications.delayValue(delaySeconds)}`}
          >
            {labels.notifications.delayValue(delaySeconds)}
          </Text>
          <StepButton
            testID="notifications-delay-more"
            glyph="+"
            label={labels.notifications.delayMore}
            disabled={delaySeconds >= TEST_DELAY_MAX || loading}
            onPress={() => setDelaySeconds((d) => stepDelay(d, 1))}
          />
        </View>
      </View>

      <PrimaryButton
        testID="notifications-send-test"
        label={loading ? labels.notifications.testSending : labels.notifications.testSend}
        onPress={onSend}
        disabled={!enabled || loading}
      />

      {testMessageKey ? (
        <Text
          testID="notifications-test-message"
          accessibilityLiveRegion="polite"
          style={testIsError ? styles.error : styles.success}
        >
          {labels.notifications[testMessageKey]}
        </Text>
      ) : null}
    </View>
  );
}

function StepButton({ testID, glyph, label, disabled, onPress }) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.stepButton, pressed && styles.pressed, disabled && styles.disabled]}
    >
      <Text style={styles.stepGlyph}>{glyph}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  stack: { gap: space[2] },
  section: { ...type.title, color: color.text },
  subsection: { ...type.heading, color: color.text },
  body: { ...type.body, color: color.text, flexShrink: 1 },
  muted: { ...type.caption, color: color.textMuted },
  error: { ...type.small, color: color.danger },
  success: { ...type.small, color: color.success },
  row: {
    minHeight: touch.controlHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[3],
  },
  rowLabel: { ...type.body, color: color.text, flexShrink: 1 },
  box: { gap: space[2] },
  divider: { height: borderWidth.thin, backgroundColor: color.border, marginVertical: space[2] },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[3] },
  stepperControls: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  stepButton: {
    minWidth: touch.controlHeight,
    minHeight: touch.controlHeight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: borderWidth.thick,
    borderColor: color.border,
    borderRadius: radius.md,
    backgroundColor: color.surface,
  },
  stepGlyph: { ...type.title, color: color.text },
  delayValue: { ...type.bodyStrong, color: color.text, minWidth: space[7], textAlign: 'center' },
  pressed: { opacity: opacity.pressed },
  disabled: { opacity: opacity.disabled },
});

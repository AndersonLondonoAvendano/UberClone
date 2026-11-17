// AI-assisted: see docs/AI_LOG.md #67
// AI-assisted: see docs/AI_LOG.md #54
// Account actions with an on-screen confirmation (no Alert): "Cerrar sesión" and, in Settings,
// "Cambiar de cuenta". Both run the single session reset (useSessionReset). Variants:
//   'settings'     -> masked account email, both actions, testIDs prefixed "settings-".
//   'registration' -> only "Cerrar sesión" as a secondary button plus a warning that what was not
//                     sent is lost; testIDs prefixed "auth-". Works without the main-branch providers.
// States: idle, confirming, processing (controls disabled), blocked by a trip in progress, sign-out
// error (retry), trip not saved in time (retry, or sign out anyway after an explicit confirmation).
// Messages live in a polite live region; the panel title takes the screen-reader focus when it shows.
// No timers.

import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, findNodeHandle, StyleSheet, Text, View } from 'react-native';
import { labels } from '../../constants/labels';
import { useLanguage } from '../../i18n/useLanguage';
import { useSessionReset } from '../../context/useSessionReset';
import { SESSION_RESET_REASON } from '../../services/session/resetSession';
import { color, iconSize, space, touch, type } from '../../theme/tokens';
import { maskEmail } from '../../utils/mask';
import { Card } from '../Card';
import { Icon } from '../Icon';
import { PrimaryButton } from '../PrimaryButton';
import { SecondaryButton } from '../SecondaryButton';

const MODE = {
  IDLE: 'idle',
  CONFIRM: 'confirm',
  PROCESSING: 'processing',
  BLOCKED: 'blocked',
  ERROR: 'error',
  SAVE_PENDING: 'save-pending',
  CONFIRM_FORCE: 'confirm-force',
};

const FOCUS_MODES = [MODE.CONFIRM, MODE.BLOCKED, MODE.ERROR, MODE.SAVE_PENDING, MODE.CONFIRM_FORCE];
export function AccountActions({ variant = 'settings', email }) {
  useLanguage();
  const COPY = labels.auth.signOut;
  const resetSession = useSessionReset();
  const isRegistration = variant === 'registration';
  const prefix = isRegistration ? 'auth' : 'settings';
  const maskedEmail = isRegistration ? '' : maskEmail(email);

  const [mode, setMode] = useState(MODE.IDLE);
  const [isSwitch, setIsSwitch] = useState(false);
  const titleRef = useRef(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Moves the screen-reader focus to the panel title each time a panel appears.
  useEffect(() => {
    if (!FOCUS_MODES.includes(mode)) return;
    const handle = findNodeHandle(titleRef.current);
    if (handle) AccessibilityInfo.setAccessibilityFocus(handle);
  }, [mode]);

  const ask = useCallback((switchAccount) => {
    setIsSwitch(switchAccount);
    setMode(MODE.CONFIRM);
  }, []);

  const cancel = useCallback(() => setMode(MODE.IDLE), []);

  const run = useCallback(
    async (options) => {
      setMode(MODE.PROCESSING);
      let result;
      try {
        result = await resetSession(options);
      } catch {
        result = { ok: false, reason: SESSION_RESET_REASON.SIGN_OUT_FAILED };
      }
      if (!mounted.current) return;
      if (result.ok) setMode(MODE.IDLE);
      else if (result.reason === SESSION_RESET_REASON.TRIP_IN_PROGRESS) setMode(MODE.BLOCKED);
      else if (result.reason === SESSION_RESET_REASON.TRIP_SAVE_PENDING) setMode(MODE.SAVE_PENDING);
      else setMode(MODE.ERROR);
    },
    [resetSession],
  );

  const confirm = useCallback(() => run(), [run]);
  const confirmForce = useCallback(() => run({ skipTripSaveWait: true }), [run]);
  const askForce = useCallback(() => setMode(MODE.CONFIRM_FORCE), []);

  const processing = mode === MODE.PROCESSING;
  const confirmTitle = isSwitch ? COPY.confirmSwitchTitle : COPY.confirmTitle;
  const confirmBody = isRegistration ? COPY.registrationWarning : isSwitch ? COPY.confirmSwitchBody : COPY.confirmBody;
  const confirmLabel = isSwitch ? COPY.confirmSwitch : COPY.confirm;

  let panel = null;
  if (mode === MODE.CONFIRM || processing) {
    panel = (
      <Panel tone="warning" icon="log-out" title={confirmTitle} titleRef={titleRef}>
        <Text style={styles.body}>{processing ? COPY.processing : confirmBody}</Text>
        <PrimaryButton
          testID={`${prefix}-session-confirm`}
          label={processing ? COPY.processing : confirmLabel}
          onPress={confirm}
          disabled={processing}
        />
        <SecondaryButton testID={`${prefix}-session-cancel`} label={COPY.cancel} onPress={cancel} disabled={processing} />
      </Panel>
    );
  } else if (mode === MODE.BLOCKED) {
    panel = (
      <Panel
        tone="danger"
        icon="alert-circle"
        title={COPY.blockedByTrip}
        titleRef={titleRef}
        titleTestID={`${prefix}-session-blocked`}
      >
        <SecondaryButton testID={`${prefix}-session-cancel`} label={COPY.dismiss} onPress={cancel} />
      </Panel>
    );
  } else if (mode === MODE.ERROR) {
    panel = (
      <Panel
        tone="danger"
        icon="alert-circle"
        title={COPY.error}
        titleRef={titleRef}
        titleTestID={`${prefix}-session-error`}
      >
        <PrimaryButton testID={`${prefix}-session-retry`} label={COPY.retry} onPress={confirm} />
        <SecondaryButton testID={`${prefix}-session-cancel`} label={COPY.cancel} onPress={cancel} />
      </Panel>
    );
  } else if (mode === MODE.SAVE_PENDING) {
    panel = (
      <Panel
        tone="danger"
        icon="alert-circle"
        title={COPY.tripSavePending}
        titleRef={titleRef}
        titleTestID={`${prefix}-session-save-pending`}
      >
        <PrimaryButton testID={`${prefix}-session-retry`} label={COPY.retry} onPress={confirm} />
        <SecondaryButton testID={`${prefix}-session-force`} label={COPY.forceSignOut} onPress={askForce} variant="danger" />
        <SecondaryButton testID={`${prefix}-session-cancel`} label={COPY.cancel} onPress={cancel} />
      </Panel>
    );
  } else if (mode === MODE.CONFIRM_FORCE) {
    panel = (
      <Panel tone="warning" icon="log-out" title={COPY.forceConfirmTitle} titleRef={titleRef}>
        <Text style={styles.body}>{COPY.forceConfirmBody}</Text>
        <PrimaryButton testID={`${prefix}-session-force-confirm`} label={COPY.forceSignOut} onPress={confirmForce} />
        <SecondaryButton testID={`${prefix}-session-cancel`} label={COPY.cancel} onPress={cancel} />
      </Panel>
    );
  }

  return (
    <View style={styles.root}>
      {maskedEmail ? (
        <View accessible accessibilityLabel={`${labels.settings.accountEmail}: ${maskedEmail}`} style={styles.emailRow}>
          <Text style={styles.muted}>{labels.settings.accountEmail}</Text>
          <Text testID={`${prefix}-account-email`} style={styles.email}>
            {maskedEmail}
          </Text>
        </View>
      ) : null}

      {mode === MODE.IDLE ? (
        <View style={styles.actions}>
          <SecondaryButton
            testID={`${prefix}-sign-out`}
            label={COPY.confirm}
            onPress={() => ask(false)}
            variant={isRegistration ? 'default' : 'danger'}
          />
          {isRegistration ? null : (
            <SecondaryButton testID="settings-switch-account" label={COPY.confirmSwitch} onPress={() => ask(true)} />
          )}
        </View>
      ) : null}

      <View accessibilityLiveRegion="polite">{panel}</View>
    </View>
  );
}

function Panel({ tone, icon, title, titleRef, titleTestID, children }) {
  return (
    <Card variant="status" tone={tone} style={styles.panel}>
      <View style={styles.titleRow}>
        <Icon name={icon} size={iconSize.lg} tint={tone === 'danger' ? color.onDangerSoft : color.onWarningSoft} />
        <Text
          ref={titleRef}
          testID={titleTestID}
          accessibilityRole="header"
          style={[styles.title, tone === 'danger' ? styles.titleDanger : styles.titleWarning]}
        >
          {title}
        </Text>
      </View>
      {children}
    </Card>
  );
}

const styles = StyleSheet.create({
  root: { gap: space[3] },
  emailRow: { gap: space[1] },
  actions: { gap: touch.gap },
  panel: { gap: touch.gap },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space[2] },
  title: { ...type.bodyStrong, flex: 1, flexShrink: 1 },
  titleWarning: { color: color.onWarningSoft },
  titleDanger: { color: color.onDangerSoft },
  body: { ...type.body, color: color.text },
  muted: { ...type.caption, color: color.textMuted },
  email: { ...type.bodyStrong, color: color.text },
});

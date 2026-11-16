// AI-assisted: see docs/AI_LOG.md #67
// AI-assisted: see docs/AI_LOG.md #60
// "Cerrar sesión" for the registration flow, outside the forms. Same single session reset as
// AccountActions (useSessionReset) and the same texts (labels.auth.signOut); only the trigger differs:
//   trigger 'link'   -> discreet text link (welcome screen).
//   trigger 'button' -> secondary button (account menu of the tab bar).
// The confirmation is on screen (no Alert). States: idle, confirming, processing, blocked by a trip,
// error (retry), trip not saved in time (retry, or sign out anyway after an explicit confirmation).
// The panel title takes the screen-reader focus when a panel shows; messages live in a polite region.

import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, findNodeHandle, Pressable, StyleSheet, Text, View } from 'react-native';
import { labels } from '../../constants/labels';
import { useLanguage } from '../../i18n/useLanguage';
import { useSessionReset } from '../../context/useSessionReset';
import { SESSION_RESET_REASON } from '../../services/session/resetSession';
import { color, iconSize, opacity, space, touch, type } from '../../theme/tokens';
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
// onOpenChange(open) is optional: true while any confirmation panel is showing (mode not idle).
export function InlineSignOut({ trigger = 'link', onOpenChange }) {
  useLanguage();
  const COPY = labels.auth.signOut;
  const resetSession = useSessionReset();
  const [mode, setMode] = useState(MODE.IDLE);
  const titleRef = useRef(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!FOCUS_MODES.includes(mode)) return;
    const handle = findNodeHandle(titleRef.current);
    if (handle) AccessibilityInfo.setAccessibilityFocus(handle);
  }, [mode]);

  useEffect(() => {
    if (onOpenChange) onOpenChange(mode !== MODE.IDLE);
  }, [mode, onOpenChange]);

  const ask = useCallback(() => setMode(MODE.CONFIRM), []);
  const cancel = useCallback(() => setMode(MODE.IDLE), []);
  const askForce = useCallback(() => setMode(MODE.CONFIRM_FORCE), []);

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

  const processing = mode === MODE.PROCESSING;
  let panel = null;
  if (mode === MODE.CONFIRM || processing) {
    panel = (
      <Panel tone="warning" icon="log-out" title={COPY.confirmTitle} titleRef={titleRef}>
        <Text style={styles.body}>{processing ? COPY.processing : COPY.registrationWarning}</Text>
        <PrimaryButton
          testID="registration-session-confirm"
          label={processing ? COPY.processing : COPY.confirm}
          onPress={confirm}
          disabled={processing}
        />
        <SecondaryButton testID="registration-session-cancel" label={COPY.cancel} onPress={cancel} disabled={processing} />
      </Panel>
    );
  } else if (mode === MODE.BLOCKED) {
    panel = (
      <Panel tone="danger" icon="alert-circle" title={COPY.blockedByTrip} titleRef={titleRef}>
        <SecondaryButton testID="registration-session-cancel" label={COPY.dismiss} onPress={cancel} />
      </Panel>
    );
  } else if (mode === MODE.ERROR) {
    panel = (
      <Panel tone="danger" icon="alert-circle" title={COPY.error} titleRef={titleRef}>
        <PrimaryButton testID="registration-session-retry" label={COPY.retry} onPress={confirm} />
        <SecondaryButton testID="registration-session-cancel" label={COPY.cancel} onPress={cancel} />
      </Panel>
    );
  } else if (mode === MODE.SAVE_PENDING) {
    panel = (
      <Panel tone="danger" icon="alert-circle" title={COPY.tripSavePending} titleRef={titleRef}>
        <PrimaryButton testID="registration-session-retry" label={COPY.retry} onPress={confirm} />
        <SecondaryButton testID="registration-session-force" label={COPY.forceSignOut} onPress={askForce} variant="danger" />
        <SecondaryButton testID="registration-session-cancel" label={COPY.cancel} onPress={cancel} />
      </Panel>
    );
  } else if (mode === MODE.CONFIRM_FORCE) {
    panel = (
      <Panel tone="warning" icon="log-out" title={COPY.forceConfirmTitle} titleRef={titleRef}>
        <Text style={styles.body}>{COPY.forceConfirmBody}</Text>
        <PrimaryButton testID="registration-session-force-confirm" label={COPY.forceSignOut} onPress={confirmForce} />
        <SecondaryButton testID="registration-session-cancel" label={COPY.cancel} onPress={cancel} />
      </Panel>
    );
  }

  return (
    <View style={styles.root}>
      {mode === MODE.IDLE ? (
        trigger === 'link' ? (
          <Pressable
            testID="registration-sign-out"
            accessibilityRole="button"
            accessibilityLabel={COPY.confirm}
            onPress={ask}
            style={({ pressed }) => [styles.link, pressed && styles.pressed]}
          >
            <Text style={styles.linkText}>{COPY.confirm}</Text>
          </Pressable>
        ) : (
          <SecondaryButton testID="registration-sign-out" label={COPY.confirm} onPress={ask} />
        )
      ) : null}
      <View accessibilityLiveRegion="polite">{panel}</View>
    </View>
  );
}

function Panel({ tone, icon, title, titleRef, children }) {
  const danger = tone === 'danger';
  return (
    <Card variant="status" tone={tone} style={styles.panel}>
      <View style={styles.titleRow}>
        <Icon name={icon} size={iconSize.lg} tint={danger ? color.onDangerSoft : color.onWarningSoft} />
        <Text
          ref={titleRef}
          accessibilityRole="header"
          style={[styles.title, danger ? styles.titleDanger : styles.titleWarning]}
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
  link: {
    alignSelf: 'flex-start',
    minHeight: touch.controlHeight,
    minWidth: touch.controlHeight,
    justifyContent: 'center',
  },
  pressed: { opacity: opacity.pressed },
  linkText: { ...type.bodyStrong, color: color.primary, textDecorationLine: 'underline' },
  panel: { gap: touch.gap },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space[2] },
  title: { ...type.bodyStrong, flex: 1, flexShrink: 1 },
  titleWarning: { color: color.onWarningSoft },
  titleDanger: { color: color.onDangerSoft },
  body: { ...type.body, color: color.text },
});

// AI-assisted: see docs/AI_LOG.md #64
// Connects push notifications to the app (T-183, D-130, D-140). Mounted once inside the providers
// (MainDrawer), so a session exists. Foreground messages and notification taps become a trip request
// offered through useAvailability().offerPushRequest, only for the right account (resolveIntent).
// A request that already expired shows a brief "La solicitud expiró" notice; anything else that is not
// eligible is ignored silently. It never imports the Firebase SDK (the notifications service does).

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EXPIRED_NOTICE_MS } from '../config/trip';
import { ACCOUNT_STATUS } from '../constants/accountStatus';
import { labels } from '../constants/labels';
import { useAppState } from '../context/AppStateContext';
import { useAvailability } from '../context/AvailabilityContext';
import { getNotifications } from '../services/notifications';
import { ARRIVAL, OPEN_INTENT, decideRequestOpen, resolveOpenIntent, shouldNavigateToRequest } from '../services/trip/requestNavigation';
import { HOME_ROUTE } from '../services/trip/requestPresentation';
import { INTENT_DECISION, resolveIntent } from '../services/notifications/eligibility';
import { createIntentFlow } from '../services/notifications/intentFlow';
import { pendingIntent } from '../services/notifications/pendingIntent';
import { logPushEvent } from '../services/notifications/safeLog';
import { getRegistrationController } from '../services/notifications/registrationRuntime';
import { color, radius, space, type } from '../theme/tokens';

export function NotificationsBridge({ currentRoute = null, getNavigation = () => null }) {
  const { driverId, accountStatus } = useAppState();
  const { onTrip, offerPushRequest, pendingRequest, requestScreenId, setRequestOrigin } = useAvailability();
  const insets = useSafeAreaInsets();
  const [notice, setNotice] = useState(null);
  // AI-assisted: see docs/AI_LOG.md #64 (D-149): a tap that was offered (or promoted) and still has to open
  // the full-screen request; resolved once the pending request is visible to this component.
  const [openIntent, setOpenIntent] = useState(null);

  // Latest values for the long-lived subscriptions (no resubscribe on every change).
  const latest = useRef({});
  latest.current = { driverId, accountStatus, onTrip, offerPushRequest, pendingRequest };

  const decide = useCallback((intent) => {
    const { driverId: uid, accountStatus: status, onTrip: busy } = latest.current;
    return resolveIntent(intent, {
      session: uid ? { uid } : null,
      accountApproved: status === ACCOUNT_STATUS.APPROVED,
      onTrip: busy,
      now: Date.now(),
    });
  }, []);

  const handle = useCallback(
    async (intent, request) => {
      const decision = decide(intent);
      if (decision === INTENT_DECISION.EXPIRED) setNotice(labels.trip.pushExpired);
      else if (decision === INTENT_DECISION.OPEN) {
        // T-199: the offer waits for the route lookup; it expires there too (same notice as above).
        const offered = await latest.current.offerPushRequest(request);
        if (!offered && Date.now() >= request.expiresAt) setNotice(labels.trip.pushExpired);
      }
    },
    [decide],
  );

  // Evaluates the parked tap intent (stored without judging it) only when the gate is ready: a session
  // and a resolved account status (D-146). Until then it stays parked.
  const flow = useMemo(
    () =>
      createIntentFlow({
        intents: pendingIntent,
        getState: () => ({
          uid: latest.current.driverId,
          accountStatus: latest.current.accountStatus,
          onTrip: latest.current.onTrip,
        }),
        offer: async (request) => {
          const hasSamePending = latest.current.pendingRequest?.id === request.id;
          // The intent exists from the start of the offer (route lookup in progress) and is kept until it settles.
          setOpenIntent({ id: request.id, hasSamePending, offering: true });
          const offered = await latest.current.offerPushRequest(request, { tap: true });
          setOpenIntent((prev) => {
            if (!prev || prev.id !== request.id) return prev;
            return offered ? { ...prev, offering: false } : null;
          });
          return offered;
        },
        showExpired: () => setNotice(labels.trip.pushExpired),
        log: (code) => logPushEvent(code, { isDev: __DEV__, log: (message) => console.log(message) }),
      }),
    [],
  );
  // Fire-and-forget callers: the evaluation is async (T-199) and must never leave an unhandled rejection.
  const takeParked = useCallback(() => flow.evaluate().catch(() => {}), [flow]);

  useEffect(() => {
    let cancel = () => {};
    let unsubscribeForeground = () => {};
    try {
      const notifications = getNotifications();
      unsubscribeForeground = notifications.onForegroundMessage((request, targetUid) =>
        handle({ targetUid, requestId: request.id, expiresAt: request.expiresAt }, request).catch(() => {}),
      );
      cancel = notifications.onNotificationOpened(takeParked);
    } catch {
      // Notifications must never break the app (no native module, no Firebase config).
    }
    return () => {
      unsubscribeForeground();
      cancel();
    };
  }, [handle, takeParked]);

  // An intent parked before the session or the account status was resolved is evaluated as soon as it is.
  useEffect(() => {
    takeParked();
  }, [driverId, accountStatus, takeParked]);

  // Registers this phone's push token for the signed-in, approved driver (T-184/T-186, D-131): at start,
  // on token refresh, and again for another account on the same phone (the effect restarts per uid).
  const approved = accountStatus === ACCOUNT_STATUS.APPROVED;
  useEffect(() => {
    if (!driverId || !approved) return undefined;
    let controller = null;
    try {
      controller = getRegistrationController();
      controller.start(driverId);
    } catch {
      return undefined;
    }
    return () => controller.stop();
  }, [driverId, approved]);

  // Opens the full-screen request after a tap, from any drawer screen (D-149). The origin screen is kept
  // so the request screen returns there when it closes without accepting.
  useEffect(() => {
    if (resolveOpenIntent(openIntent, pendingRequest?.id ?? null) !== OPEN_INTENT.OPEN) return;
    setOpenIntent(null);
    const decision = decideRequestOpen({
      arrival: ARRIVAL.TAP,
      currentRoute,
      hasSamePending: openIntent.hasSamePending,
      screenOpen: requestScreenId != null,
      onTrip,
      accountStatus,
    });
    if (!shouldNavigateToRequest(decision.action)) return;
    setRequestOrigin(decision.origin);
    try {
      getNavigation()?.navigate(HOME_ROUTE, { screen: 'TripRequest' });
    } catch {
      setRequestOrigin(null);
    }
  }, [openIntent, pendingRequest, currentRoute, requestScreenId, onTrip, accountStatus, getNavigation, setRequestOrigin]);

  // An offered tap whose request vanished (expired, cleared) before it could open is dropped.
  useEffect(() => {
    if (resolveOpenIntent(openIntent, pendingRequest?.id ?? null) === OPEN_INTENT.DROP) {
      const id = setTimeout(() => setOpenIntent(null), 0);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [openIntent, pendingRequest]);

  useEffect(() => {
    if (!notice) return undefined;
    const id = setTimeout(() => setNotice(null), EXPIRED_NOTICE_MS);
    return () => clearTimeout(id);
  }, [notice]);

  if (!notice) return null;
  return (
    <View pointerEvents="none" style={[styles.anchor, { top: insets.top + space[3] }]}>
      <View testID="push-expired-notice" style={styles.notice} accessibilityLiveRegion="polite">
        <Text style={styles.noticeText}>{notice}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: { position: 'absolute', left: space[4], right: space[4] },
  notice: {
    alignSelf: 'center',
    paddingVertical: space[3],
    paddingHorizontal: space[4],
    borderRadius: radius.md,
    backgroundColor: color.text,
  },
  noticeText: {
    ...type.body,
    color: color.surface,
  },
});

// AI-assisted: see docs/AI_LOG.md #47
// AI-assisted: see docs/AI_LOG.md #48
// AI-assisted: see docs/AI_LOG.md #49
// AI-assisted: see docs/AI_LOG.md #53 (presentation: raised sheet, icon close, highlighted earnings)
// AI-assisted: see docs/AI_LOG.md #64 (S5 design fixes: long names, font scale cap, 48 dp close, urgent countdown)
// Incoming request as a bottom card (T-54), shown while the driver is on a drawer screen other than
// MainHome. It is mounted once in MainDrawer, above the drawer, and reads the same pending request as
// the full screen (AvailabilityContext), so both show the same countdown (from expiresAt).
// Accept -> TripActive. Reject -> the card closes and the driver stays. The close icon only hides the card: the
// request expires by itself. It never shows while the full-screen request is open (#49).
// When it expires unseen-by-decision, a brief notice replaces it and the driver stays where they are.
// The entrance animation is skipped when the system asks to reduce motion.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SIMULATED_SPEED_KMH } from '../config/location';
import { EXPIRED_NOTICE_MS } from '../config/trip';
import { labels } from '../constants/labels';
import { useLanguage } from '../i18n/useLanguage';
import { decisionDeadline, markShown } from '../services/trip/decisionWindow';
import { noticeDurationMs } from '../services/trip/noticeDuration';
import { paymentLabelKey } from '../services/trip/paymentGateway';
import { useAppState } from '../context/AppStateContext';
import { useAvailability } from '../context/AvailabilityContext';
import { useTrip } from '../context/TripContext';
import { PASSENGER_API_ERROR, acceptRequest } from '../services/passengerApi';
import { DECLINE_REASON, declineRequest, markRequestAccepted } from '../services/trip/declineRequestApp';
import { CLOSED_REASON, closedReasonText, requestClosedReason } from '../services/trip/requestClosed';
import { haversineDistanceM } from '../services/routing/straightLine';
import {
  HOME_ROUTE,
  PRESENTATION,
  decideRequestPresentation,
  requestTotalSeconds,
  secondsUntil,
} from '../services/trip/requestPresentation';
import { badgeSize, borderWidth, color, elevation, iconSize, maxFontScale, opacity, radius, space, touch, type } from '../theme/tokens';
import { canDecide, decisionWindowStart, displayFare, isMetricsPending } from '../services/trip/requestMetrics';
import { SkeletonBlock } from './ScreenState';
import { countdownAnnouncement, fillLabel, formatCop, formatKmFromMeters, formatMinutesFromSeconds } from '../utils/format';
import { Card } from './Card';
import { Icon } from './Icon';
import { PrimaryButton } from './PrimaryButton';
import { SecondaryButton } from './SecondaryButton';

const TICK_MS = 1000;
const ENTRANCE_MS = 200;
const ENTRANCE_OFFSET = 24;
const MAX_HEIGHT_RATIO = 0.7;
const EXPIRY_TOLERANCE_MS = 1500;
const URGENT_SECONDS = 10; // same threshold as TripRequestScreen
const toLngLat = (point) => [point.lng, point.lat];
const formatRating = (rating) => String(Math.round(rating * 10) / 10).replace('.', ',');

function errorMessage(error) {
  switch (error?.code) {
    case PASSENGER_API_ERROR.ALREADY_TAKEN:
      return labels.trip.errorTaken;
    case PASSENGER_API_ERROR.EXPIRED:
      return labels.trip.expired;
    case PASSENGER_API_ERROR.NETWORK:
      return labels.trip.errorNetwork;
    default:
      return labels.trip.errorGeneric;
  }
}

// currentRoute: focused drawer screen name. getNavigation: returns a navigation object that can
// reach the drawer screens (kept by MainDrawer).
export function IncomingRequestCard({ currentRoute, getNavigation }) {
  const { language } = useLanguage();
  const { accountStatus, driverId } = useAppState();
  const { pendingRequest, clearPendingRequest, getDriverPosition, onTrip, requestScreenId, isAvailable } = useAvailability();
  // AI-assisted: see docs/AI_LOG.md #66 (C2d): read inside the effect below without re-running it
  const isAvailableRef = useRef(isAvailable);
  isAvailableRef.current = isAvailable;
  const { startTrip } = useTrip();
  const insets = useSafeAreaInsets();
  const { height: windowHeight, fontScale } = useWindowDimensions();
  // The urgent icon follows the text, capped at the same maxFontScale the countdown text uses.
  const urgentIconSize = Math.round(iconSize.lg * Math.min(Math.max(fontScale, 1), maxFontScale));

  const [dismissedId, setDismissedId] = useState(null);
  const [now, setNow] = useState(() => Date.now());
  const [working, setWorking] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const shownRef = useRef(null); // { id, expiresAt, handled } of the request the card is showing
  const mountedRef = useRef(true);

  // AI-assisted: see docs/AI_LOG.md #49
  const presentation = decideRequestPresentation(
    currentRoute,
    onTrip,
    accountStatus,
    Boolean(pendingRequest),
    requestScreenId != null,
  );
  const visible = presentation === PRESENTATION.CARD && pendingRequest != null && dismissedId !== pendingRequest.id;
  const request = visible ? pendingRequest : null;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Tracks what the card showed; when that request disappears without a decision from the card
  // (it expired), a brief notice is shown instead.
  useEffect(() => {
    const shown = shownRef.current;
    if (visible) {
      const same = shown?.id === pendingRequest.id;
      shownRef.current = {
        id: pendingRequest.id,
        expiresAt: pendingRequest.expiresAt,
        request: pendingRequest,
        handled: same ? shown.handled : false,
      };
      return;
    }
    const gone = !pendingRequest || pendingRequest.id !== shown?.id;
    if (shown && !shown.handled && gone) {
      const reason = requestClosedReason({
        available: isAvailableRef.current,
        remainingMs: shown.expiresAt - Date.now(),
        toleranceMs: EXPIRY_TOLERANCE_MS,
      });
      if (reason === CLOSED_REASON.UNAVAILABLE) {
        // AI-assisted: see docs/AI_LOG.md #66 (C2d: released because the driver went "No disponible")
        setNotice(closedReasonText(reason));
      } else if (Date.now() >= shown.expiresAt - EXPIRY_TOLERANCE_MS) {
        setNotice(labels.trip.expired);
        // AI-assisted: see docs/AI_LOG.md #66 (T-229: expired by its own deadline, same decline path; already released)
        declineRequest({ uid: driverId, request: shown.request, reason: DECLINE_REASON.EXPIRED, release: false });
      }
    }
    shownRef.current = null;
  }, [visible, pendingRequest, driverId]);

  const markHandled = useCallback(() => {
    if (shownRef.current) shownRef.current.handled = true;
  }, []);

  // The notice lasts a moment and never outlives the context it was shown in.
  useEffect(() => {
    if (!notice) return undefined;
    // AI-assisted: see docs/AI_LOG.md #67 (A3: the time grows with the font scale)
    const id = setTimeout(() => setNotice(null), noticeDurationMs(EXPIRED_NOTICE_MS, fontScale));
    return () => clearTimeout(id);
  }, [notice, fontScale]);

  // Countdown: one tick per second while the card is visible.
  useEffect(() => {
    if (!request) return undefined;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, [request]);

  // A new request starts with a clean slate.
  const requestId = request?.id ?? null;
  useEffect(() => {
    setError(null);
    setWorking(false);
  }, [requestId]);

  // Entrance: slide up and fade in, or nothing when the system asks to reduce motion.
  const entrance = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!requestId) {
      entrance.setValue(0);
      return undefined;
    }
    let cancelled = false;
    let animation = null;
    AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((reduce) => {
        if (cancelled) return;
        if (reduce) {
          entrance.setValue(1);
          return;
        }
        animation = Animated.timing(entrance, { toValue: 1, duration: ENTRANCE_MS, useNativeDriver: true });
        animation.start();
      });
    return () => {
      cancelled = true;
      if (animation) animation.stop();
    };
  }, [requestId, entrance]);

  // D-137: the 15 s window starts the first time the request is shown.
  // AI-assisted: see docs/AI_LOG.md #66 (A1: while the metrics are pending nothing is marked; the window
  // starts with the final data, and the clock is refreshed at that moment)
  const metricsPending = isMetricsPending(request);
  useEffect(() => {
    if (!request) return;
    const startAt = decisionWindowStart(request, Date.now());
    if (startAt === null) return;
    markShown(request.id, startAt);
    setNow(startAt);
  }, [request]);

  const secondsLeft = !request ? null : metricsPending ? requestTotalSeconds(request) : secondsUntil(decisionDeadline(request, now), now);

  // When the window closes without a decision, reject quietly, free the slot and tell the driver.
  useEffect(() => {
    if (!request || metricsPending || secondsLeft !== 0 || working) return;
    const clock = Date.now();
    if (secondsUntil(decisionDeadline(request, clock), clock) > 0) return; // stale tick, not really over
    markHandled();
    setNotice(labels.trip.expired);
    // AI-assisted: see docs/AI_LOG.md #66 (T-229: one decline path; saves `rejected`, releases the request)
    declineRequest({ uid: driverId, request, reason: DECLINE_REASON.EXPIRED });
    clearPendingRequest(request.id);
  }, [request, metricsPending, secondsLeft, working, markHandled, clearPendingRequest, driverId]);

  // R-084: no fare until the final distance and duration exist (null while pending).
  const fare = useMemo(() => displayFare(request), [request]);
  const toPickup = useMemo(() => {
    if (!request) return null;
    const position = getDriverPosition();
    if (!position) return null;
    const meters = haversineDistanceM(toLngLat(position), toLngLat(request.origin));
    const seconds = meters / (SIMULATED_SPEED_KMH / 3.6);
    return fillLabel(labels.trip.toPickup, { km: formatKmFromMeters(meters), min: formatMinutesFromSeconds(seconds) });
  }, [request, getDriverPosition, language]);

  const handleAccept = useCallback(async () => {
    if (!request || !canDecide(request, { working })) return;
    markHandled();
    setWorking(true);
    setError(null);
    try {
      const trip = await acceptRequest(request.id);
      markRequestAccepted(request.id); // AI-assisted: see docs/AI_LOG.md #66 (first decision wins)
      clearPendingRequest(request.id);
      startTrip(trip);
      // AI-assisted: see docs/AI_LOG.md #49 (the card never shows while TripRequest is open, so there is none to replace)
      getNavigation()?.navigate(HOME_ROUTE, { screen: 'TripActive' });
    } catch (cause) {
      if (!mountedRef.current) return;
      const gone = cause?.code === PASSENGER_API_ERROR.ALREADY_TAKEN || cause?.code === PASSENGER_API_ERROR.EXPIRED;
      if (gone) {
        clearPendingRequest(request.id);
        setNotice(errorMessage(cause));
      } else {
        if (shownRef.current) shownRef.current.handled = false; // the driver may try again
        setError(errorMessage(cause));
      }
      setWorking(false);
    }
  }, [request, working, markHandled, clearPendingRequest, startTrip, getNavigation]);

  const handleReject = useCallback(async () => {
    if (!request || !canDecide(request, { working })) return;
    markHandled();
    setWorking(true);
    // AI-assisted: see docs/AI_LOG.md #66 (T-229: never throws, never blocks the UI)
    declineRequest({ uid: driverId, request, reason: DECLINE_REASON.REJECTED });
    clearPendingRequest(request.id);
    if (mountedRef.current) setWorking(false);
  }, [request, working, markHandled, clearPendingRequest, driverId]);

  const handleDismiss = useCallback(() => {
    if (!request) return;
    markHandled(); // hiding is not a decision, and the card says nothing more about this request
    setDismissedId(request.id);
  }, [request, markHandled]);

  const bottom = insets.bottom + space[3];

  if (!request) {
    if (!notice || presentation === PRESENTATION.FULLSCREEN || onTrip) return null;
    return (
      <View pointerEvents="none" style={[styles.anchor, { bottom }]}>
        <View testID="incoming-request-notice" style={styles.notice} accessibilityLiveRegion="polite">
          <Text style={styles.noticeText}>{notice}</Text>
        </View>
      </View>
    );
  }

  const progress = Math.min(1, secondsLeft / requestTotalSeconds(request));
  const urgent = secondsLeft <= URGENT_SECONDS;
  const name = request.passenger?.name ?? '';
  const titleText = fillLabel(labels.trip.newRequest, { name });
  const rating = typeof request.passenger?.rating === 'number' ? formatRating(request.passenger.rating) : null;
  // #59: "Tarjeta" until a gateway is chosen (a request never has a paymentId).
  const paymentLabel = request.paymentMethod ? (labels.trip.paymentMethod[paymentLabelKey({ method: request.paymentMethod })] ?? null) : null;
  const translateY = entrance.interpolate({ inputRange: [0, 1], outputRange: [ENTRANCE_OFFSET, 0] });

  return (
    <Animated.View
      testID="incoming-request-card"
      style={[styles.anchor, { bottom, opacity: entrance, transform: [{ translateY }] }]}
    >
      <View style={[styles.card, { maxHeight: windowHeight * MAX_HEIGHT_RATIO }]}>
        {/* AI-assisted: see docs/AI_LOG.md #48 (header and buttons stay outside the scroll) */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.flex} accessibilityLiveRegion="polite">
              <Text
                testID="incoming-request-title"
                style={styles.title}
                numberOfLines={2}
                ellipsizeMode="tail"
                maxFontSizeMultiplier={maxFontScale}
                accessibilityLabel={titleText}
              >
                {titleText}
              </Text>
            </View>
            <Pressable
              testID="incoming-request-dismiss"
              accessibilityRole="button"
              accessibilityLabel={labels.trip.dismiss}
              accessibilityHint={labels.trip.dismissHint}
              onPress={handleDismiss}
              style={({ pressed }) => [styles.close, pressed && styles.pressed]}
            >
              <Icon name="close" size={iconSize.lg} tint={color.text} />
            </Pressable>
          </View>
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          {/* AI-assisted: see docs/AI_LOG.md #54 (price first: earnings largest, fare compact beside it) */}
          {fare ? (
            <Card
              variant="status"
              tone="brand"
              style={styles.money}
              accessible
              accessibilityLabel={`${labels.trip.net}: ${formatCop(fare.driverEarnings)}. ${labels.trip.fare}: ${formatCop(fare.fare)}`}
            >
              <View style={styles.flex}>
                <Text style={styles.caption}>{labels.trip.net}</Text>
                <Text maxFontSizeMultiplier={maxFontScale} style={styles.net}>{formatCop(fare.driverEarnings)}</Text>
              </View>
              <View style={styles.fareColumn}>
                <Text style={styles.caption}>{labels.trip.fare}</Text>
                <Text maxFontSizeMultiplier={maxFontScale} style={styles.fareValue}>{formatCop(fare.fare)}</Text>
              </View>
            </Card>
          ) : metricsPending ? (
            <View testID="incoming-request-calculating" accessible accessibilityLabel={labels.trip.calculatingA11y} style={styles.pendingBlock}>
              <SkeletonBlock height={space[6]} />
            </View>
          ) : null}
          <View style={styles.passengerRow}>
            <View style={styles.badge}>
              <Icon name="person" size={iconSize.lg} tint={color.onPrimarySoft} />
            </View>
            {rating ? (
              <Text
                style={[styles.ratingText, type.numeric]}
                accessibilityLabel={fillLabel(labels.trip.ratingA11y, { rating })}
              >
                {fillLabel(labels.trip.rating, { rating })}
              </Text>
            ) : null}
          </View>
          {toPickup ? (
            <View style={styles.pickupRow}>
              <Icon name="navigate" size={iconSize.md} tint={color.primary} />
              <Text style={[styles.muted, styles.flex, type.numeric]}>{toPickup}</Text>
            </View>
          ) : null}
          {/* AI-assisted: see docs/AI_LOG.md #55 (T-98: payment method visible before accepting) */}
          {paymentLabel ? (
            <View style={styles.pickupRow}>
              <Text style={styles.muted}>{labels.trip.payment}:</Text>
              <Text testID="incoming-request-payment" style={[styles.body, styles.flex]}>{paymentLabel}</Text>
            </View>
          ) : null}
        </ScrollView>
        <View style={styles.footer}>
          <View
            testID="incoming-request-countdown"
            style={styles.countdown}
            accessible
            accessibilityLabel={metricsPending ? labels.trip.calculatingA11y : fillLabel(labels.trip.countdownA11y, { s: secondsLeft })}
          >
            {/* AI-assisted: see docs/AI_LOG.md #65 (H-1: non-color urgent cue; the slot is always reserved, so nothing jumps) */}
            <View style={styles.countdownRow}>
              <View style={[styles.urgentSlot, { width: urgentIconSize, height: urgentIconSize }]}>
                {urgent && !metricsPending ? <Icon name="alarm-outline" size={urgentIconSize} tint={color.danger} /> : null}
              </View>
              <Text
                maxFontSizeMultiplier={maxFontScale}
                style={[styles.countdownText, urgent && !metricsPending && styles.countdownTextUrgent, metricsPending && styles.countdownTextPending]}
              >
                {metricsPending ? labels.trip.calculating : fillLabel(labels.trip.countdown, { s: secondsLeft })}
              </Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, urgent && !metricsPending && styles.fillUrgent, { flex: metricsPending ? 0 : progress }]} />
              <View style={{ flex: metricsPending ? 1 : 1 - progress }} />
            </View>
          </View>
          <View style={styles.announcer} accessibilityLiveRegion="polite">
            <Text>{metricsPending ? labels.trip.calculatingA11y : countdownAnnouncement(secondsLeft, labels.trip.countdownA11y)}</Text>
          </View>
          {error ? (
            <Card variant="status" tone="danger" style={styles.errorCard}>
              <Icon name="alert-circle" size={iconSize.md} tint={color.onDangerSoft} />
              <Text testID="incoming-request-error" style={styles.error} accessibilityLiveRegion="polite">
                {error}
              </Text>
            </Card>
          ) : null}
          <View style={styles.actions}>
            <View style={styles.flex}>
              <PrimaryButton
                testID="incoming-request-accept"
                label={labels.trip.accept}
                accessibilityHint={labels.trip.acceptHint}
                onPress={handleAccept}
                disabled={working || metricsPending}
                quietDisabled={metricsPending} // AI-assisted: see docs/AI_LOG.md #66 (H-3)
              />
            </View>
            <View style={styles.flex}>
              <SecondaryButton
                testID="incoming-request-reject"
                label={labels.trip.reject}
                accessibilityHint={labels.trip.rejectCardHint}
                onPress={handleReject}
                disabled={working || metricsPending}
              />
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  anchor: {
    position: 'absolute',
    left: space[3],
    right: space[3],
  },
  card: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: borderWidth.thin,
    borderColor: color.borderSubtle,
    ...elevation.raised,
  },
  scroll: {
    flexShrink: 1,
  },
  header: {
    paddingTop: space[3],
    paddingLeft: space[4],
    paddingRight: space[2],
  },
  content: {
    gap: space[2],
    paddingHorizontal: space[4],
    paddingBottom: space[2],
  },
  footer: {
    gap: space[2],
    paddingHorizontal: space[4],
    paddingBottom: space[4],
  },
  flex: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  title: {
    ...type.title,
    color: color.text,
  },
  close: {
    width: touch.controlHeight,
    height: touch.controlHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passengerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  badge: {
    width: badgeSize,
    height: badgeSize,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: color.primarySoft,
  },
  ratingText: {
    ...type.bodyStrong,
    color: color.text,
  },
  pickupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  pressed: {
    opacity: opacity.pressed,
  },
  body: {
    ...type.body,
    color: color.text,
  },
  muted: {
    ...type.body,
    color: color.textMuted,
  },
  caption: {
    ...type.caption,
    color: color.onPrimarySoft,
  },
  money: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: space[3],
    padding: space[3],
  },
  fareColumn: {
    alignItems: 'flex-end',
    flexShrink: 1,
  },
  fareValue: {
    ...type.body,
    ...type.numeric,
    color: color.onPrimarySoft,
  },
  net: {
    ...type.display,
    ...type.numeric,
    color: color.primary,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space[2],
    padding: space[3],
  },
  // Visually hidden live region: the screen reader hears the countdown only at 10, 5 and 0 s.
  announcer: {
    position: 'absolute',
    width: borderWidth.thin,
    height: borderWidth.thin,
    overflow: 'hidden',
    opacity: 0,
  },
  // AI-assisted: see docs/AI_LOG.md #64 (D-150): the same pattern as TripRequestScreen: primary text plus a
  // thin bar over a light track, no filled block (it looked like the "Aceptar" button). In the last 10 s the
  // text and the bar turn color.danger (no fill). The sizes are constant so the card does not jump.
  countdown: {
    gap: space[2],
    paddingVertical: space[1],
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[2],
  },
  urgentSlot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: {
    ...type.title,
    ...type.numeric,
    color: color.primary,
    textAlign: 'center',
  },
  countdownTextUrgent: {
    color: color.danger,
  },
  countdownTextPending: {
    color: color.textMuted,
  },
  pendingBlock: {
    paddingVertical: space[1],
  },
  track: {
    flexDirection: 'row',
    height: space[1],
    borderRadius: radius.full,
    overflow: 'hidden',
    backgroundColor: color.primarySoft,
  },
  fill: {
    backgroundColor: color.primary,
  },
  fillUrgent: {
    backgroundColor: color.danger,
  },
  actions: {
    flexDirection: 'row',
    gap: touch.gap,
  },
  error: {
    flex: 1,
    ...type.body,
    color: color.onDangerSoft,
  },
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

// AI-assisted: see docs/AI_LOG.md #47
// AI-assisted: see docs/AI_LOG.md #48
// AI-assisted: see docs/AI_LOG.md #49
// AI-assisted: see docs/AI_LOG.md #53 (presentation: raised sheet, icon close, highlighted earnings)
// Incoming request as a bottom card (T-54), shown while the driver is on a drawer screen other than
// Home. It is mounted once in MainDrawer, above the drawer, and reads the same pending request as
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
import { paymentLabelKey } from '../services/trip/paymentGateway';
import { useAppState } from '../context/AppStateContext';
import { useAvailability } from '../context/AvailabilityContext';
import { useTrip } from '../context/TripContext';
import { PASSENGER_API_ERROR, acceptRequest, rejectRequest } from '../services/passengerApi';
import { haversineDistanceM } from '../services/routing/straightLine';
import {
  PRESENTATION,
  decideRequestPresentation,
  requestTotalSeconds,
  secondsUntil,
} from '../services/trip/requestPresentation';
import { badgeSize, borderWidth, color, elevation, iconSize, opacity, radius, space, touch, type } from '../theme/tokens';
import { calculateFare } from '../utils/fare';
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
const toLngLat = (point) => [point.lng, point.lat];
const formatRating = (rating) => String(Math.round(rating * 10) / 10).replace('.', ',');

function fareOf(request) {
  try {
    return calculateFare({ distanceKm: request.distanceKm, durationMin: request.durationMin, category: request.category });
  } catch {
    return null;
  }
}

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
  const { accountStatus } = useAppState();
  const { pendingRequest, clearPendingRequest, getDriverPosition, onTrip, requestScreenId } = useAvailability();
  const { startTrip } = useTrip();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

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
      shownRef.current = { id: pendingRequest.id, expiresAt: pendingRequest.expiresAt, handled: same ? shown.handled : false };
      return;
    }
    const gone = !pendingRequest || pendingRequest.id !== shown?.id;
    if (shown && !shown.handled && gone && Date.now() >= shown.expiresAt - EXPIRY_TOLERANCE_MS) {
      setNotice(labels.trip.expired);
    }
    shownRef.current = null;
  }, [visible, pendingRequest]);

  const markHandled = useCallback(() => {
    if (shownRef.current) shownRef.current.handled = true;
  }, []);

  // The notice lasts a moment and never outlives the context it was shown in.
  useEffect(() => {
    if (!notice) return undefined;
    const id = setTimeout(() => setNotice(null), EXPIRED_NOTICE_MS);
    return () => clearTimeout(id);
  }, [notice]);

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

  const fare = useMemo(() => (request ? fareOf(request) : null), [request]);
  const toPickup = useMemo(() => {
    if (!request) return null;
    const position = getDriverPosition();
    if (!position) return null;
    const meters = haversineDistanceM(toLngLat(position), toLngLat(request.origin));
    const seconds = meters / (SIMULATED_SPEED_KMH / 3.6);
    return fillLabel(labels.trip.toPickup, { km: formatKmFromMeters(meters), min: formatMinutesFromSeconds(seconds) });
  }, [request, getDriverPosition]);

  const handleAccept = useCallback(async () => {
    if (!request || working) return;
    markHandled();
    setWorking(true);
    setError(null);
    try {
      const trip = await acceptRequest(request.id);
      clearPendingRequest(request.id);
      startTrip(trip);
      // AI-assisted: see docs/AI_LOG.md #49 (the card never shows while TripRequest is open, so there is none to replace)
      getNavigation()?.navigate('Home', { screen: 'TripActive' });
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
    if (!request || working) return;
    markHandled();
    setWorking(true);
    try {
      await rejectRequest(request.id);
    } catch {
      // It expires by itself on the passenger side; the driver stays where they are anyway.
    }
    clearPendingRequest(request.id);
    if (mountedRef.current) setWorking(false);
  }, [request, working, markHandled, clearPendingRequest]);

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

  const secondsLeft = secondsUntil(request.expiresAt, now);
  const progress = Math.min(1, secondsLeft / requestTotalSeconds(request));
  const name = request.passenger?.name ?? '';
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
              <Text testID="incoming-request-title" style={styles.title}>
                {fillLabel(labels.trip.newRequest, { name })}
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
                <Text style={styles.net}>{formatCop(fare.driverEarnings)}</Text>
              </View>
              <View style={styles.fareColumn}>
                <Text style={styles.caption}>{labels.trip.fare}</Text>
                <Text style={styles.fareValue}>{formatCop(fare.fare)}</Text>
              </View>
            </Card>
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
            accessibilityLabel={fillLabel(labels.trip.countdownA11y, { s: secondsLeft })}
          >
            <Text style={styles.countdownText}>{fillLabel(labels.trip.countdown, { s: secondsLeft })}</Text>
            <View style={styles.track}>
              <View style={[styles.fill, { flex: progress }]} />
              <View style={{ flex: 1 - progress }} />
            </View>
          </View>
          <View style={styles.announcer} accessibilityLiveRegion="polite">
            <Text>{countdownAnnouncement(secondsLeft, labels.trip.countdownA11y)}</Text>
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
                disabled={working}
              />
            </View>
            <View style={styles.flex}>
              <SecondaryButton
                testID="incoming-request-reject"
                label={labels.trip.reject}
                accessibilityHint={labels.trip.rejectCardHint}
                onPress={handleReject}
                disabled={working}
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
    width: touch.min,
    height: touch.min,
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
  countdown: {
    gap: space[2],
  },
  countdownText: {
    ...type.label,
    ...type.numeric,
    color: color.primary,
  },
  track: {
    flexDirection: 'row',
    height: space[2],
    borderRadius: radius.full,
    overflow: 'hidden',
    backgroundColor: color.primarySoft,
  },
  fill: {
    backgroundColor: color.primary,
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

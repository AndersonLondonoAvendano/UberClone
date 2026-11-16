// AI-assisted: see docs/AI_LOG.md #45 (popTo('Home'): navigate pushes a second Home in React Navigation 7, leaving this screen mounted)
// AI-assisted: see docs/AI_LOG.md #18
// AI-assisted: see docs/AI_LOG.md #43
// AI-assisted: see docs/AI_LOG.md #48
// AI-assisted: see docs/AI_LOG.md #49
// AI-assisted: see docs/AI_LOG.md #53 (presentation: passenger header, route markers, data rows, status cards)
// The drawer keeps this screen mounted when the driver switches tab, so it acts only while focused:
// timers, the quiet reject, leaving and the accept navigation wait for focus. A request resolved
// elsewhere is never rejected or left again from a hidden screen; it only closes itself, quietly,
// inside its own stack (no tab change). It is the only TripRequest (fixed id) and publishes its
// request id in the context while open, so the bottom card never shows for it.
// Incoming request card (T-43). Opened by Home when a request arrives while the driver is available.
// Shows the passenger, the distance and time to the pickup (straight line from the driver position),
// the trip length, category, payment, the fare split from calculateFare and a countdown to expiresAt.
// One request at a time: the card keeps the request it opened with. When it expires (or the slot
// is released without a decision) it shows "La solicitud expiró" and goes back to Home.
// Accept -> acceptRequest -> the trip starts (TripContext) -> TripActive. Reject -> Home.
// Leaving the card without deciding rejects the request. Errors are inline text, never Alert.
//
// AI-assisted: see docs/AI_LOG.md #44
// The two numbers the driver decides with are the loudest things on screen: "Tu ganancia" in
// type.display and color.primary inside the card, and the countdown fixed above the buttons (never
// scrolled away) as primary text with a draining bar and no filled block (D-150; the last 10 s use
// color.danger for text and bar, never a fill). An expired request is rejected quietly and
// shows one text, labels.trip.expired. No borders or dividers: surface steps and space only.

import { useIsFocused } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/Card';
import { DataRow } from '../../components/DataRow';
import { Icon } from '../../components/Icon';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SecondaryButton } from '../../components/SecondaryButton';
import { SIMULATED_SPEED_KMH } from '../../config/location';
import { COMMISSION_RATE } from '../../config/pricing';
import { EXPIRED_NOTICE_MS } from '../../config/trip';
import { labels } from '../../constants/labels';
import { paymentLabelKey } from '../../services/trip/paymentGateway';
import { useAvailability } from '../../context/AvailabilityContext';
import { useTrip } from '../../context/TripContext';
import { useRequestAddresses } from '../../hooks/useRequestAddresses';
import { PASSENGER_API_ERROR, acceptRequest, rejectRequest } from '../../services/passengerApi';
import { haversineDistanceM } from '../../services/routing/straightLine';
// AI-assisted: see docs/AI_LOG.md #47
import { decisionDeadline, markShown } from '../../services/trip/decisionWindow';
import { planLeave } from '../../services/trip/requestNavigation';
import { requestTotalSeconds, secondsUntil } from '../../services/trip/requestPresentation';
import { badgeSize, borderWidth, color, iconSize, maxFontScale, radius, space, touch, type } from '../../theme/tokens';
import { calculateFare, commissionPercent } from '../../utils/fare';
import { countdownAnnouncement, fillLabel, formatCop, formatKm, formatKmFromMeters, formatMinutesFromSeconds } from '../../utils/format';

const SAFE_EDGES = ['top', 'bottom'];
const TICK_MS = 1000;
const URGENT_SECONDS = 10;
const toLngLat = (point) => [point.lng, point.lat];

// Rating with one decimal and a comma: 4.85 -> "4,9".
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

function fareOf(request) {
  try {
    return calculateFare({ distanceKm: request.distanceKm, durationMin: request.durationMin, category: request.category });
  } catch {
    return null;
  }
}

export function TripRequestScreen({ navigation }) {
  const { pendingRequest, clearPendingRequest, getDriverPosition, setRequestScreenId, takeRequestOrigin } = useAvailability();
  const { startTrip } = useTrip();
  // The urgent icon follows the text, capped at the same maxFontScale the countdown text uses.
  const { fontScale } = useWindowDimensions();
  const urgentIconSize = Math.round(iconSize.lg * Math.min(Math.max(fontScale, 1), maxFontScale));
  // The card keeps the request it opened with; a later one never replaces it.
  // D-137: the 15 s decision window starts here, the first time the request is shown.
  const [request] = useState(() => {
    if (pendingRequest) markShown(pendingRequest.id, Date.now());
    return pendingRequest;
  });
  // AI-assisted: see docs/AI_LOG.md #61 (D-125: real street, "Buscando dirección…" while it arrives)
  const addresses = useRequestAddresses(request);
  const [driverPosition] = useState(() => getDriverPosition());
  const [now, setNow] = useState(() => Date.now());
  // Seconds the card opened with: the bar drains from here.
  const [totalSeconds] = useState(() => requestTotalSeconds(pendingRequest)); // AI-assisted: see docs/AI_LOG.md #47 (same window as the bottom card)
  const [working, setWorking] = useState(false);
  const [error, setError] = useState(null); // { message, gone }
  const [decided, setDecided] = useState(false);
  const decidedRef = useRef(false);
  const mountedRef = useRef(true);
  // AI-assisted: see docs/AI_LOG.md #48
  const isFocused = useIsFocused();
  const focusedRef = useRef(isFocused);
  const [pendingExit, setPendingExit] = useState(null); // leave | trip: an exit that happened while hidden
  useEffect(() => {
    focusedRef.current = isFocused;
    if (isFocused) setNow(Date.now());
  }, [isFocused]);

  const markDecided = useCallback((value) => {
    decidedRef.current = value;
    setDecided(value);
  }, []);

  const secondsLeft = request ? secondsUntil(decisionDeadline(request, now), now) : 0;
  const released = Boolean(request) && pendingRequest?.id !== request.id;
  const expired = Boolean(request) && !decided && !error?.gone && (secondsLeft === 0 || released);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Countdown: one tick per second while the card is open and undecided.
  useEffect(() => {
    if (!isFocused || !request || expired || decided || error?.gone) return undefined;
    const id = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, [isFocused, request, expired, decided, error]);

  // Every exit goes through here: back to Home inside this stack (popTo: navigate would push a second Home).
  // AI-assisted: see docs/AI_LOG.md #64 (D-149): when a notification tap opened this screen from another
  // drawer screen, the driver returns to that screen (the origin is consumed once; a hidden screen never
  // moves the drawer). The drawer navigator is captured now so it can still be used while unmounting.
  const drawerRef = useRef(navigation.getParent());
  const leave = useCallback(() => {
    const plan = planLeave({ origin: takeRequestOrigin(), focused: focusedRef.current });
    navigation.popTo('Home');
    if (!plan.drawerRoute) return;
    try {
      drawerRef.current?.navigate(plan.drawerRoute);
    } catch {
      // The origin is only a courtesy: staying on Home is a valid result.
    }
  }, [navigation, takeRequestOrigin]);

  // The origin only matters while this screen is in front: if the driver moves to another screen, drop it.
  const wasFocusedRef = useRef(false);
  useEffect(() => {
    if (isFocused) wasFocusedRef.current = true;
    else if (wasFocusedRef.current) takeRequestOrigin();
  }, [isFocused, takeRequestOrigin]);

  // AI-assisted: see docs/AI_LOG.md #49
  // While open (focused or hidden behind another tab) the request id is published, so the bottom
  // card stays out of the way; it is withdrawn when this screen goes away.
  const openId = request?.id ?? null;
  useEffect(() => {
    if (openId == null) return undefined;
    setRequestScreenId(openId);
    return () => setRequestScreenId((current) => (current === openId ? null : current));
  }, [openId, setRequestScreenId]);

  // The request was resolved elsewhere (cancelled, taken, cleared) while this screen is hidden:
  // close it inside its own stack. No tab change, no notice, no reject. Not when it decided itself
  // (an accept in flight finishes through pendingExit).
  useEffect(() => {
    if (isFocused || !released || decided) return;
    decidedRef.current = true;
    leave();
  }, [isFocused, released, decided, leave]);

  // AI-assisted: see docs/AI_LOG.md #48
  const exitOrDefer = useCallback(
    (kind) => {
      if (!focusedRef.current) {
        setPendingExit(kind);
        return;
      }
      if (kind === 'trip') {
        takeRequestOrigin(); // accepted: the trip screen is shown, there is no screen to return to
        navigation.replace('TripActive');
      } else leave();
    },
    [navigation, leave, takeRequestOrigin],
  );

  useEffect(() => {
    if (!isFocused || !pendingExit) return;
    setPendingExit(null);
    if (pendingExit === 'trip') {
      takeRequestOrigin();
      navigation.replace('TripActive');
    } else leave();
  }, [isFocused, pendingExit, navigation, leave, takeRequestOrigin]);

  // Expired: reject quietly (the passenger side already dropped it), show the notice, then Home.
  const [expiredShown, setExpiredShown] = useState(false);
  useEffect(() => {
    if (!isFocused || !expired || expiredShown) return;
    setExpiredShown(true);
    decidedRef.current = true;
    // AI-assisted: see docs/AI_LOG.md #44 (5e: silent reject on expiry)
    // AI-assisted: see docs/AI_LOG.md #48 (a slot already released was resolved elsewhere: no second reject)
    if (!released) {
      rejectRequest(request.id).catch(() => {});
      clearPendingRequest(request.id);
    }
  }, [isFocused, expired, released, expiredShown, request, clearPendingRequest]);

  useEffect(() => {
    if (!isFocused || !expiredShown) return undefined;
    const id = setTimeout(leave, EXPIRED_NOTICE_MS);
    return () => clearTimeout(id);
  }, [isFocused, expiredShown, leave]);

  // Leaving the card without a decision rejects the request (errors ignored: it expires anyway).
  const requestRef = useRef(request);
  useEffect(
    () => () => {
      const current = requestRef.current;
      // AI-assisted: see docs/AI_LOG.md #48 (hidden: the request was resolved elsewhere)
      if (!current || decidedRef.current || !focusedRef.current) return;
      decidedRef.current = true;
      rejectRequest(current.id).catch(() => {});
      clearPendingRequest(current.id);
      // Closed with Back or a gesture: still return to the screen the tap came from (D-149).
      const origin = takeRequestOrigin();
      if (!origin) return;
      try {
        drawerRef.current?.navigate(origin);
      } catch {
        // Staying where the navigator left the driver is a valid result.
      }
    },
    [clearPendingRequest, takeRequestOrigin],
  );

  const fare = useMemo(() => (request ? fareOf(request) : null), [request]);

  const toPickup = useMemo(() => {
    if (!request || !driverPosition) return null;
    const meters = haversineDistanceM(toLngLat(driverPosition), toLngLat(request.origin));
    const seconds = meters / (SIMULATED_SPEED_KMH / 3.6);
    return fillLabel(labels.trip.toPickup, { km: formatKmFromMeters(meters), min: formatMinutesFromSeconds(seconds) });
  }, [request, driverPosition]);

  const goHome = leave;

  const handleAccept = useCallback(async () => {
    if (!request || working || decidedRef.current || expired) return;
    markDecided(true);
    setWorking(true);
    setError(null);
    try {
      const trip = await acceptRequest(request.id);
      clearPendingRequest(request.id);
      if (!mountedRef.current) return;
      startTrip(trip);
      exitOrDefer('trip');
    } catch (cause) {
      if (!mountedRef.current) return;
      const gone =
        cause?.code === PASSENGER_API_ERROR.ALREADY_TAKEN || cause?.code === PASSENGER_API_ERROR.EXPIRED;
      if (gone) clearPendingRequest(request.id);
      else markDecided(false); // network or other: the driver may try again before it expires
      setError({ message: errorMessage(cause), gone });
      setWorking(false);
    }
  }, [request, working, expired, markDecided, clearPendingRequest, startTrip, exitOrDefer]);

  const handleReject = useCallback(async () => {
    if (!request || working || decidedRef.current || expired) return;
    markDecided(true);
    setWorking(true);
    try {
      await rejectRequest(request.id);
    } catch {
      // The request expires by itself on the passenger side; the driver still goes back to Home.
    }
    clearPendingRequest(request.id);
    if (mountedRef.current) exitOrDefer('leave');
  }, [request, working, expired, markDecided, clearPendingRequest, exitOrDefer]);

  let body;
  if (!request) {
    body = (
      <View style={styles.centered}>
        <Text style={styles.body}>{labels.trip.noRequest}</Text>
        <SecondaryButton testID="trip-request-home" label={labels.trip.backToHome} onPress={goHome} />
      </View>
    );
  } else if (expiredShown) {
    body = (
      <View testID="trip-request-expired" style={styles.centered} accessibilityLiveRegion="assertive">
        <Icon name="time-outline" size={iconSize.lg} tint={color.textMuted} />
        <Text style={styles.title}>{labels.trip.expired}</Text>
        <Text style={styles.muted}>{labels.trip.backingHome}</Text>
      </View>
    );
  } else {
    const rating = typeof request.passenger?.rating === 'number' ? formatRating(request.passenger.rating) : null;
    const categoryLabel = labels.registration.vehicleCategory[request.category] ?? request.category;
    const paymentLabel = labels.trip.paymentMethod[paymentLabelKey({ method: request.paymentMethod })] ?? request.paymentMethod;
    const urgent = secondsLeft <= URGENT_SECONDS;
    const progress = Math.min(1, secondsLeft / totalSeconds);
    body = (
      <>
        <ScrollView contentContainerStyle={styles.content}>
          {/* AI-assisted: see docs/AI_LOG.md #54 (price first: earnings is the largest figure, fare and commission compact below it) */}
          {fare ? (
            <View style={styles.price}>
              <Card
                variant="status"
                tone="brand"
                testID="trip-request-net"
                style={styles.earnings}
                accessible
                accessibilityLabel={`${labels.trip.net}: ${formatCop(fare.driverEarnings)}`}
              >
                <Text style={styles.earningsLabel}>{labels.trip.net}</Text>
                <Text maxFontSizeMultiplier={maxFontScale} style={styles.earningsValue}>{formatCop(fare.driverEarnings)}</Text>
              </Card>
              <View style={styles.fareRow}>
                <FareFigure label={labels.trip.fare} value={formatCop(fare.fare)} />
                <FareFigure
                  label={fillLabel(labels.trip.commission, { pct: commissionPercent(COMMISSION_RATE) })}
                  value={`- ${formatCop(fare.commission)}`}
                />
              </View>
            </View>
          ) : null}
          <Card style={styles.card}>
            <View style={styles.headerRow}>
              <View style={styles.badge}>
                <Icon name="person" size={iconSize.lg} tint={color.onPrimarySoft} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.caption}>{labels.trip.passenger}</Text>
                <Text testID="trip-request-passenger" style={styles.title} numberOfLines={2} ellipsizeMode="tail">
                  {request.passenger?.name}
                </Text>
              </View>
              {rating ? (
                <Text
                  style={[styles.body, type.numeric]}
                  accessibilityLabel={fillLabel(labels.trip.ratingA11y, { rating })}
                >
                  {fillLabel(labels.trip.rating, { rating })}
                </Text>
              ) : null}
            </View>

            <View style={styles.stop}>
              <Icon name="radio-button-on" size={iconSize.lg} tint={color.primary} />
              <View style={[styles.block, styles.flex]}>
                <Text style={styles.caption}>{labels.trip.pickup}</Text>
                <Text style={styles.body}>{addresses.origin}</Text>
                {toPickup ? <Text style={[styles.muted, type.numeric]}>{toPickup}</Text> : null}
              </View>
            </View>

            <View style={styles.stop}>
              <Icon name="location" size={iconSize.lg} tint={color.text} />
              <View style={[styles.block, styles.flex]}>
                <Text style={styles.caption}>{labels.trip.destination}</Text>
                <Text style={styles.body}>{addresses.destination}</Text>
                <Text style={[styles.muted, type.numeric]}>
                  {fillLabel(labels.trip.tripLength, {
                    km: formatKm(request.distanceKm),
                    min: String(Math.max(1, Math.round(request.durationMin))),
                  })}
                </Text>
              </View>
            </View>

            <View>
              <Row label={labels.trip.category} value={categoryLabel} />
              <Row label={labels.trip.payment} value={paymentLabel} last />
            </View>
          </Card>
        </ScrollView>

        <View style={styles.actions}>
          {/* AI-assisted: see docs/AI_LOG.md #44 */}
          {!error?.gone ? (
            <>
            <View
              testID="trip-request-countdown"
              style={styles.countdown}
              accessible
              accessibilityLabel={fillLabel(labels.trip.countdownA11y, { s: secondsLeft })}
            >
              {/* AI-assisted: see docs/AI_LOG.md #65 (H-1: non-color urgent cue; the slot is always reserved, so nothing jumps) */}
              <View style={styles.countdownRow}>
                <View style={[styles.urgentSlot, { width: urgentIconSize, height: urgentIconSize }]}>
                  {urgent ? <Icon name="alarm-outline" size={urgentIconSize} tint={color.danger} /> : null}
                </View>
                <Text
                  maxFontSizeMultiplier={maxFontScale}
                  style={[styles.countdownText, urgent && styles.countdownTextUrgent]}
                >
                  {fillLabel(labels.trip.countdown, { s: secondsLeft })}
                </Text>
              </View>
              <View style={styles.track}>
                <View style={[styles.fill, urgent && styles.fillUrgent, { flex: progress }]} />
                <View style={{ flex: 1 - progress }} />
              </View>
            </View>
            <View style={styles.announcer} accessibilityLiveRegion="polite">
              <Text>{countdownAnnouncement(secondsLeft, labels.trip.countdownA11y)}</Text>
            </View>
            </>
          ) : null}
          {error ? (
            <Card variant="status" tone="danger" style={styles.errorCard}>
              <Icon name="alert-circle" size={iconSize.md} tint={color.onDangerSoft} />
              <Text testID="trip-request-error" style={styles.error} accessibilityLiveRegion="polite">
                {error.message}
              </Text>
            </Card>
          ) : null}
          {working ? <Text style={styles.muted}>{labels.trip.working}</Text> : null}
          {error?.gone ? (
            <SecondaryButton testID="trip-request-home" label={labels.trip.backToHome} onPress={goHome} />
          ) : (
            <>
              <PrimaryButton
                testID="trip-request-accept"
                label={labels.trip.accept}
                accessibilityHint={labels.trip.acceptHint}
                onPress={handleAccept}
                disabled={working}
              />
              <SecondaryButton
                testID="trip-request-reject"
                label={labels.trip.reject}
                accessibilityHint={labels.trip.rejectHint}
                onPress={handleReject}
                disabled={working}
              />
            </>
          )}
        </View>
      </>
    );
  }

  return (
    <SafeAreaView testID="screen-trip-request" edges={SAFE_EDGES} style={styles.screen}>
      <ScreenHeader title={labels.trip.requestTitle} leading={null} />
      {body}
    </SafeAreaView>
  );
}

// AI-assisted: see docs/AI_LOG.md #54
// Compact secondary figure (fare, commission) shown under the earnings figure.
function FareFigure({ label, value }) {
  return (
    <View style={styles.flex} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={styles.caption}>{label}</Text>
      <Text maxFontSizeMultiplier={maxFontScale} style={[styles.body, type.numeric]}>{value}</Text>
    </View>
  );
}

function Row({ label, value, last = false }) {
  return (
    <View accessible accessibilityLabel={`${label}: ${value}`}>
      <DataRow label={label} value={value} last={last} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: color.bg,
  },
  flex: {
    flex: 1,
  },
  // AI-assisted: see docs/AI_LOG.md #54 (compact paddings so the price block fits above the fold at 130 % font)
  content: {
    gap: space[3],
    paddingHorizontal: space[4],
    paddingVertical: space[3],
  },
  price: {
    gap: space[2],
  },
  fareRow: {
    flexDirection: 'row',
    gap: space[3],
    paddingHorizontal: space[1],
  },
  card: {
    gap: space[3],
    padding: space[3],
  },
  badge: {
    width: badgeSize,
    height: badgeSize,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: color.primarySoft,
  },
  stop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space[3],
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space[2],
    padding: space[3],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  block: {
    gap: space[1],
  },
  earnings: {
    gap: space[1],
    padding: space[3],
  },
  earningsLabel: {
    ...type.label,
    color: color.onPrimarySoft,
  },
  earningsValue: {
    ...type.display,
    ...type.numeric,
    color: color.primary,
  },
  title: {
    ...type.title,
    color: color.text,
  },
  body: {
    ...type.body,
    color: color.text,
  },
  caption: {
    ...type.caption,
    color: color.textMuted,
  },
  muted: {
    ...type.body,
    color: color.textMuted,
  },
  // Visually hidden live region: the screen reader hears the countdown only at 10, 5 and 0 s.
  announcer: {
    position: 'absolute',
    width: borderWidth.thin,
    height: borderWidth.thin,
    overflow: 'hidden',
    opacity: 0,
  },
  // AI-assisted: see docs/AI_LOG.md #64 (D-150): the countdown is text plus a thin bar, no filled block, so it
  // never looks like a button. The "Aceptar" button stays the only filled control. In the last 10 s the text
  // and the bar turn color.danger (AA on surface, no fill).
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
    gap: touch.gap,
    paddingHorizontal: space[4],
    paddingVertical: space[3],
    backgroundColor: color.surface,
  },
  error: {
    flex: 1,
    ...type.body,
    color: color.onDangerSoft,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    gap: space[3],
    paddingHorizontal: space[4],
  },
});

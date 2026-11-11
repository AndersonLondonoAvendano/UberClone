// AI-assisted: see docs/AI_LOG.md #45 (popTo('Home'): navigate pushes a second Home in React Navigation 7, leaving this screen mounted)
// AI-assisted: see docs/AI_LOG.md #18
// AI-assisted: see docs/AI_LOG.md #43
// AI-assisted: see docs/AI_LOG.md #48
// The drawer keeps this screen mounted when the driver switches tab, so it acts only while focused:
// timers, the quiet reject, leaving and the accept navigation wait for focus. A request resolved
// elsewhere (the bottom card) is never rejected or left again from a hidden screen.
// Incoming request card (T-43). Opened by Home when a request arrives while the driver is available.
// Shows the passenger, the distance and time to the pickup (straight line from the driver position),
// the trip length, category, payment, the fare split from calculateFare and a countdown to expiresAt.
// One request at a time: the card keeps the request it opened with. When it expires (or the slot
// is released without a decision) it shows "La solicitud venció" and goes back to Home.
// Accept -> acceptRequest -> the trip starts (TripContext) -> TripActive. Reject -> Home.
// Leaving the card without deciding rejects the request. Errors are inline text, never Alert.
//
// AI-assisted: see docs/AI_LOG.md #44
// The two numbers the driver decides with are the loudest things on screen: "Tu ganancia" in
// type.display and color.primary inside the card, and the countdown fixed above the buttons (never
// scrolled away), also display/primary with a draining bar. In the last 10 s the countdown block
// fills with color.primary (emphasis, never red). An expired request is rejected quietly and
// shows one text, labels.trip.expired. No borders or dividers: surface steps and space only.

import { useIsFocused } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SecondaryButton } from '../../components/SecondaryButton';
import { SIMULATED_SPEED_KMH } from '../../config/location';
import { COMMISSION_RATE } from '../../config/pricing';
import { EXPIRED_NOTICE_MS } from '../../config/trip';
import { labels } from '../../constants/labels';
import { useAvailability } from '../../context/AvailabilityContext';
import { useTrip } from '../../context/TripContext';
import { PASSENGER_API_ERROR, acceptRequest, rejectRequest } from '../../services/passengerApi';
import { haversineDistanceM } from '../../services/routing/straightLine';
// AI-assisted: see docs/AI_LOG.md #47
import { requestTotalSeconds, secondsUntil } from '../../services/trip/requestPresentation';
import { color, radius, space, touch, type } from '../../theme/tokens';
import { calculateFare, commissionPercent } from '../../utils/fare';
import { fillLabel, formatCop, formatKm, formatKmFromMeters, formatMinutesFromSeconds } from '../../utils/format';

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

export function TripRequestScreen({ navigation, route }) {
  const { pendingRequest, clearPendingRequest, getDriverPosition } = useAvailability();
  const { startTrip } = useTrip();
  // The card keeps the request it opened with; a later one never replaces it.
  const [request] = useState(() => pendingRequest);
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

  const secondsLeft = request ? secondsUntil(request.expiresAt, now) : 0;
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

  // AI-assisted: see docs/AI_LOG.md #47
  // Every exit goes through here. Opened from the bottom card, the driver returns to the drawer
  // screen they were on; otherwise to Home (popTo: navigate would push a second Home).
  const originRoute = route?.params?.originRoute;
  const leave = useCallback(() => {
    const drawer = navigation.getParent();
    navigation.popTo('Home');
    if (originRoute && originRoute !== 'Home') drawer?.navigate(originRoute);
  }, [navigation, originRoute]);

  // AI-assisted: see docs/AI_LOG.md #48
  const exitOrDefer = useCallback(
    (kind) => {
      if (!focusedRef.current) {
        setPendingExit(kind);
        return;
      }
      if (kind === 'trip') navigation.replace('TripActive');
      else leave();
    },
    [navigation, leave],
  );

  useEffect(() => {
    if (!isFocused || !pendingExit) return;
    setPendingExit(null);
    if (pendingExit === 'trip') navigation.replace('TripActive');
    else leave();
  }, [isFocused, pendingExit, navigation, leave]);

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
    },
    [clearPendingRequest],
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
        <Text style={styles.title}>{labels.trip.expired}</Text>
        <Text style={styles.muted}>{labels.trip.backingHome}</Text>
      </View>
    );
  } else {
    const rating = typeof request.passenger?.rating === 'number' ? formatRating(request.passenger.rating) : null;
    const categoryLabel = labels.registration.vehicleCategory[request.category] ?? request.category;
    const paymentLabel = labels.trip.paymentMethod[request.paymentMethod] ?? request.paymentMethod;
    const urgent = secondsLeft <= URGENT_SECONDS;
    const progress = Math.min(1, secondsLeft / totalSeconds);
    body = (
      <>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <View style={styles.headerRow}>
              <View style={styles.flex}>
                <Text style={styles.caption}>{labels.trip.passenger}</Text>
                <Text testID="trip-request-passenger" style={styles.title}>
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

            <View style={styles.block}>
              <Text style={styles.caption}>{labels.trip.pickup}</Text>
              <Text style={styles.body}>{request.origin.address}</Text>
              {toPickup ? <Text style={[styles.muted, type.numeric]}>{toPickup}</Text> : null}
            </View>

            <View style={styles.block}>
              <Text style={styles.caption}>{labels.trip.destination}</Text>
              <Text style={styles.body}>{request.destination.address}</Text>
              <Text style={[styles.muted, type.numeric]}>
                {fillLabel(labels.trip.tripLength, {
                  km: formatKm(request.distanceKm),
                  min: String(Math.max(1, Math.round(request.durationMin))),
                })}
              </Text>
            </View>

            <View style={styles.section}>
              <Row label={labels.trip.category} value={categoryLabel} />
              <Row label={labels.trip.payment} value={paymentLabel} />
              {fare ? (
                <>
                  <Row label={labels.trip.fare} value={formatCop(fare.fare)} numeric />
                  <Row
                    label={fillLabel(labels.trip.commission, { pct: commissionPercent(COMMISSION_RATE) })}
                    value={`- ${formatCop(fare.commission)}`}
                    numeric
                  />
                </>
              ) : null}
            </View>

            {fare ? (
              <View
                testID="trip-request-net"
                style={styles.earnings}
                accessible
                accessibilityLabel={`${labels.trip.net}: ${formatCop(fare.driverEarnings)}`}
              >
                <Text style={styles.earningsLabel}>{labels.trip.net}</Text>
                <Text style={styles.earningsValue}>{formatCop(fare.driverEarnings)}</Text>
              </View>
            ) : null}
          </View>
        </ScrollView>

        <View style={styles.actions}>
          {/* AI-assisted: see docs/AI_LOG.md #44 */}
          {!error?.gone ? (
            <View
              testID="trip-request-countdown"
              style={[styles.countdown, urgent && styles.countdownUrgent]}
              accessible
              accessibilityLabel={fillLabel(labels.trip.countdownA11y, { s: secondsLeft })}
              accessibilityLiveRegion={urgent ? 'assertive' : 'none'}
            >
              <Text style={[styles.countdownText, urgent && styles.countdownTextUrgent]}>
                {fillLabel(labels.trip.countdown, { s: secondsLeft })}
              </Text>
              <View style={[styles.track, urgent && styles.trackUrgent]}>
                <View style={[styles.fill, urgent && styles.fillUrgent, { flex: progress }]} />
                <View style={{ flex: 1 - progress }} />
              </View>
            </View>
          ) : null}
          {error ? (
            <Text testID="trip-request-error" style={styles.error} accessibilityLiveRegion="polite">
              {error.message}
            </Text>
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

function Row({ label, value, numeric = false }) {
  return (
    <View style={styles.row} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={styles.body}>{label}</Text>
      <Text style={[styles.body, numeric && type.numeric]}>{value}</Text>
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
  content: {
    gap: space[4],
    paddingHorizontal: space[4],
    paddingVertical: space[4],
  },
  // AI-assisted: see docs/AI_LOG.md #44 (radius.md, no border, no dividers)
  card: {
    gap: space[3],
    padding: space[4],
    backgroundColor: color.surface,
    borderRadius: radius.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  block: {
    gap: space[1],
  },
  section: {
    marginTop: space[2],
  },
  earnings: {
    marginTop: space[2],
    gap: space[1],
  },
  earningsLabel: {
    ...type.label,
    color: color.textMuted,
  },
  earningsValue: {
    ...type.display,
    ...type.numeric,
    color: color.primary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: space[3],
    minHeight: touch.min,
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
  // The countdown lives in the action bar; in the last 10 s the block fills with color.primary.
  countdown: {
    gap: space[2],
    paddingVertical: space[2],
    paddingHorizontal: space[3],
    borderRadius: radius.md,
    backgroundColor: color.surface,
  },
  countdownUrgent: {
    backgroundColor: color.primary,
  },
  countdownText: {
    ...type.display,
    ...type.numeric,
    color: color.primary,
    textAlign: 'center',
  },
  countdownTextUrgent: {
    color: color.onPrimary,
  },
  track: {
    flexDirection: 'row',
    height: space[1],
    borderRadius: radius.full,
    overflow: 'hidden',
    backgroundColor: color.bg,
  },
  // AI-assisted: see docs/AI_LOG.md #44 (on color.primary: onPrimary fill over a primary track, no opacity)
  trackUrgent: {
    backgroundColor: color.primary,
  },
  fill: {
    backgroundColor: color.primary,
  },
  fillUrgent: {
    backgroundColor: color.onPrimary,
  },
  actions: {
    gap: touch.gap,
    paddingHorizontal: space[4],
    paddingVertical: space[3],
    backgroundColor: color.surface,
  },
  error: {
    ...type.body,
    color: color.danger,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    gap: space[3],
    paddingHorizontal: space[4],
  },
});

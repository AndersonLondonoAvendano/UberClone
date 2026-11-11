// AI-assisted: see docs/AI_LOG.md #45 (popTo('Home'): navigate pushes a second Home in React Navigation 7, leaving this screen mounted)
// AI-assisted: see docs/AI_LOG.md #18
// AI-assisted: see docs/AI_LOG.md #43
// Trip summary (T-45). Shown after the final status reached the passenger API. The distance, duration and
// fare split come from the accepted request through calculateFare, so the amounts match the request
// card the driver accepted. Nothing is saved (no Firestore): the summary lives only on this screen.
//
// AI-assisted: see docs/AI_LOG.md #44
// The trip is released (endTrip) only when this screen unmounts, never before navigating: the summary
// keeps the last trip it saw, so "no hay un viaje" never flashes on the way out. "Tu ganancia" is
// the one number the driver came for: type.display in color.primary. No borders or dividers: the
// card is a surface step over the background and the totals are separated by space only.

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { COMMISSION_RATE } from '../../config/pricing';
import { labels } from '../../constants/labels';
import { useTrip } from '../../context/TripContext';
import { color, radius, space, touch, type } from '../../theme/tokens';
import { calculateFare, commissionPercent } from '../../utils/fare';
import { fillLabel, formatClock, formatCop, formatKm } from '../../utils/format';

const SAFE_EDGES = ['top', 'bottom'];

function fareOf(request) {
  try {
    return calculateFare({ distanceKm: request.distanceKm, durationMin: request.durationMin, category: request.category });
  } catch {
    return null;
  }
}

export function TripSummaryScreen({ navigation }) {
  const { trip, endTrip } = useTrip();
  // AI-assisted: see docs/AI_LOG.md #44 (keeps the last trip while leaving)
  const shownRef = useRef(null);
  if (trip?.request) shownRef.current = { request: trip.request, finishedAt: trip.finishedAt ?? null };
  const shown = shownRef.current;
  const request = shown?.request ?? null;
  const fare = useMemo(() => (request ? fareOf(request) : null), [request]);

  // Leaving the summary in any way (button or back) releases the trip and resumes availability.
  useEffect(() => endTrip, [endTrip]);

  const goHome = useCallback(() => navigation.popTo('Home'), [navigation]);

  return (
    <SafeAreaView testID="screen-trip-summary" edges={SAFE_EDGES} style={styles.screen}>
      <ScreenHeader title={labels.trip.summaryTitle} leading={null} />
      {request ? (
        <ScrollView contentContainerStyle={styles.content}>
          {fare ? (
            <View
              testID="trip-summary-net"
              style={styles.earnings}
              accessible
              accessibilityLabel={`${labels.trip.net}: ${formatCop(fare.driverEarnings)}`}
            >
              <Text style={styles.earningsLabel}>{labels.trip.net}</Text>
              <Text style={styles.earningsValue}>{formatCop(fare.driverEarnings)}</Text>
            </View>
          ) : null}
          <View style={styles.card}>
            <Row label={labels.trip.passenger} value={request.passenger?.name ?? ''} />
            {shown.finishedAt ? <Row label={labels.trip.finishedAt} value={formatClock(shown.finishedAt)} numeric /> : null}
            <Row
              label={labels.trip.distance}
              value={fillLabel(labels.trip.kmValue, { km: formatKm(request.distanceKm) })}
              numeric
            />
            <Row
              label={labels.trip.duration}
              value={fillLabel(labels.trip.minValue, { min: Math.max(1, Math.round(request.durationMin)) })}
              numeric
            />
            {fare ? (
              <View style={styles.totals}>
                <Row label={labels.trip.fare} value={formatCop(fare.fare)} numeric />
                <Row
                  label={fillLabel(labels.trip.commission, { pct: commissionPercent(COMMISSION_RATE) })}
                  value={`- ${formatCop(fare.commission)}`}
                  numeric
                />
              </View>
            ) : null}
          </View>
          <Text style={styles.muted}>{labels.trip.notSaved}</Text>
        </ScrollView>
      ) : (
        <View style={styles.centered}>
          <Text style={styles.body}>{labels.trip.noTrip}</Text>
        </View>
      )}
      <View style={styles.actions}>
        <PrimaryButton testID="trip-summary-home" label={labels.trip.backToHome} onPress={goHome} />
      </View>
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
  content: {
    gap: space[3],
    paddingHorizontal: space[4],
    paddingVertical: space[4],
  },
  // AI-assisted: see docs/AI_LOG.md #44
  earnings: {
    gap: space[1],
    paddingVertical: space[3],
    paddingHorizontal: space[4],
    backgroundColor: color.surface,
    borderRadius: radius.md,
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
  card: {
    gap: space[2],
    padding: space[4],
    backgroundColor: color.surface,
    borderRadius: radius.md,
  },
  totals: {
    marginTop: space[4],
    gap: space[2],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: space[3],
    minHeight: touch.min,
  },
  body: {
    ...type.body,
    color: color.text,
  },
  muted: {
    ...type.caption,
    color: color.textMuted,
  },
  actions: {
    paddingHorizontal: space[4],
    paddingVertical: space[3],
    backgroundColor: color.surface,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: space[4],
  },
});

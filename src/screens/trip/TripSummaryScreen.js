// AI-assisted: see docs/AI_LOG.md #45 (popTo('Home'): navigate pushes a second Home in React Navigation 7, leaving this screen mounted)
// AI-assisted: see docs/AI_LOG.md #18
// AI-assisted: see docs/AI_LOG.md #43
// Trip summary (T-45). Shown after the final status reached the passenger API. The distance, duration and
// fare split come from the accepted request through calculateFare, so the amounts match the request
// card the driver accepted.
//
// AI-assisted: see docs/AI_LOG.md #50
// "Confirmar cobro" saves the trip in drivers/{uid}/trips/{tripId} (the payment is SIMULATED, no gateway).
// A failed save shows the error with "Reintentar" and a safe exit ("Volver a Inicio sin guardar", with an
// inline confirmation, no Alert): the driver is never trapped. The same save is idempotent by trip id.
//
// AI-assisted: see docs/AI_LOG.md #44
// The trip is released (endTrip) only when this screen unmounts, never before navigating: the summary
// keeps the last trip it saw, so "no hay un viaje" never flashes on the way out. "Tu ganancia" is
// the one number the driver came for: type.display in color.primary. No borders or dividers: the
// card is a surface step over the background and the totals are separated by space only.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { COMMISSION_RATE } from '../../config/pricing';
import { labels } from '../../constants/labels';
import { useAppState } from '../../context/AppStateContext';
import { useTrip } from '../../context/TripContext';
import { classifySaveError, SAVE_ERROR } from '../../services/trip/saveRetry';
import { buildTripRecord, paymentMethodOf, SAVED_PAYMENT, SAVED_STATUS } from '../../services/trip/tripRecord';
import { saveTrip } from '../../services/tripRepository';
import { color, radius, space, touch, type } from '../../theme/tokens';
import { calculateFare, commissionPercent } from '../../utils/fare';
import { fillLabel, formatClock, formatCop, formatKm } from '../../utils/format';
import { maskEmail } from '../../utils/mask';

const SAFE_EDGES = ['top', 'bottom'];

const SAVE = { IDLE: 'idle', SAVING: 'saving', SAVED: 'saved', ERROR: 'error' };
const ERROR_COPY = {
  [SAVE_ERROR.OFFLINE]: 'saveErrorNetwork',
  [SAVE_ERROR.TIMEOUT]: 'saveErrorTimeout',
  [SAVE_ERROR.DENIED]: 'saveErrorDenied',
  [SAVE_ERROR.UNKNOWN]: 'saveErrorGeneric',
};

function fareOf(request) {
  try {
    return calculateFare({ distanceKm: request.distanceKm, durationMin: request.durationMin, category: request.category });
  } catch {
    return null;
  }
}

export function TripSummaryScreen({ navigation }) {
  const { trip, endTrip } = useTrip();
  const { driverId, driverProfile } = useAppState();
  // AI-assisted: see docs/AI_LOG.md #44 (keeps the last trip while leaving)
  const shownRef = useRef(null);
  if (trip?.request) shownRef.current = {
      tripId: trip.tripId,
      request: trip.request,
      finishedAt: trip.finishedAt ?? null,
      startedAt: trip.startedAt ?? null,
    };
  const shown = shownRef.current;
  const request = shown?.request ?? null;
  const fare = useMemo(() => (request ? fareOf(request) : null), [request]);

  // Leaving the summary in any way (button or back) releases the trip and resumes availability.
  useEffect(() => endTrip, [endTrip]);

  const goHome = useCallback(() => navigation.popTo('Home'), [navigation]);

  // AI-assisted: see docs/AI_LOG.md #50
  const [save, setSave] = useState({ state: SAVE.IDLE, kind: null });
  const [confirmingLeave, setConfirmingLeave] = useState(false);
  const scrollRef = useRef(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const confirmCharge = useCallback(async () => {
    if (!shown || !fare || !driverId || save.state === SAVE.SAVING) return;
    setSave({ state: SAVE.SAVING, kind: null });
    try {
      const record = buildTripRecord({
        driverId,
        tripId: shown.tripId,
        request: shown.request,
        status: SAVED_STATUS.COMPLETED,
        startedAt: shown.startedAt,
        finishedAt: shown.finishedAt ?? Date.now(),
      });
      await saveTrip(driverId, shown.tripId, record);
      if (mounted.current) setSave({ state: SAVE.SAVED, kind: null });
    } catch (error) {
      if (mounted.current) setSave({ state: SAVE.ERROR, kind: classifySaveError(error) });
    }
  }, [shown, fare, driverId, save.state]);

  const payment = request ? paymentMethodOf(request) : SAVED_PAYMENT.NONE;
  const maskedEmail = maskEmail(driverProfile?.documents?.mercadoPagoEmail);
  const paymentText =
    payment === SAVED_PAYMENT.CASH
      ? labels.trip.paymentCash
      : maskedEmail
        ? fillLabel(labels.trip.paymentTransfer, { email: maskedEmail })
        : labels.trip.paymentTransferNoEmail;
  const saved = save.state === SAVE.SAVED;
  const saving = save.state === SAVE.SAVING;

  return (
    <SafeAreaView testID="screen-trip-summary" edges={SAFE_EDGES} style={styles.screen}>
      <ScreenHeader title={labels.trip.summaryTitle} leading={null} />
      {request ? (
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          onContentSizeChange={() => {
            if (confirmingLeave) scrollRef.current?.scrollToEnd({ animated: true });
          }}
        >
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
          <View style={styles.card} testID="trip-summary-payment">
            <Text style={styles.sectionTitle} accessibilityRole="header">
              {labels.trip.paymentTitle}
            </Text>
            <Text style={styles.body}>{paymentText}</Text>
            <Text style={styles.muted}>{labels.trip.paymentSimulated}</Text>
            {saving ? (
              <Text testID="trip-summary-saving" style={styles.body} accessibilityLiveRegion="polite">
                {labels.trip.saving}
              </Text>
            ) : null}
            {saved ? (
              <Text testID="trip-summary-saved" style={styles.success} accessibilityLiveRegion="polite">
                {labels.trip.saved}
              </Text>
            ) : null}
            {!fare || !driverId ? (
              <Text testID="trip-summary-unavailable" style={styles.error} accessibilityLiveRegion="assertive">
                {labels.trip.saveUnavailable}
              </Text>
            ) : null}
            {save.state === SAVE.ERROR ? (
              <Text testID="trip-summary-save-error" style={styles.error} accessibilityLiveRegion="assertive">
                {labels.trip[ERROR_COPY[save.kind] ?? 'saveErrorGeneric']}
              </Text>
            ) : null}
          </View>
          {confirmingLeave ? (
            <View style={styles.card} testID="trip-summary-leave-confirm">
              <Text style={styles.sectionTitle} accessibilityRole="header">
                {labels.trip.leaveQuestion}
              </Text>
              <Text style={styles.body}>{labels.trip.leaveMessage}</Text>
              <SecondaryButton testID="trip-summary-leave-yes" label={labels.trip.leaveConfirm} variant="danger" onPress={goHome} />
              <SecondaryButton
                testID="trip-summary-leave-no"
                label={labels.trip.leaveKeep}
                onPress={() => setConfirmingLeave(false)}
              />
            </View>
          ) : null}
        </ScrollView>
      ) : (
        <View style={styles.centered}>
          <Text style={styles.body}>{labels.trip.noTrip}</Text>
        </View>
      )}
      <View style={styles.actions}>
        {saved || !request ? (
          <PrimaryButton testID="trip-summary-home" label={labels.trip.backToHome} onPress={goHome} />
        ) : (
          <>
            <PrimaryButton
              testID="trip-summary-confirm"
              label={save.state === SAVE.ERROR ? labels.actions.retry : labels.trip.confirmCharge}
              onPress={confirmCharge}
              disabled={saving || !fare || !driverId}
              accessibilityHint={labels.trip.confirmChargeHint}
            />
            {!confirmingLeave ? (
              <SecondaryButton
                testID="trip-summary-leave"
                label={labels.trip.leaveUnsaved}
                onPress={() => setConfirmingLeave(true)}
              />
            ) : null}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

function Row({ label, value, numeric = false }) {
  return (
    <View style={styles.row} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={[styles.body, styles.rowLabel]}>{label}</Text>
      <Text style={[styles.body, styles.rowValue, numeric && type.numeric]}>{value}</Text>
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
  rowLabel: { flexShrink: 1 },
  rowValue: { flexShrink: 1, textAlign: 'right' },
  sectionTitle: {
    ...type.label,
    color: color.text,
  },
  success: {
    ...type.body,
    color: color.success,
  },
  error: {
    ...type.body,
    color: color.danger,
  },
  muted: {
    ...type.caption,
    color: color.textMuted,
  },
  actions: {
    gap: space[2],
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

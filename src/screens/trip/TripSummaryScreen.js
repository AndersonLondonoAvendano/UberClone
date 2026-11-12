// AI-assisted: see docs/AI_LOG.md #53 (presentation: phase chip, status cards, data rows)
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
import { AppState, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/Card';
import { Chip } from '../../components/Chip';
import { SkeletonBlock } from '../../components/ScreenState';
import { DataRow } from '../../components/DataRow';
import { Icon } from '../../components/Icon';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { BACKEND_URL } from '../../config/backend';
import { COMMISSION_RATE } from '../../config/pricing';
import { labels } from '../../constants/labels';
import { useAppState } from '../../context/AppStateContext';
import { useTrip } from '../../context/TripContext';
import { useTripPayment } from '../../hooks/useTripPayment';
import { requestCheckoutUrl, syncPayment } from '../../services/paymentsService';
import { createPaymentActions } from '../../services/trip/paymentActions';
import { PAYMENT_ACTION, PAYMENT_CHIP, paymentView } from '../../services/trip/paymentView';
import { TRIP_PAYMENT_ERROR } from '../../services/trip/tripPaymentSubscription';
import { classifySaveError, SAVE_ERROR } from '../../services/trip/saveRetry';
import { buildTripRecord, paymentMethodOf, SAVED_PAYMENT, SAVED_STATUS } from '../../services/trip/tripRecord';
import { trackTripSave } from '../../services/trip/saveQueue';
import { confirmCashPayment, saveTrip } from '../../services/tripRepository';
import { color, iconSize, space, type } from '../../theme/tokens';
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

// AI-assisted: see docs/AI_LOG.md #55 (charge chip: text plus icon, never colour alone)
const CHIP_LOOK = {
  [PAYMENT_CHIP.APPROVED]: { tone: 'success', icon: 'checkmark-circle' },
  [PAYMENT_CHIP.PENDING]: { tone: 'warning', icon: 'time' },
  [PAYMENT_CHIP.REJECTED]: { tone: 'danger', icon: 'close-circle' },
  [PAYMENT_CHIP.CASH]: { tone: 'neutral', icon: 'cash' },
  [PAYMENT_CHIP.UNAVAILABLE]: { tone: 'neutral', icon: 'help-circle' },
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
      // AI-assisted: see docs/AI_LOG.md #55
      plannedRoute: trip.plannedRoute ?? null,
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
        route: shown.plannedRoute, // AI-assisted: see docs/AI_LOG.md #55
      });
      // AI-assisted: see docs/AI_LOG.md #54 (counted by the save queue so a session reset waits for it)
      await trackTripSave(() => saveTrip(driverId, shown.tripId, record));
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

  // AI-assisted: see docs/AI_LOG.md #55
  // The charge state exists only once the trip is saved; before that there is nothing to listen to.
  const { trip: savedTrip, loading: paymentLoading, error: paymentError } = useTripPayment(saved ? shown?.tripId : null);
  const view = paymentView(savedTrip);
  const chipLook = CHIP_LOOK[view.chip] ?? CHIP_LOOK[PAYMENT_CHIP.UNAVAILABLE];
  const needsBackend = view.actions.length > 0;
  const paymentIssue = paymentError
    ? paymentError === TRIP_PAYMENT_ERROR.OFFLINE
      ? labels.trip.paymentOffline
      : labels.trip.paymentError
    : needsBackend && !BACKEND_URL
      ? labels.trip.paymentBackendUnavailable
      : null;

  // AI-assisted: see docs/AI_LOG.md #55 (charge actions, T-97)
  // One runner per screen: it keeps a single request in flight. The card state is never set here: it only
  // changes when the backend writes the trip document and onSnapshot delivers it.
  const runner = useMemo(
    () => createPaymentActions({ requestCheckoutUrl, syncPayment, confirmCashPayment, openUrl: (url) => Linking.openURL(url) }),
    [],
  );
  const [action, setAction] = useState({ busy: null, error: null });
  const tripIdRef = useRef(null);
  const canSyncRef = useRef(false);
  const savedTripId = saved ? shown?.tripId ?? null : null;
  tripIdRef.current = savedTripId;
  canSyncRef.current = view.actions.includes(PAYMENT_ACTION.VERIFY);

  const runAction = useCallback(
    async (name) => {
      if (!tripIdRef.current || runner.isBusy()) return;
      setAction({ busy: name, error: null });
      const result = await runner.run(name, { uid: driverId, tripId: tripIdRef.current });
      if (!mounted.current || result.skipped) return;
      setAction({ busy: null, error: result.ok ? null : result.error });
    },
    [runner, driverId],
  );

  // Back from the browser: ask the backend to sync. The result is ignored on purpose (errors are silent and
  // success proves nothing); the document listener is the only source of the card state.
  useEffect(() => {
    if (!savedTripId) return undefined;
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'active' && canSyncRef.current && tripIdRef.current) {
        runner.run(PAYMENT_ACTION.VERIFY, { uid: driverId, tripId: tripIdRef.current });
      }
    });
    return () => subscription.remove();
  }, [savedTripId, runner, driverId]);

  const actionBusy = action.busy !== null;
  const actionError = action.error ? labels.trip.paymentActionError[action.error] : null;
  const cashCollected = savedTrip?.paymentMethod === 'cash' && view.actions.length === 0 && !paymentError;

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
          {/* AI-assisted: see docs/AI_LOG.md #53 */}
          {fare ? (
            <Card
              variant="status"
              tone="brand"
              testID="trip-summary-net"
              style={styles.earnings}
              accessible
              accessibilityLabel={`${labels.trip.net}: ${formatCop(fare.driverEarnings)}`}
            >
              <Text style={styles.earningsLabel}>{labels.trip.net}</Text>
              <Text style={styles.earningsValue}>{formatCop(fare.driverEarnings)}</Text>
            </Card>
          ) : null}
          <Card style={styles.card}>
            <Row label={labels.trip.passenger} value={request.passenger?.name ?? ''} />
            {shown.finishedAt ? <Row label={labels.trip.finishedAt} value={formatClock(shown.finishedAt)} /> : null}
            <Row
              label={labels.trip.distance}
              value={fillLabel(labels.trip.kmValue, { km: formatKm(request.distanceKm) })}
            />
            <Row
              label={labels.trip.duration}
              value={fillLabel(labels.trip.minValue, { min: Math.max(1, Math.round(request.durationMin)) })}
              last={!fare}
            />
            {fare ? (
              <>
                <Row label={labels.trip.fare} value={formatCop(fare.fare)} />
                <Row
                  label={fillLabel(labels.trip.commission, { pct: commissionPercent(COMMISSION_RATE) })}
                  value={`- ${formatCop(fare.commission)}`}
                  last
                />
              </>
            ) : null}
          </Card>
          <Card testID="trip-summary-payment" style={styles.card}>
            <Text style={styles.sectionTitle} accessibilityRole="header">
              {labels.trip.paymentTitle}
            </Text>
            <Text style={styles.body}>{paymentText}</Text>
            <View style={styles.noteRow}>
              <Icon name="information-circle" size={iconSize.md} tint={color.textMuted} />
              <Text style={[styles.muted, styles.flex]}>{labels.trip.paymentSimulated}</Text>
            </View>
            {saved ? (
              <View testID="trip-summary-payment-state" style={styles.paymentState}>
                <Text style={styles.sectionTitle} accessibilityRole="header">
                  {labels.trip.paymentStateTitle}
                </Text>
                {paymentLoading ? (
                  <View
                    testID="trip-summary-payment-loading"
                    accessible
                    accessibilityLabel={labels.trip.paymentLoading}
                    accessibilityLiveRegion="polite"
                  >
                    <SkeletonBlock height={space[6]} width="40%" />
                  </View>
                ) : paymentError ? null : (
                  <Chip
                    testID="trip-summary-payment-chip"
                    label={labels.trip.paymentChip[view.chip]}
                    tone={chipLook.tone}
                    icon={chipLook.icon}
                  />
                )}
                {paymentIssue ? (
                  <Card variant="status" tone={paymentError ? 'danger' : 'warning'} style={styles.statusCard}>
                    <Icon
                      name={paymentError === TRIP_PAYMENT_ERROR.OFFLINE ? 'cloud-offline' : 'alert-circle'}
                      size={iconSize.lg}
                      tint={paymentError ? color.onDangerSoft : color.onWarningSoft}
                    />
                    <View style={styles.flex}>
                      <Text
                        testID="trip-summary-payment-issue"
                        style={[styles.sectionTitle, paymentError ? styles.onDanger : styles.onWarning]}
                        accessibilityRole="header"
                        accessibilityLiveRegion="polite"
                      >
                        {paymentIssue.title}
                      </Text>
                      <Text style={[styles.body, paymentError ? styles.onDanger : styles.onWarning]}>
                        {paymentIssue.message}
                      </Text>
                    </View>
                  </Card>
                ) : null}
                {/* AI-assisted: see docs/AI_LOG.md #55 (charge actions, T-97) */}
                {!paymentLoading && !paymentError && view.actions.length > 0 ? (
                  <View testID="trip-summary-payment-actions" style={styles.paymentState}>
                    {savedTrip?.paymentMethod === 'mercadopago' ? (
                      <Text style={styles.muted}>{labels.trip.paymentCardNote}</Text>
                    ) : null}
                    {view.actions.map((name) => (
                      <SecondaryButton
                        key={name}
                        testID={`trip-summary-action-${name}`}
                        label={action.busy === name ? labels.trip.paymentActionBusy : labels.trip.paymentAction[name]}
                        onPress={() => runAction(name)}
                        disabled={actionBusy}
                        accessibilityHint={action.busy === name ? labels.trip.paymentActionBusy : undefined}
                      />
                    ))}
                  </View>
                ) : null}
                {cashCollected ? (
                  <Text testID="trip-summary-cash-collected" style={styles.body} accessibilityLiveRegion="polite">
                    {labels.trip.paymentCashCollected}
                  </Text>
                ) : null}
                {actionError ? (
                  <Card variant="status" tone="danger" style={styles.statusCard}>
                    <Icon name="alert-circle" size={iconSize.lg} tint={color.onDangerSoft} />
                    <View style={styles.flex}>
                      <Text
                        testID="trip-summary-action-error"
                        style={[styles.sectionTitle, styles.onDanger]}
                        accessibilityRole="header"
                        accessibilityLiveRegion="polite"
                      >
                        {actionError.title}
                      </Text>
                      <Text style={[styles.body, styles.onDanger]}>{actionError.message}</Text>
                    </View>
                  </Card>
                ) : null}
              </View>
            ) : null}
            {saving ? (
              <Text testID="trip-summary-saving" style={styles.body} accessibilityLiveRegion="polite">
                {labels.trip.saving}
              </Text>
            ) : null}
            {saved ? (
              <Card variant="status" tone="success" style={styles.statusCard}>
                <Icon name="checkmark-circle" size={iconSize.lg} tint={color.onSuccessSoft} />
                <Text testID="trip-summary-saved" style={styles.success} accessibilityLiveRegion="polite">
                  {labels.trip.saved}
                </Text>
              </Card>
            ) : null}
            {!fare || !driverId ? (
              <Card variant="status" tone="danger" style={styles.statusCard}>
                <Icon name="alert-circle" size={iconSize.lg} tint={color.onDangerSoft} />
                <Text testID="trip-summary-unavailable" style={styles.error} accessibilityLiveRegion="assertive">
                  {labels.trip.saveUnavailable}
                </Text>
              </Card>
            ) : null}
            {save.state === SAVE.ERROR ? (
              <Card variant="status" tone="danger" style={styles.statusCard}>
                <Icon name="alert-circle" size={iconSize.lg} tint={color.onDangerSoft} />
                <Text testID="trip-summary-save-error" style={styles.error} accessibilityLiveRegion="assertive">
                  {labels.trip[ERROR_COPY[save.kind] ?? 'saveErrorGeneric']}
                </Text>
              </Card>
            ) : null}
          </Card>
          {confirmingLeave ? (
            <Card variant="status" tone="warning" testID="trip-summary-leave-confirm" style={styles.card}>
              <View style={styles.noteRow}>
                <Icon name="warning" size={iconSize.lg} tint={color.onWarningSoft} />
                <Text style={[styles.sectionTitle, styles.flex, styles.onWarning]} accessibilityRole="header">
                  {labels.trip.leaveQuestion}
                </Text>
              </View>
              <Text style={[styles.body, styles.onWarning]}>{labels.trip.leaveMessage}</Text>
              <SecondaryButton testID="trip-summary-leave-yes" label={labels.trip.leaveConfirm} variant="danger" onPress={goHome} />
              <SecondaryButton
                testID="trip-summary-leave-no"
                label={labels.trip.leaveKeep}
                onPress={() => setConfirmingLeave(false)}
              />
            </Card>
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
  content: {
    gap: space[3],
    paddingHorizontal: space[4],
    paddingVertical: space[4],
  },
  flex: {
    flex: 1,
  },
  earnings: {
    gap: space[1],
  },
  earningsLabel: {
    ...type.label,
    color: color.onPrimarySoft,
  },
  earningsValue: {
    ...type.display,
    ...type.numeric,
    color: color.onPrimarySoft,
  },
  card: {
    gap: space[2],
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space[2],
    padding: space[3],
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space[2],
  },
  body: {
    ...type.body,
    color: color.text,
  },
  sectionTitle: {
    ...type.label,
    color: color.text,
  },
  paymentState: {
    gap: space[2],
  },
  onDanger: {
    color: color.onDangerSoft,
  },
  onWarning: {
    color: color.onWarningSoft,
  },
  success: {
    flex: 1,
    ...type.body,
    color: color.onSuccessSoft,
  },
  error: {
    flex: 1,
    ...type.body,
    color: color.onDangerSoft,
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

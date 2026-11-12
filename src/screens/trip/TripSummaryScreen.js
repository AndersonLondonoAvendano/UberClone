// AI-assisted: see docs/AI_LOG.md #61 (D-124: the summary shows the tip and the total charged = fare + tip)
// AI-assisted: see docs/AI_LOG.md #58 (T-147, T-148: one "Cobrar con ..." button per configured gateway; verify uses the trip's gateway)
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
import { COMMISSION_RATE } from '../../config/pricing';
import { labels } from '../../constants/labels';
import { PAYMENT_STATUS, TRIP_STATUS } from '../../constants/tripStatus';
import { useAppState } from '../../context/AppStateContext';
import { useTrip } from '../../context/TripContext';
import { useChargeProviders } from '../../hooks/useChargeProviders';
import { useTripPayment } from '../../hooks/useTripPayment';
import { retryMissingAddresses, withResolvedAddresses } from '../../services/geocoding/requestAddresses';
import { requestCheckoutUrl, syncPayment } from '../../services/paymentsService';
import { createPaymentActions } from '../../services/trip/paymentActions';
import { hasChosenGateway } from '../../services/trip/paymentGateway';
import { CHARGE_TONE, chargeButtons, chargePanel, RELOAD_PROVIDERS, serviceErrorText } from '../../services/trip/chargePanel';
import { PAYMENT_ACTION, PAYMENT_CHIP } from '../../services/trip/paymentView';
import { TRIP_PAYMENT_ERROR } from '../../services/trip/tripPaymentSubscription';
import { classifySaveError, SAVE_ERROR } from '../../services/trip/saveRetry';
import { buildTripRecord, isCardMethod, paymentMethodOf, SAVED_PAYMENT, SAVED_STATUS, tipOf } from '../../services/trip/tripRecord';
import { trackTripSave } from '../../services/trip/saveQueue';
import { confirmCashPayment, saveTrip } from '../../services/tripRepository';
import { color, iconSize, space, type } from '../../theme/tokens';
import { calculateFare, commissionPercent } from '../../utils/fare';
import { fillLabel, formatClock, formatCop, formatKm } from '../../utils/format';

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

// Look of the single charge message by tone. Success (green) only comes from chargePanel for approved or cash collected.
const MESSAGE_LOOK = {
  [CHARGE_TONE.SUCCESS]: { card: 'success', icon: 'checkmark-circle', tint: color.onSuccessSoft, text: 'success' },
  [CHARGE_TONE.ERROR]: { card: 'danger', icon: 'alert-circle', tint: color.onDangerSoft, text: 'error' },
  [CHARGE_TONE.WARNING]: { card: 'warning', icon: 'alert-circle', tint: color.onWarningSoft, text: 'warning' },
};

function fareOf(request) {
  try {
    // The tip of the request goes entirely to the driver: it is in driverEarnings, not in fare or commission.
    return calculateFare({
      distanceKm: request.distanceKm,
      durationMin: request.durationMin,
      category: request.category,
      tip: tipOf(request.tip),
    });
  } catch {
    return null;
  }
}

export function TripSummaryScreen({ navigation }) {
  const { trip, endTrip } = useTrip();
  const { driverId } = useAppState();
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
  const tip = request ? tipOf(request.tip) : 0;

  // Leaving the summary in any way (button or back) releases the trip and resumes availability.
  useEffect(() => endTrip, [endTrip]);

  // AI-assisted: see docs/AI_LOG.md #61
  // D-125: one more try for an address that failed while the trip ran; quiet and never blocking.
  const requestForRetry = request;
  useEffect(() => {
    if (requestForRetry) retryMissingAddresses(requestForRetry);
  }, [requestForRetry]);

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
        request: withResolvedAddresses(shown.request), // AI-assisted: see docs/AI_LOG.md #61 (D-125: saved text is the resolved street)
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
  const saved = save.state === SAVE.SAVED;
  const saving = save.state === SAVE.SAVING;

  // AI-assisted: see docs/AI_LOG.md #55
  // The charge state exists only once the trip is saved; before that there is nothing to listen to.
  const { trip: savedTrip, loading: paymentLoading, error: paymentError } = useTripPayment(saved ? shown?.tripId : null);
  // AI-assisted: see docs/AI_LOG.md #57 (T-119: the screen paints only what chargePanel decides)
  // A save failure or a stored-state read failure (listener error) blocks the panel: error tone, no chip, no
  // buttons. A service error only counts after a real user action (Cobrar, Verificar, Reintentar), never on mount.
  const [userActed, setUserActed] = useState(false);
  const [action, setAction] = useState({ busy: null, error: null, name: null });
  const actionError = action.error ? labels.trip.paymentActionError[action.error] : null;
  const listenerIssue = paymentError
    ? paymentError === TRIP_PAYMENT_ERROR.OFFLINE
      ? labels.trip.paymentOffline
      : labels.trip.paymentError
    : null;
  const saveFailure = save.state === SAVE.ERROR ? labels.trip[ERROR_COPY[save.kind] ?? 'saveErrorGeneric'] : null;
  const blockingIssue = saveFailure ?? (listenerIssue ? `${listenerIssue.title}. ${listenerIssue.message}` : null);
  const cancelled = savedTrip?.status === TRIP_STATUS.CANCELLED;
  const method = cancelled ? null : savedTrip?.paymentMethod ?? payment;
  const isCard = isCardMethod(method);
  // AI-assisted: see docs/AI_LOG.md #58 (undefined until the backend answers or if it fails: the panel acts as before Stripe)
  const { providers, failed: providersFailed, reload: reloadProviders } = useChargeProviders();
  const panel = chargePanel({
    method,
    providers,
    providersFailed,
    paymentId: savedTrip?.paymentId,
    paymentStatus: savedTrip?.status === TRIP_STATUS.PAID ? PAYMENT_STATUS.PAID : savedTrip?.paymentStatus,
    saveError: blockingIssue,
    serviceError: action.error ? serviceErrorText(action.error) : null,
    // A failed cash confirmation is a write error, not the charge service (cash never reaches it).
    writeError: actionError && action.name === PAYMENT_ACTION.CONFIRM_CASH ? `${actionError.title}. ${actionError.message}` : null,
    userActed,
  });
  const buttons = chargeButtons(panel);
  // #59: "Tarjeta" until a gateway is chosen (with paymentId); then the chosen gateway is named.
  const chosenGateway = isCard && hasChosenGateway({ method, paymentId: savedTrip?.paymentId }) ? method : null;
  const shownPaymentText =
    method === SAVED_PAYMENT.CASH
      ? labels.trip.paymentCash
      : chosenGateway
        ? labels.trip.paymentCardChosen[chosenGateway]
        : labels.trip.paymentCardGeneric;
  const chipLook = CHIP_LOOK[panel.chip] ?? CHIP_LOOK[PAYMENT_CHIP.UNAVAILABLE];
  // A legacy trip (no known method) has no charge message: it only says the trip was saved.
  const panelMessage = panel.message ?? labels.trip.chargePanel.savedOnly;
  const messageLook = MESSAGE_LOOK[panel.tone] ?? null;
  const showMessage = saveFailure !== null || (saved && !paymentLoading);
  const messageTestID = saveFailure
    ? 'trip-summary-save-error'
    : listenerIssue
      ? 'trip-summary-payment-issue'
      : panel.tone === CHARGE_TONE.ERROR
        ? 'trip-summary-action-error'
        : panel.tone === CHARGE_TONE.SUCCESS && !isCard
          ? 'trip-summary-cash-collected'
          : 'trip-summary-saved';

  // AI-assisted: see docs/AI_LOG.md #55 (charge actions, T-97)
  // One runner per screen: it keeps a single request in flight. The card state is never set here: it only
  // changes when the backend writes the trip document and onSnapshot delivers it.
  const runner = useMemo(
    () => createPaymentActions({ requestCheckoutUrl, syncPayment, confirmCashPayment, openUrl: (url) => Linking.openURL(url) }),
    [],
  );
  const tripIdRef = useRef(null);
  const canSyncRef = useRef(false);
  // The gateway recorded in the trip document: "Verificar pago" and the foreground check use it, never the last button.
  const tripGatewayRef = useRef(undefined);
  const savedTripId = saved ? shown?.tripId ?? null : null;
  tripIdRef.current = savedTripId;
  // Cash never reaches the payments service: the silent check only exists for card trips.
  canSyncRef.current = isCard && panel.actions.includes(PAYMENT_ACTION.VERIFY);
  tripGatewayRef.current = isCard ? method : undefined;

  const runAction = useCallback(
    async (name, provider, key = name) => {
      if (name === RELOAD_PROVIDERS) {
        reloadProviders();
        return;
      }
      if (!tripIdRef.current || runner.isBusy()) return;
      if (name !== PAYMENT_ACTION.CONFIRM_CASH) setUserActed(true);
      setAction({ busy: key, error: null, name });
      const result = await runner.run(name, {
        uid: driverId,
        tripId: tripIdRef.current,
        provider: name === PAYMENT_ACTION.VERIFY ? tripGatewayRef.current : provider,
      });
      if (!mounted.current || result.skipped) return;
      setAction({ busy: null, error: result.ok ? null : result.error, name });
    },
    [runner, driverId, reloadProviders],
  );

  // Back from the browser: ask the backend to sync. The result is ignored on purpose (errors are silent and
  // success proves nothing); the document listener is the only source of the card state.
  useEffect(() => {
    if (!savedTripId) return undefined;
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'active' && canSyncRef.current && tripIdRef.current) {
        runner.run(PAYMENT_ACTION.VERIFY, { uid: driverId, tripId: tripIdRef.current, provider: tripGatewayRef.current });
      }
    });
    return () => subscription.remove();
  }, [savedTripId, runner, driverId]);

  const actionBusy = action.busy !== null;

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
                {tip > 0 ? <Row label={labels.trip.tip} value={`+ ${formatCop(tip)}`} /> : null}
                {tip > 0 ? <Row label={labels.trip.totalCharged} value={formatCop(fare.fare + tip)} /> : null}
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
            <Text style={styles.body}>{shownPaymentText}</Text>
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
                    label={labels.trip.paymentChip[panel.chip]}
                    tone={chipLook.tone}
                    icon={chipLook.icon}
                  />
                )}
                {/* AI-assisted: see docs/AI_LOG.md #55 (charge actions, T-97) */}
                {!paymentLoading && !paymentError && panel.actions.length > 0 ? (
                  <View testID="trip-summary-payment-actions" style={styles.paymentState}>
                    {isCard && !panel.noGateway ? (
                      <Text style={styles.muted}>
                        {labels.trip.paymentCardNoteGeneric}
                      </Text>
                    ) : null}
                    {buttons.map(({ key, action: name, provider, label }) => (
                      <SecondaryButton
                        key={key}
                        testID={`trip-summary-action-${key}`}
                        label={action.busy === key ? labels.trip.paymentActionBusy : label}
                        onPress={() => runAction(name, provider, key)}
                        disabled={actionBusy}
                        accessibilityHint={action.busy === key ? labels.trip.paymentActionBusy : undefined}
                      />
                    ))}
                  </View>
                ) : null}
              </View>
            ) : null}
            {saving ? (
              <Text testID="trip-summary-saving" style={styles.body} accessibilityLiveRegion="polite">
                {labels.trip.saving}
              </Text>
            ) : null}
            {!saved && (!fare || !driverId) ? (
              <Card variant="status" tone="danger" style={styles.statusCard}>
                <Icon name="alert-circle" size={iconSize.lg} tint={color.onDangerSoft} />
                <Text testID="trip-summary-unavailable" style={styles.error} accessibilityLiveRegion="polite">
                  {labels.trip.saveUnavailable}
                </Text>
              </Card>
            ) : null}
            {/* The one message of the panel (RF-56): one polite live region, tone decided by chargePanel */}
            {showMessage ? (
              messageLook ? (
                <Card variant="status" tone={messageLook.card} style={styles.statusCard}>
                  <Icon name={messageLook.icon} size={iconSize.lg} tint={messageLook.tint} />
                  <Text testID={messageTestID} style={styles[messageLook.text]} accessibilityLiveRegion={panel.live}>
                    {panelMessage}
                  </Text>
                </Card>
              ) : (
                <Text testID={messageTestID} style={styles.body} accessibilityLiveRegion={panel.live}>
                  {panelMessage}
                </Text>
              )
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
  warning: {
    flex: 1,
    ...type.body,
    color: color.onWarningSoft,
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

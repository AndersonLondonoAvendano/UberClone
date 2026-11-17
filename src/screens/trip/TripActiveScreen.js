// AI-assisted: see docs/AI_LOG.md #72 (T-285, D-200: arrival is automatic; no "Llegué" button, no main button while approaching)
// AI-assisted: see docs/AI_LOG.md #67 (T-258/T-259: the screen follows the active language)
// AI-assisted: see docs/AI_LOG.md #54 (car marker colour; main action fixed below the scrollable panel)
// AI-assisted: see docs/AI_LOG.md #53 (presentation: phase chip, status cards, data rows)
// AI-assisted: see docs/AI_LOG.md #45 (popTo('Home'): navigate pushes a second Home in React Navigation 7, leaving this screen mounted)
// AI-assisted: see docs/AI_LOG.md #18
// AI-assisted: see docs/AI_LOG.md #43
// Trip in progress (T-44). Reads the trip from TripContext (the controller does the work): map with
// the leg route, the target and the driver; the phase, the remaining distance and time; "Pasajero a
// bordo" only once the driver reached the pickup (the arrival is automatic, D-200) and "Finalizar viaje" at the destination. Route, report,
// location and cancel errors are inline text with their own retry: nothing retries by itself.
// Cancel asks for a simple inline confirmation. Leaving the screen (back gesture or button) during
// the trip opens that confirmation instead of dropping the trip.
//
// AI-assisted: see docs/AI_LOG.md #44
// The screen always has a way out: finishing shows its progress and, if the passenger API does not
// confirm (no network, timeout, rejected), "Reintentar" and "Salir del viaje"; a failed cancel also
// offers "Salir del viaje". Leaving with that exit asks for confirmation, ends the trip locally
// (abandon) and goes Home; the trip is released (endTrip) when this screen unmounts. A disabled main
// button says why in visible text under it.

import { usePreventRemove } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/Card';
import { Chip } from '../../components/Chip';
import { Icon } from '../../components/Icon';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SecondaryButton } from '../../components/SecondaryButton';
import { TripMap } from '../../components/map/TripMap';
import { labels } from '../../constants/labels';
import { useLanguage } from '../../i18n/useLanguage';
import { FINISH_ERROR, TRIP_STATUS } from '../../constants/tripStatus';
import { useAppState } from '../../context/AppStateContext';
import { useTrip } from '../../context/TripContext';
import { useRequestAddresses } from '../../hooks/useRequestAddresses';
import { canOfferCancel } from '../../services/trip/cancelRule';
import { exitCopy } from '../../services/trip/exitCopy';
import { TRIP_PHASE } from '../../services/trip/tripController';
import { color, elevation, iconSize, radius, space, type } from '../../theme/tokens';
import { fillLabel, formatKmFromMeters, formatMinutesFromSeconds } from '../../utils/format';

const SAFE_EDGES = ['top', 'bottom'];
const PANEL_MAX_SHARE = 0.65;
const PANEL_CONFIRM_MAX_SHARE = 0.9;
const MOVING_PHASES = [TRIP_PHASE.TO_PICKUP, TRIP_PHASE.TO_DESTINATION];

// AI-assisted: see docs/AI_LOG.md #44
// Read at render time so the text follows the active language.
const finishErrorTexts = () => ({
  [FINISH_ERROR.NETWORK]: labels.trip.finishErrorNetwork,
  [FINISH_ERROR.TIMEOUT]: labels.trip.finishErrorTimeout,
  [FINISH_ERROR.REJECTED]: labels.trip.finishErrorRejected,
});

export function TripActiveScreen({ navigation }) {
  useLanguage(); // re-render on language change (RI-15)
  const { trip, startRide, finish, cancel, abandon, endTrip, retryRoute, retryReport, retryLocation } = useTrip();
  const { driverProfile } = useAppState();
  // AI-assisted: see docs/AI_LOG.md #61 (D-125: resolved street of the current target)
  const addresses = useRequestAddresses(trip?.request);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [working, setWorking] = useState(false);
  const { height: windowHeight } = useWindowDimensions();
  const scrollRef = useRef(null);
  const leavingRef = useRef(false);
  const mountedRef = useRef(true);
  // AI-assisted: see docs/AI_LOG.md #44
  // The trip is released when this screen unmounts after a cancel or the safe exit, so Home never
  // flashes "no trip" here during the transition.
  const endOnLeaveRef = useRef(false);
  const endTripRef = useRef(endTrip);
  endTripRef.current = endTrip;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (endOnLeaveRef.current) endTripRef.current();
    };
  }, []);

  const active = Boolean(trip) && !trip.finished;

  // The iOS swipe-back cannot be intercepted by the native stack, so it is off during the trip.
  useEffect(() => {
    navigation.setOptions({ gestureEnabled: !active });
  }, [navigation, active]);

  // AI-assisted: see docs/AI_LOG.md #66 (in_progress cannot be cancelled: leaving opens the safe exit)
  const cancelOffered = Boolean(trip) && canOfferCancel(trip.status);
  usePreventRemove(active, ({ data }) => {
    if (leavingRef.current) navigation.dispatch(data.action);
    else if (cancelOffered) setConfirmCancel(true);
    else setConfirmExit(true);
  });

  const goHome = useCallback(() => navigation.popTo('Home'), [navigation]);

  // AI-assisted: see docs/AI_LOG.md #44
  // completed confirmed (also when it arrives late, after a timeout): open the summary once.
  const completed = trip?.finished === TRIP_STATUS.COMPLETED && !trip.abandoned;
  useEffect(() => {
    if (!completed || leavingRef.current) return;
    leavingRef.current = true;
    navigation.replace('TripSummary');
  }, [completed, navigation]);

  const handleStartRide = useCallback(async () => {
    setWorking(true);
    try {
      await startRide();
    } finally {
      if (mountedRef.current) setWorking(false);
    }
  }, [startRide]);

  // finish() resolves within FINISH_TIMEOUT_MS; on failure finishError shows the retry and the exit.
  const handleFinish = useCallback(async () => {
    setWorking(true);
    try {
      await finish();
    } finally {
      if (mountedRef.current) setWorking(false);
    }
  }, [finish]);

  const handleCancel = useCallback(async () => {
    setWorking(true);
    let ok = false;
    try {
      ok = await cancel();
    } finally {
      if (mountedRef.current) setWorking(false);
    }
    if (!ok || !mountedRef.current) return; // cancelError is on screen, with the safe exit
    setConfirmCancel(false);
    leavingRef.current = true;
    endOnLeaveRef.current = true;
    navigation.popTo('Home');
  }, [cancel, navigation]);

  // AI-assisted: see docs/AI_LOG.md #44
  const askExit = useCallback(() => {
    setConfirmCancel(false);
    setConfirmExit(true);
  }, []);

  const handleExit = useCallback(() => {
    abandon();
    setConfirmExit(false);
    leavingRef.current = true;
    endOnLeaveRef.current = true;
    navigation.popTo('Home');
  }, [abandon, navigation]);

  if (!trip) {
    return (
      <SafeAreaView testID="screen-trip-active" edges={SAFE_EDGES} style={styles.screen}>
        <ScreenHeader title={labels.trip.activeTitle} leading={null} />
        <View style={styles.centered}>
          <Text style={styles.body}>{labels.trip.noTrip}</Text>
          <SecondaryButton testID="trip-active-home" label={labels.trip.backToHome} onPress={goHome} />
        </View>
      </SafeAreaView>
    );
  }

  const moving = MOVING_PHASES.includes(trip.phase);
  const phaseText = labels.trip.phase[trip.phase] ?? '';
  const showRemaining = moving && trip.remainingM !== null && trip.remainingS !== null;
  const atPickup = trip.phase === TRIP_PHASE.AT_PICKUP;
  const toDestinationSide = trip.phase === TRIP_PHASE.TO_DESTINATION || trip.phase === TRIP_PHASE.AT_DESTINATION;
  const atDestination = trip.phase === TRIP_PHASE.AT_DESTINATION;
  const busy = working || trip.finishing;
  const finishErrors = finishErrorTexts();
  const finishErrorText = trip.finishError ? finishErrors[trip.finishError] ?? finishErrors.network : null;
  // D-200: the arrival at the pickup is automatic (controller: distance threshold or end of the route), so
  // while the driver is on the way to the pickup there is no main button and no hint, only "Cancelar viaje".
  // "Pasajero a bordo" appears once the driver is at the pickup. At the destination the main button
  // waits for the arrival and its reason is visible text, not only an accessibility hint.
  const mainHint = toDestinationSide && !atDestination ? labels.trip.finishRideHint : null;

  // AI-assisted: see docs/AI_LOG.md #66 (C2c: the exit text says what really happens in this state)
  const exitText = exitCopy({ status: trip.status, atDestination, serverError: Boolean(trip.finishError || trip.cancelError) });

  let actions;
  if (confirmExit) {
    actions = (
      <Card
        variant="status"
        tone="warning"
        testID="trip-active-exit-confirm"
        style={styles.confirm}
        accessibilityLiveRegion="assertive"
      >
        <View style={styles.confirmHead}>
          <Icon name="warning" size={iconSize.lg} tint={color.onWarningSoft} />
          <Text style={[styles.title, styles.flex, styles.onWarning]}>{exitText.question}</Text>
        </View>
        <Text style={[styles.body, styles.onWarning]}>{exitText.message}</Text>
        <SecondaryButton
          testID="trip-active-exit-confirm-yes"
          label={labels.trip.exitConfirm}
          variant="danger"
          onPress={handleExit}
        />
        <PrimaryButton testID="trip-active-exit-keep" label={labels.trip.exitKeep} onPress={() => setConfirmExit(false)} />
      </Card>
    );
  } else if (confirmCancel) {
    actions = (
      <Card
        variant="status"
        tone="warning"
        testID="trip-active-cancel-confirm"
        style={styles.confirm}
        accessibilityLiveRegion="assertive"
      >
        <View style={styles.confirmHead}>
          <Icon name="warning" size={iconSize.lg} tint={color.onWarningSoft} />
          <Text style={[styles.title, styles.flex, styles.onWarning]}>{labels.trip.cancelQuestion}</Text>
        </View>
        <Text style={[styles.body, styles.onWarning]}>{labels.trip.cancelMessage}</Text>
        {trip.cancelError ? (
          <View style={styles.inlineError}>
            <Icon name="alert-circle" size={iconSize.md} tint={color.onDangerSoft} />
            <Text style={[styles.body, styles.flex, styles.onDanger]}>{labels.trip.cancelError}</Text>
          </View>
        ) : null}
        <SecondaryButton
          testID="trip-active-cancel-confirm-yes"
          label={labels.trip.cancelConfirm}
          variant="danger"
          onPress={handleCancel}
          disabled={busy}
        />
        <PrimaryButton
          testID="trip-active-cancel-keep"
          label={labels.trip.cancelKeep}
          onPress={() => setConfirmCancel(false)}
          disabled={busy}
        />
        {trip.cancelError && !busy ? (
          <SecondaryButton testID="trip-active-cancel-exit" label={labels.trip.exitTrip} onPress={askExit} />
        ) : null}
      </Card>
    );
  } else if (finishErrorText && !busy) {
    actions = (
      <View testID="trip-active-finish-error" style={styles.group} accessibilityLiveRegion="assertive">
        <Card variant="status" tone="danger" style={styles.notice}>
          <Icon name="alert-circle" size={iconSize.md} tint={color.onDangerSoft} />
          <Text style={[styles.body, styles.flex, styles.onDanger]}>{finishErrorText}</Text>
        </Card>
        {trip.finishError !== FINISH_ERROR.REJECTED ? (
          <PrimaryButton testID="trip-active-finish-retry" label={labels.actions.retry} onPress={handleFinish} />
        ) : null}
        <SecondaryButton testID="trip-active-finish-exit" label={labels.trip.exitTrip} onPress={askExit} />
      </View>
    );
  } else {
    actions = (
      <View style={styles.group}>
        {busy ? (
          <Text style={styles.muted} accessibilityLiveRegion="polite">
            {trip.finishing ? labels.trip.finishing : labels.trip.working}
          </Text>
        ) : null}
        {toDestinationSide ? (
          <PrimaryButton
            testID="trip-active-finish"
            label={labels.trip.finishRide}
            accessibilityHint={labels.trip.finishRideHint}
            onPress={handleFinish}
            disabled={!atDestination || busy}
          />
        ) : atPickup ? (
          <PrimaryButton
            testID="trip-active-start"
            label={labels.trip.startRide}
            onPress={handleStartRide}
            disabled={busy}
          />
        ) : null}
        {mainHint ? (
          <Text testID="trip-active-main-hint" style={styles.hint}>
            {mainHint}
          </Text>
        ) : null}
        {cancelOffered ? (
          <SecondaryButton
            testID="trip-active-cancel"
            label={labels.trip.cancel}
            variant="danger"
            onPress={() => setConfirmCancel(true)}
            disabled={busy}
          />
        ) : (
          <SecondaryButton testID="trip-active-exit" label={labels.trip.exitTrip} onPress={askExit} disabled={busy} />
        )}
      </View>
    );
  }

  const confirming = confirmExit || confirmCancel;
  const targetAddress = toDestinationSide ? addresses.destination : addresses.origin;
  const targetA11yLabel = fillLabel(toDestinationSide ? labels.trip.destinationA11y : labels.trip.pickupPointA11y, {
    address: targetAddress ?? '',
  });

  return (
    <SafeAreaView testID="screen-trip-active" edges={SAFE_EDGES} style={styles.screen}>
      <ScreenHeader title={labels.trip.activeTitle} leading={null} />
      <View style={styles.map}>
        <TripMap
          testID="trip-active-map"
          position={trip.position}
          target={trip.target}
          routeCoordinates={trip.route?.coordinates}
          approximate={trip.routeApproximate}
          vehicleColorValue={driverProfile?.vehicle?.color}
        />
      </View>

      {/* AI-assisted: see docs/AI_LOG.md #53, #54 (the whole panel is capped, the scroll yields space) */}
      {/* AI-assisted: see docs/AI_LOG.md #72 (T-287 H-1: an open confirmation lives inside the scroll, so it is
          always reachable at 200 % font; the panel may grow taller while it is open) */}
      <View style={[styles.panel, { maxHeight: windowHeight * (confirming ? PANEL_CONFIRM_MAX_SHARE : PANEL_MAX_SHARE) }]}>
        <ScrollView
          ref={scrollRef}
          style={styles.panelScroll}
          contentContainerStyle={styles.panelContent}
          onContentSizeChange={() => {
            if (confirming) scrollRef.current?.scrollToEnd({ animated: false });
          }}
        >
        <View style={styles.info} accessibilityLiveRegion="polite">
          <Chip testID="trip-active-phase" label={phaseText} tone={atPickup || atDestination ? 'success' : 'brand'} />
          {showRemaining ? (
            <View style={styles.remainingBlock}>
              <Text testID="trip-active-remaining" style={styles.remaining}>
                {fillLabel(labels.trip.remaining, {
                  km: formatKmFromMeters(trip.remainingM),
                  min: formatMinutesFromSeconds(trip.remainingS),
                })}
              </Text>
              <Text style={styles.phaseCaption}>{labels.trip.remainingCaption}</Text>
            </View>
          ) : null}
          <View style={styles.personRow}>
            <Icon name="person" size={iconSize.md} tint={color.textMuted} />
            <Text style={[styles.bodyStrong, styles.flex]}>{trip.request.passenger?.name}</Text>
          </View>
          {trip.target?.address ? (
            <View style={styles.personRow} accessible accessibilityLabel={targetA11yLabel}>
              <Icon name={toDestinationSide ? 'location' : 'radio-button-on'} size={iconSize.md} tint={color.textMuted} />
              <Text style={[styles.body, styles.flex]}>{targetAddress}</Text>
            </View>
          ) : null}
          {trip.routeLoading ? <Text style={styles.muted}>{labels.trip.routeLoading}</Text> : null}
        </View>

        {trip.routeApproximate && moving && !trip.routeLoading ? (
          <Notice testID="trip-active-approx" text={labels.trip.approxRoute} tone="warning" onRetry={retryRoute} />
        ) : null}
        {trip.locationError ? (
          <Notice testID="trip-active-location-error" text={labels.trip.locationError} onRetry={retryLocation} />
        ) : null}
        {trip.reportError && !trip.finishError && !trip.finishing ? (
          <Notice testID="trip-active-report-error" text={labels.trip.reportError} onRetry={retryReport} />
        ) : null}

        {confirming ? actions : null}
        </ScrollView>

        {confirming ? null : actions}
      </View>
    </SafeAreaView>
  );
}

// AI-assisted: see docs/AI_LOG.md #44 (the warning tone is applied now)
function Notice({ testID, text, onRetry, tone = 'danger' }) {
  return (
    <Card variant="status" tone={tone} testID={testID} style={styles.noticeCard} accessibilityLiveRegion="polite">
      <View style={styles.noticeRow}>
        <Icon
          name={tone === 'danger' ? 'alert-circle' : 'warning'}
          size={iconSize.md}
          tint={tone === 'danger' ? color.onDangerSoft : color.onWarningSoft}
        />
        <Text style={[styles.body, styles.flex, tone === 'danger' ? styles.onDanger : styles.onWarning]}>{text}</Text>
      </View>
      <SecondaryButton testID={`${testID}-retry`} label={labels.actions.retry} onPress={onRetry} />
    </Card>
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
  map: {
    flex: 1,
  },
  // AI-assisted: see docs/AI_LOG.md #44
  // A sheet over the map (DESIGN.md "Elevación"): radius.lg on top and the native shadow, no line.
  panel: {
    gap: space[3],
    paddingHorizontal: space[4],
    paddingTop: space[4],
    paddingBottom: space[3],
    marginTop: -space[4],
    backgroundColor: color.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    ...elevation.raised,
  },
  panelScroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  panelContent: {
    gap: space[3],
  },
  info: {
    gap: space[2],
  },
  remainingBlock: {
    gap: space[0],
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space[2],
  },
  bodyStrong: {
    ...type.bodyStrong,
    color: color.text,
  },
  confirm: {
    gap: space[2],
  },
  confirmHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  inlineError: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space[2],
  },
  noticeCard: {
    gap: space[2],
    padding: space[3],
  },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space[2],
  },
  onWarning: {
    color: color.onWarningSoft,
  },
  onDanger: {
    color: color.onDangerSoft,
  },
  group: {
    gap: space[2],
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space[2],
    padding: space[3],
  },
  title: {
    ...type.title,
    color: color.text,
  },
  body: {
    ...type.body,
    color: color.text,
  },
  muted: {
    ...type.body,
    color: color.textMuted,
  },
  // AI-assisted: see docs/AI_LOG.md #44
  phaseCaption: {
    ...type.label,
    color: color.textMuted,
  },
  remaining: {
    ...type.display,
    ...type.numeric,
    color: color.primary,
  },
  hint: {
    ...type.label,
    color: color.textMuted,
    textAlign: 'center',
  },
  error: {
    color: color.danger,
  },
  warning: {
    color: color.warning,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    gap: space[3],
    paddingHorizontal: space[4],
  },
});

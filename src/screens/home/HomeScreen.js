// AI-assisted: see docs/AI_LOG.md #18
// AI-assisted: see docs/AI_LOG.md #19
// AI-assisted: see docs/AI_LOG.md #35
// AI-assisted: see docs/AI_LOG.md #36
// AI-assisted: see docs/AI_LOG.md #41
// AI-assisted: see docs/AI_LOG.md #42
// AI-assisted: see docs/AI_LOG.md #43
// AI-assisted: see docs/AI_LOG.md #48 (import order)
// AI-assisted: see docs/AI_LOG.md #53 (presentation: status card for the notice, grouped switch and hint)
// AI-assisted: see docs/AI_LOG.md #54
// Home screen: the availability switch (T-42, RF-08) with a written hint of what is happening,
// plus provisional development panels behind SHOW_DEV_TOOLS: «Simular solicitud» asks the
// simulated passenger API for a request now (it no longer opens the trip request screen), a debug
// line shows the id of the last request received, and the map test entry.
// The drawer button dispatches the open-drawer action; the stack does not handle it, so it reaches
// the parent drawer navigator.
// T-43: each new incoming request (one at a time) opens the request card once; the phone location
// being off shows its own notice (no automatic retry, see AvailabilityContext).

import { DrawerActions, useIsFocused } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AvailabilitySwitch } from '../../components/AvailabilitySwitch';
import { Card } from '../../components/Card';
import { Icon } from '../../components/Icon';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ACCOUNT_STATUS } from '../../constants/accountStatus';
import { SHOW_DEV_TOOLS } from '../../constants/devTools';
import { labels } from '../../constants/labels';
import { useAvailability } from '../../context/AvailabilityContext';
import { PRESENTATION, decideRequestPresentation } from '../../services/trip/requestPresentation';
import { color, iconSize, space, type } from '../../theme/tokens';

const HINT_BY_LOCATION_STATUS = {
  waiting: labels.home.hintWaiting,
  active: labels.home.hintActive,
  paused: labels.home.hintPaused,
  unavailable: labels.home.hintNoLocation,
};

const DEV_MESSAGE_BY_RESULT = {
  not_subscribed: labels.home.devNeedsAvailable,
  no_position: labels.home.devNoPosition,
  busy: labels.home.devBusy,
  not_supported: labels.home.devNotSupported,
};

const NOTICE_TEXT = {
  denied: labels.home.permissionDenied,
  unavailable: labels.home.permissionUnavailable,
  services_off: labels.home.servicesOff,
};

export function HomeScreen({ navigation }) {
  const {
    isAvailable,
    isChanging,
    notice,
    setAvailable,
    onTrip,
    locationStatus,
    pendingRequest,
    lastRequest,
    requestSimulatedTrip,
  } = useAvailability();
  const [devMessage, setDevMessage] = useState(null);
  const announcedIdRef = useRef(null);
  const focused = useIsFocused(); // AI-assisted: see docs/AI_LOG.md #47 (Home stays mounted under the other drawer screens)

  // Opens the card once per request id, only while available and without a trip.
  useEffect(() => {
    if (!pendingRequest || !isAvailable || onTrip) return;
    // AI-assisted: see docs/AI_LOG.md #47
    // Full screen only while Home is the screen in front; elsewhere the bottom card shows it, and
    // coming back to Home with the request still pending opens it here with the real time left.
    if (!focused) return;
    if (decideRequestPresentation('Home', onTrip, ACCOUNT_STATUS.APPROVED, true) !== PRESENTATION.FULLSCREEN) return;
    if (announcedIdRef.current === pendingRequest.id) return;
    announcedIdRef.current = pendingRequest.id;
    setDevMessage(null);
    const alreadyOpen = navigation.getState().routes.some((r) => r.name === 'TripRequest');
    if (!alreadyOpen) navigation.navigate('TripRequest');
  }, [pendingRequest, isAvailable, onTrip, navigation, focused]);

  const hint = isAvailable ? (HINT_BY_LOCATION_STATUS[locationStatus] ?? labels.home.hintWaiting) : labels.home.hintOff;
  const noticeText = notice ? (NOTICE_TEXT[notice] ?? null) : null;

  const onSimulate = () => {
    const result = requestSimulatedTrip();
    setDevMessage(DEV_MESSAGE_BY_RESULT[result] ?? null);
  };

  return (
    <PlaceholderScreen
      name="home"
      title={labels.drawer.home}
      leading="drawer"
      onLeadingPress={() => navigation.dispatch(DrawerActions.openDrawer())}
    >
      <View style={styles.stack}>
        <View style={styles.group}>
          <AvailabilitySwitch value={isAvailable} onValueChange={setAvailable} disabled={isChanging} />
          {noticeText ? (
            <Card variant="status" tone="danger" style={styles.noticeCard}>
              <Icon name="alert-circle" size={iconSize.lg} tint={color.onDangerSoft} />
              <Text testID="home-availability-notice" style={styles.notice} accessibilityLiveRegion="polite">
                {noticeText}
              </Text>
            </Card>
          ) : (
            <Text style={styles.hint}>{hint}</Text>
          )}
        </View>
        {SHOW_DEV_TOOLS ? (
          <PrimaryButton testID="home-start-trip" label={labels.home.startTrip} onPress={onSimulate} />
        ) : null}
        {SHOW_DEV_TOOLS && devMessage ? <Text style={styles.hint}>{devMessage}</Text> : null}
        {SHOW_DEV_TOOLS && lastRequest ? (
          <Text testID="home-debug-request" style={styles.debug}>
            {labels.home.debugRequest.replace('{id}', lastRequest.id)}
          </Text>
        ) : null}
        {SHOW_DEV_TOOLS ? (
          <PrimaryButton
            testID="home-map-test"
            label={labels.mapTest.openFromHome}
            onPress={() => navigation.navigate('MapTest')}
          />
        ) : null}
      </View>
    </PlaceholderScreen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: space[5],
  },
  group: {
    gap: space[3],
  },
  hint: {
    ...type.small,
    color: color.textMuted,
    paddingHorizontal: space[1],
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space[3],
  },
  notice: {
    flex: 1,
    ...type.body,
    color: color.onDangerSoft,
  },
  debug: {
    ...type.caption,
    color: color.textMuted,
  },
});

// AI-assisted: see docs/AI_LOG.md #18
// AI-assisted: see docs/AI_LOG.md #19
// AI-assisted: see docs/AI_LOG.md #35
// AI-assisted: see docs/AI_LOG.md #36
// AI-assisted: see docs/AI_LOG.md #41
// AI-assisted: see docs/AI_LOG.md #42
// AI-assisted: see docs/AI_LOG.md #43
// Home screen: the availability switch (T-42, RF-08) with a written hint of what is happening,
// plus provisional development panels behind SHOW_DEV_TOOLS: «Simular solicitud» asks the
// simulated passenger API for a request now (it no longer opens the trip request screen), a debug
// line shows the id of the last request received, and the map test entry and account simulator.
// The drawer button dispatches the open-drawer action; the stack does not handle it, so it reaches
// the parent drawer navigator.
// T-43: each new incoming request (one at a time) opens the request card once; the phone location
// being off shows its own notice (no automatic retry, see AvailabilityContext).

import { DrawerActions } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AvailabilitySwitch } from '../../components/AvailabilitySwitch';
import { DevAccountSwitch } from '../../components/DevAccountSwitch';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';
import { PrimaryButton } from '../../components/PrimaryButton';
import { labels } from '../../constants/labels';
import { SHOW_DEV_TOOLS } from '../../constants/devTools';
import { useAvailability } from '../../context/AvailabilityContext';
import { color, space, type } from '../../theme/tokens';

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

  // Opens the card once per request id, only while available and without a trip.
  useEffect(() => {
    if (!pendingRequest || !isAvailable || onTrip) return;
    if (announcedIdRef.current === pendingRequest.id) return;
    announcedIdRef.current = pendingRequest.id;
    setDevMessage(null);
    navigation.navigate('TripRequest');
  }, [pendingRequest, isAvailable, onTrip, navigation]);

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
        <AvailabilitySwitch value={isAvailable} onValueChange={setAvailable} disabled={isChanging} />
        {noticeText ? (
          <Text testID="home-availability-notice" style={styles.notice} accessibilityLiveRegion="polite">
            {noticeText}
          </Text>
        ) : (
          <Text style={styles.hint}>{hint}</Text>
        )}
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
        <DevAccountSwitch />
      </View>
    </PlaceholderScreen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: space[5],
  },
  hint: {
    ...type.body,
    color: color.textMuted,
  },
  notice: {
    ...type.body,
    color: color.danger,
  },
  debug: {
    ...type.caption,
    color: color.textMuted,
  },
});

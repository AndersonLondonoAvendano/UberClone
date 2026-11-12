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
// AI-assisted: see docs/AI_LOG.md #55 (F1b: full-screen map, floating card, local position without publishing)
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
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { HomeFloatingCard } from '../../components/home/HomeFloatingCard';
import { Icon } from '../../components/Icon';
import { TripMap } from '../../components/map/TripMap';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ACCOUNT_STATUS } from '../../constants/accountStatus';
import { SHOW_DEV_TOOLS } from '../../constants/devTools';
import { labels } from '../../constants/labels';
import { useAvailability } from '../../context/AvailabilityContext';
import { PRESENTATION, decideRequestPresentation } from '../../services/trip/requestPresentation';
import { color, iconSize, radius, space, touch, type } from '../../theme/tokens';

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
    position,
    permissionGranted,
    requestLocationPermission,
    setHomeFocused,
  } = useAvailability();
  const [devMessage, setDevMessage] = useState(null);
  const announcedIdRef = useRef(null);
  const focused = useIsFocused(); // AI-assisted: see docs/AI_LOG.md #47 (Home stays mounted under the other drawer screens)

  // Tells the context Home is in front: the position is tracked locally (not published) meanwhile.
  useEffect(() => {
    setHomeFocused(focused);
    return () => setHomeFocused(false);
  }, [focused, setHomeFocused]);

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

  const hint = isAvailable
    ? (HINT_BY_LOCATION_STATUS[locationStatus] ?? labels.home.hintWaiting)
    : permissionGranted
      ? labels.home.hintLocalOnly
      : labels.home.hintOff;
  const noticeText = notice ? (NOTICE_TEXT[notice] ?? null) : null;

  const onSimulate = () => {
    const result = requestSimulatedTrip();
    setDevMessage(DEV_MESSAGE_BY_RESULT[result] ?? null);
  };

  return (
    <View style={styles.screen} testID="home-screen">
      <View style={styles.map} accessible accessibilityLabel={labels.home.mapLabel}>
        <TripMap testID="home-map" position={position} follow attributionAtBottom />
      </View>
      <HomeFloatingCard
        isAvailable={isAvailable}
        isChanging={isChanging}
        onToggle={setAvailable}
        hint={hint}
        noticeText={noticeText}
        needsPermission={!permissionGranted && !noticeText}
        onGrantPermission={requestLocationPermission}
        leading={
          <Pressable
            testID="nav-open-drawer"
            accessibilityRole="button"
            accessibilityLabel={labels.a11y.openDrawer}
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            style={styles.drawerButton}
          >
            <Icon name="menu" size={iconSize.lg} tint={color.text} />
          </Pressable>
        }
      />
      {SHOW_DEV_TOOLS ? (
        <View style={styles.devPanel}>
          <PrimaryButton testID="home-start-trip" label={labels.home.startTrip} onPress={onSimulate} />
          {devMessage ? <Text style={styles.hint}>{devMessage}</Text> : null}
          {lastRequest ? (
            <Text testID="home-debug-request" style={styles.debug}>
              {labels.home.debugRequest.replace('{id}', lastRequest.id)}
            </Text>
          ) : null}
          <PrimaryButton
            testID="home-map-test"
            label={labels.mapTest.openFromHome}
            onPress={() => navigation.navigate('MapTest')}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: color.bg,
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  drawerButton: {
    minWidth: touch.min,
    minHeight: touch.min,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  devPanel: {
    position: 'absolute',
    left: space[3],
    right: space[3],
    bottom: space[4],
    gap: space[3],
  },
  hint: {
    ...type.small,
    color: color.textMuted,
    paddingHorizontal: space[1],
  },
  debug: {
    ...type.caption,
    color: color.textMuted,
  },
});

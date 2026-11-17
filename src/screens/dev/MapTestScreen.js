// AI-assisted: see AI_LOG.md #67
// AI-assisted: see AI_LOG.md #41
// Development-only map test (reachable only while SHOW_DEV_TOOLS is on): MapLibre map with the
// OpenFreeMap style, the driver's current position from expo-location, and the street route between
// the two fixed test points drawn as a GeoJSON line. Loading and error states use ScreenState; a
// failed style load remounts the Map (new key) on retry. Fallback routes are labeled honestly, and
// the attribution is shown as on-screen text in addition to MapLibre's native attribution button.
// Coordinates are [lng, lat] everywhere (GeoJSON and MapLibre order).

import { Camera, GeoJSONSource, Layer, Map as MapLibreMap } from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ScreenState } from '../../components/ScreenState';
import {
  CAMERA_ANIMATION_MS,
  DRIVER_DOT_RADIUS,
  DRIVER_DOT_STROKE_WIDTH,
  DRIVER_MIN_DISTANCE_M,
  DRIVER_ZOOM,
  MAP_STYLE_URL,
  ROUTE_LINE_WIDTH,
} from '../../config/map';
import { TEST_ROUTE_FROM, TEST_ROUTE_TO } from '../../config/routing';
import { labels } from '../../constants/labels';
import { useLanguage } from '../../i18n/useLanguage';
import { getRoute } from '../../services/routing';
import { borderWidth, color, opacity, radius, space, touch, type } from '../../theme/tokens';

const SAFE_EDGES = ['top', 'bottom'];
const CAMERA_PADDING = { top: space[6], right: space[6], bottom: space[6], left: space[6] };
const ROUTE_LAYOUT = { 'line-join': 'round', 'line-cap': 'round' };
const ROUTE_PAINT = { 'line-color': color.primary, 'line-width': ROUTE_LINE_WIDTH };
const DRIVER_PAINT = {
  'circle-radius': DRIVER_DOT_RADIUS,
  'circle-color': color.primary,
  'circle-stroke-width': DRIVER_DOT_STROKE_WIDTH,
  'circle-stroke-color': color.surface,
};

// Bounding box [west, south, east, north] of a [lng, lat] list.
function boundsOf(coordinates) {
  let west = Infinity;
  let south = Infinity;
  let east = -Infinity;
  let north = -Infinity;
  for (const [lng, lat] of coordinates) {
    west = Math.min(west, lng);
    south = Math.min(south, lat);
    east = Math.max(east, lng);
    north = Math.max(north, lat);
  }
  return [west, south, east, north];
}

const fill = (template, values) =>
  Object.entries(values).reduce((text, [key, value]) => text.replace(`{${key}}`, value), template);

const decimal = (value, digits) => value.toFixed(digits).replace('.', ',');

export function MapTestScreen({ navigation }) {
  useLanguage();
  const cameraRef = useRef(null);
  // route: { status: 'loading' | 'ready' | 'error', data }
  const [route, setRoute] = useState({ status: 'loading', data: null });
  const [mapKey, setMapKey] = useState(0);
  const [mapFailed, setMapFailed] = useState(false);
  // location: { status: 'pending' | 'granted' | 'denied' | 'unavailable', coords: [lng, lat] | null }
  const [location, setLocation] = useState({ status: 'pending', coords: null });
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // One routing request per load or retry, never in a loop.
  const loadRoute = useCallback(async () => {
    setRoute({ status: 'loading', data: null });
    try {
      const data = await getRoute(TEST_ROUTE_FROM, TEST_ROUTE_TO, { allowFallback: true });
      if (mountedRef.current) setRoute({ status: 'ready', data });
    } catch {
      if (mountedRef.current) setRoute({ status: 'error', data: null });
    }
  }, []);

  useEffect(() => {
    loadRoute();
  }, [loadRoute]);

  // Foreground permission, then a position watch that is removed when the screen unmounts.
  useEffect(() => {
    let cancelled = false;
    let subscription = null;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (cancelled) return;
        if (status !== Location.PermissionStatus.GRANTED) {
          setLocation({ status: 'denied', coords: null });
          return;
        }
        const watch = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, distanceInterval: DRIVER_MIN_DISTANCE_M },
          (position) => {
            if (cancelled) return;
            const { longitude, latitude } = position.coords;
            setLocation({ status: 'granted', coords: [longitude, latitude] });
          },
          () => {
            if (!cancelled) setLocation((prev) => (prev.coords ? prev : { status: 'unavailable', coords: null }));
          },
        );
        if (cancelled) watch.remove();
        else subscription = watch;
      } catch {
        if (!cancelled) setLocation({ status: 'unavailable', coords: null });
      }
    })();
    return () => {
      cancelled = true;
      if (subscription) subscription.remove();
    };
  }, []);

  const routeFeature = useMemo(
    () =>
      route.data
        ? {
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: route.data.coordinates },
          }
        : null,
    [route.data],
  );

  const routeBounds = useMemo(() => (route.data ? boundsOf(route.data.coordinates) : null), [route.data]);

  const driverFeature = useMemo(
    () =>
      location.coords
        ? { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: location.coords } }
        : null,
    [location.coords],
  );

  const handleMapFailed = useCallback(() => setMapFailed(true), []);

  const handleMapRetry = useCallback(() => {
    setMapFailed(false);
    setMapKey((key) => key + 1);
  }, []);

  const showRoute = useCallback(() => {
    if (routeBounds) {
      cameraRef.current?.fitBounds(routeBounds, { padding: CAMERA_PADDING, duration: CAMERA_ANIMATION_MS });
    }
  }, [routeBounds]);

  const showMe = useCallback(() => {
    if (location.coords) {
      cameraRef.current?.easeTo({ center: location.coords, zoom: DRIVER_ZOOM, duration: CAMERA_ANIMATION_MS });
    }
  }, [location.coords]);

  let body;
  if (route.status === 'loading') {
    body = <ScreenState kind="loading" />;
  } else if (route.status === 'error') {
    body = (
      <View style={styles.stateBox}>
        <Text style={styles.hint}>{labels.mapTest.routeErrorHint}</Text>
        <ScreenState kind="error" onRetry={loadRoute} />
      </View>
    );
  } else if (mapFailed) {
    body = (
      <View style={styles.stateBox}>
        <Text style={styles.hint}>{labels.mapTest.mapErrorHint}</Text>
        <ScreenState kind="error" onRetry={handleMapRetry} />
      </View>
    );
  } else {
    body = (
      <View style={styles.mapBox}>
        <MapLibreMap
          key={mapKey}
          testID="map-test-map"
          style={styles.map}
          mapStyle={MAP_STYLE_URL}
          onDidFailLoadingMap={handleMapFailed}
        >
          <Camera ref={cameraRef} initialViewState={{ bounds: routeBounds, padding: CAMERA_PADDING }} />
          <GeoJSONSource id="map-test-route" data={routeFeature}>
            <Layer type="line" id="map-test-route-line" layout={ROUTE_LAYOUT} paint={ROUTE_PAINT} />
          </GeoJSONSource>
          {driverFeature ? (
            <GeoJSONSource id="map-test-driver" data={driverFeature}>
              <Layer type="circle" id="map-test-driver-dot" paint={DRIVER_PAINT} />
            </GeoJSONSource>
          ) : null}
        </MapLibreMap>
        <View style={styles.attribution} pointerEvents="none">
          <Text style={styles.attributionText}>{labels.mapTest.attribution}</Text>
        </View>
      </View>
    );
  }

  const routeData = route.status === 'ready' ? route.data : null;
  let providerNotice = null;
  if (routeData?.provider === 'fallback') providerNotice = labels.mapTest.fallbackNotice;
  if (routeData?.provider === 'straight') providerNotice = labels.mapTest.straightNotice;

  let locationText = labels.mapTest.locationPending;
  if (location.status === 'denied') locationText = labels.mapTest.locationDenied;
  if (location.status === 'unavailable') locationText = labels.mapTest.locationUnavailable;
  if (location.coords) {
    locationText = fill(labels.mapTest.locationReady, {
      lat: decimal(location.coords[1], 5),
      lng: decimal(location.coords[0], 5),
    });
  }

  const mapVisible = routeData && !mapFailed;

  return (
    <SafeAreaView testID="screen-map-test" edges={SAFE_EDGES} style={styles.screen}>
      <ScreenHeader title={labels.mapTest.title} leading="back" onLeadingPress={() => navigation.goBack()} />
      {body}
      <View style={styles.panel}>
        {providerNotice ? (
          <Text testID="map-test-provider-notice" style={styles.notice}>
            {providerNotice}
          </Text>
        ) : null}
        {routeData ? (
          <Text style={[styles.info, type.numeric]}>
            {fill(labels.mapTest.routeSummary, {
              km: decimal(routeData.distanceM / 1000, 1),
              min: String(Math.max(1, Math.round(routeData.durationS / 60))),
            })}
          </Text>
        ) : null}
        <Text
          testID="map-test-location"
          style={[styles.info, location.status === 'denied' && styles.notice, type.numeric]}
        >
          {locationText}
        </Text>
        {mapVisible ? (
          <View style={styles.row}>
            <SecondaryButton testID="map-test-show-route" label={labels.mapTest.showRoute} onPress={showRoute} />
            <SecondaryButton
              testID="map-test-show-me"
              label={labels.mapTest.showMe}
              onPress={showMe}
              disabled={!location.coords}
            />
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

function SecondaryButton({ testID, label, onPress, disabled = false }) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.secondary, pressed && styles.pressed, disabled && styles.disabled]}
    >
      <Text style={styles.secondaryText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: color.bg,
  },
  stateBox: {
    flex: 1,
    paddingHorizontal: space[4],
    paddingTop: space[4],
    gap: space[2],
  },
  hint: {
    ...type.body,
    color: color.text,
  },
  mapBox: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  attribution: {
    position: 'absolute',
    top: space[2],
    left: space[2],
    right: space[2],
    paddingHorizontal: space[2],
    paddingVertical: space[1],
    backgroundColor: color.surface,
    borderRadius: radius.sm,
  },
  attributionText: {
    ...type.caption,
    color: color.textMuted,
  },
  panel: {
    gap: space[2],
    paddingHorizontal: space[4],
    paddingVertical: space[3],
    backgroundColor: color.surface,
  },
  notice: {
    ...type.body,
    color: color.warning,
  },
  info: {
    ...type.body,
    color: color.text,
  },
  row: {
    flexDirection: 'row',
    gap: touch.gap,
  },
  secondary: {
    flex: 1,
    minHeight: touch.controlHeight,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: space[3],
    borderWidth: borderWidth.thin,
    borderColor: color.border,
    borderRadius: radius.md,
    backgroundColor: color.surface,
  },
  pressed: {
    opacity: opacity.pressed,
  },
  disabled: {
    opacity: opacity.disabled,
  },
  secondaryText: {
    ...type.label,
    color: color.text,
    textAlign: 'center',
  },
});

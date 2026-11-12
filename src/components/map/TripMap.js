// AI-assisted: see docs/AI_LOG.md #54 (driver drawn as a car marker, R3)
// AI-assisted: see docs/AI_LOG.md #43
// AI-assisted: see docs/AI_LOG.md #57 (Home: centerOnce mode and recenter signal, H-1)
// Shared trip map (T-44): MapLibre with the OpenFreeMap style, the route of the current leg as a
// GeoJSON line, the target point (pickup or destination) and the driver car marker. The camera follows the
// driver while `follow` is on. A failed style load shows the error with a retry that remounts the
// Map (new key). Home uses `centerOnce` instead: Colombia framing until the first position, then one
// neighborhood-zoom centering; later positions never move the camera. A changed `recenterSignal`
// recenters on demand. The trip detail (T-110) passes `fitBounds` ([west, south, east, north]): the
// initial camera frames those bounds with no animation (so reduce motion needs nothing special). The attribution is always shown as on-screen text over the map.
// AI-assisted: see docs/AI_LOG.md #57 (design round 1: H1, H2)
// `interactive={false}` makes only the map ignore touches (the retry button of the error box keeps working) and
// `mapA11yLabel` then labels the map as one element. `attributionInsetRight` / `attributionInsetBottom` reserve room
// for the bottom attribution (Home keeps the "My location" button clear of it); they default to 0.
// Points arrive as { lat, lng }; GeoJSON and MapLibre use [lng, lat].

import { Camera, GeoJSONSource, Layer, Map as MapLibreMap } from '@maplibre/maplibre-react-native';
import { AccessibilityInfo, StyleSheet, Text, View } from 'react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CAMERA_ANIMATION_MS,
  COLOMBIA_CENTER,
  COLOMBIA_ZOOM,
  DRIVER_ZOOM,
  MAP_STYLE_URL,
  ROUTE_FIT_PADDING,
  ROUTE_LINE_WIDTH,
} from '../../config/map';
import { labels } from '../../constants/labels';
import { recenterAction, shouldCenterOnFirstFix } from '../../services/map/cameraPolicy';
import { color, mapMarker, radius, space, type } from '../../theme/tokens';
import { CarMarker } from './CarMarker';
import { SecondaryButton } from '../SecondaryButton';

const ROUTE_LAYOUT = { 'line-join': 'round', 'line-cap': 'round' };
const ROUTE_PAINT = { 'line-color': color.primary, 'line-width': ROUTE_LINE_WIDTH };
const ROUTE_APPROX_PAINT = { ...ROUTE_PAINT, 'line-dasharray': [2, 2] };
// AI-assisted: see docs/AI_LOG.md #53
// Driver: car glyph in a badge (CarMarker). Target: hollow ring. Shape tells them apart, not only colour.
const TARGET_PAINT = {
  'circle-radius': mapMarker.targetRadius,
  'circle-color': color.surface,
  'circle-stroke-width': mapMarker.targetStroke,
  'circle-stroke-color': color.success,
};

const toLngLat = (point) => [point.lng, point.lat];
const pointFeature = (point) =>
  point ? { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: toLngLat(point) } } : null;

export function TripMap({ testID, position, target, routeCoordinates, approximate = false, follow = true, centerOnce = false, recenterSignal = 0, vehicleColorValue, attributionAtBottom = false, fitBounds, interactive = true, mapA11yLabel, attributionInsetRight = 0, attributionInsetBottom = 0 }) {
  const cameraRef = useRef(null);
  const [mapKey, setMapKey] = useState(0);
  const [failed, setFailed] = useState(false);

  const center = position ?? target;
  // Initial camera only; later moves go through easeTo so the map never jumps back.
  // Home (centerOnce) without a position starts on Colombia, not on the world.
  const [initialView] = useState(() => {
    if (fitBounds) {
      const inset = ROUTE_FIT_PADDING;
      return { bounds: fitBounds, padding: { top: inset, right: inset, bottom: inset, left: inset } };
    }
    if (center) return { center: toLngLat(center), zoom: DRIVER_ZOOM };
    return centerOnce ? { center: COLOMBIA_CENTER, zoom: COLOMBIA_ZOOM } : undefined;
  });
  const centeredRef = useRef(!!position);
  const lastSignalRef = useRef(recenterSignal);
  const mountedRef = useRef(true);
  const positionRef = useRef(position);
  positionRef.current = position;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Moves the camera as decided by cameraPolicy; "reduce motion" jumps without animation.
  const moveCamera = useCallback((pos) => {
    const read = AccessibilityInfo.isReduceMotionEnabled
      ? AccessibilityInfo.isReduceMotionEnabled().catch(() => false)
      : Promise.resolve(false);
    read.then((reduceMotion) => {
      if (!mountedRef.current) return;
      const action = recenterAction({ position: pos, reduceMotion });
      if (action) cameraRef.current?.easeTo(action);
    });
  }, []);

  const routeFeature = useMemo(
    () =>
      routeCoordinates && routeCoordinates.length > 1
        ? { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: routeCoordinates } }
        : null,
    [routeCoordinates],
  );
  const targetFeature = useMemo(() => pointFeature(target), [target]);

  const lng = position?.lng;
  const lat = position?.lat;
  useEffect(() => {
    if (!follow || typeof lng !== 'number' || typeof lat !== 'number') return;
    cameraRef.current?.easeTo({ center: [lng, lat], duration: CAMERA_ANIMATION_MS });
  }, [follow, lng, lat, mapKey]);

  // Home: center once with the first position; the user may then pan freely.
  useEffect(() => {
    if (!centerOnce || !shouldCenterOnFirstFix({ alreadyCentered: centeredRef.current, position: positionRef.current })) return;
    centeredRef.current = true;
    moveCamera(positionRef.current);
  }, [centerOnce, lng, lat, mapKey, moveCamera]);

  // Home: the "My location" button bumps the signal; no position means nothing happens.
  useEffect(() => {
    if (recenterSignal === lastSignalRef.current) return;
    lastSignalRef.current = recenterSignal;
    moveCamera(positionRef.current);
  }, [recenterSignal, moveCamera]);

  const handleFailed = useCallback(() => setFailed(true), []);
  const handleRetry = useCallback(() => {
    setFailed(false);
    centeredRef.current = false;
    setMapKey((key) => key + 1);
  }, []);

  if (failed) {
    return (
      <View testID={testID ? `${testID}-error` : undefined} style={styles.errorBox} accessibilityLiveRegion="polite">
        <Text style={styles.errorText}>{labels.trip.mapError}</Text>
        <SecondaryButton testID="trip-map-retry" label={labels.actions.retry} onPress={handleRetry} />
      </View>
    );
  }

  const map = (
    <MapLibreMap key={mapKey} testID={testID} style={styles.map} mapStyle={MAP_STYLE_URL} onDidFailLoadingMap={handleFailed}>
        <Camera ref={cameraRef} initialViewState={initialView} />
        {routeFeature ? (
          <GeoJSONSource id="trip-route" data={routeFeature}>
            <Layer
              type="line"
              id="trip-route-line"
              layout={ROUTE_LAYOUT}
              paint={approximate ? ROUTE_APPROX_PAINT : ROUTE_PAINT}
            />
          </GeoJSONSource>
        ) : null}
        {targetFeature ? (
          <GeoJSONSource id="trip-target" data={targetFeature}>
            <Layer type="circle" id="trip-target-dot" paint={TARGET_PAINT} />
          </GeoJSONSource>
        ) : null}
        {typeof lng === 'number' && typeof lat === 'number' ? (
          <CarMarker lng={lng} lat={lat} vehicleColorValue={vehicleColorValue} />
        ) : null}
      </MapLibreMap>
  );
  const attributionInset = attributionAtBottom
    ? { bottom: space[2] + attributionInsetBottom, ...(attributionInsetRight > 0 ? { right: attributionInsetRight } : null) }
    : null;

  return (
    <View style={styles.box}>
      {interactive ? (
        map
      ) : (
        <View style={styles.box} accessible={!!mapA11yLabel} accessibilityLabel={mapA11yLabel} pointerEvents="none">
          {map}
        </View>
      )}
      <View style={[styles.attribution, attributionAtBottom && styles.attributionBottom, attributionInset]} pointerEvents="none">
        <Text style={styles.attributionText}>{labels.mapTest.attribution}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
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
  // AI-assisted: see docs/AI_LOG.md #55 (Home: the top of the map holds the floating card)
  attributionBottom: {
    top: undefined,
    bottom: space[2],
    right: undefined,
  },
  attributionText: {
    ...type.caption,
    color: color.textMuted,
  },
  errorBox: {
    flex: 1,
    justifyContent: 'center',
    gap: space[3],
    paddingHorizontal: space[4],
    backgroundColor: color.bg,
  },
  errorText: {
    ...type.body,
    color: color.text,
  },
});

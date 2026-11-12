// AI-assisted: see docs/AI_LOG.md #54 (driver drawn as a car marker, R3)
// AI-assisted: see docs/AI_LOG.md #43
// Shared trip map (T-44): MapLibre with the OpenFreeMap style, the route of the current leg as a
// GeoJSON line, the target point (pickup or destination) and the driver car marker. The camera follows the
// driver while `follow` is on. A failed style load shows the error with a retry that remounts the
// Map (new key). The attribution is always shown as on-screen text over the map.
// Points arrive as { lat, lng }; GeoJSON and MapLibre use [lng, lat].

import { Camera, GeoJSONSource, Layer, Map as MapLibreMap } from '@maplibre/maplibre-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  CAMERA_ANIMATION_MS,
  DRIVER_ZOOM,
  MAP_STYLE_URL,
  ROUTE_LINE_WIDTH,
} from '../../config/map';
import { labels } from '../../constants/labels';
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

export function TripMap({ testID, position, target, routeCoordinates, approximate = false, follow = true, vehicleColorValue }) {
  const cameraRef = useRef(null);
  const [mapKey, setMapKey] = useState(0);
  const [failed, setFailed] = useState(false);

  const center = position ?? target;
  // Initial camera only; later moves go through easeTo so the map never jumps back.
  const [initialView] = useState(() => (center ? { center: toLngLat(center), zoom: DRIVER_ZOOM } : undefined));

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

  const handleFailed = useCallback(() => setFailed(true), []);
  const handleRetry = useCallback(() => {
    setFailed(false);
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

  return (
    <View style={styles.box}>
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
      <View style={styles.attribution} pointerEvents="none">
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

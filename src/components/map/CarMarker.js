// AI-assisted: see AI_LOG.md #54
// Driver marker (R3): an Ionicons car glyph tinted with the registered vehicle colour, inside a round badge
// (dark for light colours, white otherwise) with a dark token ring and a card shadow. Decorative (hidden from screen readers) and static: no animation.

import { Marker } from '@maplibre/maplibre-react-native';
import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { borderWidth, carMarker, elevation, radius } from '../../theme/tokens';
import { vehicleBadgeToken, vehicleColorToken } from '../../utils/vehicleColor';
import { Icon } from '../Icon';

function CarMarkerBase({ lng, lat, vehicleColorValue }) {
  const lngLat = useMemo(() => [lng, lat], [lng, lat]);
  const tint = vehicleColorToken(vehicleColorValue);
  const badgeFill = vehicleBadgeToken(vehicleColorValue);

  return (
    <Marker id="trip-driver-car" lngLat={lngLat}>
      <View
        style={[styles.badge, { backgroundColor: badgeFill }]}
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Icon name="car" size={carMarker.glyph} tint={tint} />
      </View>
    </Marker>
  );
}

export const CarMarker = memo(CarMarkerBase);

const styles = StyleSheet.create({
  badge: {
    width: carMarker.badge,
    height: carMarker.badge,
    borderRadius: radius.full,
    borderWidth: borderWidth.thick,
    borderColor: carMarker.ring,
    ...elevation.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

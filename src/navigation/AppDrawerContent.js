// AI-assisted: see docs/AI_LOG.md #54 (the active entry keeps its fill while pressed)
// AI-assisted: see docs/AI_LOG.md #19
// AI-assisted: see docs/AI_LOG.md #52 (new drawer: brand header with profile, icon items, footer)
// Custom drawer panel. A solid brand header (photo, name, vehicle, availability) built only from data
// already in the contexts, four icon + text entries (outline when inactive, filled when active, soft
// pill plus a left accent bar for the focused one) and a discreet footer. Routes, labels, testIDs and
// the press behavior are unchanged. Entries only set a minimum height, so they grow with the text scale.

import { CommonActions, DrawerActions } from '@react-navigation/native';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import appConfig from '../../app.json';
import { Icon } from '../components/Icon';
import { labels } from '../constants/labels';
import { useAppState } from '../context/AppStateContext';
import { useAvailability } from '../context/AvailabilityContext';
import {
  accentWidth,
  avatarSize,
  borderWidth,
  color,
  iconSize,
  opacity,
  radius,
  shapeSize,
  space,
  touch,
  type,
} from '../theme/tokens';

// Home is intentionally not listed: it is the initial route and the way back.
const ITEMS = [
  {
    route: 'Profile',
    testID: 'drawer-profile',
    label: labels.drawer.profile,
    a11yLabel: labels.a11y.drawerItems.profile,
    icon: 'person',
  },
  {
    route: 'History',
    testID: 'drawer-history',
    label: labels.drawer.history,
    a11yLabel: labels.a11y.drawerItems.history,
    icon: 'time',
  },
  {
    route: 'Earnings',
    testID: 'drawer-earnings',
    label: labels.drawer.earnings,
    a11yLabel: labels.a11y.drawerItems.earnings,
    icon: 'cash',
  },
  {
    route: 'Settings',
    testID: 'drawer-settings',
    label: labels.drawer.settings,
    a11yLabel: labels.a11y.drawerItems.settings,
    icon: 'settings',
  },
];

function DrawerHeader({ topInset }) {
  const { driverProfile } = useAppState();
  const { isAvailable } = useAvailability();
  const personal = driverProfile?.personalData;
  const vehicle = driverProfile?.vehicle;
  const name = personal?.fullName;
  const vehicleText = [vehicle?.brand, vehicle?.model].filter(Boolean).join(' ');
  const plate = vehicle?.plate;

  return (
    <View style={[styles.header, { paddingTop: topInset + space[4] }]}>
      <View style={styles.shape} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden />
      <Text accessibilityRole="header" numberOfLines={1} style={styles.appName}>
        {labels.drawer.title}
      </Text>
      <View style={styles.profileRow}>
        {personal?.profilePhotoUrl ? (
          <Image source={{ uri: personal.profilePhotoUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarEmpty]}>
            <Icon name="person" size={iconSize.lg} tint={color.onPrimarySoft} />
          </View>
        )}
        <View style={styles.profileText}>
          {name ? (
            <Text numberOfLines={2} style={styles.name}>
              {name}
            </Text>
          ) : null}
          {vehicleText ? (
            <Text numberOfLines={1} style={styles.vehicle}>
              {vehicleText}
            </Text>
          ) : null}
          {plate ? (
            <Text numberOfLines={1} style={styles.vehicle}>
              {plate}
            </Text>
          ) : null}
        </View>
      </View>
      <View style={[styles.status, isAvailable ? styles.statusOn : styles.statusOff]}>
        <View style={[styles.dot, isAvailable ? styles.dotOn : styles.dotOff]} />
        <Text style={[styles.statusText, isAvailable ? styles.statusTextOn : styles.statusTextOff]}>
          {isAvailable ? labels.home.available : labels.home.unavailable}
        </Text>
      </View>
    </View>
  );
}

export function AppDrawerContent({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const focusedName = state.routes[state.index].name;

  return (
    <View style={styles.container}>
      <DrawerHeader topInset={insets.top} />
      <View style={styles.list}>
        {ITEMS.map((item) => {
          const route = state.routes.find((candidate) => candidate.name === item.route);
          const focused = item.route === focusedName;

          // Same behavior as the library item list: ask listeners first, then close the drawer when
          // the destination is already focused, otherwise navigate (which also closes the drawer).
          const handlePress = () => {
            const event = navigation.emit({
              type: 'drawerItemPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!event.defaultPrevented) {
              navigation.dispatch({
                ...(focused
                  ? DrawerActions.closeDrawer()
                  : CommonActions.navigate(route.name, route.params)),
                target: state.key,
              });
            }
          };

          return (
            <Pressable
              key={item.route}
              testID={item.testID}
              accessibilityRole="button"
              accessibilityLabel={item.a11yLabel}
              accessibilityState={{ selected: focused }}
              onPress={handlePress}
              style={({ pressed }) => [
                styles.item,
                focused && styles.itemActive,
                pressed && styles.itemPressed,
                pressed && !focused && styles.itemPressedIdle,
              ]}
            >
              {focused ? <View style={styles.accent} /> : null}
              <Icon
                name={focused ? item.icon : `${item.icon}-outline`}
                size={iconSize.lg}
                tint={focused ? color.onPrimarySoft : color.textMuted}
              />
              <Text
                allowFontScaling
                style={[styles.itemText, focused ? styles.itemTextActive : styles.itemTextInactive]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={[styles.footer, { paddingBottom: insets.bottom + space[4] }]}>
        <Text style={styles.footerText}>
          {labels.appName} · {String(appConfig.expo.version)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // The drawer panel has a defined height, so this flex is a height fill, not auto-height content.
  container: {
    flex: 1,
    backgroundColor: color.surface,
  },
  header: {
    overflow: 'hidden',
    paddingHorizontal: space[4],
    paddingBottom: space[5],
    gap: space[4],
    backgroundColor: color.primaryDark,
  },
  shape: {
    position: 'absolute',
    top: -shapeSize / 3,
    right: -shapeSize / 3,
    width: shapeSize,
    height: shapeSize,
    borderRadius: shapeSize / 2,
    backgroundColor: color.primary,
  },
  appName: {
    ...type.label,
    color: color.onBrandMuted,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  avatar: {
    width: avatarSize.md,
    height: avatarSize.md,
    borderRadius: avatarSize.md / 2,
    borderWidth: borderWidth.thick,
    borderColor: color.onBrand,
    backgroundColor: color.primarySoft,
  },
  avatarEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    flex: 1,
    gap: space[0],
  },
  name: {
    ...type.heading,
    color: color.onBrand,
  },
  vehicle: {
    ...type.small,
    color: color.onBrandMuted,
  },
  status: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    minHeight: touch.min - space[2],
    paddingHorizontal: space[3],
    borderRadius: radius.full,
  },
  statusOn: { backgroundColor: color.successSoft },
  statusOff: { backgroundColor: color.surfaceMuted },
  dot: {
    width: space[2],
    height: space[2],
    borderRadius: radius.full,
  },
  dotOn: { backgroundColor: color.success },
  dotOff: { backgroundColor: color.textMuted },
  statusText: { ...type.label },
  statusTextOn: { color: color.onSuccessSoft },
  statusTextOff: { color: color.textMuted },
  list: {
    flex: 1,
    paddingHorizontal: space[3],
    paddingTop: space[4],
    gap: space[1],
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    minHeight: touch.controlHeight,
    paddingHorizontal: space[4],
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  itemActive: {
    backgroundColor: color.primarySoft,
  },
  itemPressed: {
    opacity: opacity.pressed,
  },
  itemPressedIdle: {
    backgroundColor: color.surfaceMuted,
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: space[2],
    bottom: space[2],
    width: accentWidth,
    borderRadius: radius.sm,
    backgroundColor: color.primary,
  },
  itemText: {
    ...type.bodyStrong,
    flexShrink: 1,
  },
  itemTextActive: {
    color: color.onPrimarySoft,
  },
  itemTextInactive: {
    color: color.textMuted,
    fontFamily: type.body.fontFamily,
  },
  footer: {
    paddingHorizontal: space[4],
    paddingTop: space[3],
    borderTopWidth: borderWidth.thin,
    borderTopColor: color.borderSubtle,
  },
  footerText: {
    ...type.caption,
    color: color.textMuted,
  },
});

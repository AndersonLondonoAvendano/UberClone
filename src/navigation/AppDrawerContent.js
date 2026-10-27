// AI-assisted: see docs/AI_LOG.md #19
// Custom drawer panel: a title and exactly four plain text entries. Flat surface, no icons, no border
// or shadow. The focused destination is marked by weight, underline and text color (no accent fill).
// Entries only set a minimum height, so they grow with the content and the text scale.

import { CommonActions, DrawerActions } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { labels } from '../constants/labels';
import { color, opacity, space, touch, type } from '../theme/tokens';

// Home is intentionally not listed: it is the initial route and the way back.
const ITEMS = [
  {
    route: 'Profile',
    testID: 'drawer-profile',
    label: labels.drawer.profile,
    a11yLabel: labels.a11y.drawerItems.profile,
  },
  {
    route: 'History',
    testID: 'drawer-history',
    label: labels.drawer.history,
    a11yLabel: labels.a11y.drawerItems.history,
  },
  {
    route: 'Earnings',
    testID: 'drawer-earnings',
    label: labels.drawer.earnings,
    a11yLabel: labels.a11y.drawerItems.earnings,
  },
  {
    route: 'Settings',
    testID: 'drawer-settings',
    label: labels.drawer.settings,
    a11yLabel: labels.a11y.drawerItems.settings,
  },
];

export function AppDrawerContent({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const focusedName = state.routes[state.index].name;

  const containerStyle = [
    styles.container,
    {
      paddingTop: insets.top + space[4],
      paddingBottom: insets.bottom + space[5],
    },
  ];

  return (
    <View style={containerStyle}>
      <Text accessibilityRole="header" style={styles.title}>
        {labels.drawer.title}
      </Text>
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
              style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
            >
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
    </View>
  );
}

const styles = StyleSheet.create({
  // The drawer panel has a defined height, so this flex is a height fill, not auto-height content.
  container: {
    flex: 1,
    backgroundColor: color.surface,
    paddingHorizontal: space[4],
  },
  title: {
    ...type.title,
    color: color.text,
    marginBottom: space[5],
  },
  list: {
    gap: touch.gap,
  },
  item: {
    minHeight: touch.controlHeight,
    justifyContent: 'center',
    paddingHorizontal: space[3],
  },
  itemPressed: {
    opacity: opacity.pressed,
  },
  itemText: {
    ...type.body,
  },
  itemTextActive: {
    color: color.text,
    fontWeight: type.title.fontWeight,
    textDecorationLine: 'underline',
  },
  itemTextInactive: {
    color: color.textMuted,
  },
});

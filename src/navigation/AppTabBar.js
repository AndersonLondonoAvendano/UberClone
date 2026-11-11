// AI-assisted: see docs/AI_LOG.md #16
// AI-assisted: see docs/AI_LOG.md #52 (icon per tab, soft brand pill when active)
// Custom bottom tab bar for the registration tabs. It lives in the layout flow below the scenes and
// its height comes from its content, so it grows with the text scale. Flat surface, no border or
// shadow; the active tab is a soft brand pill with a filled icon, heavier text and an underline, so it is
// never marked by color alone.

import { BottomTabBarHeightCallbackContext } from '@react-navigation/bottom-tabs';
import { CommonActions } from '@react-navigation/native';
import { useCallback, useContext, useEffect, useState } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../components/Icon';
import { color, iconSize, opacity, radius, space, touch, type } from '../theme/tokens';

const TAB_ICONS = { PersonalData: 'person', Vehicle: 'car', Documents: 'document-text' };

// Same keyboard events the library uses for its hide-on-keyboard option.
function useKeyboardVisible() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return undefined;
    }
    const showSub = Keyboard.addListener('keyboardDidShow', () => setVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return visible;
}

function tabText(options, route) {
  if (typeof options.tabBarLabel === 'string') {
    return options.tabBarLabel;
  }
  if (typeof options.title === 'string') {
    return options.title;
  }
  return route.name;
}

export function AppTabBar({ state, descriptors, navigation, insets }) {
  const keyboardVisible = useKeyboardVisible();
  const onHeightChange = useContext(BottomTabBarHeightCallbackContext);

  useEffect(() => {
    if (keyboardVisible && onHeightChange) {
      onHeightChange(0);
    }
  }, [keyboardVisible, onHeightChange]);

  // Reports the real bar height to the navigator so screens and the diagnostic read the true value.
  const handleLayout = useCallback(
    (event) => {
      if (onHeightChange) {
        onHeightChange(event.nativeEvent.layout.height);
      }
    },
    [onHeightChange]
  );

  if (keyboardVisible) {
    return null;
  }

  const containerStyle = [
    styles.container,
    { paddingBottom: insets.bottom, paddingHorizontal: Math.max(insets.left, insets.right) },
  ];

  return (
    <View role="tablist" onLayout={handleLayout} style={containerStyle}>
      {state.routes.map((route, index) => {
        const focused = index === state.index;
        const { options } = descriptors[route.key];
        const iconName = TAB_ICONS[route.name] ?? 'ellipse';

        const handlePress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.dispatch({
              ...CommonActions.navigate(route.name, route.params),
              target: state.key,
            });
          }
        };

        const handleLongPress = () => {
          navigation.emit({ type: 'tabLongPress', target: route.key });
        };

        return (
          <Pressable
            key={route.key}
            testID={options.tabBarButtonTestID}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={handlePress}
            onLongPress={handleLongPress}
            style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}
          >
            <View style={[styles.pill, focused && styles.pillActive]}>
              <Icon
                name={focused ? iconName : `${iconName}-outline`}
                size={iconSize.lg}
                tint={focused ? color.onPrimarySoft : color.textMuted}
              />
              <Text
                allowFontScaling
                numberOfLines={1}
                style={[styles.label, focused ? styles.labelActive : styles.labelInactive]}
              >
                {tabText(options, route)}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: color.surface,
  },
  tab: {
    flex: 1,
    minHeight: touch.controlHeight,
    marginHorizontal: space[1],
    paddingVertical: space[2],
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabPressed: {
    opacity: opacity.pressed,
  },
  pill: {
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: space[0],
    paddingVertical: space[1],
    paddingHorizontal: space[2],
    borderRadius: radius.lg,
  },
  pillActive: {
    backgroundColor: color.primarySoft,
  },
  label: {
    ...type.label,
    textAlign: 'center',
  },
  labelActive: {
    color: color.onPrimarySoft,
    fontFamily: type.bodyStrong.fontFamily,
    textDecorationLine: 'underline',
  },
  labelInactive: {
    color: color.textMuted,
  },
});

// AI-assisted: see docs/AI_LOG.md #16
// Custom bottom tab bar for the registration tabs. It lives in the layout flow below the scenes and
// its height comes from its content, so it grows with the text scale. Flat surface, no border or
// shadow; the active tab is marked by weight, underline and text color (no accent fill).

import { BottomTabBarHeightCallbackContext } from '@react-navigation/bottom-tabs';
import { CommonActions } from '@react-navigation/native';
import { useCallback, useContext, useEffect, useState } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { color, opacity, space, touch, type } from '../theme/tokens';

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
            <Text
              allowFontScaling
              style={[styles.label, focused ? styles.labelActive : styles.labelInactive]}
            >
              {tabText(options, route)}
            </Text>
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
  label: {
    ...type.label,
    textAlign: 'center',
  },
  labelActive: {
    color: color.text,
    fontWeight: type.title.fontWeight,
    textDecorationLine: 'underline',
  },
  labelInactive: {
    color: color.textMuted,
  },
});

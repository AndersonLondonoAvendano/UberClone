// AI-assisted: see docs/AI_LOG.md #54 (tabs stack at large font scales so the names are never cut)
// AI-assisted: see docs/AI_LOG.md #16
// AI-assisted: see docs/AI_LOG.md #52 (icon per tab, soft brand pill when active)
// AI-assisted: see docs/AI_LOG.md #60 (short one-line labels, no underline, account menu)
// Custom bottom tab bar for the registration tabs. It lives in the layout flow below the scenes and
// its height comes from its content, so it grows with the text scale. Flat surface, no border or
// shadow; the active tab is a soft brand pill with a filled icon (outline when inactive), brand color and
// semibold text, so it is never marked by color alone. The labels are short and stay on one line.
// An account button at the end opens an in-line menu with the masked email and "Cerrar sesión".

import { BottomTabBarHeightCallbackContext } from '@react-navigation/bottom-tabs';
import { CommonActions } from '@react-navigation/native';
import { useCallback, useContext, useEffect, useState } from 'react';
import {
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Icon } from '../components/Icon';
import { InlineSignOut } from '../components/registration/InlineSignOut';
import { labels } from '../constants/labels';
import { useAppState } from '../context/AppStateContext';
import { borderWidth, color, iconSize, opacity, radius, space, touch, type } from '../theme/tokens';
import { maskEmail } from '../utils/mask';

// From this font scale on the tabs stack vertically: three names no longer fit side by side.
// AI-assisted: see docs/AI_LOG.md #54 (so "Documentos" is never split mid-word)
const STACK_FONT_SCALE = 1.15;
// Caps the tab label scaling so the stacked bar does not eat the screen at 200 %.
const LABEL_MAX_FONT_MULTIPLIER = 1.5;
// The account menu never covers more than this share of the window height (it scrolls instead).
const MENU_MAX_HEIGHT_RATIO = 0.6;
const TAB_ICONS = { PersonalData: 'person', Vehicle: 'car', Documents: 'document-text' };
const ACCOUNT_COPY = labels.registrationFlow.account;

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
  const { fontScale, height: windowHeight } = useWindowDimensions();
  const { authUser } = useAppState();
  const [menuOpen, setMenuOpen] = useState(false);
  const stacked = fontScale >= STACK_FONT_SCALE;
  const maskedEmail = maskEmail(authUser?.email);

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

  const toggleMenu = useCallback(() => setMenuOpen((open) => !open), []);

  if (keyboardVisible) {
    return null;
  }

  const outerStyle = [
    styles.container,
    { paddingBottom: insets.bottom, paddingHorizontal: Math.max(insets.left, insets.right) },
  ];

  return (
    <View onLayout={handleLayout} style={outerStyle}>
      {menuOpen ? (
        <ScrollView
          testID="registration-account-menu"
          style={{ maxHeight: windowHeight * MENU_MAX_HEIGHT_RATIO }}
          contentContainerStyle={styles.menu}
          keyboardShouldPersistTaps="handled"
        >
          {maskedEmail ? (
            <View style={styles.menuEmailRow}>
              <Icon name="person-circle-outline" size={iconSize.lg} tint={color.textMuted} />
              <Text
                testID="registration-account-email"
                accessibilityLabel={ACCOUNT_COPY.signedInAs.replace('{email}', maskedEmail)}
                style={styles.menuEmail}
              >
                {ACCOUNT_COPY.signedInAs.replace('{email}', maskedEmail)}
              </Text>
            </View>
          ) : null}
          <InlineSignOut trigger="button" />
        </ScrollView>
      ) : null}

      <View style={[styles.barRow, stacked && styles.barRowStacked]}>
        <View role="tablist" style={[styles.tabs, stacked && styles.tabsStacked]}>
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
              setMenuOpen(false);
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
                style={({ pressed }) => [styles.tab, stacked && styles.tabStacked, pressed && styles.tabPressed]}
              >
                <View style={[styles.pill, stacked && styles.pillStacked, focused && styles.pillActive]}>
                  <Icon
                    name={focused ? iconName : `${iconName}-outline`}
                    size={iconSize.lg}
                    tint={focused ? color.primary : color.textMuted}
                  />
                  <Text
                    allowFontScaling
                    maxFontSizeMultiplier={LABEL_MAX_FONT_MULTIPLIER}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.85}
                    style={[styles.label, focused ? styles.labelActive : styles.labelInactive]}
                  >
                    {tabText(options, route)}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          testID="registration-account-button"
          accessibilityRole="button"
          accessibilityLabel={menuOpen ? ACCOUNT_COPY.a11yClose : ACCOUNT_COPY.a11yOpen}
          accessibilityState={{ expanded: menuOpen }}
          onPress={toggleMenu}
          style={({ pressed }) => [styles.account, stacked && styles.accountStacked, pressed && styles.tabPressed]}
        >
          <View style={[styles.pill, stacked && styles.pillStacked, menuOpen && styles.pillActive]}>
            <Icon
              name={menuOpen ? 'person-circle' : 'person-circle-outline'}
              size={iconSize.lg}
              tint={menuOpen ? color.primary : color.textMuted}
            />
            {stacked ? (
              <Text
                maxFontSizeMultiplier={LABEL_MAX_FONT_MULTIPLIER}
                numberOfLines={1}
                style={[styles.label, menuOpen ? styles.labelActive : styles.labelInactive]}
              >
                {ACCOUNT_COPY.open}
              </Text>
            ) : null}
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: color.surface,
  },
  menu: {
    gap: space[3],
    padding: space[4],
    borderBottomWidth: borderWidth.thin,
    borderBottomColor: color.borderSubtle,
  },
  menuEmailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  menuEmail: {
    ...type.body,
    flex: 1,
    flexShrink: 1,
    color: color.text,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barRowStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  tabs: {
    flex: 1,
    flexDirection: 'row',
  },
  tabsStacked: {
    flex: 0,
    flexDirection: 'column',
  },
  tab: {
    flex: 1,
    minHeight: touch.controlHeight,
    marginHorizontal: space[1],
    paddingVertical: space[2],
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabStacked: {
    flex: 0,
  },
  account: {
    minHeight: touch.controlHeight,
    minWidth: touch.controlHeight,
    marginHorizontal: space[1],
    paddingVertical: space[2],
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountStacked: {
    alignItems: 'stretch',
  },
  tabPressed: {
    opacity: opacity.pressed,
  },
  pill: {
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: space[0],
    paddingVertical: space[1],
    paddingHorizontal: space[1],
    borderRadius: radius.lg,
  },
  pillStacked: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: space[2],
  },
  pillActive: {
    backgroundColor: color.primarySoft,
  },
  label: {
    ...type.caption,
    flexShrink: 1,
    textAlign: 'center',
  },
  labelActive: {
    color: color.primary,
    fontFamily: type.bodyStrong.fontFamily,
  },
  labelInactive: {
    color: color.textMuted,
  },
});

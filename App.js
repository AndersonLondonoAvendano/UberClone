// AI-assisted: see AI_LOG.md #8
// AI-assisted: see AI_LOG.md #13
// AI-assisted: see AI_LOG.md #15
// AI-assisted: see AI_LOG.md #18
// AI-assisted: see AI_LOG.md #19
// AI-assisted: see AI_LOG.md #20
// AI-assisted: see AI_LOG.md #67
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import { AppStateProvider } from './src/context/AppStateContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { color } from './src/theme/tokens';
import { initLanguage } from './src/i18n/initLanguage';

// AI-assisted: see AI_LOG.md #52 (Inter font, safe loading)
// Waits for Inter at most FONT_WAIT_MS. If the font fails or is slow the app continues with the
// system font; no style depends on the font being present.
const FONT_WAIT_MS = 3000;

function useInterReady() {
  const [loaded, error] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), FONT_WAIT_MS);
    return () => clearTimeout(timer);
  }, []);
  return loaded || error != null || timedOut;
}

// AI-assisted: see AI_LOG.md #67
// Resolves the language in the same boot gate as the fonts (capped at 1.5 s inside initLanguage,
// which never throws); the app starts in Spanish if anything goes wrong.
function useLanguageReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    initLanguage()
      .catch(() => {})
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);
  return ready;
}

// Navigation theme built only from design tokens. The accent is not used in the navigation chrome,
// so `primary` maps to the text color; fonts come from the library default (system fonts).
const NAVIGATION_THEME = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: color.bg,
    card: color.surface,
    text: color.text,
    border: color.border,
    primary: color.text,
    notification: color.danger,
  },
};

export default function App() {
  const fontsReady = useInterReady();
  const languageReady = useLanguageReady();
  if (!fontsReady || !languageReady) {
    return <View style={styles.boot} />;
  }
  return (
    <GestureHandlerRootView style={styles.fill}>
      <SafeAreaProvider>
        <AppStateProvider>
          {/* One status bar for every branch: dark icons over the light background. The library has
              no background color prop; the screens paint the area under the bar (edge-to-edge). */}
          <StatusBar style="dark" />
          <NavigationContainer theme={NAVIGATION_THEME}>
            <RootNavigator />
          </NavigationContainer>
        </AppStateProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  boot: { flex: 1, backgroundColor: color.bg },
});

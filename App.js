// AI-assisted: see docs/AI_LOG.md #8
// AI-assisted: see docs/AI_LOG.md #13
// AI-assisted: see docs/AI_LOG.md #15
// AI-assisted: see docs/AI_LOG.md #18
// AI-assisted: see docs/AI_LOG.md #19
// AI-assisted: see docs/AI_LOG.md #20
import { StyleSheet } from 'react-native';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import { AppStateProvider } from './src/context/AppStateContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { color } from './src/theme/tokens';

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
});

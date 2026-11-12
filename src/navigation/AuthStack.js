// AI-assisted: see docs/AI_LOG.md #54
// Authentication stack: Login -> SignUp / ForgotPassword. The screen header is drawn by each screen,
// so the navigator header is hidden. Exported only; the auth gate (T-69) mounts it from RootNavigator.

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { color } from '../theme/tokens';

const Stack = createNativeStackNavigator();

const SCREEN_OPTIONS = {
  headerShown: false,
  contentStyle: { backgroundColor: color.bg },
};

export function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={SCREEN_OPTIONS}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

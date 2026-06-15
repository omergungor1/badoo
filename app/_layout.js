import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Baloo2_600SemiBold, Baloo2_700Bold } from '@expo-google-fonts/baloo-2';
import {
  NunitoSans_400Regular,
  NunitoSans_600SemiBold,
  NunitoSans_700Bold,
} from '@expo-google-fonts/nunito-sans';
import SplashView from '../components/ui/SplashView';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { colors } from '../theme';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

function useProtectedRoute() {
  const { session, profile, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const current = segments[0];
    const inAuth = current === 'login' || current === 'register';
    const inOnboarding = current === 'onboarding';

    if (!session && !inAuth) {
      router.replace('/login');
      return;
    }

    if (session && !profile?.onboarding_completed && !inOnboarding) {
      router.replace('/onboarding');
      return;
    }

    if (session && profile?.onboarding_completed && (inAuth || inOnboarding)) {
      router.replace('/(tabs)');
    }
  }, [session, profile, loading, segments, router]);
}

function RootLayoutNav() {
  useProtectedRoute();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}

function SplashGate({ children, fontsLoaded }) {
  const { loading } = useAuth();
  const [nativeSplashHidden, setNativeSplashHidden] = useState(false);

  useEffect(() => {
    if (fontsLoaded && !nativeSplashHidden) {
      SplashScreen.hideAsync().finally(() => setNativeSplashHidden(true));
    }
  }, [fontsLoaded, nativeSplashHidden]);

  if (!fontsLoaded || loading) {
    return <SplashView />;
  }

  return children;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Baloo2_600SemiBold,
    Baloo2_700Bold,
    NunitoSans_400Regular,
    NunitoSans_600SemiBold,
    NunitoSans_700Bold,
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <SplashGate fontsLoaded={fontsLoaded}>
            <RootLayoutNav />
          </SplashGate>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

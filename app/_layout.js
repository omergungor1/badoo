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
import DigestionCheckinModal from '../components/checkin/DigestionCheckinModal';
import SplashView from '../components/ui/SplashView';
import Toast from '../components/ui/Toast';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { useDigestionCheckin } from '../hooks/useDigestionCheckin';
import { usePushNotifications } from '../hooks/usePushNotifications';
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
  const { user, profile } = useAuth();
  const checkinEnabled = Boolean(user?.id && profile?.onboarding_completed);
  const checkin = useDigestionCheckin(user?.id, checkinEnabled);

  useProtectedRoute();
  usePushNotifications(user?.id);

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />

      <DigestionCheckinModal
        visible={checkin.visible}
        timeOfDay={checkin.timeOfDay}
        saving={checkin.saving}
        onDismiss={checkin.dismiss}
        onSave={checkin.save}
      />

      <Toast message={checkin.toastMessage} onHide={checkin.clearToast} />
    </>
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

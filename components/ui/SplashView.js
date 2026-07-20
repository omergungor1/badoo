import { Image, StyleSheet, View } from 'react-native';
import { useMemo } from 'react';
import AppLogo from './AppLogo';
import { APP_SLOGAN } from '../../constants/app';
import { getRandomMascot } from '../../constants/mascots';

export default function SplashView() {
  const mascot = useMemo(() => getRandomMascot(), []);

  return (
    <View style={styles.container}>
      <Image source={mascot} style={styles.mascot} resizeMode="contain" />
      <AppLogo size={96} showSlogan slogan={APP_SLOGAN} dark />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 32,
    gap: 20,
  },
  mascot: {
    width: 180,
    height: 180,
  },
});

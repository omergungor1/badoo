import { StyleSheet, View } from 'react-native';
import AppLogo from './AppLogo';
import { APP_SLOGAN } from '../../constants/app';

export default function SplashView() {
  return (
    <View style={styles.container}>
      <AppLogo size={140} showSlogan slogan={APP_SLOGAN} dark />
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
  },
});

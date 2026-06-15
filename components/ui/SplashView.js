import { StyleSheet, View } from 'react-native';
import AppLogo from './AppLogo';
import { APP_SLOGAN } from '../../constants/app';
import { colors } from '../../theme';

export default function SplashView() {
  return (
    <View style={styles.container}>
      <AppLogo size={140} showSlogan slogan={APP_SLOGAN} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 32,
  },
});

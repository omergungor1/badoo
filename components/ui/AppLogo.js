import { Image, StyleSheet, Text, View } from 'react-native';
import { APP_NAME } from '../../constants/app';
import { colors, spacing, typography } from '../../theme';

export default function AppLogo({
  size = 96,
  showTitle = true,
  showSlogan = false,
  slogan,
  title = APP_NAME,
  dark = false,
}) {
  return (
    <View style={styles.wrap}>
      <Image
        source={require('../../assets/icon.png')}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
      {showTitle ? <Text style={[styles.title, dark && styles.titleDark]}>{title}</Text> : null}
      {showSlogan && slogan ? <Text style={[styles.slogan, dark && styles.sloganDark]}>{slogan}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  slogan: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  titleDark: {
    color: colors.white,
  },
  sloganDark: {
    color: colors.textMuted,
  },
});

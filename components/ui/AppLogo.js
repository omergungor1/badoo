import { Image, StyleSheet, Text, View } from 'react-native';
import { APP_NAME } from '../../constants/app';
import { colors, spacing, typography } from '../../theme';

export default function AppLogo({
  size = 96,
  showTitle = true,
  showSlogan = false,
  slogan,
  title = APP_NAME,
}) {
  return (
    <View style={styles.wrap}>
      <Image
        source={require('../../assets/icon.png')}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
      {showTitle ? <Text style={styles.title}>{title}</Text> : null}
      {showSlogan && slogan ? <Text style={styles.slogan}>{slogan}</Text> : null}
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
});

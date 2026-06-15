import { StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '../../theme';

export default function Card({ children, style, variant = 'default' }) {
  return (
    <View style={[styles.card, variant === 'light' && styles.light, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  light: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryLight,
  },
});

import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

export const profilePageColors = {
  background: '#F2F2F7',
  sectionTitle: '#6D6D72',
  card: colors.white,
  divider: 'rgba(60, 60, 67, 0.12)',
};

export default function ProfileSection({ title, children, card = true, style }) {
  return (
    <View style={[styles.section, style]}>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      {card ? <View style={styles.card}>{children}</View> : children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.xs,
  },
  sectionTitle: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: typography.bodySemiBold.fontFamily,
    color: profilePageColors.sectionTitle,
    paddingHorizontal: spacing.lg,
    marginBottom: 2,
  },
  card: {
    marginHorizontal: spacing.lg,
    backgroundColor: profilePageColors.card,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
});

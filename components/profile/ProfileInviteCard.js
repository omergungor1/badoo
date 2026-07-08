import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { profilePageColors } from './ProfileSection';
import { colors, radius, spacing, typography } from '../../theme';

export default function ProfileInviteCard({ onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="person-add-outline" size={22} color={colors.textPrimary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Arkadaş davet et</Text>
        <Text style={styles.subtitle}>
          Arkadaşlarını Badoo&apos;ya davet et, birlikte hedeflerinizi takip edin.
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
    backgroundColor: profilePageColors.card,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardPressed: {
    opacity: 0.92,
  },
  iconWrap: {
    width: 28,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    gap: 3,
  },
  title: {
    ...typography.bodySemiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 17,
  },
});

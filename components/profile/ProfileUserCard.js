import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { profilePageColors } from './ProfileSection';
import { colors, radius, spacing, typography } from '../../theme';

function getInitials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return (parts[0] || 'B').slice(0, 2).toUpperCase();
}

export default function ProfileUserCard({ name, handle, avatarUrl, onPress }) {
  const initials = getInitials(name || 'Badoo');

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.avatar}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatarImage} contentFit="cover" />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.handle}>{handle}</Text>
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
    gap: spacing.md,
  },
  cardPressed: {
    opacity: 0.92,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    borderRadius: 26,
    backgroundColor: colors.activity,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 18,
    fontFamily: typography.bodySemiBold.fontFamily,
    color: colors.white,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...typography.bodySemiBold,
    fontSize: 17,
    color: colors.textPrimary,
  },
  handle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontSize: 14,
  },
});

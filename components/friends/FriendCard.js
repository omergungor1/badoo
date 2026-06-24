import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import FriendRingMini from './FriendRingMini';
import EphemeralNoteBubble from './EphemeralNoteBubble';
import { getDisplayName } from '../../utils/friendRings';
import { colors, radius, spacing, typography } from '../../theme';

export default function FriendCard({
  friend,
  note,
  onPress,
  onNudge,
  compact = false,
}) {
  const profile = friend.profile;
  const name = getDisplayName(profile);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.header}>
        {profile?.profile_image_thumb_url ? (
          <Image source={{ uri: profile.profile_image_thumb_url }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text>👤</Text>
          </View>
        )}

        <View style={styles.copy}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.subtitle}>
            {friend.allRingsClosed
              ? 'Tüm halkalar kapandı 🎉'
              : `Halkalar %${friend.ringAverage || 0} dolu`}
          </Text>
        </View>

        <FriendRingMini progress={friend.ringAverage || 0} />
      </View>

      {!compact && note ? (
        <EphemeralNoteBubble note={note} showReply={false} />
      ) : null}

      {!compact && onNudge ? (
        <Pressable onPress={onNudge} style={styles.nudgeBtn}>
          <Text style={styles.nudgeText}>👋 Dürt</Text>
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.92,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  nudgeBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  nudgeText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontFamily: typography.bodySemiBold.fontFamily,
  },
});

import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import DailyActivityRings from '../../components/ui/DailyActivityRings';
import BackButton from '../../components/ui/BackButton';
import Button from '../../components/ui/Button';
import FriendDailyIntakeModal from '../../components/friends/FriendDailyIntakeModal';
import { useAuth } from '../../context/AuthContext';
import { NUDGE_COOLDOWN_MS } from '../../constants/friends';
import {
  getFriendDailyIntake,
  getFriendDailyRings,
  getFriendshipBetween,
  sendNudge,
} from '../../services/friendService';
import StoryRow from '../../components/stories/StoryRow';
import { getActiveStories } from '../../services/storyService';
import { getDisplayName } from '../../utils/friendRings';
import { colors, radius, spacing, typography } from '../../theme';

export default function FriendProfileScreen() {
  const params = useLocalSearchParams();
  const friendId = Array.isArray(params.userId) ? params.userId[0] : params.userId;
  const { user } = useAuth();
  const router = useRouter();
  const [ringData, setRingData] = useState(null);
  const [friendship, setFriendship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [intakeModalOpen, setIntakeModalOpen] = useState(false);
  const [intakeItems, setIntakeItems] = useState([]);
  const [intakeLoading, setIntakeLoading] = useState(false);
  const [nudgeState, setNudgeState] = useState('idle');
  const [stories, setStories] = useState([]);

  useEffect(() => {
    setLoading(true);
    setRingData(null);
    setFriendship(null);
    setNudgeState('idle');
    setStories([]);
  }, [friendId]);

  const loadData = useCallback(async () => {
    if (!user?.id || !friendId) return;

    const [{ data: rings }, { data: relation }, { data: activeStories }] = await Promise.all([
      getFriendDailyRings(friendId),
      getFriendshipBetween(user.id, friendId),
      getActiveStories(friendId),
    ]);

    setRingData(rings);
    setFriendship(relation);
    setStories(activeStories || []);
    setLoading(false);
  }, [user?.id, friendId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  async function handleNudge() {
    if (nudgeState !== 'idle') return;

    const { error } = await sendNudge(user.id, friendId);
    if (error) {
      Alert.alert('Hata', error.message);
      return;
    }

    setNudgeState('sent');
    setTimeout(() => setNudgeState('idle'), NUDGE_COOLDOWN_MS);
  }

  async function openIntakeModal() {
    setIntakeModalOpen(true);
    setIntakeLoading(true);
    setIntakeItems([]);

    const { data, error } = await getFriendDailyIntake(user.id, friendId);
    setIntakeLoading(false);

    if (error) {
      Alert.alert('Hata', error.message);
      setIntakeModalOpen(false);
      return;
    }

    setIntakeItems(data || []);
  }

  const profile = ringData?.profile;
  const isFriend = friendship?.status === 'accepted';
  const name = getDisplayName(profile);
  const nudgeDisabled = nudgeState !== 'idle';

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.headerTitle}>Profil</Text>
        </View>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!isFriend) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.headerTitle}>Profil</Text>
        </View>
        <View style={styles.blocked}>
          <Text style={styles.blockedText}>Bu kullanıcıyla arkadaş değilsin.</Text>
          <Button title="Arkadaş Ekle" onPress={() => router.push('/friends/add')} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>{name}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <View style={styles.profileCard}>
          {profile?.profile_image_thumb_url ? (
            <Image source={{ uri: profile.profile_image_thumb_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarEmoji}>👤</Text>
            </View>
          )}
          <Text style={styles.name}>{name}</Text>
          {profile?.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

          <View style={styles.actionRow}>
            <Pressable
              onPress={() => router.push(`/friends/chat/${friendId}`)}
              style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
            >
              <Ionicons name="chatbubble-outline" size={16} color={colors.textPrimary} />
              <Text style={styles.actionBtnText}>Mesaj</Text>
            </Pressable>

            <Pressable
              onPress={handleNudge}
              disabled={nudgeDisabled}
              style={({ pressed }) => [
                styles.actionBtn,
                nudgeState === 'sent' && styles.actionBtnSuccess,
                nudgeDisabled && styles.actionBtnDisabled,
                pressed && !nudgeDisabled && styles.actionBtnPressed,
              ]}
            >
              {nudgeState === 'sent' ? (
                <>
                  <Ionicons name="checkmark-circle" size={16} color={colors.activity} />
                  <Text style={[styles.actionBtnText, styles.actionBtnTextSuccess]}>Gönderildi</Text>
                </>
              ) : (
                <>
                  <Ionicons name="hand-left-outline" size={16} color={colors.textPrimary} />
                  <Text style={styles.actionBtnText}>Dürt</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>

        <StoryRow
          stories={stories}
          userName={name}
          userAvatarUrl={profile?.profile_image_thumb_url}
        />

        {ringData?.rings?.length ? (
          <View style={styles.ringsWrap}>
            <Pressable
              onPress={openIntakeModal}
              hitSlop={8}
              style={({ pressed }) => [styles.intakeBtn, pressed && styles.intakeBtnPressed]}
            >
              <Ionicons name="restaurant-outline" size={18} color={colors.textPrimary} />
            </Pressable>
            <DailyActivityRings rings={ringData.rings} />
          </View>
        ) : null}
      </ScrollView>

      <FriendDailyIntakeModal
        visible={intakeModalOpen}
        onClose={() => setIntakeModalOpen(false)}
        friendName={name}
        items={intakeItems}
        loading={intakeLoading}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  headerTitle: { ...typography.headingMedium, color: colors.textPrimary, flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  profileCard: {
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: { width: 84, height: 84, borderRadius: 42 },
  avatarPlaceholder: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 34 },
  name: { ...typography.h3, color: colors.textPrimary },
  bio: { ...typography.bodySmall, color: colors.textSecondary, textAlign: 'center' },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
    marginTop: spacing.xs,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  actionBtnPressed: {
    opacity: 0.85,
  },
  actionBtnDisabled: {
    opacity: 0.9,
  },
  actionBtnSuccess: {
    borderColor: colors.activity,
    backgroundColor: '#F0FDF4',
  },
  actionBtnText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontFamily: typography.bodySemiBold.fontFamily,
  },
  actionBtnTextSuccess: {
    color: colors.activity,
  },
  ringsWrap: {
    position: 'relative',
  },
  intakeBtn: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 1,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  intakeBtnPressed: {
    opacity: 0.75,
  },
  blocked: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockedText: { ...typography.body, color: colors.textSecondary },
});

import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import FriendCard from '../../components/friends/FriendCard';
import FriendsStoryBar from '../../components/stories/FriendsStoryBar';
import Card from '../../components/ui/Card';
import SectionTitle from '../../components/ui/SectionTitle';
import { useAuth } from '../../context/AuthContext';
import { getActiveNotesForUser } from '../../services/friendNoteService';
import { getFriendsWithRings } from '../../services/friendService';
import { getUnreadNotificationCount } from '../../services/notificationService';
import { colors, radius, spacing, typography } from '../../theme';

export default function SocialScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [friends, setFriends] = useState([]);
  const [notesBySender, setNotesBySender] = useState({});
  const [notificationCount, setNotificationCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!user?.id) return;

    const [
      { data: friendData },
      { data: notes },
      { count: unreadCount },
    ] = await Promise.all([
      getFriendsWithRings(user.id),
      getActiveNotesForUser(user.id),
      getUnreadNotificationCount(user.id),
    ]);

    setFriends(friendData || []);
    setNotificationCount(unreadCount || 0);

    const grouped = {};
    (notes || []).forEach((note) => {
      if (!grouped[note.sender_id]) {
        grouped[note.sender_id] = note;
      }
    });
    setNotesBySender(grouped);
  }, [user?.id]);

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

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <View style={styles.topBarRow}>
          <View style={styles.topBarText}>
            <Text style={styles.title}>Social</Text>
            <Text style={styles.subtitle}>Arkadaşlarını takip et</Text>
          </View>
          <Pressable
            onPress={() => router.push('/notifications')}
            style={({ pressed }) => [styles.bellButton, pressed && styles.bellButtonPressed]}
            accessibilityLabel="Bildirimler"
            accessibilityRole="button"
          >
            <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
            {notificationCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {notificationCount > 99 ? '99+' : notificationCount}
                </Text>
              </View>
            ) : null}
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {friends.length ? (
          <>
            <SectionTitle
              title="Arkadaşların"
              subtitle="Bugünkü halkalarını takip et"
            />
            <FriendsStoryBar friends={friends} />
            <View style={styles.friendsList}>
              {friends.map((friend) => (
                <FriendCard
                  key={friend.id}
                  friend={friend}
                  note={notesBySender[friend.friendId]}
                  compact
                  onPress={() => router.push(`/friends/${friend.friendId}`)}
                />
              ))}
            </View>
            <Pressable onPress={() => router.push('/friends')}>
              <Text style={styles.friendsLink}>Tüm arkadaşları gör →</Text>
            </Pressable>
          </>
        ) : (
          <Pressable onPress={() => router.push('/friends/add')}>
            <Card variant="light">
              <Text style={styles.friendsCtaTitle}>Arkadaş ekle</Text>
              <Text style={styles.friendsCtaText}>
                Arkadaşlarının halkalarını gör, not bırak ve birbirinizi dürtün.
              </Text>
            </Card>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  topBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  topBarText: { flex: 1, gap: 2 },
  title: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    fontSize: 18,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellButtonPressed: { opacity: 0.7 },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    ...typography.caption,
    color: colors.white,
    fontFamily: typography.bodySemiBold.fontFamily,
    fontSize: 10,
    lineHeight: 12,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  friendsList: { gap: spacing.sm },
  friendsLink: {
    ...typography.bodySmall,
    color: colors.primary,
    fontFamily: typography.bodySemiBold.fontFamily,
    textAlign: 'center',
  },
  friendsCtaTitle: { ...typography.bodySemiBold, color: colors.textPrimary },
  friendsCtaText: { ...typography.bodySmall, color: colors.textSecondary },
});

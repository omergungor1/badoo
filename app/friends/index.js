import { useCallback, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import FriendCard from '../../components/friends/FriendCard';
import BackButton from '../../components/ui/BackButton';
import Button from '../../components/ui/Button';
import SectionTitle from '../../components/ui/SectionTitle';
import { useAuth } from '../../context/AuthContext';
import { getActiveNotesForUser } from '../../services/friendNoteService';
import { getFriendsWithRings, sendNudge } from '../../services/friendService';
import { colors, spacing, typography } from '../../theme';

export default function FriendsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [friends, setFriends] = useState([]);
  const [notesBySender, setNotesBySender] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!user?.id) return;

    const [{ data: friendData }, { data: notes }] = await Promise.all([
      getFriendsWithRings(user.id),
      getActiveNotesForUser(user.id),
    ]);

    setFriends(friendData || []);

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

  async function handleNudge(friendId) {
    const { error } = await sendNudge(user.id, friendId);
    if (error) {
      Alert.alert('Hata', error.message);
      return;
    }
    Alert.alert('Gönderildi', 'Dürtme bildirimi gönderildi.');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Arkadaşlarım</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <View style={styles.actions}>
          <Button title="Arkadaş Ekle" onPress={() => router.push('/friends/add')} />
          <Button title="Gelen İstekler" variant="outline" onPress={() => router.push('/friends/requests')} />
        </View>

        <SectionTitle title="Arkadaş listesi" subtitle="Halkalarını takip et, not bırak ve dürt" />

        {friends.length ? (
          friends.map((friend) => (
            <FriendCard
              key={friend.id}
              friend={friend}
              note={notesBySender[friend.friendId]}
              onPress={() => router.push(`/friends/${friend.friendId}`)}
              onNudge={() => handleNudge(friend.friendId)}
            />
          ))
        ) : (
          <Pressable style={styles.emptyCard} onPress={() => router.push('/friends/add')}>
            <Text style={styles.emptyTitle}>Henüz arkadaşın yok</Text>
            <Text style={styles.emptyText}>Arkadaş ekleyerek birlikte motive olun.</Text>
          </Pressable>
        )}
      </ScrollView>
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
  actions: { flexDirection: 'row', gap: spacing.sm },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  emptyTitle: { ...typography.bodySemiBold, color: colors.textPrimary },
  emptyText: { ...typography.bodySmall, color: colors.textSecondary },
});

import { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import BackButton from '../../components/ui/BackButton';
import { useAuth } from '../../context/AuthContext';
import { getIncomingFriendRequests, respondFriendRequest } from '../../services/friendService';
import { getDisplayName } from '../../utils/friendRings';
import { colors, radius, spacing, typography } from '../../theme';

export default function FriendRequestsScreen() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [actingId, setActingId] = useState(null);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await getIncomingFriendRequests(user.id);
    setRequests(data || []);
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

  async function handleRespond(friendshipId, accept) {
    setActingId(friendshipId);
    const { error } = await respondFriendRequest({
      friendshipId,
      userId: user.id,
      accept,
    });
    setActingId(null);

    if (error) {
      Alert.alert('Hata', error.message);
      return;
    }

    await loadData();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Gelen İstekler</Text>
      </View>

      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        renderItem={({ item }) => {
          const profile = item.profile;
          const busy = actingId === item.id;

          return (
            <View style={styles.card}>
              {profile?.profile_image_thumb_url ? (
                <Image source={{ uri: profile.profile_image_thumb_url }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text>👤</Text>
                </View>
              )}

              <View style={styles.copy}>
                <Text style={styles.name}>{getDisplayName(profile)}</Text>
                <Text style={styles.subtitle}>Arkadaş olmak istiyor</Text>
              </View>

              <View style={styles.actions}>
                <Pressable
                  disabled={busy}
                  onPress={() => handleRespond(item.id, true)}
                  style={[styles.acceptBtn, busy && styles.disabled]}
                >
                  <Text style={styles.acceptText}>Kabul</Text>
                </Pressable>
                <Pressable
                  disabled={busy}
                  onPress={() => handleRespond(item.id, false)}
                  style={[styles.rejectBtn, busy && styles.disabled]}
                >
                  <Text style={styles.rejectText}>Reddet</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>Bekleyen arkadaşlık isteği yok.</Text>
        }
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
  content: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxl },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, gap: 2 },
  name: { ...typography.bodySemiBold, color: colors.textPrimary },
  subtitle: { ...typography.caption, color: colors.textSecondary },
  actions: { gap: spacing.xs },
  acceptBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.md,
  },
  acceptText: { ...typography.caption, color: colors.white, fontFamily: typography.bodySemiBold.fontFamily },
  rejectBtn: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.md,
  },
  rejectText: { ...typography.caption, color: colors.textSecondary },
  disabled: { opacity: 0.6 },
  empty: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xl },
});

import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../components/ui/BackButton';
import { useAuth } from '../context/AuthContext';
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  resolveNotificationRoute,
} from '../services/notificationService';
import { colors, radius, spacing, typography } from '../theme';

function formatTime(iso) {
  const date = new Date(iso);
  return date.toLocaleString('tr-TR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function NotificationsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await getNotifications(user.id);
    setItems(data || []);
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

  async function handlePress(item) {
    await markNotificationRead(item.id, user.id);
    setItems((prev) => prev.filter((row) => row.id !== item.id));

    const route = resolveNotificationRoute(item);
    if (route) {
      router.push(route);
    }
  }

  async function handleMarkAll() {
    await markAllNotificationsRead(user.id);
    await loadData();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Bildirimler</Text>
        {items.length ? (
          <Pressable onPress={handleMarkAll}>
            <Text style={styles.markAll}>Tümünü oku</Text>
          </Pressable>
        ) : null}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        renderItem={({ item }) => (
          <Pressable onPress={() => handlePress(item)} style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            {item.body ? <Text style={styles.body}>{item.body}</Text> : null}
            <Text style={styles.time}>{formatTime(item.created_at)}</Text>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Okunmamış bildirim yok.</Text>}
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
  markAll: { ...typography.bodySmall, color: colors.primary },
  content: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxl },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: 4,
  },
  title: { ...typography.bodySemiBold, color: colors.textPrimary },
  body: { ...typography.bodySmall, color: colors.textSecondary },
  time: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  empty: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xl },
});

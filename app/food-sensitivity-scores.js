import { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import FoodSensitivityAiSheet from '../components/sensitivity/FoodSensitivityAiSheet';
import FoodSensitivityCard from '../components/sensitivity/FoodSensitivityCard';
import BackButton from '../components/ui/BackButton';
import { useAuth } from '../context/AuthContext';
import { getUserFoodSensitivityInsights } from '../services/foodSensitivityService';
import { colors, radius, spacing, typography } from '../theme';

export default function FoodSensitivityScoresScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ days: 90, mealLogs: 0, symptomLogs: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);

  const scoredCount = useMemo(
    () => items.filter((item) => item.score > 0).length,
    [items],
  );

  const sortedItems = useMemo(() => {
    const scored = [];
    const unscored = [];

    items.forEach((item) => {
      if (item.score > 0) scored.push(item);
      else unscored.push(item);
    });

    return [...scored, ...unscored];
  }, [items]);

  const loadInsights = useCallback(async () => {
    if (!user?.id) return;

    const { data, meta: insightMeta } = await getUserFoodSensitivityInsights(user.id);
    setItems(data || []);
    setMeta(insightMeta || { days: 90, mealLogs: 0, symptomLogs: 0 });
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadInsights();
    }, [loadInsights]),
  );

  async function onRefresh() {
    setRefreshing(true);
    await loadInsights();
    setRefreshing(false);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Hassasiyet Skorları</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <Text style={styles.subtitle}>
          Son {meta.days} gün · {sortedItems.length} besin · {scoredCount} skoru olan
        </Text>

        {sortedItems.length ? (
          <View style={styles.list}>
            {sortedItems.map((item, index) => (
              <FoodSensitivityCard
                key={item.foodKey}
                item={item}
                rank={index + 1}
                onAskAi={item.score > 0 ? setSelectedFood : undefined}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Liste boş</Text>
            <Text style={styles.emptyText}>
              Hassasiyet kataloğu yüklenemedi. Daha sonra tekrar deneyin.
            </Text>
          </View>
        )}

        <Text style={styles.footerNote}>
          Skor; yemek sonrası 2–12 saat içindeki belirtiler ve profildeki hassasiyet bildirimlerine göre hesaplanır.
        </Text>

        <Pressable
          onPress={() => router.push('/sensitivities')}
          style={({ pressed }) => [styles.manageBtn, pressed && styles.manageBtnPressed]}
        >
          <Ionicons name="alert-circle-outline" size={18} color={colors.textPrimary} />
          <View style={styles.manageCopy}>
            <Text style={styles.manageTitle}>Bildirdiğin hassasiyetleri yönet</Text>
            <Text style={styles.manageSubtitle}>Profilindeki besin listesini düzenle</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>
      </ScrollView>

      <FoodSensitivityAiSheet
        visible={Boolean(selectedFood)}
        foodItem={selectedFood}
        userId={user?.id}
        onClose={() => setSelectedFood(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    fontSize: 18,
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  list: {
    gap: spacing.sm,
  },
  emptyCard: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  emptyTitle: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  footerNote: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  manageBtnPressed: {
    backgroundColor: colors.primaryLight,
  },
  manageCopy: {
    flex: 1,
    gap: 2,
  },
  manageTitle: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    fontSize: 15,
  },
  manageSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import HealthAiAnalysisSection from '../../components/analysis/HealthAiAnalysisSection';
import FoodSensitivityCard from '../../components/sensitivity/FoodSensitivityCard';
import Card from '../../components/ui/Card';
import ScoreGrid, { ScoreGridSummary } from '../../components/ui/ScoreGrid';
import SectionTitle from '../../components/ui/SectionTitle';
import { useAuth } from '../../context/AuthContext';
import { getLogsForDate } from '../../services/logService';
import { getUserFoodSensitivityInsights } from '../../services/foodSensitivityService';
import { getHealthAnalyses } from '../../services/healthAiAnalysisService';
import { getLastNDays } from '../../utils/date';
import { calculateDailyDigestionScore } from '../../utils/digestionScore';
import { colors, spacing, typography } from '../../theme';

export default function AnalysisScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ days: 90, mealLogs: 0, symptomLogs: 0 });
  const [analyses, setAnalyses] = useState([]);
  const [digestionScores, setDigestionScores] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadInsights = useCallback(async () => {
    if (!user?.id) return;

    const [{ data, meta: insightMeta }, { data: history }] = await Promise.all([
      getUserFoodSensitivityInsights(user.id),
      getHealthAnalyses(user.id, 3),
    ]);

    setItems(data || []);
    setMeta(insightMeta || { days: 90, mealLogs: 0, symptomLogs: 0 });
    setAnalyses(history || []);

    const days = getLastNDays(28);
    const scoreResults = await Promise.all(
      days.map(async (date) => {
        const logs = await getLogsForDate(user.id, date);
        const score = calculateDailyDigestionScore(logs);
        const hasData =
          logs.symptoms.length ||
          logs.sleepLogs.length ||
          logs.statusLogs.length ||
          logs.stoolLogs.length ||
          logs.foodLogs.length ||
          logs.waterLogs.length;

        return { date, score: hasData ? score : null };
      }),
    );

    setDigestionScores(scoreResults);
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
      <View style={styles.topBar}>
        <Text style={styles.title}>Analiz</Text>
        <Text style={styles.subtitle}>Son {meta.days} gün analizi</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <HealthAiAnalysisSection
          userId={user?.id}
          analyses={analyses}
          onCreated={loadInsights}
        />

        <Pressable onPress={() => router.push('/digestion-calendar')}>
          <Card>
            <SectionTitle title="Sindirim Takvimi" subtitle="Son 28 gün" />
            <ScoreGrid scores={digestionScores} compact layout="weekly" />
            <ScoreGridSummary scores={digestionScores} />
          </Card>
        </Pressable>

        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{items.filter((item) => item.score >= 40).length}</Text>
            <Text style={styles.summaryLabel}>Dikkat</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{meta.mealLogs}</Text>
            <Text style={styles.summaryLabel}>Öğün</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{meta.symptomLogs}</Text>
            <Text style={styles.summaryLabel}>Belirti</Text>
          </View>
        </View>

        {items.length ? (
          <View style={styles.list}>
            {items.map((item, index) => (
              <FoodSensitivityCard key={item.foodKey} item={item} rank={index + 1} />
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Henüz skor yok</Text>
            <Text style={styles.emptyText}>
              Öğün ve belirti kaydı ekledikçe hassasiyet skorları burada görünecek.
            </Text>
          </View>
        )}

        <Text style={styles.footerNote}>
          Skor; yemek sonrası 2–12 saat içindeki belirtiler ve profildeki hassasiyet bildirimlerine göre hesaplanır.
        </Text>

        <Text style={styles.link} onPress={() => router.push('/sensitivities')}>
          Bildirdiğin hassasiyetleri yönet →
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  topBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: 2,
  },
  title: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    fontSize: 18,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 16,
    paddingVertical: spacing.md,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  summaryValue: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    fontSize: 18,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  summaryDivider: {
    width: StyleSheet.hairlineWidth,
    height: 28,
    backgroundColor: colors.border,
  },
  list: {
    gap: spacing.sm,
  },
  emptyCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
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
  link: {
    ...typography.bodySmall,
    color: colors.primary,
    fontFamily: typography.bodySemiBold.fontFamily,
  },
});

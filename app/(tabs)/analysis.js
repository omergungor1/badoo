import { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import HealthAiAnalysisSection from '../../components/analysis/HealthAiAnalysisSection';
import LabHeroCard from '../../components/elimination/LabHeroCard';
import FoodSensitivityAiSheet from '../../components/sensitivity/FoodSensitivityAiSheet';
import FoodSensitivityCard from '../../components/sensitivity/FoodSensitivityCard';
import Card from '../../components/ui/Card';
import ScoreGrid, { ScoreGridSummary } from '../../components/ui/ScoreGrid';
import SectionTitle from '../../components/ui/SectionTitle';
import { useAuth } from '../../context/AuthContext';
import { getLogsForDate } from '../../services/logService';
import { getUserFoodSensitivityInsights } from '../../services/foodSensitivityService';
import { getHealthAnalyses } from '../../services/healthAiAnalysisService';
import { getActiveEliminationSession } from '../../services/eliminationService';
import { getLastNDays } from '../../utils/date';
import { calculateDailyDigestionScore } from '../../utils/digestionScore';
import { colors, radius, spacing, typography } from '../../theme';

const PREVIEW_SCORE_LIMIT = 3;

export default function AnalysisScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ days: 90, mealLogs: 0, symptomLogs: 0 });
  const [analyses, setAnalyses] = useState([]);
  const [digestionScores, setDigestionScores] = useState([]);
  const [labActive, setLabActive] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);

  const scoredItems = useMemo(
    () => items.filter((item) => item.score > 0),
    [items],
  );
  const previewItems = useMemo(
    () => scoredItems.slice(0, PREVIEW_SCORE_LIMIT),
    [scoredItems],
  );
  const attentionCount = useMemo(
    () => scoredItems.filter((item) => item.score >= 40).length,
    [scoredItems],
  );

  const loadInsights = useCallback(async () => {
    if (!user?.id) return;

    const [{ data, meta: insightMeta }, { data: history }, { data: activeLab }] = await Promise.all([
      getUserFoodSensitivityInsights(user.id),
      getHealthAnalyses(user.id, 2),
      getActiveEliminationSession(user.id),
    ]);

    setItems(data || []);
    setMeta(insightMeta || { days: 90, mealLogs: 0, symptomLogs: 0 });
    setAnalyses(history || []);
    setLabActive(activeLab || null);

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
        <LabHeroCard active={labActive} />

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

        <SectionTitle
          title="Besin Hassasiyetleri"
          subtitle="Skoru oluşan besinlere hızlı bakış"
        />

        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{attentionCount}</Text>
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

        {previewItems.length ? (
          <View style={styles.list}>
            {previewItems.map((item, index) => (
              <FoodSensitivityCard
                key={item.foodKey}
                item={item}
                rank={index + 1}
                onAskAi={setSelectedFood}
              />
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

        {scoredItems.length ? (
          <Pressable
            onPress={() => router.push('/food-sensitivity-scores')}
            style={({ pressed }) => [styles.secondaryBtn, pressed && styles.secondaryBtnPressed]}
          >
            <Ionicons name="list-outline" size={18} color={colors.textPrimary} />
            <Text style={styles.secondaryBtnText}>
              {scoredItems.length > PREVIEW_SCORE_LIMIT
                ? `Tüm hassasiyet listesi (${scoredItems.length})`
                : 'Tüm hassasiyet listesi'}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </Pressable>
        ) : null}

        <Text style={styles.footerNote}>
          Skor; yemek sonrası 2–12 saat içindeki belirtiler ve profildeki bildirimlere göre hesaplanır.
        </Text>

        <Pressable
          onPress={() => router.push('/sensitivities')}
          style={({ pressed }) => [styles.manageBtn, pressed && styles.manageBtnPressed]}
        >
          <Ionicons name="alert-circle-outline" size={18} color={colors.white} />
          <View style={styles.manageCopy}>
            <Text style={styles.manageTitle}>Hassasiyetleri yönet</Text>
            <Text style={styles.manageSubtitle}>Bildirdiğin besin listesini düzenle</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
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
    paddingBottom: 120,
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
  secondaryBtn: {
    minHeight: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  secondaryBtnPressed: {
    backgroundColor: colors.primaryLight,
  },
  secondaryBtnText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontFamily: typography.bodySemiBold.fontFamily,
    flex: 1,
  },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  manageBtnPressed: {
    backgroundColor: colors.primaryDark,
  },
  manageCopy: {
    flex: 1,
    gap: 2,
  },
  manageTitle: {
    ...typography.bodySemiBold,
    color: colors.white,
    fontSize: 15,
  },
  manageSubtitle: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.72)',
  },
});

import { useCallback, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import FoodSensitivityCard from '../../components/sensitivity/FoodSensitivityCard';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { getUserFoodSensitivityInsights } from '../../services/foodSensitivityService';
import {
  createHealthAnalysis,
  getHealthAnalyses,
  getLatestHealthAnalysis,
} from '../../services/healthAiAnalysisService';
import { formatDate, formatShortDate } from '../../utils/date';
import { colors, spacing, typography } from '../../theme';

export default function SensitivityScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ days: 90, mealLogs: 0, symptomLogs: 0 });
  const [latestAnalysis, setLatestAnalysis] = useState(null);
  const [pastAnalyses, setPastAnalyses] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);

  const loadInsights = useCallback(async () => {
    if (!user?.id) return;

    const [
      { data, meta: insightMeta },
      { data: latest },
      { data: history },
    ] = await Promise.all([
      getUserFoodSensitivityInsights(user.id),
      getLatestHealthAnalysis(user.id),
      getHealthAnalyses(user.id),
    ]);

    setItems(data || []);
    setMeta(insightMeta || { days: 90, mealLogs: 0, symptomLogs: 0 });
    setLatestAnalysis(latest || null);
    setPastAnalyses(history || []);
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

  async function handleNewAnalysis() {
    setCreating(true);
    const { data, error } = await createHealthAnalysis(user.id);
    setCreating(false);

    if (error) {
      Alert.alert('Analiz yapılamadı', error.message);
      return;
    }

    await loadInsights();
    router.push(`/ai-analysis/${data.id}`);
  }

  const olderAnalyses = pastAnalyses.filter((item) => item.id !== latestAnalysis?.id);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Besin Hassasiyeti</Text>
        <Text style={styles.subtitle}>Son {meta.days} gün analizi</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <Card style={styles.aiCard}>
          <Text style={styles.aiTitle}>AI Sağlık Analizi</Text>
          <Text style={styles.aiSubtitle}>
            Son 2 haftalık öğün, belirti, uyku, aktivite ve daha fazlasını AI ile değerlendir.
          </Text>

          {latestAnalysis ? (
            <Pressable
              style={styles.latestBtn}
              onPress={() => router.push(`/ai-analysis/${latestAnalysis.id}`)}
            >
              <Text style={styles.latestLabel}>Son analiz</Text>
              <Text style={styles.latestTitle}>{latestAnalysis.title}</Text>
              <Text style={styles.latestMeta}>
                {formatDate(latestAnalysis.created_at)} · {formatShortDate(latestAnalysis.period_start)} – {formatShortDate(latestAnalysis.period_end)}
              </Text>
            </Pressable>
          ) : (
            <Text style={styles.noAnalysis}>Henüz AI analizi yok. İlk analizini başlat.</Text>
          )}

          <Button
            title={creating ? 'Analiz hazırlanıyor...' : 'Yeni Analiz Başlat'}
            onPress={handleNewAnalysis}
            loading={creating}
          />
        </Card>

        {olderAnalyses.length ? (
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>Önceki analizler</Text>
            {olderAnalyses.map((item) => (
              <Pressable
                key={item.id}
                style={styles.historyItem}
                onPress={() => router.push(`/ai-analysis/${item.id}`)}
              >
                <Text style={styles.historyItemTitle}>{item.title}</Text>
                <Text style={styles.historyItemMeta}>
                  {formatDate(item.created_at)}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}

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
  aiCard: {
    gap: spacing.md,
    backgroundColor: '#F8FBFF',
    borderColor: '#D8E8FF',
  },
  aiTitle: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    fontSize: 17,
  },
  aiSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  latestBtn: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  latestLabel: {
    ...typography.caption,
    color: colors.primary,
    fontFamily: typography.bodySemiBold.fontFamily,
  },
  latestTitle: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
  },
  latestMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  noAnalysis: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  historySection: {
    gap: spacing.sm,
  },
  historyTitle: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
  },
  historyItem: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
    gap: 2,
  },
  historyItemTitle: {
    ...typography.body,
    color: colors.textPrimary,
  },
  historyItemMeta: {
    ...typography.caption,
    color: colors.textSecondary,
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

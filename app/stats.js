import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../components/ui/BackButton';
import Card from '../components/ui/Card';
import SectionTitle from '../components/ui/SectionTitle';
import { useAuth } from '../context/AuthContext';
import { calculateFoodTotals } from '../services/foodService';
import { getWeeklyStats } from '../services/logService';
import { calculateDailyActivityTotals, formatActivityValue } from '../utils/activity';
import { colors, spacing, typography } from '../theme';

export default function StatsScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async () => {
    if (!user?.id) return;

    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);

    const data = await getWeeklyStats(user.id, start.toISOString(), end.toISOString());
    setStats(data);
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats]),
  );

  const summary = useMemo(() => {
    if (!stats) return null;

    const foodTotals = calculateFoodTotals(stats.foodLogs);
    const waterTotal = stats.waterLogs.reduce((sum, log) => sum + (log.amount || 0), 0);
    const activityTotals = calculateDailyActivityTotals(stats.activityLogs);
    const activitySteps = Math.round(activityTotals.steps / 7);
    const activityDistance = Number((activityTotals.distanceKm / 7).toFixed(1));
    const sleepAvg = stats.sleepLogs.length
      ? (stats.sleepLogs.reduce((sum, log) => sum + (log.hours || 0), 0) / stats.sleepLogs.length).toFixed(1)
      : 0;

    const symptomCounts = stats.symptomLogs.reduce((acc, log) => {
      const key = log.symptom_name;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return {
      calories: foodTotals.calories,
      protein: stats.foodLogs.length
        ? Math.round(calculateFoodTotals(stats.foodLogs).protein / 7)
        : 0,
      water: Math.round(waterTotal / 7),
      activitySteps,
      activityDistance,
      sleepAvg,
      symptomCounts,
    };
  }, [stats]);

  async function onRefresh() {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>İstatistikler</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <SectionTitle title="Son 7 gün özeti" subtitle="Kalori, su, aktivite ve belirti dağılımı" />

        <View style={styles.grid}>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>Toplam Kalori</Text>
            <Text style={styles.statValue}>{summary?.calories || 0}</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>Ort. Protein/gün</Text>
            <Text style={styles.statValue}>{summary?.protein || 0}g</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>Ort. Su/gün</Text>
            <Text style={styles.statValue}>{summary?.water || 0} ml</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>Ort. Adım/gün</Text>
            <Text style={styles.statValue}>{summary?.activitySteps || 0}</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>Ort. Yürüyüş/gün</Text>
            <Text style={styles.statValue}>{formatActivityValue(summary?.activityDistance || 0, 'distance_km')}</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>Uyku Ort.</Text>
            <Text style={styles.statValue}>{summary?.sleepAvg || 0} saat</Text>
          </Card>
        </View>

        <SectionTitle title="Belirti Dağılımı" />
        <Card>
          {summary && Object.keys(summary.symptomCounts).length ? (
            Object.entries(summary.symptomCounts).map(([name, count]) => (
              <Text key={name} style={styles.symptomRow}>
                {name}: {count} kez
              </Text>
            ))
          ) : (
            <Text style={styles.empty}>Bu hafta belirti kaydı yok.</Text>
          )}
        </Card>
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statCard: { width: '47%', gap: 6 },
  statLabel: { ...typography.bodySmall, color: colors.textSecondary },
  statValue: { ...typography.h3, color: colors.textPrimary },
  symptomRow: { ...typography.body, color: colors.textPrimary, marginBottom: 6 },
  empty: { ...typography.body, color: colors.textSecondary },
});

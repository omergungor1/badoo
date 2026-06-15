import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { calculateFoodTotals, getFoodLogsForDay } from '../../services/foodService';
import { getDailyTasks, getLogsForDate } from '../../services/logService';
import Card from '../../components/ui/Card';
import ProgressBar from '../../components/ui/ProgressBar';
import ScoreGrid, { ScoreGridSummary } from '../../components/ui/ScoreGrid';
import SectionTitle from '../../components/ui/SectionTitle';
import { calculateDailyDigestionScore } from '../../utils/digestionScore';
import { endOfDay, getLastNDays, startOfDay, toISODate } from '../../utils/date';
import { formatWater } from '../../utils/nutrition';
import { colors, spacing, typography } from '../../theme';

export default function HomeScreen() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [totals, setTotals] = useState({ calories: 0, protein: 0 });
  const [waterTotal, setWaterTotal] = useState(0);
  const [digestionScores, setDigestionScores] = useState([]);
  const [progress, setProgress] = useState(0);

  const loadData = useCallback(async () => {
    if (!user?.id) return;

    const start = startOfDay().toISOString();
    const end = endOfDay().toISOString();

    const [{ data: taskData }, { data: foodLogs }] = await Promise.all([
      getDailyTasks(user.id),
      getFoodLogsForDay(user.id, start, end),
    ]);

    setTasks(taskData || []);

    const foodTotals = calculateFoodTotals(foodLogs || []);
    setTotals(foodTotals);

    const days = getLastNDays(30);
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

    const dayLogs = await getLogsForDate(user.id, toISODate());
    const water = (dayLogs.waterLogs || []).reduce((sum, log) => sum + (log.amount || 0), 0);
    setWaterTotal(water);

    const completedCount = 5 - (taskData?.length || 0);
    setProgress(Math.round((completedCount / 5) * 100));
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

  function handleTaskPress(task) {
    const routes = {
      morning_checkin: '/add/morning-checkin',
      meals: '/add/food',
      water: '/add/water',
      stool: '/add/stool',
      evening_checkin: '/add/evening-checkin',
    };
    const route = routes[task.task_key];
    if (route) router.push(route);
  }

  const calorieGoal = profile?.daily_calorie_goal || 2000;
  const proteinGoal = profile?.daily_protein_goal || 100;
  const waterGoal = profile?.daily_water_goal || 2000;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <Text style={styles.greeting}>Bugün nasılsın?</Text>
        <Text style={styles.subGreeting}>Bugün %{progress} tamamlandı</Text>

        <Card style={styles.progressCard}>
          <ProgressBar progress={progress} label="Günlük ilerleme" valueText={`%${progress}`} />
        </Card>

        <SectionTitle title="Günlük Görevler" subtitle="Tamamlanan görevler listeden kaybolur" />
        <View style={styles.taskList}>
          {tasks.map((task) => (
            <Pressable key={task.id} onPress={() => handleTaskPress(task)}>
              <Card style={styles.taskCard}>
                <Text style={styles.taskEmoji}>{task.task_emoji}</Text>
                <View style={styles.taskBody}>
                  <Text style={styles.taskTitle}>{task.task_name}</Text>
                  <Text style={styles.taskAction}>Tamamla →</Text>
                </View>
              </Card>
            </Pressable>
          ))}
          {!tasks.length ? (
            <Card variant="light">
              <Text style={styles.doneText}>✅ Harika! Bugünkü görevlerin tamamlandı.</Text>
            </Card>
          ) : null}
        </View>

        <View style={styles.metricsRow}>
          <Card style={styles.metricCard}>
            <Text style={styles.metricLabel}>Kalori</Text>
            <ProgressBar
              progress={(totals.calories / calorieGoal) * 100}
              color={colors.primary}
              valueText={`${totals.calories}/${calorieGoal}`}
            />
          </Card>
          <Card style={styles.metricCard}>
            <Text style={styles.metricLabel}>Protein</Text>
            <ProgressBar
              progress={(totals.protein / proteinGoal) * 100}
              color={colors.protein}
              valueText={`${totals.protein}g/${proteinGoal}g`}
            />
          </Card>
          <Card style={styles.metricCard}>
            <Text style={styles.metricLabel}>Su</Text>
            <ProgressBar
              progress={(waterTotal / waterGoal) * 100}
              color={colors.water}
              valueText={`${formatWater(waterTotal)}/${formatWater(waterGoal)}`}
            />
          </Card>
        </View>

        <Pressable onPress={() => router.push('/digestion-calendar')}>
          <Card>
            <SectionTitle title="Sindirim Takvimi" subtitle="Son 30 gün" />
            <ScoreGrid scores={digestionScores} compact />
            <ScoreGridSummary scores={digestionScores} />
          </Card>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  greeting: { ...typography.h1, color: colors.textPrimary },
  subGreeting: { ...typography.body, color: colors.textSecondary },
  progressCard: { marginTop: spacing.sm },
  taskList: { gap: spacing.sm },
  taskCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  taskEmoji: { fontSize: 28 },
  taskBody: { flex: 1, gap: 4 },
  taskTitle: { ...typography.body, color: colors.textPrimary, fontFamily: typography.bodySemiBold.fontFamily },
  taskAction: { ...typography.bodySmall, color: colors.primary },
  doneText: { ...typography.body, color: colors.textPrimary },
  metricsRow: { gap: spacing.sm },
  metricCard: { gap: spacing.sm },
  metricLabel: { ...typography.bodySmall, color: colors.textSecondary },
});

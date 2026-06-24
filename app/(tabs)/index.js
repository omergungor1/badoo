import { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DAILY_TASK_RING_CONFIG, NUTRITION_RING_CONFIG } from '../../constants/onboarding';
import { useAuth } from '../../context/AuthContext';
import { calculateFoodTotals, getFoodLogsForDay } from '../../services/foodService';
import { getAllDailyTasksForToday, getLogsForDate } from '../../services/logService';
import { useAppleHealthSync } from '../../hooks/useAppleHealthSync';
import { getActiveNotesForUser } from '../../services/friendNoteService';
import { getFriendsWithRings } from '../../services/friendService';
import { getUnreadNotificationCount } from '../../services/notificationService';
import FriendCard from '../../components/friends/FriendCard';
import Card from '../../components/ui/Card';
import DailyActivityRings from '../../components/ui/DailyActivityRings';
import ProgressRing from '../../components/ui/ProgressRing';
import ScoreGrid, { ScoreGridSummary } from '../../components/ui/ScoreGrid';
import SectionTitle from '../../components/ui/SectionTitle';
import { calculateDailyDigestionScore } from '../../utils/digestionScore';
import { endOfDay, getLastNDays, startOfDay, toISODate } from '../../utils/date';
import { formatWater } from '../../utils/nutrition';
import {
  calculateDailyActivityTotals,
  formatActivityProgressText,
  getActivityGoal,
  getActivityProgress,
} from '../../utils/activity';
import { colors, radius, spacing, typography } from '../../theme';

function clampProgress(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getTaskRingProgress(task, metrics) {
  if (task.completed) return 100;

  switch (task.task_key) {
    case 'meals':
      return clampProgress((metrics.calories / metrics.calorieGoal) * 100);
    case 'water':
      return clampProgress((metrics.waterTotal / metrics.waterGoal) * 100);
    default:
      return 0;
  }
}

export default function HomeScreen() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [allTasks, setAllTasks] = useState([]);
  const [totals, setTotals] = useState({ calories: 0, protein: 0 });
  const [waterTotal, setWaterTotal] = useState(0);
  const [activityTotals, setActivityTotals] = useState({
    steps: 0,
    distanceKm: 0,
    durationMinutes: 0,
  });
  const [friends, setFriends] = useState([]);
  const [notesBySender, setNotesBySender] = useState({});
  const [digestionScores, setDigestionScores] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);

  const calorieGoal = profile?.daily_calorie_goal || 2000;
  const proteinGoal = profile?.daily_protein_goal || 100;
  const waterGoal = profile?.daily_water_goal || 2000;
  const activityGoalConfig = getActivityGoal(profile);
  const activityGoalType = activityGoalConfig.type;
  const activityGoalValue = activityGoalConfig.value;

  const pendingTasks = useMemo(
    () => allTasks.filter((task) => !task.completed),
    [allTasks],
  );

  const nutritionRings = useMemo(() => {
    const calorieProgress = clampProgress((totals.calories / calorieGoal) * 100);
    const proteinProgress = clampProgress((totals.protein / proteinGoal) * 100);
    const waterProgress = clampProgress((waterTotal / waterGoal) * 100);
    const activityProgress = getActivityProgress(activityTotals, activityGoalType, activityGoalValue);

    return [
      {
        key: 'calories',
        label: NUTRITION_RING_CONFIG.calories.label,
        progress: calorieProgress,
        valueText: `${totals.calories}/${calorieGoal} kcal`,
        color: NUTRITION_RING_CONFIG.calories.color,
        trackColor: NUTRITION_RING_CONFIG.calories.trackColor,
      },
      {
        key: 'protein',
        label: NUTRITION_RING_CONFIG.protein.label,
        progress: proteinProgress,
        valueText: `${totals.protein}g/${proteinGoal}g`,
        color: NUTRITION_RING_CONFIG.protein.color,
        trackColor: NUTRITION_RING_CONFIG.protein.trackColor,
      },
      {
        key: 'water',
        label: NUTRITION_RING_CONFIG.water.label,
        progress: waterProgress,
        valueText: `${formatWater(waterTotal)}/${formatWater(waterGoal)}`,
        color: NUTRITION_RING_CONFIG.water.color,
        trackColor: NUTRITION_RING_CONFIG.water.trackColor,
      },
      {
        key: 'activity',
        label: activityGoalConfig.config.ringLabel,
        progress: activityProgress,
        valueText: formatActivityProgressText(activityTotals, activityGoalType, activityGoalValue),
        color: NUTRITION_RING_CONFIG.activity.color,
        trackColor: NUTRITION_RING_CONFIG.activity.trackColor,
      },
    ];
  }, [totals, waterTotal, activityTotals, calorieGoal, proteinGoal, waterGoal, activityGoalType, activityGoalValue, activityGoalConfig]);

  const nutritionAverage = useMemo(() => {
    if (!nutritionRings.length) return 0;
    return Math.round(
      nutritionRings.reduce((sum, ring) => sum + ring.progress, 0) / nutritionRings.length,
    );
  }, [nutritionRings]);

  const allNutritionRingsClosed = nutritionRings.every((ring) => ring.progress >= 100);

  const loadData = useCallback(async () => {
    if (!user?.id) return;

    const start = startOfDay().toISOString();
    const end = endOfDay().toISOString();

    const [{ data: taskData }, { data: foodLogs }] = await Promise.all([
      getAllDailyTasksForToday(user.id),
      getFoodLogsForDay(user.id, start, end),
    ]);

    setAllTasks(taskData || []);

    const foodTotals = calculateFoodTotals(foodLogs || []);
    setTotals(foodTotals);

    const [{ data: friendData }, { data: notes }, { count: unreadCount }] = await Promise.all([
      getFriendsWithRings(user.id),
      getActiveNotesForUser(user.id),
      getUnreadNotificationCount(user.id),
    ]);

    setNotificationCount(unreadCount || 0);

    setFriends(friendData || []);

    const grouped = {};
    (notes || []).forEach((note) => {
      if (!grouped[note.sender_id]) {
        grouped[note.sender_id] = note;
      }
    });
    setNotesBySender(grouped);

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

    const dayLogs = await getLogsForDate(user.id, toISODate());
    const water = (dayLogs.waterLogs || []).reduce((sum, log) => sum + (log.amount || 0), 0);
    setWaterTotal(water);
    setActivityTotals(calculateDailyActivityTotals(dayLogs.activityLogs || []));
  }, [user?.id]);

  const syncAppleHealth = useAppleHealthSync(user?.id, () => {
    loadData();
  });

  useFocusEffect(
    useCallback(() => {
      loadData();
      syncAppleHealth();
    }, [loadData, syncAppleHealth]),
  );

  async function onRefresh() {
    setRefreshing(true);
    await syncAppleHealth();
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

  const taskMetrics = {
    calories: totals.calories,
    waterTotal,
    calorieGoal,
    waterGoal,
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>Bugün nasılsın?</Text>
            <Text style={styles.subGreeting}>
              {allNutritionRingsClosed
                ? 'Tüm halkalar kapandı, harika gidiyorsun!'
                : `Halkaların ortalama %${nutritionAverage} doldu`}
            </Text>
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

        <DailyActivityRings rings={nutritionRings} />

        {friends.length ? (
          <>
            <SectionTitle
              title="Arkadaşların"
              subtitle="Bugünkü halkalarını takip et"
            />
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

        <SectionTitle title="Günlük Görevler" subtitle="Kayıt yaparak görevleri tamamla" />
        <View style={styles.taskList}>
          {pendingTasks.map((task) => {
            const ringConfig = DAILY_TASK_RING_CONFIG[task.task_key];
            const taskProgress = getTaskRingProgress(task, taskMetrics);

            return (
              <Pressable key={task.id} onPress={() => handleTaskPress(task)}>
                <View style={styles.taskCard}>
                  <ProgressRing
                    size={58}
                    strokeWidth={5}
                    progress={taskProgress}
                    color={ringConfig.color}
                    trackColor={ringConfig.trackColor}
                  >
                    <Text style={styles.taskEmoji}>{task.task_emoji}</Text>
                  </ProgressRing>

                  <View style={styles.taskBody}>
                    <Text style={styles.taskSlogan}>{ringConfig.slogan}</Text>
                    <Text style={styles.taskTitle}>{task.task_name}</Text>
                  </View>

                  <Text style={styles.taskChevron}>→</Text>
                </View>
              </Pressable>
            );
          })}

          {!pendingTasks.length ? (
            <Card variant="light">
              <Text style={styles.doneText}>Harika! Bugünkü görevlerin tamamlandı.</Text>
            </Card>
          ) : null}
        </View>

        <Pressable onPress={() => router.push('/digestion-calendar')}>
          <Card>
            <SectionTitle title="Sindirim Takvimi" subtitle="Son 28 gün" />
            <ScoreGrid scores={digestionScores} compact layout="weekly" />
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerText: { flex: 1, gap: 4 },
  greeting: { ...typography.h1, color: colors.textPrimary },
  subGreeting: { ...typography.body, color: colors.textSecondary },
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
  taskList: { gap: spacing.sm },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  taskEmoji: { fontSize: 22 },
  taskBody: { flex: 1, gap: 4 },
  taskSlogan: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
  },
  taskTitle: { ...typography.bodySmall, color: colors.textSecondary },
  taskChevron: {
    ...typography.bodySemiBold,
    color: colors.primary,
  },
  doneText: { ...typography.body, color: colors.textPrimary },
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

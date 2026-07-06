import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DAILY_TASK_RING_CONFIG, NUTRITION_RING_CONFIG } from '../../constants/onboarding';
import { useAuth } from '../../context/AuthContext';
import { calculateFoodTotals, getFoodLogsForDay } from '../../services/foodService';
import { getAllDailyTasksForToday, getLogsForDate, getTimelineForDay, completeTask, syncTodayWaterGlasses } from '../../services/logService';
import { getPeriodLogsForDate } from '../../services/periodService';
import { PERIOD_LOG_LABELS } from '../../constants/period';
import { useAppleHealthSync } from '../../hooks/useAppleHealthSync';
import HomeWeekCalendar from '../../components/home/HomeWeekCalendar';
import MealNutritionModal from '../../components/meals/MealNutritionModal';
import MealPhotoLogCard from '../../components/meals/MealPhotoLogCard';
import Card from '../../components/ui/Card';
import DailyActivityRings from '../../components/ui/DailyActivityRings';
import ProgressRing from '../../components/ui/ProgressRing';
import SectionTitle from '../../components/ui/SectionTitle';
import WaterTracking from '../../components/ui/WaterTracking';
import { calculateDailyDigestionScore } from '../../utils/digestionScore';
import {
  endOfDay,
  formatDate,
  formatTime,
  getCurrentWeekDays,
  isToday,
  parseISODate,
  startOfDay,
  toISODate,
} from '../../utils/date';
import {
  calculateDailyActivityTotals,
  formatActivityProgressText,
  formatActivityValue,
  getActivityGoal,
  getActivityProgress,
} from '../../utils/activity';
import { formatSleepLogLabel } from '../../utils/duration';
import { formatQuantityLabel } from '../../utils/foodQuantity';
import { formatWater } from '../../utils/nutrition';
import { consumedGlassesFromMl, GLASS_ML, goalGlassesFromMl } from '../../utils/water';
import { subscribeMealShared } from '../../utils/mealEvents';
import { colors, radius, spacing, typography } from '../../theme';

function clampProgress(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getPeriodTimelineLabel(item) {
  switch (item.log_type) {
    case 'start':
      return '🩸 Adet başlangıcı';
    case 'end':
      return '🩸 Adet bitişi';
    case 'symptom':
      return `🩸 ${item.symptom_name || PERIOD_LOG_LABELS.symptom}`;
    case 'note':
      return `🩸 ${item.note || PERIOD_LOG_LABELS.note}`;
    default:
      return '🩸 Regl kaydı';
  }
}

function getTimelineLabel(item) {
  if (item.logType === 'period') {
    return getPeriodTimelineLabel(item);
  }

  switch (item.logType) {
    case 'food':
      if (item.image_url) {
        return `🍽 ${item.meal_title || 'Öğün'}`;
      }
      return `🍽 ${item.foods?.food_name || 'Yemek'} (${formatQuantityLabel(item.quantity, item.foods?.unit_type)})`;
    case 'water':
      return `💧 Su +${item.amount} ml`;
    case 'drink':
      return `☕ ${item.drink_name}`;
    case 'medication':
      return `💊 ${item.medications?.medication_name || 'İlaç'} — ${item.dose || ''}`;
    case 'symptom':
      return `😖 ${item.symptom_name} ${item.severity}/5`;
    case 'stool':
      return `🚽 ${item.consistency}`;
    case 'sleep':
      return `😴 ${formatSleepLogLabel(item)} (Kalite ${item.quality}/5)`;
    case 'activity': {
      if (item.source === 'apple_health') {
        const parts = [];
        if (item.steps) parts.push(`${item.steps.toLocaleString('tr-TR')} adım`);
        if (item.distance) parts.push(formatActivityValue(item.distance, 'distance_km'));
        return `🍎 Apple Sağlık — ${parts.join(' · ') || 'Veri yok'}`;
      }

      const parts = [`🚶 ${item.activity_name}`];
      if (item.steps) parts.push(`${item.steps.toLocaleString('tr-TR')} adım`);
      if (item.distance) parts.push(formatActivityValue(item.distance, 'distance_km'));
      if (item.duration) parts.push(`${item.duration} dk`);
      return parts.join(' — ');
    }
    case 'status':
      return `☀️ Enerji ${item.energy}/5 · Ruh hali ${item.mood}/5`;
    case 'note':
      return `📝 ${item.note}`;
    default:
      return 'Kayıt';
  }
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
  const [lastWaterLogTime, setLastWaterLogTime] = useState(null);
  const [waterSaving, setWaterSaving] = useState(false);
  const [activityTotals, setActivityTotals] = useState({
    steps: 0,
    distanceKm: 0,
    durationMinutes: 0,
  });
  const [timelineItems, setTimelineItems] = useState([]);
  const [dayScores, setDayScores] = useState({});
  const [selectedDate, setSelectedDate] = useState(toISODate());
  const [editingMealLog, setEditingMealLog] = useState(null);
  const [mealModalVisible, setMealModalVisible] = useState(false);

  const showPeriod = profile?.gender === 'kadın';
  const waterGoal = profile?.daily_water_goal || 2000;
  const waterGoalGlasses = goalGlassesFromMl(waterGoal);
  const waterConsumedGlasses = consumedGlassesFromMl(waterTotal);
  const calorieGoal = profile?.daily_calorie_goal || 2000;
  const proteinGoal = profile?.daily_protein_goal || 100;
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

  const viewingToday = isToday(selectedDate);

  const mealPhotoItems = useMemo(
    () => timelineItems.filter((item) => item.logType === 'food' && item.image_url),
    [timelineItems],
  );

  const otherTimelineItems = useMemo(
    () => timelineItems.filter((item) => !(item.logType === 'food' && item.image_url)),
    [timelineItems],
  );

  const loadWeekScores = useCallback(async () => {
    if (!user?.id) return;

    const weekDays = getCurrentWeekDays();
    const results = await Promise.all(
      weekDays.map(async (date) => {
        const dayStart = startOfDay(parseISODate(date)).toISOString();
        const dayEnd = endOfDay(parseISODate(date)).toISOString();
        const [timeline, logs] = await Promise.all([
          getTimelineForDay(user.id, dayStart, dayEnd),
          getLogsForDate(user.id, date),
        ]);

        const hasData = timeline.length > 0;
        return [
          date,
          {
            hasData,
            score: hasData ? calculateDailyDigestionScore(logs) : null,
          },
        ];
      }),
    );

    setDayScores(Object.fromEntries(results));
  }, [user?.id]);

  const loadTimeline = useCallback(
    async (date) => {
      if (!user?.id) return;

      const start = startOfDay(parseISODate(date)).toISOString();
      const end = endOfDay(parseISODate(date)).toISOString();
      const requests = [getTimelineForDay(user.id, start, end)];

      if (showPeriod) {
        requests.push(getPeriodLogsForDate(user.id, date));
      }

      const [timelineResult, periodResult] = await Promise.all(requests);
      const timeline = timelineResult || [];
      const periodLogs = showPeriod
        ? (periodResult?.data || []).map((log) => ({
          ...log,
          logType: 'period',
          sortTime: log.logged_at,
        }))
        : [];

      const merged = [...timeline, ...periodLogs].sort(
        (a, b) => new Date(b.sortTime) - new Date(a.sortTime),
      );
      setTimelineItems(merged);
    },
    [showPeriod, user?.id],
  );

  const loadDayMetrics = useCallback(
    async (date) => {
      if (!user?.id) return;

      const start = startOfDay(parseISODate(date)).toISOString();
      const end = endOfDay(parseISODate(date)).toISOString();

      const [{ data: foodLogs }, dayLogs] = await Promise.all([
        getFoodLogsForDay(user.id, start, end),
        getLogsForDate(user.id, date),
      ]);

      setTotals(calculateFoodTotals(foodLogs || []));

      const waterLogs = dayLogs.waterLogs || [];
      const water = waterLogs.reduce((sum, log) => sum + (log.amount || 0), 0);
      const latestWaterLog = waterLogs.reduce((latest, log) => {
        if (!latest) return log;
        return new Date(log.timestamp) > new Date(latest.timestamp) ? log : latest;
      }, null);

      setWaterTotal(water);
      setLastWaterLogTime(latestWaterLog?.timestamp || null);
      setActivityTotals(calculateDailyActivityTotals(dayLogs.activityLogs || []));
      await loadTimeline(date);
    },
    [user?.id, loadTimeline],
  );

  const loadData = useCallback(async () => {
    if (!user?.id) return;

    if (viewingToday) {
      const { data: taskData } = await getAllDailyTasksForToday(user.id);
      setAllTasks(taskData || []);
    } else {
      setAllTasks([]);
    }

    await Promise.all([
      loadDayMetrics(selectedDate),
      loadWeekScores(),
    ]);
  }, [user?.id, selectedDate, viewingToday, loadDayMetrics, loadWeekScores]);

  const syncAppleHealth = useAppleHealthSync(user?.id, () => {
    if (isToday(selectedDate)) {
      loadData();
    }
  });

  useFocusEffect(
    useCallback(() => {
      loadData();
      if (isToday(selectedDate)) {
        syncAppleHealth();
      }
    }, [loadData, syncAppleHealth, selectedDate]),
  );

  useEffect(() => {
    return subscribeMealShared(() => {
      loadData();
    });
  }, [loadData]);

  async function onRefresh() {
    setRefreshing(true);
    if (isToday(selectedDate)) {
      await syncAppleHealth();
    }
    await loadData();
    setRefreshing(false);
  }

  async function handleSelectDate(date) {
    if (date === selectedDate) return;

    setSelectedDate(date);

    if (!user?.id) return;

    if (isToday(date)) {
      const { data: taskData } = await getAllDailyTasksForToday(user.id);
      setAllTasks(taskData || []);
    } else {
      setAllTasks([]);
    }

    await loadDayMetrics(date);
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

  async function handleWaterGlassesPress(glasses) {
    if (!user?.id || waterSaving || !viewingToday) return;

    const targetMl = glasses * GLASS_ML;
    if (waterTotal === targetMl) return;

    setWaterSaving(true);
    const { error } = await syncTodayWaterGlasses(user.id, glasses);
    setWaterSaving(false);

    if (error) {
      Alert.alert('Hata', error.message);
      return;
    }

    if (glasses > 0) {
      await completeTask(user.id, 'water');
    }

    await loadData();
  }

  function handleMealPress(item) {
    setEditingMealLog(item);
    setMealModalVisible(true);
  }

  function handleMealModalClose() {
    setMealModalVisible(false);
    setEditingMealLog(null);
  }

  async function handleMealSaved() {
    await loadData();
  }

  const taskMetrics = {
    calories: totals.calories,
    waterTotal,
    calorieGoal,
    waterGoal,
  };

  const dailyTitle = isToday(selectedDate) ? 'Günlük' : `Günlük · ${formatDate(selectedDate)}`;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <HomeWeekCalendar
          selectedDate={selectedDate}
          dayScores={dayScores}
          onSelectDate={handleSelectDate}
        />

        <DailyActivityRings rings={nutritionRings} />

        <Card>
          <WaterTracking
            waterTotal={waterTotal}
            waterGoal={waterGoal}
            consumedGlasses={waterConsumedGlasses}
            goalGlasses={waterGoalGlasses}
            lastLogTime={lastWaterLogTime}
            onSelectGlasses={handleWaterGlassesPress}
            saving={waterSaving || !viewingToday}
          />
        </Card>

        {viewingToday ? (
          <>
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
          </>
        ) : null}

        <SectionTitle
          title={dailyTitle}
          subtitle={viewingToday ? 'Bugünkü kayıtların' : 'Seçili günün kayıtları'}
        />

        {mealPhotoItems.length ? (
          <View style={styles.timelineList}>
            {mealPhotoItems.map((item) => (
              <MealPhotoLogCard
                key={`meal-${item.id}`}
                item={item}
                onPress={handleMealPress}
              />
            ))}
          </View>
        ) : null}

        <View style={styles.timelineList}>
          {otherTimelineItems.map((item) => (
            <Card key={`${item.logType}-${item.id}`} style={styles.timelineItem}>
              <Text style={styles.timelineTime}>{formatTime(item.sortTime)}</Text>
              <Text style={styles.timelineLabel}>{getTimelineLabel(item)}</Text>
            </Card>
          ))}

          {!otherTimelineItems.length && !mealPhotoItems.length ? (
            <Card variant="light">
              <Text style={styles.timelineEmpty}>
                {isToday(selectedDate)
                  ? 'Henüz bugün için kayıt yok. + butonuyla ekleyebilirsin.'
                  : 'Bu gün için kayıt bulunamadı.'}
              </Text>
            </Card>
          ) : null}
        </View>
      </ScrollView>

      <MealNutritionModal
        visible={mealModalVisible}
        mealLog={editingMealLog}
        onClose={handleMealModalClose}
        onSaved={handleMealSaved}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 120 },
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
  timelineList: { gap: spacing.sm },
  timelineItem: { gap: 4 },
  timelineTime: { ...typography.caption, color: colors.textSecondary },
  timelineLabel: { ...typography.body, color: colors.textPrimary },
  timelineEmpty: { ...typography.body, color: colors.textSecondary },
});

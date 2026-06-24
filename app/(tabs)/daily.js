import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { getLogsForDate, getTimelineForDay } from '../../services/logService';
import { getPeriodCycles, getPeriodLogsForDate } from '../../services/periodService';
import { PERIOD_LOG_LABELS } from '../../constants/period';
import Card from '../../components/ui/Card';
import MonthCalendar from '../../components/ui/MonthCalendar';
import SectionTitle from '../../components/ui/SectionTitle';
import { calculateDailyDigestionScore } from '../../utils/digestionScore';
import {
  endOfDay,
  formatDate,
  formatTime,
  getMonthDays,
  isToday,
  parseISODate,
  startOfDay,
  toISODate,
} from '../../utils/date';
import { formatActivityValue } from '../../utils/activity';
import { formatSleepLogLabel } from '../../utils/duration';
import { formatQuantityLabel } from '../../utils/foodQuantity';
import { buildPeriodCalendarMarkers } from '../../utils/period';
import { colors, spacing, typography } from '../../theme';

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

function getInitialMonth() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}

export default function DailyScreen() {
  const { user, profile } = useAuth();
  const [items, setItems] = useState([]);
  const [dayScores, setDayScores] = useState({});
  const [periodMarkers, setPeriodMarkers] = useState({});
  const [selectedDate, setSelectedDate] = useState(toISODate());
  const [visibleMonth, setVisibleMonth] = useState(getInitialMonth);
  const [refreshing, setRefreshing] = useState(false);

  const showPeriod = profile?.gender === 'kadın';

  const loadMonthScores = useCallback(
    async (year, month) => {
      if (!user?.id) return;

      const days = getMonthDays(year, month);
      const results = await Promise.all(
        days.map(async (date) => {
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
    },
    [user?.id],
  );

  const loadPeriodMarkers = useCallback(async () => {
    if (!user?.id || !showPeriod) {
      setPeriodMarkers({});
      return;
    }

    const { data, error } = await getPeriodCycles(user.id);
    if (error) {
      return;
    }

    setPeriodMarkers(buildPeriodCalendarMarkers(data || []));
  }, [showPeriod, user?.id]);

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
      setItems(merged);
    },
    [showPeriod, user?.id],
  );

  const loadData = useCallback(async () => {
    await Promise.all([
      loadMonthScores(visibleMonth.year, visibleMonth.month),
      loadPeriodMarkers(),
      loadTimeline(selectedDate),
    ]);
  }, [
    loadMonthScores,
    loadPeriodMarkers,
    loadTimeline,
    selectedDate,
    visibleMonth.month,
    visibleMonth.year,
  ]);

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

  function handleSelectDate(date) {
    setSelectedDate(date);
    loadTimeline(date);

    const parsed = parseISODate(date);
    if (parsed.getFullYear() !== visibleMonth.year || parsed.getMonth() !== visibleMonth.month) {
      setVisibleMonth({ year: parsed.getFullYear(), month: parsed.getMonth() });
      loadMonthScores(parsed.getFullYear(), parsed.getMonth());
    }
  }

  function handleMonthChange(nextMonth) {
    setVisibleMonth(nextMonth);
    loadMonthScores(nextMonth.year, nextMonth.month);
  }

  const title = isToday(selectedDate) ? 'Günlük' : `Günlük · ${formatDate(selectedDate)}`;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <SectionTitle title={title} />

        <Card>
          <MonthCalendar
            year={visibleMonth.year}
            month={visibleMonth.month}
            selectedDate={selectedDate}
            dayScores={dayScores}
            dayMarkers={periodMarkers}
            onSelectDate={handleSelectDate}
            onMonthChange={handleMonthChange}
          />
        </Card>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {items.map((item) => (
          <Card key={`${item.logType}-${item.id}`} style={styles.item}>
            <Text style={styles.time}>{formatTime(item.sortTime)}</Text>
            <Text style={styles.label}>{getTimelineLabel(item)}</Text>
          </Card>
        ))}

        {!items.length ? (
          <Card variant="light">
            <Text style={styles.empty}>
              {isToday(selectedDate)
                ? 'Henüz bugün için kayıt yok. + butonuyla ekleyebilirsin.'
                : 'Bu gün için kayıt bulunamadı.'}
            </Text>
          </Card>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  list: { flex: 1 },
  listContent: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxl },
  item: { gap: 4 },
  time: { ...typography.caption, color: colors.textSecondary },
  label: { ...typography.body, color: colors.textPrimary },
  empty: { ...typography.body, color: colors.textSecondary },
});

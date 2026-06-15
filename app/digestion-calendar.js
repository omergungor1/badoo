import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { getLogsForDate } from '../services/logService';
import Card from '../components/ui/Card';
import ScoreGrid, { ScoreGridSummary } from '../components/ui/ScoreGrid';
import SectionTitle from '../components/ui/SectionTitle';
import {
  calculateDailyDigestionScore,
  findLongestStreak,
  getComfortSummary,
} from '../utils/digestionScore';
import { getLastNDays } from '../utils/date';
import { colors, spacing, typography } from '../theme';

export default function DigestionCalendarScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [scores, setScores] = useState([]);

  const loadScores = useCallback(async () => {
    if (!user?.id) return;

    const days = getLastNDays(30);
    const results = await Promise.all(
      days.map(async (date) => {
        const logs = await getLogsForDate(user.id, date);
        const hasData =
          logs.symptoms.length ||
          logs.sleepLogs.length ||
          logs.statusLogs.length ||
          logs.stoolLogs.length ||
          logs.foodLogs.length ||
          logs.waterLogs.length;

        return {
          date,
          score: hasData ? calculateDailyDigestionScore(logs) : null,
        };
      }),
    );

    setScores(results);
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadScores();
    }, [loadScores]),
  );

  const numericScores = scores.map((s) => s.score ?? 0);
  const summary = getComfortSummary(scores.map((s) => s.score).filter((s) => s != null));
  const goodStreak = findLongestStreak(numericScores, 75, true);
  const badStreak = findLongestStreak(numericScores, 60, false);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <SectionTitle title="Son 30 Gün" subtitle="Sindirim konfor haritası" />
        <Card>
          <ScoreGrid
            scores={scores}
            onDayPress={(item) => router.push(`/digestion-day/${item.date}`)}
          />
          <ScoreGridSummary scores={scores} />
        </Card>

        <Card>
          <Text style={styles.summaryTitle}>En uzun rahat dönem</Text>
          <Text style={styles.summaryValue}>🟩 {goodStreak} gün</Text>
        </Card>

        <Card>
          <Text style={styles.summaryTitle}>En uzun sorunlu dönem</Text>
          <Text style={styles.summaryValue}>🟥 {badStreak} gün</Text>
        </Card>

        <Card>
          <Text style={styles.summaryTitle}>Bu dönemin ortalama sindirim skoru</Text>
          <Text style={styles.summaryValue}>{summary.average}/100</Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  summaryTitle: { ...typography.bodySmall, color: colors.textSecondary },
  summaryValue: { ...typography.h3, color: colors.textPrimary, marginTop: 4 },
});

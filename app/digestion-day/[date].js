import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { getLogsForDate } from '../../services/logService';
import Card from '../../components/ui/Card';
import { calculateDailyDigestionScore, getScoreColor } from '../../utils/digestionScore';
import { getNutritionFactor } from '../../utils/foodQuantity';
import { formatDate } from '../../utils/date';
import { formatWater } from '../../utils/nutrition';
import { fonts, colors, spacing, typography } from '../../theme';

export default function DigestionDayScreen() {
  const { date } = useLocalSearchParams();
  const { user } = useAuth();
  const [logs, setLogs] = useState(null);
  const [score, setScore] = useState(null);

  const loadDay = useCallback(async () => {
    if (!user?.id || !date) return;
    const data = await getLogsForDate(user.id, date);
    setLogs(data);
    setScore(calculateDailyDigestionScore(data));
  }, [user?.id, date]);

  useFocusEffect(
    useCallback(() => {
      loadDay();
    }, [loadDay]),
  );

  if (!logs) {
    return null;
  }

  const protein = logs.foodLogs.reduce((sum, log) => {
    const factor = getNutritionFactor(log.quantity, log.foods?.unit_type);
    return sum + Math.round((log.foods?.protein || 0) * factor);
  }, 0);

  const water = logs.waterLogs.reduce((sum, log) => sum + (log.amount || 0), 0);
  const sleepHours = logs.sleepLogs[0]?.hours;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.date}>{formatDate(date)}</Text>
      <Text style={[styles.score, { color: getScoreColor(score) }]}>
        Sindirim Skoru: {score}
      </Text>

      <Card>
        <Text style={styles.section}>Belirtiler</Text>
        {logs.symptoms.length ? logs.symptoms.map((item) => (
          <Text key={item.id} style={styles.row}>
            {item.symptom_name}: {item.severity}/5
          </Text>
        )) : <Text style={styles.empty}>Belirti yok</Text>}
      </Card>

      <Card>
        <Text style={styles.section}>Beslenme & Su</Text>
        <Text style={styles.row}>Protein: {protein}g</Text>
        <Text style={styles.row}>Su: {formatWater(water)}</Text>
        <Text style={styles.row}>Uyku: {sleepHours ? `${sleepHours} saat` : '-'}</Text>
      </Card>

      <Card>
        <Text style={styles.section}>Yemekler</Text>
        {logs.foodLogs.length ? logs.foodLogs.map((item) => (
          <Text key={item.id} style={styles.row}>- {item.foods?.food_name}</Text>
        )) : <Text style={styles.empty}>Yemek kaydı yok</Text>}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md, backgroundColor: colors.background },
  date: { ...typography.h2, color: colors.textPrimary },
  score: { ...typography.h3 },
  section: { fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.textPrimary, marginBottom: 8 },
  row: { ...typography.body, color: colors.textSecondary, marginBottom: 4 },
  empty: { ...typography.body, color: colors.textSecondary },
});

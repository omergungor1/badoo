import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { getPeriodCycles, getPeriodLogs } from '../services/periodService';
import Card from '../components/ui/Card';
import SectionTitle from '../components/ui/SectionTitle';
import { PERIOD_LOG_LABELS } from '../constants/period';
import { formatDate } from '../utils/date';
import { daysBetween, formatPeriodDuration, formatPeriodRange, inclusiveDayCount } from '../utils/period';
import { colors, spacing, typography } from '../theme';

export default function PeriodHistoryScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [cycles, setCycles] = useState([]);
  const [logsByCycle, setLogsByCycle] = useState({});

  const loadHistory = useCallback(async () => {
    if (!user?.id) return;

    const [cyclesResult, logsResult] = await Promise.all([
      getPeriodCycles(user.id),
      getPeriodLogs(user.id),
    ]);

    if (cyclesResult.error) {
      Alert.alert('Hata', cyclesResult.error.message);
      return;
    }

    const grouped = {};
    (logsResult.data || []).forEach((log) => {
      if (!grouped[log.cycle_id]) grouped[log.cycle_id] = [];
      grouped[log.cycle_id].push(log);
    });

    setCycles(cyclesResult.data || []);
    setLogsByCycle(grouped);
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory]),
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.back}>← Geri</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Regl Geçmişi</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <SectionTitle title="Tüm dönemler" subtitle="Başlangıç, bitiş ve süreler" />

        {cycles.length ? (
          cycles.map((cycle, index) => {
            const nextCycle = cycles[index + 1];
            const gapDays = nextCycle ? daysBetween(nextCycle.start_date, cycle.start_date) : null;
            const logs = logsByCycle[cycle.id] || [];

            return (
              <Pressable key={cycle.id} onPress={() => router.push(`/period-edit/${cycle.id}`)}>
                <Card style={styles.cycleCard}>
                  <Text style={styles.cycleTitle}>{formatPeriodRange(cycle)}</Text>
                  <Text style={styles.cycleMeta}>Süre: {formatPeriodDuration(cycle)}</Text>
                  {gapDays != null ? (
                    <Text style={styles.cycleMeta}>Önceki adetten bu adete: {gapDays} gün</Text>
                  ) : null}
                  {!cycle.end_date ? (
                    <Text style={styles.ongoing}>Devam eden dönem</Text>
                  ) : (
                    <Text style={styles.cycleMeta}>
                      Adet gün sayısı: {inclusiveDayCount(cycle.start_date, cycle.end_date)} gün
                    </Text>
                  )}
                  <Text style={styles.editHint}>Düzenlemek için dokunun</Text>

                  {logs.length ? (
                    <View style={styles.logList}>
                      {logs.map((log) => (
                        <Text key={log.id} style={styles.logItem}>
                          · {formatDate(log.logged_at)} — {PERIOD_LOG_LABELS[log.log_type] || log.log_type}
                          {log.symptom_name ? `: ${log.symptom_name}` : ''}
                          {log.note && log.log_type !== 'start' && log.log_type !== 'end' ? `: ${log.note}` : ''}
                        </Text>
                      ))}
                    </View>
                  ) : null}
                </Card>
              </Pressable>
            );
          })
        ) : (
          <Card>
            <Text style={styles.empty}>Henüz regl geçmişi yok.</Text>
          </Card>
        )}
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
  },
  back: { ...typography.body, color: colors.primary },
  headerTitle: { ...typography.headingMedium, color: colors.textPrimary },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  cycleCard: { gap: spacing.xs },
  cycleTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontFamily: typography.bodyBold.fontFamily,
  },
  editHint: {
    ...typography.caption,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  cycleMeta: { ...typography.bodySmall, color: colors.textSecondary },
  ongoing: { ...typography.bodySmall, color: colors.primary },
  logList: { marginTop: spacing.sm, gap: 4 },
  logItem: { ...typography.caption, color: colors.textSecondary },
  empty: { ...typography.body, color: colors.textSecondary },
});

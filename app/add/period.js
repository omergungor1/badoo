import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import {
  endPeriod,
  getPeriodDashboard,
} from '../../services/periodService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import SectionTitle from '../../components/ui/SectionTitle';
import { PERIOD_LOG_LABELS } from '../../constants/period';
import { formatDate, formatTime } from '../../utils/date';
import { formatPeriodDuration, formatPeriodRange } from '../../utils/period';
import { colors, spacing, typography } from '../../theme';

function StatRow({ label, value }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value ?? '-'}</Text>
    </View>
  );
}

function ActionButton({ title, emoji, onPress, variant = 'primary' }) {
  return (
    <Button
      title={`${emoji} ${title}`}
      onPress={onPress}
      variant={variant}
      style={styles.actionBtn}
    />
  );
}

function formatLogText(log) {
  if (log.log_type === 'symptom') return log.symptom_name || 'Semptom';
  if (log.log_type === 'note') return log.note || 'Not';
  return log.note || PERIOD_LOG_LABELS[log.log_type] || log.log_type;
}

export default function PeriodScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [dashboard, setDashboard] = useState(null);

  const loadDashboard = useCallback(async () => {
    if (!user?.id) return;

    const { data, error } = await getPeriodDashboard(user.id);
    if (error) {
      Alert.alert('Hata', error.message);
      return;
    }
    setDashboard(data);
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard]),
  );

  async function handleEnd() {
    if (!user?.id) return;

    router.push('/add/period-end');
  }

  const summary = dashboard?.summary;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <SectionTitle title="Regl Takibi" subtitle="Döngünü buradan yönet" />

      <Card style={styles.statsCard}>
        <Text style={styles.cardTitle}>
          {summary?.isOngoing ? '🩸 Aktif dönem' : 'Döngü özeti'}
        </Text>
        <StatRow
          label="Başlangıçtan bu yana"
          value={summary?.daysSinceStart != null ? `${summary.daysSinceStart} gün` : 'Aktif dönem yok'}
        />
        <StatRow
          label="Önceki adetten bu adete"
          value={summary?.daysBetweenCycles != null ? `${summary.daysBetweenCycles} gün` : '-'}
        />
        <StatRow
          label="Son tamamlanan adet süresi"
          value={summary?.lastPeriodLength != null ? `${summary.lastPeriodLength} gün` : '-'}
        />
        <StatRow
          label="Ortalama döngü süresi"
          value={summary?.avgCycleLength != null ? `${summary.avgCycleLength} gün` : '-'}
        />
        <StatRow
          label="Tahmini sonraki adet"
          value={
            summary?.predictedNextStart
              ? formatDate(summary.predictedNextStart)
              : '-'
          }
        />
        <StatRow
          label="Tahmini kalan gün"
          value={
            summary?.daysUntilNext != null
              ? summary.daysUntilNext >= 0
                ? `${summary.daysUntilNext} gün`
                : `${Math.abs(summary.daysUntilNext)} gün gecikmiş olabilir`
              : '-'
          }
        />
        {summary?.activeCycle ? (
          <Pressable onPress={() => router.push(`/period-edit/${summary.activeCycle.id}`)}>
            <Text style={styles.activeRange}>
              {formatPeriodRange(summary.activeCycle)} · {formatPeriodDuration(summary.activeCycle)}
              {'\n'}Düzenlemek için dokunun
            </Text>
          </Pressable>
        ) : null}
      </Card>

      <View style={styles.actions}>
        <ActionButton
          title="Başlangıç"
          emoji="🩸"
          onPress={() => router.push('/add/period-start')}
        />
        <ActionButton
          title="Semptom"
          emoji="😣"
          variant="outline"
          onPress={() => router.push('/add/period-symptom')}
        />
        <ActionButton
          title="Not"
          emoji="📝"
          variant="outline"
          onPress={() => router.push('/add/period-note')}
        />
        <ActionButton title="Bitiş" emoji="✅" onPress={handleEnd} />
      </View>

      <Button
        title="Geçmiş"
        variant="outline"
        onPress={() => router.push('/period-history')}
        style={styles.historyBtn}
      />

      <SectionTitle title="Son kayıtlar" subtitle="Bu döneme ait bildirimler" />
      {dashboard?.recentLogs?.length ? (
        dashboard.recentLogs.map((log) => (
          <Card key={log.id} style={styles.logCard}>
            <Text style={styles.logType}>{PERIOD_LOG_LABELS[log.log_type] || log.log_type}</Text>
            <Text style={styles.logText}>{formatLogText(log)}</Text>
            <Text style={styles.logTime}>
              {formatDate(log.logged_at)} · {formatTime(log.logged_at)}
            </Text>
          </Card>
        ))
      ) : (
        <Card>
          <Text style={styles.empty}>Henüz regl kaydı yok.</Text>
        </Card>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  statsCard: { gap: spacing.sm },
  cardTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontFamily: typography.bodyBold.fontFamily,
    marginBottom: spacing.xs,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  statLabel: { ...typography.bodySmall, color: colors.textSecondary, flex: 1 },
  statValue: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontFamily: typography.bodyBold.fontFamily,
    textAlign: 'right',
  },
  activeRange: {
    ...typography.caption,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionBtn: {
    width: '48%',
    minHeight: 52,
  },
  historyBtn: { marginTop: spacing.xs },
  logCard: { gap: 4 },
  logType: {
    ...typography.caption,
    color: colors.primary,
    fontFamily: typography.bodyBold.fontFamily,
  },
  logText: { ...typography.body, color: colors.textPrimary },
  logTime: { ...typography.caption, color: colors.textSecondary },
  empty: { ...typography.body, color: colors.textSecondary },
  loading: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
});

import { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { getRandomMascot } from '../../constants/mascots';
import { colors, radius, spacing, typography } from '../../theme';

/**
 * Sadece bugünkü ders henüz tamamlanmadıysa gösterilir.
 */
export default function AcademyHomeCard({ summary }) {
  const router = useRouter();
  const mascot = useMemo(() => getRandomMascot(), []);

  // Yalnızca bugün açılmış (status: today) ders varken göster — tamamlandıysa veya yarınsa yok
  if (
    !summary ||
    summary.todayCompleted ||
    !summary.todayLesson ||
    summary.todayLesson.status === 'tomorrow'
  ) {
    return null;
  }

  const { todayLesson, journeyProgress = 0, progress, completedCount = 0, totalLessons = 0 } =
    summary;

  return (
    <Pressable
      onPress={() => router.push(`/academy/lesson/${todayLesson.id}`)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.row}>
        <Image source={mascot} style={styles.mascot} resizeMode="contain" />
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>Bugünkü ders hazır</Text>
          <Text style={styles.day}>Gün {todayLesson.day_number}</Text>
          <Text style={styles.title} numberOfLines={2}>
            {todayLesson.title}
          </Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.min(100, journeyProgress)}%` }]} />
          </View>
          <Text style={styles.meta}>
            %{journeyProgress} · {completedCount}/{totalLessons}
            {progress?.current_streak ? ` · 🔥 ${progress.current_streak}` : ''}
          </Text>
        </View>
      </View>

      <View style={styles.cta}>
        <Text style={styles.ctaText}>Dersi başlat</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 2,
    borderColor: '#C7E9FF',
    backgroundColor: '#F0F9FF',
  },
  pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  mascot: {
    width: 72,
    height: 72,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    ...typography.caption,
    color: '#1CB0F6',
    fontFamily: typography.bodySemiBold.fontFamily,
  },
  day: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  title: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 22,
  },
  track: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: 'rgba(28,176,246,0.15)',
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  fill: {
    height: '100%',
    backgroundColor: '#1CB0F6',
    borderRadius: radius.full,
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  cta: {
    backgroundColor: '#1CB0F6',
    borderRadius: radius.lg,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#1899D6',
  },
  ctaText: {
    ...typography.bodySemiBold,
    color: colors.white,
  },
});

import { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { getRandomMascot } from '../../constants/mascots';
import { colors, radius, spacing, typography } from '../../theme';

export default function EliminationHomeCard({ card }) {
  const router = useRouter();
  const mascot = useMemo(() => getRandomMascot(), []);

  if (!card?.session?.program) return null;

  const { session, todaySymptomLogged } = card;
  const { program, currentDay, dayContent, progressPercent, status } = session;
  const isReintro = status === 'reintroduction';

  return (
    <Pressable
      onPress={() => router.push(`/lab/session/${session.id}`)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.top}>
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>
            {isReintro ? 'Yeniden tanıtım' : 'Aktif eliminasyon'}
          </Text>
          <Text style={styles.title}>
            {program.emoji} {program.title}
          </Text>
          <Text style={styles.day}>
            {isReintro ? '48 saat takip' : `Gün ${currentDay} / 7`}
          </Text>
        </View>
        <Image source={mascot} style={styles.mascot} resizeMode="contain" />
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.min(100, progressPercent || 0)}%` }]} />
      </View>

      {dayContent?.lesson ? (
        <Text style={styles.info} numberOfLines={2}>
          {dayContent.lesson.title}: {dayContent.lesson.body}
        </Text>
      ) : null}

      {dayContent?.task && !isReintro ? (
        <Text style={styles.task} numberOfLines={1}>
          Görev: {dayContent.task.title}
        </Text>
      ) : null}

      <View style={styles.cta}>
        <Text style={styles.ctaText}>
          {todaySymptomLogged ? 'Laboratuvara git' : 'Bugünkü belirtiyi gir'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F3F0FF',
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: '#DDD6FE',
    padding: spacing.md,
    gap: spacing.sm,
  },
  pressed: { opacity: 0.92 },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  copy: { flex: 1, gap: 2 },
  eyebrow: {
    ...typography.caption,
    color: '#7C3AED',
    fontFamily: typography.bodySemiBold.fontFamily,
  },
  title: {
    ...typography.bodySemiBold,
    fontSize: 17,
    color: colors.textPrimary,
  },
  day: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  mascot: { width: 64, height: 64 },
  track: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: 'rgba(124,58,237,0.12)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#7C3AED',
    borderRadius: radius.full,
  },
  info: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  task: {
    ...typography.caption,
    color: colors.textPrimary,
    fontFamily: typography.bodySemiBold.fontFamily,
  },
  cta: {
    marginTop: 4,
    backgroundColor: '#7C3AED',
    borderRadius: radius.lg,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    ...typography.bodySemiBold,
    color: colors.white,
  },
});

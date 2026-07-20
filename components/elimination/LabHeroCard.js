import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radius, spacing, typography } from '../../theme';

export default function LabHeroCard({ active }) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push('/lab')}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Text style={styles.emoji}>🧪</Text>
      <Text style={styles.title}>Dr. Badoo Laboratuvarı</Text>
      <Text style={styles.body}>
        Vücudunun hangi besinlere nasıl tepki verdiğini bilimsel yaklaşımla birlikte keşfet.
      </Text>
      {active?.program ? (
        <View style={styles.activeBox}>
          <Text style={styles.activeLabel}>Aktif deney</Text>
          <Text style={styles.activeTitle}>
            {active.program.emoji} {active.program.title}
          </Text>
          <Text style={styles.activeMeta}>
            {active.status === 'reintroduction'
              ? 'Yeniden tanıtım · 48 saat'
              : `Gün ${active.currentDay} / 7`}
          </Text>
          <View style={styles.track}>
            <View
              style={[styles.fill, { width: `${Math.min(100, active.progressPercent || 0)}%` }]}
            />
          </View>
        </View>
      ) : (
        <Text style={styles.cta}>Laboratuvarı aç →</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A1028',
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  pressed: { opacity: 0.94 },
  emoji: { fontSize: 32 },
  title: {
    ...typography.bodySemiBold,
    fontSize: 22,
    lineHeight: 28,
    color: colors.white,
  },
  body: {
    ...typography.body,
    color: 'rgba(255,255,255,0.72)',
    lineHeight: 22,
  },
  activeBox: {
    marginTop: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: 4,
  },
  activeLabel: {
    ...typography.caption,
    color: '#C4B5FD',
    fontFamily: typography.bodySemiBold.fontFamily,
  },
  activeTitle: {
    ...typography.bodySemiBold,
    color: colors.white,
    fontSize: 16,
  },
  activeMeta: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.65)',
  },
  track: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
    marginTop: 8,
  },
  fill: {
    height: '100%',
    backgroundColor: '#A78BFA',
    borderRadius: radius.full,
  },
  cta: {
    ...typography.bodySemiBold,
    color: '#C4B5FD',
    marginTop: spacing.xs,
  },
});

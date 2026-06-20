import { StyleSheet, Text, View } from 'react-native';
import Card from './Card';
import ProgressRing from './ProgressRing';
import { colors, spacing, typography } from '../../theme';

const BASE_SIZE = 230;
const STROKE = 11;
const RING_STEP = 18;

export default function DailyActivityRings({ rings = [] }) {
  const overallProgress = rings.length
    ? Math.round(rings.reduce((sum, ring) => sum + ring.progress, 0) / rings.length)
    : 0;

  const closedCount = rings.filter((ring) => ring.progress >= 100).length;

  return (
    <Card style={styles.card}>
      <View style={styles.cluster}>
        {rings.map((ring, index) => {
          const size = BASE_SIZE - index * RING_STEP;

          return (
            <View key={ring.key} style={styles.ringLayer}>
              <ProgressRing
                size={size}
                strokeWidth={STROKE}
                progress={ring.progress}
                color={ring.color}
                trackColor={ring.trackColor}
              />
            </View>
          );
        })}

        <View style={styles.center}>
          <Text style={styles.percent}>{overallProgress}%</Text>
          <Text style={styles.centerLabel}>Ortalama</Text>
        </View>
      </View>

      <View style={styles.copy}>
        <Text style={styles.title}>Günlük halkaların</Text>
        <Text style={styles.subtitle}>
          {closedCount}/{rings.length} halka hedefe ulaştı
        </Text>
      </View>

      <View style={styles.legend}>
        {rings.map((ring) => (
          <View key={ring.key} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: ring.color }]} />
            <View style={styles.legendCopy}>
              <Text style={styles.legendLabel}>{ring.label}</Text>
              <Text style={styles.legendValue}>{ring.valueText}</Text>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  cluster: {
    width: BASE_SIZE,
    height: BASE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  percent: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  centerLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  copy: {
    alignItems: 'center',
    gap: 4,
  },
  title: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  legend: {
    width: '100%',
    gap: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendCopy: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendLabel: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontFamily: typography.bodySemiBold.fontFamily,
  },
  legendValue: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});

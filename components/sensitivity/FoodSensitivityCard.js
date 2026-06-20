import { StyleSheet, Text, View } from 'react-native';
import { getSensitivityLevel } from '../../utils/foodSensitivityScore';
import { colors, radius, spacing, typography } from '../../theme';

export default function FoodSensitivityCard({ item, rank }) {
  const level = getSensitivityLevel(item.score);

  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <View style={styles.emojiWrap}>
          <Text style={styles.emoji}>{item.emoji}</Text>
        </View>
        <View style={styles.copy}>
          <Text style={styles.name}>{item.foodName}</Text>
          <Text style={styles.meta}>
            {item.mealCount
              ? `${item.mealCount} öğün · ${item.reactionCount} reaksiyon`
              : item.declaredMatch
                ? 'Profilde bildirildi'
                : 'Henüz yeterli veri yok'}
          </Text>
        </View>
      </View>

      <View style={styles.right}>
        <Text style={styles.rank}>#{rank}</Text>
        <View style={[styles.scoreBadge, { backgroundColor: `${level.color}22` }]}>
          <Text style={[styles.score, { color: level.color }]}>{item.score}</Text>
        </View>
        <Text style={[styles.level, { color: level.color }]}>{level.label}</Text>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${item.score}%`, backgroundColor: level.color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    paddingRight: 88,
    gap: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  emojiWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 24,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  right: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    alignItems: 'flex-end',
    gap: 2,
  },
  rank: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  scoreBadge: {
    minWidth: 42,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    alignItems: 'center',
  },
  score: {
    ...typography.bodySemiBold,
    fontSize: 16,
  },
  level: {
    ...typography.caption,
    fontFamily: typography.bodySemiBold.fontFamily,
  },
  track: {
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  fill: {
    height: '100%',
    borderRadius: radius.full,
  },
});

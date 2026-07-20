import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getSensitivityLevel } from '../../utils/foodSensitivityScore';
import { colors, radius, spacing, typography } from '../../theme';

export default function FoodSensitivityCard({ item, rank, onAskAi }) {
  const level = getSensitivityLevel(item.score);
  const showAskAi = Boolean(onAskAi && item.score > 0);

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.emojiWrap}>
          <Text style={styles.emoji}>{item.emoji}</Text>
        </View>

        <View style={styles.main}>
          <Text style={styles.name} numberOfLines={1}>
            {item.foodName}
          </Text>
          <View style={styles.metaRow}>
            <View style={[styles.scoreBadge, { backgroundColor: `${level.color}22` }]}>
              <Text style={[styles.score, { color: level.color }]}>{item.score}</Text>
            </View>
            <Text style={styles.metaDot}>·</Text>
            <Text style={[styles.level, { color: level.color }]}>{level.label}</Text>
          </View>
          <Text style={styles.meta} numberOfLines={1}>
            {item.mealCount
              ? `${item.mealCount} öğün · ${item.reactionCount} reaksiyon`
              : item.declaredMatch
                ? 'Profilde bildirildi'
                : 'Henüz yeterli veri yok'}
          </Text>
        </View>

        <View style={styles.right}>
          <Text style={styles.rank}>#{rank}</Text>
          {showAskAi ? (
            <Pressable
              onPress={() => onAskAi(item)}
              style={({ pressed }) => [styles.askBtn, pressed && styles.askBtnPressed]}
            >
              <Ionicons name="sparkles" size={12} color={colors.white} />
              <Text style={styles.askBtnText}>AI sor</Text>
            </Pressable>
          ) : null}
        </View>
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
    gap: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  main: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  name: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'nowrap',
  },
  rank: {
    ...typography.caption,
    color: colors.textSecondary,
    fontFamily: typography.bodySemiBold.fontFamily,
  },
  level: {
    ...typography.caption,
    fontFamily: typography.bodySemiBold.fontFamily,
  },
  metaDot: {
    ...typography.caption,
    color: colors.textMuted,
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  right: {
    alignItems: 'flex-end',
    gap: 6,
  },
  scoreBadge: {
    minWidth: 40,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    alignItems: 'center',
  },
  score: {
    ...typography.bodySemiBold,
    fontSize: 15,
  },
  track: {
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.full,
  },
  askBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  askBtnPressed: {
    backgroundColor: colors.primaryDark,
  },
  askBtnText: {
    ...typography.caption,
    color: colors.white,
    fontFamily: typography.bodySemiBold.fontFamily,
    fontSize: 11,
  },
});

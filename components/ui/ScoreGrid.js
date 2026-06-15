import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getScoreColor, getScoreEmoji } from '../../utils/digestionScore';
import { colors, radius, spacing, typography } from '../../theme';

export default function ScoreGrid({ scores = [], onDayPress, compact = false }) {
  const cellSize = compact ? 14 : 18;
  const gap = compact ? 4 : 6;

  return (
    <View style={[styles.grid, { gap }]}>
      {scores.map((item) => (
        <Pressable
          key={item.date}
          onPress={() => onDayPress?.(item)}
          style={[
            styles.cell,
            {
              width: cellSize,
              height: cellSize,
              backgroundColor: item.score == null ? colors.border : getScoreColor(item.score),
            },
          ]}
        >
          {!compact && item.score != null ? (
            <Text style={styles.emoji}>{getScoreEmoji(item.score)}</Text>
          ) : null}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    borderRadius: radius.sm / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 8,
  },
});

export function ScoreGridSummary({ scores = [] }) {
  const filled = scores.filter((s) => s.score != null);
  const comfortable = filled.filter((s) => s.score >= 75).length;

  return (
    <Text style={summaryStyles.summary}>
      Son {scores.length} günün {comfortable} günü rahattı.
    </Text>
  );
}

const summaryStyles = StyleSheet.create({
  summary: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});

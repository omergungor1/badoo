import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getScoreColor, getScoreEmoji } from '../../utils/digestionScore';
import { getFourWeekGridRows } from '../../utils/date';
import { colors, radius, spacing, typography } from '../../theme';

const WEEKDAY_LABELS = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'];

function LinearScoreGrid({ scores, onDayPress, compact }) {
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

function WeeklyScoreGrid({ scores, onDayPress, compact }) {
  const scoreMap = Object.fromEntries(scores.map((item) => [item.date, item.score]));
  const rows = getFourWeekGridRows();
  const cellGap = compact ? 4 : 6;

  return (
    <View style={styles.weeklyWrap}>
      <View style={[styles.weekdayRow, { gap: cellGap }]}>
        {WEEKDAY_LABELS.map((label) => (
          <Text key={label} style={[styles.weekdayLabel, compact && styles.weekdayLabelCompact]}>
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.weekRows}>
        {rows.map((week) => (
          <View key={week[0].date} style={[styles.weekRow, { gap: cellGap }]}>
            {week.map((cell) => {
              const score = scoreMap[cell.date];
              const hasScore = cell.inRange && score != null;
              const isPlaceholder = !cell.inRange;

              return (
                <Pressable
                  key={cell.date}
                  onPress={() => cell.inRange && onDayPress?.({ date: cell.date, score: score ?? null })}
                  disabled={!cell.inRange}
                  style={[
                    styles.weeklyCell,
                    compact && styles.weeklyCellCompact,
                    isPlaceholder && styles.weeklyCellPlaceholder,
                    cell.inRange && score == null && styles.weeklyCellEmpty,
                    hasScore && { backgroundColor: getScoreColor(score) },
                    cell.isToday && styles.weeklyCellToday,
                  ]}
                >
                  {isPlaceholder ? <View style={styles.placeholderDot} /> : null}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

export default function ScoreGrid({ scores = [], onDayPress, compact = false, layout = 'linear' }) {
  if (layout === 'weekly') {
    return <WeeklyScoreGrid scores={scores} onDayPress={onDayPress} compact={compact} />;
  }

  return <LinearScoreGrid scores={scores} onDayPress={onDayPress} compact={compact} />;
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
  weeklyWrap: {
    gap: spacing.xs,
  },
  weekdayRow: {
    flexDirection: 'row',
  },
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
    ...typography.caption,
    color: colors.textSecondary,
    fontFamily: typography.bodySemiBold?.fontFamily || typography.body.fontFamily,
  },
  weekdayLabelCompact: {
    fontSize: 10,
  },
  weekRows: {
    gap: 4,
  },
  weekRow: {
    flexDirection: 'row',
  },
  weeklyCell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radius.sm,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weeklyCellCompact: {
    borderRadius: radius.sm / 2,
  },
  weeklyCellPlaceholder: {
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E3E3E8',
    borderStyle: 'dashed',
  },
  weeklyCellEmpty: {
    backgroundColor: colors.border,
  },
  placeholderDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.textMuted,
    opacity: 0.45,
  },
  weeklyCellToday: {
    borderWidth: 2,
    borderColor: colors.textPrimary,
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

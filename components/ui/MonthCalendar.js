import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getScoreColor } from '../../utils/digestionScore';
import {
  formatMonthYear,
  getMonthDays,
  getMonthStartOffset,
  isToday,
  parseISODate,
  toISODate,
} from '../../utils/date';
import { colors, radius, spacing, typography } from '../../theme';

const WEEKDAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

export default function MonthCalendar({
  year,
  month,
  selectedDate,
  dayScores = {},
  dayMarkers = {},
  onSelectDate,
  onMonthChange,
}) {
  const today = toISODate();
  const days = getMonthDays(year, month);
  const offset = getMonthStartOffset(year, month);
  const cells = [...Array(offset).fill(null), ...days];

  function canSelect(date) {
    return date <= today;
  }

  function handlePrevMonth() {
    onMonthChange?.(month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 });
  }

  function handleNextMonth() {
    const next = month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 };
    const nextMonthStart = toISODate(new Date(next.year, next.month, 1));
    if (nextMonthStart > today) return;
    onMonthChange?.(next);
  }

  const isCurrentMonth = year === new Date().getFullYear() && month === new Date().getMonth();
  const nextDisabled = isCurrentMonth;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Pressable onPress={handlePrevMonth} style={styles.navButton} hitSlop={8}>
          <Text style={styles.navText}>‹</Text>
        </Pressable>
        <Text style={styles.monthLabel}>{formatMonthYear(year, month)}</Text>
        <Pressable
          onPress={handleNextMonth}
          disabled={nextDisabled}
          style={[styles.navButton, nextDisabled && styles.navButtonDisabled]}
          hitSlop={8}
        >
          <Text style={[styles.navText, nextDisabled && styles.navTextDisabled]}>›</Text>
        </Pressable>
      </View>

      <View style={styles.weekdays}>
        {WEEKDAYS.map((label) => (
          <Text key={label} style={styles.weekday}>
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((date, index) => {
          if (!date) {
            return <View key={`empty-${index}`} style={styles.cell} />;
          }

          const dayNumber = parseISODate(date).getDate();
          const selected = date === selectedDate;
          const todayMark = isToday(date);
          const disabled = !canSelect(date);
          const score = dayScores[date]?.score;
          const hasData = dayScores[date]?.hasData;
          const indicatorColor = hasData && score != null ? getScoreColor(score) : null;
          const periodMarker = dayMarkers[date];
          const inPeriod = periodMarker?.inPeriod;

          return (
            <Pressable
              key={date}
              disabled={disabled}
              onPress={() => onSelectDate?.(date)}
              style={[
                styles.cell,
                inPeriod && styles.cellPeriod,
                selected && styles.cellSelected,
                todayMark && !selected && styles.cellToday,
                disabled && styles.cellDisabled,
              ]}
            >
              <Text
                style={[
                  styles.dayNumber,
                  selected && styles.dayNumberSelected,
                  disabled && styles.dayNumberDisabled,
                  inPeriod && !selected && styles.dayNumberPeriod,
                ]}
              >
                {dayNumber}
              </Text>
              <View style={styles.indicators}>
                {indicatorColor ? (
                  <View style={[styles.indicator, { backgroundColor: indicatorColor }]} />
                ) : (
                  <View style={styles.indicatorPlaceholder} />
                )}
                {inPeriod ? (
                  <View
                    style={[
                      styles.indicator,
                      styles.periodIndicator,
                      periodMarker.isStart && styles.periodStart,
                      periodMarker.isEnd && styles.periodEnd,
                    ]}
                  />
                ) : (
                  <View style={styles.indicatorPlaceholder} />
                )}
              </View>
              {periodMarker?.isStart && periodMarker?.isEnd ? (
                <Text style={styles.periodTag}>Baş/Bit</Text>
              ) : periodMarker?.isStart ? (
                <Text style={styles.periodTag}>Baş</Text>
              ) : periodMarker?.isEnd ? (
                <Text style={styles.periodTag}>Bit</Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    opacity: 0.35,
  },
  navText: {
    ...typography.h3,
    color: colors.primary,
  },
  navTextDisabled: {
    color: colors.textSecondary,
  },
  monthLabel: {
    ...typography.body,
    color: colors.textPrimary,
    fontFamily: typography.bodySemiBold.fontFamily,
    textTransform: 'capitalize',
  },
  weekdays: {
    flexDirection: 'row',
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    ...typography.caption,
    color: colors.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    gap: 1,
    paddingVertical: 2,
  },
  cellPeriod: {
    backgroundColor: colors.periodLight,
  },
  cellSelected: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  cellToday: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  cellDisabled: {
    opacity: 0.35,
  },
  dayNumber: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  dayNumberSelected: {
    color: colors.primary,
    fontFamily: typography.bodySemiBold.fontFamily,
  },
  dayNumberDisabled: {
    color: colors.textSecondary,
  },
  dayNumberPeriod: {
    color: colors.period,
    fontFamily: typography.bodySemiBold.fontFamily,
  },
  indicators: {
    flexDirection: 'row',
    gap: 3,
    alignItems: 'center',
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  periodIndicator: {
    backgroundColor: colors.period,
  },
  periodStart: {
    borderWidth: 1,
    borderColor: colors.white,
  },
  periodEnd: {
    opacity: 0.65,
  },
  periodTag: {
    ...typography.caption,
    fontSize: 8,
    lineHeight: 10,
    color: colors.period,
    fontFamily: typography.bodySemiBold.fontFamily,
  },
  indicatorPlaceholder: {
    width: 6,
    height: 6,
  },
});

import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { getScoreColor } from '../../utils/digestionScore';
import {
  getCurrentWeekDays,
  getWeekdayShort,
  isToday,
  parseISODate,
  toISODate,
} from '../../utils/date';
import { colors, radius, spacing, typography } from '../../theme';

export default function HomeWeekCalendar({
  selectedDate,
  dayScores = {},
  onSelectDate,
}) {
  const today = toISODate();
  const weekDays = getCurrentWeekDays();

  return (
    <View style={styles.wrap}>
      <View style={styles.brandRow}>
        <View style={styles.logoWrap}>
          <Image
            source={require('../../assets/icon2.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.brand}>Badoo</Text>
      </View>

      <View style={styles.weekRow}>
        {weekDays.map((date) => {
          const dayNumber = parseISODate(date).getDate();
          const selected = date === selectedDate;
          const todayMark = isToday(date);
          const isFuture = date > today;
          const hasData = dayScores[date]?.hasData;
          const score = dayScores[date]?.score;
          const indicatorColor = hasData && score != null ? getScoreColor(score) : colors.calories;

          return (
            <Pressable
              key={date}
              disabled={isFuture}
              onPress={() => onSelectDate?.(date)}
              style={[
                styles.daySlot,
                selected && styles.daySlotSelected,
                todayMark && !selected && styles.daySlotToday,
              ]}
            >
              <Text
                style={[
                  styles.weekday,
                  selected && styles.weekdaySelected,
                  isFuture && styles.weekdayFuture,
                ]}
              >
                {getWeekdayShort(date)}
              </Text>

              <View
                style={[
                  styles.dayCircle,
                  hasData && styles.dayCircleFilled,
                  hasData && { backgroundColor: indicatorColor, borderColor: indicatorColor },
                  !hasData && !isFuture && styles.dayCircleDashed,
                  isFuture && styles.dayCircleFuture,
                ]}
              >
                <Text
                  style={[
                    styles.dayNumber,
                    hasData && styles.dayNumberFilled,
                    isFuture && styles.dayNumberFuture,
                  ]}
                >
                  {dayNumber}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 32,
  },
  logoWrap: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 28,
    height: 28,
  },
  brand: {
    ...typography.h2,
    color: colors.textPrimary,
    fontSize: 22,
    lineHeight: 32,
    includeFontPadding: false,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  daySlot: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.xs,
    paddingHorizontal: 2,
    borderRadius: radius.lg,
  },
  daySlotSelected: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  daySlotToday: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  weekday: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  weekdaySelected: {
    color: colors.textPrimary,
    fontFamily: typography.bodySemiBold.fontFamily,
  },
  weekdayFuture: {
    color: '#C8C8C8',
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  dayCircleDashed: {
    borderStyle: 'dashed',
    borderColor: '#CFCFCF',
  },
  dayCircleFilled: {
    borderStyle: 'solid',
  },
  dayCircleFuture: {
    backgroundColor: '#F3F3F3',
    borderColor: '#F3F3F3',
  },
  dayNumber: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontFamily: typography.bodySemiBold.fontFamily,
  },
  dayNumberFilled: {
    color: colors.white,
  },
  dayNumberFuture: {
    color: '#C8C8C8',
  },
});

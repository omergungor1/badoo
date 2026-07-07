import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { getScoreColor } from '../../utils/digestionScore';
import {
  getWeekPages,
  getWeekdayShort,
  isToday,
  parseISODate,
  toISODate,
} from '../../utils/date';
import { colors, radius, spacing, typography } from '../../theme';

const WEEKS_BACK = 52;

function WeekDayCell({ date, selectedDate, dayScores, onSelectDate }) {
  const today = toISODate();
  const dayNumber = parseISODate(date).getDate();
  const selected = date === selectedDate;
  const todayMark = isToday(date);
  const isFuture = date > today;
  const hasData = dayScores[date]?.hasData;
  const score = dayScores[date]?.score;
  const indicatorColor = hasData && score != null ? getScoreColor(score) : colors.calories;

  return (
    <Pressable
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
}

export default function HomeWeekCalendar({
  selectedDate,
  dayScores = {},
  onSelectDate,
  onWeekChange,
}) {
  const listRef = useRef(null);
  const weeks = useMemo(() => getWeekPages(WEEKS_BACK), []);
  const currentWeekIndex = weeks.length - 1;
  const [pageWidth, setPageWidth] = useState(0);
  const [listReady, setListReady] = useState(false);
  const lastWeekIndexRef = useRef(currentWeekIndex);

  const notifyWeekChange = useCallback((index) => {
    if (index === lastWeekIndexRef.current) return;

    lastWeekIndexRef.current = index;
    const weekDays = weeks[index];
    if (weekDays) {
      onWeekChange?.(weekDays);
    }
  }, [weeks, onWeekChange]);

  useEffect(() => {
    if (!listReady || pageWidth <= 0) return;

    listRef.current?.scrollToIndex({
      index: currentWeekIndex,
      animated: false,
    });
  }, [listReady, pageWidth, currentWeekIndex]);

  const getItemLayout = useCallback(
    (_, index) => ({
      length: pageWidth,
      offset: pageWidth * index,
      index,
    }),
    [pageWidth],
  );

  function handleLayout(event) {
    const width = event.nativeEvent.layout.width;
    if (width > 0 && width !== pageWidth) {
      setPageWidth(width);
      setListReady(true);
    }
  }

  function handleScrollToIndexFailed(info) {
    listRef.current?.scrollToOffset({
      offset: info.index * pageWidth,
      animated: false,
    });
  }

  function handleMomentumScrollEnd(event) {
    if (pageWidth <= 0) return;

    const index = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
    const clampedIndex = Math.max(0, Math.min(index, weeks.length - 1));
    notifyWeekChange(clampedIndex);
  }

  function renderWeek({ item: weekDays }) {
    return (
      <View style={[styles.weekPage, { width: pageWidth }]}>
        <View style={styles.weekRow}>
          {weekDays.map((date) => (
            <WeekDayCell
              key={date}
              date={date}
              selectedDate={selectedDate}
              dayScores={dayScores}
              onSelectDate={onSelectDate}
            />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap} onLayout={handleLayout}>
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

      {listReady ? (
        <FlatList
          ref={listRef}
          data={weeks}
          horizontal
          pagingEnabled
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={pageWidth}
          snapToAlignment="start"
          disableIntervalMomentum
          bounces={false}
          keyExtractor={(item) => item[0]}
          renderItem={renderWeek}
          getItemLayout={getItemLayout}
          initialScrollIndex={currentWeekIndex}
          onScrollToIndexFailed={handleScrollToIndexFailed}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          style={styles.weekList}
        />
      ) : (
        <View style={styles.weekPlaceholder}>
          <View style={styles.weekRow}>
            {weeks[currentWeekIndex].map((date) => (
              <WeekDayCell
                key={date}
                date={date}
                selectedDate={selectedDate}
                dayScores={dayScores}
                onSelectDate={onSelectDate}
              />
            ))}
          </View>
        </View>
      )}
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
  weekList: {
    flexGrow: 0,
  },
  weekPlaceholder: {
    width: '100%',
  },
  weekPage: {
    flexShrink: 0,
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

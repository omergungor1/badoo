import { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from './Card';
import ProgressRing from './ProgressRing';
import { colors, radius, spacing, typography } from '../../theme';

const BASE_SIZE = 220;
const STROKE = 10;
const RING_STEP = 17;
const CARDS_PER_PAGE = 2;
const CARD_GAP = spacing.sm;
const METRIC_RING_SIZE = 58;
const METRIC_RING_STROKE = 5;

const METRIC_ICONS = {
  calories: 'flame-outline',
  protein: 'barbell-outline',
  water: 'water-outline',
  activity: 'footsteps-outline',
};

function splitMetricValue(valueText = '') {
  const slashIndex = valueText.indexOf('/');
  if (slashIndex === -1) {
    return { current: valueText, goal: '' };
  }

  return {
    current: valueText.slice(0, slashIndex).trim(),
    goal: valueText.slice(slashIndex + 1).trim(),
  };
}

function MetricCard({ ring, width, flex }) {
  const { current, goal } = splitMetricValue(ring.valueText);
  const iconName = METRIC_ICONS[ring.key] || 'ellipse-outline';

  return (
    <View style={[
      styles.metricCard,
      width ? { width } : null,
      flex ? styles.metricCardFlex : null,
    ]}>
      <View style={styles.metricTop}>
        <View style={styles.metricValues}>
          <Text style={styles.metricCurrent} numberOfLines={1}>
            {current}
          </Text>
          {goal ? (
            <>
              <Text style={styles.metricSlash}>/</Text>
              <Text style={styles.metricGoal} numberOfLines={1}>
                {goal}
              </Text>
            </>
          ) : null}
        </View>
        <Text style={styles.metricLabel}>{ring.label}</Text>
      </View>

      <ProgressRing
        size={METRIC_RING_SIZE}
        strokeWidth={METRIC_RING_STROKE}
        progress={ring.progress}
        color={ring.color}
        trackColor={ring.trackColor}
      >
        <Ionicons name={iconName} size={20} color={ring.color} />
      </ProgressRing>
    </View>
  );
}

export default function DailyActivityRings({ rings = [] }) {
  const listRef = useRef(null);
  const [pageWidth, setPageWidth] = useState(0);
  const [activePage, setActivePage] = useState(0);

  const overallProgress = rings.length
    ? Math.round(rings.reduce((sum, ring) => sum + ring.progress, 0) / rings.length)
    : 0;

  const pages = useMemo(() => {
    const chunks = [];
    for (let index = 0; index < rings.length; index += CARDS_PER_PAGE) {
      chunks.push(rings.slice(index, index + CARDS_PER_PAGE));
    }
    return chunks;
  }, [rings]);

  const cardWidth = pageWidth > 0
    ? (pageWidth - CARD_GAP * (CARDS_PER_PAGE - 1)) / CARDS_PER_PAGE
    : 0;

  const getItemLayout = useCallback(
    (_, index) => ({
      length: pageWidth,
      offset: pageWidth * index,
      index,
    }),
    [pageWidth],
  );

  function handleCarouselLayout(event) {
    const width = event.nativeEvent.layout.width;
    if (width > 0 && width !== pageWidth) {
      setPageWidth(width);
    }
  }

  function handleMomentumScrollEnd(event) {
    if (pageWidth <= 0) return;

    const index = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
    setActivePage(Math.max(0, Math.min(index, pages.length - 1)));
  }

  function renderPage({ item: pageRings }) {
    return (
      <View style={[styles.page, { width: pageWidth }]}>
        {pageRings.map((ring) => (
          <MetricCard key={ring.key} ring={ring} width={cardWidth} />
        ))}
      </View>
    );
  }

  return (
    <Card style={styles.card}>
      <View style={styles.ringsSection}>
        <View style={styles.ringsRow}>
          <View style={styles.clusterSlot}>
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
            </View>
            </View>
          </View>

          <View style={styles.legendColumn}>
            {rings.map((ring) => (
              <View key={ring.key} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: ring.color }]} />
                <Text style={styles.legendLabel}>{ring.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {pages.length ? (
        <View style={styles.carouselSection}>
          <View style={styles.carouselWrap} onLayout={handleCarouselLayout}>
            {pageWidth > 0 ? (
              <FlatList
                ref={listRef}
                data={pages}
                horizontal
                pagingEnabled
                nestedScrollEnabled
                showsHorizontalScrollIndicator={false}
                decelerationRate="fast"
                snapToInterval={pageWidth}
                snapToAlignment="start"
                disableIntervalMomentum
                bounces={false}
                keyExtractor={(_, index) => `metric-page-${index}`}
                renderItem={renderPage}
                getItemLayout={getItemLayout}
                onMomentumScrollEnd={handleMomentumScrollEnd}
              />
            ) : (
              <View style={styles.pagePlaceholder}>
                {pages[0]?.map((ring) => (
                  <MetricCard key={ring.key} ring={ring} flex />
                ))}
              </View>
            )}
          </View>

          {pages.length > 1 ? (
            <View style={styles.pagination}>
              {pages.map((_, index) => (
                <View
                  key={`dot-${index}`}
                  style={[
                    styles.dot,
                    index === activePage && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  ringsSection: {
    width: '100%',
    alignItems: 'center',
  },
  ringsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  clusterSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    zIndex: 1,
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 10,
  },
  percent: {
    ...typography.h2,
    color: colors.textPrimary,
    fontSize: 28,
    lineHeight: 34,
    includeFontPadding: false,
    textAlign: 'center',
  },
  legendColumn: {
    gap: spacing.sm,
    justifyContent: 'center',
    paddingRight: spacing.xs,
    minWidth: 72,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    ...typography.caption,
    color: colors.textPrimary,
    fontFamily: typography.bodySemiBold.fontFamily,
  },
  carouselSection: {
    gap: spacing.sm,
  },
  carouselWrap: {
    width: '100%',
  },
  page: {
    flexDirection: 'row',
    gap: CARD_GAP,
  },
  pagePlaceholder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: CARD_GAP,
  },
  metricCard: {
    aspectRatio: 1.0,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metricCardFlex: {
    flex: 1,
  },
  metricTop: {
    width: '100%',
    alignItems: 'center',
    gap: 4,
  },
  metricValues: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 2,
  },
  metricCurrent: {
    ...typography.h2,
    color: colors.textPrimary,
    fontSize: 24,
    lineHeight: 28,
  },
  metricSlash: {
    ...typography.body,
    color: colors.textMuted,
    fontSize: 18,
  },
  metricGoal: {
    ...typography.bodySemiBold,
    color: colors.textSecondary,
    fontSize: 16,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textPrimary,
  },
});

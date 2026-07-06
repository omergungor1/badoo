import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';
import { formatTime } from '../../utils/date';
import { colors, spacing, typography } from '../../theme';

const GLASS_WIDTH = 36;
const GLASS_HEIGHT = 44;
const INLINE_GLASS_MAX = 12;

function WaterGlassIcon({ filled, showPlus, size = GLASS_WIDTH }) {
  const fill = filled ? '#9EC9E8' : '#F5F5F5';
  const stroke = filled ? '#9EC9E8' : '#D0D0D0';
  const height = Math.round(size * (GLASS_HEIGHT / GLASS_WIDTH));

  return (
    <View style={[styles.glassIcon, { width: size, height }]}>
      <Svg width={size} height={height} viewBox="0 0 36 44">
        <Path
          d="M8 3 H28 L24.5 38 C24 40.5 21.5 42 18 42 C14.5 42 12 40.5 11.5 38 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <Line x1={10} y1={10} x2={26} y2={10} stroke={stroke} strokeWidth={1} opacity={0.55} />
        <Line x1={10.5} y1={15} x2={25.5} y2={15} stroke={stroke} strokeWidth={1} opacity={0.4} />
        <Line x1={11} y1={20} x2={25} y2={20} stroke={stroke} strokeWidth={1} opacity={0.3} />
      </Svg>
      {showPlus ? <Text style={styles.plus}>+</Text> : null}
    </View>
  );
}

function GlassSlot({
  glassNumber,
  consumedGlasses,
  nextGlass,
  lastLogTime,
  saving,
  onSelectGlasses,
  slotWidth,
  glassSize,
}) {
  const filled = glassNumber <= consumedGlasses;
  const showPlus = !filled && glassNumber === nextGlass;
  const showTimestamp = filled && glassNumber === consumedGlasses && lastLogTime;

  return (
    <View style={[styles.slot, slotWidth ? { width: slotWidth } : styles.slotFlex]}>
      <Pressable
        onPress={() => onSelectGlasses(glassNumber)}
        disabled={saving}
        style={({ pressed }) => [styles.glassBtn, pressed && styles.glassBtnPressed]}
        accessibilityLabel={`${glassNumber}. bardak`}
        accessibilityRole="button"
      >
        <WaterGlassIcon filled={filled} showPlus={showPlus} size={glassSize} />
      </Pressable>
      <Text style={styles.timestamp} numberOfLines={1}>
        {showTimestamp ? formatTime(lastLogTime) : ' '}
      </Text>
    </View>
  );
}

export default function WaterTracking({
  waterTotal = 0,
  waterGoal = 2000,
  consumedGlasses = 0,
  goalGlasses = 8,
  lastLogTime,
  onSelectGlasses,
  saving = false,
}) {
  const { width: screenWidth } = useWindowDimensions();
  const [trackWidth, setTrackWidth] = useState(0);
  const nextGlass = consumedGlasses + 1;
  const useScroll = goalGlasses > INLINE_GLASS_MAX;

  const estimatedTrackWidth = trackWidth || Math.max(screenWidth - spacing.lg * 4, 280);
  const columns = useScroll ? INLINE_GLASS_MAX : goalGlasses;
  const slotWidth = estimatedTrackWidth / columns;
  const glassSize = Math.max(22, Math.min(GLASS_WIDTH, Math.floor(slotWidth - 2)));

  const glasses = Array.from({ length: goalGlasses }, (_, index) => index + 1);

  function renderGlasses() {
    return glasses.map((glassNumber) => (
      <GlassSlot
        key={glassNumber}
        glassNumber={glassNumber}
        consumedGlasses={consumedGlasses}
        nextGlass={nextGlass}
        lastLogTime={lastLogTime}
        saving={saving}
        onSelectGlasses={onSelectGlasses}
        slotWidth={useScroll ? slotWidth : undefined}
        glassSize={glassSize}
      />
    ));
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>Su Takibi</Text>
        <Text style={styles.progress}>
          <Text style={styles.progressCurrent}>{waterTotal}</Text>
          <Text style={styles.progressGoal}>/{waterGoal} ml</Text>
        </Text>
      </View>

      <View
        style={styles.track}
        onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
      >
        {useScroll ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollRow}
          >
            {renderGlasses()}
          </ScrollView>
        ) : (
          <View style={styles.evenRow}>
            {renderGlasses()}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...typography.body,
    color: colors.textSecondary,
  },
  progress: {
    ...typography.body,
  },
  progressCurrent: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
  },
  progressGoal: {
    color: colors.textSecondary,
  },
  track: {
    width: '100%',
  },
  evenRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
  },
  scrollRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  slot: {
    alignItems: 'center',
  },
  slotFlex: {
    flex: 1,
  },
  glassBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassBtnPressed: {
    opacity: 0.7,
  },
  glassIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: {
    position: 'absolute',
    fontSize: 16,
    lineHeight: 18,
    color: colors.activity,
    fontFamily: typography.bodySemiBold.fontFamily,
  },
  timestamp: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    lineHeight: 12,
    marginTop: 2,
    minHeight: 12,
    width: '100%',
    textAlign: 'center',
  },
});
